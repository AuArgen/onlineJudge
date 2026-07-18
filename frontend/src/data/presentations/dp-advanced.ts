import type { LessonPresentationData } from './types';

// Presentation for the "Advanced Dynamic Programming" lesson
// (olympiad-roadmap → level-5-advanced → dp-advanced).
// Slide structure is single-sourced in buildSlides(); the three language
// tables below carry only the strings.

interface L {
  kicker: string;
  title: string;
  subtitle: string;
  press: string;

  s2h: string; s2c1t: string; s2c1d: string; s2c2t: string; s2c2d: string;

  s3h: string;
  s3c1t: string; s3c1d: string;
  s3c2t: string; s3c2d: string;
  s3c3t: string; s3c3d: string;

  s4h: string; s4task: string;
  s4n1: string; s4n2: string;

  s5h: string; s5n1: string; s5n2: string; s5n3: string; s5run: string; s5mark: string;

  s6h: string; s6line: string; s6mark: string;

  s7h: string; s7task: string;
  s7n1: string; s7n2: string; s7n3: string; s7n4: string; s7n5: string; s7n6: string; s7n7: string; s7n8: string;

  s8h: string; s8n1: string; s8n2: string; s8run: string; s8mark: string;

  s9h: string; s9line: string; s9task: string; s9hint: string;

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

// knapsackDp renders the 0/1 knapsack dp[cap] array (cap = 0..8): group 0 is
// the all-zero start, group 1 shows the effect of the first item (weight 3,
// cost 4) alone — the top-down mechanic the lesson is built around — and
// group 2 jumps to the final array after all four items, ringing dp[8] = 10.
function knapsackDp(): string {
  const dpAfter1 = [0, 0, 0, 4, 4, 4, 4, 4, 4];
  const dpFinal = [0, 0, 3, 4, 5, 7, 8, 9, 10];
  const cellX = (cap: number) => 10 + cap * 46;
  const cy = 50, w = 38, h = 38;

  const cell = (cap: number, val: number, color?: string) =>
    `<rect x="${cellX(cap)}" y="${cy}" width="${w}" height="${h}" rx="8" fill="${color ? color + '22' : 'rgba(255,255,255,.04)'}" stroke="${color ?? 'rgba(255,255,255,.22)'}" stroke-width="${color ? 2.2 : 1.5}"/>` +
    `<text x="${cellX(cap) + w / 2}" y="${cy + 24}" text-anchor="middle" fill="${color ?? '#cbd5e1'}" font-size="15" font-family="monospace">${val}</text>` +
    `<text x="${cellX(cap) + w / 2}" y="${cy - 8}" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">${cap}</text>`;
  const ring = (cap: number, color: string) =>
    `<rect x="${cellX(cap) - 3}" y="${cy - 3}" width="${w + 6}" height="${h + 6}" rx="10" fill="none" stroke="${color}" stroke-width="2.5"/>`;

  const g0 = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((cap) => cell(cap, 0)).join('');
  const g1 = [3, 4, 5, 6, 7, 8].map((cap) => cell(cap, dpAfter1[cap], C.info)).join('');
  const g2 = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((cap) => cell(cap, dpFinal[cap], cap === 8 ? C.good : C.acc)).join('') + ring(8, C.good);

  return `<div class="lp-chart">
<svg viewBox="0 0 440 90" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
</svg>
</div>`;
}

// lisTrace renders the O(n log n) LIS "tail" trace on 10 9 2 5 3 7 101 18:
// the stream sits on top as 8 fixed boxes, 4 fixed tail slots below fill in
// (append) or get overwritten (replace, via redraw-on-top) one group per
// processed number, matching the exact lower_bound decisions in the code.
function lisTrace(labs: string[]): string {
  const nums = [10, 9, 2, 5, 3, 7, 101, 18];
  const ix = (k: number) => 10 + k * 62;
  const icx = (k: number) => ix(k) + 24;
  const iy = 10, iw = 48;

  const inBox = (k: number) =>
    `<rect x="${ix(k)}" y="${iy}" width="${iw}" height="34" rx="8" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.16)"/>` +
    `<text x="${icx(k)}" y="${iy + 22}" text-anchor="middle" fill="#cbd5e1" font-size="15" font-family="monospace">${nums[k]}</text>`;
  const ring = (k: number, color: string) =>
    `<rect x="${ix(k) - 3}" y="${iy - 3}" width="${iw + 6}" height="40" rx="10" fill="none" stroke="${color}" stroke-width="2.5"/>`;

  const slotY = 76, slotW = 64, slotH = 40;
  const slotX = (i: number) => 40 + i * 96;
  const slot = (i: number, val: number, color: string) =>
    `<rect x="${slotX(i)}" y="${slotY}" width="${slotW}" height="${slotH}" rx="10" fill="${color}22" stroke="${color}" stroke-width="2.2"/>` +
    `<text x="${slotX(i) + slotW / 2}" y="${slotY + 26}" text-anchor="middle" fill="${color}" font-size="17" font-weight="700" font-family="monospace">${val}</text>`;
  const label = (text: string, color: string) =>
    `<text x="10" y="146" fill="${color}" font-size="13" font-family="monospace">${text}</text>`;

  // [inputIndex, slotIndex, value, isAppend]
  const steps: [number, number, number, boolean][] = [
    [0, 0, 10, true],
    [1, 0, 9, false],
    [2, 0, 2, false],
    [3, 1, 5, true],
    [4, 1, 3, false],
    [5, 2, 7, true],
    [6, 3, 101, true],
    [7, 3, 18, false],
  ];

  const g0 = [0, 1, 2, 3, 4, 5, 6, 7].map(inBox).join('');
  const groups = steps.map(([k, slotIdx, val, append], i) => {
    const color = append ? C.good : C.warn;
    return ring(k, color) + slot(slotIdx, val, color) + label(labs[i], color);
  });

  return `<div class="lp-chart">
<svg viewBox="0 0 510 156" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  ${groups.map((g, i) => `<g class="step" data-a="none" data-g="${i + 1}">${g}</g>`).join('\n  ')}
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">0/1</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── Two must-know classics
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>🎒 ${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step" data-a="right"><h3>📈 ${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
</div>`,

    // 3 ── Knapsack: state, transition, the top-down subtlety
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">📦</div><h3>${t.s3c1t}</h3><p>${t.s3c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">⚖️</div><h3>${t.s3c2t}</h3><p>${t.s3c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">⬇️</div><h3>${t.s3c3t}</h3><p>${t.s3c3d}</p></div>
</div>`,

    // 4 ── Animated knapsack dp array
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
${knapsackDp()}
<div class="lp-notes" style="margin-top:8px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s4n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s4n2}</p></div>
</div>`,

    // 5 ── Knapsack: full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::vector&lt;long long&gt; dp(W + 1, 0);
for (int i = 0; i &lt; n; i++) {
</span><span class="step" data-g="1" data-a="none">    for (int cap = W; cap &gt;= w[i]; cap--) {
</span><span class="step" data-g="2" data-a="none">        dp[cap] = std::max(dp[cap], dp[cap - w[i]] + cost[i]);
    }
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s5run}</p>
<p class="lp-p lp-center step" data-g="3"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── LIS: the idea
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s6line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Animated LIS trace
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s7task}</p>
${lisTrace([t.s7n1, t.s7n2, t.s7n3, t.s7n4, t.s7n5, t.s7n6, t.s7n7, t.s7n8])}`,

    // 8 ── LIS: full code
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::vector&lt;long long&gt; tail;
for (long long x : a) {
    auto it = std::lower_bound(tail.begin(), tail.end(), x);
</span><span class="step" data-g="1" data-a="none">    if (it == tail.end()) tail.push_back(x);
    else                   *it = x;
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s8n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s8n2}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s8run}</p>
<p class="lp-p lp-center step" data-g="2"><span class="lp-mark">${t.s8mark}</span></p>`,

    // 9 ── How to invent DP states + task
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s9line}</p>
<p class="lp-p lp-center step">${t.s9task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🔍</div><p>${t.s9hint}</p></div>`,

    // 10 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s10h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">dp[cap]</span><span><b>${t.s10r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">сверху вниз</span><span><b>${t.s10r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">tail</span><span><b>${t.s10r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">lower_bound</span><span><b>${t.s10r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s10cta}</p></div>
<p class="lp-foot lp-center step">${t.s10foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 5',
  title: 'Продвинутое динамическое программирование',
  subtitle: 'Рюкзак 0/1 за O(n·W) и наибольшая возрастающая подпоследовательность за O(n log n)',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Два обязательных классических ДП',
  s2c1t: 'Рюкзак 0/1',
  s2c1d: 'n предметов, каждый берётся один раз, ограничение — вместимость. Максимизируем ценность.',
  s2c2t: 'LIS',
  s2c2d: 'Наибольшая возрастающая подпоследовательность — наивно O(n²), олимпиадно O(n log n).',

  s3h: 'Рюкзак: состояние и главная тонкость',
  s3c1t: 'Состояние',
  s3c1d: 'dp[cap] — максимальная ценность при вместимости ровно cap.',
  s3c2t: 'Переход',
  s3c2d: 'Не берём предмет — ничего не меняется. Берём — dp[cap] = dp[cap − w] + cost.',
  s3c3t: 'Сверху вниз!',
  s3c3d: 'Внутренний цикл по вместимости идёт от W к w[i] — иначе предмет «положится» дважды за один проход.',

  s4h: 'Рюкзак: dp[cap] в деле',
  s4task: '4 предмета (вес/ценность): 3/4, 4/5, 5/6, 2/3. Вместимость W = 8.',
  s4n1: 'После первого предмета (вес 3, ценность 4): все cap ≥ 3 получают dp[cap] = 4 — предмет учтён ровно один раз в каждой ячейке благодаря движению сверху вниз.',
  s4n2: 'После всех четырёх предметов: dp[8] = 10 — предметы весом 3 и 5 (ценности 4 + 6). Между ними и остальными ячейками проверены все комбинации.',

  s5h: 'Рюкзак: весь код',
  s5n1: 'dp[cap] — максимальная ценность на данный момент при вместимости cap. Начинаем с нулей.',
  s5n2: 'Ключевая строка: cap идёт от W вниз до w[i]. Это и есть «сверху вниз».',
  s5n3: 'Взять предмет или нет — берём максимум из обоих вариантов.',
  s5run: 'Запустите этот код в уроке — введите 4 8, затем пары 3 4, 4 5, 5 6, 2 3.',
  s5mark: 'Если пойти снизу вверх, dp[cap - w[i]] может уже включать текущий предмет — он «возьмётся» несколько раз.',

  s6h: 'LIS: массив «лучших концов»',
  s6line: 'tail[k] — минимально возможный конец возрастающей подпоследовательности длины k+1. Каждый новый элемент либо продлевает лучшую подпоследовательность (в конец), либо улучшает чей-то конец (бинарным поиском).',
  s6mark: 'tail — это НЕ сама подпоследовательность, только её лучшие возможные концы. Но длина tail всегда равна длине LIS.',

  s7h: 'LIS: трасса на 10 9 2 5 3 7 101 18',
  s7task: 'Для каждого числа: lower_bound находит первый конец ≥ x. Нашёлся — заменяем. Не нашёлся — продлеваем.',
  s7n1: '10: tail пуст — продлеваем. tail = [10].',
  s7n2: '9: находит 10 ≥ 9 — заменяем. tail = [9].',
  s7n3: '2: находит 9 ≥ 2 — заменяем. tail = [2].',
  s7n4: '5: конца ≥ 5 нет — продлеваем. tail = [2, 5].',
  s7n5: '3: находит 5 ≥ 3 — заменяем. tail = [2, 3].',
  s7n6: '7: конца ≥ 7 нет — продлеваем. tail = [2, 3, 7].',
  s7n7: '101: конца ≥ 101 нет — продлеваем. tail = [2, 3, 7, 101].',
  s7n8: '18: находит 101 ≥ 18 — заменяем. tail = [2, 3, 7, 18]. Длина 4 — это и есть ответ.',

  s8h: 'LIS: весь код',
  s8n1: 'lower_bound за O(log n) находит первый элемент ≥ x в отсортированном tail.',
  s8n2: 'Не нашли — x больше всех, продлеваем массив. Нашли — заменяем найденный конец на x, он теперь лучше.',
  s8run: 'Запустите этот код в уроке — введите 8, затем 10 9 2 5 3 7 101 18.',
  s8mark: 'O(n log n) вместо наивных O(n²) — та же идея бинарного поиска, что и раньше на этом уровне.',

  s9h: 'Как придумывать состояния ДП',
  s9line: 'Спросите себя: какой МИНИМУМ информации о префиксе решения достаточен, чтобы продолжать оптимально? Это и есть параметры состояния.',
  s9task: 'Задание: выведите не длину LIS, а саму подпоследовательность.',
  s9hint: 'Храните для каждого элемента, чей конец он продлил — восстановите цепочку с конца, как список предков.',

  s10h: 'Запомнить',
  s10r1: 'dp[cap] — состояние рюкзака: максимум при данной вместимости',
  s10r2: 'Внутренний цикл рюкзака — строго сверху вниз, иначе предмет задвоится',
  s10r3: 'tail[k] — минимальный конец возрастающей подпоследовательности длины k+1',
  s10r4: 'lower_bound превращает O(n²) в O(n log n) для LIS',
  s10cta: 'Восстановите саму LIS-подпоследовательность и отметьте урок пройденным.',
  s10foot: 'Дальше — дерево отрезков: те же запросы на отрезке, но с обновлениями за O(log n).',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 5-деңгээл',
  title: 'Тереңдетилген динамикалык программалоо',
  subtitle: 'O(n·W) убакыттагы 0/1 рюкзак жана O(n log n) убакыттагы эң узун өсүүчү подпоследовательность',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Милдеттүү эки классикалык ДП',
  s2c1t: '0/1 рюкзак',
  s2c1d: 'n буюм, ар бири бир жолу алынат, чектөө — сыйымдуулук. Баалуулукту максималдаштырабыз.',
  s2c2t: 'LIS',
  s2c2d: 'Эң узун өсүүчү подпоследовательность — наивдүү O(n²), олимпиадалык O(n log n).',

  s3h: 'Рюкзак: абал жана негизги ичке жагдай',
  s3c1t: 'Абал',
  s3c1d: 'dp[cap] — сыйымдуулук так cap болгондогу максималдуу баалуулук.',
  s3c2t: 'Өтүү',
  s3c2d: 'Буюмду албайбыз — эч нерсе өзгөрбөйт. Алабыз — dp[cap] = dp[cap − w] + cost.',
  s3c3t: 'Жогорудан төмөн!',
  s3c3d: 'Сыйымдуулук боюнча ички цикл W дон w[i] ге чейин жүрөт — антпесе буюм бир өтүүдө эки жолу «салынат».',

  s4h: 'Рюкзак: dp[cap] иштин үстүндө',
  s4task: '4 буюм (салмак/баалуулук): 3/4, 4/5, 5/6, 2/3. Сыйымдуулук W = 8.',
  s4n1: 'Биринчи буюмдан кийин (салмагы 3, баалуулугу 4): бардык cap ≥ 3 dp[cap] = 4 алат — буюм жогорудан төмөн жүрүүнүн аркасында ар бир уячада так бир жолу эсептелди.',
  s4n2: 'Бардык төрт буюмдан кийин: dp[8] = 10 — салмагы 3 жана 5 буюмдар (баалуулуктары 4 + 6). Алар менен калган уячалардын арасында бардык айкалыштар текшерилди.',

  s5h: 'Рюкзак: толук код',
  s5n1: 'dp[cap] — cap сыйымдуулугундагы учурдагы максималдуу баалуулук. Нөлдөрдөн башталабыз.',
  s5n2: 'Негизги сап: cap W дон w[i] ге чейин төмөндөйт. Дал ушул «жогорудан төмөн».',
  s5n3: 'Буюмду алуубу же жокпу — эки варианттын максимумун алабыз.',
  s5run: 'Бул кодду сабактан иштетиңиз — 4 8, андан кийин түгөйлөр 3 4, 4 5, 5 6, 2 3 киргизиңиз.',
  s5mark: 'Төмөндөн жогору жүрсөк, dp[cap - w[i]] учурдагы буюмду эбак камтышы мүмкүн — ал бир нече жолу «алынат».',

  s6h: 'LIS: «эң жакшы аяктар» массиви',
  s6line: 'tail[k] — узундугу k+1 болгон өсүүчү подпоследовательностьтун минималдуу мүмкүн болгон аягы. Ар бир жаңы элемент же эң жакшы подпоследовательностьту узартат (аягына), же кимдир бирөөнүн аягын жакшыртат (бинардык издөө менен).',
  s6mark: 'tail — подпоследовательностьтун ӨЗҮ ЭМЕС, анын эң жакшы мүмкүн болгон аяктары гана. Бирок tail дин узундугу дайыма LIS дин узундугуна барабар.',

  s7h: 'LIS: 10 9 2 5 3 7 101 18 боюнча трасса',
  s7task: 'Ар бир сан үчүн: lower_bound x тен ≥ болгон биринчи аягын табат. Тапса — алмаштырабыз. Таппаса — узартабыз.',
  s7n1: '10: tail бош — узартабыз. tail = [10].',
  s7n2: '9: 10 ≥ 9 табылды — алмаштырабыз. tail = [9].',
  s7n3: '2: 9 ≥ 2 табылды — алмаштырабыз. tail = [2].',
  s7n4: '5: ≥ 5 аягы жок — узартабыз. tail = [2, 5].',
  s7n5: '3: 5 ≥ 3 табылды — алмаштырабыз. tail = [2, 3].',
  s7n6: '7: ≥ 7 аягы жок — узартабыз. tail = [2, 3, 7].',
  s7n7: '101: ≥ 101 аягы жок — узартабыз. tail = [2, 3, 7, 101].',
  s7n8: '18: 101 ≥ 18 табылды — алмаштырабыз. tail = [2, 3, 7, 18]. Узундугу 4 — бул дал жооп.',

  s8h: 'LIS: толук код',
  s8n1: 'lower_bound O(log n) убакытта иреттелген tail ичинен x тен ≥ болгон биринчи элементти табат.',
  s8n2: 'Таппадык — x баарынан чоң, массивди узартабыз. Таптык — табылган аягын x менен алмаштырабыз, ал эми жакшы.',
  s8run: 'Бул кодду сабактан иштетиңиз — 8, андан кийин 10 9 2 5 3 7 101 18 киргизиңиз.',
  s8mark: 'Наивдүү O(n²) ордуна O(n log n) — бул деңгээлде мурда эле кездешкен бинардык издөө идеясы.',

  s9h: 'ДП абалдарын кантип ойлоп табуу керек',
  s9line: 'Өзүңүздөн сураңыз: оптималдуу улантуу үчүн чечимдин префикси жөнүндө МИНИМУМ кандай маалымат жетиштүү? Дал ушул — абалдын параметрлери.',
  s9task: 'Тапшырма: LIS узундугун эмес, подпоследовательностьтун өзүн чыгарыңыз.',
  s9hint: 'Ар бир элемент үчүн ал кимдин аягын узартканын сактаңыз — чынжырды аягынан баштап калыбына келтириңиз, ата-бабалардын тизмеси сыяктуу.',

  s10h: 'Эсте сакта',
  s10r1: 'dp[cap] — рюкзактын абалы: берилген сыйымдуулуктагы максимум',
  s10r2: 'Рюкзактын ички цикли — так жогорудан төмөн, антпесе буюм эки эседе эсептелет',
  s10r3: 'tail[k] — узундугу k+1 өсүүчү подпоследовательностьтун минималдуу аягы',
  s10r4: 'lower_bound LIS үчүн O(n²) ди O(n log n) гө айлантат',
  s10cta: 'LIS подпоследовательностьтун өзүн калыбына келтириңиз жана сабакты өттүм деп белгилеңиз.',
  s10foot: 'Андан ары — кесинди дарагы: ошол эле кесиндидеги суроолор, бирок O(log n) убакыттагы жаңылоолор менен.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 5',
  title: 'Advanced Dynamic Programming',
  subtitle: 'The 0/1 knapsack in O(n·W) and the longest increasing subsequence in O(n log n)',
  press: 'Press → or Space to advance',

  s2h: 'Two classic DPs you must know',
  s2c1t: 'The 0/1 knapsack',
  s2c1d: 'n items, each taken at most once, a capacity limit. Maximize the total value.',
  s2c2t: 'LIS',
  s2c2d: 'The longest increasing subsequence — naively O(n²), the contest version O(n log n).',

  s3h: 'The knapsack: state and the key subtlety',
  s3c1t: 'State',
  s3c1d: 'dp[cap] — the maximum value achievable at exactly capacity cap.',
  s3c2t: 'Transition',
  s3c2d: 'Skip the item — nothing changes. Take it — dp[cap] = dp[cap − w] + cost.',
  s3c3t: 'Top-down!',
  s3c3d: 'The inner loop over capacity runs from W down to w[i] — otherwise the item gets "packed" twice in one pass.',

  s4h: 'The knapsack: dp[cap] at work',
  s4task: '4 items (weight/value): 3/4, 4/5, 5/6, 2/3. Capacity W = 8.',
  s4n1: 'After the first item (weight 3, value 4): every cap ≥ 3 gets dp[cap] = 4 — the item is counted exactly once per cell, thanks to the top-down sweep.',
  s4n2: 'After all four items: dp[8] = 10 — the items of weight 3 and 5 (values 4 + 6). Every combination between them and the other cells has been checked.',

  s5h: 'The knapsack: the full code',
  s5n1: 'dp[cap] — the current best value at capacity cap. We start at all zeros.',
  s5n2: 'The key line: cap runs from W down to w[i]. That is the "top-down" part.',
  s5n3: 'Take the item or not — we keep the max of both options.',
  s5run: 'Run this code in the lesson — enter 4 8, then the pairs 3 4, 4 5, 5 6, 2 3.',
  s5mark: 'Going bottom-up, dp[cap - w[i]] could already include the current item — it would get "taken" more than once.',

  s6h: 'LIS: the array of "best endings"',
  s6line: 'tail[k] is the smallest possible ending of an increasing subsequence of length k+1. Every new element either extends the best subsequence (append) or improves someone\'s ending (via binary search).',
  s6mark: 'tail is NOT the subsequence itself — only its best possible endings. But tail\'s length always equals the length of the LIS.',

  s7h: 'LIS: the trace on 10 9 2 5 3 7 101 18',
  s7task: 'For every number: lower_bound finds the first ending ≥ x. Found — replace it. Not found — extend.',
  s7n1: '10: tail is empty — extend. tail = [10].',
  s7n2: '9: finds 10 ≥ 9 — replace. tail = [9].',
  s7n3: '2: finds 9 ≥ 2 — replace. tail = [2].',
  s7n4: '5: no ending ≥ 5 — extend. tail = [2, 5].',
  s7n5: '3: finds 5 ≥ 3 — replace. tail = [2, 3].',
  s7n6: '7: no ending ≥ 7 — extend. tail = [2, 3, 7].',
  s7n7: '101: no ending ≥ 101 — extend. tail = [2, 3, 7, 101].',
  s7n8: '18: finds 101 ≥ 18 — replace. tail = [2, 3, 7, 18]. Length 4 — that\'s the answer.',

  s8h: 'LIS: the full code',
  s8n1: 'lower_bound finds the first element ≥ x in the sorted tail array in O(log n).',
  s8n2: 'Not found — x is bigger than everything, extend the array. Found — overwrite that ending with x, now a better one.',
  s8run: 'Run this code in the lesson — enter 8, then 10 9 2 5 3 7 101 18.',
  s8mark: 'O(n log n) instead of the naive O(n²) — the same binary-search idea seen earlier at this level.',

  s9h: 'How to invent DP states',
  s9line: 'Ask yourself: what is the MINIMUM information about the solution\'s prefix that\'s enough to continue optimally? That\'s exactly the state\'s parameters.',
  s9task: 'Task: output the actual LIS subsequence, not just its length.',
  s9hint: 'For each element, store whose ending it extended — walk the chain back from the end, like a list of ancestors.',

  s10h: 'Remember',
  s10r1: 'dp[cap] — the knapsack\'s state: the max value at a given capacity',
  s10r2: 'The knapsack\'s inner loop runs strictly top-down, or the item gets double-counted',
  s10r3: 'tail[k] — the smallest ending of an increasing subsequence of length k+1',
  s10r4: 'lower_bound turns LIS from O(n²) into O(n log n)',
  s10cta: 'Reconstruct the actual LIS subsequence and mark the lesson as completed.',
  s10foot: 'Next up: the segment tree — the same range queries, but with O(log n) updates.',
};

export const dpAdvanced: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
