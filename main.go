package main

import (
	"html/template"
	"log"
	"net/http"
	"onlineJudge/config"
	"onlineJudge/database"
	"onlineJudge/handlers"
	"onlineJudge/selftest"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, using environment variables")
	}

	config.InitConfig()
	database.InitDB()

	go selftest.Run()
	handlers.StartWorker()

	http.HandleFunc("/", handleMain)
	http.HandleFunc("/auth/google/login", handlers.HandleGoogleLogin)
	http.HandleFunc("/auth/google/callback", handlers.HandleGoogleCallback)
	http.HandleFunc("/problems", handlers.HandleProblems)
	http.HandleFunc("/create-problem", handlers.HandleCreateProblem)
	http.HandleFunc("/edit-problem", handlers.HandleEditProblem)
	http.HandleFunc("/delete-problem", handlers.HandleDeleteProblem) // New route
	http.HandleFunc("/delete-testcase", handlers.HandleDeleteTestCase)
	http.HandleFunc("/solve", handlers.HandleSolve)
	http.HandleFunc("/submit", handlers.HandleSubmit)
	http.HandleFunc("/history", handlers.HandleHistory)
	http.HandleFunc("/submission", handlers.HandleViewSubmission)
	http.HandleFunc("/solved", handlers.HandleSolvedList)

	// Profile Route
	http.HandleFunc("/profile", handlers.HandleProfile)

	// Admin Routes
	http.HandleFunc("/admin", handlers.HandleAdminPanel)
	http.HandleFunc("/admin/approve", handlers.HandleApproveProblem)
	http.HandleFunc("/admin/reject", handlers.HandleRejectProblem)

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("Listening on :%s...", port)
	err = http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal(err)
	}
}

func handleMain(w http.ResponseWriter, r *http.Request) {
	user := handlers.GetUser(r)
	data := struct {
		User interface{}
	}{
		User: user,
	}
	tmpl := template.Must(template.ParseFiles("templates/index.html"))
	tmpl.Execute(w, data)
}
