package database

import (
	"log"
	"onlineJudge/backend/app/models"
)

// learn_i18n_problems.go seeds ky/en translations for the seeded practice
// problems, so the problem lists on /learn pages and the problem pages
// themselves follow the reader's language. Problems are matched by their
// Russian title (the base content language); rows are only created when a
// translation for that language does not exist yet.

type problemTranslationSeed struct {
	TitleRu string // lookup key: the seeded Russian title
	TitleKy string
	DescKy  string
	TitleEn string
	DescEn  string
}

func seedLearnProblemTranslations() {
	created := 0
	for _, seed := range learnProblemTranslations() {
		var problem models.Problem
		if err := DB.Where("title = ?", seed.TitleRu).Order("id asc").First(&problem).Error; err != nil {
			continue
		}

		rows := []models.ProblemTranslation{
			{ProblemID: problem.ID, LanguageCode: "ky", Title: seed.TitleKy, Description: seed.DescKy},
			{ProblemID: problem.ID, LanguageCode: "en", Title: seed.TitleEn, Description: seed.DescEn},
		}
		for _, row := range rows {
			var cnt int64
			DB.Model(&models.ProblemTranslation{}).
				Where("problem_id = ? AND language_code = ?", row.ProblemID, row.LanguageCode).
				Count(&cnt)
			if cnt > 0 {
				continue
			}
			DB.Create(&row)
			created++
		}
	}
	if created > 0 {
		log.Printf("Learn problem translations seeded (%d rows).", created)
	}
}

