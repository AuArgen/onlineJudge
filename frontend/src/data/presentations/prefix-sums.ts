import type { LessonPresentationData } from './types';

// Presentation for the "Prefix Sums" lesson
// (olympiad-roadmap → level-2-sorting-searching → prefix-sums).
// Slide structure is single-sourced in buildSlides(); the three language
// tables below carry only the strings.

interface L {
  kicker: string;
  title: string;
  subtitle: string;
  press: string;

  s2h: string; s2bad: string; s2badD: string; s2good: string; s2goodD: string; s2mark: string;

  s3h: string; s3n1: string; s3n2: string; s3n3: string;

  s4h: string; s4n1: string; s4n2: string; s4n3: string; s4run: string;

  s5h: string;
  s5c1t: string; s5c1d: string;
  s5c2t: string; s5c2d: string;
  s5c3t: string; s5c3d: string;

  s6h: string; s6task: string;
  s6n1: string; s6n2: string; s6n3: string; s6ans: string;

  s7h: string; s7n1: string; s7n2: string; s7run: string;

  s8h: string; s8n1: string; s8n2: string; s8mark: string;

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

// prefixLadder renders the array 1 2 3 4 5 and its prefix-sum row, then a
// query [2, 4]: group 0 the raw array, group 1 the prefix sums, group 2 the
// subtraction p[4] - p[1], group 3 the highlighted segment itself.
function prefixLadder(): string {
  const arr = [1, 2, 3, 4, 5];
  const pre = [0, 1, 3, 6, 10, 15];
  const x = (k: number) => 30 + k * 88;
  const cx = (k: number) => x(k) + 40;

  const box = (k: number, y: number, label: string, tone: 'plain' | 'sum' | 'lo' | 'hi' | 'seg') => {
    const s =
      tone === 'lo'
        ? `fill="rgba(248,113,113,.14)" stroke="${C.bad}" stroke-width="2"`
        : tone === 'hi'
          ? `fill="rgba(96,165,250,.16)" stroke="${C.info}" stroke-width="2"`
          : tone === 'seg'
            ? `fill="rgba(52,211,153,.15)" stroke="${C.good}" stroke-width="2"`
            : tone === 'sum'
              ? `fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.16)"`
              : `fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.14)"`;
    const f = tone === 'lo' ? '#fca5a5' : tone === 'hi' ? '#bfdbfe' : tone === 'seg' ? '#6ee7b7' : '#cbd5e1';
    return (
      `<rect x="${x(k)}" y="${y}" width="80" height="48" rx="10" ${s}/>` +
      `<text x="${cx(k)}" y="${y + 31}" text-anchor="middle" fill="${f}" font-size="19" font-family="monospace">${label}</text>`
    );
  };

  let g0 = '';
  arr.forEach((num, k) => (g0 += box(k + 1, 8, String(num), 'plain')));
  g0 += `<text x="${cx(0) - 40}" y="38" text-anchor="middle" fill="#64748b" font-size="14" font-family="monospace">a</text>`;

  let g1 = box(0, 68, '0', 'sum');
  pre.forEach((num, k) => {
    if (k === 0) return;
    g1 += box(k, 68, String(num), 'sum');
  });
  g1 += `<text x="${cx(0) - 40}" y="98" text-anchor="middle" fill="#64748b" font-size="14" font-family="monospace">p</text>`;

  const g2 = box(1, 68, '3', 'lo') + box(4, 68, '10', 'hi') +
    `<text x="330" y="150" text-anchor="middle" fill="${C.warn}" font-size="17" font-family="monospace">p[4] − p[1] = 10 − 3 = 7</text>`;

  const g3 = box(2, 8, '2', 'seg') + box(3, 8, '3', 'seg') + box(4, 8, '4', 'seg') +
    `<text x="330" y="150" text-anchor="middle" fill="${C.good}" font-size="17" font-family="monospace">2 + 3 + 4 = 7 ✓</text>`;

  return `<div class="lp-chart">
<svg viewBox="0 0 560 170" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
  <g class="step" data-a="none" data-g="3">${g3}</g>
</svg>
</div>`;
}

// diffLadder renders three updates on the difference array (n = 5): each
// group adds one "d[l] += x, d[r+1] -= x" bar, the final group restores the
// real array via a running prefix sum below.
function diffLadder(): string {
  const x = (k: number) => 30 + k * 88;
  const cx = (k: number) => x(k) + 40;
  const cellW = 80;

  const cell = (k: number, y: number, label: string, tone: 'plain' | 'plus' | 'minus' | 'final') => {
    const s =
      tone === 'plus'
        ? `fill="rgba(52,211,153,.15)" stroke="${C.good}" stroke-width="2"`
        : tone === 'minus'
          ? `fill="rgba(248,113,113,.14)" stroke="${C.bad}" stroke-width="2"`
          : tone === 'final'
            ? `fill="rgba(129,140,248,.16)" stroke="${C.acc}" stroke-width="2"`
            : `fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.14)"`;
    const f = tone === 'plus' ? '#6ee7b7' : tone === 'minus' ? '#fca5a5' : tone === 'final' ? '#c7d2fe' : '#cbd5e1';
    return (
      `<rect x="${x(k)}" y="${y}" width="${cellW}" height="46" rx="10" ${s}/>` +
      `<text x="${cx(k)}" y="${y + 30}" text-anchor="middle" fill="${f}" font-size="18" font-family="monospace">${label}</text>`
    );
  };

  const idx = () => {
    let s = '';
    for (let k = 1; k <= 5; k++) {
      s += `<text x="${cx(k - 1)}" y="16" text-anchor="middle" fill="#64748b" font-size="13" font-family="monospace">d[${k}]</text>`;
    }
    return s;
  };

  let base = idx();
  for (let k = 1; k <= 5; k++) base += cell(k - 1, 24, '0', 'plain');

  const g1 = cell(0, 24, '+2', 'plus') + cell(2, 24, '−2', 'minus') +
    `<text x="466" y="52" fill="#8fa0ba" font-size="13">1 3 2</text>`;
  const g2 = cell(1, 24, '+1', 'minus') +
    `<text x="466" y="76" fill="#8fa0ba" font-size="13">2 5 1</text>`;

  const restored = [2, 3, 1, 1, 1];
  let g3 = `<text x="30" y="106" fill="#64748b" font-size="13" font-family="monospace">a′</text>`;
  restored.forEach((num, k) => (g3 += cell(k, 96, String(num), 'final')));

  return `<div class="lp-chart">
<svg viewBox="0 0 560 152" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${base}</g>
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
  <div class="lp-bigo" aria-hidden="true">p[r] − p[l−1]</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The problem: many range-sum queries
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>❌ ${t.s2bad}</h3><p>${t.s2badD}</p></div>
  <div class="lp-card step" data-a="right"><h3>✅ ${t.s2good}</h3><p>${t.s2goodD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── The prefix-sum array and the query formula (animated)
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
${prefixLadder()}
<div class="lp-notes" style="margin-top:10px">
  <div class="lp-card step" data-g="1" data-a="right"><p>${t.s3n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="right"><p>${t.s3n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="right"><p>${t.s3n3}</p></div>
</div>`,

    // 4 ── The full code
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::vector&lt;long long&gt; p(n + 1, 0);
for (int i = 1; i &lt;= n; i++) {
    std::cin &gt;&gt; x;
    p[i] = p[i - 1] + x;
}
</span><span class="step" data-g="1" data-a="none">
while (q--) {
    std::cin &gt;&gt; l &gt;&gt; r;
</span><span class="step" data-g="2" data-a="none">    std::cout &lt;&lt; p[r] - p[l - 1] &lt;&lt; "\\n";
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s4run}</p>`,

    // 5 ── Three details worth remembering
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">1️⃣</div><h3>${t.s5c1t}</h3><p>${t.s5c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔢</div><h3>${t.s5c2t}</h3><p>${t.s5c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔲</div><h3>${t.s5c3t}</h3><p>${t.s5c3d}</p></div>
</div>`,

    // 6 ── The mirror trick: the difference array (animated)
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s6task}</p>
${diffLadder()}
<div class="lp-notes" style="margin-top:8px">
  <div class="lp-card step" data-g="1" data-a="right"><p>${t.s6n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="right"><p>${t.s6n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="right"><p>${t.s6n3}</p></div>
</div>
<p class="lp-p lp-center step" data-g="3"><span class="lp-mark">${t.s6ans}</span></p>`,

    // 7 ── The difference array: full code
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::vector&lt;long long&gt; d(n + 2, 0);
while (q--) {
    std::cin &gt;&gt; l &gt;&gt; r &gt;&gt; x;
    d[l] += x;
    d[r + 1] -= x;
}
</span><span class="step" data-g="1" data-a="none">
long long cur = 0;
for (int i = 1; i &lt;= n; i++) {
    cur += d[i];
    std::cout &lt;&lt; cur &lt;&lt; " ";
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s7run}</p>`,

    // 8 ── Combined task teaser: zero-sum segments
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.3rem,4vw,2.4rem)">p[r] == p[l−1]</div>
</div>
<p class="lp-p lp-center step" style="margin-top:14px">${t.s8n1}</p>
<p class="lp-p lp-center step">${t.s8n2}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s8mark}</span></p>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">p[i]</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">O(1)</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">d[i]</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">long long</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 2',
  title: 'Префиксные суммы',
  subtitle: 'Ответ на «сумма на отрезке» за O(1) вместо O(n) — и зеркальный приём: разностный массив',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'n чисел, q запросов «сумма от l до r»',
  s2bad: 'Циклом на каждый запрос',
  s2badD: 'O(n·q): при n = q = 10⁵ — 10¹⁰ операций, безнадёжно.',
  s2good: 'Предподсчётом один раз',
  s2goodD: 'Заплатить O(n) один раз — и отвечать на каждый запрос мгновенно.',
  s2mark: 'Идея предподсчёта: заранее посчитать то, что запрашивают часто.',

