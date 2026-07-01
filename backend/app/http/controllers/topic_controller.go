package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// extractYouTubeID validates and extracts the YouTube video ID from a URL.
// Supported formats:
//   - https://www.youtube.com/watch?v=VIDEO_ID
//   - https://youtu.be/VIDEO_ID
//   - https://www.youtube.com/embed/VIDEO_ID
func extractYouTubeID(url string) string {
	patterns := []*regexp.Regexp{
		regexp.MustCompile(`(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})`),
	}
	for _, re := range patterns {
		if m := re.FindStringSubmatch(url); len(m) == 2 {
			return m[1]
		}
	}
	return ""
}

func generateTopicToken() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func canViewTopic(topic *models.Topic, userID float64, role string) bool {
	if topic.Visibility == "public" {
		return true
	}
	if userID <= 0 {
		return false
	}
	if role == "admin" || topic.AuthorID == uint(userID) {
		return true
	}
	for _, a := range topic.AccessList {
		if a.UserID != nil && *a.UserID == uint(userID) {
			return true
		}
	}
	return false
}

// GetTopics lists topics visible to the current user.
func GetTopics(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topics []models.Topic
	query := database.DB.Preload("Author").
		Preload("Children").
		Where("parent_id IS NULL")

	if role == "admin" {
		// admin sees all
	} else {
		query = query.Where(
			"visibility = 'public' OR author_id = ? OR id IN (SELECT topic_id FROM topic_accesses WHERE user_id = ?)",
			uint(userID), uint(userID),
		)
	}

	filter := c.Query("filter")
	switch filter {
	case "my":
		query = query.Where("author_id = ?", uint(userID))
	case "public":
		query = query.Where("visibility = 'public'")
	}

	query.Order("created_at desc").Find(&topics)

	// attach problem count and subtopic count
	type TopicResponse struct {
		models.Topic
		ProblemCount  int64 `json:"problem_count"`
		SubtopicCount int64 `json:"subtopic_count"`
	}

	result := make([]TopicResponse, 0, len(topics))
	for _, t := range topics {
		var pCount, sCount int64
		database.DB.Model(&models.TopicProblem{}).Where("topic_id = ?", t.ID).Count(&pCount)
		database.DB.Model(&models.Topic{}).Where("parent_id = ?", t.ID).Count(&sCount)
		result = append(result, TopicResponse{Topic: t, ProblemCount: pCount, SubtopicCount: sCount})
	}

	return c.JSON(result)
}

// CreateTopic creates a new root topic or subtopic.
func CreateTopic(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(float64)

	type Request struct {
		Title      string `json:"title"`
		Visibility string `json:"visibility"`
		ParentID   *uint  `json:"parent_id"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Title) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Title is required"})
	}

	if req.Visibility != "public" {
		req.Visibility = "private"
	}

	// If adding as subtopic, verify parent belongs to user
	if req.ParentID != nil {
		var parent models.Topic
		if err := database.DB.First(&parent, *req.ParentID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Parent topic not found"})
		}
		if parent.AuthorID != uint(userID) {
			role := c.Locals("role").(string)
			if role != "admin" {
				return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
			}
		}
	}

	topic := models.Topic{
		Title:      strings.TrimSpace(req.Title),
		AuthorID:   uint(userID),
		ParentID:   req.ParentID,
		Visibility: req.Visibility,
		ShareToken: generateTopicToken(),
	}
	database.DB.Create(&topic)
	return c.Status(201).JSON(topic)
}

// GetTopic returns full topic details (contents, subtopics, problems, access list).
func GetTopic(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, role := getUserIDFromToken(c)

	var topic models.Topic
	if err := database.DB.
		Preload("Author").
		Preload("Contents").
		Preload("AccessList").
		Preload("Problems.Problem").
		Preload("Children").
		First(&topic, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}

	if !canViewTopic(&topic, userID, role) {
		// Fall back to email-based access check (user may have been invited before registering)
		allowed := false
		if userID > 0 {
			var currentUser models.User
			if database.DB.First(&currentUser, uint(userID)).Error == nil {
				for i, a := range topic.AccessList {
					if strings.EqualFold(a.Email, currentUser.Email) {
						allowed = true
						// Lazy-resolve UserID so future checks are fast
						if a.UserID == nil {
							uid := currentUser.ID
							database.DB.Model(&topic.AccessList[i]).Update("user_id", uid)
						}
						break
					}
				}
			}
		}
		if !allowed {
			return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
		}
	}

	// For each problem, attach solved status for the current user
	type ProblemWithStatus struct {
		models.TopicProblem
		UserSolved bool `json:"user_solved"`
	}

	problems := make([]ProblemWithStatus, 0, len(topic.Problems))
	for _, tp := range topic.Problems {
		var count int64
		if userID > 0 {
			database.DB.Model(&models.Submission{}).
				Where("user_id = ? AND problem_id = ? AND status = 'Accepted'", uint(userID), tp.ProblemID).
				Count(&count)
		}
		problems = append(problems, ProblemWithStatus{TopicProblem: tp, UserSolved: count > 0})
	}

	return c.JSON(fiber.Map{
		"topic":    topic,
		"problems": problems,
	})
}

// UpdateTopic updates title and/or visibility of a topic.
func UpdateTopic(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	type Request struct {
		Title      string `json:"title"`
		Visibility string `json:"visibility"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}
	if strings.TrimSpace(req.Title) != "" {
		topic.Title = strings.TrimSpace(req.Title)
	}
	if req.Visibility == "public" || req.Visibility == "private" {
		topic.Visibility = req.Visibility
	}

	database.DB.Save(&topic)
	return c.JSON(topic)
}

