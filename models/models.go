package models

import "time"

type TestCase struct {
	Input          string
	ExpectedOutput string
}

type Problem struct {
	ID          int
	Title       string
	Description string
	Samples     []TestCase
	TestCases   []TestCase
	TimeLimit   float64
	MemoryLimit int
}

type Submission struct {
	SourceCode  string  `json:"source_code"`
	LanguageID  int     `json:"language_id"`
	Stdin       string  `json:"stdin"`
	TimeLimit   float64
	MemoryLimit int
}

// SubmissionRecord - структура для сохранения истории попыток
type SubmissionRecord struct {
	ID            int
	UserName      string
	ProblemID     int
	ProblemTitle  string
	Language      string
	SourceCode    string // Added field to store the code
	Status        string
	ExecutionTime string
	Timestamp     time.Time
}

type Judge0Response struct {
	Stdout string `json:"stdout"`
	Stderr string `json:"stderr"`
	Status struct {
		Description string `json:"description"`
	} `json:"status"`
	CompileOutput string `json:"compile_output"`
}

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

type Language struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}
