import type { LessonPresentationData } from './types';

// Presentation for the "Network Flows" lesson
// (olympiad-roadmap → level-6-expert → network-flows).
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

  s3h: string; s3line: string; s3mark: string;

  s4h: string;
  s4c1t: string; s4c1d: string;
  s4c2t: string; s4c2d: string;
  s4c3t: string; s4c3d: string;

  s5h: string; s5task: string;
  s5n1: string; s5n2: string; s5n3: string;

  s6h: string; s6n1: string; s6n2: string; s6n3: string; s6run: string; s6mark: string;

  s7h: string; s7line: string;
  s7lab1: string; s7lab2: string; s7lab3: string; s7lab4: string;
  s7mark: string;

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

// flowNetwork renders the exact worked example (source 1, sink 4, edges
// 1-2:3, 1-3:2, 2-3:1, 2-4:2, 3-4:3): the base graph is grey with capacity
// labels, then each reveal group highlights one real augmenting path found
// by Edmonds-Karp's BFS and labels the flow it pushes — additive, since a
// finished path stays visible once drawn.
function flowNetwork(l1: string, l2: string, l3: string): string {
  const pos = { s: { x: 24, y: 100 }, a: { x: 170, y: 34 }, b: { x: 170, y: 166 }, t: { x: 320, y: 100 } };
  const r = 20;

  const node = (key: keyof typeof pos, label: string, color?: string) => {
    const p = pos[key];
    return (
      `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${color ? color + '22' : 'rgba(255,255,255,.05)'}" stroke="${color ?? 'rgba(255,255,255,.3)'}" stroke-width="${color ? 2.3 : 1.6}"/>` +
      `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle" fill="${color ?? '#e2e8f0'}" font-size="15" font-family="monospace">${label}</text>`
    );
  };
  const edge = (from: keyof typeof pos, to: keyof typeof pos, cap: number, color?: string) => {
    const p1 = pos[from], p2 = pos[to];
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const x1 = p1.x + ux * r, y1 = p1.y + uy * r;
    const x2 = p2.x - ux * (r + 6), y2 = p2.y - uy * (r + 6);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const c = color ?? 'rgba(255,255,255,.28)';
    return (
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${color ? 2.6 : 1.6}"/>` +
      `<polygon points="0,-4 8,0 0,4" fill="${c}" transform="translate(${x2},${y2}) rotate(${(Math.atan2(dy, dx) * 180) / Math.PI})"/>` +
      `<rect x="${mx - 9}" y="${my - 10}" width="18" height="16" rx="4" fill="#0b1020"/>` +
      `<text x="${mx}" y="${my + 2}" text-anchor="middle" fill="${color ?? '#7c8aa5'}" font-size="11" font-family="monospace">${cap}</text>`
    );
  };
  const label = (text: string, color: string) => `<text x="24" y="216" fill="${color}" font-size="13" font-family="monospace">${text}</text>`;

  const base =
    edge('s', 'a', 3) + edge('s', 'b', 2) + edge('a', 'b', 1) + edge('a', 't', 2) + edge('b', 't', 3) +
    node('s', 's') + node('a', '2') + node('b', '3') + node('t', 't');

  const g0 = base;
  const g1 = edge('s', 'a', 3, C.good) + edge('a', 't', 2, C.good) + label(l1, C.good);
  const g2 = edge('s', 'b', 2, C.info) + edge('b', 't', 3, C.info) + label(l2, C.info);
  const g3 = edge('s', 'a', 3, C.warn) + edge('a', 'b', 1, C.warn) + edge('b', 't', 3, C.warn) + label(l3, C.warn);

  return `<div class="lp-chart">
<svg viewBox="0 0 344 226" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
  <g class="step" data-a="none" data-g="3">${g3}</g>
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">s → t</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The idea
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>🕸️ ${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step" data-a="right"><h3>💧 ${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
</div>`,

    // 3 ── The min-cut theorem
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.3rem,4vw,2.2rem)">max flow = min cut</div>
</div>
<p class="lp-p lp-center step" style="margin-top:16px">${t.s3line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s3mark}</span></p>`,

    // 4 ── Edmonds-Karp: three ideas
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🌊</div><h3>${t.s4c1t}</h3><p>${t.s4c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">⬇️</div><h3>${t.s4c2t}</h3><p>${t.s4c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">↩️</div><h3>${t.s4c3t}</h3><p>${t.s4c3d}</p></div>
</div>`,

    // 5 ── Animated flow trace
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s5task}</p>
<div class="lp-cols">
  ${flowNetwork(t.s5n1, t.s5n2, t.s5n3)}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>`,

    // 6 ── The full code
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">long long add;
while ((add = bfs(1, n, parent)) &gt; 0) {
    flow += add;
</span><span class="step" data-g="1" data-a="none">    int v = n;
    while (v != 1) {
        int p = parent[v];
</span><span class="step" data-g="2" data-a="none">        cap[p][v] -= add;
        cap[v][p] += add;
        v = p;
    }
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s6n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s6n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s6n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s6run}</p>
<p class="lp-p lp-center step" data-g="3"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Application: bipartite matching
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s7line}</p>
<div class="lp-chips" style="margin-top:10px">
  <span class="lp-chip step" style="--c:${C.acc}">${t.s7lab1}</span>
  <span class="lp-arr step">→</span>
  <span class="lp-chip step" style="--c:${C.info}">${t.s7lab2}</span>
  <span class="lp-arr step">→</span>
  <span class="lp-chip step" style="--c:${C.warn}">${t.s7lab3}</span>
  <span class="lp-arr step">→</span>
  <span class="lp-chip step" style="--c:${C.good}">${t.s7lab4}</span>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s7mark}</span></p>`,

    // 8 ── Task teaser
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🧑‍🔧</div><p>${t.s8hint}</p></div>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">BFS</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">residual</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">min-cut</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">matching</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 6',
  title: 'Потоки в сетях',
  subtitle: 'Максимальный поток из истока в сток — и удивительная связь с минимальным разрезом',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Сеть и поток',
  s2c1t: 'Сеть',
  s2c1d: 'Ориентированный граф, где у каждого ребра есть пропускная способность — сколько может пройти через него.',
  s2c2t: 'Максимальный поток',
  s2c2d: 'Сколько «жидкости» получится прогнать из истока s в сток t, не превышая ни одной пропускной способности.',

  s3h: 'Фундаментальная теорема',
  s3line: 'Максимальный поток равен минимальному разрезу — минимальной суммарной пропускной способности рёбер, удаление которых разделяет s и t.',
  s3mark: 'Поэтому потоками решают и «сколько прогнать», и «что перерезать», чтобы остановить всё.',

  s4h: 'Алгоритм Эдмондса-Карпа',
  s4c1t: 'Ищем путь через BFS',
  s4c1d: 'Пока существует путь из s в t с положительной остаточной пропускной способностью — находим его в ширину.',
  s4c2t: 'Уменьшаем прямые рёбра',
  s4c2d: 'Пускаем поток по найденному пути — прямая пропускная способность каждого ребра падает на величину потока.',
  s4c3t: 'Увеличиваем обратные',
  s4c3d: 'Обратное ребро растёт на ту же величину — оно позволяет алгоритму «передумать» и перенаправить поток позже.',

  s5h: 'Трасса примера: исток 1, сток 4',
  s5task: 'Три последовательных пути BFS, каждый выжимает максимум из своего узкого места.',
  s5n1: '1 → 2 → 4: минимум пропускных способностей 3 и 2 — проходит 2. Первый поток найден.',
  s5n2: '1 → 3 → 4: минимум 2 и 3 — проходит ещё 2. Путь независим от первого.',
  s5n3: '1 → 2 → 3 → 4: у 1→2 осталось 1, у 2→3 — 1, у 3→4 — 1 — проходит ещё 1. Больше путей нет: максимальный поток = 5.',

  s6h: 'Эдмондс-Карп: весь код',
  s6n1: 'Пока BFS находит путь с положительным остатком — добавляем его пропускную способность к общему потоку.',
  s6n2: 'Идём назад по цепочке parent от стока к истоку — это и есть найденный путь.',
  s6n3: 'На каждом ребре пути: прямая пропускная способность падает, обратная растёт — обновление остаточной сети.',
  s6run: 'Запустите этот код в уроке — введите 4 5, затем рёбра 1 2 3, 1 3 2, 2 3 1, 2 4 2, 3 4 3.',
  s6mark: 'Сложность Эдмондса-Карпа — O(V·E²); для плотных графов есть более быстрый алгоритм Диница.',

  s7h: 'Главное применение: паросочетания',
  s7line: 'Максимальное число пар «студент — проект», где каждый участвует не больше чем в одной паре — это тоже поток.',
  s7lab1: 'исток',
  s7lab2: 'студенты (1)',
  s7lab3: 'проекты (1)',
  s7lab4: 'сток',
  s7mark: 'Пропускная способность 1 на каждом ребре к студенту и от проекта гарантирует: один студент — одна пара. Максимальный поток = максимальное паросочетание.',

  s8h: 'Задание',
  s8task: '3 работника, 3 задачи — у каждого работника свой список задач, которые он умеет делать.',
  s8hint: 'Смоделируйте на бумаге как сеть: 1 — исток, 2-4 — работники, 5-7 — задачи, 8 — сток. Прогоните через программу с предыдущего слайда.',

  s9h: 'Запомнить',
  s9r1: 'BFS ищет кратчайший путь с положительной остаточной пропускной способностью',
  s9r2: 'Обратные рёбра остаточной сети позволяют перенаправить уже пущенный поток',
  s9r3: 'Максимальный поток = минимальный разрез — одна теорема, два взгляда на задачу',
  s9r4: 'Двудольное паросочетание — частный случай потока с пропускными способностями 1',
  s9cta: 'Смоделируйте задачу про работников и задачи и отметьте урок пройденным.',
  s9foot: 'Дальше — суффиксные структуры: суффиксный массив и что он открывает.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 6-деңгээл',
  title: 'Тармактагы агымдар',
  subtitle: 'Булактан агызгычка чейинки максималдуу агым — жана минималдуу кесүү менен таң калаарлык байланыш',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Тармак жана агым',
  s2c1t: 'Тармак',
  s2c1d: 'Ар бир кырында өткөрүү жөндөмдүүлүгү бар багытталган граф — анын аркылуу канча өтө алат.',
  s2c2t: 'Максималдуу агым',
  s2c2d: 'Бир да өткөрүү жөндөмдүүлүгүн ашырбай, s булагынан t агызгычка канча «суюктук» өткөрсө болот.',

  s3h: 'Фундаменталдуу теорема',
  s3line: 'Максималдуу агым минималдуу кесүүгө барабар — s менен t ди бөлүүчү кырлардын минималдуу жалпы өткөрүү жөндөмдүүлүгү.',
  s3mark: 'Ошондуктан агымдар менен «канча өткөрсө болот» жана «баарын токтотуу үчүн эмнени кесүү керек» экөө тең чечилет.',

  s4h: 'Эдмондс-Карп алгоритми',
  s4c1t: 'BFS менен жол издейбиз',
  s4c1d: 's ден t ге чейин оң калдык өткөрүү жөндөмдүүлүгү бар жол бар болсо — аны туурасынан издейбиз.',
  s4c2t: 'Түз кырларды азайтабыз',
  s4c2d: 'Табылган жол боюнча агым жиберебиз — ар бир кырдын түз өткөрүү жөндөмдүүлүгү агымдын өлчөмүнө азаят.',
  s4c3t: 'Тескерилерин көбөйтөбүз',
  s4c3d: 'Тескери кыр ошол эле өлчөмгө өсөт — бул алгоритмге «оюн өзгөртүп», агымды кийинчерээк башка жакка багыттоого мүмкүнчүлүк берет.',

  s5h: 'Мисалдын трассасы: булак 1, агызгыч 4',
  s5task: 'BFS дин үч ирети жол, ар бири өз тар жеринен максимумду сыгып алат.',
  s5n1: '1 → 2 → 4: 3 жана 2 өткөрүү жөндөмдүүлүктөрүнүн минимуму — 2 өтөт. Биринчи агым табылды.',
  s5n2: '1 → 3 → 4: 2 жана 3 тун минимуму — дагы 2 өтөт. Жол биринчисинен көз каранды эмес.',
  s5n3: '1 → 2 → 3 → 4: 1→2 де 1 калды, 2→3 те — 1, 3→4 тө — 1 — дагы 1 өтөт. Башка жол жок: максималдуу агым = 5.',

  s6h: 'Эдмондс-Карп: толук код',
  s6n1: 'BFS оң калдыгы бар жол тапкан бойдон — анын өткөрүү жөндөмдүүлүгүн жалпы агымга кошобуз.',
  s6n2: 'parent чынжыры боюнча агызгычтан булакка чейин артка жүрөбүз — бул табылган жол.',
  s6n3: 'Жолдун ар бир кырында: түз өткөрүү жөндөмдүүлүгү азаят, тескериси өсөт — калдык тармакты жаңылоо.',
  s6run: 'Бул кодду сабактан иштетиңиз — 4 5, андан кийин кырлар 1 2 3, 1 3 2, 2 3 1, 2 4 2, 3 4 3 киргизиңиз.',
  s6mark: 'Эдмондс-Карптын татаалдыгы — O(V·E²); тыгыз графтар үчүн тезирээк Диниц алгоритми бар.',

  s7h: 'Башкы колдонулушу: паросочетаниелер',
  s7line: '«студент — долбоор» түгөйлөрүнүн максималдуу саны, мында ар ким бир гана түгөйдө катышат — бул да агым.',
  s7lab1: 'булак',
  s7lab2: 'студенттер (1)',
  s7lab3: 'долбоорлор (1)',
  s7lab4: 'агызгыч',
  s7mark: 'Студентке чейинки жана долбоордон кийинки ар бир кырдагы 1 өткөрүү жөндөмдүүлүгү кепилдейт: бир студент — бир түгөй. Максималдуу агым = максималдуу паросочетание.',

  s8h: 'Тапшырма',
  s8task: '3 жумушчу, 3 тапшырма — ар бир жумушчунун өзү жасай ала турган тапшырмаларынын тизмеси бар.',
  s8hint: 'Кагазда тармак катары моделдеңиз: 1 — булак, 2-4 — жумушчулар, 5-7 — тапшырмалар, 8 — агызгыч. Мурунку слайддагы программадан өткөрүңүз.',

  s9h: 'Эсте сакта',
  s9r1: 'BFS оң калдык өткөрүү жөндөмдүүлүгү бар эң кыска жолду издейт',
  s9r2: 'Калдык тармактын тескери кырлары эбак жиберилген агымды кайра багыттоого мүмкүндүк берет',
  s9r3: 'Максималдуу агым = минималдуу кесүү — бир теорема, маселеге эки көз караш',
  s9r4: 'Эки бөлүктүү паросочетание — өткөрүү жөндөмдүүлүктөрү 1 болгон агымдын жеке учуру',
  s9cta: 'Жумушчулар жана тапшырмалар маселесин моделдеп, сабакты өттүм деп белгилеңиз.',
  s9foot: 'Андан ары — суффикстик структуралар: суффикстик массив жана анын ачкан мүмкүнчүлүктөрү.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 6',
  title: 'Network Flows',
  subtitle: 'The maximum flow from a source to a sink — and its surprising link to the minimum cut',
  press: 'Press → or Space to advance',

  s2h: 'The network and the flow',
  s2c1t: 'A network',
  s2c1d: 'A directed graph where every edge has a capacity — how much can pass through it.',
  s2c2t: 'Maximum flow',
  s2c2d: 'How much "fluid" can be pushed from source s to sink t without exceeding any capacity.',

  s3h: 'The fundamental theorem',
  s3line: 'The maximum flow equals the minimum cut — the minimum total capacity of edges whose removal separates s and t.',
  s3mark: 'That is why flows solve both "how much can we push" and "what should we sever to stop everything".',

  s4h: 'The Edmonds-Karp algorithm',
  s4c1t: 'Find a path via BFS',
  s4c1d: 'While there is a path from s to t with positive residual capacity — find it breadth-first.',
  s4c2t: 'Decrease forward edges',
  s4c2d: 'Push flow along the path found — every edge\'s forward capacity drops by the amount of flow.',
  s4c3t: 'Increase reverse edges',
  s4c3d: 'The reverse edge grows by the same amount — it lets the algorithm "change its mind" and reroute flow later.',

  s5h: 'The example trace: source 1, sink 4',
  s5task: 'Three consecutive BFS paths, each squeezing the maximum out of its own bottleneck.',
  s5n1: '1 → 2 → 4: the minimum of capacities 3 and 2 — 2 gets through. The first flow is found.',
  s5n2: '1 → 3 → 4: the minimum of 2 and 3 — 2 more get through. This path is independent of the first.',
  s5n3: '1 → 2 → 3 → 4: 1→2 has 1 left, 2→3 has 1, 3→4 has 1 — 1 more gets through. No paths remain: maximum flow = 5.',

  s6h: 'Edmonds-Karp: the full code',
  s6n1: 'As long as BFS finds a path with a positive remainder — add its capacity to the total flow.',
  s6n2: 'Walk backward along the parent chain from sink to source — that is the path just found.',
  s6n3: 'On every edge of the path: the forward capacity drops, the reverse one grows — updating the residual network.',
  s6run: 'Run this code in the lesson — enter 4 5, then the edges 1 2 3, 1 3 2, 2 3 1, 2 4 2, 3 4 3.',
  s6mark: 'Edmonds-Karp\'s complexity is O(V·E²); for dense graphs there is the faster Dinic\'s algorithm.',

  s7h: 'The main application: matching',
  s7line: 'The maximum number of "student — project" pairs, where everyone takes part in at most one pair — this is a flow too.',
  s7lab1: 'source',
  s7lab2: 'students (1)',
  s7lab3: 'projects (1)',
  s7lab4: 'sink',
  s7mark: 'A capacity of 1 on every edge to a student and from a project guarantees: one student, one pair. Maximum flow = maximum matching.',

  s8h: 'Task',
  s8task: '3 workers, 3 jobs — each worker has their own list of jobs they know how to do.',
  s8hint: 'Model it on paper as a network: 1 — the source, 2-4 — the workers, 5-7 — the jobs, 8 — the sink. Run it through the program from the previous slide.',

  s9h: 'Remember',
  s9r1: 'BFS finds the shortest path with positive residual capacity',
  s9r2: 'The residual network\'s reverse edges let already-pushed flow be rerouted',
  s9r3: 'Maximum flow = minimum cut — one theorem, two views of the same problem',
  s9r4: 'Bipartite matching is a special case of flow with capacity 1 everywhere',
  s9cta: 'Model the workers-and-jobs problem and mark the lesson as completed.',
  s9foot: 'Next up: suffix structures — the suffix array and what it unlocks.',
};

export const networkFlows: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
