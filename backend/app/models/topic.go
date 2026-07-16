package models

import "time"

type Topic struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Title      string    `json:"title"`
	AuthorID   uint      `json:"author_id"`
	ParentID   *uint     `json:"parent_id"` // nil = root topic, non-nil = subtopic
	ShareToken string    `json:"share_token"`
	Visibility string    `gorm:"default:private" json:"visibility"` // public, private
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Curriculum (/learn) fields. Official topics form the public learning
	// section: they are curated by admins, addressable by slug, and served
	// without authentication. Uniqueness of non-empty slugs is enforced in
	// code (a DB unique index would collide on the empty string default).
	Slug       string `gorm:"index" json:"slug"`
	Summary    string `json:"summary"`
	OrderNum   int    `gorm:"default:0" json:"order_num"`
	IsOfficial bool   `gorm:"default:false" json:"is_official"`

	Author       User                `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Children     []Topic             `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Contents     []TopicContent      `gorm:"foreignKey:TopicID;constraint:OnDelete:CASCADE" json:"contents,omitempty"`
	Problems     []TopicProblem      `gorm:"foreignKey:TopicID;constraint:OnDelete:CASCADE" json:"problems,omitempty"`
	AccessList   []TopicAccess       `gorm:"foreignKey:TopicID;constraint:OnDelete:CASCADE" json:"access_list,omitempty"`
	Translations []TopicTranslation  `gorm:"foreignKey:TopicID;constraint:OnDelete:CASCADE" json:"translations,omitempty"`
}

// TopicContent holds rich content blocks: text, code, image URL, YouTube link, or arbitrary link
type TopicContent struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TopicID   uint      `json:"topic_id"`
	Type      string    `json:"type"` // text, code, image, video, link
	Content   string    `json:"content"`
	Caption   string    `json:"caption"`
	// Language of a code block (cpp, python, java, go, javascript). When set,
	// the /learn lesson page renders the block as a runnable code editor.
	Language string `json:"language"`
	// SampleInput is pre-filled into the runner's stdin field so readers can
	// press "Run" and immediately see a meaningful result.
	SampleInput string    `json:"sample_input"`
	OrderNum    int       `json:"order_num"`
	CreatedAt   time.Time `json:"created_at"`

	Translations []TopicContentTranslation `gorm:"foreignKey:ContentID;constraint:OnDelete:CASCADE" json:"translations,omitempty"`
}

// TopicProblem is the many-to-many join between topics and problems
type TopicProblem struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	TopicID   uint    `json:"topic_id"`
	ProblemID uint    `json:"problem_id"`
	OrderNum  int     `json:"order_num"`

	Problem Problem `gorm:"foreignKey:ProblemID" json:"problem"`
}

// TopicAccess grants access to a private topic by user ID or email
type TopicAccess struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	TopicID uint   `json:"topic_id"`
	UserID  *uint  `json:"user_id"`
	Email   string `json:"email"`
}
