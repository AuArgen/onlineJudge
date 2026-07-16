package database

// addEnJavaTranslations seeds English translations for the "Java from
// scratch" course lessons. Aligned with learn_content_java.go.
func addEnJavaTranslations(m map[string]lessonTranslationSeed) {
	m["java-first-program"] = lessonTranslationSeed{
		Summary: "Your first Java program: the Main class, the main method and System.out.println.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Java is a strict and verbose language: even the smallest program is written as a class with a main method. In return, that strictness teaches discipline, and the Java virtual machine is fast.

Important specifically for this site: the public class must be named Main — otherwise the judge will not be able to compile your solution.

Press "Run" and look at the result.`},
			{Type: "code", Caption: "Your first Java program"},
			{Type: "text", Content: `Let's break down the mandatory boilerplate:

• public class Main — the class declaration; all Java code lives inside classes;
• public static void main(String[] args) — the entry point: execution starts from this method;
• System.out.println(...) — prints a line followed by a newline (print without ln — no newline);
• every statement ends with a semicolon.

Try changing the text inside the quotes and run it again.`},
			{Type: "code", Caption: "println can print text and calculations"},
			{Type: "text", Content: `Note the parentheses around (2 + 2): for strings the + operator means concatenation, so without parentheses "..." + 2 + 2 would print "22".

Task: print three lines — your name, your city and the result of 7 * 6. Then mark the lesson as completed.`},
		},
	}

	m["java-variables-types"] = lessonTranslationSeed{
		Summary: "The int, long, double, char, boolean and String types; arithmetic and overflow.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Java is a strictly typed language: every variable is declared with a type, and that type never changes.

The main types:

• int — integers up to about 2 billion (2·10⁹);
• long — big integers up to 9·10¹⁸; literals get an L suffix: 1000000000000L;
• double — floating-point numbers;
• char — a single character in single quotes;
• boolean — true or false;
• String — a string (it is a class, written with a capital letter).`},
			{Type: "code", Caption: "Declaring variables of different types"},
			{Type: "text", Content: `Arithmetic: + - * / %. As in C++, integer division discards the fractional part: 7 / 2 equals 3. Remainder: 7 % 2 equals 1.

Overflow is the main trap: the product of two ints worth a billion each does not fit in an int. Use long for large values — and remember that the result type is determined by the operand types: for the product to be computed in long, at least one factor must be long.`},
			{Type: "code", Caption: "Integer division and overflow"},
			{Type: "text", Content: `Task: create variables with the values 15 and 4 and print the sum, difference, product, integer quotient and remainder — each on its own line.

Then mark the lesson as completed.`},
		},
	}

	m["java-input"] = lessonTranslationSeed{
		Summary: "Reading input with Scanner: nextInt, nextLong, next.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Problem data arrives on standard input. The simplest way to read it in Java is the Scanner class from the java.util package.

The main methods: nextInt() — an integer, nextLong() — a long integer, nextDouble() — a float, next() — one word. Scanner skips spaces and newlines by itself.

Press "Input" above the code, enter two numbers separated by a space and run it.`},
			{Type: "code", Caption: "Enter two numbers in the \"Input\" field, for example: 3 5"},
			{Type: "text", Content: `Don't forget import java.util.Scanner; on the first line of the file — without it the Scanner class will not be found.

Words are read with the next() method:`},
			{Type: "code", Caption: "Enter a name and an age, for example: Azat 15"},
			{Type: "text", Content: `Scanner is convenient but slow — with large inputs that becomes a problem. We will cover the fast way to read (BufferedReader) in the last lesson of the course.

Task: read three numbers and print their arithmetic mean (divide by 3.0 so the result is fractional).

Then solve the attached problem "Sum of Two Numbers", get Accepted and mark the lesson as completed.`},
		},
	}

	m["java-conditions"] = lessonTranslationSeed{
		Summary: "if/else, logical && and ||, comparing strings with equals.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The if statement executes a block of code when the condition is true. Comparisons: == != < > <= >=; logical connectives: && (AND), || (OR), ! (NOT).

Equality is two signs ==. A single = is assignment.`},
			{Type: "code", Caption: "Enter a number — the program will say whether it is even"},
			{Type: "text", Content: `A special Java trap that the other course languages don't have: strings must NOT be compared with ==. The == operator compares object references, not string contents. For strings always use the equals method.`},
			{Type: "code", Caption: "Enter a word, for example: yes"},
			{Type: "text", Content: `Task: read three numbers and print the largest (an if / else if / else chain plus the && connective).

Then solve the attached problem "Even or Odd" and mark the lesson as completed.`},
		},
	}

	m["java-loops"] = lessonTranslationSeed{
		Summary: "The for and while loops: counters, accumulating sums and products.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Java's for loop works like C++'s: start; condition; step. The classic — a counter from 1 to n.`},
			{Type: "code", Caption: "A counter from 1 to 5"},
			{Type: "text", Content: `The main technique is accumulating the result in a variable. The program below reads n, then n numbers, and computes the sum. The sum is declared as long: with large inputs an int would overflow.`},
			{Type: "code", Caption: "Enter: 4, then 10 20 30 40"},
			{Type: "text", Content: `The while loop repeats as long as its condition is true — use it when the number of steps is unknown in advance.`},
			{Type: "code", Caption: "How many times is the number divisible by 2? Enter: 96"},
			{Type: "text", Content: `Task: print all even numbers from 2 to 20 on one line separated by spaces (System.out.print without ln).

Then solve the attached problems "Factorial" (compute it in a long!) and "Sum of Array Elements" — and mark the lesson as completed.`},
		},
	}

	m["java-arrays"] = lessonTranslationSeed{
		Summary: "int[] arrays: creation, reading, traversal and finding the maximum.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `An array stores many values of one type. In Java an array is created with the new operator and a size, and its length is stored in the length field.

Indices run from 0 to length - 1. Going out of bounds throws an ArrayIndexOutOfBoundsException — and earns a Runtime Error verdict from the judge.`},
			{Type: "code", Caption: "Enter: 5, then 1 3 5 2 4"},
			{Type: "text", Content: `The program prints the array in reverse order — the loop runs from the end.

The second basic technique is finding the maximum: take the first element as the current maximum and update it in a loop.`},
			{Type: "code", Caption: "Finding the maximum. Enter: 5, then 1 3 5 2 4"},
			{Type: "text", Content: `Task: find the minimum of the same array and print the minimum and maximum separated by a space.

Then solve the attached problem "Maximum in an Array" and mark the lesson as completed.`},
		},
	}

	m["java-strings"] = lessonTranslationSeed{
		Summary: "Strings: length, charAt, substring, immutability and StringBuilder.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A String is a sequence of characters. The main methods:

• s.length() — the length;
• s.charAt(i) — the character at index i (indices start at zero);
• s.substring(a, b) — the substring from index a up to b, excluding b;
• s.toLowerCase() / s.toUpperCase() — case;
• s.equals(t) — content comparison (not ==, as you remember from the conditions lesson).

Strings in Java are immutable: every "edit" creates a new string.`},
			{Type: "code", Caption: "Enter a word, for example: hello"},
			{Type: "text", Content: `Because strings are immutable, concatenating with + in a loop is slow: every operation copies the whole string. To build strings piece by piece there is StringBuilder — and it even has a ready-made reverse method.

Below — a palindrome check done two ways: by comparing characters and via StringBuilder.`},
			{Type: "code", Caption: "Palindrome check. Enter: racecar"},
			{Type: "text", Content: `Task: read a word and count how many times the letter "a" occurs in it (a loop + charAt).

The problems "Reverse a String", "Palindrome Check" and "Count the Vowels" are attached to this lesson — solve all three and mark the lesson as completed.`},
		},
	}

	m["java-methods"] = lessonTranslationSeed{
		Summary: "Static methods: parameters, return values, GCD and a primality check.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Methods in Java are the equivalent of functions. In contest solutions they are declared static, next to main: then they can be called directly, without creating objects.

Below is Euclid's algorithm for the greatest common divisor.`},
			{Type: "code", Caption: "GCD of two numbers. Enter: 12 8"},
			{Type: "text", Content: `Methods returning boolean are convenient for checks. When testing primality, try divisors only up to the square root of n (the condition i * i <= n) — that cuts the work from n steps down to the square root of n.`},
			{Type: "code", Caption: "Primality check up to the square root. Enter: 97"},
			{Type: "text", Content: `The last println uses the ternary operator: condition ? value_if_yes : value_if_no — a compact if/else for expressions.

Task: write a method long digitSum(long n) that returns the sum of a number's digits.

Then solve the attached problems "GCD of Two Numbers" and "Prime Check" — and mark the lesson as completed.`},
		},
	}

	m["java-collections"] = lessonTranslationSeed{
		Summary: "Collections: ArrayList, HashMap, TreeSet and sorting with Arrays.sort.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Collections are Java's ready-made data structures. The three most useful:

• ArrayList — a variable-length list (the equivalent of C++'s vector);
• HashMap — a "key → value" dictionary for counting and grouping;
• TreeSet — a duplicate-free set that keeps its elements sorted.

Plus the static Arrays.sort method for sorting plain arrays.`},
			{Type: "code", Caption: "Sorting an array. Enter: 5, then 3 1 4 1 5"},
			{Type: "text", Content: `The loop for (int x : a) is the short "for each element" form.

Below, a HashMap counts how many times each number occurs: the getOrDefault method returns the accumulated value, or 0 when the key is not there yet.`},
			{Type: "code", Caption: "Counting occurrences. Enter: 6, then 1 2 2 3 3 3"},
			{Type: "text", Content: `Task: read n numbers and print how many distinct values there are (hint: put everything into a TreeSet and print its size()).

Mark the lesson as completed — the final lesson on fast input/output is ahead.`},
		},
	}

	m["java-competitive"] = lessonTranslationSeed{
		Summary: "BufferedReader and StringBuilder: fast input/output and a contest template.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Scanner is simple but slow: with hundreds of thousands of numbers it can miss the time limit even when the algorithm is correct. The contest standard for Java is BufferedReader for reading and StringBuilder for output.

• BufferedReader reads in large chunks; StreamTokenizer or split parse the line into numbers;
• StringBuilder accumulates all the output, which is printed with a single call at the end.`},
			{Type: "code", Caption: "The fast template. Enter: 4, then 10 20 30 40"},
			{Type: "text", Content: `What matters in the template:

• throws Exception on main saves you from mandatory try/catch when reading;
• br.readLine() reads a whole line, StringTokenizer hands out its numbers one by one;
• all the output is collected in a StringBuilder — thousands of println calls are several times slower.

The Java competitor's checklist:

1. The class is named Main.
2. Large values go into long; in products at least one factor is cast to long.
3. Strings are compared with equals, not ==.
4. Lots of data — BufferedReader instead of Scanner, StringBuilder instead of println in a loop.`},
			{Type: "text", Content: `The course is finished — congratulations!

Open the "Learn" section and start the "Competitive Programming Path" from Level 1: algorithm complexity, implementation problems and basic math. Good luck at the contests!`},
		},
	}
}
