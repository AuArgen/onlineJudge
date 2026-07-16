import type { LessonPresentationData } from './types';

// Presentation for the "Basic Math: Divisibility, GCD, Primes" lesson
// (olympiad-roadmap → level-1-foundations → basic-math).
// Slide structure is single-sourced in buildSlides(); the three language
// tables below carry only the strings.

interface L {
  kicker: string;
  title: string;
  subtitle: string;
  press: string;
  gcd: string; // localized abbreviation: НОД / ЭЧЖБ / GCD
  lcm: string; // НОК / ЭКЖЭ / LCM

  s2h: string;
  s2c1t: string; s2c1d: string;
  s2c2t: string; s2c2d: string;
  s2c3t: string; s2c3d: string;
  s2c4t: string; s2c4d: string;

  s3h: string; s3r1: string; s3r2: string; s3r3: string; s3mark: string;

  s4h: string; s4idea: string; s4r4: string; s4mark: string;

  s5h: string; s5badD: string; s5okD: string; s5mark: string;

  s6h: string; s6line: string; s6mark: string;

  s7h: string; s7n1: string; s7n2: string; s7n3: string; s7n4: string;

  s8h: string; s8n1: string; s8n2: string; s8n3: string; s8run: string;

  s9h: string; s9n1: string; s9n2: string; s9run: string;

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

// sieveGrid renders the animated Sieve of Eratosthenes on the numbers 2..30:
// group 0 shows the plain grid, groups 1..3 mark 2, 3, 5 as prime and cross
// out their multiples (starting at i·i), group 4 lights up the survivors.
function sieveGrid(): string {
  const pos = (num: number) => {
    const k = num - 2;
    return { x: 8 + (k % 10) * 54, y: 8 + Math.floor(k / 10) * 54 };
  };
  const baseCell = (num: number) => {
    const { x, y } = pos(num);
    return (
      `<rect x="${x}" y="${y}" width="48" height="48" rx="8" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.14)"/>` +
      `<text x="${x + 24}" y="${y + 31}" text-anchor="middle" fill="#cbd5e1" font-size="19" font-family="monospace">${num}</text>`
    );
  };
  const cross = (num: number) => {
    const { x, y } = pos(num);
    return (
      `<rect x="${x}" y="${y}" width="48" height="48" rx="8" fill="rgba(11,16,32,.55)"/>` +
      `<line x1="${x + 11}" y1="${y + 11}" x2="${x + 37}" y2="${y + 37}" stroke="${C.bad}" stroke-width="2.5" stroke-linecap="round"/>`
    );
  };
  const prime = (num: number) => {
    const { x, y } = pos(num);
    return (
      `<rect x="${x}" y="${y}" width="48" height="48" rx="8" fill="rgba(52,211,153,.15)" stroke="${C.good}" stroke-width="2"/>` +
      `<text x="${x + 24}" y="${y + 31}" text-anchor="middle" fill="#6ee7b7" font-size="19" font-weight="700" font-family="monospace">${num}</text>`
    );
  };

  let base = '';
  for (let num = 2; num <= 30; num++) base += baseCell(num);
  let g1 = prime(2);
  for (let num = 4; num <= 30; num += 2) g1 += cross(num);
  let g2 = prime(3);
  for (const num of [9, 15, 21, 27]) g2 += cross(num);
  const g3 = prime(5) + cross(25);
  let g4 = '';
  for (const num of [7, 11, 13, 17, 19, 23, 29]) g4 += prime(num);

  return `<div class="lp-chart">
<svg viewBox="0 0 548 170" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${base}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
  <g class="step" data-a="none" data-g="3">${g3}</g>
  <g class="step" data-a="none" data-g="4">${g4}</g>
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">a % b</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── Four topics
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">➗</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🤝</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔢</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🧱</div><h3>${t.s2c4t}</h3><p>${t.s2c4d}</p></div>
</div>`,

    // 3 ── Divisibility and remainders
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-scale">
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.acc}">a % b == 0</span><span>${t.s3r1}</span><code class="lp-mini">84 % 7 = 0</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.info}">n % 10</span><span>${t.s3r2}</span><code class="lp-mini">173 % 10 = 3</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.warn}">n % 2</span><span>${t.s3r3}</span><code class="lp-mini">173 % 2 = 1</code></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s3mark}</span></p>`,

    // 4 ── GCD: Euclid's algorithm (animated trace)
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center step" style="margin-top:0"><code class="lp-mini">${t.gcd}(a, b) = ${t.gcd}(b, a % b)</code> — ${t.s4idea}</p>
<div class="lp-scale" style="margin-top:14px">
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.acc}">${t.gcd}(48, 18)</span><span>48 % 18 = 12</span><code class="lp-mini">→ ${t.gcd}(18, 12)</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.info}">${t.gcd}(18, 12)</span><span>18 % 12 = 6</span><code class="lp-mini">→ ${t.gcd}(12, 6)</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.info}">${t.gcd}(12, 6)</span><span>12 % 6 = 0</span><code class="lp-mini">→ ${t.gcd}(6, 0)</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.good}">b = 0</span><span>${t.s4r4}</span><code class="lp-mini">= 6</code></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s4mark}</span></p>`,

    // 5 ── LCM and the overflow trap
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.5rem,4.6vw,2.8rem)">${t.lcm}(a, b) · ${t.gcd}(a, b) = a · b</div>
</div>
<div class="lp-cols" style="margin-top:18px">
  <div class="lp-card step" data-a="left"><h3>❌ <code class="lp-mini">a * b / g</code></h3><p>${t.s5badD}</p></div>
  <div class="lp-card step" data-a="right"><h3>✅ <code class="lp-mini">a / g * b</code></h3><p>${t.s5okD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── Primality check up to the square root
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center step">${t.s6line}</p>
<div class="lp-chips" style="margin-top:18px">
  <span class="lp-chip step" style="--c:${C.info}">1 · 36</span>
  <span class="lp-chip step" style="--c:${C.info}">2 · 18</span>
  <span class="lp-chip step" style="--c:${C.info}">3 · 12</span>
  <span class="lp-chip step" style="--c:${C.info}">4 · 9</span>
  <span class="lp-chip step" data-a="zoom" style="--c:${C.good}">6 · 6 = √36 · √36</span>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── The Sieve of Eratosthenes (animated grid)
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  ${sieveGrid()}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s7n2}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s7n3}</p></div>
    <div class="lp-card step" data-g="4" data-a="right"><p>${t.s7n4}</p></div>
  </div>
</div>`,

    // 8 ── The sieve: full code
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::vector&lt;bool&gt; isPrime(n + 1, true);
isPrime[0] = isPrime[1] = false;
</span><span class="step" data-g="1" data-a="none">
for (long long i = 2; i * i &lt;= n; i++)
    if (isPrime[i])
        for (long long j = i * i; j &lt;= n; j += i)
            isPrime[j] = false;
