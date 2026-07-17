import type { LessonPresentationData } from './types';

// Presentation for the "Recursion and Backtracking" lesson
// (olympiad-roadmap → level-3-data-structures → recursion-backtracking).
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
  s2mark: string;

  s3h: string; s3task: string;
  s3n1: string; s3n2: string; s3n3: string;

  s4h: string; s4n1: string; s4n2: string; s4n3: string; s4run: string;

  s5h: string; s5s1: string; s5s2: string; s5s3: string; s5mark: string;

  s6h: string; s6lab1: string; s6lab2: string; s6r1: string; s6r2: string; s6mark: string;

  s7h: string; s7n1: string; s7n2: string; s7run: string;

  s8h: string; s8line: string; s8mark: string;

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

// subsetTree renders the decision tree for all subsets of {1, 2, 3}: each
// reveal group adds one depth level (root → after deciding 1 → after
// deciding 2 → the 8 leaves after deciding 3). Grey edges are "skip", accent
// edges are "take" — matching the order search(i+1) then push_back+search(i+1)
// in the code, so left-to-right the 8 leaves read {} {3} {2} {2,3} {1} {1,3}
// {1,2} {1,2,3}.
function subsetTree(): string {
  const leafX = (i: number) => 24 + i * 68;
  const leafY = 176;
  const l2Y = 116;
  const l1Y = 60;
  const rootY = 12;

  const leafSets = ['{ }', '{3}', '{2}', '{2,3}', '{1}', '{1,3}', '{1,2}', '{1,2,3}'];
  const l2Xs = [0, 1, 2, 3].map((j) => (leafX(2 * j) + leafX(2 * j + 1)) / 2);
  const l1Xs = [(l2Xs[0] + l2Xs[1]) / 2, (l2Xs[2] + l2Xs[3]) / 2];
  const rootX = (l1Xs[0] + l1Xs[1]) / 2;

  const dot = (x: number, y: number, r: number, color: string) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
  const edge = (x1: number, y1: number, x2: number, y2: number, take: boolean) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${take ? C.acc : 'rgba(255,255,255,.28)'}" stroke-width="${take ? 2.2 : 1.6}"/>`;

  const g0 = dot(rootX, rootY, 6, C.info) +
    `<text x="${rootX}" y="${rootY - 12}" text-anchor="middle" fill="#64748b" font-size="12">i=0</text>`;

  let g1 = '';
  l1Xs.forEach((x, k) => {
    g1 += edge(rootX, rootY, x, l1Y, k === 1) + dot(x, l1Y, 5.5, k === 1 ? C.acc : '#94a3b8');
  });

  let g2 = '';
  l2Xs.forEach((x, j) => {
    const parentX = l1Xs[Math.floor(j / 2)];
    const take = j % 2 === 1;
    g2 += edge(parentX, l1Y, x, l2Y, take) + dot(x, l2Y, 5, take ? C.acc : '#94a3b8');
  });

  let g3 = '';
  for (let i = 0; i < 8; i++) {
    const parentX = l2Xs[Math.floor(i / 2)];
    const take = i % 2 === 1;
    const x = leafX(i);
    g3 += edge(parentX, l2Y, x, leafY, take);
    g3 += dot(x, leafY, 5, take ? C.good : '#94a3b8');
    g3 += `<text x="${x}" y="${leafY + 22}" text-anchor="middle" fill="${take ? '#6ee7b7' : '#cbd5e1'}" font-size="13" font-family="monospace">${leafSets[i]}</text>`;
  }

  return `<div class="lp-chart">
<svg viewBox="0 0 540 210" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <div class="lp-bigo" aria-hidden="true">2ⁿ</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The idea: base + step, exhaustive search
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🛑</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🪜</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🌳</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── Animated decision tree for subsets
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s3task}</p>
${subsetTree()}
<div class="lp-notes" style="margin-top:6px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s3n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s3n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="none"><p>${t.s3n3}</p></div>
</div>`,

    // 4 ── The full code
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">void search(int i) {
    if (i == n) { <span class="cm">// база</span>
        print(current);
        return;
    }
</span><span class="step" data-g="1" data-a="none">    search(i + 1);           <span class="cm">// не берём a[i]</span>
</span><span class="step" data-g="2" data-a="none">    current.push_back(a[i]); <span class="cm">// берём a[i]</span>
    search(i + 1);
    current.pop_back();      <span class="cm">// откат!</span>
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s4run}</p>`,

    // 5 ── The heart of backtracking
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-chips" style="margin-top:10px">
  <span class="lp-chip step" style="--c:${C.acc}">${t.s5s1}</span>
  <span class="lp-arr step">→</span>
  <span class="lp-chip step" style="--c:${C.info}">${t.s5s2}</span>
  <span class="lp-arr step">→</span>
  <span class="lp-chip step" style="--c:${C.warn}">${t.s5s3}</span>
</div>
<p class="lp-p lp-center step" style="margin-top:18px"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── Scale: subsets vs permutations
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-scale">
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.info}">2ⁿ</span><span>${t.s6lab1}</span><code class="lp-mini">n=10 → 1024</code></div>
  <div class="lp-row lp-quiz step"><span class="lp-chip" style="--c:${C.warn}">n!</span><span>${t.s6lab2}</span><code class="lp-mini">n=10 → 3 628 800</code></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">n ≤ 20–25</span><span>${t.s6r1}</span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">next_permutation</span><span>${t.s6r2}</span></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Permutations: full code
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::sort(s.begin(), s.end()); <span class="cm">// наименьшая первой</span>
</span><span class="step" data-g="1" data-a="none">
do {
    std::cout &lt;&lt; s &lt;&lt; "\\n";
} while (std::next_permutation(s.begin(), s.end()));</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s7run}</p>`,

    // 8 ── Pruning
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s8mark}</span></p>`,

    // 9 ── Task teaser
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s9task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">➕➖</div><p>${t.s9hint}</p></div>`,

    // 10 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s10h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">база + шаг</span><span><b>${t.s10r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">2ⁿ</span><span><b>${t.s10r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">pop_back</span><span><b>${t.s10r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">отсечения</span><span><b>${t.s10r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s10cta}</p></div>
