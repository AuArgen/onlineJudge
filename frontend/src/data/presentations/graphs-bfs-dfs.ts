import type { LessonPresentationData } from './types';

// Presentation for the "Graphs: Representation, BFS and DFS" lesson
// (olympiad-roadmap → level-4-graphs-dp → graphs-bfs-dfs).
// Slide structure is single-sourced in buildSlides(); the three language
// tables below carry only the strings.

interface L {
  kicker: string;
  title: string;
  subtitle: string;
  press: string;

  s2h: string;
  s2c1t: string; s2c1d: string;
  s2c2t: string; s2c2d: string;
  s2c3t: string; s2c3d: string;

  s3h: string; s3dfsT: string; s3dfsD: string; s3bfsT: string; s3bfsD: string; s3mark: string;

  s4h: string; s4task: string;
  s4n1: string; s4n2: string; s4n3: string;

  s5h: string; s5n1: string; s5n2: string; s5n3: string; s5run: string;

  s6h: string; s6task: string;
  s6n1: string; s6n2: string; s6n3: string; s6n4: string;

  s7h: string; s7n1: string; s7n2: string; s7n3: string; s7run: string;

  s8h: string;
  s8e1t: string; s8e1d: string;
  s8e2t: string; s8e2d: string;
  s8e3t: string; s8e3d: string;

  s9h: string; s9task: string; s9hint: string;

  s10h: string; s10r1: string; s10r2: string; s10r3: string; s10r4: string;
  s10cta: string; s10foot: string;
}

const C = {
  good: '#34d399',
  bad: '#f87171',
  warn: '#fbbf24',
  info: '#60a5fa',
  acc: '#818cf8',
};

// dfsComponents renders the connected-components example on 6 vertices with
// edges 1-2, 2-3, 4-5 (6 isolated): the base graph is grey, then each reveal
// group re-paints one component's nodes and edges in its own color — a plain
// additive overlay, since components never change once colored.
function dfsComponents(l1: string, l2: string, l3: string): string {
  const nx = (k: number) => 40 + k * 95;
  const ny = 60, r = 20;
  const edges: [number, number][] = [[0, 1], [1, 2], [3, 4]];

  const node = (k: number, color?: string) =>
    `<circle cx="${nx(k)}" cy="${ny}" r="${r}" fill="${color ? color + '22' : 'rgba(255,255,255,.04)'}" stroke="${color ?? 'rgba(255,255,255,.28)'}" stroke-width="${color ? 2.2 : 1.5}"/>` +
    `<text x="${nx(k)}" y="${ny + 6}" text-anchor="middle" fill="${color ?? '#cbd5e1'}" font-size="17" font-family="monospace">${k + 1}</text>`;
  const edge = (a: number, b: number, color?: string) =>
    `<line x1="${nx(a) + r}" y1="${ny}" x2="${nx(b) - r}" y2="${ny}" stroke="${color ?? 'rgba(255,255,255,.22)'}" stroke-width="${color ? 2.5 : 1.5}"/>`;
  const label = (text: string, color: string) =>
    `<text x="20" y="118" fill="${color}" font-size="14" font-family="monospace">${text}</text>`;

  const g0 = edges.map(([a, b]) => edge(a, b)).join('') + [0, 1, 2, 3, 4, 5].map((k) => node(k)).join('');
  const g1 = edge(0, 1, C.info) + edge(1, 2, C.info) + node(0, C.info) + node(1, C.info) + node(2, C.info) + label(l1, C.info);
  const g2 = edge(3, 4, C.warn) + node(3, C.warn) + node(4, C.warn) + label(l2, C.warn);
  const g3 = node(5, C.good) + label(l3, C.good);

  return `<div class="lp-chart">
<svg viewBox="0 0 560 140" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
  <g class="step" data-a="none" data-g="3">${g3}</g>
</svg>
</div>`;
}