  s3h: 'Массив префиксных сумм',
  s3n1: 'p[i] = сумма первых i элементов массива a. p[0] = 0 — сумма пустого начала.',
  s3n2: 'Запрос [2, 4]: нужна сумма трёх элементов. Берём p[4] = 10 и p[1] = 3.',
  s3n3: 'p[4] − p[1] = 7 — из «суммы до 4-го» вычли «сумму до 1-го», ровно отрезок [2, 4] остался.',

  s4h: 'Префиксные суммы: весь код',
  s4n1: 'Строим p за один проход: каждый следующий элемент — предыдущая сумма плюс новое число.',
  s4n2: 'Границы читаются с единицы — так же, как в условии задачи.',
  s4n3: 'Один запрос — одно вычитание. O(1) на запрос, O(n + q) всего.',
  s4run: 'Запустите этот код в уроке — введите 5 2, массив 1 2 3 4 5, затем запросы 2 4 и 1 5.',

  s5h: 'Три детали, которые стоит запомнить',
  s5c1t: 'Индексация с единицы',
  s5c1d: 'p[0] = 0 избавляет от особого случая «l = 1» — вычитать не из чего, и не нужно.',
  s5c2t: 'long long, а не int',
  s5c2d: 'Сумма ста тысяч миллиардов в int не влезает — переполнение тихо испортит ответ.',
  s5c3t: 'Та же идея в 2D',
  s5c3d: 'Префикс-таблица отвечает на сумму в прямоугольнике за O(1) — тем же вычитанием, но по обеим осям.',

