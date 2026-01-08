package handlers

import (
	"database/sql"
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

// --- Structs for Template Data ---

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

// ProblemData holds the problem info plus the solved count
type ProblemData struct {
	models.Problem
	SolvedCount int
	IsOwner     bool
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
}

// --- Data & Storage ---

var Languages = []models.Language{
	{ID: 71, Name: "Python (3.8+)"},
	{ID: 54, Name: "C++ (GCC)"},
	{ID: 62, Name: "Java (OpenJDK)"},
	{ID: 63, Name: "JavaScript (Node.js)"},
	{ID: 60, Name: "Go"},
}

var (
	LastSubmission = make(map[string]time.Time)
	RateLimitMutex sync.Mutex
)

// --- Queue System ---

type Job struct {
	RecordID   int64
	Submission models.Submission
	Problem    models.Problem
}

var SubmissionQueue = make(chan Job, 100)

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

	// Fetch test cases from DB
	rows, err := database.DB.Query("SELECT input, expected_output FROM test_cases WHERE problem_id = $1 ORDER BY id", job.Problem.ID)
	if err != nil {
		fmt.Println("Error fetching test cases:", err)
		return
	}
	defer rows.Close()

	var testCases []models.TestCase
	for rows.Next() {
		var tc models.TestCase
		rows.Scan(&tc.Input, &tc.ExpectedOutput)
		testCases = append(testCases, tc)
	}

	if len(testCases) == 0 {
		statusMessage = "Ошибка: Нет тестов"
	}

	for i, testCase := range testCases {
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

	_, err = database.DB.Exec("UPDATE submissions SET status = $1, execution_time = $2 WHERE id = $3",
		statusMessage, lastResult.ExecutionTime, job.RecordID)
	if err != nil {
		fmt.Println("Error updating submission:", err)
	}
}

// --- Handlers ---

// Helper to get problem from DB
func getProblem(id int) (*models.Problem, error) {
	var p models.Problem
	err := database.DB.QueryRow("SELECT id, title, description, time_limit, memory_limit, author_id, visibility, status FROM problems WHERE id = $1", id).
		Scan(&p.ID, &p.Title, &p.Description, &p.TimeLimit, &p.MemoryLimit, &p.AuthorID, &p.Visibility, &p.Status)
	if err != nil {
		return nil, err
	}

	// Get Samples
	rows, err := database.DB.Query("SELECT id, input, expected_output, is_sample FROM test_cases WHERE problem_id = $1 AND is_sample = true", id)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var tc models.TestCase
			rows.Scan(&tc.ID, &tc.Input, &tc.ExpectedOutput, &tc.IsSample)
			p.Samples = append(p.Samples, tc)
		}
	}
	return &p, nil
}

