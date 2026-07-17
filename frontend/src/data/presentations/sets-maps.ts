import type { LessonPresentationData } from './types';

// Presentation for the "Sets and Maps" lesson
// (olympiad-roadmap → level-3-data-structures → sets-maps).
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
  s4n1: string; s4n2: string; s4n3: string; s4n4: string;

  s5h: string; s5n1: string; s5n2: string; s5n3: string; s5run: string;

  s6h: string; s6task: string;
  s6n1: string; s6n2: string; s6mark: string;

  s7h: string; s7n1: string; s7n2: string; s7n3: string; s7run: string;

  s8h: string;
  s8c1t: string; s8c1d: string;
  s8c2t: string; s8c2d: string;
  s8c3t: string; s8c3d: string;

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

// firstRepeatTrace renders the "first repeated element" trace on the stream
// 3 1 4 1 5 9: the stream sits on top as 6 fixed boxes, a "seen" area below
// fills with one chip per new value (purely additive — a set never needs to
// un-reveal anything). The final group rings the repeat and draws a dashed
// arc back to the matching chip already in the set.
function firstRepeatTrace(lab1: string, lab2: string, lab3: string, lab4: string): string {
  const stream = [3, 1, 4, 1, 5, 9];
  const ix = (k: number) => 20 + k * 58;
  const icx = (k: number) => ix(k) + 22;
  const iy = 12, iw = 44;

  const inBox = (k: number, dim: boolean) =>
    `<rect x="${ix(k)}" y="${iy}" width="${iw}" height="${iw}" rx="9" fill="${dim ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.03)'}" stroke="${dim ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.16)'}"/>` +
    `<text x="${icx(k)}" y="${iy + 29}" text-anchor="middle" fill="${dim ? '#475569' : '#cbd5e1'}" font-size="19" font-family="monospace">${stream[k]}</text>`;
  const ring = (k: number, color: string) =>
    `<rect x="${ix(k) - 3}" y="${iy - 3}" width="${iw + 6}" height="${iw + 6}" rx="11" fill="none" stroke="${color}" stroke-width="2.5"/>`;

  const seenY = 96, seenH = 44;
  const seenSlot = (i: number) => ({ x: 30 + i * 78, y: seenY, w: 64 });
  const label = (text: string, color: string, y: number) =>
    `<text x="20" y="${y}" fill="${color}" font-size="14" font-family="monospace">${text}</text>`;
  const chip = (i: number, val: number, color: string) => {
    const s = seenSlot(i);
    return (
      `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${seenH}" rx="10" fill="${color}1f" stroke="${color}" stroke-width="2"/>` +
      `<text x="${s.x + s.w / 2}" y="${s.y + 29}" text-anchor="middle" fill="${color}" font-size="20" font-weight="700" font-family="monospace">${val}</text>`
    );
  };

  const g0 =
    [0, 1, 2, 3, 4, 5].map((k) => inBox(k, false)).join('') +
    `<rect x="12" y="${seenY - 22}" width="330" height="1" fill="rgba(255,255,255,.1)"/>` +
    label('seen = { }', '#64748b', seenY - 8);

  const g1 = ring(0, C.acc) + chip(0, 3, C.acc) + label(lab1, C.acc, seenY + seenH + 20);
  const g2 = ring(1, C.info) + chip(1, 1, C.info) + label(lab2, C.info, seenY + seenH + 20);
  const g3 = ring(2, C.warn) + chip(2, 4, C.warn) + label(lab3, C.warn, seenY + seenH + 20);
  const s1 = seenSlot(1);
  const g4 =
    ring(3, C.bad) +
    `<rect x="${s1.x - 3}" y="${s1.y - 3}" width="${s1.w + 6}" height="${seenH + 6}" rx="12" fill="none" stroke="${C.bad}" stroke-width="2.5"/>` +
    `<path d="M ${icx(3)} ${iy + iw} C ${icx(3)} ${seenY - 10}, ${s1.x + s1.w / 2} ${seenY - 10}, ${s1.x + s1.w / 2} ${s1.y}" fill="none" stroke="${C.bad}" stroke-width="2" stroke-dasharray="5 4"/>` +
    label(lab4, C.bad, seenY + seenH + 20);

  return `<div class="lp-chart">
<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
  <g class="step" data-a="none" data-g="3">${g3}</g>
  <g class="step" data-a="none" data-g="4">${g4}</g>
</svg>
</div>`;
}

