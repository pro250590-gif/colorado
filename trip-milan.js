/* ==========================================================================
   ДАННЫЕ ПОЕЗДКИ — Милан и озеро Комо, 5 дней

   ФОРМА ПОЕЗДКИ: один город · ночуем все ночи в Милане · машины нет вовсе ·
   по городу метро и пешком · на озеро Комо едем ВЫЕЗДОМ НА ДЕНЬ: туда поездом
   с вокзала Cadorna, по озеру катером, обратно поездом из Варенны.

   Почему так, а не с ночёвкой в Комо (правка клиента 29.07.2026):
   «в Комо можно просто приехать и уехать, не ночуя — я так и делала». Это и
   удобнее: не таскаешь чемоданы, не платишь за второе жильё, вечер всё равно
   в Милане.

   ПРАВИЛА, ПО КОТОРЫМ СОБРАНЫ ДНИ (тоже её):
   · точка — это место, а не город: не «Комо», а причал, собор, фуникулёр;
   · точка ведёт туда, где человек ДЕЙСТВУЕТ, и выбирается по тому, откуда он
     пришёл: причал берём тот, что рядом с вокзалом, куда приходит поезд;
   · день — это маршрут: точки идут цепочкой, одна за другой, без прыжков;
   · один район — один день, чтобы не возвращаться сюда же послезавтра;
   · точек кладём с запасом (9–10), лишнее человек снимает тумблером.

   ОТБОР МЕСТ. Что попадает в день, решаем не «на вкус»: спрашиваем у карты,
   что есть вокруг каждой точки, и у Google — сколько у этих мест отзывов и
   какая оценка. Берём то, куда люди правда ходят. Сами оценки нигде не
   храним (правилами нельзя дольше 30 дней) — они нужны только в момент
   отбора; в базе places-db.json остаются лишь номер места и координата.

   КООРДИНАТЫ. Ни одна не написана по памяти. Каждая сверена по четырём
   источникам (OpenStreetMap, Photon, путеводитель Wikivoyage, Google
   Geocoding) — в файле стоит та, на которой источники сошлись.
   ========================================================================== */

const BCOL={mil:'#5a4bb5'};
const BCOL2={mil:'#3b3080'};

const BASES=[
 {id:'mil',name:'Милан',emoji:'city',nights:4,color:BCOL.mil,lat:45.4642,lng:9.1900,q:'Milan, Italy',
  desc:'Собор из белого мрамора, «Тайная вечеря», кварталы дизайна и лучший в Италии аперитив. Озеро Комо — в часе езды, туда ездят на день.',
  alt:'Жильё удобнее у Duomo, Brera или Porta Genova: до всего пешком, до обоих вокзалов — две-три остановки метро.'}
];

const CITYMOVE={mil:'metro_walk'};

const DAY_BASE={1:'mil',2:'mil',3:'mil',4:'mil',5:'mil'};

const DAYS=[
 {n:1,title:'Прилёт и вечер на каналах',pill:'прилёт',leg:'MXP → Cadorna: Malpensa Express, 50 мин',
  note:'<b>Первый вечер — на юге города.</b> Из аэропорта поезд идёт до вокзала Cadorna, оттуда метро М2 до Porta Genova. Аперитив на Навильи начинается в 18:00: берёшь напиток — закуски приносят к нему.'},
 {n:2,title:'Дуомо, крыша и площадь целиком',pill:'пешком',leg:'весь день в пятистах метрах вокруг собора',
  note:'<b>Крыша — отдельный билет,</b> и очередь к лифту меньше с утра. «Тайную вечерю» в этот день не берём: она в другом конце города, её смотрим завтра.'},
 {n:3,title:'Замок, парк и «Тайная вечеря»',pill:'пешком',leg:'от замка к Сант-Амброджо, всё по прямой, 3 км',
  note:'<b>Билет на «Тайную вечерю» — за месяц.</b> Их всего 30 на сеанс, и в день продажи их разбирают за час. Без билета внутрь не пускают вообще.'},
 {n:4,title:'Озеро Комо: поезд, фуникулёр, катер',pill:'выезд на день',leg:'Cadorna → Como Lago, поезд 1 ч · обратно из Варенны',
  note:'<b>Уезжай с Cadorna, а не с Centrale.</b> Поезд с Cadorna приходит на Como Lago — это прямо на набережной, причалы в трёхстах метрах. С Centrale поезд приходит на San Giovanni, а оттуда до воды километр пешком под горку. Обратно проще всего поездом из Варенны: час до Milano Centrale.'},
 {n:5,title:'Брера, золотой квадрат и вылет',pill:'финал',leg:'Cadorna → MXP: Malpensa Express, 50 мин',
  note:'<b>Заложи три часа до вылета.</b> Если самолёт утром — оставь из этого дня две точки, остальное сними тумблером, ничего не потеряется.'}
];

