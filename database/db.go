package database

import (
	"fmt"
	"log"
	"onlineJudge/models"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	var err error

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	// Retry logic
	maxRetries := 12
	for i := 0; i < maxRetries; i++ {
		log.Printf("Connecting to database (Attempt %d/%d)...\n", i+1, maxRetries)

		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})

		if err == nil {
			sqlDB, _ := DB.DB()
			err = sqlDB.Ping()
			if err == nil {
				log.Println("Successfully connected to PostgreSQL database via GORM.")
				break
			}
		}

		log.Printf("Failed to connect to database: %v. Retrying in 5 seconds...\n", err)
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		log.Fatal("Could not connect to database after multiple attempts: ", err)
	}

	// Auto Migrate
	// GORM will automatically create tables, missing columns and missing indexes.
	// It WILL NOT delete unused columns to protect data.
	log.Println("Running Auto Migration...")
	err = DB.AutoMigrate(
		&models.User{},
		&models.Problem{},
		&models.TestCase{},
		&models.ProblemAccess{},
		&models.SubmissionRecord{},
		&models.SubmissionDetail{},
	)
	if err != nil {
		log.Fatal("Migration failed: ", err)
	}
	log.Println("Database migration completed.")

	// Seed Data (Optional: Add default admin or problems if DB is empty)
	seedData()
}

func seedData() {
	var count int64
	DB.Model(&models.Problem{}).Count(&count)
	if count == 0 {
		log.Println("Seeding initial problems...")
		// Add some default problems here if needed, or leave empty to start fresh
		// For now, we rely on users creating problems via UI
	}
}
