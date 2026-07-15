package database

// addJavaCourseContent seeds the "Java from scratch" course lessons.
func addJavaCourseContent(m map[string]lessonContentSeed) {
	m["java-first-program"] = lessonContentSeed{
		Summary: "Первая программа на Java: класс Main, метод main и System.out.println.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Java — строгий и подробный язык: даже самая маленькая программа оформляется как класс с методом main. Зато эта строгость приучает к дисциплине, а виртуальная машина Java работает быстро.

Важно именно для этого сайта: публичный класс должен называться Main — иначе проверяющая система не сможет скомпилировать решение.

Нажмите «Запустить» и посмотрите на результат.`},
			{Type: "code", Language: "java", Caption: "Ваша первая программа на Java", Content: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`},
			{Type: "text", Content: `Разберём обязательную «обвязку»:

• public class Main — объявление класса; весь код на Java живёт внутри классов;
• public static void main(String[] args) — точка входа: выполнение начинается с этого метода;
• System.out.println(...) — вывод строки с переводом строки в конце (print без ln — без перевода);
• каждая команда заканчивается точкой с запятой.

Попробуйте изменить текст в кавычках и запустить снова.`},
			{Type: "code", Language: "java", Caption: "println умеет выводить текст и вычисления", Content: `public class Main {
    public static void main(String[] args) {
        System.out.println("2 + 2 = " + (2 + 2));
        System.out.println("10 * 10 = " + (10 * 10));
    }
}`},
			{Type: "text", Content: `Обратите внимание на скобки вокруг (2 + 2): оператор + для строк означает склейку, поэтому без скобок "..." + 2 + 2 напечатало бы «22».

Задание: выведите три строки — своё имя, свой город и результат вычисления 7 * 6. Затем отметьте урок пройденным.`},
		},
	}

	m["java-variables-types"] = lessonContentSeed{
		Summary: "Типы int, long, double, char, boolean и String; арифметика и переполнение.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Java — язык со строгой типизацией: у каждой переменной объявляется тип, и он не меняется.

Главные типы:

• int — целые числа примерно до 2 миллиардов (2·10⁹);
• long — большие целые до 9·10¹⁸; в конце литерала пишется L: 1000000000000L;
• double — дробные числа;
• char — один символ в одинарных кавычках;
• boolean — true или false;
• String — строка (это класс, пишется с большой буквы).`},
			{Type: "code", Language: "java", Caption: "Объявление переменных разных типов", Content: `public class Main {
    public static void main(String[] args) {
        int age = 15;
        long big = 1000000000000L;
        double pi = 3.14159;
        char letter = 'A';
        boolean ready = true;
        String name = "Азат";

        System.out.println(age);
        System.out.println(big);
        System.out.println(pi);
        System.out.println(letter);
        System.out.println(ready);
        System.out.println(name);
    }
}`},
			{Type: "text", Content: `Арифметика: + - * / %. Как и в C++, деление целых отбрасывает дробную часть: 7 / 2 равно 3. Остаток: 7 % 2 равно 1.

Переполнение — главная ловушка: произведение двух int по миллиарду в int не помещается. Для больших значений используйте long — и помните, что тип результата определяется типами операндов: чтобы произведение считалось в long, хотя бы один множитель должен быть long.`},
			{Type: "code", Language: "java", Caption: "Целочисленное деление и переполнение", Content: `public class Main {
    public static void main(String[] args) {
        int a = 7, b = 2;
        System.out.println(a / b + " <- целая часть");
        System.out.println(a % b + " <- остаток");

        int x = 1000000000;
        System.out.println(x * x + " <- ПЕРЕПОЛНЕНИЕ: мусор");
        System.out.println((long) x * x + " <- правильно, через long");
    }
}`},
			{Type: "text", Content: `Задание: заведите переменные со значениями 15 и 4 и выведите сумму, разность, произведение, целую часть от деления и остаток — каждое на отдельной строке.

Затем отметьте урок пройденным.`},
		},
	}

	m["java-input"] = lessonContentSeed{
		Summary:  "Чтение входных данных через Scanner: nextInt, nextLong, next.",
		Problems: []string{"Сумма двух чисел"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Данные в задачах приходят со стандартного ввода. Простейший способ читать их в Java — класс Scanner из пакета java.util.

Основные методы: nextInt() — целое, nextLong() — длинное целое, nextDouble() — дробное, next() — одно слово. Scanner сам пропускает пробелы и переводы строк.

Нажмите «Входные данные» над кодом, введите два числа через пробел и запустите.`},
			{Type: "code", Language: "java", Caption: "Введите в поле «Входные данные» два числа, например: 3 5", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}`},
			{Type: "text", Content: `Не забудьте import java.util.Scanner; в первой строке файла — без него класс Scanner не найдётся.

