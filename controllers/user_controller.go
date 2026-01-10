package controllers

import (
	"html/template"
	"net/http"
	"onlineJudge/database"
	"onlineJudge/models"
	"os"
)

// HandleProfile displays the user's profile page
func HandleProfile(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil {
		http.Redirect(w, r, "/auth/google/login", http.StatusTemporaryRedirect)
		return
	}

	// 1. Fetch user's created problems
	var myProblems []models.Problem
	database.DB.Where("author_id = ?", user.ID).Order("created_at desc").Find(&myProblems)

	// 2. Fetch user's solved problems statistics
	var solvedCount int64
	database.DB.Model(&models.SubmissionRecord{}).
		Where("user_id = ? AND status = ?", user.ID, "Принято").
		Distinct("problem_id").Count(&solvedCount)

	var totalSubmissions int64
	database.DB.Model(&models.SubmissionRecord{}).
		Where("user_id = ?", user.ID).Count(&totalSubmissions)

	appName := os.Getenv("APP_NAME")
	if appName == "" {
		appName = "Online Judge"
	}

	data := ProfileData{
		AppName:          appName,
		User:             user,
		MyProblems:       myProblems,
		SolvedCount:      solvedCount,
		TotalSubmissions: totalSubmissions,
	}

	tmpl := template.Must(template.ParseFiles("templates/profile.html", "templates/header.html", "templates/footer.html"))
	tmpl.Execute(w, data)
}
