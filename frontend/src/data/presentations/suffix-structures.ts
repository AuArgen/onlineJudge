import type { LessonPresentationData } from './types';

// Presentation for the "Suffix Structures" lesson
// (olympiad-roadmap → level-6-expert → suffix-structures).
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
  s4n1: string; s4n2: string; s4n3: string; s4n4: string;

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

// doublingTable renders the exact worked example on "banana$" (positions
// 0-6): group 0 shows the characters, groups 1-3 reveal one equivalence-
// class row per doubling round (len 1, 2, 4) — by len 4 every class is
// unique, meaning the suffixes are fully ordered. Rows only ever get added,
// never rewritten, so no overlay tricks are needed here.
function doublingTable(labs: [string, string, string]): string {
  const chars = ['b', 'a', 'n', 'a', 'n', 'a', '$'];
  const cls1 = [2, 1, 3, 1, 3, 1, 0];
  const cls2 = [3, 2, 4, 2, 4, 1, 0];
  const cls4 = [4, 3, 6, 2, 5, 1, 0];
  const x = (i: number) => 16 + i * 50;
  const w = 40, h = 30;

  const row = (y: number, vals: (string | number)[], color: string, mono: boolean) =>
    vals
      .map((v, i) => {
        const cx = x(i) + w / 2;
        return (
          `<rect x="${x(i)}" y="${y}" width="${w}" height="${h}" rx="7" fill="${color}1a" stroke="${color}" stroke-width="1.6"/>` +
          `<text x="${cx}" y="${y + 20}" text-anchor="middle" fill="${color}" font-size="${mono ? 16 : 15}" font-weight="${mono ? '400' : '700'}" font-family="monospace">${v}</text>`
        );
      })
      .join('');
  const rowLabel = (y: number, text: string, color: string) =>
    `<text x="${x(7) + 6}" y="${y + 20}" fill="${color}" font-size="12" font-family="monospace">${text}</text>`;

  const g0 = row(6, chars, '#94a3b8', true);
  const g1 = row(48, cls1, C.info, false) + rowLabel(48, labs[0], C.info);
  const g2 = row(90, cls2, C.warn, false) + rowLabel(90, labs[1], C.warn);
  const g3 = row(132, cls4, C.good, false) + rowLabel(132, labs[2], C.good);

  return `<div class="lp-chart">
<svg viewBox="0 0 480 172" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <div class="lp-bigo" aria-hidden="true">suffix[]</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── What it unlocks
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🔍</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔢</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🤝</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>`,

    // 3 ── Naive vs the doubling trick
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s3line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s3mark}</span></p>`,

    // 4 ── Animated doubling trace
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
${doublingTable([t.s4n1, t.s4n2, t.s4n3])}
<div class="lp-notes" style="margin-top:2px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s4n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s4n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="none"><p>${t.s4n3}</p></div>
</div>
<div class="lp-chips step" data-g="3" style="margin-top:6px">
  <span class="lp-chip" style="--c:${C.good}">$</span>
  <span class="lp-chip" style="--c:${C.good}">a$</span>
  <span class="lp-chip" style="--c:${C.good}">ana$</span>
  <span class="lp-chip" style="--c:${C.good}">anana$</span>
  <span class="lp-chip" style="--c:${C.good}">banana$</span>
  <span class="lp-chip" style="--c:${C.good}">na$</span>
  <span class="lp-chip" style="--c:${C.good}">nana$</span>
</div>
<p class="lp-foot lp-center step" data-g="3">${t.s4n4}</p>`,

    // 5 ── Full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">for (int len = 1; len &lt; n; len *= 2) {
    auto key = [&amp;](int i) {
        return std::pair{cls[i], cls[(i+len) % n]};
    };
</span><span class="step" data-g="1" data-a="none">    std::sort(order.begin(), order.end(),
        [&amp;](int a, int b) { return key(a) &lt; key(b); });
