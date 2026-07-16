import type { LessonPresentationData } from './types';

// Presentation for the "Implementation Problems" lesson
// (olympiad-roadmap → level-1-foundations → implementation-problems).
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
  s2out: string;

  s3h: string;
  s3e1t: string; s3e1d: string;
  s3e2t: string; s3e2d: string;
  s3e3t: string; s3e3d: string;
  s3out: string;

  s4h: string; s4task: string; s4formula: string; s4rule: string;

  s5h: string; s5n1: string; s5n2: string; s5n3: string; s5run: string;

  s6h: string;
  s6badT: string; s6badD: string;
  s6okT: string; s6okD: string;
  s6cm: string; s6mark: string;

  s7h: string; s7start: string;
  s7r1: string; s7r2: string; s7r3: string; s7r4: string; s7out: string;

  s8h: string;
  s8r1t: string; s8r1d: string;
  s8r2t: string; s8r2d: string;
  s8r3t: string; s8r3d: string;
  s8r4t: string; s8r4d: string;
  s8out: string;

  s9h: string; s9r1: string; s9r2: string; s9r3: string; s9cta: string;
}

const C = {
  good: '#34d399',
  bad: '#f87171',
  warn: '#fbbf24',
  info: '#60a5fa',
  acc: '#818cf8',
};

