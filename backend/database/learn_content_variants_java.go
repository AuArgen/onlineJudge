package database

// javaRoadmapVariants returns Java ports of the roadmap code examples for
// levels 1-4 (by levels 5-6 contest practice is dominated by C++/Python).
func javaRoadmapVariants() map[string][]codeVariantSeed {
	return map[string][]codeVariantSeed{
		"complexity-big-o": {
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong(); // введите n до 10^9

        System.out.println("O(log n): ~" + (long) (Math.log(n) / Math.log(2)) + " операций");
        System.out.println("O(n): ~" + n);
        System.out.println("O(n log n): ~" + (long) (n * (Math.log(n) / Math.log(2))));
        System.out.println("O(n^2): ~" + n * n);
        if (n <= 60) System.out.println("O(2^n): ~" + (1L << n));
        else System.out.println("O(2^n): больше, чем атомов во Вселенной");
    }
}`},
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();

        long slow = 0;
        for (long i = 1; i <= n; i++) slow += i;   // O(n)

        long fast = n * (n + 1) / 2;               // O(1)

        System.out.println(slow);
        System.out.println(fast);
    }
}`},
		},

		"implementation-problems": {
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                sb.append((i + j) % 2 == 0 ? '#' : '.');
            }
            sb.append('\n');
        }
        System.out.print(sb);
    }
}`},
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(); // n >= 2
        long[] a = new long[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextLong();

        long best = Math.max(a[0], a[1]);
        long second = Math.min(a[0], a[1]);
        for (int i = 2; i < n; i++) {
            if (a[i] > best) {
                second = best;
                best = a[i];
            } else if (a[i] > second) {
                second = a[i];
            }
        }
        System.out.println(second);
    }
}`},
		},

		"basic-math": {
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        boolean[] isComposite = new boolean[Math.max(n + 1, 2)];
        for (long i = 2; i * i <= n; i++) {
            if (!isComposite[(int) i]) {
                for (long j = i * i; j <= n; j += i) {
                    isComposite[(int) j] = true;
                }
            }
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 2; i <= n; i++) {
            if (!isComposite[i]) sb.append(i).append(' ');
        }
        System.out.println(sb.toString().trim());
    }
}`},
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();

        StringBuilder sb = new StringBuilder();
        for (long d = 2; d * d <= n; d++) {
            while (n % d == 0) {
                sb.append(d).append(' ');
                n /= d;
            }
        }
        if (n > 1) sb.append(n);
        System.out.println(sb.toString().trim());
    }
}`},
		},

		"sorting": {
			{Code: `import java.util.Arrays;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();

        Arrays.sort(a);
        StringBuilder asc = new StringBuilder();
        for (int x : a) asc.append(x).append(' ');
        System.out.println(asc.toString().trim());

        // по убыванию: печатаем отсортированный массив с конца
        StringBuilder desc = new StringBuilder();
        for (int i = n - 1; i >= 0; i--) desc.append(a[i]).append(' ');
        System.out.println(desc.toString().trim());
    }
}`},
			{Code: `import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        ArrayList<String[]> a = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            a.add(new String[]{sc.next(), sc.next()});
        }

        // по убыванию баллов
        a.sort((x, y) -> Integer.parseInt(y[1]) - Integer.parseInt(x[1]));

        for (String[] s : a) System.out.println(s[0] + " " + s[1]);
    }
}`},
		},

		"two-pointers": {
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long target = sc.nextLong();
        long[] a = new long[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextLong(); // массив отсортирован

        int l = 0, r = n - 1;
        while (l < r) {
            long sum = a[l] + a[r];
            if (sum == target) {
                System.out.println(a[l] + " + " + a[r] + " = " + target);
                return;
            }
            if (sum < target) l++;
            else r--;
        }
        System.out.println("Пары нет");
    }
}`},
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long s = sc.nextLong();
        long[] a = new long[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextLong();

        long sum = 0;
        int best = 0, l = 0;
        for (int r = 0; r < n; r++) {
            sum += a[r];
            while (sum > s) {
                sum -= a[l];
                l++;
            }
            best = Math.max(best, r - l + 1);
        }
        System.out.println(best);
    }
}`},
		},

		"prefix-sums": {
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), q = sc.nextInt();

        long[] p = new long[n + 1];
        for (int i = 1; i <= n; i++) {
            p[i] = p[i - 1] + sc.nextLong();
        }

        StringBuilder sb = new StringBuilder();
        while (q-- > 0) {
            int l = sc.nextInt(), r = sc.nextInt(); // границы с единицы
            sb.append(p[r] - p[l - 1]).append('\n');
        }
        System.out.print(sb);
    }
}`},
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), q = sc.nextInt();
        long[] d = new long[n + 2];

        while (q-- > 0) {
            int l = sc.nextInt(), r = sc.nextInt();
            long x = sc.nextLong(); // прибавить x на отрезке [l, r]
            d[l] += x;
            d[r + 1] -= x;
        }

        StringBuilder sb = new StringBuilder();
        long cur = 0;
        for (int i = 1; i <= n; i++) {
            cur += d[i];
            sb.append(cur).append(' ');
        }
        System.out.println(sb.toString().trim());
    }
}`},
		},

		"binary-search": {
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long x = sc.nextLong();
        long[] a = new long[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextLong(); // массив отсортирован

        int l = 0, r = n; // ответ в [l, r): первый индекс, где a[i] >= x
        while (l < r) {
            int mid = (l + r) / 2;
            if (a[mid] >= x) r = mid;
            else l = mid + 1;
        }

        if (l < n && a[l] == x) System.out.println("Первое вхождение: позиция " + (l + 1));
        else System.out.println("Не найден");
    }
}`},
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();

        long l = 0, r = 2000000000L; // ответ где-то в [l, r]
        while (l < r) {
            long mid = (l + r + 1) / 2; // округление вверх!
            if (mid * mid <= n) l = mid; // mid подходит - идём вправо
            else r = mid - 1;
        }
        System.out.println(l);
    }
}`},
		},

		"stack-queue": {
			{Code: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();

        Deque<Character> st = new ArrayDeque<>();
        boolean ok = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                st.push(c);
            } else {
                if (st.isEmpty()) { ok = false; break; }
                char open = st.pop();
                if ((c == ')' && open != '(') ||
                    (c == ']' && open != '[') ||
                    (c == '}' && open != '{')) {
                    ok = false;
                    break;
                }
            }
        }

        System.out.println(ok && st.isEmpty() ? "YES" : "NO");
    }
}`},
			{Code: `import java.util.ArrayDeque;
