import type { LessonPresentationData } from './types';

// Presentation for the "Number Theory" lesson
// (olympiad-roadmap → level-5-advanced → number-theory). Closes level 5.
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

  s3h: string; s3line: string; s3mark: string;

  s4h: string; s4task: string;

  s5h: string; s5line: string; s5mark: string;

  s6h: string; s6n1: string; s6n2: string; s6n3: string; s6run: string; s6ans: string;

  s7h: string;
  s7c1t: string; s7c1d: string;
  s7c2t: string; s7c2d: string;
  s7c3t: string; s7c3d: string;

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

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">aᵇ mod m</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The rules of modular arithmetic
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">➕</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">➖</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🚫</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>`,

    // 3 ── Fast exponentiation: the idea
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.4rem,4.4vw,2.6rem)">aᵇ за O(log b)</div>
</div>
<p class="lp-p lp-center step" style="margin-top:16px">${t.s3line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s3mark}</span></p>`,

    // 4 ── Animated binpow trace
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
<div class="lp-scale" style="margin-top:12px">
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.good}">бит 1</span><span>res = 1·2 = 2</span><code class="lp-mini">a=4 · b=6</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.info}">бит 0</span><span>res = 2 (без изменений)</span><code class="lp-mini">a=16 · b=3</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.good}">бит 1</span><span>res = 2·16 = 32</span><code class="lp-mini">a=256 · b=1</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.good}">бит 1</span><span>res = 32·256 = 8192</span><code class="lp-mini">a=65536 · b=0</code></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">2¹³ = 8192 — всего четыре шага вместо тринадцати умножений.</span></p>`,

    // 5 ── Fermat's little theorem: the inverse
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.2rem,3.8vw,2rem)">a⁻¹ = a^(m−2) mod m</div>
</div>
<p class="lp-p lp-center step" style="margin-top:16px">${t.s5line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── C(n, k): full code
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">fact[i] = fact[i-1] * i % MOD;
</span><span class="step" data-g="1" data-a="none">
long long invK  = binpow(fact[k], MOD-2);
long long invNK = binpow(fact[n-k], MOD-2);
</span><span class="step" data-g="2" data-a="none">long long c = fact[n] * invK % MOD * invNK % MOD;</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s6n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s6n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s6n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s6run}</p>
<p class="lp-p lp-center step" data-g="3"><span class="lp-mark">${t.s6ans}</span></p>`,

    // 7 ── The gentleman's set
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🧮</div><h3>${t.s7c1t}</h3><p>${t.s7c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔢</div><h3>${t.s7c2t}</h3><p>${t.s7c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🧩</div><h3>${t.s7c3t}</h3><p>${t.s7c3d}</p></div>
</div>`,

    // 8 ── Task teaser
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🔟</div><p>${t.s8hint}</p></div>`,

    // 9 ── Recap + call to action (level 5 complete)
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">% m</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">binpow</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">a^(m−2)</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">C(n,k)</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 5',
  title: 'Теория чисел',
  subtitle: 'Модульная арифметика: быстрое возведение в степень, обратный элемент и C(n, k) по модулю',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Правила арифметики по модулю',
  s2c1t: 'Сложение и умножение',
  s2c1d: '(a + b) % m, (a · b) % m — берите остаток после каждой операции, не давайте числам расти.',
  s2c2t: 'Вычитание',
  s2c2d: '((a - b) % m + m) % m — лишнее +m перед вторым остатком не даёт уйти в минус.',
  s2c3t: 'Деления НЕТ',
  s2c3d: 'Вместо a / b по модулю — умножение на обратный элемент b⁻¹.',

  s3h: 'Быстрое возведение в степень',
  s3line: 'Вместо b умножений подряд — возводим основание в квадрат и разбираем показатель по битам.',
  s3mark: 'Каждый бит показателя — это одно возможное удвоение результата. Битов всего log₂b.',

  s4h: 'Трасса: 2¹³ за 4 шага',
  s4task: '13 в двоичном виде — 1101. Смотрим биты от младшего к старшему.',

  s5h: 'Малая теорема Ферма',
  s5line: 'Если m простое, то a^(m−1) ≡ 1 (mod m). Отсюда a⁻¹ = a^(m−2) — обратный элемент через то же быстрое возведение.',
  s5mark: 'Деление превращается в ещё одно применение binpow — того самого алгоритма из прошлого слайда.',

  s6h: 'C(n, k) через факториалы',
  s6n1: 'Факториалы по модулю считаются один раз, за O(n): каждый следующий — предыдущий, умноженный на i.',
  s6n2: 'Обратные к k! и (n−k)! получаются малой теоремой Ферма — два вызова binpow, O(log MOD) каждый.',
  s6n3: 'Собираем: C(n, k) = n! · (k!)⁻¹ · ((n−k)!)⁻¹, всё по модулю.',
  s6run: 'Запустите этот код в уроке — введите 10 3.',
  s6ans: 'C(10, 3) = 120 — школьная формула, посчитанная без переполнения на любых n, k до миллионов.',

  s7h: 'Джентльменский набор на будущее',
  s7c1t: 'Расширенный Евклид',
  s7c1d: 'Находит обратный элемент по модулю, который не обязан быть простым.',
  s7c2t: 'Функция Эйлера',
  s7c2d: 'Считает, сколько чисел до n взаимно просты с n — обобщение теоремы Ферма.',
  s7c3t: 'Китайская теорема об остатках',
  s7c3d: 'Восстанавливает число по остаткам от деления на несколько модулей сразу.',

  s8h: 'Задание',
  s8task: 'Посчитайте 2ⁿ mod (10⁹ + 7) для n = 10¹⁸, а затем C(1000, 500) по модулю.',
  s8hint: 'Первое — одна строка с binpow, никакого цикла на 10¹⁸ итераций. Второе — тот же код C(n, k), что и выше, без единой правки.',

  s9h: 'Запомнить',
  s9r1: 'Берите остаток после каждой операции сложения и умножения',
  s9r2: 'binpow — O(log b), а не b умножений подряд',
  s9r3: 'a⁻¹ = a^(m−2) — для простого модуля деление не нужно',
  s9r4: 'C(n, k) = n! · (k!)⁻¹ · ((n−k)!)⁻¹ по модулю',
  s9cta: 'Посчитайте обе задачи из задания и отметьте урок пройденным — Уровень 5 завершён!',
  s9foot: 'Впереди Уровень 6: максимальный поток, паросочетания и другие темы экспертного уровня.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 5-деңгээл',
  title: 'Сандар теориясы',
  subtitle: 'Модулдук арифметика: даражага тез көтөрүү, тескери элемент жана модуль боюнча C(n, k)',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Модуль боюнча арифметиканын эрежелери',
  s2c1t: 'Кошуу жана көбөйтүү',
  s2c1d: '(a + b) % m, (a · b) % m — ар бир амалдан кийин калдык алыңыз, сандардын өсүшүнө жол бербеңиз.',
  s2c2t: 'Кемитүү',
  s2c2d: '((a - b) % m + m) % m — экинчи калдыктын алдындагы кошумча +m миниске кетип калуудан сактайт.',
  s2c3t: 'Бөлүү ЖОК',
  s2c3d: 'Модуль боюнча a / b дин ордуна — b⁻¹ тескери элементине көбөйтүү.',

  s3h: 'Даражага тез көтөрүү',
  s3line: 'Катар b жолу көбөйтүүнүн ордуна — негизди квадратка көтөрөбүз да көрсөткүчтү биттерге бөлүп талдайбыз.',
  s3mark: 'Көрсөткүчтүн ар бир бити — жыйынтыктын бир мүмкүн болгон эселенүүсү. Биттердин баары болуп log₂b.',

  s4h: 'Трасса: 2¹³ 4 кадамда',
  s4task: '13 экилик түрдө — 1101. Биттерди кичинесинен чоңуна карай карайбыз.',

  s5h: 'Ферманын кичине теоремасы',
  s5line: 'Эгер m жай болсо, a^(m−1) ≡ 1 (mod m). Мындан a⁻¹ = a^(m−2) — тескери элемент ошол эле тез көтөрүү аркылуу.',
  s5mark: 'Бөлүү binpow дин дагы бир колдонулушуна айланат — мурунку слайддагы дал ошол алгоритм.',

  s6h: 'Факториалдар аркылуу C(n, k)',
  s6n1: 'Модуль боюнча факториалдар бир жолу, O(n) убакытта эсептелет: ар бир кийинкиси — мурункусу i ге көбөйтүлгөн.',
  s6n2: 'k! жана (n−k)! ге тескерилер Ферманын кичине теоремасы менен алынат — эки binpow чакыруусу, ар бири O(log MOD).',
  s6n3: 'Чогултабыз: C(n, k) = n! · (k!)⁻¹ · ((n−k)!)⁻¹, баары модуль боюнча.',
  s6run: 'Бул кодду сабактан иштетиңиз — 10 3 киргизиңиз.',
  s6ans: 'C(10, 3) = 120 — миллиондорго чейинки каалаган n, k үчүн ашып кетүүсүз эсептелген мектеп формуласы.',

  s7h: 'Келечек үчүн жентльмендик топтом',
  s7c1t: 'Кеңейтилген Евклид',
  s7c1d: 'Жай болууга милдеттүү эмес модуль боюнча тескери элементти табат.',
  s7c2t: 'Эйлердин функциясы',
  s7c2d: 'n ге чейинки канча сан n менен өз ара жай экенин эсептейт — Ферма теоремасынын жалпылоосу.',
  s7c3t: 'Калдыктар жөнүндө кытай теоремасы',
  s7c3d: 'Санды бир нече модулге бөлүүдөн калган калдыктар боюнча калыбына келтирет.',

  s8h: 'Тапшырма',
  s8task: 'n = 10¹⁸ үчүн 2ⁿ mod (10⁹ + 7) эсептеңиз, андан кийин C(1000, 500) ди модуль боюнча.',
  s8hint: 'Биринчиси — binpow менен бир сап, 10¹⁸ итерациялуу цикл жок. Экинчиси — жогорудагы эле C(n, k) коду, бир да оңдоосуз.',

  s9h: 'Эсте сакта',
  s9r1: 'Ар бир кошуу жана көбөйтүү амалынан кийин калдык алыңыз',
  s9r2: 'binpow — O(log b), катар b жолу көбөйтүү эмес',
  s9r3: 'a⁻¹ = a^(m−2) — жай модуль үчүн бөлүүнүн кереги жок',
  s9r4: 'C(n, k) = n! · (k!)⁻¹ · ((n−k)!)⁻¹ модуль боюнча',
  s9cta: 'Тапшырманын эки маселесин тең эсептеп, сабакты өттүм деп белгилеңиз — 5-деңгээл аяктады!',
  s9foot: 'Алдыда 6-деңгээл: максималдуу агым, паросочетаниелер жана башка эксперттик деңгээлдеги темалар.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 5',
  title: 'Number Theory',
  subtitle: 'Modular arithmetic: fast exponentiation, the modular inverse, and C(n, k) modulo a prime',
  press: 'Press → or Space to advance',

  s2h: 'The rules of modular arithmetic',
  s2c1t: 'Addition and multiplication',
  s2c1d: '(a + b) % m, (a · b) % m — take the remainder after every operation, never let numbers grow.',
  s2c2t: 'Subtraction',
  s2c2d: '((a - b) % m + m) % m — the extra +m before the second remainder keeps the result from going negative.',
  s2c3t: 'No division',
  s2c3d: 'Instead of a / b modulo m — multiply by the modular inverse b⁻¹.',

  s3h: 'Fast exponentiation',
  s3line: 'Instead of b multiplications in a row — square the base and walk the exponent bit by bit.',
  s3mark: 'Every bit of the exponent is one possible doubling of the result. There are only log₂b bits.',

  s4h: 'The trace: 2¹³ in 4 steps',
  s4task: '13 in binary is 1101. Look at the bits from lowest to highest.',

  s5h: "Fermat's little theorem",
  s5line: 'If m is prime, then a^(m−1) ≡ 1 (mod m). So a⁻¹ = a^(m−2) — the inverse, via the same fast exponentiation.',
  s5mark: 'Division becomes just another call to binpow — the very algorithm from the previous slide.',

  s6h: 'C(n, k) via factorials',
  s6n1: 'Factorials modulo m are computed once, in O(n): each next one is the previous multiplied by i.',
  s6n2: "Inverses of k! and (n−k)! come from Fermat's little theorem — two calls to binpow, O(log MOD) each.",
  s6n3: 'Put it together: C(n, k) = n! · (k!)⁻¹ · ((n−k)!)⁻¹, all modulo m.',
  s6run: 'Run this code in the lesson — enter 10 3.',
  s6ans: "C(10, 3) = 120 — the schoolbook formula, computed without overflow for any n, k up to the millions.",

  s7h: "A gentleman's set for later",
  s7c1t: 'Extended Euclid',
  s7c1d: "Finds the modular inverse for a modulus that doesn't have to be prime.",
  s7c2t: "Euler's totient function",
  s7c2d: "Counts how many numbers up to n are coprime with n — a generalization of Fermat's theorem.",
  s7c3t: 'The Chinese remainder theorem',
  s7c3d: 'Reconstructs a number from its remainders modulo several moduli at once.',

  s8h: 'Task',
  s8task: 'Compute 2ⁿ mod (10⁹ + 7) for n = 10¹⁸, then C(1000, 500) modulo the prime.',
  s8hint: 'The first is one line with binpow — no loop over 10¹⁸ iterations. The second is the exact same C(n, k) code above, no edits needed.',

  s9h: 'Remember',
  s9r1: 'Take the remainder after every addition and multiplication',
  s9r2: 'binpow — O(log b), not b multiplications in a row',
  s9r3: 'a⁻¹ = a^(m−2) — no division needed for a prime modulus',
  s9r4: 'C(n, k) = n! · (k!)⁻¹ · ((n−k)!)⁻¹ modulo m',
  s9cta: "Solve both tasks and mark the lesson as completed — Level 5 is done!",
  s9foot: 'Up next, Level 6: maximum flow, matchings, and other expert-level topics.',
};

export const numberTheory: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
