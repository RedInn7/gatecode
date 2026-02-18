package api

import (
	"net/http"

	"github.com/RedInn7/gatecode/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// SubmissionHandler handles code-run requests.
type SubmissionHandler struct {
	judgeSvc service.JudgeService
}

// NewSubmissionHandler creates a new SubmissionHandler.
func NewSubmissionHandler(svc service.JudgeService) *SubmissionHandler {
	return &SubmissionHandler{judgeSvc: svc}
}

// RunCodeRequest is the JSON body for POST /api/v1/problems/:slug/run.
type RunCodeRequest struct {
	Language string `json:"language" binding:"required"`
	Code     string `json:"code" binding:"required"`
}

// RunCode handles POST /api/v1/problems/:slug/run.
// Quick debug: runs code against the first test case only, returns raw stdout.
func (h *SubmissionHandler) RunCode(c *gin.Context) {
	slug := c.Param("slug")

	var req RunCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.judgeSvc.RunCode(slug, req.Language, req.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// JudgeCode handles POST /api/v1/problems/:slug/judge.
// Full evaluation: runs code against all test cases, compares output, returns verdict.
func (h *SubmissionHandler) JudgeCode(c *gin.Context) {
	slug := c.Param("slug")

	var req RunCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.judgeSvc.JudgeCode(slug, req.Language, req.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
