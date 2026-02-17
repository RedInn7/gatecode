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

// RunResult holds the outcome of a sandbox execution.
type RunResult struct {
	Status    string `json:"status"`
	Stdout    string `json:"stdout"`
	Stderr    string `json:"stderr"`
	RuntimeMs int64  `json:"runtime_ms"`
}

const defaultTimeout = 10 * time.Second

// Run executes code in a Docker sandbox and returns the result.
// stdinData is piped into the solution via /w/input.txt.
func Run(lang, code, stdinData string) (*RunResult, error) {
	cfg, ok := LangConfigs[lang]
	if !ok {
		return nil, fmt.Errorf("unsupported language: %s", lang)
	}

	// 1. Temp workspace
	tmpDir, err := os.MkdirTemp("/tmp", "judge_*")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	// 2. Write wrapped solution
	wrappedCode := WrapCode(lang, code)
	solutionPath := filepath.Join(tmpDir, cfg.FileName)
	if err := os.WriteFile(solutionPath, []byte(wrappedCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write solution: %w", err)
	}

	// 3. Write stdin data
	inputPath := filepath.Join(tmpDir, "input.txt")
	if err := os.WriteFile(inputPath, []byte(stdinData), 0644); err != nil {
		return nil, fmt.Errorf("failed to write input: %w", err)
	}

	// 4. Build the shell command executed inside the container
	shellCmd := buildShellCmd(cfg)

	dockerArgs := []string{
		"run", "--rm",
		"--network", "none",
		"-m", "256m",
		"--cpus", "0.5",
		"--pids-limit", "50",
		"-v", fmt.Sprintf("%s:/w", tmpDir),
		cfg.Image,
		"sh", "-c", shellCmd,
	}

	// 5. Execute with timeout
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "docker", dockerArgs...)
	var stdoutBuf, stderrBuf bytes.Buffer
	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	start := time.Now()
	runErr := cmd.Run()
	elapsed := time.Since(start).Milliseconds()

	stdoutStr := strings.TrimRight(stdoutBuf.String(), "\n")
	stderrStr := stderrBuf.String()

	// 6. Classify result
	if ctx.Err() == context.DeadlineExceeded {
		return &RunResult{
			Status:    "TLE",
			Stdout:    stdoutStr,
			Stderr:    "Time limit exceeded (10s)",
			RuntimeMs: elapsed,
		}, nil
	}

	if runErr != nil {
		status := "RuntimeError"
		if cfg.CompileCmd != "" && looksLikeCompileError(stderrStr) {
			status = "CompileError"
		}
		return &RunResult{
			Status:    status,
			Stdout:    stdoutStr,
			Stderr:    stderrStr,
			RuntimeMs: elapsed,
		}, nil
	}

	return &RunResult{
		Status:    "Accepted",
		Stdout:    stdoutStr,
		Stderr:    stderrStr,
		RuntimeMs: elapsed,
	}, nil
}

func buildShellCmd(cfg LangConfig) string {
	run := cfg.RunCmd + " < /w/input.txt"
	if cfg.CompileCmd == "" {
		return run
	}
	return cfg.CompileCmd + " && " + run
}

func looksLikeCompileError(stderr string) bool {
	lower := strings.ToLower(stderr)
	keywords := []string{"error:", "syntax error", "compilation failed", "cannot find symbol", "undeclared identifier"}
	for _, kw := range keywords {
		if strings.Contains(lower, kw) {
			return true
		}
	}
	return false
}
