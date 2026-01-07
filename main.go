package main

import (
	"html/template"
	"log"
	"net/http"
	"onlineJudge/config"
	"onlineJudge/database"
	"onlineJudge/handlers"
	"onlineJudge/selftest" // Import selftest package

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	config.InitConfig()
	database.InitDB()

	// Run Self-Test on startup
	// This will pull images if missing and verify compilers
	go selftest.Run()

	// Start the background worker for processing submissions
	handlers.StartWorker()

	http.HandleFunc("/", handleMain)
	http.HandleFunc("/auth/google/login", handlers.HandleGoogleLogin)
	http.HandleFunc("/auth/google/callback", handlers.HandleGoogleCallback)
	http.HandleFunc("/problems", handlers.HandleProblems)
	http.HandleFunc("/solve", handlers.HandleSolve)
	http.HandleFunc("/submit", handlers.HandleSubmit)
	http.HandleFunc("/history", handlers.HandleHistory)
	http.HandleFunc("/submission", handlers.HandleViewSubmission)
	http.HandleFunc("/solved", handlers.HandleSolvedList)

	// Serve static files (css, js)
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Println("Listening on :8000...")
	err = http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func handleMain(w http.ResponseWriter, r *http.Request) {
	userName := handlers.GetUserName(r)
	data := struct {
		UserName string
	}{
		UserName: userName,
	}
	tmpl := template.Must(template.ParseFiles("templates/index.html"))
	tmpl.Execute(w, data)
}
