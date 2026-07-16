package controllers

import (
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// learn_controller.go serves the public /learn curriculum section. Only
// topics that are both official (admin-curated) and public are ever exposed
// here, and no authentication is required — these pages must be crawlable
// by search engines.

// LearnNode is one topic in the curriculum tree, trimmed down to what the
// public learn pages need.
type LearnNode struct {
	ID           uint         `json:"id"`
	Slug         string       `json:"slug"`
	Title        string       `json:"title"`
	Summary      string       `json:"summary"`
	OrderNum     int          `json:"order_num"`
	HasContent   bool         `json:"has_content"`
	ProblemCount int64        `json:"problem_count"`
	UpdatedAt    time.Time    `json:"updated_at"`
	Children     []*LearnNode `json:"children"`
}

// GetLearnTracks returns the whole curriculum as a forest of trees: root
// official topics (tracks) with their nested levels/lessons. Content and
// problem counts are attached so the frontend can mark empty lessons as
// "coming soon" and the sitemap can skip them.
func GetLearnTracks(c *fiber.Ctx) error {
	lang := c.Query("lang")

	var topics []models.Topic
	database.DB.
		Preload("Translations").
		Where("is_official = ? AND visibility = 'public'", true).
		Order("order_num asc, id asc").
		Find(&topics)

	if len(topics) == 0 {
		return c.JSON([]*LearnNode{})
	}

	ids := make([]uint, 0, len(topics))
	for _, t := range topics {
		ids = append(ids, t.ID)
	}

	// Batch-load content and problem counts to avoid one query per topic.
	type countRow struct {
		TopicID uint
		Cnt     int64
	}
	contentCounts := map[uint]int64{}
	var rows []countRow
	database.DB.Raw(`SELECT topic_id, COUNT(*) AS cnt FROM topic_contents WHERE topic_id IN ? GROUP BY topic_id`, ids).Scan(&rows)
	for _, r := range rows {
		contentCounts[r.TopicID] = r.Cnt
	}

	problemCounts := map[uint]int64{}
	rows = nil
	database.DB.Raw(`
		SELECT tp.topic_id, COUNT(*) AS cnt
		FROM topic_problems tp
		JOIN problems p ON p.id = tp.problem_id
		WHERE tp.topic_id IN ? AND p.visibility = 'public' AND p.status = 'published'
		GROUP BY tp.topic_id`, ids).Scan(&rows)
	for _, r := range rows {
		problemCounts[r.TopicID] = r.Cnt
	}

	nodes := map[uint]*LearnNode{}
	for i := range topics {
		t := &topics[i]
		title, summary := t.Title, t.Summary
		for _, tr := range t.Translations {
			if tr.LanguageCode == lang {
				if tr.Title != "" {
					title = tr.Title
				}
				if tr.Summary != "" {
					summary = tr.Summary
				}
				break
			}
		}
		nodes[t.ID] = &LearnNode{
			ID:           t.ID,
			Slug:         t.Slug,
			Title:        title,
			Summary:      summary,
			OrderNum:     t.OrderNum,
			HasContent:   contentCounts[t.ID] > 0,
			ProblemCount: problemCounts[t.ID],
			UpdatedAt:    t.UpdatedAt,
			Children:     []*LearnNode{},
		}
	}

	roots := []*LearnNode{}
	for i := range topics {
		t := &topics[i]
		if t.ParentID != nil {
			if parent, ok := nodes[*t.ParentID]; ok {
				parent.Children = append(parent.Children, nodes[t.ID])
				continue
			}
		}
		roots = append(roots, nodes[t.ID])
	}

	return c.JSON(roots)
}

// learnCrumb is one breadcrumb / neighbor-lesson reference.
type learnCrumb struct {
	Slug  string `json:"slug"`
	Title string `json:"title"`
}

func learnTranslatedTitle(t *models.Topic, lang string) string {
	for _, tr := range t.Translations {
		if tr.LanguageCode == lang && tr.Title != "" {
			return tr.Title
		}
	}
	return t.Title
}

// GetLearnTopicBySlug returns one curriculum topic (track, level, or lesson)
// with its content blocks, published problems, child topics, breadcrumb
// chain, and prev/next siblings. No auth required, but if a valid token is
// sent the user's solved status is attached to each problem.
func GetLearnTopicBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	lang := c.Query("lang")
	userID, _ := getUserIDFromToken(c)

	var topic models.Topic
	if err := database.DB.
		Preload("Contents", func(db *gorm.DB) *gorm.DB { return db.Order("order_num asc, id asc") }).
		Preload("Contents.Translations").
		Preload("Contents.Variants").
		Preload("Translations").
		Preload("Problems", func(db *gorm.DB) *gorm.DB { return db.Order("order_num asc, id asc") }).
		Preload("Problems.Problem").
		Preload("Problems.Problem.Translations").
		Where("slug = ? AND is_official = ? AND visibility = 'public'", slug, true).
		First(&topic).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}

	applyTopicTranslation(&topic, lang)

	// Children (levels inside a track, lessons inside a level)
	var children []models.Topic
	database.DB.
		Preload("Translations").
		Where("parent_id = ? AND is_official = ? AND visibility = 'public'", topic.ID, true).
		Order("order_num asc, id asc").
		Find(&children)

	childNodes := make([]*LearnNode, 0, len(children))
	for i := range children {
		ch := &children[i]
		title, summary := ch.Title, ch.Summary
		for _, tr := range ch.Translations {
			if tr.LanguageCode == lang {
				if tr.Title != "" {
					title = tr.Title
				}
				if tr.Summary != "" {
					summary = tr.Summary
				}
				break
			}
		}
		var contentCount int64
		database.DB.Model(&models.TopicContent{}).Where("topic_id = ?", ch.ID).Count(&contentCount)
		var problemCount int64
		database.DB.Raw(`
			SELECT COUNT(*) FROM topic_problems tp
			JOIN problems p ON p.id = tp.problem_id
			WHERE tp.topic_id = ? AND p.visibility = 'public' AND p.status = 'published'`, ch.ID).Scan(&problemCount)
		childNodes = append(childNodes, &LearnNode{
			ID: ch.ID, Slug: ch.Slug, Title: title, Summary: summary, OrderNum: ch.OrderNum,
			HasContent: contentCount > 0, ProblemCount: problemCount, UpdatedAt: ch.UpdatedAt,
			Children: []*LearnNode{},
		})
	}

	// Breadcrumbs: walk up the parent chain (root first).
	breadcrumbs := []learnCrumb{}
	parentID := topic.ParentID
	for parentID != nil {
		var parent models.Topic
		if err := database.DB.Preload("Translations").
			Where("id = ? AND is_official = ? AND visibility = 'public'", *parentID, true).
			First(&parent).Error; err != nil {
			break
		}
		breadcrumbs = append([]learnCrumb{{Slug: parent.Slug, Title: learnTranslatedTitle(&parent, lang)}}, breadcrumbs...)
		parentID = parent.ParentID
	}

	// Prev/next siblings for lesson-to-lesson navigation.
	var prev, next *learnCrumb
	if topic.ParentID != nil {
		var siblings []models.Topic
		database.DB.
			Preload("Translations").
			Where("parent_id = ? AND is_official = ? AND visibility = 'public'", *topic.ParentID, true).
			Order("order_num asc, id asc").
			Find(&siblings)
		for i := range siblings {
			if siblings[i].ID == topic.ID {
				if i > 0 {
					prev = &learnCrumb{Slug: siblings[i-1].Slug, Title: learnTranslatedTitle(&siblings[i-1], lang)}
				}
				if i < len(siblings)-1 {
					next = &learnCrumb{Slug: siblings[i+1].Slug, Title: learnTranslatedTitle(&siblings[i+1], lang)}
				}
				break
			}
		}
	}

	// Problems: only published public ones, with translated titles and the
	// current user's solved status when authenticated.
	type learnProblem struct {
		ProblemID   uint   `json:"problem_id"`
		Title       string `json:"title"`
		Difficulty  string `json:"difficulty"`
		OrderNum    int    `json:"order_num"`
		SolvedCount int64  `json:"solved_count"`
		UserSolved  bool   `json:"user_solved"`
	}
	problems := make([]learnProblem, 0, len(topic.Problems))
	for _, tp := range topic.Problems {
		p := tp.Problem
		if p.Visibility != "public" || p.Status != "published" {
			continue
		}
		title := p.Title
		for _, tr := range p.Translations {
			if tr.LanguageCode == lang && tr.Title != "" {
				title = tr.Title
				break
			}
		}
		var solvedCount int64
		database.DB.Model(&models.Submission{}).
			Where("problem_id = ? AND status = 'Accepted'", p.ID).
			Distinct("user_id").
			Count(&solvedCount)
		userSolved := false
		if userID > 0 {
			var cnt int64
			database.DB.Model(&models.Submission{}).
				Where("user_id = ? AND problem_id = ? AND status = 'Accepted'", uint(userID), p.ID).
				Count(&cnt)
			userSolved = cnt > 0
		}
		problems = append(problems, learnProblem{
			ProblemID: p.ID, Title: title, Difficulty: p.Difficulty,
			OrderNum: tp.OrderNum, SolvedCount: solvedCount, UserSolved: userSolved,
		})
	}

	// Hide the share/access fields that make no sense on a public page.
	topic.ShareToken = ""
	topic.AccessList = nil

	return c.JSON(fiber.Map{
		"topic":       topic,
		"children":    childNodes,
		"problems":    problems,
		"breadcrumbs": breadcrumbs,
		"prev":        prev,
		"next":        next,
	})
}

