package main

import (
	"log"
	"onlineJudge/backend/config"
	"onlineJudge/backend/database"
	_ "onlineJudge/backend/docs"
	"onlineJudge/backend/routes"
	"onlineJudge/backend/selftest" // Import selftest

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
)

// @title Online Judge API
// @version 1.0
// @description API for Online Judge Platform
// @host localhost:8000
// @BasePath /api
func main() {
	// 1. Load Config
	config.LoadConfig()

	// 2. Connect Database
	database.Connect()

	// 3. Run Self-Test in background
	go selftest.Run()

	// 4. Init App
	app := fiber.New()

	// 5. Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// 6. Swagger Route
	app.Get("/swagger/*", swagger.HandlerDefault)

	// 7. Routes
	routes.SetupRoutes(app)

	// 8. Start Server
	log.Fatal(app.Listen(":" + config.AppPort))
}
