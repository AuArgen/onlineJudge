package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	var err error
	
	// Get connection details from environment variables
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	// Retry logic: Try to connect for up to 60 seconds
	maxRetries := 12
	for i := 0; i < maxRetries; i++ {
		log.Printf("Connecting to database (Attempt %d/%d)...\n", i+1, maxRetries)
		DB, err = sql.Open("postgres", psqlInfo)
		if err != nil {
			log.Printf("Failed to open sql connection: %v\n", err)
			time.Sleep(5 * time.Second)
			continue
		}

		err = DB.Ping()
		if err == nil {
			log.Println("Successfully connected to PostgreSQL database.")
			break
		}

		log.Printf("Failed to ping database: %v. Retrying in 5 seconds...\n", err)
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		log.Fatal("Could not connect to database after multiple attempts: ", err)
	}

	// Create table if not exists
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS submissions (
		id SERIAL PRIMARY KEY,
		user_name TEXT,
		problem_id INTEGER,
		problem_title TEXT,
		language TEXT,
		source_code TEXT,
		status TEXT,
		execution_time TEXT,
		timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err = DB.Exec(createTableSQL)
	if err != nil {
		log.Fatal("Error creating table: ", err)
	}

	log.Println("Database initialized and ready.")
}
