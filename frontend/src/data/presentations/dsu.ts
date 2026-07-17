import type { LessonPresentationData } from './types';

// Presentation for the "Disjoint Set Union (DSU)" lesson
// (olympiad-roadmap → level-3-data-structures → dsu).
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
  s4n1: string; s4n2: string; s4n3: string; s4n4: string; s4n5: string; s4n6: string;

  s5h: string; s5n1: string; s5n2: string; s5n3: string; s5run: string;

  s6h: string; s6c1t: string; s6c1d: string; s6c2t: string; s6c2d: string; s6mark: string;

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

// dsuForest renders the exact trace from the lesson's own example (n=5):
// union 1 2, union 3 4, check 1 3 (NO), union 2 3, check 1 4 (YES, via path
// compression). Parent pointers are arcs drawn above a fixed row of nodes —
// arcs only ever get added (a tree only grows), except the final group,
// which dims the old 4→3 arc with a translucent overlay before drawing the
// flattened 4→1 pointer on top — the same overlay technique used throughout
// this series.
function dsuForest(l1: string, l2: string, l3: string, l4: string, l5: string): string {
  const cx = (k: number) => 60 + k * 110;
  const cy = 110, r = 22, topY = cy - r;

  const node = (k: number) =>
    `<circle cx="${cx(k)}" cy="${cy}" r="${r}" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.24)" stroke-width="1.5"/>` +
    `<text x="${cx(k)}" y="${cy + 6}" text-anchor="middle" fill="#cbd5e1" font-size="18" font-family="monospace">${k + 1}</text>`;

  const arcPath = (childK: number, parentK: number) => {
    const x1 = cx(childK), x2 = cx(parentK);
    const mid = (x1 + x2) / 2;
    const peak = topY - 26 - Math.abs(x2 - x1) * 0.12;
    return `M ${x1} ${topY} Q ${mid} ${peak} ${x2} ${topY}`;
  };
  const arc = (childK: number, parentK: number, color: string, w = 2.2) =>
    `<path d="${arcPath(childK, parentK)}" fill="none" stroke="${color}" stroke-width="${w}"/>` +
    `<circle cx="${cx(parentK)}" cy="${topY}" r="3.5" fill="${color}"/>`;
  const dimArc = (childK: number, parentK: number) =>
    `<path d="${arcPath(childK, parentK)}" fill="none" stroke="rgba(11,16,32,.72)" stroke-width="5"/>`;

  const label = (text: string, color: string) =>
    `<text x="20" y="196" fill="${color}" font-size="14" font-family="monospace">${text}</text>`;
  const noMark = () =>
    `<circle cx="${cx(0)}" cy="${cy}" r="${r + 4}" fill="none" stroke="${C.bad}" stroke-width="2"/>` +
    `<circle cx="${cx(2)}" cy="${cy}" r="${r + 4}" fill="none" stroke="${C.bad}" stroke-width="2"/>` +
    `<text x="${(cx(0) + cx(2)) / 2}" y="${cy - r - 12}" text-anchor="middle" fill="${C.bad}" font-size="16" font-weight="700">≠</text>`;
  const yesMark = () =>
    `<circle cx="${cx(0)}" cy="${cy}" r="${r + 4}" fill="none" stroke="${C.good}" stroke-width="2"/>` +
    `<circle cx="${cx(3)}" cy="${cy}" r="${r + 4}" fill="none" stroke="${C.good}" stroke-width="2"/>`;

  const g0 = [0, 1, 2, 3, 4].map(node).join('') + label(l1, '#8fa0ba');
  const g1 = arc(1, 0, C.acc) + label(l2, C.acc);
  const g2 = arc(3, 2, C.info) + label(l3, C.info);
  const g3 = noMark() + label(l4, C.bad);
  const g4 = arc(2, 0, C.warn);
  const g5 = dimArc(3, 2) + arc(3, 0, C.good, 2.6) + yesMark() + label(l5, C.good);

  return `<div class="lp-chart">
<svg viewBox="0 0 500 210" xmlns="http://www.w3.org/2000/svg" role="img">
  <g class="step" data-a="none" data-g="0">${g0}</g>
  <g class="step" data-a="none" data-g="1">${g1}</g>
  <g class="step" data-a="none" data-g="2">${g2}</g>
  <g class="step" data-a="none" data-g="3">${g3}</g>
  <g class="step" data-a="none" data-g="4">${g4}</g>
  <g class="step" data-a="none" data-g="5">${g5}</g>
</svg>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">find · union</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── The problem
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>❌ ${t.s2bad}</h3><p>${t.s2badD}</p></div>
  <div class="lp-card step" data-a="right"><h3>✅ ${t.s2good}</h3><p>${t.s2goodD}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s2mark}</span></p>`,

    // 3 ── The idea: forest of trees
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🌲</div><h3>${t.s3c1t}</h3><p>${t.s3c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">⬆️</div><h3>${t.s3c2t}</h3><p>${t.s3c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🤝</div><h3>${t.s3c3t}</h3><p>${t.s3c3d}</p></div>
</div>`,

    // 4 ── Animated forest trace
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<p class="lp-p lp-center" style="margin-top:0">${t.s4task}</p>
${dsuForest(t.s4n1, t.s4n2, t.s4n3, t.s4n4, t.s4n6)}
<div class="lp-notes" style="margin-top:4px">
  <div class="lp-card step" data-g="1" data-a="none"><p>${t.s4n2}</p></div>
  <div class="lp-card step" data-g="2" data-a="none"><p>${t.s4n3}</p></div>
  <div class="lp-card step" data-g="3" data-a="none"><p>${t.s4n4}</p></div>
  <div class="lp-card step" data-g="4" data-a="none"><p>${t.s4n5}</p></div>
  <div class="lp-card step" data-g="5" data-a="none"><p>${t.s4n6}</p></div>
</div>`,

    // 5 ── The full code
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">int find(int v) {
    if (parent[v] == v) return v;
    return parent[v] = find(parent[v]);
}
</span><span class="step" data-g="1" data-a="none">
void unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return;
</span><span class="step" data-g="2" data-a="none">    if (rnk[a] &lt; rnk[b]) std::swap(a, b);
    parent[b] = a;
    if (rnk[a] == rnk[b]) rnk[a]++;
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s5n3}</p></div>
  </div>
