import type { LessonPresentationData } from './types';

// Presentation for the "Two Pointers" lesson
// (olympiad-roadmap → level-2-sorting-searching → two-pointers).
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

  s3h: string; s3task: string; s3n1: string; s3n2: string; s3n3: string;

  s4h: string; s4n1: string; s4n2: string; s4n3: string; s4run: string;

  s5h: string; s5r1: string; s5r2: string; s5mark: string;

  s6h: string; s6task: string; s6len: string;
  s6n1: string; s6n2: string; s6n3: string; s6ans: string;

  s7h: string; s7n1: string; s7n2: string; s7n3: string; s7run: string;

  s8h: string; s8line: string; s8w: string; s8mark: string;

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

// pairLadder renders the pair-with-sum-X trace on the sorted array
// 1 4 6 8 10, X = 12: group 0 shows the array, groups 1–3 add one state of
// the pointer dance each (l moves right, r moves left, the pair is found).
function pairLadder(): string {
  const arr = [1, 4, 6, 8, 10];
  const x = (k: number) => 30 + k * 106;
  const cx = (k: number) => x(k) + 44;

  let boxes = '';
  arr.forEach((num, k) => {
    boxes +=
      `<rect x="${x(k)}" y="8" width="88" height="52" rx="10" fill="rgba(96,165,250,.08)" stroke="rgba(96,165,250,.45)" stroke-width="1.5"/>` +
      `<text x="${cx(k)}" y="41" text-anchor="middle" fill="#bfdbfe" font-size="20" font-family="monospace">${num}</text>`;
  });

  const state = (row: number, l: number, r: number, line: string, color: string, bold: boolean) => {
    const y = 84 + row * 50;
    const tri = (k: number) =>
      `<polygon points="${cx(k) - 8},${y + 14} ${cx(k) + 8},${y + 14} ${cx(k)},${y + 2}" fill="${color}"/>`;
    return (
      tri(l) + tri(r) +
      `<text x="${cx(l) - 16}" y="${y + 13}" text-anchor="end" fill="${color}" font-size="13" font-family="monospace">l</text>` +
      `<text x="${cx(r) + 16}" y="${y + 13}" text-anchor="start" fill="${color}" font-size="13" font-family="monospace">r</text>` +
      `<line x1="${cx(l) + 14}" y1="${y + 8}" x2="${cx(r) - 14}" y2="${y + 8}" stroke="rgba(255,255,255,.10)"/>` +
      `<text x="${(cx(l) + cx(r)) / 2}" y="${y + 34}" text-anchor="middle" fill="${color}" font-size="16" font-family="monospace"${bold ? ' font-weight="700"' : ''}>${line}</text>`
    );
  };

  return `<div class="lp-chart">
<svg viewBox="0 0 560 240" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${boxes}</g>
  <g class="step" data-a="none" data-g="1">${state(0, 0, 4, '1 + 10 = 11 &lt; 12 · l →', C.warn, false)}</g>
  <g class="step" data-a="none" data-g="2">${state(1, 1, 4, '4 + 10 = 14 &gt; 12 · ← r', C.warn, false)}</g>
  <g class="step" data-a="none" data-g="3">${state(2, 1, 3, '4 + 8 = 12 ✓', C.good, true)}</g>
</svg>
</div>`;
}

