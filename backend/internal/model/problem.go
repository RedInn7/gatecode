package model

import "encoding/json"

type Problem struct {
	ID                 uint64          `json:"id"`
	FrontendQuestionID int             `json:"frontend_question_id"`
	Title              string          `json:"title"`
	Slug               string          `json:"slug"`
	Difficulty         string          `json:"difficulty"`
	Content            string          `json:"content"`
	TemplateCode       json.RawMessage `json:"template_code"` // 存储多语言模板 JSON
	IsVipOnly          bool            `json:"is_vip_only"`
	IsACMMode          bool            `json:"is_acm_mode"`
}
