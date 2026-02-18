package sandbox

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// JudgeTestCase is a single input/expected-output pair.
// Expected may be empty while test-data import is pending; the judge will
// still detect TLE / RE / CE but skip WA comparison for that case.
type JudgeTestCase struct {
	Input    string
	Expected string
}

// FailedCase contains the first test case that caused a non-Accepted verdict.
type FailedCase struct {
	Index    int    `json:"index"`              // 0-based; -1 for compile errors
	Input    string `json:"input,omitempty"`
	Expected string `json:"expected,omitempty"`
	Actual   string `json:"actual,omitempty"`   // stderr for RE/CE, stdout for WA
}

// JudgeResult is returned by Judge.
type JudgeResult struct {
	Status    string      `json:"status"`               // Accepted | WrongAnswer | RuntimeError | CompileError | TimeLimitExceeded
	Passed    int         `json:"passed"`
	Total     int         `json:"total"`
	RuntimeMs int64       `json:"runtime_ms"`           // slowest test case
	Failed    *FailedCase `json:"failed_case,omitempty"`
}

// Judge evaluates user code against all test cases.
//
// Strategy:
//   - Compiled languages (cfg.CompileCmd != ""): compile once with a writable
//     mount so the binary lands on the host tmpDir, then run each test case
//     read-only — no redundant recompilation.
//   - Interpreted languages: run each test case directly (no compile phase).
//
// Short-circuits on the first failure and never reveals subsequent test cases.
func Judge(lang, code string, testCases []JudgeTestCase, timeLimit, memMB int) (*JudgeResult, error) {
	if timeLimit <= 0 {
		timeLimit = DefaultTimeLimit
	}
	if memMB <= 0 {
		memMB = DefaultMemoryLimit
	}

	// Normalise display name
	if display, ok := LangKeyToDisplay[lang]; ok {
		lang = display
	}
	cfg, ok := LangConfigs[lang]
	if !ok {
		return nil, fmt.Errorf("unsupported language: %s", lang)
	}

	// ── Workspace ────────────────────────────────────────────────────────────
	tmpDir, err := os.MkdirTemp("/tmp", "judge_*")
	if err != nil {
		return nil, fmt.Errorf("mktemp: %w", err)
	}
	defer os.RemoveAll(tmpDir)
	if real, err := filepath.EvalSymlinks(tmpDir); err == nil {
		tmpDir = real
	}
	if err := os.Chmod(tmpDir, 0755); err != nil {
		return nil, fmt.Errorf("chmod: %w", err)
	}

	// Write wrapped source code once
	wrapped := WrapCode(lang, code)
	if err := os.WriteFile(filepath.Join(tmpDir, cfg.FileName), []byte(wrapped), 0644); err != nil {
		return nil, fmt.Errorf("write source: %w", err)
	}

	result := &JudgeResult{Total: len(testCases)}

	// ── Compile phase (compiled languages only) ───────────────────────────────
	// Mount as rw so the binary is written to tmpDir on the host.
	// CompileCmd uses /w/prog as the output path (e.g. g++ -o /w/prog …),
	// which resolves to tmpDir/prog after the bind mount.
	if cfg.CompileCmd != "" {
		compileMem := memMB
		if cfg.CompileMemMB > 0 {
			compileMem = cfg.CompileMemMB
		}
		res, err := dockerRun(cfg.Image, cfg.CompileCmd, tmpDir, true, 30_000, compileMem)
		if err != nil {
			return nil, fmt.Errorf("compile container: %w", err)
		}
		if res.ExitCode != 0 {
			return &JudgeResult{
				Status: "CompileError",
				Total:  result.Total,
				Failed: &FailedCase{Index: -1, Actual: res.Stderr},
			}, nil
		}
	}

	// ── Per-test-case run ─────────────────────────────────────────────────────
	var maxRT int64
	for i, tc := range testCases {
		// Overwrite input.txt for this test case
		if err := os.WriteFile(filepath.Join(tmpDir, "input.txt"), []byte(tc.Input), 0644); err != nil {
			return nil, fmt.Errorf("write input[%d]: %w", i, err)
		}

		// Run with read-only mount: binary/source at /w, input at /w/input.txt
		shellCmd := cfg.RunCmd + " < /w/input.txt"
		res, err := dockerRun(cfg.Image, shellCmd, tmpDir, false, timeLimit, memMB)
		if err != nil {
			return nil, fmt.Errorf("run container[%d]: %w", i, err)
		}
		if res.RuntimeMs > maxRT {
			maxRT = res.RuntimeMs
		}

		// TLE
		if res.TimedOut {
			result.Status = "TimeLimitExceeded"
			result.Failed = &FailedCase{Index: i, Input: tc.Input}
			result.RuntimeMs = maxRT
			return result, nil
		}

		// Runtime error
		if res.ExitCode != 0 {
			result.Status = "RuntimeError"
			result.Failed = &FailedCase{
				Index: i, Input: tc.Input,
				Expected: tc.Expected, Actual: res.Stderr,
			}
			result.RuntimeMs = maxRT
			return result, nil
		}

		actual := strings.TrimRight(res.Stdout, "\n")

		// Wrong answer (skip if expected output not yet imported)
		if tc.Expected != "" && !OutputEqual(cfg.IsAutoWrap, actual, tc.Expected) {
			result.Status = "WrongAnswer"
			result.Failed = &FailedCase{
				Index: i, Input: tc.Input,
				Expected: tc.Expected, Actual: actual,
			}
			result.RuntimeMs = maxRT
			return result, nil
		}

		result.Passed++
	}

	result.Status = "Accepted"
	result.RuntimeMs = maxRT
	return result, nil
}
