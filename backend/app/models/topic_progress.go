package models

import "time"

// TopicProgress marks one curriculum lesson (/learn topic) as completed by a
// user. Rows exist only for completed lessons; unmarking deletes the row.
type TopicProgress struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;uniqueIndex:idx_user_topic_progress" json:"user_id"`
	TopicID     uint      `gorm:"not null;uniqueIndex:idx_user_topic_progress" json:"topic_id"`
	CompletedAt time.Time `json:"completed_at"`
}