const P=[
 /* ── день 1: прилёт и юг города — Тичинезе, Дарсена, Навильи ── */
 {id:'mxp',d:1,base:'mil',cat:'transport',lat:45.629627,lng:8.723548,nm:'Aeroporto di Milano–Malpensa (MXP)',q:'Aeroporto di Milano-Malpensa',tag:['прилёт','t-easy'],
  why:'Сюда прилетаешь. Поезд Malpensa Express уходит из-под зала прилёта и идёт в город каждые полчаса.'},
 {id:'cad',d:1,base:'mil',cat:'transport',lat:45.468405,lng:9.175523,nm:'Stazione di Milano Cadorna',q:'Milano Cadorna railway station',tag:['вокзал','t-easy'],
  hop:'Malpensa Express, 50 минут',
  why:'Городской вокзал, куда приходит поезд из аэропорта. Отсюда же на четвёртый день уходит поезд на озеро Комо.'},
 {id:'col',d:1,base:'mil',cat:'town',lat:45.458227,lng:9.181045,nm:'Colonne di San Lorenzo',q:'Colonne di San Lorenzo, Milano',tag:['вечер','t-easy'],
  why:'Шестнадцать римских колонн II века, перенесённых сюда в IV-м. Вечером на ступенях сидит пол-Милана.'},
 {id:'lor',d:1,base:'mil',cat:'town',lat:45.458085,lng:9.182011,nm:'Basilica di San Lorenzo Maggiore',q:'Basilica di San Lorenzo Maggiore, Milano',tag:['рядом','t-easy'],
  why:'Церковь IV века, одна из старейших в Европе: круглая, с византийскими мозаиками в капелле Сант-Аквилино.'},
 {id:'bas',d:1,base:'mil',cat:'nature',lat:45.455779,lng:9.182226,nm:'Parco delle Basiliche',q:'Parco Giovanni Paolo II, Milano',tag:['по дороге','t-easy'],
  why:'Парк ровно между двумя базиликами: газоны, платаны и вид на обе церкви сразу. Мы всё равно идём через него.'},
 {id:'eus',d:1,base:'mil',cat:'town',lat:45.453971,lng:9.181468,nm:'Basilica di Sant’Eustorgio',q:'Basilica di Sant\'Eustorgio, Milano',tag:['по пути','t-easy'],
  why:'Сюда, по преданию, привезли мощи волхвов. В капелле Портинари — фрески раннего Ренессанса и гробница на четырёх ангелах.'},
 /* в Милане ДВОЕ ворот с этим именем: наши — неоклассические, на площади
    XXIV Maggio у самой Дарсены; средневековые стоят севернее, в поиске уводят
    не туда, поэтому в q вписан адрес */
 {id:'tic',d:1,base:'mil',cat:'town',lat:45.452138,lng:9.178401,nm:'Porta Ticinese',q:'Porta Ticinese, Piazza XXIV Maggio, Milano',tag:['ворота','t-easy'],
  why:'Ворота на площади XXIV Maggio, за которыми начинается район каналов. Отсюда весь вечер идёшь вдоль воды.'},
 {id:'dar',d:1,base:'mil',cat:'town',lat:45.452911,lng:9.178572,nm:'Darsena di Milano',q:'Darsena di Milano',tag:['порт','t-easy'],star:1,
  why:'Старый городской порт: сюда по каналам везли мрамор на собор. Сейчас — набережная с барами и лодками.'},
 {id:'lav',d:1,base:'mil',cat:'town',lat:45.452028,lng:9.174712,nm:'Vicolo dei Lavandai',q:'Vicolo dei Lavandai, Milano',tag:['уголок','t-easy'],
  why:'Крошечный переулок с деревянными мостками, где до середины XX века стирали бельё прямо в канале.'},
 /* канал длинный, до Аббьятеграссо; наша точка — оживлённый участок набережной
    у Vicolo dei Lavandai, а не «адрес канала» */
 {id:'nav',d:1,base:'mil',cat:'town',lat:45.451260,lng:9.172320,nm:'Naviglio Grande',q:'Naviglio Grande, Alzaia Naviglio Grande, Milano',tag:['аперитив','t-must'],star:1,
  why:'Канал, к которому приложил руку Леонардо. Наша точка — оживлённый участок у Vicolo dei Lavandai: вечером вдоль обеих набережных весь миланский аперитив.'},

 /* ── день 2: площадь Дуомо и всё вокруг неё, в пределах пятисот метров ── */
 {id:'duo',d:2,base:'mil',cat:'town',lat:45.464167,lng:9.191612,nm:'Duomo di Milano',q:'Duomo di Milano',tag:['главное','t-must'],star:1,
  why:'Главный собор города: 135 шпилей и мрамор, который везли сюда по каналам пять веков. Внутрь — по билету, очередь короче до десяти утра.'},
 {id:'ter',d:2,base:'mil',cat:'town',lat:45.464229,lng:9.191195,nm:'Terrazze del Duomo',q:'Duomo Terraces, Milano',tag:['вид','t-must'],star:1,
  hop:'вход в лифт — с северной стороны собора',
  why:'Крыша собора: между шпилями ходишь по мрамору, в ясный день видно Альпы. Пешком по лестнице дешевле, лифтом быстрее.'},
 {id:'rea',d:2,base:'mil',cat:'town',lat:45.462903,lng:9.190870,nm:'Palazzo Reale',q:'Palazzo Reale, Milano',tag:['выставки','t-easy'],
  why:'Королевский дворец вплотную к собору: здесь всегда идут две-три больших выставки, и это лучший вариант, если пошёл дождь.'},
 {id:'nov',d:2,base:'mil',cat:'town',lat:45.463408,lng:9.190169,nm:'Museo del Novecento',q:'Museo del Novecento, Milano',tag:['на площади','t-easy'],
  why:'Итальянский XX век — футуристы, Моранди, Фонтана. Из окна верхнего зала собор виден так, как его не увидишь с площади.'},
 {id:'oss',d:2,base:'mil',cat:'town',lat:45.462417,lng:9.195541,nm:'Santuario di San Bernardino alle Ossa',q:'Santuario di San Bernardino alle Ossa, Milano',tag:['необычное','t-must'],star:1,
  why:'Часовня, стены которой выложены человеческими костями из старого кладбища. Пять минут внутри — и запоминается на всю поездку. Вход свободный.'},
 {id:'sat',d:2,base:'mil',cat:'town',lat:45.462877,lng:9.187689,nm:'Santa Maria presso San Satiro',q:'Chiesa di Santa Maria presso San Satiro, Milano',tag:['обман зрения','t-easy'],
  why:'Места на алтарную часть не хватило, и Браманте нарисовал её: кажется, что за колоннами глубина в несколько метров, а там сантиметры.'},
 {id:'amb',d:2,base:'mil',cat:'town',lat:45.463640,lng:9.186007,nm:'Pinacoteca Ambrosiana',q:'Pinacoteca Ambrosiana, Milano',tag:['музей','t-easy'],
  why:'Здесь лежит «Атлантический кодекс» Леонардо и висит «Корзина с фруктами» Караваджо. Народу заметно меньше, чем в Брере.'},
 {id:'mer',d:2,base:'mil',cat:'town',lat:45.464630,lng:9.187691,nm:'Piazza dei Mercanti',q:'Piazza dei Mercanti, Milano',tag:['старый город','t-easy'],
  why:'Средневековая торговая площадь: лоджия XIII века, колодец и тишина в двух шагах от толпы у собора.'},
 {id:'gal',d:2,base:'mil',cat:'town',lat:45.465642,lng:9.190006,nm:'Galleria Vittorio Emanuele II',q:'Galleria Vittorio Emanuele II, Milano',tag:['рядом','t-easy'],star:1,
  why:'Стеклянная галерея 1877 года: мозаики на полу, кафе под куполом и самый дорогой шопинг Италии.'},
 {id:'sca',d:2,base:'mil',cat:'town',lat:45.467604,lng:9.189114,nm:'Teatro alla Scala',q:'Teatro alla Scala, Milano',tag:['театр','t-easy'],
  why:'Снаружи — обычный дом, внутри — главная оперная сцена мира. В музей пускают днём, и из него видно зал.'},
 {id:'rin',d:2,base:'mil',cat:'town',lat:45.464963,lng:9.191912,nm:'La Rinascente',q:'La Rinascente, Piazza Duomo, Milano',tag:['закат','t-easy'],
  why:'Универмаг у собора, а на верхнем этаже — терраса с кафе, откуда шпили Дуомо на расстоянии вытянутой руки. Вход свободный.'},

 /* ── день 3: замок, парк и запад — всё нанизано на одну прямую ── */
 {id:'sfo',d:3,base:'mil',cat:'town',lat:45.470301,lng:9.178091,nm:'Castello Sforzesco',q:'Castello Sforzesco, Milano',tag:['замок','t-must'],star:1,
  why:'Замок герцогов Сфорца. Во дворе бесплатно, внутри — музеи и последняя, незаконченная скульптура Микеланджело.'},
 {id:'sem',d:3,base:'mil',cat:'nature',lat:45.472996,lng:9.176967,nm:'Parco Sempione',q:'Parco Sempione, Milano',tag:['парк','t-easy'],
  why:'Парк сразу за замком: пруд, мостики и тень — то, что нужно между двумя музеями.'},
 {id:'bra',d:3,base:'mil',cat:'town',lat:45.473285,lng:9.172885,nm:'Torre Branca',q:'Torre Branca, Milano',tag:['вид','t-easy'],
  why:'Стальная башня 1933 года посреди парка: лифт поднимает на 108 метров, и оттуда виден весь город и Альпы.'},
 {id:'arc',d:3,base:'mil',cat:'town',lat:45.475693,lng:9.172426,nm:'Arco della Pace',q:'Arco della Pace, Milano',tag:['арка','t-easy'],
  why:'Триумфальная арка на дальнем конце парка, начатая для Наполеона и достроенная уже без него.'},
 {id:'tri',d:3,base:'mil',cat:'town',lat:45.471593,lng:9.173092,nm:'Triennale Milano',q:'Triennale Milano',tag:['дизайн','t-easy'],
  why:'Музей итальянского дизайна — то, ради чего в Милан едут дизайнеры со всего мира. Кафе с террасой в парк.'},
 {id:'cen',d:3,base:'mil',cat:'town',lat:45.465976,lng:9.171132,nm:'Santa Maria delle Grazie · Il Cenacolo',q:'Santa Maria delle Grazie, Milano',tag:['по билету','t-must'],star:1,
  why:'«Тайная вечеря» Леонардо на стене трапезной. Пускают по 30 человек на 15 минут, билет берут за месяц.'},
 {id:'leo',d:3,base:'mil',cat:'town',lat:45.462887,lng:9.170652,nm:'Museo Nazionale Scienza e Tecnologia Leonardo da Vinci',q:'Museo Nazionale Scienza e Tecnologia Leonardo da Vinci, Milano',tag:['музей','t-easy'],
  why:'Самый большой технический музей Италии: модели машин Леонардо, настоящая подводная лодка и паровозы. С детьми — на полдня.'},
 {id:'amr',d:3,base:'mil',cat:'town',lat:45.462375,lng:9.175845,nm:'Basilica di Sant’Ambrogio',q:'Basilica di Sant\'Ambrogio, Milano',tag:['IV век','t-easy'],
  why:'Церковь, которую заложил сам святой Амвросий, покровитель города. Кирпичный двор с колоннами — самое тихое место в округе.'},
 {id:'mau',d:3,base:'mil',cat:'town',lat:45.465409,lng:9.178957,nm:'San Maurizio al Monastero Maggiore',q:'San Maurizio al Monastero Maggiore, Milano',tag:['фрески','t-easy'],star:1,
  why:'Снаружи глухая стена, внутри все стены расписаны фресками XVI века. Вход бесплатный, и это самая недооценённая церковь Милана.'},

 /* ── день 4: озеро Комо выездом на день ── */
 {id:'clg',d:4,base:'mil',cat:'transport',lat:45.814116,lng:9.084090,nm:'Stazione di Como Lago',q:'Como Lago railway station, Como',tag:['приезд','t-easy'],
  hop:'поезд с Cadorna, 1 час',
  why:'Вокзал, куда приходит поезд с Cadorna. Стоит прямо на набережной: до причалов триста метров пешком, никуда ехать не надо.'},
 {id:'cdu',d:4,base:'mil',cat:'town',lat:45.811768,lng:9.083661,nm:'Cattedrale di Santa Maria Assunta',q:'Cattedrale di Santa Maria Assunta, Como',tag:['собор','t-easy'],
  why:'Собор Комо, который строили четыреста лет: снизу готика, сверху ренессансный купол. Вход свободный.'},
 {id:'fed',d:4,base:'mil',cat:'town',lat:45.809688,lng:9.084330,nm:'Basilica di San Fedele',q:'Basilica di San Fedele, Como',tag:['старый Комо','t-easy'],
  why:'Романская церковь XII века на бывшей рыночной площади: резной портал со зверями и тихий двор в двух шагах от собора.'},
 {id:'fun',d:4,base:'mil',cat:'nature',lat:45.817644,lng:9.082854,nm:'Funicolare Como–Brunate',q:'Funicolare Como-Brunate, Piazza Alcide De Gasperi, Como',tag:['наверх','t-must'],star:1,
  why:'Фуникулёр 1894 года поднимает за семь минут на 500 метров в деревню Брунате: сверху видно всё озеро и Альпы, вдоль дороги — смотровые площадки и кафе.'},
 {id:'vol',d:4,base:'mil',cat:'town',lat:45.814832,lng:9.075253,nm:'Tempio Voltiano',q:'Tempio Voltiano, Como',tag:['набережная','t-easy'],
  why:'Круглый белый павильон на самой воде — музей Алессандро Вольты, который здесь родился и придумал батарейку.'},
 {id:'lif',d:4,base:'mil',cat:'town',lat:45.815375,lng:9.080258,nm:'Life Electric',q:'Life Electric, Como',tag:['на молу','t-easy'],
  why:'Стальная скульптура Даниэля Либескинда на самом краю мола — памятник Вольте и лучшая точка, чтобы снять озеро с воды. Бесплатно, пять минут.'},
 {id:'pie',d:4,base:'mil',cat:'transport',lat:45.813976,lng:9.080794,nm:'Imbarcadero di Como · Navigazione Laghi',q:'Navigazione Lago di Como, Piazza Cavour, Como',tag:['катер','t-must'],star:1,
  why:'Причал, от которого уходят катера по озеру. Билет берут в кассе на пирсе: быстрый до Белладжо идёт 45 минут, обычный — около двух часов.'},
 {id:'bpr',d:4,base:'mil',cat:'town',lat:45.987381,lng:9.260105,nm:'Imbarcadero di Bellagio',q:'Imbarcadero Bellagio',tag:['Белладжо','t-must'],star:1,
  hop:'катер 45 мин быстрый, 2 ч обычный',
  why:'Катер причаливает в самом центре деревни: от трапа сразу начинаются лестницы-улицы, лавки и кафе над водой.'},
 {id:'spa',d:4,base:'mil',cat:'nature',lat:45.991284,lng:9.265488,nm:'Punta Spartivento',q:'Punta Spartivento, Bellagio',tag:['мыс','t-must'],star:1,
  why:'Мыс на самом носу Белладжо, где озеро расходится на два рукава: справа Лекко, слева Комо, впереди Альпы. Десять минут от причала по набережной, бесплатно.'},
 {id:'mel',d:4,base:'mil',cat:'nature',lat:45.979058,lng:9.253158,nm:'Giardini di Villa Melzi',q:'Villa Melzi, Bellagio',tag:['сады','t-easy'],
  why:'Сады виллы вдоль самой воды: платаны, японский пруд и статуи. От причала — десять минут по набережной.'},
 {id:'vpr',d:4,base:'mil',cat:'town',lat:46.014027,lng:9.282884,nm:'Imbarcadero di Varenna',q:'Imbarcadero Varenna',tag:['Варенна','t-easy'],
  hop:'назад к причалу и катер 15 минут',
  why:'Через озеро от Белладжо. Катера ходят каждые полчаса, и с воды Варенна выглядит лучше всего.'},
 {id:'inn',d:4,base:'mil',cat:'nature',lat:46.011985,lng:9.282824,nm:'Passeggiata degli Innamorati',q:'Passeggiata degli Innamorati, Varenna',tag:['по воде','t-must'],star:1,
  why:'Дорожка на сваях по самой воде вдоль скалы — от причала к деревне. Идти десять минут, а фотографий на весь отпуск.'},
 {id:'mos',d:4,base:'mil',cat:'nature',lat:46.007662,lng:9.288004,nm:'Villa Monastero',q:'Villa Monastero, Varenna',tag:['сады','t-easy'],
  why:'Бывший монастырь, ставший виллой: два километра садов вдоль берега, лимонные деревья и дом-музей.'},
 {id:'vez',d:4,base:'mil',cat:'nature',lat:46.010821,lng:9.286088,nm:'Castello di Vezio',q:'Castello di Vezio, Varenna',tag:['если время','t-spare'],
  why:'Замок над деревней: двадцать минут в гору по тропе, зато оттуда озеро видно сразу в обе стороны. Днём здесь выпускают ястребов.'},
 {id:'vst',d:4,base:'mil',cat:'transport',lat:46.015094,lng:9.286232,nm:'Stazione di Varenna–Esino–Perledo',q:'Stazione di Varenna-Esino-Perledo',tag:['домой','t-easy'],
  why:'Отсюда прямой поезд в Милан, час до Centrale. Возвращаться катером в Комо не нужно — вечером их мало.'},

 /* ── день 5: Брера, золотой квадрат и вылет ── */
 {id:'car',d:5,base:'mil',cat:'town',lat:45.470332,lng:9.185704,nm:'Chiesa del Carmine',q:'Chiesa del Carmine, Milano',tag:['начало Бреры','t-easy'],
  why:'Кирпичная готика на площади, с которой начинается квартал Брера. Внутри прохладно и почти всегда пусто.'},
 {id:'sim',d:5,base:'mil',cat:'town',lat:45.473846,lng:9.184445,nm:'Basilica di San Simpliciano',q:'Basilica di San Simpliciano, Milano',tag:['IV век','t-easy'],
  why:'Одна из четырёх базилик, заложенных святым Амвросием. Тихий двор с колоннами в стороне от туристических улиц.'},
 {id:'bre',d:5,base:'mil',cat:'town',lat:45.472242,lng:9.188407,nm:'Pinacoteca di Brera',q:'Pinacoteca di Brera, Milano',tag:['галерея','t-must'],star:1,
  why:'Главная картинная галерея Милана: Рафаэль, Мантенья, Караваджо. Вокруг — квартал академии художеств с мастерскими и барами.'},
 {id:'ort',d:5,base:'mil',cat:'nature',lat:45.471035,lng:9.189699,nm:'Orto Botanico di Brera',q:'Orto Botanico di Brera, Milano',tag:['тишина','t-easy'],
  why:'Ботанический сад во дворе академии, заложенный в 1774 году. О нём не знают даже миланцы, вход свободный.'},
 {id:'pol',d:5,base:'mil',cat:'town',lat:45.468475,lng:9.191780,nm:'Museo Poldi Pezzoli',q:'Museo Poldi Pezzoli, Milano',tag:['дом-музей','t-easy'],
  why:'Квартира коллекционера XIX века, оставленная как была: оружие, часы, ковры и «Портрет молодой женщины» Полайоло.'},
 {id:'mon',d:5,base:'mil',cat:'town',lat:45.470089,lng:9.192767,nm:'Via Montenapoleone',q:'Via Montenapoleone, Milano',tag:['витрины','t-easy'],
  why:'Улица, ради которой в Милан едут за покупками. Даже если ничего не покупаешь, витрины здесь как выставка.'},
 {id:'bag',d:5,base:'mil',cat:'town',lat:45.469481,lng:9.194979,nm:'Museo Bagatti Valsecchi',q:'Museo Bagatti Valsecchi, Milano',tag:['дом-музей','t-easy'],
  why:'Дом двух братьев-собирателей XIX века, обставленный под ренессанс: резные потолки, доспехи и посуда, которой пользовались хозяева.'},
 {id:'spi',d:5,base:'mil',cat:'town',lat:45.469506,lng:9.197665,nm:'Via della Spiga',q:'Via della Spiga, Milano',tag:['пешеходная','t-easy'],
  why:'Пешеходная улица золотого квадрата: без машин, с витринами и кофейнями во дворах.'},
 {id:'nec',d:5,base:'mil',cat:'town',lat:45.468371,lng:9.201793,nm:'Villa Necchi Campiglio',q:'Villa Necchi Campiglio, Milano',tag:['дом-музей','t-must'],star:1,
  why:'Дом миланских промышленников 1930-х с бассейном во дворе — тот самый, где снимали «Я — это любовь». Всё оставлено как было, вплоть до посуды.'},
 {id:'bab',d:5,base:'mil',cat:'town',lat:45.466374,lng:9.197707,nm:'Piazza San Babila',q:'Piazza San Babila, Milano',tag:['конец','t-easy'],
  why:'Отсюда метро М1 идёт до Cadorna, а с Cadorna — поезд в аэропорт. Удобная точка, чтобы закончить прогулку.'}
];