// bfsWaves renders the shortest-distance example from vertex 1 on the graph
// 1-2, 1-5, 2-3, 3-4: nodes sit at fixed positions, one reveal group per
// wavefront (dist 0, 1, 2, 3), re-painting nodes/edges in that wave's color —
// the same additive-overlay technique as dfsComponents.
function bfsWaves(): string {
  const pos = [
    { x: 280, y: 18 }, // 1
    { x: 170, y: 92 }, // 2
    { x: 390, y: 92 }, // 5
    { x: 170, y: 166 }, // 3
    { x: 170, y: 236 }, // 4
  ];
  const labels = [1, 2, 5, 3, 4];
  const r = 20;
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [3, 4]];

  const node = (i: number, color?: string, dist?: number) =>
    `<circle cx="${pos[i].x}" cy="${pos[i].y}" r="${r}" fill="${color ? color + '22' : 'rgba(255,255,255,.04)'}" stroke="${color ?? 'rgba(255,255,255,.28)'}" stroke-width="${color ? 2.2 : 1.5}"/>` +
    `<text x="${pos[i].x}" y="${pos[i].y + 5}" text-anchor="middle" fill="${color ?? '#cbd5e1'}" font-size="16" font-family="monospace">${labels[i]}</text>` +
    (dist !== undefined ? `<text x="${pos[i].x + r + 8}" y="${pos[i].y + 5}" fill="${color}" font-size="13" font-family="monospace">d=${dist}</text>` : '');
  const edge = (a: number, b: number, color?: string) =>
    `<line x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" stroke="${color ?? 'rgba(255,255,255,.22)'}" stroke-width="${color ? 2.5 : 1.5}"/>`;

  const g0 = edges.map(([a, b]) => edge(a, b)).join('') + [0, 1, 2, 3, 4].map((i) => node(i)).join('');
  const g1 = node(0, C.acc, 0);
  const g2 = edge(0, 1, C.info) + edge(0, 2, C.info) + node(1, C.info, 1) + node(2, C.info, 1);
  const g3 = edge(1, 3, C.warn) + node(3, C.warn, 2);
  const g4 = edge(3, 4, C.good) + node(4, C.good, 3);

  return `<div class="lp-chart">
<svg viewBox="0 0 460 270" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
  <g class="step" data-a="none" data-g="3">${g3}</g>
  <g class="step" data-a="none" data-g="4">${g4}</g>
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">O(V + E)</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The idea: vertices, edges, storage
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🔵</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">📋</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔲</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>`,

    // 3 ── Two traversals
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>🕳️ ${t.s3dfsT}</h3><p>${t.s3dfsD}</p></div>
  <div class="lp-card step" data-a="right"><h3>🌊 ${t.s3bfsT}</h3><p>${t.s3bfsD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s3mark}</span></p>`,

    // 4 ── Animated DFS: connected components
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
${dfsComponents(t.s4n1, t.s4n2, t.s4n3)}
<div class="lp-notes" style="margin-top:2px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s4n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s4n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="none"><p>${t.s4n3}</p></div>
</div>`,

    // 5 ── DFS: full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">void dfs(int v) {
    visited[v] = true;
    for (int to : g[v])
        if (!visited[to]) dfs(to);
}
</span><span class="step" data-g="1" data-a="none">
int components = 0;
for (int v = 1; v &lt;= n; v++) {
</span><span class="step" data-g="2" data-a="none">    if (!visited[v]) {
        components++;
        dfs(v);
    }
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s5run}</p>`,

    // 6 ── Animated BFS: distances
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s6task}</p>
<div class="lp-cols">
  ${bfsWaves()}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s6n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s6n2}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s6n3}</p></div>
    <div class="lp-card step" data-g="4" data-a="right"><p>${t.s6n4}</p></div>
  </div>
</div>`,

    // 7 ── BFS: full code
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">dist[1] = 0;
q.push(1);
while (!q.empty()) {
    int v = q.front(); q.pop();
</span><span class="step" data-g="1" data-a="none">    for (int to : g[v]) {
        if (dist[to] == -1) {
            dist[to] = dist[v] + 1;
            q.push(to);
        }
    }
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
  </div>
</div>
<p class="lp-p lp-center step" data-g="2">${t.s7n3}</p>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s7run}</p>`,

    // 8 ── The three pitfalls
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">♾️</div><h3>${t.s8e1t}</h3><p>${t.s8e1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">📚</div><h3>${t.s8e2t}</h3><p>${t.s8e2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🚫</div><h3>${t.s8e3t}</h3><p>${t.s8e3d}</p></div>
</div>`,

    // 9 ── Task teaser: the maze
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s9task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🧭</div><p>${t.s9hint}</p></div>`,

    // 10 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s10h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">g[v]</span><span><b>${t.s10r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">DFS</span><span><b>${t.s10r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">BFS</span><span><b>${t.s10r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">O(V+E)</span><span><b>${t.s10r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s10cta}</p></div>
<p class="lp-foot lp-center step">${t.s10foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 4',
  title: 'Графы: представление, BFS и DFS',
  subtitle: 'Вершины и рёбра — язык, на котором формулируется огромный пласт олимпиадных задач',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Граф и его хранение',
  s2c1t: 'Вершины и рёбра',
  s2c1d: 'Города и дороги, люди и дружбы, состояния и переходы — всё это графы.',
  s2c2t: 'Список смежности',
  s2c2d: 'Вектор векторов g, где g[v] — список соседей вершины v. Стандартный выбор.',
  s2c3t: 'Матрица смежности',
  s2c3d: 'n×n таблица «есть ребро / нет» — подходит только для маленьких n.',

  s3h: 'Два базовых обхода',
  s3dfsT: 'DFS — в глубину',
  s3dfsD: 'Идём по ребру, пока можем, потом откатываемся. Естественно пишется рекурсией.',
  s3bfsT: 'BFS — в ширину',
  s3bfsD: 'Обходим «волнами» через очередь: сначала все соседи, потом соседи соседей.',
  s3mark: 'DFS находит компоненты и циклы. BFS даёт кратчайшие расстояния в невзвешенном графе.',

  s4h: 'DFS: компоненты связности',
  s4task: 'Рёбра 1–2, 2–3, 4–5; вершина 6 сама по себе. Запускаем dfs из каждой непосещённой вершины.',
  s4n1: 'dfs(1) добирается до 2, потом до 3 — все три помечены за один запуск. Компонент 1: {1, 2, 3}.',
  s4n2: 'Вершина 4 ещё не посещена — новый запуск dfs(4) находит 5. Компонент 2: {4, 5}.',
  s4n3: 'Вершина 6 без соседей — dfs(6) сразу завершается. Компонент 3: {6}. Итог: 3.',

  s5h: 'DFS: весь код',
  s5n1: 'Помечаем вершину посещённой и идём во все непосещённые соседние — рекурсивно.',
  s5n2: 'Перебираем все вершины по очереди — граф может быть несвязным.',
  s5n3: 'Непосещённая вершина — новая компонента. Запускаем из неё dfs и считаем.',
  s5run: 'Запустите этот код в уроке — введите 6 3, затем рёбра 1 2, 2 3, 4 5.',

  s6h: 'BFS: расстояния от вершины 1',
  s6task: 'Рёбра 1–2, 1–5, 2–3, 3–4. Кладём 1 в очередь и расходимся волнами.',
  s6n1: 'dist[1] = 0 — старт.',
  s6n2: 'Соседи 1 — это 2 и 5. Оба на расстоянии 1, оба встают в очередь.',
  s6n3: 'У вершины 2 есть непосещённый сосед 3 — расстояние 2.',
  s6n4: 'У вершины 3 есть непосещённый сосед 4 — расстояние 3. Дальше очередь пуста.',

  s7h: 'BFS: весь код',
  s7n1: 'Старт в очереди с расстоянием 0. Достаём вершину за вершиной.',
  s7n2: 'Непосещённый сосед получает dist[v] + 1 и сам встаёт в очередь.',
  s7n3: 'Вершины обрабатываются строго по возрастанию расстояния — поэтому первое присвоение dist уже окончательное.',
  s7run: 'Запустите этот код в уроке — введите 5 4, затем рёбра 1 2, 2 3, 3 4, 1 5.',

  s8h: 'Грабли, на которые наступают все',
  s8e1t: 'Забытая пометка visited',
  s8e1d: 'Без неё обход зацикливается — вершина посещается снова и снова.',
  s8e2t: 'Рекурсия на длинной цепочке',
  s8e2d: 'DFS на 10⁵+ вершинах подряд может переполнить стек — нужен итеративный вариант со своим стеком.',
  s8e3t: 'dist = −1 — это не ошибка',
  s8e3d: 'Инициализация «не посещено» и готовый ответ «недостижимо» — одно и то же значение.',

  s9h: 'Задание',
  s9task: 'Лабиринт n×m из точек (проход) и решёток (стена). Найдите кратчайший путь от входа до выхода.',
  s9hint: 'Это BFS по клеткам вместо вершин: соседи каждой клетки — четыре стороны света. Идея та же самая, просто граф неявный.',

  s10h: 'Запомнить',
  s10r1: 'Список смежности — стандартное хранение графа',
  s10r2: 'DFS — вглубь и назад, рекурсией; компоненты, циклы',
  s10r3: 'BFS — волнами через очередь; кратчайшие расстояния',
  s10r4: 'Обе — O(V + E): каждая вершина и ребро один раз',
  s10cta: 'Решите задачу про лабиринт и отметьте урок пройденным.',
  s10foot: 'Дальше — кратчайшие пути во взвешенном графе: Дейкстра и Флойд.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 4-деңгээл',
  title: 'Графтар: сактоо, BFS жана DFS',
  subtitle: 'Чокулар жана кырлар — олимпиадалык маселелердин эбегейсиз катмары түзүлгөн тил',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Граф жана аны сактоо',
  s2c1t: 'Чокулар жана кырлар',
  s2c1d: 'Шаарлар менен жолдор, адамдар менен достуктар, абалдар менен өтүүлөр — баары граф.',
  s2c2t: 'Чектештик тизмеси',
  s2c2d: 'Векторлордун вектору g, мында g[v] — v чокусунун кошуналарынын тизмеси. Стандарттуу тандоо.',
  s2c3t: 'Чектештик матрицасы',
  s2c3d: 'n×n «кыр бар / жок» таблицасы — кичине n үчүн гана жарайт.',

  s3h: 'Эки негизги кыдыруу',
  s3dfsT: 'DFS — тереңдеп',
  s3dfsD: 'Кыр боюнча мүмкүн болушунча жүрөбүз, анан артка кайтабыз. Рекурсия менен табигый жазылат.',
  s3bfsT: 'BFS — туурасынан',
  s3bfsD: 'Кезек аркылуу «толкундар» менен кыдырабыз: адегенде бардык кошуналар, анан кошуналардын кошуналары.',
  s3mark: 'DFS компоненттерди жана циклдерди табат. BFS салмаксыз графта эң кыска аралыктарды берет.',

  s4h: 'DFS: байланыш компоненттери',
  s4task: 'Кырлар 1–2, 2–3, 4–5; 6-чоку жалгыз. Ар бир кирбеген чокудан dfs ишке киргизебиз.',
  s4n1: 'dfs(1) 2ге, андан кийин 3кө жетет — үчөө тең бир иштетүүдө белгиленет. 1-компонент: {1, 2, 3}.',
  s4n2: '4-чоку али кирбеген — жаңы dfs(4) 5ти табат. 2-компонент: {4, 5}.',
  s4n3: '6-чокунун кошунасы жок — dfs(6) дароо бүтөт. 3-компонент: {6}. Жыйынтык: 3.',

  s5h: 'DFS: толук код',
  s5n1: 'Чокуну кирди деп белгилейбиз да бардык кирбеген кошуналарына — рекурсивдүү — өтөбүз.',
  s5n2: 'Бардык чокуларды кезеги менен кыдырабыз — граф байланышсыз болушу мүмкүн.',
  s5n3: 'Кирбеген чоку — жаңы компонент. Андан dfs ишке киргизип, эсептейбиз.',
  s5run: 'Бул кодду сабактан иштетиңиз — 6 3, андан кийин кырлар 1 2, 2 3, 4 5 киргизиңиз.',

  s6h: 'BFS: 1-чокудан аралыктар',
  s6task: 'Кырлар 1–2, 1–5, 2–3, 3–4. 1ди кезекке коюп, толкун менен жайылабыз.',
  s6n1: 'dist[1] = 0 — старт.',
  s6n2: '1дин кошуналары — 2 жана 5. Экөө тең 1 аралыкта, экөө тең кезекке турат.',
  s6n3: '2-чокунун кирбеген кошунасы бар — 3, аралык 2.',
  s6n4: '3-чокунун кирбеген кошунасы бар — 4, аралык 3. Андан ары кезек бош.',

  s7h: 'BFS: толук код',
  s7n1: 'Старт аралыгы 0 менен кезекте. Чокуларды бирден алабыз.',
  s7n2: 'Кирбеген кошуна dist[v] + 1 алат да өзү кезекке турат.',
  s7n3: 'Чокулар так аралыктын өсүү тартибинде иштетилет — ошондуктан dist ди биринчи ирет коюу дароо акыркысы болот.',
  s7run: 'Бул кодду сабактан иштетиңиз — 5 4, андан кийин кырлар 1 2, 2 3, 3 4, 1 5 киргизиңиз.',

  s8h: 'Баары баса турган тырмоолор',
  s8e1t: 'Унутулган visited белгиси',
  s8e1d: 'Ансыз кыдыруу циклге түшөт — чоку кайра-кайра кирет.',
  s8e2t: 'Узун чынжырдагы рекурсия',
  s8e2d: '10⁵+ чокудан турган DFS стекти толтуруп салышы мүмкүн — өз стеги бар итеративдик вариант керек.',
  s8e3t: 'dist = −1 — бул ката эмес',
  s8e3d: '«Кирген жокмун» инициализациясы жана даяр «жетпейт» жообу — бир эле маани.',

  s9h: 'Тапшырма',
  s9task: 'n×m лабиринт чекиттерден (өтүлөт) жана решёткалардан (дубал) турат. Кирүүдөн чыгууга чейинки эң кыска жолду табыңыз.',
  s9hint: 'Бул чокулардын ордуна клеткалар боюнча BFS: ар бир клетканын кошуналары — төрт тарап. Идея так ошол эле, граф жөн гана ачык эмес.',

  s10h: 'Эсте сакта',
  s10r1: 'Чектештик тизмеси — графтын стандарттуу сактоосу',
  s10r2: 'DFS — тереңдеп жана артка, рекурсия менен; компоненттер, циклдер',
  s10r3: 'BFS — кезек аркылуу толкун менен; эң кыска аралыктар',
  s10r4: 'Экөө тең — O(V + E): ар бир чоку жана кыр бир жолу',
  s10cta: 'Лабиринт жөнүндөгү маселени чечиңиз жана сабакты өттүм деп белгилеңиз.',
  s10foot: 'Андан ары — салмактуу графтагы эң кыска жолдор: Дейкстра жана Флойд.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 4',
  title: 'Graphs: Representation, BFS and DFS',
  subtitle: 'Vertices and edges — the language a huge class of contest problems is naturally phrased in',
  press: 'Press → or Space to advance',

  s2h: 'The graph and how to store it',
  s2c1t: 'Vertices and edges',
  s2c1d: 'Cities and roads, people and friendships, states and transitions — all of it is graphs.',
  s2c2t: 'The adjacency list',
  s2c2d: 'A vector of vectors g, where g[v] holds the list of v\'s neighbors. The standard choice.',
  s2c3t: 'The adjacency matrix',
  s2c3d: 'An n×n "edge or no edge" table — only suits small n.',

  s3h: 'The two basic traversals',
  s3dfsT: 'DFS — depth-first',
  s3dfsD: 'Follow an edge as far as you can, then backtrack. Naturally written with recursion.',
  s3bfsT: 'BFS — breadth-first',
  s3bfsD: 'Traverse in "waves" through a queue: first all neighbors, then neighbors of neighbors.',
  s3mark: 'DFS finds components and cycles. BFS gives shortest distances in an unweighted graph.',

  s4h: 'DFS: connected components',
  s4task: 'Edges 1–2, 2–3, 4–5; vertex 6 stands alone. Launch dfs from every unvisited vertex.',
  s4n1: 'dfs(1) reaches 2, then 3 — all three get marked in one run. Component 1: {1, 2, 3}.',
  s4n2: 'Vertex 4 hasn\'t been visited yet — a new dfs(4) finds 5. Component 2: {4, 5}.',
  s4n3: 'Vertex 6 has no neighbors — dfs(6) finishes instantly. Component 3: {6}. Total: 3.',

  s5h: 'DFS: the full code',
  s5n1: 'Mark the vertex visited and walk into every unvisited neighbor — recursively.',
  s5n2: 'Loop over every vertex in turn — the graph might not be connected.',
  s5n3: 'An unvisited vertex is a new component. Launch dfs from it, and count.',
  s5run: 'Run this code in the lesson — enter 6 3, then the edges 1 2, 2 3, 4 5.',

  s6h: 'BFS: distances from vertex 1',
  s6task: 'Edges 1–2, 1–5, 2–3, 3–4. Put 1 in the queue and spread out in waves.',
  s6n1: 'dist[1] = 0 — the start.',
  s6n2: '1\'s neighbors are 2 and 5. Both at distance 1, both join the queue.',
  s6n3: 'Vertex 2 has an unvisited neighbor, 3 — distance 2.',
  s6n4: 'Vertex 3 has an unvisited neighbor, 4 — distance 3. The queue is now empty.',

  s7h: 'BFS: the full code',
  s7n1: 'The start sits in the queue with distance 0. Pull out vertices one at a time.',
  s7n2: 'An unvisited neighbor gets dist[v] + 1 and joins the queue itself.',
  s7n3: 'Vertices are processed in strictly increasing order of distance — so the first time dist is set, it\'s already final.',
  s7run: 'Run this code in the lesson — enter 5 4, then the edges 1 2, 2 3, 3 4, 1 5.',

  s8h: 'The rakes everyone steps on',
  s8e1t: 'A forgotten visited mark',
  s8e1d: 'Without it the traversal loops forever — a vertex gets visited again and again.',
  s8e2t: 'Recursion on a long chain',
  s8e2d: 'DFS on 10⁵+ vertices in a row can overflow the call stack — you need an iterative version with your own stack.',
  s8e3t: 'dist = −1 is not an error',
  s8e3d: 'The "not visited" initial value and the finished "unreachable" answer are the same value.',

  s9h: 'Task',
  s9task: 'A maze of n×m dots (passable) and hashes (wall). Find the shortest path from the entrance to the exit.',
  s9hint: 'It\'s BFS over cells instead of vertices: each cell\'s neighbors are the four sides. Same idea, just an implicit graph.',

  s10h: 'Remember',
  s10r1: 'The adjacency list is the standard way to store a graph',
  s10r2: 'DFS — deep then back, via recursion; components, cycles',
  s10r3: 'BFS — waves through a queue; shortest distances',
  s10r4: 'Both are O(V + E): every vertex and edge visited once',
  s10cta: 'Solve the maze problem and mark the lesson as completed.',
  s10foot: 'Next up: shortest paths in a weighted graph — Dijkstra and Floyd.',
};

export const graphsBfsDfs: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
