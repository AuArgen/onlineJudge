import type { LessonPresentationData } from './types';

// Presentation for the "String Algorithms: Hashing and KMP" lesson
// (olympiad-roadmap → level-5-advanced → string-algorithms).
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

  s3h: string; s3line: string; s3mark: string;

  s4h: string; s4task: string; s4n1: string; s4n2: string;

  s5h: string; s5n1: string; s5n2: string; s5n3: string; s5run: string;

  s6h: string; s6line: string; s6mark: string;

  s7h: string; s7task: string;
  s7n1: string; s7n2: string; s7n3: string; s7n4: string;

  s8h: string; s8n1: string; s8n2: string; s8run: string; s8mark: string;

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

// hashCompare renders the exact worked example on "abacaba": group 1
// brackets [1,3] and [5,7] (both "aba") in the same color with an "=" — equal
// substrings, equal hashes; group 2 brackets [1,2] and [2,3] ("ab" vs "ba")
// with a "≠" — different substrings, different hashes.
function hashCompare(): string {
  const s = 'abacaba';
  const x = (i: number) => 20 + (i - 1) * 54;
  const cx = (i: number) => x(i) + 22;
  const y = 14, w = 44, h = 40;

  const box = (i: number) =>
    `<rect x="${x(i)}" y="${y}" width="${w}" height="${h}" rx="8" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.16)"/>` +
    `<text x="${cx(i)}" y="${y + 27}" text-anchor="middle" fill="#cbd5e1" font-size="19" font-family="monospace">${s[i - 1]}</text>` +
    `<text x="${cx(i)}" y="${y - 6}" text-anchor="middle" fill="#64748b" font-size="11" font-family="monospace">${i}</text>`;
  const bracket = (from: number, to: number, color: string, ly: number) =>
    `<path d="M ${cx(from)} ${y + h + 8} L ${cx(from)} ${ly} L ${cx(to)} ${ly} L ${cx(to)} ${y + h + 8}" fill="none" stroke="${color}" stroke-width="1.6"/>`;

  const base = [1, 2, 3, 4, 5, 6, 7].map(box).join('');
  const g1 = bracket(1, 3, C.good, y + h + 20) + bracket(5, 7, C.good, y + h + 20) +
    `<text x="${(cx(1) + cx(3)) / 2}" y="${y + h + 38}" text-anchor="middle" fill="${C.good}" font-size="13" font-family="monospace">aba</text>` +
    `<text x="${(cx(5) + cx(7)) / 2}" y="${y + h + 38}" text-anchor="middle" fill="${C.good}" font-size="13" font-family="monospace">aba</text>` +
    `<text x="${(cx(3) + cx(5)) / 2}" y="${y + h + 32}" text-anchor="middle" fill="${C.good}" font-size="20" font-weight="700">=</text>`;
  const g2 = bracket(1, 2, C.bad, y + h + 62) + bracket(2, 3, C.bad, y + h + 62) +
    `<text x="${(cx(1) + cx(2)) / 2}" y="${y + h + 80}" text-anchor="middle" fill="${C.bad}" font-size="13" font-family="monospace">ab</text>` +
    `<text x="${(cx(2) + cx(3)) / 2}" y="${y + h + 80}" text-anchor="middle" fill="${C.bad}" font-size="13" font-family="monospace">ba</text>`;

  return `<div class="lp-chart">
<svg viewBox="0 0 380 190" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${base}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
</svg>
</div>`;
}

