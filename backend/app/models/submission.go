package models

import "time"

type Submission struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `json:"user_id"`
	ProblemID     uint      `json:"problem_id"`
	ContestID     *uint     `json:"contest_id,omitempty"` // Nullable, if part of a contest
	Language      string    `json:"language"`
	SourceCode    string    `json:"source_code"`
	Status        string    `json:"status"` // Pending, Accepted, Wrong Answer, etc.
	ExecutionTime string    `json:"execution_time"`
	CreatedAt     time.Time `json:"created_at"`

	User    User               `gorm:"foreignKey:UserID" json:"user"`
	Problem Problem            `gorm:"foreignKey:ProblemID" json:"problem"`
	Details []SubmissionDetail `gorm:"foreignKey:SubmissionID;constraint:OnDelete:CASCADE" json:"details"`
}

type SubmissionDetail struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	SubmissionID  uint   `json:"submission_id"`
	TestCaseID    uint   `json:"test_case_id"`
	Status        string `json:"status"`
	ExecutionTime string `json:"execution_time"`
	IsSample      bool   `json:"is_sample"`
}
