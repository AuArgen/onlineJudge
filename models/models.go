package models

import "time"

// User represents a registered user
type User struct {
	ID        int
	GoogleID  string
	Email     string
	Name      string
	Role      string // 'user', 'admin'
	CreatedAt time.Time
}

// TestCase represents a single test case
type TestCase struct {
	ID             int
	ProblemID      int
	Input          string
	ExpectedOutput string
	IsSample       bool
}

// Problem defines the structure for a coding problem
type Problem struct {
	ID          int
	AuthorID    int
	AuthorName  string // For display
	Title       string
	Description string
	Samples     []TestCase
	TestCases   []TestCase
	TimeLimit   float64
	MemoryLimit int
	Visibility  string // 'private', 'link', 'public'
	Status      string // 'draft', 'pending_review', 'approved'
	CreatedAt   time.Time
}

// Submission represents the data sent by a user to be judged
type Submission struct {
	SourceCode  string
	LanguageID  int
	Stdin       string
	TimeLimit   float64
	MemoryLimit int
}

// SubmissionRecord stores the history of a submission
type SubmissionRecord struct {
	ID            int
	UserID        int
	UserName      string
	ProblemID     int
	ProblemTitle  string
	Language      string
	SourceCode    string
	Status        string
	ExecutionTime string
	Timestamp     time.Time
}

// GoogleUser holds user information from Google OAuth
type GoogleUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

// Language represents a programming language
type Language struct {
	ID   int
	Name string
}
