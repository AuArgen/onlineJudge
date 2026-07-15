package database

// addGoCourseContent seeds the "Go from scratch" course lessons.
func addGoCourseContent(m map[string]lessonContentSeed) {
	m["go-first-program"] = lessonContentSeed{
		Summary: "Первая программа на Go: package main, import и fmt.Println.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Go — простой и быстрый язык от Google: строгий, как Java, но заметно лаконичнее. Компилируется мгновенно, работает почти со скоростью C++.

Каждая программа на Go начинается с объявления пакета. Исполняемая программа живёт в пакете main и стартует с функции main. Нажмите «Запустить».`},
			{Type: "code", Language: "go", Caption: "Ваша первая программа на Go", Content: `package main

import "fmt"

func main() {
	fmt.Println("Hello, World!")
}`},
			{Type: "text", Content: `Разберём структуру:

• package main — объявление пакета: у исполняемой программы он всегда main;
• import "fmt" — подключение пакета форматированного ввода-вывода;
• func main() { ... } — точка входа;
• fmt.Println(...) — вывод с переводом строки; несколько значений разделяются запятыми, пробел между ними Go поставит сам.

Особенность Go: неиспользуемый импорт или переменная — это ошибка компиляции, а не предупреждение. Язык заставляет держать код в чистоте.`},
			{Type: "code", Language: "go", Caption: "Println умеет выводить текст и вычисления", Content: `package main

import "fmt"

func main() {
	fmt.Println("2 + 2 =", 2+2)
	fmt.Println("10 * 10 =", 10*10)
}`},
			{Type: "text", Content: `Задание: выведите три строки — своё имя, свой город и результат вычисления 7 * 6.

Когда получится — отметьте урок пройденным и переходите к переменным.`},
		},
	}

	m["go-variables-types"] = lessonContentSeed{
		Summary: "Объявление var и :=, типы int, int64, float64, string, bool.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `В Go два способа завести переменную:

• полная форма: var age int = 15 (тип можно опустить — var age = 15);
• короткая форма := — работает только внутри функций: age := 15. На практике почти всегда пишут её.

Основные типы:

• int — целые числа (на этом сервере 64-битный, до 9·10¹⁸);
• int64 — явно 64-битное целое;
• float64 — дробные числа;
• string — строка;
• bool — true или false.`},
			{Type: "code", Language: "go", Caption: "Переменные и вывод типов", Content: `package main

import "fmt"

func main() {
	age := 15
	pi := 3.14159
	name := "Азат"
	ready := true

	fmt.Println(age, pi, name, ready)
	fmt.Printf("типы: %T %T %T %T\n", age, pi, name, ready)
}`},
			{Type: "text", Content: `fmt.Printf выводит по формату: %d — целое, %f — дробное, %s — строка, %T — тип значения, \n — перевод строки.

Арифметика: + - * / %. Деление целых отбрасывает дробную часть: 7 / 2 равно 3, остаток 7 % 2 равен 1.

Go строг к типам: сложить int и float64 напрямую нельзя — нужно явное преобразование, например float64(a).`},
			{Type: "code", Language: "go", Caption: "Целочисленное деление и преобразование типов", Content: `package main

import "fmt"

func main() {
	a, b := 7, 2
	fmt.Println(a/b, "<- целая часть")
	fmt.Println(a%b, "<- остаток")

	fmt.Println(float64(a)/float64(b), "<- дробное деление")
}`},
			{Type: "text", Content: `Задание: заведите переменные со значениями 15 и 4 и выведите сумму, разность, произведение, целую часть от деления и остаток — каждое на отдельной строке.

Затем отметьте урок пройденным.`},
		},
	}

	m["go-input"] = lessonContentSeed{
		Summary:  "Чтение входных данных через fmt.Scan и указатели &.",
		Problems: []string{"Сумма двух чисел"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Данные в задачах приходят со стандартного ввода. Базовый способ чтения в Go — fmt.Scan: он читает значения через пробелы и переводы строк.

Обратите внимание на символ & перед переменной: Scan нужно знать, КУДА записать значение, поэтому ему передаётся адрес переменной. Забытый & — ошибка, которую делает каждый новичок.

Нажмите «Входные данные», введите два числа и запустите.`},
			{Type: "code", Language: "go", Caption: "Введите в поле «Входные данные» два числа, например: 3 5", Content: `package main

import "fmt"

func main() {
	var a, b int
	fmt.Scan(&a, &b)
	fmt.Println(a + b)
}`},
			{Type: "text", Content: `fmt.Scan читает значения по порядку и умеет заполнять сразу несколько переменных. Слова (без пробелов) читаются в string тем же способом.`},
			{Type: "code", Language: "go", Caption: "Введите имя и возраст, например: Азат 15", Content: `package main

import "fmt"

func main() {
	var name string
	var age int
	fmt.Scan(&name, &age)
	fmt.Println("Привет,", name+"!", "Тебе", age, "лет.")
}`},
			{Type: "text", Content: `fmt.Scan удобен, но на больших объёмах данных медленный — быстрое чтение через bufio разберём в последнем уроке курса.

Задание: прочитайте три числа и выведите их среднее арифметическое (не забудьте преобразование float64 для дробного результата).

Затем решите прикреплённую задачу «Сумма двух чисел», добейтесь Accepted и отметьте урок пройденным.`},
		},
	}

	m["go-conditions"] = lessonContentSeed{
		Summary:  "Условия if/else if/else без скобок, логические && и ||.",
		Problems: []string{"Чётное или нечётное"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Оператор if в Go пишется без скобок вокруг условия, но фигурные скобки тела обязательны всегда — даже для одной строки. Ещё одно правило стиля, которое компилятор навязывает: else пишется на одной строке с закрывающей скобкой.

Сравнения: == != < > <= >=; связки: && (И), || (ИЛИ), ! (НЕ).`},
			{Type: "code", Language: "go", Caption: "Введите число — программа скажет, чётное ли оно", Content: `package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)

	if n%2 == 0 {
		fmt.Println("EVEN")
	} else {
		fmt.Println("ODD")
	}
}`},
			{Type: "text", Content: `Несколько веток — через else if. Ниже программа находит наибольшее из трёх чисел.`},
			{Type: "code", Language: "go", Caption: "Введите три числа, например: 3 9 5", Content: `package main