const FOODCITIES=[
 /* Проверено по отзывам: из прежнего списка две позиции оказались слабыми
    (мороженое в Комо 3,9 и ресторан над Варенной 3,7) — заменены на те, что
    рядом и оценены выше. Оценки нигде не храним, они нужны были для выбора. */
 {city:'Милан',base:'mil',q:'Milan, Italy',lat:45.4642,lng:9.1900,
  spots:[
   {nm:'Luini Panzerotti',meal:'перекус',price:'€',veg:'вег ok',why:'жареные пирожки в двух шагах от собора, с 1949 года'},
   {nm:'Gloria Osteria',meal:'ужин',price:'€€',veg:'кое-что',why:'миланская кухня в Брере — одно из самых любимых мест города'},
   {nm:'Piz',meal:'обед',price:'€€',veg:'вег ok',why:'пиццерия у Дуомо: три вида пиццы и очередь на улице'},
   {nm:'Debbie’s',meal:'завтрак',price:'€',veg:'вег ok',why:'кофе и выпечка в Брере, открывается рано'},
   {nm:'Ristorante Rita',meal:'аперитив',price:'€€',veg:'вег ok',why:'коктейли на Навильи — как раз к первому вечеру'},
   {nm:'Nottingham Forest',meal:'вечер',price:'€€',veg:'вег ok',why:'коктейльный бар, известный на всю Италию'}
  ]},
 {city:'Комо и Варенна',base:'mil',q:'Como, Italy',lat:45.8081,lng:9.0852,
  spots:[
   {nm:'Osteria del Gallo',meal:'обед',price:'€€',veg:'кое-что',why:'семейная остерия в переулке у собора Комо'},
   {nm:'Gelateria Lariana',meal:'после обеда',price:'€',veg:'вег ok',why:'мороженое на набережной, по дороге к причалу'},
   {nm:'Passion Como',meal:'завтрак',price:'€',veg:'вег ok',why:'кофе и выпечка у вокзала Комо'},
   {nm:'Bar La Cambusa',meal:'ужин',price:'€€',veg:'кое-что',why:'у причала Варенны — пока ждёшь поезд домой'}
  ]}
];

