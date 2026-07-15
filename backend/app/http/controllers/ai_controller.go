package controllers

import (
	"fmt"
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

// DraftProblem godoc
// @Summary AI: draft a new problem from an idea
// @Description Uses DeepSeek to draft a single problem statement from a free-form idea, for prefilling the create-problem form. Does not write to the database.
// @Tags AI
// @Accept json
// @Produce json
// @Success 200 {object} ai.ProblemDraft
// @Router /ai/problems/draft [post]
func DraftProblem(c *fiber.Ctx) error {
	type Request struct {
		Prompt     string `json:"prompt"`
		Difficulty string `json:"difficulty"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Prompt) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "prompt is required"})
	}
	if !validDifficulties[req.Difficulty] {
		return c.Status(400).JSON(fiber.Map{"error": "difficulty must be easy, medium or hard"})
	}

	client := ai.NewClient()
	draft, err := client.DraftProblem(req.Prompt, req.Difficulty)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "AI request failed: " + err.Error()})
	}

	return c.JSON(draft)
}

// SuggestTopic godoc
// @Summary AI: suggest a topic title and description from an idea
// @Description Uses DeepSeek to draft a topic title and short overview from a rough idea, for prefilling the create-topic form. Does not write to the database.
// @Tags AI
// @Accept json
// @Produce json
// @Success 200 {object} ai.TopicSuggestion
// @Router /ai/topics/suggest [post]
func SuggestTopic(c *fiber.Ctx) error {
	type Request struct {
		Prompt string `json:"prompt"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Prompt) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "prompt is required"})
	}

	client := ai.NewClient()
	suggestion, err := client.SuggestTopic(req.Prompt)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "AI request failed: " + err.Error()})
	}

	return c.JSON(suggestion)
}

// GenerateTopicOverview godoc
// @Summary AI: draft an overview text block for a topic
// @Description Uses DeepSeek to draft an overview text for an existing topic, using its title and existing content as context (topic owner or admin only). Does not write to the database.
// @Tags AI
// @Produce json
// @Param id path int true "Topic ID"
// @Success 200 {object} ai.OverviewDraft
// @Router /ai/topics/{id}/overview [post]
func GenerateTopicOverview(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	var contentTexts []string
	database.DB.Model(&models.TopicContent{}).
		Where("topic_id = ? AND type = ?", topic.ID, "text").
		Order("order_num").
		Pluck("content", &contentTexts)
	context := strings.Join(contentTexts, "\n")

	client := ai.NewClient()
	draft, err := client.GenerateOverview(topic.Title, context)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "AI request failed: " + err.Error()})
	}

	return c.JSON(draft)
}

// TranslateTopic godoc
// @Summary AI: translate a topic's title and content blocks
// @Description Uses DeepSeek to translate the topic's title and content blocks into ky/en and saves the result as translation rows (topic owner or admin only).
// @Tags AI
// @Produce json
// @Param id path int true "Topic ID"
// @Success 200 {object} models.Topic
// @Router /ai/topics/{id}/translate [post]
func TranslateTopic(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.Preload("Contents").First(&topic, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	blocks := make([]ai.TopicContentInput, 0, len(topic.Contents))
	for _, blk := range topic.Contents {
		input := ai.TopicContentInput{ID: blk.ID, Type: blk.Type, Caption: blk.Caption}
		if blk.Type == "text" || blk.Type == "code" {
			input.Content = blk.Content
		}
		blocks = append(blocks, input)
	}

	client := ai.NewClient()
	result, err := client.TranslateTopic(topic.Title, topic.Summary, blocks)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "AI request failed: " + err.Error()})
	}

	langResults := map[string]ai.TopicLangTranslation{"ky": result.Ky, "en": result.En}

	txErr := database.DB.Transaction(func(tx *gorm.DB) error {
		for langCode, lr := range langResults {
			if strings.TrimSpace(lr.Title) == "" {
				continue
			}

			var tt models.TopicTranslation
			if err := tx.Where("topic_id = ? AND language_code = ?", topic.ID, langCode).First(&tt).Error; err != nil {
				tt = models.TopicTranslation{TopicID: topic.ID, LanguageCode: langCode, Title: lr.Title, Summary: lr.Summary}
				if err := tx.Create(&tt).Error; err != nil {
					return err
				}
			} else {
				tt.Title = lr.Title
				if lr.Summary != "" {
					tt.Summary = lr.Summary
				}
				if err := tx.Save(&tt).Error; err != nil {
					return err
				}
			}

			for _, blk := range topic.Contents {
				bt, ok := lr.Contents[fmt.Sprint(blk.ID)]
				if !ok {
					continue
				}
				content := bt.Content
				if blk.Type != "text" && blk.Type != "code" {
					content = blk.Content
				}

				var tct models.TopicContentTranslation
				if err := tx.Where("content_id = ? AND language_code = ?", blk.ID, langCode).First(&tct).Error; err != nil {
					tct = models.TopicContentTranslation{ContentID: blk.ID, LanguageCode: langCode, Content: content, Caption: bt.Caption}
					if err := tx.Create(&tct).Error; err != nil {
						return err
					}
				} else {
					tct.Content = content
					tct.Caption = bt.Caption
					if err := tx.Save(&tct).Error; err != nil {
						return err
					}
				}
			}
		}
		return nil
	})
	if txErr != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save translations: " + txErr.Error()})
	}

	database.DB.Preload("Translations").Preload("Contents.Translations").First(&topic, topic.ID)
	return c.JSON(topic)
}
