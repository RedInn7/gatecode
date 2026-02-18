package sandbox

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// ---------------------------------------------------------------------------
// Public interface — swap Docker → gVisor / Firecracker without touching callers
// ---------------------------------------------------------------------------

// Sandbox is the core abstraction for isolated code execution.
// Concrete implementations: DockerSandbox (default), MockSandbox (tests).
type Sandbox interface {
	Execute(req ExecuteRequest) (*ExecuteResult, error)
}

// ExecuteRequest carries every parameter needed to run a submission.
type ExecuteRequest struct {
	Code        string
	Language    string
	Input       string // raw stdin passed to the solution
	TimeLimit   int    // ms; 0 → DefaultTimeLimit
	MemoryLimit int    // MB; 0 → DefaultMemoryLimit
}

// ExecuteResult is returned by every Sandbox implementation.
type ExecuteResult struct {
	Stdout    string
	Stderr    string
	ExitCode  int
	TimedOut  bool
	RuntimeMs int64
}

const (
	DefaultTimeLimit   = 10_000 // 10 s
	DefaultMemoryLimit = 256    // 256 MB
	// JudgeImage is the multi-language image built from docker/Dockerfile.
	// Per-language images (Node, Ruby …) are still used for languages not covered.
	JudgeImage = "gatecode-judge:latest"
)

// ---------------------------------------------------------------------------
// dockerRun — shared low-level Docker runner used by Execute and Judge
// ---------------------------------------------------------------------------

// dockerRun starts a container, runs shellCmd inside it, and waits for completion.
// tmpDir is bind-mounted at /w; writable=true allows compile output to be written back
// to the host (ro for test-case runs, rw for compile-only phase).
func dockerRun(image, shellCmd, tmpDir string, writable bool, timeoutMs, memMB int) (*ExecuteResult, error) {
	deadline := time.Duration(timeoutMs)*time.Millisecond + 5*time.Second

	mount := fmt.Sprintf("%s:/w:ro", tmpDir)
	if writable {
		mount = fmt.Sprintf("%s:/w:rw", tmpDir)
	}

	args := []string{
		"run", "--rm",
		"--network", "none",
		fmt.Sprintf("--memory=%dm", memMB),
		fmt.Sprintf("--memory-swap=%dm", memMB),
		"--cpus=0.5",
		"--pids-limit=50",
		"--ulimit", "nofile=64:64",
		"--ulimit", fmt.Sprintf("fsize=%d:%d", 64<<20, 64<<20),
		"--tmpfs", "/tmp:rw,exec,nodev,nosuid,size=64m",
		"-v", mount,
		image,
		"sh", "-c", shellCmd,
	}

	ctx, cancel := context.WithTimeout(context.Background(), deadline)
	defer cancel()

	cmd := exec.CommandContext(ctx, "docker", args...)
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
	return &ExecuteResult{
		Stdout: stdout, Stderr: stderr,
		ExitCode: exitCode, TimedOut: false, RuntimeMs: elapsed,
	}, nil
}

// ---------------------------------------------------------------------------
// DockerSandbox — production implementation (single-container /run path)
// ---------------------------------------------------------------------------

// DockerSandbox runs user code in a Docker container with tight resource limits.
//
// Security layers applied to every container:
//   - --network none          : zero network access
//   - --memory / --memory-swap: hard memory cap, swap disabled
//   - --cpus                  : CPU quota (0.5 core)
//   - --pids-limit            : prevents fork-bomb
//   - --ulimit nofile          : restricts open file descriptors
//   - --ulimit fsize           : restricts output file size (64 MB)
//   - --tmpfs /tmp            : writable in-memory FS for compiled artefacts
//   - -v …:/w:ro              : source + input mounted read-only
//   - USER judge (uid 1000)   : non-root user defined in docker/Dockerfile
type DockerSandbox struct{}

// NewDockerSandbox returns a Sandbox backed by Docker.
func NewDockerSandbox() Sandbox {
	return &DockerSandbox{}
}

func (s *DockerSandbox) Execute(req ExecuteRequest) (*ExecuteResult, error) {
	lang := req.Language
	if display, ok := LangKeyToDisplay[lang]; ok {
		lang = display
	}
	cfg, ok := LangConfigs[lang]
	if !ok {
		return nil, fmt.Errorf("unsupported language: %s", lang)
	}

	timeLimit := req.TimeLimit
	if timeLimit <= 0 {
		timeLimit = DefaultTimeLimit
	}
	memMB := req.MemoryLimit
	if memMB <= 0 {
		memMB = DefaultMemoryLimit
	}

	// ── 1. Temporary workspace ──────────────────────────────────────────────
	tmpDir, err := os.MkdirTemp("/tmp", "judge_*")
	if err != nil {
		return nil, fmt.Errorf("mktemp: %w", err)
	}
	defer os.RemoveAll(tmpDir)
	if real, err := filepath.EvalSymlinks(tmpDir); err == nil {
		tmpDir = real
	}
	if err := os.Chmod(tmpDir, 0755); err != nil {
		return nil, fmt.Errorf("chmod tmpdir: %w", err)
	}

	// ── 2. Write source code + stdin ────────────────────────────────────────
	code := WrapCode(lang, req.Code)
	if err := os.WriteFile(filepath.Join(tmpDir, cfg.FileName), []byte(code), 0644); err != nil {
		return nil, fmt.Errorf("write source: %w", err)
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "input.txt"), []byte(req.Input), 0644); err != nil {
		return nil, fmt.Errorf("write input: %w", err)
	}

	// ── 3. Build shell command (compile+run in one container via sandboxPaths) ──
	// sandboxPaths rewrites /w/prog → /tmp/prog so compiled artefacts go to
	// the container's tmpfs (not the host volume), keeping /w strictly read-only.
	compileCmd, runCmd := sandboxPaths(cfg)
	var shellCmd string
	if compileCmd == "" {
		shellCmd = runCmd + " < /w/input.txt"
	} else {
		shellCmd = compileCmd + " && " + runCmd + " < /w/input.txt"
	}

	// For compiled languages, use the larger of run-limit and compile-limit,
	// since compile+run happen in a single container for the /run endpoint.
	execMem := memMB
	if cfg.CompileMemMB > execMem {
		execMem = cfg.CompileMemMB
	}
	return dockerRun(cfg.Image, shellCmd, tmpDir, false, timeLimit, execMem)
}

// sandboxPaths rewrites LangConfig commands so that:
//   - source files are read from /w/          (read-only bind mount)
//   - compiled artefacts are written to /tmp/ (writable tmpfs inside container)
func sandboxPaths(cfg LangConfig) (compile, run string) {
	r := strings.NewReplacer(
		"/w/prog.jar", "/tmp/prog.jar", // Kotlin jar
		"/w/prog", "/tmp/prog", // C / C++ / Rust binary
		"-d /w", "-d /tmp", // Java / Scala class output dir
		":/w ", ":/tmp ", // Java classpath suffix (e.g. gson.jar:/w Solution)
		"-cp /w", "-cp /tmp", // Scala classpath
		"-o /w", "-o /tmp", // Erlang beam output
		"-pa /w", "-pa /tmp", // Erlang beam path
	)
	return r.Replace(cfg.CompileCmd), r.Replace(cfg.RunCmd)
}
