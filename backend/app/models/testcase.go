package models

type TestCase struct {
	ID             uint   `gorm:"primaryKey" json:"id"`
	ProblemID      uint   `json:"problem_id"`
	Input          string `json:"input"`
	ExpectedOutput string `json:"expected_output"`
	IsSample       bool   `gorm:"default:false" json:"is_sample"`
}
