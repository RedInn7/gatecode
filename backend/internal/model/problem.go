package model

import "encoding/json"

type Problem struct {
	ID                 uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	FrontendQuestionID int             `gorm:"column:frontend_question_id;uniqueIndex" json:"frontend_question_id"`
	Title              string          `gorm:"column:title" json:"title"`
	Slug               string          `gorm:"column:slug;uniqueIndex" json:"slug"`
	Difficulty         string          `gorm:"column:difficulty" json:"difficulty"`
	Content            string          `gorm:"column:content" json:"content"`
	TemplateCode       json.RawMessage `gorm:"column:template_code;type:json" json:"template_code"`
	IsVipOnly          bool            `gorm:"column:is_vip_only" json:"is_vip_only"`
	IsACMMode          bool            `gorm:"column:is_acm_mode" json:"is_acm_mode"`
	TestCases          json.RawMessage `gorm:"column:test_cases;type:json" json:"test_cases"`
	TimeLimitMs        int             `gorm:"column:time_limit_ms;default:0" json:"time_limit_ms"`
	MemoryLimitMB      int             `gorm:"column:memory_limit_mb;default:0" json:"memory_limit_mb"`
	IsSpj              bool            `gorm:"column:is_spj;default:false" json:"is_spj"`
	JudgeEnabled       bool            `gorm:"column:judge_enabled;default:true" json:"judge_enabled"`
	Solutions          json.RawMessage `gorm:"column:solutions;type:json" json:"solutions"`
	Editorial          *string         `gorm:"column:editorial;type:mediumtext" json:"editorial"`
}

// ProblemListItem 是列表接口的轻量响应 DTO，不含大字段 content 和 template_code
type ProblemListItem struct {
	ID                 uint64 `json:"id"`
	FrontendQuestionID int    `json:"frontend_question_id"`
	Title              string `json:"title"`
	Slug               string `json:"slug"`
	Difficulty         string `json:"difficulty"`
	IsVipOnly          bool   `json:"is_vip_only"`
}

// ProblemListResponse 是分页列表接口的响应结构
type ProblemListResponse struct {
	Total    int64             `json:"total"`
	Problems []ProblemListItem `json:"problems"`
}
