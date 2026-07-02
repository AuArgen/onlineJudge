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
	ContestID  *uint  `json:"contest_id,omitempty"`
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

	// 2. Contest Validation
	if req.ContestID != nil && *req.ContestID > 0 {
		var contest models.Contest
		if err := database.DB.First(&contest, *req.ContestID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Contest not found"})
		}

		now := time.Now()
		if now.Before(contest.StartTime) {
			return c.Status(403).JSON(fiber.Map{"error": "Contest has not started yet"})
		}
		if now.After(contest.EndTime) {
			return c.Status(403).JSON(fiber.Map{"error": "Contest has ended"})
		}

		var count int64
		database.DB.Model(&models.ContestParticipant{}).
			Where("contest_id = ? AND user_id = ?", contest.ID, userID).
			Count(&count)
		if count == 0 {
			return c.Status(403).JSON(fiber.Map{"error": "You are not registered for this contest"})
		}

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

	// 4. Map language to ID
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

	// 5. Collect all test case inputs
	inputs := make([]string, len(problem.TestCases))
	for i, tc := range problem.TestCases {
		inputs[i] = tc.Input
	}

	// 6. Run all test cases in a single container (compile once, run N times)
	results, err := compiler.ExecuteCode(compiler.CompilerSubmission{
		SourceCode:  req.SourceCode,
		LanguageID:  langID,
		TimeLimit:   problem.TimeLimit,
		MemoryLimit: problem.MemoryLimit,
	}, inputs)

	if err != nil {
		submission.Status = "System Error"
		database.DB.Save(&submission)
		return c.JSON(submission)
	}

	finalStatus := "Accepted"
	totalTime := ""

	for i, tc := range problem.TestCases {
		result := results[i]
		status := "Accepted"
		// Judging always compares the full, untruncated output.
		userOutput := strings.TrimSpace(result.Stdout)
		expectedOutput := strings.TrimSpace(tc.ExpectedOutput)

		if result.TimedOut {
			status = "Time Limit Exceeded"
		} else if result.Stderr != "" {
			status = "Runtime Error"
		} else if userOutput != expectedOutput {
			status = "Wrong Answer"
			fmt.Printf("❌ Test #%d Failed:\nInput: %q\nExpected: %q\nGot: %q\n", i+1, tc.Input, expectedOutput, userOutput)
		}

		detail := models.SubmissionDetail{
			SubmissionID:  submission.ID,
			TestCaseID:    tc.ID,
			Status:        status,
			ExecutionTime: result.ExecutionTime,
			IsSample:      tc.IsSample,
		}

		// Only sample test cases may reveal their input/expected/actual
		// output to the client — hidden tests must never leak their data,
		// so their SubmissionDetail carries the status only.
		if tc.IsSample {
			var truncatedAny bool
			detail.Input, _ = truncateForDisplay(tc.Input)
			detail.ExpectedOutput, truncatedAny = truncateForDisplay(tc.ExpectedOutput)
			var t bool
			detail.ActualOutput, t = truncateForDisplay(result.Stdout)
			truncatedAny = truncatedAny || t
			detail.Stderr, t = truncateForDisplay(result.Stderr)
			truncatedAny = truncatedAny || t
			detail.Truncated = truncatedAny
		}

		database.DB.Create(&detail)

		totalTime = result.ExecutionTime

		if status != "Accepted" {
			finalStatus = status
			break
		}
	}

	submission.Status = finalStatus
	submission.ExecutionTime = totalTime
	database.DB.Save(&submission)

	var details []models.SubmissionDetail
	database.DB.Where("submission_id = ?", submission.ID).Find(&details)
	submission.Details = details

	return c.JSON(submission)
}

// RunCode godoc
// @Summary Run code with custom input
// @Description Execute code against custom stdin without submitting
// @Tags Submissions
// @Accept json
// @Produce json
// @Router /run [post]
func RunCode(c *fiber.Ctx) error {
	type RunRequest struct {
		Language   string `json:"language"`
		SourceCode string `json:"source_code"`
		Stdin      string `json:"stdin"`
	}
	var req RunRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

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
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Unsupported language"})
	}

	results, err := compiler.ExecuteCode(compiler.CompilerSubmission{
		SourceCode:  req.SourceCode,
		LanguageID:  langID,
		TimeLimit:   10.0,
		MemoryLimit: 256,
	}, []string{req.Stdin})

	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	r := results[0]
	stdout, stdoutTruncated := truncateForDisplay(r.Stdout)
	stderr, stderrTruncated := truncateForDisplay(r.Stderr)
	return c.JSON(fiber.Map{
		"stdout":           stdout,
		"stderr":           stderr,
		"execution_time":   r.ExecutionTime,
		"timed_out":        r.TimedOut,
		"stdout_truncated": stdoutTruncated,
		"stderr_truncated": stderrTruncated,
	})
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

	if submission.UserID != uint(userID) {
		var count int64
		database.DB.Model(&models.Submission{}).Where("user_id = ? AND problem_id = ? AND status = 'Accepted'", userID, submission.ProblemID).Count(&count)
		if count == 0 {
			return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
		}
	}

	return c.JSON(submission)
}
