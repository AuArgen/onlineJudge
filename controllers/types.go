package controllers

import "onlineJudge/models"

// SolvedUser represents a user who solved a problem
type SolvedUser struct {
	UserName      string
	SubmissionID  uint
	ExecutionTime string
	Language      string
}

// SolvedListData holds data for the solved.html page
type SolvedListData struct {
	Problem           models.Problem
	SolvedList        []SolvedUser
	UserName          string
	CurrentUserSolved bool
	TotalCount        int64
	CurrentPage       int
	TotalPages        int
	HasPrev           bool
	HasNext           bool
	PrevPage          int
	NextPage          int
}

// ProblemData holds the problem info plus the solved count
type ProblemData struct {
	models.Problem
	SolvedCount int64
	IsOwner     bool
	IsSolved    bool // New field
}

// PageData holds all info needed for the problems page
type PageData struct {
	Problems    []ProblemData
	User        *models.User
	CurrentPage int
	TotalPages  int
	HasPrev     bool
	HasNext     bool
	PrevPage    int
	NextPage    int
	// Filter params
	Filter string
	Sort   string
	Search string
}

// SubmissionResponse for JSON API
type SubmissionResponse struct {
	SourceCode string                    `json:"source_code"`
	Details    []models.SubmissionDetail `json:"details"`
}
