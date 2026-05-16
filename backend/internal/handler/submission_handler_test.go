package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/RedInn7/gatecode/backend/internal/sandbox"
	"github.com/RedInn7/gatecode/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// ---------------------------------------------------------------------------
// Mock JudgeService
// ---------------------------------------------------------------------------

type mockJudgeSvc struct {
	runResult   *sandbox.RunResult
	runErr      error
	judgeResult *sandbox.JudgeResult
	judgeErr    error

	gotSlug, gotLang, gotCode string
	gotRunAll                 []bool
}

func (m *mockJudgeSvc) RunCode(slug, lang, code string) (*sandbox.RunResult, error) {
	m.gotSlug, m.gotLang, m.gotCode = slug, lang, code
	return m.runResult, m.runErr
}

func (m *mockJudgeSvc) JudgeCode(slug, lang, code string, runAll ...bool) (*sandbox.JudgeResult, error) {
	m.gotSlug, m.gotLang, m.gotCode = slug, lang, code
	m.gotRunAll = runAll
	return m.judgeResult, m.judgeErr
}

var _ service.JudgeService = (*mockJudgeSvc)(nil)

func newSubmissionRouter(svc service.JudgeService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	h := NewSubmissionHandler(svc)
	r := gin.New()
	r.POST("/api/v1/problems/:slug/run", h.RunCode)
	r.POST("/api/v1/problems/:slug/judge", h.JudgeCode)
	return r
}

func postJSON(t *testing.T, r http.Handler, url string, body any) *httptest.ResponseRecorder {
	t.Helper()
	buf, err := json.Marshal(body)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodPost, url, bytes.NewReader(buf))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

// ---------------------------------------------------------------------------
// RunCode
// ---------------------------------------------------------------------------

func TestRunCode_OK(t *testing.T) {
	svc := &mockJudgeSvc{
		runResult: &sandbox.RunResult{Status: "Accepted", Stdout: "[0, 1]", RuntimeMs: 50},
	}
	r := newSubmissionRouter(svc)
	w := postJSON(t, r, "/api/v1/problems/two-sum/run", map[string]any{
		"language": "Python3",
		"code":     "print(42)",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
	var resp sandbox.RunResult
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatal(err)
	}
	if resp.Status != "Accepted" {
		t.Fatalf("unexpected resp: %+v", resp)
	}
	if svc.gotSlug != "two-sum" || svc.gotLang != "Python3" {
		t.Fatalf("captured args wrong: slug=%q lang=%q", svc.gotSlug, svc.gotLang)
	}
}

func TestRunCode_MissingFields_400(t *testing.T) {
	cases := []map[string]any{
		{},                         // both empty
		{"language": "Python3"},    // missing code
		{"code": "print(1)"},       // missing language
		{"language": "", "code": ""},
	}
	for i, body := range cases {
		r := newSubmissionRouter(&mockJudgeSvc{})
		w := postJSON(t, r, "/api/v1/problems/two-sum/run", body)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("case %d: status=%d body=%s", i, w.Code, w.Body.String())
		}
	}
}

func TestRunCode_BadJSON_400(t *testing.T) {
	r := newSubmissionRouter(&mockJudgeSvc{})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/problems/two-sum/run", strings.NewReader("NOT JSON {"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status=%d", w.Code)
	}
}

func TestRunCode_ErrorMapping(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want int
	}{
		{"not_found", errors.New("problem not found: record not found"), http.StatusNotFound},
		{"record_not_found", errors.New("record not found"), http.StatusNotFound},
		{"disabled", errors.New("judging is currently unavailable for this problem"), http.StatusForbidden},
		{"no_testcases", errors.New("no test cases available for this problem"), http.StatusUnprocessableEntity},
		{"parse_err", errors.New("failed to parse test cases: bad json"), http.StatusUnprocessableEntity},
		{"unknown", errors.New("kaboom"), http.StatusInternalServerError},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			svc := &mockJudgeSvc{runErr: tc.err}
			r := newSubmissionRouter(svc)
			w := postJSON(t, r, "/api/v1/problems/x/run", map[string]any{
				"language": "Python3", "code": "y=1",
			})
			if w.Code != tc.want {
				t.Fatalf("status=%d want=%d body=%s", w.Code, tc.want, w.Body.String())
			}
		})
	}
}

// ---------------------------------------------------------------------------
// JudgeCode
// ---------------------------------------------------------------------------

func TestJudgeCode_OK(t *testing.T) {
	svc := &mockJudgeSvc{
		judgeResult: &sandbox.JudgeResult{Status: "Accepted", Passed: 5, Total: 5, RuntimeMs: 80},
	}
	r := newSubmissionRouter(svc)
	w := postJSON(t, r, "/api/v1/problems/two-sum/judge", map[string]any{
		"language": "Python3", "code": "y=1", "run_all": true,
	})
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
	var resp sandbox.JudgeResult
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatal(err)
	}
	if resp.Status != "Accepted" || resp.Passed != 5 {
		t.Fatalf("unexpected resp: %+v", resp)
	}
	if len(svc.gotRunAll) == 0 || svc.gotRunAll[0] != true {
		t.Fatalf("expected run_all=true to be forwarded, got %v", svc.gotRunAll)
	}
}

func TestJudgeCode_MissingFields_400(t *testing.T) {
	r := newSubmissionRouter(&mockJudgeSvc{})
	w := postJSON(t, r, "/api/v1/problems/two-sum/judge", map[string]any{})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status=%d", w.Code)
	}
}

func TestJudgeCode_DisabledProblem_403(t *testing.T) {
	svc := &mockJudgeSvc{judgeErr: errors.New("judging is currently unavailable for this problem")}
	r := newSubmissionRouter(svc)
	w := postJSON(t, r, "/api/v1/problems/disabled-slug/judge", map[string]any{
		"language": "Python3", "code": "x=1",
	})
	if w.Code != http.StatusForbidden {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestJudgeCode_NotFound_404(t *testing.T) {
	svc := &mockJudgeSvc{judgeErr: errors.New("problem not found: record not found")}
	r := newSubmissionRouter(svc)
	w := postJSON(t, r, "/api/v1/problems/nope/judge", map[string]any{
		"language": "Python3", "code": "x=1",
	})
	if w.Code != http.StatusNotFound {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestJudgeCode_LargeCodeBody_AcceptedByHandler(t *testing.T) {
	// Handler must not impose its own body-size limit beyond Gin's default
	// (1MiB-ish for c.ShouldBindJSON). A 200KB code body should pass through.
	big := strings.Repeat("A", 200000)
	svc := &mockJudgeSvc{
		judgeResult: &sandbox.JudgeResult{Status: "Accepted", Passed: 1, Total: 1},
	}
	r := newSubmissionRouter(svc)
	w := postJSON(t, r, "/api/v1/problems/two-sum/judge", map[string]any{
		"language": "Python3", "code": "x=\"" + big + "\"",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d", w.Code)
	}
	if len(svc.gotCode) != len("x=\"")+len(big)+1 {
		t.Fatalf("forwarded code truncated: got %d bytes", len(svc.gotCode))
	}
}
