package database

import (
	"fmt"
	"log"
	"math/rand"
	"onlineJudge/backend/app/models"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func Seed() {
	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)

	if userCount > 0 {
		log.Println("Database already seeded.")
		return
	}

	log.Println("Seeding database...")

	// 1. Create Users
	users := []models.User{}
	for i := 1; i <= 15; i++ {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
		user := models.User{
			Name:     fmt.Sprintf("User %d", i),
			Email:    fmt.Sprintf("user%d@example.com", i),
			Password: string(hashedPassword),
			Role:     "user",
		}
		if i == 1 {
			user.Role = "admin"
			user.Name = "Admin User"
			user.Email = "admin@example.com"
		}
		DB.Create(&user)
		users = append(users, user)
	}
	log.Println("Users seeded.")

	// 2. Create Problems
	titles := []string{
		"Sum of Two Numbers", "Reverse String", "Palindrome Check", "Factorial", "Fibonacci Sequence",
		"Prime Number Check", "Maximum Element in Array", "Sort Array", "Binary Search", "Linear Search",
		"Count Vowels", "Remove Duplicates", "Merge Two Arrays", "Find Missing Number", "Anagram Check",
		"Matrix Multiplication", "Transpose Matrix", "GCD of Two Numbers", "LCM of Two Numbers", "Power Function",
		"Square Root", "Check Armstrong Number", "Print Pattern", "Pascal Triangle", "Tower of Hanoi",
		"Knapsack Problem", "Longest Common Subsequence", "Shortest Path in Graph", "Dijkstra Algorithm", "BFS Traversal",
		"DFS Traversal", "Topological Sort", "Minimum Spanning Tree", "Kruskal Algorithm", "Prim Algorithm",
		"Convex Hull", "N-Queens Problem", "Sudoku Solver", "Traveling Salesman", "Graph Coloring",
		"Subset Sum", "Coin Change", "Edit Distance", "Longest Increasing Subsequence", "Maximum Subarray Sum",
	}

	descriptions := []string{
		"Write a program to find the sum of two numbers.",
		"Write a program to reverse a given string.",
		"Check if a given string is a palindrome.",
		"Calculate the factorial of a number.",
		"Generate the Fibonacci sequence up to n terms.",
	}

	langs := []string{"python", "cpp", "java", "go", "javascript"}
	statuses := []string{"draft", "pending_review", "published", "rejected"}
	visibilities := []string{"public", "private"}

	problems := []models.Problem{}

	for i := 0; i < 45; i++ {
		author := users[rand.Intn(len(users))]

		status := statuses[rand.Intn(len(statuses))]
		visibility := "private"
		if status == "published" {
			visibility = visibilities[rand.Intn(len(visibilities))]
		}

		problem := models.Problem{
			Title:            titles[i%len(titles)],
			Description:      descriptions[i%len(descriptions)] + fmt.Sprintf("\n\nProblem ID: %d", i+1),
			TimeLimit:        float64(rand.Intn(5) + 1),
			MemoryLimit:      128 * (rand.Intn(4) + 1),
			AuthorID:         author.ID,
			Visibility:       visibility,
			Status:           status,
			AuthorLanguage:   "python",
			AuthorSourceCode: "print('Hello World')",
			CreatedAt:        time.Now().Add(-time.Duration(rand.Intn(1000)) * time.Hour),
		}
		DB.Create(&problem)
		problems = append(problems, problem)

		// Create Test Cases
		for j := 0; j < rand.Intn(3)+1; j++ {
			testCase := models.TestCase{
				ProblemID:      problem.ID,
				Input:          fmt.Sprintf("%d %d", rand.Intn(100), rand.Intn(100)),
				ExpectedOutput: fmt.Sprintf("%d", rand.Intn(200)),
				IsSample:       j == 0,
			}
			DB.Create(&testCase)
		}
	}
	log.Println("Problems seeded.")

	// 3. Create Submissions (Randomly)
	submissionStatuses := []string{"Accepted", "Wrong Answer", "Runtime Error", "Compilation Error"}

	for i := 0; i < 100; i++ {
		user := users[rand.Intn(len(users))]
		problem := problems[rand.Intn(len(problems))]

		// Only submit to published problems or own problems
		if problem.Status != "published" && problem.AuthorID != user.ID {
			continue
		}

		status := submissionStatuses[rand.Intn(len(submissionStatuses))]

		submission := models.Submission{
			UserID:        user.ID,
			ProblemID:     problem.ID,
			Language:      langs[rand.Intn(len(langs))],
			SourceCode:    "// Random code",
			Status:        status,
			ExecutionTime: fmt.Sprintf("%dms", rand.Intn(100)),
			CreatedAt:     time.Now().Add(-time.Duration(rand.Intn(500)) * time.Hour),
		}
		DB.Create(&submission)
	}
	log.Println("Submissions seeded.")

	log.Println("Database seeding completed.")
}
