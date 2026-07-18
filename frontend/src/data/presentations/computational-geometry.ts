import type { LessonPresentationData } from './types';

// Presentation for the "Computational Geometry" lesson
// (olympiad-roadmap → level-6-expert → computational-geometry).
// This is the FINAL lesson of the entire roadmap — slide 9 closes not just
// the lesson but the whole path.
// Slide structure is single-sourced in buildSlides(); the three language
// tables below carry only the strings.

interface L {
  kicker: string;
  title: string;
  subtitle: string;
  press: string;

  s2h: string; s2line: string; s2mark: string;

  s3h: string; s3task: string;
  s3n1: string; s3n2: string; s3n3: string; s3n4: string;

  s4h: string; s4n1: string; s4n2: string; s4run: string; s4mark: string;

  s5h: string; s5c1t: string; s5c1d: string; s5c2t: string; s5c2d: string;

  s6h: string; s6task: string; s6n1: string; s6n2: string;

  s7h: string; s7n1: string; s7n2: string; s7run: string; s7mark: string;

  s8h: string; s8task: string; s8hint: string;

  s9h: string; s9line: string; s9r1: string; s9r2: string; s9r3: string; s9r4: string;
  s9cta: string; s9foot: string;
}

const C = {
  good: '#34d399',
  bad: '#f87171',
  warn: '#fbbf24',
  info: '#60a5fa',
  acc: '#818cf8',
};

// polygonArea renders the shoelace-formula trace on the rectangle (0,0)
// (4,0) (4,3) (0,3): the base outline is grey, each reveal group highlights
// one edge and redraws the running total on top of the previous one — the
// overlay technique used throughout this series.
function polygonArea(): string {
  const pts: [number, number][] = [[0, 0], [4, 0], [4, 3], [0, 3]];
  const sx = (x: number) => 30 + x * 26;
  const sy = (y: number) => 130 - y * 26;
  const r = 5;

  const dot = (i: number) => `<circle cx="${sx(pts[i][0])}" cy="${sy(pts[i][1])}" r="${r}" fill="#94a3b8"/>`;
  const edgeLine = (i: number, j: number, color?: string, w = 1.6) =>
    `<line x1="${sx(pts[i][0])}" y1="${sy(pts[i][1])}" x2="${sx(pts[j][0])}" y2="${sy(pts[j][1])}" stroke="${color ?? 'rgba(255,255,255,.28)'}" stroke-width="${w}"/>`;
  const total = (text: string, color: string) =>
    `<rect x="150" y="60" width="150" height="34" rx="8" fill="#0b1020"/>` +
    `<text x="225" y="82" text-anchor="middle" fill="${color}" font-size="15" font-weight="700" font-family="monospace">${text}</text>`;

  const g0 = [0, 1, 2, 3].map((i) => edgeLine(i, (i + 1) % 4)).join('') + [0, 1, 2, 3].map(dot).join('') + total('area₂ = 0', '#7c8aa5');
  const g1 = edgeLine(0, 1, C.info, 3) + total('area₂ = 0', C.info);
  const g2 = edgeLine(1, 2, C.warn, 3) + total('area₂ = 0 + 12', C.warn);
  const g3 = edgeLine(2, 3, C.good, 3) + total('area₂ = 12 + 12', C.good);
  const g4 = edgeLine(3, 0, C.acc, 3) + total('area = 24 / 2 = 12', C.acc);

  return `<div class="lp-chart">
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
  <g class="step" data-a="none" data-g="3">${g3}</g>
  <g class="step" data-a="none" data-g="4">${g4}</g>
</svg>
</div>`;
}

