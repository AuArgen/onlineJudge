package controllers

import (
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"

	"github.com/gofiber/fiber/v2"
)

type ProfileResponse struct {
	User             models.User      `json:"user"`
	SolvedCount      int64            `json:"solved_count"`
	TotalSubmissions int64            `json:"total_submissions"`
	MyProblems       []models.Problem `json:"my_problems"`
}

// GetProfile godoc
// @Summary Get user profile
// @Description Get current user profile with stats and problems
// @Tags User
// @Produce json
// @Success 200 {object} ProfileResponse
// @Router /profile [get]
func GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(float64)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Stats
	var solvedCount int64
	database.DB.Model(&models.Submission{}).
		Where("user_id = ? AND status = 'Accepted'", userID).
		Distinct("problem_id").Count(&solvedCount)

	var totalSubmissions int64
	database.DB.Model(&models.Submission{}).
		Where("user_id = ?", userID).Count(&totalSubmissions)

	// My Problems
	var myProblems []models.Problem
	database.DB.Where("author_id = ?", userID).Order("created_at desc").Find(&myProblems)

	return c.JSON(ProfileResponse{
		User:             user,
		SolvedCount:      solvedCount,
		TotalSubmissions: totalSubmissions,
		MyProblems:       myProblems,
	})
}
