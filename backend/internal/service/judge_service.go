package service

import (
	"encoding/json"
	"fmt"

	"github.com/RedInn7/gatecode/backend/internal/repository"
	"github.com/RedInn7/gatecode/backend/internal/sandbox"
)

// TestCase represents one test case stored in the problem's test_cases JSON column.
type TestCase struct {
	Input  string `json:"input"`
	Output string `json:"output"`
}

// JudgeService handles code execution and evaluation requests.
type JudgeService interface {
	// RunCode runs code against the first test case only (quick debug mode).
	RunCode(slug, lang, code string) (*sandbox.RunResult, error)
	// JudgeCode evaluates code against all test cases and returns a verdict.
	// When runAll is true, runs ALL test cases without short-circuiting.
	JudgeCode(slug, lang, code string, runAll ...bool) (*sandbox.JudgeResult, error)
}

type judgeService struct {
	problemRepo repository.ProblemRepository
}

// NewJudgeService creates a JudgeService backed by the given problem repository.
func NewJudgeService(repo repository.ProblemRepository) JudgeService {
	return &judgeService{problemRepo: repo}
}

func (s *judgeService) RunCode(slug, lang, code string) (*sandbox.RunResult, error) {
	problem, err := s.problemRepo.GetBySlug(slug)
	if err != nil {
		return nil, fmt.Errorf("problem not found: %w", err)
	}

	if !problem.JudgeEnabled {
		return nil, fmt.Errorf("judging is currently unavailable for this problem")
	}

	if len(problem.TestCases) == 0 {
		return nil, fmt.Errorf("no test cases available for this problem")
	}

	var testCases []TestCase
	if err := json.Unmarshal(problem.TestCases, &testCases); err != nil {
		return nil, fmt.Errorf("failed to parse test cases: %w", err)
	}

	if len(testCases) == 0 {
		return nil, fmt.Errorf("no test cases available for this problem")
	}

	// Normalize language name (e.g. "python3" → "Python3")
	if display, ok := sandbox.LangKeyToDisplay[lang]; ok {
		lang = display
	}

	return sandbox.Run(lang, code, testCases[0].Input)
}

func (s *judgeService) JudgeCode(slug, lang, code string, runAll ...bool) (*sandbox.JudgeResult, error) {
	problem, err := s.problemRepo.GetBySlug(slug)
	if err != nil {
		return nil, fmt.Errorf("problem not found: %w", err)
	}

	if !problem.JudgeEnabled {
		return nil, fmt.Errorf("judging is currently unavailable for this problem")
	}

	if len(problem.TestCases) == 0 {
		return nil, fmt.Errorf("no test cases available for this problem")
	}

	var testCases []TestCase
	if err := json.Unmarshal(problem.TestCases, &testCases); err != nil {
		return nil, fmt.Errorf("failed to parse test cases: %w", err)
	}
	if len(testCases) == 0 {
		return nil, fmt.Errorf("no test cases available for this problem")
	}

	jCases := make([]sandbox.JudgeTestCase, len(testCases))
	for i, tc := range testCases {
		jCases[i] = sandbox.JudgeTestCase{Input: tc.Input, Expected: tc.Output}
	}

	// Per-problem resource limits (0 → sandbox defaults)
	timeLimit := problem.TimeLimitMs
	memMB := problem.MemoryLimitMB

	// Apply language time multiplier
	if timeLimit > 0 {
		timeLimit *= langTimeMultiplier(lang)
	}

	if len(runAll) > 0 && runAll[0] {
		return sandbox.JudgeAll(lang, code, jCases, timeLimit, memMB)
	}
	return sandbox.Judge(lang, code, jCases, timeLimit, memMB)
}

// langTimeMultiplier returns a time multiplier for the given language.
// Compiled languages get 1x, JVM/GC languages 2x, interpreted 3x.
func langTimeMultiplier(lang string) int {
	// Normalize to display name first
	if display, ok := sandbox.LangKeyToDisplay[lang]; ok {
		lang = display
	}
	switch lang {
	case "C++", "C", "Rust":
		return 1
	case "Java", "Go", "Kotlin", "Scala":
		return 2
	default: // Python3, Python, JavaScript, TypeScript, Ruby, PHP, etc.
		return 3
	}
}
