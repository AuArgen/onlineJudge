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

	// Topics (Public) - shared token access (no auth required)
	api.Get("/topics/shared/:token", controllers.GetTopicByToken)

	// Protected Routes
	api.Use(middleware.AuthRequired)
	api.Post("/problems", controllers.CreateProblem)
	api.Put("/problems/:id", controllers.UpdateProblem)
	api.Delete("/problems/:id", controllers.DeleteProblem)

	// Test Cases
	api.Post("/problems/:id/testcases", controllers.AddTestCase)
	api.Put("/problems/:id/testcases/:testcase_id", controllers.UpdateTestCase)
	api.Delete("/problems/:id/testcases/:testcase_id", controllers.DeleteTestCase)
	api.Post("/problems/generate-output", controllers.GenerateOutput)

	// Translations
	api.Put("/problems/:id/translations/:lang", controllers.UpsertProblemTranslation)
	api.Delete("/problems/:id/translations/:lang", controllers.DeleteProblemTranslation)

	// Sharing
	api.Post("/problems/:id/share", controllers.ShareProblem)
	api.Post("/problems/:id/share-token", controllers.GenerateShareToken)

	api.Post("/submit", controllers.SubmitSolution)
	api.Post("/run", controllers.RunCode)
	api.Get("/history", controllers.GetHistory)
	api.Get("/submission/:id", controllers.GetSubmission)
	api.Get("/profile", controllers.GetProfile)

	// Contest Management
	api.Post("/contests", controllers.CreateContest)
	api.Put("/contests/:id", controllers.UpdateContest)
	api.Post("/contests/:id/problems", controllers.AddProblemToContest)
	api.Delete("/contests/:id/problems/:problem_id", controllers.RemoveProblemFromContest)
	api.Post("/contests/:id/join", controllers.JoinContest)

	// Topic Routes (protected)
	api.Get("/topics", controllers.GetTopics)
	api.Post("/topics", controllers.CreateTopic)
	api.Get("/topics/:id", controllers.GetTopic)
	api.Put("/topics/:id", controllers.UpdateTopic)
	api.Delete("/topics/:id", controllers.DeleteTopic)

	// Topic content blocks
	api.Post("/topics/:id/contents", controllers.AddContent)
	api.Put("/topics/:id/contents/:content_id", controllers.UpdateContent)
	api.Delete("/topics/:id/contents/:content_id", controllers.DeleteContent)

	// Topic problems
	api.Post("/topics/:id/problems", controllers.AddTopicProblem)
	api.Delete("/topics/:id/problems/:problem_id", controllers.RemoveTopicProblem)

	// Topic sharing & access
	api.Post("/topics/:id/share", controllers.ShareTopicByEmail)
	api.Delete("/topics/:id/access/:access_id", controllers.RevokeTopicAccess)
	api.Post("/topics/:id/share-token", controllers.GenerateTopicShareToken)

	// Topic analytics
	api.Get("/topics/:id/analytics", controllers.GetTopicAnalytics)

	// AI assistants (any authenticated user; permission checks happen inside the controllers)
	api.Post("/ai/problems/draft", controllers.DraftProblem)
	api.Post("/ai/topics/suggest", controllers.SuggestTopic)
	api.Post("/ai/topics/:id/overview", controllers.GenerateTopicOverview)

	// Admin Routes
	admin := api.Group("/admin")
	admin.Get("/problems", controllers.GetPendingProblems)
	admin.Post("/problems/:id/approve", controllers.ApproveProblem)
	admin.Post("/problems/:id/reject", controllers.RejectProblem)
	admin.Get("/users", controllers.GetAllUsers)
	admin.Get("/users/:id", controllers.GetUserProfile)
	admin.Get("/activity", controllers.GetUserActivity)

	// AI (DeepSeek)
	admin.Post("/ai/problems/:id/translate", controllers.TranslateProblem)
	admin.Post("/ai/topics/:id/generate", controllers.GenerateTopicProblems)
}
