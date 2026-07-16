package database

// goRoadmapVariants returns Go ports of the roadmap code examples for
// levels 1-4 (by levels 5-6 contest practice is dominated by C++/Python).
func goRoadmapVariants() map[string][]codeVariantSeed {
	return map[string][]codeVariantSeed{
		"complexity-big-o": {
			{Code: `package main

import (
	"fmt"
	"math"
)

func main() {
	var n int64
	fmt.Scan(&n) // введите n до 10^9

	log2 := math.Log2(float64(n))
	fmt.Printf("O(log n): ~%d операций\n", int64(log2))
	fmt.Printf("O(n): ~%d\n", n)
	fmt.Printf("O(n log n): ~%d\n", int64(float64(n)*log2))
	fmt.Printf("O(n^2): ~%d\n", n*n)
	if n <= 60 {
		fmt.Printf("O(2^n): ~%d\n", int64(1)<<n)
	} else {
		fmt.Println("O(2^n): больше, чем атомов во Вселенной")
	}
}`},
			{Code: `package main

import "fmt"

func main() {
	var n int64
	fmt.Scan(&n)

	slow := int64(0)
	for i := int64(1); i <= n; i++ { // O(n)
		slow += i
	}

	fast := n * (n + 1) / 2 // O(1)

	fmt.Println(slow)
	fmt.Println(fast)
}`},
		},

		"implementation-problems": {
			{Code: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	var n, m int
	fmt.Scan(&n, &m)

	w := bufio.NewWriter(os.Stdout)
	defer w.Flush()
	for i := 0; i < n; i++ {
		for j := 0; j < m; j++ {
			if (i+j)%2 == 0 {
				fmt.Fprint(w, "#")
			} else {
				fmt.Fprint(w, ".")
			}
		}
		fmt.Fprintln(w)
	}
}`},
			{Code: `package main

import "fmt"

func main() {
	var n int // n >= 2
	fmt.Scan(&n)
	a := make([]int64, n)
	for i := range a {
		fmt.Scan(&a[i])
	}

	best, second := a[0], a[1]
	if second > best {
		best, second = second, best
	}
	for i := 2; i < n; i++ {
		if a[i] > best {
			second = best
			best = a[i]
		} else if a[i] > second {
			second = a[i]
		}
	}
	fmt.Println(second)
}`},
		},

		"basic-math": {
			{Code: `package main

import (
	"fmt"
	"strconv"
	"strings"
)

func main() {
	var n int
	fmt.Scan(&n)

	size := n + 1
	if size < 2 {
		size = 2
	}
	isComposite := make([]bool, size)
	for i := int64(2); i*i <= int64(n); i++ {
		if !isComposite[i] {
			for j := i * i; j <= int64(n); j += i {
				isComposite[j] = true
			}
		}
	}

	primes := []string{}
	for i := 2; i <= n; i++ {
		if !isComposite[i] {
			primes = append(primes, strconv.Itoa(i))
		}
	}
	fmt.Println(strings.Join(primes, " "))
}`},
			{Code: `package main

import (
	"fmt"
	"strconv"
	"strings"
)

func main() {
	var n int64
	fmt.Scan(&n)

	factors := []string{}
	for d := int64(2); d*d <= n; d++ {
		for n%d == 0 {
			factors = append(factors, strconv.FormatInt(d, 10))
			n /= d
		}
	}
	if n > 1 {
		factors = append(factors, strconv.FormatInt(n, 10))
	}
	fmt.Println(strings.Join(factors, " "))
}`},
		},

		"sorting": {
			{Code: `package main

import (
	"fmt"
	"sort"
)

func main() {
	var n int
	fmt.Scan(&n)
	a := make([]int, n)
	for i := range a {
		fmt.Scan(&a[i])
	}

	sort.Ints(a)
	for _, x := range a {
		fmt.Print(x, " ")
	}
	fmt.Println()

	sort.Sort(sort.Reverse(sort.IntSlice(a))) // по убыванию
	for _, x := range a {
		fmt.Print(x, " ")
	}
	fmt.Println()
}`},
			{Code: `package main

import (
	"fmt"
	"sort"
)

type Student struct {
	Name  string
	Score int
}

func main() {
	var n int
	fmt.Scan(&n)
	a := make([]Student, n)
	for i := range a {
		fmt.Scan(&a[i].Name, &a[i].Score)
	}

	// по убыванию баллов
	sort.Slice(a, func(i, j int) bool { return a[i].Score > a[j].Score })

	for _, s := range a {
		fmt.Println(s.Name, s.Score)
	}
}`},
		},

		"two-pointers": {
			{Code: `package main

import "fmt"

func main() {
	var n int
	var target int64
	fmt.Scan(&n, &target)
	a := make([]int64, n)
	for i := range a {
		fmt.Scan(&a[i]) // массив отсортирован
	}

	l, r := 0, n-1
	for l < r {
		sum := a[l] + a[r]
		if sum == target {
			fmt.Println(a[l], "+", a[r], "=", target)
			return
		}
		if sum < target {
			l++
		} else {
			r--
		}
	}
	fmt.Println("Пары нет")
}`},
			{Code: `package main

import "fmt"

func main() {
	var n int
	var s int64
	fmt.Scan(&n, &s)
	a := make([]int64, n)
	for i := range a {
		fmt.Scan(&a[i])
	}

	sum := int64(0)
	best, l := 0, 0
	for r := 0; r < n; r++ {
		sum += a[r]
		for sum > s {
			sum -= a[l]
			l++
		}
		if r-l+1 > best {
			best = r - l + 1
		}
	}
	fmt.Println(best)
}`},
		},

		"prefix-sums": {
			{Code: `package main

import (
	"bufio"
	"fmt"
	"os"
)

var reader = bufio.NewReader(os.Stdin)

func main() {
	var n, q int
	fmt.Fscan(reader, &n, &q)

	p := make([]int64, n+1)
	for i := 1; i <= n; i++ {
		var x int64
		fmt.Fscan(reader, &x)
		p[i] = p[i-1] + x
	}

	for ; q > 0; q-- {
		var l, r int // границы с единицы
		fmt.Fscan(reader, &l, &r)
		fmt.Println(p[r] - p[l-1])
	}
}`},
			{Code: `package main

import (
	"bufio"
	"fmt"
	"os"
)

var reader = bufio.NewReader(os.Stdin)

func main() {
	var n, q int
	fmt.Fscan(reader, &n, &q)
	d := make([]int64, n+2)

	for ; q > 0; q-- {
		var l, r int
		var x int64 // прибавить x на отрезке [l, r]
		fmt.Fscan(reader, &l, &r, &x)
		d[l] += x
		d[r+1] -= x
	}

	cur := int64(0)
	for i := 1; i <= n; i++ {
		cur += d[i]
		fmt.Print(cur, " ")
	}
	fmt.Println()
}`},
		},

		"binary-search": {
			{Code: `package main

import "fmt"

func main() {
	var n int
	var x int64
	fmt.Scan(&n, &x)
	a := make([]int64, n)
	for i := range a {
		fmt.Scan(&a[i]) // массив отсортирован
	}

	l, r := 0, n // ответ в [l, r): первый индекс, где a[i] >= x
	for l < r {
		mid := (l + r) / 2
		if a[mid] >= x {
			r = mid
		} else {
			l = mid + 1
		}
	}

	if l < n && a[l] == x {
		fmt.Println("Первое вхождение: позиция", l+1)
	} else {
		fmt.Println("Не найден")
	}
}`},
			{Code: `package main

import "fmt"

func main() {
	var n int64
	fmt.Scan(&n)

	l, r := int64(0), int64(2000000000) // ответ где-то в [l, r]
	for l < r {
		mid := (l + r + 1) / 2 // округление вверх!
		if mid*mid <= n {
			l = mid // mid подходит - идём вправо
		} else {
			r = mid - 1
		}
	}
	fmt.Println(l)
}`},
		},

		"stack-queue": {
			{Code: `package main

import "fmt"

func main() {
	var s string
	fmt.Scan(&s)

	stack := []byte{}
	ok := true
	pairs := map[byte]byte{')': '(', ']': '[', '}': '{'}
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c == '(' || c == '[' || c == '{' {
			stack = append(stack, c)
		} else {
			if len(stack) == 0 || stack[len(stack)-1] != pairs[c] {
				ok = false
				break
			}
			stack = stack[:len(stack)-1]
		}
	}

	if ok && len(stack) == 0 {
		fmt.Println("YES")
	} else {
		fmt.Println("NO")
	}
}`},
			{Code: `package main

import "fmt"

func main() {
	queue := []string{"Азат", "Айгуль", "Бек"}

	for len(queue) > 0 {
		fmt.Println(queue[0], "обслужен")
		queue = queue[1:]
	}
}`},
		},

		"sets-maps": {
			{Code: `package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)

	seen := map[int]bool{}
	for i := 0; i < n; i++ {
		var x int
		fmt.Scan(&x)
		if seen[x] {
			fmt.Println("Первый повтор:", x)
			return
		}
		seen[x] = true
	}
	fmt.Println("Повторов нет")
}`},
			{Code: `package main

