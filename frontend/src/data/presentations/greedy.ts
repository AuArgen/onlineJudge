import type { LessonPresentationData } from './types';

// Presentation for the "Greedy Algorithms" lesson
// (olympiad-roadmap → level-3-data-structures → greedy).
// Slide structure is single-sourced in buildSlides(); the three language
// tables below carry only the strings.

interface L {
  kicker: string;
  title: string;
  subtitle: string;
  press: string;

  s2h: string; s2okT: string; s2okD: string; s2badT: string; s2badD: string; s2mark: string;

  s3h: string; s3task: string;
  s3n1: string; s3n2: string; s3n3: string; s3n4: string;

  s4h: string; s4n1: string; s4n2: string; s4n3: string; s4run: string;

  s5h: string; s5line: string; s5mark: string;

  s6h: string; s6task: string;
  s6badT: string; s6okT: string; s6mark: string;

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

// intervalTimeline renders the "earliest end first" greedy trace on the
// intervals (1,3) (2,5) (4,7) (6,8), already sorted by end (top to bottom).
// Each reveal group either paints a bar green (taken) or red-dims it
// (skipped, overlaps the last taken end) and moves the lastEnd marker —
// the overlay-redraw technique used throughout this series.
function intervalTimeline(): string {
  const segs = [
    { s: 1, e: 3 },
    { s: 2, e: 5 },
    { s: 4, e: 7 },
    { s: 6, e: 8 },
  ];
  const x = (v: number) => 30 + v * 58;
  const rowY = (i: number) => 14 + i * 38;
  const barH = 26;
  const axisY = 170;

  const axis = () => {
    let s = `<line x1="${x(0)}" y1="${axisY}" x2="${x(8)}" y2="${axisY}" stroke="rgba(255,255,255,.2)"/>`;
    for (let v = 0; v <= 8; v++) {
      s += `<line x1="${x(v)}" y1="${axisY}" x2="${x(v)}" y2="${axisY + 5}" stroke="rgba(255,255,255,.2)"/>`;
      s += `<text x="${x(v)}" y="${axisY + 18}" text-anchor="middle" fill="#64748b" font-size="11" font-family="monospace">${v}</text>`;
    }
    return s;
  };

  const bar = (i: number, tone: 'plain' | 'take' | 'skip') => {
    const seg = segs[i];
    const y = rowY(i);
    const style =
      tone === 'take'
        ? `fill="rgba(52,211,153,.22)" stroke="${C.good}" stroke-width="2"`
        : tone === 'skip'
          ? `fill="rgba(248,113,113,.14)" stroke="${C.bad}" stroke-width="1.5" stroke-dasharray="4 3"`
          : `fill="rgba(96,165,250,.1)" stroke="rgba(96,165,250,.5)" stroke-width="1.5"`;
    const f = tone === 'take' ? '#6ee7b7' : tone === 'skip' ? '#fca5a5' : '#bfdbfe';
    return (
      `<rect x="${x(seg.s)}" y="${y}" width="${x(seg.e) - x(seg.s)}" height="${barH}" rx="8" ${style}/>` +
      `<text x="${(x(seg.s) + x(seg.e)) / 2}" y="${y + 18}" text-anchor="middle" fill="${f}" font-size="13" font-family="monospace">${seg.s}–${seg.e}</text>`
    );
  };

  const marker = (v: number, color: string, label: string) =>
    `<line x1="${x(v)}" y1="6" x2="${x(v)}" y2="${axisY}" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 3"/>` +
    `<text x="${x(v) + 4}" y="14" fill="${color}" font-size="11" font-family="monospace">${label}</text>`;

  const g0 = [0, 1, 2, 3].map((i) => bar(i, 'plain')).join('') + axis();
  const g1 = bar(0, 'take') + marker(3, C.good, 'lastEnd=3');
  const g2 = bar(1, 'skip');
  const g3 = bar(2, 'take') + marker(7, C.good, 'lastEnd=7');
  const g4 = bar(3, 'skip');

  return `<div class="lp-chart">
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
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
  <div class="lp-bigo" aria-hidden="true">greedy</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The idea: local choice, two possible outcomes
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>✅ ${t.s2okT}</h3><p>${t.s2okD}</p></div>
  <div class="lp-card step" data-a="right"><h3>❌ ${t.s2badT}</h3><p>${t.s2badD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── Animated: max non-overlapping intervals
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s3task}</p>
<div class="lp-cols">
  ${intervalTimeline()}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s3n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s3n2}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s3n3}</p></div>
    <div class="lp-card step" data-g="4" data-a="right"><p>${t.s3n4}</p></div>
  </div>
</div>`,

    // 4 ── The full code
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::sort(seg.begin(), seg.end()); <span class="cm">// по концу</span>
</span><span class="step" data-g="1" data-a="none">
int count = 0, lastEnd = -INF;
for (auto &amp;s : seg) {
</span><span class="step" data-g="2" data-a="none">    if (s.second &gt;= lastEnd) {
        count++;
        lastEnd = s.first;
    }
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s4run}</p>`,

    // 5 ── Why "earliest end" is correct
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s5line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── Counter-example: greedy coins fail
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s6task}</p>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>❌ ${t.s6badT}</h3>
    <div class="lp-chips" style="margin-top:8px">
      <span class="lp-chip" style="--c:${C.bad}">4</span>
      <span class="lp-chip" style="--c:${C.bad}">1</span>
      <span class="lp-chip" style="--c:${C.bad}">1</span>
    </div>
  </div>
  <div class="lp-card step" data-a="right"><h3>✅ ${t.s6okT}</h3>
    <div class="lp-chips" style="margin-top:8px">
      <span class="lp-chip" style="--c:${C.good}">3</span>
      <span class="lp-chip" style="--c:${C.good}">3</span>
    </div>
  </div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Signs greedy might work
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🔀</div><h3>${t.s7c1t}</h3><p>${t.s7c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔮</div><h3>${t.s7c2t}</h3><p>${t.s7c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🔁</div><h3>${t.s7c3t}</h3><p>${t.s7c3d}</p></div>
</div>`,

    // 8 ── Task teaser: joining ropes
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🧵</div><p>${t.s8hint}</p></div>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">локально</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">обмен</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">монеты 1,3,4</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">без пересмотра</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 3',
  title: 'Жадные алгоритмы',
  subtitle: 'Локально лучший шаг без права передумать — иногда лучшее решение, иногда ловушка',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Один шаг — два возможных исхода',
  s2okT: 'Жадность верна',
  s2okD: 'Получается самое быстрое и короткое решение из всех возможных.',
  s2badT: 'Жадность неверна',
  s2badD: 'Алгоритм уверенно выдаёт неправильный ответ, даже не подозревая об этом.',
  s2mark: 'Правило одно: сделал выбор — никогда к нему не возвращайся. Вопрос в том, можно ли так делать.',

  s3h: 'Эталон: максимум непересекающихся',
  s3task: '4 мероприятия, отсортированные по концу. Берём самое раннее по концу, что не пересекается с уже взятым.',
  s3n1: 'Отрезки уже отсортированы по концу — это первый шаг почти любой жадности.',
  s3n2: '1–3 берём первым: начало не позже текущего lastEnd, конец сдвигает границу на 3.',
  s3n3: '2–5 начинается раньше 3 — пересекается с уже взятым, пропускаем без сожалений.',
  s3n4: '4–7 начинается не раньше 3 — берём, граница сдвигается на 7. 6–8 начинается раньше 7 — пропускаем. Итог: 2.',

  s4h: 'Непересекающиеся интервалы: весь код',
  s4n1: 'Сортировка по концу — единственная подготовка, которая нужна.',
  s4n2: 'lastEnd — конец последнего взятого отрезка. Начинаем с «минус бесконечности».',
  s4n3: 'Начало не раньше lastEnd — берём и сдвигаем границу. Иначе — молча пропускаем.',
  s4run: 'Запустите этот код в уроке — введите 4, затем пары 1 3, 2 5, 4 7, 6 8.',

  s5h: 'Почему «ранний конец» — это доказательство',
  s5line: 'Пусть оптимальный ответ взял первым какое-то другое мероприятие. Заменим его на мероприятие с самым ранним концом — оно закончится не позже, значит, всё остальное расписание останется допустимым. Ответ не ухудшился.',
  s5mark: 'Это и есть «обменное рассуждение» — стандартное доказательство корректности жадности.',

  s6h: 'Когда жадность подводит',
  s6task: 'Монеты номиналом 1, 3 и 4. Нужно набрать 6.',
  s6badT: 'Жадно: всегда самая крупная',
  s6okT: 'На самом деле оптимально',
  s6mark: 'Три монеты против двух — жадность проиграла. Для таких систем монет нужна динамика, а не жадность.',

  s7h: 'Признаки, что жадность МОЖЕТ сработать',
  s7c1t: 'Сортировка напрашивается',
  s7c1d: 'Задача явно просит расставить элементы по какому-то порядку.',
  s7c2t: 'Выбор не ограничивает будущее',
  s7c2d: 'Текущее решение не хуже любого другого связывает руки на следующих шагах.',
  s7c3t: 'Обменное рассуждение получается',
  s7c3d: 'Можно набросать: «заменим любой другой выбор на жадный — станет не хуже».',

  s8h: 'Задание для проверки себя',
  s8task: 'Даны длины n верёвок. Соединять две верёвки стоит сумму их длин. Нужно соединить все в одну с минимальной суммарной стоимостью.',
  s8hint: 'Докажите (или опровергните на маленьком тесте), что жадное соединение двух самых коротких верёвок каждый раз даёт минимум. Проверьте перебором для n = 4.',

  s9h: 'Запомнить',
  s9r1: 'Жадность делает локально лучший выбор и никогда не пересматривает',
  s9r2: 'Доказывается обменным рассуждением: замена на жадный выбор не ухудшает ответ',
  s9r3: 'Контрпример 1, 3, 4 → 6: жадность даёт 3 монеты, оптимум — 2',
  s9r4: 'Сортировка почти всегда первый шаг правильной жадности',
  s9cta: 'Проверьте гипотезу про верёвки перебором для n = 4 и отметьте урок пройденным.',
  s9foot: 'Дальше — DSU: почти O(1) объединение групп и проверка «в одной ли они».',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 3-деңгээл',
  title: 'Ач көз алгоритмдер',
  subtitle: 'Кайра ойлонууга укугу жок жергиликтүү эң жакшы кадам — кээде эң мыкты чечим, кээде тузак',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Бир кадам — эки мүмкүн болгон жыйынтык',
  s2okT: 'Ач көздүк туура',
  s2okD: 'Мүмкүн болгон эң тез жана эң кыска чечим чыгат.',
  s2badT: 'Ач көздүк туура эмес',
  s2badD: 'Алгоритм өзү да билбей туруп ишенимдүү туура эмес жооп берет.',
  s2mark: 'Эреже бир гана: тандоо жасадың — ага эч качан кайтпа. Маселе — муну качан кылса болорун билүү.',

  s3h: 'Эталон: кесилишпегендердин максимуму',
  s3task: '4 иш-чара, аягы боюнча иреттелген. Мурда алынган менен кесилишпеген, эң эрте бүткөндү алабыз.',
  s3n1: 'Кесиндилер аягы боюнча эбак эле иреттелген — бул дээрлик ар кандай ач көздүктүн биринчи кадамы.',
  s3n2: '1–3 тү биринчи алабыз: башталышы учурдагы lastEnd тен кийин эмес, аягы чекти 3кө жылдырат.',
  s3n3: '2–5 3 тен мурда башталат — мурда алынган менен кесилишет, өкүнбөй өткөрүп жиберебиз.',
  s3n4: '4–7 3 тен мурда башталбайт — алабыз, чек 7ге жылат. 6–8 7ден мурда башталат — өткөрүп жиберебиз. Жыйынтык: 2.',

  s4h: 'Кесилишпеген интервалдар: толук код',
  s4n1: 'Аягы боюнча иреттөө — керек болгон жападан-жалгыз даярдык.',
  s4n2: 'lastEnd — акыркы алынган кесиндинин аягы. «Минус чексиздиктен» баштайбыз.',
  s4n3: 'Башталышы lastEnd тен мурда эмес — алабыз да чекти жылдырабыз. Антпесе — унчукпай өткөрүп жиберебиз.',
  s4run: 'Бул кодду сабактан иштетиңиз — 4, андан кийин 1 3, 2 5, 4 7, 6 8 түгөйлөрүн киргизиңиз.',

  s5h: 'Эмнеге «эрте аягы» — далил',
  s5line: 'Оптималдуу жооп биринчи башка бир иш-чараны алды дейли. Аны эң эрте бүткөн иш-чарага алмаштыралы — ал андан кеч эмес бүтөт, демек калган график жараксыз болбойт. Жооп начарлаган жок.',
  s5mark: 'Бул дал «алмаштыруу жүйөсү» — ач көздүктүн тууралыгынын стандарттуу далили.',

  s6h: 'Ач көздүк качан жаңылат',
  s6task: 'Номиналы 1, 3 жана 4 болгон монеталар. 6 чогултуу керек.',
  s6badT: 'Ач көздүк: дайыма эң чоңу',
  s6okT: 'Чындыгында оптималдуу',
  s6mark: 'Эки монетага каршы үч — ач көздүк жеңилди. Мындай монета системалары үчүн ач көздүк эмес, динамика керек.',

  s7h: 'Ач көздүктүн иштеши МҮМКҮН экендигинин белгилери',
  s7c1t: 'Иреттөө өзүнөн өзү суранат',
  s7c1d: 'Маселе элементтерди белгилүү бир тартипте коюуну ачык суранат.',
  s7c2t: 'Тандоо келечекти чектебейт',
  s7c2d: 'Учурдагы чечим кийинки кадамдарда башка тандоолордон катуураак кол-бутту байлабайт.',
  s7c3t: 'Алмаштыруу жүйөсү чыгат',
  s7c3d: 'Мындай деп чийип чыгууга болот: «башка каалаган тандоону ач көз тандоого алмаштырсак — начарлабайт».',

  s8h: 'Өзүңдү текшерүү үчүн тапшырма',
  s8task: 'n аркандын узундугу берилген. Эки арканды бириктирүү алардын узундуктарынын суммасына турат. Баарын минималдуу жалпы наркы менен бирге бириктирүү керек.',
  s8hint: 'Ар дайым эң кыска эки арканды ач көздүк менен бириктирүү минимумду берерин далилдеңиз (же кичине тестте четке кагыңыз). n = 4 үчүн толук кыдыруу менен өзүңүздү текшериңиз.',

  s9h: 'Эсте сакта',
  s9r1: 'Ач көздүк жергиликтүү эң жакшы тандоону жасайт жана эч качан кайра карабайт',
  s9r2: 'Алмаштыруу жүйөсү менен далилденет: ач көз тандоого алмаштыруу жоопту начарлатпайт',
  s9r3: '1, 3, 4 → 6 каршы мисалы: ач көздүк 3 монета берет, оптимум — 2',
  s9r4: 'Иреттөө дээрлик ар дайым туура ач көздүктүн биринчи кадамы',
  s9cta: 'Аркандар жөнүндөгү божомолду n = 4 үчүн толук кыдыруу менен текшериңиз жана сабакты өттүм деп белгилеңиз.',
  s9foot: 'Андан ары — DSU: топторду дээрлик O(1) убакытта бириктирүү жана «алар бир топтобу» текшерүүсү.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 3',
  title: 'Greedy Algorithms',
  subtitle: 'The locally best step with no right to reconsider — sometimes the best solution, sometimes a trap',
  press: 'Press → or Space to advance',

  s2h: 'One step, two possible outcomes',
  s2okT: 'Greed is correct',
  s2okD: 'You get the fastest and shortest solution possible.',
  s2badT: 'Greed is incorrect',
  s2badD: 'The algorithm confidently outputs a wrong answer, with no idea anything went wrong.',
  s2mark: 'The rule is one: make a choice, never revisit it. The question is whether that\'s allowed here.',

  s3h: 'The benchmark: max non-overlapping intervals',
  s3task: '4 events, sorted by end. Take the one that ends earliest and doesn\'t overlap what\'s already taken.',
  s3n1: 'The segments are already sorted by end — the first step of almost any greedy algorithm.',
  s3n2: 'Take 1–3 first: its start is no later than the current lastEnd, its end moves the boundary to 3.',
  s3n3: '2–5 starts before 3 — it overlaps what was just taken, skip it without regret.',
  s3n4: '4–7 doesn\'t start before 3 — take it, the boundary moves to 7. 6–8 starts before 7 — skip it. Total: 2.',

  s4h: 'Non-overlapping intervals: the full code',
  s4n1: 'Sorting by end is the only preparation needed.',
  s4n2: 'lastEnd is the end of the last taken segment. Start at "minus infinity".',
  s4n3: 'A start no earlier than lastEnd — take it and move the boundary. Otherwise, silently skip it.',
  s4run: 'Run this code in the lesson — enter 4, then the pairs 1 3, 2 5, 4 7, 6 8.',

  s5h: 'Why "earliest end" is a proof',
  s5line: 'Suppose the optimal answer took some other event first. Replace it with the earliest-ending event — it finishes no later, so the rest of the schedule stays valid. The answer did not get worse.',
  s5mark: 'This is the "exchange argument" — the standard proof of correctness for greedy algorithms.',

  s6h: 'When greed lets you down',
  s6task: 'Coins of denominations 1, 3, and 4. You need to make 6.',
  s6badT: 'Greedy: always the largest',
  s6okT: 'Actually optimal',
  s6mark: 'Three coins against two — greed lost. Coin systems like this need dynamic programming, not greed.',

  s7h: 'Signs that greedy MIGHT work',
  s7c1t: 'Sorting suggests itself',
  s7c1d: 'The problem is clearly asking you to order the elements by something.',
  s7c2t: 'The choice doesn\'t constrain the future',
  s7c2d: 'The current decision doesn\'t tie your hands any harder than any other choice would at future steps.',
  s7c3t: 'An exchange argument sketches out',
  s7c3d: 'You can outline: "swap any other choice for the greedy one — it won\'t get worse".',

  s8h: 'A task to test yourself',
  s8task: 'Given the lengths of n ropes, joining two ropes costs the sum of their lengths. Join them all into one with minimum total cost.',
  s8hint: 'Prove (or disprove on a small test) that greedily joining the two shortest ropes every time gives the minimum. Check yourself by brute force for n = 4.',

  s9h: 'Remember',
  s9r1: 'Greedy makes the locally best choice and never reconsiders',
  s9r2: 'Proved by an exchange argument: swapping in the greedy choice never makes the answer worse',
  s9r3: 'Counterexample 1, 3, 4 → 6: greedy gives 3 coins, the optimum is 2',
  s9r4: 'Sorting is almost always the first step of a correct greedy',
  s9cta: 'Check the rope-joining hypothesis by brute force for n = 4 and mark the lesson as completed.',
  s9foot: 'Next up: DSU — merging groups and checking "are they in the same one" in almost O(1).',
};

export const greedy: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
