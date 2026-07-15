package database

// addRoadmapLevel56Content seeds olympiad roadmap lessons for levels 5-6:
// advanced DP, segment trees, strings, number theory, flows, suffix
// structures, and computational geometry.
func addRoadmapLevel56Content(m map[string]lessonContentSeed) {
	// ── Level 5. Advanced topics ────────────────────────────────────────────

	m["dp-advanced"] = lessonContentSeed{
		Summary: "Классические ДП: рюкзак 0/1 за O(n·W) и наибольшая возрастающая подпоследовательность за O(n log n).",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Уровень выше — ДП с двумя параметрами и ДП с оптимизациями. Разберём две задачи, которые обязан знать каждый олимпиадник.

Рюкзак 0/1: n предметов с весом и ценностью, рюкзак вместимостью W; каждый предмет берётся один раз; максимизировать ценность.

Состояние: dp[cap] — максимальная ценность при вместимости cap. Для каждого предмета обновляем dp: либо не берём (ничего не меняется), либо берём — тогда dp[cap] = dp[cap - w] + cost.

Тонкость, ради которой задачу и разбирают: внутренний цикл по вместимости идёт СВЕРХУ ВНИЗ. Иначе предмет успеет «положиться» дважды в одном проходе.`},
			{Type: "code", Language: "cpp", Caption: "Рюкзак 0/1. Введите: 4 8, затем пары «вес ценность»: 3 4, 4 5, 5 6, 2 3", Content: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int n, W;
    std::cin >> n >> W;
    std::vector<int> w(n), cost(n);
    for (int i = 0; i < n; i++) std::cin >> w[i] >> cost[i];

    std::vector<long long> dp(W + 1, 0);
    for (int i = 0; i < n; i++) {
        for (int cap = W; cap >= w[i]; cap--) { // строго сверху вниз!
            dp[cap] = std::max(dp[cap], dp[cap - w[i]] + cost[i]);
        }
    }
    std::cout << dp[W] << "\n";
    return 0;
}`},
			{Type: "text", Content: `Ответ на примере: 10 (предметы весом 3 и 5: ценности 4 + 6). Сложность O(n·W) — обратите внимание: она зависит от ЧИСЛЕННОГО значения вместимости, поэтому рюкзак хорош при W до миллионов, но бессилен при W = 10¹⁸.

Вторая классика — наибольшая возрастающая подпоследовательность (LIS). Наивное ДП за O(n²) все знают; олимпиадная версия — O(n log n): держим массив tail, где tail[k] — минимально возможный конец возрастающей подпоследовательности длины k+1. Каждый новый элемент либо продлевает лучшую подпоследовательность, либо улучшает чей-то конец — позиция ищется бинарным поиском.`},
			{Type: "code", Language: "cpp", Caption: "LIS за O(n log n). Введите: 8, затем 10 9 2 5 3 7 101 18", Content: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int n;
    std::cin >> n;
    std::vector<long long> a(n);
    for (auto &x : a) std::cin >> x;

    std::vector<long long> tail;
    for (long long x : a) {
        auto it = std::lower_bound(tail.begin(), tail.end(), x);
        if (it == tail.end()) tail.push_back(x); // продлеваем
        else *it = x;                            // улучшаем конец
    }
    std::cout << tail.size() << "\n";
    return 0;
}`},
			{Type: "text", Content: `Ответ на примере: 4 (например, 2 3 7 18). Важно понимать: tail — НЕ сама подпоследовательность, а только «лучшие концы»; но её длина всегда равна длине LIS.

Как придумывать состояния ДП: спросите себя, какой МИНИМУМ информации о префиксе решения достаточно, чтобы продолжать оптимально. Это и есть параметры состояния.

Задание: выведите не длину LIS, а саму подпоследовательность (храните для каждого элемента, кого он продлил).

Отметьте урок пройденным.`},
		},
	}

	m["segment-tree"] = lessonContentSeed{
		Summary: "Дерево отрезков: сумма на отрезке и обновление точки за O(log n).",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Префиксные суммы отвечают на «сумму на отрезке» за O(1), но ломаются, как только массив начинает МЕНЯТЬСЯ: одно обновление — пересчёт всех префиксов.

Дерево отрезков делает и запрос, и обновление за O(log n). Идея: над массивом строится двоичное дерево; каждая вершина хранит сумму своего отрезка. Корень — сумма всего массива, листья — отдельные элементы.

• обновление элемента затрагивает только вершины на пути от листа к корню — их O(log n);
• запрос [l, r] разбивается на O(log n) готовых отрезков дерева.`},
			{Type: "code", Language: "cpp", Caption: "Введите: 5 3, массив 1 2 3 4 5, затем: sum 2 4 / set 3 10 / sum 2 4", Content: `#include <iostream>
#include <vector>
#include <string>

int n;
std::vector<long long> tree;

void update(int v, int tl, int tr, int pos, long long val) {
    if (tl == tr) {
        tree[v] = val;
        return;
    }
    int tm = (tl + tr) / 2;
    if (pos <= tm) update(2 * v, tl, tm, pos, val);
    else update(2 * v + 1, tm + 1, tr, pos, val);
    tree[v] = tree[2 * v] + tree[2 * v + 1];
}

long long query(int v, int tl, int tr, int l, int r) {
    if (r < tl || tr < l) return 0;          // отрезки не пересекаются
    if (l <= tl && tr <= r) return tree[v];  // отрезок дерева целиком внутри
    int tm = (tl + tr) / 2;
    return query(2 * v, tl, tm, l, r) + query(2 * v + 1, tm + 1, tr, l, r);
}

int main() {
    int q;
    std::cin >> n >> q;
    tree.assign(4 * n, 0);

    for (int i = 1; i <= n; i++) {
        long long x;
        std::cin >> x;
        update(1, 1, n, i, x);
    }

    while (q--) {
        std::string type;
        std::cin >> type;
        if (type == "set") {
            int pos;
            long long val;
            std::cin >> pos >> val;
            update(1, 1, n, pos, val);
        } else {
            int l, r;
            std::cin >> l >> r;
            std::cout << query(1, 1, n, l, r) << "\n";
        }
    }
    return 0;
}`},
			{Type: "text", Content: `Запустите пример: сумма [2,4] сначала 9, после set 3 10 становится 16.

Как читать код:

• вершина v отвечает за отрезок [tl, tr]; дети — половины отрезка, номера 2v и 2v+1;
• массив tree размером 4n гарантированно вмещает всё дерево;
• query возвращает 0 для непересекающихся отрезков — ноль нейтрален для суммы.

Дерево отрезков — конструктор: замените + на min или max (и нейтральный элемент на бесконечность) — получите запросы минимума/максимума. Продвинутая версия с «ленивыми» обновлениями умеет менять целые отрезки за O(log n) — изучите её, когда встретите такую задачу.`},
			{Type: "text", Content: `Задание: переделайте дерево на МАКСИМУМ на отрезке (три правки: операция, нейтральный элемент, вывод) и проверьте на своём примере.

Отметьте урок пройденным.`},
		},
	}

	m["string-algorithms"] = lessonContentSeed{
		Summary: "Полиномиальные хеши для сравнения подстрок за O(1) и префикс-функция (KMP) для поиска образца.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Сравнивать подстроки посимвольно — O(n) на сравнение. Два инструмента снимают это ограничение.

Полиномиальный хеш: строке сопоставляется число h = s[0]·p^(k-1) + s[1]·p^(k-2) + ... по модулю. Предпосчитав префиксные хеши и степени p, хеш ЛЮБОЙ подстроки достаётся за O(1) — и равные подстроки имеют равные хеши. Разные подстроки теоретически могут совпасть хешем (коллизия), но при модуле ~10⁹ вероятность ничтожна, а для параноиков есть двойной хеш.`},
			{Type: "code", Language: "cpp", Caption: "Сравнение подстрок хешами. Введите: abacaba 2, затем запросы «l1 r1 l2 r2»: 1 3 5 7 и 1 2 2 3", Content: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::string s;
    int q;
    std::cin >> s >> q;

    const long long MOD = 1000000007LL, P = 31;
    int n = s.size();
    std::vector<long long> h(n + 1, 0), pw(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h[i + 1] = (h[i] * P + (s[i] - 'a' + 1)) % MOD;
        pw[i + 1] = pw[i] * P % MOD;
    }

    // хеш подстроки [l, r] в 1-индексации
    auto get = [&](int l, int r) {
        return ((h[r] - h[l - 1] * pw[r - l + 1]) % MOD + MOD) % MOD;
    };

    while (q--) {
        int l1, r1, l2, r2;
        std::cin >> l1 >> r1 >> l2 >> r2;
        std::cout << (get(l1, r1) == get(l2, r2) ? "YES" : "NO") << "\n";
    }
    return 0;
}`},
			{Type: "text", Content: `На примере: подстроки [1,3] и [5,7] строки abacaba — обе «aba» (YES), а [1,2] и [2,3] — «ab» и «ba» (NO).

Второй инструмент — префикс-функция: pi[i] — длина наибольшего собственного префикса строки, который одновременно её суффикс в позиции i. Считается за O(n) и лежит в основе алгоритма КМП: чтобы найти образец в тексте, склейте «образец # текст» и ищите позиции, где pi равна длине образца.`},
			{Type: "code", Language: "cpp", Caption: "КМП: все вхождения образца. Введите: ababcab ab", Content: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::string text, pattern;
    std::cin >> text >> pattern;

    std::string s = pattern + "#" + text;
    int n = s.size();
    int m = pattern.size();

    std::vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j]) j++;
        pi[i] = j;
    }

    bool found = false;
    for (int i = 0; i < n; i++) {
        if (pi[i] == m) {
            std::cout << "Вхождение с позиции " << i - 2 * m + 1 << "\n";
            found = true;
        }
    }
    if (!found) std::cout << "Вхождений нет\n";
    return 0;
}`},
			{Type: "text", Content: `На примере образец ab находится в ababcab на позициях 1, 3 и 6.