// freqTable renders the word-frequency count on "apple banana apple cherry
// banana": the stream sits on top, three fixed columns (already alphabetical
// — the order std::map would iterate them in) accumulate counts below.
// Counts that change are simply redrawn on top of the previous value
// (the same overlay technique as the stack-queue deck).
function freqTable(lab1: string, lab2: string): string {
  const words = ['apple', 'banana', 'apple', 'cherry', 'banana'];
  const wx = (k: number) => 10 + k * 108;
  const wcx = (k: number) => wx(k) + 46;
  const wy = 10, ww = 92, wh = 32;

  const wordBox = (k: number) =>
    `<rect x="${wx(k)}" y="${wy}" width="${ww}" height="${wh}" rx="8" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.16)"/>` +
    `<text x="${wcx(k)}" y="${wy + 21}" text-anchor="middle" fill="#cbd5e1" font-size="14" font-family="monospace">${words[k]}</text>`;
  const ring = (k: number, color: string) =>
    `<rect x="${wx(k) - 3}" y="${wy - 3}" width="${ww + 6}" height="${wh + 6}" rx="10" fill="none" stroke="${color}" stroke-width="2.5"/>`;

  const cols = ['apple', 'banana', 'cherry'];
  const colX = (i: number) => 30 + i * 172;
  const colY = 70, colW = 148, colH = 60;
  const colBase = (i: number) =>
    `<rect x="${colX(i)}" y="${colY}" width="${colW}" height="${colH}" rx="12" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.16)"/>` +
    `<text x="${colX(i) + colW / 2}" y="${colY + 24}" text-anchor="middle" fill="#94a3b8" font-size="15" font-family="monospace">${cols[i]}</text>`;
  const colCount = (i: number, val: number, color: string) =>
    `<rect x="${colX(i) + 8}" y="${colY + 30}" width="${colW - 16}" height="26" rx="7" fill="${color}22"/>` +
    `<text x="${colX(i) + colW / 2}" y="${colY + 49}" text-anchor="middle" fill="${color}" font-size="18" font-weight="700" font-family="monospace">${val}</text>`;

  const g0 = [0, 1, 2, 3, 4].map(wordBox).join('') + [0, 1, 2].map(colBase).join('');
  const g1 = ring(0, C.info) + ring(1, C.info) + colCount(0, 1, C.info) + colCount(1, 1, C.info) +
    `<text x="30" y="152" fill="${C.info}" font-size="14" font-family="monospace">${lab1}</text>`;
  const g2 = ring(2, C.warn) + ring(3, C.warn) + ring(4, C.good) +
    colCount(0, 2, C.warn) + colCount(2, 1, C.warn) + colCount(1, 2, C.good) +
    `<text x="30" y="152" fill="${C.good}" font-size="14" font-family="monospace">${lab2}</text>`;

  return `<div class="lp-chart">
<svg viewBox="0 0 550 160" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">set · map</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The problem: membership checks
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>❌ ${t.s2bad}</h3><p>${t.s2badD}</p></div>
  <div class="lp-card step" data-a="right"><h3>✅ ${t.s2good}</h3><p>${t.s2goodD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── Three tools
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🗂️</div><h3>${t.s3c1t}</h3><p>${t.s3c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">📖</div><h3>${t.s3c2t}</h3><p>${t.s3c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">⚡</div><h3>${t.s3c3t}</h3><p>${t.s3c3d}</p></div>
</div>`,

    // 4 ── Animated: first repeated element
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
<div class="lp-cols">
  ${firstRepeatTrace(t.s4n1, t.s4n2, t.s4n3, t.s4n4)}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s4n3}</p></div>
    <div class="lp-card step" data-g="4" data-a="right"><p>${t.s4n4}</p></div>
  </div>
