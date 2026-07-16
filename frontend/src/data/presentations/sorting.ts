import type { LessonPresentationData } from './types';

// Presentation for the "Sorting Algorithms" lesson
// (olympiad-roadmap → level-2-sorting-searching → sorting).
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

  s3h: string; s3task: string; s3lab1: string; s3lab2: string;
  s3n1: string; s3n2: string; s3n3: string;

  s4h: string; s4n1: string; s4n2: string; s4n3: string; s4run: string;

  s5h: string; s5q: string; s5t: string; s5f: string;
  s5badD: string; s5okD: string; s5mark: string;

  s6h: string; s6n1: string; s6n2: string; s6run: string;

  s7h: string; s7n1: string; s7n2: string; s7n3: string; s7cm: string; s7run: string;

  s8h: string; s8cm1: string; s8cm2: string; s8n1: string; s8n2: string; s8st: string;

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

// closestPair renders the "find the two closest numbers" demo: group 0 shows
// the array as given, group 1 the same numbers sorted, group 2 the n − 1
// neighbor differences, group 3 lights up the winning pair 37 and 40.
function closestPair(labGiven: string, labSorted: string): string {
  const orig = [12, 40, 25, 8, 37];
  const sorted = [8, 12, 25, 37, 40];
  const diffs = [4, 13, 12, 3];
  const x = (k: number) => 30 + k * 106;
  const cx = (k: number) => x(k) + 44;

  const box = (num: number, k: number, y: number, tone: 'plain' | 'sorted' | 'win') => {
    const s =
      tone === 'win'
        ? `fill="rgba(52,211,153,.15)" stroke="${C.good}" stroke-width="2"`
        : tone === 'sorted'
          ? `fill="rgba(96,165,250,.08)" stroke="rgba(96,165,250,.45)" stroke-width="1.5"`
          : `fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.14)"`;
    const f = tone === 'win' ? '#6ee7b7' : tone === 'sorted' ? '#bfdbfe' : '#cbd5e1';
    const w = tone === 'win' ? ' font-weight="700"' : '';
    return (
      `<rect x="${x(k)}" y="${y}" width="88" height="52" rx="10" ${s}/>` +
      `<text x="${cx(k)}" y="${y + 33}" text-anchor="middle" fill="${f}" font-size="20" font-family="monospace"${w}>${num}</text>`
    );
  };
  const bracket = (k: number, color: string, bold: boolean) =>
    `<path d="M ${cx(k)} 182 L ${cx(k)} 191 L ${cx(k + 1)} 191 L ${cx(k + 1)} 182" fill="none" stroke="${color}" stroke-width="1.5"/>` +
    `<text x="${(cx(k) + cx(k + 1)) / 2}" y="213" text-anchor="middle" fill="${color}" font-size="17" font-family="monospace"${bold ? ' font-weight="700"' : ''}>+${diffs[k]}</text>`;
  const label = (text: string, y: number) =>
    `<text x="30" y="${y}" fill="#7c8aa5" font-size="13">${text}</text>`;

  let g0 = label(labGiven, 16);
  orig.forEach((num, k) => (g0 += box(num, k, 24, 'plain')));
  let g1 = label(labSorted, 112);
  sorted.forEach((num, k) => (g1 += box(num, k, 120, 'sorted')));
  let g2 = '';
  for (let k = 0; k < 4; k++) g2 += bracket(k, C.warn, false);
  const g3 = box(37, 3, 120, 'win') + box(40, 4, 120, 'win') + bracket(3, C.good, true);

  return `<div class="lp-chart">
<svg viewBox="0 0 560 224" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <div class="lp-bigo" aria-hidden="true">std::sort</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── Sorting as a tool: three scenarios
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🔍</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🪙</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🎯</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── The closest pair demo (animated)
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s3task}</p>
<div class="lp-cols">
  ${closestPair(t.s3lab1, t.s3lab2)}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s3n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s3n2}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s3n3}</p></div>
  </div>
</div>`,

    // 4 ── std::sort: ascending and descending
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">int n;
std::cin &gt;&gt; n;
std::vector&lt;int&gt; a(n);
for (auto &amp;x : a) std::cin &gt;&gt; x;
</span><span class="step" data-g="1" data-a="none">
std::sort(a.begin(), a.end());
</span><span class="step" data-g="2" data-a="none">
std::sort(a.begin(), a.end(),
          [](int x, int y) { return x &gt; y; });</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s4run}</p>`,

    // 5 ── The comparator: one question, one trap
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.4rem,4.2vw,2.6rem)">${t.s5q}</div>
</div>
<div class="lp-scale" style="margin-top:14px">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">return true</span><span>${t.s5t}</span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">return false</span><span>${t.s5f}</span></div>
</div>
<div class="lp-cols" style="margin-top:14px">
  <div class="lp-card step" data-a="left"><h3>❌ <code class="lp-mini">return x &gt;= y;</code></h3><p>${t.s5badD}</p></div>
  <div class="lp-card step" data-a="right"><h3>✅ <code class="lp-mini">return x &gt; y;</code></h3><p>${t.s5okD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── Sorting structs
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">struct Student {
    std::string name;
    int score;
};
</span><span class="step" data-g="1" data-a="none">
std::sort(a.begin(), a.end(),
    [](const Student &amp;x, const Student &amp;y) {
        return x.score &gt; y.score;
    });</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s6n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s6n2}</p></div>
  </div>
</div>
<div class="lp-chips step" data-g="2">
  <span class="lp-chip" style="--c:${C.info}">Azat 90</span>
  <span class="lp-chip" style="--c:${C.info}">Aigul 98</span>
  <span class="lp-chip" style="--c:${C.info}">Bek 85</span>
  <span class="lp-arr">⇒</span>
  <span class="lp-chip" style="--c:${C.good}">Aigul 98</span>
  <span class="lp-chip" style="--c:${C.good}">Azat 90</span>
  <span class="lp-chip" style="--c:${C.good}">Bek 85</span>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s6run}</p>`,

    // 7 ── The same in Python: key
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">n = int(input())
students = []
for _ in range(n):
    name, score = input().split()
    students.append((name, int(score)))