import java.util.Queue;

public class Main {
    public static void main(String[] args) {
        Queue<String> q = new ArrayDeque<>();
        q.add("Азат");
        q.add("Айгуль");
        q.add("Бек");

        while (!q.isEmpty()) {
            System.out.println(q.poll() + " обслужен");
        }
    }
}`},
		},

		"sets-maps": {
			{Code: `import java.util.HashSet;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        HashSet<Integer> seen = new HashSet<>();
        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            if (seen.contains(x)) {
                System.out.println("Первый повтор: " + x);
                return;
            }
            seen.add(x);
        }
        System.out.println("Повторов нет");
    }
}`},
			{Code: `import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        Map<String, Integer> count = new TreeMap<>();
        for (int i = 0; i < n; i++) {
            String w = sc.next();
            count.put(w, count.getOrDefault(w, 0) + 1);
        }

        for (Map.Entry<String, Integer> e : count.entrySet()) {
            System.out.println(e.getKey() + ": " + e.getValue());
        }
    }
}`},
		},

		"recursion-backtracking": {
			{Code: `import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    static int n;
    static int[] a;
    static ArrayList<Integer> current = new ArrayList<>();
    static StringBuilder out = new StringBuilder();

    static void search(int i) {
        if (i == n) { // база: решение по всем элементам принято
            out.append("{ ");
            for (int x : current) out.append(x).append(' ');
            out.append("}\n");
            return;
        }
        search(i + 1);       // вариант 1: не берём a[i]
        current.add(a[i]);   // вариант 2: берём a[i]
        search(i + 1);
        current.remove(current.size() - 1); // откат - вернуть как было!
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        search(0);
        System.out.print(out);
    }
}`},
			{Code: `import java.util.Arrays;