Сердце алгоритма — цикл while j = pi[j-1]: при несовпадении мы не начинаем сначала, а откатываемся к следующему кандидату-префиксу. Суммарно указатель j уменьшается не больше, чем увеличивается, — отсюда O(n).

Задание: с помощью префикс-функции найдите наименьший период строки (подсказка: n - pi[n-1], если n делится на это значение).

Отметьте урок пройденным.`},
		},
	}

	m["number-theory"] = lessonContentSeed{
		Summary: "Модульная арифметика: быстрое возведение в степень, обратный элемент и C(n,k) по модулю.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Ответы комбинаторных задач часто астрономические, поэтому их просят «по модулю 10⁹ + 7». Работать с остатками можно почти как с числами:

• (a + b) % m, (a · b) % m — берите остаток после каждой операции;
• вычитание: ((a - b) % m + m) % m — чтобы не уйти в минус;
• деления в модульной арифметике НЕТ — вместо него умножение на обратный элемент.

Быстрое возведение в степень: a^b за O(log b) — возводим в квадрат и разбираем биты показателя. По малой теореме Ферма при простом m обратный элемент a⁻¹ = a^(m-2) — то самое быстрое возведение.`},
			{Type: "code", Language: "cpp", Caption: "C(n, k) по модулю через факториалы и обратные. Введите: 10 3", Content: `#include <iostream>
#include <vector>

const long long MOD = 1000000007LL;

long long binpow(long long a, long long b) {
    long long res = 1;
    a %= MOD;
    while (b > 0) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

int main() {
    long long n, k;
    std::cin >> n >> k;

    std::vector<long long> fact(n + 1, 1);
    for (long long i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;

    // C(n, k) = n! * (k!)^-1 * ((n-k)!)^-1
    long long invK = binpow(fact[k], MOD - 2);
    long long invNK = binpow(fact[n - k], MOD - 2);
    long long c = fact[n] * invK % MOD * invNK % MOD;

    std::cout << c << "\n";
    return 0;
}`},
			{Type: "text", Content: `Проверка: C(10, 3) = 120.

Разбор binpow: пока показатель не ноль, смотрим на младший бит (b & 1): если бит установлен — домножаем результат; затем возводим основание в квадрат и сдвигаем показатель (b >>= 1). Для b = 10¹⁸ — всего 60 итераций.

Джентльменский набор теории чисел, который стоит освоить дальше:

• расширенный алгоритм Евклида (обратный элемент по НЕпростому модулю);
• функция Эйлера;
• китайская теорема об остатках.`},
			{Type: "text", Content: `Задание: посчитайте 2^n mod (10⁹+7) для n = 10¹⁸ (одна строка с binpow) и число сочетаний C(1000, 500) по модулю.

Отметьте урок пройденным — Уровень 5 завершён!`},
		},
	}

	// ── Level 6. Expert topics ──────────────────────────────────────────────

	m["network-flows"] = lessonContentSeed{
		Summary: "Максимальный поток: теорема о разрезе, алгоритм Эдмондса-Карпа и приложения к паросочетаниям.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Сеть — ориентированный граф, где у каждого ребра есть пропускная способность. Максимальный поток — сколько «жидкости» можно прогнать из истока s в сток t.

Фундаментальная теорема (Форда-Фалкерсона): максимальный поток равен минимальному разрезу — минимальной суммарной пропускной способности рёбер, удаление которых отделяет s от t. Поэтому потоками решаются задачи и про «сколько прогнать», и про «что перерезать».

Алгоритм Эдмондса-Карпа: пока существует путь из s в t с положительными остаточными пропускными способностями (ищем его BFS), пускаем по нему поток и обновляем ОСТАТОЧНУЮ сеть: прямые рёбра уменьшаем, обратные увеличиваем. Обратные рёбра — ключ: они позволяют «передумать» и перенаправить уже пущенный поток.`},
			{Type: "code", Language: "cpp", Caption: "Эдмондс-Карп, исток 1, сток n. Введите: 4 5, затем «a b пропускная»: 1 2 3, 1 3 2, 2 3 1, 2 4 2, 3 4 3", Content: `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

const long long INF = 1e18;
int n, m;
std::vector<std::vector<long long>> cap;
std::vector<std::vector<int>> g;

long long bfs(int s, int t, std::vector<int> &parent) {
    std::fill(parent.begin(), parent.end(), -1);
    parent[s] = s;
    std::queue<std::pair<int, long long>> q;
    q.push({s, INF});

    while (!q.empty()) {
        auto [v, flow] = q.front();
        q.pop();
        for (int to : g[v]) {
            if (parent[to] == -1 && cap[v][to] > 0) {
                parent[to] = v;
                long long nf = std::min(flow, cap[v][to]);
                if (to == t) return nf;
                q.push({to, nf});
            }
        }
    }
    return 0;
}

int main() {
    std::cin >> n >> m;
    cap.assign(n + 1, std::vector<long long>(n + 1, 0));
    g.assign(n + 1, {});

    for (int i = 0; i < m; i++) {
        int a, b;
        long long c;
        std::cin >> a >> b >> c;
        if (cap[a][b] == 0 && cap[b][a] == 0) {
            g[a].push_back(b);
            g[b].push_back(a); // обратное ребро для остаточной сети
        }
        cap[a][b] += c;
    }

    long long flow = 0, add;
    std::vector<int> parent(n + 1);
    while ((add = bfs(1, n, parent)) > 0) {
        flow += add;
        int v = n;
        while (v != 1) {
            int p = parent[v];
            cap[p][v] -= add;
            cap[v][p] += add;
            v = p;
        }
    }
    std::cout << "Максимальный поток: " << flow << "\n";
    return 0;
}`},
			{Type: "text", Content: `На примере максимальный поток равен 5: 2 единицы по пути 1→2→4, 2 по 1→3→4 и ещё 1 по 1→2→3→4.

Сложность Эдмондса-Карпа — O(V·E²); для плотных задач существует более быстрый алгоритм Диница.

Главное практическое применение — двудольные паросочетания: максимальное число пар «студент-проект», где каждый в одной паре. Стройте сеть: исток → студенты (пропускная 1) → допустимые проекты (пропускная 1) → сток. Максимальный поток = максимальное паросочетание.`},
			{Type: "text", Content: `Задание: смоделируйте на бумаге задачу «3 работника, 3 задачи, кто какую умеет» как сеть и прогоните через программу выше (пронумеруйте: 1 — исток, 2-4 — работники, 5-7 — задачи, 8 — сток).

Отметьте урок пройденным.`},
		},
	}

	m["suffix-structures"] = lessonContentSeed{
		Summary: "Суффиксный массив: сортировка всех суффиксов строки и что она даёт.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Суффиксный массив — отсортированный список всех суффиксов строки (хранятся, конечно, только их начальные позиции). Он открывает целый класс задач: поиск любого образца за O(m log n), число различных подстрок, наибольшая общая подстрока двух строк.

Строить сортировкой «в лоб» — O(n² log n): сравнение суффиксов длинное. Классический трюк — сортировка по степеням двойки: сортируем суффиксы сначала по первым 1, потом 2, 4, 8... символам. На каждом шаге суффикс описывается ПАРОЙ классов эквивалентности с прошлого шага — сравнение пары за O(1).`},
			{Type: "code", Language: "cpp", Caption: "Суффиксный массив за O(n log² n). Введите: banana", Content: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

int main() {
    std::string s;
    std::cin >> s;
    s += "$"; // терминальный символ меньше всех букв
    int n = s.size();

    std::vector<int> order(n), cls(n);
    for (int i = 0; i < n; i++) order[i] = i;
    std::sort(order.begin(), order.end(), [&](int a, int b) { return s[a] < s[b]; });
    cls[order[0]] = 0;
    for (int i = 1; i < n; i++) {
        cls[order[i]] = cls[order[i - 1]] + (s[order[i]] != s[order[i - 1]] ? 1 : 0);
    }

    for (int len = 1; len < n; len *= 2) {
        std::vector<std::pair<std::pair<int, int>, int>> t(n);
        for (int i = 0; i < n; i++) {
            t[i] = {{cls[i], cls[(i + len) % n]}, i};
        }
        std::sort(t.begin(), t.end());

        for (int i = 0; i < n; i++) order[i] = t[i].second;
        cls[order[0]] = 0;
        for (int i = 1; i < n; i++) {
            cls[order[i]] = cls[order[i - 1]] + (t[i].first != t[i - 1].first ? 1 : 0);
        }
    }

    std::cout << "Суффиксы по алфавиту:\n";
    for (int i = 1; i < n; i++) { // пропускаем суффикс из одного $
        std::cout << s.substr(order[i], n - 1 - order[i]) << "\n";
    }
    return 0;
}`},
			{Type: "text", Content: `Для banana порядок суффиксов: a, ana, anana, banana, na, nana.

Разбор трюков:

• терминальный символ $ (меньше любых букв) выравнивает суффиксы до «циклических сдвигов» — поэтому работает (i + len) % n;
• класс эквивалентности — «номер группы одинаковых префиксов длины len»; пара (класс начала, класс середины) полностью описывает префикс длины 2·len;
• со счётной сортировкой вместо std::sort получается классический O(n log n).

Следующий шаг темы — массив LCP (длины общих префиксов соседних суффиксов, алгоритм Касаи за O(n)): с ним считается, например, число различных подстрок. Ещё мощнее — суффиксный автомат, но он ждёт вас после уверенного владения массивом.`},
			{Type: "text", Content: `Задание: с помощью суффиксного массива banana посчитайте руками число различных подстрок (сумма длин суффиксов минус сумма LCP; ответ: 15).

Отметьте урок пройденным.`},
		},
	}

	m["computational-geometry"] = lessonContentSeed{
		Summary: "Векторное произведение, площадь многоугольника и выпуклая оболочка.",
		Blocks: []contentBlockSeed{
			{Type: "text", Content: `Почти вся олимпиадная геометрия строится на одном инструменте — векторном (косом) произведении:

cross(O, A, B) = (A - O) × (B - O) = (Ax-Ox)(By-Oy) - (Ay-Oy)(Bx-Ox)

Его знак говорит, куда поворачивает ломаная O→A→B: плюс — против часовой стрелки, минус — по часовой, ноль — три точки на одной прямой. А модуль равен удвоенной площади треугольника OAB.

Первое применение — площадь любого многоугольника («формула шнурков»): сумма косых произведений последовательных вершин.`},
			{Type: "code", Language: "cpp", Caption: "Площадь многоугольника. Введите: 4, затем вершины по контуру: 0 0, 4 0, 4 3, 0 3", Content: `#include <iostream>
#include <vector>

int main() {
    int n;
    std::cin >> n;
    std::vector<long long> x(n), y(n);
    for (int i = 0; i < n; i++) std::cin >> x[i] >> y[i];

    long long area2 = 0; // удвоенная площадь
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        area2 += x[i] * y[j] - x[j] * y[i];
    }
    if (area2 < 0) area2 = -area2;

    std::cout << area2 / 2;
    if (area2 % 2 == 1) std::cout << ".5";
    std::cout << "\n";
    return 0;
}`},
			{Type: "text", Content: `Прямоугольник 4×3 даёт 12. Заметьте: всё считается в ЦЕЛЫХ числах — храним удвоенную площадь и делим только при выводе. Золотое правило геометрии: оставайтесь в целых числах как можно дольше, double с его погрешностями — источник самых коварных багов.

