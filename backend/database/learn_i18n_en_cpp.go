package database

// addEnCppTranslations seeds English translations for the "C++ from scratch"
// course lessons. Blocks are aligned by position with learn_content_cpp.go.
func addEnCppTranslations(m map[string]lessonTranslationSeed) {
	m["cpp-first-program"] = lessonTranslationSeed{
		Summary: "Write your first C++ program and print text to the screen.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A program is a sequence of instructions that a computer executes. In C++ the instructions go into a source-code file, and a compiler turns it into an executable.

Let's start with the most famous program in the world — it prints a greeting to the screen. Press "Run" below the code and look at the result.`},
			{Type: "code", Caption: "Your first C++ program — try running it"},
			{Type: "text", Content: `Let's go through the program line by line:

• #include <iostream> — includes the input/output library: without it std::cout will not work.
• int main() { ... } — the main function: execution of every C++ program starts here.
• std::cout << "Hello, World!" — prints text to the screen.
• std::endl — moves to a new line.
• return 0 — tells the system the program finished successfully.

Try changing the text inside the quotes right in the block above and run the program again.`},
			{Type: "code", Caption: "std::cout can print both text and the results of calculations"},
			{Type: "text", Content: `Practice task: print three lines — your name, your city, and the result of 7 * 6. Each value on its own line.

Once it works, mark the lesson as completed and move on to the next one: "Variables and Data Types".`},
		},
	}

	m["cpp-variables-types"] = lessonTranslationSeed{
		Summary: "Variables, the int, long long, double, char and bool types, arithmetic and integer division.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Programs work with data: numbers, characters, text. To store data you need variables — named "memory cells". In C++ every variable has a type that determines what it can hold.

The main types you will need:

• int — integers up to about 2 billion (2·10⁹);
• long long — big integers up to 9·10¹⁸, the competitive programmer's workhorse;
• double — floating-point numbers, e.g. 3.14;
• char — a single character in single quotes, e.g. 'A';
• bool — a logical value: true or false.`},
			{Type: "code", Caption: "Declaring variables of different types"},
			{Type: "text", Content: `Note: bool prints as 1 (true) or 0 (false).

Numbers support the usual operations: addition +, subtraction -, multiplication *, division / and remainder %.

An important C++ quirk: dividing two integers discards the fractional part. 7 / 2 equals 3, not 3.5. The remainder: 7 % 2 equals 1. The remainder is an extremely common trick in problems: for example, a number is even when n % 2 == 0.

A classic beginner mistake is overflow: multiply two ints worth a billion each and the result no longer fits in an int — you get garbage. For large values always use long long.`},
			{Type: "code", Caption: "Arithmetic, integer division and long long"},
			{Type: "text", Content: `Task: create two variables with the values 15 and 4. Print their sum, difference, product, integer quotient and remainder — each on its own line.

Then mark the lesson as completed and move on to reading input.`},
		},
	}

	m["cpp-input"] = lessonTranslationSeed{
		Summary: "Reading numbers and words from standard input with std::cin.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `In contest problems the data arrives on standard input: the program reads numbers and strings, processes them and prints the answer. That is exactly how the automatic judge tests you: it feeds test inputs to your program and compares the output with the correct answer.

Reading in C++ is done with std::cin. It skips whitespace and newlines by itself, so it doesn't matter whether the numbers are on one line or several.

Press the "Input" button above the code, enter two numbers separated by a space (for example, 3 5) and run the program.`},
			{Type: "code", Caption: "Enter two numbers in the \"Input\" field, for example: 3 5"},
			{Type: "text", Content: `The >> operator reads values one after another: first into a, then into b. You can read any number of values in a row this way.

Words (without spaces) are read into the std::string type — it requires including the string library.`},
			{Type: "code", Caption: "Enter a name and an age, for example: Azat 15"},
			{Type: "text", Content: `Task: read three numbers and print their arithmetic mean. To get a fractional answer, divide by 3.0 rather than 3.

The main practice is below: solve the problem "Sum of Two Numbers". Open it, write a solution and submit — the judge will check it against the tests. Get the Accepted verdict, then mark the lesson as completed.`},
		},
	}

	m["cpp-conditions"] = lessonTranslationSeed{
		Summary: "The if/else statement, comparisons and the && and || logical connectives.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A program becomes useful when it can make decisions: "if the number is even — print one thing, otherwise — another". That is what the if/else statement is for.

Comparison operators: == (equal), != (not equal), < , > , <= , >=.

Watch out for the classic mistake: comparison is written with two equals signs ==. A single = is assignment, and inside an if it almost always means a bug.`},
			{Type: "code", Caption: "Enter a number — the program will say whether it is even"},
			{Type: "text", Content: `Conditions can be combined:

• && — logical AND: both conditions must hold;
• || — logical OR: one is enough;
• ! — negation.

Multiple branches are handled with an if / else if / else chain. Below is a program that finds the largest of three numbers.`},
			{Type: "code", Caption: "Enter three numbers, for example: 3 9 5"},
			{Type: "text", Content: `Task: read a person's age and print "school" if it is between 7 and 17 inclusive, otherwise "other". You will need the && connective.

Then solve the attached problem "Even or Odd" and mark the lesson as completed.`},
		},
	}

	m["cpp-loops"] = lessonTranslationSeed{
		Summary: "The for and while loops: repeating actions, counters and accumulating a result.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Loops let you repeat actions many times. Contest problems almost always require iterating over numbers, array elements or the characters of a string — all of that is done with loops.

A for loop has three parts: start; continuation condition; step. The classic form is a counter from 1 to n.`},
			{Type: "code", Caption: "A counter from 1 to 5"},
			{Type: "text", Content: `The most common loop technique is accumulation: create an accumulator variable (a sum, a product, a counter) and update it on every step.

The program below reads n, then n numbers, and computes their sum. Note that the sum is declared as long long — with many large numbers an int would overflow.`},
			{Type: "code", Caption: "Enter: 4, then 10 20 30 40"},
			{Type: "text", Content: `The second kind of loop is while: it repeats as long as the condition is true, and is handy when the number of steps is not known in advance.`},
			{Type: "code", Caption: "How many times is the number divisible by 2? Enter, for example: 96"},
			{Type: "text", Content: `Task: print all even numbers from 2 to 20 on one line separated by spaces.

Then solve the attached problems "Factorial" (accumulating a product) and "Sum of Array Elements" (accumulating a sum) — and mark the lesson as completed.`},
		},
	}

	m["cpp-arrays"] = lessonTranslationSeed{
		Summary: "std::vector — an array: reading n elements, traversing and finding the maximum.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `An array stores many values of the same type under one name. In modern C++, instead of "raw" arrays you use std::vector — an array that knows its own size and can grow.

Elements are numbered from zero: in a vector of n elements the indices run from 0 to n-1. Going out of bounds is one of the most common causes of a Runtime Error verdict.`},
			{Type: "code", Caption: "Enter: 5, then 1 3 5 2 4"},
			{Type: "text", Content: `The program above reads an array and prints it in reverse order — note the loop that steps backwards.

The second basic technique is finding the maximum: take the first element as the "current maximum" and update it in a loop whenever you find a larger element.`},
			{Type: "code", Caption: "Finding the maximum. Enter: 5, then 1 3 5 2 4"},
			{Type: "text", Content: `Task: using the same idea, find the minimum of the array and print it together with the maximum, separated by a space.

Then solve the attached problem "Maximum in an Array" and mark the lesson as completed.`},
		},
	}

	m["cpp-strings"] = lessonTranslationSeed{
		Summary: "std::string: length, character access, traversal and a palindrome check.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A string is a sequence of characters. In C++ strings are stored in the std::string type, and characters are accessed by index just like in an array: s[0] is the first character, s[s.size() - 1] is the last.

The s.size() method returns the length of the string. Strings can be compared with == and <, concatenated with + and traversed with a loop.`},
			{Type: "code", Caption: "Enter a word, for example: hello"},
			{Type: "text", Content: `The program above prints the word backwards — by traversing indices from the end.

The classic string problem is the palindrome: does a word read the same left to right and right to left? The idea: compare the first character with the last, the second with the second-to-last, and so on up to the middle.`},
			{Type: "code", Caption: "Palindrome check. Enter: racecar"},
			{Type: "text", Content: `Task: read a word and count how many letters "a" it contains.

Three problems are attached to this lesson: "Reverse a String", "Palindrome Check" and "Count the Vowels". Solve them all — it is the best way to cement string handling — and mark the lesson as completed.`},
		},
	}

	m["cpp-functions"] = lessonTranslationSeed{
		Summary: "Functions: parameters, return values and decomposing a solution.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A function is a named piece of code you can call as many times as you like. Functions make solutions readable: the main logic stays in main while the details move into separate functions.

A function is declared like this: result type, name, parameters in parentheses. The return keyword returns the result and ends the function.`},
			{Type: "code", Caption: "A greatest-common-divisor function (Euclid's algorithm)"},
			{Type: "text", Content: `This is Euclid's algorithm — computing the greatest common divisor (GCD). Note that the function is declared above main; otherwise the compiler would not "see" it.

Functions can return bool — a convenient way to express checks. The function below determines whether a number is prime: it is enough to test divisors only up to the square root of n, so the loop runs while i * i <= n. This is a genuine algorithmic optimization: a million checks instead of a trillion.`},
			{Type: "code", Caption: "Primality check up to the square root. Enter, for example: 97"},
			{Type: "text", Content: `Task: write a function int digitSum(long long n) that returns the sum of a number's digits (hint: peel digits off with n % 10 and n /= 10).

Then solve the attached problems "GCD of Two Numbers" and "Prime Check" — and mark the lesson as completed.`},
		},
	}

	m["cpp-stl"] = lessonTranslationSeed{
		Summary: "The STL: sort, pairs, set and map — tools that save you hours.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The STL (Standard Template Library) is C++'s main advantage in contests. Ready-made data structures and algorithms cover half of all routine subtasks.

The most used one is sorting: std::sort from the algorithm library sorts a vector in O(n log n). In one line.`},
			{Type: "code", Caption: "Sorting. Enter: 5, then 3 1 4 1 5"},
			{Type: "text", Content: `Note the loop for (int x : a) — this is a "range-for", a short way to visit every element.

Two more indispensable containers:

• std::set — stores elements without duplicates and in sorted order; the "does it contain x" check runs in O(log n);
• std::map — a "key → value" dictionary; perfect for counting how many times each word or number occurs.`},
			{Type: "code", Caption: "Counting occurrences with a map. Enter: 6, then 1 2 2 3 3 3"},
			{Type: "text", Content: `Task: read n numbers and print how many distinct values there are (hint: put everything into a set and print its size).

Mark the lesson as completed — one final step of the course remains: the contest template.`},
		},
	}

	m["cpp-competitive"] = lessonTranslationSeed{
		Summary: "Fast input/output, a solution template and the C++ competitor's checklist.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `You now know enough C++ to start the competitive path. The finishing touch is a set of habits that protect you from painful verdicts.

1. Fast input/output. By default cin/cout are synchronized with the C standard library and run slowly. Two lines at the start of main speed them up several times — on large inputs that is the difference between Accepted and Time Limit Exceeded.

2. Newlines. Use "\n" instead of std::endl: endl forcibly flushes the output buffer every time and noticeably slows the program down.`},
			{Type: "code", Caption: "A template worth starting every solution from"},
			{Type: "text", Content: `What is new here:

• #include <bits/stdc++.h> — pulls in the entire standard library at once (works in GCC, which this site uses for judging);
• using namespace std — lets you write cin instead of std::cin;
• ios_base::sync_with_stdio(false) and cin.tie(nullptr) — that very fast input/output.

Checklist before submitting a solution:

1. Does the answer fit in an int? When in doubt, use long long.
2. Are the edge cases handled: n = 1, zeros, negative numbers?
3. Does the algorithm fit the time limit? Rule of thumb: about 10⁸ simple operations per second.
4. Does the output exactly match the format in the statement?`},
			{Type: "text", Content: `The course is finished — congratulations! You are now ready for systematic training.

Open the "Learn" section and start the "Competitive Programming Path" from Level 1: algorithm complexity, implementation problems and basic math. Mark lessons as you complete them — and good luck at the contests!`},
		},
	}
}
