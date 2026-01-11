package controllers

import (
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"

	"github.com/gofiber/fiber/v2"
)

// GetProfile godoc
// @Summary Get user profile
// @Description Get current user profile
// @Tags User
// @Produce json
// @Success 200 {object} models.User
// @Router /profile [get]
func GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(float64)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(user)
}

type LeaderboardEntry struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	SolvedCount int64  `json:"solved_count"`
}

// GetLeaderboard godoc
// @Summary Get leaderboard
// @Description Get top users by solved problems
// @Tags User
// @Produce json
// @Success 200 {array} LeaderboardEntry
// @Router /leaderboard [get]
func GetLeaderboard(c *fiber.Ctx) error {
	var leaderboard []LeaderboardEntry

	// Raw SQL is often easier for complex aggregations like this
	// Count unique problem_id where status is 'Accepted' for each user
	database.DB.Raw(`
		SELECT u.id, u.name, COUNT(DISTINCT s.problem_id) as solved_count
		FROM users u
		LEFT JOIN submissions s ON u.id = s.user_id AND s.status = 'Accepted'
		GROUP BY u.id, u.name
		ORDER BY solved_count DESC
		LIMIT 50
	`).Scan(&leaderboard)

	return c.JSON(leaderboard)
}
