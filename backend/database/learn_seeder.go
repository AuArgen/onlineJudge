package database

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"onlineJudge/backend/app/models"
)

// learnNodeSeed describes one curriculum topic (track, level, or lesson).
// Russian is the base language stored on the topic itself; Kyrgyz and
// English go into translation rows. Lessons are created as empty stubs —
// the frontend hides content-less lessons from search engines and marks
// them as "coming soon", so admins can fill them in gradually.
type learnNodeSeed struct {
	Slug      string
	TitleRu   string
	TitleKy   string
	TitleEn   string
	SummaryRu string
	SummaryKy string
	SummaryEn string
	Children  []learnNodeSeed
}

func learnToken() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// SeedLearn creates the official /learn curriculum skeleton once: the
// competitive-programming roadmap and one from-scratch course per judge
// language. Idempotent — skips if any official topic already exists.
func SeedLearn() {
	var count int64
	DB.Model(&models.Topic{}).Where("is_official = ?", true).Count(&count)
	if count > 0 {
		log.Println("Learn curriculum already seeded.")
		return
	}

	var author models.User
	if err := DB.Where("role = 'admin'").Order("id asc").First(&author).Error; err != nil {
		if err := DB.Order("id asc").First(&author).Error; err != nil {
			log.Println("SeedLearn: no users in database, skipping curriculum seed.")
			return
		}
	}

	log.Println("Seeding learn curriculum...")
	for i, track := range learnCurriculum() {
		createLearnNode(track, nil, i+1, author.ID)
	}
	log.Println("Learn curriculum seeded.")
}

func createLearnNode(seed learnNodeSeed, parentID *uint, order int, authorID uint) {
	topic := models.Topic{
		Title:      seed.TitleRu,
		Slug:       seed.Slug,
		Summary:    seed.SummaryRu,
		OrderNum:   order,
		IsOfficial: true,
		Visibility: "public",
		AuthorID:   authorID,
		ParentID:   parentID,
		ShareToken: learnToken(),
	}
	DB.Create(&topic)

	if seed.TitleKy != "" {
		DB.Create(&models.TopicTranslation{TopicID: topic.ID, LanguageCode: "ky", Title: seed.TitleKy, Summary: seed.SummaryKy})
	}
	if seed.TitleEn != "" {
		DB.Create(&models.TopicTranslation{TopicID: topic.ID, LanguageCode: "en", Title: seed.TitleEn, Summary: seed.SummaryEn})
	}

	for i, child := range seed.Children {
		createLearnNode(child, &topic.ID, i+1, authorID)
	}
}

// lesson is a compact constructor for a lesson stub with translated titles.
func lesson(slug, ru, ky, en string) learnNodeSeed {
	return learnNodeSeed{Slug: slug, TitleRu: ru, TitleKy: ky, TitleEn: en}
}

