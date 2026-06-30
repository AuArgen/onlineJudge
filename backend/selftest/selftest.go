package selftest

import (
	"fmt"
	"onlineJudge/backend/services/compiler"
	"strings"
	"time"
)

func Run() {
	fmt.Println("==========================================")
	fmt.Println("🚀 ЗАПУСК САМОДИАГНОСТИКИ (SELF-TEST)...")
	fmt.Println("==========================================")

	time.Sleep(2 * time.Second)

	tests := []struct {
		LangID int
		Name   string
		Code   string
	}{
		{71, "Python 3.8", "print('test')"},
		{54, "C++ (GCC)", "#include <iostream>\nint main() { std::cout << \"test\"; return 0; }"},
		{62, "Java (OpenJDK)", "public class Main { public static void main(String[] args) { System.out.print(\"test\"); } }"},
		{60, "Go", "package main\nimport \"fmt\"\nfunc main() { fmt.Print(\"test\") }"},
		{63, "Node.js", "console.log('test')"},
	}

	hasErrors := false

	for _, test := range tests {
		fmt.Printf("⏳ Testing %s (ID: %d)...\n", test.Name, test.LangID)

		sub := compiler.CompilerSubmission{
			LanguageID:  test.LangID,
			SourceCode:  test.Code,
			TimeLimit:   30.0,
			MemoryLimit: 512,
		}

		start := time.Now()
		results, err := compiler.ExecuteCode(sub, []string{""})
		duration := time.Since(start)

		if err != nil {
			fmt.Printf("❌ ОШИБКА [%s]: %v\n", test.Name, err)
			hasErrors = true
			continue
		}

		result := results[0]

		if result.Stderr != "" {
			fmt.Printf("❌ ОШИБКА [%s] (Stderr): %s\n", test.Name, result.Stderr)
			hasErrors = true
			continue
		}

		output := strings.TrimRight(result.Stdout, "\n")
		if output != "test" {
			fmt.Printf("❌ ОШИБКА [%s]: Ожидалось 'test', получено '%s'\n", test.Name, result.Stdout)
			hasErrors = true
			continue
		}

		fmt.Printf("✅ УСПЕШНО [%s] (%s)\n", test.Name, duration)
	}

	fmt.Println("==========================================")
	if hasErrors {
		fmt.Println("⚠️  ЕСТЬ ПРОБЛЕМЫ С НЕКОТОРЫМИ КОМПИЛЯТОРАМИ")
		fmt.Println("⚠️  Проверьте Docker и интернет соединение.")
	} else {
		fmt.Println("✅ ВСЕ КОМПИЛЯТОРЫ РАБОТАЮТ КОРРЕКТНО")
	}
	fmt.Println("==========================================")
}
