package main

import (
	"log"
	"onlineJudge/backend/config"
	"onlineJudge/backend/database"
	"onlineJudge/backend/routes"
	"onlineJudge/backend/selftest"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
	_ "onlineJudge/backend/docs" // Import swagger docs
)

// @title Online Judge API
// @version 1.0
// @description API for Online Judge System
// @host localhost:8000
// @BasePath /api
func main() {
	// Load config
	config.LoadConfig()

	// Connect to database
	database.Connect()

	// Seed database (if empty)
	database.Seed()

	// Initialize Fiber app
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: config.AllowedOrigins,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Swagger
	app.Get("/swagger/*", swagger.HandlerDefault)

	// Setup Routes
	routes.SetupRoutes(app)

	// Run Self-Test in background
	go selftest.Run()

	// Start server
	log.Fatal(app.Listen(":" + config.AppPort))
}
