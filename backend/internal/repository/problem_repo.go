package repository

import (
	"github.com/RedInn7/gatecode/backend/internal/model"
	"github.com/RedInn7/gatecode/backend/pkg/database"
)

func GetAllProblems() ([]model.Problem, error) {
	query := "SELECT id, frontend_question_id, title, slug, difficulty, is_vip_only FROM problems"
	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var problems []model.Problem
	for rows.Next() {
		var p model.Problem
		if err := rows.Scan(&p.ID, &p.FrontendQuestionID, &p.Title, &p.Slug, &p.Difficulty, &p.IsVipOnly); err != nil {
			return nil, err
		}
		problems = append(problems, p)
	}
	return problems, nil
}
