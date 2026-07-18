import type { LessonPresentationData } from './types';

// Presentation for the "Dynamic Programming: Basics" lesson
// (olympiad-roadmap → level-4-graphs-dp → dp-basics). Closes level 4.
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

  s5h: string; s5n1: string; s5n2: string; s5n3: string; s5run: string; s5mark: string;

  s6h: string; s6c1t: string; s6c1d: string; s6c2t: string; s6c2d: string; s6mark: string;

  s7h: string; s7task: string;
  s7r1: string; s7r2: string; s7r3: string; s7r4: string; s7ans: string;

  s8h: string; s8n1: string; s8n2: string; s8run: string; s8mark: string;

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

// staircaseDp renders the dp[i] = dp[i-1] + dp[i-2] table for n = 10: group 0
// shows just the base cells dp[0], dp[1]; group 1 draws the two converging
// arrows that produce dp[2] as a worked example; group 2 fills the rest of
// the table at once ("and so on"); group 3 rings the final answer dp[10].
function staircaseDp(): string {
  const vals = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  const cellX = (i: number) => 10 + i * 47;
  const cy = 60, w = 40, h = 40;

  const cell = (i: number, shown: boolean, ring?: string) =>
    `<rect x="${cellX(i)}" y="${cy}" width="${w}" height="${h}" rx="8" fill="${ring ? ring + '22' : 'rgba(255,255,255,.04)'}" stroke="${ring ?? 'rgba(255,255,255,.22)'}" stroke-width="${ring ? 2.4 : 1.5}" ${shown ? '' : 'stroke-dasharray="4 3"'}/>` +
    (shown
      ? `<text x="${cellX(i) + w / 2}" y="${cy + 25}" text-anchor="middle" fill="${ring ?? '#cbd5e1'}" font-size="16" font-family="monospace">${vals[i]}</text>`
      : '') +
    `<text x="${cellX(i) + w / 2}" y="${cy - 8}" text-anchor="middle" fill="#64748b" font-size="11" font-family="monospace">i=${i}</text>`;

  const arrow = (from: number, to: number) => {
    const x1 = cellX(from) + w / 2, x2 = cellX(to) + w / 2;
    const y1 = cy + h + 2, y2 = cy + h + 22;
    return `<path d="M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y2 + 10}, ${x2} ${y1}" fill="none" stroke="${C.acc}" stroke-width="1.8" marker-end="url(#dpArrow)"/>`;
  };

  const g0 = [0, 1].map((i) => cell(i, true)).join('') + [2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => cell(i, false)).join('');
  const g1 = arrow(0, 2) + arrow(1, 2) + cell(2, true, C.acc) +
    `<text x="10" y="140" fill="${C.acc}" font-size="13" font-family="monospace">dp[2] = dp[1] + dp[0] = 1 + 1 = 2</text>`;
  const g2 = [3, 4, 5, 6, 7, 8, 9, 10].map((i) => cell(i, true)).join('');
  const g3 = cell(10, true, C.good);

  return `<div class="lp-chart">
<svg viewBox="0 0 540 160" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>
    <marker id="dpArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="${C.acc}"/>
    </marker>
  </defs>
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
  <div class="lp-bigo" aria-hidden="true">dp[i]</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The idea: overlapping subproblems
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>❌ ${t.s2bad}</h3><p>${t.s2badD}</p></div>
  <div class="lp-card step" data-a="right"><h3>✅ ${t.s2good}</h3><p>${t.s2goodD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── The three-question recipe
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">❓</div><h3>${t.s3c1t}</h3><p>${t.s3c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔗</div><h3>${t.s3c2t}</h3><p>${t.s3c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🧱</div><h3>${t.s3c3t}</h3><p>${t.s3c3d}</p></div>
</div>`,

    // 4 ── Animated staircase table
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
${staircaseDp()}
<div class="lp-notes" style="margin-top:2px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s4n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s4n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="none"><p>${t.s4n3}</p></div>
</div>`,

    // 5 ── Staircase: full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">dp[0] = 1;
dp[1] = 1;
</span><span class="step" data-g="1" data-a="none">
for (int i = 2; i &lt;= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
}
</span><span class="step" data-g="2" data-a="none">std::cout &lt;&lt; dp[n];</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s5run}</p>
<p class="lp-p lp-center step" data-g="3"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── Two styles of writing DP
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>📊 ${t.s6c1t}</h3><p>${t.s6c1d}</p></div>
  <div class="lp-card step" data-a="right"><h3>🗃️ ${t.s6c2t}</h3><p>${t.s6c2d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Kadane's trace
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s7task}</p>
<div class="lp-chips">
  <span class="lp-chip step" style="--c:${C.bad}">−2</span>
  <span class="lp-chip step" style="--c:${C.good}">1</span>
  <span class="lp-chip step" style="--c:${C.bad}">−3</span>
  <span class="lp-chip step" style="--c:${C.good}">4</span>
  <span class="lp-chip step" style="--c:${C.bad}">−1</span>
  <span class="lp-chip step" style="--c:${C.good}">2</span>
  <span class="lp-chip step" style="--c:${C.good}">1</span>
  <span class="lp-chip step" style="--c:${C.bad}">−5</span>
</div>
<div class="lp-scale" style="margin-top:14px">
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.info}">−2, 1</span><span>${t.s7r1}</span><code class="lp-mini">cur 1 · best 1</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.warn}">−3, 4</span><span>${t.s7r2}</span><code class="lp-mini">cur 4 · best 4</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.info}">−1, 2</span><span>${t.s7r3}</span><code class="lp-mini">cur 5 · best 5</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.good}">1, −5</span><span>${t.s7r4}</span><code class="lp-mini">cur 1 · best 6</code></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s7ans}</span></p>`,

    // 8 ── Kadane's: full code
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">long long best = a[0], cur = a[0];
for (int i = 1; i &lt; n; i++) {
</span><span class="step" data-g="1" data-a="none">    cur = std::max(a[i], cur + a[i]);
    best = std::max(best, cur);
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s8n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s8n2}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s8run}</p>
<p class="lp-p lp-center step" data-g="2"><span class="lp-mark">${t.s8mark}</span></p>`,

    // 9 ── Task teaser
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s9task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🪜</div><p>${t.s9hint}</p></div>`,

    // 10 ── Recap + call to action (level 4 complete)
    `<h2 class="lp-h lp-center">${t.s10h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">состояние</span><span><b>${t.s10r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">переход</span><span><b>${t.s10r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">база</span><span><b>${t.s10r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">O(1) память</span><span><b>${t.s10r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s10cta}</p></div>
<p class="lp-foot lp-center step">${t.s10foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 4',
  title: 'Динамическое программирование: основы',
  subtitle: 'Состояния, переходы, база — и две классики: лестница и максимальный подотрезок',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Перекрывающиеся подзадачи',
  s2bad: 'Наивная рекурсия',
  s2badD: 'Одни и те же подзадачи решаются заново снова и снова — экспоненциальный взрыв.',
  s2good: 'ДП',
  s2goodD: 'Решаем каждую подзадачу ОДИН раз и запоминаем ответ — остальное O(1).',
  s2mark: 'Динамическое программирование — не алгоритм, а способ мышления о задаче.',

  s3h: 'Рецепт из трёх вопросов',
  s3c1t: 'Состояние',
  s3c1d: 'Что такое dp[i]? Нужно уметь сформулировать словами, точно и однозначно.',
  s3c2t: 'Переходы',
  s3c2d: 'Как dp[i] выражается через уже посчитанные, более маленькие состояния?',
  s3c3t: 'База',
  s3c3d: 'Чему равны самые маленькие состояния — те, что не сводятся к ещё меньшим?',

  s4h: 'Лестница: dp[i] = dp[i−1] + dp[i−2]',
  s4task: 'n = 10 ступеней, шаг на 1 или 2. Сколько способов подняться?',
  s4n1: 'База: dp[0] = 1 (стоим внизу, один способ — никуда не шагать), dp[1] = 1.',
  s4n2: 'На ступень i приходят с i−1 (шаг на одну) или с i−2 (шаг на две) — складываем оба пути.',
  s4n3: 'Заполняем так до конца. dp[10] = 89 — числа Фибоначчи выросли из задачи сами собой.',

  s5h: 'Лестница: весь код',
  s5n1: 'Базовые случаи — стоять внизу и сделать один шаг.',
  s5n2: 'Каждая следующая ступень — сумма двух предыдущих. Один проход, без рекурсии.',
  s5n3: 'Ответ уже готов — просто читаем последнюю ячейку.',
  s5run: 'Запустите этот код в уроке — введите 10.',
  s5mark: 'O(n) времени и O(n) памяти — сложность порядка задачи, а не её наивного перебора.',

  s6h: 'Два стиля записи ДП',
  s6c1t: 'Табличный',
  s6c1d: 'Заполняем массив от базы вверх, как в коде выше — понятный порядок вычислений.',
  s6c2t: 'Мемоизация',
  s6c2d: 'Пишем обычную рекурсию, но кешируем результат каждого состояния — считаем один раз.',
  s6mark: 'Что удобнее — дело вкуса и структуры задачи. Сложность одна и та же.',

  s7h: 'Кадане: максимальный подотрезок',
  s7task: 'Массив −2 1 −3 4 −1 2 1 −5. На каждом шаге: продолжить текущий отрезок или начать новый?',
  s7r1: 'После −2: cur = −2. После 1: продолжать (−2+1=−1) хуже, чем начать заново (1) — cur = 1.',
  s7r2: 'После −3: продолжать (1−3=−2) лучше, чем начать (−3) — cur = −2. После 4: начать заново (4) лучше — cur = 4, новый рекорд.',
  s7r3: 'После −1: продолжать (4−1=3) лучше начала (−1) — cur = 3. После 2: продолжать (3+2=5) — новый рекорд.',
  s7r4: 'После 1: продолжать (5+1=6) — рекорд 6! После −5: продолжать (6−5=1) лучше начала — cur = 1, но best остаётся 6.',
  s7ans: 'Ответ: 6 — подотрезок 4 −1 2 1. dp[i] схлопнулся в одну переменную cur: переход смотрит только на предыдущее состояние.',

  s8h: 'Кадане: весь код',
  s8n1: 'best и cur стартуют с первого элемента — подотрезок не может быть пустым.',
  s8n2: 'Одно сравнение решает «продолжить или начать заново», второе — обновляет рекорд.',
  s8run: 'Запустите этот код в уроке — введите 8, затем −2 1 −3 4 −1 2 1 −5.',
  s8mark: 'O(n) времени, O(1) памяти — рекордно экономно для задачи, которая наивно выглядит как O(n²).',

  s9h: 'Задание',
  s9task: 'Решите «лестницу» с запретом: на некоторые ступени наступать нельзя.',
  s9hint: 'Для запрещённой ступени просто положите dp[i] = 0 — переходы сами перестанут через неё проходить. Затем подумайте: что изменится, если шаги — 1, 2 и 3 ступени?',

  s10h: 'Запомнить',
  s10r1: 'Состояние — что именно значит dp[i], сформулированное точно',
  s10r2: 'Переход — как dp[i] строится из меньших состояний',
  s10r3: 'База — с чего всё начинается',
  s10r4: 'Когда переход смотрит лишь на предыдущее состояние — массив схлопывается в переменную',
  s10cta: 'Решите «лестницу с запретами» и отметьте урок пройденным — Уровень 4 завершён!',
  s10foot: 'Впереди Уровень 5: продвинутое ДП, дерево отрезков, строковые алгоритмы и теория чисел.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 4-деңгээл',
  title: 'Динамикалык программалоо: негиздер',
  subtitle: 'Абалдар, өтүүлөр, база — жана эки классика: тепкич жана максималдуу кесинди',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Кайталанып кесилишкен подмаселелер',
  s2bad: 'Жөнөкөй рекурсия',
  s2badD: 'Бир эле подмаселелер кайра-кайра чечилет — экспоненциалдык жарылуу.',
  s2good: 'ДП',
  s2goodD: 'Ар бир подмаселени БИР жолу чечип, жоопту эстеп калабыз — калганы O(1).',
  s2mark: 'Динамикалык программалоо — алгоритм эмес, маселе жөнүндө ойлоо ыкмасы.',

  s3h: 'Үч суроодон турган рецепт',
  s3c1t: 'Абал',
  s3c1d: 'dp[i] деген эмне? Сөз менен так жана бир маанилүү туюндура билүү керек.',
  s3c2t: 'Өтүүлөр',
  s3c2d: 'dp[i] эбак эсептелген, кичине абалдар аркылуу кантип туюнтулат?',
  s3c3t: 'База',
  s3c3d: 'Эң кичине абалдар — андан ары кичирейбегендер — эмнеге барабар?',

  s4h: 'Тепкич: dp[i] = dp[i−1] + dp[i−2]',
  s4task: 'n = 10 тепкич, 1 же 2 тепкичке кадам. Канча жол менен чыгууга болот?',
  s4n1: 'База: dp[0] = 1 (түбүндө турабыз, бир жол — эч жакка кадам таштабоо), dp[1] = 1.',
  s4n2: 'i тепкичине i−1 ден (бир кадам) же i−2 ден (эки кадам) келишет — эки жолду чогултабыз.',
  s4n3: 'Ушинтип аягына чейин толтурабыз. dp[10] = 89 — маселенин ичинен өзүнөн өзү өскөн Фибоначчи сандары.',

  s5h: 'Тепкич: толук код',
  s5n1: 'Негизги учурлар — түбүндө туруу жана бир кадам таштоо.',
  s5n2: 'Ар бир кийинки тепкич — эки мурункунун суммасы. Бир өтүү, рекурсиясыз.',
  s5n3: 'Жооп эбак даяр — жөн гана акыркы уячаны окуйбуз.',
  s5run: 'Бул кодду сабактан иштетиңиз — 10 киргизиңиз.',
  s5mark: 'O(n) убакыт жана O(n) эс тутум — маселенин наивдүү кыдыруусу эмес, өз татаалдыгы.',

  s6h: 'ДП жазуунун эки стили',
  s6c1t: 'Таблицалык',
  s6c1d: 'Массивди базадан өйдө карай толтурабыз, жогорудагы коддогудай — эсептөө тартиби түшүнүктүү.',
  s6c2t: 'Мемоизация',
  s6c2d: 'Кадимки рекурсия жазабыз, бирок ар бир абалдын жыйынтыгын кештейбиз — бир жолу эсептейбиз.',
  s6mark: 'Кайсынысы ыңгайлуу — табит жана маселенин түзүлүшүнүн иши. Татаалдыгы бирдей.',

  s7h: 'Кадане: максималдуу кесинди',
  s7task: '−2 1 −3 4 −1 2 1 −5 массиви. Ар бир кадамда: учурдагы кесиндини улантабызбы же жаңысын баштайбызбы?',
  s7r1: '−2 дон кийин: cur = −2. 1 ден кийин: улантуу (−2+1=−1) жаңыдан баштоодон (1) начар — cur = 1.',
  s7r2: '−3 тен кийин: улантуу (1−3=−2) баштоодон (−3) жакшы — cur = −2. 4 тен кийин: жаңыдан баштоо (4) жакшы — cur = 4, жаңы рекорд.',
  s7r3: '−1 ден кийин: улантуу (4−1=3) баштоодон (−1) жакшы — cur = 3. 2 ден кийин: улантуу (3+2=5) — жаңы рекорд.',
  s7r4: '1 ден кийин: улантуу (5+1=6) — рекорд 6! −5 тен кийин: улантуу (6−5=1) баштоодон жакшы — cur = 1, бирок best 6 бойдон калат.',
  s7ans: 'Жооп: 6 — 4 −1 2 1 кесиндиси. dp[i] бир cur өзгөрмөсүнө кыскарды: өтүү мурунку абалды гана карайт.',

  s8h: 'Кадане: толук код',
  s8n1: 'best менен cur биринчи элементтен башталат — кесинди бош болушу мүмкүн эмес.',
  s8n2: 'Бир салыштыруу «улантуубу же жаңыдан баштообу» дегенди чечет, экинчиси — рекорддду жаңыртат.',
  s8run: 'Бул кодду сабактан иштетиңиз — 8, андан кийин −2 1 −3 4 −1 2 1 −5 киргизиңиз.',
  s8mark: 'O(n) убакыт, O(1) эс тутум — наивдүү O(n²) сыяктуу көрүнгөн маселе үчүн рекорддук үнөмдүү.',

  s9h: 'Тапшырма',
  s9task: 'Тыюу менен «тепкичти» чечиңиз: кээ бир тепкичтерге басууга болбойт.',
  s9hint: 'Тыюу салынган тепкич үчүн жөн гана dp[i] = 0 коюңуз — өтүүлөр өзү эле ал аркылуу өтпөй калат. Андан кийин ойлонуңуз: кадамдар 1, 2 жана 3 тепкич болсо эмне өзгөрөт?',

  s10h: 'Эсте сакта',
  s10r1: 'Абал — dp[i] так эмнени билдирерин так туюндуруу',
  s10r2: 'Өтүү — dp[i] кичине абалдардан кантип курулат',
  s10r3: 'База — баары эмнеден башталат',
  s10r4: 'Өтүү мурунку абалды гана караганда — массив өзгөрмөгө кыскарат',
  s10cta: '«Тыюулуу тепкичти» чечиңиз жана сабакты өттүм деп белгилеңиз — 4-деңгээл аяктады!',
  s10foot: 'Алдыда 5-деңгээл: тереңдетилген ДП, кесинди дарагы, саптык алгоритмдер жана сандар теориясы.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 4',
  title: 'Dynamic Programming: Basics',
  subtitle: 'States, transitions, the base case — and two classics: the staircase and the maximum subarray',
  press: 'Press → or Space to advance',

  s2h: 'Overlapping subproblems',
  s2bad: 'Naive recursion',
  s2badD: 'The same subproblems get solved again and again — an exponential blow-up.',
  s2good: 'DP',
  s2goodD: 'Solve each subproblem ONCE and remember the answer — everything after that is O(1).',
  s2mark: 'Dynamic programming isn\'t an algorithm — it\'s a way of thinking about a problem.',

  s3h: 'The three-question recipe',
  s3c1t: 'State',
  s3c1d: 'What exactly is dp[i]? You need to be able to state it in words, precisely and unambiguously.',
  s3c2t: 'Transitions',
  s3c2d: 'How is dp[i] expressed through already-computed, smaller states?',
  s3c3t: 'The base case',
  s3c3d: 'What are the smallest states — the ones that don\'t reduce to anything smaller — equal to?',

  s4h: 'The staircase: dp[i] = dp[i−1] + dp[i−2]',
  s4task: 'n = 10 steps, climbing 1 or 2 at a time. How many ways to reach the top?',
  s4n1: 'Base: dp[0] = 1 (standing at the bottom, one way — take no steps at all), dp[1] = 1.',
  s4n2: 'Step i is reached from i−1 (a single step) or i−2 (a double step) — add both paths together.',
  s4n3: 'Fill the rest the same way. dp[10] = 89 — the Fibonacci numbers grew out of the problem on their own.',

  s5h: 'The staircase: the full code',
  s5n1: 'The base cases — standing at the bottom, and taking a single step.',
  s5n2: 'Each next step is the sum of the two before it. One pass, no recursion.',
  s5n3: 'The answer is already sitting there — just read the last cell.',
  s5run: 'Run this code in the lesson — enter 10.',
  s5mark: 'O(n) time and O(n) memory — the complexity of the problem itself, not a naive brute force over it.',

  s6h: 'Two styles of writing DP',
  s6c1t: 'Tabular',
  s6c1d: 'Fill the array from the base upward, as in the code above — a clear order of computation.',
  s6c2t: 'Memoization',
  s6c2d: 'Write plain recursion, but cache the result of every state — each one gets computed once.',
  s6mark: 'Which is more convenient is a matter of taste and the shape of the problem. The complexity is the same.',

  s7h: 'Kadane: the maximum subarray',
  s7task: 'The array −2 1 −3 4 −1 2 1 −5. At every step: extend the current run, or start a new one?',
  s7r1: 'After −2: cur = −2. After 1: extending (−2+1=−1) is worse than starting fresh (1) — cur = 1.',
  s7r2: 'After −3: extending (1−3=−2) beats starting fresh (−3) — cur = −2. After 4: starting fresh (4) wins — cur = 4, a new record.',
  s7r3: 'After −1: extending (4−1=3) beats starting fresh (−1) — cur = 3. After 2: extending (3+2=5) — a new record.',
  s7r4: 'After 1: extending (5+1=6) — a record of 6! After −5: extending (6−5=1) beats starting fresh — cur = 1, but best stays at 6.',
  s7ans: 'Answer: 6 — the subarray 4 −1 2 1. dp[i] collapsed into a single variable cur: the transition only looks at the previous state.',

  s8h: 'Kadane\'s: the full code',
  s8n1: 'best and cur start at the first element — a subarray can\'t be empty.',
  s8n2: 'One comparison decides "extend or start fresh", the other updates the record.',
  s8run: 'Run this code in the lesson — enter 8, then −2 1 −3 4 −1 2 1 −5.',
  s8mark: 'O(n) time, O(1) memory — remarkably economical for a problem that naively looks like O(n²).',

  s9h: 'Task',
  s9task: 'Solve the "staircase" with a restriction: stepping on certain steps is forbidden.',
  s9hint: 'For a forbidden step, just set dp[i] = 0 — transitions will naturally stop passing through it. Then think: what changes if the steps are 1, 2, and 3 at a time?',

  s10h: 'Remember',
  s10r1: 'State — precisely what dp[i] means',
  s10r2: 'Transition — how dp[i] is built from smaller states',
  s10r3: 'Base case — where everything starts',
  s10r4: 'When the transition only looks at the previous state, the array collapses into a variable',
  s10cta: 'Solve the "staircase with restrictions" and mark the lesson as completed — Level 4 is done!',
  s10foot: 'Up next, Level 5: advanced DP, segment trees, string algorithms, and number theory.',
};

export const dpBasics: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
