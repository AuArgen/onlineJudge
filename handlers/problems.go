package handlers

import (
	"fmt"
	"html/template"
	"net/http"
	"onlineJudge/compiler"
	"onlineJudge/database"
	"onlineJudge/models"
	"strconv"
	"strings"
	"sync"
	"time"
)

// --- Data & Storage ---

var Problems = []models.Problem{
	{
		ID:           1,
		Title:        "Сумма двух чисел",
		Description:  "Напишите программу, которая считывает два целых числа A и B и выводит их сумму.",
		TimeLimit:    1.0,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"3 5", "8"},
			{"10 20", "30"},
		},
		TestCases: []models.TestCase{
			{"3 5", "8"},
			{"10 20", "30"},
			{"-5 5", "0"},
			{"100 200", "300"},
			{"-10 -20", "-30"},
		},
	},
	{
		ID:           2,
		Title:        "Четное или нечетное",
		Description:  "Дано целое число N. Если оно четное, выведите 'EVEN', иначе 'ODD'.",
		TimeLimit:    0.5,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"4", "EVEN"},
			{"3", "ODD"},
		},
		TestCases: []models.TestCase{
			{"4", "EVEN"},
			{"3", "ODD"},
			{"0", "EVEN"},
			{"-2", "EVEN"},
			{"101", "ODD"},
			{"-101", "ODD"},
		},
	},
	{
		ID:           3,
		Title:        "Максимум из трех",
		Description:  "Даны три целых числа. Найдите максимальное из них.",
		TimeLimit:    1.0,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"1 5 3", "5"},
			{"10 20 15", "20"},
		},
		TestCases: []models.TestCase{
			{"1 5 3", "5"},
			{"10 10 10", "10"},
			{"-1 -5 -3", "-1"},
			{"100 20 5", "100"},
			{"5 20 100", "100"},
		},
	},
	{
		ID:           4,
		Title:        "Факториал",
		Description:  "Вычислите факториал числа N (0 <= N <= 10).",
		TimeLimit:    1.0,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"5", "120"},
			{"3", "6"},
		},
		TestCases: []models.TestCase{
			{"5", "120"},
			{"0", "1"},
			{"1", "1"},
			{"3", "6"},
			{"10", "3628800"},
		},
	},
	{
		ID:           5,
		Title:        "Квадрат числа",
		Description:  "Считайте число N и выведите его квадрат.",
		TimeLimit:    0.5,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"5", "25"},
			{"2", "4"},
		},
		TestCases: []models.TestCase{
			{"5", "25"},
			{"2", "4"},
			{"10", "100"},
			{"-5", "25"},
			{"0", "0"},
		},
	},
	{
		ID:           6,
		Title:        "Сумма от 1 до N",
		Description:  "Вычислите сумму всех целых чисел от 1 до N.",
		TimeLimit:    1.0,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"5", "15"},
			{"3", "6"},
		},
		TestCases: []models.TestCase{
			{"5", "15"},
			{"1", "1"},
			{"10", "55"},
			{"100", "5050"},
			{"3", "6"},
		},
	},
	{
		ID:           7,
		Title:        "Последняя цифра",
		Description:  "Дано число N. Выведите его последнюю цифру.",
		TimeLimit:    0.5,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"123", "3"},
			{"5", "5"},
		},
		TestCases: []models.TestCase{
			{"123", "3"},
			{"5", "5"},
			{"10", "0"},
			{"123456789", "9"},
			{"1001", "1"},
		},
	},
	{
		ID:           8,
		Title:        "Количество цифр",
		Description:  "Дано положительное число N. Выведите количество цифр в нем.",
		TimeLimit:    0.5,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"123", "3"},
			{"5", "1"},
		},
		TestCases: []models.TestCase{
			{"123", "3"},
			{"5", "1"},
			{"1000", "4"},
			{"99", "2"},
			{"1234567890", "10"},
		},
	},
	{
		ID:           9,
		Title:        "Делится ли на 3?",
		Description:  "Дано число N. Если оно делится на 3, выведите 'YES', иначе 'NO'.",
		TimeLimit:    0.5,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"9", "YES"},
			{"10", "NO"},
		},
		TestCases: []models.TestCase{
			{"9", "YES"},
			{"10", "NO"},
			{"3", "YES"},
			{"0", "YES"},
			{"123", "YES"},
			{"124", "NO"},
		},
	},
	{
		ID:           10,
		Title:        "Приветствие",
		Description:  "Считайте имя (строка) и выведите 'Hello, [Имя]!'",
		TimeLimit:    0.5,
		MemoryLimit:  256, // Changed to 256MB
		Samples: []models.TestCase{
			{"World", "Hello, World!"},
			{"Alice", "Hello, Alice!"},
		},
		TestCases: []models.TestCase{
			{"World", "Hello, World!"},
			{"Alice", "Hello, Alice!"},
			{"Bob", "Hello, Bob!"},
			{"Go", "Hello, Go!"},
			{"Python", "Hello, Python!"},
		},
	},
}

