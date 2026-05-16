package model

import "encoding/json"

// Problem mirrors the `problems` table. GORM tags pin the exact column
// type so AutoMigrate is a no-op against the production schema instead of
// silently widening types (e.g. enum → longtext) or dropping NOT NULL.
type Problem struct {
	ID                 uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	FrontendQuestionID int             `gorm:"column:frontend_question_id;type:bigint;uniqueIndex" json:"frontend_question_id"`
	Title              string          `gorm:"column:title;type:longtext" json:"title"`
	Slug               string          `gorm:"column:slug;type:varchar(200);not null;uniqueIndex" json:"slug"`
	Difficulty         string          `gorm:"column:difficulty;type:enum('Easy','Medium','Hard');not null" json:"difficulty"`
	Content            string          `gorm:"column:content;type:text" json:"content"`
	TemplateCode       json.RawMessage `gorm:"column:template_code;type:json" json:"template_code"`
	IsVipOnly          bool            `gorm:"column:is_vip_only;type:tinyint(1);default:0" json:"is_vip_only"`
	IsACMMode          bool            `gorm:"column:is_acm_mode;type:tinyint(1);default:0" json:"is_acm_mode"`
	TestCases          json.RawMessage `gorm:"column:test_cases;type:json" json:"test_cases"`
	TimeLimitMs        int             `gorm:"column:time_limit_ms;type:int;not null;default:0" json:"time_limit_ms"`
	MemoryLimitMB      int             `gorm:"column:memory_limit_mb;type:int;not null;default:0" json:"memory_limit_mb"`
	IsSpj              bool            `gorm:"column:is_spj;type:tinyint(1);default:0" json:"is_spj"`
	JudgeEnabled       bool            `gorm:"column:judge_enabled;type:tinyint(1);default:1;index:idx_problems_judge_enabled" json:"judge_enabled"`
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