</div>`,

    // 5 ── First repeat: full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::set&lt;int&gt; seen;
for (int i = 0; i &lt; n; i++) {
    std::cin &gt;&gt; x;
</span><span class="step" data-g="1" data-a="none">    if (seen.count(x)) {
        std::cout &lt;&lt; "Первый повтор: " &lt;&lt; x;
        return 0;
    }
</span><span class="step" data-g="2" data-a="none">    seen.insert(x);
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s5run}</p>`,

    // 6 ── Animated: word frequency with map
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s6task}</p>
${freqTable(t.s6n1, t.s6n2)}
<p class="lp-p lp-center step" data-g="2"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Word frequency: full code
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::map&lt;std::string, int&gt; count;
for (int i = 0; i &lt; n; i++) {
    std::cin &gt;&gt; w;
    count[w]++;
</span><span class="step" data-g="1" data-a="none">}
</span><span class="step" data-g="2" data-a="none">for (auto &amp;p : count)
    std::cout &lt;&lt; p.first &lt;&lt; ": " &lt;&lt; p.second &lt;&lt; "\\n";</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s7n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s7run}</p>`,

    // 8 ── Choosing the right tool
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🔢</div><h3>${t.s8c1t}</h3><p>${t.s8c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🚀</div><h3>${t.s8c2t}</h3><p>${t.s8c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">👯</div><h3>${t.s8c3t}</h3><p>${t.s8c3d}</p></div>
</div>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">set</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">map</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">unordered_*</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">O(log n)</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 3',
  title: 'Множества и словари: set и map',
  subtitle: 'Проверка «встречалось ли это раньше» и подсчёт частот — O(log n) вместо перебора',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: '«Встречалось ли это число?»',
  s2bad: 'Перебором массива',
  s2badD: 'O(n) на каждую проверку — при n проверках это уже O(n²).',
  s2good: 'set / map — сбалансированное дерево',
  s2goodD: 'Внутри данные уже отсортированы деревом — каждая проверка O(log n).',
  s2mark: 'Тот же вопрос, что и в бинарном поиске: «есть ли это здесь?» — только структура ищет сама.',

  s3h: 'Три инструмента',
  s3c1t: 'std::set',
  s3c1d: 'Множество уникальных элементов: insert, count, erase. Хранит их отсортированными.',
  s3c2t: 'std::map',
  s3c2d: 'Словарь «ключ → значение»: count[x]++ сам создаёт ключ с нулём при первом обращении.',
  s3c3t: 'unordered_set / unordered_map',
  s3c3d: 'Хеш-версии со средним O(1) — быстрее, но без сортированности.',

  s4h: 'Первый повторившийся элемент',
  s4task: 'Поток 3 1 4 1 5 9. Идём слева направо, запоминая увиденное в set.',
  s4n1: '3 — нового такого нет в seen. Добавляем.',
  s4n2: '1 — нового такого нет. Добавляем.',
  s4n3: '4 — нового такого нет. Добавляем.',
  s4n4: '1 — уже есть в seen! Первый повтор найден, дальше можно не смотреть.',

  s5h: 'Первый повтор: весь код',
  s5n1: 'Читаем поток по одному числу — set не требует знать размер заранее.',
  s5n2: 'count(x) — есть ли x в множестве. Нашли — сразу выводим и выходим.',
  s5n3: 'Не нашли — запоминаем на будущее и идём к следующему числу.',
  s5run: 'Запустите этот код в уроке — введите 6, затем 3 1 4 1 5 9.',

  s6h: 'map для подсчёта частот',
  s6task: 'Слова apple banana apple cherry banana. Один проход — три счётчика.',
  s6n1: 'apple и banana — оба впервые: count становится 1 у каждого.',
  s6n2: 'apple снова — 2. cherry впервые — 1. banana снова — 2.',
  s6mark: 'Проход по map выдаёт ключи отсортированными — apple, banana, cherry сами встали по алфавиту.',

  s7h: 'Частоты слов: весь код',
  s7n1: 'count[w]++ — если ключа w ещё нет, map создаёт его с нулём и сразу прибавляет единицу.',
  s7n2: 'Не нужно проверять «есть ли уже такое слово» отдельно — map делает это сам.',
  s7n3: 'Проход for (auto &p : count) идёт по ключам в отсортированном порядке.',
  s7run: 'Запустите этот код в уроке — введите 5, затем apple banana apple cherry banana.',

  s8h: 'Как выбрать инструмент',
  s8c1t: 'Нужна сортированность',
  s8c1d: 'Или «ближайший элемент» — берите set / map.',
  s8c2t: 'Нужна только скорость',
  s8c2d: 'Порядок не важен — берите unordered_set / unordered_map.',
  s8c3t: 'Нужны повторы',
  s8c3d: 'Один и тот же элемент несколько раз — берите multiset.',

  s9h: 'Запомнить',
  s9r1: 'set — уникальные элементы, отсортированы, O(log n)',
  s9r2: 'map — ключ → значение, count[x]++ создаёт сам',
  s9r3: 'unordered_* — быстрее (O(1) в среднем), но без порядка',
  s9r4: 'Внутри — сбалансированное дерево, поэтому не перебор',
  s9cta: 'Решите прикреплённую задачу: выведите числа, встретившиеся ровно один раз, по возрастанию.',
  s9foot: 'Дальше — рекурсия и полный перебор: как обойти все варианты и не запутаться.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 3-деңгээл',
  title: 'Көптүктөр жана сөздүктөр: set жана map',
  subtitle: '«Бул мурда кездешти беле» текшерүүсү жана жыштыктарды эсептөө — кыдыруунун ордуна O(log n)',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: '«Бул сан мурда кездешти беле?»',
  s2bad: 'Массивди кыдырып',
  s2badD: 'Ар бир текшерүүгө O(n) — n текшерүүдө бул дал O(n²) болуп калат.',
  s2good: 'set / map — тең салмактанган дарак',
  s2goodD: 'Ичинде маалымат дарак менен иреттелип турат — ар бир текшерүү O(log n).',
  s2mark: 'Бинардык издөөдөгү эле суроо: «бул ушул жерде барбы?» — бирок структура өзү издейт.',

  s3h: 'Үч курал',
  s3c1t: 'std::set',
  s3c1d: 'Уникалдуу элементтердин көптүгү: insert, count, erase. Аларды иреттелген түрдө сактайт.',
  s3c2t: 'std::map',
  s3c2d: '«Ачкыч → маани» сөздүгү: count[x]++ биринчи кайрылууда эле ачкычты нөл менен өзү түзөт.',
  s3c3t: 'unordered_set / unordered_map',
  s3c3d: 'Орточо O(1) убакыттагы хеш-версиялар — тезирээк, бирок иреттелгендиги жок.',

  s4h: 'Биринчи кайталанган элемент',
  s4task: '3 1 4 1 5 9 агымы. Солдон оңго жүрүп, көргөндөрдү set те эстеп калабыз.',
  s4n1: '3 — seen те мындай жок. Кошобуз.',
  s4n2: '1 — мындай жок. Кошобуз.',
  s4n3: '4 — мындай жок. Кошобуз.',
  s4n4: '1 — seen те бар экен! Биринчи кайталануу табылды, ары карабаса да болот.',

  s5h: 'Биринчи кайталануу: толук код',
  s5n1: 'Агымды бирден окуйбуз — set алдын ала өлчөмдү билүүнү талап кылбайт.',
  s5n2: 'count(x) — x көптүктө барбы. Таптык — дароо чыгарып, бүтөбүз.',
  s5n3: 'Таппадык — келечек үчүн эстеп калабыз да, кийинки санга өтөбүз.',
  s5run: 'Бул кодду сабактан иштетиңиз — 6, андан кийин 3 1 4 1 5 9 киргизиңиз.',

  s6h: 'Жыштыктарды эсептөө үчүн map',
  s6task: 'apple banana apple cherry banana сөздөрү. Бир өтүү — үч эсептегич.',
  s6n1: 'apple жана banana — экөө тең биринчи жолу: count ар бирине 1ге барабар болот.',
  s6n2: 'apple кайра — 2. cherry биринчи жолу — 1. banana кайра — 2.',
  s6mark: 'map боюнча өтүү ачкычтарды иреттелген түрдө берет — apple, banana, cherry өзү эле алфавит боюнча турду.',

  s7h: 'Сөздөрдүн жыштыгы: толук код',
  s7n1: 'count[w]++ — эгер w ачкычы жок болсо, map аны нөл менен өзү түзөт да дароо бирди кошот.',
  s7n2: '«Мындай сөз бар беле» деп өзүнчө текшерүүнүн кереги жок — map муну өзү жасайт.',
  s7n3: 'for (auto &p : count) өтүүсү ачкычтар боюнча иреттелген тартипте жүрөт.',
  s7run: 'Бул кодду сабактан иштетиңиз — 5, андан кийин apple banana apple cherry banana киргизиңиз.',

  s8h: 'Куралды кантип тандоо керек',
  s8c1t: 'Иреттелгендик керек',
  s8c1d: 'Же «эң жакын элемент» — set / map алыңыз.',
  s8c2t: 'Ылдамдык гана керек',
  s8c2d: 'Тартип маанилүү эмес — unordered_set / unordered_map алыңыз.',
  s8c3t: 'Кайталанмалар керек',
  s8c3d: 'Ошол эле элемент бир нече жолу — multiset алыңыз.',

  s9h: 'Эсте сакта',
  s9r1: 'set — уникалдуу элементтер, иреттелген, O(log n)',
  s9r2: 'map — ачкыч → маани, count[x]++ өзү түзөт',
  s9r3: 'unordered_* — тезирээк (орточо O(1)), бирок тартипсиз',
  s9r4: 'Ичинде — тең салмактанган дарак, ошондуктан кыдыруу эмес',
  s9cta: 'Тиркелген маселени чечиңиз: так бир жолу кездешкен сандарды өсүү тартибинде чыгарыңыз.',
  s9foot: 'Андан ары — рекурсия жана толук кыдыруу: бардык варианттарды кантип адаштырбай басып өтүү керек.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 3',
  title: 'Sets and Maps',
  subtitle: '"Have we seen this before?" and frequency counting — O(log n) instead of scanning',
  press: 'Press → or Space to advance',

  s2h: '"Has this number appeared before?"',
  s2bad: 'Scanning the array',
  s2badD: 'O(n) per check — with n checks that is already O(n²).',
  s2good: 'set / map — a balanced tree',
  s2goodD: 'Internally the data is already kept sorted by the tree — each check is O(log n).',
  s2mark: 'The same question as in binary search: "is this here?" — except the structure searches by itself.',

  s3h: 'Three tools',
  s3c1t: 'std::set',
  s3c1d: 'A set of unique elements: insert, count, erase. Keeps them sorted.',
  s3c2t: 'std::map',
  s3c2d: 'A "key → value" dictionary: count[x]++ creates the key with a zero on first access all by itself.',
  s3c3t: 'unordered_set / unordered_map',
  s3c3d: 'Hash versions with average O(1) — faster, but unordered.',

  s4h: 'The first repeated element',
  s4task: 'The stream 3 1 4 1 5 9. Walk left to right, remembering what we\'ve seen in a set.',
  s4n1: '3 — nothing like it in seen. Add it.',
  s4n2: '1 — nothing like it. Add it.',
  s4n3: '4 — nothing like it. Add it.',
  s4n4: '1 — already in seen! The first repeat is found, no need to look further.',

  s5h: 'First repeat: the full code',
  s5n1: 'Read the stream one number at a time — a set doesn\'t need to know the size upfront.',
  s5n2: 'count(x) — is x in the set. Found it — print and exit right away.',
  s5n3: 'Not found — remember it for later and move to the next number.',
  s5run: 'Run this code in the lesson — enter 6, then 3 1 4 1 5 9.',

  s6h: 'A map for frequency counting',
  s6task: 'The words apple banana apple cherry banana. One pass — three counters.',
  s6n1: 'apple and banana — both for the first time: count becomes 1 for each.',
  s6n2: 'apple again — 2. cherry for the first time — 1. banana again — 2.',
  s6mark: 'Iterating a map yields the keys sorted — apple, banana, cherry lined up alphabetically on their own.',

  s7h: 'Word frequencies: the full code',
  s7n1: 'count[w]++ — if the key w doesn\'t exist yet, map creates it at zero and adds one right away.',
  s7n2: 'No need to check "does this word already exist" separately — map does it for you.',
  s7n3: 'The loop for (auto &p : count) walks the keys in sorted order.',
  s7run: 'Run this code in the lesson — enter 5, then apple banana apple cherry banana.',

  s8h: 'Choosing the right tool',
  s8c1t: 'Need sorted order',
  s8c1d: 'Or "the nearest element" — reach for set / map.',
  s8c2t: 'Need only speed',
  s8c2d: 'Order doesn\'t matter — reach for unordered_set / unordered_map.',
  s8c3t: 'Need duplicates',
  s8c3d: 'The same element more than once — reach for multiset.',

  s9h: 'Remember',
  s9r1: 'set — unique elements, sorted, O(log n)',
  s9r2: 'map — key → value, count[x]++ creates it for you',
  s9r3: 'unordered_* — faster (average O(1)), but unordered',
  s9r4: 'Inside — a balanced tree, so it\'s never a linear scan',
  s9cta: 'Solve the attached problem: print the numbers that occur exactly once, in increasing order.',
  s9foot: 'Next up: recursion and exhaustive search — visiting every possibility without getting lost.',
};

export const setsMaps: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
