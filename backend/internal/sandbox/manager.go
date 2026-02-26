package sandbox

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
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
	OOMKilled bool // true when the container was killed due to memory limit
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
// dockerRun — shared low-level Docker runner
// ---------------------------------------------------------------------------
// Delegates to the persistent container pool (ExecInPool) which uses
// `docker exec` on pre-started containers instead of `docker run --rm`.
// This eliminates ~1-2s container startup overhead per execution.

func dockerRun(image, shellCmd, tmpDir string, writable bool, timeoutMs, memMB int) (*ExecuteResult, error) {
	return ExecInPool(image, shellCmd, tmpDir, writable, timeoutMs, memMB)
}

// ---------------------------------------------------------------------------
// DockerSandbox — production implementation (single-container /run path)
// ---------------------------------------------------------------------------

// DockerSandbox runs user code in a Docker container with tight resource limits.
//
// Security layers applied to every container:
//   - --network none          : zero network access
//   - --memory / --memory-swap: hard memory cap, swap disabled
//   - --cpus                  : CPU quota
//   - --pids-limit            : prevents fork-bomb
//   - --ulimit nofile          : restricts open file descriptors
//   - --ulimit fsize           : restricts output file size (64 MB)
//   - --tmpfs /w               : writable in-memory FS for code + execution
//   - --tmpfs /tmp             : writable in-memory FS for compiled artefacts
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
//   - source files are read from /w/          (in-memory tmpfs)
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