// convexHull renders the exact worked example on 6 points: group 0 shows
// all 6 as plain dots, group 1 draws the 5-vertex hull boundary in green and
// dims the interior point (1,1) — it never made the cut.
function convexHull(): string {
  const pts: Record<string, [number, number]> = {
    a: [40, 100], b: [180, 100], c: [110, 60], d: [180, 20], e: [40, 20], f: [110, 140],
  };
  const hullOrder: (keyof typeof pts)[] = ['a', 'f', 'b', 'd', 'e'];

  const dot = (key: keyof typeof pts, color: string, r: number) =>
    `<circle cx="${pts[key][0]}" cy="${pts[key][1]}" r="${r}" fill="${color}"/>`;
  const label = (key: keyof typeof pts, text: string, color: string) =>
    `<text x="${pts[key][0]}" y="${pts[key][1] - 12}" text-anchor="middle" fill="${color}" font-size="11" font-family="monospace">${text}</text>`;

  const g0 =
    (['a', 'b', 'c', 'd', 'e', 'f'] as const).map((k) => dot(k, '#94a3b8', 5)).join('') +
    label('a', '(0,0)', '#7c8aa5') + label('b', '(2,0)', '#7c8aa5') + label('c', '(1,1)', '#7c8aa5') +
    label('d', '(2,2)', '#7c8aa5') + label('e', '(0,2)', '#7c8aa5') + label('f', '(1,−1)', '#7c8aa5');

  const poly = hullOrder.map((k) => `${pts[k][0]},${pts[k][1]}`).join(' ');
  const g1 =
    `<polygon points="${poly}" fill="${C.good}14" stroke="${C.good}" stroke-width="2.4"/>` +
    hullOrder.map((k) => dot(k, C.good, 6)).join('') +
    dot('c', C.bad, 5) +
    `<text x="${pts.c[0]}" y="${pts.c[1] + 20}" text-anchor="middle" fill="${C.bad}" font-size="11" font-family="monospace">внутри</text>`;

  return `<div class="lp-chart">
<svg viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">O × A × B</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The cross product
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1rem,3.2vw,1.5rem)">cross(O,A,B) = (Ax−Ox)(By−Oy) − (Ay−Oy)(Bx−Ox)</div>
</div>
<p class="lp-p lp-center step" style="margin-top:16px">${t.s2line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── Animated shoelace formula
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s3task}</p>
<div class="lp-cols">
  ${polygonArea()}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s3n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s3n2}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s3n3}</p></div>
    <div class="lp-card step" data-g="4" data-a="right"><p>${t.s3n4}</p></div>
  </div>
</div>`,

    // 4 ── Area: full code
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">long long area2 = 0;
for (int i = 0; i &lt; n; i++) {
    int j = (i + 1) % n;
    area2 += x[i]*y[j] - x[j]*y[i];
}
</span><span class="step" data-g="1" data-a="none">if (area2 &lt; 0) area2 = -area2;</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n2}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s4run}</p>
<p class="lp-p lp-center step" data-g="2"><span class="lp-mark">${t.s4mark}</span></p>`,

    // 5 ── The convex hull idea
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>⬇️ ${t.s5c1t}</h3><p>${t.s5c1d}</p></div>
  <div class="lp-card step" data-a="right"><h3>⬆️ ${t.s5c2t}</h3><p>${t.s5c2d}</p></div>
</div>`,

    // 6 ── Animated convex hull
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s6task}</p>
${convexHull()}
<div class="lp-notes" style="margin-top:2px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s6n1}</p></div>
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s6n2}</p></div>
</div>`,

    // 7 ── Convex hull: the key check
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.2rem,3.6vw,1.9rem)">cross(...) ≤ 0 → pop_back()</div>
</div>
<p class="lp-p lp-center step" style="margin-top:16px">${t.s7n1}</p>
<p class="lp-p lp-center step">${t.s7n2}</p>
<p class="lp-foot lp-center step">▶ ${t.s7run}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s7mark}</span></p>`,

    // 8 ── Task teaser
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🧩</div><p>${t.s8hint}</p></div>`,

    // 9 ── FINALE: recap + the whole roadmap is complete
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s9line}</p>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">cross()</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">shoelace</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">целые числа</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">monotone chain</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏁</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 6',
  title: 'Вычислительная геометрия',
  subtitle: 'Векторное произведение, площадь многоугольника и выпуклая оболочка',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Один инструмент почти для всего',
  s2line: 'Знак cross(O, A, B) говорит, куда поворачивает ломаная O→A→B: плюс — против часовой стрелки, минус — по часовой, ноль — три точки на одной прямой.',
  s2mark: 'Модуль cross(O, A, B) равен удвоенной площади треугольника OAB — вот откуда берётся формула площади многоугольника.',

  s3h: 'Формула шнурков: прямоугольник 4 × 3',
  s3task: 'Сумма косых произведений последовательных вершин — по контуру, ребро за ребром.',
  s3n1: 'Ребро (0,0)→(4,0): вклад в area₂ равен нулю — ребро лежит на оси.',
  s3n2: 'Ребро (4,0)→(4,3): вклад +12.',
  s3n3: 'Ребро (4,3)→(0,3): вклад ещё +12.',
  s3n4: 'Последнее ребро (0,3)→(0,0) снова даёт ноль. area₂ = 24, площадь = 12.',

  s4h: 'Площадь многоугольника: весь код',
  s4n1: 'Один проход по вершинам, j — следующая вершина по кругу (с возвратом в начало).',
  s4n2: 'Обход мог быть по часовой стрелке — тогда area2 отрицательна, поэтому берём модуль.',
  s4run: 'Запустите этот код в уроке — введите 4, затем вершины 0 0, 4 0, 4 3, 0 3.',
  s4mark: 'Всё в целых числах: храним удвоенную площадь и делим только при выводе — double здесь не нужен.',

  s5h: 'Выпуклая оболочка: алгоритм Эндрю',
  s5c1t: 'Нижняя цепочка',
  s5c1d: 'Точки отсортированы по x. Идём слева направо, выбрасывая точки, дающие поворот не туда.',
  s5c2t: 'Верхняя цепочка',
  s5c2d: 'То же самое справа налево. Вместе цепочки замыкают минимальный выпуклый многоугольник.',

  s6h: 'Оболочка шести точек',
  s6task: '(0,0), (2,0), (1,1), (2,2), (0,2), (1,−1) — какие из них на границе?',
  s6n1: 'Пять точек образуют границу оболочки в порядке против часовой стрелки.',
  s6n2: 'Точка (1,1) оказалась внутри — она не поворачивает наружу ни на одном шаге и не проходит проверку.',

  s7h: 'Ключевая проверка',
  s7n1: 'Пока последний поворот в строящейся цепочке «не туда» (cross ≤ 0) — выбрасываем предыдущую точку.',
  s7n2: 'Условие ≤ 0 выбрасывает и точки на прямой; замените на < 0, если коллинеарные точки нужно оставить.',
  s7run: 'Запустите этот код в уроке — введите 6, затем точки 0 0, 2 0, 1 1, 2 2, 0 2, 1 -1.',
  s7mark: 'O(n log n) целиком уходит на сортировку по x — сам проход по точкам линеен.',

  s8h: 'Задание',
  s8task: 'У вас есть готовая выпуклая оболочка из прошлого слайда.',
  s8hint: 'Посчитайте её площадь формулой шнурков — те же вершины, тот же код со слайда про площадь. Две темы урока соединяются в одно решение.',

  s9h: 'Вы прошли весь путь олимпиадника!',
  s9line: 'От сложности алгоритмов до вычислительной геометрии — 6 уровней, 22 темы, десятки задач позади.',
  s9r1: 'cross(O, A, B) — знак поворота и удвоенная площадь треугольника',
  s9r2: 'Формула шнурков — площадь любого многоугольника за один проход',
  s9r3: 'Геометрия любит целые числа: double — источник самых коварных багов',
  s9r4: 'Monotone chain — выпуклая оболочка за O(n log n) на сортировке',
  s9cta: 'Отметьте урок пройденным — и весь маршрут вместе с ним. Дальше только практика: решайте задачи, участвуйте в соревнованиях, возвращайтесь к урокам как к справочнику.',
  s9foot: 'Удачи! 🏆',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 6-деңгээл',
  title: 'Эсептөө геометриясы',
  subtitle: 'Вектордук көбөйтүндү, көп бурчтуктун аянты жана дөң кабык',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Дээрлик баары үчүн бир курал',
  s2line: 'cross(O, A, B) дин белгиси O→A→B сынык сызыгы кайда бураларын айтат: плюс — саат жебесине каршы, минус — саат жебеси боюнча, нөл — үч чекит бир түз сызыкта.',
  s2mark: 'cross(O, A, B) дин модулу OAB үч бурчтугунун эселенген аянтына барабар — көп бурчтуктун аянт формуласы дал ушундан келип чыгат.',

  s3h: 'Бүчүлүк формуласы: 4 × 3 тик бурчтук',
  s3task: 'Удаалаш чокулардын кыйшык көбөйтүндүлөрүнүн суммасы — контур боюнча, кыр-кыр менен.',
  s3n1: '(0,0)→(4,0) кыры: area₂ ге салымы нөлгө барабар — кыр октун үстүндө жатат.',
  s3n2: '(4,0)→(4,3) кыры: салымы +12.',
  s3n3: '(4,3)→(0,3) кыры: дагы +12 салым.',
  s3n4: 'Акыркы (0,3)→(0,0) кыры кайра нөл берет. area₂ = 24, аянт = 12.',

  s4h: 'Көп бурчтуктун аянты: толук код',
  s4n1: 'Чокулар боюнча бир өтүү, j — тегерек боюнча кийинки чоку (аягында башына кайтуу менен).',
  s4n2: 'Кыдыруу саат жебеси боюнча болушу мүмкүн болчу — анда area2 терс, ошондуктан модулун алабыз.',
  s4run: 'Бул кодду сабактан иштетиңиз — 4, андан кийин чокулар 0 0, 4 0, 4 3, 0 3 киргизиңиз.',
  s4mark: 'Баары бүтүн сандарда: эселенген аянтты сактайбыз да чыгарууда гана бөлөбүз — бул жерде double керек эмес.',

  s5h: 'Дөң кабык: Эндрюнун алгоритми',
  s5c1t: 'Ылдыйкы чынжыр',
  s5c1d: 'Чекиттер x боюнча иреттелген. Солдон оңго жүрөбүз, туура эмес жакка бурулган чекиттерди ыргытып.',
  s5c2t: 'Жогорку чынжыр',
  s5c2d: 'Ошол эле нерсе оңдон солго. Экөө чогуу минималдуу дөң көп бурчтукту жабат.',

  s6h: 'Алты чекиттин кабыгы',
  s6task: '(0,0), (2,0), (1,1), (2,2), (0,2), (1,−1) — алардын кайсынысы чегарада?',
  s6n1: 'Беш чекит саат жебесине каршы тартипте кабыктын чегарасын түзөт.',
  s6n2: '(1,1) чекити ичинде калды — ал бир да кадамда сыртка бурулбайт жана текшерүүдөн өтпөйт.',

  s7h: 'Негизги текшерүү',
  s7n1: 'Курулуп жаткан чынжырдагы акыркы бурулуш «туура эмес жакка» болсо (cross ≤ 0) — мурунку чекитти ыргытабыз.',
  s7n2: '≤ 0 шарты түз сызыктагы чекиттерди да ыргытат; коллинеардык чекиттерди калтыруу керек болсо < 0 менен алмаштырыңыз.',
  s7run: 'Бул кодду сабактан иштетиңиз — 6, андан кийин чекиттер 0 0, 2 0, 1 1, 2 2, 0 2, 1 -1 киргизиңиз.',
  s7mark: 'O(n log n) толугу менен x боюнча иреттөөгө кетет — чекиттер боюнча өтүүнүн өзү сызыктуу.',

  s8h: 'Тапшырма',
  s8task: 'Мурунку слайддан даяр дөң кабыгыңыз бар.',
  s8hint: 'Анын аянтын бүчүлүк формуласы менен эсептеңиз — ошол эле чокулар, аянт слайдындагы эле код. Сабактын эки темасы бир чечимде биригет.',

  s9h: 'Сиз олимпиадачынын бүт жолун өттүңүз!',
  s9line: 'Алгоритмдердин татаалдыгынан баштап эсептөө геометриясына чейин — 6 деңгээл, 22 тема, ондогон маселе артта калды.',
  s9r1: 'cross(O, A, B) — бурулуштун белгиси жана үч бурчтуктун эселенген аянты',
  s9r2: 'Бүчүлүк формуласы — каалаган көп бурчтуктун аянты бир өтүүдө',
  s9r3: 'Геометрия бүтүн сандарды жакшы көрөт: double — эң митайым багдардын булагы',
  s9r4: 'Monotone chain — iреттөөдө O(n log n) убакыттагы дөң кабык',
  s9cta: 'Сабакты өттүм деп белгилеңиз — жана аны менен бүт маршрутту да. Мындан ары — практика гана: маселелерди чечиңиз, мелдештерге катышыңыз, сабактарга маалымдама катары кайрылып туруңуз.',
  s9foot: 'Ийгилик! 🏆',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 6',
  title: 'Computational Geometry',
  subtitle: 'The cross product, polygon area, and the convex hull',
  press: 'Press → or Space to advance',

  s2h: 'One tool for almost everything',
  s2line: "The sign of cross(O, A, B) tells you which way the polyline O→A→B turns: plus — counterclockwise, minus — clockwise, zero — the three points are collinear.",
  s2mark: 'The magnitude of cross(O, A, B) equals twice the area of triangle OAB — that\'s exactly where the polygon area formula comes from.',

  s3h: 'The shoelace formula: a 4 × 3 rectangle',
  s3task: 'The sum of cross products of consecutive vertices — around the contour, edge by edge.',
  s3n1: 'Edge (0,0)→(4,0): its contribution to area₂ is zero — it lies on the axis.',
  s3n2: 'Edge (4,0)→(4,3): contributes +12.',
  s3n3: 'Edge (4,3)→(0,3): another +12.',
  s3n4: 'The last edge (0,3)→(0,0) gives zero again. area₂ = 24, area = 12.',

  s4h: 'Polygon area: the full code',
  s4n1: 'One pass over the vertices, j is the next vertex around the loop (wrapping back to the start).',
  s4n2: 'The traversal might have gone clockwise — then area2 comes out negative, so we take the absolute value.',
  s4run: 'Run this code in the lesson — enter 4, then the vertices 0 0, 4 0, 4 3, 0 3.',
  s4mark: 'Everything in integers: store twice the area and divide only when printing — no double needed here.',

  s5h: "The convex hull: Andrew's algorithm",
  s5c1t: 'The lower chain',
  s5c1d: 'Points are sorted by x. Walk left to right, discarding points that turn the wrong way.',
  s5c2t: 'The upper chain',
  s5c2d: 'The same thing, right to left. Together the chains close the smallest convex polygon.',

  s6h: 'The hull of six points',
  s6task: '(0,0), (2,0), (1,1), (2,2), (0,2), (1,−1) — which of them lie on the boundary?',
  s6n1: 'Five points form the hull boundary in counterclockwise order.',
  s6n2: 'The point (1,1) ends up inside — it never turns outward at any step, so it never passes the check.',

  s7h: 'The key check',
  s7n1: 'While the last turn of the chain under construction is "the wrong way" (cross ≤ 0) — discard the previous point.',
  s7n2: 'The ≤ 0 condition also discards collinear points; replace it with < 0 if you need to keep them.',
  s7run: 'Run this code in the lesson — enter 6, then the points 0 0, 2 0, 1 1, 2 2, 0 2, 1 -1.',
  s7mark: "O(n log n) all comes from sorting by x — the pass over the points itself is linear.",

  s8h: 'Task',
  s8task: 'You have the finished convex hull from the previous slide.',
  s8hint: "Compute its area with the shoelace formula — the same vertices, the same code from the area slide. The lesson's two topics join into one solution.",

  s9h: "You've walked the entire competitive path!",
  s9line: 'From algorithm complexity to computational geometry — 6 levels, 22 topics, dozens of problems behind you.',
  s9r1: 'cross(O, A, B) — the sign of a turn and twice a triangle\'s area',
  s9r2: 'The shoelace formula — the area of any polygon in one pass',
  s9r3: 'Geometry loves integers: double is the source of the most treacherous bugs',
  s9r4: 'Monotone chain — a convex hull in O(n log n), all spent on sorting',
  s9cta: 'Mark the lesson as completed — and the whole path along with it. What remains is practice: solve problems, compete, and come back to the lessons as a reference.',
  s9foot: 'Good luck! 🏆',
};

export const computationalGeometry: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