var Languages = []models.Language{
	{ID: 71, Name: "Python (3.8+)"},
	{ID: 54, Name: "C++ (GCC)"},
	{ID: 62, Name: "Java (OpenJDK)"},
	{ID: 63, Name: "JavaScript (Node.js)"},
	{ID: 60, Name: "Go"},
}

// Global storage
var (
	LastSubmission = make(map[string]time.Time)
	RateLimitMutex sync.Mutex // Protects LastSubmission
)

// --- Queue System ---

type Job struct {
	RecordID   int64 // Changed to int64 for DB ID
	Submission models.Submission
	Problem    models.Problem
}

// Buffered channel for the queue
var SubmissionQueue = make(chan Job, 100)

// StartWorker starts the background workers that process submissions
func StartWorker() {
	numWorkers := 4
	fmt.Printf("Starting %d workers...\n", numWorkers)

	for i := 0; i < numWorkers; i++ {
		go func(workerID int) {
			fmt.Printf("Worker %d started\n", workerID)
			for job := range SubmissionQueue {
				processJob(job)
			}
		}(i + 1)
	}
}

func processJob(job Job) {
	time.Sleep(1 * time.Second)

	statusMessage := "Принято"
	var lastResult compiler.ExecutionResult

	for i, testCase := range job.Problem.TestCases {
		job.Submission.Stdin = testCase.Input
		result, err := compiler.ExecuteCode(job.Submission)
		lastResult = result

		if err != nil {
			statusMessage = "Системная ошибка: " + err.Error()
			break
		}

		if result.Stderr != "" {
			if strings.Contains(result.Stderr, "Execution Timed Out") {
				statusMessage = fmt.Sprintf("Превышен лимит времени на тесте %d", i+1)
			} else {
				statusMessage = fmt.Sprintf("Ошибка выполнения на тесте %d", i+1)
			}
			break
		}

		actualOutput := strings.TrimSpace(result.Stdout)
		expectedOutput := strings.TrimSpace(testCase.ExpectedOutput)

		if actualOutput != expectedOutput {
			statusMessage = fmt.Sprintf("Неправильный ответ на тесте %d", i+1)
			break
		}
	}

	// Update the record in DB (Postgres uses $1, $2, etc.)
	_, err := database.DB.Exec("UPDATE submissions SET status = $1, execution_time = $2 WHERE id = $3",
		statusMessage, lastResult.ExecutionTime, job.RecordID)
	if err != nil {
		fmt.Println("Error updating submission:", err)
	}
}

// --- Handlers ---

// ProblemData holds the problem info plus the solved count
type ProblemData struct {
	models.Problem
	SolvedCount int
}

// PageData holds all info needed for the problems page
type PageData struct {
	Problems    []ProblemData
	UserName    string
	CurrentPage int
	TotalPages  int
	HasPrev     bool
	HasNext     bool
	PrevPage    int
	NextPage    int
}

func HandleProblems(w http.ResponseWriter, r *http.Request) {
	userName := GetUserName(r)

	// 1. Calculate Solved Counts using DB
	solvedCounts := make(map[int]int)
	rows, err := database.DB.Query("SELECT problem_id, COUNT(DISTINCT user_name) FROM submissions WHERE status = 'Принято' GROUP BY problem_id")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var pID, count int
			rows.Scan(&pID, &count)
			solvedCounts[pID] = count
		}
	}

	// 2. Pagination Logic
	pageStr := r.URL.Query().Get("page")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	itemsPerPage := 100
	totalItems := len(Problems)
	totalPages := (totalItems + itemsPerPage - 1) / itemsPerPage

	if page > totalPages && totalPages > 0 {
		page = totalPages
	}

	start := (page - 1) * itemsPerPage
	end := start + itemsPerPage
	if end > totalItems {
		end = totalItems
	}

	// 3. Prepare Data Slice
	var displayProblems []ProblemData
	if start < totalItems {
		for _, p := range Problems[start:end] {
			count := solvedCounts[p.ID]
			displayProblems = append(displayProblems, ProblemData{
				Problem:     p,
				SolvedCount: count,
			})
		}
	}

	data := PageData{
		Problems:    displayProblems,
		UserName:    userName,
		CurrentPage: page,
		TotalPages:  totalPages,
		HasPrev:     page > 1,
		HasNext:     page < totalPages,
		PrevPage:    page - 1,
		NextPage:    page + 1,
	}

	tmpl := template.Must(template.ParseFiles("templates/problems.html"))
	tmpl.Execute(w, data)
}