func learnProblemTranslations() []problemTranslationSeed {
	return []problemTranslationSeed{
		{
			TitleRu: "Сумма двух чисел",
			TitleKy: "Эки сандын суммасы",
			DescKy: "a жана b бүтүн сандары берилген. Алардын суммасын чыгарыңыз.\n\n" +
				"**Киргизүү маалыматтары:** Бир саптагы эки бүтүн сан.\n" +
				"**Чыгаруу маалыматтары:** Алардын суммасы.\n\n" +
				"**Мисал:**\nКиргизүү: `3 5`\nЧыгаруу: `8`",
			TitleEn: "Sum of Two Numbers",
			DescEn: "You are given two integers a and b. Print their sum.\n\n" +
				"**Input:** Two integers on one line.\n" +
				"**Output:** Their sum.\n\n" +
				"**Example:**\nInput: `3 5`\nOutput: `8`",
		},
		{
			TitleRu: "Переворот строки",
			TitleKy: "Сапты тескери буруу",
			DescKy: "Сап берилген. Аны тескери тартипте чыгарыңыз.\n\n" +
				"**Киргизүү маалыматтары:** Бир сап.\n" +
				"**Чыгаруу маалыматтары:** Тескерисинен жазылган сап.\n\n" +
				"**Мисал:**\nКиргизүү: `hello`\nЧыгаруу: `olleh`",
			TitleEn: "Reverse a String",
			DescEn: "You are given a string. Print it in reverse order.\n\n" +
				"**Input:** One string.\n" +
				"**Output:** The string written backwards.\n\n" +
				"**Example:**\nInput: `hello`\nOutput: `olleh`",
		},
		{
			TitleRu: "Проверка палиндрома",
			TitleKy: "Палиндромду текшерүү",
			DescKy: "Берилген сап палиндром экенин аныктаңыз.\n\n" +
				"**Киргизүү маалыматтары:** Бир сап.\n" +
				"**Чыгаруу маалыматтары:** Палиндром болсо YES, антпесе NO.\n\n" +
				"**Мисал:**\nКиргизүү: `racecar`\nЧыгаруу: `YES`",
			TitleEn: "Palindrome Check",
			DescEn: "Determine whether the given string is a palindrome.\n\n" +
				"**Input:** One string.\n" +
				"**Output:** YES if it is a palindrome, NO otherwise.\n\n" +
				"**Example:**\nInput: `racecar`\nOutput: `YES`",
		},
		{
			TitleRu: "Факториал числа",
			TitleKy: "Сандын факториалы",
			DescKy: "n санынын факториалын эсептеңиз.\n\n" +
				"**Киргизүү маалыматтары:** Бүтүн сан n (0 ≤ n ≤ 12).\n" +
				"**Чыгаруу маалыматтары:** n!\n\n" +
				"**Мисал:**\nКиргизүү: `5`\nЧыгаруу: `120`",
			TitleEn: "Factorial",
			DescEn: "Compute the factorial of the number n.\n\n" +
				"**Input:** An integer n (0 ≤ n ≤ 12).\n" +
				"**Output:** n!\n\n" +
				"**Example:**\nInput: `5`\nOutput: `120`",
		},
		{
			TitleRu: "Максимум в массиве",
			TitleKy: "Массивдеги максимум",
			DescKy: "Массивдин эң чоң элементин табыңыз.\n\n" +
				"**Киргизүү маалыматтары:** Биринчи сап — n (массивдин өлчөмү). Экинчи сап — n бүтүн сан.\n" +
				"**Чыгаруу маалыматтары:** Эң чоң элемент.\n\n" +
				"**Мисал:**\nКиргизүү:\n```\n5\n1 3 5 2 4\n```\nЧыгаруу: `5`",
			TitleEn: "Maximum in an Array",
			DescEn: "Find the maximum element of an array.\n\n" +
				"**Input:** The first line — n (the array size). The second line — n integers.\n" +
				"**Output:** The maximum element.\n\n" +
				"**Example:**\nInput:\n```\n5\n1 3 5 2 4\n```\nOutput: `5`",
		},
		{
			TitleRu: "Чётное или нечётное",
			TitleKy: "Жуппу же такпы",
			DescKy: "Берилген сан жуп же так экенин аныктаңыз.\n\n" +
				"**Киргизүү маалыматтары:** Бир бүтүн сан.\n" +
				"**Чыгаруу маалыматтары:** Жуп болсо EVEN, так болсо ODD.\n\n" +
				"**Мисал:**\nКиргизүү: `4`\nЧыгаруу: `EVEN`",
			TitleEn: "Even or Odd",
			DescEn: "Determine whether the given number is even or odd.\n\n" +
				"**Input:** One integer.\n" +
				"**Output:** EVEN if it is even, ODD if it is odd.\n\n" +
				"**Example:**\nInput: `4`\nOutput: `EVEN`",
		},
		{
			TitleRu: "Подсчёт гласных",
			TitleKy: "Үндүү тамгаларды саноо",
			DescKy: "Саптагы үндүү тамгалардын (a, e, i, o, u) санын эсептеңиз. Регистр эске алынбайт.\n\n" +
				"**Киргизүү маалыматтары:** Бир сап.\n" +
				"**Чыгаруу маалыматтары:** Үндүү тамгалардын саны.\n\n" +
				"**Мисал:**\nКиргизүү: `Hello World`\nЧыгаруу: `3`",
			TitleEn: "Count the Vowels",
			DescEn: "Count the vowels (a, e, i, o, u) in a string. Case does not matter.\n\n" +
				"**Input:** One string.\n" +
				"**Output:** The number of vowels.\n\n" +
				"**Example:**\nInput: `Hello World`\nOutput: `3`",
		},
		{
			TitleRu: "НОД двух чисел",
			TitleKy: "Эки сандын ЭЧЖБ",
			DescKy: "Эки оң бүтүн сандын эң чоң жалпы бөлүүчүсүн (ЭЧЖБ) табыңыз.\n\n" +
				"**Киргизүү маалыматтары:** Бир саптагы a жана b бүтүн сандары.\n" +
				"**Чыгаруу маалыматтары:** ЭЧЖБ(a, b).\n\n" +
				"**Мисал:**\nКиргизүү: `12 8`\nЧыгаруу: `4`",
			TitleEn: "GCD of Two Numbers",
			DescEn: "Find the greatest common divisor (GCD) of two positive integers.\n\n" +
				"**Input:** Two integers a and b on one line.\n" +
				"**Output:** GCD(a, b).\n\n" +
				"**Example:**\nInput: `12 8`\nOutput: `4`",
		},
		{
			TitleRu: "Сумма элементов массива",
			TitleKy: "Массив элементтеринин суммасы",
			DescKy: "Массивдин бардык элементтеринин суммасын эсептеңиз.\n\n" +
				"**Киргизүү маалыматтары:** Биринчи сап — n. Экинчи сап — n бүтүн сан.\n" +
				"**Чыгаруу маалыматтары:** Элементтердин суммасы.\n\n" +
				"**Мисал:**\nКиргизүү:\n```\n4\n1 2 3 4\n```\nЧыгаруу: `10`",
			TitleEn: "Sum of Array Elements",
			DescEn: "Compute the sum of all elements of an array.\n\n" +
				"**Input:** The first line — n. The second line — n integers.\n" +
				"**Output:** The sum of the elements.\n\n" +
				"**Example:**\nInput:\n```\n4\n1 2 3 4\n```\nOutput: `10`",
		},
		{
			TitleRu: "Проверка простого числа",
			TitleKy: "Жай санды текшерүү",
			DescKy: "Берилген сан жай сан экенин аныктаңыз.\n\n" +
				"**Киргизүү маалыматтары:** Бүтүн сан n (1 ≤ n ≤ 10^6).\n" +
				"**Чыгаруу маалыматтары:** Жай болсо YES, антпесе NO.\n\n" +
				"**Мисал:**\nКиргизүү: `7`\nЧыгаруу: `YES`",
			TitleEn: "Prime Check",
			DescEn: "Determine whether the given number is prime.\n\n" +
				"**Input:** An integer n (1 ≤ n ≤ 10^6).\n" +
				"**Output:** YES if it is prime, NO otherwise.\n\n" +
				"**Example:**\nInput: `7`\nOutput: `YES`",
		},
	}
}