// DeleteTopic deletes a topic, all subtopics recursively, and all cascaded data.
func DeleteTopic(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	deleteSubtopicsRecursive(topic.ID)
	database.DB.Delete(&topic)
	return c.JSON(fiber.Map{"message": "Topic deleted"})
}

func deleteSubtopicsRecursive(parentID uint) {
	var children []models.Topic
	database.DB.Where("parent_id = ?", parentID).Find(&children)
	for _, child := range children {
		deleteSubtopicsRecursive(child.ID)
		database.DB.Delete(&child)
	}
}

// ---- Content blocks ----

// AddContent adds a rich content block to a topic.
func AddContent(c *fiber.Ctx) error {
	topicID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid topic ID"})
	}
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, topicID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	type Request struct {
		Type     string `json:"type"`
		Content  string `json:"content"`
		Caption  string `json:"caption"`
		OrderNum int    `json:"order_num"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	validTypes := map[string]bool{"text": true, "image": true, "video": true, "link": true}
	if !validTypes[req.Type] {
		return c.Status(400).JSON(fiber.Map{"error": "Type must be one of: text, image, video, link"})
	}

	if req.Type == "video" {
		videoID := extractYouTubeID(req.Content)
		if videoID == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid YouTube URL. Use https://www.youtube.com/watch?v=... or https://youtu.be/..."})
		}
		req.Content = "https://www.youtube.com/embed/" + videoID
	}

	// Determine order: place after last existing block if not specified
	if req.OrderNum == 0 {
		var maxOrder struct{ Max int }
		database.DB.Model(&models.TopicContent{}).
			Select("COALESCE(MAX(order_num), 0) as max").
			Where("topic_id = ?", topicID).
			Scan(&maxOrder)
		req.OrderNum = maxOrder.Max + 1
	}

	block := models.TopicContent{
		TopicID:  uint(topicID),
		Type:     req.Type,
		Content:  req.Content,
		Caption:  req.Caption,
		OrderNum: req.OrderNum,
	}
	database.DB.Create(&block)
	return c.Status(201).JSON(block)
}

// UpdateContent updates a content block.
func UpdateContent(c *fiber.Ctx) error {
	topicID, _ := c.ParamsInt("id")
	contentID, _ := c.ParamsInt("content_id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, topicID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	var block models.TopicContent
	if err := database.DB.Where("id = ? AND topic_id = ?", contentID, topicID).First(&block).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Content block not found"})
	}

	type Request struct {
		Content  string `json:"content"`
		Caption  string `json:"caption"`
		OrderNum int    `json:"order_num"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	if block.Type == "video" && req.Content != "" {
		videoID := extractYouTubeID(req.Content)
		if videoID == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid YouTube URL"})
		}
		req.Content = "https://www.youtube.com/embed/" + videoID
	}

	if req.Content != "" {
		block.Content = req.Content
	}
	block.Caption = req.Caption
	if req.OrderNum > 0 {
		block.OrderNum = req.OrderNum
	}

	database.DB.Save(&block)
	return c.JSON(block)
}

