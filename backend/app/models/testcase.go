package models

import "time"

type TestCase struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ProblemID      uint      `json:"problem_id"`
	Input          string    `json:"input"`
	ExpectedOutput string    `json:"expected_output"`
	IsSample       bool      `gorm:"default:false" json:"is_sample"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
