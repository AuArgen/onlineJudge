package models

// TopicTranslation holds a translated title/summary for a topic. The topic's
// own Title/Summary fields are the base language (Russian, by convention);
// rows here only exist for the other supported languages (ky, en).
type TopicTranslation struct {
	ID           uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	TopicID      uint   `json:"topic_id" gorm:"not null;uniqueIndex:idx_topic_lang"`
	LanguageCode string `json:"language_code" gorm:"not null;size:10;uniqueIndex:idx_topic_lang"`
	Title        string `json:"title"`
	Summary      string `json:"summary"`
}

// TopicContentTranslation holds a translated content/caption pair for a
// single topic content block. For non-text block types (image, video, link,
// code) Content mirrors the original block's content unchanged — only
// Caption is meaningfully translated.
type TopicContentTranslation struct {
	ID           uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	ContentID    uint   `json:"content_id" gorm:"not null;uniqueIndex:idx_content_lang"`
	LanguageCode string `json:"language_code" gorm:"not null;size:10;uniqueIndex:idx_content_lang"`
	Content      string `json:"content"`
	Caption      string `json:"caption"`
}