import "fmt"

func main() {
	var a, b, c int
	fmt.Scan(&a, &b, &c)

	if a >= b && a >= c {
		fmt.Println(a)
	} else if b >= c {
		fmt.Println(b)
	} else {
		fmt.Println(c)
	}
}`},
			{Type: "text", Content: `Задание: прочитайте возраст и выведите «school», если он от 7 до 17 включительно, иначе «other».

Затем решите прикреплённую задачу «Чётное или нечётное» и отметьте урок пройденным.`},
		},
	}

	m["go-loops"] = lessonContentSeed{
		Summary:  "Единственный цикл for и три его формы; накопление результата.",
		Problems: []string{"Факториал числа", "Сумма элементов массива"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `В Go всего один цикл — for, но у него три формы:

• классическая: for i := 1; i <= n; i++ { ... }
• как while: for условие { ... }
• бесконечная: for { ... } (выход через break)

Отдельного while в языке нет — его роль играет вторая форма.`},
			{Type: "code", Language: "go", Caption: "Счётчик от 1 до 5", Content: `package main

import "fmt"

func main() {
	for i := 1; i <= 5; i++ {
		fmt.Println("Шаг номер", i)
	}
}`},
			{Type: "text", Content: `Приём накопления: заводим переменную-накопитель и обновляем её на каждом шаге. Ниже — чтение n чисел и их сумма.`},
			{Type: "code", Language: "go", Caption: "Введите: 4, затем 10 20 30 40", Content: `package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)

	sum := 0
	for i := 0; i < n; i++ {
		var x int
		fmt.Scan(&x)
		sum += x
	}
	fmt.Println(sum)
}`},
			{Type: "code", Language: "go", Caption: "Форма while: сколько раз число делится на 2? Введите: 96", Content: `package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)

	count := 0
	for n%2 == 0 {
		n /= 2
		count++
	}
	fmt.Println(count)
}`},
			{Type: "text", Content: `Задание: выведите все чётные числа от 2 до 20 в одну строку (подсказка: fmt.Print(x, " ") печатает без перевода строки).

