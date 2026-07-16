package database

// applySampleInputs attaches example stdin to every runnable code block of
// the seeded lessons: the k-th entry of a lesson's list goes to its k-th
// code block (an empty string means the example reads no input). Keeping the
// samples in one table avoids scattering them across the content files and
// makes it easy to review that every example is covered.
func applySampleInputs(m map[string]lessonContentSeed) {
	samples := map[string][]string{
		// C++ course
		"cpp-first-program":   {"", ""},
		"cpp-variables-types": {"", ""},
		"cpp-input":           {"3 5", "Азат 15"},
		"cpp-conditions":      {"7", "3 9 5"},
		"cpp-loops":           {"", "4\n10 20 30 40", "96"},
		"cpp-arrays":          {"5\n1 3 5 2 4", "5\n1 3 5 2 4"},
		"cpp-strings":         {"hello", "racecar"},
		"cpp-functions":       {"12 8", "97"},
		"cpp-stl":             {"5\n3 1 4 1 5", "6\n1 2 2 3 3 3"},
		"cpp-competitive":     {"4\n10 20 30 40"},

		// Python course
		"py-first-program":  {"", ""},
		"py-variables-types": {"", ""},
		"py-input":          {"7", "3 5"},
		"py-conditions":     {"7", "3 9 5"},
		"py-loops":          {"", "4\n10 20 30 40", "96"},
		"py-lists":          {"", "5\n1 3 5 2 4"},
		"py-strings":        {"hello", "racecar"},
		"py-functions":      {"12 8", "97"},
		"py-collections":    {"1 2 2 3 3 3", "1 2 2 3 3 3"},
		"py-competitive":    {"4\n10 20 30 40"},

		// Java course
		"java-first-program":   {"", ""},
		"java-variables-types": {"", ""},
		"java-input":           {"3 5", "Азат 15"},
		"java-conditions":      {"7", "yes"},
		"java-loops":           {"", "4\n10 20 30 40", "96"},
		"java-arrays":          {"5\n1 3 5 2 4", "5\n1 3 5 2 4"},
		"java-strings":         {"hello", "racecar"},
		"java-methods":         {"12 8", "97"},
		"java-collections":     {"5\n3 1 4 1 5", "6\n1 2 2 3 3 3"},
		"java-competitive":     {"4\n10 20 30 40"},

		// Go course
		"go-first-program":   {"", ""},
		"go-variables-types": {"", ""},
		"go-input":           {"3 5", "Азат 15"},
		"go-conditions":      {"7", "3 9 5"},
		"go-loops":           {"", "4\n10 20 30 40", "96"},
		"go-slices":          {"5\n1 3 5 2 4", "5\n1 3 5 2 4"},
		"go-strings":         {"hello", "racecar"},
		"go-functions":       {"12 8", "97"},
		"go-maps":            {"6\n1 2 2 3 3 3", ""},
		"go-competitive":     {"4\n10 20 30 40"},

		// Roadmap: level 1
		"complexity-big-o":        {"100000", "1000000000"},
		"implementation-problems": {"3 5", "5\n3 9 4 9 7"},
		"basic-math":              {"50", "360"},

		// Roadmap: level 2
		"sorting":       {"5\n3 1 4 1 5", "3\nAzat 90\nAigul 98\nBek 85", "3\nAzat 90\nAigul 98\nBek 85"},
		"two-pointers":  {"5 12\n1 3 5 7 9", "6 8\n2 4 1 3 5 2"},
		"prefix-sums":   {"5 2\n1 2 3 4 5\n2 4\n1 5", "5 2\n1 3 2\n2 5 1"},
		"binary-search": {"6 5\n1 3 5 5 7 9", "1000000000000"},

		// Roadmap: level 3
		"stack-queue":            {"([]{}())", ""},
		"sets-maps":              {"6\n3 1 4 1 5 9", "5\napple banana apple cherry banana"},
		"recursion-backtracking": {"3\n1 2 3", "abc"},
		"greedy":                 {"4\n1 3\n2 5\n4 7\n6 8"},
		"dsu":                    {"5 5\nunion 1 2\nunion 3 4\ncheck 1 3\nunion 2 3\ncheck 1 4"},

		// Roadmap: level 4
		"graphs-bfs-dfs": {"6 3\n1 2\n2 3\n4 5", "5 4\n1 2\n2 3\n3 4\n1 5"},
		"shortest-paths": {"5 6\n1 2 2\n1 3 5\n2 3 1\n2 4 4\n3 5 1\n4 5 3", "4 4\n1 2 5\n2 3 3\n3 4 1\n1 3 10"},
		"mst":            {"4 5\n1 2 1\n2 3 2\n3 4 5\n1 3 2\n2 4 4"},
		"dp-basics":      {"10", "8\n-2 1 -3 4 -1 2 1 -5"},

		// Roadmap: level 5
		"dp-advanced":       {"4 8\n3 4\n4 5\n5 6\n2 3", "8\n10 9 2 5 3 7 101 18"},
		"segment-tree":      {"5 3\n1 2 3 4 5\nsum 2 4\nset 3 10\nsum 2 4"},
		"string-algorithms": {"abacaba 2\n1 3 5 7\n1 2 2 3", "ababcab ab"},
		"number-theory":     {"10 3"},

		// Roadmap: level 6
		"network-flows":          {"4 5\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 3"},
		"suffix-structures":      {"banana"},
		"computational-geometry": {"4\n0 0\n4 0\n4 3\n0 3", "6\n0 0\n2 0\n1 1\n2 2\n0 2\n1 -1"},
	}

	for slug, list := range samples {
		seed, ok := m[slug]
		if !ok {
			continue
		}
		k := 0
		for i := range seed.Blocks {
			if seed.Blocks[i].Type != "code" {
				continue
			}
			if k < len(list) {
				seed.Blocks[i].SampleInput = list[k]
			}
			k++
		}
		m[slug] = seed
	}
}