// chessGrid renders the animated 3×5 board: reveal group 0 shows the empty
// grid with i/j labels, group 1 marks the (i+j)-even cells with '#',
// group 2 fills the rest with '.'.
function chessGrid(): string {
  const cellAt = (i: number, j: number) => ({ x: 70 + j * 94, y: 60 + i * 94 });
  let base = '';
  let hash = '';
  let dots = '';
  for (let j = 0; j < 5; j++) {
    base += `<text x="${70 + j * 94 + 44}" y="44" text-anchor="middle" fill="#64748b" font-size="15" font-family="monospace">j=${j}</text>`;
  }
  for (let i = 0; i < 3; i++) {
    base += `<text x="58" y="${60 + i * 94 + 52}" text-anchor="end" fill="#64748b" font-size="15" font-family="monospace">i=${i}</text>`;
    for (let j = 0; j < 5; j++) {
      const { x, y } = cellAt(i, j);
      base += `<rect x="${x}" y="${y}" width="88" height="88" rx="10" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.14)"/>`;
      if ((i + j) % 2 === 0) {
        hash += `<rect x="${x}" y="${y}" width="88" height="88" rx="10" fill="rgba(129,140,248,.22)" stroke="${C.acc}" stroke-width="2"/>`;
        hash += `<text x="${x + 44}" y="${y + 58}" text-anchor="middle" fill="#c7d2fe" font-size="40" font-family="monospace">#</text>`;
      } else {
        dots += `<text x="${x + 44}" y="${y + 58}" text-anchor="middle" fill="#64748b" font-size="40" font-family="monospace">.</text>`;
      }
    }
  }
  return `<div class="lp-chart">
<svg viewBox="0 0 552 350" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${base}</g>
  <g class="step" data-a="none" data-g="1">${hash}</g>
  <g class="step" data-a="none" data-g="2">${dots}</g>
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">YES ≠ Yes</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The trap of "easy" problems
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🧠</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">💥</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🎯</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2out}</span></p>`,

    // 3 ── The three enemies
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">📖</div><h3>${t.s3e1t}</h3><p>${t.s3e1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🧩</div><h3>${t.s3e2t}</h3><p>${t.s3e2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">📤</div><h3>${t.s3e3t}</h3><p>${t.s3e3d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s3out}</span></p>`,

    // 4 ── Example 1: the chessboard pattern (animated grid)
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
${chessGrid()}
<p class="lp-p lp-center step" data-g="3"><code class="lp-mini">${t.s4formula}</code></p>
<p class="lp-foot lp-center step" data-g="4">${t.s4rule}</p>`,

    // 5 ── Example 1: the full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">int n, m;
std::cin &gt;&gt; n &gt;&gt; m;
</span><span class="step" data-g="1" data-a="none">
for (int i = 0; i &lt; n; i++) {
    for (int j = 0; j &lt; m; j++) {
</span><span class="step" data-g="2" data-a="none">        if ((i + j) % 2 == 0) std::cout &lt;&lt; '#';
        else                  std::cout &lt;&lt; '.';
    }
    std::cout &lt;&lt; "\\n";
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s5run}</p>`,

    // 6 ── Example 2: second maximum — naive vs robust
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-g="0" data-a="left"><h3>❌ ${t.s6badT}</h3><p>${t.s6badD}</p></div>
  <div class="lp-card step" data-g="1" data-a="right"><h3>✅ ${t.s6okT}</h3><p>${t.s6okD}</p></div>
</div>
<div class="step" data-g="2">
<pre class="lp-code">long long best   = std::max(a[0], a[1]);
long long second = std::min(a[0], a[1]);

for (int i = 2; i &lt; n; i++) {
    if (a[i] &gt; best) {
        second = best;      <span class="cm">// ${t.s6cm}</span>
        best = a[i];
    } else if (a[i] &gt; second) {
        second = a[i];
    }
}</pre>
</div>
<p class="lp-p lp-center step" data-g="3"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Example 2: trace on 3 9 4 9 7
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-chips">
  <span class="lp-chip" style="--c:${C.info}">3</span>
  <span class="lp-chip" style="--c:${C.info}">9</span>
  <span class="lp-chip" style="--c:${C.info}">4</span>
  <span class="lp-chip" style="--c:${C.info}">9</span>
  <span class="lp-chip" style="--c:${C.info}">7</span>
</div>
<div class="lp-scale" style="margin-top:16px">
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.acc}">${t.s7start}</span><span>${t.s7r1}</span><code class="lp-mini">best 9 · second 3</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.info}">a[2] = 4</span><span>${t.s7r2}</span><code class="lp-mini">best 9 · second 4</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.warn}">a[3] = 9</span><span>${t.s7r3}</span><code class="lp-mini">best 9 · second 9</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.info}">a[4] = 7</span><span>${t.s7r4}</span><code class="lp-mini">best 9 · second 9</code></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s7out}</span></p>`,

    // 8 ── The pre-submit checklist
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-qnum">1</span><span><b>${t.s8r1t}</b><br><span class="lp-dim">${t.s8r1d}</span></span></div>
  <div class="lp-row step"><span class="lp-qnum">2</span><span><b>${t.s8r2t}</b><br><span class="lp-dim">${t.s8r2d}</span></span></div>
  <div class="lp-row step"><span class="lp-qnum">3</span><span><b>${t.s8r3t}</b><br><span class="lp-dim">${t.s8r3d}</span></span></div>
  <div class="lp-row step"><span class="lp-qnum">4</span><span><b>${t.s8r4t}</b><br><span class="lp-dim">${t.s8r4d}</span></span></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s8out}</span></p>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">📖</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">🧩</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">📤</span><span><b>${t.s9r3}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 1',
  title: 'Задачи на реализацию',
  subtitle: 'Хитрый алгоритм не нужен. Нужно аккуратно сделать ровно то, что написано в условии.',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Ловушка «простых» задач',
  s2c1t: 'Алгоритм не нужен',
  s2c1d: 'Ни графов, ни ДП — просто сделать по условию.',
  s2c2t: 'Но попыток теряют больше всего',
  s2c2d: 'Именно на реализации новички получают больше всего WA — Wrong Answer.',
  s2c3t: 'Аккуратность — это навык',
  s2c3d: 'Его тренируют так же осознанно, как алгоритмы.',
  s2out: 'Разберём три главных источника ошибок — и защиту от них.',

  s3h: 'Три главных врага',
  s3e1t: 'Невнимательное чтение',
  s3e1d: 'Перепутали строки и столбцы, забыли нумерацию с единицы, не заметили слово «включительно».',
  s3e2t: 'Краевые случаи',
  s3e2d: 'n = 1, пустая строка, все элементы одинаковые, отрицательные числа.',
  s3e3t: 'Формат вывода',
  s3e3d: 'Лишний пробел, недостающий перевод строки, YES вместо Yes.',
  s3out: 'Любая из этих мелочей = 0 баллов за попытку.',

  s4h: 'Пример 1. Шахматная доска 3 × 5',
  s4task: 'Нарисовать доску из # и точек. Вся задача — заметить закономерность.',
  s4formula: '(i + j) % 2 == 0 → #, иначе → .',
  s4rule: 'Цвет клетки зависит только от чётности суммы i + j.',

  s5h: 'Шахматная доска: весь код',
  s5n1: 'Читаем размеры. В условии сказано: сначала строки, потом столбцы — не перепутайте!',
  s5n2: 'Два вложенных цикла: внешний — по строкам, внутренний — по столбцам.',
  s5n3: 'Одна проверка чётности — и никакой магии. После каждой строки — перевод строки.',
  s5run: 'Запустите этот код в уроке — введите 3 5.',

  s6h: 'Пример 2. Второй по величине элемент',
  s6badT: 'Наивно',
  s6badD: 'Начать с second = 0 и обновлять в цикле. Ломается на отрицательных: [-5, -2] → ответ 0?!',
  s6okT: 'Надёжно',
  s6okD: 'Инициализировать из первых двух элементов: best = max(a₀, a₁), second = min(a₀, a₁).',
  s6cm: 'старый максимум — теперь второй',
  s6mark: 'Две ветки: новый максимум сдвигает старый на «второе место».',

  s7h: 'Прогон на примере: 3 9 4 9 7',
  s7start: 'старт',
  s7r1: 'инициализация из первых двух элементов',
  s7r2: '4 > 3 → обновляем second',
  s7r3: '9 не больше best, но 9 > 4 → second = 9',
  s7r4: '7 меньше обоих — пропускаем',
  s7out: 'Ответ: 9 — «второй по величине» может быть равен максимуму.',

  s8h: 'Чеклист перед отправкой',
  s8r1t: 'Перечитайте условие — ПОСЛЕ написания кода',
  s8r1d: 'вы удивитесь, как часто решается «не та задача»',
  s8r2t: 'Прогоните пример из условия руками',
  s8r2d: 'строка за строкой, как это сделает проверяющая система',
  s8r3t: 'Придумайте свои краевые тесты',
  s8r3d: 'минимальный n, одинаковые элементы, крайние значения из ограничений',
  s8r4t: 'Проверьте типы',
  s8r4d: 'помещается ли ответ в int? 10⁵ · 10⁵ = 10¹⁰ — уже нет',
  s8out: 'Две минуты проверки экономят полчаса на повторных попытках.',

  s9h: 'Запомнить',
  s9r1: 'Читайте условие дважды',
  s9r2: 'Ищите краевые случаи',
  s9r3: 'Соблюдайте формат вывода до символа',
  s9cta: 'К уроку прикреплены четыре задачи на аккуратность. Решите все — и отметьте урок пройденным.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 1-деңгээл',
  title: 'Ишке ашыруу маселелери',
  subtitle: 'Куу алгоритмдин кереги жок. Шартта жазылганды так аткаруу керек.',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: '«Жөнөкөй» маселелердин тузагы',
  s2c1t: 'Алгоритм керек эмес',
  s2c1d: 'Граф да, ДП да жок — шарт боюнча гана жасоо.',
  s2c2t: 'Бирок аракеттер эң көп ушул жерде күйөт',
  s2c2d: 'Жаңы үйрөнчүктөр эң көп WA — Wrong Answer — дал ушул маселелерден алат.',
  s2c3t: 'Тактык — бул көндүм',
  s2c3d: 'Аны да алгоритмдер сыяктуу атайылап машыктырышат.',
  s2out: 'Каталардын үч башкы булагын жана алардан коргонууну карайбыз.',

  s3h: 'Үч башкы душман',
  s3e1t: 'Шартты кунт коюп окубоо',
  s3e1d: 'Саптар менен мамычаларды алмаштыруу, биринен башталган номерлөөнү унутуу, «кошо алганда» деген сөздү байкабоо.',
  s3e2t: 'Чектик учурлар',
  s3e2d: 'n = 1, бош сап, бардык элементтер бирдей, терс сандар.',
  s3e3t: 'Чыгаруу форматы',
  s3e3d: 'Ашыкча боштук, жетишпеген сап которуу, Yes ордуна YES.',
  s3out: 'Ушул майдалардын кайсынысы болбосун = аракет үчүн 0 балл.',

  s4h: '1-мисал. 3 × 5 шахмат тактасы',
  s4task: '# жана чекиттерден такта тартуу керек. Бүт маселе — мыйзам ченемдүүлүктү байкоодо.',
  s4formula: '(i + j) % 2 == 0 → #, болбосо → .',
  s4rule: 'Клетканын түсү i + j суммасынын жуптугунан гана көз каранды.',

  s5h: 'Шахмат тактасы: толук код',
  s5n1: 'Өлчөмдөрдү окуйбуз. Шартта: адегенде саптар, анан мамычалар — алмаштырбаңыз!',
  s5n2: 'Эки кабатталган цикл: сырткысы — саптар боюнча, ичкиси — мамычалар боюнча.',
  s5n3: 'Жуптукка бир гана текшерүү — эч кандай сыйкыр жок. Ар бир саптан кийин — сап которуу.',
  s5run: 'Бул кодду сабактан иштетиңиз — 3 5 киргизиңиз.',

  s6h: '2-мисал. Экинчи чоң элемент',
  s6badT: 'Жөнөкөйлөтүп',
  s6badD: 'second = 0 деп баштап, циклде жаңыртуу. Терс сандарда бузулат: [-5, -2] → жооп 0?!',
  s6okT: 'Ишенимдүү',
  s6okD: 'Алгачкы эки элементтен баштайбыз: best = max(a₀, a₁), second = min(a₀, a₁).',
  s6cm: 'эски максимум эми экинчи орунда',
  s6mark: 'Эки бутак: жаңы максимум эскисин «экинчи орунга» жылдырат.',

  s7h: 'Мисалда прогон: 3 9 4 9 7',
  s7start: 'старт',
  s7r1: 'алгачкы эки элементтен баштайбыз',
  s7r2: '4 > 3 → second жаңырат',
  s7r3: '9 best\'тен чоң эмес, бирок 9 > 4 → second = 9',
  s7r4: '7 экөөнөн тең кичине — өткөрүп жиберебиз',
  s7out: 'Жооп: 9 — «экинчи чоң» максимумга барабар болушу мүмкүн.',

  s8h: 'Жөнөтөр алдындагы чеклист',
  s8r1t: 'Шартты дагы бир жолу окуңуз — код жазылгандан КИЙИН',
  s8r1d: '«башка маселени» чечип койгонуңузга таң каласыз',
  s8r2t: 'Шарттагы мисалды кол менен прогондоңуз',
  s8r2d: 'сап-сабы менен, текшерүүчү система кандай кылса — ошондой',
  s8r3t: 'Өзүңүздүн чектик тесттериңизди ойлоп табыңыз',
  s8r3d: 'эң кичине n, бирдей элементтер, чектөөлөрдөгү четки маанилер',
  s8r4t: 'Типтерди текшериңиз',
  s8r4d: 'жооп int\'ке батабы? 10⁵ · 10⁵ = 10¹⁰ — батпайт',
  s8out: 'Эки мүнөт текшерүү кайра аракеттерге кетчү жарым саатты үнөмдөйт.',

  s9h: 'Эсте сакта',
  s9r1: 'Шартты эки жолу окуңуз',
  s9r2: 'Чектик учурларды издеңиз',
  s9r3: 'Чыгаруу форматын тамгасына чейин сактаңыз',
  s9cta: 'Сабакка тактыкка машыктырган төрт маселе тиркелген. Баарын чечиңиз — жана сабакты өттүм деп белгилеңиз.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 1',
  title: 'Implementation Problems',
  subtitle: 'No clever algorithm needed. Do exactly what the statement says — carefully.',
  press: 'Press → or Space to advance',

  s2h: 'The trap of “easy” problems',
  s2c1t: 'No algorithm required',
  s2c1d: 'No graphs, no DP — just follow the statement.',
  s2c2t: 'Yet most attempts die here',
  s2c2d: 'Beginners collect most of their WA — Wrong Answer — verdicts on implementation.',
  s2c3t: 'Accuracy is a skill',
  s2c3d: 'Train it as deliberately as you train algorithms.',
  s2out: 'Let’s break down the three main sources of mistakes — and the defenses.',

  s3h: 'The three main enemies',
  s3e1t: 'Careless reading',
  s3e1d: 'Swapped rows and columns, forgot 1-based indexing, missed the word “inclusive”.',
  s3e2t: 'Edge cases',
  s3e2d: 'n = 1, an empty string, all elements equal, negative numbers.',
  s3e3t: 'Output format',
  s3e3d: 'An extra space, a missing newline, YES instead of Yes.',
  s3out: 'Any one of these small things = 0 points for the attempt.',

  s4h: 'Example 1. A 3 × 5 chessboard',
  s4task: 'Draw a board of # and dots. The whole problem is spotting the pattern.',
  s4formula: '(i + j) % 2 == 0 → #, otherwise → .',
  s4rule: 'A cell’s color depends only on the parity of i + j.',

  s5h: 'The chessboard: full code',
  s5n1: 'Read the sizes. The statement says rows first, then columns — don’t swap them!',
  s5n2: 'Two nested loops: the outer one over rows, the inner one over columns.',
  s5n3: 'One parity check — no magic. After every row, print a newline.',
  s5run: 'Run this code in the lesson — enter 3 5.',

  s6h: 'Example 2. The second largest element',
  s6badT: 'Naive',
  s6badD: 'Start with second = 0 and update in a loop. Breaks on negatives: [-5, -2] → answer 0?!',
  s6okT: 'Robust',
  s6okD: 'Initialize from the first two elements: best = max(a₀, a₁), second = min(a₀, a₁).',
  s6cm: 'the old maximum is now second',
  s6mark: 'Two branches: a new maximum pushes the old one into second place.',

  s7h: 'Trace on the sample: 3 9 4 9 7',
  s7start: 'start',
  s7r1: 'initialize from the first two elements',
  s7r2: '4 > 3 → update second',
  s7r3: '9 is not above best, but 9 > 4 → second = 9',
  s7r4: '7 is below both — skip it',
  s7out: 'Answer: 9 — the “second largest” may equal the maximum.',

  s8h: 'The pre-submit checklist',
  s8r1t: 'Re-read the statement — AFTER writing the code',
  s8r1d: 'you’ll be surprised how often you solved “the wrong problem”',
  s8r2t: 'Run the sample from the statement by hand',
  s8r2d: 'line by line, exactly the way the judge will',
  s8r3t: 'Invent your own edge tests',
  s8r3d: 'minimal n, equal elements, boundary values from the constraints',
  s8r4t: 'Check the types',
  s8r4d: 'does the answer fit in int? 10⁵ · 10⁵ = 10¹⁰ — it doesn’t',
  s8out: 'Two minutes of checking save half an hour of resubmissions.',

  s9h: 'Remember',
  s9r1: 'Read the statement twice',
  s9r2: 'Hunt for edge cases',
  s9r3: 'Match the output format to the character',
  s9cta: 'Four accuracy-training problems are attached to the lesson. Solve them all — and mark the lesson as completed.',
};

export const implementationProblems: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