func HandleProblems(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)

	// Pagination
	pageStr := r.URL.Query().Get("page")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	itemsPerPage := 100
	offset := (page - 1) * itemsPerPage

	// Query problems (Public OR Own)
	var rows *sql.Rows
	var totalItems int

	// Count total
	countQuery := "SELECT COUNT(*) FROM problems WHERE status = 'approved'"
	if user != nil {
		countQuery += fmt.Sprintf(" OR author_id = %d", user.ID)
	}
	database.DB.QueryRow(countQuery).Scan(&totalItems)

	// Fetch items
	query := "SELECT id, title, author_id, status FROM problems WHERE status = 'approved'"
	if user != nil {
		query += fmt.Sprintf(" OR author_id = %d", user.ID)
	}
	query += fmt.Sprintf(" ORDER BY id ASC LIMIT %d OFFSET %d", itemsPerPage, offset)

	rows, err = database.DB.Query(query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var displayProblems []ProblemData

	for rows.Next() {
		var p models.Problem
		rows.Scan(&p.ID, &p.Title, &p.AuthorID, &p.Status)

		// Count solved
		var count int
		database.DB.QueryRow("SELECT COUNT(DISTINCT user_id) FROM submissions WHERE problem_id = $1 AND status = 'Принято'", p.ID).Scan(&count)

		isOwner := user != nil && user.ID == p.AuthorID
		displayProblems = append(displayProblems, ProblemData{Problem: p, SolvedCount: count, IsOwner: isOwner})
	}

	totalPages := (totalItems + itemsPerPage - 1) / itemsPerPage

	data := PageData{
		Problems:    displayProblems,
		User:        user,
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

func HandleCreateProblem(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil {
		http.Redirect(w, r, "/auth/google/login", http.StatusTemporaryRedirect)
		return
	}

	if r.Method == http.MethodPost {
		title := r.FormValue("title")
		description := r.FormValue("description")
		timeLimit, _ := strconv.ParseFloat(r.FormValue("time_limit"), 64)
		memoryLimit, _ := strconv.Atoi(r.FormValue("memory_limit"))

		// Default to private draft
		var problemID int
		err := database.DB.QueryRow("INSERT INTO problems (author_id, title, description, time_limit, memory_limit, visibility, status) VALUES ($1, $2, $3, $4, $5, 'private', 'draft') RETURNING id",
			user.ID, title, description, timeLimit, memoryLimit).Scan(&problemID)

		if err != nil {
			http.Error(w, "Error creating problem: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Add Sample Test Case
		sampleInput := r.FormValue("sample_input")
		sampleOutput := r.FormValue("sample_output")
		if sampleInput != "" {
			database.DB.Exec("INSERT INTO test_cases (problem_id, input, expected_output, is_sample) VALUES ($1, $2, $3, true)",
				problemID, sampleInput, sampleOutput)
		}

		http.Redirect(w, r, fmt.Sprintf("/edit-problem?id=%d", problemID), http.StatusSeeOther)
		return
	}

	tmpl := template.Must(template.ParseFiles("templates/create_problem.html"))
	tmpl.Execute(w, user)
}

func HandleEditProblem(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil {
		http.Redirect(w, r, "/auth/google/login", http.StatusTemporaryRedirect)
		return
	}

	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid problem ID", http.StatusBadRequest)
		return
	}

	p, err := getProblem(id)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	// Check ownership
	if p.AuthorID != user.ID && user.Role != "admin" {
		http.Error(w, "Access Denied", http.StatusForbidden)
		return
	}

	if r.Method == http.MethodPost {
		// If approved, prevent editing (unless admin)
		if p.Status == "approved" && user.Role != "admin" {
			http.Error(w, "Cannot edit approved problem", http.StatusForbidden)
			return
		}

		// Update Problem Details
		title := r.FormValue("title")
		description := r.FormValue("description")
		timeLimit, _ := strconv.ParseFloat(r.FormValue("time_limit"), 64)
		memoryLimit, _ := strconv.Atoi(r.FormValue("memory_limit"))
		status := r.FormValue("status")

		// Validate status transition
		if status == "pending_review" {
			// Change visibility to private while reviewing
			_, err := database.DB.Exec("UPDATE problems SET title=$1, description=$2, time_limit=$3, memory_limit=$4, status=$5, visibility='private' WHERE id=$6",
				title, description, timeLimit, memoryLimit, status, id)
			if err != nil {
				http.Error(w, "Error updating problem: "+err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			// Draft
			_, err := database.DB.Exec("UPDATE problems SET title=$1, description=$2, time_limit=$3, memory_limit=$4, status=$5 WHERE id=$6",
				title, description, timeLimit, memoryLimit, status, id)
			if err != nil {
				http.Error(w, "Error updating problem: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		// Add New Test Case
		newInput := r.FormValue("new_input")
		newOutput := r.FormValue("new_output")
		isSample := r.FormValue("is_sample") == "on"

		if newInput != "" {
			_, err = database.DB.Exec("INSERT INTO test_cases (problem_id, input, expected_output, is_sample) VALUES ($1, $2, $3, $4)",
				id, newInput, newOutput, isSample)
			if err != nil {
				http.Error(w, "Error adding test case: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		http.Redirect(w, r, fmt.Sprintf("/edit-problem?id=%d", id), http.StatusSeeOther)
		return
	}

	// Fetch all test cases for editing
	rows, err := database.DB.Query("SELECT id, input, expected_output, is_sample FROM test_cases WHERE problem_id = $1 ORDER BY id", id)
	var allTestCases []models.TestCase
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var tc models.TestCase
			rows.Scan(&tc.ID, &tc.Input, &tc.ExpectedOutput, &tc.IsSample)
			allTestCases = append(allTestCases, tc)
		}
	}
	p.TestCases = allTestCases

	data := struct {
		Problem models.Problem
		User    *models.User
	}{
		Problem: *p,
		User:    user,
	}

	tmpl := template.Must(template.ParseFiles("templates/edit_problem.html"))
	tmpl.Execute(w, data)
}

func HandleDeleteProblem(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := r.URL.Query().Get("id")
	id, _ := strconv.Atoi(idStr)

	p, err := getProblem(id)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	// Check ownership
	if p.AuthorID != user.ID && user.Role != "admin" {
		http.Error(w, "Access Denied", http.StatusForbidden)
		return
	}

	// Prevent deleting if approved (unless admin)
	if p.Status == "approved" && user.Role != "admin" {
		http.Error(w, "Cannot delete approved problem", http.StatusForbidden)
		return
	}

	// Delete related data first (foreign keys)
	database.DB.Exec("DELETE FROM test_cases WHERE problem_id = $1", id)
	database.DB.Exec("DELETE FROM submissions WHERE problem_id = $1", id)
	database.DB.Exec("DELETE FROM problems WHERE id = $1", id)

	http.Redirect(w, r, "/profile", http.StatusSeeOther)
}

func HandleDeleteTestCase(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	tcID, _ := strconv.Atoi(r.URL.Query().Get("id"))
	pID, _ := strconv.Atoi(r.URL.Query().Get("problem_id"))

	// Verify ownership
	var authorID int
	var status string
	err := database.DB.QueryRow("SELECT author_id, status FROM problems WHERE id = $1", pID).Scan(&authorID, &status)

	if err != nil || (authorID != user.ID && user.Role != "admin") {
		http.Error(w, "Access Denied", http.StatusForbidden)
		return
	}

	// Prevent deleting tests if approved
	if status == "approved" && user.Role != "admin" {
		http.Error(w, "Cannot delete tests from approved problem", http.StatusForbidden)
		return
	}

	database.DB.Exec("DELETE FROM test_cases WHERE id = $1", tcID)
	http.Redirect(w, r, fmt.Sprintf("/edit-problem?id=%d", pID), http.StatusSeeOther)
}

func HandleSolve(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid problem ID", http.StatusBadRequest)
		return
	}

	p, err := getProblem(id)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	user := GetUser(r)

	// Check visibility
	if p.Visibility == "private" {
		if user == nil || user.ID != p.AuthorID {
			http.Error(w, "Access Denied", http.StatusForbidden)
			return
		}
	}

	hasPending := false
	if user != nil {
		var count int
		database.DB.QueryRow("SELECT COUNT(*) FROM submissions WHERE problem_id = $1 AND user_id = $2 AND status = 'В очереди...'", id, user.ID).Scan(&count)
		if count > 0 {
			hasPending = true
		}
	}

	secondsStr := r.URL.Query().Get("seconds")
	secondsLeft, _ := strconv.Atoi(secondsStr)

	data := struct {
		Problem     models.Problem
		Languages   []models.Language
		User        *models.User
		HasPending  bool
		ErrorMsg    string
		SecondsLeft int
		IsOwner     bool
	}{
		Problem:     *p,
		Languages:   Languages,
		User:        user,
		HasPending:  hasPending,
		ErrorMsg:    r.URL.Query().Get("error"),
		SecondsLeft: secondsLeft,
		IsOwner:     user != nil && user.ID == p.AuthorID,
	}

	tmpl := template.Must(template.ParseFiles("templates/solve.html"))
	tmpl.Execute(w, data)
}

func HandleSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	user := GetUser(r)
	if user == nil {
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
	lastTime, exists := LastSubmission[user.Email]
	if exists && time.Since(lastTime) < 30*time.Second {
		RateLimitMutex.Unlock()
		remaining := 30*time.Second - time.Since(lastTime)
		http.Redirect(w, r, fmt.Sprintf("/solve?id=%s&error=wait&seconds=%d", problemIDStr, int(remaining.Seconds())), http.StatusSeeOther)
		return
	}
	LastSubmission[user.Email] = time.Now()
	RateLimitMutex.Unlock()

	problemID, _ := strconv.Atoi(problemIDStr)
	languageID, _ := strconv.Atoi(r.FormValue("language_id"))

	p, err := getProblem(problemID)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	langName := "Unknown"
	for _, l := range Languages {
		if l.ID == languageID {
			langName = l.Name
			break
		}
	}

	var recordID int64
	err = database.DB.QueryRow("INSERT INTO submissions (user_id, user_name, problem_id, problem_title, language, source_code, status, execution_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
		user.ID, user.Name, p.ID, p.Title, langName, sourceCode, "В очереди...", "-").Scan(&recordID)

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
		Problem:    *p,
	}
	SubmissionQueue <- job

	http.Redirect(w, r, fmt.Sprintf("/history?id=%d", p.ID), http.StatusSeeOther)
}

func HandleHistory(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil {
		http.Redirect(w, r, "/auth/google/login", http.StatusTemporaryRedirect)
		return
	}

	idStr := r.URL.Query().Get("id")
	problemID, _ := strconv.Atoi(idStr)

	p, err := getProblem(problemID)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	rows, err := database.DB.Query("SELECT id, status, language, execution_time, source_code, timestamp FROM submissions WHERE problem_id = $1 AND user_id = $2 ORDER BY id DESC", problemID, user.ID)
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
		Problem models.Problem
		History []models.SubmissionRecord
		User    *models.User
	}{
		Problem: *p,
		History: userHistory,
		User:    user,
	}

	tmpl := template.Must(template.ParseFiles("templates/history.html"))
	tmpl.Execute(w, data)
}

func HandleSolvedList(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid problem ID", http.StatusBadRequest)
		return
	}

	var p models.Problem
	// Simple fetch for title
	database.DB.QueryRow("SELECT title FROM problems WHERE id = $1", id).Scan(&p.Title)
	p.ID = id

	user := GetUser(r)
	currentUserSolved := false

	if user != nil {
		var count int
		database.DB.QueryRow("SELECT COUNT(*) FROM submissions WHERE problem_id = $1 AND user_id = $2 AND status = 'Принято'", id, user.ID).Scan(&count)
		if count > 0 {
			currentUserSolved = true
		}
	}

	query := `
		SELECT s.id, u.name, s.execution_time, s.language
		FROM submissions s
		JOIN users u ON s.user_id = u.id
		INNER JOIN (
			SELECT user_id, MAX(id) as max_id
			FROM submissions
			WHERE problem_id = $1 AND status = 'Принято'
			GROUP BY user_id
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

	// Pagination logic (simplified)
	data := SolvedListData{
		Problem:           p,
		SolvedList:        allSolved,
		UserName:          GetUserName(r),
		CurrentUserSolved: currentUserSolved,
		TotalCount:        len(allSolved),
	}

	tmpl := template.Must(template.ParseFiles("templates/solved.html"))
	tmpl.Execute(w, data)
}

func HandleViewSubmission(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := r.URL.Query().Get("id")
	submissionID, _ := strconv.Atoi(idStr)

	var targetSubmission models.SubmissionRecord
	err := database.DB.QueryRow("SELECT id, user_id, problem_id, source_code, status FROM submissions WHERE id = $1", submissionID).
		Scan(&targetSubmission.ID, &targetSubmission.UserID, &targetSubmission.ProblemID, &targetSubmission.SourceCode, &targetSubmission.Status)

	if err != nil {
		http.NotFound(w, r)
		return
	}

	hasSolved := false
	var count int
	database.DB.QueryRow("SELECT COUNT(*) FROM submissions WHERE problem_id = $1 AND user_id = $2 AND status = 'Принято'", targetSubmission.ProblemID, user.ID).Scan(&count)
	if count > 0 {
		hasSolved = true
	}

	if targetSubmission.UserID == user.ID || (hasSolved && targetSubmission.Status == "Принято") {
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte(targetSubmission.SourceCode))
	} else {
		http.Error(w, "Forbidden", http.StatusForbidden)
	}
}
