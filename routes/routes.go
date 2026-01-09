package routes

import (
	"html/template"
	"net/http"
	"onlineJudge/controllers"
)

func SetupRoutes() {
	// Static files
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Main Page
	http.HandleFunc("/", handleMain)

	// Auth Routes
	http.HandleFunc("/auth/google/login", controllers.HandleGoogleLogin)
	http.HandleFunc("/auth/google/callback", controllers.HandleGoogleCallback)

	// Problem Routes
	http.HandleFunc("/problems", controllers.HandleProblems)
	http.HandleFunc("/create-problem", controllers.HandleCreateProblem)
	http.HandleFunc("/edit-problem", controllers.HandleEditProblem)
	http.HandleFunc("/delete-problem", controllers.HandleDeleteProblem)
	http.HandleFunc("/delete-testcase", controllers.HandleDeleteTestCase)

	// Solve & Submit Routes
	http.HandleFunc("/solve", controllers.HandleSolve)
	http.HandleFunc("/submit", controllers.HandleSubmit)
	http.HandleFunc("/history", controllers.HandleHistory)
	http.HandleFunc("/submission", controllers.HandleViewSubmission)
	http.HandleFunc("/solved", controllers.HandleSolvedList)

	// User Routes
	http.HandleFunc("/profile", controllers.HandleProfile)

	// Admin Routes
	http.HandleFunc("/admin", controllers.HandleAdminPanel)
	http.HandleFunc("/admin/approve", controllers.HandleApproveProblem)
	http.HandleFunc("/admin/reject", controllers.HandleRejectProblem)
}

func handleMain(w http.ResponseWriter, r *http.Request) {
	user := controllers.GetUser(r)
	data := struct {
		User interface{}
	}{
		User: user,
	}
	tmpl := template.Must(template.ParseFiles("templates/index.html"))
	tmpl.Execute(w, data)
}
