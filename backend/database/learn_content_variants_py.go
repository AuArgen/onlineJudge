package database

// pythonRoadmapVariants returns Python ports of the roadmap lessons' code
// examples, aligned to each lesson's code blocks by position. Output format
// matches the C++ originals exactly, so the same sample input produces the
// same result in every language tab.
func pythonRoadmapVariants() map[string][]codeVariantSeed {
	return map[string][]codeVariantSeed{
		"complexity-big-o": {
			{Code: `import math

n = int(input())  # введите n до 10^9

print("O(log n): ~" + str(int(math.log2(n))) + " операций")
print("O(n): ~" + str(n))
print("O(n log n): ~" + str(int(n * math.log2(n))))
print("O(n^2): ~" + str(n * n))
if n <= 60:
    print("O(2^n): ~" + str(2 ** n))
else:
    print("O(2^n): больше, чем атомов во Вселенной")`},
			{Code: `n = int(input())  # для Python вводите до 10^7: язык в десятки раз медленнее C++

slow = 0
for i in range(1, n + 1):  # O(n)
    slow += i

fast = n * (n + 1) // 2    # O(1)

print(slow)
print(fast)`, Sample: "10000000"},
		},

		"implementation-problems": {
			{Code: `n, m = map(int, input().split())

for i in range(n):
    row = ""
    for j in range(m):
        row += "#" if (i + j) % 2 == 0 else "."
    print(row)`},
			{Code: `n = int(input())  # n >= 2
a = list(map(int, input().split()))

best = max(a[0], a[1])
second = min(a[0], a[1])
for x in a[2:]:
    if x > best:
        second = best
        best = x
    elif x > second:
        second = x
print(second)`},
		},

		"basic-math": {
			{Code: `n = int(input())

is_prime = [True] * max(n + 1, 2)
is_prime[0] = is_prime[1] = False
i = 2
while i * i <= n:
    if is_prime[i]:
        for j in range(i * i, n + 1, i):
            is_prime[j] = False
    i += 1

print(" ".join(str(i) for i in range(2, n + 1) if is_prime[i]))`},
			{Code: `n = int(input())

factors = []
d = 2
while d * d <= n:
    while n % d == 0:
        factors.append(d)
        n //= d
    d += 1
if n > 1:
    factors.append(n)
print(" ".join(map(str, factors)))`},
		},

		"sorting": {
			{Code: `n = int(input())
a = list(map(int, input().split()))

a.sort()
print(" ".join(map(str, a)))

a.sort(reverse=True)
print(" ".join(map(str, a)))`},
		},

		"two-pointers": {
			{Code: `n, target = map(int, input().split())
a = list(map(int, input().split()))  # массив отсортирован

l, r = 0, n - 1
found = False
while l < r:
    s = a[l] + a[r]
    if s == target:
        print(a[l], "+", a[r], "=", target)
        found = True
        break
    if s < target:
        l += 1
    else:
        r -= 1
if not found:
    print("Пары нет")`},
			{Code: `n, s = map(int, input().split())
a = list(map(int, input().split()))

total = 0
best = 0
l = 0
for r in range(n):
    total += a[r]
    while total > s:
        total -= a[l]
        l += 1
    best = max(best, r - l + 1)
print(best)`},
		},

		"prefix-sums": {
			{Code: `n, q = map(int, input().split())
a = list(map(int, input().split()))

p = [0] * (n + 1)
for i in range(1, n + 1):
    p[i] = p[i - 1] + a[i - 1]

for _ in range(q):
    l, r = map(int, input().split())  # границы с единицы
    print(p[r] - p[l - 1])`},
			{Code: `n, q = map(int, input().split())
d = [0] * (n + 2)

for _ in range(q):
    l, r, x = map(int, input().split())  # прибавить x на отрезке [l, r]
    d[l] += x
    d[r + 1] -= x

cur = 0
res = []
for i in range(1, n + 1):
    cur += d[i]
    res.append(str(cur))
print(" ".join(res))`},
		},

		"binary-search": {
			{Code: `n, x = map(int, input().split())
a = list(map(int, input().split()))  # массив отсортирован

l, r = 0, n  # ответ в [l, r): первый индекс, где a[i] >= x
while l < r:
    mid = (l + r) // 2
    if a[mid] >= x:
        r = mid
    else:
        l = mid + 1

if l < n and a[l] == x:
    print("Первое вхождение: позиция", l + 1)
else:
    print("Не найден")`},
			{Code: `n = int(input())

l, r = 0, 2 * 10 ** 9  # ответ где-то в [l, r]
while l < r:
    mid = (l + r + 1) // 2  # округление вверх!
    if mid * mid <= n:
        l = mid              # mid подходит - идём вправо
    else:
        r = mid - 1
print(l)`},
		},

		"stack-queue": {
			{Code: `s = input()

stack = []
pairs = {")": "(", "]": "[", "}": "{"}
ok = True
for c in s:
    if c in "([{":
        stack.append(c)
    else:
        if not stack or stack.pop() != pairs[c]:
            ok = False
            break

print("YES" if ok and not stack else "NO")`},
			{Code: `from collections import deque

q = deque(["Азат", "Айгуль", "Бек"])

while q:
    print(q.popleft(), "обслужен")`},
		},

		"sets-maps": {
			{Code: `n = int(input())
nums = list(map(int, input().split()))

seen = set()
found = False
for x in nums:
    if x in seen:
        print("Первый повтор:", x)
        found = True
        break
    seen.add(x)
if not found:
    print("Повторов нет")`},
			{Code: `n = int(input())
words = input().split()

count = {}
for w in words:
    count[w] = count.get(w, 0) + 1

for w in sorted(count):
    print(w + ": " + str(count[w]))`},
		},

		"recursion-backtracking": {
			{Code: `n = int(input())
a = list(map(int, input().split()))
current = []

def search(i):
    if i == n:  # база: решение по всем элементам принято
        line = "{ "
        for x in current:
            line += str(x) + " "
        print(line + "}")
        return
    search(i + 1)         # вариант 1: не берём a[i]
    current.append(a[i])  # вариант 2: берём a[i]
    search(i + 1)
    current.pop()         # откат - вернуть как было!

search(0)`},
			{Code: `from itertools import permutations

s = input()
# set убирает дубликаты при повторяющихся буквах, sorted даёт
# лексикографический порядок - как next_permutation в C++
for p in sorted(set(permutations(sorted(s)))):
    print("".join(p))`},
		},

		"greedy": {
			{Code: `n = int(input())
seg = []
for _ in range(n):
    start, end = map(int, input().split())
    seg.append((end, start))

seg.sort()  # по концу

count = 0
last_end = -10 ** 9
for end, start in seg:
    if start >= last_end:  # начало не раньше конца последнего взятого
        count += 1
        last_end = end
print(count)`},
		},

		"dsu": {
			{Code: `import sys
input = sys.stdin.readline

n, q = map(int, input().split())
parent = list(range(n + 1))
rank = [0] * (n + 1)

def find(v):
    while parent[v] != v:
        parent[v] = parent[parent[v]]  # сжатие пути
        v = parent[v]
    return v

def unite(a, b):
    a, b = find(a), find(b)
    if a == b:
        return
    if rank[a] < rank[b]:
        a, b = b, a
    parent[b] = a
    if rank[a] == rank[b]:
        rank[a] += 1

for _ in range(q):
    t, a, b = input().split()
    a, b = int(a), int(b)
    if t == "union":
        unite(a, b)
    else:
        print("YES" if find(a) == find(b) else "NO")`},
		},

		"graphs-bfs-dfs": {
			{Code: `import sys
sys.setrecursionlimit(300000)
input = sys.stdin.readline

n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    a, b = map(int, input().split())
    g[a].append(b)
    g[b].append(a)  # неориентированный граф

visited = [False] * (n + 1)

def dfs(v):
    visited[v] = True
    for to in g[v]:
        if not visited[to]:
            dfs(to)

components = 0
for v in range(1, n + 1):
    if not visited[v]:
        components += 1
        dfs(v)
print(components)`},
			{Code: `from collections import deque

n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    a, b = map(int, input().split())
    g[a].append(b)
    g[b].append(a)

dist = [-1] * (n + 1)
dist[1] = 0
q = deque([1])
while q:
    v = q.popleft()
    for to in g[v]:
        if dist[to] == -1:
            dist[to] = dist[v] + 1
            q.append(to)

for v in range(1, n + 1):
    print("до " + str(v) + ": " + str(dist[v]))`},
		},

		"shortest-paths": {
			{Code: `import heapq

n, m = map(int, input().split())
g = [[] for _ in range(n + 1)]
for _ in range(m):
    a, b, w = map(int, input().split())
    g[a].append((b, w))
    g[b].append((a, w))

INF = 10 ** 18
dist = [INF] * (n + 1)
dist[1] = 0
pq = [(0, 1)]

while pq:
    d, v = heapq.heappop(pq)
    if d > dist[v]:
        continue  # устаревшая запись - пропускаем
    for to, w in g[v]:
        if d + w < dist[to]:
            dist[to] = d + w
            heapq.heappush(pq, (dist[to], to))

for v in range(1, n + 1):
    print("до " + str(v) + ": " + str(dist[v]))`},
			{Code: `n, m = map(int, input().split())
INF = 10 ** 18
d = [[INF] * (n + 1) for _ in range(n + 1)]
for v in range(1, n + 1):
    d[v][v] = 0

for _ in range(m):
    a, b, w = map(int, input().split())
    d[a][b] = min(d[a][b], w)
    d[b][a] = min(d[b][a], w)

for k in range(1, n + 1):
    for i in range(1, n + 1):
        for j in range(1, n + 1):
            if d[i][k] + d[k][j] < d[i][j]:
                d[i][j] = d[i][k] + d[k][j]

for i in range(1, n + 1):
    row = []
    for j in range(1, n + 1):
        row.append("-1" if d[i][j] >= INF else str(d[i][j]))
    print(" ".join(row))`},
		},

		"mst": {
			{Code: `n, m = map(int, input().split())
edges = []
for _ in range(m):
    a, b, w = map(int, input().split())
    edges.append((w, a, b))
edges.sort()

parent = list(range(n + 1))

def find(v):
    while parent[v] != v:
        parent[v] = parent[parent[v]]
        v = parent[v]
    return v

total = 0
used = 0
for w, a, b in edges:
    ra, rb = find(a), find(b)
    if ra != rb:  # соединяет разные компоненты
        parent[ra] = rb
        total += w
        used += 1

if used == n - 1:
    print("Вес остова:", total)
else:
    print("Граф несвязный")`},
		},

		"dp-basics": {
			{Code: `n = int(input())

dp = [0] * max(n + 1, 2)
dp[0] = 1
dp[1] = 1
for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]
print(dp[n])`},
			{Code: `n = int(input())
a = list(map(int, input().split()))

best = cur = a[0]
for x in a[1:]:
    cur = max(x, cur + x)  # продолжить или начать заново
    best = max(best, cur)
print(best)`},
		},

		"dp-advanced": {
			{Code: `n, W = map(int, input().split())
items = []
for _ in range(n):
    w, cost = map(int, input().split())
    items.append((w, cost))

dp = [0] * (W + 1)
for w, cost in items:
    for cap in range(W, w - 1, -1):  # строго сверху вниз!
        dp[cap] = max(dp[cap], dp[cap - w] + cost)
print(dp[W])`},
			{Code: `import bisect

n = int(input())
a = list(map(int, input().split()))

tail = []
for x in a:
    pos = bisect.bisect_left(tail, x)
    if pos == len(tail):
        tail.append(x)   # продлеваем
    else:
        tail[pos] = x    # улучшаем конец
print(len(tail))`},
		},

		"segment-tree": {
			{Code: `import sys
input = sys.stdin.readline

n, q = map(int, input().split())
tree = [0] * (4 * n)

def update(v, tl, tr, pos, val):
    if tl == tr:
        tree[v] = val
        return
    tm = (tl + tr) // 2
    if pos <= tm:
        update(2 * v, tl, tm, pos, val)
    else:
        update(2 * v + 1, tm + 1, tr, pos, val)
    tree[v] = tree[2 * v] + tree[2 * v + 1]

def query(v, tl, tr, l, r):
    if r < tl or tr < l:
        return 0          # отрезки не пересекаются
    if l <= tl and tr <= r:
        return tree[v]    # отрезок дерева целиком внутри
    tm = (tl + tr) // 2
    return query(2 * v, tl, tm, l, r) + query(2 * v + 1, tm + 1, tr, l, r)

a = list(map(int, input().split()))
for i in range(1, n + 1):
    update(1, 1, n, i, a[i - 1])

for _ in range(q):
    parts = input().split()
    if parts[0] == "set":
        update(1, 1, n, int(parts[1]), int(parts[2]))
    else:
        print(query(1, 1, n, int(parts[1]), int(parts[2])))`},
		},

		"string-algorithms": {
			{Code: `line = input().split()
s, q = line[0], int(line[1])

MOD = 10 ** 9 + 7
P = 31
n = len(s)
h = [0] * (n + 1)
pw = [1] * (n + 1)
for i in range(n):
    h[i + 1] = (h[i] * P + (ord(s[i]) - ord("a") + 1)) % MOD
    pw[i + 1] = pw[i] * P % MOD

def get(l, r):  # хеш подстроки [l, r] в 1-индексации
    return (h[r] - h[l - 1] * pw[r - l + 1]) % MOD

for _ in range(q):
    l1, r1, l2, r2 = map(int, input().split())
    print("YES" if get(l1, r1) == get(l2, r2) else "NO")`},
			{Code: `text, pattern = input().split()

s = pattern + "#" + text
n = len(s)
m = len(pattern)

pi = [0] * n
for i in range(1, n):
    j = pi[i - 1]
    while j > 0 and s[i] != s[j]:
        j = pi[j - 1]
    if s[i] == s[j]:
        j += 1
    pi[i] = j

found = False
for i in range(n):
    if pi[i] == m:
        print("Вхождение с позиции", i - 2 * m + 1)
        found = True
if not found:
    print("Вхождений нет")`},
		},

		"number-theory": {
			{Code: `MOD = 10 ** 9 + 7

def binpow(a, b):
    res = 1
    a %= MOD
    while b > 0:
        if b & 1:
            res = res * a % MOD
        a = a * a % MOD
        b >>= 1
    return res

n, k = map(int, input().split())

fact = [1] * (n + 1)
for i in range(1, n + 1):
    fact[i] = fact[i - 1] * i % MOD

# C(n, k) = n! * (k!)^-1 * ((n-k)!)^-1
# в Python есть и встроенное pow(a, b, MOD) - это то же самое
inv_k = binpow(fact[k], MOD - 2)
inv_nk = binpow(fact[n - k], MOD - 2)
print(fact[n] * inv_k % MOD * inv_nk % MOD)`},
		},

		"network-flows": {
			{Code: `from collections import deque

n, m = map(int, input().split())
INF = 10 ** 18
cap = [[0] * (n + 1) for _ in range(n + 1)]
g = [[] for _ in range(n + 1)]

for _ in range(m):
    a, b, c = map(int, input().split())
    if cap[a][b] == 0 and cap[b][a] == 0:
        g[a].append(b)
        g[b].append(a)  # обратное ребро для остаточной сети
    cap[a][b] += c

def bfs():
    parent = [-1] * (n + 1)
    parent[1] = 1
    q = deque([(1, INF)])
    while q:
        v, flow = q.popleft()
        for to in g[v]:
            if parent[to] == -1 and cap[v][to] > 0:
                parent[to] = v
                nf = min(flow, cap[v][to])
                if to == n:
                    return nf, parent
                q.append((to, nf))
    return 0, parent

flow = 0
while True:
    add, parent = bfs()
    if add == 0:
        break
    flow += add
    v = n
    while v != 1:
        p = parent[v]
        cap[p][v] -= add
        cap[v][p] += add
        v = p
print("Максимальный поток:", flow)`},
		},

		"suffix-structures": {
			{Code: `s = input() + "$"  # терминальный символ меньше всех букв
n = len(s)

# Для наглядности сортируем суффиксы напрямую. На больших строках так
# нельзя - используйте сортировку по степеням двойки, как в версии на C++.
order = sorted(range(n), key=lambda i: s[i:])

print("Суффиксы по алфавиту:")
for i in order[1:]:  # пропускаем суффикс из одного $
    print(s[i:-1])`},
		},

		"computational-geometry": {
			{Code: `n = int(input())
pts = [tuple(map(int, input().split())) for _ in range(n)]

area2 = 0  # удвоенная площадь
for i in range(n):
    x1, y1 = pts[i]
    x2, y2 = pts[(i + 1) % n]
    area2 += x1 * y2 - x2 * y1
area2 = abs(area2)

print(str(area2 // 2) + (".5" if area2 % 2 == 1 else ""))`},
			{Code: `n = int(input())
pts = [tuple(map(int, input().split())) for _ in range(n)]
pts.sort()

def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

hull = []
for _ in range(2):  # нижняя, затем верхняя цепочка
    start = len(hull)
    for p in pts:
        while len(hull) >= start + 2 and cross(hull[-2], hull[-1], p) <= 0:
            hull.pop()
        hull.append(p)
    hull.pop()  # крайняя точка попадёт в начало следующей цепочки
    pts.reverse()

print("Вершины выпуклой оболочки:")
for x, y in hull:
    print(x, y)`},
		},
	}
}
