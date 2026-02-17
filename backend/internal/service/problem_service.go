package service

import (
	"github.com/RedInn7/gatecode/backend/internal/model"
	"github.com/RedInn7/gatecode/backend/internal/repository"
)

type ProblemService interface {
	GetProblemList() ([]model.ProblemListItem, error)
	GetProblemPage(page, limit int) (*model.ProblemListResponse, error)
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

func (s *problemService) GetProblemPage(page, limit int) (*model.ProblemListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 200 {
		limit = 100
	}
	offset := (page - 1) * limit
	items, total, err := s.repo.GetPageForList(offset, limit)
	if err != nil {
		return nil, err
	}
	return &model.ProblemListResponse{Total: total, Problems: items}, nil
}

func (s *problemService) GetProblemBySlug(slug string) (*model.Problem, error) {
	return s.repo.GetBySlug(slug)
}