Слова читаются методом next():`},
			{Type: "code", Language: "java", Caption: "Введите имя и возраст, например: Азат 15", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.next();
        int age = sc.nextInt();
        System.out.println("Привет, " + name + "! Тебе " + age + " лет.");
    }
}`},
			{Type: "text", Content: `Scanner удобен, но медленный — на больших данных это станет проблемой. Быстрый способ чтения (BufferedReader) разберём в последнем уроке курса.

Задание: прочитайте три числа и выведите их среднее арифметическое (делите на 3.0, чтобы результат был дробным).

Затем решите прикреплённую задачу «Сумма двух чисел», добейтесь Accepted и отметьте урок пройденным.`},
		},
	}

	m["java-conditions"] = lessonContentSeed{
		Summary:  "if/else, логические && и ||, сравнение строк через equals.",
		Problems: []string{"Чётное или нечётное"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Оператор if выполняет блок кода при истинном условии. Сравнения: == != < > <= >=; логические связки: && (И), || (ИЛИ), ! (НЕ).

Равенство — два знака ==. Одиночное = — присваивание.`},
			{Type: "code", Language: "java", Caption: "Введите число — программа скажет, чётное ли оно", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        if (n % 2 == 0) {
            System.out.println("EVEN");
        } else {
            System.out.println("ODD");
        }
    }
}`},
			{Type: "text", Content: `Особая ловушка Java, которой нет в других языках курса: строки НЕЛЬЗЯ сравнивать через ==. Оператор == сравнивает не содержимое строк, а ссылки на объекты. Для строк всегда используйте метод equals.`},
			{Type: "code", Language: "java", Caption: "Введите слово, например: yes", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String answer = sc.next();

        if (answer.equals("yes")) {
            System.out.println("Согласие получено");
        } else if (answer.equals("no")) {
            System.out.println("Отказ");
        } else {
            System.out.println("Не понимаю: " + answer);
        }
    }
}`},
			{Type: "text", Content: `Задание: прочитайте три числа и выведите наибольшее (цепочка if / else if / else и связка &&).

Затем решите прикреплённую задачу «Чётное или нечётное» и отметьте урок пройденным.`},
		},
	}

	m["java-loops"] = lessonContentSeed{
		Summary:  "Циклы for и while: счётчики, накопление суммы и произведения.",
		Problems: []string{"Факториал числа", "Сумма элементов массива"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Цикл for в Java устроен как в C++: старт; условие; шаг. Классика — счётчик от 1 до n.`},
			{Type: "code", Language: "java", Caption: "Счётчик от 1 до 5", Content: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Шаг номер " + i);
        }
    }
}`},
			{Type: "text", Content: `Главный приём — накопление результата в переменной. Ниже программа читает n, затем n чисел, и считает сумму. Сумма объявлена как long: при больших данных int переполнится.`},
			{Type: "code", Language: "java", Caption: "Введите: 4, затем 10 20 30 40", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        long sum = 0;
        for (int i = 0; i < n; i++) {
            sum += sc.nextInt();
        }
        System.out.println(sum);
    }
}`},
			{Type: "text", Content: `Цикл while повторяется, пока условие истинно, — используйте его, когда число шагов заранее неизвестно.`},
			{Type: "code", Language: "java", Caption: "Сколько раз число делится на 2? Введите: 96", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int count = 0;
        while (n % 2 == 0) {
            n /= 2;
            count++;
        }
        System.out.println(count);
    }
}`},
			{Type: "text", Content: `Задание: выведите все чётные числа от 2 до 20 в одну строку через пробел (System.out.print без ln).