// Helper struct for solved list
type SolvedUser struct {
	UserName      string
	SubmissionID  int
	ExecutionTime string
	Language      string
}

// SolvedListData holds data for the solved.html page
type SolvedListData struct {
	Problem           models.Problem
	SolvedList        []SolvedUser
	UserName          string
	CurrentUserSolved bool
	TotalCount        int
	CurrentPage       int
	TotalPages        int
	HasPrev           bool
	HasNext           bool
	PrevPage          int
	NextPage          int
}

func HandleSolvedList(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid problem ID", http.StatusBadRequest)
		return
	}

	var p models.Problem
	found := false
	for _, problem := range Problems {
		if problem.ID == id {
			p = problem
			found = true
			break
		}
	}

	if !found {
		http.NotFound(w, r)
		return
	}

	userName := GetUserName(r)
	currentUserSolved := false

	// Check if current user solved it
	if userName != "" {
		var count int
		err := database.DB.QueryRow("SELECT COUNT(*) FROM submissions WHERE problem_id = $1 AND user_name = $2 AND status = 'Принято'", id, userName).Scan(&count)
		if err == nil && count > 0 {
			currentUserSolved = true
		}
	}

	// Get solved list from DB (Latest accepted submission per user)
	// Postgres specific query
	query := `
		SELECT s.id, s.user_name, s.execution_time, s.language
		FROM submissions s
		INNER JOIN (
			SELECT user_name, MAX(id) as max_id
			FROM submissions
			WHERE problem_id = $1 AND status = 'Принято'
			GROUP BY user_name
		) grouped_s ON s.id = grouped_s.max_id
		ORDER BY s.id DESC
	`
	
	rows, err := database.DB.Query(query, id)
	var allSolved []SolvedUser
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var u SolvedUser
			rows.Scan(&u.SubmissionID, &u.UserName, &u.ExecutionTime, &u.Language)
			allSolved = append(allSolved, u)
		}
	}

	// Pagination
	pageStr := r.URL.Query().Get("page")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	itemsPerPage := 100
	totalItems := len(allSolved)
	totalPages := (totalItems + itemsPerPage - 1) / itemsPerPage

	if page > totalPages && totalPages > 0 {
		page = totalPages
	}

	start := (page - 1) * itemsPerPage
	end := start + itemsPerPage
	if end > totalItems {
		end = totalItems
	}

	var displaySolved []SolvedUser
	if start < totalItems {
		displaySolved = allSolved[start:end]
	}

	data := SolvedListData{
		Problem:           p,
		SolvedList:        displaySolved,
		UserName:          userName,
		CurrentUserSolved: currentUserSolved,
		TotalCount:        totalItems,
		CurrentPage:       page,
		TotalPages:        totalPages,
		HasPrev:           page > 1,
		HasNext:           page < totalPages,
		PrevPage:          page - 1,
		NextPage:          page + 1,
	}

	tmpl := template.Must(template.ParseFiles("templates/solved.html"))
	tmpl.Execute(w, data)
}

func HandleSolve(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid problem ID", http.StatusBadRequest)
		return
	}

	var p models.Problem
	found := false
	for _, problem := range Problems {
		if problem.ID == id {
			p = problem
			found = true
			break
		}
	}

	if !found {
		http.NotFound(w, r)
		return
	}

	userName := GetUserName(r)
	
	hasPending := false
	if userName != "" {
		var count int
		err := database.DB.QueryRow("SELECT COUNT(*) FROM submissions WHERE problem_id = $1 AND user_name = $2 AND status = 'В очереди...'", id, userName).Scan(&count)
		if err == nil && count > 0 {
			hasPending = true
		}
	}

	secondsStr := r.URL.Query().Get("seconds")
	secondsLeft, _ := strconv.Atoi(secondsStr)

	data := struct {
		Problem     models.Problem
		Languages   []models.Language
		UserName    string
		HasPending  bool
		ErrorMsg    string
		SecondsLeft int
	}{
		Problem:     p,
		Languages:   Languages,
		UserName:    userName,
		HasPending:  hasPending,
		ErrorMsg:    r.URL.Query().Get("error"),
		SecondsLeft: secondsLeft,
	}

	tmpl := template.Must(template.ParseFiles("templates/solve.html"))
	tmpl.Execute(w, data)
}

