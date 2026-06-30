package controllers

import (
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"
	"time"

	"github.com/gofiber/fiber/v2"
)

type UserWithStats struct {
	ID            uint      `json:"id"`
	Name          string    `json:"name"`
	Email         string    `json:"email"`
	Role          string    `json:"role"`
	CreatedAt     time.Time `json:"created_at"`
	TotalSubmissions int64  `json:"total_submissions"`
	SolvedCount   int64     `json:"solved_count"`
	LastActiveAt  *time.Time `json:"last_active_at"`
}

type ActivityEntry struct {
	SubmissionID  uint      `json:"submission_id"`
	UserID        uint      `json:"user_id"`
	UserName      string    `json:"user_name"`
	UserEmail     string    `json:"user_email"`
	ProblemID     uint      `json:"problem_id"`
	ProblemTitle  string    `json:"problem_title"`
	Language      string    `json:"language"`
	Status        string    `json:"status"`
	ExecutionTime string    `json:"execution_time"`
	CreatedAt     time.Time `json:"created_at"`
}

// GetAllUsers godoc
// @Summary Get all users
// @Description Get all users with their submission stats (admin only)
// @Tags Admin
// @Produce json
// @Success 200 {array} UserWithStats
// @Router /admin/users [get]
func GetAllUsers(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	var users []UserWithStats
	database.DB.Raw(`
		SELECT
			u.id, u.name, u.email, u.role, u.created_at,
			COUNT(DISTINCT s.id) AS total_submissions,
			COUNT(DISTINCT CASE WHEN s.status = 'Accepted' THEN s.problem_id END) AS solved_count,
			MAX(s.created_at) AS last_active_at
		FROM users u
		LEFT JOIN submissions s ON u.id = s.user_id
		GROUP BY u.id, u.name, u.email, u.role, u.created_at
		ORDER BY u.created_at DESC
	`).Scan(&users)

	return c.JSON(users)
}

// GetUserProfile godoc
// @Summary Get a user's profile
// @Description Get full profile and stats for a specific user (admin only)
// @Tags Admin
// @Param id path int true "User ID"
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /admin/users/{id} [get]
func GetUserProfile(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	id := c.Params("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	var stats struct {
		TotalSubmissions int64      `json:"total_submissions"`
		SolvedCount      int64      `json:"solved_count"`
		LastActiveAt     *time.Time `json:"last_active_at"`
	}
	database.DB.Raw(`
		SELECT
			COUNT(DISTINCT id) AS total_submissions,
			COUNT(DISTINCT CASE WHEN status = 'Accepted' THEN problem_id END) AS solved_count,
			MAX(created_at) AS last_active_at
		FROM submissions
		WHERE user_id = ?
	`, id).Scan(&stats)

	var recentSubmissions []ActivityEntry
	database.DB.Raw(`
		SELECT s.id AS submission_id, s.user_id, u.name AS user_name, u.email AS user_email,
			s.problem_id, p.title AS problem_title, s.language, s.status, s.execution_time, s.created_at
		FROM submissions s
		JOIN users u ON u.id = s.user_id
		JOIN problems p ON p.id = s.problem_id
		WHERE s.user_id = ?
		ORDER BY s.created_at DESC
		LIMIT 20
	`, id).Scan(&recentSubmissions)

	return c.JSON(fiber.Map{
		"user":               user,
		"stats":              stats,
		"recent_submissions": recentSubmissions,
	})
}

// GetUserActivity godoc
// @Summary Get recent user activity
// @Description Get all submissions in the last month across all users (admin only)
// @Tags Admin
// @Produce json
// @Param days query int false "Number of days back (default 30)"
// @Success 200 {array} ActivityEntry
// @Router /admin/activity [get]
func GetUserActivity(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	days := c.QueryInt("days", 30)
	if days <= 0 || days > 365 {
		days = 30
	}

	since := time.Now().AddDate(0, 0, -days)

	var activity []ActivityEntry
	database.DB.Raw(`
		SELECT s.id AS submission_id, s.user_id, u.name AS user_name, u.email AS user_email,
			s.problem_id, p.title AS problem_title, s.language, s.status, s.execution_time, s.created_at
		FROM submissions s
		JOIN users u ON u.id = s.user_id
		JOIN problems p ON p.id = s.problem_id
		WHERE s.created_at >= ?
		ORDER BY s.created_at DESC
	`, since).Scan(&activity)

	return c.JSON(fiber.Map{
		"days":     days,
		"since":    since,
		"activity": activity,
	})
}

// GetPendingProblems godoc
// @Summary Get pending problems
// @Description Get problems waiting for moderation
// @Tags Admin
// @Produce json
// @Success 200 {array} models.Problem
// @Router /admin/problems [get]
func GetPendingProblems(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	var problems []models.Problem
	database.DB.Where("status = ?", "pending_review").Order("created_at asc").Find(&problems)
	return c.JSON(problems)
}

// ApproveProblem godoc
// @Summary Approve a problem
// @Description Publish a problem
// @Tags Admin
// @Param id path int true "Problem ID"
// @Success 200 {object} map[string]string
// @Router /admin/problems/{id}/approve [post]
func ApproveProblem(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	id := c.Params("id")
	var problem models.Problem
	if err := database.DB.First(&problem, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	problem.Status = "published"
	problem.Visibility = "public"
	problem.ModerationComment = "" // Clear any previous rejection comment
	database.DB.Save(&problem)

	return c.JSON(fiber.Map{"message": "Problem approved and published"})
}

// RejectProblem godoc
// @Summary Reject a problem
// @Description Reject a problem with a comment
// @Tags Admin
// @Param id path int true "Problem ID"
// @Param body body object true "Reason"
// @Success 200 {object} map[string]string
// @Router /admin/problems/{id}/reject [post]
func RejectProblem(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	id := c.Params("id")
	var problem models.Problem
	if err := database.DB.First(&problem, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	type RejectRequest struct {
		Reason string `json:"reason"`
	}
	var req RejectRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	problem.Status = "rejected"
	problem.Visibility = "private" // Ensure it's private
	problem.ModerationComment = req.Reason
	database.DB.Save(&problem)

	return c.JSON(fiber.Map{"message": "Problem rejected"})
}