Затем решите прикреплённые задачи «Факториал числа» (считайте в long!) и «Сумма элементов массива» — и отметьте урок пройденным.`},
		},
	}

	m["java-arrays"] = lessonContentSeed{
		Summary:  "Массивы int[]: создание, чтение, обход и поиск максимума.",
		Problems: []string{"Максимум в массиве"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Массив хранит много значений одного типа. В Java массив создаётся оператором new с указанием размера, а длина хранится в поле length.

Индексы идут от 0 до length - 1. Выход за границы порождает ArrayIndexOutOfBoundsException — и вердикт Runtime Error на проверке.`},
			{Type: "code", Language: "java", Caption: "Введите: 5, затем 1 3 5 2 4", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = sc.nextInt();
        }

        for (int i = n - 1; i >= 0; i--) {
            System.out.print(a[i] + " ");
        }
        System.out.println();
    }
}`},
			{Type: "text", Content: `Программа печатает массив в обратном порядке — цикл идёт с конца.

Второй базовый приём — поиск максимума: принимаем первый элемент за текущий максимум и обновляем его в цикле.`},
			{Type: "code", Language: "java", Caption: "Поиск максимума. Введите: 5, затем 1 3 5 2 4", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = sc.nextInt();
        }

        int best = a[0];
        for (int i = 1; i < n; i++) {
            if (a[i] > best) {
                best = a[i];
            }
        }
        System.out.println(best);
    }
}`},
			{Type: "text", Content: `Задание: найдите минимум того же массива и выведите минимум и максимум через пробел.

Затем решите прикреплённую задачу «Максимум в массиве» и отметьте урок пройденным.`},
		},
	}

	m["java-strings"] = lessonContentSeed{
		Summary:  "Строки: length, charAt, substring, неизменяемость и StringBuilder.",
		Problems: []string{"Переворот строки", "Проверка палиндрома", "Подсчёт гласных"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Строка String — последовательность символов. Основные методы:

• s.length() — длина;
• s.charAt(i) — символ с индексом i (индексы с нуля);
• s.substring(a, b) — подстрока с индекса a до b, не включая b;
• s.toLowerCase() / s.toUpperCase() — регистр;
• s.equals(t) — сравнение содержимого (не ==, как вы помните из урока про условия).

Строки в Java неизменяемы: каждая «правка» создаёт новую строку.`},
			{Type: "code", Language: "java", Caption: "Введите слово, например: hello", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();

        System.out.println("Длина: " + s.length());
        System.out.println("Первый символ: " + s.charAt(0));

        for (int i = s.length() - 1; i >= 0; i--) {
            System.out.print(s.charAt(i));
        }
        System.out.println();
    }
}`},
			{Type: "text", Content: `Из-за неизменяемости строк склейка в цикле через + работает медленно: каждая операция копирует всю строку. Для сборки строк по кусочкам существует StringBuilder — у него есть и готовый метод reverse.

Ниже — проверка палиндрома двумя способами: сравнением символов и через StringBuilder.`},
			{Type: "code", Language: "java", Caption: "Проверка палиндрома. Введите: racecar", Content: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();

        String reversed = new StringBuilder(s).reverse().toString();

        if (s.equals(reversed)) {
            System.out.println("YES");
        } else {
            System.out.println("NO");
        }
    }
}`},
			{Type: "text", Content: `Задание: прочитайте слово и посчитайте, сколько раз в нём встречается буква «a» (цикл + charAt).