</span><span class="step" data-g="1" data-a="none">
students.sort(key=lambda s: -s[1])
</span><span class="step" data-g="2" data-a="none">
<span class="cm"># ${t.s7cm}</span>
students.sort(key=lambda s: (-s[1], s[0]))</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s7n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s7run}</p>`,

    // 8 ── Ties: the two-condition comparator and stable_sort
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">[](const Student &amp;x, const Student &amp;y) {
    if (x.score != y.score)
        return x.score &gt; y.score; <span class="cm">// ${t.s8cm1}</span>
</span><span class="step" data-g="1" data-a="none">    return x.name &lt; y.name;       <span class="cm">// ${t.s8cm2}</span>
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s8n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s8n2}</p></div>
  </div>
</div>
<div class="lp-card lp-cta step" data-g="2"><div class="lp-emoji">📌</div><p><code class="lp-mini">std::stable_sort</code> ${t.s8st}</p></div>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">sort</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">cmp</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">struct</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">stable</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 2',
  title: 'Сортировки',
  subtitle: 'std::sort, компараторы и сортировка структур — сортировка как инструмент, а не самоцель',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Зачем сортировать? Три сценария',
  s2c1t: 'Ближайшая пара',
  s2c1d: 'После сортировки самые близкие числа — соседи.',
  s2c2t: 'Жадный выбор',
  s2c2d: 'Почти каждое жадное решение начинается со «отсортируем по...».',
  s2c3t: 'Бинарный поиск',
  s2c3d: 'Работает только на отсортированном — он ждёт вас в конце этого уровня.',
  s2mark: 'Писать сортировку руками не нужно: std::sort уже даёт O(n log n). Нужно уметь ей управлять.',

  s3h: 'Пример: два самых близких числа',
  s3task: 'Перебор всех пар — O(n²). Сортировка сводит задачу к одному проходу.',
  s3lab1: 'как дано',
  s3lab2: 'после сортировки',
  s3n1: 'Сортируем — O(n log n).',
  s3n2: 'Ближайшая пара может быть только среди соседей: между несоседями всегда лежит кто-то третий.',
  s3n3: 'Проверяем n − 1 разность — минимум и есть ответ: 37 и 40.',

  s4h: 'std::sort: по возрастанию и по убыванию',
  s4n1: 'Читаем массив: 3 1 4 1 5.',
  s4n2: 'Два итератора — начало и конец. Без третьего аргумента сортирует по возрастанию: 1 1 3 4 5.',
  s4n3: 'Третий аргумент — компаратор. Эта лямбда даёт убывание: 5 4 3 1 1.',
  s4run: 'Запустите этот код в уроке — введите 5, затем 3 1 4 1 5.',

  s5h: 'Компаратор отвечает на один вопрос',
  s5q: '«x должен стоять раньше y?»',
  s5t: 'x встанет раньше y',
  s5f: 'x не обязан стоять раньше — порядок решают остальные сравнения',
  s5badD: 'На равных элементах вернёт true — std::sort имеет право упасть или испортить массив.',
  s5okD: 'Строгое сравнение: для равных элементов — false. Так и должно быть.',
  s5mark: 'Компаратор обязан быть строгим: никогда не возвращайте true для равных элементов.',

  s6h: 'Главная сила: сортировка структур',
  s6n1: 'Структура: имя и балл. Сравниваем два целых объекта Student.',
  s6n2: 'Правило читается прямо из кода: балл больше — стоит раньше.',
  s6run: 'Запустите этот код в уроке — введите 3, затем Azat 90, Aigul 98, Bek 85.',

  s7h: 'То же самое на Python: параметр key',
  s7n1: 'key — функция «по какому значению сравнивать». Python сортирует по её результатам по возрастанию.',
  s7n2: 'Минус превращает возрастание по баллам в убывание.',
  s7n3: 'Кортеж внутри key даёт два условия сразу: по баллу вниз, при равенстве — по имени.',
  s7cm: 'два условия: балл ↓, потом имя ↑',
  s7run: 'Запустите этот код в уроке — тот же ввод.',

  s8h: 'А если баллы равны?',
  s8cm1: 'главное условие',
  s8cm2: 'при равенстве',
  s8n1: 'Сначала главное условие: баллы различаются — сравниваем баллы.',
  s8n2: 'При равных баллах включается запасное: по имени в алфавитном порядке.',
  s8st: 'сохраняет исходный порядок равных элементов — важно, когда сортируете в два прохода.',

  s9h: 'Запомнить',
  s9r1: 'std::sort — O(n log n), руками не пишем',
  s9r2: 'Компаратор — строгий ответ на «x раньше y?»',
  s9r3: 'Структуры сортируются по любому полю',
  s9r4: 'stable_sort не перемешивает равные',
  s9cta: 'Задание под уроком: отсортируйте слова по длине, а при равной длине — по алфавиту. Компаратор с двумя условиями у вас уже есть.',
  s9foot: 'Бонус: объясните себе, почему «по возрастанию» нельзя писать как return x &lt;= y.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 2-деңгээл',
  title: 'Иреттөө алгоритмдери',
  subtitle: 'std::sort, компараторлор жана структураларды иреттөө — иреттөө өзүнчө максат эмес, курал',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Эмне үчүн иреттейбиз? Үч сценарий',
  s2c1t: 'Эң жакын түгөй',
  s2c1d: 'Иреттөөдөн кийин эң жакын сандар — кошуналар.',
  s2c2t: 'Ач көз тандоо',
  s2c2d: 'Дээрлик ар бир ач көз чечим «... боюнча иреттейли» деп башталат.',
  s2c3t: 'Бинардык издөө',
  s2c3d: 'Иреттелген массивде гана иштейт — ал сизди ушул деңгээлдин аягында күтөт.',
  s2mark: 'Иреттөөнү кол менен жазуу керек эмес: std::sort O(n log n) берет. Аны башкара билүү керек.',

  s3h: 'Мисал: эң жакын эки сан',
  s3task: 'Бардык түгөйлөрдү кыдыруу — O(n²). Иреттөө маселени бир өтүүгө алып келет.',
  s3lab1: 'берилгендей',
  s3lab2: 'иреттелгенден кийин',
  s3n1: 'Иреттейбиз — O(n log n).',
  s3n2: 'Эң жакын түгөй кошуналардын арасында гана болот: кошуна эместердин ортосунда дайыма үчүнчү сан жатат.',
  s3n3: 'n − 1 айырманы текшеребиз — эң кичинеси жооп берет: 37 менен 40.',

  s4h: 'std::sort: өсүү жана кемүү боюнча',
  s4n1: 'Массивди окуйбуз: 3 1 4 1 5.',
  s4n2: 'Эки итератор — башы жана аягы. Үчүнчү аргументсиз өсүү боюнча иреттейт: 1 1 3 4 5.',
  s4n3: 'Үчүнчү аргумент — компаратор. Бул лямбда кемүүнү берет: 5 4 3 1 1.',
  s4run: 'Бул кодду сабактан иштетиңиз — 5, андан кийин 3 1 4 1 5 киргизиңиз.',

  s5h: 'Компаратор бир гана суроого жооп берет',
  s5q: '«x y’дан мурда турушу керекпи?»',
  s5t: 'x y’дан мурда турат',
  s5f: 'x мурда турууга милдеттүү эмес — тартипти калган салыштыруулар чечет',
  s5badD: 'Барабар элементтерде true кайтарат — std::sort кулап калышы же массивди бузушу мүмкүн.',
  s5okD: 'Катуу салыштыруу: барабар элементтер үчүн — false. Ушундай болушу керек.',
  s5mark: 'Компаратор катуу болууга тийиш: барабар элементтер үчүн эч качан true кайтарбаңыз.',

  s6h: 'Негизги күчү: структураларды иреттөө',
  s6n1: 'Структура: аты жана баллы. Эки бүтүн Student объектисин салыштырабыз.',
  s6n2: 'Эреже коддон түз окулат: баллы чоң — мурда турат.',
  s6run: 'Бул кодду сабактан иштетиңиз — 3, андан кийин Azat 90, Aigul 98, Bek 85 киргизиңиз.',

  s7h: 'Ушул эле нерсе Python тилинде: key параметри',
  s7n1: 'key — «эмне боюнча салыштыруу» функциясы. Python анын маанилери боюнча өсүү тартибинде иреттейт.',
  s7n2: 'Минус баллдар боюнча өсүүнү кемүүгө айлантат.',
  s7n3: 'key ичиндеги кортеж эки шартты бирден берет: балл боюнча ылдый, барабар болсо — аты боюнча.',
  s7cm: 'эки шарт: балл ↓, анан аты ↑',
  s7run: 'Бул кодду сабактан иштетиңиз — ошол эле киргизүү.',

  s8h: 'Ал эми баллдар барабар болсочу?',
  s8cm1: 'башкы шарт',
  s8cm2: 'барабар болгондо',
  s8n1: 'Адегенде башкы шарт: баллдар айырмаланса — баллдарды салыштырабыз.',
  s8n2: 'Баллдар барабар болгондо запастагысы иштейт: аты боюнча алфавит тартибинде.',
  s8st: 'барабар элементтердин баштапкы тартибин сактайт — эки өтүү менен иреттегенде маанилүү.',

  s9h: 'Эсте сакта',
  s9r1: 'std::sort — O(n log n), кол менен жазбайбыз',
  s9r2: 'Компаратор — «x мурдабы?» суроосуна катуу жооп',
  s9r3: 'Структуралар каалаган талаа боюнча иреттелет',
  s9r4: 'stable_sort барабарларды аралаштырбайт',
  s9cta: 'Сабактын астындагы тапшырма: сөздөрдү адегенде узундугу боюнча, узундуктары барабар болсо — алфавит боюнча иреттеңиз. Эки шарттуу компараторуңуз даяр.',
  s9foot: 'Бонус: «өсүү боюнча» компараторду эмнеге return x &lt;= y деп жазууга болбойт — өзүңүзгө түшүндүрүп бериңиз.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 2',
  title: 'Sorting Algorithms',
  subtitle: 'std::sort, comparators, and sorting structs — sorting as a tool, not a goal',
  press: 'Press → or Space to advance',

  s2h: 'Why sort? Three scenarios',
  s2c1t: 'Closest pair',
  s2c1d: 'After sorting, the closest numbers are neighbors.',
  s2c2t: 'Greedy choice',
  s2c2d: 'Almost every greedy solution begins with “sort by...”.',
  s2c3t: 'Binary search',
  s2c3d: 'Works only on sorted data — it awaits you at the end of this level.',
  s2mark: 'No need to write sorting by hand: std::sort already gives O(n log n). What you need is to control it.',

  s3h: 'Example: the two closest numbers',
  s3task: 'Checking all pairs is O(n²). Sorting reduces the problem to a single pass.',
  s3lab1: 'as given',
  s3lab2: 'after sorting',
  s3n1: 'Sort — O(n log n).',
  s3n2: 'The closest pair can only be neighbors: between non-neighbors there is always a third number in between.',
  s3n3: 'Check n − 1 differences — the minimum is the answer: 37 and 40.',

  s4h: 'std::sort: ascending and descending',
  s4n1: 'Read the array: 3 1 4 1 5.',
  s4n2: 'Two iterators — begin and end. Without a third argument it sorts ascending: 1 1 3 4 5.',
  s4n3: 'The third argument is a comparator. This lambda gives descending order: 5 4 3 1 1.',
  s4run: 'Run this code in the lesson — enter 5, then 3 1 4 1 5.',

  s5h: 'A comparator answers exactly one question',
  s5q: '“Should x come before y?”',
  s5t: 'x will come before y',
  s5f: 'x doesn’t have to come first — other comparisons decide the order',
  s5badD: 'Returns true on equal elements — std::sort is then allowed to crash or corrupt the array.',
  s5okD: 'Strict comparison: false for equal elements. Exactly as it should be.',
  s5mark: 'A comparator must be strict: never return true for equal elements.',

  s6h: 'The real power: sorting structs',
  s6n1: 'A struct: a name and a score. We compare two whole Student objects.',
  s6n2: 'The rule reads straight out of the code: higher score — earlier in the list.',
  s6run: 'Run this code in the lesson — enter 3, then Azat 90, Aigul 98, Bek 85.',

  s7h: 'The same in Python: the key parameter',
  s7n1: 'key is the “what to compare by” function. Python sorts ascending by its values.',
  s7n2: 'The minus turns ascending by score into descending.',
  s7n3: 'A tuple inside key gives two conditions at once: score down, ties by name.',
  s7cm: 'two conditions: score ↓, then name ↑',
  s7run: 'Run this code in the lesson — same input.',

  s8h: 'And if the scores are equal?',
  s8cm1: 'main condition',
  s8cm2: 'tie-breaker',
  s8n1: 'The main condition goes first: the scores differ — compare the scores.',
  s8n2: 'On equal scores the backup kicks in: by name, alphabetically.',
  s8st: 'preserves the original order of equal elements — important when sorting in two passes.',

  s9h: 'Remember',
  s9r1: 'std::sort — O(n log n), never write it by hand',
  s9r2: 'A comparator is a strict answer to “does x come first?”',
  s9r3: 'Structs sort by any field',
  s9r4: 'stable_sort keeps equal elements in order',
  s9cta: 'The task below the lesson: sort words by length, ties alphabetically. You already have the two-condition comparator.',
  s9foot: 'Bonus: explain to yourself why “ascending” must not be written as return x &lt;= y.',
};

export const sorting: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