// kmpTrace renders the pi-array build for s = "ab#ababcab" (pattern "ab" +
// "#" + text "ababcab"): each group fills a batch of pi cells (values only
// ever get set once, left to right, so this is purely additive), the last
// group rings the three positions where pi == m = 2 and labels the match
// offsets 1, 3, 6 — exactly the lesson's worked example.
function kmpTrace(l1: string, l2: string, l3: string, l4: string): string {
  const s = 'ab#ababcab';
  const pi = [0, 0, 0, 1, 2, 1, 2, 0, 1, 2];
  const x = (i: number) => 10 + i * 46;
  const cx = (i: number) => x(i) + 18;
  const sy = 10, py = 66, w = 36, h = 32;

  const sBox = (i: number) =>
    `<rect x="${x(i)}" y="${sy}" width="${w}" height="${h}" rx="7" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.16)"/>` +
    `<text x="${cx(i)}" y="${sy + 22}" text-anchor="middle" fill="#cbd5e1" font-size="16" font-family="monospace">${s[i] === '#' ? '#' : s[i]}</text>`;
  const piCell = (i: number, color: string) =>
    `<rect x="${x(i)}" y="${py}" width="${w}" height="${h}" rx="7" fill="${color}22" stroke="${color}" stroke-width="2"/>` +
    `<text x="${cx(i)}" y="${py + 22}" text-anchor="middle" fill="${color}" font-size="16" font-weight="700" font-family="monospace">${pi[i]}</text>`;
  const ring = (i: number, color: string) =>
    `<rect x="${x(i) - 3}" y="${py - 3}" width="${w + 6}" height="${h + 6}" rx="9" fill="none" stroke="${color}" stroke-width="2.6"/>`;
  const label = (text: string, color: string) =>
    `<text x="10" y="128" fill="${color}" font-size="13" font-family="monospace">${text}</text>`;

  const g0 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(sBox).join('');
  const g1 = [0, 1, 2].map((i) => piCell(i, C.info)).join('') + label(l1, C.info);
  const g2 = [3, 4, 5, 6].map((i) => piCell(i, C.acc)).join('') + label(l2, C.acc);
  const g3 = piCell(7, C.bad) + label(l3, C.bad);
  const g4 = piCell(8, C.info) + piCell(9, C.info) + ring(4, C.good) + ring(6, C.good) + ring(9, C.good) + label(l4, C.good);

  return `<div class="lp-chart">
<svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <div class="lp-bigo" aria-hidden="true">pi[i]</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── Two tools
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>#️⃣ ${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step" data-a="right"><h3>🔁 ${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
</div>`,

    // 3 ── The polynomial hash idea
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.1rem,3.4vw,1.7rem)">h = s₀p^(k−1) + s₁p^(k−2) + … + s_{k−1}</div>
</div>
<p class="lp-p lp-center step" style="margin-top:16px">${t.s3line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s3mark}</span></p>`,

    // 4 ── Animated hash comparison
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
${hashCompare()}
<div class="lp-notes" style="margin-top:2px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s4n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s4n2}</p></div>
</div>`,

    // 5 ── Hash: full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">h[i+1] = (h[i]*P + s[i]) % MOD;
pw[i+1] = pw[i] * P % MOD;
</span><span class="step" data-g="1" data-a="none">
auto get = [&amp;](int l, int r) {
    return ((h[r] - h[l-1]*pw[r-l+1]) % MOD
             + MOD) % MOD;
};
</span><span class="step" data-g="2" data-a="none">get(l1,r1) == get(l2,r2) ? "YES" : "NO";</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s5run}</p>`,

    // 6 ── The prefix function idea
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s6line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Animated KMP trace
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s7task}</p>
${kmpTrace(t.s7n1, t.s7n2, t.s7n3, t.s7n4)}
<div class="lp-notes" style="margin-top:2px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s7n1}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s7n2}</p></div>
  <div class="lp-card step" data-g="3" data-a="none"><p>${t.s7n3}</p></div>
  <div class="lp-card step" data-g="4" data-a="none"><p>${t.s7n4}</p></div>
</div>`,

    // 8 ── KMP: full code
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">int j = pi[i-1];
while (j &gt; 0 &amp;&amp; s[i] != s[j])
    j = pi[j-1];
if (s[i] == s[j]) j++;
pi[i] = j;
</span><span class="step" data-g="1" data-a="none">
if (pi[i] == m)
    std::cout &lt;&lt; i - 2*m + 1;</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s8n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s8n2}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s8run}</p>
<p class="lp-p lp-center step" data-g="2"><span class="lp-mark">${t.s8mark}</span></p>`,

    // 9 ── Task teaser
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s9task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">🔁</div><p>${t.s9hint}</p></div>`,

    // 10 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s10h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">hash(l,r)</span><span><b>${t.s10r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">pi[i]</span><span><b>${t.s10r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">O(n)</span><span><b>${t.s10r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">pattern#text</span><span><b>${t.s10r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s10cta}</p></div>
