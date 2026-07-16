package database

// addEnRoadmap12Translations seeds English translations for roadmap levels
// 1-2 lessons. Aligned with learn_content_roadmap12.go.
func addEnRoadmap12Translations(m map[string]lessonTranslationSeed) {
	// ── Level 1. Foundations ────────────────────────────────────────────────

	m["complexity-big-o"] = lessonTranslationSeed{
		Summary: "How to estimate an algorithm's speed before running it: Big-O notation and the 10⁸ operations per second rule.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A correct answer is only half of a contest problem. The other half is fitting into the time limit, usually 1–2 seconds. That is why the first thing a competitive programmer learns is estimating an algorithm's speed BEFORE writing the code.

Speed is measured as the number of operations as a function of the input size n and written in Big-O notation:

• O(1) — constant: the answer comes from a formula;
• O(log n) — halving the problem: binary search;
• O(n) — a single pass over the data;
• O(n log n) — sorting;
• O(n²) — two nested loops;
• O(2ⁿ) — exhaustive search over subsets.

The key practical rule: a computer performs on the order of 10⁸ simple operations per second. Plug your n into the complexity formula — and you know whether the solution will pass.`},
			{Type: "code", Caption: "How many operations does each algorithm need? Enter n, for example: 100000"},
			{Type: "text", Content: `Try entering 1000, then 100000, then 1000000000 — and compare the lines with the 10⁸ rule. You can see why an O(n²) solution at n = 10⁵ no longer passes (10¹⁰ operations — a hundred seconds), while O(n log n) passes easily.

Feel the difference live: the program below sums the numbers from 1 to n in two ways — with an O(n) loop and with an O(1) formula. Enter 1000000000 (a billion) and watch the running time: the loop takes noticeable time, the formula is instant. The answers match.`},
			{Type: "code", Caption: "Enter 1000000000 and compare: the loop visibly thinks, the formula is instant"},
			{Type: "text", Content: `How to assess your own code:

• nested loops multiply: a loop over n inside a loop over n is O(n²);
• sequential blocks add up, and the largest wins: O(n) + O(n log n) = O(n log n);
• constants are dropped: 5n operations is still O(n).

Task: estimate the complexity of three fragments — (1) finding the maximum in one pass; (2) checking all pairs of elements; (3) a loop where n is halved each time. Answers: O(n), O(n²), O(log n).

Solve the attached problem "Sum of Array Elements" — the classic single O(n) pass — and mark the lesson as completed.`},
		},
	}

	m["implementation-problems"] = lessonTranslationSeed{
		Summary: "Implementation problems: read the statement carefully, handle the edge cases, don't lose points on details.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Implementation problems don't require clever algorithms — you need to carefully do exactly what the statement says. Sounds easy, but this is where beginners burn the most attempts.

The three main enemies:

1. Careless reading of the statement: rows and columns swapped, forgetting that numbering starts from one, missing the word "inclusive".
2. Edge cases: n = 1, an empty string, all elements equal, negative numbers.
3. Output format: an extra space, a missing newline, YES instead of Yes.

Example: draw an n by m chessboard out of # characters and dots. The whole problem is spotting the pattern: a cell's color is determined by the parity of the sum of its coordinates.`},
			{Type: "code", Caption: "The chessboard. Enter: 3 5"},
			{Type: "text", Content: `The second example is subtler: find the SECOND largest element of an array. The naive "sort and take the second-to-last" breaks when the maximum occurs twice, and the two-variable solution needs careful initialization — a classic implementation trap.`},
			{Type: "code", Caption: "The second maximum. Enter: 5, then 3 9 4 9 7"},
			{Type: "text", Content: `The checklist before submitting any problem:

1. Re-read the statement one more time AFTER writing the code — you'll be surprised how often you've solved "the wrong problem".
2. Run the statement's example by hand.
3. Invent your own edge tests: minimal n, equal elements, extreme values from the constraints.
4. Check the types: does the answer fit in an int?

Four accuracy-training problems are attached to this lesson. Solve them all — and mark the lesson as completed.`},
		},
	}

	m["basic-math"] = lessonTranslationSeed{
		Summary: "Divisibility, GCD and LCM, primes, the sieve of Eratosthenes and prime factorization.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The competitive programmer's number-theory base consists of four topics.

1. Divisibility and remainders. a is divisible by b when a % b == 0. Remainders cycle: the last digit of a number is n % 10, its parity is n % 2.

2. GCD and LCM. The greatest common divisor is computed with Euclid's algorithm in O(log n) (you wrote it in the language course). The least common multiple: LCM(a,b) = a / GCD(a,b) * b — in exactly that order, to avoid overflow.

3. Primes. Testing a single number — trying divisors up to the square root. And when you need ALL primes up to n — the sieve of Eratosthenes: write out the numbers and cross out the multiples of each prime.`},
			{Type: "code", Caption: "The sieve of Eratosthenes: all primes up to n. Enter: 50"},
			{Type: "text", Content: `Why the sieve is fast: every composite number is crossed out by its prime divisors, giving O(n log log n) in total — almost linear. For n = 10⁷ it runs in under a second.

A subtlety: crossing out starts from i * i, not from 2 * i — all smaller multiples have already been crossed out by smaller primes.

4. Prime factorization: divide the number by every divisor up to the square root; if something greater than one remains — it is the last prime factor.`},
			{Type: "code", Caption: "Prime factorization. Enter: 360"},
			{Type: "text", Content: `Task: use the sieve to count how many primes are below one million (answer: 78498 — check yourself).

Then solve the attached problems "GCD of Two Numbers", "Prime Check" and "Factorial" — and mark the lesson as completed.`},
		},
	}

	// ── Level 2. Sorting and searching ─────────────────────────────────────

	m["sorting"] = lessonTranslationSeed{
		Summary: "Sorting as a tool: std::sort, comparators, sorting structs.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Sorting is the most used algorithm in contests — not as a goal in itself, but as a tool: after sorting, a problem often simplifies radically. The closest pair of numbers? Sort — and it will be among the neighbors. A greedy choice? It almost always begins with "sort by...".

You don't need to write sorting by hand: std::sort runs in O(n log n). What you need is to control it — to supply a comparator, i.e. the comparison rule.`},
			{Type: "code", Caption: "Sorting in ascending and descending order. Enter: 5, then 3 1 4 1 5"},
			{Type: "text", Content: `A comparator is a function "should x come before y". The lambda [](int x, int y) { return x > y; } gives descending order.

The real power is sorting structs by any field. Let's sort students by score: the comparison rule reads straight out of the code.`},
			{Type: "code", Caption: "Enter: 3, then lines of the form \"name score\": Azat 90, Aigul 98, Bek 85"},
			{Type: "code", Caption: "The same in Python: the key parameter. Same input"},
			{Type: "text", Content: `Good to know: std::stable_sort preserves the order of equal elements (important when sorting "by score, ties by name" in two passes).

Task: sort a list of words first by length, and for equal lengths — alphabetically (hint: a comparator with two conditions).

Mark the lesson as completed and move on to the two pointers technique.`},
		},
	}

	m["two-pointers"] = lessonTranslationSeed{
		Summary: "The two pointers technique: pairs with a given sum and a sliding window in O(n).",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The idea: two indices walk along the array only forward (or towards each other) and never go back. Each pointer moves at most n times — O(n) total instead of the O(n²) of checking all pairs.

Classic number one: in a SORTED array, find a pair with sum X. Put the pointers at the ends: if the sum is too small — move the left one right (the sum grows), if too large — the right one left.`},
			{Type: "code", Caption: "A pair with sum X. Enter: 5 12, then the sorted array 1 3 5 7 9"},
			{Type: "text", Content: `Why this is correct: if a[l] + a[r] < X, then a[l] paired with ANY element left of r gives even less — so a[l] can be safely discarded. Symmetrically for the right end. No possible pair is ever lost.

Classic number two — the sliding window: both pointers move in the same direction. Let's find the longest segment whose sum does not exceed S: the right end expands the window, the left end shrinks it when the sum exceeds the limit.`},
			{Type: "code", Caption: "The longest segment with sum at most S. Enter: 6 8, then 2 4 1 3 5 2"},
			{Type: "text", Content: `Note: the inner while does not make the algorithm quadratic — over the whole run the left pointer moves at most n times in total.

The palindrome check you wrote in the language course is also two pointers moving towards each other. Solve the attached problem "Palindrome Check", now understanding it as a special case of the technique, and mark the lesson as completed.`},
		},
	}

	m["prefix-sums"] = lessonTranslationSeed{
		Summary: "Prefix sums: answering \"sum on a segment\" in O(1); the difference array.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The setting: an array of n numbers and q queries "what is the sum from the l-th to the r-th element?". Computing every query with a loop is O(n·q): at n = q = 10⁵ that is 10¹⁰ operations — hopeless.

The solution is precomputation. Build a prefix-sum array: p[i] = the sum of the first i elements. Then the sum on the segment [l, r] is simply p[r] - p[l-1]: from "the sum up to r" we subtracted "the sum up to l-1". Each query is O(1), everything together — O(n + q).`},
			{Type: "code", Caption: "Enter: 5 2, the array 1 2 3 4 5, then the queries: 2 4 and 1 5"},
			{Type: "text", Content: `Details worth remembering:

• 1-based indexing with p[0] = 0 removes the special case l = 1;
• prefix sums accumulate in long long — the sum of a hundred thousand billions won't fit in an int;
• the same idea works in 2D: a prefix table answers rectangle-sum queries in O(1).

The mirror trick is the difference array: when the queries instead MODIFY segments ("add x to everyone from l to r") and the answer is needed once at the end, store differences: d[l] += x, d[r+1] -= x, and at the end restore the array with prefix sums of those differences.`},
			{Type: "code", Caption: "The difference array. Enter: 5 2, then the queries \"1 3 2\" and \"2 5 1\""},
			{Type: "text", Content: `Task: using a prefix-sum array, count the segments with zero sum (hint: the sum of [l, r] is zero when p[r] == p[l-1]; count equal prefixes with a map — two topics combined!).

Mark the lesson as completed and move on to binary search.`},
		},
	}

	m["binary-search"] = lessonTranslationSeed{
		Summary: "Binary search over an array and over the answer: O(log n), invariants and typical mistakes.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `If the data is sorted (or the condition is monotone: "up to some point — no, after it — yes"), you can search by halving: each step discards half of the candidates. A billion elements — only 30 steps. That is binary search, O(log n).

It must be written carefully: off-by-one errors and infinite loops are the topic's trademark. A reliable template is the half-open interval [l, r): we look for the first index where the condition holds.`},
			{Type: "code", Caption: "The first occurrence of x. Enter: 6 5, then the sorted array 1 3 5 5 7 9"},
			{Type: "text", Content: `The STL already has this: std::lower_bound(a.begin(), a.end(), x) returns an iterator to the first element not less than x, upper_bound — strictly greater. But you must be able to write the search by hand — because of the key contest technique below.

Binary search ON THE ANSWER. Often the answer itself is monotone: "can we finish within time t?" — if t works, so does t+1. Then binary search finds the boundary between "impossible" and "possible", and all you write is the check. Example: the integer square root — the largest m such that m² does not exceed n.`},
			{Type: "code", Caption: "Integer square root by binary search on the answer. Enter: 1000000000000"},
			{Type: "text", Content: `Three classic mistakes:

1. An infinite loop: when searching for the LAST valid value (l = mid), the midpoint must round up: (l + r + 1) / 2. Otherwise the loop hangs at r - l = 1.
2. Midpoint overflow: in other languages write l + (r - l) / 2; in C++ with long long it is usually safe, but keep it in mind.
3. Wrong bounds: the answer must lie within the initial [l, r] — check the extreme values.

Task: there are k printers, each prints a page in t seconds, and you need n pages. What is the minimum time to finish? Solve it with binary search on the answer and the check "how many pages can we print in time T".

Mark the lesson as completed — Level 2 is done!`},
		},
	}
}