</div>
<p class="lp-foot lp-center step" data-g="3">▶ ${t.s5run}</p>`,

    // 6 ── The two heuristics
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>🗜️ ${t.s6c1t}</h3><p>${t.s6c1d}</p></div>
  <div class="lp-card step" data-a="right"><h3>⚖️ ${t.s6c2t}</h3><p>${t.s6c2d}</p></div>
</div>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s6mark}</span></p>`,

    // 7 ── Where DSU shines
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-cards">
  <div class="lp-card step"><div class="lp-emoji">🧩</div><h3>${t.s7c1t}</h3><p>${t.s7c1d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">🌐</div><h3>${t.s7c2t}</h3><p>${t.s7c2d}</p></div>
  <div class="lp-card step"><div class="lp-emoji">❓</div><h3>${t.s7c3t}</h3><p>${t.s7c3d}</p></div>
</div>`,

    // 8 ── Task teaser: group size
    `<h2 class="lp-h lp-center">${t.s8h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s8task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">📐</div><p>${t.s8hint}</p></div>`,

    // 9 ── Recap + call to action (level 3 complete)
    `<h2 class="lp-h lp-center">${t.s9h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">find</span><span><b>${t.s9r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">union</span><span><b>${t.s9r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.warn}">сжатие путей</span><span><b>${t.s9r3}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">α(n)</span><span><b>${t.s9r4}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s9cta}</p></div>
<p class="lp-foot lp-center step">${t.s9foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Путь олимпиадника · Уровень 3',
  title: 'Система непересекающихся множеств (DSU)',
  subtitle: 'find и union со сжатием путей — почти O(1) на «в одной ли они группе» и «объединить группы»',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Элементы объединяются в группы',
  s2bad: 'Наивно',
  s2badD: 'Хранить группы явно и пересчитывать их при каждом объединении — медленно на больших n.',
  s2good: 'DSU',
  s2goodD: 'Disjoint Set Union делает обе операции — проверку и объединение — почти за O(1).',
  s2mark: 'Два вопроса, которые нужны снова и снова: «a и b в одной группе?» и «объединить группы a и b».',

  s3h: 'Идея: лес деревьев',
  s3c1t: 'Группа — это дерево',
  s3c1d: 'Представитель группы — корень дерева. У корня parent указывает сам на себя.',
  s3c2t: 'find(v) поднимается до корня',
  s3c2d: 'Идём по parent, пока не найдём вершину, у которой parent[v] == v.',
  s3c3t: 'union подвешивает корень к корню',
  s3c3d: 'Находим корни обеих групп и делаем один parent-ом другого — деревья слились.',

  s4h: 'Трасса примера: n = 5',
  s4task: 'union 1 2 → union 3 4 → check 1 3 → union 2 3 → check 1 4',
  s4n1: '5 отдельных групп, каждая вершина сама себе корень.',
  s4n2: 'union 1 2: корни разные (1 и 2), делаем 2 ребёнком 1.',
  s4n3: 'union 3 4: аналогично — 4 становится ребёнком 3.',
  s4n4: 'check 1 3: find(1) = 1, find(3) = 3 — разные корни → NO.',
  s4n5: 'union 2 3: делаем 3 ребёнком 1 → теперь 1, 2, 3, 4 в одной группе.',
  s4n6: 'check 1 4: find(4) поднимается 4→3→1 и сжимает путь — 4 указывает прямо на 1 → YES.',

  s5h: 'find и union: весь код',
  s5n1: 'Если parent[v] == v — v сам корень. Иначе поднимаемся выше и СРАЗУ перевешиваем v на найденный корень — это и есть сжатие путей.',
  s5n2: 'Находим корни обеих групп. Уже в одной группе — делать нечего.',
  s5n3: 'Меньшее дерево (по рангу) подвешиваем к большему — дерево не растёт вглубь без нужды.',
  s5run: 'Запустите этот код в уроке — введите 5 5, затем union 1 2 / union 3 4 / check 1 3 / union 2 3 / check 1 4.',

  s6h: 'Две эвристики, которые всё решают',
  s6c1t: 'Сжатие путей',
  s6c1d: 'По дороге к корню перевешиваем все пройденные вершины сразу на корень. Следующий find по ним — мгновенный.',
  s6c2t: 'Объединение по рангу',
  s6c2d: 'Меньшее дерево подвешивается к большему — глубина дерева растёт крайне медленно.',
  s6mark: 'Вместе — амортизированная сложность равна обратной функции Аккермана: на практике неотличима от константы.',

  s7h: 'Где DSU стреляет',
  s7c1t: 'Компоненты связности',
  s7c1d: 'Считать их количество при постепенном добавлении рёбер — без пересчёта с нуля.',
  s7c2t: 'Алгоритм Краскала',
  s7c2d: 'Минимальный остов графа (уровень 4) построен ровно на проверке «в одной ли компоненте».',
  s7c3t: '«Объединить и спросить»',
  s7c3d: 'Любая задача с чередующимися union и check-запросами — прямое применение DSU.',

  s8h: 'Задание',
  s8task: 'Добавьте в DSU подсчёт размера каждой группы.',
  s8hint: 'Заведите массив size; при union делайте size[a] += size[b] у нового корня. Отвечайте на запрос «сколько элементов в группе x» за O(1) после find(x).',

  s9h: 'Запомнить',
  s9r1: 'find(v) поднимается до корня — представителя группы',
  s9r2: 'union(a, b) находит оба корня и подвешивает один к другому',
  s9r3: 'Сжатие путей делает повторный find по тем же вершинам мгновенным',
  s9r4: 'С обеими эвристиками сложность практически O(1)',
  s9cta: 'Добавьте подсчёт размера группы и отметьте урок пройденным — Уровень 3 завершён!',
  s9foot: 'Впереди Уровень 4: графы, BFS и DFS, кратчайшие пути и первая динамика.',
};

const ky: L = {
  kicker: 'Олимпиадачынын жолу · 3-деңгээл',
  title: 'Кесилишпеген көптүктөр системасы (DSU)',
  subtitle: 'Жолдорду кысуу менен find жана union — «алар бир топтобу» жана «топторду бириктир» дээрлик O(1)',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Элементтер топторго бирикет',
  s2bad: 'Жөнөкөй жол',
  s2badD: 'Топторду ачык сактап, ар бир бириктирүүдө кайра эсептөө — чоң n де жай.',
  s2good: 'DSU',
  s2goodD: 'Disjoint Set Union эки операцияны тең — текшерүү жана бириктирүүнү — дээрлик O(1) убакытта жасайт.',
  s2mark: 'Кайра-кайра керек болгон эки суроо: «a менен b бир топтобу?» жана «a менен b топторун бирикт».',

  s3h: 'Идея: дарактардын токою',
  s3c1t: 'Топ — бул дарак',
  s3c1d: 'Топтун өкүлү — дарактын тамыры. Тамырдын parent и өзүн көрсөтөт.',
  s3c2t: 'find(v) тамырга чейин көтөрүлөт',
  s3c2d: 'parent боюнча жүрөбүз, parent[v] == v болгон чокуну тапканча.',
  s3c3t: 'union тамырды тамырга илет',
  s3c3d: 'Эки топтун тамырын табабыз да, бирин экинчисине parent кылабыз — дарактар биригет.',

  s4h: 'Мисалдын трассасы: n = 5',
  s4task: 'union 1 2 → union 3 4 → check 1 3 → union 2 3 → check 1 4',
  s4n1: '5 өзүнчө топ, ар бир чоку өзүнө өзү тамыр.',
  s4n2: 'union 1 2: тамырлар башка (1 жана 2), 2 ни 1 дин баласы кылабыз.',
  s4n3: 'union 3 4: окшош — 4 3 түн баласы болот.',
  s4n4: 'check 1 3: find(1) = 1, find(3) = 3 — тамырлар башка → NO.',
  s4n5: 'union 2 3: 3 тү 1 дин баласы кылабыз → эми 1, 2, 3, 4 бир топто.',
  s4n6: 'check 1 4: find(4) 4→3→1 көтөрүлөт да жолду кысат — 4 түз 1 ди көрсөтөт → YES.',

  s5h: 'find жана union: толук код',
  s5n1: 'parent[v] == v болсо — v өзү тамыр. Болбосо жогору көтөрүлөбүз да ДАРООДОН v ни табылган тамырга кайра илебиз — так ушул жолду кысуу.',
  s5n2: 'Эки топтун тамырын табабыз. Эбак эле бир топто болсо — жасай турган эч нерсе жок.',
  s5n3: 'Кичине даракты (ранг боюнча) чоңуна илебиз — дарак керексиз тереңдикке чейин өспөйт.',
  s5run: 'Бул кодду сабактан иштетиңиз — 5 5, андан кийин union 1 2 / union 3 4 / check 1 3 / union 2 3 / check 1 4 киргизиңиз.',

  s6h: 'Баарын чечкен эки эвристика',
  s6c1t: 'Жолдорду кысуу',
  s6c1d: 'Тамырга бара жатып өтүлгөн бардык чокуларды дароо тамырга кайра илебиз. Кийинки find алар боюнча дароо болот.',
  s6c2t: 'Ранг боюнча бириктирүү',
  s6c2d: 'Кичине дарак чоңуна илинет — дарактын тереңдиги өтө жай өсөт.',
  s6mark: 'Экөө чогуу — амортизацияланган татаалдык Аккермандын тескери функциясына барабар: иш жүзүндө константадан айырмаланбайт.',

  s7h: 'DSU кайда атат',
  s7c1t: 'Байланыш компоненттери',
  s7c1d: 'Кырларды бирден кошуп жатып алардын санын эсептөө — нөлдөн кайра эсептебей эле.',
  s7c2t: 'Краскалдын алгоритми',
  s7c2d: 'Графтын минималдуу каркасы (4-деңгээл) так «бир компонентте беле» текшерүүсүнүн үстүнө курулган.',
  s7c3t: '«Бириктир жана сура»',
  s7c3d: 'union жана check суроолору кезектешкен каалаган маселе — DSU нин түз колдонулушу.',

  s8h: 'Тапшырма',
  s8task: 'DSU структурасына ар бир топтун өлчөмүн эсептөөнү кошуңуз.',
  s8hint: 'size массивин ачыңыз; union до жаңы тамырда size[a] += size[b] жасаңыз. «x тобунда канча элемент бар» суроосуна find(x) дон кийин O(1) убакытта жооп бериңиз.',

  s9h: 'Эсте сакта',
  s9r1: 'find(v) тамырга — топтун өкүлүнө чейин көтөрүлөт',
  s9r2: 'union(a, b) эки тамырды таап, бирин экинчисине илет',
  s9r3: 'Жолдорду кысуу ошол эле чокулар боюнча кайра find ди дароо кылат',
  s9r4: 'Эки эвристика менен татаалдык иш жүзүндө O(1)',
  s9cta: 'Топтун өлчөмүн эсептөөнү кошуп, сабакты өттүм деп белгилеңиз — 3-деңгээл аяктады!',
  s9foot: 'Алдыда 4-деңгээл: графтар, BFS жана DFS, эң кыска жолдор жана биринчи динамика.',
};

const en: L = {
  kicker: 'Competitive Programming Path · Level 3',
  title: 'Disjoint Set Union (DSU)',
  subtitle: 'find and union with path compression — almost O(1) for "same group?" and "merge groups"',
  press: 'Press → or Space to advance',

  s2h: 'Elements merge into groups',
  s2bad: 'The naive way',
  s2badD: 'Keeping groups explicit and recomputing them on every merge — slow at large n.',
  s2good: 'DSU',
  s2goodD: 'Disjoint Set Union does both operations — checking and merging — in almost O(1).',
  s2mark: 'Two questions you need over and over: "are a and b in the same group?" and "merge the groups of a and b".',

  s3h: 'The idea: a forest of trees',
  s3c1t: 'A group is a tree',
  s3c1d: 'The group\'s representative is the tree\'s root. At the root, parent points to itself.',
  s3c2t: 'find(v) climbs to the root',
  s3c2d: 'Follow parent until you reach a vertex where parent[v] == v.',
  s3c3t: 'union hangs one root under another',
  s3c3d: 'Find both groups\' roots and make one the parent of the other — the trees merge.',

  s4h: 'The example trace: n = 5',
  s4task: 'union 1 2 → union 3 4 → check 1 3 → union 2 3 → check 1 4',
  s4n1: '5 separate groups, every vertex is its own root.',
  s4n2: 'union 1 2: different roots (1 and 2), make 2 a child of 1.',
  s4n3: 'union 3 4: same thing — 4 becomes a child of 3.',
  s4n4: 'check 1 3: find(1) = 1, find(3) = 3 — different roots → NO.',
  s4n5: 'union 2 3: make 3 a child of 1 → now 1, 2, 3, 4 share a group.',
  s4n6: 'check 1 4: find(4) climbs 4→3→1 and compresses the path — 4 now points straight at 1 → YES.',

  s5h: 'find and union: the full code',
  s5n1: 'If parent[v] == v, v is its own root. Otherwise climb higher, then IMMEDIATELY re-hang v onto the root you found — that\'s path compression.',
  s5n2: 'Find both groups\' roots. Already in the same group — nothing to do.',
  s5n3: 'The smaller tree (by rank) is hung under the larger one — the tree never grows deep without a reason.',
  s5run: 'Run this code in the lesson — enter 5 5, then union 1 2 / union 3 4 / check 1 3 / union 2 3 / check 1 4.',

  s6h: 'Two heuristics that make it fly',
  s6c1t: 'Path compression',
  s6c1d: 'On the way to the root, re-hang every visited vertex directly onto the root. The next find over them is instant.',
  s6c2t: 'Union by rank',
  s6c2d: 'The smaller tree is hung under the larger one — tree depth grows extremely slowly.',
  s6mark: 'Together, the amortized complexity equals the inverse Ackermann function: in practice, indistinguishable from a constant.',

  s7h: 'Where DSU shines',
  s7c1t: 'Connected components',
  s7c1d: 'Count them as edges are added one at a time — no recomputing from scratch.',
  s7c2t: 'Kruskal\'s algorithm',
  s7c2d: 'A graph\'s minimum spanning tree (level 4) is built directly on the "same component?" check.',
  s7c3t: '"Merge and query"',
  s7c3d: 'Any problem alternating union and check requests is a direct application of DSU.',

  s8h: 'Task',
  s8task: 'Add group-size tracking to the DSU.',
  s8hint: 'Add a size array; on union, at the new root do size[a] += size[b]. Answer "how many elements are in the group of x" in O(1) after find(x).',

  s9h: 'Remember',
  s9r1: 'find(v) climbs to the root — the group\'s representative',
  s9r2: 'union(a, b) finds both roots and hangs one under the other',
  s9r3: 'Path compression makes the next find over the same vertices instant',
  s9r4: 'With both heuristics, complexity is practically O(1)',
  s9cta: 'Add group-size tracking and mark the lesson as completed — Level 3 is done!',
  s9foot: 'Up next, Level 4: graphs, BFS and DFS, shortest paths, and the first dynamic programming.',
};

export const dsu: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