  s6h: 'Зеркальный приём: разностный массив',
  s6task: 'Запросы наоборот МЕНЯЮТ отрезки: «прибавить x всем от l до r», ответ нужен один раз в конце.',
  s6n1: 'Прибавить 2 на [1, 3]: не трогаем сам массив — отмечаем только границы, d[1] += 2 и d[4] −= 2.',
  s6n2: 'Второй запрос «прибавить 1 на [2, 5]» — та же пара пометок, независимо от первой.',
  s6n3: 'Восстанавливаем настоящий массив одним проходом: префиксная сумма самих разностей.',
  s6ans: 'Каждое обновление — O(1), восстановление всего массива — O(n) один раз в конце.',

  s7h: 'Разностный массив: весь код',
  s7n1: 'Каждый запрос — две записи по индексам, без единого цикла по отрезку.',
  s7n2: 'В конце — обычная префиксная сумма: cur копит разности слева направо.',
  s7run: 'Запустите этот код в уроке — введите 5 2, затем запросы «1 3 2» и «2 5 1».',

  s8h: 'Связка двух тем',
  s8n1: 'Сумма отрезка [l, r] равна нулю ровно тогда, когда p[r] и p[l−1] совпадают.',
  s8n2: 'Значит, задача сводится к подсчёту одинаковых значений в массиве p — через map.',
  s8mark: 'Префиксные суммы редко работают в одиночку — они складываются с другими приёмами.',