import (
	"fmt"
	"sort"
)

func main() {
	var n int
	fmt.Scan(&n)

	count := map[string]int{}
	for i := 0; i < n; i++ {
		var w string
		fmt.Scan(&w)
		count[w]++
	}

	keys := []string{}
	for w := range count {
		keys = append(keys, w)
	}
	sort.Strings(keys) // порядок обхода map случайный - сортируем ключи

	for _, w := range keys {
		fmt.Println(w + ": " + fmt.Sprint(count[w]))
	}
}`},
		},

		"recursion-backtracking": {
			{Code: `package main

import "fmt"

var (
	n       int
	a       []int
	current []int
)

func search(i int) {
	if i == n { // база: решение по всем элементам принято
		line := "{ "
		for _, x := range current {
			line += fmt.Sprint(x) + " "
		}
		fmt.Println(line + "}")
		return
	}
	search(i + 1)                    // вариант 1: не берём a[i]
	current = append(current, a[i])  // вариант 2: берём a[i]
	search(i + 1)
	current = current[:len(current)-1] // откат - вернуть как было!
}

func main() {
	fmt.Scan(&n)
	a = make([]int, n)
	for i := range a {
		fmt.Scan(&a[i])
	}
	search(0)
}`},
			{Code: `package main

import (
	"fmt"
	"sort"
)

