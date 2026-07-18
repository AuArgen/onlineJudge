import type { LessonPresentationData } from './types';

// Presentation for the "Shortest Paths: Dijkstra and Floyd" lesson
// (olympiad-roadmap → level-4-graphs-dp → shortest-paths).
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
  s2mark: string;

  s3h: string; s3task: string;
  s3n1: string; s3n2: string; s3n3: string; s3n4: string; s3n5: string;

  s4h: string; s4n1: string; s4n2: string; s4n3: string; s4run: string;

  s5h: string; s5line: string; s5mark: string;

  s6h: string; s6line: string; s6mark: string;

  s7h: string; s7n1: string; s7n2: string; s7run: string;

  s8h: string; s8task: string; s8hint: string;

  s9h: string; s9r1: string; s9r2: string; s9r3: string; s9r4: string;
  s9cta: string; s9foot: string;
}

const C = {
  good: '#34d399',
  bad: '#f87171',
  warn: '#fbbf24',
  info: '#60a5fa',
  acc: '#818cf8',
};

// dijkstraTrace renders the exact worked example from the lesson (n=5, edges
// 1-2:2, 1-3:5, 2-3:1, 2-4:4, 3-5:1, 4-5:3): the base graph is grey with
// weight labels, then each reveal group "closes" the next vertex in
// Dijkstra's real pop order (1, 2, 3, 5, 4) by re-painting it with its
// final distance — a plain additive overlay, since a closed vertex's
// distance never changes again.
function dijkstraTrace(): string {
  const pos = [
    { x: 46, y: 34 }, // 1
    { x: 226, y: 26 }, // 2
    { x: 46, y: 170 }, // 3
    { x: 406, y: 100 }, // 4
    { x: 226, y: 196 }, // 5
  ];
  const labels = [1, 2, 3, 4, 5];
  const r = 20;
  const edges: [number, number, number][] = [
    [0, 1, 2],
    [0, 2, 5],
    [1, 2, 1],
    [1, 3, 4],
    [2, 4, 1],
    [3, 4, 3],
  ];

  const node = (i: number, color?: string, dist?: number) =>
    `<circle cx="${pos[i].x}" cy="${pos[i].y}" r="${r}" fill="${color ? color + '22' : 'rgba(255,255,255,.04)'}" stroke="${color ?? 'rgba(255,255,255,.28)'}" stroke-width="${color ? 2.4 : 1.5}"/>` +
    `<text x="${pos[i].x}" y="${pos[i].y + 5}" text-anchor="middle" fill="${color ?? '#cbd5e1'}" font-size="16" font-family="monospace">${labels[i]}</text>` +
    (dist !== undefined
      ? `<circle cx="${pos[i].x + r + 2}" cy="${pos[i].y - r - 2}" r="10" fill="#0b1020" stroke="${color}" stroke-width="1.5"/>` +
        `<text x="${pos[i].x + r + 2}" y="${pos[i].y - r + 2}" text-anchor="middle" fill="${color}" font-size="11" font-weight="700" font-family="monospace">${dist}</text>`
      : '');
  const edgeLine = (a: number, b: number) =>
    `<line x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>`;
  const edgeW = (a: number, b: number, w: number) => {
    const mx = (pos[a].x + pos[b].x) / 2, my = (pos[a].y + pos[b].y) / 2;
    return (
      `<rect x="${mx - 9}" y="${my - 10}" width="18" height="16" rx="4" fill="#0b1020"/>` +
      `<text x="${mx}" y="${my + 2}" text-anchor="middle" fill="#7c8aa5" font-size="12" font-family="monospace">${w}</text>`
    );
  };

  const g0 = edges.map(([a, b]) => edgeLine(a, b)).join('') + edges.map(([a, b, w]) => edgeW(a, b, w)).join('') + [0, 1, 2, 3, 4].map((i) => node(i)).join('');
  const g1 = node(0, C.acc, 0);
  const g2 = node(1, C.info, 2);
  const g3 = node(2, C.warn, 3);
  const g4 = node(4, C.good, 4);
  const g5 = node(3, C.bad, 6);

  return `<div class="lp-chart">
<svg viewBox="0 0 460 230" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
  <g class="step" data-a="none" data-g="3">${g3}</g>
  <g class="step" data-a="none" data-g="4">${g4}</g>
  <g class="step" data-a="none" data-g="5">${g5}</g>
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">dist[v] + w</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The idea: two tools
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>Dijkstra</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step" data-a="right"><h3>Floyd</h3><p>${t.s2c2d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── Animated Dijkstra trace
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s3task}</p>
${dijkstraTrace()}
<div class="lp-notes" style="margin-top:2px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s3n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s3n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="none"><p>${t.s3n3}</p></div>
  <div class="lp-card step" data-g="4" data-a="none"><p>${t.s3n4}</p></div>
  <div class="lp-card step" data-g="5" data-a="none"><p>${t.s3n5}</p></div>
</div>`,

    // 4 ── Dijkstra: full code
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">dist[1] = 0;
pq.push({0, 1});
while (!pq.empty()) {
    auto [d, v] = pq.top(); pq.pop();
</span><span class="step" data-g="1" data-a="none">    if (d &gt; dist[v]) continue;
</span><span class="step" data-g="2" data-a="none">    for (auto [to, w] : g[v]) {
        if (dist[v] + w &lt; dist[to]) {
            dist[to] = dist[v] + w;
            pq.push({dist[to], to});
        }
    }
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s4run}</p>`,

    // 5 ── The key line: stale entries
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.2rem,3.8vw,2rem)">if (d &gt; dist[v]) continue;</div>
</div>
<p class="lp-p lp-center step" style="margin-top:18px">${t.s5line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── Floyd: the idea
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.3rem,4vw,2.2rem)">d[i][j] = min(d[i][j], d[i][k] + d[k][j])</div>
</div>
<p class="lp-p lp-center step" style="margin-top:18px">${t.s6line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Floyd: full code
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">for (int v = 1; v &lt;= n; v++) d[v][v] = 0;
<span class="cm">// + считать веса рёбер в d[a][b]</span>
</span><span class="step" data-g="1" data-a="none">
for (int k = 1; k &lt;= n; k++)
    for (int i = 1; i &lt;= n; i++)
        for (int j = 1; j &lt;= n; j++)
            if (d[i][k] + d[k][j] &lt; d[i][j])
                d[i][j] = d[i][k] + d[k][j];</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s7run}</p>`,

    // 8 ── Task teaser: verify by hand
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">✍️</div><p>${t.s8hint}</p></div>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">Dijkstra</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">Floyd</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">continue</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">Bellman-Ford</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 4',
  title: 'Кратчайшие пути: Дейкстра и Флойд',
  subtitle: 'Как только у рёбер появляются веса, BFS перестаёт работать — нужны специальные алгоритмы',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Два главных инструмента',
  s2c1t: 'Dijkstra',
  s2c1d: 'От одной вершины до всех, O(m log n) с приоритетной очередью. Веса обязаны быть неотрицательными.',
  s2c2t: 'Floyd',
  s2c2d: 'Между ВСЕМИ парами сразу, O(n³), пять строк кода. Годится при n до нескольких сотен.',
  s2mark: 'Идея Дейкстры: поддерживаем лучшие расстояния и всегда «закрываем» ближайшую из открытых вершин.',

  s3h: 'Трасса Дейкстры из вершины 1',
  s3task: '5 вершин, 6 рёбер с весами. Закрываем вершины в порядке возрастания расстояния.',
  s3n1: 'Старт: dist[1] = 0.',
  s3n2: 'Ближайшая открытая — 2 с расстоянием 2. Закрываем; через неё путь до 3 улучшается с 5 до 3.',
  s3n3: 'Ближайшая теперь — 3 с расстоянием 3. Закрываем; через неё расстояние до 5 становится 4.',
  s3n4: 'Ближайшая — 5 с расстоянием 4. Закрываем; улучшений для соседей нет.',
  s3n5: 'Перед этим шагом из очереди достаём устаревшую запись (5, 3) — расстояние до 3 уже 3, пропускаем её. Закрываем 4 с расстоянием 6 — вершин больше нет.',

  s4h: 'Дейкстра: весь код',
  s4n1: 'Старт кладём в очередь с расстоянием 0 и вынимаем вершину за вершиной.',
  s4n2: 'Устаревшая запись — та, что положена раньше более свежего улучшения. Пропускаем её молча.',
  s4n3: 'Улучшили расстояние до соседа — обновляем и кладём его в очередь заново.',
  s4run: 'Запустите этот код в уроке — введите 5 6, затем рёбра 1 2 2, 1 3 5, 2 3 1, 2 4 4, 3 5 1, 4 5 3.',

  s5h: 'Ключевая строка алгоритма',
  s5line: 'Вершина может попасть в очередь несколько раз — каждый раз, когда путь до неё улучшается. К моменту извлечения расстояние могло уже стать меньше.',
  s5mark: 'Без этой строки алгоритм остаётся верным, но может сильно замедлиться на устаревших записях.',

  s6h: 'Флойд: одна формула на все пары',
  s6line: 'Три вложенных цикла, внешний — по «промежуточной» вершине k. После итерации k массив d[i][j] хранит кратчайшие пути через вершины только из {1..k}.',
  s6mark: 'Для отрицательных рёбер без отрицательных циклов есть алгоритм Беллмана-Форда за O(n·m) — знакомство с ним впереди.',

  s7h: 'Флойд: весь код',
  s7n1: 'd[v][v] = 0 — расстояние от вершины до себя всегда ноль, остальное изначально бесконечность или вес ребра.',
  s7n2: 'Три цикла в строгом порядке k, i, j — переставлять их нельзя, иначе алгоритм посчитает неверно.',
  s7run: 'Запустите этот код в уроке — введите 4 4, затем рёбра 1 2 5, 2 3 3, 3 4 1, 1 3 10.',

  s8h: 'Задание',
  s8task: 'В примере с Дейкстрой расстояние до вершины 4 получилось 6, а до вершины 5 — 4.',
  s8hint: 'Проследите рёбра вручную и убедитесь в этом сами: 1→2→3→5 даёт 2+1+1=4, а 1→2→4 или 1→2→3→5→4 — сравните оба варианта до вершины 4.',

  s9h: 'Запомнить',
  s9r1: 'Dijkstra — от одной вершины, O(m log n), только неотрицательные веса',
  s9r2: 'Floyd — между всеми парами, O(n³), для небольших n',
  s9r3: 'if (d > dist[v]) continue — пропуск устаревших записей в очереди',
  s9r4: 'Отрицательные рёбра без отрицательных циклов — алгоритм Беллмана-Форда',
  s9cta: 'Проверьте расстояния из примера вручную и отметьте урок пройденным.',
  s9foot: 'Дальше — минимальное остовное дерево: алгоритм Краскала на сортировке рёбер и DSU.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 4-деңгээл',
  title: 'Эң кыска жолдор: Дейкстра жана Флойд',
  subtitle: 'Кырларда салмактар пайда болгондо BFS иштебей калат — атайын алгоритмдер керек',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Эки башкы курал',
  s2c1t: 'Dijkstra',
  s2c1d: 'Бир чокудан баарына чейин, приоритеттүү кезек менен O(m log n). Салмактар терс эмес болууга милдеттүү.',
  s2c2t: 'Floyd',
  s2c2d: 'БАРДЫК түгөйлөрдүн ортосунда дароо, O(n³), беш сап код. n бир нече жүзгө чейин болгондо жарайт.',
  s2mark: 'Дейкстранын идеясы: эң жакшы аралыктарды кармап турабыз да ачык чокулардын эң жакынын дайыма «жабабыз».',

  s3h: '1-чокудан Дейкстранын трассасы',
  s3task: '5 чоку, салмактары бар 6 кыр. Чокуларды аралыктын өсүү тартибинде жабабыз.',
  s3n1: 'Старт: dist[1] = 0.',
  s3n2: 'Эң жакын ачыгы — аралыгы 2 болгон 2. Жабабыз; ал аркылуу 3кө чейинки жол 5 тен 3кө жакшырат.',
  s3n3: 'Эми эң жакыны — аралыгы 3 болгон 3. Жабабыз; ал аркылуу 5ке чейинки аралык 4 болот.',
  s3n4: 'Эң жакыны — аралыгы 4 болгон 5. Жабабыз; кошуналар үчүн жакшыртуу жок.',
  s3n5: 'Бул кадамдын алдында кезектен эскирген (5, 3) жазуусун алабыз — 3кө чейинки аралык эбак эле 3, аны өткөрүп жиберебиз. Аралыгы 6 болгон 4тү жабабыз — башка чоку калган жок.',

  s4h: 'Дейкстра: толук код',
  s4n1: 'Стартты аралыгы 0 менен кезекке коёбуз да чокуларды бирден чыгарабыз.',
  s4n2: 'Эскирген жазуу — жаңы жакшыртуудан мурун коюлганы. Аны унчукпай өткөрүп жиберебиз.',
  s4n3: 'Кошунага чейинки аралыкты жакшырттык — жаңыртып, аны кезекке кайра коёбуз.',
  s4run: 'Бул кодду сабактан иштетиңиз — 5 6, андан кийин кырлар 1 2 2, 1 3 5, 2 3 1, 2 4 4, 3 5 1, 4 5 3 киргизиңиз.',

  s5h: 'Алгоритмдин негизги сабы',
  s5line: 'Чоку кезекке бир нече жолу түшүшү мүмкүн — ага чейинки жол жакшырган ар бир жолу. Алынган учурда аралык эбак эле кичине болуп калышы мүмкүн.',
  s5mark: 'Бул сапсыз алгоритм туура бойдон калат, бирок эскирген жазуулардан катуу жайлап кетиши мүмкүн.',

  s6h: 'Флойд: бардык түгөйлөр үчүн бир формула',
  s6line: 'Үч кабатталган цикл, сырткысы — «аралык» чоку k боюнча. k итерациясынан кийин d[i][j] массиви {1..k} ичиндеги чокулар аркылуу гана эң кыска жолдорду сактайт.',
  s6mark: 'Терс циклдерсиз терс кырлар үчүн O(n·m) убакыттагы Беллман-Форд алгоритми бар — таанышуу алдыда.',

  s7h: 'Флойд: толук код',
  s7n1: 'd[v][v] = 0 — чокудан өзүнө чейинки аралык дайыма нөл, калганы башында чексиздик же кырдын салмагы.',
  s7n2: 'Үч цикл так k, i, j тартибинде — аларды алмаштырууга болбойт, антпесе алгоритм туура эмес эсептейт.',
  s7run: 'Бул кодду сабактан иштетиңиз — 4 4, андан кийин кырлар 1 2 5, 2 3 3, 3 4 1, 1 3 10 киргизиңиз.',

  s8h: 'Тапшырма',
  s8task: 'Дейкстранын мисалында 4-чокуга чейинки аралык 6, ал эми 5-чокуга чейинки 4 чыкты.',
  s8hint: 'Кырларды кол менен ээрчип, өзүңүз ынаныңыз: 1→2→3→5 2+1+1=4 берет, ал эми 1→2→4 менен 1→2→3→5→4 ди 4кө чейин салыштырыңыз.',

  s9h: 'Эсте сакта',
  s9r1: 'Dijkstra — бир чокудан, O(m log n), терс эмес салмактар гана',
  s9r2: 'Floyd — бардык түгөйлөрдүн ортосунда, O(n³), кичине n үчүн',
  s9r3: 'if (d > dist[v]) continue — кезектеги эскирген жазууларды өткөрүп жиберүү',
  s9r4: 'Терс циклдерсиз терс кырлар — Беллман-Форд алгоритми',
  s9cta: 'Мисалдагы аралыктарды кол менен текшериңиз жана сабакты өттүм деп белгилеңиз.',
  s9foot: 'Андан ары — минималдуу каркас дарагы: кырларды иреттөө жана DSU негизиндеги Краскалдын алгоритми.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 4',
  title: 'Shortest Paths: Dijkstra and Floyd',
  subtitle: 'The moment edges get weights, BFS stops working — you need dedicated algorithms',
  press: 'Press → or Space to advance',

  s2h: 'Two main tools',
  s2c1t: 'Dijkstra',
  s2c1d: 'From one vertex to all others, O(m log n) with a priority queue. Weights must be non-negative.',
  s2c2t: 'Floyd',
  s2c2d: 'Between ALL pairs at once, O(n³), five lines of code. Fine for n up to a few hundred.',
  s2mark: 'Dijkstra\'s idea: maintain the best distances and always "close" the nearest open vertex.',

  s3h: 'Dijkstra\'s trace from vertex 1',
  s3task: '5 vertices, 6 weighted edges. Close vertices in increasing order of distance.',
  s3n1: 'Start: dist[1] = 0.',
  s3n2: 'The nearest open vertex is 2, at distance 2. Close it; through it, the path to 3 improves from 5 to 3.',
  s3n3: 'Now the nearest is 3, at distance 3. Close it; through it, the distance to 5 becomes 4.',
  s3n4: 'The nearest is 5, at distance 4. Close it; no improvements for its neighbors.',
  s3n5: 'Right before this step we pull a stale entry (5, 3) from the queue — the distance to 3 is already 3, so we skip it. Close 4 at distance 6 — no vertices remain.',

  s4h: 'Dijkstra: the full code',
  s4n1: 'Put the start in the queue with distance 0 and pull out vertices one at a time.',
  s4n2: 'A stale entry is one pushed before a fresher improvement. Skip it silently.',
  s4n3: 'Improved the distance to a neighbor — update it and push it back into the queue.',
  s4run: 'Run this code in the lesson — enter 5 6, then the edges 1 2 2, 1 3 5, 2 3 1, 2 4 4, 3 5 1, 4 5 3.',

  s5h: 'The key line of the algorithm',
  s5line: 'A vertex can end up in the queue several times — every time the path to it improves. By the time it\'s pulled out, the distance may already be smaller.',
  s5mark: 'Without this line the algorithm stays correct, but stale entries can slow it down badly.',

  s6h: 'Floyd: one formula for every pair',
  s6line: 'Three nested loops, the outer one over the "intermediate" vertex k. After iteration k, the array d[i][j] holds shortest paths using intermediate vertices only from {1..k}.',
  s6mark: 'For negative edges without negative cycles there\'s the Bellman-Ford algorithm at O(n·m) — worth meeting on your own later.',

  s7h: 'Floyd: the full code',
  s7n1: 'd[v][v] = 0 — the distance from a vertex to itself is always zero; everything else starts at infinity or an edge weight.',
  s7n2: 'Three loops in strict order k, i, j — they cannot be swapped, or the algorithm computes the wrong answer.',
  s7run: 'Run this code in the lesson — enter 4 4, then the edges 1 2 5, 2 3 3, 3 4 1, 1 3 10.',

  s8h: 'Task',
  s8task: 'In the Dijkstra example, the distance to vertex 4 came out to 6, and to vertex 5 — 4.',
  s8hint: 'Trace the edges by hand and confirm it yourself: 1→2→3→5 gives 2+1+1=4, and compare both 1→2→4 and 1→2→3→5→4 for vertex 4.',

  s9h: 'Remember',
  s9r1: 'Dijkstra — from one vertex, O(m log n), non-negative weights only',
  s9r2: 'Floyd — between all pairs, O(n³), for small n',
  s9r3: 'if (d > dist[v]) continue — skip stale entries in the queue',
  s9r4: 'Negative edges without negative cycles — the Bellman-Ford algorithm',
  s9cta: 'Verify the distances from the example by hand and mark the lesson as completed.',
  s9foot: 'Next up: the minimum spanning tree — Kruskal\'s algorithm on sorted edges and DSU.',
};

export const shortestPaths: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
