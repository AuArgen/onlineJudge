package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"
	"onlineJudge/backend/services/compiler"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"os"
	"strings"
)

// Helper to get user ID from token (if present)
func getUserIDFromToken(c *fiber.Ctx) (float64, string) {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return 0, ""
	}
	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if token != nil && token.Valid {
		claims := token.Claims.(jwt.MapClaims)
		return claims["user_id"].(float64), claims["role"].(string)
	}
	return 0, ""
}

// GetProblems godoc
// @Summary Get all problems
// @Description Retrieve a list of problems with filtering
// @Tags Problems
// @Produce json
// @Param search query string false "Search by title"
// @Param filter query string false "Filter: all, my, public, private"
// @Success 200 {array} models.Problem
// @Router /problems [get]
func GetProblems(c *fiber.Ctx) error {
	userID, role := getUserIDFromToken(c)
	search := c.Query("search")
	filter := c.Query("filter")

	var problems []models.Problem
	query := database.DB.Model(&models.Problem{})

	// Base visibility logic
	if role == "admin" {
		// Admin sees everything
	} else if userID > 0 {
		// User sees public + own problems + shared with them
		query = query.Where("visibility = 'public' OR author_id = ? OR id IN (SELECT problem_id FROM problem_accesses WHERE user_id = ?)", userID, userID)
	} else {
		// Guest sees only public
		query = query.Where("visibility = 'public'")
	}

	// Additional Filters
	switch filter {
	case "my":
		if userID > 0 {
			query = query.Where("author_id = ?", userID)
		} else {
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}
	case "public":
		query = query.Where("visibility = 'public'")
	case "private":
		if userID > 0 {
			query = query.Where("visibility = 'private' AND author_id = ?", userID)
		} else {
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}
		// "all" is default (handled by base logic)
	}

	// Search
	if search != "" {
		query = query.Where("title ILIKE ?", "%"+search+"%")
	}

	query.Order("created_at desc").Find(&problems)

	// Calculate SolvedCount
	for i := range problems {
		var count int64
		database.DB.Model(&models.Submission{}).
			Where("problem_id = ? AND status = 'Accepted'", problems[i].ID).
			Distinct("user_id").
			Count(&count)
		problems[i].SolvedCount = count
	}

	return c.JSON(problems)
}

