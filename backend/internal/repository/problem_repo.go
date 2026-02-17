package repository

import (
	"github.com/RedInn7/gatecode/backend/internal/model"
	"gorm.io/gorm"
)

// ProblemRepository 定义了操作题目的标准接口 (类似 Java 的 DAO Interface)
type ProblemRepository interface {
	Create(problem *model.Problem) error
	GetAll() ([]model.Problem, error)
	GetBySlug(slug string) (*model.Problem, error)
}

// problemRepository 是接口的具体实现 (类似 Java 的 DAO Impl)
type problemRepository struct {
	db *gorm.DB
}

// NewProblemRepository 是工厂方法，用于注入数据库连接
func NewProblemRepository(db *gorm.DB) ProblemRepository {
	return &problemRepository{
		db: db,
	}
}

// GetAll 实现接口方法：获取所有题目
func (r *problemRepository) GetAll() ([]model.Problem, error) {
	var problems []model.Problem
	// 注意：这里使用的是 r.db，而不是全局的 database.DB
	if err := r.db.Find(&problems).Error; err != nil {
		return nil, err
	}
	return problems, nil
}

// Create 实现接口方法：创建题目 (#1 导入脚本会用到)
func (r *problemRepository) Create(problem *model.Problem) error {
	return r.db.Create(problem).Error
}

// GetBySlug 实现接口方法：根据 URL 获取题目详情
func (r *problemRepository) GetBySlug(slug string) (*model.Problem, error) {
	var problem model.Problem
	if err := r.db.Where("slug = ?", slug).First(&problem).Error; err != nil {
		return nil, err
	}
	return &problem, nil
}
