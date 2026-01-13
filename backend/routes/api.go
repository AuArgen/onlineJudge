package routes

import (
	"onlineJudge/backend/app/http/controllers"
	"onlineJudge/backend/app/http/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Auth
	api.Get("/auth/google/url", controllers.GoogleLogin)
	api.Post("/auth/google/callback", controllers.GoogleCallback)

	// Problems (Public)
	api.Get("/problems", controllers.GetProblems)
	api.Get("/problems/:id", controllers.GetProblem)
	api.Get("/leaderboard", controllers.GetLeaderboard)

	// Contests (Public)
	api.Get("/contests", controllers.GetContests)
	api.Get("/contests/:id", controllers.GetContest)
	api.Get("/contests/:id/leaderboard", controllers.GetContestLeaderboard)

	// Protected Routes
	api.Use(middleware.AuthRequired)
	api.Post("/problems", controllers.CreateProblem)
	api.Put("/problems/:id", controllers.UpdateProblem)
	api.Delete("/problems/:id", controllers.DeleteProblem)

	// Test Cases
	api.Post("/problems/:id/testcases", controllers.AddTestCase)
	api.Delete("/problems/:id/testcases/:testcase_id", controllers.DeleteTestCase)
	api.Post("/problems/generate-output", controllers.GenerateOutput)

	api.Post("/submit", controllers.SubmitSolution)
	api.Get("/history", controllers.GetHistory)
	api.Get("/submission/:id", controllers.GetSubmission)
	api.Get("/profile", controllers.GetProfile)

	// Contest Management
	api.Post("/contests", controllers.CreateContest)
	api.Post("/contests/:id/problems", controllers.AddProblemToContest)
	api.Post("/contests/:id/join", controllers.JoinContest)

	// Admin Routes
	admin := api.Group("/admin")
	admin.Get("/problems", controllers.GetPendingProblems)
	admin.Post("/problems/:id/approve", controllers.ApproveProblem)
	admin.Post("/problems/:id/reject", controllers.RejectProblem)
}
