import type { LessonPresentationData } from './types';

// Presentation for the "Algorithm Complexity and Big-O" lesson
// (olympiad-roadmap → level-1-foundations → complexity-big-o).
// Slide structure is single-sourced in buildSlides(); the three language
// tables below carry only the strings.

interface L {
  kicker: string;
  title: string;
  subtitle: string;
  press: string;
  ops: string;

  s2h: string;
  s2c1t: string; s2c1d: string;
  s2c2t: string; s2c2d: string;
  s2c3t: string; s2c3d: string;
  s2out: string;

  s3h: string;
  s3badT: string; s3badD: string;
  s3okT: string; s3okD: string;
  s3ex: string;

  s4h: string;
  s4rows: [name: string, example: string][];

  s5h: string; s5axisN: string; s5axisOps: string; s5note: string;

  s6h: string; s6d: string; s6q: string; s6instant: string; s6slow: string;

  s7h: string; s7n1: string; s7n2: string; s7n3: string; s7run: string;

  s8h: string; s8loop: string; s8formula: string;
  s8loopShort: string; s8formulaShort: string; s8same: string; sec: string;

  s9h: string;
  s9r1t: string; s9r1d: string;
  s9r2t: string; s9r2d: string;
  s9r3t: string; s9r3d: string;

  s10h: string; s10think: string; s10q1: string; s10q2: string; s10q3: string;

  s11h: string; s11r1: string; s11r2: string; s11r3: string; s11r4: string; s11cta: string;
}

// Severity palette shared by the scale, the chart, and the cheat sheet:
// green (best) → red (worst).
const C = {
  o1: '#34d399',
  olog: '#22d3ee',
  on: '#60a5fa',
  onlog: '#a78bfa',
  on2: '#fbbf24',
  o2n: '#f87171',
};

