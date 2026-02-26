package sandbox

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"os/exec"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

// ContainerPool manages long-running Docker containers that are reused across
// executions. Instead of `docker run --rm` per task, we `docker exec` into
// persistent containers — eliminating container startup overhead (~1-2s per run).
//
// Architecture:
//   - One pool per Docker image (e.g. gatecode-judge:latest, node-ts:20)
//   - Each pool has N containers (configurable via PoolSize)
//   - Callers acquire a container, run commands via docker exec, then release
//   - Containers are created lazily on first use and restarted if they die

// PoolSize controls how many containers per image. Set higher for more parallelism.
var PoolSize = 8

// poolEntry is a single persistent container in the pool.
type poolEntry struct {
	name string // docker container name
	mu   sync.Mutex
}

// imagePool holds containers for a single Docker image.
type imagePool struct {
	image   string
	memMB   int
	entries []*poolEntry
	sem     chan int // semaphore: available entry indices
	mu      sync.Mutex
	started bool
}

var (
	pools   = make(map[string]*imagePool)
	poolsMu sync.Mutex
	poolSeq atomic.Int64
)

// getPool returns (or creates) the container pool for the given image.
func getPool(image string, memMB int) *imagePool {
	poolsMu.Lock()
	defer poolsMu.Unlock()
	if p, ok := pools[image]; ok {
		return p
	}
	p := &imagePool{
		image: image,
		memMB: memMB,
		sem:   make(chan int, PoolSize),
	}
	pools[image] = p
	return p
}

// ensureStarted lazily creates all containers in the pool.
func (p *imagePool) ensureStarted() {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.started {
		return
	}

	p.entries = make([]*poolEntry, PoolSize)
	for i := 0; i < PoolSize; i++ {
		name := fmt.Sprintf("gc_pool_%s_%d_%d", sanitizeImageName(p.image), poolSeq.Add(1), i)
		p.entries[i] = &poolEntry{name: name}
		if err := startContainer(name, p.image, p.memMB); err != nil {
			log.Printf("[pool] WARNING: failed to start container %s: %v", name, err)
		}
		p.sem <- i // mark slot as available
	}
	// Brief pause to let Docker fully start all containers
	time.Sleep(500 * time.Millisecond)
	p.started = true
	log.Printf("[pool] Started %d containers for image %s", PoolSize, p.image)
}

// acquire blocks until a container slot is available, returns its index.
func (p *imagePool) acquire() int {
	p.ensureStarted()
	return <-p.sem
}

// release returns a container slot to the pool.
func (p *imagePool) release(idx int) {
	p.sem <- idx
}

// startContainer creates and starts a persistent Docker container.
func startContainer(name, image string, memMB int) error {
	// Kill any leftover container with the same name
	exec.Command("docker", "rm", "-f", name).Run()

	args := []string{
		"run", "-d",
		"--name", name,
		"--network", "none",
		fmt.Sprintf("--memory=%dm", memMB),
		fmt.Sprintf("--memory-swap=%dm", memMB),
		"--cpus=1",
		"--pids-limit=256",
		"--ulimit", "nofile=256:256",
		"--ulimit", fmt.Sprintf("fsize=%d:%d", 64<<20, 64<<20),
		// tmpfs /tmp for compiled artefacts (in-memory, fast)
		// /w is a regular directory (created in Dockerfile) so docker cp works
		"--tmpfs", "/tmp:rw,exec,nodev,nosuid,size=64m",
		image,
		"sleep", "infinity",
	}

	cmd := exec.Command("docker", args...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("docker run: %w: %s", err, stderr.String())
	}

	// Wait for container to be running (up to 5s)
	for i := 0; i < 10; i++ {
		if isContainerRunning(name) {
			return nil
		}
		time.Sleep(500 * time.Millisecond)
	}
	// Check why it's not running
	logsOut, _ := exec.Command("docker", "logs", "--tail", "5", name).CombinedOutput()
	return fmt.Errorf("container %s started but not running after 5s, logs: %s", name, string(logsOut))
}

// restartContainer kills and re-creates a container.
func restartContainer(entry *poolEntry, image string, memMB int) error {
	exec.Command("docker", "rm", "-f", entry.name).Run()
	time.Sleep(100 * time.Millisecond)
	return startContainer(entry.name, image, memMB)
}

// sanitizeImageName converts an image name to a safe string for container naming.
func sanitizeImageName(image string) string {
	r := strings.NewReplacer(":", "_", "/", "_", ".", "_")
	return r.Replace(image)
}

// containerHandle is returned by AcquireContainer and must be released after use.
// It allows multiple docker exec calls in the same container (needed for judge:
// compile once, then run N test cases).
type containerHandle struct {
	pool  *imagePool
	idx   int
	entry *poolEntry
}

// Name returns the Docker container name.
func (h *containerHandle) Name() string {
	return h.entry.name
}

// Release returns the container to the pool.
func (h *containerHandle) Release() {
	h.entry.mu.Unlock()
	h.pool.release(h.idx)
}

