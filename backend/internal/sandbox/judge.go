package sandbox

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Judge verdict status constants.
const (
	StatusAccepted     = "Accepted"
	StatusWrongAnswer  = "WrongAnswer"
	StatusRuntimeError = "RuntimeError"
	StatusCompileError = "CompileError"
	StatusTLE          = "TimeLimitExceeded"
	StatusMLE          = "MemoryLimitExceeded"
	StatusSystemError  = "SystemError"
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

// CaseResult holds per-test-case output when RunAll mode is used.
type CaseResult struct {
	Index  int    `json:"index"`
	Status string `json:"status"` // "Accepted", "WrongAnswer", "RuntimeError", "TimeLimitExceeded", "MemoryLimitExceeded"
	Actual string `json:"actual"` // stdout for AC/WA, stderr for RE
}

// JudgeResult is returned by Judge.
type JudgeResult struct {
	Status    string        `json:"status"`               // Accepted | WrongAnswer | RuntimeError | CompileError | TimeLimitExceeded | MemoryLimitExceeded | SystemError
	Passed    int           `json:"passed"`
	Total     int           `json:"total"`
	RuntimeMs int64         `json:"runtime_ms"`           // slowest test case
	MemoryKB  int64         `json:"memory_kb,omitempty"`  // peak memory (when available)
	Failed    *FailedCase   `json:"failed_case,omitempty"`
	AllCases  []CaseResult  `json:"all_cases,omitempty"`  // populated when RunAll=true
}

// JudgeAll evaluates user code against ALL test cases without short-circuiting.
// Returns per-case results so callers can fix all failures at once.
func JudgeAll(lang, code string, testCases []JudgeTestCase, timeLimit, memMB int) (*JudgeResult, error) {
	return judgeInternal(lang, code, testCases, timeLimit, memMB, true)
}

// Judge evaluates user code against all test cases.
// Short-circuits on the first failure and never reveals subsequent test cases.
func Judge(lang, code string, testCases []JudgeTestCase, timeLimit, memMB int) (*JudgeResult, error) {
	return judgeInternal(lang, code, testCases, timeLimit, memMB, false)
}

// batchOutputDelim separates test case outputs in batch stdout.
const batchOutputDelim = "<<<GATECODE_OUT_SEP>>>"

// batchCaseResult is the JSON structure emitted by the batch runner per case.
type batchCaseResult struct {
	Exit   int    `json:"x"`
	Stdout string `json:"o"`
	Stderr string `json:"e"`
	Ms     int64  `json:"t"`
}

// judgeInternal is the shared implementation for Judge and JudgeAll.
//
// Optimized Strategy — Minimal Docker CLI calls:
//   1. docker cp: source + all inputs + runner script → /w
//   2. docker exec: chmod + compile + run ALL test cases (one single call)
//   This means only 2 Docker CLI calls total (eliminating ~300ms overhead).
func judgeInternal(lang, code string, testCases []JudgeTestCase, timeLimit, memMB int, runAll bool) (*JudgeResult, error) {
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

	// ── Host workspace ──────────────────────────────────────────────────────
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

	// Write wrapped source code
	wrapped := WrapCode(lang, code)
	if err := os.WriteFile(filepath.Join(tmpDir, cfg.FileName), []byte(wrapped), 0644); err != nil {
		return nil, fmt.Errorf("write source: %w", err)
	}

	// Write per-case input files on host
	for i, tc := range testCases {
		fname := fmt.Sprintf("_in_%d", i)
		if err := os.WriteFile(filepath.Join(tmpDir, fname), []byte(tc.Input), 0644); err != nil {
			return nil, fmt.Errorf("write input %d: %w", i, err)
		}
	}

	// Write the unified runner script (chmod + compile + run all cases)
	script := buildUnifiedScript(cfg.CompileCmd, cfg.RunCmd, len(testCases), timeLimit)
	if err := os.WriteFile(filepath.Join(tmpDir, "_runner.sh"), []byte(script), 0755); err != nil {
		return nil, fmt.Errorf("write runner script: %w", err)
	}

	result := &JudgeResult{Total: len(testCases)}

	// ── Acquire container ───────────────────────────────────────────────────
	execMem := memMB
	if cfg.CompileMemMB > execMem {
		execMem = cfg.CompileMemMB
	}
	h := AcquireContainer(cfg.Image, execMem)
	defer h.Release()
	cname := h.Name()

	// ── Docker call 1: copy files ───────────────────────────────────────────
	if err := CopyToContainerFast(cname, tmpDir); err != nil {
		return &JudgeResult{
			Status: StatusSystemError,
			Total:  result.Total,
			Failed: &FailedCase{Index: -1, Actual: fmt.Sprintf("copy to container: %v", err)},
		}, nil
	}

	// ── Docker call 2: chmod + compile + run ALL cases in ONE exec ──────────
	totalTimeout := timeLimit*len(testCases) + 30_000 // compile time + all cases + grace
	batchRes, err := ExecInContainer(cname, "sh /w/_runner.sh", true, totalTimeout)
	if err != nil {
		return &JudgeResult{
			Status: StatusSystemError,
			Total:  result.Total,
			Failed: &FailedCase{Index: -1, Actual: fmt.Sprintf("batch exec error: %v", err)},
		}, nil
	}

	// Check for compile error (runner script outputs CE marker)
	if strings.HasPrefix(batchRes.Stdout, "<<<GATECODE_CE>>>") {
		ceMsg := strings.TrimPrefix(batchRes.Stdout, "<<<GATECODE_CE>>>")
		ceMsg = strings.TrimSpace(ceMsg)
		if ceMsg == "" {
			ceMsg = batchRes.Stderr
		}
		return &JudgeResult{
			Status: StatusCompileError,
			Total:  result.Total,
			Failed: &FailedCase{Index: -1, Actual: ceMsg},
		}, nil
	}

	return parseBatchOutput(batchRes.Stdout, testCases, cfg.IsAutoWrap, runAll)
}

// buildUnifiedScript generates ONE shell script that does:
//   1. chmod (fix permissions from docker cp)
//   2. compile (if needed)
//   3. run all test cases with per-case timeout
// This is the ONLY docker exec call needed after docker cp.
func buildUnifiedScript(compileCmd, runCmd string, numCases, timeLimitMs int) string {
	timeoutSec := (timeLimitMs + 999) / 1000

	var sb strings.Builder
	sb.WriteString("#!/bin/sh\nset -u\n")

	// Phase 1: fix permissions
	sb.WriteString("chmod -R 755 /w\n")

	// Phase 2: compile (if needed)
	if compileCmd != "" {
		// Capture compile stderr; output CE marker if compilation fails
		sb.WriteString(fmt.Sprintf(`
_ce=$(%s 2>&1)
if [ $? -ne 0 ]; then
  printf '<<<GATECODE_CE>>>%%s\n' "$_ce"
  exit 0
fi
`, compileCmd))
	}

	// Phase 3: run all test cases
	// Outputs per case: JSON line {x:exitcode, t:ms, o:stdout, e:stderr}
	// Cases separated by <<<GATECODE_OUT_SEP>>>
	sb.WriteString(fmt.Sprintf(`
TL=%d
RUN_CMD=%s
N=%d
i=0
while [ "$i" -lt "$N" ]; do
  IN_FILE="/w/_in_$i"
  [ ! -f "$IN_FILE" ] && IN_FILE="/dev/null"
  OUT_FILE="/tmp/_out_$i"
  ERR_FILE="/tmp/_err_$i"

  START_NS=$(date +%%s%%N 2>/dev/null || echo 0)
  timeout -s KILL "$TL" sh -c "$RUN_CMD" < "$IN_FILE" > "$OUT_FILE" 2> "$ERR_FILE"
  EC=$?
  END_NS=$(date +%%s%%N 2>/dev/null || echo 0)
  MS=$(( (END_NS - START_NS) / 1000000 ))
  [ "$MS" -lt 0 ] && MS=0

  # Encode stdout/stderr as JSON strings using awk (no subprocess spawn)
  O_JSON=$(awk 'BEGIN{ORS=""} {gsub(/\\/,"\\\\"); gsub(/"/,"\\\""); gsub(/\t/,"\\t"); gsub(/\r/,"\\r"); if(NR>1) printf "\\n"; printf "%%s",$0}' "$OUT_FILE" 2>/dev/null)
  E_JSON=$(awk 'BEGIN{ORS=""} {gsub(/\\/,"\\\\"); gsub(/"/,"\\\""); gsub(/\t/,"\\t"); gsub(/\r/,"\\r"); if(NR>1) printf "\\n"; printf "%%s",$0}' "$ERR_FILE" 2>/dev/null)

  printf '{"x":%%d,"t":%%d,"o":"%%s","e":"%%s"}\n' "$EC" "$MS" "$O_JSON" "$E_JSON"
  [ "$i" -lt "$((N-1))" ] && printf '<<<GATECODE_OUT_SEP>>>\n'

  rm -f "$OUT_FILE" "$ERR_FILE"
  i=$((i + 1))
done
`, timeoutSec, shellQuote(runCmd), numCases))

	return sb.String()
}

// parseBatchOutput parses the stdout from the batch runner script into a JudgeResult.
func parseBatchOutput(stdout string, testCases []JudgeTestCase, isAutoWrap, runAll bool) (*JudgeResult, error) {
	result := &JudgeResult{Total: len(testCases)}

	parts := strings.Split(stdout, batchOutputDelim)

	var maxRT int64
	var firstFailed *FailedCase
	var allCases []CaseResult

	if runAll {
		allCases = make([]CaseResult, 0, len(testCases))
	}

	for i, tc := range testCases {
		if i >= len(parts) {
			status := StatusSystemError
			actual := "no output from batch runner"
			if !runAll {
				result.Status = status
				result.Failed = &FailedCase{Index: i, Input: tc.Input, Actual: actual}
				result.RuntimeMs = maxRT
				return result, nil
			}
			allCases = append(allCases, CaseResult{Index: i, Status: status, Actual: actual})
			if firstFailed == nil {
				result.Status = status
				firstFailed = &FailedCase{Index: i, Input: tc.Input, Actual: actual}
			}
			continue
		}

		raw := strings.TrimSpace(parts[i])
		var cr batchCaseResult
		if err := json.Unmarshal([]byte(raw), &cr); err != nil {
			if !runAll {
				result.Status = StatusSystemError
				result.Failed = &FailedCase{Index: i, Actual: fmt.Sprintf("parse batch output: %v (raw: %s)", err, truncate(raw, 200))}
				result.RuntimeMs = maxRT
				return result, nil
			}
			allCases = append(allCases, CaseResult{Index: i, Status: StatusSystemError, Actual: fmt.Sprintf("parse error: %v", err)})
			continue
		}

		if cr.Ms > maxRT {
			maxRT = cr.Ms
		}

		// TLE: timeout -s KILL returns exit code 137, timeout returns 124
		if cr.Exit == 137 || cr.Exit == 124 {
			if !runAll {
				result.Status = StatusTLE
				result.Failed = &FailedCase{Index: i, Input: tc.Input}
				result.RuntimeMs = maxRT
				return result, nil
			}
			allCases = append(allCases, CaseResult{Index: i, Status: StatusTLE})
			if firstFailed == nil {
				result.Status = StatusTLE
				firstFailed = &FailedCase{Index: i, Input: tc.Input}
			}
			continue
		}

		// Runtime error
		if cr.Exit != 0 {
			if !runAll {
				result.Status = StatusRuntimeError
				result.Failed = &FailedCase{Index: i, Input: tc.Input, Expected: tc.Expected, Actual: cr.Stderr}
				result.RuntimeMs = maxRT
				return result, nil
			}
			allCases = append(allCases, CaseResult{Index: i, Status: StatusRuntimeError, Actual: cr.Stderr})
			if firstFailed == nil {
				result.Status = StatusRuntimeError
				firstFailed = &FailedCase{Index: i, Input: tc.Input, Expected: tc.Expected, Actual: cr.Stderr}
			}
			continue
		}

		actual := strings.TrimRight(cr.Stdout, "\n")

		// Wrong answer
		if tc.Expected != "" && !OutputEqual(isAutoWrap, actual, tc.Expected) {
			if !runAll {
				result.Status = StatusWrongAnswer
				result.Failed = &FailedCase{Index: i, Input: tc.Input, Expected: tc.Expected, Actual: actual}
				result.RuntimeMs = maxRT
				return result, nil
			}
			allCases = append(allCases, CaseResult{Index: i, Status: StatusWrongAnswer, Actual: actual})
			if firstFailed == nil {
				result.Status = StatusWrongAnswer
				firstFailed = &FailedCase{Index: i, Input: tc.Input, Expected: tc.Expected, Actual: actual}
			}
			continue
		}

		result.Passed++
		if runAll {
			allCases = append(allCases, CaseResult{Index: i, Status: StatusAccepted, Actual: actual})
		}
	}

	if firstFailed != nil {
		result.Failed = firstFailed
		result.RuntimeMs = maxRT
		result.AllCases = allCases
		return result, nil
	}

	result.Status = StatusAccepted
	result.RuntimeMs = maxRT
	if runAll {
		result.AllCases = allCases
	}
	return result, nil
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}
