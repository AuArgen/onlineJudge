import type { LessonPresentationData } from './types';

// Presentation for the "Your First Program and Output" lesson
// (course-cpp → cpp-first-program). First lesson of the C++ course — a much
// lighter, more welcoming tone than the olympiad-roadmap decks: no algorithm
// to trace, so the flagship visual is a mock terminal that "runs" the code.
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

  s3h: string;
  s3n1: string; s3n2: string; s3n3: string; s3n4: string; s3n5: string;
  s3run: string;

  s4h: string; s4line: string; s4mark: string;

  s5h: string; s5n1: string; s5n2: string; s5run: string;

  s6h: string; s6task: string; s6hint: string;

  s7h: string; s7r1: string; s7r2: string; s7r3: string;
  s7cta: string; s7foot: string;
}

const C = {
  good: '#34d399',
  bad: '#f87171',
  warn: '#fbbf24',
  info: '#60a5fa',
  acc: '#818cf8',
};

// terminal renders a small mock console. lines is an array of already-
// revealed output lines (always shown); the optional typed line is wrapped
// in its own .step so it fades/types in as its reveal group is reached.
function terminal(lines: string[], prompt: string): string {
  const rows = lines.map((l) => `<div class="lp-term-line">${l}</div>`).join('');
  return `<div class="lp-term">
  <div class="lp-term-bar"><span></span><span></span><span></span></div>
  <div class="lp-term-body">
    <div class="lp-term-line lp-term-prompt">${prompt}</div>
    ${rows}
  </div>
</div>`;
}

function buildSlides(t: L): string[] {
  return [
    // 1 ── Title
    `<div class="lp-center">
  <div class="lp-kicker">${t.kicker}</div>
  <div class="lp-bigo" aria-hidden="true">Hello, World!</div>
  <h1 class="lp-title">${t.title}</h1>
  <p class="lp-sub step">${t.subtitle}</p>
  <p class="lp-foot step">${t.press}</p>
</div>`,

    // 2 ── What is a program?
    `<h2 class="lp-h lp-center">${t.s2h}</h2>
<div class="lp-cols">
  <div class="lp-card step" data-a="left"><h3>📝 ${t.s2c1t}</h3><p>${t.s2c1d}</p></div>
  <div class="lp-card step" data-a="right"><h3>⚙️ ${t.s2c2t}</h3><p>${t.s2c2d}</p></div>
</div>`,

    // 3 ── The famous first program, line by line, with a live terminal payoff
    `<h2 class="lp-h lp-center">${t.s3h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">#include &lt;iostream&gt;
</span><span class="step" data-g="1" data-a="none">
int main() {
</span><span class="step" data-g="2" data-a="none">    std::cout &lt;&lt; "Hello, World!" &lt;&lt; std::endl;
</span><span class="step" data-g="3" data-a="none">    return 0;
}</span></pre>
  <div class="lp-notes">
    <div class="lp-card step" data-g="0" data-a="right"><p>${t.s3n1}</p></div>
    <div class="lp-card step" data-g="1" data-a="right"><p>${t.s3n2}</p></div>
    <div class="lp-card step" data-g="2" data-a="right"><p>${t.s3n3} ${t.s3n4}</p></div>
    <div class="lp-card step" data-g="3" data-a="right"><p>${t.s3n5}</p></div>
  </div>
</div>
<div class="step" data-g="4">
  ${terminal(['Hello, World!'], './program')}
</div>
<p class="lp-foot lp-center step" data-g="4">▶ ${t.s3run}</p>`,

    // 4 ── Try it yourself
    `<h2 class="lp-h lp-center">${t.s4h}</h2>
<div class="lp-center">
  <div class="lp-big step" data-a="zoom" style="font-size:clamp(1.1rem,3.4vw,1.7rem)">"Hello, World!" → ваш текст</div>
</div>
<p class="lp-p lp-center step" style="margin-top:16px">${t.s4line}</p>
<p class="lp-p lp-center step"><span class="lp-mark">${t.s4mark}</span></p>`,

    // 5 ── cout prints text AND calculations
    `<h2 class="lp-h lp-center">${t.s5h}</h2>
<div class="lp-cols">
  <pre class="lp-code"><span class="step" data-g="0" data-a="none">std::cout &lt;&lt; "2 + 2 = " &lt;&lt; 2 + 2 &lt;&lt; std::endl;
</span><span class="step" data-g="1" data-a="none">std::cout &lt;&lt; "10 * 10 = " &lt;&lt; 10 * 10 &lt;&lt; std::endl;</span></pre>
  ${terminal(['2 + 2 = 4', '10 * 10 = 100'], './program')}
</div>
<div class="lp-notes" style="margin-top:6px">
  <div class="lp-card step" data-g="0" data-a="right"><p>${t.s5n1}</p></div>
  <div class="lp-card step" data-g="1" data-a="right"><p>${t.s5n2}</p></div>
</div>
<p class="lp-foot lp-center step" data-g="2">▶ ${t.s5run}</p>`,

    // 6 ── Task
    `<h2 class="lp-h lp-center">${t.s6h}</h2>
<p class="lp-p lp-center step" style="margin-top:0">${t.s6task}</p>
<div class="lp-card lp-cta step"><div class="lp-emoji">✍️</div><p>${t.s6hint}</p></div>`,

    // 7 ── Recap + call to action
    `<h2 class="lp-h lp-center">${t.s7h}</h2>
<div class="lp-scale">
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.acc}">#include</span><span><b>${t.s7r1}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.info}">main()</span><span><b>${t.s7r2}</b></span></div>
  <div class="lp-row step"><span class="lp-chip" style="--c:${C.good}">std::cout</span><span><b>${t.s7r3}</b></span></div>
</div>
<div class="lp-card lp-cta step"><div class="lp-emoji">🏆</div><p>${t.s7cta}</p></div>
<p class="lp-foot lp-center step">${t.s7foot}</p>`,
  ];
}