func learnCurriculum() []learnNodeSeed {
	return []learnNodeSeed{
		{
			Slug:      "olympiad-roadmap",
			TitleRu:   "Путь олимпиадника",
			TitleKy:   "Олимпиадачынын жолу",
			TitleEn:   "Competitive Programming Path",
			SummaryRu: "Пошаговая программа подготовки к олимпиадам по программированию: от основ алгоритмики до экспертных тем. Каждый уровень содержит уроки с теорией, примерами кода и задачами с автоматической проверкой. Если вы совсем новичок — сначала пройдите курс одного из языков программирования.",
			SummaryKy: "Программалоо олимпиадаларына даярдануунун этап-этап программасы: алгоритмиканын негиздеринен баштап эксперттик темаларга чейин. Ар бир деңгээлде теория, код мисалдары жана автоматтык текшерүү менен маселелер бар. Эгер сиз жаңы баштап жатсаңыз — адегенде программалоо тилдеринин биринин курсун өтүңүз.",
			SummaryEn: "A step-by-step competitive programming curriculum: from algorithmic foundations to expert topics. Every level contains lessons with theory, code examples, and auto-checked practice problems. If you are a complete beginner, start with one of the programming language courses first.",
			Children: []learnNodeSeed{
				{
					Slug:      "level-1-foundations",
					TitleRu:   "Уровень 1. Основы алгоритмики",
					TitleKy:   "1-деңгээл. Алгоритмиканын негиздери",
					TitleEn:   "Level 1. Algorithmic Foundations",
					SummaryRu: "Сложность алгоритмов, задачи на реализацию и базовая математика — фундамент всего дальнейшего пути.",
					SummaryKy: "Алгоритмдердин татаалдыгы, ишке ашыруу маселелери жана негизги математика — андан аркы жолдун пайдубалы.",
					SummaryEn: "Algorithm complexity, implementation problems, and basic math — the foundation for everything that follows.",
					Children: []learnNodeSeed{
						lesson("complexity-big-o", "Сложность алгоритмов и O-нотация", "Алгоритмдердин татаалдыгы жана O-белгилөө", "Algorithm Complexity and Big-O"),
						lesson("implementation-problems", "Задачи на реализацию", "Ишке ашыруу маселелери", "Implementation Problems"),
						lesson("basic-math", "Базовая математика: делимость, НОД, простые числа", "Негизги математика: бөлүнүү, ЭЧЖБ, жай сандар", "Basic Math: Divisibility, GCD, Primes"),
					},
				},
				{
					Slug:      "level-2-sorting-searching",
					TitleRu:   "Уровень 2. Сортировки и поиск",
					TitleKy:   "2-деңгээл. Иреттөө жана издөө",
					TitleEn:   "Level 2. Sorting and Searching",
					SummaryRu: "Классические приёмы, которые встречаются почти в каждой олимпиадной задаче: сортировки, два указателя, префиксные суммы и бинарный поиск.",
					SummaryKy: "Дээрлик ар бир олимпиадалык маселеде кездешүүчү классикалык ыкмалар: иреттөө, эки көрсөткүч, префикстик суммалар жана бинардык издөө.",
					SummaryEn: "Classic techniques that appear in almost every contest problem: sorting, two pointers, prefix sums, and binary search.",
					Children: []learnNodeSeed{
						lesson("sorting", "Сортировки", "Иреттөө алгоритмдери", "Sorting Algorithms"),
						lesson("two-pointers", "Метод двух указателей", "Эки көрсөткүч ыкмасы", "Two Pointers"),
						lesson("prefix-sums", "Префиксные суммы", "Префикстик суммалар", "Prefix Sums"),
						lesson("binary-search", "Бинарный поиск", "Бинардык издөө", "Binary Search"),
					},
				},
				{
					Slug:      "level-3-data-structures",
					TitleRu:   "Уровень 3. Структуры данных и жадные алгоритмы",
					TitleKy:   "3-деңгээл. Маалымат структуралары жана ач көз алгоритмдер",
					TitleEn:   "Level 3. Data Structures and Greedy Algorithms",
					SummaryRu: "Стек, очередь, множества и словари, рекурсия, жадные алгоритмы и DSU — инструменты для задач среднего уровня.",
					SummaryKy: "Стек, кезек, көптүктөр жана сөздүктөр, рекурсия, ач көз алгоритмдер жана DSU — орто деңгээлдеги маселелердин куралдары.",
					SummaryEn: "Stack, queue, sets and maps, recursion, greedy algorithms, and DSU — the toolkit for mid-level problems.",
					Children: []learnNodeSeed{
						lesson("stack-queue", "Стек и очередь", "Стек жана кезек", "Stack and Queue"),
						lesson("sets-maps", "Множества и словари: set и map", "Көптүктөр жана сөздүктөр: set жана map", "Sets and Maps"),
						lesson("recursion-backtracking", "Рекурсия и полный перебор", "Рекурсия жана толук издөө", "Recursion and Backtracking"),
						lesson("greedy", "Жадные алгоритмы", "Ач көз алгоритмдер", "Greedy Algorithms"),
						lesson("dsu", "Система непересекающихся множеств (DSU)", "Кесилишпеген көптүктөр системасы (DSU)", "Disjoint Set Union (DSU)"),
					},
				},
				{
					Slug:      "level-4-graphs-dp",
					TitleRu:   "Уровень 4. Графы и динамическое программирование",
					TitleKy:   "4-деңгээл. Графтар жана динамикалык программалоо",
					TitleEn:   "Level 4. Graphs and Dynamic Programming",
					SummaryRu: "Обходы графов, кратчайшие пути, остовные деревья и первые задачи на динамическое программирование.",
					SummaryKy: "Графтарды кыдыруу, эң кыска жолдор, каркас дарактары жана динамикалык программалоо боюнча алгачкы маселелер.",
					SummaryEn: "Graph traversals, shortest paths, spanning trees, and your first dynamic programming problems.",
					Children: []learnNodeSeed{
						lesson("graphs-bfs-dfs", "Графы: представление, BFS и DFS", "Графтар: сактоо, BFS жана DFS", "Graphs: Representation, BFS and DFS"),
						lesson("shortest-paths", "Кратчайшие пути: Дейкстра и Флойд", "Эң кыска жолдор: Дейкстра жана Флойд", "Shortest Paths: Dijkstra and Floyd"),
						lesson("mst", "Минимальное остовное дерево", "Минималдуу каркас дарагы", "Minimum Spanning Tree"),
						lesson("dp-basics", "Динамическое программирование: основы", "Динамикалык программалоо: негиздер", "Dynamic Programming: Basics"),
					},
				},
				{
					Slug:      "level-5-advanced",
					TitleRu:   "Уровень 5. Продвинутые темы",
					TitleKy:   "5-деңгээл. Тереңдетилген темалар",
					TitleEn:   "Level 5. Advanced Topics",
					SummaryRu: "Продвинутое ДП, дерево отрезков, строковые алгоритмы и теория чисел — уровень призёров региональных олимпиад.",
					SummaryKy: "Татаал ДП, кесинди дарагы, саптык алгоритмдер жана сандар теориясы — аймактык олимпиадалардын байге ээлеринин деңгээли.",
					SummaryEn: "Advanced DP, segment trees, string algorithms, and number theory — the level of regional olympiad prize winners.",
					Children: []learnNodeSeed{
						lesson("dp-advanced", "Продвинутое динамическое программирование", "Тереңдетилген динамикалык программалоо", "Advanced Dynamic Programming"),
						lesson("segment-tree", "Дерево отрезков", "Кесинди дарагы", "Segment Tree"),
						lesson("string-algorithms", "Алгоритмы на строках: хеширование и KMP", "Саптар боюнча алгоритмдер: хэштөө жана KMP", "String Algorithms: Hashing and KMP"),
						lesson("number-theory", "Теория чисел", "Сандар теориясы", "Number Theory"),
					},
				},
				{
					Slug:      "level-6-expert",
					TitleRu:   "Уровень 6. Экспертные темы",
					TitleKy:   "6-деңгээл. Эксперттик темалар",
					TitleEn:   "Level 6. Expert Topics",
					SummaryRu: "Потоки, суффиксные структуры и вычислительная геометрия — темы международного уровня.",
					SummaryKy: "Агымдар, суффикстик структуралар жана эсептөө геометриясы — эл аралык деңгээлдеги темалар.",
					SummaryEn: "Flows, suffix structures, and computational geometry — international-level topics.",
					Children: []learnNodeSeed{
						lesson("network-flows", "Потоки в сетях", "Тармактагы агымдар", "Network Flows"),
						lesson("suffix-structures", "Суффиксные структуры", "Суффикстик структуралар", "Suffix Structures"),
						lesson("computational-geometry", "Вычислительная геометрия", "Эсептөө геометриясы", "Computational Geometry"),
					},
				},
			},
		},
		{
			Slug:      "course-cpp",
			TitleRu:   "Курс C++ с нуля",
			TitleKy:   "C++ курсу нөлдөн",
			TitleEn:   "C++ from Scratch",
			SummaryRu: "C++ — главный язык спортивного программирования. Курс ведёт от первой программы до уверенного владения языком и STL, чтобы вы могли начать путь олимпиадника.",
			SummaryKy: "C++ — спорттук программалоонун негизги тили. Курс биринчи программадан баштап тилди жана STL китепканасын ишенимдүү колдонууга чейин алып барат.",
			SummaryEn: "C++ is the main language of competitive programming. This course takes you from your first program to confident use of the language and the STL.",
			Children: []learnNodeSeed{
				lesson("cpp-first-program", "Первая программа и вывод на экран", "Биринчи программа жана экранга чыгаруу", "Your First Program and Output"),
				lesson("cpp-variables-types", "Переменные и типы данных", "Өзгөрмөлөр жана маалымат түрлөрү", "Variables and Data Types"),
				lesson("cpp-input", "Чтение входных данных", "Киргизүү маалыматтарын окуу", "Reading Input"),
				lesson("cpp-conditions", "Условные операторы", "Шарттуу операторлор", "Conditional Statements"),
				lesson("cpp-loops", "Циклы", "Циклдер", "Loops"),
				lesson("cpp-arrays", "Массивы и векторы", "Массивдер жана векторлор", "Arrays and Vectors"),
				lesson("cpp-strings", "Строки", "Саптар", "Strings"),
				lesson("cpp-functions", "Функции", "Функциялар", "Functions"),
				lesson("cpp-stl", "Стандартная библиотека STL", "STL стандарттык китепканасы", "The STL Standard Library"),
				lesson("cpp-competitive", "Подготовка к олимпиадам: быстрый ввод-вывод и шаблон", "Олимпиадага даярдык: тез киргизүү-чыгаруу жана шаблон", "Contest Setup: Fast I/O and Template"),
			},
		},
		{
			Slug:      "course-python",
			TitleRu:   "Курс Python с нуля",
			TitleKy:   "Python курсу нөлдөн",
			TitleEn:   "Python from Scratch",
			SummaryRu: "Python — самый простой язык для старта. Курс от первой программы до уровня, с которого можно начинать решать олимпиадные задачи.",
			SummaryKy: "Python — баштоо үчүн эң жөнөкөй тил. Курс биринчи программадан олимпиадалык маселелерди чече баштоого мүмкүн болгон деңгээлге чейин.",
			SummaryEn: "Python is the easiest language to start with. This course goes from your first program to the level where you can start solving contest problems.",
			Children: []learnNodeSeed{
				lesson("py-first-program", "Первая программа и print", "Биринчи программа жана print", "Your First Program and print"),
				lesson("py-variables-types", "Переменные и типы данных", "Өзгөрмөлөр жана маалымат түрлөрү", "Variables and Data Types"),
				lesson("py-input", "Чтение входных данных: input", "Киргизүү маалыматтарын окуу: input", "Reading Input"),
				lesson("py-conditions", "Условные операторы", "Шарттуу операторлор", "Conditional Statements"),
				lesson("py-loops", "Циклы for и while", "for жана while циклдери", "for and while Loops"),
				lesson("py-lists", "Списки и срезы", "Тизмелер жана кесиндилер", "Lists and Slices"),
				lesson("py-strings", "Строки", "Саптар", "Strings"),
				lesson("py-functions", "Функции", "Функциялар", "Functions"),
				lesson("py-collections", "Словари, множества и коллекции", "Сөздүктөр, көптүктөр жана коллекциялар", "Dicts, Sets and Collections"),
				lesson("py-competitive", "Подготовка к олимпиадам: быстрый ввод-вывод", "Олимпиадага даярдык: тез киргизүү-чыгаруу", "Contest Setup: Fast I/O"),
			},
		},
		{
			Slug:      "course-java",
			TitleRu:   "Курс Java с нуля",
			TitleKy:   "Java курсу нөлдөн",
			TitleEn:   "Java from Scratch",
			SummaryRu: "Java — строгий и мощный язык. Курс от первой программы до коллекций и быстрого ввода-вывода для олимпиад.",
			SummaryKy: "Java — так жана күчтүү тил. Курс биринчи программадан коллекцияларга жана олимпиада үчүн тез киргизүү-чыгарууга чейин.",
			SummaryEn: "Java is a strict and powerful language. This course goes from your first program to collections and fast contest I/O.",
			Children: []learnNodeSeed{
				lesson("java-first-program", "Первая программа и вывод на экран", "Биринчи программа жана экранга чыгаруу", "Your First Program and Output"),
				lesson("java-variables-types", "Переменные и типы данных", "Өзгөрмөлөр жана маалымат түрлөрү", "Variables and Data Types"),
				lesson("java-input", "Чтение входных данных: Scanner и BufferedReader", "Киргизүүнү окуу: Scanner жана BufferedReader", "Reading Input: Scanner and BufferedReader"),
				lesson("java-conditions", "Условные операторы", "Шарттуу операторлор", "Conditional Statements"),
				lesson("java-loops", "Циклы", "Циклдер", "Loops"),
				lesson("java-arrays", "Массивы", "Массивдер", "Arrays"),
				lesson("java-strings", "Строки и StringBuilder", "Саптар жана StringBuilder", "Strings and StringBuilder"),
				lesson("java-methods", "Методы", "Методдор", "Methods"),
				lesson("java-collections", "Коллекции: ArrayList, HashMap, TreeSet", "Коллекциялар: ArrayList, HashMap, TreeSet", "Collections: ArrayList, HashMap, TreeSet"),
				lesson("java-competitive", "Подготовка к олимпиадам: быстрый ввод-вывод", "Олимпиадага даярдык: тез киргизүү-чыгаруу", "Contest Setup: Fast I/O"),
			},
		},
		{
			Slug:      "course-go",
			TitleRu:   "Курс Go с нуля",
			TitleKy:   "Go курсу нөлдөн",
			TitleEn:   "Go from Scratch",
			SummaryRu: "Go — простой и быстрый язык. Курс от первой программы до срезов, мап и буферизованного ввода-вывода.",
			SummaryKy: "Go — жөнөкөй жана тез тил. Курс биринчи программадан кесиндилерге, мапаларга жана буфердик киргизүү-чыгарууга чейин.",
			SummaryEn: "Go is a simple and fast language. This course goes from your first program to slices, maps, and buffered I/O.",
			Children: []learnNodeSeed{
				lesson("go-first-program", "Первая программа и вывод на экран", "Биринчи программа жана экранга чыгаруу", "Your First Program and Output"),
				lesson("go-variables-types", "Переменные и типы данных", "Өзгөрмөлөр жана маалымат түрлөрү", "Variables and Data Types"),
				lesson("go-input", "Чтение входных данных: bufio", "Киргизүүнү окуу: bufio", "Reading Input: bufio"),
				lesson("go-conditions", "Условные операторы", "Шарттуу операторлор", "Conditional Statements"),
				lesson("go-loops", "Цикл for", "for цикли", "The for Loop"),
				lesson("go-slices", "Массивы и срезы", "Массивдер жана кесиндилер", "Arrays and Slices"),
				lesson("go-strings", "Строки", "Саптар", "Strings"),
				lesson("go-functions", "Функции", "Функциялар", "Functions"),
				lesson("go-maps", "Мапы и структуры", "Мапалар жана структуралар", "Maps and Structs"),
				lesson("go-competitive", "Подготовка к олимпиадам: быстрый ввод-вывод", "Олимпиадага даярдык: тез киргизүү-чыгаруу", "Contest Setup: Fast I/O"),
			},
		},
	}
}