const LINES=[
 {type:'leg',days:[1],label:'MXP → Милан',pts:[[45.629627,8.723548],[45.5600,8.9000],[45.4900,9.1200],[45.4684,9.1755]]},
 /* выезд на день: поездом в Комо, катером по озеру, поездом из Варенны обратно */
 {type:'trip',days:[4],label:'Комо на день',dash:'6,7',
  pts:[[45.4684,9.1755],[45.6000,9.1400],[45.7200,9.1000],[45.8141,9.0841],[45.8140,9.0808],
       [45.9000,9.1600],[45.9874,9.2601],[46.0140,9.2829],[46.0151,9.2862],[45.9000,9.3300],[45.6500,9.2600],[45.4859,9.2043]]},
 {type:'leg',days:[5],label:'Милан → MXP',pts:[[45.4684,9.1755],[45.4900,9.1200],[45.5600,8.9000],[45.629627,8.723548]]}
];

const TRIP_NAME='Милан и Комо';
const START='2026-09-18';
const IMGPREF='mi_';

const HERO={
  h1:'Милан',em:'и озеро Комо',
  sub:'Четыре ночи в городе и день на озере: собор и его крыша, «Тайная вечеря», аперитив на каналах, фуникулёр над Комо и катер в Белладжо.',
  photo:'img/mi_duo-l.jpg',alt:'Duomo di Milano',
  capTitle:'Duomo di Milano',capSub:'135 шпилей · на крышу пускают с девяти утра',place:'duo',
  parks:'2',parksCap:'города в поездке'
};

