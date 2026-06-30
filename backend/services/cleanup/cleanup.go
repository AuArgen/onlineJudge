package cleanup

import (
	"log"
	"onlineJudge/backend/database"
	"time"
)

const retentionDays = 90

// Start runs a daily background job that deletes submissions older than 90 days.
func Start() {
	go func() {
		// Run once immediately on startup, then every 24 hours.
		run()
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			run()
		}
	}()
}

func run() {
	cutoff := time.Now().AddDate(0, 0, -retentionDays)

	// Delete submission details first (FK constraint).
	detailsResult := database.DB.Exec(
		`DELETE FROM submission_details WHERE submission_id IN (
			SELECT id FROM submissions WHERE created_at < ?
		)`,
		cutoff,
	)
	if detailsResult.Error != nil {
		log.Printf("[cleanup] error deleting submission details: %v", detailsResult.Error)
		return
	}

	// Delete the submissions themselves.
	submissionsResult := database.DB.Exec(
		"DELETE FROM submissions WHERE created_at < ?",
		cutoff,
	)
	if submissionsResult.Error != nil {
		log.Printf("[cleanup] error deleting submissions: %v", submissionsResult.Error)
		return
	}

	total := detailsResult.RowsAffected + submissionsResult.RowsAffected
	if total > 0 {
		log.Printf("[cleanup] removed %d submission rows and %d detail rows older than %d days",
			submissionsResult.RowsAffected, detailsResult.RowsAffected, retentionDays)
	}
}
