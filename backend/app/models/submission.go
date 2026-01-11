package models

import "time"

type Submission struct {
	ID            uint               `gorm:"primaryKey" json:"id"`
	UserID        uint               `json:"user_id"`
	ProblemID     uint               `json:"problem_id"`
	Language      string             `json:"language"`
	SourceCode    string             `json:"source_code"`
	Status        string             `json:"status"`
	ExecutionTime string             `json:"execution_time"`
	CreatedAt     time.Time          `json:"created_at"`
	Details       []SubmissionDetail `gorm:"foreignKey:SubmissionID;constraint:OnDelete:CASCADE" json:"details"`
}

type SubmissionDetail struct {
	ID              uint   `gorm:"primaryKey" json:"id"`
	SubmissionID    uint   `json:"submission_id"`
	TestCaseID      uint   `json:"test_case_id"`
	Status          string `json:"status"`
	ExecutionTime   string `json:"execution_time"`
	InputPreview    string `json:"input_preview"`
	OutputPreview   string `json:"output_preview"`
	ExpectedPreview string `json:"expected_preview"`
	IsSample        bool   `json:"is_sample"`
}
