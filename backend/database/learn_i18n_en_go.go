package database

// addEnGoTranslations seeds English translations for the "Go from scratch"
// course lessons. Aligned with learn_content_go.go.
func addEnGoTranslations(m map[string]lessonTranslationSeed) {
	m["go-first-program"] = lessonTranslationSeed{
		Summary: "Your first Go program: package main, import and fmt.Println.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Go is a simple and fast language from Google: as strict as Java but noticeably more concise. It compiles instantly and runs at nearly C++ speed.

Every Go program starts with a package declaration. An executable program lives in the main package and starts from the main function. Press "Run".`},
			{Type: "code", Caption: "Your first Go program"},
			{Type: "text", Content: `Let's break down the structure:

• package main — the package declaration: for an executable it is always main;
• import "fmt" — imports the formatted input/output package;
• func main() { ... } — the entry point;
• fmt.Println(...) — prints with a trailing newline; several values are separated by commas, and Go inserts the space between them itself.

A Go peculiarity: an unused import or variable is a compilation error, not a warning. The language forces you to keep the code clean.`},
			{Type: "code", Caption: "Println can print text and calculations"},
			{Type: "text", Content: `Task: print three lines — your name, your city and the result of 7 * 6.

Once it works, mark the lesson as completed and move on to variables.`},
		},
	}

	m["go-variables-types"] = lessonTranslationSeed{
		Summary: "var and := declarations, the int, int64, float64, string, bool types.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Go has two ways to create a variable:

• the full form: var age int = 15 (the type can be omitted — var age = 15);
• the short form := — works only inside functions: age := 15. In practice you almost always write this one.

The main types:

• int — integers (64-bit on this server, up to 9·10¹⁸);
• int64 — an explicitly 64-bit integer;
• float64 — floating-point numbers;
• string — a string;
• bool — true or false.`},
			{Type: "code", Caption: "Variables and printing their types"},
			{Type: "text", Content: `fmt.Printf prints by format: %d — an integer, %f — a float, %s — a string, %T — the type of a value, \n — a newline.

Arithmetic: + - * / %. Integer division discards the fractional part: 7 / 2 equals 3, the remainder 7 % 2 equals 1.

Go is strict about types: you cannot add an int and a float64 directly — an explicit conversion is required, e.g. float64(a).`},
			{Type: "code", Caption: "Integer division and type conversion"},
			{Type: "text", Content: `Task: create variables with the values 15 and 4 and print the sum, difference, product, integer quotient and remainder — each on its own line.

Then mark the lesson as completed.`},
		},
	}

	m["go-input"] = lessonTranslationSeed{
		Summary: "Reading input with fmt.Scan and the & pointers.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Problem data arrives on standard input. The basic way to read in Go is fmt.Scan: it reads values across spaces and newlines.

Note the & symbol before the variable: Scan needs to know WHERE to store the value, so it receives the variable's address. A forgotten & is the mistake every beginner makes.

Press "Input", enter two numbers and run it.`},
			{Type: "code", Caption: "Enter two numbers in the \"Input\" field, for example: 3 5"},
			{Type: "text", Content: `fmt.Scan reads values in order and can fill several variables at once. Words (without spaces) are read into a string the same way.`},
			{Type: "code", Caption: "Enter a name and an age, for example: Azat 15"},
			{Type: "text", Content: `fmt.Scan is convenient but slow on large inputs — we will cover fast reading via bufio in the last lesson of the course.

Task: read three numbers and print their arithmetic mean (don't forget the float64 conversion for a fractional result).

Then solve the attached problem "Sum of Two Numbers", get Accepted and mark the lesson as completed.`},
		},
	}

	m["go-conditions"] = lessonTranslationSeed{
		Summary: "if/else if/else without parentheses, logical && and ||.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Go's if statement is written without parentheses around the condition, but the body's curly braces are always mandatory — even for a single line. Another style rule the compiler enforces: else goes on the same line as the closing brace.

Comparisons: == != < > <= >=; connectives: && (AND), || (OR), ! (NOT).`},
			{Type: "code", Caption: "Enter a number — the program will say whether it is even"},
			{Type: "text", Content: `Multiple branches — via else if. The program below finds the largest of three numbers.`},
			{Type: "code", Caption: "Enter three numbers, for example: 3 9 5"},
			{Type: "text", Content: `Task: read an age and print "school" if it is between 7 and 17 inclusive, otherwise "other".

Then solve the attached problem "Even or Odd" and mark the lesson as completed.`},
		},
	}

	m["go-loops"] = lessonTranslationSeed{
		Summary: "The single for loop and its three forms; accumulating a result.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Go has only one loop — for, but it comes in three forms:

• classic: for i := 1; i <= n; i++ { ... }
• while-like: for condition { ... }
• infinite: for { ... } (exit with break)

There is no separate while in the language — the second form plays its role.`},
			{Type: "code", Caption: "A counter from 1 to 5"},
			{Type: "text", Content: `The accumulation technique: create an accumulator variable and update it on every step. Below — reading n numbers and their sum.`},
			{Type: "code", Caption: "Enter: 4, then 10 20 30 40"},
			{Type: "code", Caption: "The while form: how many times is the number divisible by 2? Enter: 96"},
			{Type: "text", Content: `Task: print all even numbers from 2 to 20 on one line (hint: fmt.Print(x, " ") prints without a newline).

Then solve the attached problems "Factorial" and "Sum of Array Elements" — and mark the lesson as completed.`},
		},
	}

	m["go-slices"] = lessonTranslationSeed{
		Summary: "Slices: make, append, range and finding the maximum.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The main structure for storing sequences in Go is the slice: a variable-length array.

• make([]int, n) — create a slice of n zeros;
• append(a, x) — add an element to the end (it returns a new slice!);
• len(a) — the length;
• indices from 0 to len(a)-1.

For traversal there is range — it yields the index and the value of each element.`},
			{Type: "code", Caption: "Enter: 5, then 1 3 5 2 4"},
			{Type: "text", Content: `The program prints the slice in reverse order.

Finding the maximum is the basic pattern: take the first element and update the maximum in a loop. Range is handy here: write for _, x := range a — the underscore means "the index is not needed".`},
			{Type: "code", Caption: "Finding the maximum. Enter: 5, then 1 3 5 2 4"},
			{Type: "text", Content: `Task: find the minimum of the same slice and print the minimum and maximum separated by a space.

Then solve the attached problem "Maximum in an Array" and mark the lesson as completed.`},
		},
	}

	m["go-strings"] = lessonTranslationSeed{
		Summary: "Strings, the strings package, runes and reversing a string via []rune.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Strings in Go are immutable. The useful functions live in the strings package: ToLower, ToUpper, Contains, Count, Split.

A Go subtlety: a string is stored as bytes, not characters. For Latin letters and digits this doesn't matter, but a Cyrillic letter takes 2 bytes. To work with real characters, convert the string to a slice of runes: []rune(s). The rule is simple: len(s) — bytes, len([]rune(s)) — characters.`},
			{Type: "code", Caption: "Enter a word, for example: hello"},
			{Type: "text", Content: `Reversing a string is done via a rune slice: swap the first character with the last, the second with the second-to-last, until you meet in the middle. As a bonus this gives you a palindrome check: reverse and compare.`},
			{Type: "code", Caption: "Reversal and palindrome check. Enter: racecar"},
			{Type: "text", Content: `Note the elegant swap without a temporary variable: r[i], r[j] = r[j], r[i] — a signature Go move.

The problems "Reverse a String", "Palindrome Check" and "Count the Vowels" are attached to this lesson — solve all three and mark the lesson as completed.`},
		},
	}

	m["go-functions"] = lessonTranslationSeed{
		Summary: "Functions: parameters, multiple return values, GCD and primality.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A function in Go is declared with the word func; the result type is written after the parameter list. A language highlight — a function can return several values at once.

Below is Euclid's algorithm for the greatest common divisor.`},
			{Type: "code", Caption: "GCD of two numbers. Enter: 12 8"},
			{Type: "text", Content: `The line a, b = b, a%b is a multiple assignment: both sides are evaluated simultaneously, no temporary variable needed.

Functions returning bool express checks. For primality, divisors are tried up to the square root: the condition i*i <= n.`},
			{Type: "code", Caption: "Primality check up to the square root. Enter: 97"},
			{Type: "text", Content: `An example of multiple return values: func minMax(a []int) (int, int) can return the minimum and maximum in a single pass — try writing that function as your task.

Then solve the attached problems "GCD of Two Numbers" and "Prime Check" — and mark the lesson as completed.`},
		},
	}

	m["go-maps"] = lessonTranslationSeed{
		Summary: "Maps and structs: counting occurrences and composite data.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A map is a "key → value" dictionary with instant access by key. It is created with make, and reading a missing key returns zero — so counting occurrences needs no checks at all: count[x]++ just works.`},
			{Type: "code", Caption: "Counting occurrences. Enter: 6, then 1 2 2 3 3 3"},
			{Type: "text", Content: `Careful: the order of iterating a map with range is random — Go shuffles it deliberately. If you need an order, collect the keys into a slice and sort them.

A struct combines fields of different types into one type — for example, a point with coordinates or a student with a name and a score.`},
			{Type: "code", Caption: "Structs: a \"student\" type"},
			{Type: "text", Content: `Task: read n numbers and print how many distinct values there are (hint: map[int]bool as a set, the answer is the map's len).

Mark the lesson as completed — the final lesson on fast input/output remains.`},
		},
	}

	m["go-competitive"] = lessonTranslationSeed{
		Summary: "bufio: fast input/output and the Go contest template.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `fmt.Scan reads character by character and is hopelessly slow on large inputs. The Go contest standard is buffered input/output from the bufio package:

• bufio.Reader + fmt.Fscan — fast reading;
• bufio.Writer + fmt.Fprintln — fast output; at the end writer.Flush() is mandatory, otherwise the buffer never gets printed (and you get Wrong Answer with a correct solution).`},
			{Type: "code", Caption: "The contest template. Enter: 4, then 10 20 30 40"},
			{Type: "text", Content: `What matters in the template:

• reader and writer are declared at package level — accessible from any function;
• defer writer.Flush() guarantees the buffer is flushed when main exits — writing this line first has become a ritual for Go competitors;
• fmt.Fscan(reader, &x) — the same Scan, but from the fast buffer.

The Go competitor's checklist:

1. Did you forget writer.Flush()? (defer settles it once and for all)
2. Go's int is 64-bit — int32 overflow is not a worry, but still check products of three large numbers.
3. len(s) — bytes; for Cyrillic and Unicode work through []rune.
4. Unused variables and imports won't compile — delete them.`},
			{Type: "text", Content: `The course is finished — congratulations!

Open the "Learn" section and start the "Competitive Programming Path" from Level 1: algorithm complexity, implementation problems and basic math. Good luck at the contests!`},
		},
	}
}