</span><span class="step" data-g="2" data-a="none">    // пересчитать cls по новым парам
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s5run}</p>`,

    // 6 ── Unpacking the tricks
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">💲</div><h3>${t.s6c1t}</h3><p>${t.s6c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔗</div><h3>${t.s6c2t}</h3><p>${t.s6c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">⚡</div><h3>${t.s6c3t}</h3><p>${t.s6c3d}</p></div>
</div>`,

    // 7 ── What's next
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s7line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s7mark}</span></p>`,

    // 8 ── Task teaser
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🍌</div><p>${t.s8hint}</p></div>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">order[]</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">cls[]</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">$</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">O(n log n)</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 6',
  title: 'Суффиксные структуры',
  subtitle: 'Суффиксный массив: сортировка всех суффиксов строки — и что она открывает',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Что открывает суффиксный массив',
  s2c1t: 'Поиск образца',
  s2c1d: 'Любой образец находится за O(m log n) — бинарным поиском по отсортированным суффиксам.',
  s2c2t: 'Число различных подстрок',
  s2c2d: 'Сумма длин суффиксов минус сумма LCP соседних — без явного перебора всех подстрок.',
  s2c3t: 'Общая подстрока двух строк',
  s2c3d: 'Склейте строки через разделитель и ищите на общем суффиксном массиве.',

  s3h: 'Наивно — O(n² log n)',
  s3line: 'Сравнивать пары суффиксов посимвольно долго: каждое сравнение — до O(n). Классический трюк — сортировка по степеням двойки: сначала по первому символу, потом по первым двум, четырём, восьми...',
  s3mark: 'На каждом шаге суффикс описывается ПАРОЙ классов эквивалентности с прошлого шага — сравнение пары уже за O(1).',

  s4h: 'Трасса на banana$',
  s4task: 'Классы эквивалентности по длине совпадающего префикса — 1, 2, 4 символа.',
  s4n1: 'Длина 1: классы по одному символу — $ < a < b < n, повторы получают общий номер.',
  s4n2: 'Длина 2: класс = пара (класс i, класс i+1) с прошлого шага. Уже 5 разных классов вместо 4.',
  s4n3: 'Длина 4: все 7 классов различны — суффиксы уже полностью упорядочены, дальше сортировать нечего.',
  s4n4: 'Итоговый порядок ровно за 3 удвоения — log₂7 ≈ 2.8, округляем вверх.',

  s5h: 'Суффиксный массив: весь код',
  s5n1: 'На каждом шаге len удваивается. key(i) — пара классов для позиции i и позиции i+len (по кругу).',
  s5n2: 'Сортируем order по этим парам — суффиксы с одинаковым префиксом длины 2·len встают рядом.',
  s5n3: 'Пересчитываем cls: новый класс растёт только там, где пара действительно изменилась.',
  s5run: 'Запустите этот код в уроке — введите banana.',

  s6h: 'Разбор трюков',
  s6c1t: 'Терминальный $',
  s6c1d: 'Меньше любой буквы — выравнивает все суффиксы до одинаковой длины через (i + len) % n.',
  s6c2t: 'Класс эквивалентности',
  s6c2d: '«Номер группы одинаковых префиксов длины len». Пара классов полностью описывает префикс длины 2·len.',
  s6c3t: 'Счётная сортировка',
  s6c3d: 'Вместо std::sort даёт классический O(n log n) — счётчик классов ограничен n, а не произволен.',

  s7h: 'Что дальше',
  s7line: 'Массив LCP — длины общих префиксов соседних суффиксов, алгоритм Касаи считает его за O(n). С ним, например, легко получить число различных подстрок.',
  s7mark: 'Ещё мощнее — суффиксный автомат, но он ждёт вас после уверенного владения массивом.',

  s8h: 'Задание',
  s8task: 'С помощью суффиксного массива banana посчитайте руками число различных подстрок.',
  s8hint: 'Формула: сумма длин всех суффиксов минус сумма LCP соседних в массиве. Ответ: 15.',

  s9h: 'Запомнить',
  s9r1: 'order[] — позиции суффиксов в отсортированном порядке',
  s9r2: 'cls[] — классы эквивалентности, растущие с каждым удвоением len',
  s9r3: 'Терминальный $ превращает суффиксы разной длины в сравнимые по кругу',
  s9r4: 'O(n log n) со счётной сортировкой вместо std::sort',
  s9cta: 'Посчитайте число различных подстрок banana и отметьте урок пройденным.',
  s9foot: 'Дальше — вычислительная геометрия: векторное произведение, площадь и выпуклая оболочка.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 6-деңгээл',
  title: 'Суффикстик структуралар',
  subtitle: 'Суффикстик массив: саптын бардык суффикстерин иреттөө — жана анын ачкан мүмкүнчүлүктөрү',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Суффикстик массив эмнени ачат',
  s2c1t: 'Үлгүнү издөө',
  s2c1d: 'Каалаган үлгү O(m log n) убакытта табылат — иреттелген суффикстер боюнча бинардык издөө менен.',
  s2c2t: 'Ар түрдүү сапчалардын саны',
  s2c2d: 'Суффикстердин узундуктарынын суммасы минус коңшулардын LCP суммасы — бардык сапчаларды кыдырбай эле.',
  s2c3t: 'Эки саптын жалпы сапчасы',
  s2c3d: 'Саптарды бөлгүч аркылуу жабыштырып, жалпы суффикстик массивде издеңиз.',

  s3h: 'Наивдүү — O(n² log n)',
  s3line: 'Суффикс түгөйлөрүн символ-символ салыштыруу узак: ар бир салыштыруу — O(n) чейин. Классикалык ыкма — экинин даражалары боюнча иреттөө: адегенде биринчи символ боюнча, андан кийин биринчи экөө, төртөө, сегизи боюнча...',
  s3mark: 'Ар бир кадамда суффикс мурунку кадамдын эквиваленттик класстарынын ТҮГӨЙҮ менен сүрөттөлөт — түгөйдү салыштыруу эбак эле O(1).',

  s4h: 'banana$ боюнча трасса',
  s4task: 'Дал келген префикстин узундугу боюнча эквиваленттик класстар — 1, 2, 4 символ.',
  s4n1: '1 узундук: бир символ боюнча класстар — $ < a < b < n, кайталанмалар жалпы номер алат.',
  s4n2: '2 узундук: класс = мурунку кадамдагы (i позициясынын класс, i+1 позициясынын класс) түгөйү. Эбак эле 4тун ордуна 5 башка класс.',
  s4n3: '4 узундук: бардык 7 класс башка — суффикстер эбак эле толук иреттелген, ары карай иреттей турган эч нерсе жок.',
  s4n4: 'Акыркы тартип так 3 эселенүүдө — log₂7 ≈ 2.8, өйдө тегеректелет.',

  s5h: 'Суффикстик массив: толук код',
  s5n1: 'Ар бир кадамда len эки эсе өсөт. key(i) — i позициясы менен i+len позициясынын (тегерек боюнча) класстарынын түгөйү.',
  s5n2: 'order ду ушул түгөйлөр боюнча иреттейбиз — узундугу 2·len болгон бирдей префикстүү суффикстер катар турат.',
  s5n3: 'cls ти кайра эсептейбиз: жаңы класс так түгөй чындап өзгөргөн жерде гана өсөт.',
  s5run: 'Бул кодду сабактан иштетиңиз — banana киргизиңиз.',

  s6h: 'Амалдардын талдоосу',
  s6c1t: 'Терминалдык $',
  s6c1d: 'Каалаган тамгадан кичине — бардык суффикстерди (i + len) % n аркылуу бирдей узундукка теңейт.',
  s6c2t: 'Эквиваленттик класс',
  s6c2d: '«Узундугу len болгон бирдей префикстердин тобунун номери». Класстардын түгөйү узундугу 2·len болгон префиксти толук сүрөттөйт.',
  s6c3t: 'Саноо иреттөөсү',
  s6c3d: 'std::sort ордуна классикалык O(n log n) берет — класстардын эсептегичи n менен чектелген, эркин эмес.',

  s7h: 'Андан ары эмне',
  s7line: 'LCP массиви — коңшу суффикстердин жалпы префикстеринин узундуктары, аны Касаи алгоритми O(n) убакытта эсептейт. Анын жардамы менен, мисалы, ар түрдүү сапчалардын санын оңой алууга болот.',
  s7mark: 'Дагы да күчтүүсү — суффикстик автомат, бирок ал сизди массивди ишенимдүү өздөштүргөндөн кийин күтөт.',

  s8h: 'Тапшырма',
  s8task: 'banana суффикстик массивинин жардамы менен ар түрдүү сапчалардын санын кол менен эсептеңиз.',
  s8hint: 'Формула: бардык суффикстердин узундуктарынын суммасы минус массивдеги коңшулардын LCP суммасы. Жооп: 15.',

  s9h: 'Эсте сакта',
  s9r1: 'order[] — суффикстердин иреттелген тартиптеги позициялары',
  s9r2: 'cls[] — len эселенген сайын өсүп жаткан эквиваленттик класстар',
  s9r3: 'Терминалдык $ ар кандай узундуктагы суффикстерди тегерек боюнча салыштырууга мүмкүн кылат',
  s9r4: 'std::sort ордуна саноо иреттөөсү менен O(n log n)',
  s9cta: 'banana сөзүндөгү ар түрдүү сапчалардын санын эсептеп, сабакты өттүм деп белгилеңиз.',
  s9foot: 'Андан ары — эсептөө геометриясы: векторлук көбөйтүндү, аянт жана дөң кабык.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 6',
  title: 'Suffix Structures',
  subtitle: 'The suffix array: sorting every suffix of a string — and what that unlocks',
  press: 'Press → or Space to advance',

  s2h: 'What a suffix array unlocks',
  s2c1t: 'Pattern search',
  s2c1d: 'Any pattern is found in O(m log n) — binary search over the sorted suffixes.',
  s2c2t: 'The number of distinct substrings',
  s2c2d: 'The sum of suffix lengths minus the sum of neighboring LCPs — no explicit enumeration needed.',
  s2c3t: 'The common substring of two strings',
  s2c3d: 'Concatenate the strings with a separator and search on their shared suffix array.',

  s3h: 'Naive — O(n² log n)',
  s3line: 'Comparing pairs of suffixes character by character is slow: each comparison is up to O(n). The classic trick is sorting by powers of two: first by the first character, then the first two, four, eight...',
  s3mark: 'At every step a suffix is described by a PAIR of equivalence classes from the previous step — and comparing a pair is already O(1).',

  s4h: 'The trace on banana$',
  s4task: 'Equivalence classes by matching-prefix length — 1, 2, 4 characters.',
  s4n1: 'Length 1: classes by a single character — $ < a < b < n, repeats share a class number.',
  s4n2: 'Length 2: class = the pair (class of i, class of i+1) from the previous round. Already 5 distinct classes instead of 4.',
  s4n3: 'Length 4: all 7 classes are distinct — the suffixes are already fully ordered, nothing left to sort.',
  s4n4: 'The final order in exactly 3 doublings — log₂7 ≈ 2.8, rounded up.',

  s5h: 'The suffix array: the full code',
  s5n1: 'Every round, len doubles. key(i) is the pair of classes for position i and position i+len (wrapping around).',
  s5n2: 'Sort order by these pairs — suffixes sharing a prefix of length 2·len end up next to each other.',
  s5n3: 'Recompute cls: the new class grows only where the pair actually changed.',
  s5run: 'Run this code in the lesson — enter banana.',

  s6h: 'Unpacking the tricks',
  s6c1t: 'The terminal $',
  s6c1d: 'Smaller than every letter — evens all suffixes out to the same length via (i + len) % n.',
  s6c2t: 'An equivalence class',
  s6c2d: '"The group number of equal prefixes of length len." A pair of classes fully describes a prefix of length 2·len.',
  s6c3t: 'Counting sort',
  s6c3d: 'In place of std::sort it gives the classic O(n log n) — the class count is bounded by n, not arbitrary.',

  s7h: "What's next",
  s7line: "The LCP array — the lengths of common prefixes of neighboring suffixes, computed by Kasai's algorithm in O(n). With it you can, for instance, easily get the number of distinct substrings.",
  s7mark: 'Even more powerful is the suffix automaton, but it awaits you once you own the array confidently.',

  s8h: 'Task',
  s8task: "Using the suffix array of banana, count the distinct substrings by hand.",
  s8hint: 'The formula: the sum of all suffix lengths minus the sum of neighboring LCPs in the array. Answer: 15.',

  s9h: 'Remember',
  s9r1: 'order[] — the suffix positions in sorted order',
  s9r2: 'cls[] — equivalence classes, growing finer with every doubling of len',
  s9r3: 'The terminal $ lets suffixes of different lengths be compared cyclically',
  s9r4: 'O(n log n) with counting sort in place of std::sort',
  s9cta: 'Count the number of distinct substrings of banana and mark the lesson as completed.',
  s9foot: 'Next up: computational geometry — the cross product, area, and the convex hull.',
};

export const suffixStructures: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
