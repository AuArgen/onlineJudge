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
	AppName           string
	Title             string
	ActivePage        string // Added
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
	IsSolved    bool
}

// PageData holds all info needed for the problems page
type PageData struct {
	AppName     string
	Title       string
	ActivePage  string // Added
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

// CommonData for simple pages like index, profile, etc.
type CommonData struct {
	AppName    string
	Title      string
	ActivePage string      // Added
	User       interface{} // Can be *models.User or nil
}

// ProfileData for profile page
type ProfileData struct {
	AppName          string
	Title            string
	ActivePage       string // Added
	User             *models.User
	MyProblems       []models.Problem
	SolvedCount      int64
	TotalSubmissions int64
}

// AdminData for admin page
type AdminData struct {
	AppName         string
	Title           string
	ActivePage      string // Added
	PendingProblems []models.Problem
	User            *models.User
}

// EditProblemData for edit page
type EditProblemData struct {
	AppName    string
	Title      string
	ActivePage string // Added
	Problem    models.Problem
	User       *models.User
	AccessList []string
}

// SolveData for solve page
type SolveData struct {
	AppName     string
	Title       string
	ActivePage  string // Added
	Problem     models.Problem
	Languages   []models.Language
	User        *models.User
	HasPending  bool
	ErrorMsg    string
	SecondsLeft int
	IsOwner     bool
}

// HistoryData for history page
type HistoryData struct {
	AppName    string
	Title      string
	ActivePage string // Added
	Problem    models.Problem
	History    []models.SubmissionRecord
	User       *models.User
}
