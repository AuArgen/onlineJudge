package handlers

import (
	"html/template"
	"net/http"
	"onlineJudge/database"
	"onlineJudge/models"
)

// HandleProfile displays the user's profile page
func HandleProfile(w http.ResponseWriter, r *http.Request) {
	user := GetUser(r)
	if user == nil {
		http.Redirect(w, r, "/auth/google/login", http.StatusTemporaryRedirect)
		return
	}

	// 1. Fetch user's created problems
	rows, err := database.DB.Query("SELECT id, title, status, visibility, created_at FROM problems WHERE author_id = $1 ORDER BY created_at DESC", user.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var myProblems []models.Problem
	for rows.Next() {
		var p models.Problem
		rows.Scan(&p.ID, &p.Title, &p.Status, &p.Visibility, &p.CreatedAt)
		myProblems = append(myProblems, p)
	}

	// 2. Fetch user's solved problems statistics
	var solvedCount int
	database.DB.QueryRow("SELECT COUNT(DISTINCT problem_id) FROM submissions WHERE user_id = $1 AND status = 'Принято'", user.ID).Scan(&solvedCount)

	var totalSubmissions int
	database.DB.QueryRow("SELECT COUNT(*) FROM submissions WHERE user_id = $1", user.ID).Scan(&totalSubmissions)

	data := struct {
		User             *models.User
		MyProblems       []models.Problem
		SolvedCount      int
		TotalSubmissions int
	}{
		User:             user,
		MyProblems:       myProblems,
		SolvedCount:      solvedCount,
		TotalSubmissions: totalSubmissions,
	}

	tmpl := template.Must(template.ParseFiles("templates/profile.html"))
	tmpl.Execute(w, data)
}