// windowLadder renders the sliding-window trace on 2 4 1 3 5 2, S = 8:
// group 0 shows the array, groups 1–4 add one window state per row, group 5
// lights up the winning window of length 3 in the first row.
function windowLadder(len: string): string {
  const arr = [2, 4, 1, 3, 5, 2];
  const x = (k: number) => 16 + k * 56;

  const cell = (k: number, y: number, tone: 'plain' | 'in' | 'out' | 'win') => {
    const s =
      tone === 'win'
        ? `fill="rgba(52,211,153,.15)" stroke="${C.good}" stroke-width="2"`
        : tone === 'in'
          ? `fill="rgba(96,165,250,.15)" stroke="rgba(96,165,250,.55)" stroke-width="1.5"`
          : tone === 'plain'
            ? `fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.14)"`
            : `fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.08)"`;
    const f = tone === 'win' ? '#6ee7b7' : tone === 'in' ? '#bfdbfe' : tone === 'plain' ? '#cbd5e1' : '#475569';
    const w = tone === 'win' ? ' font-weight="700"' : '';
    return (
      `<rect x="${x(k)}" y="${y}" width="50" height="44" rx="8" ${s}/>` +
      `<text x="${x(k) + 25}" y="${y + 29}" text-anchor="middle" fill="${f}" font-size="18" font-family="monospace"${w}>${arr[k]}</text>`
    );
  };

  let header = '';
  arr.forEach((_, k) => (header += cell(k, 8, 'plain')));
  header += `<text x="366" y="36" fill="${C.info}" font-size="17" font-family="monospace">S = 8</text>`;

  const row = (i: number, l: number, r: number, text: string, color: string) => {
    const y = 70 + i * 52;
    let cells = '';
    arr.forEach((_, k) => (cells += cell(k, y, k >= l && k <= r ? 'in' : 'out')));
    return cells + `<text x="366" y="${y + 28}" fill="${color}" font-size="14" font-family="monospace">${text}</text>`;
  };

  let win = '';
  for (let k = 0; k <= 2; k++) win += cell(k, 70, 'win');

  return `<div class="lp-chart">
<svg viewBox="0 0 560 282" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${header}</g>
  <g class="step" data-a="none" data-g="1">${row(0, 0, 2, `Σ 7 ≤ 8 · ${len} 3`, '#6ee7b7')}</g>
  <g class="step" data-a="none" data-g="2">${row(1, 1, 3, `Σ 10 → 8 · ${len} 3`, C.warn)}</g>
  <g class="step" data-a="none" data-g="3">${row(2, 3, 4, `Σ 13 → 8 · ${len} 2`, C.warn)}</g>
  <g class="step" data-a="none" data-g="4">${row(3, 4, 5, `Σ 10 → 7 · ${len} 2`, C.warn)}</g>
  <g class="step" data-a="none" data-g="5">${win}</g>
</svg>
</div>`;
}

