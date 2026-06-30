package controllers

import (
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetContests godoc
// @Summary Get all contests
// @Description Get a list of public contests
// @Tags Contests
// @Produce json
// @Success 200 {array} models.Contest
// @Router /contests [get]
func GetContests(c *fiber.Ctx) error {
	var contests []models.Contest
	database.DB.Where("visibility = 'public'").Order("start_time desc").Find(&contests)
	return c.JSON(contests)
}

// GetContest godoc
// @Summary Get a single contest
// @Description Get contest details by ID
// @Tags Contests
// @Produce json
// @Param id path int true "Contest ID"
// @Success 200 {object} models.Contest
// @Router /contests/{id} [get]
func GetContest(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, role := getUserIDFromToken(c)

	var contest models.Contest

	// Load basic info first
	if err := database.DB.Preload("Participants").First(&contest, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Contest not found"})
	}

	// Check if we should show problems
	now := time.Now()
	isAuthor := contest.AuthorID == uint(userID) || role == "admin"
	isStarted := now.After(contest.StartTime)

	if isAuthor || isStarted {
		// Load problems
		database.DB.Preload("Problems.Problem").First(&contest, id)
	} else {
		// Hide problems if not started and not author
		contest.Problems = nil
	}

	return c.JSON(contest)
}

// CreateContest godoc
// @Summary Create a new contest
// @Description Create a new contest
// @Tags Contests
// @Accept json
// @Produce json
// @Param contest body models.Contest true "Contest Data"
// @Success 200 {object} models.Contest
// @Router /contests [post]
func CreateContest(c *fiber.Ctx) error {
	contest := new(models.Contest)
	if err := c.BodyParser(contest); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	userID := c.Locals("user_id").(float64)
	contest.AuthorID = uint(userID)
	contest.Status = "draft"

	database.DB.Create(&contest)
	return c.JSON(contest)
}

// UpdateContest godoc
// @Summary Update a contest
// @Description Update contest details (author/admin only)
// @Tags Contests
// @Accept json
// @Produce json
// @Param id path int true "Contest ID"
// @Success 200 {object} models.Contest
// @Router /contests/{id} [put]
func UpdateContest(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var contest models.Contest
	if err := database.DB.First(&contest, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Contest not found"})
	}

	if contest.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	type UpdateRequest struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		StartTime   time.Time `json:"start_time"`
		EndTime     time.Time `json:"end_time"`
		Visibility  string    `json:"visibility"`
		Status      string    `json:"status"`
	}
	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	contest.Title = req.Title
	contest.Description = req.Description
	contest.StartTime = req.StartTime
	contest.EndTime = req.EndTime
	if req.Visibility != "" {
		contest.Visibility = req.Visibility
	}
	if req.Status != "" {
		contest.Status = req.Status
	}

	database.DB.Save(&contest)
	return c.JSON(contest)
}

// AddProblemToContest godoc
// @Summary Add problem to contest
// @Description Add an existing problem to a contest
// @Tags Contests
// @Param id path int true "Contest ID"
// @Param body body object true "Problem ID"
// @Success 200 {object} models.ContestProblem
// @Router /contests/{id}/problems [post]
func AddProblemToContest(c *fiber.Ctx) error {
	contestID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid contest ID"})
	}

	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var contest models.Contest
	if err := database.DB.First(&contest, contestID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Contest not found"})
	}
	if contest.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	type Request struct {
		ProblemID uint `json:"problem_id"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	contestProblem := models.ContestProblem{
		ContestID: uint(contestID),
		ProblemID: req.ProblemID,
	}
	database.DB.Create(&contestProblem)
	return c.JSON(contestProblem)
}

// JoinContest godoc
// @Summary Join a contest
// @Description Register for a contest
// @Tags Contests
// @Param id path int true "Contest ID"
// @Success 200 {object} map[string]string
// @Router /contests/{id}/join [post]
func JoinContest(c *fiber.Ctx) error {
	contestID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid contest ID"})
	}
	userID := c.Locals("user_id").(float64)

	var count int64
	database.DB.Model(&models.ContestParticipant{}).
		Where("contest_id = ? AND user_id = ?", contestID, userID).
		Count(&count)

	if count > 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Already joined"})
	}

	participant := models.ContestParticipant{
		ContestID: uint(contestID),
		UserID:    uint(userID),
		JoinedAt:  time.Now(),
	}
	database.DB.Create(&participant)

	return c.JSON(fiber.Map{"message": "Joined successfully"})
}

// RemoveProblemFromContest godoc
// @Summary Remove problem from contest
// @Description Remove a problem from a contest (author/admin only)
// @Tags Contests
// @Param id path int true "Contest ID"
// @Param problem_id path int true "Problem ID"
// @Success 200 {object} map[string]string
// @Router /contests/{id}/problems/{problem_id} [delete]
func RemoveProblemFromContest(c *fiber.Ctx) error {
	contestID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid contest ID"})
	}
	problemID, err := c.ParamsInt("problem_id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid problem ID"})
	}

	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var contest models.Contest
	if err := database.DB.First(&contest, contestID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Contest not found"})
	}
	if contest.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	database.DB.Where("contest_id = ? AND problem_id = ?", contestID, problemID).Delete(&models.ContestProblem{})
	return c.JSON(fiber.Map{"message": "Problem removed from contest"})
}

// GetContestLeaderboard godoc
// @Summary Get contest leaderboard
// @Description Get ICPC-style ranking: sorted by solved count DESC, penalty ASC
// @Tags Contests
// @Param id path int true "Contest ID"
// @Success 200 {array} object
// @Router /contests/{id}/leaderboard [get]
func GetContestLeaderboard(c *fiber.Ctx) error {
	contestID := c.Params("id")

	type Rank struct {
		UserID      uint   `json:"user_id"`
		UserName    string `json:"user_name"`
		SolvedCount int64  `json:"solved_count"`
		Penalty     int    `json:"penalty"`
	}

	var ranks []Rank

	// ICPC scoring: penalty = minutes_to_first_ac + 20 * wrong_submissions_before_ac
	database.DB.Raw(`
		WITH first_ac AS (
			SELECT user_id, problem_id, MIN(created_at) AS ac_time
			FROM submissions
			WHERE contest_id = ? AND status = 'Accepted'
			GROUP BY user_id, problem_id
		),
		wrong_before_ac AS (
			SELECT s.user_id, s.problem_id, COUNT(*) AS wrong_count
			FROM submissions s
			JOIN first_ac fa ON s.user_id = fa.user_id AND s.problem_id = fa.problem_id
			WHERE s.contest_id = ? AND s.status != 'Accepted' AND s.created_at < fa.ac_time
			GROUP BY s.user_id, s.problem_id
		),
		contest_start AS (SELECT start_time FROM contests WHERE id = ?)
		SELECT
			u.id AS user_id,
			u.name AS user_name,
			COUNT(fa.problem_id) AS solved_count,
			COALESCE(SUM(
				FLOOR(EXTRACT(EPOCH FROM (fa.ac_time - cs.start_time)) / 60)
				+ COALESCE(wba.wrong_count, 0) * 20
			), 0)::INTEGER AS penalty
		FROM users u
		JOIN first_ac fa ON u.id = fa.user_id
		CROSS JOIN contest_start cs
		LEFT JOIN wrong_before_ac wba ON fa.user_id = wba.user_id AND fa.problem_id = wba.problem_id
		GROUP BY u.id, u.name
		ORDER BY solved_count DESC, penalty ASC
	`, contestID, contestID, contestID).Scan(&ranks)

	return c.JSON(ranks)
}
