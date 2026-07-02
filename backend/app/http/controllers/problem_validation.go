package controllers

import (
	"fmt"
	"onlineJudge/backend/app/models"
	"strings"
)

type ValidationIssue struct {
	Level   string `json:"level"` // "error" (blocks approval) or "warning" (advisory)
	Message string `json:"message"`
}

// validateProblem checks whether a problem is complete enough to be safely
// published. "error" issues indicate the problem is broken (e.g. no test
// cases); "warning" issues are advisory and don't block publishing.
func validateProblem(problem models.Problem, testCases []models.TestCase) []ValidationIssue {
	var issues []ValidationIssue

	if strings.TrimSpace(problem.Title) == "" {
		issues = append(issues, ValidationIssue{"error", "Отсутствует название задачи"})
	}
	if strings.TrimSpace(problem.Description) == "" {
		issues = append(issues, ValidationIssue{"error", "Отсутствует описание задачи"})
	}
	if problem.TimeLimit <= 0 {
		issues = append(issues, ValidationIssue{"error", "Некорректный лимит времени (должен быть больше 0)"})
	}
	if problem.MemoryLimit <= 0 {
		issues = append(issues, ValidationIssue{"error", "Некорректный лимит памяти (должен быть больше 0)"})
	}
	if strings.TrimSpace(problem.AuthorSourceCode) == "" {
		issues = append(issues, ValidationIssue{"warning", "Не задано авторское решение — выводы тестов не будут проверены на корректность"})
	}

	if len(testCases) == 0 {
		issues = append(issues, ValidationIssue{"error", "У задачи нет ни одного теста"})
	} else {
		sampleCount := 0
		var emptyOutput, emptyInput []int
		for i, tc := range testCases {
			if tc.IsSample {
				sampleCount++
			}
			if strings.TrimSpace(tc.ExpectedOutput) == "" {
				emptyOutput = append(emptyOutput, i+1)
			}
			if strings.TrimSpace(tc.Input) == "" {
				emptyInput = append(emptyInput, i+1)
			}
		}
		if sampleCount == 0 {
			issues = append(issues, ValidationIssue{"warning", "Нет ни одного примера (sample) теста — решающий не увидит ни одного примера"})
		}
		if len(emptyOutput) > 0 {
			issues = append(issues, ValidationIssue{"error", fmt.Sprintf("Пустой ожидаемый вывод у %d тест(ов): #%s", len(emptyOutput), joinInts(emptyOutput))})
		}
		if len(emptyInput) > 0 {
			issues = append(issues, ValidationIssue{"warning", fmt.Sprintf("Пустой ввод у %d тест(ов): #%s", len(emptyInput), joinInts(emptyInput))})
		}
	}

	return issues
}

func joinInts(nums []int) string {
	strs := make([]string, len(nums))
	for i, n := range nums {
		strs[i] = fmt.Sprintf("%d", n)
	}
	return strings.Join(strs, ", #")
}

func hasBlockingIssues(issues []ValidationIssue) bool {
	for _, iss := range issues {
		if iss.Level == "error" {
			return true
		}
	}
	return false
}
