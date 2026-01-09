package models

import (
	"time"
)

// User represents a registered user
type User struct {
	ID          uint   `gorm:"primaryKey"`
	GoogleID    string `gorm:"unique"`
	Email       string `gorm:"unique"`
	Name        string
	Role        string `gorm:"default:user"` // 'user', 'admin'
	CreatedAt   time.Time
	Problems    []Problem          `gorm:"foreignKey:AuthorID"`
	Submissions []SubmissionRecord `gorm:"foreignKey:UserID"`
}

// Problem defines the structure for a coding problem
type Problem struct {
	ID          uint `gorm:"primaryKey"`
	AuthorID    uint
	Author      User `gorm:"foreignKey:AuthorID"`
	Title       string
	Description string
	TimeLimit   float64
	MemoryLimit int
	Visibility  string `gorm:"default:private"` // 'private', 'link', 'public'
	Status      string `gorm:"default:draft"`   // 'draft', 'pending_review', 'approved'
	CreatedAt   time.Time

	// Samples are not a separate relation in DB, but a filtered subset of TestCases.
	// We ignore it in GORM and populate it manually.
	Samples []TestCase `gorm:"-"`

	TestCases   []TestCase         `gorm:"foreignKey:ProblemID;constraint:OnDelete:CASCADE"`
	Submissions []SubmissionRecord `gorm:"foreignKey:ProblemID;constraint:OnDelete:CASCADE"`
	AccessList  []ProblemAccess    `gorm:"foreignKey:ProblemID;constraint:OnDelete:CASCADE"`
}

// TestCase represents a single test case
type TestCase struct {
	ID             uint `gorm:"primaryKey"`
	ProblemID      uint
	Input          string
	ExpectedOutput string
	IsSample       bool `gorm:"default:false"`
}

// ProblemAccess stores which users have explicit access to private problems
type ProblemAccess struct {
	ID        uint `gorm:"primaryKey"`
	ProblemID uint
	UserEmail string
	CreatedAt time.Time
}

// Submission (Input DTO) - Not a DB model, used for passing data to compiler
type Submission struct {
	SourceCode  string
	LanguageID  int
	Stdin       string
	TimeLimit   float64
	MemoryLimit int
}

// SubmissionRecord stores the history of a submission in the database
type SubmissionRecord struct {
	ID            uint `gorm:"primaryKey"`
	UserID        uint
	User          User   `gorm:"foreignKey:UserID"`
	UserName      string // Denormalized for easier access, or just use User.Name
	ProblemID     uint
	Problem       Problem `gorm:"foreignKey:ProblemID"`
	ProblemTitle  string  // Denormalized
	Language      string
	SourceCode    string
	Status        string
	ExecutionTime string
	Timestamp     time.Time          `gorm:"autoCreateTime"`
	Details       []SubmissionDetail `gorm:"foreignKey:SubmissionID;constraint:OnDelete:CASCADE"`
}

// SubmissionDetail stores the result of a single test case run
type SubmissionDetail struct {
	ID              uint `gorm:"primaryKey"`
	SubmissionID    uint
	TestCaseID      uint
	Status          string
	ExecutionTime   string
	MemoryUsed      string
	InputPreview    string
	OutputPreview   string
	ExpectedPreview string
	IsSample        bool `gorm:"default:false"` // Added field to track if it was a sample test
}

// GoogleUser holds user information from Google OAuth (DTO)
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

// Language represents a programming language (DTO)
type Language struct {
	ID   int
	Name string
}
