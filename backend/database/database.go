package database

import (
	"log"
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/config"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	dsn := config.DBUrl // Fixed variable name
	var err error

	// Retry logic for database connection
	for i := 0; i < 10; i++ {
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err == nil {
			break
		}
		log.Printf("Failed to connect to database. Retrying in 2 seconds... (%d/10)", i+1)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Database connected successfully")

	// Auto Migrate
	err = DB.AutoMigrate(
		&models.User{},
		&models.Problem{},
		&models.TestCase{},
		&models.Submission{},
		&models.SubmissionDetail{},
		&models.Contest{},
		&models.ContestProblem{},
		&models.ContestParticipant{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
}
