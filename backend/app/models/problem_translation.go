package models

type ProblemTranslation struct {
	ID           uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	ProblemID    uint   `json:"problem_id" gorm:"not null;uniqueIndex:idx_problem_lang"`
	LanguageCode string `json:"language_code" gorm:"not null;size:10;uniqueIndex:idx_problem_lang"`
	Title        string `json:"title"`
	Description  string `json:"description"`
}