  s9h: 'Запомнить',
  s9r1: 'p[i] — сумма первых i элементов, p[0] = 0',
  s9r2: 'Сумма [l, r] = p[r] − p[l−1] за O(1)',
  s9r3: 'd[l] += x, d[r+1] −= x — обновление отрезка за O(1)',
  s9r4: 'Суммы копятся в long long',
  s9cta: 'Решите прикреплённую задачу «Сумма элементов массива» и отметьте урок пройденным.',
  s9foot: 'Бонус: найдите количество отрезков с нулевой суммой — подсказка на предыдущем слайде.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 2-деңгээл',
  title: 'Префикстик суммалар',
  subtitle: '«Кесиндидеги сумма» суроосуна O(n) ордуна O(1) убакытта жооп — жана күзгүдөй ыкма: айырма массиви',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'n сан, q суроо «l ден r ге чейинки сумма»',
  s2bad: 'Ар бир суроону цикл менен',
  s2badD: 'O(n·q): n = q = 10⁵ болгондо — 10¹⁰ амал, үмүтсүз.',
  s2good: 'Бир жолу алдын ала эсептеп',
  s2goodD: 'Бир жолу O(n) төлөйбүз — ар бир суроого дароо жооп беребиз.',
  s2mark: 'Алдын ала эсептөө идеясы: көп сурала турганды алдын ала эсептеп коюу.',

  s3h: 'Префикстик суммалар массиви',
  s3n1: 'p[i] = a массивинин биринчи i элементинин суммасы. p[0] = 0 — бош башталгычтын суммасы.',
  s3n2: '[2, 4] суроосу: үч элементтин суммасы керек. p[4] = 10 жана p[1] = 3 алабыз.',
  s3n3: 'p[4] − p[1] = 7 — «4кө чейинки суммадан» «1ге чейинки сумманы» кемиттик, так [2, 4] кесиндиси калды.',

  s4h: 'Префикстик суммалар: толук код',
  s4n1: 'p массивин бир өтүүдө куруйбуз: ар бир кийинки элемент — мурунку сумма плюс жаңы сан.',
  s4n2: 'Чектер бирден башталып окулат — маселенин шартындагыдай эле.',
  s4n3: 'Бир суроо — бир кемитүү. Суроого O(1), баары чогуу — O(n + q).',
  s4run: 'Бул кодду сабактан иштетиңиз — 5 2, массив 1 2 3 4 5, андан кийин суроолор 2 4 жана 1 5 киргизиңиз.',

  s5h: 'Эстеп калууга арзый турган үч майда-чүйдө',
  s5c1t: 'Бирден башталган индексация',
  s5c1d: 'p[0] = 0 «l = 1» өзгөчө учурунан куткарат — кемитүүчү жок, керек да эмес.',
  s5c2t: 'int эмес, long long',
  s5c2d: 'Жүз миң миллиарддын суммасы int түрүнө батпайт — ашып кетүү жоопту үнсүз бузат.',
  s5c3t: 'Ошол эле идея 2D форматта',
  s5c3d: 'Префикс-таблица тик бурчтуктагы сумманы O(1) убакытта берет — эки огу боюнча да ошол эле кемитүү.',

  s6h: 'Күзгүдөй ыкма: айырма массиви',
  s6task: 'Суроолор тескерисинче кесиндилерди ӨЗГӨРТӨТ: «l ден r ге чейинкилердин баарына x кошуу», жооп аягында бир жолу керек.',
  s6n1: '[1, 3] кесиндисине 2 кошуу: массивдин өзүн тийбейбиз — четтерин гана белгилейбиз, d[1] += 2 жана d[4] −= 2.',
  s6n2: 'Экинчи суроо «[2, 5] ке 1 кошуу» — биринчисине көз каранды эмес, ошол эле эки белги.',
  s6n3: 'Чыныгы массивди бир өтүүдө калыбына келтиребиз: айырмалардын өзүнүн префикстик суммасы.',
  s6ans: 'Ар бир жаңыртуу — O(1), бүт массивди калыбына келтирүү — аягында бир жолу O(n).',

  s7h: 'Айырма массиви: толук код',
  s7n1: 'Ар бир суроо — индекстер боюнча эки жазуу, кесинди боюнча бир да цикл жок.',
  s7n2: 'Аягында — кадимки префикстик сумма: cur айырмаларды солдон оңго топтойт.',
  s7run: 'Бул кодду сабактан иштетиңиз — 5 2, андан кийин суроолор «1 3 2» жана «2 5 1» киргизиңиз.',

  s8h: 'Эки теманын айкалышы',
  s8n1: '[l, r] кесиндисинин суммасы так качан p[r] менен p[l−1] дал келгенде нөлгө барабар.',
  s8n2: 'Демек, маселе p массивиндеги бирдей маанилерди санап чыгууга алып келет — map аркылуу.',
  s8mark: 'Префикстик суммалар сейрек жалгыз иштейт — алар башка ыкмалар менен айкалышат.',

