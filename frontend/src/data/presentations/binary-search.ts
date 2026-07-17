import type { LessonPresentationData } from './types';

// Presentation for the "Binary Search" lesson
// (olympiad-roadmap → level-2-sorting-searching → binary-search).
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

  s5h: string; s5lbT: string; s5lbD: string; s5ubT: string; s5ubD: string; s5mark: string;

  s6h: string; s6line: string; s6lab: string; s6mark: string;

  s7h: string; s7n1: string; s7n2: string; s7n3: string; s7run: string;

  s8h: string;
  s8e1t: string; s8e1d: string;
  s8e2t: string; s8e2d: string;
  s8e3t: string; s8e3d: string;

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

// arraySearchLadder renders the half-open binary search for the first index
// with a[i] >= 5 on [1,3,5,5,7,9]: group 0 the plain array, groups 1-2 mark
// each mid check and dim the eliminated half (overlay technique, like the
// sieve grid: cells never move, only get painted over), group 3 lights up
// the winning index in green.
function arraySearchLadder(l0: string, l1: string, l2: string): string {
  const arr = [1, 3, 5, 5, 7, 9];
  const x = (k: number) => 30 + k * 76;
  const cx = (k: number) => x(k) + 32;
  const y = 34;
  const w = 64;
  const h = 50;

  const idxLabel = (k: number) =>
    `<text x="${cx(k)}" y="20" text-anchor="middle" fill="#64748b" font-size="13" font-family="monospace">${k}</text>`;
  const base = (k: number) =>
    `<rect x="${x(k)}" y="${y}" width="${w}" height="${h}" rx="10" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.16)"/>` +
    `<text x="${cx(k)}" y="${y + 33}" text-anchor="middle" fill="#cbd5e1" font-size="21" font-family="monospace">${arr[k]}</text>`;
  const dim = (k: number) => `<rect x="${x(k)}" y="${y}" width="${w}" height="${h}" rx="10" fill="rgba(11,16,32,.62)"/>`;
  const ring = (k: number, color: string) =>
    `<rect x="${x(k) - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="12" fill="none" stroke="${color}" stroke-width="2.5"/>`;
  const win = (k: number) =>
    `<rect x="${x(k)}" y="${y}" width="${w}" height="${h}" rx="10" fill="rgba(52,211,153,.2)" stroke="${C.good}" stroke-width="2.5"/>` +
    `<text x="${cx(k)}" y="${y + 33}" text-anchor="middle" fill="#6ee7b7" font-size="21" font-weight="700" font-family="monospace">${arr[k]}</text>`;

  let g0 = '';
  for (let k = 0; k < 6; k++) g0 += idxLabel(k) + base(k);
  g0 += `<text x="30" y="${y + h + 22}" fill="#8fa0ba" font-size="14">${l0}</text>`;

  const g1 = ring(3, C.warn) + dim(3) + dim(4) + dim(5) +
    `<text x="30" y="${y + h + 22}" fill="${C.warn}" font-size="14" font-family="monospace">${l1}</text>`;

  const g2 = ring(1, C.warn) + dim(0) + dim(1) +
    `<text x="30" y="${y + h + 22}" fill="${C.warn}" font-size="14" font-family="monospace">${l2}</text>`;

  const g3 = win(2);

  return `<div class="lp-chart">
<svg viewBox="0 0 500 118" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <div class="lp-bigo" aria-hidden="true">O(log n)</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The idea: three facts
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">📈</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">✂️</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🎯</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── Animated array search demo
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s3task}</p>
${arraySearchLadder(t.s3n1, t.s3n2, t.s3n3)}
<div class="lp-notes" style="margin-top:6px">
  <div class="lp-card step" data-g="1" data-a="right"><p>${t.s3n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="right"><p>${t.s3n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="right"><p>${t.s3n3}</p></div>
</div>`,

    // 4 ── The full code: half-open template
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">int l = 0, r = n; <span class="cm">// [l, r)</span>
</span><span class="step" data-g="1" data-a="none">while (l &lt; r) {
    int mid = (l + r) / 2;
</span><span class="step" data-g="2" data-a="none">    if (a[mid] &gt;= x) r = mid;
    else               l = mid + 1;
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s4run}</p>`,

    // 5 ── STL shortcut: lower_bound / upper_bound
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3><code class="lp-mini">lower_bound</code></h3><p>${t.s5lbD}</p></div>
  <div class="lp-card step" data-a="right"><h3><code class="lp-mini">upper_bound</code></h3><p>${t.s5ubD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── Binary search on the answer: the monotone strip
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s6line}</p>
<div class="lp-chips" style="margin-top:18px">
  <span class="lp-chip step" style="--c:${C.bad}">T=1 ✗</span>
  <span class="lp-chip step" style="--c:${C.bad}">T=2 ✗</span>
  <span class="lp-chip step" style="--c:${C.bad}">T=3 ✗</span>
  <span class="lp-chip step" data-a="zoom" style="--c:${C.acc}">${t.s6lab}</span>
  <span class="lp-chip step" style="--c:${C.good}">T=4 ✓</span>
  <span class="lp-chip step" style="--c:${C.good}">T=5 ✓</span>
  <span class="lp-chip step" style="--c:${C.good}">T=6 ✓</span>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Binary search on the answer: full code
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">long long l = 0, r = 2000000000;
</span><span class="step" data-g="1" data-a="none">while (l &lt; r) {
    long long mid = (l + r + 1) / 2; <span class="cm">// вверх!</span>
</span><span class="step" data-g="2" data-a="none">    if (mid * mid &lt;= n) l = mid;
    else                  r = mid - 1;
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s7n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s7run}</p>`,

    // 8 ── Three classic mistakes
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🔁</div><h3>${t.s8e1t}</h3><p>${t.s8e1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🧮</div><h3>${t.s8e2t}</h3><p>${t.s8e2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">📏</div><h3>${t.s8e3t}</h3><p>${t.s8e3d}</p></div>
</div>`,

    // 9 ── Task teaser: printers
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s9task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🖨️</div><p>${t.s9hint}</p></div>`,

    // 10 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s10h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">[l, r)</span><span><b>${t.s10r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">lower_bound</span><span><b>${t.s10r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">по ответу</span><span><b>${t.s10r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">(l+r+1)/2</span><span><b>${t.s10r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s10cta}</p></div>
<p class="lp-foot lp-center step">${t.s10foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 2',
  title: 'Бинарный поиск',
  subtitle: 'Деление пополам за O(log n) — по массиву и по самому ответу',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Идея в трёх фактах',
  s2c1t: 'Условие монотонно',
  s2c1d: '«До какого-то места — нет, дальше — да»: данные отсортированы или сам ответ такой.',
  s2c2t: '~30 шагов на миллиард',
  s2c2d: 'Каждый шаг отбрасывает половину вариантов — O(log n).',
  s2c3t: 'Надёжный шаблон',
  s2c3d: 'Полуинтервал [l, r): ищем первый индекс, где условие выполняется.',
  s2mark: 'Ошибки «на единицу» и вечные циклы — визитная карточка темы. Шаблон спасает от обеих.',

  s3h: 'Первое вхождение x = 5',
  s3task: 'Массив отсортирован: 1 3 5 5 7 9. Ищем первый индекс, где a[i] ≥ 5.',
  s3n1: 'l=0, r=6: mid=3, a[3]=5 ≥ 5 — подходит, но, может, есть раньше. Сужаем справа: r=mid.',
  s3n2: 'l=0, r=3: mid=1, a[1]=3 < 5 — не подходит и левее не будет. Сужаем слева: l=mid+1.',
  s3n3: 'l=2, r=3: mid=2, a[2]=5 ≥ 5 — сужаем: r=mid=2. Теперь l=r=2 — ответ найден.',

  s4h: 'Шаблон [l, r): весь код',
  s4n1: 'r = n, не n − 1: полуинтервал не включает r. Инвариант: ответ либо в [l, r), либо его нет.',
  s4n2: 'Цикл идёт, пока диапазон не сузился до одной точки — l == r.',
  s4n3: 'Условие определяет направление: подходит — сужаем справа (r=mid), нет — сдвигаем слева (l=mid+1).',
  s4run: 'Запустите этот код в уроке — введите 6 5, затем 1 3 5 5 7 9.',

  s5h: 'В STL это уже есть',
  s5lbT: 'lower_bound',
  s5lbD: 'Итератор на первый элемент, который не меньше x — ровно то, что вы только что написали руками.',
  s5ubT: 'upper_bound',
  s5ubD: 'Итератор на первый элемент строго больше x.',
  s5mark: 'Но писать поиск руками вы обязаны уметь — из-за главного приёма ниже.',

  s6h: 'Бинарный поиск ПО ОТВЕТУ',
  s6line: 'Сам ответ может быть монотонен: «можно ли уложиться за время T?» — если можно за T, можно и за T+1.',
  s6lab: 'граница',
  s6mark: 'Ищем не элемент массива, а границу между «нельзя» и «можно» — а проверку пишете сами.',

  s7h: 'Пример: целочисленный корень',
  s7n1: 'Ищем наибольшее m, такое что m² ≤ n. Диапазон ответа — [0, 2·10⁹].',
  s7n2: 'Ищем ПОСЛЕДНЕЕ подходящее значение — середину округляем вверх, иначе цикл зависнет.',
  s7n3: 'mid подходит — он и есть новый кандидат, l=mid; не подходит — r=mid−1.',
  s7run: 'Запустите этот код в уроке — введите 1000000000000.',

  s8h: 'Три классические ошибки',
  s8e1t: 'Вечный цикл',
  s8e1d: 'Ищете последнее подходящее (l=mid) без округления вверх — зависает при r − l = 1.',
  s8e2t: 'Переполнение mid',
  s8e2d: 'В C++ с long long обычно безопасно, но в других языках пишут l + (r − l) / 2.',
  s8e3t: 'Неверные границы',
  s8e3d: 'Ответ обязан лежать в стартовом [l, r] — проверьте крайние значения перед стартом.',

  s9h: 'Задание',
  s9task: 'k станков, каждый печатает лист за t секунд, нужно n листов. За какое минимальное время они справятся?',
  s9hint: 'Решите бинпоиском по ответу с проверкой «сколько листов успеем за время T». Ответ монотонен — время растёт, листов больше.',

  s10h: 'Запомнить',
  s10r1: 'Полуинтервал [l, r) — надёжный шаблон без ошибок «на единицу»',
  s10r2: 'lower_bound / upper_bound — готовый бинарный поиск в STL',
  s10r3: 'Ищите границу «нельзя / можно», а не только элемент массива',
  s10r4: 'Округляйте mid вверх, если ищете последнее подходящее',
  s10cta: 'Отметьте урок пройденным — вы завершили Уровень 2: сортировки и поиск!',
  s10foot: 'Впереди Уровень 3: стек, очередь, множества, рекурсия и жадные алгоритмы.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 2-деңгээл',
  title: 'Бинардык издөө',
  subtitle: 'Экиге бөлүп издөө O(log n) убакытта — массив боюнча жана жоптун өзү боюнча',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Идея үч фактыда',
  s2c1t: 'Шарт монотондуу',
  s2c1d: '«Кайсы бир жерге чейин — жок, андан ары — ооба»: маалымат иреттелген же жооптун өзү ушундай.',
  s2c2t: 'Миллиардга ~30 кадам',
  s2c2d: 'Ар бир кадам варианттардын жарымын ыргытат — O(log n).',
  s2c3t: 'Ишенимдүү шаблон',
  s2c3d: '[l, r) жарым интервалы: шарт аткарылган биринчи индексти издейбиз.',
  s2mark: '«Бирге жаңылуу» каталары жана түбөлүк циклдер — теманын визиттик картасы. Шаблон экөөнөн тең сактайт.',

  s3h: 'x = 5 тин биринчи кездешүүсү',
  s3task: 'Массив иреттелген: 1 3 5 5 7 9. a[i] ≥ 5 болгон биринчи индексти издейбиз.',
  s3n1: 'l=0, r=6: mid=3, a[3]=5 ≥ 5 — жарайт, бирок мурдараак болушу мүмкүн. Оңдон кысабыз: r=mid.',
  s3n2: 'l=0, r=3: mid=1, a[1]=3 &lt; 5 — жарабайт жана солдо да болбойт. Солдон кысабыз: l=mid+1.',
  s3n3: 'l=2, r=3: mid=2, a[2]=5 ≥ 5 — кысабыз: r=mid=2. Эми l=r=2 — жооп табылды.',

  s4h: '[l, r) шаблону: толук код',
  s4n1: 'r = n, n − 1 эмес: жарым интервал r ди камтыбайт. Инвариант: жооп же [l, r) де, же жок.',
  s4n2: 'Диапазон бир чекитке чейин кыскарганча цикл жүрөт — l == r.',
  s4n3: 'Шарт багытты аныктайт: жарайт — оңдон кысабыз (r=mid), жарабайт — солдон жылдырабыз (l=mid+1).',
  s4run: 'Бул кодду сабактан иштетиңиз — 6 5, андан кийин 1 3 5 5 7 9 киргизиңиз.',

  s5h: 'STL ичинде бул даяр бар',
  s5lbT: 'lower_bound',
  s5lbD: 'x тен кичине эмес биринчи элементке итератор — сиз жаңы эле кол менен жазган нерсе так ушул.',
  s5ubT: 'upper_bound',
  s5ubD: 'x тен так чоң биринчи элементке итератор.',
  s5mark: 'Бирок издөөнү кол менен жаза билүүгө милдеттүүсүз — төмөндөгү башкы ыкмадан улам.',

  s6h: 'ЖООП боюнча бинардык издөө',
  s6line: 'Жооптун өзү монотондуу болушу мүмкүн: «T убакытка батууга болобу?» — эгер T га болсо, T+1ге да болот.',
  s6lab: 'чек',
  s6mark: 'Массивдин элементин эмес, «болбойт» менен «болот» ортосундагы чекти издейбиз — текшерүүнү өзүңүз жазасыз.',

  s7h: 'Мисал: бүтүн сандык тамыр',
  s7n1: 'm² ≤ n болгон эң чоң m ди издейбиз. Жооптун диапазону — [0, 2·10⁹].',
  s7n2: 'АКЫРКЫ жараганды издейбиз — ортону өйдө тегеректейбиз, антпесе цикл илинип калат.',
  s7n3: 'mid жарайт — ал жаңы талапкер, l=mid; жарабайт — r=mid−1.',
  s7run: 'Бул кодду сабактан иштетиңиз — 1000000000000 киргизиңиз.',

  s8h: 'Үч классикалык ката',
  s8e1t: 'Түбөлүк цикл',
  s8e1d: 'Акыркы жарааганды издеп жатып (l=mid) өйдө тегеректебесеңиз — r − l = 1 болгондо илинип калат.',
  s8e2t: 'mid ашып кетүүсү',
  s8e2d: 'C++ тилинде long long менен адатта коопсуз, бирок башка тилдерде l + (r − l) / 2 деп жазышат.',
  s8e3t: 'Туура эмес чектер',
  s8e3d: 'Жооп баштапкы [l, r] ичинде жатууга милдеттүү — баштаардан мурун четки маанилерди текшериңиз.',

  s9h: 'Тапшырма',
  s9task: 'k станок бар, ар бири баракты t секундада басат, n барак керек. Алар эң аз канча убакытта бүтүрөт?',
  s9hint: '«T убакытта канча барак үлгүрөбүз» текшерүүсү менен жооп боюнча бинардык издөө аркылуу чечиңиз. Жооп монотондуу — убакыт өссө, барак да көбөйөт.',

  s10h: 'Эсте сакта',
  s10r1: '[l, r) жарым интервалы — «бирге жаңылуу» каталарынан алыс ишенимдүү шаблон',
  s10r2: 'lower_bound / upper_bound — STL дагы даяр бинардык издөө',
  s10r3: 'Массивдин элементин гана эмес, «болбойт / болот» чегин издеңиз',
  s10r4: 'Акыркы жараганды издесеңиз, mid ди өйдө тегеректеңиз',
  s10cta: 'Сабакты өттүм деп белгилеңиз — сиз 2-деңгээлди бүттүңүз: иреттөө жана издөө!',
  s10foot: 'Алдыда 3-деңгээл: стек, кезек, көптүктөр, рекурсия жана ач көз алгоритмдер.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 2',
  title: 'Binary Search',
  subtitle: 'Halving in O(log n) — over an array, and over the answer itself',
  press: 'Press → or Space to advance',

  s2h: 'The idea in three facts',
  s2c1t: 'The condition is monotone',
  s2c1d: '"Up to some point — no, after it — yes": the data is sorted, or the answer itself works this way.',
  s2c2t: '~30 steps for a billion',
  s2c2d: 'Each step discards half of the candidates — O(log n).',
  s2c3t: 'A reliable template',
  s2c3d: 'The half-open interval [l, r): we look for the first index where the condition holds.',
  s2mark: 'Off-by-one errors and infinite loops are this topic\'s trademark. The template saves you from both.',

  s3h: 'The first occurrence of x = 5',
  s3task: 'The array is sorted: 1 3 5 5 7 9. Looking for the first index with a[i] ≥ 5.',
  s3n1: 'l=0, r=6: mid=3, a[3]=5 ≥ 5 — works, but maybe an earlier one does too. Narrow right: r=mid.',
  s3n2: 'l=0, r=3: mid=1, a[1]=3 &lt; 5 — doesn\'t work, and nothing to the left will either. Narrow left: l=mid+1.',
  s3n3: 'l=2, r=3: mid=2, a[2]=5 ≥ 5 — narrow: r=mid=2. Now l=r=2 — the answer is found.',

  s4h: 'The [l, r) template: the full code',
  s4n1: 'r = n, not n − 1: the half-open interval excludes r. Invariant: the answer is either in [l, r), or doesn\'t exist.',
  s4n2: 'The loop runs until the range shrinks to a single point — l == r.',
  s4n3: 'The condition sets the direction: it holds — narrow right (r=mid); it doesn\'t — shift left (l=mid+1).',
  s4run: 'Run this code in the lesson — enter 6 5, then 1 3 5 5 7 9.',

  s5h: 'The STL already has this',
  s5lbT: 'lower_bound',
  s5lbD: 'An iterator to the first element not less than x — exactly what you just wrote by hand.',
  s5ubT: 'upper_bound',
  s5ubD: 'An iterator to the first element strictly greater than x.',
  s5mark: 'But you must be able to write the search by hand — because of the key technique below.',

  s6h: 'Binary search ON THE ANSWER',
  s6line: 'The answer itself can be monotone: "can we finish within time T?" — if T works, so does T+1.',
  s6lab: 'boundary',
  s6mark: 'We\'re not searching an array element but the boundary between "impossible" and "possible" — you write the check.',

  s7h: 'Example: the integer square root',
  s7n1: 'Looking for the largest m such that m² ≤ n. The answer range is [0, 2·10⁹].',
  s7n2: 'We\'re searching for the LAST valid value — round the midpoint up, or the loop will hang.',
  s7n3: 'mid works — it becomes the new candidate, l=mid; it doesn\'t — r=mid−1.',
  s7run: 'Run this code in the lesson — enter 1000000000000.',

  s8h: 'Three classic mistakes',
  s8e1t: 'Infinite loop',
  s8e1d: 'Searching for the last valid value (l=mid) without rounding up — hangs at r − l = 1.',
  s8e2t: 'Midpoint overflow',
  s8e2d: 'In C++ with long long it\'s usually safe, but other languages write l + (r − l) / 2.',
  s8e3t: 'Wrong bounds',
  s8e3d: 'The answer must lie within the starting [l, r] — check the extreme values before you start.',

  s9h: 'Task',
  s9task: 'There are k printers, each prints a page in t seconds, and you need n pages. What is the minimum time to finish?',
  s9hint: 'Solve it with binary search on the answer and the check "how many pages can we print in time T". The answer is monotone — more time means more pages.',

  s10h: 'Remember',
  s10r1: 'The half-open interval [l, r) — a template that avoids off-by-one errors',
  s10r2: 'lower_bound / upper_bound — ready-made binary search in the STL',
  s10r3: 'Search for the "impossible / possible" boundary, not just an array element',
  s10r4: 'Round mid up when searching for the last valid value',
  s10cta: 'Mark the lesson as completed — you\'ve finished Level 2: Sorting and Searching!',
  s10foot: 'Up next, Level 3: stack, queue, sets, recursion, and greedy algorithms.',
};

export const binarySearch: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
