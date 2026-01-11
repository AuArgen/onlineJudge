package models

import "time"

type Problem struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	TimeLimit        float64   `json:"time_limit"`
	MemoryLimit      int       `json:"memory_limit"`
	AuthorID         uint      `json:"author_id"`
	Visibility       string    `gorm:"default:private" json:"visibility"`
	Status           string    `gorm:"default:draft" json:"status"`
	AuthorSourceCode string    `json:"author_source_code"`
	AuthorLanguage   string    `json:"author_language"`
	CreatedAt        time.Time `json:"created_at"`

	TestCases   []TestCase   `gorm:"foreignKey:ProblemID;constraint:OnDelete:CASCADE" json:"test_cases,omitempty"`
	Submissions []Submission `gorm:"foreignKey:ProblemID;constraint:OnDelete:CASCADE" json:"-"`

	// Virtual field for statistics
	SolvedCount int64 `gorm:"-" json:"solved_count"`
}
