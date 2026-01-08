package handlers

import (
	"html/template"
	"net/http"
	"onlineJudge/database"
	"onlineJudge/models"
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
	rows, err := database.DB.Query("SELECT id, title, author_id, created_at FROM problems WHERE status = 'pending_review' ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var pendingProblems []models.Problem
	for rows.Next() {
		var p models.Problem
		rows.Scan(&p.ID, &p.Title, &p.AuthorID, &p.CreatedAt)

		// Fetch author name
		database.DB.QueryRow("SELECT name FROM users WHERE id = $1", p.AuthorID).Scan(&p.AuthorName)

		pendingProblems = append(pendingProblems, p)
	}

	data := struct {
		PendingProblems []models.Problem
		User            *models.User
	}{
		PendingProblems: pendingProblems,
		User:            user,
	}

	tmpl := template.Must(template.ParseFiles("templates/admin.html"))
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

	_, err := database.DB.Exec("UPDATE problems SET status = 'approved', visibility = 'public' WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

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

	_, err := database.DB.Exec("UPDATE problems SET status = 'draft', visibility = 'private' WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, "/admin", http.StatusSeeOther)
}
