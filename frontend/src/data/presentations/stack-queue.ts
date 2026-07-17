import type { LessonPresentationData } from './types';

// Presentation for the "Stack and Queue" lesson
// (olympiad-roadmap → level-3-data-structures → stack-queue).
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
  s3lab1: string; s3lab2: string; s3lab3: string; s3lab4: string;
  s3n1: string; s3n2: string; s3n3: string; s3n4: string;

  s4h: string; s4n1: string; s4n2: string; s4n3: string; s4run: string;

  s5h: string; s5e1t: string; s5e1d: string; s5e2t: string; s5e2d: string; s5mark: string;

  s6h: string; s6n1: string; s6n2: string; s6mark: string;

  s7h: string; s7n1: string; s7n2: string; s7run: string;

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

// bracketTrace renders the stack trace for "([]{}())": the input string sits
// on top as 8 fixed boxes, a two-slot stack column sits below. Each reveal
// group rings the two input chars just processed and re-fills or re-empties
// the affected stack slot (overlay technique: a fresh rect drawn later in
// the DOM simply paints over the previous content, so slots can "empty"
// again without ever removing an already-revealed element).
function bracketTrace(lab1: string, lab2: string, lab3: string, lab4: string): string {
  const chars = ['(', '[', ']', '{', '}', '(', ')', ')'];
  const ix = (k: number) => 24 + k * 62;
  const icx = (k: number) => ix(k) + 22;
  const iy = 14;
  const iw = 44;

  const inBox = (k: number) =>
    `<rect x="${ix(k)}" y="${iy}" width="${iw}" height="${iw}" rx="9" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.16)"/>` +
    `<text x="${icx(k)}" y="${iy + 29}" text-anchor="middle" fill="#cbd5e1" font-size="21" font-family="monospace">${chars[k]}</text>`;
  const ring = (k: number, color: string) =>
    `<rect x="${ix(k) - 3}" y="${iy - 3}" width="${iw + 6}" height="${iw + 6}" rx="11" fill="none" stroke="${color}" stroke-width="2.5"/>`;

  const slot = { 0: { x: 240, y: 136 }, 1: { x: 240, y: 78 } } as const;
  const sw = 76, sh = 50;
  const empty = (i: 0 | 1) =>
    `<rect x="${slot[i].x}" y="${slot[i].y}" width="${sw}" height="${sh}" rx="10" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.14)" stroke-dasharray="4 4"/>`;
  const fill = (i: 0 | 1, ch: string, color: string) =>
    `<rect x="${slot[i].x}" y="${slot[i].y}" width="${sw}" height="${sh}" rx="10" fill="${color}22" stroke="${color}" stroke-width="2"/>` +
    `<text x="${slot[i].x + sw / 2}" y="${slot[i].y + 33}" text-anchor="middle" fill="${color}" font-size="23" font-weight="700" font-family="monospace">${ch}</text>`;

  const topLabel = `<text x="${slot[1].x + sw + 14}" y="${slot[1].y + 30}" fill="#64748b" font-size="13">← top</text>`;
  const inline = (text: string, color: string) =>
    `<text x="24" y="206" fill="${color}" font-size="15" font-family="monospace">${text}</text>`;

  const g0 = [0, 1, 2, 3, 4, 5, 6, 7].map(inBox).join('') + empty(0) + empty(1) + topLabel;
  const g1 = ring(0, C.acc) + ring(1, C.acc) + fill(0, '(', C.acc) + fill(1, '[', C.acc) + inline(lab1, C.acc);
  const g2 = ring(2, C.info) + ring(3, C.info) + fill(1, '{', C.info) + inline(lab2, C.info);
  const g3 = ring(4, C.warn) + ring(5, C.warn) + fill(1, '(', C.warn) + inline(lab3, C.warn);
  const g4 = ring(6, C.good) + ring(7, C.good) + empty(1) + empty(0) + inline(lab4, C.good);

  return `<div class="lp-chart">
<svg viewBox="0 0 560 220" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <div class="lp-bigo" aria-hidden="true">LIFO / FIFO</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The idea: two orders of removal
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🍽️</div><h3>${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🚶</div><h3>${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🧰</div><h3>${t.s2c3t}</h3><p>${t.s2c3d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── Animated bracket-stack trace
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s3task}</p>
<div class="lp-cols">
  ${bracketTrace(t.s3lab1, t.s3lab2, t.s3lab3, t.s3lab4)}
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
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::stack&lt;char&gt; st;
for (char c : s) {
    if (c == '(' || c == '[' || c == '{') {
        st.push(c);
</span><span class="step" data-g="1" data-a="none">    } else {
        if (st.empty()) { ok = false; break; }
        char open = st.top();
        st.pop();
        if (/* c не пара open */) ok = false;
</span><span class="step" data-g="2" data-a="none">    }
}
if (ok &amp;&amp; st.empty()) std::cout &lt;&lt; "YES";</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s4n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s4n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s4n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s4run}</p>`,

    // 5 ── The two easily-forgotten checks
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>❌ ${t.s5e1t}</h3><p>${t.s5e1d}</p></div>
  <div class="lp-card step" data-a="right"><h3>❌ ${t.s5e2t}</h3><p>${t.s5e2d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s5mark}</span></p>`,

    // 6 ── The queue: service order
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-chips" style="margin-top:8px">
  <span class="lp-chip step" data-g="0" style="--c:${C.info}">Азат</span>
  <span class="lp-chip step" data-g="0" style="--c:${C.info}">Айгуль</span>
  <span class="lp-chip step" data-g="0" style="--c:${C.info}">Бек</span>
</div>
<div class="lp-scale" style="margin-top:16px">
  <div class="lp-row lp-quiz step" data-g="1"><span class="lp-chip" style="--c:${C.good}">1</span><span>Азат</span><code class="lp-mini">front → pop</code></div>
  <div class="lp-row lp-quiz step" data-g="2"><span class="lp-chip" style="--c:${C.good}">2</span><span>Айгуль</span><code class="lp-mini">front → pop</code></div>
  <div class="lp-row lp-quiz step" data-g="3"><span class="lp-chip" style="--c:${C.good}">3</span><span>Бек</span><code class="lp-mini">front → pop</code></div>
</div>
<div class="lp-notes step" data-g="4">
  <div class="lp-card" data-a="none"><p>${t.s6n1}</p></div>
  <div class="lp-card" data-a="none"><p>${t.s6n2}</p></div>
</div>
<p class="lp-p lp-center step" data-g="5"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Queue: full code
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::queue&lt;std::string&gt; q;
q.push("Азат");
q.push("Айгуль");
q.push("Бек");
</span><span class="step" data-g="1" data-a="none">
while (!q.empty()) {
    std::cout &lt;&lt; q.front() &lt;&lt; "\\n";
    q.pop();
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s7n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s7n2}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s7run}</p>`,

    // 8 ── Task teaser: deepest nesting
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">📏</div><p>${t.s8hint}</p></div>`,

    // 9 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">LIFO</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">FIFO</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">top / front</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">empty()</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 3',
  title: 'Стек и очередь',
  subtitle: 'Две простейшие структуры данных: LIFO и FIFO — скобочные последовательности и порядок обработки',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Две структуры — два порядка извлечения',
  s2c1t: 'Стек — LIFO',
  s2c1d: 'Last in, first out: последним пришёл — первым ушёл. Как стопка тарелок.',
  s2c2t: 'Очередь — FIFO',
  s2c2d: 'First in, first out: первым пришёл — первым ушёл. Как очередь в магазине.',
  s2c3t: 'В C++',
  s2c3d: 'Стек — std::stack (push, top, pop). Очередь — std::queue (push, front, pop).',
  s2mark: 'Одна и та же операция push значит разное: у стека следующий выйдет он, у очереди — самый первый.',

  s3h: 'Стек в деле: проверка скобок',
  s3task: 'Строка ( [ ] { } ( ) ). Открывающая — кладём в стек, закрывающая — сверяем с вершиной.',
  s3lab1: 'стек: ( [',
  s3lab2: 'стек: ( {',
  s3lab3: 'стек: ( (',
  s3lab4: 'стек: пуст → YES',
  s3n1: '( и [ — обе открывающие, кладём одну за другой. Вершина стека — [.',
  s3n2: '] сверяем с вершиной [ — совпало, снимаем. Затем { — новая открывающая наверх.',
  s3n3: '} сверяем с вершиной { — совпало, снимаем. Затем новая ( наверх.',
  s3n4: 'Обе ) по очереди снимают обе ( — стек опустел вовремя с концом строки.',

  s4h: 'Проверка скобок: весь код',
  s4n1: 'Открывающая — просто кладём в стек, не проверяя ничего.',
  s4n2: 'Закрывающая — смотрим вершину (что открыто последним) и снимаем её. Не совпал тип — ошибка.',
  s4n3: 'В конце стек обязан быть пуст: незакрытые скобки — тоже ошибка.',
  s4run: 'Запустите этот код в уроке — введите ([]{}())',

  s5h: 'Две проверки, которые часто забывают',
  s5e1t: 'Закрывающая при пустом стеке',
  s5e1d: 'Лишняя закрывающая скобка без пары — стек пуст, снимать нечего.',
  s5e2t: 'Непустой стек в конце',
  s5e2d: 'Незакрытые скобки остались на стеке — строка не годится, даже если ни одна ошибка не всплыла раньше.',
  s5mark: 'Без этих двух проверок «принимающий» алгоритм пропустит половину неверных строк.',

  s6h: 'Очередь: кто раньше пришёл — того раньше обслужили',
  s6n1: 'push кладёт в конец очереди, front всегда смотрит на самого первого.',
  s6n2: 'Очередь лежит в основе обхода в ширину (BFS) — он ждёт вас на уровне 4.',
  s6mark: 'Тот же порядок, что и в жизни: без права пройти без очереди.',

  s7h: 'Очередь: весь код',
  s7n1: 'Три человека встают в очередь по порядку прихода.',
  s7n2: 'Каждый front() — самый первый из ещё не обслуженных, pop() убирает его.',
  s7run: 'Запустите этот код в уроке.',

  s8h: 'Задание',
  s8task: 'По строке из скобок найдите длину самого глубокого вложения.',
  s8hint: 'Это максимальный размер стека за всё время обработки строки. Для одного вида скобок хватит даже простого счётчика вместо std::stack.',

  s9h: 'Запомнить',
  s9r1: 'Стек — последний пришедший уходит первым',
  s9r2: 'Очередь — первый пришедший уходит первым',
  s9r3: 'top() смотрит вершину стека, front() — голову очереди',
  s9r4: 'Перед top()/front()/pop() всегда проверяйте empty()',
  s9cta: 'Решите прикреплённую задачу на глубину вложенности и отметьте урок пройденным.',
  s9foot: 'Дальше — set и map: быстрые проверки принадлежности за O(log n).',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 3-деңгээл',
  title: 'Стек жана кезек',
  subtitle: 'Эң жөнөкөй эки маалымат структурасы: LIFO жана FIFO — кашаа ырааттуулуктары жана иштетүү тартиби',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Эки структура — эки алып чыгуу тартиби',
  s2c1t: 'Стек — LIFO',
  s2c1d: 'Last in, first out: акыркы келген — биринчи чыгат. Табактардын үймөгү сыяктуу.',
  s2c2t: 'Кезек — FIFO',
  s2c2d: 'First in, first out: биринчи келген — биринчи чыгат. Дүкөндөгү кезек сыяктуу.',
  s2c3t: 'C++ тилинде',
  s2c3d: 'Стек — std::stack (push, top, pop). Кезек — std::queue (push, front, pop).',
  s2mark: 'push операциясы эки жерде тең бар, бирок мааниси башка: стекте кийинки чыгуучу — так ушул, кезекте — эң биринчиси.',

  s3h: 'Стек иштин үстүндө: кашааларды текшерүү',
  s3task: '( [ ] { } ( ) ) сабы. Ачуучуну стекке коёбуз, жабуучуну чокудагы менен салыштырабыз.',
  s3lab1: 'стек: ( [',
  s3lab2: 'стек: ( {',
  s3lab3: 'стек: ( (',
  s3lab4: 'стек: бош → YES',
  s3n1: '( жана [ — экөө тең ачуучу, бирин артынан бирин коёбуз. Стектин чокусу — [.',
  s3n2: '] чокудагы [ менен салыштырабыз — дал келди, алабыз. Андан кийин { — жаңы ачуучу үстүнө.',
  s3n3: '} чокудагы { менен салыштырабыз — дал келди, алабыз. Андан кийин жаңы ( үстүнө.',
  s3n4: 'Эки ) кезеги менен эки ( ды алат — стек сап аягында дал өз убагында бошоду.',

  s4h: 'Кашааларды текшерүү: толук код',
  s4n1: 'Ачуучу — эч нерсе текшербей эле стекке коёбуз.',
  s4n2: 'Жабуучу — чокуну (акыркы ачылганды) карап, аны алабыз. Түрү дал келбесе — ката.',
  s4n3: 'Аягында стек милдеттүү түрдө бош болушу керек: жабылбаган кашаалар да ката.',
  s4run: 'Бул кодду сабактан иштетиңиз — ([]{}()) киргизиңиз',

  s5h: 'Көп унутулган эки текшерүү',
  s5e1t: 'Стек бош болгондо жабуучу',
  s5e1d: 'Жубу жок ашыкча жабуучу кашаа — стек бош, алар турган эч нерсе жок.',
  s5e2t: 'Аягында бош эмес стек',
  s5e2d: 'Стекте жабылбаган кашаалар калды — сап жарабайт, мурда бир да ката чыкпаса дагы.',
  s5mark: 'Бул эки текшерүүсүз алгоритм туура эмес саптардын жарымын өткөрүп жиберет.',

  s6h: 'Кезек: ким мурда келсе — ошол мурда тейленет',
  s6n1: 'push кезектин аягына коёт, front дайыма эң биринчисине карайт.',
  s6n2: 'Кезек туурасынан кыдыруунун (BFS) негизинде жатат — ал сизди 4-деңгээлде күтөт.',
  s6mark: 'Турмуштагыдай эле тартип: кезексиз өтүүгө укук жок.',

  s7h: 'Кезек: толук код',
  s7n1: 'Үч адам келген тартиби боюнча кезекке турат.',
  s7n2: 'Ар бир front() — тейленбегендердин эң биринчиси, pop() аны алып салат.',
  s7run: 'Бул кодду сабактан иштетиңиз.',

  s8h: 'Тапшырма',
  s8task: 'Кашаалардан турган сап боюнча эң терең уялоонун узундугун табыңыз.',
  s8hint: 'Бул сапты иштетүү учурундагы стектин максималдуу өлчөмү. Бир түрдөгү кашаа үчүн std::stack ордуна жөнөкөй эсептегич да жетет.',

  s9h: 'Эсте сакта',
  s9r1: 'Стек — акыркы келген биринчи чыгат',
  s9r2: 'Кезек — биринчи келген биринчи чыгат',
  s9r3: 'top() стектин чокусун, front() кезектин башын карайт',
  s9r4: 'top()/front()/pop() дан мурун дайыма empty() ди текшериңиз',
  s9cta: 'Тиркелген уялоо тереңдиги маселесин чечиңиз жана сабакты өттүм деп белгилеңиз.',
  s9foot: 'Андан ары — set жана map: таандыктыкты O(log n) убакытта тез текшерүү.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 3',
  title: 'Stack and Queue',
  subtitle: 'The two simplest data structures: LIFO and FIFO — bracket sequences and processing order',
  press: 'Press → or Space to advance',

  s2h: 'Two structures — two removal orders',
  s2c1t: 'Stack — LIFO',
  s2c1d: 'Last in, first out: the last one in is the first one out. Like a pile of plates.',
  s2c2t: 'Queue — FIFO',
  s2c2d: 'First in, first out: the first one in is the first one out. Like a line at a shop.',
  s2c3t: 'In C++',
  s2c3d: 'The stack is std::stack (push, top, pop). The queue is std::queue (push, front, pop).',
  s2mark: 'The same push operation means something different: on a stack the next one out is it; on a queue, it\'s the very first.',

  s3h: 'The stack at work: checking brackets',
  s3task: 'The string ( [ ] { } ( ) ). An opener goes onto the stack, a closer is checked against the top.',
  s3lab1: 'stack: ( [',
  s3lab2: 'stack: ( {',
  s3lab3: 'stack: ( (',
  s3lab4: 'stack: empty → YES',
  s3n1: '( and [ are both openers, pushed one after the other. The top of the stack is [.',
  s3n2: '] is checked against the top [ — a match, pop it. Then { — a new opener goes on top.',
  s3n3: '} is checked against the top { — a match, pop it. Then a new ( goes on top.',
  s3n4: 'Both ) in turn pop the two ( — the stack empties right as the string ends.',

  s4h: 'Checking brackets: the full code',
  s4n1: 'An opener — just push it, no checks needed.',
  s4n2: 'A closer — look at the top (whatever was opened last) and pop it. A mismatched type is an error.',
  s4n3: 'At the end the stack must be empty: unclosed brackets are an error too.',
  s4run: 'Run this code in the lesson — enter ([]{}())',

  s5h: 'Two checks people often forget',
  s5e1t: 'A closer on an empty stack',
  s5e1d: 'A stray closing bracket with no pair — the stack is empty, there is nothing to pop.',
  s5e2t: 'A non-empty stack at the end',
  s5e2d: 'Unclosed brackets are left on the stack — the string is invalid, even if no error surfaced earlier.',
  s5mark: 'Without these two checks, an "accepting" algorithm lets through half of the invalid strings.',

  s6h: 'The queue: first come, first served',
  s6n1: 'push adds to the back of the queue, front always looks at the very first one.',
  s6n2: 'The queue underlies breadth-first search (BFS) — it awaits you at level 4.',
  s6mark: 'The same order as in real life: no cutting in line.',

  s7h: 'The queue: the full code',
  s7n1: 'Three people join the queue in the order they arrive.',
  s7n2: 'Each front() is the first of the unserved — pop() removes them.',
  s7run: 'Run this code in the lesson.',

  s8h: 'Task',
  s8task: 'Given a string of brackets, find the depth of the deepest nesting.',
  s8hint: 'It is the maximum stack size over the whole run. For a single bracket kind, even a plain counter works instead of std::stack.',

  s9h: 'Remember',
  s9r1: 'Stack — the last one in is the first one out',
  s9r2: 'Queue — the first one in is the first one out',
  s9r3: 'top() looks at the stack\'s top, front() at the queue\'s head',
  s9r4: 'Always check empty() before top()/front()/pop()',
  s9cta: 'Solve the attached nesting-depth problem and mark the lesson as completed.',
  s9foot: 'Next up: set and map — fast membership tests in O(log n).',
};

export const stackQueue: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