Вторая классика — выпуклая оболочка: минимальный выпуклый многоугольник, содержащий все точки. Алгоритм Эндрю (monotone chain): сортируем точки по x, строим нижнюю цепочку слева направо, выкидывая точки, дающие «не тот» поворот, затем верхнюю — справа налево. O(n log n) на сортировку.`},
			{Type: "code", Language: "cpp", Caption: "Выпуклая оболочка. Введите: 6, затем точки: 0 0, 2 0, 1 1, 2 2, 0 2, 1 -1", Content: `#include <iostream>
#include <vector>
#include <algorithm>

struct Pt {
    long long x, y;
};

long long cross(const Pt &o, const Pt &a, const Pt &b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

int main() {
    int n;
    std::cin >> n;
    std::vector<Pt> p(n);
    for (auto &pt : p) std::cin >> pt.x >> pt.y;

    std::sort(p.begin(), p.end(), [](const Pt &a, const Pt &b) {
        return a.x < b.x || (a.x == b.x && a.y < b.y);
    });

    std::vector<Pt> hull;
    for (int pass = 0; pass < 2; pass++) {
        int start = hull.size();
        for (auto &pt : p) {
            while ((int)hull.size() >= start + 2 &&
                   cross(hull[hull.size() - 2], hull[hull.size() - 1], pt) <= 0) {
                hull.pop_back();
            }
            hull.push_back(pt);
        }
        hull.pop_back(); // крайняя точка попадёт в начало следующей цепочки
        std::reverse(p.begin(), p.end());
    }

    std::cout << "Вершины выпуклой оболочки:\n";
    for (auto &pt : hull) std::cout << pt.x << " " << pt.y << "\n";
    return 0;
}`},
			{Type: "text", Content: `На примере внутренняя точка (1,1) исчезает, остаются пять вершин оболочки в порядке обхода против часовой стрелки.

Условие cross <= 0 выбрасывает и точки на прямой; замените на < 0, если коллинеарные точки нужно оставлять.

Задание: по готовой оболочке посчитайте её площадь формулой шнурков — две темы урока соединятся в одно решение.

Отметьте урок пройденным — вы прошли весь путь олимпиадника! Дальше — практика: решайте задачи, участвуйте в соревнованиях и возвращайтесь к урокам как к справочнику. Удачи!`},
		},
	}
}