Затем решите прикреплённые задачи «Факториал числа» и «Сумма элементов массива» — и отметьте урок пройденным.`},
		},
	}

	m["go-slices"] = lessonContentSeed{
		Summary:  "Срезы (slices): make, append, range и поиск максимума.",
		Problems: []string{"Максимум в массиве"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Главная структура для хранения последовательностей в Go — срез (slice): массив переменной длины.

• make([]int, n) — создать срез из n нулей;
• append(a, x) — добавить элемент в конец (возвращает новый срез!);
• len(a) — длина;
• индексы от 0 до len(a)-1.

Для обхода есть range — он выдаёт индекс и значение элемента.`},
			{Type: "code", Language: "go", Caption: "Введите: 5, затем 1 3 5 2 4", Content: `package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)

	a := make([]int, n)
	for i := range a {
		fmt.Scan(&a[i])
	}

	for i := n - 1; i >= 0; i-- {
		fmt.Print(a[i], " ")
	}
	fmt.Println()
}`},
			{Type: "text", Content: `Программа печатает срез в обратном порядке.

Поиск максимума — базовый шаблон: берём первый элемент и обновляем максимум в цикле. Range здесь удобен: пишем for _, x := range a — подчёркивание означает «индекс не нужен».`},
			{Type: "code", Language: "go", Caption: "Поиск максимума. Введите: 5, затем 1 3 5 2 4", Content: `package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)

	a := make([]int, n)
	for i := range a {
		fmt.Scan(&a[i])
	}

	best := a[0]
	for _, x := range a {
		if x > best {
			best = x
		}
	}
	fmt.Println(best)
}`},
			{Type: "text", Content: `Задание: найдите минимум того же среза и выведите минимум и максимум через пробел.

Затем решите прикреплённую задачу «Максимум в массиве» и отметьте урок пройденным.`},
		},
	}

	m["go-strings"] = lessonContentSeed{
		Summary:  "Строки, пакет strings, руны и переворот строки через []rune.",
		Problems: []string{"Переворот строки", "Проверка палиндрома", "Подсчёт гласных"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Строки в Go неизменяемы. Полезные функции живут в пакете strings: ToLower, ToUpper, Contains, Count, Split.

Тонкость Go: строка хранится в байтах, а не в символах. Для латиницы и цифр это неважно, но кириллическая буква занимает 2 байта. Чтобы работать с настоящими символами, строку преобразуют в срез рун: []rune(s). Правило простое: len(s) — байты, len([]rune(s)) — символы.`},
			{Type: "code", Language: "go", Caption: "Введите слово, например: hello", Content: `package main

import (
	"fmt"
	"strings"
)

func main() {
	var s string
	fmt.Scan(&s)

	fmt.Println("Длина в символах:", len([]rune(s)))
	fmt.Println("Заглавными:", strings.ToUpper(s))
	fmt.Println("Букв l:", strings.Count(s, "l"))
}`},
			{Type: "text", Content: `Переворот строки делается через срез рун: обмениваем первый символ с последним, второй — с предпоследним, пока не встретимся в середине. Заодно это даёт проверку палиндрома: перевернули и сравнили.`},
			{Type: "code", Language: "go", Caption: "Переворот и проверка палиндрома. Введите: racecar", Content: `package main

import "fmt"

func main() {
	var s string
	fmt.Scan(&s)

	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	reversed := string(r)

	fmt.Println("Задом наперёд:", reversed)
	if s == reversed {
		fmt.Println("YES")
	} else {
		fmt.Println("NO")
	}
}`},
			{Type: "text", Content: `Заметьте элегантный обмен без временной переменной: r[i], r[j] = r[j], r[i] — фирменный приём Go.

К уроку прикреплены задачи «Переворот строки», «Проверка палиндрома» и «Подсчёт гласных» — решите все три и отметьте урок пройденным.`},
		},
	}

	m["go-functions"] = lessonContentSeed{
		Summary:  "Функции: параметры, возврат нескольких значений, НОД и простота.",
		Problems: []string{"НОД двух чисел", "Проверка простого числа"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Функция в Go объявляется словом func; тип результата пишется после списка параметров. Фишка языка — функция может возвращать несколько значений сразу.

Ниже — алгоритм Евклида для наибольшего общего делителя.`},
			{Type: "code", Language: "go", Caption: "НОД двух чисел. Введите: 12 8", Content: `package main

import "fmt"

func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

func main() {
	var a, b int
	fmt.Scan(&a, &b)
	fmt.Println(gcd(a, b))
}`},
			{Type: "text", Content: `Строка a, b = b, a%b — множественное присваивание: обе части вычисляются одновременно, временная переменная не нужна.

Функции с результатом bool оформляют проверки. Для простоты числа делители перебираются до корня: условие i*i <= n.`},
			{Type: "code", Language: "go", Caption: "Проверка простоты за корень. Введите: 97", Content: `package main

import "fmt"

func isPrime(n int) bool {
	if n < 2 {
		return false
	}
	for i := 2; i*i <= n; i++ {
		if n%i == 0 {
			return false
		}
	}
	return true
}

func main() {
	var n int
	fmt.Scan(&n)
	if isPrime(n) {
		fmt.Println("YES")
	} else {
		fmt.Println("NO")
	}
}`},
			{Type: "text", Content: `Пример нескольких возвращаемых значений: func minMax(a []int) (int, int) может вернуть минимум и максимум за один проход — попробуйте написать такую функцию в качестве задания.

Затем решите прикреплённые задачи «НОД двух чисел» и «Проверка простого числа» — и отметьте урок пройденным.`},
		},
	}

	m["go-maps"] = lessonContentSeed{
		Summary: "Мапы map и структуры struct: подсчёт повторов и составные данные.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Мапа (map) — словарь «ключ → значение» с мгновенным доступом по ключу. Создаётся через make, чтение несуществующего ключа возвращает ноль — поэтому подсчёт повторов пишется без всяких проверок: count[x]++ просто работает.`},
			{Type: "code", Language: "go", Caption: "Подсчёт повторов. Введите: 6, затем 1 2 2 3 3 3", Content: `package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)

	count := make(map[int]int)
	for i := 0; i < n; i++ {
		var x int
		fmt.Scan(&x)
		count[x]++
	}

	for key, value := range count {
		fmt.Println(key, "встречается", value, "раз")
	}
}`},
			{Type: "text", Content: `Внимание: порядок обхода мапы через range случайный — Go специально перемешивает его. Если нужен порядок, соберите ключи в срез и отсортируйте.

Структура (struct) объединяет разнотипные поля в один тип — например, точку с координатами или ученика с именем и баллом.`},
			{Type: "code", Language: "go", Caption: "Структуры: тип «ученик»", Content: `package main

import "fmt"

type Student struct {
	Name  string
	Score int
}

func main() {
	students := []Student{
		{Name: "Азат", Score: 95},
		{Name: "Айгуль", Score: 98},
	}

	best := students[0]
	for _, s := range students {
		if s.Score > best.Score {
			best = s
		}
	}
	fmt.Println("Лучший результат у", best.Name)
}`},
			{Type: "text", Content: `Задание: прочитайте n чисел и выведите количество различных (подсказка: map[int]bool в роли множества, ответ — len мапы).

Отметьте урок пройденным — остался финальный урок про быстрый ввод-вывод.`},
		},
	}

	m["go-competitive"] = lessonContentSeed{
		Summary: "bufio: быстрый ввод-вывод и олимпиадный шаблон на Go.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `fmt.Scan читает посимвольно и на больших данных безнадёжно медленный. Олимпиадный стандарт в Go — буферизованный ввод-вывод из пакета bufio:

• bufio.Reader + fmt.Fscan — быстрое чтение;
• bufio.Writer + fmt.Fprintln — быстрый вывод; в конце обязателен writer.Flush(), иначе буфер не будет напечатан (и вы получите Wrong Answer при правильном решении).`},
			{Type: "code", Language: "go", Caption: "Олимпиадный шаблон. Введите: 4, затем 10 20 30 40", Content: `package main

import (
	"bufio"
	"fmt"
	"os"
)

var reader = bufio.NewReader(os.Stdin)
var writer = bufio.NewWriter(os.Stdout)

func main() {
	defer writer.Flush()

	var n int
	fmt.Fscan(reader, &n)

	sum := 0
	for i := 0; i < n; i++ {
		var x int
		fmt.Fscan(reader, &x)
		sum += x
	}
	fmt.Fprintln(writer, sum)
}`},
			{Type: "text", Content: `Что важно в шаблоне:

• reader и writer объявлены на уровне пакета — доступны из любой функции;
• defer writer.Flush() гарантирует сброс буфера при выходе из main — писать эту строку первой стало ритуалом олимпиадников на Go;
• fmt.Fscan(reader, &x) — тот же Scan, но из быстрого буфера.

Checklist олимпиадника на Go:

1. Не забыт ли writer.Flush()? (defer решает это раз и навсегда)
2. int в Go 64-битный — переполнения int32 можно не бояться, но произведения трёх больших чисел всё равно проверяйте.
3. len(s) — байты; для кириллицы и юникода работайте через []rune.
4. Неиспользуемые переменные и импорты не скомпилируются — удаляйте.`},
			{Type: "text", Content: `Курс завершён — поздравляем!

Откройте раздел «Обучение» и начинайте «Путь олимпиадника» с Уровня 1: сложность алгоритмов, задачи на реализацию и базовая математика. Удачи на соревнованиях!`},
		},
	}
}
