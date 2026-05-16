package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/RedInn7/gatecode/backend/internal/model"
	"github.com/RedInn7/gatecode/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// ---------------------------------------------------------------------------
// Mock ProblemService — lets us drive the handler without a real DB.
// ---------------------------------------------------------------------------

type mockProblemSvc struct {
	page    *model.ProblemListResponse
	pageErr error

	problem    *model.Problem
	problemErr error

	// captured args
	gotPage, gotLimit int
	gotSlug           string
}

func (m *mockProblemSvc) GetProblemList() ([]model.ProblemListItem, error) {
	return nil, nil
}
func (m *mockProblemSvc) GetProblemPage(page, limit int) (*model.ProblemListResponse, error) {
	m.gotPage, m.gotLimit = page, limit
	return m.page, m.pageErr
}
func (m *mockProblemSvc) GetProblemBySlug(slug string) (*model.Problem, error) {
	m.gotSlug = slug
	return m.problem, m.problemErr
}

var _ service.ProblemService = (*mockProblemSvc)(nil)

func newProblemRouter(svc service.ProblemService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	h := NewProblemHandler(svc)
	r := gin.New()
	r.GET("/api/v1/problems", h.GetProblems)
	r.GET("/api/v1/problems/:slug", h.GetProblemBySlug)
	return r
}

func TestGetProblems_OK(t *testing.T) {
	svc := &mockProblemSvc{
		page: &model.ProblemListResponse{
			Total: 2,
			Problems: []model.ProblemListItem{
				{ID: 1, FrontendQuestionID: 1, Title: "Two Sum", Slug: "two-sum", Difficulty: "Easy"},
				{ID: 2, FrontendQuestionID: 2, Title: "Add Two Numbers", Slug: "add-two-numbers", Difficulty: "Medium"},
			},
		},
	}
	r := newProblemRouter(svc)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/problems?page=2&limit=20", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
	var resp model.ProblemListResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if resp.Total != 2 || len(resp.Problems) != 2 {
		t.Fatalf("unexpected resp: %+v", resp)
	}
	if svc.gotPage != 2 || svc.gotLimit != 20 {
		t.Fatalf("svc got page=%d limit=%d, want 2/20", svc.gotPage, svc.gotLimit)
	}
}

func TestGetProblems_DefaultsAndEdgeArgs(t *testing.T) {
	cases := []struct {
		name      string
		url       string
		wantPage  int
		wantLimit int
	}{
		{"no params", "/api/v1/problems", 1, 100},
		{"page=0", "/api/v1/problems?page=0&limit=10", 0, 10},
		{"negative", "/api/v1/problems?page=-1&limit=-5", -1, -5},
		{"non-numeric", "/api/v1/problems?page=abc&limit=xyz", 0, 0},
		{"limit very large", "/api/v1/problems?page=1&limit=10000", 1, 10000},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			svc := &mockProblemSvc{page: &model.ProblemListResponse{Total: 0, Problems: []model.ProblemListItem{}}}
			r := newProblemRouter(svc)
			req := httptest.NewRequest(http.MethodGet, tc.url, nil)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)
			if w.Code != http.StatusOK {
				t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
			}
			if svc.gotPage != tc.wantPage || svc.gotLimit != tc.wantLimit {
				t.Fatalf("page=%d limit=%d, want %d/%d", svc.gotPage, svc.gotLimit, tc.wantPage, tc.wantLimit)
			}
		})
	}
}

func TestGetProblems_ServiceError_500(t *testing.T) {
	svc := &mockProblemSvc{pageErr: errors.New("boom")}
	r := newProblemRouter(svc)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/problems", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusInternalServerError {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
	if !strings.Contains(w.Body.String(), "error") {
		t.Errorf("expected error body, got %s", w.Body.String())
	}
}

func TestGetProblemBySlug_OK(t *testing.T) {
	svc := &mockProblemSvc{
		problem: &model.Problem{ID: 1, Slug: "two-sum", Title: "Two Sum", Difficulty: "Easy"},
	}
	r := newProblemRouter(svc)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/problems/two-sum", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d", w.Code)
	}
	if svc.gotSlug != "two-sum" {
		t.Fatalf("got slug %q", svc.gotSlug)
	}
	var p model.Problem
	if err := json.Unmarshal(w.Body.Bytes(), &p); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if p.Slug != "two-sum" {
		t.Fatalf("unexpected response: %+v", p)
	}
}

func TestGetProblemBySlug_NotFound(t *testing.T) {
	svc := &mockProblemSvc{problemErr: errors.New("record not found")}
	r := newProblemRouter(svc)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/problems/nope", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusNotFound {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestGetProblemBySlug_SpecialChars(t *testing.T) {
	// Special / SQL-injection-looking slugs must be handled safely and
	// reach the service layer unchanged (no panic in the URL parser).
	svc := &mockProblemSvc{problemErr: errors.New("record not found")}
	r := newProblemRouter(svc)
	// "%3Cscript%3E" decodes to "<script>"
	req := httptest.NewRequest(http.MethodGet, "/api/v1/problems/%3Cscript%3E", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusNotFound {
		t.Fatalf("status=%d", w.Code)
	}
	if svc.gotSlug != "<script>" {
		t.Fatalf("got slug %q", svc.gotSlug)
	}
}