// AcquireContainer gets a container from the pool for the given image.
// The caller MUST call handle.Release() when done.
// Optimized: skips docker inspect health check (saves ~25ms per acquire).
// Instead, CopyToContainer/ExecInContainer will detect dead containers.
func AcquireContainer(image string, memMB int) *containerHandle {
	pool := getPool(image, memMB)
	idx := pool.acquire()
	entry := pool.entries[idx]
	entry.mu.Lock()
	return &containerHandle{pool: pool, idx: idx, entry: entry}
}

// EnsureContainerHealthy checks and restarts the container if needed.
// Called lazily on first failure rather than on every acquire.
func EnsureContainerHealthy(h *containerHandle, image string, memMB int) {
	if !isContainerRunning(h.entry.name) {
		log.Printf("[pool] Container %s not running, restarting...", h.entry.name)
		if err := restartContainer(h.entry, image, memMB); err != nil {
			log.Printf("[pool] ERROR restarting container %s: %v", h.entry.name, err)
		}
	}
}

// CopyToContainer copies files from hostDir to /w inside the container.
// Includes chmod + cleanup in a separate docker exec call.
func CopyToContainer(cname, hostDir string) error {
	copyCmd := exec.Command("docker", "cp", hostDir+"/.", cname+":/w/")
	var copyErr bytes.Buffer
	copyCmd.Stderr = &copyErr
	if err := copyCmd.Run(); err != nil {
		return fmt.Errorf("docker cp: %w: %s", err, copyErr.String())
	}

	exec.Command("docker", "exec", "-u", "root", cname, "sh", "-c",
		"chmod -R 755 /w; rm -rf /tmp/_in_* /tmp/_out_* /tmp/_err_* 2>/dev/null; true").Run()
	return nil
}

// CopyToContainerFast copies files with ONLY docker cp — no extra exec.
// The runner script itself handles chmod. Saves ~130ms per judge call.
func CopyToContainerFast(cname, hostDir string) error {
	copyCmd := exec.Command("docker", "cp", hostDir+"/.", cname+":/w/")
	var copyErr bytes.Buffer
	copyCmd.Stderr = &copyErr
	if err := copyCmd.Run(); err != nil {
		return fmt.Errorf("docker cp: %w: %s", err, copyErr.String())
	}
	return nil
}

// CopyFileToContainer copies a single file from host to a path inside the container.
func CopyFileToContainer(cname, hostPath, containerPath string) error {
	copyCmd := exec.Command("docker", "cp", hostPath, cname+":"+containerPath)
	var copyErr bytes.Buffer
	copyCmd.Stderr = &copyErr
	if err := copyCmd.Run(); err != nil {
		return fmt.Errorf("docker cp: %w: %s", err, copyErr.String())
	}
	// Fix permissions on the copied file
	exec.Command("docker", "exec", "-u", "root", cname, "sh", "-c",
		fmt.Sprintf("chmod 644 %s", containerPath)).Run()
	return nil
}

// ExecInContainerWithStdin runs a shell command in the container, piping stdinData as stdin.
// This avoids docker cp for input data — much faster for per-test-case runs.
// The command is wrapped with `timeout` inside the container so it self-terminates
// cleanly on TLE without killing the container's init process.
func ExecInContainerWithStdin(cname, shellCmd string, asRoot bool, timeoutMs int, stdinData string) (*ExecuteResult, error) {
	// Wrap with timeout inside the container (kills the process tree, not PID 1)
	timeoutSec := (timeoutMs + 999) / 1000 // ceil to seconds
	wrappedCmd := fmt.Sprintf("timeout -s KILL %d sh -c %s", timeoutSec, shellQuote(shellCmd))

	// Context timeout is a safety net (timeout cmd + 5s grace)
	deadline := time.Duration(timeoutMs)*time.Millisecond + 5*time.Second

	execArgs := []string{"exec", "-i"} // -i for stdin
	if asRoot {
		execArgs = append(execArgs, "-u", "root")
	}
	execArgs = append(execArgs, cname, "sh", "-c", wrappedCmd)

	ctx, cancel := context.WithTimeout(context.Background(), deadline)
	defer cancel()

	cmd := exec.CommandContext(ctx, "docker", execArgs...)
	cmd.Stdin = strings.NewReader(stdinData)
	var stdoutBuf, stderrBuf bytes.Buffer
	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	start := time.Now()
	runErr := cmd.Run()
	elapsed := time.Since(start).Milliseconds()

	stdout := strings.TrimRight(stdoutBuf.String(), "\n")
	stderr := stderrBuf.String()

	// timeout -s KILL returns exit code 137 (128+9=SIGKILL)
	// Context deadline exceeded means even the timeout wrapper hung
	if ctx.Err() == context.DeadlineExceeded {
		return &ExecuteResult{
			Stdout: stdout, Stderr: "Time limit exceeded",
			ExitCode: 124, TimedOut: true, RuntimeMs: elapsed,
		}, nil
	}

	exitCode := 0
	if runErr != nil {
		if exitErr, ok := runErr.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			return nil, fmt.Errorf("docker exec: %w", runErr)
		}
	}

	// timeout -s KILL sends SIGKILL → exit code 137
	// Distinguish TLE (timeout killed) from OOM (Docker killed)
	if exitCode == 137 {
		if strings.Contains(stderr, "Killed") && elapsed < int64(timeoutMs)-500 {
			// Killed well before timeout → likely OOM
			return &ExecuteResult{
				Stdout: stdout, Stderr: stderr,
				ExitCode: exitCode, OOMKilled: true, RuntimeMs: elapsed,
			}, nil
		}
		// Killed near or after timeout → TLE
		return &ExecuteResult{
			Stdout: stdout, Stderr: "Time limit exceeded",
			ExitCode: 124, TimedOut: true, RuntimeMs: elapsed,
		}, nil
	}

	oomKilled := exitCode == 137 && strings.Contains(stderr, "Killed")

	return &ExecuteResult{
		Stdout: stdout, Stderr: stderr,
		ExitCode: exitCode, TimedOut: false, OOMKilled: oomKilled,
		RuntimeMs: elapsed,
	}, nil
}