/* Фото ставим только там, где своими глазами проверили, что на снимке ИМЕННО
   это место. Автомат ошибается: приносил портрет певца вместо Ла Скала и
   «дорожку влюблённых» из Градары вместо Варенны. Где снимка нет — рисуется
   значок, и это честнее чужой картинки. */
const PHOTO={duo:'jpg',ter:'jpg',gal:'jpg',sfo:'jpg',bre:'jpg',nav:'jpg',
 mxp:'jpg',cad:'jpg',col:'jpg',lor:'jpg',eus:'jpg',tic:'jpg',dar:'jpg',lav:'jpg',
 rea:'jpg',mer:'jpg',amb:'jpg',sem:'jpg',bra:'jpg',arc:'jpg',sca:'jpg',tri:'jpg',
 cen:'jpg',leo:'jpg',amr:'jpg',mau:'jpg',clg:'jpg',cdu:'jpg',fun:'jpg',vez:'jpg',
 vol:'jpg',bpr:'jpg',mel:'jpg',vpr:'jpg',mos:'jpg',vst:'jpg',inn:'jpg',ort:'jpg',
 pol:'jpg',mon:'jpg',bab:'jpg',
 bas:'jpg',nov:'jpg',oss:'jpg',sat:'jpg',fed:'jpg',lif:'jpg',spa:'jpg',car:'jpg',sim:'jpg',nec:'jpg'};