import java.util.Scanner;

public class Main {
    // классический алгоритм следующей перестановки (как next_permutation в C++)
    static boolean nextPermutation(char[] a) {
        int i = a.length - 2;
        while (i >= 0 && a[i] >= a[i + 1]) i--;
        if (i < 0) return false;
        int j = a.length - 1;
        while (a[j] <= a[i]) j--;
        char t = a[i]; a[i] = a[j]; a[j] = t;
        for (int l = i + 1, r = a.length - 1; l < r; l++, r--) {
            t = a[l]; a[l] = a[r]; a[r] = t;
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        char[] s = sc.next().toCharArray();
        Arrays.sort(s); // начать с наименьшей перестановки

        StringBuilder out = new StringBuilder();
        do {
            out.append(new String(s)).append('\n');
        } while (nextPermutation(s));
        System.out.print(out);
    }
}`},
		},

		"greedy": {
			{Code: `import java.util.Arrays;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] seg = new int[n][2]; // {конец, начало} - для сортировки по концу
        for (int i = 0; i < n; i++) {
            seg[i][1] = sc.nextInt();
            seg[i][0] = sc.nextInt();
        }

        Arrays.sort(seg, (x, y) -> x[0] - y[0]);

        int count = 0;
        int lastEnd = -1000000000;
        for (int[] s : seg) {
            if (s[1] >= lastEnd) { // начало не раньше конца последнего взятого
                count++;
                lastEnd = s[0];
            }
        }
        System.out.println(count);
    }
}`},
		},

		"dsu": {
			{Code: `import java.util.Scanner;

public class Main {
    static int[] parent, rnk;

    static int find(int v) {
        if (parent[v] == v) return v;
        return parent[v] = find(parent[v]); // сжатие пути
    }