<p class="lp-foot lp-center step">${t.s10foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 3',
  title: 'Рекурсия и полный перебор',
  subtitle: 'Подмножества, перестановки и дерево вариантов — как обойти всё и не запутаться',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Рекурсия в двух частях',
  s2c1t: 'База',
  s2c1d: 'Когда остановиться и вернуть готовый ответ без дальнейших вызовов.',
  s2c2t: 'Шаг',
  s2c2d: 'Как свести задачу к точно такой же, но меньшего размера.',
  s2c3t: 'Главное применение',
  s2c3d: 'Полный перебор: систематически обойти ВСЕ варианты, не пропустив и не повторив ни один.',
  s2mark: 'Для каждого элемента — два выбора: взять или не взять. Дерево вариантов глубины n, 2ⁿ листьев.',

  s3h: 'Дерево решений: подмножества {1, 2, 3}',
  s3task: 'Серая ветка — «не берём», цветная — «берём». Три уровня — три элемента.',
  s3n1: 'Решаем судьбу элемента 1: серая ветка — пропустить, цветная — взять.',
  s3n2: 'Решаем судьбу элемента 2 в каждой из двух веток — теперь их четыре.',
  s3n3: 'Решаем судьбу элемента 3 — восемь листьев, восемь подмножеств. Ни одно не забыто, ни одно не повторено.',

  s4h: 'Все подмножества: весь код',
  s4n1: 'i == n значит: решение по всем элементам принято — печатаем набранное.',
  s4n2: 'Первый вызов — ветка «не берём a[i]»: current не меняем.',
  s4n3: 'Второй вызов — ветка «берём a[i]»: добавили, исследовали, вернули как было.',
  s4run: 'Запустите этот код в уроке — введите 3, затем 1 2 3.',

  s5h: 'Сердце приёма: backtracking',
  s5s1: 'выбрали',
  s5s2: 'исследовали ветку',
  s5s3: 'отменили выбор',
  s5mark: 'current.pop_back() возвращает всё как было — без отмены следующая ветка унаследует чужой выбор. Забытая отмена — ошибка номер один в переборах.',

  s6h: 'Оцените масштаб',
  s6lab1: 'подмножеств множества из n элементов',
  s6lab2: 'перестановок из n элементов',
  s6r1: 'Полный перебор подмножеств реален примерно до этого предела',
  s6r2: 'Перестановки растут быстрее — писать вручную не нужно, в C++ уже есть',
  s6mark: 'n! обгоняет 2ⁿ стремительно: для n = 20 подмножеств ~10⁶, а перестановок уже ~10¹⁸.',

  s7h: 'Все перестановки: весь код',
  s7n1: 'next_permutation всегда идёт от текущей перестановки к следующей по возрастанию — начинать нужно с отсортированной строки.',
  s7n2: 'do-while гарантирует, что даже единственная (уже наибольшая) перестановка напечатается один раз.',
  s7run: 'Запустите этот код в уроке — введите abc.',

  s8h: 'Когда дерево слишком большое',
  s8line: 'Отсечения (pruning): не заходить в ветку, которая заведомо не даст ответа — проверка отбрасывает её раньше, чем дерево там разрастётся.',
  s8mark: 'Умный перебор с отсечениями решает задачи, где перебор «в лоб» — вечность.',

  s9h: 'Задание',
  s9task: 'Расставьте знаки + и − между числами 1 2 3 4 так, чтобы результат равнялся нулю.',
  s9hint: 'Знаков три места — всего 2³ = 8 вариантов. Полный перебор здесь тривиален: дерево решений глубины 3, как в примере с подмножествами.',

  s10h: 'Запомнить',
  s10r1: 'Рекурсия = база (когда остановиться) + шаг (задача меньшего размера)',
  s10r2: 'Полный перебор подмножеств — дерево из 2ⁿ листьев',
  s10r3: 'push_back / pop_back — выбор и его отмена, симметрично',
  s10r4: 'Отсечения спасают, когда дерево не помещается во времени',
  s10cta: 'Решите прикреплённую задачу про знаки + и − и отметьте урок пройденным.',
  s10foot: 'Дальше — жадные алгоритмы: когда локально лучший шаг даёт глобально лучший ответ.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 3-деңгээл',
  title: 'Рекурсия жана толук кыдыруу',
  subtitle: 'Подмножестволор, орун алмаштыруулар жана варианттар дарагы — баарын кантип адаштырбай басып өтүү керек',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Рекурсия эки бөлүктө',
  s2c1t: 'База',
  s2c1d: 'Качан токтоп, андан ары чакырбай эле даяр жоопту кайтаруу керек.',
  s2c2t: 'Кадам',
  s2c2d: 'Маселени так ошондой эле, бирок кичине өлчөмдөгүсүнө кантип алып келүү керек.',
  s2c3t: 'Башкы колдонулушу',
  s2c3d: 'Толук кыдыруу: БАРДЫК варианттарды системалуу түрдө, эч бирин калтырбай, эч бирин кайталабай басып өтүү.',
  s2mark: 'Ар бир элемент үчүн — эки тандоо: алуу же албоо. Тереңдиги n, жалбырактары 2ⁿ болгон варианттар дарагы.',

  s3h: 'Чечимдер дарагы: {1, 2, 3} подмножестволору',
  s3task: 'Боз бутак — «албайбыз», түстүү бутак — «алабыз». Үч деңгээл — үч элемент.',
  s3n1: '1-элементтин тагдырын чечебиз: боз бутак — өткөрүп жиберүү, түстүү — алуу.',
  s3n2: '2-элементтин тагдырын эки бутактын ар биринде чечебиз — эми алар төртөө.',
  s3n3: '3-элементтин тагдырын чечебиз — сегиз жалбырак, сегиз подмножество. Бир дагысы унутулган жок, бир дагысы кайталанган жок.',

  s4h: 'Бардык подмножестволор: толук код',
  s4n1: 'i == n дегени: бардык элементтер боюнча чечим кабыл алынды — жыйналганды басып чыгарабыз.',
  s4n2: 'Биринчи чакыруу — «a[i] ди албайбыз» бутагы: current ти өзгөртпөйбүз.',
  s4n3: 'Экинчи чакыруу — «a[i] ди алабыз» бутагы: коштук, изилдедик, кайра мурункудай кылдык.',
  s4run: 'Бул кодду сабактан иштетиңиз — 3, андан кийин 1 2 3 киргизиңиз.',

  s5h: 'Ыкманын жүрөгү: backtracking',
  s5s1: 'тандадык',
  s5s2: 'бутакты изилдедик',
  s5s3: 'тандоону артка алдык',
  s5mark: 'current.pop_back() баарын мурункудай кылып кайтарат — артка албасак кийинки бутак башканын тандоосун мурастап алат. Унутулган артка алуу — кыдырууларда биринчи номердеги ката.',

  s6h: 'Масштабын баалаңыз',
  s6lab1: 'n элементтен турган көптүктүн подмножестволору',
  s6lab2: 'n элементтен турган орун алмаштыруулар',
  s6r1: 'Подмножестволорду толук кыдыруу болжол менен ушул чекке чейин реалдуу',
  s6r2: 'Орун алмаштыруулар тезирээк өсөт — кол менен жазуунун кереги жок, C++ тилинде даяр бар',
  s6mark: 'n! 2ⁿ ден тез эле озуп кетет: n = 20 болгондо подмножестволор ~10⁶, ал эми орун алмаштыруулар ~10¹⁸.',

  s7h: 'Бардык орун алмаштыруулар: толук код',
  s7n1: 'next_permutation дайыма учурдагы орун алмаштыруудан кийинкисине өсүү тартибинде өтөт — иреттелген саптан баштоо керек.',
  s7n2: 'do-while жалгыз (эбак эле эң чоң) орун алмаштыруу да бир жолу басылып чыгарылышын кепилдейт.',
  s7run: 'Бул кодду сабактан иштетиңиз — abc киргизиңиз.',

  s8h: 'Дарак өтө чоң болгондо',
  s8line: 'Кесип таштоолор (pruning): жооп бербей турганы алдын ала белгилүү бутакка кирбөө — текшерүү дарактын ошол жерде чоңоюп кетишинен мурун аны ыргытат.',
  s8mark: 'Кесип таштоолору бар акылдуу кыдыруу «түз» жол менен түбөлүк талап кылган маселелерди чечет.',

  s9h: 'Тапшырма',
  s9task: '1 2 3 4 сандарынын ортосуна + жана - белгилерин жыйынтык нөлгө барабар болгудай коюңуз.',
  s9hint: 'Белгилер үчүн үч орун — баары болуп 2³ = 8 вариант. Мында толук кыдыруу тим эле: подмножестволор мисалындагыдай тереңдиги 3 чечимдер дарагы.',

  s10h: 'Эсте сакта',
  s10r1: 'Рекурсия = база (качан токтош керек) + кадам (кичине өлчөмдөгү маселе)',
  s10r2: 'Подмножестволорду толук кыдыруу — 2ⁿ жалбырактуу дарак',
  s10r3: 'push_back / pop_back — тандоо жана анын артка алынышы, симметриялуу',
  s10r4: 'Дарак убакытка батпаганда кесип таштоолор куткарат',
  s10cta: 'Тиркелген + жана - белгилери жөнүндөгү маселени чечиңиз жана сабакты өттүм деп белгилеңиз.',
  s10foot: 'Андан ары — ач көз алгоритмдер: жергиликтүү эң жакшы кадам качан глобалдык эң жакшы жоопту берет.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 3',
  title: 'Recursion and Exhaustive Search',
  subtitle: 'Subsets, permutations, and the tree of choices — visiting everything without getting lost',
  press: 'Press → or Space to advance',

  s2h: 'Recursion in two parts',
  s2c1t: 'The base case',
  s2c1d: 'When to stop and return the finished answer, with no further calls.',
  s2c2t: 'The step',
  s2c2d: 'How to reduce the problem to the exact same one, only smaller.',
  s2c3t: 'The main use',
  s2c3d: 'Exhaustive search: systematically visiting EVERY possibility, missing none and repeating none.',
  s2mark: 'Every element gets two choices: take it or not. A tree of choices of depth n, with 2ⁿ leaves.',

  s3h: 'The decision tree: subsets of {1, 2, 3}',
  s3task: 'A grey branch means "skip", a colored one means "take". Three levels — three elements.',
  s3n1: 'Deciding element 1\'s fate: grey branch — skip it, colored — take it.',
  s3n2: 'Deciding element 2\'s fate in each of the two branches — now there are four.',
  s3n3: 'Deciding element 3\'s fate — eight leaves, eight subsets. None forgotten, none repeated.',

  s4h: 'All subsets: the full code',
  s4n1: 'i == n means: a decision has been made for every element — print what was collected.',
  s4n2: 'The first call is the "skip a[i]" branch: current stays untouched.',
  s4n3: 'The second call is the "take a[i]" branch: added, explored, restored to how it was.',
  s4run: 'Run this code in the lesson — enter 3, then 1 2 3.',

  s5h: 'The heart of the technique: backtracking',
  s5s1: 'chose',
  s5s2: 'explored the branch',
  s5s3: 'undid the choice',
  s5mark: 'current.pop_back() restores everything to how it was — skip the undo and the next branch inherits someone else\'s choice. A forgotten undo is mistake number one in search code.',

  s6h: 'Get a feel for the scale',
  s6lab1: 'subsets of a set of n elements',
  s6lab2: 'permutations of n elements',
  s6r1: 'Exhaustive search over subsets is realistic roughly up to this limit',
  s6r2: 'Permutations grow much faster — no need to write it by hand, C++ already has it',
  s6mark: 'n! overtakes 2ⁿ fast: at n = 20, subsets are ~10⁶, but permutations are already ~10¹⁸.',

  s7h: 'All permutations: the full code',
  s7n1: 'next_permutation always steps from the current permutation to the next one in increasing order — start from a sorted string.',
  s7n2: 'do-while guarantees that even a single (already the largest) permutation gets printed once.',
  s7run: 'Run this code in the lesson — enter abc.',

  s8h: 'When the tree is too big',
  s8line: 'Pruning: don\'t enter a branch that provably cannot yield an answer — a check discards it before the tree grows any further there.',
  s8mark: 'A smart search with pruning solves problems where the brute-force way would take forever.',

  s9h: 'Task',
  s9task: 'Place + and − signs between the numbers 1 2 3 4 so that the result equals zero.',
  s9hint: 'There are three sign slots — 2³ = 8 options total. Exhaustive search is trivial here: a decision tree of depth 3, just like the subsets example.',

  s10h: 'Remember',
  s10r1: 'Recursion = base case (when to stop) + step (a smaller problem)',
  s10r2: 'Exhaustive search over subsets — a tree with 2ⁿ leaves',
  s10r3: 'push_back / pop_back — a choice and its undo, symmetric',
  s10r4: 'Pruning saves you when the tree doesn\'t fit in time',
  s10cta: 'Solve the attached +/− signs problem and mark the lesson as completed.',
  s10foot: 'Next up: greedy algorithms — when the locally best step gives the globally best answer.',
};

export const recursionBacktracking: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
