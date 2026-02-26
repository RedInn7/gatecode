package sandbox

import "strings"

// RunResult is the HTTP-friendly result returned by judge_service.
type RunResult struct {
	Status    string `json:"status"`
	Stdout    string `json:"stdout"`
	Stderr    string `json:"stderr"`
	RuntimeMs int64  `json:"runtime_ms"`
}

// Run is a convenience wrapper around DockerSandbox.Execute.
// It maps ExecuteResult → RunResult with a human-readable Status string.
// Called by judge_service.go; keeps the service layer unaware of the
// Sandbox interface internals.
func Run(lang, code, stdinData string) (*RunResult, error) {
	sb := NewDockerSandbox()
	res, err := sb.Execute(ExecuteRequest{
		Language: lang,
		Code:     code,
		Input:    stdinData,
	})
	if err != nil {
		return nil, err
	}

	status := classifyStatus(lang, res)
	return &RunResult{
		Status:    status,
		Stdout:    res.Stdout,
		Stderr:    res.Stderr,
		RuntimeMs: res.RuntimeMs,
	}, nil
}

func classifyStatus(lang string, res *ExecuteResult) string {
	if res.TimedOut {
		return StatusTLE
	}
	if res.OOMKilled {
		return StatusMLE
	}
	if res.ExitCode != 0 {
		cfg, ok := LangConfigs[lang]
		if ok && cfg.CompileCmd != "" && looksLikeCompileError(res.Stderr) {
			return StatusCompileError
		}
		return StatusRuntimeError
	}
	return StatusAccepted
}

func looksLikeCompileError(stderr string) bool {
	lower := strings.ToLower(stderr)
	keywords := []string{
		"error:", "syntax error", "compilation failed",
		"cannot find symbol", "undeclared identifier",
	}
	for _, kw := range keywords {
		if strings.Contains(lower, kw) {
			return true
		}
	}
	return false
}