  s9h: 'Эсте сакта',
  s9r1: 'p[i] — биринчи i элементтин суммасы, p[0] = 0',
  s9r2: '[l, r] суммасы = p[r] − p[l−1], O(1) убакытта',
  s9r3: 'd[l] += x, d[r+1] −= x — кесиндини O(1) убакытта жаңыртуу',
  s9r4: 'Суммалар long long түрүндө топтолот',
  s9cta: 'Тиркелген «Массив элементтеринин суммасы» маселесин чечиңиз жана сабакты өттүм деп белгилеңиз.',
  s9foot: 'Бонус: суммасы нөл болгон кесиндилердин санын табыңыз — кеңеш мурунку слайдда.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 2',
  title: 'Prefix Sums',
  subtitle: 'Answering "sum on a segment" in O(1) instead of O(n) — and the mirror trick: the difference array',
  press: 'Press → or Space to advance',

  s2h: 'n numbers, q queries "sum from l to r"',
  s2bad: 'A loop for every query',
  s2badD: 'O(n·q): at n = q = 10⁵ that is 10¹⁰ operations — hopeless.',
  s2good: 'One precomputation pass',
  s2goodD: 'Pay O(n) once — then answer every query instantly.',
  s2mark: 'The precomputation idea: compute in advance whatever gets asked about often.',

  s3h: 'The prefix-sum array',
  s3n1: 'p[i] = the sum of the first i elements of a. p[0] = 0 — the sum of the empty prefix.',
  s3n2: 'Query [2, 4]: we need the sum of three elements. Take p[4] = 10 and p[1] = 3.',
  s3n3: 'p[4] − p[1] = 7 — from "the sum up to 4" we subtracted "the sum up to 1", leaving exactly the [2, 4] segment.',

  s4h: 'Prefix sums: the full code',
  s4n1: 'Build p in a single pass: each next element is the previous sum plus the new number.',
  s4n2: 'Bounds are read 1-based — same as in the problem statement.',
  s4n3: 'One query — one subtraction. O(1) per query, O(n + q) overall.',
  s4run: 'Run this code in the lesson — enter 5 2, the array 1 2 3 4 5, then the queries 2 4 and 1 5.',

  s5h: 'Three details worth remembering',
  s5c1t: '1-based indexing',
  s5c1d: 'p[0] = 0 removes the special case "l = 1" — nothing to subtract, and none is needed.',
  s5c2t: 'long long, not int',
  s5c2d: 'The sum of a hundred thousand billions won\'t fit in an int — overflow silently corrupts the answer.',
  s5c3t: 'The same idea in 2D',
  s5c3d: 'A prefix table answers rectangle-sum queries in O(1) — the same subtraction, along both axes.',

  s6h: 'The mirror trick: the difference array',
  s6task: 'Queries instead MODIFY segments: "add x to everyone from l to r", the answer is needed once at the end.',
  s6n1: 'Add 2 on [1, 3]: don\'t touch the array itself — mark only the boundaries, d[1] += 2 and d[4] -= 2.',
  s6n2: 'A second query "add 1 on [2, 5]" — the same pair of marks, independent of the first.',
  s6n3: 'Restore the real array in one pass: the prefix sum of the differences themselves.',
  s6ans: 'Each update is O(1); restoring the whole array is O(n) once, at the end.',

  s7h: 'The difference array: the full code',
  s7n1: 'Each query is two writes by index, no loop over the segment at all.',
  s7n2: 'At the end — a plain prefix sum: cur accumulates the differences left to right.',
  s7run: 'Run this code in the lesson — enter 5 2, then the queries "1 3 2" and "2 5 1".',

  s8h: 'Combining two topics',
  s8n1: 'The sum of segment [l, r] is zero exactly when p[r] and p[l−1] coincide.',
  s8n2: 'So the task reduces to counting equal values in the array p — with a map.',
  s8mark: 'Prefix sums rarely work alone — they combine with other techniques.',

  s9h: 'Remember',
  s9r1: 'p[i] — sum of the first i elements, p[0] = 0',
  s9r2: 'Sum of [l, r] = p[r] − p[l−1] in O(1)',
  s9r3: 'd[l] += x, d[r+1] -= x — update a segment in O(1)',
  s9r4: 'Sums accumulate in long long',
  s9cta: 'Solve the attached "Array Elements Sum" problem and mark the lesson as completed.',
  s9foot: 'Bonus: find the number of zero-sum segments — the hint is on the previous slide.',
};

export const prefixSums: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
