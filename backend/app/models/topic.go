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

	Author     User           `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Children   []Topic        `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Contents   []TopicContent `gorm:"foreignKey:TopicID;constraint:OnDelete:CASCADE" json:"contents,omitempty"`
	Problems   []TopicProblem `gorm:"foreignKey:TopicID;constraint:OnDelete:CASCADE" json:"problems,omitempty"`
	AccessList []TopicAccess  `gorm:"foreignKey:TopicID;constraint:OnDelete:CASCADE" json:"access_list,omitempty"`
}

// TopicContent holds rich content blocks: text, image URL, YouTube link, or arbitrary link
type TopicContent struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TopicID   uint      `json:"topic_id"`
	Type      string    `json:"type"` // text, image, video, link
	Content   string    `json:"content"`
	Caption   string    `json:"caption"`
	OrderNum  int       `json:"order_num"`
	CreatedAt time.Time `json:"created_at"`
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
