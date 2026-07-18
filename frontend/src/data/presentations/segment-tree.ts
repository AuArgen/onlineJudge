import type { LessonPresentationData } from './types';

// Presentation for the "Segment Tree" lesson
// (olympiad-roadmap → level-5-advanced → segment-tree).
// Slide structure is single-sourced in buildSlides(); the three language
// tables below carry only the strings.

interface L {
  kicker: string;
  title: string;
  subtitle: string;
  press: string;

  s2h: string; s2bad: string; s2badD: string; s2good: string; s2goodD: string; s2mark: string;

  s3h: string;
  s3c1t: string; s3c1d: string;
  s3c2t: string; s3c2d: string;
  s3c3t: string; s3c3d: string;

  s4h: string; s4task: string;
  s4n1: string; s4n2: string; s4n3: string;

  s5h: string; s5n1: string; s5n2: string; s5n3: string; s5run: string;

  s6h: string;
  s6c1t: string; s6c1d: string;
  s6c2t: string; s6c2d: string;
  s6c3t: string; s6c3d: string;

  s7h: string; s7line: string; s7mark: string;

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

// segTreeDiagram renders the exact worked example (array 1 2 3 4 5): the
// base tree is grey with its initial sums, group 1 rings the three nodes
// that fully cover the query [2,4] (2+3+4=9), group 2 walks the update path
// for set(3,10) redrawing three sums on top of the old ones, and group 3
// re-rings the same three query nodes with the now-updated sum (2+10+4=16).
function segTreeDiagram(l1: string, l2: string): string {
  type N = { x: number; y: number; lo: number; hi: number; val: number };
  const nodes: Record<string, N> = {
    root: { x: 253, y: 30, lo: 1, hi: 5, val: 15 },
    L: { x: 153, y: 90, lo: 1, hi: 3, val: 6 },
    R: { x: 355, y: 90, lo: 4, hi: 5, val: 9 },
    LL: { x: 85, y: 150, lo: 1, hi: 2, val: 3 },
    LR: { x: 220, y: 150, lo: 3, hi: 3, val: 3 },
    RL: { x: 310, y: 150, lo: 4, hi: 4, val: 4 },
    RR: { x: 400, y: 150, lo: 5, hi: 5, val: 5 },
    LLL: { x: 40, y: 210, lo: 1, hi: 1, val: 1 },
    LLR: { x: 130, y: 210, lo: 2, hi: 2, val: 2 },
  };
  const edges: [string, string][] = [
    ['root', 'L'], ['root', 'R'],
    ['L', 'LL'], ['L', 'LR'],
    ['R', 'RL'], ['R', 'RR'],
    ['LL', 'LLL'], ['LL', 'LLR'],
  ];
  const w = 54, h = 36;

  const box = (key: string, color?: string, overrideVal?: number) => {
    const n = nodes[key];
    const val = overrideVal ?? n.val;
    const label = n.lo === n.hi ? `[${n.lo}]` : `[${n.lo},${n.hi}]`;
    return (
      `<rect x="${n.x - w / 2}" y="${n.y - h / 2}" width="${w}" height="${h}" rx="8" fill="${color ? color + '22' : 'rgba(255,255,255,.04)'}" stroke="${color ?? 'rgba(255,255,255,.24)'}" stroke-width="${color ? 2.3 : 1.4}"/>` +
      `<text x="${n.x}" y="${n.y - 3}" text-anchor="middle" fill="${color ?? '#8fa0ba'}" font-size="10" font-family="monospace">${label}</text>` +
      `<text x="${n.x}" y="${n.y + 12}" text-anchor="middle" fill="${color ?? '#cbd5e1'}" font-size="14" font-weight="700" font-family="monospace">${val}</text>`
    );
  };
  const edge = (a: string, b: string) =>
    `<line x1="${nodes[a].x}" y1="${nodes[a].y + h / 2}" x2="${nodes[b].x}" y2="${nodes[b].y - h / 2}" stroke="rgba(255,255,255,.18)" stroke-width="1.3"/>`;
  const ring = (key: string, color: string) => {
    const n = nodes[key];
    return `<rect x="${n.x - w / 2 - 3}" y="${n.y - h / 2 - 3}" width="${w + 6}" height="${h + 6}" rx="10" fill="none" stroke="${color}" stroke-width="2.6"/>`;
  };
  const label = (text: string, color: string, y: number) =>
    `<text x="253" y="${y}" text-anchor="middle" fill="${color}" font-size="14" font-family="monospace">${text}</text>`;

  const g0 = edges.map(([a, b]) => edge(a, b)).join('') + Object.keys(nodes).map((k) => box(k)).join('');
  const g1 = ring('LLR', C.good) + ring('LR', C.good) + ring('RL', C.good) + label(l1, C.good, 245);
  const g2 = box('LR', C.warn, 10) + box('L', C.warn, 13) + box('root', C.warn, 22);
  const g3 = ring('LLR', C.good) + ring('LR', C.good) + ring('RL', C.good) + label(l2, C.good, 245);

  return `<div class="lp-chart">
<svg viewBox="0 0 506 260" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <div class="lp-bigo" aria-hidden="true">Σ[l, r]</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The problem
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>❌ ${t.s2bad}</h3><p>${t.s2badD}</p></div>
  <div class="lp-card step" data-a="right"><h3>✅ ${t.s2good}</h3><p>${t.s2goodD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── The idea: a binary tree over the array
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🌳</div><h3>${t.s3c1t}</h3><p>${t.s3c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🍃</div><h3>${t.s3c2t}</h3><p>${t.s3c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🧭</div><h3>${t.s3c3t}</h3><p>${t.s3c3d}</p></div>
</div>`,

    // 4 ── Animated tree: query then update
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
${segTreeDiagram(t.s4n1, t.s4n2)}
<div class="lp-notes" style="margin-top:2px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s4n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s4n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="none"><p>${t.s4n3}</p></div>
</div>`,

    // 5 ── The full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">void update(int v, int tl, int tr, int pos, long long val) {
    if (tl == tr) { tree[v] = val; return; }
    int tm = (tl + tr) / 2;
    if (pos &lt;= tm) update(2*v, tl, tm, pos, val);
    else            update(2*v+1, tm+1, tr, pos, val);
    tree[v] = tree[2*v] + tree[2*v+1];
}
</span><span class="step" data-g="1" data-a="none">
long long query(int v, int tl, int tr, int l, int r) {
    if (r &lt; tl || tr &lt; l) return 0;
    if (l &lt;= tl &amp;&amp; tr &lt;= r) return tree[v];
    int tm = (tl + tr) / 2;
    return query(2*v, tl, tm, l, r)
         + query(2*v+1, tm+1, tr, l, r);
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s5run}</p>
<p class="lp-p lp-center step" data-g="2">${t.s5n3}</p>`,

    // 6 ── How to read the code
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🔢</div><h3>${t.s6c1t}</h3><p>${t.s6c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">📏</div><h3>${t.s6c2t}</h3><p>${t.s6c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">0️⃣</div><h3>${t.s6c3t}</h3><p>${t.s6c3d}</p></div>
</div>`,

    // 7 ── A construction kit
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s7line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s7mark}</span></p>`,

    // 8 ── Task teaser
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🔺</div><p>${t.s8hint}</p></div>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">tree[v]</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">update</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">query</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">4n</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 5',
  title: 'Дерево отрезков',
  subtitle: 'Сумма на отрезке и обновление точки — оба за O(log n), даже когда массив меняется',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Когда префиксные суммы ломаются',
  s2bad: 'Префиксные суммы',
  s2badD: 'Сумма за O(1), но одно обновление элемента требует пересчитать все префиксы заново.',
  s2good: 'Дерево отрезков',
  s2goodD: 'И запрос, и обновление — O(log n). Небольшая доплата за запрос ради быстрого изменения.',
  s2mark: 'Меняющийся массив — сигнал заменить префиксные суммы деревом отрезков.',

  s3h: 'Идея: двоичное дерево над массивом',
  s3c1t: 'Каждая вершина — отрезок',
  s3c1d: 'Вершина хранит сумму своего диапазона. Корень отвечает за весь массив.',
  s3c2t: 'Листья — элементы',
  s3c2d: 'Самые нижние вершины — это диапазоны длины один, отдельные a[i].',
  s3c3t: 'Путь = O(log n)',
  s3c3d: 'От листа до корня — не больше log n вершин. Обновление трогает только их.',

  s4h: 'Дерево для массива 1 2 3 4 5',
  s4task: 'Запрос суммы [2, 4], затем set(3, 10), затем тот же запрос снова.',
  s4n1: 'Запрос [2, 4] распадается ровно на три вершины дерева, целиком лежащие внутри: [2] + [3] + [4] = 2 + 3 + 4 = 9.',
  s4n2: 'set(3, 10): путь от листа [3] до корня — три вершины. Каждая пересчитывает сумму: [3] = 10, [1,3] = 3 + 10 = 13, [1,5] = 13 + 9 = 22.',
  s4n3: 'Тот же запрос [2, 4] снова распадается на те же три вершины — но с новым значением: 2 + 10 + 4 = 16.',

  s5h: 'Дерево отрезков: весь код',
  s5n1: 'update спускается к листу pos, меняет значение, а на обратном пути пересчитывает суммы предков.',
  s5n2: 'query обрезает ветки, не пересекающиеся с [l, r], сразу возвращает вершины целиком внутри, и рекурсивно разбирает остальные.',
  s5run: 'Запустите этот код в уроке — введите 5 3, массив 1 2 3 4 5, затем sum 2 4 / set 3 10 / sum 2 4.',
  s5n3: 'Оба вызова — O(log n): глубина дерева ограничена логарифмом размера массива.',

  s6h: 'Как читать код',
  s6c1t: 'Нумерация вершин',
  s6c1d: 'Вершина v отвечает за [tl, tr]; её дети — половины отрезка, номера 2v и 2v+1.',
  s6c2t: 'Размер массива tree',
  s6c2d: 'Массив размером 4n гарантированно вмещает всё дерево, даже если n не степень двойки.',
  s6c3t: 'Нейтральный элемент',
  s6c3d: 'query возвращает 0 для непересекающихся отрезков — ноль ничего не меняет при сложении.',

  s7h: 'Дерево отрезков — конструктор',
  s7line: 'Замените + на min или max, а нейтральный элемент 0 — на бесконечность: получите запросы минимума или максимума на отрезке тем же кодом.',
  s7mark: 'Продвинутая версия с «ленивыми» обновлениями умеет менять целые отрезки за O(log n) — изучите её, когда встретите такую задачу.',

  s8h: 'Задание',
  s8task: 'Переделайте дерево так, чтобы оно отвечало на запрос МАКСИМУМА на отрезке.',
  s8hint: 'Три правки: операция сложения → max, ноль в query → −бесконечность, вывод остаётся тем же. Проверьте на своём примере.',

  s9h: 'Запомнить',
  s9r1: 'tree[v] — сумма (или min/max) отрезка [tl, tr]',
  s9r2: 'update — от листа к корню, O(log n) вершин',
  s9r3: 'query — распадается на O(log n) готовых кусков дерева',
  s9r4: 'Массив tree размером 4n гарантированно вмещает дерево',
  s9cta: 'Переделайте дерево на максимум и отметьте урок пройденным.',
  s9foot: 'Дальше — строковые алгоритмы: хеширование и KMP.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 5-деңгээл',
  title: 'Кесинди дарагы',
  subtitle: 'Кесиндидеги сумма жана чекитти жаңылоо — экөө тең O(log n), массив өзгөрүп турса да',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Префикстик суммалар качан бузулат',
  s2bad: 'Префикстик суммалар',
  s2badD: 'Сумма O(1), бирок бир элементти жаңылоо бардык префикстерди кайра эсептөөнү талап кылат.',
  s2good: 'Кесинди дарагы',
  s2goodD: 'Суроо да, жаңылоо да — O(log n). Тез өзгөртүү үчүн суроого кичине кошумча төлөм.',
  s2mark: 'Өзгөрүп турган массив — префикстик суммаларды кесинди дарагы менен алмаштыруу сигналы.',

  s3h: 'Идея: массивдин үстүндөгү экилик дарак',
  s3c1t: 'Ар бир чоку — кесинди',
  s3c1d: 'Чоку өз диапазонунун суммасын сактайт. Тамыр бүт массив үчүн жооп берет.',
  s3c2t: 'Жалбырактар — элементтер',
  s3c2d: 'Эң төмөнкү чокулар — узундугу бир диапазондор, өзүнчө a[i].',
  s3c3t: 'Жол = O(log n)',
  s3c3d: 'Жалбырактан тамырга чейин — log n дан ашык эмес чоку. Жаңылоо алардын гана тиет.',

  s4h: '1 2 3 4 5 массиви үчүн дарак',
  s4task: '[2, 4] суммасынын суроосу, андан кийин set(3, 10), андан кийин ошол эле суроо кайра.',
  s4n1: '[2, 4] суроосу дарактын толугу менен ичинде жаткан так үч чокусуна ажырайт: [2] + [3] + [4] = 2 + 3 + 4 = 9.',
  s4n2: 'set(3, 10): жалбырак [3] тен тамырга чейинки жол — үч чоку. Ар бири ата-бабаларынын суммасын кайра эсептейт: [3] = 10, [1,3] = 3 + 10 = 13, [1,5] = 13 + 9 = 22.',
  s4n3: 'Ошол эле [2, 4] суроосу дагы ошол эле үч чокуга ажырайт — бирок жаңы маани менен: 2 + 10 + 4 = 16.',

  s5h: 'Кесинди дарагы: толук код',
  s5n1: 'update pos жалбырагына чейин түшөт, маанисин өзгөртөт да, кайра чыгып бара жатып ата-бабалардын суммаларын кайра эсептейт.',
  s5n2: 'query [l, r] менен кесилишпеген бутактарды кесип салат, толугу менен ичинде жаткандарды дароо кайтарат, калгандарын рекурсивдүү бөлүштүрөт.',
  s5run: 'Бул кодду сабактан иштетиңиз — 5 3, массив 1 2 3 4 5, андан кийин sum 2 4 / set 3 10 / sum 2 4 киргизиңиз.',
  s5n3: 'Эки чакыруу тең — O(log n): дарактын тереңдиги массивдин өлчөмүнүн логарифми менен чектелген.',

  s6h: 'Кодду кантип окуу керек',
  s6c1t: 'Чокулардын номерленүүсү',
  s6c1d: 'v чокусу [tl, tr] га жооп берет; анын балдары — кесиндинин жарымдары, номерлери 2v жана 2v+1.',
  s6c2t: 'tree массивинин өлчөмү',
  s6c2d: '4n өлчөмүндөгү массив бүт даракты кепилдик менен батырат, n эки эседе болбосо да.',
  s6c3t: 'Нейтралдуу элемент',
  s6c3d: 'query кесилишпеген кесиндилер үчүн 0 кайтарат — нөл кошууда эч нерсени өзгөртпөйт.',

  s7h: 'Кесинди дарагы — конструктор',
  s7line: '+ ди min же max га, ал эми 0 нейтралдуу элементти чексиздикке алмаштырыңыз: ошол эле код менен кесиндидеги минимум же максимум суроолорун аласыз.',
  s7mark: '«Жалкоо» жаңылоолору бар тереңдетилген версия бүт кесиндилерди O(log n) убакытта өзгөртө алат — андай маселеге туш болгондо изилдеп чыгыңыз.',

  s8h: 'Тапшырма',
  s8task: 'Даракты кесиндидеги МАКСИМУМ суроосуна жооп бергидей кылып өзгөртүңүз.',
  s8hint: 'Үч оңдоо: кошуу операциясы → max, query дагы нөл → −чексиздик, чыгаруу ошол бойдон калат. Өз мисалыңызда текшериңиз.',

  s9h: 'Эсте сакта',
  s9r1: 'tree[v] — [tl, tr] кесиндисинин суммасы (же min/max)',
  s9r2: 'update — жалбырактан тамырга, O(log n) чоку',
  s9r3: 'query — дарактын O(log n) даяр бөлүгүнө ажырайт',
  s9r4: '4n өлчөмүндөгү tree массиви даракты кепилдик менен батырат',
  s9cta: 'Даракты максимумга оңдоп, сабакты өттүм деп белгилеңиз.',
  s9foot: 'Андан ары — саптык алгоритмдер: хэштөө жана KMP.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 5',
  title: 'Segment Tree',
  subtitle: 'Range sum and point update — both O(log n), even while the array keeps changing',
  press: 'Press → or Space to advance',

  s2h: 'When prefix sums break',
  s2bad: 'Prefix sums',
  s2badD: 'A range sum in O(1), but updating one element means recomputing every prefix from scratch.',
  s2good: 'Segment tree',
  s2goodD: 'Both the query and the update are O(log n). A small query cost in exchange for fast updates.',
  s2mark: 'A changing array is the signal to swap prefix sums for a segment tree.',

  s3h: 'The idea: a binary tree over the array',
  s3c1t: 'Every node is a range',
  s3c1d: 'A node stores the sum of its range. The root is responsible for the whole array.',
  s3c2t: 'The leaves are the elements',
  s3c2d: 'The lowest nodes are ranges of length one — individual values a[i].',
  s3c3t: 'The path is O(log n)',
  s3c3d: 'From a leaf to the root is at most log n nodes. An update only touches them.',

  s4h: 'The tree for the array 1 2 3 4 5',
  s4task: 'A sum query on [2, 4], then set(3, 10), then the same query again.',
  s4n1: 'The query [2, 4] decomposes into exactly three fully-covered tree nodes: [2] + [3] + [4] = 2 + 3 + 4 = 9.',
  s4n2: 'set(3, 10): the path from leaf [3] to the root is three nodes. Each recomputes its sum: [3] = 10, [1,3] = 3 + 10 = 13, [1,5] = 13 + 9 = 22.',
  s4n3: 'The same query [2, 4] decomposes into the same three nodes again — but now with the new value: 2 + 10 + 4 = 16.',

  s5h: 'Segment tree: the full code',
  s5n1: 'update descends to leaf pos, changes the value, and on the way back up recomputes every ancestor\'s sum.',
  s5n2: 'query prunes branches that don\'t overlap [l, r], returns fully-covered nodes right away, and recurses into the rest.',
  s5run: 'Run this code in the lesson — enter 5 3, the array 1 2 3 4 5, then sum 2 4 / set 3 10 / sum 2 4.',
  s5n3: 'Both calls are O(log n): the tree\'s depth is bounded by the logarithm of the array size.',

  s6h: 'How to read the code',
  s6c1t: 'Node numbering',
  s6c1d: 'Node v is responsible for [tl, tr]; its children are the halves of that range, numbered 2v and 2v+1.',
  s6c2t: 'The size of tree',
  s6c2d: 'An array of size 4n is guaranteed to fit the whole tree, even when n isn\'t a power of two.',
  s6c3t: 'The neutral element',
  s6c3d: 'query returns 0 for non-overlapping ranges — zero changes nothing under addition.',

  s7h: 'The segment tree is a construction kit',
  s7line: 'Swap + for min or max, and the neutral element 0 for infinity: the same code now answers minimum or maximum range queries.',
  s7mark: 'The advanced version with "lazy" updates can modify entire ranges in O(log n) — study it when you meet such a problem.',

  s8h: 'Task',
  s8task: 'Convert the tree so it answers range MAXIMUM queries instead.',
  s8hint: 'Three edits: the addition operator → max, the zero in query → −infinity, the output stays the same. Test it on your own example.',

  s9h: 'Remember',
  s9r1: 'tree[v] — the sum (or min/max) of the range [tl, tr]',
  s9r2: 'update — leaf to root, O(log n) nodes',
  s9r3: 'query — decomposes into O(log n) ready-made tree pieces',
  s9r4: 'A tree array of size 4n is guaranteed to fit the tree',
  s9cta: 'Convert the tree to range maximum and mark the lesson as completed.',
  s9foot: 'Next up: string algorithms — hashing and KMP.',
};

export const segmentTree: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
