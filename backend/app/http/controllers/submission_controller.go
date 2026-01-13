package controllers

import (
	"fmt"
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"
	"onlineJudge/backend/services/compiler"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type SubmitRequest struct {
	ProblemID  uint   `json:"problem_id"`
	ContestID  *uint  `json:"contest_id,omitempty"` // Optional
	Language   string `json:"language"`
	SourceCode string `json:"source_code"`
}

// SubmitSolution godoc
// @Summary Submit a solution
// @Description Submit code for a problem
// @Tags Submissions
// @Accept json
// @Produce json
// @Param submission body SubmitRequest true "Submission Data"
// @Success 200 {object} models.Submission
// @Router /submit [post]
func SubmitSolution(c *fiber.Ctx) error {
	var req SubmitRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	userID := c.Locals("user_id").(float64)

	// 1. Get Problem and Test Cases
	var problem models.Problem
	if err := database.DB.Preload("TestCases").First(&problem, req.ProblemID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	// 2. Contest Validation (If submitting to a contest)
	if req.ContestID != nil && *req.ContestID > 0 {
		var contest models.Contest
		if err := database.DB.First(&contest, *req.ContestID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Contest not found"})
		}

		// Check Time
		now := time.Now()
		if now.Before(contest.StartTime) {
			return c.Status(403).JSON(fiber.Map{"error": "Contest has not started yet"})
		}
		if now.After(contest.EndTime) {
			return c.Status(403).JSON(fiber.Map{"error": "Contest has ended"})
		}

		// Check Participation
		var count int64
		database.DB.Model(&models.ContestParticipant{}).
			Where("contest_id = ? AND user_id = ?", contest.ID, userID).
			Count(&count)
		if count == 0 {
			return c.Status(403).JSON(fiber.Map{"error": "You are not registered for this contest"})
		}

		// Check if problem belongs to contest
		var problemCount int64
		database.DB.Model(&models.ContestProblem{}).
			Where("contest_id = ? AND problem_id = ?", contest.ID, problem.ID).
			Count(&problemCount)
		if problemCount == 0 {
			return c.Status(400).JSON(fiber.Map{"error": "Problem does not belong to this contest"})
		}
	}

	// 3. Create Submission Record
	submission := models.Submission{
		UserID:     uint(userID),
		ProblemID:  req.ProblemID,
		ContestID:  req.ContestID,
		Language:   req.Language,
		SourceCode: req.SourceCode,
		Status:     "Pending",
	}
	database.DB.Create(&submission)

	// 4. Run Tests (Sync for simplicity)
	langID := 0
	switch req.Language {
	case "python":
		langID = 71
	case "cpp":
		langID = 54
	case "java":
		langID = 62
	case "go":
		langID = 60
	case "javascript":
		langID = 63
	}

	compSubmission := compiler.CompilerSubmission{
		SourceCode:  req.SourceCode,
		LanguageID:  langID,
		TimeLimit:   problem.TimeLimit,
		MemoryLimit: problem.MemoryLimit,
	}

	finalStatus := "Accepted"
	totalTime := ""

	for i, tc := range problem.TestCases {
		compSubmission.Stdin = tc.Input
		result, err := compiler.ExecuteCode(compSubmission)

		status := "Accepted"
		userOutput := strings.TrimSpace(result.Stdout)
		expectedOutput := strings.TrimSpace(tc.ExpectedOutput)

		if err != nil {
			status = "System Error"
		} else if result.Stderr != "" {
			status = "Runtime Error"
		} else if userOutput != expectedOutput {
			status = "Wrong Answer"
			// Debug Log
			fmt.Printf("❌ Test #%d Failed:\nInput: %q\nExpected: %q\nGot: %q\n", i+1, tc.Input, expectedOutput, userOutput)
		}

		// Save Detail
		database.DB.Create(&models.SubmissionDetail{
			SubmissionID:  submission.ID,
			TestCaseID:    tc.ID,
			Status:        status,
			ExecutionTime: result.ExecutionTime,
			IsSample:      tc.IsSample,
		})

		// Update total time (take the max or sum, usually max for parallel, sum for serial)
		totalTime = result.ExecutionTime

		if status != "Accepted" {
			finalStatus = status
			break
		}
	}

	// Update Submission
	submission.Status = finalStatus
	submission.ExecutionTime = totalTime
	database.DB.Save(&submission)

	// Return result with details
	var details []models.SubmissionDetail
	database.DB.Where("submission_id = ?", submission.ID).Find(&details)
	submission.Details = details

	return c.JSON(submission)
}

// GetHistory godoc
// @Summary Get submission history
// @Description Get history for a problem
// @Tags Submissions
// @Produce json
// @Param problem_id query int true "Problem ID"
// @Success 200 {array} models.Submission
// @Router /history [get]
func GetHistory(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(float64)
	problemID := c.Query("problem_id")

	var submissions []models.Submission
	query := database.DB.Where("user_id = ?", userID)

	if problemID != "" {
		query = query.Where("problem_id = ?", problemID)
	}

	query.Order("created_at desc").Find(&submissions)
	return c.JSON(submissions)
}

// GetSubmission godoc
// @Summary Get submission details
// @Description Get details of a specific submission
// @Tags Submissions
// @Produce json
// @Param id path int true "Submission ID"
// @Success 200 {object} models.Submission
// @Router /submission/{id} [get]
func GetSubmission(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(float64)

	var submission models.Submission
	if err := database.DB.Preload("Details").First(&submission, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Submission not found"})
	}

	// Check access (Owner or Solved)
	if submission.UserID != uint(userID) {
		// Check if user has solved this problem
		var count int64
		database.DB.Model(&models.Submission{}).Where("user_id = ? AND problem_id = ? AND status = 'Accepted'", userID, submission.ProblemID).Count(&count)
		if count == 0 {
			return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
		}
	}

	return c.JSON(submission)
}
