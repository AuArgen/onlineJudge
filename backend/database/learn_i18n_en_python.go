package database

// addEnPythonTranslations seeds English translations for the "Python from
// scratch" course lessons. Aligned with learn_content_python.go.
func addEnPythonTranslations(m map[string]lessonTranslationSeed) {
	m["py-first-program"] = lessonTranslationSeed{
		Summary: "Your first Python program: print, outputting text and calculations.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Python is the friendliest language to start with: no extra boilerplate, the first program fits on one line.

The print function outputs whatever you pass to it. Press "Run" and look at the result.`},
			{Type: "code", Caption: "Your first Python program"},
			{Type: "text", Content: `print can output not just text but also the results of calculations — even several values at once, separated by commas (a space is inserted between them automatically).

Text goes in quotes, calculations go without quotes. Compare: print("2 + 2") prints literally "2 + 2", while print(2 + 2) prints the number 4.`},
			{Type: "code", Caption: "Text and calculations in a single print"},
			{Type: "text", Content: `Task: print three lines — your name, your city, and the result of 7 * 6. Each value with its own print.

Once it works, mark the lesson as completed and move on to variables.`},
		},
	}

	m["py-variables-types"] = lessonTranslationSeed{
		Summary: "Variables and the int, float, str, bool types; arithmetic and division quirks.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A variable is a name bound to a value. In Python you don't declare the type: the language infers it from the value.

The core types:

• int — integers. A nice Python bonus: they never overflow, you can compute with 100-digit numbers;
• float — floating-point numbers, e.g. 3.14;
• str — a string, text in quotes;
• bool — True or False.`},
			{Type: "code", Caption: "Variables and the type function"},
			{Type: "text", Content: `Arithmetic: + - * , and division in Python has an important subtlety:

• / — regular division, the result is always fractional: 7 / 2 equals 3.5;
• // — integer division: 7 // 2 equals 3;
• % — remainder: 7 % 2 equals 1;
• ** — exponentiation: 2 ** 10 equals 1024.

Contest problems usually need // and %: remember the difference between / and //, it is a classic mistake.`},
			{Type: "code", Caption: "Kinds of division and big numbers"},
			{Type: "text", Content: `Task: create variables with the values 15 and 4 and print their sum, difference, product, integer quotient and remainder — each on its own line.

Then mark the lesson as completed.`},
		},
	}

	m["py-input"] = lessonTranslationSeed{
		Summary: "Reading input: input, int(input()) and map for several numbers on one line.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `In problems the data arrives on standard input. In Python a line is read by the input() function.

Important: input() always returns a string. To get a number you must convert the string: int(input()) for an integer, float(input()) for a float. Forgetting the int is the most common beginner mistake: the program will glue "3" and "5" into "35" instead of adding 3 + 5.

Press "Input" above the code, enter a number and run it.`},
			{Type: "code", Caption: "Enter a number in the \"Input\" field, for example: 7"},
			{Type: "text", Content: `When one line contains several numbers separated by spaces, use the split-and-map combo:

• input().split() — splits the line into parts by whitespace;
• map(int, ...) — turns every part into a number.

You will write this line in every other problem — memorize it like a formula.`},
			{Type: "code", Caption: "Enter two numbers separated by a space, for example: 3 5"},
			{Type: "text", Content: `Task: read three numbers from one line and print their arithmetic mean.

The main practice is the attached problem "Sum of Two Numbers": solve it, get the Accepted verdict and mark the lesson as completed.`},
		},
	}

	m["py-conditions"] = lessonTranslationSeed{
		Summary: "if/elif/else conditions, indentation as part of the syntax, and/or/not connectives.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The if statement runs code only when the condition is true. Python's peculiarity: the body of the condition is set off by indentation (4 spaces) — here indentation is part of the syntax, not decoration.

Comparisons: == (equal), != (not equal), < > <= >=. Equality is two signs ==; a single = means assignment.`},
			{Type: "code", Caption: "Enter a number — the program will say whether it is even"},
			{Type: "text", Content: `Multiple branches are written with elif ("else if"). Conditions are combined with the words and, or and not — Python reads almost like English.

A handy feature: chained inequalities work directly, you can write 7 <= age <= 17.`},
			{Type: "code", Caption: "Enter three numbers, for example: 3 9 5"},
			{Type: "text", Content: `Task: read an age and print "school" if it is between 7 and 17 inclusive, otherwise "other". Try both ways of writing the condition: with the and connective and with a chained inequality.

Then solve the attached problem "Even or Odd" and mark the lesson as completed.`},
		},
	}

	m["py-loops"] = lessonTranslationSeed{
		Summary: "The for range and while loops: iteration, accumulators and standard tricks.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Python's for loop iterates over the elements of a sequence. To iterate over numbers use range:

• range(5) — the numbers 0, 1, 2, 3, 4 (five numbers, starting at zero!);
• range(1, 6) — the numbers 1, 2, 3, 4, 5 (the right bound is excluded);
• range(10, 0, -2) — 10, 8, 6, 4, 2 (the third argument is the step).

The excluded right bound of range is the source of endless off-by-one errors. Check your bounds on a small example.`},
			{Type: "code", Caption: "A counter from 1 to 5"},
			{Type: "text", Content: `The main loop technique is accumulation: create a variable and update it on every step. Below — reading n numbers and computing their sum.`},
			{Type: "code", Caption: "Enter: 4, then the line 10 20 30 40"},
			{Type: "text", Content: `The while loop repeats as long as its condition is true — you need it when the number of steps is unknown in advance.`},
			{Type: "code", Caption: "How many times is the number divisible by 2? Enter: 96"},
			{Type: "text", Content: `Task: print all even numbers from 2 to 20 on one line (hint: print has an end parameter, print(x, end=" ") does not move to a new line).

Then solve the attached problems "Factorial" and "Sum of Array Elements" — and mark the lesson as completed.`},
		},
	}

	m["py-lists"] = lessonTranslationSeed{
		Summary: "Lists: indices, slices, the built-in len, sum, max, min functions and sort.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The list is Python's main data structure: an ordered collection of values. Indices start at zero; negative indices count from the end: a[-1] is the last element.

Slices are Python's signature trick: a[1:4] — the elements at indices 1, 2, 3; a[::-1] — the list in reverse order.`},
			{Type: "code", Caption: "Indices, slices and appending elements"},
			{Type: "text", Content: `Lists come with ready-made functions that in C++ you would write as loops: len (length), sum, max and min, sorted (a sorted copy), the a.sort() method (in-place sort).

Don't overuse them mindlessly: in an interview or a problem review you may be asked to write a maximum search by hand — so below are both versions.`},
			{Type: "code", Caption: "Maximum: with the built-in function and by hand. Enter: 5, then 1 3 5 2 4"},
			{Type: "text", Content: `Task: read a list of numbers and print it sorted in descending order (hint: sorted(a, reverse=True)).

Then solve the attached problem "Maximum in an Array" and mark the lesson as completed.`},
		},
	}

	m["py-strings"] = lessonTranslationSeed{
		Summary: "Strings: indices, slices, the lower/upper/count methods and a palindrome check.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A Python string is very similar to a list of characters: indices, slices and len all apply. Reversing a string is a single slice: s[::-1].

Useful methods: s.lower() and s.upper() — case, s.count(x) — how many times a substring occurs, x in s — the "contains" check.

Important: strings are immutable — s[0] = "a" raises an error. A modified string is always a new string.`},
			{Type: "code", Caption: "Enter a word, for example: hello"},
			{Type: "text", Content: `A palindrome is a word that reads the same in both directions. In Python the check takes one line: compare the string with its reversed copy.`},
			{Type: "code", Caption: "Palindrome check. Enter: racecar"},
			{Type: "text", Content: `Task: read a word and count the Latin vowels a, e, i, o, u in it (hint: a loop over the characters and a c in "aeiou" check; don't forget lower()).

The problems "Reverse a String", "Palindrome Check" and "Count the Vowels" are attached to this lesson — solve all three and mark the lesson as completed.`},
		},
	}

	m["py-functions"] = lessonTranslationSeed{
		Summary: "def and return, decomposition; GCD and a primality check up to the square root.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A function is declared with the word def; the result is returned with return. Functions let you split a solution into understandable parts and reuse code.

Below is Euclid's algorithm for the greatest common divisor. It will serve you many more times (the standard library has a ready math.gcd, but a competitive programmer must understand how it works).`},
			{Type: "code", Caption: "GCD: your own function and math.gcd. Enter: 12 8"},
			{Type: "text", Content: `Note the line a, b = b, a % b — Python can swap values without a temporary variable.

Functions returning True/False are convenient for checks. When testing a number for primality it is enough to try divisors up to the square root of n: if n has a divisor greater than the root, its paired divisor is necessarily smaller than the root.`},
			{Type: "code", Caption: "Primality check up to the square root. Enter: 97"},
			{Type: "text", Content: `Task: write a function digit_sum(n) that returns the sum of a number's digits (peel digits off with n % 10 and n //= 10).

Then solve the attached problems "GCD of Two Numbers" and "Prime Check" — and mark the lesson as completed.`},
		},
	}

	m["py-collections"] = lessonTranslationSeed{
		Summary: "Dictionaries and sets: counting occurrences, uniqueness, Counter.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Two tools that lift your solutions to the next level:

• The dict dictionary stores "key → value" pairs and finds a value by key instantly (in O(1)). Typical use — counting: how many times each number or word occurs.
• The set stores only unique values, and the x in s check is instant too. Typical use — "how many distinct?" and fast membership tests.`},
			{Type: "code", Caption: "Counting occurrences with a dictionary. Enter: 1 2 2 3 3 3"},
			{Type: "text", Content: `A set is built from a list with a single call: set(nums) — duplicates disappear on their own. And for counting occurrences the standard library has a ready-made Counter — it does what the dictionary above does, in one line.`},
			{Type: "code", Caption: "set and Counter. Enter: 1 2 2 3 3 3"},
			{Type: "text", Content: `Task: read a line of words and print the words that occur exactly once (hint: Counter + a loop over the words preserving order).

Mark the lesson as completed — the final lesson of the course remains.`},
		},
	}

	m["py-competitive"] = lessonTranslationSeed{
		Summary: "Fast input via sys.stdin, Python's contest pitfalls and a checklist.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Python is concise but dozens of times slower than C++. For it to survive in contests you need to know a few tricks.

The first and main one is fast input. The regular input() is slow; with large inputs (hundreds of thousands of lines) a solution can miss the time limit purely because of reading. The replacement is sys.stdin.`},
			{Type: "code", Caption: "A template with fast input. Enter: 4, then 10 20 30 40"},
			{Type: "text", Content: `What matters here:

• input = sys.stdin.readline — replaces the slow input with a fast one (careful: readline keeps the trailing newline character; for numbers it doesn't matter, for strings use .strip());
• answers are collected in a list and printed with one print via join — thousands of separate print calls are noticeably slower.

Python pitfalls to know in advance:

1. Deep recursion crashes: the default limit is about 1000 calls. Raise it with sys.setrecursionlimit(300000) or rewrite as a loop.
2. If the algorithm is right but the time still doesn't pass — first look for an extra loop in your own code, and only then blame the language.
3. Integers never overflow — in Python you can simply not think about it.`},
			{Type: "text", Content: `Checklist before submitting:

1. Edge cases: n = 1, empty input, negative numbers.
2. Are // and % correct (not /)?
3. Does the output format exactly match the statement?

The course is finished — congratulations! Open the "Learn" section and start the "Competitive Programming Path" from Level 1. Good luck!`},
		},
	}
}