// ---- Progress (authenticated) ----

// GetLearnProgress returns the current user's curriculum progress: which
// lessons they marked as completed and which problems they have solved.
// The frontend overlays this on the publicly cached lesson pages.
func GetLearnProgress(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(float64)

	completedIDs := []uint{}
	database.DB.Model(&models.TopicProgress{}).
		Where("user_id = ?", uint(userID)).
		Pluck("topic_id", &completedIDs)

	solvedIDs := []uint{}
	database.DB.Model(&models.Submission{}).
		Where("user_id = ? AND status = 'Accepted'", uint(userID)).
		Distinct().
		Pluck("problem_id", &solvedIDs)

	return c.JSON(fiber.Map{
		"completed_topic_ids": completedIDs,
		"solved_problem_ids":  solvedIDs,
	})
}

// CompleteLearnTopic marks an official curriculum lesson as completed.
func CompleteLearnTopic(c *fiber.Ctx) error {
	topicID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid topic ID"})
	}
	userID := c.Locals("user_id").(float64)

	var topic models.Topic
	if err := database.DB.
		Where("id = ? AND is_official = ? AND visibility = 'public'", topicID, true).
		First(&topic).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Topic not found"})
	}

	progress := models.TopicProgress{UserID: uint(userID), TopicID: topic.ID}
	if err := database.DB.
		Where("user_id = ? AND topic_id = ?", uint(userID), topic.ID).
		First(&progress).Error; err != nil {
		progress.CompletedAt = time.Now()
		database.DB.Create(&progress)
	}

	return c.JSON(progress)
}

// UncompleteLearnTopic removes the completed mark from a lesson.
func UncompleteLearnTopic(c *fiber.Ctx) error {
	topicID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid topic ID"})
	}
	userID := c.Locals("user_id").(float64)

	database.DB.
		Where("user_id = ? AND topic_id = ?", uint(userID), topicID).
		Delete(&models.TopicProgress{})

	return c.JSON(fiber.Map{"message": "Progress removed"})
}
