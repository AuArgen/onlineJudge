package controllers

// maxDisplayOutputLen caps how much stdout/stderr text is sent to the client.
// Judging always compares the full, untruncated output — this only limits
// what gets serialized into API responses for display purposes.
const maxDisplayOutputLen = 4000

// truncateForDisplay trims s to maxDisplayOutputLen runes and reports whether
// it was cut. It must never be used for correctness checks.
func truncateForDisplay(s string) (string, bool) {
	runes := []rune(s)
	if len(runes) <= maxDisplayOutputLen {
		return s, false
	}
	return string(runes[:maxDisplayOutputLen]), true
}