const BPHOTO={mil:'duo'};

const ALT={};
const ALTNM={};

const ORIGIN={city:'Майами',code:'MIA',ll:[25.7617,-80.1918]};
const AIRPORT={mil:'MXP'};
const AIRPORTNM={MXP:'Милан'};
const AIRPORTWAY={MXP:'≈50 км · поезд Malpensa Express, 50 мин'};
const SEGMENT={mil:'flight'};
const TRANSFER={};

const META={
 cad:{dur:'50 мин из аэропорта',route:'Malpensa Express'},
 nav:{price:'аперитив €10–15',dur:'вечер',best:'с 18:00',route:'метро Porta Genova'},
 bas:{price:'бесплатно',dur:'15 мин',route:'между двумя базиликами'},
 nov:{price:'€10',dur:'1 ч',best:'вид на собор из окна',route:'на самой площади'},
 oss:{price:'бесплатно',dur:'15 мин',best:'необычное',route:'5 мин от собора'},
 sat:{price:'бесплатно',dur:'20 мин',route:'via Torino'},
 fed:{price:'бесплатно',dur:'20 мин',route:'2 мин от собора Комо'},
 lif:{price:'бесплатно',dur:'5 мин',route:'на молу у причала'},
 spa:{price:'бесплатно',dur:'40 мин',best:'ясный день',route:'10 мин от причала'},
 car:{price:'бесплатно',dur:'15 мин',route:'начало Бреры'},
 sim:{price:'бесплатно',dur:'20 мин',route:'север Бреры'},
 nec:{price:'€15',dur:'1 ч',best:'по сеансам',route:'via Mozart'},
 dar:{price:'бесплатно',dur:'30 мин',best:'на закате',route:'метро Porta Genova'},
 eus:{price:'€6 капелла',dur:'30 мин',route:'трамвай 3'},
 duo:{price:'€10 собор',dur:'1 ч',best:'до 10 утра',route:'метро Duomo'},
 ter:{price:'€15 лифт, €13 лестница',dur:'1 ч',best:'ясный день',route:'вход с северной стороны'},
 rea:{price:'€14 выставка',dur:'1–2 ч',best:'если дождь',route:'метро Duomo'},
 amb:{price:'€17',dur:'1 ч',route:'метро Cordusio'},
 sca:{price:'€12 музей',dur:'40 мин',route:'метро Montenapoleone'},
 rin:{price:'бесплатно',dur:'30 мин',best:'на закате',route:'верхний этаж'},
 sfo:{price:'двор бесплатно, музеи €5',dur:'1–2 ч',route:'метро Cairoli'},
 bra:{price:'€6 подъём',dur:'30 мин',best:'ясный день',route:'внутри парка'},
 tri:{price:'€10',dur:'1 ч',route:'метро Cadorna'},
 cen:{price:'€15',dur:'15 мин внутри',best:'билет за месяц',route:'метро Conciliazione'},
 leo:{price:'€10',dur:'2–3 ч',best:'с детьми',route:'метро Sant\'Ambrogio'},
 mau:{price:'бесплатно',dur:'30 мин',route:'метро Cadorna'},
 clg:{price:'€5–8 поезд',dur:'1 ч в пути',best:'первым утренним',route:'с вокзала Cadorna'},
 fun:{price:'€3 в одну, €5,50 туда-обратно',dur:'1–2 ч',best:'ясное утро',route:'от набережной 10 мин'},
 vol:{price:'€4',dur:'30 мин',route:'на самой набережной'},
 pie:{price:'€10–16 катер',dur:'45 мин до Белладжо',best:'проверь расписание',route:'причал у Piazza Cavour'},
 bpr:{price:'катер из Комо',dur:'2–3 ч в деревне',best:'до обеда',route:'причал в центре'},
 mel:{price:'€8',dur:'1 ч',route:'10 мин от причала'},
 vpr:{price:'€5 катер из Белладжо',dur:'15 мин в пути',route:'причал Варенны'},
 inn:{price:'бесплатно',dur:'20 мин',best:'к вечеру',route:'от причала вдоль воды'},
 mos:{price:'€9 сады и дом',dur:'1 ч',route:'юг Варенны'},
 vez:{price:'€4',dur:'1 ч с подъёмом',best:'если остались силы',route:'20 мин в гору'},
 vst:{price:'€7–10 поезд',dur:'1 ч до Милана',best:'не тяни до ночи',route:'верх деревни'},
 bre:{price:'€15',dur:'1,5 ч',route:'метро Lanza'},
 ort:{price:'бесплатно',dur:'30 мин',route:'вход через двор академии'},
 pol:{price:'€15',dur:'1 ч',route:'метро Montenapoleone'},
 bag:{price:'€14',dur:'1 ч',route:'между Spiga и Montenapoleone'}
};

