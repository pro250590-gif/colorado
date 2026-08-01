/* ==========================================================================
   ДАННЫЕ ПОЕЗДКИ — Колорадо (юго-запад, 10 дней)
   Это файл ТОЛЬКО с данными маршрута. Движок (index.html) рисует их.
   Новый маршрут = копия этого файла с другими данными.

   Дни: у города столько дней, сколько у него ночей (у последнего +1 на вылет).
   Первый день города (прилёт/переезд) и день вылета закреплены — не убираются.
   Порядок дней внутри города — как здесь в DAYS; пользователь может его менять.

   У места (P) есть два НЕОБЯЗАТЕЛЬНЫХ поля — движок выводит их сам из star/tag/META.best,
   заполняем руками только когда автомат ошибается:
     prio: 'must' | 'nice' | 'spare'                  — важность (обязательно / хочется / если время)
     when: 'fixed' | 'morning' | 'day' | 'evening'    — 'fixed' = по расписанию, переносить нельзя
   ========================================================================== */

const BCOL={dur:'#12855e',our:'#d96a12',asp:'#1d3448',den:'#5a4bb5'};

const BCOL2={dur:'#0a6047',our:'#b0530c',asp:'#0f2233',den:'#3b3080'};

const BASES=[
 {id:'dur',name:'Дуранго',emoji:'city',nights:3,color:BCOL.dur,lat:37.2753,lng:-107.8801,q:'Durango, CO',
  desc:'Живой город на реке Анимас, куда прилетаешь: узкоколейка, Меса-Верде, каньоны, источники Пагосы.',
  alt:'Альтернатива: посёлки к северу по US-550 (Hermosa, Haviland Lake) — тише, в город 20 мин. От аэропорта DRO 25 мин.'},
 {id:'our',name:'Урей (Ouray)',emoji:'city',nights:2,color:BCOL.our,lat:38.0228,lng:-107.6712,q:'Ouray, CO',
  desc:'«Швейцария Америки»: водопад в скальной щели, горячие источники, джип-трейлы, рядом Теллурайд.',
  alt:'Альтернатива: Ridgway (15 мин севернее) — тише и дешевле. Урей в 1,5–2 ч от Дуранго.'},
 {id:'asp',name:'Аспен / Басальт',emoji:'city',nights:3,color:BCOL.asp,lat:39.1911,lng:-106.8175,q:'Aspen, CO',
  desc:'Альпийская кульминация: Maroon Bells, ледниковые озёра, перевал Independence, города-призраки.',
  alt:'Аспен дорогой (от $450+). Basalt (20 мин) и Carbondale (40 мин) — те же горы за $110–160/ночь.'},
 {id:'den',name:'Денвер (у аэропорта)',emoji:'city',nights:1,color:BCOL.den,lat:39.7392,lng:-104.9903,q:'Denver, CO',
  desc:'Только переночевать перед вылетом. Район аэропорта / Аврора — чтобы утром спокойно доехать к рейсу.',
  alt:'Ищи отель с бесплатным shuttle до DEN — тогда можно сдать машину вечером 15-го и не платить лишний день аренды.'}
];

const DAY_BASE={1:'dur',2:'dur',3:'dur',4:'our',5:'our',6:'asp',7:'asp',8:'asp',9:'den',10:'den'};

/* ПЛАНЫ ДНЯ — варианты, из которых человек выбирает один. У каждого имя, одна
   строка «зачем» и приоритет: что смотреть в первую очередь. Порядок нужен не
   для красоты — по нему варианты становятся отдельными днями, когда в городе
   прибавляется ночь (первым уходит тот, у кого rank меньше). */
const OPTS={
  east:{nm:'Чимни-Рок и Пагоса',sub:'древности анасази и горячие источники, целый день на восток',rank:1},
  lake:{nm:'Озеро Валлечито',sub:'спокойные полдня у воды в сорока минутах от города',rank:2}
};

const DAYS=[
 {n:1,title:'Прилёт в Дуранго',pill:'прилёт',leg:'прилёт в аэропорт DRO · до города 25 мин',
  note:'<b>Первый вечер спокойный.</b> Прилетаешь, забираешь машину, заселяешься, гуляешь по Дуранго.'},
 {n:2,title:'Поезд Durango &amp; Silverton',pill:'поезд',leg:'отправление 08:15–09:45 от вокзала в центре Дуранго',
  note:'<b>Почему в начале:</b> при высокой пожароопасности поезд иногда останавливают. Раньше в блоке — есть куда пересесть.'},
 {n:3,title:'Меса-Верде — города в скалах',pill:'радиально',leg:'Дуранго → Меса-Верде 1 ч в одну сторону, ~85 км',
  note:'<b>Билеты внутрь</b> появляются за 14 дней в 08:00 по колорадскому времени (это 10:00 по флоридскому) и разбираются за минуты. В сам парк пускают и без билета.<br><b>Две экскурсии в один день можно,</b> но парк требует между ними не меньше двух часов: Cliff Palace в 11:00 → Balcony House не раньше 13:00. Long House и Mug House в этот день не берём — они на другой месе, там разрыв уже три-четыре часа.'},
 {n:4,title:'Million Dollar Highway: Дуранго → Урей',pill:'переезд',leg:'~120 км · 2 ч хода, закладывай 5–6 ч с остановками',note:''},
 {n:5,title:'Урей и Теллурайд',pill:'радиально',leg:'Урей ↔ Теллурайд ~1 ч 15 мин в одну сторону',
  note:'<b>Если плотно:</b> убери Yankee Boy — или наоборот Теллурайд, и посвяти день джип-туру и источникам.'},
 {n:6,title:'Урей → Аспен (Чёрный каньон)',pill:'переезд',leg:'~330 км · 5 ч хода, весь день с остановками',note:''},
 {n:7,title:'Maroon Bells',pill:'радиально',leg:'~30 км от Аспена, весь день у базы',
  note:'<b>Совет:</b> ехать своей машиной к рассвету (выезд ~06:15) — до 08:00 частные машины пускают, озеро зеркальное.'},
 {n:8,title:'Долины Аспена',pill:'радиально',leg:'2 короткие долины по 20–30 мин от Аспена',
  note:'<b>Про август:</b> после 13:00–14:00 грозы. Всё высокогорное — до обеда.'},
 {n:9,title:'Аспен → Денвер (Independence Pass)',pill:'переезд',leg:'~260 км · 4 ч хода, реально 6–7 ч с остановками',
  note:'<b>Ночуем у аэропорта Денвера.</b> Завтра ранний вылет — последнюю ночь лучше ближе к DEN.'},
 {n:10,title:'Денвер → вылет домой',pill:'финал',leg:'сдать машину · вылет из аэропорта DEN',
  note:'<b>Выезжай к аэропорту заранее.</b> Заложи время на сдачу машины и досмотр.'}
];

const P=[
 {id:'dro',d:1,base:'dur',cat:'transport',lat:37.1515,lng:-107.7538,nm:'Durango–La Plata County Airport (DRO)',q:'Durango-La Plata County Airport',tag:['прилёт','t-easy'],
  why:'Прилетаешь в аэропорт DRO. Забираешь машину — и за 25 минут в Дуранго. Прилетай засветло, чтобы спокойно заселиться.'},
 /* ОЗЕРО РАНЬШЕ НАБЕРЕЖНОЙ: аэропорт юго-восточнее города, озеро юго-западнее,
    центр севернее. По-старому человек ехал в центр, потом назад мимо города к
    озеру и снова в центр ночевать — 4,5 лишних километра и два прохода по
    одному месту. Теперь дорога идёт в одну сторону: аэропорт → озеро → центр */
 {id:'lnh',d:1,base:'dur',cat:'nature',lat:37.2350,lng:-107.9200,nm:'Lake Nighthorse',q:'Lake Nighthorse',tag:['если есть силы','t-easy'],
  why:'Если бодрая — закат на спокойном озере в 15 мин от города. Сап, купание.'},
 {id:'art',d:1,base:'dur',cat:'town',lat:37.2700,lng:-107.8790,nm:'Animas River Trail + Main Avenue',q:'Animas River Trail Durango',
  why:'Первый вечер: набережная вдоль реки через весь город и исторический центр Дуранго.'},
 {id:'trn',d:2,base:'dur',cat:'transport',lat:37.2740,lng:-107.8800,nm:'Durango & Silverton Narrow Gauge Railroad',q:'Durango & Silverton Narrow Gauge Railroad',tag:['ради этого едут','t-must'],star:1,when:'fixed',
  why:'Паровоз 1880-х, узкая колея, 72 км вдоль каньона Анимас по полке в скале на высоте 120 м. <b>Формат:</b> поезд туда + автобус обратно освобождает полдня. <b>Класс:</b> бери открытый вагон Rio Grande (~$144) для фото, садись слева по ходу.'},
 {id:'mvp',d:3,base:'dur',cat:'town',lat:37.3086,lng:-108.4187,nm:'Mesa Verde National Park',q:'Mesa Verde National Park',tag:['ЮНЕСКО','t-must'],star:1,
  why:'600 жилищ анасази в нишах отвесных скал, 700–800 лет. Вход $30/машина, только карта. От въезда 40 мин вверх — закладывай целый день.'},
 /* экскурсии идут по билету на конкретный час, и парк требует два часа между
    ними — порядок задан расписанием, а не географией: when:'fixed' держит их
    на месте, иначе счётчик пути честно предлагал поменять их местами */
 {id:'clp',d:3,base:'dur',cat:'town',lat:37.166876,lng:-108.473726,when:'fixed',nm:'Cliff Palace',q:'Cliff Palace Mesa Verde',tag:['нужен билет','t-must'],star:1,
  why:'Крупнейшее скальное поселение Северной Америки, 150 комнат. Внутрь только с рейнджером: 45 минут, четыре лестницы, спуск на 30 м. Билет $8 с человека на recreation.gov, мест 50.'},
 {id:'bch',d:3,base:'dur',cat:'town',lat:37.161563,lng:-108.464670,when:'fixed',nm:'Balcony House',q:'Balcony House Mesa Verde',tag:['нужен билет','t-must'],star:1,
  hop:'10 минут по Cliff Palace Loop',
  why:'Самая азартная экскурсия парка: час, лестница 10 м, лаз в скале 45 см шириной, обратно подъём по стене. Боишься высоты или тесноты — не бери. Мест 35, билет $8.'},
 {id:'mtl',d:3,base:'dur',cat:'town',lat:37.1830,lng:-108.4640,nm:'Mesa Top Loop Road',q:'Mesa Top Loop Road',tag:['без билетов','t-easy'],
  why:'Если билетов нет — кольцевая дорога с площадками, откуда жилища видно с другого края каньона.'},
 /* ВАРИАНТЫ ДНЯ, А НЕ ПРОДОЛЖЕНИЕ ЦЕПОЧКИ. Меса-Верде — на запад, эти — на
    восток и на север, в один день с ней они не складываются. Раньше это было
    сказано только словами в описаниях, и счётчик дня складывал всё подряд:
    выходил день на 31 час. Поле opt — «это ветка вместо основной».
    Чимни-Рок и Пагоса лежат на одной дороге на восток и как раз собираются в
    один день вдвоём (2,5 ч + 3 ч + дорога), поэтому они одна ветка. Озеро —
    другое направление, поэтому своя. */
 {id:'chr',d:3,base:'dur',cat:'town',lat:37.1900,lng:-107.3000,opt:'east',nm:'Chimney Rock National Monument',q:'Chimney Rock National Monument',tag:['вариант дня','t-easy'],
  why:'Храм анасази на высокой меса с ориентацией на луну — тише и атмосфернее Меса-Верде.'},
 {id:'pag',d:3,base:'dur',cat:'springs',lat:37.2695,lng:-107.0098,opt:'east',nm:'The Springs Resort, Pagosa Springs',q:'The Springs Resort Pagosa Springs',tag:['вариант дня','t-easy'],
  why:'40+ горячих ванн террасами к реке, глубочайший геотермальный источник в мире. 1 ч на восток.'},
 {id:'vlc',d:3,base:'dur',cat:'nature',lat:37.3800,lng:-107.5600,opt:'lake',nm:'Vallecito Lake',q:'Vallecito Lake',tag:['спокойный вариант','t-easy'],
  why:'Если скальные города не хочется — большое тихое горное озеро в 40 мин. Сап, пикник.'},
 {id:'hav',d:4,base:'our',cat:'nature',lat:37.4680,lng:-107.7960,nm:'Haviland Lake',q:'Haviland Lake Colorado',
  why:'Первая остановка за Дуранго: тихое лесное озеро у трассы. Кофе перед подъёмом.'},
 {id:'cbp',d:4,base:'our',cat:'nature',lat:37.6390,lng:-107.7770,nm:'Coal Bank Pass',q:'Coal Bank Pass',
  why:'Первый перевал дня, панорама на хребет Твилайт.'},
 {id:'mol',d:4,base:'our',cat:'nature',lat:37.7481,lng:-107.7053,nm:'Molas Pass Overlook',q:'Molas Pass Overlook',tag:['лучшая панорама','t-must'],star:1,
  why:'Та самая открытка Сан-Хуана: луга, озёра, зубцы хребта Гренадир. Рядом Little Molas Lake — зеркальное озерцо, 5 мин по грунтовке.'},
 {id:'sil',d:4,base:'our',cat:'town',lat:37.8119,lng:-107.6645,nm:'Silverton',q:'Silverton, CO',tag:['обед','t-easy'],
  why:'Городок на 600 человек на 2 836 м, главная улица грунтовая, дома как из вестерна. Тот, куда вчера приходил поезд.'},
 {id:'rmp',d:4,base:'our',cat:'nature',lat:37.8967,lng:-107.7128,nm:'Red Mountain Pass + Ironton',q:'Red Mountain Pass',
  why:'Ржаво-красные от окислов горы, остовы шахт, цветные отвалы. Самый «марсианский» участок.'},
 {id:'mdh',d:4,base:'our',cat:'nature',lat:37.9500,lng:-107.6900,nm:'Million Dollar Highway (US-550)',q:'Million Dollar Highway',tag:['легендарная дорога','t-must'],star:1,
  why:'40 км серпантина в отвесной стене над ущельем, без отбойников. Едешь на север (Силвертон→Урей) — внешняя полоса над обрывом, виды максимальные (боишься высоты — знай заранее). 25 миль/ч, не в грозу.'},
 {id:'bcf',d:4,base:'our',cat:'nature',lat:38.0050,lng:-107.6720,nm:'Bear Creek Falls',q:'Bear Creek Falls Ouray',
  why:'Последний карман перед Уреем: водопад падает под мостом, по которому едешь.'},
 {id:'ohs',d:4,base:'our',cat:'springs',lat:38.0290,lng:-107.6720,nm:'Ouray Hot Springs Pool',q:'Ouray Hot Springs Pool',tag:['вечер','t-easy'],
  why:'Заезд в Урей — и сразу в горячий бассейн под открытым небом среди скал. До 22:00.'},
 {id:'box',d:5,base:'our',cat:'nature',lat:38.0186,lng:-107.6740,nm:'Box Canyon Falls Park',q:'Box Canyon Falls Park',tag:['$8 · 45 мин','t-easy'],star:1,
  why:'В 5 мин от центра Урея: 26-метровый водопад в узкой щели, подвесной настил прямо по стене.'},
 {id:'per',d:5,base:'our',cat:'nature',lat:38.0250,lng:-107.6650,nm:'Perimeter Trail / Cascade Falls',q:'Cascade Falls Ouray',tag:['по желанию','t-hike'],
  why:'Тропа-кольцо вокруг города по склонам с мостами. До Cascade Falls 20 мин вверх.'},
 {id:'ykb',d:5,base:'our',cat:'nature',lat:37.9900,lng:-107.7800,nm:'Yankee Boy Basin',q:'Yankee Boy Basin',tag:['нужен джип','t-4x4'],star:1,
  why:'Альпийский цирк на 3 500 м, ковёр из колокольчиков и водопадов под Mt. Sneffels. На прокатной легковой нельзя — джип-тур из Урея, полдня, ~$100–150 с человека.'},
 {id:'tel',d:5,base:'our',cat:'town',lat:37.9375,lng:-107.8123,nm:'Telluride Gondola',q:'Telluride Gondola',tag:['бесплатно','t-must'],star:1,
  why:'Городок в тупике цирка. Бесплатная гондола через хребет в Mountain Village — 13 мин, вид на весь каньон. До полуночи.'},
 {id:'bvf',d:5,base:'our',cat:'nature',lat:37.9270,lng:-107.7860,nm:'Bridal Veil Falls',q:'Bridal Veil Falls Telluride',tag:['111 м','t-must'],star:1,
  why:'Самый высокий свободнопадающий водопад Колорадо в торце каньона. По асфальту до конца долины — смотришь снизу. Наверх только 4×4 или пешком 3 км.'},
 {id:'dld',d:5,base:'our',cat:'nature',lat:38.0800,lng:-107.8300,nm:'Dallas Divide',q:'Dallas Divide',
  why:'Дорога Урей–Теллурайд через этот перевал: классический вид на хребет Sneffels над ранчо. Лучше на закате.'},
 {id:'rid',d:6,base:'asp',cat:'nature',lat:38.1533,lng:-107.7573,nm:'Ridgway State Park',q:'Ridgway State Park',tag:['по пути','t-easy'],
  why:'Первая остановка за Уреем: водохранилище с пляжем под хребтом Сан-Хуан — размять ноги.'},
 /* координата была в 2,4 км севернее — на ДРУГОМ БЕРЕГУ каньона, куда от нашей
    дороги ехать полтора часа кругом. Нашлось через странное «улучшение» дня в
    минус 40 км: маршрутизатор не поверил в такой объезд и оставил оценку по
    прямой, а она и дала фантом. Теперь точка на South Rim Visitor Center —
    там, где человек паркуется и начинает смотреть (сверено по OpenStreetMap) */
 {id:'bcg',d:6,base:'asp',cat:'nature',lat:38.5550,lng:-107.6866,nm:'Black Canyon of the Gunnison NP',q:'Black Canyon of the Gunnison National Park',tag:['нацпарк №1','t-must'],star:1,
  why:'Ущелье 800 м глубиной, местами 400 м шириной — дно видит солнце меньше часа в день. South Rim: дорога вдоль обрыва с 12 площадками. Обязательно Painted Wall. 2–3 ч, вход $30.'},
 {id:'pnt',d:6,base:'asp',cat:'nature',lat:38.5680,lng:-107.7250,nm:'Painted Wall View',q:'Painted Wall View Black Canyon',
  why:'Розовые пегматитовые прожилки по чёрной стене — визитка каньона, 685 м, самая высокая стена Колорадо.'},
 {id:'mcc',d:6,base:'asp',cat:'nature',lat:39.1300,lng:-107.2900,nm:'McClure Pass',q:'McClure Pass',
  why:'Мягкий перевал через хребет Elk с видом на Mount Sopris. До него — садовые долины Paonia.'},
 {id:'mar',d:6,base:'asp',cat:'town',lat:39.0742,lng:-107.1897,nm:'Marble + Marble Mill Site Park',q:'Marble Mill Site Park',tag:['крюк 20 мин','t-easy'],
  why:'Отсюда мрамор для Мемориала Линкольна. Руины завода — белые развалины в лесу.'},
 {id:'red',d:6,base:'asp',cat:'town',lat:39.1836,lng:-107.2400,nm:'Redstone + Redstone Castle',q:'Redstone Castle',
  why:'Посёлок вдоль красной реки Crystal с замком угольного магната 1902 г. Кофе перед броском в Аспен.'},
 {id:'mrb',d:7,base:'asp',cat:'nature',lat:39.0975,lng:-106.9403,nm:'Maroon Bells + Maroon Lake',q:'Maroon Bells',tag:['открытка штата','t-must'],star:1,
  why:'Две бордовые пирамиды-четырнадцатитысячника в отражении озера. С 22 мая по 18 окт частные машины запрещены 08:00–17:00 — шаттл $16 или своя машина до 08:00 с бронью ($10). К рассвету — пустое зеркальное озеро.'},
 {id:'mls',d:7,base:'asp',cat:'nature',lat:39.0985,lng:-106.9370,hop:'пешком от Maroon Lake, тропа начинается у воды',nm:'Maroon Lake Scenic Trail',q:'Maroon Lake Scenic Trail',tag:['3 км · легко','t-easy'],
  why:'Петля вокруг озера и по осиновой роще. Подходит всем.'},
 {id:'crl',d:7,base:'asp',cat:'nature',lat:39.0742,lng:-106.9530,hop:'та же тропа дальше вверх, 1 ч в одну сторону',nm:'Crater Lake',q:'Crater Lake Trail Aspen',tag:['6 км · средне','t-hike'],
  why:'Продолжение тропы вверх, к озеру под стенами Bells. Набор ~210 м.'},
 {id:'gon',d:7,base:'asp',cat:'town',lat:39.1878,lng:-106.8231,nm:'Silver Queen Gondola / Aspen Mountain',q:'Silver Queen Gondola Aspen',tag:['после обеда','t-easy'],
  why:'Гондола из центра Аспена на вершину 3 417 м, до 7 сентября, от $40. Панорама 360° без усилий.'},
 {id:'asp',d:7,base:'asp',cat:'town',lat:39.1911,lng:-106.8175,nm:'John Denver Sanctuary, Aspen',q:'John Denver Sanctuary Aspen',
  why:'Вечером: кирпичные улицы 1880-х, галереи, тихий парк-мемориал у реки.'},
 /* координата стояла в 4,5 км от ближайшей дороги — в горах, куда не доехать.
    Клиент увидела это на карте: булавка висит в стороне от линии пути. Теперь
    парковка и тропа у шоссе 82 (сверено по OpenStreetMap) */
 {id:'gro',d:8,base:'asp',cat:'nature',lat:39.11906,lng:-106.70339,pin:'парковка и трейлхед у шоссе 82, а не склон над ним',nm:'Grottos Trail',q:'Grottos Trail Aspen',tag:['1,2 км · легко','t-easy'],star:1,
  why:'14 км восточнее Аспена: река проточила в граните гроты и ледяные пещеры, гуляешь как по луне. Парковка крошечная — до 10:00.'},
 /* и здесь то же: было в 3,7 км от дороги. Теперь смотровая с парковкой */
 {id:'dpb',d:8,base:'asp',cat:'nature',lat:39.11981,lng:-106.70887,pin:'смотровая с парковкой, сверено по OpenStreetMap',nm:"Devil's Punchbowl",q:"Devil's Punchbowl Aspen Colorado",
  why:'Изумрудный котёл-ванна в скалах выше Grottos. Вода ледяная.'},
 {id:'ash',d:8,base:'asp',cat:'town',lat:39.055591,lng:-106.799564,nm:'Ashcroft Ghost Town',q:'Ashcroft Ghost Town',tag:['$5','t-easy'],star:1,
  why:'Долина Castle Creek, 18 км: серебряный город 1880-х — салун, почта, хижины в лугу под пиками.'},
 {id:'cth',d:8,base:'asp',cat:'nature',lat:39.042866,lng:-106.808119,nm:'Cathedral Lake',q:'Cathedral Lake Trailhead',tag:['9 км · тяжело','t-hike'],
  why:'Набор 600 м до бирюзового озера в цирке на 3 617 м. Один из лучших хайков штата. Выходить не позже 8 утра.'},
 {id:'rgt',d:8,base:'asp',cat:'nature',lat:39.274950,lng:-106.887346,nm:'Rio Grande Trail → Woody Creek Tavern',q:'Rio Grande Trail Aspen CO',tag:['лёгкий вариант','t-easy'],
  why:'Асфальтовая велодорожка вдоль реки, 13 км до легендарной таверны Хантера Томпсона (сама таверна — в разделе «Где поесть», Аспен). Велосипед берётся в Аспене.'},
 {id:'igh',d:9,base:'den',cat:'town',lat:39.106753,lng:-106.603678,nm:'Independence Ghost Town',q:'Independence Ghost Town Colorado',
  why:'Первая остановка на подъёме из Аспена: остатки золотого посёлка 1880-х у дороги. Бесплатно, 20 мин.'},
 {id:'ind',d:9,base:'den',cat:'nature',lat:39.1086,lng:-106.5642,nm:'Independence Pass',q:'Independence Pass',tag:['гвоздь дня','t-must'],star:1,
  why:'Четвёртый по высоте асфальтовый перевал штата, один из самых зрелищных в США. Наверху настил-обзорка, тундра, вид на обе стороны хребта. Выезжай пораньше.'},
 {id:'twn',d:9,base:'den',cat:'nature',lat:39.0836,lng:-106.3800,nm:'Twin Lakes',q:'Twin Lakes, Colorado',
  why:'Два озера под самой высокой горой Колорадо (Mount Elbert, 4 401 м) после спуска. Отражения открыточные.'},
 {id:'dil',d:9,base:'den',cat:'nature',lat:39.6289,lng:-106.0436,nm:'Sapphire Point / Dillon Reservoir',q:'Sapphire Point Overlook',
  why:'Бирюзовое водохранилище в кольце вершин, площадка в 5 мин ходьбы. Обед лучше во Frisco.'},
 {id:'lov',d:9,base:'den',cat:'nature',lat:39.6636,lng:-105.8792,nm:'Loveland Pass',q:'Loveland Pass',tag:['крюк 25 мин','t-must'],star:1,
  why:'Съезд с I-70 на US-6. Последний альпийский перевал: седловина выше границы леса, снежники в августе. Прощальный вид перед Денвером.'},
 {id:'geo',d:9,base:'den',cat:'town',lat:39.7061,lng:-105.6972,nm:'Georgetown',q:'Georgetown, CO',tag:['30 мин','t-easy'],
  why:'Викторианский шахтёрский городок у I-70, весь центр — памятник. Последняя остановка перед Денвером.'},
 {id:'den',d:10,base:'den',cat:'transport',lat:39.8561,lng:-104.6737,nm:'Denver International Airport (DEN)',q:'Denver International Airport',tag:['вылет','t-must'],star:1,
  why:'Сдаёшь машину и улетаешь домой из DEN. Выезжай к аэропорту заранее — заложи время на сдачу машины и досмотр.'}
];

