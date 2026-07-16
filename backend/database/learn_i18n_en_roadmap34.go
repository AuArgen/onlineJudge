package database

// addEnRoadmap34Translations seeds English translations for roadmap levels
// 3-4 lessons. Aligned with learn_content_roadmap34.go.
func addEnRoadmap34Translations(m map[string]lessonTranslationSeed) {
	// ── Level 3. Data structures and greedy ─────────────────────────────────

	m["stack-queue"] = lessonTranslationSeed{
		Summary: "The stack (LIFO) and the queue (FIFO): bracket sequences and processing order.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The two simplest data structures differ in their removal order:

• A stack is LIFO (last in, first out): the last one in is the first one out. Like a pile of plates.
• A queue is FIFO (first in, first out): the first one in is the first one out. Like a line at a shop.

In C++ the stack is std::stack (push, top, pop), the queue is std::queue (push, front, pop).

The canonical stack problem is the valid bracket sequence: every closing bracket must match the most recently opened one. "The most recently opened" is exactly the top of the stack.`},
			{Type: "code", Caption: "Checking brackets of three kinds. Enter: ([]{}())"},
			{Type: "text", Content: `Note the two checks people often forget: a closing bracket with an EMPTY stack (a stray closer) and a NON-EMPTY stack at the end (unclosed brackets).

You have already seen a queue, even if you didn't notice: it underlies breadth-first search (BFS), which awaits you at level 4. For now — a minimal service-order example.`},
			{Type: "code", Caption: "A queue: first come, first served"},
			{Type: "text", Content: `Task: given a string of brackets, find the depth of the deepest nesting (hint: it is the maximum stack size over time; for a single bracket kind even a counter suffices).

Mark the lesson as completed and move on to set and map.`},
		},
	}

	m["sets-maps"] = lessonTranslationSeed{
		Summary: "set and map: fast membership tests, counting distinct values and frequencies in O(log n).",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Checking "have we seen this number before" by scanning an array costs O(n) per check. The set and map structures do it in O(log n), because internally they keep elements in a balanced tree.

• std::set — a set of unique elements: insert, count, erase. Keeps elements sorted.
• std::map — a "key → value" dictionary: count[x]++ creates the key with a zero on first access all by itself.

There are also hash versions, unordered_set / unordered_map, with average O(1) — faster, but unordered.

The classic: find the first repeated element of a stream.`},
			{Type: "code", Caption: "The first repeat. Enter: 6, then 3 1 4 1 5 9"},
			{Type: "text", Content: `map is indispensable for frequency analysis: in one pass we count how many times each word occurs. Iterating a map yields the keys in sorted order — often that is a bonus to exploit, not a coincidence.`},
			{Type: "code", Caption: "Word frequencies. Enter: 5, then: apple banana apple cherry banana"},
			{Type: "text", Content: `Guidelines for choosing:

• need sorted order or "the nearest element" — set/map;
• need only speed — the unordered versions;
• need duplicates — multiset.

Task: given n numbers, print those that occur exactly once, in increasing order (a map solves this in six lines).

Mark the lesson as completed and move on to recursion.`},
		},
	}

	m["recursion-backtracking"] = lessonTranslationSeed{
		Summary: "Recursion and exhaustive search: subsets, permutations and the tree of choices.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Recursion is a function that calls itself. Correct recursion always has two ingredients: a base case (when to stop) and a step (how to reduce the problem to a smaller one).

Its main contest application is exhaustive search: systematically visiting ALL possibilities. For example, all subsets of a set: for each element there are two choices — take it or not. You get a tree of choices of depth n with 2ⁿ leaves.`},
			{Type: "code", Caption: "All subsets. Enter: 3, then 1 2 3"},
			{Type: "text", Content: `The line current.pop_back() is the heart of the technique called backtracking: make a choice, explore the branch, UNDO the choice and try the next one. A forgotten undo is mistake number one in search code.

Get a feel for the scale: 2ⁿ subsets — search is realistic up to n ≈ 20-25. Permutations are even more numerous: n! (at n = 10 that is already 3.6 million). For permutations C++ has a ready-made next_permutation.`},
			{Type: "code", Caption: "All permutations of a string. Enter: abc"},
			{Type: "text", Content: `When the full search is too big, pruning saves you: don't enter a branch that provably cannot yield an answer. A smart search with pruning solves problems where the brute-force way would take forever.

Task: print all ways to place + and - signs between the numbers 1 2 3 4 so that the result equals zero (searching 2³ sign choices).

Mark the lesson as completed and move on to greedy algorithms.`},
		},
	}

	m["greedy"] = lessonTranslationSeed{
		Summary: "Greedy algorithms: the locally best step, the non-overlapping intervals problem, limits of applicability.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A greedy algorithm makes the locally best choice at every step and never reconsiders. When greed is correct, you get the fastest and shortest solution possible. When it is not, it confidently outputs a wrong answer. The whole art is telling one from the other.

The benchmark problem: given n events with start and end times, pick the maximum number of non-overlapping ones. The correct greedy: always take the event with the EARLIEST END — it leaves the most time for the rest.`},
			{Type: "code", Caption: "Maximum non-overlapping intervals. Enter: 4, then \"start end\" pairs: 1 3, 2 5, 4 7, 6 8"},
			{Type: "text", Content: `Why "earliest end" is correct: suppose the optimal answer took some other event first. Replace it with the earliest-ending event — it finishes no later, so the rest of the schedule stays valid. The answer did not get worse. This proof pattern (the "exchange argument") is the standard for greedy algorithms.

And here is a counterexample showing greed is not universal: coins of denominations 1, 3 and 4, make 6. The greedy takes 4+1+1 — three coins. The optimum: 3+3 — two. Coin systems like this need dynamic programming (next level!), not greed.

Signs that greedy MIGHT work: sorting obviously suggests itself; the current choice doesn't constrain the future more than any other; you can sketch an exchange argument.`},
			{Type: "text", Content: `Task: start simple: given the lengths of n ropes, joining two ropes costs the sum of their lengths; prove (or refute on a small test) that greedily joining the two shortest gives the minimum cost. Check yourself by brute force for n = 4.

Mark the lesson as completed and move on to DSU.`},
		},
	}

	m["dsu"] = lessonTranslationSeed{
		Summary: "Disjoint Set Union: find and union with path compression — almost O(1).",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The problem: elements merge into groups, and we need fast answers to "are a and b in the same group?" and "merge the groups of a and b". Naively — slow; DSU (Disjoint Set Union) does both operations in almost O(1).

The idea: each group is a tree, the group's representative is the root. find(v) climbs to the root; union hangs one root under another.

Two heuristics make the structure lightning fast:

• path compression: on the way to the root, re-hang all visited vertices directly onto the root;
• union by rank: the smaller tree is hung under the larger one.`},
			{Type: "code", Caption: "DSU. Enter: 5 5, then the queries: union 1 2 / union 3 4 / check 1 3 / union 2 3 / check 1 4"},
			{Type: "text", Content: `Run the example: after union 1 2 and union 3 4, vertices 1 and 3 are in different groups (NO); after union 2 3 — in the same one (YES).

The line parent[v] = find(parent[v]) is that very path compression: returning from the recursion, every visited vertex gets hung directly onto the root. With both heuristics the amortized complexity is the inverse Ackermann function — in practice indistinguishable from a constant.

Where DSU shines: counting connected components as edges are added, Kruskal's algorithm for the minimum spanning tree (level 4), "merge and query" problems.`},
			{Type: "text", Content: `Task: add group-size tracking to the DSU (a size array; on union, size[a] += size[b]) and answer the query "how many elements are in the group of x".

Mark the lesson as completed — Level 3 is done, graphs are ahead!`},
		},
	}

	// ── Level 4. Graphs and DP ──────────────────────────────────────────────

	m["graphs-bfs-dfs"] = lessonTranslationSeed{
		Summary: "Graphs: the adjacency list, depth- and breadth-first search, connected components and shortest paths.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `A graph is vertices connected by edges: cities and roads, people and friendships, states and transitions. A huge class of problems is naturally phrased in graph language.

Storage: the adjacency list — for every vertex, a list of its neighbors. A vector of vectors g, where g[v] holds the neighbors of vertex v. The n×n adjacency matrix only suits small n.

The two basic traversals:

• DFS (depth-first): follow an edge as far as you can, then backtrack. Naturally written with recursion. Uses: connected components, cycle detection, topological sort.
• BFS (breadth-first): traverse in "waves" using a queue. Gives shortest distances in an unweighted graph.`},
			{Type: "code", Caption: "DFS: the number of connected components. Enter: 6 3, then the edges: 1 2, 2 3, 4 5"},
			{Type: "text", Content: `In the example the vertices {1,2,3}, {4,5} and the lone {6} — three components.

BFS puts the start vertex into the queue, then repeats: take out a vertex — add all its unvisited neighbors. Vertices are processed in order of distance from the start, so dist is computed correctly.`},
			{Type: "code", Caption: "BFS: distances from vertex 1. Enter: 5 4, then the edges: 1 2, 2 3, 3 4, 1 5"},
			{Type: "text", Content: `Both traversals are O(V + E): every vertex and every edge is processed once.

The rakes everyone steps on:

1. A forgotten visited mark — an infinite loop.
2. Recursive DFS on a chain of 10⁵+ vertices can overflow the call stack — write an iterative version with your own stack or raise the limit.
3. dist is initialized to -1 ("not visited"), and that same value is a ready answer for unreachable vertices.

Task: a maze n×m of dots and hashes — find the shortest path from the entrance to the exit (BFS over cells: the neighbors are the four sides).

Mark the lesson as completed.`},
		},
	}

	m["shortest-paths"] = lessonTranslationSeed{
		Summary: "Shortest paths in a weighted graph: Dijkstra with a heap in O(m log n) and Floyd in O(n³).",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Once edges get weights (road lengths, costs), BFS no longer works. The two main tools:

• Dijkstra — shortest paths from one vertex to all others, O(m log n) with a priority queue. Restriction: weights must be non-negative.
• Floyd — shortest paths between ALL pairs, O(n³), five lines of code. Fine for n up to a few hundred.

Dijkstra's idea: maintain the current best distances and always "close" the nearest open vertex — with non-negative weights its distance can never improve again.`},
			{Type: "code", Caption: "Dijkstra. Enter: 5 6, then \"a b weight\" edges: 1 2 2, 1 3 5, 2 3 1, 2 4 4, 3 5 1, 4 5 3"},
			{Type: "text", Content: `The key line is if (d > dist[v]) continue: the queue may contain stale entries (we re-insert a vertex on every improvement), and they must be silently skipped. Without this line the algorithm stays correct but can slow down badly.

Floyd is even simpler: three nested loops, the outer one over the "intermediate" vertex k. After iteration k, the array d[i][j] holds shortest paths using intermediate vertices only from {1..k}.`},
			{Type: "code", Caption: "Floyd: all pairs. Enter: 4 4, then: 1 2 5, 2 3 3, 3 4 1, 1 3 10"},
			{Type: "text", Content: `For negative edges (without negative cycles) there is the Bellman-Ford algorithm at O(n·m) — get to know it on your own when you meet such a problem.

Task: in the Dijkstra example, verify by hand that the distance to vertex 4 is 6 and to vertex 5 is 4, tracing the paths.

Mark the lesson as completed and move on to the minimum spanning tree.`},
		},
	}

	m["mst"] = lessonTranslationSeed{
		Summary: "The minimum spanning tree: Kruskal's algorithm = sorting edges + DSU.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `The problem: connect all n cities with roads of minimum total cost. The answer is always a tree of n-1 edges (a redundant edge in a cycle can be thrown away); it is called the minimum spanning tree (MST).

Kruskal's algorithm is a greedy that provably works:

1. Sort the edges by weight.
2. Go from cheap to expensive; take an edge if it connects DIFFERENT components.
3. "Are the components different" is checked by the DSU from the previous level — this is where it shines!

Complexity: O(m log m) for the sorting; the DSU is almost free.`},
			{Type: "code", Caption: "Kruskal. Enter: 4 5, then the edges: 1 2 1, 2 3 2, 3 4 5, 1 3 2, 2 4 4"},
			{Type: "text", Content: `On the example: edges in increasing weight order are 1, 2, 2, 4, 5. Take 1-2 (weight 1), take 2-3 (weight 2), skip edge 1-3 (already in one component), take 2-4 (weight 4). Total: 1 + 2 + 4 = 7.

Why the greed is correct: the cheapest edge across any "cut" of the graph necessarily belongs to some MST (if not — add it; a more expensive edge across the same cut appears in the cycle; throw that one away — no worse). It is the same exchange argument from the greedy lesson.

There is also Prim's algorithm (grow the tree from a vertex, Dijkstra-style) — the same result, a different style.`},
			{Type: "text", Content: `Task: modify the program to print not only the weight but also the edges of the spanning tree itself.

Mark the lesson as completed and move on to the level's main topic — dynamic programming.`},
		},
	}

	m["dp-basics"] = lessonTranslationSeed{
		Summary: "Dynamic programming: states, transitions, the base case — the staircase and the maximum subarray.",
		Blocks: []blockTranslation{
			{Type: "text", Content: `Dynamic programming (DP) is a method for problems that break into overlapping subproblems: solve each subproblem ONCE and memorize the answer.

The three-question recipe:

1. State: what is dp[i]? (in words, precisely!)
2. Transitions: how is dp[i] expressed through smaller states?
3. Base: what are the smallest states equal to?

The hello-world of DP is the staircase: you stand at the bottom of a staircase with n steps and climb 1 or 2 steps at a time. How many ways are there to get to the top?

• dp[i] — the number of ways to reach step i;
• step i is reached from steps i-1 or i-2, so dp[i] = dp[i-1] + dp[i-2];
• base: dp[0] = 1 (standing at the bottom), dp[1] = 1.`},
			{Type: "code", Caption: "The staircase. Enter n up to 80, for example: 10"},
			{Type: "text", Content: `For n = 10 the answer is 89 — these are the Fibonacci numbers, growing out of the problem all by themselves.

Two styles of writing DP:

• tabular (as above): fill the array from the base upward;
• memoization: write the recursion and cache the answers. Which is more convenient is a matter of taste; the complexity is the same.

The second classic — the maximum subarray sum (Kadane's algorithm). State: dp[i] — the maximum sum of a subarray ENDING at i. Transition: either extend the previous subarray or start a new one at a[i].`},
			{Type: "code", Caption: "The maximum subarray. Enter: 8, then -2 1 -3 4 -1 2 1 -5"},
			{Type: "text", Content: `The answer on the example: 6 (the subarray 4 -1 2 1). Notice: the dp array collapsed into a single variable cur — that often happens when the transition only looks at the previous state.

Task: solve the "staircase" where stepping on certain steps is forbidden (dp[i] = 0 for the forbidden ones). And think how the problem changes with steps of 1, 2 and 3.

Mark the lesson as completed — Level 4 is done. Advanced DP is ahead!`},
		},
	}
}
