package repository

import (
	"github.com/RedInn7/gatecode/backend/internal/model"
	"gorm.io/gorm"
)

// ProblemRepository 定义了操作题目的标准接口 (类似 Java 的 DAO Interface)
type ProblemRepository interface {
	Create(problem *model.Problem) error
	GetAll() ([]model.Problem, error)
	GetAllForList() ([]model.ProblemListItem, error)
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

// GetAllForList 只查询列表页需要的字段，避免拉取 content / template_code 大字段
func (r *problemRepository) GetAllForList() ([]model.ProblemListItem, error) {
	var items []model.ProblemListItem
	err := r.db.Model(&model.Problem{}).
		Select("id", "frontend_question_id", "title", "slug", "difficulty", "is_vip_only").
		Find(&items).Error
	if err != nil {
		return nil, err
	}
	return items, nil
}

// GetAll 实现接口方法：获取所有题目（含全部字段）
func (r *problemRepository) GetAll() ([]model.Problem, error) {
	var problems []model.Problem
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