// классический алгоритм следующей перестановки (как next_permutation в C++)
func nextPermutation(a []byte) bool {
	i := len(a) - 2
	for i >= 0 && a[i] >= a[i+1] {
		i--
	}
	if i < 0 {
		return false
	}
	j := len(a) - 1
	for a[j] <= a[i] {
		j--
	}
	a[i], a[j] = a[j], a[i]
	for l, r := i+1, len(a)-1; l < r; l, r = l+1, r-1 {
		a[l], a[r] = a[r], a[l]
	}
	return true
}

func main() {
	var s string
	fmt.Scan(&s)
	b := []byte(s)
	sort.Slice(b, func(i, j int) bool { return b[i] < b[j] })

	for {
		fmt.Println(string(b))
		if !nextPermutation(b) {
			break
		}
	}
}`},
		},

		"greedy": {
			{Code: `package main

import (
	"fmt"
	"sort"
)

func main() {
	var n int
	fmt.Scan(&n)
	type seg struct{ end, start int }
	a := make([]seg, n)
	for i := range a {
		fmt.Scan(&a[i].start, &a[i].end)
	}

	sort.Slice(a, func(i, j int) bool { return a[i].end < a[j].end }) // по концу

	count := 0
	lastEnd := -1000000000
	for _, s := range a {
		if s.start >= lastEnd { // начало не раньше конца последнего взятого
			count++
			lastEnd = s.end
		}
	}
	fmt.Println(count)
}`},
		},

		"dsu": {
			{Code: `package main