const FOODCITIES=[
 {city:'Дуранго',base:'dur',lat:37.2753,lng:-107.8801,q:'Durango CO',spots:[
  {nm:'Carver Brewing Co.',lat:37.27485,lng:-107.88006,meal:'завтрак/бранч',price:'$$',veg:'вег ok',why:'30+ лет — одна из старейших пивоварен Колорадо. Знаменитый бранч и своё пиво.'},
  {nm:'Diamond Belle Saloon',lat:37.27115,lng:-107.88164,meal:'обед/бар',price:'$$',veg:'кое-что',why:'Рэгтайм-салун 1880-х в отеле Strater, официантки в костюмах — ради атмосферы и коктейля.'},
  {nm:'Steamworks Brewing Company',lat:37.27234,lng:-107.87997,meal:'ужин/бар',price:'$$',veg:'вег ok',why:'С 1996; золото GABF за Steam Engine Lager, фирменный Cajun Boil.'}
 ]},
 {city:'Силвертон',base:'our',lat:37.8119,lng:-107.6645,q:'Silverton CO',spots:[
  {nm:'The Eureka Station',lat:37.81148,lng:-107.66341,meal:'ужин',price:'$$',veg:'кое-что',why:'Корнуэльские пирожки — традиционная еда шахтёров, на Blair St. Сезон ~июнь–окт.'},
  {nm:'Coffee Bear',lat:37.81281,lng:-107.66372,meal:'кофе',price:'$',veg:'вег ok',why:'Местный кофе и выпечка перед поездом или горами.'}
 ]},
 {city:'Урей',base:'our',lat:38.0228,lng:-107.6712,q:'Ouray CO',spots:[
  {nm:'Ouray Brewery',lat:38.02291,lng:-107.67126,meal:'обед/бар',price:'$$',veg:'вег ok',why:'~16 сортов своего пива, крыша-терраса с видом на 360°. Флайт и бургер.'},
  {nm:"Maggie's Kitchen",lat:38.02428,lng:-107.67123,meal:'обед',price:'$–$$',veg:'кое-что',why:'Любимая бургерная, стены в граффити; бургеры из лося/бизона. Вт закрыто.'}
 ]},
 {city:'Теллурайд',base:'our',lat:37.9375,lng:-107.8123,q:'Telluride CO',spots:[
  {nm:'Brown Dog Pizza',lat:37.93683,lng:-107.81065,meal:'обед/ужин',price:'$$',veg:'вег ok',why:'Владелец — чемпион мира по пицце; детройтская «313» или зелёное чили «The Telluride».'},
  {nm:'La Cocina de Luz',lat:37.93717,lng:-107.81026,meal:'обед/ужин',price:'$$',veg:'веган/GF',why:'Органик-мексиканская с 1998, лепёшки вручную, лучшая маргарита по цене.'},
  {nm:'Baked in Telluride',lat:37.93692,lng:-107.81226,meal:'завтрак/кофе',price:'$',veg:'вег ok',why:'Классическая пекарня-кафе: выпечка, завтрак-сэндвичи, «chronut».'}
 ]},
 {city:'Аспен',base:'asp',lat:39.1911,lng:-106.8175,q:'Aspen CO',spots:[
  {nm:'The White House Tavern',lat:39.19037,lng:-106.82043,meal:'обед/ужин',price:'$$–$$$',veg:'кое-что',why:'«Самый знаменитый сэндвич Аспена» — хрустящая курица, в крошечном доме.'},
  {nm:'Woody Creek Tavern',lat:39.27495,lng:-106.88735,meal:'обед/бар',price:'$$',veg:'кое-что',why:'Культовый дайв в 13 км, притон Хантера Томпсона; маргариты, бургер, энчилады.'},
  {nm:'Grateful Deli',lat:39.1909,lng:-106.82075,meal:'обед',price:'$',veg:'кое-что',why:'Лучшая сэндвичная (награды с 2010), субы на заказ — дёшево и вкусно.'},
  {nm:'Paradise Bakery & Cafe',lat:39.1882,lng:-106.81862,meal:'завтрак/десерт',price:'$',veg:'вег ok',why:'Классика Аспена с 1976: тёплое печенье, джелато.'}
 ]},
 {city:'Басальт',base:'asp',lat:39.3690,lng:-107.0330,q:'Basalt CO',spots:[
  {nm:'Tempranillo',lat:39.3689,lng:-107.03325,meal:'ужин',price:'$$',veg:'кое-что',why:'Испанские тапас/паэлья, 300+ испанских вин — без аспенских цен. Arroz negro.'}
 ]},
 {city:'Пагоса-Спрингс',base:'dur',lat:37.2695,lng:-107.0098,q:'Pagosa Springs CO',spots:[
  {nm:'Meander Riverside Eatery',lat:37.26988,lng:-106.99766,meal:'ужин',price:'$$$',veg:'вег ok',why:'Жемчужина: farm-to-table, в списке NYT «50 лучших ресторанов США 2024». Только ужин, бронь.'},
  {nm:'Kip\'s Grill & Cantina',lat:37.26878,lng:-107.00335,meal:'обед/ужин',price:'$–$$',veg:'кое-что',why:'Тако-институция региона: рыбные и креветочные тако Baja.'},
  {nm:'Two Chicks and a Hippie',lat:37.25649,lng:-107.07719,meal:'завтрак/кофе',price:'$',veg:'вег ok',why:'Колоритная местная пекарня-кафе: булочки с корицей, sticky buns.'},
  {nm:'Rosie\'s Pizzeria',lat:37.25563,lng:-107.07661,meal:'обед/ужин',price:'$$',veg:'вег ok',why:'Любимая местными пицца NY-style, всё с нуля.'}
 ]}
];

const LINES=[
 {type:'leg',days:[4],color:'#e0399b',label:'День 4: Дуранго → Урей',pts:[[38.0228,-107.6712],[38.0050,-107.6720],[37.8967,-107.7128],[37.8119,-107.6645],[37.7481,-107.7053],[37.6390,-107.7770],[37.4680,-107.7960],[37.2753,-107.8801],[37.1515,-107.7538]]},
 {type:'leg',days:[6],color:'#ff9500',label:'День 6: Урей → Аспен',pts:[[39.1911,-106.8175],[39.3689,-107.0325],[39.4022,-107.2114],[39.1836,-107.2400],[39.1300,-107.2900],[38.8683,-107.5920],[38.7050,-107.6100],[38.5750,-107.7010],[38.4783,-107.8762],[38.1533,-107.7573],[38.0228,-107.6712]]},
 {type:'leg',days:[9],color:'#5b6cff',label:'День 9: Аспен → Денвер',pts:[[39.8561,-104.6737],[39.7061,-105.6972],[39.6636,-105.8792],[39.6289,-106.0436],[39.5500,-106.1000],[39.2508,-106.2925],[39.0836,-106.3800],[39.1086,-106.5642],[39.1650,-106.6250],[39.1911,-106.8175]]},
 {type:'rad',days:[2],color:'#8e5b3a',dash:'2,10',w:4,label:'Поезд Дуранго → Силвертон',pts:[[37.2740,-107.8800],[37.4200,-107.8000],[37.6000,-107.7300],[37.8119,-107.6645]]},
 {type:'rad',days:[3],color:'#2f9e6f',dash:'8,8',w:3.5,label:'День 3: Меса-Верде',pts:[[37.2753,-107.8801],[37.3086,-108.4187],[37.1685,-108.4730]]},
 {type:'rad',days:[5],color:'#2f9e6f',dash:'8,8',w:3.5,label:'День 5: Теллурайд',pts:[[38.0228,-107.6712],[38.1533,-107.7573],[38.0800,-107.8300],[37.9375,-107.8123],[37.9270,-107.7860]]},
 {type:'rad',days:[7],color:'#2f9e6f',dash:'8,8',w:3.5,label:'День 7: Maroon Bells',pts:[[39.1911,-106.8175],[39.0975,-106.9403]]},
 {type:'rad',days:[8],color:'#2f9e6f',dash:'8,8',w:3.5,label:'День 8: долины',pts:[[39.1911,-106.8175],[39.1650,-106.6250],[39.1600,-106.6480],[39.0500,-106.7975],[39.0670,-106.6640]]}
];

/* как поездка называется в списке «Мои поездки» */
/* Шапка поездки. Фотография тут не «просто картинка города», а САМОЕ
   фотографируемое место маршрута — на него и ссылаемся полем place: пока это
   место остаётся в поездке, движок держит именно этот снимок и подпись. */
const HERO={
  photo:'img/hero-w.webp',alt:'Maroon Bells, Колорадо',
  capTitle:'Maroon Bells',capSub:'седьмой день · самое фотографируемое место Колорадо',
  place:'mrb'
};
const TRIP_NAME='Колорадо';
const START='2026-08-07';

const PHOTO={};["dro","art","lnh","trn","mvp","clp","vlc","pag","chr","hav","cbp","mol","sil","mdh","rmp","bcf","ohs","box","ykb","tel","dld","rid","bcg","pnt","mcc","mar","red","mrb","crl","gon","asp","gro","ash","rgt","igh","ind","dil","lov","geo","den"].forEach(k=>PHOTO[k]=1);
/* снимок Balcony House пришёл с Викисклада уже в jpg — у остальных webp */
PHOTO['bch']='jpg';
/* дозагружено с Викисклада скриптом fetch-photos.js — эти лежат в jpg, а не в webp.
   Значение = расширение файла. У Cathedral Lake свободного фото на Викискладе нет — там плашка. */
["mtl","per","bvf","mls","dpb","twn"].forEach(k=>PHOTO[k]='jpg');

const BPHOTO={dur:'art',our:'ohs',asp:'asp',den:'den'};

const ALT={1:1988,2:2836,3:2600,4:3322,5:3500,6:2700,7:2900,8:2870,9:3687,10:1609};

const ALTNM={1:'Дуранго',2:'Силвертон',3:'Меса-Верде',4:'Molas Pass',5:'Yankee Boy',6:'Чёрный каньон',7:'Maroon Bells',8:'Ashcroft',9:'Independence',10:'Денвер'};

/* ll — координаты аэропорта вылета. Нужны карте, чтобы нарисовать дугу перелёта
   и самолётик; раньше они были зашиты прямо в движок и на других маршрутах врали. */
const ORIGIN={city:'Майами',code:'MIA',ll:[25.7617,-80.1918]};

const AIRPORT={dur:'DRO',den:'DEN'};
/* Города аэропортов — тут они совпадают с городами ночёвки, но подпись нужна,
   чтобы карточка прибытия работала одинаково на всех маршрутах. */
const AIRPORTNM={DRO:'Дуранго',DEN:'Денвер'};
const AIRPORTWAY={DRO:'аэропорт в самом городе',DEN:'аэропорт в самом городе'};

const SEGMENT={dur:'flight',our:'car',asp:'car',den:'car'};

const TRANSFER={our:{km:120,clean:'2 ч',stops:'5–6 ч'},asp:{km:330,clean:'5 ч',stops:'весь день'},den:{km:260,clean:'4 ч',stops:'6–7 ч'}};

/* ссылки «проверить перед выездом» в футере — свои для каждого маршрута (пусто → строка скрывается) */
const PRECHECK=[
 {label:'дороги CDOT',url:'https://www.cotrip.org/'},
 {label:'поезд',url:'https://durangotrain.com/'},
 {label:'Maroon Bells',url:'https://www.visitmaroonbells.com/'},
 {label:'Mesa Verde',url:'https://www.recreation.gov/ticket/facility/233362'}
];

