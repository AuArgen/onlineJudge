package database

import (
	"log"
	"onlineJudge/backend/app/models"
)

// contentBlockSeed is one lesson content block. Language is only set for
// runnable code blocks (it enables the in-lesson code runner).
type contentBlockSeed struct {
	Type     string
	Language string
	Content  string
	Caption  string
}

// lessonContentSeed is the full seeded body of one lesson: a summary (used
// in lists and as the SEO meta description), ordered content blocks, and
// titles of seeded practice problems to attach.
type lessonContentSeed struct {
	Summary  string
	Blocks   []contentBlockSeed
	Problems []string
}

// SeedLearnContent fills official curriculum lessons with their seeded
// content. Idempotent per lesson: blocks are only inserted into lessons
// that have none, summaries only set when empty, and problems only attached
// when the lesson has none — so admin edits are never overwritten.
func SeedLearnContent() {
	filled := 0
	for slug, seed := range learnLessonContent() {
		var topic models.Topic
		if err := DB.Where("slug = ? AND is_official = ?", slug, true).First(&topic).Error; err != nil {
			continue
		}

		if topic.Summary == "" && seed.Summary != "" {
			DB.Model(&topic).Update("summary", seed.Summary)
		}

		var blockCount int64
		DB.Model(&models.TopicContent{}).Where("topic_id = ?", topic.ID).Count(&blockCount)
		if blockCount == 0 && len(seed.Blocks) > 0 {
			for i, b := range seed.Blocks {
				DB.Create(&models.TopicContent{
					TopicID:  topic.ID,
					Type:     b.Type,
					Language: b.Language,
					Content:  b.Content,
					Caption:  b.Caption,
					OrderNum: i + 1,
				})
			}
			filled++
		}

		var problemCount int64
		DB.Model(&models.TopicProblem{}).Where("topic_id = ?", topic.ID).Count(&problemCount)
		if problemCount == 0 {
			order := 1
			for _, title := range seed.Problems {
				var problem models.Problem
				if err := DB.Where("title = ? AND visibility = 'public' AND status = 'published'", title).
					Order("id asc").First(&problem).Error; err != nil {
					continue
				}
				DB.Create(&models.TopicProblem{TopicID: topic.ID, ProblemID: problem.ID, OrderNum: order})
				order++
			}
		}
	}
	if filled > 0 {
		log.Printf("Learn lesson content seeded (%d lessons filled).", filled)
	} else {
		log.Println("Learn lesson content already present.")
	}
}

// learnLessonContent maps lesson slugs to their seeded bodies. Content is in
// Russian (the platform's base content language); Kyrgyz and English are
// produced per lesson via the built-in AI translation.
func learnLessonContent() map[string]lessonContentSeed {
	m := map[string]lessonContentSeed{}
	addCppCourseContent(m)
	addPythonCourseContent(m)
	addJavaCourseContent(m)
	addGoCourseContent(m)
	return m
}