import (
	"bufio"
	"fmt"
	"os"
)

var parent, rnk []int

func find(v int) int {
	if parent[v] == v {
		return v
	}
	parent[v] = find(parent[v]) // сжатие пути
	return parent[v]
}

func unite(a, b int) {
	a, b = find(a), find(b)
	if a == b {
		return
	}
	if rnk[a] < rnk[b] {
		a, b = b, a
	}
	parent[b] = a
	if rnk[a] == rnk[b] {
		rnk[a]++
	}
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	var n, q int
	fmt.Fscan(reader, &n, &q)
	parent = make([]int, n+1)
	rnk = make([]int, n+1)
	for i := 1; i <= n; i++ {
		parent[i] = i
	}

	for ; q > 0; q-- {
		var t string
		var a, b int
		fmt.Fscan(reader, &t, &a, &b)
		if t == "union" {
			unite(a, b)
		} else {
			if find(a) == find(b) {
				fmt.Println("YES")
			} else {
				fmt.Println("NO")
			}
		}
	}
}`},
		},

		"graphs-bfs-dfs": {
			{Code: `package main

import "fmt"

var (
	g       [][]int
	visited []bool
)

func dfs(v int) {
	visited[v] = true
	for _, to := range g[v] {
		if !visited[to] {
			dfs(to)
		}
	}
}

func main() {
	var n, m int
	fmt.Scan(&n, &m)
	g = make([][]int, n+1)
	visited = make([]bool, n+1)

	for i := 0; i < m; i++ {
		var a, b int
		fmt.Scan(&a, &b)
		g[a] = append(g[a], b)
		g[b] = append(g[b], a) // неориентированный граф
	}

	components := 0
	for v := 1; v <= n; v++ {
		if !visited[v] {
			components++
			dfs(v)
		}
	}
	fmt.Println(components)
}`},
			{Code: `package main

import "fmt"

func main() {
	var n, m int
	fmt.Scan(&n, &m)
	g := make([][]int, n+1)
	for i := 0; i < m; i++ {
		var a, b int
		fmt.Scan(&a, &b)
		g[a] = append(g[a], b)
		g[b] = append(g[b], a)
	}

	dist := make([]int, n+1)
	for i := range dist {
		dist[i] = -1
	}
	queue := []int{1}
	dist[1] = 0

	for len(queue) > 0 {
		v := queue[0]
		queue = queue[1:]
		for _, to := range g[v] {
			if dist[to] == -1 {
				dist[to] = dist[v] + 1
				queue = append(queue, to)
			}
		}
	}

	for v := 1; v <= n; v++ {
		fmt.Printf("до %d: %d\n", v, dist[v])
	}
}`},
		},

		"shortest-paths": {
			{Code: `package main

import (
	"container/heap"
	"fmt"
)

type item struct {
	d int64
	v int
}

type pq []item

func (p pq) Len() int            { return len(p) }
func (p pq) Less(i, j int) bool  { return p[i].d < p[j].d }
func (p pq) Swap(i, j int)       { p[i], p[j] = p[j], p[i] }
func (p *pq) Push(x any)         { *p = append(*p, x.(item)) }
func (p *pq) Pop() any           { old := *p; it := old[len(old)-1]; *p = old[:len(old)-1]; return it }