const META={
 dro:{min:40,price:'—',dur:'приезд'},
 art:{min:90,price:'бесплатно',best:'вечер'},
 lnh:{min:90,price:'бесплатно',best:'закат'},
 trn:{min:540,price:'$90–144/чел',best:'весь день'},
 mvp:{min:60,price:'$30/маш',best:'до полудня',route:'~1 ч от Дуранго'},
 clp:{min:60,price:'$8/чел',best:'первый утренний',route:'билет за 14 дней'},
 bch:{min:60,price:'$8/чел',best:'через 2 ч после Cliff Palace',route:'лестница 10 м и лаз'},
 mtl:{min:90,price:'входит в парк',best:'днём'},
 vlc:{min:120,price:'бесплатно',route:'~40 мин от Дуранго'},
 pag:{min:180,price:'от $67/чел',route:'~1 ч на восток'},
 chr:{min:150,price:'$12 +$20/маш',best:'днём',route:'~1 ч от Дуранго'},
 hav:{min:20,price:'бесплатно',route:'по пути'},
 cbp:{min:15,price:'бесплатно',route:'по пути'},
 mol:{min:25,price:'бесплатно',best:'днём',route:'по пути'},
 sil:{min:90,price:'обед',best:'обед',route:'по пути'},
 mdh:{min:60,price:'бесплатно',best:'днём, не в грозу',route:'сама дорога'},
 rmp:{min:30,price:'бесплатно',route:'по пути'},
 bcf:{min:10,price:'бесплатно',route:'по пути'},
 ohs:{min:90,price:'$26/чел',best:'вечер',route:'в Урее'},
 box:{min:45,price:'$8/чел',best:'днём',route:'в Урее'},
 per:{min:90,price:'бесплатно',best:'днём',route:'в Урее'},
 ykb:{min:180,price:'~$125/чел (джип)',best:'до полудня',route:'джип-тур из Урея'},
 tel:{min:150,price:'гондола бесплатно',best:'днём / закат',route:'~1 ч 15 от Урея'},
 bvf:{min:60,price:'бесплатно (снизу)',best:'днём',route:'за Теллурайдом'},
 dld:{min:15,price:'бесплатно',best:'закат',route:'по дороге в Теллурайд'},
 rid:{min:30,price:'~$10/маш',route:'по пути'},
 bcg:{min:120,price:'$30/маш',best:'днём',route:'крюк ~30 мин'},
 pnt:{min:15,price:'входит в парк',best:'днём',route:'в парке'},
 mcc:{min:15,price:'бесплатно',route:'по пути'},
 mar:{min:30,price:'бесплатно',route:'крюк ~20 мин'},
 red:{min:30,price:'бесплатно',route:'по пути'},
 mrb:{min:120,price:'шаттл $16 / парк. $10',best:'на рассвете',route:'~30 мин от Аспена'},
 mls:{min:60,price:'бесплатно',best:'утро',route:'у озера'},
 crl:{min:120,price:'бесплатно',best:'утро',route:'от Maroon Lake'},
 gon:{min:90,price:'от $40/чел',best:'после обеда',route:'центр Аспена'},
 asp:{min:45,price:'бесплатно',best:'вечер',route:'центр Аспена'},
 gro:{min:60,price:'бесплатно',best:'до 10:00',route:'~20 мин от Аспена'},
 dpb:{min:30,price:'бесплатно',best:'днём',route:'у Grottos'},
 ash:{min:60,price:'$5/чел',best:'днём',route:'~25 мин от Аспена'},
 cth:{min:270,price:'бесплатно',dur:'4–5 ч (хайк)',best:'выход до 8:00',route:'за Ashcroft'},
 rgt:{min:150,price:'прокат вело',best:'днём',route:'из Аспена'},
 igh:{min:20,price:'бесплатно',route:'по пути'},
 ind:{min:30,price:'бесплатно',best:'до полудня',route:'по пути (перевал)'},
 twn:{min:30,price:'бесплатно',best:'утро',route:'по пути'},
 dil:{min:30,price:'бесплатно',best:'днём',route:'по пути'},
 lov:{min:25,price:'бесплатно',best:'днём',route:'крюк ~25 мин'},
 geo:{min:45,price:'бесплатно (город)',best:'днём',route:'по пути'},
 den:{min:180,price:'—',dur:'вылет'}
};

const BUDGET=[
 {g:'Перелёт',ic:'plane',c:'#5a4bb5',c2:'#3b3080',items:[
   {k:'a1',nm:'Билеты',sub:'туда-обратно',per:'person',v:625,ok:1},
   {k:'a2',nm:'Багаж',sub:'2 стороны',per:'person',v:100,ok:1}
 ]},
 {g:'Машина',ic:'car',c:'#a1663a',c2:'#6f4227',items:[
   {k:'c1',nm:'Аренда машины',per:'day',rate:90,sub:'SUV · цена за день'},
   {k:'c2',nm:'Возврат в другом городе',sub:'Дуранго → Денвер · на всех',v:130,est:1},
   {k:'c3',nm:'Бензин',sub:'~1 150 км · на всех',v:120,est:1}
 ]},
 {g:'Входы и активности',ic:'ticket',c:'#d96a12',c2:'#b0530c',items:[
   {k:'t1',nm:'Поезд Durango & Silverton',sub:'открытый вагон',per:'person',v:156,est:1},
   {k:'t2',nm:'Mesa Verde',sub:'$30 / машина · на всех',v:30,ok:1},
   {k:'t3',nm:'Black Canyon',sub:'$30 / машина · на всех',v:30,ok:1},
   {k:'t4',nm:'Maroon Bells',sub:'шаттл',per:'person',v:16,ok:1},
   {k:'t5',nm:'Ouray Hot Springs',sub:'бассейн',per:'person',v:26,ok:1},
   {k:'t6',nm:'Box Canyon Falls',sub:'вход',per:'person',v:8,ok:1},
   {k:'t7',nm:'Гондола в Аспене',sub:'подъём',per:'person',v:40,ok:1},
   {k:'t8',nm:'Джип-тур Yankee Boy',sub:'опция',per:'person',v:125,est:1}
 ]},
 {g:'Еда',ic:'food',c:'#12855e',c2:'#0a6047',items:[
   {k:'f1',nm:'Еда и кафе',per:'personday',rate:45,sub:'на человека в день'}
 ]}
];