К уроку прикреплены задачи «Переворот строки», «Проверка палиндрома» и «Подсчёт гласных» — решите все три и отметьте урок пройденным.`},
		},
	}

	m["java-methods"] = lessonContentSeed{
		Summary:  "Статические методы: параметры, возврат значения, НОД и проверка простоты.",
		Problems: []string{"НОД двух чисел", "Проверка простого числа"},
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Методы в Java — аналог функций. В олимпиадных решениях их объявляют статическими (static) рядом с main: тогда их можно вызывать напрямую, без создания объектов.

Ниже — алгоритм Евклида для наибольшего общего делителя.`},
			{Type: "code", Language: "java", Caption: "НОД двух чисел. Введите: 12 8", Content: `import java.util.Scanner;

public class Main {
    static long gcd(long a, long b) {
        while (b != 0) {
            long r = a % b;
            a = b;
            b = r;
        }
        return a;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long a = sc.nextLong();
        long b = sc.nextLong();
        System.out.println(gcd(a, b));
    }
}`},
			{Type: "text", Content: `Методы с результатом boolean удобны для проверок. Проверяя простоту, перебирайте делители только до корня из n (условие i * i <= n) — это сокращает работу с n шагов до корня из n.`},
			{Type: "code", Language: "java", Caption: "Проверка простоты за корень. Введите: 97", Content: `import java.util.Scanner;

public class Main {
    static boolean isPrime(long n) {
        if (n < 2) return false;
        for (long i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        System.out.println(isPrime(n) ? "YES" : "NO");
    }
}`},
			{Type: "text", Content: `В последнем println использован тернарный оператор: условие ? значение_если_да : значение_если_нет — компактная форма if/else для выражений.

Задание: напишите метод long digitSum(long n), возвращающий сумму цифр числа.

Затем решите прикреплённые задачи «НОД двух чисел» и «Проверка простого числа» — и отметьте урок пройденным.`},
		},
	}

	m["java-collections"] = lessonContentSeed{
		Summary: "Коллекции: ArrayList, HashMap, TreeSet и сортировка Arrays.sort.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Коллекции — готовые структуры данных Java. Три самые нужные:

• ArrayList — список переменной длины (аналог vector в C++);
• HashMap — словарь «ключ → значение» для подсчётов и группировок;
• TreeSet — множество без повторов, хранящее элементы отсортированными.

Плюс статический метод Arrays.sort для сортировки обычных массивов.`},
			{Type: "code", Language: "java", Caption: "Сортировка массива. Введите: 5, затем 3 1 4 1 5", Content: `import java.util.Arrays;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = sc.nextInt();
        }

        Arrays.sort(a);

        for (int x : a) {
            System.out.print(x + " ");
        }
        System.out.println();
    }
}`},
			{Type: "text", Content: `Цикл for (int x : a) — короткая форма обхода «для каждого элемента».

Ниже HashMap считает, сколько раз встречается каждое число: метод getOrDefault возвращает накопленное значение или 0, если ключа ещё нет.`},
			{Type: "code", Language: "java", Caption: "Подсчёт повторов. Введите: 6, затем 1 2 2 3 3 3", Content: `import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        Map<Integer, Integer> count = new TreeMap<>();
        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            count.put(x, count.getOrDefault(x, 0) + 1);
        }

        for (Map.Entry<Integer, Integer> e : count.entrySet()) {
            System.out.println(e.getKey() + " встречается " + e.getValue() + " раз");
        }
    }
}`},
			{Type: "text", Content: `Задание: прочитайте n чисел и выведите количество различных (подсказка: сложите всё в TreeSet и выведите его size()).

Отметьте урок пройденным — впереди финальный урок про быстрый ввод-вывод.`},
		},
	}

	m["java-competitive"] = lessonContentSeed{
		Summary: "BufferedReader и StringBuilder: быстрый ввод-вывод и олимпиадный шаблон.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Scanner прост, но медленный: на сотнях тысяч чисел он может не уложиться в лимит времени, даже если алгоритм правильный. Олимпиадный стандарт для Java — BufferedReader для чтения и StringBuilder для вывода.

• BufferedReader читает большими кусками, StreamTokenizer или split разбирают строку на числа;
• StringBuilder накапливает весь вывод, и он печатается одним вызовом в конце.`},
			{Type: "code", Language: "java", Caption: "Быстрый шаблон. Введите: 4, затем 10 20 30 40", Content: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());

        long sum = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sum += Long.parseLong(st.nextToken());
            sb.append(sum).append(' ');
        }
        System.out.println(sb.toString().trim());
    }
}`},
			{Type: "text", Content: `Что важно в шаблоне:

• throws Exception у main избавляет от обязательных try/catch при чтении;
• br.readLine() читает целую строку, StringTokenizer выдаёт из неё числа по одному;
• весь вывод собирается в StringBuilder — тысячи println работают в разы медленнее.

Checklist олимпиадника на Java:

1. Класс называется Main.
2. Большие значения — в long; в произведениях хотя бы один множитель приведён к long.
3. Строки сравниваются через equals, не ==.
4. Много данных — BufferedReader вместо Scanner, StringBuilder вместо println в цикле.`},
			{Type: "text", Content: `Курс завершён — поздравляем!

Откройте раздел «Обучение» и начинайте «Путь олимпиадника» с Уровня 1: сложность алгоритмов, задачи на реализацию и базовая математика. Удачи на соревнованиях!`},
		},
	}
}