const ru: L = {
  kicker: 'Курс C++ с нуля · Урок 1',
  title: 'Первая программа и вывод на экран',
  subtitle: 'Ваш самый первый шаг в программировании — напишем и запустим код на C++',
  press: 'Нажмите → или пробел, чтобы листать',

  s2h: 'Что такое программа',
  s2c1t: 'Исходный код',
  s2c1d: 'Последовательность команд, которую вы пишете в файле — понятная человеку.',
  s2c2t: 'Компилятор',
  s2c2d: 'Превращает исходный код в исполняемый файл, который умеет выполнять компьютер.',

  s3h: 'Самая известная программа в мире',
  s3n1: 'Подключает библиотеку ввода-вывода — без неё std::cout работать не будет.',
  s3n2: 'Главная функция: с неё начинается выполнение любой программы на C++.',
  s3n3: 'std::cout выводит текст на экран — то, что справа от «<<».',
  s3n4: 'std::endl переводит строку — курсор переходит на следующую.',
  s3n5: 'return 0 сообщает системе: программа завершилась успешно.',
  s3run: 'Запустите этот код в уроке и посмотрите на результат сами.',

  s4h: 'Попробуйте сами',
  s4line: 'Измените текст в кавычках прямо в блоке кода урока — и запустите программу ещё раз.',
  s4mark: 'Программирование — это эксперимент. Не бойтесь менять код и смотреть, что получится.',

  s5h: 'cout умеет больше, чем просто текст',
  s5n1: 'Между кавычками — обычный текст. После «<<» без кавычек — вычисление: 2 + 2 посчитается само.',
  s5n2: 'Можно выводить сколько угодно значений подряд одной строкой — просто добавляйте «<<».',
  s5run: 'Запустите этот код в уроке — сравните вывод с тем, что видите здесь.',

  s6h: 'Задание для закрепления',
  s6task: 'Выведите три строки: своё имя, свой город и результат вычисления 7 * 6.',
  s6hint: 'Каждое значение — на отдельной строке. Используйте std::endl после каждого std::cout.',

  s7h: 'Запомнить',
  s7r1: '#include подключает нужную библиотеку',
  s7r2: 'int main() { ... } — точка входа в программу',
  s7r3: 'std::cout << ... выводит текст и результаты вычислений',
  s7cta: 'Выполните задание и отметьте урок пройденным.',
  s7foot: 'Дальше — переменные и типы данных: как хранить числа, текст и логические значения.',
};