/* ── ДОРОГИ ПО-НАСТОЯЩЕМУ ── считано road-times.js, руками не править ── */
const ROADS={
 1:{ids:["@dur","dro","lnh","art"],km:[[null,27,10.3,0.8],[26.9,null,31,26.5],[10.3,31,null,9.9],[1.4,26.6,10,null]],min:[[null,36,20,2],[36,null,49,36],[20,49,null,20],[2,35,19,null]]},
 2:{ids:["@dur","trn"],km:[[null,0.2],[0.2,null]],min:[[null,1],[1,null]]},
 3:{ids:["@dur","mvp","clp","bch","mtl","chr","pag","vlc"],km:[[null,66.1,92.7,95.4,91.3,80.2,96.8,37.2],[66,null,31.9,34.6,30.5,144,160.5,103],[96.1,35.4,null,2.7,4.9,174.1,190.7,133.1],[93.5,32.8,1.9,null,2.2,171.4,188,130.4],[91.2,30.5,1.4,4.1,null,169.2,185.7,128.2],[80.2,144.1,170.7,173.4,169.3,null,36.8,72.5],[96.7,160.7,187.3,190,185.9,36.8,null,89.1],[37.2,103.1,129.7,132.4,128.3,72.6,89.1,null]],min:[[null,68,96,101,93,91,82,46],[68,null,49,54,46,155,146,113],[102,55,null,5,9,189,180,146],[97,50,4,null,4,184,175,141],[92,46,3,8,null,180,171,137],[91,156,183,188,181,null,57,92],[82,147,174,179,171,56,null,83],[46,113,141,146,138,92,83,null]]},
 4:{ids:["@our","hav","cbp","mol","sil","rmp","mdh","bcf","ohs"],km:[[null,93.3,73.5,47.5,37.7,21.1,19.2,4.6,0.7],[92.6,null,32.3,47.8,57.4,72.2,83,96,93.3],[72.8,32.3,null,28,37.6,52.4,63.1,76.2,73.5],[46.8,47.8,28,null,11.6,26.3,37.1,50.1,47.5],[37,57.4,37.6,11.6,null,16.6,27.4,40.4,37.7],[20.4,72.2,52.4,26.3,16.6,null,10.8,23.8,21.1],[18.5,83,63.1,37.1,27.4,10.8,null,null,19.2],[4.6,96,76.2,50.1,40.4,23.8,null,null,5.3],[0.7,94,74.2,48.1,38.4,21.8,19.9,5.3,null]],min:[[null,94,130,62,53,34,49,13,1],[94,null,77,39,43,60,98,104,95],[130,77,null,74,79,96,134,140,131],[62,38,74,null,11,28,66,71,63],[53,43,79,11,null,19,57,63,54],[34,60,96,28,19,null,38,44,35],[49,98,134,66,57,38,null,null,50],[13,104,140,71,63,44,null,null,15],[1,96,131,63,54,35,50,15,null]]},
 5:{ids:["@our","box","per","ykb","tel","bvf","dld"],km:[[null,0.7,3.1,null,null,null,33.3],[0.7,null,2.4,null,null,null,33.9],[2.4,2.4,null,null,null,null,35.6],[null,null,null,null,null,null,null],[null,null,null,null,null,2.4,null],[null,null,null,null,2.4,null,null],[33.3,33.9,36.3,null,null,null,null]],min:[[null,1,7,null,null,null,49],[1,null,5,null,null,null,50],[7,5,null,null,null,null,55],[null,null,null,null,null,null,null],[null,null,null,null,null,8,null],[null,null,null,null,8,null,null],[49,50,55,null,null,null,null]]},
 6:{ids:["@asp","rid","bcg","pnt","mcc","mar","red"],km:[[null,262.2,242.3,249.7,87.2,91.3,72.7],[262.1,null,65.9,73.4,175.1,191.1,189.5],[242.2,65.9,null,7.6,155.1,171.2,169.6],[249.6,73.3,7.7,null,162.5,178.6,177],[87.1,175.1,155.1,162.6,null,16,14.4],[91.2,191.1,171.2,178.6,16,null,18.6],[72.6,189.5,169.6,177,14.4,18.6,null]],min:[[null,246,234,256,84,94,69],[246,null,63,85,162,184,176],[234,63,null,23,150,172,165],[256,85,23,null,172,194,187],[84,162,150,172,null,22,15],[96,186,174,196,24,null,27],[69,177,165,187,15,25,null]]},
 7:{ids:["@asp","mrb","mls","crl","gon","asp"],km:[[null,17.4,17.1,null,0.8,0],[17.2,null,0.6,null,17.2,17.2],[17,0.7,null,null,17,17],[null,null,null,null,null,null],[0.8,17.4,17.1,null,null,0.8],[0,17.4,17.1,null,0.8,null]],min:[[null,27,27,null,2,1],[27,null,2,null,27,27],[27,2,null,null,26,27],[null,null,null,null,null,null],[2,27,27,null,null,2],[1,27,27,null,2,null]]},
 8:{ids:["@asp","gro","dpb","ash","cth","rgt"],km:[[null,14.8,14.3,20,21.7,13.5],[14.8,null,0.5,null,36.4,28.1],[14.2,0.5,null,null,35.9,27.6],[19.9,null,null,null,1.9,28.9],[21.6,36.3,35.7,1.9,null,30.6],[13.6,28.2,27.7,29,30.7,null]],min:[[null,22,21,31,33,17],[21,null,1,null,54,37],[20,1,null,null,53,36],[31,null,null,null,3,39],[33,55,54,3,null,42],[17,39,38,40,42,null]]},
 9:{ids:["@den","igh","ind","twn","dil","lov","geo"],km:[[null,230.3,223.9,196,109.9,96.8,72.4],[230.1,null,6.4,34.5,125.5,146.8,160.5],[223.7,6.4,null,28.1,119.1,140.5,154.1],[195.8,34.5,28.1,null,91.2,112.5,126.2],[109.2,125.5,119.2,91.2,null,24.6,39.5],[96.5,148,141.6,113.7,24.7,null,26.9],[72.2,160.6,154.2,126.3,40.2,27.1,null]],min:[[null,206,192,158,89,77,60],[207,null,14,49,126,142,152],[193,14,null,35,112,129,138],[158,49,35,null,77,94,104],[88,125,112,77,null,23,33],[77,143,129,95,24,null,23],[60,152,138,104,35,23,null]]},
 10:{ids:["@den","den"],km:[[null,43.1],[42.6,null]],min:[[null,39],[38,null]]},
};
const ROADLINES={
 "leg|4|38.023,-107.671":"iiagF~odpS?x@bYTr@dDQ~NpArB`Aw@EyBbFeFjAmG`@G@rCtA`C\\dDgC|YnG~MxFfE|Gn]lIpC|B@aDmBgA_D\\}GjBkCuBcH~AqAgCiAW{FhCwPlGoE\\mClCgDh@qEi@pEmCfD]lCmGnEuBbMQrHj@~ApBd@_BpAtBbHkBjC]|GfA~C`DlB}BAuI}CuGc]yFgEoG_NfC}Y]eDuAaCAsC{CnIuDjD[eAUsCdAc]q@eCaEsF@{At@o@dATpA`D~CrCl@rC_@pIb@|@nA@~HqQlFyE`NaSxKqA`DfBdBcCjIkD`OW`TsBj@iA@iDdAiBbFy@dMyHjN{F`NqOnH_Fv@{K|C_DvHpAxEs@`Gl@rGfNrIjKrIJrFdD`IlA~GjKfCs@nElAtNqC|TnOl@iAq@cCp@i@~BbFrABaAeEbAw@lClFvMjK`Et@hP?rfAj`@bf@zGpF|C|EjGbVpp@lRv[fF`NxIzKjFvL``@lX]vAyEo@aAlAZr@|HxBhD~IpCrDDx@m@R}Bo@}AaCe@RxBpHp@zIfDh@dDqAtDbFjBh@dIoO|A`@vBdLrBc@^iGrBN|A|Bp@zGo@`AoDf@NfA~FqAzEz@jBwAfE[nCnDz@pDInAw@NqAcCk@?CnA|A|BdH`C`TfBnJ`OzSbFhSzMv]dPjFhIrGtExAzCjPbAlF`CdChCbDhP~Kg@jYbL`EzGLxOtAvIlDlE~GjRjGlFx@c@LwAcH}JsF}ZU}Fl@oHlBuFhEcFjEgBvi@cBvPxEd\\YhXhF|h@eBhDl@vDeArFlBvSzB~KqAhD`@rQwAfSmFpFTjRoHpEmDtOkGtIsF|ByEd@wJbBsGOoPfA_FTiHhD{Hz@mRvKyS|E_UrN}P|O_ZfA{WdFyIfAaPrCwIrDaWbMe`@E}Fu_@i]eBnDcDyCbBiDdl@xh@fC~Dd@rDQbEuN|`@ChBz@r@pQ_NpFaC|K}LnJiDzIf@lEmBjHg@dQiF~IjDnMaGlGtEv@OrBaEzEm@pJd@pGxCjH}FzQaDxa@lCbOvL~Kp\\fDvDnO~HlWo@fPbD|T|MrPfOxA|FpAtXz@nFf^~i@oCvCFzA`BjCBzCkBlAgBtDkEeBq@jDHpE[d@qAa@u@pC{An@V~D~FpGmB~CnB`ElEdBNk@_@iA_DgAm@qHqFiFW_EzAo@t@qCpA`@Ze@IqEp@kDjEdBfBuDjBmAJ{AqBkEBsBbC_CzAlAdBK`JyIpCgAtQ@|Bv@~AtBhFfVPpNyA~IhCxVk@fEkFnJI~IlAhDvJfNpAbO|H`RjMzm@vJhVXfCqAnMmFxKmAvGNvIrCzLQvC}GrHyGvCkFpEi@rCbAfChD@bLeCxNqGpTOxDzA`CtC{@kCx@aCrAKfUpD`Az@TxDmBnBWfCpEkA~BlBbCPvBfEhErBvPiG|DNlDcA|CrGx@rEa@hIp@jRvA|CdDtCd@gAm@aDJ}DrBoJ|C_DbBuFtCuEbCkBhJs@jHfEr@KtAeFvH}A`GrDxBtDvDkDfKD~K_EhCcC|FRdAlA|AGvBhB`CZBg@uDuB_A}DpD~C`HZ~GiCdTcDxEsCjInEzC[rAj@tDeAjEdCzCCpR~Cr^dNfIt@vDxExEdCvB|ExG`A~FpFp\\_@lO`JtLxA~Eg@d@sAxDdCbJdCvBmA~FbCtBtBHdA{AtAw@zCyPlBb@`C[`AkB`BaIjB_DtEP`DoBrBcGzAwB~H_Em@k@nJjBb@h@vCiAfC}Ah@}BdFlFdS}ClMsFnGhCpLg@rC}HzEq@zDwC|C_@vGuC`BOzAv@`E}A`BQlEaIvCoD_HiBr@BhCrBrF~KrInBrEnDvBvBjDxFvNfAzHaCrKmB`EkMrNeCBmCrCk@`DnB~CzA@lI_DpKiArk@kR|Wu@lNaDtI[|YzDtq@lSjY|Gpr@|ErTxEvfB~u@hUbI~`BmJdLrAnVpIrKx@bJo@`TsGtn@|Edw@sBbX_FdOkIfLmJjJoChlBeElS~AhTfHbEPlGaBfPyNjHiBpSvBhV}@te@oEvkARvG}DtL}VrD{B~R}DvCwCpGwNdFeDro@eHnHz@~PdFzFJQwAoBi@YkAf@w@hCLT_AeX{EkIaFyK}@e@kBcBG`@iC_@eB{ARoAsA}A@gDuDwDyIyANuAcAg@_Ef@eEw@mFh@qJi@pJv@lFg@rDh@tAKhB~AtAxAOvDxIfDtD|AAnArAzAS^dBa@hCfCl@@dAxK|@jI`FdXzEU~@iCMg@v@XjAnBh@PvAdJCtRrFdo@pKpf@nOzQrI~V`Q`IbIfJdNrm@vxArEfF|EzBtoEr~A~dHbKxt@mHt[dEdWaD`Ih@`I|DhIfKvF`KnJdYvCnFhKbKhOnXzNhMrpAz_@r}@~S~ChGbFzCfDhE`AeAjAaInLlCqBxO~]lHnDOfCsBnFeRrMiGxL_MhEeCzWkBlZPp}Akf@hHeGxh@il@xs@yk@~DsId@iGs@eIwMqWgDkDqO}G_HeLyKc{@LyTbHid@xAc^_@y`@kK}eA{A_^i@{_DdDyeCzKAbOgDvJvBBzi@tMOr]kLjGkGbAMrk@tDfCxDt@`HtBdAv\\qA@gFp@cBdOsDdl@lFdLkLf@{@BkEpBg@hKnG`CGnB~@`Ds@dB~DxUaIfG}@jOjAbGsBzChCndAAP~@dCx@bGxGxKThIpJ~AWbAqB",
 "leg|6|39.191,-106.817":"gnenFjz}jS~An@yOjpAaIkBmD`[z@`Q]nJc_@|p@oVrq@gH~K{LbNwOnF_e@SmMxB{_@hX{WhIc`@bU}FtFoHzM{E|EsSvKuMvOkX`N{b@jIamBfe@y[jK_u@x{@kj@~x@iOpg@uUj\\kKr_@qGzKeUvNeNrEaLpKwMv@kKvGoL~CiIzHsYla@qMxHoDrF}Md`@cBrVmDrOiFli@MrTwBjTGhNaDrSFnP{DzZkDjOuSvZkRzLuCbDiDdI}Ine@cKzT}{AdsBcAo@gYtQa]r`@k@g@Fy@dA_@@cE{@cCmC@NtH`F`FlEtHnHhA`@jz@sDxTQ|EvGfh@L~Hk@dIyF|\\yDfFiMnIu`@nj@iNhIiv@pTkC`By\\h_@kJbPeMh^wWx|AyTfj@qB`PcFrbAoj@nfIe[bxB?v~@vExc@mDhX`QBjBsTvCkC|SmJjVSRsVzCiAtSYIcZdOsAtUHnC`B`FjNzm@k^rLaE|NsBnLWdvArBxM~BlpAr_@xHjApgBnFhKwA|RuHpG[zk@jKjLwAlFPtRpH`SFpRtIfTPpOfEtJdAlCbBbQzYjEbDfGe@dLsI~EN~GxD|NlOt[rFlQc@hCb@`N|Nr^bLh\\zGvOxNtEjC`W~FnO|@nS|JbIc@|OmKlc@oGfOiJzJ_OzGgD`u@kFfGb@|KlFpDj@zQ{D|FCjGpCpK`LnF~CvNtCpJQdHt@tKaAfS|Hpb@tE`Y`Gp\\tNj]nVdZjDnS|Hxg@z@tDlE|AzN~B|DfPrCjLRlB~AfDxGzHx@fIbEzGtAnOd@rIaDnC\\bJpFtNfExDjEfEfLbBnAfI~@jPrTbLf@fIrFjKjApQhUfXhQ`m@y@lL~C|EApMoGxMDfM_QfNeAzAdCa@pDyA~@gGf@mDtH}CpCkP~H}XdIiUhKkMJ_VrO}HzAsCo@gEqK{ByAaFt@sAtCuC~X`GlMfDtZf@`QQ~EcFhUCdDtFfSfEtIC~F{BjOTpFtHfUzGvLbC`S]rHwFbIq@zEvC`KbChOx@jNrInZzE`GjMfUtKzMrJ|HjEnKpNpFxW~X~Y`SdQxXdM|GxRlCfMfIvXtKlJfIzObGfTvTbTzL|G\\jYwEpCsCrGiOpH_BbGqEvPvAzWgCtH}BbLzA~T}LxMVnKyEnFl@rHuAxLnC`MW`UhKtK~I`QeAvO~CnI}DrGg@dFuFvCu@vMQbRxGtFA`FeCvIwIrFaBlENnL`ExQt@d`@_U|YgE~JL`EeA`I}H`JyWxTmPbVcDrSyHzFuFxL{DbGwEfVwHbCkBfYcDjPuHhWJrInBbFhG|AzFdDvB~CtGlANhEqBtABdP~IbLdAdCbDlEdB`L|MjMlEfAfBGzFzCtR~GnRu@vPN`P|A|OtEnQ|EzInBxOVrGqB|SUpK`@fEzDpLrAnYtHhc@jGpUxB~[rJxVhDhQ`Ctq@`ApIxJrWtAbYnKbV`A~F[rK_L~`@oDdk@}EjS[vHdAfVrEjZqAf`@hBvEdIhFtB|Hy@xG{GfIkBtEhBl_@`AtBvIxHtLxc@fQzRnFpJjFdQrBtQLxPaClU}DpOiTzj@qBpJ{@bKP~S`JboAvBlLhFpKhM`L~C`GpUfdAvCnVlBjGvChD~\\tU|ZzLdC~BdEdJlGtIdOj\\lP|VfH`VnJjS|Yf^hUv\\zEpVlDnH`Bu@ddAj@Pwc@jCBkCCW|o@}@`RoCrOgFdHwCvHSlJrIbDjZ|]dXhi@rAzHtEjr@rHlj@|YnxAnUz^vOfOfC~DdLjj@dDnIrF~G~]lWlc@xe@nJvHvYbRrTbGhRhNnXjMvQzV|HnS`LdIvDvEdGdMlJ~WtWlTjJStAh@xQyRp@eFUav@tA_F~FaIlEkNvJ{k@|GmL~QsMr[i\\dCoJn@kZ~AsE`CsBbVaF|mA`Adp@gMvNeA`UnAfe@zL~^SnNqBvJkFpG_I`LsTnDgD~G_DnIcAfx@BvE{@|EcDhPk]lBqJOsdEb@aEtC{E|L{FzDiDrRsYBeN}DEDgPdKd@|GgDbAeCl@wJ`AkCjo@eb@pCwEjF{R|DiCte@jLhmAvOrHs@vg@uTFlYq@`FsBzCmIlF}N`FaT`R_KhAiZwAoAtBfBrO@nv@hA`FbBbApw@@|BbBd@fB~@|cBxHxFpJPQ~uAfrBe@bl@cj@vA_@`PpRtFrAbK_@dR}ClK~@`LaB`YvB|EbE~LhQbKxb@~FtMvRfn@`AdIxDnMrDpRfPzb@~_@|XrJdEhPvMhNtGhE`EtG~JzHrDlFtEhNnTtByDtKcD|Pg@pCvAlFtM~@v@nCDvBoCLyDwJoTEuC~@uBhJjPbK|VcK}ViJkP_AtBDtCvJnTMxDwBnCoCE_Aw@mFuMqCwA}Pf@uKbDuBxDiNoTmFuE{HsDuG_KiEaEiNuGiPwMsJeE_`@}XgP{b@sDqRyDoMaAeIwRgn@_GuMcKyb@_MiQ}EcEaYwBaL`BmK_AeR|CcK^uFsAaPqRwA^cl@bj@grBd@P_vAqJQyHyF_A}cBe@gB}BcBqw@AcBcAiAaFAov@gBsOnAuBhZvA~JiA`TaR|NaFlImFrB{Cp@aFGmYwg@tTsHr@imAwOod@kLoCh@sA~AkFzRqCvEko@db@aAjCgAdMwIzF]vYiI|HmMnS{DhD}LzFuCzEc@`ENrdEmBpJiPj]}EbDwEz@gx@CoIbA_H~CoDfDaLrTkInJmKxEuN`Bw]Ayc@sLaUoAwNdAit@tM{fAsAyJz@gMhDqD`E}@fFm@xYyB~Gs[h\\_RrMoErG{CxJ}Dh[kBpHmEjNkFbH{A|DSp}@{@tB{PbQaBfHh@vBQ~`AtD~LW|\\yBdEiRvNaBbITdD`M~h@x@xMiCxrEBboErIz^~G~f@`AtQmBf|@kIxiBqP`hAkD~mAFdQbKhvCrB~OzC|Ihd@fr@jH|QzBzPNf_A`C|KpDvErFrCjRp@zFvArDrBhF~FbDrHnSdhA`Oxc@rGzK|b@jf@tHbR`{@xnIjyBEtEiQtOaI`m@Q?mvAfoDVnBlBp@bDNhy@jJlQpN_Yjb@_d@~fDstBl`Bq\\~`AyMbUuCvdAqFjHqDru@yt@`GwD~IaBnz@oC~HiA|yF}bC~pCm{AtNsLt}@igA|m@oz@lv@}w@zsA_~AjjAopAeDxBiCkDxCkDtC|Ens@_y@jGwAfzAIzgAvBzm@oBhF}AtcPeyMveAud@z_A{k@nJgE~MsBln@cD`YiGje@fAhScCre@qNvEoDtMiPpEeDfOuEtHO`[|BpOvEpHDt\\}O`YsX`PyKtIaCdl@nExb@fGvIkAvDuDnBoFnCma@jC_QpUuo@~HmKlR{P`OkXvG}Hn`@iQvIqAfO`GhD\\nk@aF~EBvDbA`_@r\\le@hSrFvHpKrYpIjIdMzHj`@`KzJMlOyK~QmBnSuHzKk@rKvAvv@z[lI|GrMlT~HzDxED|D_AlVyTzA_@z@bGBtm@wKCCaPxKk@Ome@hrA{uAdDsA|M^nGaApa@sUt[kWrd@iZpQ{CfOaIju@oTbXuRzRaUrDeCxu@uZf^kS~i@cWp[_KrKsAnH}Edi@iSbYqCdGgLjHqEpUoW|JmDdJB`G{Atl@mUzCkC|DuInCqC~DcA|LM|BcApFeNbg@c@?y@",
 "leg|9|39.856,-104.674":"arfrFjg{}RE|X|@zGbDnGnHjDfEJ?aAbHOnCiApVo^lCyA~a@D~ElC|CnHwAvkPxAdW`CxOhFdRhIlQ~J`N`MpKxO|HlM|CbPdA|eC^|O|Bfd@~MdRvCbxAnAjIlFvBlEhArG_@jMaH|PoAjILrWqo@|ePg@|X@xmCy@tOuGhn@Mzo@}@ff@BfaBnDdbBm@~y@mBfY}RniAjAhYeApYY`w@yBj_@vDfo@a@h~@m@~IuEfNm@|G`@tHjFpO|@xHO|hAg@xI_BtHsC`HeJnMeBpLbTf`BR`eAiB~_@BprAl@pVlEf[dYdfAbDxFrFhElJfBfrA]hTfBpT~Hbv@pi@`GdGxxAtoBp\\bo@f^bo@`GhIhK|JpcBplAf]~\\tBnE|@fF?bHaCvQ[|]cLtp@m@`y@kCnJyLtO}Gh[eI~q@E|J|Bh\\IvIaKnqAqQvp@iBrl@iA|McZ|gBi@~Gl@bJfCjHl_@ff@`d@nw@|BxJLfMaKth@cDhLeFbJiZz\\oFzLkDxNwAnNu@hw@sB|HkK|RqBjLHvMzDpZKpFqEl^tAbm@g@~JaEnPeM~TqBzFaNfz@}HdZiP`_@_MfMgHnKeEbDoPdHi[pUoPpGkMxAoCnDeIzVMfEf@tDnJnUDtEiD|Rd@zEtDlNj@rH_ApIgNv\\uAhImAbRt@`GtF`Jx@zDq@nUjHz`ASvGwCbQBlKtUnq@jCzPQxh@mDfS_@xGJ~QnBlXMjNwJ`j@gCj[mGx`@mMjk@}GhQ}NbTsEnPwMvNeClEsAxHPnP}@xHyTzp@}Q`c@qCjLcGtgAv@fv@aE~f@oAjm@iEtk@KnUnBn]dIh]|LnjAvKbn@pDtIpEnGt\\pX`G~Ibh@jeBzNn\\~FvF`[lOn^z\\zYvJh^nJrm@rHf@gIdC_@vX|E|VbMfAaIzBl@c@~C{Bm@c@`D}VcMa]uG_@^C~Jr\\`AdKvE~U|ZrX~a@fD`IfE`TzG~i@tR|e@t@|HGvHwNnkBx@rw@`Cj_@eBz\\vFfe@tC|rAi@dLqE|Ri@lL|@`LvMvm@`Fz^j@hNsKzoAe_@rbA_Nzk@yB`NnAxoBfAlLlBrGl\\`u@vKxP|`@pc@fSrX|G~ChDT`AiAzCrDzCtLLfUv@jBjBf@hBs@v@aCtA{S[{V{AiPtAiFb^wF~ELrXnG`Bi@f@yBWaBwE}FqC{GkOmKeGqHsCaGyCq@cKhBuIeAq@iATgAvDtAbD?fEkAjFwEdBEzDpD~Dn@dEzFhDZbE}@nDrCpFTxDpF|GbAfGzJhPpFhJ_BnHmGvHLfBqAdCeF~NwEpAwAS_BoAa@kNfBsK_@oMgHk@oAj@kBpAPlAtDjA`A|MGjj@sRdLq@rFjArFjEnAbDKxE|@j@v@mA_@eEgA_FqF_LBeElAkBnBa@`HdB`FbDrC~CHxCoAvBaEpAo@rCtDtNp@jMnDpK}@j\\l@nGfB|CfLvGpDtEhE`VvFbLpCzJpBlCzGxBlBfBbJhT|O`ZjB`FbB~Mc@vWhBfM`Wd^lHtSvIvHhO|\\|CpJrDzYpC~InEvFhJjFtBnEdRbnBmAby@RfGnPjz@dDfe@`L~_@v@tGKnNqIbtAiF`[kCfHsj@lz@_p@f]gGxH_Ux_@iE~BoInANvAkChAiA~D}PdJmDnFc@`Eb@nFxBm@jRfA}C~Q_GqAmDnCrPh]pAjFeB~ZxCf`@oBzd@zP|RtNjHpM`Az]yBnHvAdFnCdGtGjOjYl[lUhFxGjQ|Zzb@z_@|GbJ~@vDxFcGxfBoUpCcBhA{DzEma@vFUL|@~WeEvCmEk@eG`AyDhKzIrHnLrDvAvDs@hDZzUaM`L?tEaBpEjB~VOfI|@hEhBhFjEhA`ChKxDdEfFxCLhJoIlCuGpGJqGKmCtGiJnIyCMeEgFiKyDiAaCiFkEiEiBgI}@_WNqEkBuE`BaL?{U`MiD[wDr@sDwAsHoLiK{IaAxDj@dGwClE_XdEUuAsG]aF~d@kDnEkFvAfH|{@Cjq@kBxRpIAfFpAxFvDtFrGtIfRzFbVpGxPvFhJ`ItIxGtCjRPdGdAbN|IpKvO~FbFh`@dRrNj@pHrB|M~KrGjD~Hx@rHoA~_@kXtKkClH|@zHxEfT|]nDnD`GtCfGx@rFUbb@qIdSpAtCgAtZuWdeBol@nEi@|Mx@pt@eLtGKj\\nL~LlS~JnHvWhZf_Arf@jY`[~m@~d@hObPtT`KtF`HlKhUhEfE|UxKjGhAt^eExHlAlEpEvZhg@`R|UpD|BjSdDxJ`MzEzCpC`@nY{@xJoDpDKlEjClFvMlClD~D`CvJlAdVqDhH@fNnDlK|JlFv@v[mLt\\aZ~E{G~Pig@nE{CnEr@fB|Bp@~EoEtZ[xIdGpvB`DzK|Xja@nE|MbLbQzGxGtInF~LfD`Jd@hKo@ll@wLpl@oD|E`BnIxGfE|AzVBzFfArf@f^xD`JtWxyB|DfX~DdQpNf^hr@juAzPrKjHxMvEjE|D|@zo@bDpK`DtZrR|a@za@bEdCzGb@~P{A|c@nMrf@eLp@j@bBfJxMaDhS`}AjKUnEoBxBgDdFkOjBaArNrv@hF~Qr^pn@dMf^hExTxUzaB|CzGhFjDrGV~wAkVrRwE|JcHx{A}qA|_Amj@dL}AvJd@xInC|`@pRfKxArGkA~LmH~OqFrzCsg@vy@_^fmBikA`FeElLiTpw@mk@`ZcGt`@qLfh@{SrAAx@pAGxR{FfL~@hSAdMwAhMuBzHqNbYeO|SsZjo@qx@`iAgFvQcApRvYlzEhB~OtBxDl|@~~@NjEC}DnBjCjAlF@z]`AzHfCfGvGbIh@|NfJnIvLlVzBzAxJvBxHzKjEfCrMyAzK}FdCf@|AhDrAdOlHxNy@`EuJ~NwJE}EkEsAQaB`AgApD~AnOvErI~@vD{Bzz@kDvOa@re@cEb[rAbR{@lCoDhEy@dHiCdE[dCFhIdCpKJtJ_Ebg@_@~Vz@tRu@xFLvI`IhWcFtV_@~\\bLprAdLjd@uBbc@}CbSq@bPoIjc@oKhTmKh[qPvVw[fv@uZrTwIfAcXcCgNzGaa@nHol@jEgIsCkEoEeHoB_GoHcL}D_DoG}@CtAlJjKjJlK`O~FxDdG`H~b@hSvDjE\\dD]`RfCng@`Jz_@vDjYu@FcFoTaSua@mCeIyDqF_IOoBcBGeDlJ}WVyC_@]_@vD_ErGmNhS}FdEgA|BLtEtLdM~AhHInQiDvXkCvHgDhAgd@_LgD|B_F`@yVlL{@~GkKh[r@nBjKWvZ}HrMpBdGrDrNdSvKvd@~KfU`BtLjAlTOjXsDvi@aDdPiKtSuIjI}MpIgLz@wEpCuFl@_F|DgKsAcCeB}@R?jApGlH\\dBIdD_EpP[rSc@rAqHjEmCzPgB`BfBaBoDjd@f@~n@cCpS^lEY`GdC`WD`d@tApHt@rMuAlJ{CpKSrFxJtUQhBsAjBCzClA~EhDjFl@`Jr@pBbD~CrAdF`JpFnAlDhHhk@k@`SaDrK^|@jBVLdAsAhCqAjHOjb@_BfEW`DhAxX{BjPBvIeAtDnAnKxCvEsAbHiCjFz@~FfAdAItByItNcEnB{E~IsB~FaAzIqCzK{Av[wK|LqCjHmE`UeJ`L}KhY}@xI?`g@o@zD_BnCmEhBmPlAwV~UyRn\\qQ`S}@hEM`OaBbFwCjDuCt@wTW}BdAkF~GeJKsK~BgJdKcDlBaZtBkMpCaDfBmE~GeKzBmIhNyJtBoDbG{ErT}@dAaGtAsHbKu@vMiBrFyOtJaDrFqA~EuDj[aMsBkDrS_Bo@",
 "rad|3|37.275,-107.880":"siobFrimqSq@QkA`IaAdAxBrCrg@tLvBzCHrGw@vEkJxM_AzEjE~g@{@ph@z@pXhBzMrDnQ|L|^^~HsBpK{]vo@ge@pXaD|CgCpFaA`Hj@pK`NjZt@tHk@rHkI`QiBjGmA~JHzHjD`NpGtF|y@bO~FdBvElFhCjM~B|SNxbCe@fOoDzJaRnPaHrKoE|NcBlVkB`Hsa@dk@mHd[kQ|RiH`LmjAtvCmh@hv@{o@dt@cW|QuGdIuCpJwEld@}Pxb@mDr^_CtFyQvTwKnWcDxPoGnu@f@zp@xDze@zEb\\rCf~AhJ~zAbFn[InIkDjX}BpIoFfIgx@zx@iMbVyNt^uA~KKdIpB`ZtFf\\`PzYbC~HBdIcCzMeE|FyHzBiE]wTgHo[r@iHtDkLfNqUnc@oGpQ_Sn}@eDbb@s@j]z@xQlA`H`EdJ~Wta@tZx~@|Fh[lB`^rA|_E|AdQpE~M`\\zu@jgBbaEnEnPzBz\\?jNwAdKkBxFyW~h@k`@noAq`@bdB}Gbd@yGbRvK~E`PuBxN`CjP`ZrJjHvBh@tQsGpOhFvE\\`@iAkDwHt@mF~@]b@t@u@hCVbCxI`HGxH^`Ap@]QiDx@cHlEeErA{CdG_ExDjAtJN|NnC`CKtIqHnCeEbOuB|EyGjCeA~PpAtGnIzBt@bLcDBbDwAnENtAfCh@bEgCfChBDvBaCtHqDfEuO~FgHvLcDjAeJtR}Af@wAiAk@kEiAuB_B}@aIo@_BkBj@gG|GgCByA}CZmBxAkAnGp@nDvK|AvBvBrAtGbAl@|Ag@dJuRbDkAfHwLtO_GpDgE`CuHEwBgCiBcEfCgCi@OuAvAoECcDxVi@jGvDp[fF|FhDjDhHp@bHFvf@s@zFwBrEuNxQmUvc@uK`HyKzCw@pCB|NzAdBzBMnDyInF{CdN~Gf@qAwAsJRmApBoAvExBtCoEtAS`DnDvEjAbBkBx@wJ`E}HvCoAjCvAp@zCiAtK`C~Dx@nGhAp@~KGvA~ACpAmD~H{DvBs@xDb@fD~D~BpKEdArA[nBsGfEw@|AWbDv@|HsCjKeDbDw@tCRlEzGpHw@dJPhClA`BjFjBpRaBtGzF`Na@`ArAm@jBqGzBsBpH}@v@kEr@}E_AeDv@aQpLmDhFl@lFrLtHTvEhAlB~OzBdCnCi@~BmFzAsC~Dd@~B|J\\zA|BW~AqDzDNtKaDjLgDhEq@`EkBtCRrDvJbHvSfTn@zHjBrArYoD~J}D~`@xDrCbAtDlDbBhEMdEyE`G[zC~AlGdFpJlBfAp]bHfMlHjn@|GpG~BhZ`FnFQ|d@iJtMcFvLkO~JiHtGuI|i@ma@rl@gF~ToI`IaBjT{J|L_AnUiIzK?BgBr@}@z]nA|@{KzHqWbIsH`BaDBmPhBcD|DyBjLkAtKh@rPmBfQ~JhDh@",
 "rad|5|38.023,-107.671":"iiagF~odpS?x@cg@b@qFdN}BbA}LL_EbAoCpC}DtI{CjCul@lUaGzAeJC}JlDqUnWkHpEeGfLcYpCei@hSoH|EsKrAq[~J_j@bWg^jSyu@tZsDdC{R`UcXtRku@nTgO`IqQzCsd@hZu[jWqa@rUoG`A}M_@eDrAysAfvA|@|H@b[yKj@B`PvKB`@pf@sA|EaO|O_P~HgI|MsA|EqAx|Bp@tz@tBfLtE~I`H|FtStFnOvBxV~I|[rQzLfLv@YtFzBhTyDjMmItK}AlLXfDkAjPaAdPn@vRlKjFxJjFUv@~@rJkJxDcOhBkCpCm@zDaHzAjAe@pJrBjC?tA_ClBIxBlHiEm@iIlNs@hBeGlJuEfEqFdEc@zEb@tC|B~KcC~JDvMeI~GIrUuGThC_BfBM|ClIpJz@DlAcBT}DzAEhGfH~IrB~PnPtD`BhFbOzBzClGjClCtCbGrB~FBdCdC~KbElCDfBdCKhAfG~BvAEwADgG_CJiAgBeCmCE_LcEeCeC_GCcGsBmCuCmGkC{B{CiFcOuDaB_QoP_JsBiGgH{ADU|DmAbB{@EmIqJL}C~AgBUiCsUtG_HHwMdI_KE_LbCuC}B{Ec@eEb@gEpFmJtEiBdGmNr@l@hImHhEHyB~BmB?uAsBkCd@qJ{AkA{D`HqCl@iBjCyDbOsJjJw@_AkFTkFyJwRmKePo@kP`AgDjAmLYuK|AkMlIoSxDoG{Bw@XzUxc@pYtY~LlHlOjUtQtMhGvK|AxIBpS`AbIpNxj@|LrXbBjIWnIaLxd@DzGfBxFnD|CrEt@nEgApKaKlDiB~DOpEvAzg@|\\bSxIrDpGhGh[hT~R|BxENnFwB`ReAvXkOdaAuG|RyD|[g@vc@}F|]iEp_@g@h^iHbh@eIvN{AzF\\tk@}@nK\\jF|ClLfArSdFvNxE|\\`P`g@jLrYFpFgA~I\\fg@r@jDbHhOt@nR~DzNr\\rd@lBxD`CdM`JpJjQt[vHbIlGvKjJvGvJjQpTbPtO`\\hX|Q|QlExL~@~RrFvOfLtWjNfv@bZpTtNv]lMnQzT~FvEnYxOhGfGbU``@lClK`BbSlDgAzBmDvBcIb@wKvEyJvXsPbTqZhIuHtDiHhDwChBeJbGaPfWqMhKiLdMkHdBgCzEeOlDoFjAiHs@gLH_WhEcUj@sJoDqu@qDgTC}Rj@_DrLq\\`LgJxIwBrHyErU_IlLoGjKeB~IuGhs@ikApKc[^{IrA_Il@sVdCcLIgMfDgWlGoMhFmSdJ{MtGkD|A}BpCoOnGkp@rA_F|McYxQgTvHsMzAmFpAsQt@w~@bE{p@yDei@QoStAoO_CoUqFaYsEy]YyQv@iFmA}EuAsY_Asq@dFo`@`J_[rLc{AhIid@vI{WxTa\\hBoFpVw{AOmy@|@kE|HgI|AyD@kR",
 "rad|7|39.191,-106.817":"gnenFjz}jS~An@yOjpAaIkBmD`[x@lS[bHaAxBbHbEnCnE~@bKp@fa@xAt@rTZf\\d]lH|EvFfMdQbF`AlDDxMdB`GzBbCvFjB|FnNfJ|HhDbHtEnFrCjLvFzJ`I~AfGnO~AbBnKpGnDp@vHfHpYfPfVdUl]`QlH|IvOtBhQ~Rf\\hKpKdKha@jFnTvMjJtLxTbIzHnFlWhH~WlMfQf^fAdH|BhEhAhJjD`HzBxLt@pb@tBbD|MtH`DpFnBdIhFdKAzGhAj@fAgC",
 "rad|8|39.191,-106.817":"gnenFjz}jS~An@jDsS`MrBtDk[pA_F`DsFxOuJhBsFt@wMrHcK`GuA|@eAzEsTnDcGxJuBlIiNdK{BlE_H`DgBjMqC`ZuBbDmBfJeKrK_CdJJjF_H|BeAvTVtCu@vCkD`BcFLaO|@iEpQaSxRo\\vV_VlPmAlEiB~AoCn@{D?ag@|@yI|KiYdJaLlEaUpCkHvK}LzAw[pC{K`A{IrB_GzE_JbEoBxIuNHuBgAeA{@_GhCkFrAcHyCwEoAoKdAuDCwIzBkPiAyXVaD~AgENkb@pAkHrAiCMeAkBW_@}@`DsKj@aSiHik@oAmDaJqFsAeFcD_Ds@qBm@aJiDkFmA_FB{CrAkBPiByJuURsFzCqKtAmJu@sMuAqHEad@eCaWXaG_@mEbCqSa@sq@hDwa@gB`BfBaBiDva@`@rq@cCpS^lEY`GdC`WD`d@tApHt@rMuAlJ{CpKSrFxJtUQhBsAjBCzClA~EhDjFl@`Jr@pBbD~CrAdF`JpFnAlDhHhk@k@`SaDrK^|@jBVLdAsAhCqAjHOjb@_BfEW`DhAxX{BjPBvIeAtDnAnKxCvEsAbHiCjFz@~FfAdAItByItNcEnB{E~IsB~FaAzIqCzK{Av[wK|LqCjHmE`UeJ`L}KhY}@xI?`g@o@zD_BnCmEhBmPlAwV~UyRn\\qQ`S}@hEM`OaBbFwCjDuCt@wTW}BdAkF~GeJKsK~BgJdKcDlBaZtBkMpCaDfBmE~GeKzBmIhNyJtBoDbG{ErT}@dAaGtAsHbKu@vMiBrFyOtJaDrFqA~EuDj[eKeCmAb@sTldBaIkBgDbYr@jU[bH}@fAB`Aj@V|AwAv^cNzEcHtCmBxM~@ha@jLxIlL~IbR`TjOdLf@pMqAn[vKbRY~MtHhOjEdDUxDkBjPKfFwD`I{AvKb@hFaBlINfDeA~L`@lB}@vB{DhSeElMfAxIe@df@gFjEgCjM}@rEiHvGmCxGuHxH{MjGiAtE{CxAkCbXqLdCaAhL}@nBmA|NkSdVyTbE_A~CoCzFaMtJ}MjCgAvBaGfDcDtFe@xFoD`CyGxFo@rEeCtDaGxAcJnHsLbBaAvQ}BbOuL`FqBlMyLzGsC`EJpI`EzQaEvPlA`Ka@|If@nM{HlBmHrDwDv@qFhBeD`N}DdHJpC{BlEhBzIcDtHI`FaEtRNvFkElKmErPgK~D{@|E_FpBcJ~EuJxCyU~A}E~CuFrJyIjAcDdK{l@zFgLpFuCrCmEvAkLtCmELcHiEqDaFoIgI{II}@v@iAw@hAH|@fIzI`FnIhEpDMbHuClEwAjLsClEqFtCiCtDqBpFeKzl@kAbDsJxI_DtF_B|EyCxU_FtJqBbJ}E~E_Ez@sPfKmKlEwFjEuROaF`EuHH{IbDmEiBqCzBeHKaN|DiBdDw@pFsDvDmBlHoMzH}Ig@aK`@wPmA{Q`EqIaEaEK{GrCmMxLaFpBcOtLwQ|BcB`AoHrLyAbJuD`GsEdCyFn@aCxGyFnDuFd@gDbDwB`GkCfAuJ|M{F`M_DnCcE~@eVxT}NjSoBlAiL|@eC`AcXpLyAjCuEzCkGhAyHzMyGtHwGlCsEhHkM|@kEfCef@fFyId@mMgAiSdEwBzDmB|@_Ma@gDdAmIOiF`BwKc@aIzAgFvDkPJyDjBeDTiOkE_NuHcRXo[wKqMpAeLg@aTkO_JcRyImLa`@aLaOiAuClB{EbH_YzKwF`AXoLgAeQzCeXnAeAbGtAbTucBrA}@nKfCtDk[pA_F`DsFxOuJhBsFt@wMrHcK`GuA|@eAzEsTpCaFrAiAbImAlIiNdK{BlE_H`DgBjMqC`ZuBbDmBfJeKrK_CdJJjF_H|BeAvTVtCu@vCkD`BcFLaO|@iEpQaSxRo\\vV_VtRaBdCuA~AoCr@aGC{d@|@yI|KiYdJaLlEaUpCkHvK}LzAw[pC{K`A{IrB_GzE_JbEoBxIuNHuBgAeA{@_GhCkFrAcHyCwEoAoKdAuDCwIzBkPiAyXVaD~AgENkb@pAkHrAiCMeAkBW_@}@`DsKj@aSsFqe@~AvAt@lGjE`OvAOfBgDj@Jw@lBnFuBz@s@fFeZrDuArClB`BFzFgBdCwE^gClC[|AmBbCx@XyF|@iBtC{CnBS~AaF~CkEpDj@hJyNlBkLlDsHt@qGbDmBj@uDtCaFxA?|CqCPaCjBVzCiCpE}JdD_NmBea@zQ~NtCdElJfWzEb@bHhHhACbAgCrBJ",
};
const ROADSTEPS={
 "@dur>dro":"siobFrimqSq@QkA`IaAdAdDtDh`@dJjK`@xCqC|EgQrMiGxL_MhEeCzWkBlZPh|Aue@nFuDzk@oo@xs@yk@~DsId@iGs@eIwMqWgDkDqO}G_HeLyKc{@LyTbHid@xAc^_@y`@kK}eA{A_^i@{_DdDyeCzKAbOgDvJvBBzi@tMOr]kLjGkGbAMrk@tDfCxDt@`HtBdAv\\qA@gFp@cBdOsDdl@lFdLkLf@{@BkEpBg@hKnG`CGnB~@`Ds@dB~DxUaIfG}@jOjAbGsBzChCndAAP~@dCx@bGxGxKThIpJ~AWbAqB",
 "dro>lnh":"g{waF~stpScApB_BViIqJyKUcGyGeCy@Q_AodA@{CiCcGrBkOkAgG|@yU`IeB_EaDr@oB_AaCFiKoGqBf@CjEg@z@eLjLel@mFeOrDq@bBAfFw\\pAuBeAu@aHgCyDsk@uDcALkGjGs]jLuMNC{i@wJwBcOfDmL@sCxeCVz_Dh@fQnMtrA^x`@yAb^cHhd@@`\\fHbj@`D~LtGjIzMnFfDjDdMvWr@nFMjFs@|D}CpFgu@~l@ug@nk@gFfE_{Ajf@uH~@DzBxARfElMzEtGzA|\\a@zDhE~N~BnEfEjCzGjBhItMrArKpGxQ~CfUNhDgHjwBlBp^rFtWtFnNdKfPrCwE~@sGnAq@tAoErEeBrAcD~HuBbEoD`AkCNuDbBqB",
 "lnh>art":"wxfbFduvqScBpBOtDaAjCcEnD_ItBsAbDsEdBuAnEoAp@_ArGsCvEeKgPuFoNsFuWmBq^fHkwBOiD_DgUqGyQsAsKiIuM{GkBgEkC_CoEiE_O`@{D{A}\\{EuGgEmMyASE{BgQo@uV`AgFrA}CaG_H_FHwCk]{H{G~h@wEiA~BlA",
 "@dur>trn":"siobFrimqSdDt@ZgChAV",
 "@dur>mvp":"siobFrimqSq@QkA`IaAdAxBrCrg@tLvBzCHrGw@vEkJxM_AzEjE~g@{@ph@z@pXhBzMrDnQ|L|^^~HsBpK{]vo@ge@pXaD|CgCpFaA`Hj@pK`NjZt@tHk@rHkI`QiBjGmA~JHzHjD`NpGtF|y@bO~FdBvElFhCjM~B|SNxbCe@fOoDzJaRnPaHrKoE|NcBlVkB`Hsa@dk@mHd[kQ|RiH`LmjAtvCmh@hv@{o@dt@cW|QuGdIuCpJwEld@}Pxb@mDr^_CtFyQvTaM|ZyBjMoGnu@f@zp@xDze@zEb\\rCf~AhJ~zAbFn[InIkDjX}BpIoFfIgx@zx@iMbVyNt^uA~KKdIpB`ZtFf\\`PzYbC~HBdIcCzMeE|FyHzBiE]wTgHo[r@iHtDkLfNqUnc@}HtUqQjy@uEjo@FpU|BlU`EdJ~Wta@tZx~@|Fh[lB`^rA|_E|AdQpE~M`\\zu@jgBbaEnEnPzBz\\?jNwAdKkBxFyW~h@k`@noAq`@bdB}Gbd@yGbRvK~E`PuBxN`CjP`ZrJjHvBh@tQsGpOhFvE\\`@iAkDwHt@mF~@]b@t@u@hCVbCxI`HGxH^`Ap@]QiDx@cHlEeErA{CdFoDne@nEtIqHnCeEbOuB|EyGdB_ArEIpKtAtGnIzBt@bLcDBbDwAnENtAfCh@bEgCfChBDvBeExKaDbCaN~EgHvLcDjA}JdSeAVcAm@sAuGuAaByLsBq@oDjAoG",
 "mvp>clp":"qpubFxyvtSkAnGVjCpAbA`In@~A|@hAtBj@jEvAhA|Ag@dJuRbDkAfHwLtO_GpDgE`CuHEwBgCiBcEfCgCi@OuAvAoECcDxVi@bIjExYrExHrFnB~Ep@bHFvf@sAjImQ|UmUvc@uK`HyKzCw@pCB|NzAdBzBMnDyInF{CdN~Gf@qAwAsJRmApBoAvExBtCoEtAS`DnDvEjAbBkBx@wJ`E}HvCoAjCvAp@zCiAtK`C~Dx@nGhAp@~KGvA~ACpAmD~H{DvBs@xDb@fD~D~BpKEdArA[nBsGfEw@|AWbDv@|HsCjKeDbDw@tCRlEzGpHw@dJPhClA`BjFjBpRaBtGzF`Na@`ArAm@jBqGzBsBpH}@v@kEr@}E_AeDv@aQpLmDhFl@lFrLtHTvEhAlB~OzBdCnCi@~BmFzAsC~Dd@~B|J\\zA|BW~AqDzDNtKaDjLgDhEq@`EkBtCRrDvJbHvSfTn@zHjBrArYoD~J}D~`@xDrCbAtDlDbBhEMdEyE`G[zC~AlGdFpJlBfAp]bHfMlHjn@|GpG~BhZ`FnFQ|d@iJtMcFvLkO~JiHtGuI|i@ma@rl@gF~ToI`IaBjT{J|L_AnUiIzK?BgBr@}@z]nA|@{KzHqWbIsH`BaDBmPhBcD|DyBjLkAtKh@jNsB`Db@pOnJnD^tCyB",
 "clp>bch":"khzaF`bauS|AkAfEc@nJRvEqBzMqB~OiIdA}Bc@mFnEw@jAkCi@{Ht@iE?uLyAW{CvEiCiBiAB_E|GeEPcD`E",
 "bch>mtl":"kbyaFvp_uSqCXwApC_Ch@iAbD{B|AeGfJyEt@sI`G{OlCmJQwLnBmMe@cIn@}BfA",
 "@dur>chr":"siobFrimqSq@QkA`IaAdAdDtDh`@dJjK`@xCqC|EgQrMiGxL_MhEeCzWkBlZPh|Aue@nFuDzk@oo@xs@yk@~DsId@iGs@eIwMqWgDkDqO}G_HeLkKaw@YgMf@yMdGk^nAwOVed@s@wQkIsx@mB{Ym@gj@SaaCjI}uGjDw\\tCkoA~EwWd@sGe@mLiEuSs@yHfBsZ{Ak[xAmMfMi^vAoL}LahASe\\n@kGpBwFx^ig@tFwJhDaNn@}LoAiSsXsmBeE{J}Ya]cEaJaB{K{GcdA}Gwc@qTyhA{T{l@uEgGkDaCq]kMeJwBu[qCiFoCcp@oi@ep@mUsFmE_U{Wg_@qs@mZ}\\aIkR{C{Ul@of@eBuJaLyZq@ep@m@gGgFqRi@wI|@uJnC_IbPkPlCuF`A_FDulAcG_c@EkObCcLzTyf@fZaa@rIwWhF{Iz_Asm@lEiHzGeP~CgEplAag@~j@gd@zEaIxUum@fv@gvAfAqIi@mHkLs]_Jwf@o@}Il@gI`N_l@pAeOv@{b@uAafBhBaf@x@ap@tCqHtTq[dEaFhEoC`UgDvWbBhGm@xp@o[nCiDvAiGOsH{Hai@oDm`@h@wq@s@cL_Qmz@sPqWiCqKAmMrCsx@qC}j@JkG`A{G|GqUdEu^vXnAxSgEjFz@tDbDpIbXdDfE|k@rR``@|WzG|I|d@`eAlGxJhPtQeF~GqFx\\|@jGlB`BItAtA`C`@vCQvEhBzHa@hD^ZrAcAfFyHnFgAbFBn@\\G|@{H~H{FdBqFvE_JlDwDEU`CdDlCIlBsPvGcCpGgAl@eDCKqEoA{@kHt@aE}MaEbAoBiBqD?iFsCsKI",
 "chr>pag":"ws~aFd_~mSrKHhFrCpD?nBhB`EcA`E|MjHu@nAz@JpEdDBfAm@bCqGrPwGHmBeDmCTaCvDD~ImDpFwEzFeBfIiJc@o@sFEoFfAgFxHiBz@V}DiB{HPwEa@wCuAaCHuAmBaB}@kGpFy\\|@qBpC{ATqAiPuQmGyJ}d@aeA{G}Ia`@}W}k@sReDgEqIcXuDcDkF{@ySfEwXoArOacBB_Ko@sFqJaWgKyi@aEoLeg@g{@{e@}f@aDmEgE}J{NcaAGgM`DsZI}IoSaq@kIcb@gMgW}@qDu@a_@kEqWoAc\\yCeNK}VgK}h@Jgg@bAqElEkHnBeGhDql@v@_EjBqD~CaCt[mLxEwCpC}DrNk_@h@kNmFq[aAwNwBeGwCoCiaAom@}QqWwoCidGeUgmAgM}\\}@}GXeFxAkEd^g_@dDoLcAyYbDyf@@cNqRuS",
 "@dur>vlc":"siobFrimqSq@QxByPe[}HwAeIkDsFyHkHkCcHQkC{B}DkTgJwXuViLaUuGqIsUkeAcQgd@gMoXkAaOcI_RNsX}@aI}DcP}@oSiHcQqGgKyAkMyJc`@wDeXv@uHfHyPr@kFmGyj@pCiUS}MpAg[a@sF_Wsg@gUsIsMeLiToe@iAsFkC{i@sHc_@qBmDeQgLsLwOK{Jp@oHjIoLd@}B@oYsDcSiMmVqC{@aK]e_@_UgL{PiEwJyFsZyAeX`BkP\\ij@mVoPcPo]wEaNB{ToAoQmAqCmDiDwI_GqQec@y@uEwA_BtB_FhIaGnCiGd@uIaAaJzGua@nOgWxHgXfCqOtCcI~\\}e@`WuOhLuKbEgGrCeLoJuHiP}GcQ{MqViL_WcRcHgL_\\ox@aCaLmB}QuJkPuBiS{ByG{BkCiJ{E_KoKgS_G_H}DcPmFuFkIyNuj@sBoFuCsBdBmMz@gB|AiA~HsAxG_K|NoLn@cDuAmItBaF?eD_DkGuA}FmFwEqAyFsBcD~BqDHgGkIkJkCmA",
 "@our>hav":"iiagF~odpS?x@bYTr@dDK`P|@nAr@K`@kB}@qGhAy[u@oDaEsFZ}B`BFpA`DlDjD^zB_@pIb@|@nA@~HqQlFyE`NaSxKqA`DfBdBcCjIkD`OW`TsBj@iA@iDdAiBbFy@dMyHjN{F`NqOnH_Fv@{K|C_DvHpAxEs@`Gl@rGfNrIjKrIJrFdD`IlA~GjKfCs@nElAtNqC|TnOl@iAq@cCp@i@~BbFrABaAeEbAw@lClFvMjK`Et@hP?rfAj`@bf@zGpF|C|EjGbVpp@lRv[fF`NxIzKjFvL``@lX]vAyEo@aAlAZr@|HxBhD~IpCrDDx@m@R}Bo@}AaCe@RxBpHp@zIfDh@dDqAtDbFjBh@dIoO|A`@vBdLrBc@^iGrBN|A|Bp@zGo@`AoDf@NfA~FqAzEz@jBwAfE[nCnDz@pDInAw@NqAcCk@?CnA|A|BdH`C`TfBnJ`OzSbFhSzMv]dPjFhIrGtExAzCjPbAlF`CdChCbDhP~Kg@jYbL`EzGLxOtAvIlDlE~GjRjGlFx@c@LwAcH}JsF}ZU}Fl@oHlBuFhEcFjEgBvi@cBvPxEd\\YhXhF|h@eBhDl@vDeArFlBbUzBrJqAhD`@dN}@tVgGpFTjRoHpEmDxXiM|DiIV}HlBsIYoNfA_FTiHhD{Hz@mRvKyS|E_UrN}P|O_ZfA{WdFyIfAaPrCwIrDaWfLu^vA}ApBStB`BrAbDXnEs@~EsM~]ChBz@r@pQ_NlEcB|OuOfHsBfIj@fGaCpFSlMuEnDQfHhDnMaG|GtEzCqEzEm@pJd@pGxCxJ_HnQeCt`@|CdNlL~Kp\\fDvDnO~HlWo@fPbD|T|M`OdMxB~E~Cdc@l`@`l@zB?`JyIpCgAtQ@|Bv@~AtBhFfVPpNyA~IhCxVk@fEkFnJI~IlAhDvJfNpAbO|H`RjMzm@vJhVXfCqAnMmFxKmAvGNvIrCzLQvC}GrHyGvCkFpEi@rC\\dB|Df@tLiC~MmGjUSxDzA~CjE|GxT|AhK`AhApTaJnKfGzBbChBnF|@rYv@|DjQjM|@hBNrDiBtVXdBhCd@zKmKzIkD~Fo@jEbA`DvDl@dC]fKxAvKm@vNlBdExBPpKwFlDYjOfA|BjB~D|HxGlB|m@OtLyC`SfJhCTdHcArAd@n@pCe@jByJnDsDvG{JbIoAxDRfNxC|M|CzHQtL\\`CdBx@`By@nB_MbEwK|DuCnFuAxBr@nA`Cg@pJV~D`GpHzU|BpTtJtUc@xIrChNdRvBjK]vHyEfQyInL?tCrBvBvKcDpKiAdi@uQjZkAlNaDtI[|YzDtq@lSjY|Gpr@|ErTxEvfB~u@hUbI~`BmJdLrAnVpIrKx@bJo@`TsGtn@|Edw@sBbX_FdOkIfLmJjJoChlBeElS~AhTfHbEPlGaBfPyNjHiBpSvBhV}@te@oEvkARvG}DtL}VrD{B~R}DvCwCpGwNdFeDro@eHnHz@~PdFzFJQwAoBi@YkAf@w@hCLT_AeX{EkIaFyK}@e@kBcBG`@iC_@eB{ARoAsA}A@gDuDwDyIyAN_BuA",
 "hav>cbp":"}ttcFnz|pS~AtAxAOvDxIfDtD|AAnArAzAS^dBa@hCfCl@@dAxK|@jI`FdXzEU~@iCMg@v@XjAnBh@PvA{FK_QeFoH{@so@dHeFdDqGvNwCvC_S|DsDzBuL|VwG|DwkASue@nEiV|@qSwBkHhBgPxNmG`BcEQiTgHmS_BilBdEkJnCgLlJeOjIcX~Eew@rBun@}EaTrGcJn@sKy@oVqIeLsA_aBlJiUcIwfB_v@sTyEqr@}EkY}Guq@mS}Y{DuIZmN`D}Wt@sk@jRqKhAmI~CoBK{AuCj@aDlCsCdCCjMsNlBaE`CsKgA{HyFwNwBkDoDwBoBsE_LsIsBsFCiChBs@nD~G`IwCPmE|AaBw@aEN{AtCaB^wGvC}Cp@{D|H{Ef@sCiCqLrFoG|CmMmFeS|BeF|Ai@hAgCi@wCkBc@j@oJ~Dl@vB_IbG{AnBsBQaD~CuE`IkBjBaBZaAc@aCxPmB",
 "cbp>mol":"efwdFtxvpSyPlBb@`C[`AkB`BaIjB_DtEP`DoBrBcGzAwB~H_Em@k@nJjBb@h@vCiAfC}Ah@}BdFlFdS}ClMsFnGhCpLg@rC}HzEq@zDwC|C_@vGuC`BOzAv@`E}A`BQlEaIvCoD_HiBr@BhCrBrF~KrInBrEnDvBvBjDxFvNfAzHaCrKmB`EkMrNsBNbCyD~EaQh@kLmC_K}IoM}D_DkG{AuUb@qTuJ{U}BaGqHW_Ef@qJoAaCyBs@oFtA}DtCcEvKoB~LaBx@eBy@]aCPuL}C{HyC}MSgNnAyDzJcIrDwGxJoDd@kBo@qCsAe@eHbAiCUaSgJuLxC}m@NyGmB_E}H}BkBkOgAmDXqKvFyBQmBeEl@wNyAwK\\gKm@eCaDwDkEcA_Gn@{IjD{KlKiCe@YeBhBuVOsD}@iBkQkMw@}D}@sYiBoF{BcCoKgGqT`JaAiA}AiK}GyT_DkEyD{AkUR_NlGuLhC}Dg@]eBh@sCjFqExGwC|GsHPwCsC{LOwIlAwGlFyKpAoMYgCwJiVkM{m@}HaRqAcOwJgNwAuERsHhEoHhAmEeCsX|AeLo@aQ_EoPoBwCyCy@yQDsMzKeBJ{AmAcC~BCrBpBjEKzAkBlAgBtDkEeBq@jDHpE[d@qAa@u@pC{An@",
 "mol>sil":"oikeFfjkpSzAo@t@qCpA`@Ze@IqEp@kDjEdBfBuDjBmAC{CaBkCG{AnCwCg^_j@{@oFqAuXyA}FsPgO}T}MgPcDmWn@oO_IgDwD_Lq\\eM{Kua@oDoQdCyJ~GqGyCqJe@{El@{CpE}GuEoM`GgHiDoDPmMtEqFRgG`CgIk@gHrB}OtOmEbBqQ~M{@s@BiBtN}`@PcEe@sDgC_E_g@ed@eDsCYj@",
 "sil>rmp":"qbxeFzfcpSXk@jc@n`@t@jHcMd`@sD`WsCvIgA`PeFxIgAzW}O~YsN|P}E~TwKxS{@lRiDzHUhHgA~EXnNmBrI{@jLaExFqWjLqElD}RtH_F[uVfGeN|@iDa@sJpAcU{BsFmBwDdAiDm@}h@dBiXiFe\\XwPyEwh@xAkFpB{C~CkCdG{@hHRvHrF|ZbH|JMvAy@b@kGmF_HkRmDmEuAwIMyOyC{FsZcM_Lf@_CqM{B}D{GeDkPcAyA{CsGuEkFiIkVyK",
 "rmp>mdh":"kvhfFvvlpSuZgR{ScFaKkOoS}AeHaC}A}BBoAj@?pAbCv@OHoA{@qDoCoDgEZkBvA{E{@_GpAOgAnDg@p@wA_AeH{BsBsAPMjFcA|@}Aq@AuC}BqGeBr@aG`NyBe@uDcFeDpAgDi@q@{IyBqHd@S|A`C|Bn@l@SEy@qCsDiD_J}HyB[s@`AmAxEn@b@mAg`@wXJ`BsBM_ChDeC}Dw@EdCbLH|CvB~BdDjMyMwOuFwBoE]|HxGjDpI}B_C}GcCkGjBhFbAeId@nBnAkCF{AhCqAThKm@xFdCf@pB}E]kIt@_EnKgD|DuIl@}BqC",
 "mdh>bcf":"u`qfFhfjpS|BpCtIm@fD}D~DoKjIu@|E\\g@qByFeCiKl@pAUzAiCjCGoBoAdIe@iFcAjGkB|GbC|B~BkDqI}HyGnE\\tFvBxMvOeDkMwB_CI}CeCcLv@DdC|D~BiDxBAsEgMcK}MgFaNmRw[ySml@_EgHyIeGcf@{GsfAk`@iP?yE_A_MaKmCmFcAv@`AdEsAC_CcFq@h@p@bCm@hA}ToOuNpCoEmAuCl@eCwFkCmCaImAsFeDsIKsIkKkE{K{AsAmFe@yEr@eJ_A_C~Dg@hJoH~EaNpOkNzFeMxHcFx@eAhBAhDk@hAaTrBaOVkIjDeBbCaDgBgKdAsNlSmFxE_IpQoAAc@}@^qIm@sC_DsCqAaDeAUu@n@AzA`ErFp@dCeAb]TrCZdAtDkDzCoI@rCtA`C\\dDgC|YnG~MxFfEtGb]tI|C|B@aDmBgA_D\\}GjBkCuBcH~AqAqBe@k@_BPsHtBcMlGoE\\mClCgDh@qE",
 "bcf>ohs":"im~fF|bepSi@pEmCfD]lCmGnEiCvPVzFfChA_BpAtBbHkBjC]|GfA~C`DlB_AFsKgDuGc]yFgEoG_NfC}Y]eDuAaCAsCa@FkAlGcFdFDxBaAv@qAsBLoPiAaC{_AP",
 "@our>box":"iiagF~odpS?x@bYTr@dDK|H",
 "box>per":"}m`gFraepSDzF`Bp@j@aA}@aIdAc]yFuLl@kAtAPpA`DxDbEFaCiBcFcCoEwECaIwEcFc@}HtCmBsB",
 "per>ykb":"{pagFzccpSlBrB|HuCbFb@`IvEvEBbCnEhBbFG`CyGoJgAGo@~AzF`Ly@r`@d@hBdCwB|AmBjAmG`@G@rCtA`C\\dDgC|YnG~MxFfE|Gn]hYxGvCrFlE`ErUrMrBjDT|CnD~D~@xCpGdDtGtJ`MDvCfB|LlLfD`B`@|ElEjHhIz@dP|M|DjEzA`HbCtAS^sBs@Af@nRdQrK`MrC`BbGzMbChCxAnIvFjJfAxInCpDrBbJxCjE",
 "tel>bvf":"stpfFva`qSfNm{@Omy@|@kE|HgI|AyD@kR",
 "bvf>dld":"_wofF`a{pSAjR}AxD}HfI}@jENly@qVv{AiBnFwJnLaIpNwIzWiIhd@sLb{AaJ~ZeFn`@^dd@dCfl@^zZrEx]pF`Y~BnUuAnOPnSxDdi@cEzp@u@v~@qArQ{AlFwHrMyQfT}MbYsA~EoGjp@qCnO}A|BuGjDeJzMiFlSmGnMgDfWHfMeCbLm@rVsA~H_@zIqKb[is@hkA_JtGkKdBmLnGsU~HsHxEyIvBaLfJsLp\\k@~CB|RpDfTnDpu@k@rJiEbUI~Vr@fLkAhHmDnF{EdOeBfCeMjHiKhLgWpMcG`PiBdJiDvCuDhHiItHcTpZwXrPwExJc@vKwBbI{BlDmDfAaBcSmCmKcUa`@iGgGoYyO_GwEoQ{Tw]mMqTuNgv@cZuWkNwOgL_SsFyL_A}QmEiX}QuOa\\qTcPwJkQkJwGmGwKwHcIkQu[aJqJaCeMmByDs\\sd@_E{Nu@oRcHiOs@kD]gg@fA_JGqFkLsYaPag@yE}\\eFwNgAsS}CmL]kF|@oK]uk@zA{FdIwNhHch@f@i^hEq_@|F}]f@wc@xD}[tG}RjOeaAdAwXvBaROoF}ByEiT_SiGi[sDqGcSyI{g@}\\qEwA_ENmDhBqK`KoEfAsEu@oD}CgByFE{G`Lyd@VoIcBkI}LsXqNyj@aAcICqS}AyIiGwKuQuMmOkU_MmHqYuY{Uyc@v@YnGzBnSyDjMmItK}AlLXfDkAjPaAdPn@vRlKjFxJjFUv@~@rJkJxDcOhBkCpCm@zDaHzAjAe@pJrBjC?tA_ClBIxBlHiEm@iIlNs@hBeGlJuEfEqFdEc@zEb@tC|B~KcC~JDvMeI~GIrUuGThC_BfBM|C~EnEv@rBpBr@lAcBT}Dh@WzHxH~IrB~PnPtD`BhFbOzBzClGjClCtC",
 "@asp>rid":"gnenFjz}jS~An@yOjpAaIkBmD`[z@`Q]nJc_@|p@oVrq@gH~K{LbNwOnF_e@SmMxB{_@hX{WhIc`@bU}FtFoHzM{E|EsSvKuMvOkX`N{b@jIamBfe@y[jK_u@x{@kj@~x@iOpg@uUj\\kKr_@qGzKeUvNeNrEaLpKwMv@kKvGoL~CiIzHsYla@qMxHoDrF}Md`@cBrVaExRuEff@MrTwBjTGhNaDrSFnPkHpg@}CtGsPvUkRzL}D|EaCjG}Ine@cKzT_tB`qCgKn\\}A`KDft@sDxTQ|EvGfh@L~Hk@dIyF|\\yDfFiMnIu`@nj@iNhIiv@pTkC`By\\h_@kJbPeMh^wWx|AyTfj@qB`PcFrbAsRrmCzTHrY~E`C~By@|RpCj[lEvx@XhnAiA`}@eFxv@mFnXdOsAtUHnC`B`FjNzm@k^tUsGjSy@xnAxAdUxClpAr_@xHjApgBnFhKwA|RuHpEa@zm@pKlRoA`TzH`SFpRtIfTPpOfEtJdAlCbBbQzYjEbD~EOvJaI|Es@rH|ClKvL~E~C~[hFvOk@hCb@`N|Nr^bLh\\zGvOxNtEjC`W~FnO|@fOjI~E|@pGcAnMkJtd@}GfOiJzJ_OzGgD`u@kFfGb@|KlFpDj@zQ{D|FCjGpCpK`LnF~CvNtCpJQdHt@tKaAfS|Hpb@tE`Y`Gp\\tNj]nVdZjDnS|Hxg@z@tDlE|AzN~B|DfPrCjLRlB~AfDxGzHx@fIbEzGtAnOd@rIaDnC\\bJpFtNfExDjEfEfLbBnAfI~@jPrTbLf@fIrFjKjApQhUfXhQ`m@y@lL~C|EApMoGxMDfM_QfNeAzAdCa@pDyA~@gGf@mDtH}CpCkP~H}XdIiUhKkMJ_VrO}HzAsCo@gEqK{ByAaFt@sAtCuC~X`GlMfDtZf@`QQ~EcFhUCdDtFfSfEtIC~F{BjOTpFtHfUzGvLbC`S]rHwFbIq@zEvC`KbChOx@jNrInZzE`GjMfUtKzMrJ|HjEnKpNpFxW~X~Y`SdQxXdM|GxRlCfMfIvXtKlJfIzObGfTvTbTzL|G\\jYwEpCsCrGiOpH_BbGqEvPvAzWgCtH}BbLzA~T}LxMVnKyEnFl@rHuAxLnC`MW`UhKtK~I`QeAvO~CnI}DrGg@dFuFvCu@vMQbRxGtFA`FeCvIwIrFaBlENnL`ExQt@d`@_U|YgE~JL`EeA`I}H`JyWxTmPbVcDrSyHzFuFxL{DbGwEfVwHbCkBfYcDjPuHhWJrInBbFhG|AzFdDvB~CtGlANhEqBtABdP~IbLdAdCbDlEdB`L|MtNvFb@`BMvEzCtR~GnRu@vPN`P|A|OtEnQjF`KvBrReCbe@`@fEzDpLrAnYtHhc@jGpUxB~[rJxVhDhQ`Ctq@`ApIxJrWtAbYnKbV`A~F[rK_L~`@oDdk@}EjS[vHdAfVrEjZqAf`@hBvEdIhFtB|Hy@xG{GfIkBtEhBl_@`AtBvIxHtLxc@fQzRnFpJjFdQrBtQLxPaClU}DpOiTzj@qBpJ{@bKP~S`JboAvBlLhFpKhM`L~C`GpUfdAvCnVlBjGvChD~\\tU|ZzLdC~BdEdJlGtIdOj\\lP|VfH`VnJjS|Yf^hUv\\nH~[pIfMlEtKfI`HpFlQlHtP~FnGrGtApDxBjZ|]dXhi@rAzHtEjr@rHlj@|YnxAnUz^vOfOfC~DdLjj@dDnIrF~G~]lWlc@xe@nJvHvYbRrTbGhRhNnXjMvQzV|HnS`LdIvDvEdGdMlJ~Wz_@~ZzBlFQ~`AtD~LClYoBvGgStOaBbITdD`M~h@x@xMiCxrEBboErIz^~G~f@`AtQmBf|@kIxiBqP`hAkD~mAFdQbKhvCrB~OzC|Ihd@fr@jH|QzBzPNf_A`C|KpDvErFrCjRp@zFvArDrBhF~FbDrHnSdhA`Oxc@rGzK|b@jf@tHbR`{@xnIjyBEtEiQtOaI`m@Q?mvAfoDVnBlBp@bDNhy@jJlQpN_Yjb@_d@~fDstBl`Bq\\~`AyMbUuCvdAqFjHqDru@yt@`GwD~IaBnz@oC~HiA|yF}bC~pCm{AtNsLt}@igA|m@oz@lv@}w@zsA_~Az~BojCjGwAfzAIzgAvBzm@oBhF}AtcPeyMveAud@z_A{k@nJgE~MsBln@cD`YiGje@fAhScCre@qNvEoDtMiPpEeDfOuEtHO`[|BpOvEpHDt\\}O`YsX`PyKtIaCdl@nExb@fGvIkAvDuDnBoFnCma@jC_QpUuo@~HmKlR{P`OkXvG}Hn`@iQvIqAfO`GhD\\nk@aF~EBvDbA`_@r\\le@hSrFvHpKrYpIjIdMzHj`@`KzJMlOyK~QmBnSuHzKk@rKvAvv@z[lI|GrMlT~HzDxED|D_AlVyTzA_@z@bG@b[yKj@B`N",
 "rid>bcg":"azzgFbjupSCaNxKk@Ac[}@}HyV~UwEhBmGB_I{DsMmTmI}Gwv@{[sKwA{Kj@oStH_RlBmOxK{JLk`@aKeM{HqIkIqKsYsFwHme@iSa_@s\\wDcA_FCok@`FiD]gOaGkER{d@fSwG|HaOjXwYdYsFrLsPdf@kC~PoCla@oBnFwDtDwIjAyb@gGel@oEuI`CaPxKaYrXu\\|OqHEqOwEa[}BuHNgOtEqEdDuMhPwEnDse@pNiSbCke@gAaYhGmn@bD_NrBoJfE{_Azk@weAtd@s`PjvM_KxCuj@`Bw}@kBqdBJoG~@iExDm]uk@F_W{l@JkDrBma@BaC}y@l@slGgBmg@bBedExDsdAyCq{Aw\\sNgYPyEy@}LBiAgDe@gYu@aGTsIi@yA_Cc@kHjBea@CgCg@uCyDcKiZmKmLiNiJoEq@}Qt@mJfDaMSiHoAqNyHeKgLqB{DI{IkBiByA\\m@xAl@vG]`CqCnAoC_AqAcC}AeKs@aTwCkO_Mg^_IyG}AmCp@gHQqFfBwDF{BiEqGeA{HXkCpDqI[aEqCkAwGpEyGv@qXaFoFOgBcB}DkO{BcCmKkAsFd@iAbB",
 "bcg>pnt":"sfijFvogpSzB|Bt@vDbCrAtAzCpBtAd@vBkDrFGpDwAlFh@hKaCfGMjFoB~HmA`BgFnBoChJwMhLqKqAsBoAeFyHwJ{BiFcKeBGu@nBKxKiAT_FyBu@l@mBrKaHKObAvArH}GbNwIlJmJX_AbAOrF~CjGGfB`AP|BQzDcFrBuGdAc@zHWfHmCjDvDo@|A~BnA~BlJe@jIs@`BNjRaFfDfAtGmFpQrCvF",
 "pnt>mcc":"q|kjF|bopSsCwFlFqQgAuG`FgDOkRr@aBd@kI_CmJ_CoAn@}AkDwDgHlC{HVeAb@sBtG{DbF}BPaAQFgB_DkGNsF~@cAlJYvImJ|GcNwAsHNcA`HJlBsKt@m@~ExBhAUJyKt@oBdBFhFbKvJzBdFxHrBnApKpAnL}JzA}BjBkHvE{AlAaBnB_ILkF`CgGi@iKvAmFFqDjDsFe@wB_JaJUuFnCeDlIZ`FjD|DjOjAxAjGXpX`FxGw@vGqEpCjAZ`EqDpIYjCdAzHhEpGGzBgBvDPpFq@fH|AlC~HxG~Lf^vCjOr@`T|AdKpAbCnC~@pCoA\\aCm@wGl@yAxA]jBhBHzIpBzDdKfLpNxHhHnA`MRlJgD|Qu@nEp@hNhJlKlLbKhZtCxDfCf@da@BjHkB~Bb@h@xAUrIt@`Gd@fYhAfD|LCxEx@fYQv\\rNxCp{AyDrdAcBddEfBlg@m@rlGjEj_B~AvJnGzMoRnUmO`o@CjFt@~D~KvRRd_@quAx_Bw`@|^qS`Uen@vz@o}@dgAyLfKyqCb|ActFl`CeMbD{|@rCaJbBgG|Dsu@tt@cHlDqdAnFsUxCq`AvMiaB|\\ohD`vBo`@lb@uNfYqIuPOiy@q@cDoBmBgoDW?lvAam@PuO`IuEhQixBFux@m`IkC_PwGqO}b@kf@sG{KaOyc@oSehAcDsHiF_GsDsB{FwAkRq@sFsCqDwEaC}KOg_A{B{PkH}Qid@gr@{C}IsB_PcKivCGeQjD_nApPahAjIyiBlBg|@aAuQ_H_g@sI{^CcoEhCyrEy@yMaM_i@UeD`BcIfSuOnBwGBmYuD_MP_aA{BmF{_@_[mJ_XeGeMwDwEaLeI}HoSwQ{VoXkMiRiNsTcGwYcRoJwHmc@ye@_^mWsF_HeDoIeLkj@gC_EwOgOoU{^}YoxAsHmj@uEkr@sA{HeXii@kZ}]qDyBsGuA_GoGmHuPqFmQgIaHmEuKqIgMoH_\\iUw\\}Yg^oJkSgHaVmP}VeOk\\mGuIeEeJeC_C}Z{L_]uUwCiDmBkGwCoVqUgdA_DaGiMaLiFqKwBmLaJcoAQ_Tz@cKpBqJhT{j@|DqO`CmUMyPsBuQkFeQoFqJgQ{RuLyc@wIyHaAuBiBm_@jBuEzGgIx@yGuB}HeIiFiBwEpAg`@sEkZeAgVZwH|EkSnDek@~K_a@ZsKaA_GoKcVuAcYyJsWaAqIaCuq@iDiQsJyVyB_\\kGqUuHic@sAoY{DqLa@gEdCce@wBsRkFaKuEoQ}A}OOaPt@wP_HoR{CuRE}Gy@eAkMmEaL}MmEeBeCcDcLeAeP_JuACiEpBmAO_DuGeDwBkA}E_F{GiJ{BiWKkPtHgYbDcCjBgVvHcGvEyLzD{FtFsSxHcVbDyTlPaJxWaI|HaEdA_KM}YfEe`@~TyQu@oLaEmEOsF`BwIvIaFdCuF@cRyGwMPwCt@eFtFsGf@oI|DwO_DaQdAuK_JaUiKaMVyLoCsHtAoFm@oKxEyMW_U|LcL{AuH|B{WfCwPwAcGpEqH~AsGhOqCrCkYvE}G]cT{LgTwT{OcGmJgIwXuKgMgIyRmCqJsE}EkF{LwS_ZaSyW_YqNqFkEoKsJ}HuK{MkMgU{EaG_IkXmAoPcCiOwCaKp@{EhEyFnAgEaBaT}@oEcG}JuHgUUqFzBkOB_GgEuIuFgSLqE`FkUI}N",
 "mcc>mar":"oeymFf`zmS{Dkb@aGmMtC_YrAuCzCaApB`@nAbAfEpKrCn@`D[`IcDxPoLjMKhUiK|XeIlRiJhG}KfGg@xA_Af@cC}@{CoBg@{KtAgJfNqCnBgL]gI|EcEz@eJmAfTyOvNmBfFaGxEy@hDqDpGIpD_CzJzArFkBpJcKpAmObA}ChPyJfIKjBw@rMwQtK}TtHwIxIgNpFkFNkF_CqJ|CoShLkRdDgIhB}IbD_DvAyGrH{NfByK~DiCrEqQrAa^u@wKfGiURwKtCiJEuJdKyUhBeT~D}GLqe@wRF?oE",
 "mar>red":"}onmFtnfmS?hMzRCIt[k@tC{CdEiBdTeKxUDtJuChJSvKgGhUt@vKsA`^sEpQ_EhCgBxKsHzNwAxGcD~CiB|IeDfIoKhPwDpUdCvKk@lF{EbEyIfNuHvIuK|TsMvQkBv@gIJiPxJcA|CqAlOkLfLyFfA{H{AqD~BqGHiDpDyEx@gF`GwNlBgTxOoH{A}j@z@gXiQqQiUkKkAgIsFeM_AiO{SgI_AcBoAgEgL{H_HsJsB{KiGaCDiHtCgM[cJ_BgIcEeG]kBkAqBiFmB_BkLSgPsC_C}D}A{NuDmEoj@oAyPiHeZkDgPeM",
 "@asp>mrb":"gnenFjz}jS~An@yOjpAaIkBmD`[x@lS[bHaAxBbHbEnCnE~@bKp@fa@xAt@rTZf\\d]lH|EvFfMdQbF`AlDDxMdB`GzBbCvFjB|FnNfJ|HhDbHtEnFrCjLvFzJ`I~AfGnO~AbBnKpGnDp@vHfHpYfPfVdUl]`QlH|IvOtBhQ~Rf\\hKpKdKha@jFnTvMjJtLxTbIzHnFlWhH~WlMfQf^fAdH|BhEhAhJjD`HzBxLt@pb@tBbD|MtH`DpFnBdIhFdKAzGhAj@fAgC",
 "mrb>mls":"emsmFpyukSuA_HcBoCiAJiA{AyAeEp@G~@jBhC`@",
 "mls>crl":"qrsmFpgukSiCa@_AkBq@F~GzOIdG`An@jAeB",
 "crl>gon":"imsmFvzukSqAeIcBoCiAJ_ByBeCmJaDqF}MuHuBcDu@qb@{ByLkDaHiAiJ}BiEgAeHgQg^_XmMmWiH{HoFyTcIkJuLoTwMia@kFqKeKg\\iKiQ_S}KaBeDcBuHqHy[}OkXwVmWuNwHgHoDq@oKqG_BcBgGoOaI_BwF{JsCkLuEoFiDcHgJ}H}FoNwFkB{BcCeBaGEyMaAmDeQcFwFgMmH}Eg\\e]sT[yAu@q@ga@_AcKoAoCmG}FTkN_AsSbDuV~@g@bGtAfKkz@nTnF",
 "gon>asp":"izdnFjy~jSoToFpC_U_Bo@",
 "@asp>gro":"gnenFjz}jS~An@jDsS`MrBtDk[pA_F`DsFxOuJhBsFt@wMrHcK`GuA|@eAzEsTnDcGxJuBlIiNdK{BlE_H`DgBjMqC`ZuBbDmBfJeKrK_CdJJjF_H|BeAvTVtCu@vCkD`BcFLaO|@iEpQaSxRo\\vV_VtRaBjEsDhAmF?ag@|@yI|KiYdJaLlEaUpCkHvK}LzAw[pC{K`A{IrB_GzE_JbEoBxIuNHuBgAeA{@_GhCkFrAcHyCwEoAoKdAuDCwIzBkPiAyXVaD~AgENg\\bBm@",
 "gro>dpb":"cmwmFdogjScBl@Mn[k@~B",
 "dpb>ash":"arwmFbqhjSmA`GhAxX{BjPBvIeAtDnAnKxCvEsAbHiCjFz@~FfAdAItByItNcEnB{E~IsB~FaAzIqCzK{Av[wK|LqCjHmE`UeJ`L}KhY}@xI?`g@iAlFkErDuR`BwV~UyRn\\qQ`S}@hEM`OaBbFwCjDuCt@wTW}BdAkF~GeJKsK~BgJdKcDlBaZtBkMpCaDfBmE~GeKzBmIhNcIlAsAhAqC`F{ErT}@dAaGtAsHbKu@vMiBrFyOtJaDrFqA~EuDj[oKgCsA|@cTtcBaIkBgDbYr@jU[bH}@fAB`Aj@V|AwAv^cNzEcHtCmBxM~@ha@jLxIlL~IbR`TjOdLf@pMqAn[vKbRY~MtHhOjEdDUxDkBjPKfFwD`I{AvKb@hFaBlINfDeA~L`@lB}@vB{DhSeEtOfAtp@}GlCwBxMgAdE_HvGmCxGuHxH{MjGiAtE{CxAkCh\\sNfN}AnPyTdVyTbE_A~CoCzFaMtJ}MjCgAvBaGfDcDtFe@xFoD`CyGxFo@rEeCtDaGxAcJnHsLbBaAvQ}BbOuL`FqBlMyLzGsC`EJpI`EzQaEvPlA`Ka@|If@lT{M~QgAhBaA",
 "ash>cth":"m`kmFfhzjSiB`AnS[tG~@fZfNvVIzCz@hJhI",
 "cth>rgt":"kchmFpf{jSiJiI{C{@wVHgZgNuG_A{d@lAaVpN}Ig@aK`@wPmA{Q`EqIaEgF@uFdCmMxLaFpBcOtLwQ|BcB`AoHrLyAbJuD`GsEdCyFn@aCxGyFnDuFd@gDbDwB`GkCfAuJ|M{F`M_DnCcE~@eVxT}NjSoBlAiL|@eC`AcXpLyAjCuEzCkGhAyHzMyGtHwGlCsEhHkM|@kEfCef@fFyId@mMgAiSdEwBzDmB|@_Ma@gDdAmIOiF`BwKc@aIzAgFvDkPJyDjBeDTiOkE_NuHcRXo[wKqMpAyJWmU{O_JcRyImLa`@aLaOiAuClB{EbH_YzK}Hv@m]bo@iNva@uIzRuPdT{F`EyLrC_c@[mMxB{_@hX{WhIc`@bU}FtFoHzM{E|EsSvKiO|PgXpM{U|Ds{@hSImAdC_ENmEnGsK@mB{@s@aFpB_E|GiJ^wPvJ_DOuF_DeEc@yUdGwNpB",
 "@den>igh":"mlpqFh|x_SbIEAxi@lEA~FwCfb@J?`R`@lBvOv@x@jBSno@vAx|@kAj|DlA`bPDdcG{@zYv@rDbBzBxRrIfNrRhK|JbiBvqAjXvX|BhGh@rHkCvUe@x_@yKxn@m@`y@kCnJyLtO}Gh[eI~q@E|J|Bh\\IvIaKnqAqQvp@iBrl@iA|McZ|gBi@~Gl@bJfCjHl_@ff@`d@nw@|BxJLfMaKth@cDhLeFbJiZz\\oFzLkDxNwAnNu@hw@sB|HkK|RqBjLHvMzDpZKpFqEl^tAbm@g@~JaEnPeM~TqBzFaNfz@}HdZiP`_@_MfMgHnKeEbDoPdHi[pUoPpGkMxAoCnDeIzVMfEf@tDnJnUDtEiD|Rd@zEtDlNj@rH_ApIgNv\\uAhImAbRt@`GtF`Jx@zDq@nUjHz`ASvGwCbQBlKtUnq@jCzPQxh@mDfS_@xGJ~QnBlXMjNwJ`j@gCj[mGx`@mMjk@}GhQ}NbTsEnPwMvNeClEsAxHPnP}@xHyTzp@}Q`c@qCjLcGtgAv@fv@aE~f@oAjm@iEtk@KnUnBn]dIh]|LnjAvKbn@pDtIpEnGt\\pX`G~Ibh@jeBzNn\\~FvF`[lOv[xZpIlEjq@zQfkAtJzIpDhWb\\t[`g@~H|^hFbd@tR|e@t@|HGvHwNnkBx@rw@`Cj_@eBz\\vFfe@tC|rAi@dLqE|Ri@lL|@`LvMvm@`Fz^j@hNsKzoAe_@rbAkQrx@W|RxAd~AfAlLlBrGz_@rz@v_@de@di@~g@|CxEpCvJp@pJRz_@zA~GnHbRfBfLg@lzAz@taBt@pJhH~VzArKNnImAlYFr`@|@fHlNfa@`Bfq@bB|KhDlGzNzQ|UnN`SzVpC`G|J~^vMdWrGjX|HhRfEnPvBdRb@n^~Dt]xKnV~EtVvTbb@rApItAn\\nB`Kpa@rfAfVr\\lCrFtc@~yAtGzNbIbIpNpFjJb@z]yBnHvAfHfEbE|ErMhWz_@lZbXdc@hm@xh@tJhOxYro@zGzJlGdElUxHhj@rMxH~DxEjE~ExHjF~LzFbVpGxPvFhJ`ItIxGtCjRPdGdAbN|IpKvO~FbFh`@dRxTfBfFlCpLfKxGjC`HVvI{Bxa@qY~Fu@lH|@|JdHhU|^pG`EbIpArFUbb@qIlTfAb^sYdeBol@nEi@|Mx@pt@eLtGKj\\nL~LlS~JnHvWhZf_Arf@jY`[~m@~d@hObPtT`KtF`HlKhUhEfE|UxKjGhAt^eExHlAlEpEvZhg@`R|UpD|BjSdDxJ`MzEzCpC`@nY{@xJoDpDKlEjClFvMlClD~D`CvJlAdVqDhH@fNnDlK|JlFv@v[mLt\\aZ~E{G~Pig@nE{CnEr@fB|Bp@~EoEtZ[xIdGpvB`DzK|Xja@nE|MbLbQzGxGtInF~LfD`Jd@hKo@ll@wLpl@oD|E`BnIxGfE|AzVBzFfArf@f^xD`JtWxyB|DfX~DdQpNf^hr@juAzPrKjHxMvEjE|D|@zo@bDpK`DtZrR|a@za@bEdCzGb@~P{A|c@nMrf@eLp@j@bBfJxMaDhS`}AjKUnEoBxBgDdFkOjBaArNrv@hF~Qr^pn@dMf^hExTxUzaB|CzGhEzCrHf@~wAkVrRwE|JcHx{A}qA|_Amj@dL}AvJd@xInC|`@pRfKxArGkA~LmH~OqFrzCsg@vy@_^fmBikA`FeElLiTpw@mk@za@eJn^_Lrb@kQnBR\\z@GxR}E`Ie@pDfA|PMhPaE`TqNbYeO|SsZjo@qx@`iAgFvQcApRvYlzEhB~OtBxDh`AxcAjAlF@z]`AzHfCfGvGbIh@|NfJnIvLlVzBzAxJvBxHzKjEfCrMyAzK}FdCf@|AhDrAdOlHxNy@`EuJ~NwJE}EkEsAQaB`AgApD~AnOvErI~@vD{Bzz@kDvOa@re@cEb[rAbR{@lCoDhEy@dHiCdE[dCFhIdCpKJtJ_Ebg@_@~Vz@tRu@xFLvI`IhWcFtV_@~\\bLprAzJj^f@fHsBz_@}CbS_@dM{Hpc@uL`WmKh[qPvVw[fv@kCrCiV~OyD`Aa]}BgNzGaa@nHol@jEgIsCkEoEeHoB_GoHcL}D_DoG}@CtAlJjKjJlK`O~FxDdG`H~b@hSvDjE\\dD]`RfCng@`Jz_@vDjYu@FcFoTaSua@mCeIyDqF_IOoBcBGeDlJ}WVyC_@]_@vD_ErGmNhS}FdEgA|BLtEtLdM~AhHInQiDvXkCvHgDhAgd@_LgD|B_F`@yVlL{@~GmK|[t@zAjKWvZ}HrMpB`L~IvIxMvKvd@xLjWrC~_@GnV",
 "igh>ind":"aaumFx_tiSFoVsC_`@yLkWwKwd@wIyMaL_JsMqBwZ|HkKVu@{AlK}[z@_HxVmL~Ea@fD}Bfd@~KfDiAjCwHhDwXLoO}@aH",
 "ind>twn":"ekumFzhliSaEeGkGoF[mFfA}B|FeEpLwPnFmI|@mE[jF{IfVFdDnBbB~HNxDpFlCdInElHhMvYjE~Rj@LmDaZaJ{_@gCog@\\aR]eDwDkE_c@iSeGaH_GyDmKaOkKkJmA{Jt@P~CnGbL|D~FnHdHnBjEnEfIrCnl@kE`a@oHfN{Gx[bChKwDlUcQv[gv@pPwVlKi[nKiTnIkc@p@cP|CcSlB{d@}Ksb@iLcuAd@mZbFuVaIiWMwIt@yF{@uR^_W~Dcg@KuJeCqKGiIZeChCeEx@eHnDiEz@mCsAcRbEc[`@se@jDwOzB{z@_AwDwEsI_BoOfAqD`BaArAP|EjEvJDtJ_Ox@aEmHyNsAeO}AiDeCg@{K|FsMxAkEgCyH{KyJwB{B{AwLmVgJoIi@}NwGcIgCgGaA{HGc_@eAeEoBkCB|D",
 "twn>dil":"kjpmF|fhhSC}Dy|@m_AkCoFsZowEk@cZjCmRrC_Ipx@aiArZko@dO}SpNcY`EaTLiPgA}Pd@qD|EaIDcWsl@tUu`@pLgS`DeHpCeu@|i@mLhTaFdEgmBhkAwy@~]szCrg@_PpF_MlHsGjAgKyA}`@qRyIoCwJe@eL|A}_Alj@y{A|qA}JbHsRvE_xAjVsGWiFkD}C{GyU{aBiEyTeMg^s^qn@iF_RsNsv@kB`AeFjOyBfDoEnBkKTiSa}AwD`A_BwLkq@hP{d@}NmV~BsG_D}a@{a@w]iToHkByq@oDqGeDeIcOwNoIkDgEmp@urAkMe[qI}a@kYuaC{AaHsEkG}a@qZwHgB{VCgE}AkK}HoGgAci@xDml@vLkOh@qJiAmH}BuIoF{GyGcLcQoE}M}Xka@aD{KeGqvBZyInEuZq@_FgB}BoEs@oEzC_Qhg@_FzGu\\`Zw[lLmFw@mK}JgNoDiHAeVpDwJmA_EaCmCmDmFwMmEkCqDJyJnDoYz@qCa@{E{CyJaMkSeDqD}BaR}UwZig@mEqEyHmAu^dEkGiA}UyKiEgEmKiUuFaHuTaKiOcP_n@_e@kYa[g_Asf@wWiZ_KoH_MmSk\\oLuGJqt@dL}My@oEh@ueBxk@sOrLmGXabAbS{G_@}HkDmEyEcRi[sD}CuFyBwFa@eHhAy_@lXcEdBwFj@iFe@gFyByQ}N_FsAgKW{FkAm`@gSwO{SkKiHgKqC{QGyJoF}MyRmEqLqGuWaFwLqDwGmGgH}I_Fq]sH{Y_JaJyFaEsFgj@kcAuGkH{h@id@wUw`@y_@gZmNeXyGkHwEiC{HeBw^tBaIWyKeDuK_JkEyIoB}Qj@eUoCa^tAuW]_DqRab@tDkCjFnArCwP",
 "dil>lov":"o_{pFpsffSoCdPiFsAgEvAaGqK{AeFSyIbBwHnDsEpUiMvSkF|\\ii@rq@u^rj@mz@jCgHxE}W`JgwAJoNoAwJ}Jo^yC_d@iPcy@WsIjAyw@}R_nBuBoEiJkFoEwFqC_JsD{Y}CqJiO}\\wIwHmHuSaWe^iBgMb@wWcB_NkBaF}OaZcJiTmBgB{GyBqBmCqC{JwFcLiEaVqDuEgLwGgB}Cm@oG|@k\\oDqKq@kMuDuNbAgDfF_CZkCy@eCwGcF}GwB{BA_BnA]xFxGlO~@|Gw@fB}@k@JyEoAcDsFkEsFkAeLp@kj@rR}MFkAaAmAuDqAQk@tAj@dBnMfHrK^jNgBnA`@R~AqAvA_OvEyDxGkJNeIvGeLpAsG{C",
 "lov>geo":"ixaqF~nfeScEqAcHsK}G_A}C}EqFUoDsCcE|@iD[eE{F_Eo@{DqDeBDkFvEgEjAcD?wDuAUfAp@hAtIdAbKiBxCp@rC`GdGpHjOlKpCzGvE|FV`Bg@xBaBh@sXoG_FMc^vFuAhFzB`][nQeBxOmAdAkBEcBgCMgU{CuLgs@un@yXy[eLiSoXgn@iBmGaAyK_BecBV{LlPcw@z_@ccAxKeoAFuFmGai@cN_o@o@yJp@mMrEeS\\wJwC}sAsFmc@dB}^cC}_@{@av@vNamB_@wNeA_FqRyd@}Esc@iFyW}CkHaYsb@wVu[kHkDm^iFXwCnAi@vWjErY~MfAaIb@L",
 "@den>den":"mlpqFh|x_SbIEAda@uS`NaMxFmGrBkKd@{DdC{FjJgIhGgLfPaGbFkGnNgBtAsHy@gJqKwT{^iXgToDoHiL_b@kEaHmHoFcKkDk_@cBeDgCeAgDd@_w@_Ds|AKelBbAim@Ekh@vIgaAJs~Cbm@uxObDePzDa_@zG_WRgK{AmKaGqLeE_D{DkAoyAoAeRcDcc@qMsMoBaMk@qzB@{Kk@ePoD{L}FkLgJqJuLuI{PaFiPgD}RuA_Wn@ivE|Ac\\Pwh@{A__@b@qcG{C_JaG_E_Zk@kEv@_EbEsGrQh@dIzBbCyD~AkOxS{Cz@mI?aJeAsDoCmBuDuAwID}X",
};
/* ── конец дорог ── */

