package service

import (
	"github.com/RedInn7/gatecode/backend/internal/model"
	"github.com/RedInn7/gatecode/backend/internal/repository"
)

type ProblemService interface {
	GetProblemList() ([]model.Problem, error)
}

type problemService struct {
	repo repository.ProblemRepository
}

func NewProblemService(repo repository.ProblemRepository) ProblemService {
	return &problemService{repo: repo}
}

func (s *problemService) GetProblemList() ([]model.Problem, error) {
	// 这里可以加逻辑：比如排序、VIP 过滤等
	return s.repo.GetAll()
}
