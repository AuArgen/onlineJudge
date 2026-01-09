package main

import (
	"log"
	"net/http"
	"onlineJudge/config"
	"onlineJudge/controllers"
	"onlineJudge/database"
	"onlineJudge/routes"
	"onlineJudge/selftest"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Load Environment Variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, using environment variables")
	}

	// 2. Initialize Configuration & Database
	config.InitConfig()
	database.InitDB()

	// 3. Run Self-Test & Start Workers
	go selftest.Run()
	controllers.StartWorker()

	// 4. Setup Routes
	routes.SetupRoutes()

	// 5. Start Server
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
