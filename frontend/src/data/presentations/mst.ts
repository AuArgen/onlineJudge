import type { LessonPresentationData } from './types';

// Presentation for the "Minimum Spanning Tree" lesson
// (olympiad-roadmap → level-4-graphs-dp → mst).
// Slide structure is single-sourced in buildSlides(); the three language
// tables below carry only the strings.

interface L {
  kicker: string;
  title: string;
  subtitle: string;
  press: string;

  s2h: string; s2line: string; s2mark: string;

  s3h: string;
  s3c1t: string; s3c1d: string;
  s3c2t: string; s3c2d: string;
  s3c3t: string; s3c3d: string;

  s4h: string; s4task: string;
  s4n1: string; s4n2: string; s4n3: string; s4n4: string; s4n5: string;

  s5h: string; s5n1: string; s5n2: string; s5n3: string; s5run: string;

  s6h: string; s6line: string; s6mark: string; s6prim: string;

  s7h: string; s7task: string; s7hint: string;

  s8h: string; s8r1: string; s8r2: string; s8r3: string; s8r4: string;
  s8cta: string; s8foot: string;
}

const C = {
  good: '#34d399',
  bad: '#f87171',
  warn: '#fbbf24',
  info: '#60a5fa',
  acc: '#818cf8',
};

// kruskalTrace renders the exact worked example (n=4, edges 1-2:1, 2-3:2,
// 3-4:5, 1-3:2, 2-4:4): the base graph is grey with weight labels, then each
// reveal group re-paints one edge green (taken into the MST) or red-dashed
// (skipped — its endpoints are already connected) and redraws the running
// total on top of the previous one — the overlay technique used throughout
// this series.
function kruskalTrace(): string {
  const pos = [
    { x: 60, y: 30 }, // 1
    { x: 320, y: 30 }, // 2
    { x: 60, y: 190 }, // 3
    { x: 320, y: 190 }, // 4
  ];
  const r = 20;
  // order matches the lesson's own walk-through: 1-2, 2-3, 1-3, 2-4, 3-4
  const steps: { a: number; b: number; w: number; take: boolean; total: string }[] = [
    { a: 0, b: 1, w: 1, take: true, total: '1' },
    { a: 1, b: 2, w: 2, take: true, total: '1+2=3' },
    { a: 0, b: 2, w: 2, take: false, total: '3' },
    { a: 1, b: 3, w: 4, take: true, total: '3+4=7' },
    { a: 2, b: 3, w: 5, take: false, total: '7' },
  ];
  const allEdges: [number, number, number][] = [[0, 1, 1], [1, 2, 2], [2, 3, 5], [0, 2, 2], [1, 3, 4]];

  const node = (i: number) =>
    `<circle cx="${pos[i].x}" cy="${pos[i].y}" r="${r}" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.28)" stroke-width="1.5"/>` +
    `<text x="${pos[i].x}" y="${pos[i].y + 5}" text-anchor="middle" fill="#cbd5e1" font-size="16" font-family="monospace">${i + 1}</text>`;
  const edgeLine = (a: number, b: number) =>
    `<line x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>`;
  const edgeW = (a: number, b: number, w: number) => {
    const mx = (pos[a].x + pos[b].x) / 2, my = (pos[a].y + pos[b].y) / 2;
    return (
      `<rect x="${mx - 9}" y="${my - 10}" width="18" height="16" rx="4" fill="#0b1020"/>` +
      `<text x="${mx}" y="${my + 2}" text-anchor="middle" fill="#7c8aa5" font-size="12" font-family="monospace">${w}</text>`
    );
  };
  const paint = (a: number, b: number, take: boolean) =>
    `<line x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" stroke="${take ? C.good : C.bad}" stroke-width="${take ? 3 : 2}" ${take ? '' : 'stroke-dasharray="6 4"'}/>`;
  const total = (text: string, color: string) =>
    `<rect x="150" y="102" width="120" height="34" rx="8" fill="#0b1020"/>` +
    `<text x="210" y="124" text-anchor="middle" fill="${color}" font-size="16" font-weight="700" font-family="monospace">Σ = ${text}</text>`;

  const g0 =
    allEdges.map(([a, b]) => edgeLine(a, b)).join('') +
    allEdges.map(([a, b, w]) => edgeW(a, b, w)).join('') +
    [0, 1, 2, 3].map(node).join('') +
    total('0', '#7c8aa5');

  const groups = steps.map((s) => paint(s.a, s.b, s.take) + total(s.total, s.take ? C.good : C.bad));

  return `<div class="lp-chart">
<svg viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${groups[0]}</g>
  <g class="step" data-a="none" data-g="2">${groups[1]}</g>
  <g class="step" data-a="none" data-g="3">${groups[2]}</g>
  <g class="step" data-a="none" data-g="4">${groups[3]}</g>
  <g class="step" data-a="none" data-g="5">${groups[4]}</g>
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">n − 1</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The problem
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s2line}</p>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.4rem,4.4vw,2.6rem)">MST = n − 1 рёбер</div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── Kruskal's three steps
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">📶</div><h3>${t.s3c1t}</h3><p>${t.s3c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🤝</div><h3>${t.s3c2t}</h3><p>${t.s3c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🧩</div><h3>${t.s3c3t}</h3><p>${t.s3c3d}</p></div>
</div>`,

    // 4 ── Animated Kruskal trace
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
<div class="lp-cols">
  ${kruskalTrace()}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s4n3}</p></div>
    <div class="lp-card step" data-g="4" data-a="right"><p>${t.s4n4}</p></div>
    <div class="lp-card step" data-g="5" data-a="right"><p>${t.s4n5}</p></div>
  </div>
