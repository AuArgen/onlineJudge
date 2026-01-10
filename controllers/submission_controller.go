package controllers

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"onlineJudge/compiler"
	"onlineJudge/database"
	"onlineJudge/models"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

var (
	LastSubmission = make(map[string]time.Time)
	RateLimitMutex sync.Mutex
)

type Job struct {
	RecordID   uint
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

	var testCases []models.TestCase
	database.DB.Where("problem_id = ?", job.Problem.ID).Order("id asc").Find(&testCases)

	if len(testCases) == 0 {
		statusMessage = "Ошибка: Нет тестов"
	}

	for i, testCase := range testCases {
		job.Submission.Stdin = testCase.Input
		result, err := compiler.ExecuteCode(job.Submission)
		lastResult = result

		testStatus := "Accepted"
		if err != nil {
			testStatus = "System Error"
			statusMessage = "Системная ошибка: " + err.Error()
		} else if result.Stderr != "" {
			if strings.Contains(result.Stderr, "Execution Timed Out") {
				testStatus = "Time Limit Exceeded"
				if statusMessage == "Принято" {
					statusMessage = fmt.Sprintf("Превышен лимит времени на тесте %d", i+1)
				}
			} else {
				testStatus = "Runtime Error"
				if statusMessage == "Принято" {
					statusMessage = fmt.Sprintf("Ошибка выполнения на тесте %d", i+1)
				}
			}
		} else {
			actualOutput := strings.TrimSpace(result.Stdout)
			expectedOutput := strings.TrimSpace(testCase.ExpectedOutput)
			if actualOutput != expectedOutput {
				testStatus = "Wrong Answer"
				if statusMessage == "Принято" {
					statusMessage = fmt.Sprintf("Неправильный ответ на тесте %d", i+1)
				}
			}
		}

		inputPreview := testCase.Input
		if len(inputPreview) > 100 {
			inputPreview = inputPreview[:100] + "..."
		}
		outputPreview := result.Stdout
		if len(outputPreview) > 100 {
			outputPreview = outputPreview[:100] + "..."
		}
		expectedPreview := testCase.ExpectedOutput
		if len(expectedPreview) > 100 {
			expectedPreview = expectedPreview[:100] + "..."
		}

		detail := models.SubmissionDetail{
			SubmissionID:    job.RecordID,
			TestCaseID:      testCase.ID,
			Status:          testStatus,
			ExecutionTime:   result.ExecutionTime,
			InputPreview:    inputPreview,
			OutputPreview:   outputPreview,
			ExpectedPreview: expectedPreview,
			IsSample:        testCase.IsSample,
		}
		database.DB.Create(&detail)

		if testStatus != "Accepted" {
			break
		}
	}

	database.DB.Model(&models.SubmissionRecord{}).Where("id = ?", job.RecordID).Updates(map[string]interface{}{
		"status":         statusMessage,
		"execution_time": lastResult.ExecutionTime,
	})
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

	// We need to get problem details to save title
	var p models.Problem
	if err := database.DB.First(&p, problemID).Error; err != nil {
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

	record := models.SubmissionRecord{
		UserID:        user.ID,
		UserName:      user.Name,
		ProblemID:     p.ID,
		ProblemTitle:  p.Title,
		Language:      langName,
		SourceCode:    sourceCode,
		Status:        "В очереди...",
		ExecutionTime: "-",
	}

	if err := database.DB.Create(&record).Error; err != nil {
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
		RecordID:   record.ID,
		Submission: submission,
		Problem:    p,
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

	var p models.Problem
	if err := database.DB.First(&p, problemID).Error; err != nil {
		http.NotFound(w, r)
		return
	}

	var userHistory []models.SubmissionRecord
	database.DB.Where("problem_id = ? AND user_id = ?", problemID, user.ID).Order("id desc").Find(&userHistory)

	appName := os.Getenv("APP_NAME")
	if appName == "" {
		appName = "Online Judge"
	}

	data := HistoryData{
		AppName:    appName,
		Title:      "История: " + p.Title,
		ActivePage: "history",
		Problem:    p,
		History:    userHistory,
		User:       user,
	}

	tmpl := template.Must(template.ParseFiles("templates/history.html", "templates/header.html", "templates/footer.html"))
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
	database.DB.Select("title").First(&p, id)
	p.ID = uint(id)

	user := GetUser(r)
	currentUserSolved := false

	if user != nil {
		var count int64
		database.DB.Model(&models.SubmissionRecord{}).Where("problem_id = ? AND user_id = ? AND status = ?", id, user.ID, "Принято").Count(&count)
		if count > 0 {
			currentUserSolved = true
		}
	}

	query := `
		SELECT s.id as submission_id, u.name as user_name, s.execution_time, s.language
		FROM submissions s
		JOIN users u ON s.user_id = u.id
		INNER JOIN (
			SELECT user_id, MAX(id) as max_id
			FROM submissions
			WHERE problem_id = ? AND status = 'Принято'
			GROUP BY user_id
		) grouped_s ON s.id = grouped_s.max_id
		ORDER BY s.id DESC
	`

	var allSolved []SolvedUser
	database.DB.Raw(query, id).Scan(&allSolved)

	appName := os.Getenv("APP_NAME")
	if appName == "" {
		appName = "Online Judge"
	}

	data := SolvedListData{
		AppName:           appName,
		Title:             "Решения: " + p.Title,
		ActivePage:        "solved",
		Problem:           p,
		SolvedList:        allSolved,
		UserName:          GetUserName(r),
		CurrentUserSolved: currentUserSolved,
		TotalCount:        int64(len(allSolved)),
	}

	tmpl := template.Must(template.ParseFiles("templates/solved.html", "templates/header.html", "templates/footer.html"))
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
	if err := database.DB.First(&targetSubmission, submissionID).Error; err != nil {
		http.NotFound(w, r)
		return
	}

	hasSolved := false
	var count int64
	database.DB.Model(&models.SubmissionRecord{}).Where("problem_id = ? AND user_id = ? AND status = ?", targetSubmission.ProblemID, user.ID, "Принято").Count(&count)
	if count > 0 {
		hasSolved = true
	}

	if targetSubmission.UserID == user.ID || (hasSolved && targetSubmission.Status == "Принято") {
		// Fetch details
		var details []models.SubmissionDetail
		database.DB.Where("submission_id = ?", submissionID).Order("id asc").Find(&details)

		// Hide sensitive data if not sample
		for i := range details {
			var tc models.TestCase
			database.DB.First(&tc, details[i].TestCaseID)
			if !tc.IsSample {
				details[i].InputPreview = "Скрыто"
				details[i].OutputPreview = "Скрыто"
				details[i].ExpectedPreview = "Скрыто"
			}
		}

		response := SubmissionResponse{
			SourceCode: targetSubmission.SourceCode,
			Details:    details,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	} else {
		http.Error(w, "Forbidden", http.StatusForbidden)
	}
}
