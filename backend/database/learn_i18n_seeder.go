package database

import (
	"log"
	"onlineJudge/backend/app/models"
)

// learn_i18n_seeder.go seeds Kyrgyz and English translations for the /learn
// lesson content. The base content language is Russian (stored on the topic
// and its content blocks directly); translations live in TopicTranslation /
// TopicContentTranslation rows and are applied by the learn controller when
// the page is requested with ?lang=ky or ?lang=en.

// blockTranslation is the translation of one content block, aligned with the
// lesson's blocks by position. Type must match the block at that position —
// it guards against admin-edited lessons whose structure diverged from the
// seed. For code blocks Content is left empty and the seeder mirrors the
// original code; only Caption carries a real translation.
type blockTranslation struct {
	Type    string
	Content string
	Caption string
}

// lessonTranslationSeed is the translated body of one lesson: the summary
// (shown in lists and used as the meta description) plus per-block
// translations in seed order.
type lessonTranslationSeed struct {
	Summary string
	Blocks  []blockTranslation
}

// SeedLearnContentTranslations creates ky/en translation rows for the seeded
// curriculum content. Idempotent and non-destructive: existing translation
// rows are never overwritten, topic summaries are only filled when empty,
// and lessons whose block structure no longer matches the seed are skipped.
func SeedLearnContentTranslations() {
	seedLearnProblemTranslations()

	created := 0
	for lang, lessons := range learnContentTranslations() {
		for slug, tr := range lessons {
			var topic models.Topic
			if err := DB.Where("slug = ? AND is_official = ?", slug, true).First(&topic).Error; err != nil {
				continue
			}

			if tr.Summary != "" {
				var row models.TopicTranslation
				if err := DB.Where("topic_id = ? AND language_code = ?", topic.ID, lang).First(&row).Error; err != nil {
					DB.Create(&models.TopicTranslation{TopicID: topic.ID, LanguageCode: lang, Summary: tr.Summary})
				} else if row.Summary == "" {
					DB.Model(&row).Update("summary", tr.Summary)
				}
			}

			if len(tr.Blocks) == 0 {
				continue
			}

			var blocks []models.TopicContent
			DB.Where("topic_id = ?", topic.ID).Order("order_num asc, id asc").Find(&blocks)

			for k := range blocks {
				if k >= len(tr.Blocks) {
					break
				}
				bt := tr.Blocks[k]
				if blocks[k].Type != bt.Type {
					// The lesson was restructured after seeding; positional
					// alignment is no longer safe — stop for this lesson.
					break
				}

				var cnt int64
				DB.Model(&models.TopicContentTranslation{}).
					Where("content_id = ? AND language_code = ?", blocks[k].ID, lang).
					Count(&cnt)
				if cnt > 0 {
					continue
				}

				content := bt.Content
				if content == "" {
					content = blocks[k].Content
				}
				DB.Create(&models.TopicContentTranslation{
					ContentID:    blocks[k].ID,
					LanguageCode: lang,
					Content:      content,
					Caption:      bt.Caption,
				})
				created++
			}
		}
	}
	if created > 0 {
		log.Printf("Learn content translations seeded (%d blocks).", created)
	} else {
		log.Println("Learn content translations already present.")
	}
}

// learnContentTranslations maps language code -> lesson slug -> translated
// content. Kyrgyz and English mirror the Russian seeds in learn_content_*.go.
func learnContentTranslations() map[string]map[string]lessonTranslationSeed {
	ky := map[string]lessonTranslationSeed{}
	addKyCppTranslations(ky)
	addKyPythonTranslations(ky)
	addKyJavaTranslations(ky)
	addKyGoTranslations(ky)
	addKyRoadmap12Translations(ky)
	addKyRoadmap34Translations(ky)
	addKyRoadmap56Translations(ky)
	addKyOverviewTranslations(ky)

	en := map[string]lessonTranslationSeed{}
	addEnCppTranslations(en)
	addEnPythonTranslations(en)
	addEnJavaTranslations(en)
	addEnGoTranslations(en)
	addEnRoadmap12Translations(en)
	addEnRoadmap34Translations(en)
	addEnRoadmap56Translations(en)
	addEnOverviewTranslations(en)

	return map[string]map[string]lessonTranslationSeed{"ky": ky, "en": en}
}