// shellQuote wraps a string in single quotes for shell, escaping internal single quotes.
func shellQuote(s string) string {
	return "'" + strings.ReplaceAll(s, "'", "'\"'\"'") + "'"
}

// ExecInContainer runs a shell command in the given container (no stdin).
// asRoot=true runs as root (for compile steps), false runs as the default user.
// Uses `timeout` inside the container to avoid killing PID 1 on TLE.
func ExecInContainer(cname, shellCmd string, asRoot bool, timeoutMs int) (*ExecuteResult, error) {
	// Wrap with timeout inside container
	timeoutSec := (timeoutMs + 999) / 1000
	wrappedCmd := fmt.Sprintf("timeout -s KILL %d sh -c %s", timeoutSec, shellQuote(shellCmd))

	deadline := time.Duration(timeoutMs)*time.Millisecond + 5*time.Second

	execArgs := []string{"exec"}
	if asRoot {
		execArgs = append(execArgs, "-u", "root")
	}
	execArgs = append(execArgs, cname, "sh", "-c", wrappedCmd)

	ctx, cancel := context.WithTimeout(context.Background(), deadline)
	defer cancel()

	cmd := exec.CommandContext(ctx, "docker", execArgs...)
	var stdoutBuf, stderrBuf bytes.Buffer
	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	start := time.Now()
	runErr := cmd.Run()
	elapsed := time.Since(start).Milliseconds()

	stdout := strings.TrimRight(stdoutBuf.String(), "\n")
	stderr := stderrBuf.String()

	if ctx.Err() == context.DeadlineExceeded {
		return &ExecuteResult{
			Stdout: stdout, Stderr: "Time limit exceeded",
			ExitCode: 124, TimedOut: true, RuntimeMs: elapsed,
		}, nil
	}

	exitCode := 0
	if runErr != nil {
		if exitErr, ok := runErr.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			return nil, fmt.Errorf("docker exec: %w", runErr)
		}
	}

	// timeout -s KILL → exit 137. Distinguish TLE from OOM.
	if exitCode == 137 {
		if strings.Contains(stderr, "Killed") && elapsed < int64(timeoutMs)-500 {
			return &ExecuteResult{
				Stdout: stdout, Stderr: stderr,
				ExitCode: exitCode, OOMKilled: true, RuntimeMs: elapsed,
			}, nil
		}
		return &ExecuteResult{
			Stdout: stdout, Stderr: "Time limit exceeded",
			ExitCode: 124, TimedOut: true, RuntimeMs: elapsed,
		}, nil
	}

	oomKilled := exitCode == 137 && strings.Contains(stderr, "Killed")

	return &ExecuteResult{
		Stdout: stdout, Stderr: stderr,
		ExitCode: exitCode, TimedOut: false, OOMKilled: oomKilled,
		RuntimeMs: elapsed,
	}, nil
}

// ExecInPool acquires a container, copies files, runs a command, and releases.
// For simple one-shot executions (the /run endpoint).
func ExecInPool(image, shellCmd, hostDir string, asRoot bool, timeoutMs, memMB int) (*ExecuteResult, error) {
	h := AcquireContainer(image, memMB)
	defer h.Release()

	if err := CopyToContainer(h.Name(), hostDir); err != nil {
		return nil, err
	}

	return ExecInContainer(h.Name(), shellCmd, asRoot, timeoutMs)
}

// isContainerRunning checks if a container is in the "running" state.
func isContainerRunning(name string) bool {
	out, err := exec.Command("docker", "inspect", "-f", "{{.State.Running}}", name).Output()
	if err != nil {
		return false
	}
	return strings.TrimSpace(string(out)) == "true"
}

// StopAllPools gracefully stops and removes all pooled containers.
// Call this on server shutdown.
func StopAllPools() {
	poolsMu.Lock()
	defer poolsMu.Unlock()
	for _, p := range pools {
		p.mu.Lock()
		for _, e := range p.entries {
			if e != nil {
				exec.Command("docker", "rm", "-f", e.name).Run()
			}
		}
		p.started = false
		p.mu.Unlock()
	}
	pools = make(map[string]*imagePool)
	log.Println("[pool] All container pools stopped")
}