// palBoxes renders the palindrome check on a five-letter word: group 0 the
// letters, groups 1–2 the matching outer/inner pairs, group 3 the middle.
function palBoxes(word: string): string {
  const letters = Array.from(word);
  const x = (k: number) => 92 + k * 76;
  const cx = (k: number) => x(k) + 36;

  const box = (k: number, tone: 'plain' | 'pair' | 'mid') => {
    const s =
      tone === 'pair'
        ? `fill="rgba(52,211,153,.12)" stroke="${C.good}" stroke-width="2"`
        : tone === 'mid'
          ? `fill="rgba(129,140,248,.18)" stroke="${C.acc}" stroke-width="2"`
          : `fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.14)"`;
    const f = tone === 'pair' ? '#6ee7b7' : tone === 'mid' ? '#c7d2fe' : '#e2e8f0';
    return (
      `<rect x="${x(k)}" y="8" width="72" height="56" rx="10" ${s}/>` +
      `<text x="${cx(k)}" y="45" text-anchor="middle" fill="${f}" font-size="26" font-family="monospace">${letters[k]}</text>`
    );
  };

  let base = '';
  letters.forEach((_, k) => (base += box(k, 'plain')));
  const g1 = box(0, 'pair') + box(4, 'pair') + `<line x1="${cx(0)}" y1="84" x2="${cx(4)}" y2="84" stroke="${C.good}" stroke-width="1.5"/>`;
  const g2 = box(1, 'pair') + box(3, 'pair') + `<line x1="${cx(1)}" y1="96" x2="${cx(3)}" y2="96" stroke="${C.good}" stroke-width="1.5"/>`;
  const g3 = box(2, 'mid');

  return `<div class="lp-chart">
<svg viewBox="0 0 560 106" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${base}</g>
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
  <div class="lp-bigo" aria-hidden="true">l → ← r</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The idea in three facts
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">➡️</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">👣</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">⚡</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── Classic 1: pair with sum X (animated pointer dance)
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s3task}</p>
<div class="lp-cols">
  ${pairLadder()}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s3n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s3n2}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s3n3}</p></div>
  </div>
</div>`,

    // 4 ── Pair with sum: the full code
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">int l = 0, r = n - 1;
while (l &lt; r) {
    long long sum = a[l] + a[r];
</span><span class="step" data-g="1" data-a="none">    if (sum == target) {
        std::cout &lt;&lt; a[l] &lt;&lt; " + " &lt;&lt; a[r];
        return 0;
    }
</span><span class="step" data-g="2" data-a="none">    if (sum &lt; target) l++;
    else r--;
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s4run}</p>`,

    // 5 ── Why no pair is lost
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">a[l] + a[r] &lt; X</span><span>${t.s5r1}</span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">a[l] + a[r] &gt; X</span><span>${t.s5r2}</span></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── Classic 2: the sliding window (animated trace)
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s6task}</p>
<div class="lp-cols">
  ${windowLadder(t.s6len)}
  <div class="lp-notes">
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s6n1}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s6n2}</p></div>
    <div class="lp-card step" data-g="4" data-a="right"><p>${t.s6n3}</p></div>
  </div>
</div>
<p class="lp-p lp-center step" data-g="5"><span class="lp-mark">${t.s6ans}</span></p>`,

    // 7 ── Sliding window: the full code
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">long long sum = 0;
int best = 0, l = 0;
for (int r = 0; r &lt; n; r++) {
    sum += a[r];
</span><span class="step" data-g="1" data-a="none">    while (sum &gt; s) {
        sum -= a[l];
        l++;
    }
</span><span class="step" data-g="2" data-a="none">    best = std::max(best, r - l + 1);
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s7n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s7run}</p>`,

    // 8 ── The palindrome check is two pointers too
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" data-g="0" style="margin-top:0">${t.s8line}</p>
${palBoxes(t.s8w)}
<p class="lp-p lp-center step" data-g="3"><span class="lp-mark">${t.s8mark}</span></p>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">⇄</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">⇉</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">O(n)</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">while</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 2',
  title: 'Метод двух указателей',
  subtitle: 'Пара с заданной суммой и скользящее окно — O(n) там, где перебор даёт O(n²)',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Идея метода',
  s2c1t: 'Только вперёд',
  s2c1d: 'Два индекса ходят по массиву вперёд или навстречу — и никогда не возвращаются.',
  s2c2t: 'Не больше n сдвигов каждый',
  s2c2d: 'На двоих — максимум 2n шагов за всю работу программы.',
  s2c3t: 'O(n) вместо O(n²)',
  s2c3d: 'Один проход вместо перебора всех пар.',
  s2mark: 'Два классических узора: навстречу друг другу — и в одну сторону, скользящим окном.',

  s3h: 'Классика №1: пара с суммой X',
  s3task: 'Массив отсортирован. Ищем пару с суммой X = 12: указатели на краях.',
  s3n1: 'Сумма мала — двигаем левый вправо: с a[l] лучшей пары уже не будет.',
  s3n2: 'Сумма велика — двигаем правый влево: симметрично.',
  s3n3: '4 + 8 = 12 — нашли. Каждый шаг навсегда исключает один элемент.',

  s4h: 'Пара с суммой: весь код',
  s4n1: 'Указатели на краях. Встретились — непроверенных пар не осталось.',
  s4n2: 'Совпало — выводим и выходим.',
  s4n3: 'Одно сравнение — один сдвиг. Поэтому цикл выполнится не больше n раз.',
  s4run: 'Запустите этот код в уроке — введите 5 12, затем 1 3 5 7 9.',

  s5h: 'Почему ни одна пара не теряется',
  s5r1: 'a[l] с любым элементом левее r даст ещё меньше — a[l] можно исключить навсегда',
  s5r2: 'a[r] с любым элементом правее l даст ещё больше — исключаем a[r]',
  s5mark: 'Шаг выбрасывает элемент только тогда, когда он гарантированно не входит в ответ.',

  s6h: 'Классика №2: скользящее окно',
  s6task: 'Самый длинный отрезок с суммой не больше S = 8. Оба указателя идут вправо.',
  s6len: 'длина',
  s6n1: 'Правый край расширяет окно, пока сумма не превысила S.',
  s6n2: 'Превысили — левый край поджимается, пока сумма снова не станет ≤ S.',
  s6n3: 'Правый всегда вперёд, левый только догоняет — квадрата не будет.',
  s6ans: 'Ответ: 3 — окно [2 4 1] нашлось первым.',

  s7h: 'Скользящее окно: весь код',
  s7n1: 'Правый край — обычный for: каждый элемент входит в окно один раз.',
  s7n2: 'Внутренний while не делает алгоритм квадратичным: левый край за всю работу сдвинется не больше n раз.',
  s7n3: 'Окно снова валидно — фиксируем длину.',
  s7run: 'Запустите этот код в уроке — введите 6 8, затем 2 4 1 3 5 2.',

  s8h: 'Вы уже писали два указателя',
  s8line: 'Проверка палиндрома из курса языка — указатели идут навстречу и сравнивают символы.',
  s8w: 'КАЗАК',
  s8mark: 'Крайние совпали, середина осталась одна — палиндром. Это тот же метод.',

  s9h: 'Запомнить',
  s9r1: 'Навстречу: пара с суммой — только в отсортированном массиве',
  s9r2: 'В одну сторону: скользящее окно',
  s9r3: 'Каждый указатель сдвигается не больше n раз — итого O(n)',
  s9r4: 'Внутренний while — это ещё не O(n²)',
  s9cta: 'Решите задачу «Проверка палиндрома» под уроком — теперь осознанно, как частный случай метода, — и отметьте урок пройденным.',
  s9foot: 'Бонус: подумайте, почему скользящему окну нужны неотрицательные числа — что сломается с отрицательными?',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 2-деңгээл',
  title: 'Эки көрсөткүч ыкмасы',
  subtitle: 'Берилген суммадагы түгөй жана жылма терезе — кыдыруу O(n²) берген жерде O(n)',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Ыкманын идеясы',
  s2c1t: 'Алдыга гана',
  s2c1d: 'Эки индекс массив боюнча алдыга же бири-бирине карай жүрөт — эч качан артка кайтпайт.',
  s2c2t: 'Ар бири n ден көп эмес жылат',
  s2c2d: 'Экөөнө чогуу — программанын бүт иши боюнча максимум 2n кадам.',
  s2c3t: 'O(n²) ордуна O(n)',
  s2c3d: 'Бардык түгөйлөрдү кыдыруунун ордуна — бир өтүү.',
  s2mark: 'Эки классикалык үлгү: бири-бирине карай — жана бир багытта, жылма терезе менен.',

  s3h: '№1 классика: суммасы X болгон түгөй',
  s3task: 'Массив иреттелген. Суммасы X = 12 болгон түгөйдү издейбиз: көрсөткүчтөр четтерде.',
  s3n1: 'Сумма аз — солдогусун оңго жылдырабыз: a[l] менен мындан жакшы түгөй болбойт.',
  s3n2: 'Сумма көп — оңдогусун солго: симметриялуу.',
  s3n3: '4 + 8 = 12 — таптык. Ар бир кадам бир элементти биротоло чыгарып салат.',

  s4h: 'Суммалуу түгөй: толук код',
  s4n1: 'Көрсөткүчтөр четтерде. Жолугушту — текшерилбеген түгөй калган жок.',
  s4n2: 'Дал келди — чыгарып, бүтөбүз.',
  s4n3: 'Бир салыштыруу — бир жылыш. Ошондуктан цикл n ден көп аткарылбайт.',
  s4run: 'Бул кодду сабактан иштетиңиз — 5 12, андан кийин 1 3 5 7 9 киргизиңиз.',

  s5h: 'Эмнеге бир да түгөй жоголбойт',
  s5r1: 'a[l] r ден солдогу каалаган элемент менен андан да аз берет — a[l] биротоло чыгарылат',
  s5r2: 'a[r] l ден оңдогу каалаган элемент менен андан да көп берет — a[r] чыгарылат',
  s5mark: 'Кадам элементти жоопко кирбеси кепилденгенде гана ыргытат.',

  s6h: '№2 классика: жылма терезе',
  s6task: 'Суммасы S = 8 ден ашпаган эң узун кесинди. Эки көрсөткүч тең оңго жүрөт.',
  s6len: 'узундугу',
  s6n1: 'Оң чет терезени кеңейтет — сумма S тен ашпай турганда.',
  s6n2: 'Ашып кетти — сол чет сумма кайра ≤ S болгуча кысылат.',
  s6n3: 'Оң чет дайыма алдыга, сол чет кууп гана жетет — квадрат болбойт.',
  s6ans: 'Жооп: 3 — [2 4 1] терезеси биринчи табылды.',

  s7h: 'Жылма терезе: толук код',
  s7n1: 'Оң чет — кадимки for: ар бир элемент терезеге бир жолу кирет.',
  s7n2: 'Ички while алгоритмди квадраттык кылбайт: сол чет бүт иш боюнча n ден көп эмес жылат.',
  s7n3: 'Терезе кайра жарактуу — узундукту белгилейбиз.',
  s7run: 'Бул кодду сабактан иштетиңиз — 6 8, андан кийин 2 4 1 3 5 2 киргизиңиз.',

  s8h: 'Эки көрсөткүчтү мурун эле жазгансыз',
  s8line: 'Тил курсундагы палиндром текшерүү — көрсөткүчтөр бири-бирине карай жүрүп, тамгаларды салыштырат.',
  s8w: 'КАЗАК',
  s8mark: 'Четтегилер дал келди, ортодо бирөө калды — палиндром. Бул ошол эле ыкма.',

  s9h: 'Эсте сакта',
  s9r1: 'Бири-бирине карай: суммалуу түгөй — иреттелген массивде гана',
  s9r2: 'Бир багытта: жылма терезе',
  s9r3: 'Ар бир көрсөткүч n ден көп эмес жылат — жыйынтыгы O(n)',
  s9r4: 'Ички while — бул O(n²) дегенди билдирбейт',
  s9cta: 'Сабактын астындагы «Палиндромду текшерүү» маселесин чечиңиз — эми аңдап, ыкманын жеке учуру катары — жана сабакты өттүм деп белгилеңиз.',
  s9foot: 'Бонус: жылма терезеге эмнеге терс эмес сандар керек — массивде терс сан болсо эмне бузулат?',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 2',
  title: 'Two Pointers',
  subtitle: 'A pair with a given sum and the sliding window — O(n) where brute force gives O(n²)',
  press: 'Press → or Space to advance',

  s2h: 'The idea',
  s2c1t: 'Forward only',
  s2c1d: 'Two indices walk the array forward or towards each other — and never go back.',
  s2c2t: 'At most n moves each',
  s2c2d: 'Between them — at most 2n steps over the whole run.',
  s2c3t: 'O(n) instead of O(n²)',
  s2c3d: 'One pass instead of checking every pair.',
  s2mark: 'Two classic patterns: towards each other — and in one direction, as a sliding window.',

  s3h: 'Classic #1: a pair with sum X',
  s3task: 'The array is sorted. Looking for a pair with sum X = 12: pointers at the ends.',
  s3n1: 'Sum too small — move the left one right: no better pair with a[l] exists.',
  s3n2: 'Sum too large — move the right one left: symmetric.',
  s3n3: '4 + 8 = 12 — found. Every step discards one element for good.',

  s4h: 'Pair with sum: the full code',
  s4n1: 'Pointers at the ends. They met — no unchecked pairs remain.',
  s4n2: 'A match — print and exit.',
  s4n3: 'One comparison — one move. So the loop runs at most n times.',
  s4run: 'Run this code in the lesson — enter 5 12, then 1 3 5 7 9.',

  s5h: 'Why no pair is ever lost',
  s5r1: 'a[l] with anything left of r gives even less — a[l] can be discarded for good',
  s5r2: 'a[r] with anything right of l gives even more — discard a[r]',
  s5mark: 'A step throws an element away only when it is guaranteed not to be in the answer.',

  s6h: 'Classic #2: the sliding window',
  s6task: 'The longest segment with sum at most S = 8. Both pointers move right.',
  s6len: 'len',
  s6n1: 'The right end expands the window while the sum stays within S.',
  s6n2: 'Exceeded — the left end shrinks until the sum is ≤ S again.',
  s6n3: 'The right end always advances, the left only catches up — nothing quadratic here.',
  s6ans: 'Answer: 3 — the window [2 4 1] came first.',

  s7h: 'Sliding window: the full code',
  s7n1: 'The right end is a plain for: every element enters the window once.',
  s7n2: 'The inner while does not make it quadratic: over the whole run the left end moves at most n times.',
  s7n3: 'The window is valid again — record its length.',
  s7run: 'Run this code in the lesson — enter 6 8, then 2 4 1 3 5 2.',

  s8h: 'You have written two pointers before',
  s8line: 'The palindrome check from the language course — pointers move towards each other comparing characters.',
  s8w: 'LEVEL',
  s8mark: 'The ends matched, one letter remains in the middle — a palindrome. Same technique.',

  s9h: 'Remember',
  s9r1: 'Towards each other: pair with sum — only in a sorted array',
  s9r2: 'One direction: the sliding window',
  s9r3: 'Each pointer moves at most n times — O(n) total',
  s9r4: 'An inner while does not mean O(n²)',
  s9cta: 'Solve the “Palindrome Check” problem below the lesson — consciously now, as a special case of the technique — and mark the lesson as completed.',
  s9foot: 'Bonus: think about why the sliding window needs non-negative numbers — what breaks if the array has negatives?',
};

export const twoPointers: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