</span><span class="step" data-g="2" data-a="none">
for (int i = 2; i &lt;= n; i++)
    if (isPrime[i]) std::cout &lt;&lt; i &lt;&lt; " ";</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s8n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s8n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s8n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s8run}</p>`,

    // 9 ── Prime factorization
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">for (long long d = 2; d * d &lt;= n; d++) {
    while (n % d == 0) {
        std::cout &lt;&lt; d &lt;&lt; " ";
        n /= d;
    }
}
</span><span class="step" data-g="1" data-a="none">if (n &gt; 1) std::cout &lt;&lt; n;</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s9n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s9n2}</p></div>
  </div>
</div>
<div class="lp-chips step" data-g="2">
  <span class="lp-chip" style="--c:${C.info}">360</span><span class="lp-arr">÷2</span>
  <span class="lp-chip" style="--c:${C.info}">180</span><span class="lp-arr">÷2</span>
  <span class="lp-chip" style="--c:${C.info}">90</span><span class="lp-arr">÷2</span>
  <span class="lp-chip" style="--c:${C.info}">45</span><span class="lp-arr">÷3</span>
  <span class="lp-chip" style="--c:${C.info}">15</span><span class="lp-arr">÷3</span>
  <span class="lp-chip" style="--c:${C.warn}">5</span>
  <span class="lp-arr">⇒</span>
  <span class="lp-chip" style="--c:${C.good}">360 = 2³ · 3² · 5</span>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s9run}</p>`,

    // 10 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s10h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">%</span><span><b>${t.s10r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">${t.gcd}</span><span><b>${t.s10r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">${t.lcm}</span><span><b>${t.s10r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">√n</span><span><b>${t.s10r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s10cta}</p></div>
