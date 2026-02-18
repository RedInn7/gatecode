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
	JudgeCode(slug, lang, code string) (*sandbox.JudgeResult, error)
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

func (s *judgeService) JudgeCode(slug, lang, code string) (*sandbox.JudgeResult, error) {
	problem, err := s.problemRepo.GetBySlug(slug)
	if err != nil {
		return nil, fmt.Errorf("problem not found: %w", err)
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

	return sandbox.Judge(lang, code, jCases, 0, 0)
}