// GetProblem godoc
// @Summary Get a single problem
// @Description Retrieve a problem by ID
// @Tags Problems
// @Produce json
// @Param id path int true "Problem ID"
// @Param token query string false "Share Token"
// @Success 200 {object} models.Problem
// @Router /problems/{id} [get]
func GetProblem(c *fiber.Ctx) error {
	id := c.Params("id")
	shareToken := c.Query("token")
	userID, role := getUserIDFromToken(c)

	var problem models.Problem

	if err := database.DB.Preload("AccessList").First(&problem, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	// Access Control
	hasAccess := false
	if problem.Visibility == "public" {
		hasAccess = true
	} else if problem.AuthorID == uint(userID) || role == "admin" {
		hasAccess = true
	} else if shareToken != "" && problem.ShareToken == shareToken {
		hasAccess = true
	} else if userID > 0 {
		// Check AccessList
		var count int64
		database.DB.Model(&models.ProblemAccess{}).
			Where("problem_id = ? AND user_id = ?", problem.ID, userID).
			Count(&count)
		if count > 0 {
			hasAccess = true
		}
	}

	if !hasAccess {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	// If user is author or admin, load ALL test cases
	if problem.AuthorID == uint(userID) || role == "admin" {
		database.DB.Preload("TestCases").First(&problem, id)
	} else {
		// Otherwise, load only SAMPLE test cases
		database.DB.Preload("TestCases", "is_sample = ?", true).First(&problem, id)
	}

	return c.JSON(problem)
}

// CreateProblem godoc
// @Summary Create a new problem
// @Description Create a new coding problem (Draft)
// @Tags Problems
// @Accept json
// @Produce json
// @Param problem body models.Problem true "Problem Data"
// @Success 200 {object} models.Problem
// @Failure 400 {object} map[string]string
// @Router /problems [post]
func CreateProblem(c *fiber.Ctx) error {
	problem := new(models.Problem)
	if err := c.BodyParser(problem); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Set defaults
	problem.Status = "draft"
	problem.Visibility = "private"
	// Get AuthorID from JWT (middleware)
	userID := c.Locals("user_id").(float64)
	problem.AuthorID = uint(userID)

	database.DB.Create(&problem)
	return c.JSON(problem)
}

// UpdateProblem godoc
// @Summary Update a problem
// @Description Update an existing problem
// @Tags Problems
// @Accept json
// @Produce json
// @Param id path int true "Problem ID"
// @Param problem body models.Problem true "Problem Data"
// @Success 200 {object} models.Problem
// @Router /problems/{id} [put]
func UpdateProblem(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var problem models.Problem
	if err := database.DB.First(&problem, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	// Check ownership
	if problem.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	// Parse updates
	type UpdateRequest struct {
		Title            string  `json:"title"`
		Description      string  `json:"description"`
		TimeLimit        float64 `json:"time_limit"`
		MemoryLimit      int     `json:"memory_limit"`
		Visibility       string  `json:"visibility"`
		Status           string  `json:"status"`
		AuthorSourceCode string  `json:"author_source_code"`
		AuthorLanguage   string  `json:"author_language"`
	}
	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Apply updates
	problem.Title = req.Title
	problem.Description = req.Description
	problem.TimeLimit = req.TimeLimit
	problem.MemoryLimit = req.MemoryLimit
	problem.Visibility = req.Visibility
	problem.Status = req.Status
	problem.AuthorSourceCode = req.AuthorSourceCode
	problem.AuthorLanguage = req.AuthorLanguage

	database.DB.Save(&problem)
	return c.JSON(problem)
}

// DeleteProblem godoc
// @Summary Delete a problem
// @Description Delete a problem by ID
// @Tags Problems
// @Param id path int true "Problem ID"
// @Success 200 {object} map[string]string
// @Router /problems/{id} [delete]
func DeleteProblem(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var problem models.Problem
	if err := database.DB.First(&problem, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	// Check ownership
	if problem.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	database.DB.Delete(&problem)
	return c.JSON(fiber.Map{"message": "Problem deleted"})
}

// AddTestCase godoc
// @Summary Add a test case
// @Description Add a test case to a problem (Output is auto-generated from author solution)
// @Tags Problems
// @Accept json
// @Produce json
// @Param id path int true "Problem ID"
// @Param testcase body models.TestCase true "Test Case Data (Input only)"
// @Success 200 {object} models.TestCase
// @Router /problems/{id}/testcases [post]
func AddTestCase(c *fiber.Ctx) error {
	problemID := c.Params("id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var problem models.Problem
	if err := database.DB.First(&problem, problemID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	if problem.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	testCase := new(models.TestCase)
	if err := c.BodyParser(testCase); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Check for duplicates
	var count int64
	database.DB.Model(&models.TestCase{}).
		Where("problem_id = ? AND input = ?", problem.ID, testCase.Input).
		Count(&count)

	if count > 0 {
		return c.Status(409).JSON(fiber.Map{"error": "Duplicate test case (input already exists)"})
	}

	// Auto-generate Output using Author's Solution
	if problem.AuthorSourceCode == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Author solution is missing. Please save author solution first."})
	}

	langID := 0
	switch problem.AuthorLanguage {
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
		langID = 71
	}

	compSubmission := compiler.CompilerSubmission{
		SourceCode:  problem.AuthorSourceCode,
		LanguageID:  langID,
		Stdin:       testCase.Input,
		TimeLimit:   5.0,
		MemoryLimit: 256,
	}

	result, err := compiler.ExecuteCode(compSubmission)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Execution failed: " + err.Error()})
	}
	if result.Stderr != "" {
		return c.Status(400).JSON(fiber.Map{"error": "Author solution Runtime Error: " + result.Stderr})
	}

	// Set the generated output
	testCase.ExpectedOutput = strings.TrimSpace(result.Stdout)
	testCase.ProblemID = problem.ID

	database.DB.Create(&testCase)
	return c.JSON(testCase)
}

// DeleteTestCase godoc
// @Summary Delete a test case
// @Description Delete a test case by ID
// @Tags Problems
// @Param id path int true "Problem ID"
// @Param testcase_id path int true "Test Case ID"
// @Success 200 {object} map[string]string
// @Router /problems/{id}/testcases/{testcase_id} [delete]
func DeleteTestCase(c *fiber.Ctx) error {
	problemID := c.Params("id")
	testCaseID := c.Params("testcase_id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var problem models.Problem
	if err := database.DB.First(&problem, problemID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	if problem.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	database.DB.Delete(&models.TestCase{}, testCaseID)
	return c.JSON(fiber.Map{"message": "Test case deleted"})
}

// GenerateOutput godoc
// @Summary Generate output for a test case
// @Description Run author's code against input to generate output
// @Tags Problems
// @Accept json
// @Produce json
// @Param request body object true "Input and Code"
// @Success 200 {object} map[string]string
// @Router /problems/generate-output [post]
func GenerateOutput(c *fiber.Ctx) error {
	type Request struct {
		Language   string `json:"language"`
		SourceCode string `json:"source_code"`
		Input      string `json:"input"`
	}
	var req Request
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
	}

	compSubmission := compiler.CompilerSubmission{
		SourceCode:  req.SourceCode,
		LanguageID:  langID,
		Stdin:       req.Input,
		TimeLimit:   5.0, // Default limit for generation
		MemoryLimit: 256,
	}

	result, err := compiler.ExecuteCode(compSubmission)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Execution failed: " + err.Error()})
	}
	if result.Stderr != "" {
		return c.Status(400).JSON(fiber.Map{"error": "Runtime Error: " + result.Stderr})
	}

	return c.JSON(fiber.Map{"output": result.Stdout})
}

// ShareProblem godoc
// @Summary Share problem with user
// @Description Grant access to a private problem via email
// @Tags Problems
// @Param id path int true "Problem ID"
// @Param body body object true "Email"
// @Success 200 {object} map[string]string
// @Router /problems/{id}/share [post]
func ShareProblem(c *fiber.Ctx) error {
	problemID := c.Params("id")
	userID := c.Locals("user_id").(float64)

	var problem models.Problem
	if err := database.DB.First(&problem, problemID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	if problem.AuthorID != uint(userID) {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	type ShareRequest struct {
		Email string `json:"email"`
	}
	var req ShareRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Find user by email (if exists)
	var user models.User
	var targetUserID *uint
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err == nil {
		targetUserID = &user.ID
	}

	// Check if already shared
	var count int64
	database.DB.Model(&models.ProblemAccess{}).
		Where("problem_id = ? AND email = ?", problem.ID, req.Email).
		Count(&count)

	if count > 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Already shared with this email"})
	}

	access := models.ProblemAccess{
		ProblemID: problem.ID,
		UserID:    targetUserID,
		Email:     req.Email,
	}
	database.DB.Create(&access)

	return c.JSON(fiber.Map{"message": "Problem shared successfully"})
}

// GenerateShareToken godoc
// @Summary Generate share token
// @Description Generate a unique token for link sharing
// @Tags Problems
// @Param id path int true "Problem ID"
// @Success 200 {object} map[string]string
// @Router /problems/{id}/share-token [post]
func GenerateShareToken(c *fiber.Ctx) error {
	problemID := c.Params("id")
	userID := c.Locals("user_id").(float64)

	var problem models.Problem
	if err := database.DB.First(&problem, problemID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}

	if problem.AuthorID != uint(userID) {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	// Generate random token
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}
	token := hex.EncodeToString(bytes)

	problem.ShareToken = token
	database.DB.Save(&problem)

	return c.JSON(fiber.Map{"token": token})
}