<p class="lp-foot lp-center step">${t.s10foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 1',
  title: 'Базовая математика',
  subtitle: 'Делимость и остатки, НОД и НОК, простые числа и решето Эратосфена',
  press: 'Нажмите → или пробел, чтобы листать',
  gcd: 'НОД',
  lcm: 'НОК',

  s2h: 'Числовая база олимпиадника — четыре темы',
  s2c1t: 'Делимость и остатки',
  s2c1d: 'Оператор % — самый частый инструмент в задачах на числа.',
  s2c2t: 'НОД и НОК',
  s2c2d: 'Алгоритм Евклида находит НОД за O(log n).',
  s2c3t: 'Простые числа',
  s2c3d: 'Проверка одного — до корня; все сразу — решето Эратосфена.',
  s2c4t: 'Разложение на множители',
  s2c4d: 'Любое число — произведение простых, и оно единственно.',

  s3h: 'Делимость и остатки: три факта',
  s3r1: 'a делится на b ⇔ остаток равен нулю',
  s3r2: 'последняя цифра числа',
  s3r3: 'чётность: 0 — чётное, 1 — нечётное',
  s3mark: 'Остатки зациклены — этим пользуется почти каждая задача на числа.',

  s4h: 'НОД: алгоритм Евклида',
  s4idea: 'повторяем, пока b не станет нулём',
  s4r4: 'b стало нулём — ответ это текущее a',
  s4mark: 'Каждые два шага a уменьшается минимум вдвое — поэтому O(log n).',

  s5h: 'НОК и ловушка переполнения',
  s5badD: 'Произведение a · b может переполниться ещё до деления.',
  s5okD: 'Сначала делим на НОД — промежуточный результат не растёт.',
  s5mark: 'Порядок операций — это тоже математика.',

  s6h: 'Проверка на простоту: почему хватает корня',
  s6line: 'Делители ходят парами: если d делит n, то n / d тоже делит n. Пары для 36:',
  s6mark: 'В каждой паре один делитель ≤ √n. Нет делителей до корня — число простое.',

  s7h: 'Решето Эратосфена: все простые до 30',
  s7n1: '2 — простое. Вычёркиваем все кратные двум.',
  s7n2: '3 — простое. Вычёркиваем с 9 = 3·3 — меньшие кратные уже вычеркнуты.',
  s7n3: '5 — простое. Вычёркиваем с 25 = 5·5.',
  s7n4: '7² = 49 > 30 — можно останавливаться: всё, что осталось, — простые.',

  s8h: 'Решето: весь код',
  s8n1: 'Сначала считаем простыми всех. 0 и 1 — не простые.',
  s8n2: 'Вычёркиваем кратные, начиная с i·i. Внешний цикл — только до корня.',
  s8n3: 'Печатаем выживших. Итог: O(n log log n) — для n = 10⁷ меньше секунды.',
  s8run: 'Запустите этот код в уроке — введите 50.',

  s9h: 'Разложение на простые множители',
  s9n1: 'Делим на все d до корня. Каждый простой делитель вычерпывается своим while.',
  s9n2: 'Если в конце осталось число больше единицы — это последний простой множитель.',
  s9run: 'Запустите этот код в уроке — введите 360.',

  s10h: 'Запомнить',
  s10r1: 'Делимость — это остаток ноль: a % b == 0',
  s10r2: 'Евклид: НОД(a, b) = НОД(b, a % b)',
  s10r3: 'НОК = a / НОД · b — сначала делим',
  s10r4: 'Проверка до √n; все простые сразу — решето',
  s10cta: 'Под уроком три задачи: НОД, проверка простого числа и факториал. Решите все — и отметьте урок пройденным.',
  s10foot: 'Бонус: посчитайте решетом, сколько простых чисел меньше миллиона. Должно получиться 78498.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 1-деңгээл',
  title: 'Негизги математика',
  subtitle: 'Бөлүнүүчүлүк жана калдыктар, ЭЧЖБ жана ЭКЖЭ, жай сандар жана Эратосфендин элеги',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',
  gcd: 'ЭЧЖБ',
  lcm: 'ЭКЖЭ',

  s2h: 'Олимпиадачынын сандык базасы — төрт тема',
  s2c1t: 'Бөлүнүүчүлүк жана калдыктар',
  s2c1d: '% операциясы — сандар боюнча маселелердеги эң көп колдонулган курал.',
  s2c2t: 'ЭЧЖБ жана ЭКЖЭ',
  s2c2d: 'Евклиддин алгоритми ЭЧЖБны O(log n) убакытта табат.',
  s2c3t: 'Жай сандар',
  s2c3d: 'Бирөөнү текшерүү — тамырга чейин; баарын бирден — Эратосфендин элеги.',
  s2c4t: 'Көбөйтүүчүлөргө ажыратуу',
  s2c4d: 'Ар кандай сан — жай сандардын көбөйтүндүсү, жана ал жалгыз.',

  s3h: 'Бөлүнүүчүлүк жана калдыктар: үч факт',
  s3r1: 'a b\'га бөлүнөт ⇔ калдык нөлгө барабар',
  s3r2: 'сандын акыркы цифрасы',
  s3r3: 'жуптук: 0 — жуп, 1 — так',
  s3mark: 'Калдыктар цикл менен кайталанат — муну сандар боюнча дээрлик ар бир маселе колдонот.',

  s4h: 'ЭЧЖБ: Евклиддин алгоритми',
  s4idea: 'b нөл болгуча кайталайбыз',
  s4r4: 'b нөл болду — жооп учурдагы a',
  s4mark: 'Ар эки кадам сайын a кеминде эки эсе кичирейет — ошондуктан O(log n).',

  s5h: 'ЭКЖЭ жана ашып кетүү тузагы',
  s5badD: 'a · b көбөйтүндүсү бөлүүгө жетпей эле ашып кетиши мүмкүн.',
  s5okD: 'Адегенде ЭЧЖБга бөлөбүз — аралык натыйжа чоңойбойт.',
  s5mark: 'Операциялардын тартиби — бул да математика.',

  s6h: 'Жайлыкты текшерүү: эмнеге тамыр жетиштүү',
  s6line: 'Бөлүүчүлөр жуп-жубу менен жүрөт: d саны n\'ди бөлсө, n / d да бөлөт. 36 үчүн жуптар:',
  s6mark: 'Ар бир жупта бир бөлүүчү ≤ √n. Тамырга чейин бөлүүчү жок — сан жай.',

  s7h: 'Эратосфендин элеги: 30га чейинки жай сандар',
  s7n1: '2 — жай. Экиге эселүүлөрдүн баарын чийип салабыз.',
  s7n2: '3 — жай. 9 = 3·3\'төн баштап чийебиз — кичине эселүүлөр мурун эле чийилген.',
  s7n3: '5 — жай. 25 = 5·5\'тен баштап чийебиз.',
  s7n4: '7² = 49 > 30 — токтосок болот: калгандардын баары жай.',

  s8h: 'Элек: толук код',
  s8n1: 'Адегенде баарын жай деп эсептейбиз. 0 менен 1 — жай эмес.',
  s8n2: 'Эселүүлөрдү i·i\'ден баштап чийебиз. Сырткы цикл — тамырга чейин гана.',
  s8n3: 'Аман калгандарын басып чыгарабыз. Жыйынтык: O(n log log n) — n = 10⁷ үчүн секундадан аз.',
  s8run: 'Бул кодду сабактан иштетиңиз — 50 киргизиңиз.',

  s9h: 'Жай көбөйтүүчүлөргө ажыратуу',
  s9n1: 'Тамырга чейинки бардык d\'ге бөлөбүз. Ар бир жай бөлүүчүнү өз while\'ы түгөтөт.',
  s9n2: 'Аягында бирден чоң сан калса — бул акыркы жай көбөйтүүчү.',
  s9run: 'Бул кодду сабактан иштетиңиз — 360 киргизиңиз.',

  s10h: 'Эсте сакта',
  s10r1: 'Бөлүнүүчүлүк — калдык нөл: a % b == 0',
  s10r2: 'Евклид: ЭЧЖБ(a, b) = ЭЧЖБ(b, a % b)',
  s10r3: 'ЭКЖЭ = a / ЭЧЖБ · b — адегенде бөлөбүз',
  s10r4: '√n чейин текшерүү; баарын бирден — элек',
  s10cta: 'Сабактын астында үч маселе: ЭЧЖБ, жай санды текшерүү жана факториал. Баарын чечиңиз — жана сабакты өттүм деп белгилеңиз.',
  s10foot: 'Бонус: элек менен миллиондон кичине канча жай сан бар экенин эсептеңиз. 78498 чыгышы керек.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 1',
  title: 'Basic Math',
  subtitle: 'Divisibility and remainders, GCD and LCM, primes and the Sieve of Eratosthenes',
  press: 'Press → or Space to advance',
  gcd: 'GCD',
  lcm: 'LCM',

  s2h: 'A contestant’s number toolkit — four topics',
  s2c1t: 'Divisibility and remainders',
  s2c1d: 'The % operator is the most used tool in number problems.',
  s2c2t: 'GCD and LCM',
  s2c2d: 'Euclid’s algorithm finds the GCD in O(log n).',
  s2c3t: 'Prime numbers',
  s2c3d: 'Check one number up to the root; get all at once with the sieve.',
  s2c4t: 'Prime factorization',
  s2c4d: 'Every number is a product of primes — and a unique one.',

  s3h: 'Divisibility and remainders: three facts',
  s3r1: 'a is divisible by b ⇔ the remainder is zero',
  s3r2: 'the last digit of a number',
  s3r3: 'parity: 0 — even, 1 — odd',
  s3mark: 'Remainders cycle — nearly every number problem exploits this.',

  s4h: 'GCD: Euclid’s algorithm',
  s4idea: 'repeat until b becomes zero',
  s4r4: 'b reached zero — the answer is the current a',
  s4mark: 'Every two steps a at least halves — hence O(log n).',

  s5h: 'LCM and the overflow trap',
  s5badD: 'The product a · b can overflow before the division even happens.',
  s5okD: 'Divide by the GCD first — the intermediate value never grows.',
  s5mark: 'The order of operations is math too.',

  s6h: 'Primality check: why the root is enough',
  s6line: 'Divisors come in pairs: if d divides n, so does n / d. The pairs for 36:',
  s6mark: 'In every pair one divisor is ≤ √n. No divisors up to the root — the number is prime.',

  s7h: 'The Sieve of Eratosthenes: all primes up to 30',
  s7n1: '2 is prime. Cross out every multiple of two.',
  s7n2: '3 is prime. Start crossing at 9 = 3·3 — smaller multiples are already gone.',
  s7n3: '5 is prime. Start crossing at 25 = 5·5.',
  s7n4: '7² = 49 > 30 — we can stop: everything left is prime.',

  s8h: 'The sieve: full code',
  s8n1: 'Assume everyone is prime at first. 0 and 1 are not.',
  s8n2: 'Cross out multiples starting at i·i. The outer loop runs only up to the root.',
  s8n3: 'Print the survivors. Total: O(n log log n) — under a second for n = 10⁷.',
  s8run: 'Run this code in the lesson — enter 50.',

  s9h: 'Prime factorization',
  s9n1: 'Divide by every d up to the root. Each prime divisor is drained by its own while.',
  s9n2: 'If something greater than one remains — that’s the last prime factor.',
  s9run: 'Run this code in the lesson — enter 360.',

  s10h: 'Remember',
  s10r1: 'Divisibility means remainder zero: a % b == 0',
  s10r2: 'Euclid: GCD(a, b) = GCD(b, a % b)',
  s10r3: 'LCM = a / GCD · b — divide first',
  s10r4: 'Check up to √n; all primes at once — the sieve',
  s10cta: 'Three problems below the lesson: GCD, primality check, and factorial. Solve them all — and mark the lesson as completed.',
  s10foot: 'Bonus: use the sieve to count the primes below one million. You should get 78498.',
};

export const basicMath: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
