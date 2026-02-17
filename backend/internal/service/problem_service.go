package service

import (
	"github.com/RedInn7/gatecode/backend/internal/model"
	"github.com/RedInn7/gatecode/backend/internal/repository"
)

type ProblemService interface {
	GetProblemList() ([]model.ProblemListItem, error)
	GetProblemBySlug(slug string) (*model.Problem, error)
}

type problemService struct {
	repo repository.ProblemRepository
}

func NewProblemService(repo repository.ProblemRepository) ProblemService {
	return &problemService{repo: repo}
}

func (s *problemService) GetProblemList() ([]model.ProblemListItem, error) {
	return s.repo.GetAllForList()
}

func (s *problemService) GetProblemBySlug(slug string) (*model.Problem, error) {
	return s.repo.GetBySlug(slug)
}