func main() {
	var n, m int
	fmt.Scan(&n, &m)
	type edge struct {
		to int
		w  int64
	}
	g := make([][]edge, n+1)
	for i := 0; i < m; i++ {
		var a, b int
		var w int64
		fmt.Scan(&a, &b, &w)
		g[a] = append(g[a], edge{b, w})
		g[b] = append(g[b], edge{a, w})
	}

	const INF = int64(1e18)
	dist := make([]int64, n+1)
	for i := range dist {
		dist[i] = INF
	}
	dist[1] = 0
	q := &pq{{0, 1}}

	for q.Len() > 0 {
		top := heap.Pop(q).(item)
		if top.d > dist[top.v] {
			continue // устаревшая запись - пропускаем
		}
		for _, e := range g[top.v] {
			if top.d+e.w < dist[e.to] {
				dist[e.to] = top.d + e.w
				heap.Push(q, item{dist[e.to], e.to})
			}
		}
	}

	for v := 1; v <= n; v++ {
		fmt.Printf("до %d: %d\n", v, dist[v])
	}
}`},
			{Code: `package main

import "fmt"

func main() {
	var n, m int
	fmt.Scan(&n, &m)
	const INF = int64(1e18)
	d := make([][]int64, n+1)
	for i := 1; i <= n; i++ {
		d[i] = make([]int64, n+1)
		for j := 1; j <= n; j++ {
			d[i][j] = INF
		}
		d[i][i] = 0
	}

	for i := 0; i < m; i++ {
		var a, b int
		var w int64
		fmt.Scan(&a, &b, &w)
		if w < d[a][b] {
			d[a][b] = w
			d[b][a] = w
		}
	}

	for k := 1; k <= n; k++ {
		for i := 1; i <= n; i++ {
			for j := 1; j <= n; j++ {
				if d[i][k]+d[k][j] < d[i][j] {
					d[i][j] = d[i][k] + d[k][j]
				}
			}
		}
	}

	for i := 1; i <= n; i++ {
		for j := 1; j <= n; j++ {
			if d[i][j] >= INF {
				fmt.Print(-1, " ")
			} else {
				fmt.Print(d[i][j], " ")
			}
		}
		fmt.Println()
	}
}`},
		},

		"mst": {
			{Code: `package main

import (
	"fmt"
	"sort"
)

var parent []int

func find(v int) int {
	if parent[v] == v {
		return v
	}
	parent[v] = find(parent[v])
	return parent[v]
}

func main() {
	var n, m int
	fmt.Scan(&n, &m)

	type edge struct {
		w    int64
		a, b int
	}
	edges := make([]edge, m)
	for i := range edges {
		fmt.Scan(&edges[i].a, &edges[i].b, &edges[i].w)
	}

	sort.Slice(edges, func(i, j int) bool { return edges[i].w < edges[j].w })

	parent = make([]int, n+1)
	for i := 1; i <= n; i++ {
		parent[i] = i
	}

	total := int64(0)
	used := 0
	for _, e := range edges {
		if find(e.a) != find(e.b) { // соединяет разные компоненты
			parent[find(e.a)] = find(e.b)
			total += e.w
			used++
		}
	}

	if used == n-1 {
		fmt.Println("Вес остова:", total)
	} else {
		fmt.Println("Граф несвязный")
	}
}`},
		},

		"dp-basics": {
			{Code: `package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)

	size := n + 1
	if size < 2 {
		size = 2
	}
	dp := make([]int64, size)
	dp[0] = 1
	dp[1] = 1
	for i := 2; i <= n; i++ {
		dp[i] = dp[i-1] + dp[i-2]
	}
	fmt.Println(dp[n])
}`},
			{Code: `package main

import "fmt"

func main() {
	var n int
	fmt.Scan(&n)
	a := make([]int64, n)
	for i := range a {
		fmt.Scan(&a[i])
	}

	best, cur := a[0], a[0]
	for i := 1; i < n; i++ {
		cur = cur + a[i]
		if a[i] > cur { // продолжить или начать заново
			cur = a[i]
		}
		if cur > best {
			best = cur
		}
	}
	fmt.Println(best)
}`},
		},
	}
}
