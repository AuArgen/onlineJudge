package database

// addEnOverviewTranslations seeds English translations for the roadmap track
// page and level pages. Aligned with learn_content_overview.go.
func addEnOverviewTranslations(m map[string]lessonTranslationSeed) {
	m["olympiad-roadmap"] = lessonTranslationSeed{
		Blocks: []blockTranslation{
			{Type: "text", Content: `How the path is structured

Ahead of you are 6 levels — from the foundations of algorithmics to international olympiad topics. The levels are arranged so that each builds on the previous ones: the binary search from level 2 shows up in the advanced DP of level 5, and the DSU from level 3 — in Kruskal's algorithm at level 4. So go through the levels in order and don't skip ahead.

If you aren't yet writing code confidently — first take one of the programming language courses (C++, Python, Java or Go): they are in the "Learn" section right next to this path. The examples in the path's lessons can be viewed in any of those languages — the switcher is right above the code.`},
			{Type: "text", Content: `How to study so it actually works

1. Read the lesson and run every example. A sample input is already filled in — press "Run", then change the data or the code itself and see what changes. Understanding comes from experiments, not from reading.

2. Solve the problems after the lesson. A topic counts as learned when you have solved several problems on it yourself — without peeking at the editorial. Mark the lessons you finish to see your progress.

3. Study regularly. Three or four one-hour sessions a week beat a single eight-hour Sunday: the brain needs time to consolidate.

4. Enter competitions starting from level 2–3. A contest teaches what lessons cannot: managing time, choosing the order of problems, not panicking.`},
			{Type: "text", Content: `If you get stuck

That is normal — everyone gets stuck. Techniques that work: go back one lesson and re-solve its problems; trace the solution on a small example on paper, by hand; set the problem aside for a day — a fresh head often sees the answer immediately. If a topic just won't click, move on and come back in a week: the next lesson's knowledge often "back-lights" the previous one.

Good luck! Start with Level 1.`},
		},
	}

	m["level-1-foundations"] = lessonTranslationSeed{
		Blocks: []blockTranslation{
			{Type: "text", Content: `At this level you learn the competitive programmer's core skill — estimating a solution's speed BEFORE writing it, implementing problems carefully without losing points on details, and using basic math: divisibility, GCD and primes.

The readiness criterion for level 2: you can determine your code's complexity, you know the "10⁸ operations per second" rule, and you have solved the problems of all three lessons.`},
		},
	}

	m["level-2-sorting-searching"] = lessonTranslationSeed{
		Blocks: []blockTranslation{
			{Type: "text", Content: `The four techniques of this level are the workhorses of every olympiad: sorting as a tool, two pointers, prefix sums and binary search. Almost every entry-level "aha" problem is solved by one of them or their combination.

The readiness criterion for level 3: you recognize these techniques in unfamiliar problems — "a sorted array and pairs" hints at two pointers, "many sum queries" at prefixes, "the minimum X for which it is possible" at binary search on the answer.`},
		},
	}

	m["level-3-data-structures"] = lessonTranslationSeed{
		Blocks: []blockTranslation{
			{Type: "text", Content: `The toolbox level: stack and queue, set and map, recursive search, greedy algorithms and DSU. After it you will choose the data structure to fit the problem instead of bending the problem to fit an array.

The readiness criterion for level 4: you can write DSU and backtracking search from memory, and for a greedy solution you can explain WHY it is correct.`},
		},
	}

	m["level-4-graphs-dp"] = lessonTranslationSeed{
		Blocks: []blockTranslation{
			{Type: "text", Content: `The two pillars of the middle level: graphs (DFS, BFS, Dijkstra, spanning trees) and dynamic programming. "Real" contest algorithmics starts at this level — as do most problems of city and national rounds.

The readiness criterion for level 5: you translate a word problem into a graph on your own and solve simple DPs (the staircase, subarrays), explaining what a state and a transition are.`},
		},
	}

	m["level-5-advanced"] = lessonTranslationSeed{
		Blocks: []blockTranslation{
			{Type: "text", Content: `The advanced arsenal: classic DP (the knapsack, LIS), the segment tree, string algorithms and modular arithmetic. These topics are enough for prize places at regional and national olympiads.

The readiness criterion for level 6: you write a segment tree without hints and recognize "knapsack" and "string" problems from their statements.`},
		},
	}

	m["level-6-expert"] = lessonTranslationSeed{
		Blocks: []blockTranslation{
			{Type: "text", Content: `International-level topics: flows, suffix structures, computational geometry. Here the lessons are gateways into each topic, not complete courses: whole books exist on every one. Take them on when you are confident with levels 1–5.

Beyond that — only practice: contest archives, editorials of strong solutions and regular competitions. Come back to the lessons as a reference — and good luck at the olympiads!`},
		},
	}
}
