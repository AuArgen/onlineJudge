package controllers

import (
	"html/template"
	"net/http"
	"onlineJudge/database"
	"onlineJudge/models"
	"os"
	"strconv"
)

// HandleAdminPanel displays the list of problems pending review
func HandleAdminPanel(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil || user.Role != "admin" {
		http.Error(w, "Access Denied: Admins only", http.StatusForbidden)
		return
	}

	// Fetch problems with status 'pending_review'
	var pendingProblems []models.Problem
	// Preload Author to get name
	database.DB.Preload("Author").Where("status = ?", "pending_review").Order("created_at desc").Find(&pendingProblems)

	appName := os.Getenv("APP_NAME")
	if appName == "" {
		appName = "Online Judge"
	}

	data := AdminData{
		AppName:         appName,
		PendingProblems: pendingProblems,
		User:            user,
	}

	tmpl := template.Must(template.ParseFiles("templates/admin.html", "templates/header.html", "templates/footer.html"))
	tmpl.Execute(w, data)
}

// HandleApproveProblem approves a problem
func HandleApproveProblem(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil || user.Role != "admin" {
		http.Error(w, "Access Denied", http.StatusForbidden)
		return
	}

	idStr := r.URL.Query().Get("id")
	id, _ := strconv.Atoi(idStr)

	database.DB.Model(&models.Problem{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":     "approved",
		"visibility": "public",
	})

	http.Redirect(w, r, "/admin", http.StatusSeeOther)
}

// HandleRejectProblem rejects a problem (sets back to draft)
func HandleRejectProblem(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil || user.Role != "admin" {
		http.Error(w, "Access Denied", http.StatusForbidden)
		return
	}

	idStr := r.URL.Query().Get("id")
	id, _ := strconv.Atoi(idStr)

	database.DB.Model(&models.Problem{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":     "draft",
		"visibility": "private",
	})

	http.Redirect(w, r, "/admin", http.StatusSeeOther)
}