</div>`,

    // 5 ── The full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::sort(edges.begin(), edges.end(),
    [](const Edge &amp;x, const Edge &amp;y) {
        return x.w &lt; y.w;
    });
</span><span class="step" data-g="1" data-a="none">
for (auto &amp;e : edges) {
    if (find(e.a) != find(e.b)) {
</span><span class="step" data-g="2" data-a="none">        parent[find(e.a)] = find(e.b);
        total += e.w;
        used++;
    }
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s5run}</p>`,

    // 6 ── Why the greedy is correct
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s6line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>
<p class="lp-foot lp-center step">${t.s6prim}</p>`,

    // 7 ── Task teaser
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s7task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🛣️</div><p>${t.s7hint}</p></div>`,

    // 8 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">sort</span><span><b>${t.s8r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">DSU</span><span><b>${t.s8r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">n − 1</span><span><b>${t.s8r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">разрез</span><span><b>${t.s8r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s8cta}</p></div>
<p class="lp-foot lp-center step">${t.s8foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 4',
  title: 'Минимальное остовное дерево',
  subtitle: 'Алгоритм Краскала = сортировка рёбер + DSU — там, где жадность встречается с прошлым уроком',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Соединить всё, заплатив меньше всего',
  s2line: 'n городов нужно связать дорогами минимальной суммарной стоимости.',
  s2mark: 'Лишнее ребро в цикле можно выбросить без потери связности — поэтому ответ всегда дерево.',

  s3h: 'Алгоритм Краскала: три шага',
  s3c1t: '1. Сортировка',
  s3c1d: 'Отсортировать все рёбра по весу — от дешёвого к дорогому.',
  s3c2t: '2. Жадный выбор',
  s3c2d: 'Идти по списку и брать ребро, если оно соединяет РАЗНЫЕ компоненты.',
  s3c3t: '3. DSU стреляет',
  s3c3d: '«Разные ли компоненты» проверяет DSU из прошлого урока — вот где он пригодился!',

  s4h: 'Трасса примера: n = 4',
  s4task: 'Рёбра по возрастанию веса: 1–2 (1), 2–3 (2), 1–3 (2), 2–4 (4), 3–4 (5).',
  s4n1: '1–2, вес 1: разные компоненты — берём. Сумма 1.',
  s4n2: '2–3, вес 2: разные компоненты — берём. Сумма 1 + 2 = 3.',
  s4n3: '1–3, вес 2: 1 и 3 уже в одной компоненте через 1–2–3 — пропускаем, не тратим.',
  s4n4: '2–4, вес 4: разные компоненты — берём. Сумма 3 + 4 = 7.',
  s4n5: '3–4, вес 5: обе вершины уже связаны — пропускаем. Остов готов: 3 ребра, вес 7.',

  s5h: 'Краскал: весь код',
  s5n1: 'Сортируем рёбра по весу один раз в самом начале — O(m log m).',
  s5n2: 'find(a) != find(b) — «в разных ли компонентах» из DSU прошлого урока.',
  s5n3: 'Соединяем компоненты, засчитываем вес и растущее число использованных рёбер.',
  s5run: 'Запустите этот код в уроке — введите 4 5, затем рёбра 1 2 1, 2 3 2, 3 4 5, 1 3 2, 2 4 4.',

  s6h: 'Почему жадность верна',
  s6line: 'Самое дешёвое ребро через любой «разрез» графа обязательно лежит в каком-нибудь MST: если бы не лежало, добавление этого ребра создало бы цикл с более дорогим ребром через тот же разрез — выбросив его, получаем не худший остов.',
  s6mark: 'Это то же обменное рассуждение, что и в уроке про жадные алгоритмы.',
  s6prim: 'Существует и алгоритм Прима — тот же результат, но дерево растится от одной вершины, в стиле Дейкстры.',

  s7h: 'Задание',
  s7task: 'Программа сейчас печатает только суммарный вес остова.',
  s7hint: 'Измените её так, чтобы она печатала и сами рёбра остова — те, что прошли проверку find(e.a) != find(e.b).',

  s8h: 'Запомнить',
  s8r1: 'Сортировка рёбер по весу — первый шаг Краскала',
  s8r2: 'DSU проверяет «разные ли компоненты» почти бесплатно',
  s8r3: 'Остов всегда состоит ровно из n − 1 рёбер',
  s8r4: 'Доказательство — обменное рассуждение через разрез графа',
  s8cta: 'Допишите вывод рёбер остова и отметьте урок пройденным.',
  s8foot: 'Дальше — главная тема уровня: динамическое программирование, начиная с лестницы.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 4-деңгээл',
  title: 'Минималдуу каркас дарагы',
  subtitle: 'Краскалдын алгоритми = кырларды иреттөө + DSU — ач көздүк мурунку сабак менен жолукканда',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Баарын аз төлөп байланыштыруу',
  s2line: 'n шаарды минималдуу жалпы нарктагы жолдор менен байланыштыруу керек.',
  s2mark: 'Циклдеги ашыкча кырды байланышты жоготпой ыргытып салса болот — ошондуктан жооп дайыма дарак.',

  s3h: 'Краскалдын алгоритми: үч кадам',
  s3c1t: '1. Иреттөө',
  s3c1d: 'Бардык кырларды салмагы боюнча — арзандан кымбатка карай — иреттөө.',
  s3c2t: '2. Ач көз тандоо',
  s3c2d: 'Тизме боюнча жүрүп, кыр АР БАШКА компоненттерди бириктирсе — алуу.',
  s3c3t: '3. DSU атат',
  s3c3d: '«Компоненттер ар башкабы» дегенди мурунку сабактагы DSU текшерет — мына ал кайда керек болду!',

  s4h: 'Мисалдын трассасы: n = 4',
  s4task: 'Кырлар салмагынын өсүшү боюнча: 1–2 (1), 2–3 (2), 1–3 (2), 2–4 (4), 3–4 (5).',
  s4n1: '1–2, салмагы 1: ар башка компоненттер — алабыз. Сумма 1.',
  s4n2: '2–3, салмагы 2: ар башка компоненттер — алабыз. Сумма 1 + 2 = 3.',
  s4n3: '1–3, салмагы 2: 1 менен 3 эбак эле 1–2–3 аркылуу бир компоненте — өткөрүп жиберебиз, коротпойбуз.',
  s4n4: '2–4, салмагы 4: ар башка компоненттер — алабыз. Сумма 3 + 4 = 7.',
  s4n5: '3–4, салмагы 5: эки чоку тең эбак эле байланышкан — өткөрүп жиберебиз. Каркас даяр: 3 кыр, салмагы 7.',

  s5h: 'Краскал: толук код',
  s5n1: 'Кырларды салмагы боюнча башында бир жолу иреттейбиз — O(m log m).',
  s5n2: 'find(a) != find(b) — мурунку сабактагы DSU дан «ар башка компоненттердеби».',
  s5n3: 'Компоненттерди бириктиребиз, салмакты жана колдонулган кырлардын өсүп жаткан санын эсептейбиз.',
  s5run: 'Бул кодду сабактан иштетиңиз — 4 5, андан кийин кырлар 1 2 1, 2 3 2, 3 4 5, 1 3 2, 2 4 4 киргизиңиз.',

  s6h: 'Ач көздүк эмнеге туура',
  s6line: 'Графтын каалаган «кесиминдеги» эң арзан кыр милдеттүү түрдө кайсы бир MST де жатат: эгер жатпаса, бул кырды кошуу ошол эле кесим аркылуу кымбатыраак кыры бар цикл жаратмак — аны ыргытып, начар эмес каркас алабыз.',
  s6mark: 'Бул ач көз алгоритмдер сабагындагы эле алмаштыруу жүйөсү.',
  s6prim: 'Примдин алгоритми да бар — ошол эле жыйынтык, бирок дарак бир чокудан Дейкстра сыяктуу өстүрүлөт.',

  s7h: 'Тапшырма',
  s7task: 'Программа азыр каркастын жалпы салмагын гана басып чыгарат.',
  s7hint: 'Аны каркастын кырларынын өзүн да басып чыгаргыдай өзгөртүңүз — find(e.a) != find(e.b) текшерүүсүнөн өткөндөрдү.',

  s8h: 'Эсте сакта',
  s8r1: 'Кырларды салмагы боюнча иреттөө — Краскалдын биринчи кадамы',
  s8r2: 'DSU «ар башка компоненттердеби» дегенди дээрлик бекер текшерет',
  s8r3: 'Каркас ар дайым так n − 1 кырдан турат',
  s8r4: 'Далили — граф кесими аркылуу алмаштыруу жүйөсү',
  s8cta: 'Каркастын кырларын чыгарууну аяктап, сабакты өттүм деп белгилеңиз.',
  s8foot: 'Андан ары — деңгээлдин башкы темасы: тепкичтен башталган динамикалык программалоо.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 4',
  title: 'Minimum Spanning Tree',
  subtitle: 'Kruskal\'s algorithm = sorting edges + DSU — where greedy meets last lesson',
  press: 'Press → or Space to advance',

  s2h: 'Connect everything, pay the least',
  s2line: 'n cities need to be connected by roads of minimum total cost.',
  s2mark: 'A redundant edge in a cycle can be thrown away without losing connectivity — so the answer is always a tree.',

  s3h: 'Kruskal\'s algorithm: three steps',
  s3c1t: '1. Sort',
  s3c1d: 'Sort all the edges by weight — cheapest to most expensive.',
  s3c2t: '2. Greedy choice',
  s3c2d: 'Walk the list and take an edge if it connects DIFFERENT components.',
  s3c3t: '3. DSU shines',
  s3c3d: '"Are the components different" is checked by the DSU from the previous lesson — this is where it pays off!',

  s4h: 'The example trace: n = 4',
  s4task: 'Edges in increasing weight order: 1–2 (1), 2–3 (2), 1–3 (2), 2–4 (4), 3–4 (5).',
  s4n1: '1–2, weight 1: different components — take it. Total 1.',
  s4n2: '2–3, weight 2: different components — take it. Total 1 + 2 = 3.',
  s4n3: '1–3, weight 2: 1 and 3 are already in one component via 1–2–3 — skip it, no cost.',
  s4n4: '2–4, weight 4: different components — take it. Total 3 + 4 = 7.',
  s4n5: '3–4, weight 5: both endpoints are already connected — skip it. The tree is done: 3 edges, weight 7.',

  s5h: 'Kruskal: the full code',
  s5n1: 'Sort the edges by weight once, right at the start — O(m log m).',
  s5n2: 'find(a) != find(b) — "are they in different components", straight from last lesson\'s DSU.',
  s5n3: 'Merge the components, add the weight, and count the growing number of used edges.',
  s5run: 'Run this code in the lesson — enter 4 5, then the edges 1 2 1, 2 3 2, 3 4 5, 1 3 2, 2 4 4.',

  s6h: 'Why the greedy is correct',
  s6line: 'The cheapest edge across any "cut" of the graph necessarily belongs to some MST: if it didn\'t, adding it would create a cycle with a more expensive edge across the same cut — throw that one away and the tree is no worse.',
  s6mark: 'This is the same exchange argument from the greedy algorithms lesson.',
  s6prim: 'There is also Prim\'s algorithm — same result, but the tree grows from a single vertex, Dijkstra-style.',

  s7h: 'Task',
  s7task: 'The program currently prints only the spanning tree\'s total weight.',
  s7hint: 'Change it to also print the tree\'s own edges — the ones that passed the find(e.a) != find(e.b) check.',

  s8h: 'Remember',
  s8r1: 'Sorting edges by weight is Kruskal\'s first step',
  s8r2: 'DSU checks "are the components different" almost for free',
  s8r3: 'A spanning tree always has exactly n − 1 edges',
  s8r4: 'The proof is an exchange argument across a graph cut',
  s8cta: 'Finish printing the tree\'s edges and mark the lesson as completed.',
  s8foot: 'Next up: the level\'s main topic — dynamic programming, starting with the staircase.',
};

export const mst: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