const BUDGET=[
 {g:'Перелёт',ic:'plane',c:'#5a4bb5',c2:'#3b3080',items:[
   {k:'a1',nm:'Билеты',sub:'туда-обратно',per:'person',v:760,est:1},
   {k:'a2',nm:'Багаж',sub:'2 стороны',per:'person',v:90,est:1}
 ]},
 {g:'Транспорт',ic:'train',c:'#12855e',c2:'#0a6047',items:[
   {k:'c1',nm:'Malpensa Express',sub:'2 стороны',per:'person',v:30,ok:1},
   {k:'c2',nm:'Поезд Cadorna → Como Lago',sub:'в одну сторону',per:'person',v:7,ok:1},
   {k:'c3',nm:'Поезд Варенна → Милан',sub:'обратно вечером',per:'person',v:9,ok:1},
   {k:'c4',nm:'Катер по озеру',sub:'Комо → Белладжо → Варенна',per:'person',v:21,est:1},
   {k:'c5',nm:'Метро в Милане',sub:'на все дни',per:'person',v:20,est:1}
 ]},
 {g:'Входы и активности',ic:'ticket',c:'#d96a12',c2:'#b0530c',items:[
   {k:'t1',nm:'Il Cenacolo',sub:'«Тайная вечеря», билет заранее',per:'person',v:15,ok:1},
   {k:'t2',nm:'Terrazze del Duomo',sub:'крыша собора, лифт',per:'person',v:15,ok:1},
   {k:'t3',nm:'Duomo',sub:'вход в собор',per:'person',v:10,ok:1},
   {k:'t4',nm:'Funicolare Como–Brunate',sub:'туда-обратно',per:'person',v:6,ok:1},
   {k:'t5',nm:'Pinacoteca di Brera',sub:'галерея',per:'person',v:15,est:1},
   {k:'t6',nm:'Villa Melzi и Villa Monastero',sub:'сады на озере',per:'person',v:17,est:1},
   {k:'t7',nm:'Castello Sforzesco',sub:'музеи, опция',per:'person',v:5,est:1}
 ]},
 {g:'Еда',ic:'food',c:'#a1663a',c2:'#6f4227',items:[
   {k:'f1',nm:'Еда и кафе',per:'personday',rate:50,sub:'на человека в день'}
 ]}
];