    static void unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return;
        if (rnk[a] < rnk[b]) { int t = a; a = b; b = t; }
        parent[b] = a;
        if (rnk[a] == rnk[b]) rnk[a]++;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), q = sc.nextInt();
        parent = new int[n + 1];
        rnk = new int[n + 1];
        for (int i = 1; i <= n; i++) parent[i] = i;

        StringBuilder out = new StringBuilder();
        while (q-- > 0) {
            String type = sc.next();
            int a = sc.nextInt(), b = sc.nextInt();
            if (type.equals("union")) {
                unite(a, b);
            } else {
                out.append(find(a) == find(b) ? "YES" : "NO").append('\n');
            }
        }
        System.out.print(out);
    }
}`},
		},

		"graphs-bfs-dfs": {
			{Code: `import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    static ArrayList<ArrayList<Integer>> g = new ArrayList<>();
    static boolean[] visited;

    static void dfs(int v) {
        visited[v] = true;
        for (int to : g.get(v)) {
            if (!visited[to]) dfs(to);
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        for (int i = 0; i <= n; i++) g.add(new ArrayList<>());
        visited = new boolean[n + 1];

        for (int i = 0; i < m; i++) {
            int a = sc.nextInt(), b = sc.nextInt();
            g.get(a).add(b);
            g.get(b).add(a); // неориентированный граф
        }

        int components = 0;
        for (int v = 1; v <= n; v++) {
            if (!visited[v]) {
                components++;
                dfs(v);
            }
        }
        System.out.println(components);
    }
}`},
			{Code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Queue;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        ArrayList<ArrayList<Integer>> g = new ArrayList<>();
        for (int i = 0; i <= n; i++) g.add(new ArrayList<>());
        for (int i = 0; i < m; i++) {
            int a = sc.nextInt(), b = sc.nextInt();
            g.get(a).add(b);
            g.get(b).add(a);
        }

        int[] dist = new int[n + 1];
        java.util.Arrays.fill(dist, -1);
        Queue<Integer> q = new ArrayDeque<>();
        dist[1] = 0;
        q.add(1);

        while (!q.isEmpty()) {
            int v = q.poll();
            for (int to : g.get(v)) {
                if (dist[to] == -1) {
                    dist[to] = dist[v] + 1;
                    q.add(to);
                }
            }
        }

        for (int v = 1; v <= n; v++) {
            System.out.println("до " + v + ": " + dist[v]);
        }
    }
}`},
		},

		"shortest-paths": {
			{Code: `import java.util.ArrayList;
import java.util.PriorityQueue;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        ArrayList<ArrayList<long[]>> g = new ArrayList<>();
        for (int i = 0; i <= n; i++) g.add(new ArrayList<>());
        for (int i = 0; i < m; i++) {
            int a = sc.nextInt(), b = sc.nextInt();
            long w = sc.nextLong();
            g.get(a).add(new long[]{b, w});
            g.get(b).add(new long[]{a, w});
        }

        final long INF = (long) 1e18;
        long[] dist = new long[n + 1];
        java.util.Arrays.fill(dist, INF);
        dist[1] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
        pq.add(new long[]{0, 1});

        while (!pq.isEmpty()) {
            long[] top = pq.poll();
            long d = top[0];
            int v = (int) top[1];
            if (d > dist[v]) continue; // устаревшая запись - пропускаем

            for (long[] e : g.get(v)) {
                int to = (int) e[0];
                long w = e[1];
                if (dist[v] + w < dist[to]) {
                    dist[to] = dist[v] + w;
                    pq.add(new long[]{dist[to], to});
                }
            }
        }

        for (int v = 1; v <= n; v++) {
            System.out.println("до " + v + ": " + dist[v]);
        }
    }
}`},
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        final long INF = (long) 1e18;
        long[][] d = new long[n + 1][n + 1];
        for (int i = 1; i <= n; i++) {
            java.util.Arrays.fill(d[i], INF);
            d[i][i] = 0;
        }

        for (int i = 0; i < m; i++) {
            int a = sc.nextInt(), b = sc.nextInt();
            long w = sc.nextLong();
            d[a][b] = Math.min(d[a][b], w);
            d[b][a] = Math.min(d[b][a], w);
        }

        for (int k = 1; k <= n; k++)
            for (int i = 1; i <= n; i++)
                for (int j = 1; j <= n; j++)
                    if (d[i][k] + d[k][j] < d[i][j])
                        d[i][j] = d[i][k] + d[k][j];

        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                sb.append(d[i][j] >= INF ? -1 : d[i][j]).append(' ');
            }
            sb.append('\n');
        }
        System.out.print(sb);
    }
}`},
		},

		"mst": {
			{Code: `import java.util.Arrays;
import java.util.Scanner;

public class Main {
    static int[] parent;

    static int find(int v) {
        if (parent[v] == v) return v;
        return parent[v] = find(parent[v]);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();

        long[][] edges = new long[m][3]; // {вес, a, b}
        for (int i = 0; i < m; i++) {
            edges[i][1] = sc.nextInt();
            edges[i][2] = sc.nextInt();
            edges[i][0] = sc.nextLong();
        }

        Arrays.sort(edges, (x, y) -> Long.compare(x[0], y[0]));

        parent = new int[n + 1];
        for (int i = 1; i <= n; i++) parent[i] = i;

        long total = 0;
        int used = 0;
        for (long[] e : edges) {
            int a = (int) e[1], b = (int) e[2];
            if (find(a) != find(b)) { // соединяет разные компоненты
                parent[find(a)] = find(b);
                total += e[0];
                used++;
            }
        }

        if (used == n - 1) System.out.println("Вес остова: " + total);
        else System.out.println("Граф несвязный");
    }
}`},
		},

		"dp-basics": {
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        long[] dp = new long[Math.max(n + 1, 2)];
        dp[0] = 1;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        System.out.println(dp[n]);
    }
}`},
			{Code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] a = new long[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextLong();

        long best = a[0], cur = a[0];
        for (int i = 1; i < n; i++) {
            cur = Math.max(a[i], cur + a[i]); // продолжить или начать заново
            best = Math.max(best, cur);
        }
        System.out.println(best);
    }
}`},
		},
	}
}
