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

	// ── 1. Users ──────────────────────────────────────────────────────────────
	type userSeed struct{ Name, Email, Role string }
	userSeeds := []userSeed{
		{"Admin User", "admin@example.com", "admin"},
		{"Alice Johnson", "alice@example.com", "user"},
		{"Bob Smith", "bob@example.com", "user"},
		{"Charlie Brown", "charlie@example.com", "user"},
		{"Diana Prince", "diana@example.com", "user"},
		{"Edward Norton", "edward@example.com", "user"},
		{"Fiona Green", "fiona@example.com", "user"},
		{"George White", "george@example.com", "user"},
		{"Hannah Black", "hannah@example.com", "user"},
		{"Ivan Petrov", "ivan@example.com", "user"},
	}

	users := []models.User{}
	for _, u := range userSeeds {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
		user := models.User{
			Name:     u.Name,
			Email:    u.Email,
			Password: string(hash),
			Role:     u.Role,
		}
		DB.Create(&user)
		users = append(users, user)
	}
	log.Println("Users seeded.")

	// ── 2. Problems with CORRECT test cases ───────────────────────────────────
	type tc struct {
		Input, Output string
		IsSample      bool
	}
	type ps struct {
		Title, Description, AuthorCode string
		TimeLimit                      float64
		MemoryLimit                    int
		TestCases                      []tc
	}

	seeds := []ps{
		{
			Title: "Сумма двух чисел",
			Description: "Даны два целых числа a и b. Выведите их сумму.\n\n" +
				"**Входные данные:** Два целых числа на одной строке.\n" +
				"**Выходные данные:** Их сумма.\n\n" +
				"**Пример:**\nВход: `3 5`\nВыход: `8`",
			AuthorCode:  "a, b = map(int, input().split())\nprint(a + b)",
			TimeLimit:   2.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"3 5", "8", true},
				{"0 0", "0", true},
				{"100 200", "300", false},
				{"-5 10", "5", false},
				{"1000000 999999", "1999999", false},
			},
		},
		{
			Title: "Переворот строки",
			Description: "Дана строка. Выведите её в обратном порядке.\n\n" +
				"**Входные данные:** Одна строка.\n" +
				"**Выходные данные:** Строка, записанная задом наперёд.\n\n" +
				"**Пример:**\nВход: `hello`\nВыход: `olleh`",
			AuthorCode:  "print(input()[::-1])",
			TimeLimit:   1.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"hello", "olleh", true},
				{"world", "dlrow", true},
				{"abcde", "edcba", false},
				{"a", "a", false},
				{"racecar", "racecar", false},
			},
		},
		{
			Title: "Проверка палиндрома",
			Description: "Определите, является ли данная строка палиндромом.\n\n" +
				"**Входные данные:** Одна строка.\n" +
				"**Выходные данные:** YES если палиндром, NO иначе.\n\n" +
				"**Пример:**\nВход: `racecar`\nВыход: `YES`",
			AuthorCode:  "s = input()\nprint(\"YES\" if s == s[::-1] else \"NO\")",
			TimeLimit:   1.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"racecar", "YES", true},
				{"hello", "NO", true},
				{"madam", "YES", false},
				{"level", "YES", false},
				{"world", "NO", false},
			},
		},
		{
			Title: "Факториал числа",
			Description: "Вычислите факториал числа n.\n\n" +
				"**Входные данные:** Целое число n (0 ≤ n ≤ 12).\n" +
				"**Выходные данные:** n!\n\n" +
				"**Пример:**\nВход: `5`\nВыход: `120`",
			AuthorCode:  "import math\nprint(math.factorial(int(input())))",
			TimeLimit:   1.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"5", "120", true},
				{"0", "1", true},
				{"1", "1", false},
				{"10", "3628800", false},
				{"12", "479001600", false},
			},
		},
		{
			Title: "Максимум в массиве",
			Description: "Найдите максимальный элемент в массиве.\n\n" +
				"**Входные данные:** Первая строка — n (размер массива). Вторая строка — n целых чисел.\n" +
				"**Выходные данные:** Максимальный элемент.\n\n" +
				"**Пример:**\nВход:\n```\n5\n1 3 5 2 4\n```\nВыход: `5`",
			AuthorCode:  "n = int(input())\nprint(max(map(int, input().split())))",
			TimeLimit:   1.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"5\n1 3 5 2 4", "5", true},
				{"3\n-1 -2 -3", "-1", true},
				{"1\n42", "42", false},
				{"4\n10 20 30 40", "40", false},
				{"6\n5 5 5 5 5 5", "5", false},
			},
		},
		{
			Title: "Чётное или нечётное",
			Description: "Определите, является ли данное число чётным или нечётным.\n\n" +
				"**Входные данные:** Одно целое число.\n" +
				"**Выходные данные:** EVEN если чётное, ODD если нечётное.\n\n" +
				"**Пример:**\nВход: `4`\nВыход: `EVEN`",
			AuthorCode:  "print(\"EVEN\" if int(input()) % 2 == 0 else \"ODD\")",
			TimeLimit:   1.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"4", "EVEN", true},
				{"7", "ODD", true},
				{"0", "EVEN", false},
				{"-3", "ODD", false},
				{"100", "EVEN", false},
			},
		},
		{
			Title: "Подсчёт гласных",
			Description: "Подсчитайте количество гласных букв (a, e, i, o, u) в строке. Регистр не учитывается.\n\n" +
				"**Входные данные:** Одна строка.\n" +
				"**Выходные данные:** Количество гласных.\n\n" +
				"**Пример:**\nВход: `Hello World`\nВыход: `3`",
			AuthorCode:  "print(sum(1 for c in input().lower() if c in 'aeiou'))",
			TimeLimit:   1.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"Hello World", "3", true},
				{"Python", "1", true},
				{"AEIOU", "5", false},
				{"xyz", "0", false},
				{"Beautiful", "5", false},
			},
		},
		{
			Title: "НОД двух чисел",
			Description: "Найдите наибольший общий делитель (НОД) двух положительных целых чисел.\n\n" +
				"**Входные данные:** Два целых числа a и b на одной строке.\n" +
				"**Выходные данные:** НОД(a, b).\n\n" +
				"**Пример:**\nВход: `12 8`\nВыход: `4`",
			AuthorCode:  "import math\na, b = map(int, input().split())\nprint(math.gcd(a, b))",
			TimeLimit:   1.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"12 8", "4", true},
				{"100 75", "25", true},
				{"7 13", "1", false},
				{"36 48", "12", false},
				{"1 1000000", "1", false},
			},
		},
		{
			Title: "Сумма элементов массива",
			Description: "Вычислите сумму всех элементов массива.\n\n" +
				"**Входные данные:** Первая строка — n. Вторая строка — n целых чисел.\n" +
				"**Выходные данные:** Сумма элементов.\n\n" +
				"**Пример:**\nВход:\n```\n4\n1 2 3 4\n```\nВыход: `10`",
			AuthorCode:  "n = int(input())\nprint(sum(map(int, input().split())))",
			TimeLimit:   1.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"4\n1 2 3 4", "10", true},
				{"3\n10 20 30", "60", true},
				{"1\n42", "42", false},
				{"5\n-1 -2 -3 -4 -5", "-15", false},
				{"3\n0 0 0", "0", false},
			},
		},
		{
			Title: "Проверка простого числа",
			Description: "Определите, является ли данное число простым.\n\n" +
				"**Входные данные:** Целое число n (1 ≤ n ≤ 10^6).\n" +
				"**Выходные данные:** YES если простое, NO иначе.\n\n" +
				"**Пример:**\nВход: `7`\nВыход: `YES`",
			AuthorCode: "n = int(input())\n" +
				"if n < 2:\n" +
				"    print(\"NO\")\n" +
				"else:\n" +
				"    i = 2\n" +
				"    prime = True\n" +
				"    while i * i <= n:\n" +
				"        if n % i == 0:\n" +
				"            prime = False\n" +
				"            break\n" +
				"        i += 1\n" +
				"    print(\"YES\" if prime else \"NO\")",
			TimeLimit:   2.0,
			MemoryLimit: 256,
			TestCases: []tc{
				{"7", "YES", true},
				{"4", "NO", true},
				{"2", "YES", false},
				{"1", "NO", false},
				{"97", "YES", false},
				{"100", "NO", false},
			},
		},
	}

	// Always use the actual first registered user in DB as problem author
	var firstUser models.User
	DB.Order("id ASC").First(&firstUser)
	log.Printf("Problem author: %s (ID: %d)", firstUser.Name, firstUser.ID)

	problems := []models.Problem{}

	for _, seed := range seeds {
		p := models.Problem{
			Title:            seed.Title,
			Description:      seed.Description,
			TimeLimit:        seed.TimeLimit,
			MemoryLimit:      seed.MemoryLimit,
			AuthorID:         firstUser.ID,
			Visibility:       "public",
			Status:           "published",
			AuthorSourceCode: seed.AuthorCode,
			AuthorLanguage:   "python",
			CreatedAt:        time.Now().Add(-time.Duration(rand.Intn(720)) * time.Hour),
		}
		DB.Create(&p)

		for _, t := range seed.TestCases {
			DB.Create(&models.TestCase{
				ProblemID:      p.ID,
				Input:          t.Input,
				ExpectedOutput: t.Output,
				IsSample:       t.IsSample,
			})
		}

		problems = append(problems, p)
	}

	// ── Translations (English + Kyrgyz) ───────────────────────────────────────
	type translation struct {
		LangCode, Title, Description string
	}
	problemTranslations := [][]translation{
		// 0: Sum of Two Numbers
		{
			{"en", "Sum of Two Numbers",
				"Given two integers a and b, print their sum.\n\n" +
					"**Input:** Two integers on a single line.\n" +
					"**Output:** Their sum.\n\n" +
					"**Example:**\nInput: `3 5`\nOutput: `8`"},
			{"ky", "Эки сандын суммасы",
				"a жана b эки бүтүн сан берилген. Алардын суммасын чыгар.\n\n" +
					"**Киргизүү:** Бир саптагы эки бүтүн сан.\n" +
					"**Чыгаруу:** Алардын суммасы.\n\n" +
					"**Мисал:**\nКиргизүү: `3 5`\nЧыгаруу: `8`"},
		},
		// 1: Reverse String
		{
			{"en", "Reverse String",
				"Given a string, print it in reverse order.\n\n" +
					"**Input:** A single string.\n" +
					"**Output:** The reversed string.\n\n" +
					"**Example:**\nInput: `hello`\nOutput: `olleh`"},
			{"ky", "Сапты тескери жазуу",
				"Берилген сапты тескери тартипте чыгар.\n\n" +
					"**Киргизүү:** Бир сап.\n" +
					"**Чыгаруу:** Тескери жазылган сап.\n\n" +
					"**Мисал:**\nКиргизүү: `hello`\nЧыгаруу: `olleh`"},
		},
		// 2: Palindrome Check
		{
			{"en", "Palindrome Check",
				"Check if the given string is a palindrome.\n\n" +
					"**Input:** A single string.\n" +
					"**Output:** YES if palindrome, NO otherwise.\n\n" +
					"**Example:**\nInput: `racecar`\nOutput: `YES`"},
			{"ky", "Палиндром текшеруу",
				"Берилген сап палиндром экендигин текшер.\n\n" +
					"**Киргизүү:** Бир сап.\n" +
					"**Чыгаруу:** Палиндром болсо YES, болбосо NO.\n\n" +
					"**Мисал:**\nКиргизүү: `racecar`\nЧыгаруу: `YES`"},
		},
		// 3: Factorial
		{
			{"en", "Factorial",
				"Calculate the factorial of n.\n\n" +
					"**Input:** A single integer n (0 ≤ n ≤ 12).\n" +
					"**Output:** n!\n\n" +
					"**Example:**\nInput: `5`\nOutput: `120`"},
			{"ky", "Сандын факториалы",
				"n сандын факториалын эсепте.\n\n" +
					"**Киргизүү:** Бир бүтүн сан n (0 ≤ n ≤ 12).\n" +
					"**Чыгаруу:** n!\n\n" +
					"**Мисал:**\nКиргизүү: `5`\nЧыгаруу: `120`"},
		},
		// 4: Maximum in Array
		{
			{"en", "Maximum in Array",
				"Find the maximum element in an array.\n\n" +
					"**Input:** First line — n (size). Second line — n integers.\n" +
					"**Output:** The maximum element.\n\n" +
					"**Example:**\nInput:\n```\n5\n1 3 5 2 4\n```\nOutput: `5`"},
			{"ky", "Массивдеги максималдуу сан",
				"Массивдеги максималдуу элементти тап.\n\n" +
					"**Киргизүү:** Биринчи саптa — n (өлчөм). Экинчи сапта — n бүтүн сан.\n" +
					"**Чыгаруу:** Максималдуу элемент.\n\n" +
					"**Мисал:**\nКиргизүү:\n```\n5\n1 3 5 2 4\n```\nЧыгаруу: `5`"},
		},
		// 5: Even or Odd
		{
			{"en", "Even or Odd",
				"Determine if the given integer is even or odd.\n\n" +
					"**Input:** A single integer.\n" +
					"**Output:** EVEN or ODD.\n\n" +
					"**Example:**\nInput: `4`\nOutput: `EVEN`"},
			{"ky", "Жуп же Так",
				"Берилген бүтүн сан жуп же так экендигин аныкта.\n\n" +
					"**Киргизүү:** Бир бүтүн сан.\n" +
					"**Чыгаруу:** Жуп болсо EVEN, так болсо ODD.\n\n" +
					"**Мисал:**\nКиргизүү: `4`\nЧыгаруу: `EVEN`"},
		},
		// 6: Count Vowels
		{
			{"en", "Count Vowels",
				"Count the vowels (a, e, i, o, u) in a string. Case-insensitive.\n\n" +
					"**Input:** A single string.\n" +
					"**Output:** Number of vowels.\n\n" +
					"**Example:**\nInput: `Hello World`\nOutput: `3`"},
			{"ky", "Үндүү тыбыштарды саноо",
				"Сапта үндүү тыбыштарды (a, e, i, o, u) сан. Чоң/кичи тамга эске алынбайт.\n\n" +
					"**Киргизүү:** Бир сап.\n" +
					"**Чыгаруу:** Үндүү тыбыштардын саны.\n\n" +
					"**Мисал:**\nКиргизүү: `Hello World`\nЧыгаруу: `3`"},
		},
		// 7: GCD
		{
			{"en", "GCD of Two Numbers",
				"Find the Greatest Common Divisor of two integers.\n\n" +
					"**Input:** Two integers a and b on a single line.\n" +
					"**Output:** GCD(a, b).\n\n" +
					"**Example:**\nInput: `12 8`\nOutput: `4`"},
			{"ky", "Эки сандын БОЭБ",
				"Эки оң бүтүн сандын эң чоң жалпы бөлүүчүсүн тап.\n\n" +
					"**Киргизүү:** Бир саптагы a жана b эки бүтүн сан.\n" +
					"**Чыгаруу:** БОЭБ(a, b).\n\n" +
					"**Мисал:**\nКиргизүү: `12 8`\nЧыгаруу: `4`"},
		},
		// 8: Sum of Array
		{
			{"en", "Sum of Array",
				"Calculate the sum of all elements in an array.\n\n" +
					"**Input:** First line — n. Second line — n integers.\n" +
					"**Output:** Sum of elements.\n\n" +
					"**Example:**\nInput:\n```\n4\n1 2 3 4\n```\nOutput: `10`"},
			{"ky", "Массив элементтеринин суммасы",
				"Массивдин бардык элементтеринин суммасын эсепте.\n\n" +
					"**Киргизүү:** Биринчи сапта — n. Экинчи сапта — n бүтүн сан.\n" +
					"**Чыгаруу:** Элементтердин суммасы.\n\n" +
					"**Мисал:**\nКиргизүү:\n```\n4\n1 2 3 4\n```\nЧыгаруу: `10`"},
		},
		// 9: Prime Check
		{
			{"en", "Prime Number Check",
				"Check if the given number is prime.\n\n" +
					"**Input:** A single integer n (1 ≤ n ≤ 10^6).\n" +
					"**Output:** YES if prime, NO otherwise.\n\n" +
					"**Example:**\nInput: `7`\nOutput: `YES`"},
			{"ky", "Жай сан текшеруу",
				"Берилген сан жай сан экендигин текшер.\n\n" +
					"**Киргизүү:** Бир бүтүн сан n (1 ≤ n ≤ 10^6).\n" +
					"**Чыгаруу:** Жай сан болсо YES, болбосо NO.\n\n" +
					"**Мисал:**\nКиргизүү: `7`\nЧыгаруу: `YES`"},
		},
	}

	for i, problem := range problems {
		if i >= len(problemTranslations) {
			break
		}
		for _, t := range problemTranslations[i] {
			DB.Create(&models.ProblemTranslation{
				ProblemID:    problem.ID,
				LanguageCode: t.LangCode,
				Title:        t.Title,
				Description:  t.Description,
			})
		}
	}
	log.Println("Translations seeded.")

	log.Println("Problems seeded.")

	// ── 3. Realistic submissions ───────────────────────────────────────────────
	type subTemplate struct {
		lang, code, status, execTime string
	}
	templates := []subTemplate{
		{"python", "a, b = map(int, input().split())\nprint(a + b)", "Accepted", "43ms"},
		{"python", "print(input()[::-1])", "Accepted", "38ms"},
		{"python", "s = input()\nprint(\"YES\" if s == s[::-1] else \"NO\")", "Accepted", "40ms"},
		{"python", "import math\nprint(math.factorial(int(input())))", "Accepted", "41ms"},
		{"python", "n = int(input())\nprint(max(map(int, input().split())))", "Accepted", "43ms"},
		{"python", "print(\"EVEN\" if int(input()) % 2 == 0 else \"ODD\")", "Accepted", "39ms"},
		{"cpp", "#include<iostream>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b;return 0;}", "Accepted", "8ms"},
		{"python", "# wrong solution\nprint(0)", "Wrong Answer", "35ms"},
		{"python", "print(input())", "Wrong Answer", "37ms"},
		{"python", "n=int(input())", "Runtime Error", "20ms"},
	}

	for _, user := range users[1:] {
		numProblems := rand.Intn(5) + 3
		perm := rand.Perm(len(problems))
		for k := 0; k < numProblems && k < len(problems); k++ {
			problem := problems[perm[k]]
			created := time.Now().Add(-time.Duration(rand.Intn(480)) * time.Hour)

			// Optional wrong attempt before correct
			if rand.Intn(2) == 0 {
				DB.Create(&models.Submission{
					UserID:        user.ID,
					ProblemID:     problem.ID,
					Language:      "python",
					SourceCode:    "# first wrong attempt\nprint(0)",
					Status:        "Wrong Answer",
					ExecutionTime: fmt.Sprintf("%dms", rand.Intn(80)+10),
					CreatedAt:     created.Add(-time.Duration(rand.Intn(30)) * time.Minute),
				})
			}

			// Final submission
			tmpl := templates[rand.Intn(len(templates))]
			DB.Create(&models.Submission{
				UserID:        user.ID,
				ProblemID:     problem.ID,
				Language:      tmpl.lang,
				SourceCode:    tmpl.code,
				Status:        tmpl.status,
				ExecutionTime: tmpl.execTime,
				CreatedAt:     created,
			})
		}
	}
	log.Println("Submissions seeded.")

	// ── 4. Demo contest ───────────────────────────────────────────────────────
	contestStart := time.Now().Add(-2 * time.Hour)
	contestEnd := time.Now().Add(22 * time.Hour)
	contest := models.Contest{
		Title:       "Демо-соревнование",
		Description: "Пробное соревнование с 3 задачами. Решайте задачи и поднимайтесь в таблице лидеров!",
		StartTime:   contestStart,
		EndTime:     contestEnd,
		AuthorID:    firstUser.ID,
		Status:      "published",
		Visibility:  "public",
	}
	DB.Create(&contest)

	// Add first 3 problems to contest
	for i, p := range problems[:3] {
		DB.Create(&models.ContestProblem{
			ContestID: contest.ID,
			ProblemID: p.ID,
			Order:     i,
		})
	}

	// Register 5 users and add contest submissions
	contestProblems := problems[:3]
	for _, user := range users[1:6] {
		DB.Create(&models.ContestParticipant{
			ContestID: contest.ID,
			UserID:    user.ID,
			JoinedAt:  contestStart.Add(time.Duration(rand.Intn(20)) * time.Minute),
		})

		numSolved := rand.Intn(4) // 0–3 problems solved
		for j := 0; j < numSolved; j++ {
			minutesIn := rand.Intn(90) + 5
			submittedAt := contestStart.Add(time.Duration(minutesIn) * time.Minute)

			// Wrong attempt
			if rand.Intn(2) == 0 {
				wrongAt := submittedAt.Add(-time.Duration(rand.Intn(10)+1) * time.Minute)
				DB.Create(&models.Submission{
					UserID:        user.ID,
					ProblemID:     contestProblems[j].ID,
					ContestID:     &contest.ID,
					Language:      "python",
					SourceCode:    "# wrong\nprint(0)",
					Status:        "Wrong Answer",
					ExecutionTime: "40ms",
					CreatedAt:     wrongAt,
				})
			}

			// Accepted
			DB.Create(&models.Submission{
				UserID:        user.ID,
				ProblemID:     contestProblems[j].ID,
				ContestID:     &contest.ID,
				Language:      "python",
				SourceCode:    contestProblems[j].AuthorSourceCode,
				Status:        "Accepted",
				ExecutionTime: fmt.Sprintf("%dms", rand.Intn(50)+20),
				CreatedAt:     submittedAt,
			})
		}
	}
	log.Println("Contest seeded.")

	log.Println("Database seeding completed.")
}