/* ── ЕДА НА МАРШРУТЕ ── собрано food-nearby.js по OpenStreetMap ── */
const FOODNEAR={
 1:[{"nm":"Denny's","lat":37.27151,"lng":-107.88385,"kind":"restaurant","cuisine":"american","hours":"Mo-Su 05:00-24:00","near":"art","d":461},{"nm":"Rice Monkeys","lat":37.27498,"lng":-107.88002,"kind":"restaurant","cuisine":"oriental","hours":"Mo-Su 11:00-15:00,17:00-21:00","near":"art","d":561},{"nm":"Oscar's Cafe","lat":37.2748,"lng":-107.88198,"kind":"restaurant","cuisine":"diner","hours":"06:00-14:00","near":"art","d":595},{"nm":"Grassburger","lat":37.27158,"lng":-107.88074,"kind":"fast_food","cuisine":"burger","hours":"Mo-Su 11:00-21:00","near":"art","d":234},{"nm":"Baskin-Robbins","lat":37.27412,"lng":-107.88214,"kind":"ice_cream","cuisine":"ice cream","hours":"Mo-Th 11:00-21:00; Fr-Sa 11:00-22:00; Su 11:00-21:00","near":"art","d":536},{"nm":"Burger King","lat":37.27941,"lng":-107.87905,"kind":"fast_food","cuisine":"burger","hours":"Mo-Th 06:00-22:00; Fr-Sa 06:00-23:00; Su 07:00-22:00","near":"art","d":1046},{"nm":"Cuckoo's","lat":37.2698,"lng":-107.88113,"kind":"restaurant","cuisine":"chicken","hours":"11:30-23:00","near":"art","d":190},{"nm":"636 Main","lat":37.27058,"lng":-107.88148,"kind":"restaurant","cuisine":"fusion","near":"art","d":228}],
 2:[{"nm":"Rice Monkeys","lat":37.27498,"lng":-107.88002,"kind":"restaurant","cuisine":"oriental","hours":"Mo-Su 11:00-15:00,17:00-21:00","near":"trn","d":109},{"nm":"Oscar's Cafe","lat":37.2748,"lng":-107.88198,"kind":"restaurant","cuisine":"diner","hours":"06:00-14:00","near":"trn","d":196},{"nm":"Denny's","lat":37.27151,"lng":-107.88385,"kind":"restaurant","cuisine":"american","hours":"Mo-Su 05:00-24:00","near":"trn","d":439},{"nm":"Baskin-Robbins","lat":37.27412,"lng":-107.88214,"kind":"ice_cream","cuisine":"ice cream","hours":"Mo-Th 11:00-21:00; Fr-Sa 11:00-22:00; Su 11:00-21:00","near":"trn","d":190},{"nm":"Grassburger","lat":37.27158,"lng":-107.88074,"kind":"fast_food","cuisine":"burger","hours":"Mo-Su 11:00-21:00","near":"trn","d":277},{"nm":"Burger King","lat":37.27941,"lng":-107.87905,"kind":"fast_food","cuisine":"burger","hours":"Mo-Th 06:00-22:00; Fr-Sa 06:00-23:00; Su 07:00-22:00","near":"trn","d":607},{"nm":"Himalayan Kitchen","lat":37.27429,"lng":-107.88021,"kind":"restaurant","cuisine":"indian","near":"trn","d":37},{"nm":"N/A","lat":37.27457,"lng":-107.88015,"kind":"restaurant","cuisine":"regional","hours":"11:00-10:00","near":"trn","d":65}],
 3:[{"nm":"Meander Riverside Eatery","lat":37.26988,"lng":-106.99766,"kind":"restaurant","cuisine":"american","hours":"We-Sa 16:00-20:30","near":"pag","d":1075},{"nm":"The Lost Cajun Restaurant","lat":37.26714,"lng":-107.01078,"kind":"restaurant","cuisine":"cajun","hours":"11:00-21:00","near":"pag","d":277},{"nm":"Mee Hmong Cuisine","lat":37.26719,"lng":-107.01946,"kind":"restaurant","cuisine":"vietnamese","hours":"Mo-Sa 11:00-20:00","near":"pag","d":893},{"nm":"Subway","lat":37.26667,"lng":-107.01338,"kind":"fast_food","cuisine":"sandwich","hours":"Mo-Th 09:00-21:00; Fr 09:00-17:30; Sa-Su 09:00-21:00","near":"pag","d":447},{"nm":"Allie House Grille","lat":37.26904,"lng":-107.00567,"kind":"restaurant","cuisine":"american","hours":"Tu-Su 16:00-21:00","near":"pag","d":369},{"nm":"Pagosa Baking Company","lat":37.26904,"lng":-107.00637,"kind":"cafe","hours":"We-Mo 07:00-14:00","near":"pag","d":308},{"nm":"Tequila","lat":37.26614,"lng":-107.01098,"kind":"restaurant","cuisine":"mexican","near":"pag","d":387},{"nm":"The Lift Coffee House","lat":37.26881,"lng":-107.00267,"kind":"cafe","cuisine":"coffee shop","near":"pag","d":636}],
 4:[{"nm":"Thai Chili Ouray","lat":38.02478,"lng":-107.67171,"kind":"restaurant","cuisine":"thai","hours":"Mo-Su 11:00-21:00","near":"ohs","d":470},{"nm":"Colorado Boy Southwest Pub","lat":38.02211,"lng":-107.67124,"kind":"restaurant","cuisine":"mexican","hours":"Mo-Su 04:00-21:00","near":"ohs","d":769},{"nm":"Goldbelt Bar and Grill","lat":38.02517,"lng":-107.67194,"kind":"restaurant","hours":"11:00-21:00","near":"ohs","d":426},{"nm":"Smokin' Nics Bar-B-Que","lat":38.02409,"lng":-107.67266,"kind":"restaurant","cuisine":"barbecue","hours":"12:00-17:00","near":"ohs","d":549},{"nm":"T's Smokehouse & Grill","lat":37.81155,"lng":-107.66486,"kind":"restaurant","cuisine":"barbecue","near":"sil","d":50},{"nm":"High Noon Hamburgers","lat":37.81139,"lng":-107.66366,"kind":"restaurant","cuisine":"american","near":"sil","d":94},{"nm":"Coffee Bear","lat":37.81281,"lng":-107.66372,"kind":"cafe","cuisine":"coffee shop","near":"sil","d":122},{"nm":"The Tavern","lat":38.0243,"lng":-107.67171,"kind":"pub","hours":"Mo-Su 11:00-21:00","near":"ohs","d":523}],
 5:[{"nm":"Brown Dog Pizza","lat":37.93683,"lng":-107.81065,"kind":"restaurant","cuisine":"pizza","hours":"Mo-Su 11:30-21:00","near":"tel","d":163},{"nm":"The Butcher & The Baker","lat":37.93699,"lng":-107.80962,"kind":"cafe","cuisine":"sandwich","hours":"Mo-Sa 07:00-20:00; Su 08:00-14:00","near":"tel","d":242},{"nm":"Thai Chili Ouray","lat":38.02478,"lng":-107.67171,"kind":"restaurant","cuisine":"thai","hours":"Mo-Su 11:00-21:00","near":"per","d":589},{"nm":"Colorado Boy Southwest Pub","lat":38.02211,"lng":-107.67124,"kind":"restaurant","cuisine":"mexican","hours":"Mo-Su 04:00-21:00","near":"box","d":459},{"nm":"Petite Maison","lat":37.93687,"lng":-107.81262,"kind":"restaurant","cuisine":"french","near":"tel","d":76},{"nm":"Cornerhouse Grille","lat":37.93817,"lng":-107.81174,"kind":"restaurant","cuisine":"american","hours":"Mo -Su 11:30-24:00","near":"tel","d":90},{"nm":"Goldbelt Bar and Grill","lat":38.02517,"lng":-107.67194,"kind":"restaurant","hours":"11:00-21:00","near":"per","d":608},{"nm":"Smokin' Nics Bar-B-Que","lat":38.02409,"lng":-107.67266,"kind":"restaurant","cuisine":"barbecue","hours":"12:00-17:00","near":"box","d":622}],
 6:[{"nm":"Kismet Cafe","lat":38.1522,"lng":-107.75807,"kind":"restaurant","cuisine":"mediterranean","hours":"Mo-Sa 08:00-14:00","near":"rid","d":140},{"nm":"Propaganda Pie","lat":39.18514,"lng":-107.23633,"kind":"restaurant","cuisine":"pizza","hours":"Mo-Su 11:00-21:00","near":"red","d":359},{"nm":"Provisions Cafe & Catering","lat":38.1523,"lng":-107.75802,"kind":"restaurant","cuisine":"american","hours":"We-Sa 1700-20-00; We-Su 08:00-13:00","near":"rid","d":127},{"nm":"El Agave Azul","lat":38.15155,"lng":-107.75711,"kind":"restaurant","cuisine":"mexican","hours":"Mo-Sa 10:00-21:00","near":"rid","d":195},{"nm":"Slow Groovin BBQ","lat":39.07166,"lng":-107.18841,"kind":"restaurant","cuisine":"barbecue","hours":"11:00-21:00; Nov-Apr closed","near":"mar","d":303},{"nm":"Colorado Boy","lat":38.1523,"lng":-107.75775,"kind":"restaurant","hours":"Mo-Su 16:00-20:00","near":"rid","d":118},{"nm":"True Grit Cafe","lat":38.15169,"lng":-107.75647,"kind":"cafe","hours":"Mo-Su 11:00-20:00","near":"rid","d":193},{"nm":"The Marble Hub","lat":39.072,"lng":-107.18848,"kind":"cafe","hours":"08:00-15:00","near":"mar","d":266}],
 7:[{"nm":"Over Easy","lat":39.19025,"lng":-106.82032,"kind":"cafe","cuisine":"american","hours":"Mo-Th 07:30-14:00; Fr-Su 07:30-15:00","near":"asp","d":261},{"nm":"Little Ollie's","lat":39.18822,"lng":-106.81718,"kind":"restaurant","cuisine":"chinese","hours":"Mo-Su 11:00-21:30","near":"asp","d":321},{"nm":"Su Casa","lat":39.18904,"lng":-106.82024,"kind":"restaurant","cuisine":"mexican","hours":"Mo-Su 11:30-22:00","near":"gon","d":282},{"nm":"New York Pizza","lat":39.18884,"lng":-106.81939,"kind":"fast_food","cuisine":"pizza","hours":"11:30-02:30","near":"asp","d":299},{"nm":"Mi Chola","lat":39.19039,"lng":-106.81915,"kind":"restaurant","cuisine":"mexican","near":"asp","d":163},{"nm":"Matsuhisa","lat":39.19063,"lng":-106.82028,"kind":"restaurant","cuisine":"japanese","near":"asp","d":246},{"nm":"White House Tavern","lat":39.19037,"lng":-106.82043,"kind":"restaurant","cuisine":"american","near":"asp","d":265},{"nm":"French Alpine Bistro Crêperie du Village","lat":39.19026,"lng":-106.82044,"kind":"restaurant","cuisine":"french","near":"asp","d":270}],
 8:[{"nm":"Woody Creek Tavern","lat":39.27495,"lng":-106.88733,"kind":"restaurant","cuisine":"mexican","near":"rgt","d":1}],
 9:[{"nm":"Cooper's on the Creek","lat":39.71549,"lng":-105.69466,"kind":"restaurant","cuisine":"american","hours":"Th,Su-Tu 11:30-20:00; Fr,Sa 11:30-21:00; We off","near":"geo","d":1066},{"nm":"The Dillon Dam Brewery","lat":39.62758,"lng":-106.06032,"kind":"restaurant","cuisine":"burger","hours":"Mo-Th 11:30-23:30; Fr-Sa 11:00-24:00; Su 11:00-23:30","near":"dil","d":1440},{"nm":"Phở Bay","lat":39.62771,"lng":-106.06356,"kind":"restaurant","cuisine":"vietnamese","hours":"Mo-Sa 10:00-21:00","near":"dil","d":1714},{"nm":"ROUNDABOUT Burgers and Dogs","lat":39.71468,"lng":-105.69493,"kind":"restaurant","cuisine":"hot dog","hours":"Mo-Fr 11:00-20:00; Sa-Su 09:00-20:00","near":"geo","d":974},{"nm":"Windy City Pizza & Pub","lat":39.62855,"lng":-106.07083,"kind":"restaurant","cuisine":"pizza","hours":"Su-Sa 11:00-21:00","near":"dil","d":2332},{"nm":"Smashburger","lat":39.62981,"lng":-106.0596,"kind":"fast_food","cuisine":"burger","hours":"Mo-Su 10:30-21:30","near":"dil","d":1374},{"nm":"Einstein Bros. Bagels","lat":39.62893,"lng":-106.0597,"kind":"fast_food","cuisine":"bagel","hours":"Mo-Fr 05:30-14:00; Sa-Su 06:30-14:00","near":"dil","d":1379},{"nm":"Euro Grill","lat":39.71047,"lng":-105.69584,"kind":"restaurant","cuisine":"international","near":"geo","d":500}],
 10:[{"nm":"Snooze","lat":39.85844,"lng":-104.67396,"kind":"restaurant","cuisine":"breakfast","hours":"06:00-22:00","near":"den","d":261},{"nm":"City Wok","lat":39.85859,"lng":-104.67415,"kind":"restaurant","cuisine":"chinese","hours":"06:00-22:00","near":"den","d":279},{"nm":"Caribou Coffee","lat":39.85884,"lng":-104.6736,"kind":"cafe","cuisine":"coffee shop","hours":"05:00-21:00","near":"den","d":304},{"nm":"Garbanzo","lat":39.85881,"lng":-104.67318,"kind":"fast_food","cuisine":"mediterranean","hours":"06:00-22:00","near":"den","d":305},{"nm":"Voodoo Doughnut","lat":39.85883,"lng":-104.67317,"kind":"fast_food","cuisine":"donut","hours":"05:30-21:30","near":"den","d":307},{"nm":"Kabod Coffee","lat":39.84932,"lng":-104.674,"kind":"cafe","cuisine":"coffee shop","hours":"06:00-24:00","near":"den","d":755},{"nm":"Caribou Coffee","lat":39.8492,"lng":-104.674,"kind":"cafe","cuisine":"coffee shop","hours":"04:30-20:30","near":"den","d":768},{"nm":"Tocabe","lat":39.85368,"lng":-104.67458,"kind":"fast_food","cuisine":"local","hours":"Mo-Su 06:00-22:00","near":"den","d":279}],
};
/* ── конец еды на маршруте ── */
