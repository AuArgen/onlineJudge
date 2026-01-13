package models

import "time"

type Contest struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	AuthorID    uint      `json:"author_id"`
	Status      string    `gorm:"default:draft" json:"status"`      // draft, published, finished
	Visibility  string    `gorm:"default:public" json:"visibility"` // public, private

	Problems     []ContestProblem     `gorm:"foreignKey:ContestID;constraint:OnDelete:CASCADE" json:"problems,omitempty"`
	Participants []ContestParticipant `gorm:"foreignKey:ContestID;constraint:OnDelete:CASCADE" json:"participants,omitempty"`
}

type ContestProblem struct {
	ID        uint `gorm:"primaryKey" json:"id"`
	ContestID uint `json:"contest_id"`
	ProblemID uint `json:"problem_id"`
	Order     int  `json:"order"` // Order in contest (A, B, C...)

	Problem Problem `gorm:"foreignKey:ProblemID" json:"problem"`
}

type ContestParticipant struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ContestID uint      `json:"contest_id"`
	UserID    uint      `json:"user_id"`
	JoinedAt  time.Time `json:"joined_at"`

	User User `gorm:"foreignKey:UserID" json:"user"`
}
