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

// GetContestLeaderboard godoc
// @Summary Get contest leaderboard
// @Description Get ranking for a contest
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
	}

	var ranks []Rank

	database.DB.Raw(`
		SELECT 
			u.id as user_id, 
			u.name as user_name, 
			COUNT(DISTINCT s.problem_id) as solved_count
		FROM users u
		JOIN submissions s ON u.id = s.user_id
		WHERE s.contest_id = ? AND s.status = 'Accepted'
		GROUP BY u.id, u.name
		ORDER BY solved_count DESC
	`, contestID).Scan(&ranks)

	return c.JSON(ranks)
}
