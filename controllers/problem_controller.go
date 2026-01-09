package controllers

import (
	"fmt"
	"html/template"
	"net/http"
	"onlineJudge/database"
	"onlineJudge/models"
	"strconv"
	"strings"
)

var Languages = []models.Language{
	{ID: 71, Name: "Python (3.8+)"},
	{ID: 54, Name: "C++ (GCC)"},
	{ID: 62, Name: "Java (OpenJDK)"},
	{ID: 63, Name: "JavaScript (Node.js)"},
	{ID: 60, Name: "Go"},
}

// Helper to get problem from DB
func getProblem(id int) (*models.Problem, error) {
	var p models.Problem
	// Preload Samples
	result := database.DB.Preload("Samples", "is_sample = ?", true).First(&p, id)
	if result.Error != nil {
		return nil, result.Error
	}
	// Manually load samples (if Preload fails or for consistency with previous fix)
	var samples []models.TestCase
	database.DB.Where("problem_id = ? AND is_sample = ?", id, true).Find(&samples)
	p.Samples = samples
	return &p, nil
}

func HandleProblems(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	
	// Params
	pageStr := r.URL.Query().Get("page")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	itemsPerPage := 100
	offset := (page - 1) * itemsPerPage

	filter := r.URL.Query().Get("filter")
	sort := r.URL.Query().Get("sort")
	search := strings.TrimSpace(r.URL.Query().Get("search"))

	var problems []models.Problem
	var totalItems int64

	// Start building the query
	db := database.DB.Model(&models.Problem{})

	// Join with Users to search by author name if needed
	// Note: GORM joins can be tricky, using simple approach first
	
	// 1. Visibility Logic
	if user != nil {
		// Public OR Own OR Access List
		// Subquery for access list
		accessSubQuery := database.DB.Table("problem_access").Select("problem_id").Where("user_email = ?", user.Email)
		
		db = db.Where("visibility = 'public' OR author_id = ? OR id IN (?)", user.ID, accessSubQuery)
	} else {
		db = db.Where("visibility = 'public'")
	}

	// 2. Filter Logic
	if user != nil {
		if filter == "access" {
			// Only show problems where user is in access list (and not author)
			accessSubQuery := database.DB.Table("problem_access").Select("problem_id").Where("user_email = ?", user.Email)
			db = db.Where("id IN (?)", accessSubQuery)
		} else if filter == "solved" {
			// Only show solved problems
			solvedSubQuery := database.DB.Table("submissions").Select("problem_id").Where("user_id = ? AND status = 'Принято'", user.ID)
			db = db.Where("id IN (?)", solvedSubQuery)
		} else if filter == "own" {
			db = db.Where("author_id = ?", user.ID)
		}
	}

	// 3. Search Logic
	if search != "" {
		searchTerm := "%" + search + "%"
		// Search by title OR author name
		// We need to join with users table for author name search
		db = db.Joins("LEFT JOIN users ON users.id = problems.author_id").
			Where("problems.title ILIKE ? OR users.name ILIKE ?", searchTerm, searchTerm)
	}

	// 4. Sort Logic
	if sort == "title" {
		db = db.Order("title ASC")
	} else if sort == "oldest" {
		db = db.Order("created_at ASC")
	} else {
		// Default: Newest first
		db = db.Order("created_at DESC")
	}

	// Execute Count and Find
	db.Count(&totalItems)
	db.Limit(itemsPerPage).Offset(offset).Find(&problems)

	// Post-processing for display data
	var displayProblems []ProblemData
	for _, p := range problems {
		var count int64
		database.DB.Model(&models.SubmissionRecord{}).
			Where("problem_id = ? AND status = ?", p.ID, "Принято").
			Distinct("user_id").Count(&count)
		
		isOwner := user != nil && user.ID == p.AuthorID
		
		// Check if current user solved it (for UI indication if needed later)
		// We don't have IsSolved in ProblemData yet, but good to have logic ready
		
		displayProblems = append(displayProblems, ProblemData{
			Problem:     p,
			SolvedCount: count,
			IsOwner:     isOwner,
		})
	}

	totalPages := int((totalItems + int64(itemsPerPage) - 1) / int64(itemsPerPage))

	data := PageData{
		Problems:    displayProblems,
		User:        user,
		CurrentPage: page,
		TotalPages:  totalPages,
		HasPrev:     page > 1,
		HasNext:     page < totalPages,
		PrevPage:    page - 1,
		NextPage:    page + 1,
		// Pass params back to template for UI state
		// We need to add these fields to PageData struct in types.go first!
		// For now, we rely on URL params in template links
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
		timeLimit, _ := strconv.ParseFloat(r.FormValue("time_limit"), 64)
		memoryLimit, _ := strconv.Atoi(r.FormValue("memory_limit"))
		
		problem := models.Problem{
			AuthorID:    user.ID,
			Title:       r.FormValue("title"),
			Description: r.FormValue("description"),
			TimeLimit:   timeLimit,
			MemoryLimit: memoryLimit,
			Visibility:  "private",
			Status:      "draft",
		}
		
		if err := database.DB.Create(&problem).Error; err != nil {
			http.Error(w, "Error creating problem: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Add Sample Test Case
		sampleInput := r.FormValue("sample_input")
		sampleOutput := r.FormValue("sample_output")
		if sampleInput != "" {
			tc := models.TestCase{
				ProblemID:      problem.ID,
				Input:          sampleInput,
				ExpectedOutput: sampleOutput,
				IsSample:       true,
			}
			database.DB.Create(&tc)
		}

		http.Redirect(w, r, fmt.Sprintf("/edit-problem?id=%d", problem.ID), http.StatusSeeOther)
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

		p.Title = r.FormValue("title")
		p.Description = r.FormValue("description")
		p.TimeLimit, _ = strconv.ParseFloat(r.FormValue("time_limit"), 64)
		p.MemoryLimit, _ = strconv.Atoi(r.FormValue("memory_limit"))
		status := r.FormValue("status")
		p.Status = status

		if status == "pending_review" {
			p.Visibility = "private"
		} else {
			p.Visibility = r.FormValue("visibility")
		}

		database.DB.Save(p)

		// Add New Test Case
		newInput := r.FormValue("new_input")
		newOutput := r.FormValue("new_output")
		isSample := r.FormValue("is_sample") == "on"

		if newInput != "" {
			tc := models.TestCase{
				ProblemID:      p.ID,
				Input:          newInput,
				ExpectedOutput: newOutput,
				IsSample:       isSample,
			}
			database.DB.Create(&tc)
		}

		// Access List Logic
		accessEmail := strings.TrimSpace(r.FormValue("access_email"))
		if accessEmail != "" {
			access := models.ProblemAccess{ProblemID: p.ID, UserEmail: accessEmail}
			database.DB.Create(&access)
		}
		
		removeEmail := r.FormValue("remove_access")
		if removeEmail != "" {
			database.DB.Where("problem_id = ? AND user_email = ?", p.ID, removeEmail).Delete(&models.ProblemAccess{})
		}

		http.Redirect(w, r, fmt.Sprintf("/edit-problem?id=%d", id), http.StatusSeeOther)
		return
	}

	// Load Test Cases and Access List
	database.DB.Where("problem_id = ?", id).Order("id asc").Find(&p.TestCases)
	
	var accessList []models.ProblemAccess
	database.DB.Where("problem_id = ?", id).Find(&accessList)
	
	var emails []string
	for _, a := range accessList {
		emails = append(emails, a.UserEmail)
	}

	data := struct {
		Problem    models.Problem
		User       *models.User
		AccessList []string
	}{
		Problem:    *p,
		User:       user,
		AccessList: emails,
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

	if p.AuthorID != user.ID && user.Role != "admin" {
		http.Error(w, "Access Denied", http.StatusForbidden)
		return
	}

	if p.Status == "approved" && user.Role != "admin" {
		http.Error(w, "Cannot delete approved problem", http.StatusForbidden)
		return
	}

	// GORM handles cascade delete if configured, but explicit delete is safer here
	database.DB.Where("problem_id = ?", id).Delete(&models.TestCase{})
	database.DB.Where("problem_id = ?", id).Delete(&models.SubmissionRecord{})
	database.DB.Where("problem_id = ?", id).Delete(&models.ProblemAccess{})
	database.DB.Delete(&p)

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

	var p models.Problem
	if err := database.DB.First(&p, pID).Error; err != nil {
		http.NotFound(w, r)
		return
	}

	if p.AuthorID != user.ID && user.Role != "admin" {
		http.Error(w, "Access Denied", http.StatusForbidden)
		return
	}

	if p.Status == "approved" && user.Role != "admin" {
		http.Error(w, "Cannot delete tests from approved problem", http.StatusForbidden)
		return
	}

	database.DB.Delete(&models.TestCase{}, tcID)
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
		fmt.Println("Error getting problem:", err)
		http.NotFound(w, r)
		return
	}

	user := GetUser(r)
	
	if p.Visibility == "private" {
		allowed := false
		if user != nil {
			if user.ID == p.AuthorID {
				allowed = true
			} else {
				var count int64
				database.DB.Model(&models.ProblemAccess{}).Where("problem_id = ? AND user_email = ?", id, user.Email).Count(&count)
				if count > 0 {
					allowed = true
				}
			}
		}
		if !allowed {
			http.Error(w, "Access Denied", http.StatusForbidden)
			return
		}
	}

	hasPending := false
	if user != nil {
		var count int64
		database.DB.Model(&models.SubmissionRecord{}).Where("problem_id = ? AND user_id = ? AND status = ?", id, user.ID, "В очереди...").Count(&count)
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
