package controllers

import (
	"strings"

	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"
	"onlineJudge/backend/services/ai"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var validDifficulties = map[string]bool{"easy": true, "medium": true, "hard": true}

// TranslateProblem godoc
// @Summary AI: correct and translate a problem statement
// @Description Uses DeepSeek to correct the problem's title/description and translate it into ru, ky, en (admin only). Does not write to the database.
// @Tags Admin AI
// @Produce json
// @Param id path int true "Problem ID"
// @Success 200 {object} ai.CorrectResult
// @Router /admin/ai/problems/{id}/translate [post]
func TranslateProblem(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	var problem models.Problem
	if err := database.DB.First(&problem, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	client := ai.NewClient()
	result, err := client.CorrectAndTranslate(problem.Title, problem.Description)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "AI request failed: " + err.Error()})
	}

	return c.JSON(result)
}

// GenerateTopicProblems godoc
// @Summary AI: generate problems for a topic
// @Description Uses DeepSeek to draft 1-5 new problems for a topic at a given difficulty, saves them as drafts and links them to the topic (admin only).
// @Tags Admin AI
// @Produce json
// @Param id path int true "Topic ID"
// @Success 200 {array} models.Problem
// @Router /admin/ai/topics/{id}/generate [post]
func GenerateTopicProblems(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}
	userID := c.Locals("user_id").(float64)

	var topic models.Topic
	if err := database.DB.First(&topic, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}

	type Request struct {
		Count      int    `json:"count"`
		Difficulty string `json:"difficulty"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}
	if req.Count < 1 || req.Count > 5 {
		return c.Status(400).JSON(fiber.Map{"error": "count must be between 1 and 5"})
	}
	if !validDifficulties[req.Difficulty] {
		return c.Status(400).JSON(fiber.Map{"error": "difficulty must be easy, medium or hard"})
	}

	var contentTexts []string
	database.DB.Model(&models.TopicContent{}).
		Where("topic_id = ? AND type = ?", topic.ID, "text").
		Order("order_num").
		Pluck("content", &contentTexts)
	topicContext := strings.Join(contentTexts, "\n")

	client := ai.NewClient()
	drafts, err := client.GenerateProblems(topic.Title, topicContext, req.Count, req.Difficulty)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "AI request failed: " + err.Error()})
	}

	var maxOrder int
	database.DB.Model(&models.TopicProblem{}).Where("topic_id = ?", topic.ID).
		Select("COALESCE(MAX(order_num), 0)").Scan(&maxOrder)

	var created []models.Problem
	txErr := database.DB.Transaction(func(tx *gorm.DB) error {
		for i, draft := range drafts {
			problem := models.Problem{
				Title:       draft.Title,
				Description: draft.Description,
				TimeLimit:   draft.TimeLimit,
				MemoryLimit: draft.MemoryLimit,
				AuthorID:    uint(userID),
				Visibility:  "private",
				Status:      "draft",
				Difficulty:  req.Difficulty,
			}
			if err := tx.Create(&problem).Error; err != nil {
				return err
			}

			for langCode, text := range draft.Translations {
				translation := models.ProblemTranslation{
					ProblemID:    problem.ID,
					LanguageCode: langCode,
					Title:        text.Title,
					Description:  text.Description,
				}
				if err := tx.Create(&translation).Error; err != nil {
					return err
				}
			}

			link := models.TopicProblem{
				TopicID:   topic.ID,
				ProblemID: problem.ID,
				OrderNum:  maxOrder + i + 1,
			}
			if err := tx.Create(&link).Error; err != nil {
				return err
			}

			created = append(created, problem)
		}
		return nil
	})
	if txErr != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save generated problems: " + txErr.Error()})
	}

	return c.JSON(created)
}
