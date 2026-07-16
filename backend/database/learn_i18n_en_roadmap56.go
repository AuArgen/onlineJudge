package database

// addEnRoadmap56Translations seeds English translations for roadmap levels
// 5-6 lessons. Aligned with learn_content_roadmap56.go.
func addEnRoadmap56Translations(m map[string]lessonTranslationSeed) {
	// ── Level 5. Advanced topics ────────────────────────────────────────────

	m["dp-advanced"] = lessonTranslationSeed{
		Summary: "Classic DP: the 0/1 knapsack in O(n·W) and the longest increasing subsequence in O(n log n).",
		Blocks: []blockTranslation{
			{Type: "text", Content: `One level up — DP with two parameters and DP with optimizations. Let's cover two problems every competitive programmer must know.

The 0/1 knapsack: n items with weight and value, a knapsack of capacity W; each item is taken once; maximize the value.

State: dp[cap] — the maximum value at capacity cap. For each item we update dp: either skip it (nothing changes) or take it — then dp[cap] = dp[cap - w] + cost.

The subtlety the problem is famous for: the inner loop over capacity runs TOP-DOWN. Otherwise the item manages to be "packed" twice in one pass.`},
			{Type: "code", Caption: "The 0/1 knapsack. Enter: 4 8, then \"weight value\" pairs: 3 4, 4 5, 5 6, 2 3"},
			{Type: "text", Content: `The answer on the example: 10 (the items of weight 3 and 5: values 4 + 6). The complexity is O(n·W) — note that it depends on the NUMERIC value of the capacity, so the knapsack is fine with W up to millions but helpless at W = 10¹⁸.

The second classic — the longest increasing subsequence (LIS). Everyone knows the naive O(n²) DP; the contest version is O(n log n): keep an array tail, where tail[k] is the smallest possible ending of an increasing subsequence of length k+1. Every new element either extends the best subsequence or improves someone's ending — the position is found by binary search.`},
			{Type: "code", Caption: "LIS in O(n log n). Enter: 8, then 10 9 2 5 3 7 101 18"},
			{Type: "text", Content: `The answer on the example: 4 (for instance, 2 3 7 18). It is important to understand: tail is NOT the subsequence itself, only the "best endings"; but its length always equals the length of the LIS.

How to invent DP states: ask yourself what MINIMUM information about the prefix of the solution is enough to continue optimally. That is exactly the state's parameters.

Task: output not the length of the LIS but the subsequence itself (store, for each element, whom it extended).

Mark the lesson as completed.`},
		},
	}

	m["segment-tree"] = lessonTranslationSeed{
		Summary: "The segment tree: range sum and point update in O(log n).",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Prefix sums answer "sum on a segment" in O(1) but break as soon as the array starts CHANGING: one update — recompute all prefixes.

The segment tree does both the query and the update in O(log n). The idea: build a binary tree over the array; each node stores the sum of its segment. The root — the sum of the whole array, the leaves — individual elements.

• updating an element touches only the nodes on the path from the leaf to the root — O(log n) of them;
• a query [l, r] decomposes into O(log n) ready-made tree segments.`},
			{Type: "code", Caption: "Enter: 5 3, the array 1 2 3 4 5, then: sum 2 4 / set 3 10 / sum 2 4"},
			{Type: "text", Content: `Run the example: the sum of [2,4] is 9 at first, and after set 3 10 it becomes 16.

How to read the code:

• node v is responsible for the segment [tl, tr]; its children are the halves of the segment, numbered 2v and 2v+1;
• the tree array of size 4n is guaranteed to fit the whole tree;
• query returns 0 for non-overlapping segments — zero is neutral for the sum.

The segment tree is a construction kit: replace + with min or max (and the neutral element with infinity) — and you get minimum/maximum queries. The advanced version with "lazy" updates can modify whole segments in O(log n) — study it when you meet such a problem.`},
			{Type: "text", Content: `Task: convert the tree to range MAXIMUM (three edits: the operation, the neutral element, the output) and test it on your own example.

Mark the lesson as completed.`},
		},
	}

	m["string-algorithms"] = lessonTranslationSeed{
		Summary: "Polynomial hashes for comparing substrings in O(1) and the prefix function (KMP) for pattern search.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Comparing substrings character by character costs O(n) per comparison. Two tools remove that limitation.

The polynomial hash: a string maps to the number h = s[0]·p^(k-1) + s[1]·p^(k-2) + ... modulo some prime. Having precomputed prefix hashes and the powers of p, the hash of ANY substring comes out in O(1) — and equal substrings have equal hashes. Different substrings can theoretically collide, but with a modulus around 10⁹ the probability is negligible, and for the paranoid there is double hashing.`},
			{Type: "code", Caption: "Comparing substrings with hashes. Enter: abacaba 2, then \"l1 r1 l2 r2\" queries: 1 3 5 7 and 1 2 2 3"},
			{Type: "text", Content: `On the example: the substrings [1,3] and [5,7] of abacaba are both "aba" (YES), while [1,2] and [2,3] are "ab" and "ba" (NO).

The second tool is the prefix function: pi[i] is the length of the longest proper prefix of the string that is also its suffix at position i. It is computed in O(n) and underlies the KMP algorithm: to find a pattern in a text, concatenate "pattern # text" and look for positions where pi equals the pattern length.`},
			{Type: "code", Caption: "KMP: all occurrences of the pattern. Enter: ababcab ab"},
			{Type: "text", Content: `On the example the pattern ab occurs in ababcab at positions 1, 3 and 6.

The heart of the algorithm is the while loop j = pi[j-1]: on a mismatch we don't start over but fall back to the next candidate prefix. In total, the pointer j decreases no more than it increases — hence O(n).

Task: use the prefix function to find the smallest period of a string (hint: n - pi[n-1], provided n is divisible by that value).

Mark the lesson as completed.`},
		},
	}

	m["number-theory"] = lessonTranslationSeed{
		Summary: "Modular arithmetic: fast exponentiation, the modular inverse and C(n,k) modulo a prime.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Combinatorics answers are often astronomical, so problems ask for them "modulo 10⁹ + 7". You can work with remainders almost like with numbers:

• (a + b) % m, (a · b) % m — take the remainder after every operation;
• subtraction: ((a - b) % m + m) % m — to avoid going negative;
• there is NO division in modular arithmetic — instead, multiply by the modular inverse.

Fast exponentiation: a^b in O(log b) — square the base and walk the bits of the exponent. By Fermat's little theorem, for prime m the inverse is a⁻¹ = a^(m-2) — that same fast exponentiation.`},
			{Type: "code", Caption: "C(n, k) modulo a prime via factorials and inverses. Enter: 10 3"},
			{Type: "text", Content: `Check: C(10, 3) = 120.

Breaking down binpow: while the exponent is non-zero, look at the lowest bit (b & 1): if the bit is set — multiply into the result; then square the base and shift the exponent (b >>= 1). For b = 10¹⁸ — only 60 iterations.

The gentleman's set of number theory to master next:

• the extended Euclidean algorithm (the inverse modulo a NON-prime);
• Euler's totient function;
• the Chinese remainder theorem.`},
			{Type: "text", Content: `Task: compute 2^n mod (10⁹+7) for n = 10¹⁸ (one line with binpow) and the binomial coefficient C(1000, 500) modulo the prime.

Mark the lesson as completed — Level 5 is done!`},
		},
	}

	// ── Level 6. Expert topics ──────────────────────────────────────────────

	m["network-flows"] = lessonTranslationSeed{
		Summary: "Maximum flow: the min-cut theorem, the Edmonds-Karp algorithm and applications to matchings.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A network is a directed graph where every edge has a capacity. The maximum flow is how much "fluid" can be pushed from the source s to the sink t.

The fundamental theorem (Ford-Fulkerson): the maximum flow equals the minimum cut — the minimum total capacity of edges whose removal separates s from t. That is why flows solve both "how much can we push" and "what should we sever" problems.

The Edmonds-Karp algorithm: while there is a path from s to t with positive residual capacities (found by BFS), push flow along it and update the RESIDUAL network: decrease forward edges, increase reverse ones. The reverse edges are the key: they let the algorithm "change its mind" and reroute flow already pushed.`},
			{Type: "code", Caption: "Edmonds-Karp, source 1, sink n. Enter: 4 5, then \"a b capacity\": 1 2 3, 1 3 2, 2 3 1, 2 4 2, 3 4 3"},
			{Type: "text", Content: `On the example the maximum flow is 5: 2 units along 1→2→4, 2 along 1→3→4 and 1 more along 1→2→3→4.

Edmonds-Karp's complexity is O(V·E²); for dense problems there is the faster Dinic's algorithm.

The main practical application is bipartite matching: the maximum number of "student-project" pairs where everyone is in at most one pair. Build a network: source → students (capacity 1) → admissible projects (capacity 1) → sink. Maximum flow = maximum matching.`},
			{Type: "text", Content: `Task: model on paper the problem "3 workers, 3 jobs, who can do what" as a network and run it through the program above (number them: 1 — the source, 2-4 — the workers, 5-7 — the jobs, 8 — the sink).

Mark the lesson as completed.`},
		},
	}

	m["suffix-structures"] = lessonTranslationSeed{
		Summary: "The suffix array: sorting all suffixes of a string and what that gives you.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The suffix array is the sorted list of all suffixes of a string (only their starting positions are stored, of course). It unlocks a whole class of problems: searching for any pattern in O(m log n), counting distinct substrings, the longest common substring of two strings.

Building it by naive sorting is O(n² log n): comparing suffixes is slow. The classic trick is sorting by powers of two: sort the suffixes first by their first 1 character, then 2, 4, 8... At every step a suffix is described by a PAIR of equivalence classes from the previous step — and a pair compares in O(1).`},
			{Type: "code", Caption: "The suffix array in O(n log² n). Enter: banana"},
			{Type: "text", Content: `For banana the suffix order is: a, ana, anana, banana, na, nana.

Unpacking the tricks:

• the terminal character $ (smaller than every letter) evens the suffixes out into "cyclic shifts" — that is why (i + len) % n works;
• an equivalence class is "the group number of equal prefixes of length len"; the pair (class of the start, class of the middle) fully describes a prefix of length 2·len;
• with counting sort instead of std::sort you get the classic O(n log n).

The topic's next step is the LCP array (lengths of common prefixes of neighboring suffixes, Kasai's algorithm in O(n)): with it you can count, for example, the number of distinct substrings. Even more powerful is the suffix automaton, but it awaits you after you own the array confidently.`},
			{Type: "text", Content: `Task: using the suffix array of banana, count the distinct substrings by hand (the sum of suffix lengths minus the sum of the LCPs; answer: 15).

Mark the lesson as completed.`},
		},
	}

	m["computational-geometry"] = lessonTranslationSeed{
		Summary: "The cross product, polygon area and the convex hull.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Almost all contest geometry is built on one tool — the cross product:

cross(O, A, B) = (A - O) × (B - O) = (Ax-Ox)(By-Oy) - (Ay-Oy)(Bx-Ox)

Its sign tells you which way the polyline O→A→B turns: plus — counterclockwise, minus — clockwise, zero — the three points are collinear. And its absolute value equals twice the area of triangle OAB.

The first application — the area of any polygon (the "shoelace formula"): the sum of cross products of consecutive vertices.`},
			{Type: "code", Caption: "Polygon area. Enter: 4, then the vertices along the contour: 0 0, 4 0, 4 3, 0 3"},
			{Type: "text", Content: `The 4×3 rectangle gives 12. Notice: everything is computed in INTEGERS — we store twice the area and divide only when printing. The golden rule of geometry: stay in integers as long as possible; double with its rounding errors is the source of the most treacherous bugs.

The second classic — the convex hull: the smallest convex polygon containing all the points. Andrew's monotone chain algorithm: sort the points by x, build the lower chain left to right, discarding points that make the "wrong" turn, then the upper chain right to left. O(n log n) for the sorting.`},
			{Type: "code", Caption: "The convex hull. Enter: 6, then the points: 0 0, 2 0, 1 1, 2 2, 0 2, 1 -1"},
			{Type: "text", Content: `On the example the interior point (1,1) disappears, leaving the five hull vertices in counterclockwise order.

The condition cross <= 0 also discards points on a straight line; replace it with < 0 if collinear points must be kept.

Task: given the finished hull, compute its area with the shoelace formula — the lesson's two topics join into one solution.

Mark the lesson as completed — you have walked the entire competitive path! What remains is practice: solve problems, compete, and come back to the lessons as a reference. Good luck!`},
		},
	}
}