// DeleteContent removes a content block.
func DeleteContent(c *fiber.Ctx) error {
	topicID, _ := c.ParamsInt("id")
	contentID, _ := c.ParamsInt("content_id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, topicID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	database.DB.Where("id = ? AND topic_id = ?", contentID, topicID).Delete(&models.TopicContent{})
	return c.JSON(fiber.Map{"message": "Content block deleted"})
}

// ---- Problems ----

// AddTopicProblem adds a problem to a topic.
func AddTopicProblem(c *fiber.Ctx) error {
	topicID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid topic ID"})
	}
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, topicID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	type Request struct {
		ProblemID uint `json:"problem_id"`
		OrderNum  int  `json:"order_num"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil || req.ProblemID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "problem_id is required"})
	}

	// Verify problem exists and user has access to it
	var problem models.Problem
	if err := database.DB.First(&problem, req.ProblemID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Problem not found"})
	}
	if problem.Visibility != "public" && problem.AuthorID != uint(userID) && role != "admin" {
		var accessCount int64
		database.DB.Model(&models.ProblemAccess{}).
			Where("problem_id = ? AND user_id = ?", req.ProblemID, uint(userID)).
			Count(&accessCount)
		if accessCount == 0 {
			return c.Status(403).JSON(fiber.Map{"error": "You don't have access to this problem"})
		}
	}

	// Check duplicate
	var count int64
	database.DB.Model(&models.TopicProblem{}).
		Where("topic_id = ? AND problem_id = ?", topicID, req.ProblemID).
		Count(&count)
	if count > 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Problem already in this topic"})
	}

	if req.OrderNum == 0 {
		var maxOrder struct{ Max int }
		database.DB.Model(&models.TopicProblem{}).
			Select("COALESCE(MAX(order_num), 0) as max").
			Where("topic_id = ?", topicID).
			Scan(&maxOrder)
		req.OrderNum = maxOrder.Max + 1
	}

	tp := models.TopicProblem{
		TopicID:   uint(topicID),
		ProblemID: req.ProblemID,
		OrderNum:  req.OrderNum,
	}
	database.DB.Create(&tp)
	database.DB.Preload("Problem").First(&tp, tp.ID)
	return c.Status(201).JSON(tp)
}

// RemoveTopicProblem removes a problem from a topic.
func RemoveTopicProblem(c *fiber.Ctx) error {
	topicID, _ := c.ParamsInt("id")
	problemID, _ := c.ParamsInt("problem_id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, topicID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	database.DB.Where("topic_id = ? AND problem_id = ?", topicID, problemID).Delete(&models.TopicProblem{})
	return c.JSON(fiber.Map{"message": "Problem removed from topic"})
}

// ---- Sharing ----

// ShareTopicByEmail adds email/user access to a private topic.
func ShareTopicByEmail(c *fiber.Ctx) error {
	topicID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid topic ID"})
	}
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, topicID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	type Request struct {
		Email string `json:"email"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Email) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "email is required"})
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Resolve to user ID if registered
	var invitedUser models.User
	var invitedUserID *uint
	if err := database.DB.Where("email = ?", req.Email).First(&invitedUser).Error; err == nil {
		uid := invitedUser.ID
		invitedUserID = &uid
	}

	// Avoid duplicates
	var existing models.TopicAccess
	if err := database.DB.Where("topic_id = ? AND email = ?", topicID, req.Email).First(&existing).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"error": "Already shared with this email"})
	}

	access := models.TopicAccess{
		TopicID: uint(topicID),
		Email:   req.Email,
		UserID:  invitedUserID,
	}
	database.DB.Create(&access)
	return c.Status(201).JSON(access)
}

