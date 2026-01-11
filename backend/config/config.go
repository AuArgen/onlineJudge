package config

import (
	"os"

	"github.com/joho/godotenv"
)

var (
	AppPort string
	DBUrl   string
)

func LoadConfig() {
	godotenv.Load()

	AppPort = os.Getenv("APP_PORT")
	if AppPort == "" {
		AppPort = "8000"
	}

	DBUrl = os.Getenv("DATABASE_URL")
}
