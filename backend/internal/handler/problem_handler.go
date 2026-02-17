package api

import (
	"github.com/RedInn7/gatecode/backend/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

type ProblemHandler struct {
	svc service.ProblemService
}

func NewProblemHandler(svc service.ProblemService) *ProblemHandler {
	return &ProblemHandler{svc: svc}
}

func (h *ProblemHandler) GetProblems(c *gin.Context) {
	problems, err := h.svc.GetProblemList()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取题目失败"})
		return
	}
	c.JSON(http.StatusOK, problems)
}