func HandleViewSubmission(w http.ResponseWriter, r *http.Request) {
	userName := GetUserName(r)
	if userName == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := r.URL.Query().Get("id")
	submissionID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid submission ID", http.StatusBadRequest)
		return
	}

	var targetSubmission models.SubmissionRecord
	err = database.DB.QueryRow("SELECT id, user_name, problem_id, source_code, status FROM submissions WHERE id = $1", submissionID).
		Scan(&targetSubmission.ID, &targetSubmission.UserName, &targetSubmission.ProblemID, &targetSubmission.SourceCode, &targetSubmission.Status)

	if err != nil {
		http.NotFound(w, r)
		return
	}
	
	hasSolved := false
	var count int
	err = database.DB.QueryRow("SELECT COUNT(*) FROM submissions WHERE problem_id = $1 AND user_name = $2 AND status = 'Принято'", targetSubmission.ProblemID, userName).Scan(&count)
	if err == nil && count > 0 {
		hasSolved = true
	}

	if targetSubmission.UserName == userName || (hasSolved && targetSubmission.Status == "Принято") {
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte(targetSubmission.SourceCode))
	} else {
		http.Error(w, "Forbidden: You must solve this problem first to view other solutions.", http.StatusForbidden)
	}
}

func HandleHistory(w http.ResponseWriter, r *http.Request) {
	userName := GetUserName(r)
	if userName == "" {
		http.Redirect(w, r, "/auth/google/login", http.StatusTemporaryRedirect)
		return
	}

	idStr := r.URL.Query().Get("id")
	problemID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid problem ID", http.StatusBadRequest)
		return
	}

	var p models.Problem
	found := false
	for _, problem := range Problems {
		if problem.ID == problemID {
			p = problem
			found = true
			break
		}
	}

	if !found {
		http.NotFound(w, r)
		return
	}

	// Fetch history from DB
	rows, err := database.DB.Query("SELECT id, status, language, execution_time, source_code, timestamp FROM submissions WHERE problem_id = $1 AND user_name = $2 ORDER BY id DESC", problemID, userName)
	var userHistory []models.SubmissionRecord
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var rec models.SubmissionRecord
			rows.Scan(&rec.ID, &rec.Status, &rec.Language, &rec.ExecutionTime, &rec.SourceCode, &rec.Timestamp)
			userHistory = append(userHistory, rec)
		}
	}

	data := struct {
		Problem  models.Problem
		History  []models.SubmissionRecord
		UserName string
	}{
		Problem:  p,
		History:  userHistory,
		UserName: userName,
	}

	tmpl := template.Must(template.ParseFiles("templates/history.html"))
	tmpl.Execute(w, data)
}

func HandleSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userName := GetUserName(r)
	if userName == "" {
		http.Redirect(w, r, "/auth/google/login", http.StatusTemporaryRedirect)
		return
	}

	problemIDStr := r.FormValue("problem_id")
	
	sourceCode := strings.TrimSpace(r.FormValue("source_code"))
	if sourceCode == "" {
		http.Redirect(w, r, fmt.Sprintf("/solve?id=%s&error=empty", problemIDStr), http.StatusSeeOther)
		return
	}

	RateLimitMutex.Lock()
	lastTime, exists := LastSubmission[userName]
	if exists && time.Since(lastTime) < 30*time.Second {
		RateLimitMutex.Unlock()
		remaining := 30*time.Second - time.Since(lastTime)
		secondsLeft := int(remaining.Seconds())
		http.Redirect(w, r, fmt.Sprintf("/solve?id=%s&error=wait&seconds=%d", problemIDStr, secondsLeft), http.StatusSeeOther)
		return
	}
	LastSubmission[userName] = time.Now()
	RateLimitMutex.Unlock()

	problemID, _ := strconv.Atoi(problemIDStr)
	languageIDStr := r.FormValue("language_id")
	languageID, _ := strconv.Atoi(languageIDStr)

	var p models.Problem
	for _, problem := range Problems {
		if problem.ID == problemID {
			p = problem
			break
		}
	}

	langName := "Unknown"
	for _, l := range Languages {
		if l.ID == languageID {
			langName = l.Name
			break
		}
	}

	// Insert into DB
	var recordID int64
	err := database.DB.QueryRow("INSERT INTO submissions (user_name, problem_id, problem_title, language, source_code, status, execution_time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
		userName, p.ID, p.Title, langName, sourceCode, "В очереди...", "-").Scan(&recordID)
	
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	submission := models.Submission{
		SourceCode:  sourceCode,
		LanguageID:  languageID,
		TimeLimit:   p.TimeLimit,
		MemoryLimit: p.MemoryLimit,
	}

	job := Job{
		RecordID:   recordID,
		Submission: submission,
		Problem:    p,
	}
	SubmissionQueue <- job

	http.Redirect(w, r, fmt.Sprintf("/history?id=%d", p.ID), http.StatusSeeOther)
}
