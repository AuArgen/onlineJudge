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

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

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

	createTables()
}

func createTables() {
	// 1. Users Table
	// Role: 'user' or 'admin'
	usersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		google_id TEXT UNIQUE,
		email TEXT UNIQUE,
		name TEXT,
		role TEXT DEFAULT 'user',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// 2. Problems Table
	// Visibility: 'private', 'link', 'public'
	// Status: 'draft', 'pending_review', 'approved'
	problemsTable := `
	CREATE TABLE IF NOT EXISTS problems (
		id SERIAL PRIMARY KEY,
		author_id INTEGER REFERENCES users(id),
		title TEXT,
		description TEXT,
		time_limit FLOAT,
		memory_limit INTEGER,
		visibility TEXT DEFAULT 'private',
		status TEXT DEFAULT 'draft',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// 3. Test Cases Table
	// IsSample: true if it should be shown to user
	testCasesTable := `
	CREATE TABLE IF NOT EXISTS test_cases (
		id SERIAL PRIMARY KEY,
		problem_id INTEGER REFERENCES problems(id),
		input TEXT,
		expected_output TEXT,
		is_sample BOOLEAN DEFAULT FALSE
	);`

	// 4. Submissions Table (Updated)
	submissionsTable := `
	CREATE TABLE IF NOT EXISTS submissions (
		id SERIAL PRIMARY KEY,
		user_name TEXT, -- Keeping for backward compatibility, but should link to users(id)
		user_id INTEGER REFERENCES users(id),
		problem_id INTEGER REFERENCES problems(id),
		problem_title TEXT,
		language TEXT,
		source_code TEXT,
		status TEXT,
		execution_time TEXT,
		timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	queries := []string{usersTable, problemsTable, testCasesTable, submissionsTable}

	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			log.Fatal("Error creating table: ", err)
		}
	}

	log.Println("Database tables initialized.")
}
