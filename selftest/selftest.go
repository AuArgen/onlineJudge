package selftest

import (
	"log"
	"onlineJudge/compiler"
	"onlineJudge/models"
	"strings"
)

// TestCases defines a simple code snippet for each language ID to verify execution
var TestCases = map[int]struct {
	Name string
	Code string
}{
	71: {"Python 3.8", "print('test')"},
	63: {"Node.js", "console.log('test')"},
	60: {"Go", `package main; import "fmt"; func main() { fmt.Print("test") }`},
	54: {"C++ (GCC)", `#include <iostream>
int main() { std::cout << "test"; return 0; }`},
	62: {"Java (OpenJDK)", `public class Main { public static void main(String[] args) { System.out.print("test"); } }`},
}

// Run performs a self-test on all supported languages
func Run() {
	log.Println("==========================================")
	log.Println("🚀 ЗАПУСК САМОДИАГНОСТИКИ (SELF-TEST)...")
	log.Println("==========================================")

	allPassed := true

	for id, test := range TestCases {
		log.Printf("Testing %s (ID: %d)...", test.Name, id)

		submission := models.Submission{
			LanguageID:  id,
			SourceCode:  test.Code,
			Stdin:       "",
			TimeLimit:   10.0, // Give enough time for first pull
			MemoryLimit: 512,
		}

		// Run the code
		result, err := compiler.ExecuteCode(submission)

		if err != nil {
			log.Printf("❌ ОШИБКА [%s]: %v\n", test.Name, err)
			allPassed = false
			continue
		}

		if result.Stderr != "" {
			log.Printf("❌ ОШИБКА [%s] (Stderr): %s\n", test.Name, result.Stderr)
			allPassed = false
			continue
		}

		// Check output (trim newlines)
		output := strings.TrimSpace(result.Stdout)
		if output == "test" {
			log.Printf("✅ УСПЕШНО [%s]\n", test.Name)
		} else {
			log.Printf("❌ ОШИБКА [%s]: Ожидалось 'test', получено '%s'\n", test.Name, output)
			allPassed = false
		}
	}

	log.Println("==========================================")
	if allPassed {
		log.Println("✅ ВСЕ СИСТЕМЫ РАБОТАЮТ НОРМАЛЬНО")
	} else {
		log.Println("⚠️ ЕСТЬ ПРОБЛЕМЫ С НЕКОТОРЫМИ КОМПИЛЯТОРАМИ")
	}
	log.Println("==========================================")
}