function buildSlides(t: L): string[] {
  const scaleChips = [`O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, `O(n²)`, `O(2ⁿ)`];
  const scaleColors = [C.o1, C.olog, C.on, C.onlog, C.on2, C.o2n];

  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">O(n)</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── Why the correct answer is only half the job
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">✅</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">⏱️</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🐢</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2out}</span></p>`,

    // 3 ── Operations, not seconds
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>❌ ${t.s3badT}</h3><p>${t.s3badD}</p></div>
  <div class="lp-card step" data-a="right"><h3>✅ ${t.s3okT}</h3><p>${t.s3okD}</p></div>
</div>
<p class="lp-p lp-center step">${t.s3ex}</p>
<div class="lp-chips step">
  <span class="lp-chip" style="--c:${C.on}">n = 1 000</span><span class="lp-arr">→</span><span class="lp-chip" style="--c:${C.on}">~1 000 ${t.ops}</span>
  <span class="lp-arr">·</span>
  <span class="lp-chip" style="--c:${C.on}">n = 10⁶</span><span class="lp-arr">→</span><span class="lp-chip" style="--c:${C.on}">~10⁶ ${t.ops}</span>
</div>`,

    // 4 ── The Big-O scale
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-scale">${t.s4rows
      .map(
        ([name, example], i) =>
          `\n  <div class="lp-row step"><span class="lp-chip" style="--c:${scaleColors[i]}">${scaleChips[i]}</span><span><b>${name}</b> — <span class="lp-dim">${example}</span></span></div>`,
      )
      .join('')}
</div>`,

    // 5 ── Growth chart (animated SVG)
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-chart">
<svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg" role="img">
  <line x1="50" y1="380" x2="742" y2="380" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
  <line x1="50" y1="380" x2="50" y2="18" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
  <line x1="50" y1="290" x2="742" y2="290" stroke="rgba(255,255,255,.06)"/>
  <line x1="50" y1="200" x2="742" y2="200" stroke="rgba(255,255,255,.06)"/>
  <line x1="50" y1="110" x2="742" y2="110" stroke="rgba(255,255,255,.06)"/>
  <text x="742" y="406" text-anchor="end" fill="#94a3b8" font-size="15">${t.s5axisN} →</text>
  <text x="60" y="34" fill="#94a3b8" font-size="15">↑ ${t.s5axisOps}</text>
  <g class="step" data-a="draw" data-g="0">
    <path class="lpd" pathLength="1" d="M50,378 C240,348 480,334 740,324" stroke="${C.o1}" stroke-width="3.5" stroke-linecap="round"/>
    <text x="734" y="306" text-anchor="end" fill="${C.o1}" font-size="19" font-weight="700" font-family="monospace">O(log n)</text>
  </g>
  <g class="step" data-a="draw" data-g="1">
    <path class="lpd" pathLength="1" d="M50,378 L740,206" stroke="${C.on}" stroke-width="3.5" stroke-linecap="round"/>
    <text x="734" y="188" text-anchor="end" fill="${C.on}" font-size="19" font-weight="700" font-family="monospace">O(n)</text>
  </g>
  <g class="step" data-a="draw" data-g="2">
    <path class="lpd" pathLength="1" d="M50,378 C300,322 560,224 740,112" stroke="${C.onlog}" stroke-width="3.5" stroke-linecap="round"/>
    <text x="734" y="94" text-anchor="end" fill="${C.onlog}" font-size="19" font-weight="700" font-family="monospace">O(n log n)</text>
  </g>
  <g class="step" data-a="draw" data-g="3">
    <path class="lpd" pathLength="1" d="M50,378 C420,368 650,250 706,26" stroke="${C.on2}" stroke-width="3.5" stroke-linecap="round"/>
    <text x="700" y="46" text-anchor="end" fill="${C.on2}" font-size="19" font-weight="700" font-family="monospace">O(n²)</text>
  </g>
  <g class="step" data-a="draw" data-g="4">
    <path class="lpd" pathLength="1" d="M50,378 C250,376 386,320 424,24" stroke="${C.o2n}" stroke-width="3.5" stroke-linecap="round"/>
    <text x="434" y="42" text-anchor="start" fill="${C.o2n}" font-size="19" font-weight="700" font-family="monospace">O(2ⁿ)</text>
  </g>
</svg>
</div>
<p class="lp-foot lp-center step" data-g="5">${t.s5note}</p>`,

    // 6 ── The 10^8 rule
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom">10⁸</div>
  <p class="lp-p step">${t.s6d}</p>
</div>
<p class="lp-p lp-center step">${t.s6q}</p>
<div class="lp-race">
  <div class="lp-rrow step" data-a="grow">
    <span class="lp-chip" style="--c:${C.onlog}">O(n log n)</span>
    <div class="lp-bar"><i style="width:12%;--c:${C.onlog}"></i></div>
    <span class="lp-rres lp-ok">≈ 1.7·10⁶ — ${t.s6instant} ✅</span>
  </div>
  <div class="lp-rrow step" data-a="grow">
    <span class="lp-chip" style="--c:${C.o2n}">O(n²)</span>
    <div class="lp-bar"><i style="width:100%;--c:${C.o2n}"></i></div>
    <span class="lp-rres lp-bad">10¹⁰ — ${t.s6slow} ❌</span>
  </div>
</div>`,

    // 7 ── Example 1: the operations calculator (lesson's first code block)
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">long long n;
std::cin &gt;&gt; n;
</span><span class="step" data-g="1" data-a="none">
std::cout &lt;&lt; log2(n);      <span class="cm">// O(log n)</span>
std::cout &lt;&lt; n;            <span class="cm">// O(n)</span>
std::cout &lt;&lt; n * log2(n);  <span class="cm">// O(n log n)</span>
std::cout &lt;&lt; n * n;        <span class="cm">// O(n²)</span>
</span><span class="step" data-g="2" data-a="none">
if (n &lt;= 60)
    std::cout &lt;&lt; (1LL &lt;&lt; n);  <span class="cm">// O(2ⁿ)</span></span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s7n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s7run}</p>`,

    // 8 ── Example 2: loop vs formula (lesson's second code block)
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-g="0" data-a="left">
    <h3><span class="lp-chip" style="--c:${C.on2}">O(n)</span> ${t.s8loop}</h3>
    <pre class="lp-code">long long s = 0;
for (long long i = 1; i &lt;= n; i++)
    s += i;</pre>
  </div>
  <div class="lp-card step" data-g="1" data-a="right">
    <h3><span class="lp-chip" style="--c:${C.o1}">O(1)</span> ${t.s8formula}</h3>
    <pre class="lp-code">long long s = n * (n + 1) / 2;</pre>
  </div>
</div>
<div class="lp-race">
  <div class="lp-rrow step" data-g="2" data-a="grow">
    <span class="lp-chip" style="--c:${C.on2}">${t.s8loopShort}</span>
    <div class="lp-bar"><i style="width:100%;--c:${C.on2}"></i></div>
    <span class="lp-rres lp-bad">≈ 2 ${t.sec}</span>
  </div>
  <div class="lp-rrow step" data-g="3" data-a="grow">
    <span class="lp-chip" style="--c:${C.o1}">${t.s8formulaShort}</span>
    <div class="lp-bar"><i style="width:2%;--c:${C.o1}"></i></div>
    <span class="lp-rres lp-ok">&lt; 0.001 ${t.sec}</span>
  </div>
</div>
<p class="lp-p lp-center step" data-g="4"><span class="lp-mark">${t.s8same}</span></p>`,

    // 9 ── Three rules for estimating your own code
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.on2}">×</span><span><b>${t.s9r1t}</b> — <span class="lp-dim">${t.s9r1d}</span><br><code class="lp-mini">O(n) · O(n) = O(n²)</code></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.on}">+</span><span><b>${t.s9r2t}</b> — <span class="lp-dim">${t.s9r2d}</span><br><code class="lp-mini">O(n) + O(n log n) = O(n log n)</code></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.o1}">5n</span><span><b>${t.s9r3t}</b> — <span class="lp-dim">${t.s9r3d}</span><br><code class="lp-mini">O(5n) = O(n)</code></span></div>
</div>`,

    // 10 ── Quiz
    `<h2 class="lp-h lp-center">${t.s10h}</h2>
<p class="lp-foot lp-center">${t.s10think}</p>
<div class="lp-scale">
  <div class="lp-row lp-quiz step"><span class="lp-qnum">1</span><span>${t.s10q1}</span><span class="lp-chip step" data-a="zoom" style="--c:${C.on}">O(n)</span></div>
  <div class="lp-row lp-quiz step"><span class="lp-qnum">2</span><span>${t.s10q2}</span><span class="lp-chip step" data-a="zoom" style="--c:${C.on2}">O(n²)</span></div>
  <div class="lp-row lp-quiz step"><span class="lp-qnum">3</span><span>${t.s10q3}</span><span class="lp-chip step" data-a="zoom" style="--c:${C.olog}">O(log n)</span></div>
</div>`,

    // 11 ── Cheat sheet + call to action
    `<h2 class="lp-h lp-center">${t.s11h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.o2n}">n ≤ 20</span><span><b>O(2ⁿ)</b> <span class="lp-dim">— ${t.s11r1}</span></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.on2}">n ≤ 5 000</span><span><b>O(n²)</b> <span class="lp-dim">— ${t.s11r2}</span></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.onlog}">n ≤ 10⁶</span><span><b>O(n log n)</b> <span class="lp-dim">— ${t.s11r3}</span></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.o1}">n ≤ 10⁸</span><span><b>O(n)</b> <span class="lp-dim">— ${t.s11r4}</span></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s11cta}</p></div>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 1',
  title: 'Сложность алгоритмов и O-нотация',
  subtitle: 'Как узнать, уложится ли решение в лимит времени, — ещё до написания кода',
  press: 'Нажмите → или пробел, чтобы листать',
  ops: 'операций',

  s2h: 'Почему правильный ответ — это только полдела',
  s2c1t: 'Правильный ответ',
  s2c1d: 'Решение должно выдавать верный результат на всех тестах.',
  s2c2t: 'Лимит времени',
  s2c2d: 'Обычно 1–2 секунды на весь набор тестов.',
  s2c3t: 'Медленно = не сдано',
  s2c3d: 'Верное, но медленное решение получает TLE — Time Limit Exceeded.',
  s2out: 'Поэтому скорость алгоритма оценивают ДО того, как писать код.',

  s3h: 'Меряем не секунды, а операции',
  s3badT: 'Секунды',
  s3badD: 'Зависят от компьютера, языка и компилятора — на разных машинах разные.',
  s3okT: 'Операции',
  s3okD: 'Считаем количество шагов алгоритма как функцию от размера входа n.',
  s3ex: 'Один проход по массиву из n элементов:',

  s4h: 'Шкала O-нотации: от лучшей к худшей',
  s4rows: [
    ['константа', 'ответ по формуле'],
    ['логарифм', 'бинарный поиск: делим пополам'],
    ['линейная', 'один проход по данным'],
    ['почти линейная', 'сортировка'],
    ['квадрат', 'два вложенных цикла'],
    ['экспонента', 'полный перебор подмножеств'],
  ],

  s5h: 'Как растёт число операций',
  s5axisN: 'n (размер входа)',
  s5axisOps: 'операции',
  s5note: 'Одна и та же задача — пять скоростей роста. Разница между O(n log n) и O(n²) — это «зачёт» против «не зачёт».',

  s6h: 'Главное правило: 10⁸ операций в секунду',
  s6d: 'примерно столько простых операций в секунду выполняет обычный компьютер',
  s6q: 'Пример: n = 10⁵. Что уложится в 1 секунду?',
  s6instant: 'мгновенно',
  s6slow: '≈ 100 секунд',

  s7h: 'Пример 1. Калькулятор операций',
  s7n1: 'Читаем n — размер входа. Дальше просто подставляем его в формулы сложности.',
  s7n2: 'Каждая сложность превращается в конкретное число операций. Сравните его с 10⁸.',
  s7n3: 'O(2ⁿ) взрывается: уже при n = 60 операций больше, чем секунд с начала Вселенной.',
  s7run: 'Запустите этот код в уроке — введите 1 000, потом 100 000, потом 10⁹.',

  s8h: 'Пример 2. Сумма 1..n двумя способами (n = 10⁹)',
  s8loop: 'Цикл',
  s8formula: 'Формула Гаусса',
  s8loopShort: 'Цикл',
  s8formulaShort: 'Формула',
  s8same: 'Ответы совпадают. Но цикл думает секунды, а формула — мгновение.',
  sec: 'с',

  s9h: 'Три правила оценки своего кода',
  s9r1t: 'Вложенные циклы перемножаются',
  s9r1d: 'цикл по n внутри цикла по n',
  s9r2t: 'Последовательные блоки складываются',
  s9r2d: 'берётся наибольший',
  s9r3t: 'Константы отбрасываются',
  s9r3d: '5n операций — это всё равно линейная',

  s10h: 'Проверьте себя',
  s10think: 'Сначала подумайте, потом нажмите →, чтобы увидеть ответ',
  s10q1: 'Поиск максимума одним проходом по массиву',
  s10q2: 'Проверка всех пар элементов',
  s10q3: 'Цикл, в котором n каждый раз делится на 2',

  s11h: 'Шпаргалка: какое n — какая сложность',
  s11r1: 'полный перебор допустим',
  s11r2: 'два вложенных цикла пройдут',
  s11r3: 'сортировка и «умные» алгоритмы',
  s11r4: 'только линейный проход',
  s11cta: 'Решите задачу для практики под уроком — классический один проход за O(n) — и отметьте урок пройденным.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 1-деңгээл',
  title: 'Алгоритмдердин татаалдыгы жана O-белгилөө',
  subtitle: 'Код жазганга чейин эле чечим убакыт чегине батарын кантип билсе болот',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',
  ops: 'операция',

  s2h: 'Эмне үчүн туура жооп — иштин жарымы гана',
  s2c1t: 'Туура жооп',
  s2c1d: 'Чечим бардык тесттерде туура натыйжа бериши керек.',
  s2c2t: 'Убакыт чеги',
  s2c2d: 'Адатта бардык тесттерге 1–2 секунда берилет.',
  s2c3t: 'Жай = кабыл алынбайт',
  s2c3d: 'Туура, бирок жай чечим TLE алат — Time Limit Exceeded.',
  s2out: 'Ошондуктан алгоритмдин ылдамдыгы код жазылганга ЧЕЙИН бааланат.',

  s3h: 'Секунданы эмес, операцияны эсептейбиз',
  s3badT: 'Секундалар',
  s3badD: 'Компьютерге, тилге жана компиляторго жараша ар башка болот.',
  s3okT: 'Операциялар',
  s3okD: 'Алгоритмдин кадамдарынын санын киргизүүнүн өлчөмү n боюнча функция катары эсептейбиз.',
  s3ex: 'n элементтен турган массив боюнча бир өтүү:',

  s4h: 'O-белгилөө шкаласы: эң жакшыдан эң жаманга',
  s4rows: [
    ['константа', 'формула менен жооп'],
    ['логарифм', 'бинардык издөө: экиге бөлөбүз'],
    ['сызыктуу', 'маалымат боюнча бир өтүү'],
    ['дээрлик сызыктуу', 'иреттөө (сортировка)'],
    ['квадрат', 'эки кабатталган цикл'],
    ['экспонента', 'бардык комбинацияларды текшерүү'],
  ],

  s5h: 'Операциялардын саны кантип өсөт',
  s5axisN: 'n (киргизүүнүн өлчөмү)',
  s5axisOps: 'операциялар',
  s5note: 'Бир эле маселе — өсүүнүн беш ылдамдыгы. O(n log n) менен O(n²) айырмасы — «өттү» менен «өткөн жок» айырмасы.',

  s6h: 'Башкы эреже: секундасына 10⁸ операция',
  s6d: 'жөнөкөй компьютер секундасына болжол менен ушунча жөнөкөй операция аткарат',
  s6q: 'Мисал: n = 10⁵. 1 секундага эмне батат?',
  s6instant: 'заматта',
  s6slow: '≈ 100 секунда',

  s7h: '1-мисал. Операция эсептегич',
  s7n1: 'n — киргизүүнүн өлчөмүн окуйбуз. Андан кийин аны татаалдык формулаларына коёбуз.',
  s7n2: 'Ар бир татаалдык так операция санына айланат. Аны 10⁸ менен салыштырыңыз.',
  s7n3: 'O(2ⁿ) жарылат: n = 60 болгондо эле операциялар Аалам жаралгандан берки секундалардан көп.',
  s7run: 'Бул кодду сабактан иштетиңиз — 1 000, анан 100 000, анан 10⁹ киргизиңиз.',

  s8h: '2-мисал. 1..n суммасы эки жол менен (n = 10⁹)',
  s8loop: 'Цикл',
  s8formula: 'Гаусс формуласы',
  s8loopShort: 'Цикл',
  s8formulaShort: 'Формула',
  s8same: 'Жооптор бирдей. Бирок цикл секунда ойлонот, формула — заматта.',
  sec: 'сек',

  s9h: 'Өз кодуңду баалоонун үч эрежеси',
  s9r1t: 'Кабатталган циклдер көбөйтүлөт',
  s9r1d: 'n цикл ичиндеги n цикл',
  s9r2t: 'Удаалаш блоктор кошулат',
  s9r2d: 'эң чоңу алынат',
  s9r3t: 'Константалар ыргытылат',
  s9r3d: '5n операция — баары бир сызыктуу',

  s10h: 'Өзүңдү текшер',
  s10think: 'Адегенде ойлонуңуз, анан жоопту көрүү үчүн → басыңыз',
  s10q1: 'Массив боюнча бир өтүү менен максимумду табуу',
  s10q2: 'Бардык жуптарды текшерүү',
  s10q3: 'n ар бир жолу 2ге бөлүнгөн цикл',

  s11h: 'Шпаргалка: кайсы n — кайсы татаалдык',
  s11r1: 'толук издөө болот',
  s11r2: 'эки кабатталган цикл өтөт',
  s11r3: 'иреттөө жана «акылдуу» алгоритмдер',
  s11r4: 'сызыктуу өтүү гана',
  s11cta: 'Сабактын астындагы практикалык маселени чечиңиз — O(n) классикалык бир өтүү — жана сабакты өттүм деп белгилеңиз.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 1',
  title: 'Algorithm Complexity and Big-O',
  subtitle: 'How to know whether your solution fits the time limit — before writing any code',
  press: 'Press → or Space to advance',
  ops: 'operations',

  s2h: 'Why a correct answer is only half the job',
  s2c1t: 'Correct answer',
  s2c1d: 'Your solution must produce the right result on every test.',
  s2c2t: 'Time limit',
  s2c2d: 'Usually 1–2 seconds for the whole test set.',
  s2c3t: 'Slow = rejected',
  s2c3d: 'A correct but slow solution gets TLE — Time Limit Exceeded.',
  s2out: 'That is why you estimate an algorithm’s speed BEFORE writing the code.',

  s3h: 'Count operations, not seconds',
  s3badT: 'Seconds',
  s3badD: 'Depend on the computer, the language, and the compiler — every machine differs.',
  s3okT: 'Operations',
  s3okD: 'Count the algorithm’s steps as a function of the input size n.',
  s3ex: 'One pass over an array of n elements:',

  s4h: 'The Big-O scale: from best to worst',
  s4rows: [
    ['constant', 'answer by formula'],
    ['logarithm', 'binary search: halve the range'],
    ['linear', 'one pass over the data'],
    ['almost linear', 'sorting'],
    ['quadratic', 'two nested loops'],
    ['exponential', 'trying all subsets'],
  ],

  s5h: 'How the number of operations grows',
  s5axisN: 'n (input size)',
  s5axisOps: 'operations',
  s5note: 'The same problem — five growth rates. The gap between O(n log n) and O(n²) is the gap between Accepted and TLE.',

  s6h: 'The key rule: 10⁸ operations per second',
  s6d: 'roughly how many simple operations a typical computer performs per second',
  s6q: 'Example: n = 10⁵. What fits in 1 second?',
  s6instant: 'instant',
  s6slow: '≈ 100 seconds',

  s7h: 'Example 1. An operations calculator',
  s7n1: 'Read n — the input size. Then simply plug it into the complexity formulas.',
  s7n2: 'Each complexity becomes a concrete number of operations. Compare it with 10⁸.',
  s7n3: 'O(2ⁿ) explodes: at n = 60 that is more operations than seconds since the Big Bang.',
  s7run: 'Run this code in the lesson — try 1,000, then 100,000, then 10⁹.',

  s8h: 'Example 2. Summing 1..n two ways (n = 10⁹)',
  s8loop: 'Loop',
  s8formula: 'Gauss’s formula',
  s8loopShort: 'Loop',
  s8formulaShort: 'Formula',
  s8same: 'The answers match. But the loop thinks for seconds, the formula — for an instant.',
  sec: 's',

  s9h: 'Three rules for estimating your code',
  s9r1t: 'Nested loops multiply',
  s9r1d: 'a loop over n inside a loop over n',
  s9r2t: 'Sequential blocks add up',
  s9r2d: 'keep the largest term',
  s9r3t: 'Constants are dropped',
  s9r3d: '5n operations is still linear',

  s10h: 'Check yourself',
  s10think: 'Think first, then press → to reveal the answer',
  s10q1: 'Finding the maximum in one pass over an array',
  s10q2: 'Checking every pair of elements',
  s10q3: 'A loop where n is halved on every iteration',

  s11h: 'Cheat sheet: which n allows which complexity',
  s11r1: 'brute force is fine',
  s11r2: 'two nested loops will pass',
  s11r3: 'sorting and “smart” algorithms',
  s11r4: 'only a linear pass',
  s11cta: 'Solve the practice problem below the lesson — a classic single pass in O(n) — and mark the lesson as completed.',
};

export const complexityBigO: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