// RevokeTopicAccess removes an email's access from a topic.
func RevokeTopicAccess(c *fiber.Ctx) error {
	topicID, _ := c.ParamsInt("id")
	accessID, _ := c.ParamsInt("access_id")
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, topicID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	database.DB.Where("id = ? AND topic_id = ?", accessID, topicID).Delete(&models.TopicAccess{})
	return c.JSON(fiber.Map{"message": "Access revoked"})
}

// GenerateTopicShareToken creates or refreshes the share token for a topic.
func GenerateTopicShareToken(c *fiber.Ctx) error {
	topicID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid topic ID"})
	}
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.First(&topic, topicID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	if topic.ShareToken == "" {
		topic.ShareToken = generateTopicToken()
		database.DB.Save(&topic)
	}

	return c.JSON(fiber.Map{"share_token": topic.ShareToken})
}

// GetTopicByToken returns a topic accessible via its share token (no auth required).
func GetTopicByToken(c *fiber.Ctx) error {
	token := c.Params("token")
	userID, _ := getUserIDFromToken(c)

	var topic models.Topic
	if err := database.DB.
		Preload("Author").
		Preload("Contents").
		Preload("Problems.Problem").
		Preload("Children").
		Where("share_token = ?", token).
		First(&topic).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}

	type ProblemWithStatus struct {
		models.TopicProblem
		UserSolved bool `json:"user_solved"`
	}

	problems := make([]ProblemWithStatus, 0, len(topic.Problems))
	for _, tp := range topic.Problems {
		var count int64
		if userID > 0 {
			database.DB.Model(&models.Submission{}).
				Where("user_id = ? AND problem_id = ? AND status = 'Accepted'", uint(userID), tp.ProblemID).
				Count(&count)
		}
		problems = append(problems, ProblemWithStatus{TopicProblem: tp, UserSolved: count > 0})
	}

	return c.JSON(fiber.Map{
		"topic":    topic,
		"problems": problems,
	})
}

// ---- Analytics ----

// GetTopicAnalytics returns per-user solve stats for all problems in a topic.
func GetTopicAnalytics(c *fiber.Ctx) error {
	topicID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid topic ID"})
	}
	userID := c.Locals("user_id").(float64)
	role := c.Locals("role").(string)

	var topic models.Topic
	if err := database.DB.Preload("AccessList").First(&topic, topicID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}
	if topic.AuthorID != uint(userID) && role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	// Collect problem IDs in the topic
	var topicProblems []models.TopicProblem
	database.DB.Where("topic_id = ?", topicID).Find(&topicProblems)

	if len(topicProblems) == 0 {
		return c.JSON(fiber.Map{"problems": []interface{}{}, "users": []interface{}{}})
	}

	problemIDs := make([]uint, 0, len(topicProblems))
	for _, tp := range topicProblems {
		problemIDs = append(problemIDs, tp.ProblemID)
	}

	type UserStat struct {
		UserID      uint   `json:"user_id"`
		UserName    string `json:"user_name"`
		UserEmail   string `json:"user_email"`
		ProblemID   uint   `json:"problem_id"`
		ProblemTitle string `json:"problem_title"`
		Solved      bool   `json:"solved"`
		Attempts    int64  `json:"attempts"`
	}

	var stats []UserStat
	database.DB.Raw(`
		SELECT
			u.id AS user_id,
			u.name AS user_name,
			u.email AS user_email,
			p.id AS problem_id,
			p.title AS problem_title,
			BOOL_OR(s.status = 'Accepted') AS solved,
			COUNT(s.id) AS attempts
		FROM submissions s
		JOIN users u ON u.id = s.user_id
		JOIN problems p ON p.id = s.problem_id
		WHERE s.problem_id IN ? AND s.contest_id IS NULL
		GROUP BY u.id, u.name, u.email, p.id, p.title
		ORDER BY u.name, p.id
	`, problemIDs).Scan(&stats)

	return c.JSON(stats)
}