const ky: L = {
  kicker: 'C++ курсу нөлдөн · 1-сабак',
  title: 'Биринчи программа жана экранга чыгаруу',
  subtitle: 'Программалоодогу эң биринчи кадамыңыз — C++ тилинде код жазып, иштетип көрөлү',
  press: 'Барактоо үчүн → же боштук баскычын басыңыз',

  s2h: 'Программа деген эмне',
  s2c1t: 'Баштапкы код',
  s2c1d: 'Сиз файлда жазган буйруктардын ырааттуулугу — адамга түшүнүктүү.',
  s2c2t: 'Компилятор',
  s2c2d: 'Баштапкы кодду компьютер аткара ала турган иштетилүүчү файлга айландырат.',

  s3h: 'Дүйнөдөгү эң белгилүү программа',
  s3n1: 'Киргизүү-чыгаруу китепканасын кошот — ансыз std::cout иштебейт.',
  s3n2: 'Башкы функция: C++ тилиндеги ар кандай программанын аткарылышы дал ушундан башталат.',
  s3n3: 'std::cout экранга текстти чыгарат — «<<» дин оң жагындагысын.',
  s3n4: 'std::endl сапты которот — курсор кийинки сапка өтөт.',
  s3n5: 'return 0 системага айтат: программа ийгиликтүү аяктады.',
  s3run: 'Бул кодду сабактан иштетип, жыйынтыгын өзүңүз көрүңүз.',

  s4h: 'Өзүңүз сынап көрүңүз',
  s4line: 'Сабактагы код блогунда тырмакчанын ичиндеги текстти өзгөртүп, программаны кайра иштетиңиз.',
  s4mark: 'Программалоо — бул эксперимент. Кодду өзгөртүүдөн жана эмне чыгарын көрүүдөн коркпоңуз.',

  s5h: 'cout жөн эле текстен көбүрөөк нерсени билет',
  s5n1: 'Тырмакчанын ичинде — кадимки текст. «<<» дан кийин тырмакчасыз — эсептөө: 2 + 2 өзү эсептелет.',
  s5n2: 'Бир сапта каалагыз чейин маани чыгарууга болот — жөн гана «<<» кошуп эле.',
  s5run: 'Бул кодду сабактан иштетиңиз — чыгарылышын бул жердегиси менен салыштырыңыз.',

  s6h: 'Бекемдөө үчүн тапшырма',
  s6task: 'Үч сап чыгарыңыз: өз атыңызды, өз шаарыңызды жана 7 * 6 эсептөөсүнүн жыйынтыгын.',
  s6hint: 'Ар бир маани — өзүнчө сапта. Ар бир std::cout тен кийин std::endl колдонуңуз.',

  s7h: 'Эсте сакта',
  s7r1: '#include керектүү китепкананы кошот',
  s7r2: 'int main() { ... } — программага кирүү чекити',
  s7r3: 'std::cout << ... текстти жана эсептөө жыйынтыктарын чыгарат',
  s7cta: 'Тапшырманы аткарып, сабакты өттүм деп белгилеңиз.',
  s7foot: 'Андан ары — өзгөрмөлөр жана маалымат түрлөрү: сандарды, текстти жана логикалык маанилерди кантип сактоо керек.',
};

const en: L = {
  kicker: 'C++ from Scratch · Lesson 1',
  title: 'Your First Program and Output',
  subtitle: 'Your very first step into programming — let\'s write and run some C++ code',
  press: 'Press → or Space to advance',

  s2h: 'What is a program?',
  s2c1t: 'Source code',
  s2c1d: 'A sequence of commands you write in a file — readable by a human.',
  s2c2t: 'The compiler',
  s2c2d: 'Turns the source code into an executable file the computer can actually run.',

  s3h: 'The most famous program in the world',
  s3n1: 'Includes the input/output library — without it std::cout won\'t work.',
  s3n2: 'The main function: every C++ program\'s execution starts right here.',
  s3n3: 'std::cout prints text to the screen — whatever is on the right of "<<".',
  s3n4: 'std::endl moves to a new line — the cursor jumps to the next one.',
  s3n5: 'return 0 tells the system: the program finished successfully.',
  s3run: 'Run this code in the lesson and see the result for yourself.',

  s4h: 'Try it yourself',
  s4line: 'Change the text inside the quotes right in the lesson\'s code block — and run the program again.',
  s4mark: 'Programming is an experiment. Don\'t be afraid to change the code and see what happens.',

  s5h: 'cout can do more than plain text',
  s5n1: 'Between the quotes is plain text. After "<<" without quotes is a calculation: 2 + 2 computes itself.',
  s5n2: 'You can print as many values in a row as you like on one line — just keep adding "<<".',
  s5run: 'Run this code in the lesson — compare the output to what you see here.',

  s6h: 'A task to lock it in',
  s6task: 'Print three lines: your name, your city, and the result of 7 * 6.',
  s6hint: 'Each value on its own line. Use std::endl after every std::cout.',

  s7h: 'Remember',
  s7r1: '#include brings in the library you need',
  s7r2: 'int main() { ... } — the entry point of the program',
  s7r3: 'std::cout << ... prints text and computation results',
  s7cta: 'Complete the task and mark the lesson as completed.',
  s7foot: 'Next up: variables and data types — how to store numbers, text, and true/false values.',
};

export const cppFirstProgram: LessonPresentationData = {
  accent: '#818cf8',
  slides: { ru: buildSlides(ru), ky: buildSlides(ky), en: buildSlides(en) },
};
