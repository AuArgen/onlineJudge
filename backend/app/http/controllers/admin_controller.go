package controllers

import (
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"

	"github.com/gofiber/fiber/v2"
)

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
