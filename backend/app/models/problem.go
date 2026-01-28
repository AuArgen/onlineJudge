package models

import "time"

type Problem struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	TimeLimit   float64 `json:"time_limit"`
	MemoryLimit int     `json:"memory_limit"`
	AuthorID    uint    `json:"author_id"`
	Visibility  string  `gorm:"default:private" json:"visibility"` // private, public

	// Status: draft, pending_review, published, rejected
	Status            string `gorm:"default:draft" json:"status"`
	ModerationComment string `json:"moderation_comment"` // Reason for rejection

	AuthorSourceCode string `json:"author_source_code"`
	AuthorLanguage   string `json:"author_language"`

	// Sharing
	ShareToken string `json:"share_token"` // Unique token for link sharing

	CreatedAt time.Time `json:"created_at"`

	TestCases   []TestCase      `gorm:"foreignKey:ProblemID;constraint:OnDelete:CASCADE" json:"test_cases,omitempty"`
	Submissions []Submission    `gorm:"foreignKey:ProblemID;constraint:OnDelete:CASCADE" json:"-"`
	AccessList  []ProblemAccess `gorm:"foreignKey:ProblemID;constraint:OnDelete:CASCADE" json:"access_list,omitempty"`

	// Virtual field for statistics
	SolvedCount int64 `gorm:"-" json:"solved_count"`
}

type ProblemAccess struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	ProblemID uint   `json:"problem_id"`
	UserID    *uint  `json:"user_id"` // Nullable if invited by email but not registered yet
	Email     string `json:"email"`
}