<p class="lp-foot lp-center step">${t.s10foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 5',
  title: 'Строковые алгоритмы: хеширование и KMP',
  subtitle: 'Сравнение подстрок за O(1) и поиск образца за O(n) — вместо посимвольного O(n) на каждое сравнение',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Два инструмента вместо посимвольного сравнения',
  s2c1t: 'Хеш',
  s2c1d: 'Число вместо строки. Равные подстроки — равные хеши, сравнение за O(1).',
  s2c2t: 'KMP',
  s2c2d: 'Префикс-функция находит все вхождения образца в тексте за O(n), без квадрата.',

  s3h: 'Полиномиальный хеш',
  s3line: 'Предпосчитав префиксные хеши и степени p, хеш ЛЮБОЙ подстроки достаётся за O(1).',
  s3mark: 'Коллизии теоретически возможны, но при модуле ~10⁹ их вероятность ничтожна — для параноиков есть двойной хеш.',

  s4h: 'Хеш в деле: abacaba',
  s4task: 'Сравниваем подстроки [1,3] и [5,7], затем [1,2] и [2,3].',
  s4n1: '[1,3] = «aba», [5,7] = «aba» — строки совпадают, значит совпадают и хеши. Ответ: YES.',
  s4n2: '[1,2] = «ab», [2,3] = «ba» — разные строки, разные хеши. Ответ: NO.',

  s5h: 'Хеш подстрок: весь код',
  s5n1: 'Префиксные хеши и степени p считаются один раз за O(n).',
  s5n2: 'Формула вычитает «хвост до l» из «хвоста до r», домноженный на нужную степень p — ровно как с префиксными суммами, только по модулю.',
  s5n3: 'Сравнение двух подстрок — сравнение двух чисел за O(1).',
  s5run: 'Запустите этот код в уроке — введите abacaba 2, затем запросы 1 3 5 7 и 1 2 2 3.',

  s6h: 'Префикс-функция: pi[i]',
  s6line: 'pi[i] — длина наибольшего собственного префикса строки, который одновременно является её суффиксом, заканчивающимся в позиции i.',
  s6mark: 'Чтобы найти образец в тексте: склейте «образец # текст» и ищите позиции, где pi равна длине образца.',

  s7h: 'KMP: трасса на ab#ababcab',
  s7task: 'Строка = образец «ab» + «#» + текст «ababcab». Считаем pi слева направо.',
  s7n1: 'a, b, # — префикс-функция самого образца и разделителя равна нулю.',
  s7n2: 'a, b, a, b — совпадение продолжает расти: pi = 1, 2, 1, 2.',
  s7n3: 'c ломает совпадение — откат к нулю. Это и есть сердце алгоритма: не начинаем сначала, а падаем на следующего кандидата.',
  s7n4: 'a, b — снова растёт. pi = 2 встречается на позициях 4, 6, 9 — вхождения образца на позициях 1, 3 и 6 текста.',

  s8h: 'KMP: весь код',
  s8n1: 'При несовпадении откатываемся по цепочке pi, а не начинаем поиск заново.',
  s8n2: 'pi[i] == m значит: образец длины m только что закончился в этой позиции строки.',
  s8run: 'Запустите этот код в уроке — введите ababcab ab.',
  s8mark: 'Указатель j суммарно уменьшается не больше, чем увеличивается за весь проход — отсюда амортизированная O(n).',

  s9h: 'Задание',
  s9task: 'С помощью префикс-функции найдите наименьший период строки.',
  s9hint: 'Кандидат: n − pi[n−1]. Если n делится на это значение без остатка — это и есть длина периода.',

  s10h: 'Запомнить',
  s10r1: 'Полиномиальный хеш сравнивает подстроки за O(1) после O(n) подготовки',
  s10r2: 'pi[i] — длина наибольшего префикса-суффикса, заканчивающегося в i',
  s10r3: 'Оба инструмента — O(n) на предпосчёт, никакого квадрата',
  s10r4: '«образец # текст» + поиск pi == m находит все вхождения',
  s10cta: 'Найдите наименьший период строки и отметьте урок пройденным.',
  s10foot: 'Дальше — теория чисел: модульная арифметика, быстрое возведение в степень и C(n, k) по модулю.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 5-деңгээл',
  title: 'Саптык алгоритмдер: хэштөө жана KMP',
  subtitle: 'Сапчаларды O(1) убакытта салыштыруу жана үлгүнү O(n) убакытта издөө — ар бир салыштырууга O(n) ордуна',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Символ-символ салыштыруунун ордуна эки курал',
  s2c1t: 'Хэш',
  s2c1d: 'Сап ордуна сан. Бирдей сапчалар — бирдей хэштер, салыштыруу O(1) убакытта.',
  s2c2t: 'KMP',
  s2c2d: 'Префикс-функция үлгүнүн текстеги бардык кездешүүлөрүн O(n) убакытта, квадратсыз табат.',

  s3h: 'Полиномдук хэш',
  s3line: 'Префикстик хэштерди жана p дин даражаларын алдын ала эсептеп, КААЛАГАН сапчанын хэши O(1) убакытта алынат.',
  s3mark: 'Коллизиялар теориялык жактан мүмкүн, бирок ~10⁹ модулда алардын ыктымалдыгы аз — параноиктер үчүн кош хэш бар.',

  s4h: 'Хэш иштин үстүндө: abacaba',
  s4task: '[1,3] жана [5,7] сапчаларын, андан кийин [1,2] жана [2,3] тү салыштырабыз.',
  s4n1: '[1,3] = «aba», [5,7] = «aba» — сапчалар дал келет, демек хэштер да дал келет. Жооп: YES.',
  s4n2: '[1,2] = «ab», [2,3] = «ba» — башка сапчалар, башка хэштер. Жооп: NO.',

  s5h: 'Сапчалардын хэши: толук код',
  s5n1: 'Префикстик хэштер жана p дин даражалары бир жолу O(n) убакытта эсептелет.',
  s5n2: 'Формула «l ге чейинки куйрукту» «r ге чейинки куйруктан» p дин керектүү даражасына көбөйтүп кемитет — префикстик суммалардагыдай эле, бирок модуль боюнча.',
  s5n3: 'Эки сапчаны салыштыруу — эки санды O(1) убакытта салыштыруу.',
  s5run: 'Бул кодду сабактан иштетиңиз — abacaba 2, андан кийин суроолор 1 3 5 7 жана 1 2 2 3 киргизиңиз.',

  s6h: 'Префикс-функция: pi[i]',
  s6line: 'pi[i] — саптын i позициясында аяктаган, ошол эле учурда анын суффикси болгон эң чоң менчик префиксинин узундугу.',
  s6mark: 'Текстен үлгүнү табуу үчүн: «үлгү # текст» деп жабыштырыңыз да, pi үлгүнүн узундугуна барабар болгон позицияларды издеңиз.',

  s7h: 'KMP: ab#ababcab боюнча трасса',
  s7task: 'Сап = үлгү «ab» + «#» + текст «ababcab». pi ди солдон оңго эсептейбиз.',
  s7n1: 'a, b, # — үлгүнүн жана бөлгүчтүн өзүнүн префикс-функциясы нөлгө барабар.',
  s7n2: 'a, b, a, b — дал келүү өсүп жатат: pi = 1, 2, 1, 2.',
  s7n3: 'c дал келүүнү бузат — нөлгө артка кайтуу. Дал ушул алгоритмдин жүрөгү: башынан баштабайбыз, кийинки талапкерге түшөбүз.',
  s7n4: 'a, b — кайра өсөт. pi = 2 4, 6, 9 позицияларында кездешет — үлгүнүн текстеги 1, 3 жана 6 позицияларындагы кездешүүлөрү.',

  s8h: 'KMP: толук код',
  s8n1: 'Дал келбегенде pi чынжыры боюнча артка кайтабыз, издөөнү кайра баштабайбыз.',
  s8n2: 'pi[i] == m дегени: узундугу m болгон үлгү так ушул позицияда бүттү.',
  s8run: 'Бул кодду сабактан иштетиңиз — ababcab ab киргизиңиз.',
  s8mark: 'j көрсөткүчү бүт өтүү боюнча жалпысынан өскөндөн көп кемибейт — ушундан амортизацияланган O(n).',

  s9h: 'Тапшырма',
  s9task: 'Префикс-функциянын жардамы менен саптын эң кичине мезгилин табыңыз.',
  s9hint: 'Талапкер: n − pi[n−1]. Эгер n бул маанига калдыксыз бөлүнсө — бул дал мезгилдин узундугу.',

  s10h: 'Эсте сакта',
  s10r1: 'Полиномдук хэш сапчаларды O(n) даярдоодон кийин O(1) убакытта салыштырат',
  s10r2: 'pi[i] — i де аяктаган эң чоң префикс-суффикстин узундугу',
  s10r3: 'Эки курал тең — O(n) алдын ала эсептөө, квадрат жок',
  s10r4: '«үлгү # текст» + pi == m издөө бардык кездешүүлөрдү табат',
  s10cta: 'Саптын эң кичине мезгилин табыңыз жана сабакты өттүм деп белгилеңиз.',
  s10foot: 'Андан ары — сандар теориясы: модулдук арифметика, даражага тез көтөрүү жана модуль боюнча C(n, k).',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 5',
  title: 'String Algorithms: Hashing and KMP',
  subtitle: 'Comparing substrings in O(1) and finding a pattern in O(n) — instead of O(n) per comparison',
  press: 'Press → or Space to advance',

  s2h: 'Two tools instead of character-by-character comparison',
  s2c1t: 'Hashing',
  s2c1d: 'A number instead of a string. Equal substrings mean equal hashes — an O(1) comparison.',
  s2c2t: 'KMP',
  s2c2d: 'The prefix function finds every occurrence of a pattern in a text in O(n), no square.',

  s3h: 'The polynomial hash',
  s3line: 'Having precomputed prefix hashes and the powers of p, the hash of ANY substring comes out in O(1).',
  s3mark: 'Collisions are theoretically possible, but with a modulus around 10⁹ the probability is negligible — for the paranoid there\'s double hashing.',

  s4h: 'The hash at work: abacaba',
  s4task: 'Compare substrings [1,3] and [5,7], then [1,2] and [2,3].',
  s4n1: '[1,3] = "aba", [5,7] = "aba" — the strings match, so the hashes match too. Answer: YES.',
  s4n2: '[1,2] = "ab", [2,3] = "ba" — different strings, different hashes. Answer: NO.',

  s5h: 'Substring hashing: the full code',
  s5n1: 'Prefix hashes and the powers of p are computed once, in O(n).',
  s5n2: 'The formula subtracts the "tail up to l" from the "tail up to r", scaled by the right power of p — exactly like prefix sums, but modulo a prime.',
  s5n3: 'Comparing two substrings is comparing two numbers in O(1).',
  s5run: 'Run this code in the lesson — enter abacaba 2, then the queries 1 3 5 7 and 1 2 2 3.',

  s6h: 'The prefix function: pi[i]',
  s6line: 'pi[i] is the length of the longest proper prefix of the string that is also its suffix, ending at position i.',
  s6mark: 'To find a pattern in a text: concatenate "pattern # text" and look for positions where pi equals the pattern\'s length.',

  s7h: 'KMP: the trace on ab#ababcab',
  s7task: 'The string = pattern "ab" + "#" + text "ababcab". Compute pi left to right.',
  s7n1: 'a, b, # — the prefix function of the pattern itself and the separator is zero.',
  s7n2: 'a, b, a, b — the match keeps growing: pi = 1, 2, 1, 2.',
  s7n3: 'c breaks the match — fall back to zero. This is the heart of the algorithm: we don\'t start over, we drop to the next candidate.',
  s7n4: 'a, b — growing again. pi = 2 occurs at positions 4, 6, 9 — the pattern occurs in the text at positions 1, 3, and 6.',

  s8h: 'KMP: the full code',
  s8n1: 'On a mismatch we fall back through the pi chain instead of restarting the search.',
  s8n2: 'pi[i] == m means: a pattern of length m has just ended at this position of the string.',
  s8run: 'Run this code in the lesson — enter ababcab ab.',
  s8mark: 'The pointer j decreases no more than it increases over the whole pass — hence amortized O(n).',

  s9h: 'Task',
  s9task: 'Use the prefix function to find the smallest period of a string.',
  s9hint: 'The candidate: n − pi[n−1]. If n is evenly divisible by that value, that\'s the length of the period.',

  s10h: 'Remember',
  s10r1: 'A polynomial hash compares substrings in O(1) after O(n) preparation',
  s10r2: 'pi[i] — the length of the longest prefix-suffix ending at i',
  s10r3: 'Both tools are O(n) to precompute, never a square',
  s10r4: '"pattern # text" plus searching for pi == m finds every occurrence',
  s10cta: 'Find the smallest period of a string and mark the lesson as completed.',
  s10foot: 'Next up: number theory — modular arithmetic, fast exponentiation, and C(n, k) modulo a prime.',
};

export const stringAlgorithms: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
