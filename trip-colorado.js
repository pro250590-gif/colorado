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
 {id:'art',d:1,base:'dur',cat:'town',lat:37.2700,lng:-107.8790,nm:'Animas River Trail + Main Avenue',q:'Animas River Trail Durango',
  why:'Первый вечер: набережная вдоль реки через весь город и исторический центр Дуранго.'},
 {id:'lnh',d:1,base:'dur',cat:'nature',lat:37.2350,lng:-107.9200,nm:'Lake Nighthorse',q:'Lake Nighthorse',tag:['если есть силы','t-easy'],
  why:'Если бодрая — закат на спокойном озере в 15 мин от города. Сап, купание.'},
 {id:'trn',d:2,base:'dur',cat:'transport',lat:37.2740,lng:-107.8800,nm:'Durango & Silverton Narrow Gauge Railroad',q:'Durango & Silverton Narrow Gauge Railroad',tag:['ради этого едут','t-must'],star:1,when:'fixed',
  why:'Паровоз 1880-х, узкая колея, 72 км вдоль каньона Анимас по полке в скале на высоте 120 м. <b>Формат:</b> поезд туда + автобус обратно освобождает полдня. <b>Класс:</b> бери открытый вагон Rio Grande (~$144) для фото, садись слева по ходу.'},
 {id:'mvp',d:3,base:'dur',cat:'town',lat:37.3086,lng:-108.4187,nm:'Mesa Verde National Park',q:'Mesa Verde National Park',tag:['ЮНЕСКО','t-must'],star:1,
  why:'600 жилищ анасази в нишах отвесных скал, 700–800 лет. Вход $30/машина, только карта. От въезда 40 мин вверх — закладывай целый день.'},
 {id:'clp',d:3,base:'dur',cat:'town',lat:37.166876,lng:-108.473726,nm:'Cliff Palace',q:'Cliff Palace Mesa Verde',tag:['нужен билет','t-must'],star:1,
  why:'Крупнейшее скальное поселение Северной Америки, 150 комнат. Внутрь только с рейнджером: 45 минут, четыре лестницы, спуск на 30 м. Билет $8 с человека на recreation.gov, мест 50.'},
 {id:'bch',d:3,base:'dur',cat:'town',lat:37.161563,lng:-108.464670,nm:'Balcony House',q:'Balcony House Mesa Verde',tag:['нужен билет','t-must'],star:1,
  hop:'10 минут по Cliff Palace Loop',
  why:'Самая азартная экскурсия парка: час, лестница 10 м, лаз в скале 45 см шириной, обратно подъём по стене. Боишься высоты или тесноты — не бери. Мест 35, билет $8.'},
 {id:'mtl',d:3,base:'dur',cat:'town',lat:37.1830,lng:-108.4640,nm:'Mesa Top Loop Road',q:'Mesa Top Loop Road',tag:['без билетов','t-easy'],
  why:'Если билетов нет — кольцевая дорога с площадками, откуда жилища видно с другого края каньона.'},
 {id:'vlc',d:3,base:'dur',cat:'nature',lat:37.3800,lng:-107.5600,nm:'Vallecito Lake',q:'Vallecito Lake',tag:['спокойный вариант','t-easy'],
  why:'Если скальные города не хочется — большое тихое горное озеро в 40 мин. Сап, пикник.'},
 {id:'chr',d:3,base:'dur',cat:'town',lat:37.1900,lng:-107.3000,nm:'Chimney Rock National Monument',q:'Chimney Rock National Monument',tag:['вариант дня','t-easy'],
  why:'Храм анасази на высокой меса с ориентацией на луну — тише и атмосфернее Меса-Верде.'},
 {id:'pag',d:3,base:'dur',cat:'springs',lat:37.2695,lng:-107.0098,nm:'The Springs Resort, Pagosa Springs',q:'The Springs Resort Pagosa Springs',tag:['вариант дня','t-easy'],
  why:'40+ горячих ванн террасами к реке, глубочайший геотермальный источник в мире. 1 ч на восток.'},
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
 {id:'bcg',d:6,base:'asp',cat:'nature',lat:38.5750,lng:-107.7010,nm:'Black Canyon of the Gunnison NP',q:'Black Canyon of the Gunnison National Park',tag:['нацпарк №1','t-must'],star:1,
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
 {id:'mls',d:7,base:'asp',cat:'nature',lat:39.0985,lng:-106.9370,nm:'Maroon Lake Scenic Trail',q:'Maroon Lake Scenic Trail',tag:['3 км · легко','t-easy'],
  why:'Петля вокруг озера и по осиновой роще. Подходит всем.'},
 {id:'crl',d:7,base:'asp',cat:'nature',lat:39.0742,lng:-106.9530,nm:'Crater Lake',q:'Crater Lake Trail Aspen',tag:['6 км · средне','t-hike'],
  why:'Продолжение тропы вверх, к озеру под стенами Bells. Набор ~210 м.'},
 {id:'gon',d:7,base:'asp',cat:'town',lat:39.1878,lng:-106.8231,nm:'Silver Queen Gondola / Aspen Mountain',q:'Silver Queen Gondola Aspen',tag:['после обеда','t-easy'],
  why:'Гондола из центра Аспена на вершину 3 417 м, до 7 сентября, от $40. Панорама 360° без усилий.'},
 {id:'asp',d:7,base:'asp',cat:'town',lat:39.1911,lng:-106.8175,nm:'John Denver Sanctuary, Aspen',q:'John Denver Sanctuary Aspen',
  why:'Вечером: кирпичные улицы 1880-х, галереи, тихий парк-мемориал у реки.'},
 {id:'gro',d:8,base:'asp',cat:'nature',lat:39.1650,lng:-106.6250,nm:'Grottos Trail',q:'Grottos Trail Aspen',tag:['1,2 км · легко','t-easy'],star:1,
  why:'14 км восточнее Аспена: река проточила в граните гроты и ледяные пещеры, гуляешь как по луне. Парковка крошечная — до 10:00.'},
 {id:'dpb',d:8,base:'asp',cat:'nature',lat:39.1600,lng:-106.6480,nm:"Devil's Punchbowl",q:"Devil's Punchbowl Aspen Colorado",
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
  why:'Сдаёшь машину и улетаешь домой из DEN. Выезжай к аэропорту заранее — заложи время на сдачу машины и досмотр.'},
];

const FOODCITIES=[
 {city:'Дуранго',base:'dur',lat:37.2753,lng:-107.8801,q:'Durango CO',spots:[
  {nm:'Carver Brewing Co.',meal:'завтрак/бранч',price:'$$',veg:'вег ok',why:'30+ лет — одна из старейших пивоварен Колорадо. Знаменитый бранч и своё пиво.'},
  {nm:'James Ranch Grill',meal:'обед',price:'$$',veg:'кое-что',why:'«Стол на ферме» в 20 км по шоссе 550: бургер из говядины со своего ранчо. Сезонно, пн закрыто.'},
  {nm:'Diamond Belle Saloon',meal:'обед/бар',price:'$$',veg:'кое-что',why:'Рэгтайм-салун 1880-х в отеле Strater, официантки в костюмах — ради атмосферы и коктейля.'},
  {nm:'Steamworks Brewing Company',meal:'ужин/бар',price:'$$',veg:'вег ok',why:'С 1996; золото GABF за Steam Engine Lager, фирменный Cajun Boil.'},
  {nm:'Ska Brewing World HQ',meal:'бар',price:'$$',veg:'кое-что',why:'Первая крафтовая пивоварня Дуранго (1995), IPA Modus Hoperandi.'},
  {nm:'El Moro Spirits & Tavern',meal:'ужин/коктейли',price:'$$–$$$',veg:'кое-что',why:'Стимпанк-салун: серьёзные коктейли и модерн-вестерн кухня.'}
 ]},
 {city:'Силвертон',base:'our',lat:37.8119,lng:-107.6645,q:'Silverton CO',spots:[
  {nm:'Golden Block Brewery',meal:'ужин/бар',price:'$$',veg:'вег ok',why:'Городская пивоварня, пицца из дровяной печи и своё пиво. Самый надёжный вариант круглый год.'},
  {nm:'Handlebars Food & Saloon',meal:'обед/ужин',price:'$$',veg:'кое-что',why:'Культовый салун Дикого Запада, ребра/BBQ и яблочный коблер. Сезон май–окт.'},
  {nm:'The Eureka Station',meal:'ужин',price:'$$',veg:'кое-что',why:'Корнуэльские пирожки — традиционная еда шахтёров, на Blair St. Сезон ~июнь–окт.'},
  {nm:'Kendall Mountain Cafe',meal:'завтрак/обед',price:'$',veg:'вег ok',why:'Самый высокий рейтинг в городке, черничные панкейки.'},
  {nm:'Coffee Bear',meal:'кофе',price:'$',veg:'вег ok',why:'Местный кофе и выпечка перед поездом или горами.'}
 ]},
 {city:'Урей',base:'our',lat:38.0228,lng:-107.6712,q:'Ouray CO',spots:[
  {nm:'Ouray Brewery',meal:'обед/бар',price:'$$',veg:'вег ok',why:'~16 сортов своего пива, крыша-терраса с видом на 360°. Флайт и бургер.'},
  {nm:"Maggie's Kitchen",meal:'обед',price:'$–$$',veg:'кое-что',why:'Любимая бургерная, стены в граффити; бургеры из лося/бизона. Вт закрыто.'},
  {nm:'Mouse\'s Chocolates & Coffee',meal:'десерт/кофе',price:'$$',veg:'вег ok',why:'Институция с 2001: «Scrap Cookie» и своя обжарка кофе.'},
  {nm:'Taste of Ouray',meal:'ужин',price:'$$$',veg:'кое-что',why:'Farm-to-table, ужин для особого случая (бронь, сезонно).'},
  {nm:'Brickhouse 737',meal:'ужин',price:'$$–$$$',veg:'кое-что',why:'Современная американская, топ-рейтинг — ужин поприятнее.'},
  {nm:'Mr. Grumpy Pants Brewing Co.',meal:'бар',price:'$',veg:'—',why:'Колоритная дайв-пивоварня с террасой и видами — местный характер.'}
 ]},
 {city:'Теллурайд',base:'our',lat:37.9375,lng:-107.8123,q:'Telluride CO',spots:[
  {nm:'Brown Dog Pizza',meal:'обед/ужин',price:'$$',veg:'вег ok',why:'Владелец — чемпион мира по пицце; детройтская «313» или зелёное чили «The Telluride».'},
  {nm:'La Cocina de Luz',meal:'обед/ужин',price:'$$',veg:'веган/GF',why:'Органик-мексиканская с 1998, лепёшки вручную, лучшая маргарита по цене.'},
  {nm:'Baked in Telluride',meal:'завтрак/кофе',price:'$',veg:'вег ok',why:'Классическая пекарня-кафе: выпечка, завтрак-сэндвичи, «chronut».'},
  {nm:'Telluride Brewing Co. Tap Room',meal:'бар',price:'$$',veg:'кое-что',why:'Культовая местная пивоварня, золото за Face Down Brown.'},
  {nm:'New Sheridan Chop House',meal:'ужин',price:'$$$',veg:'кое-что',why:'Салун 1895 → стейк-хаус: выдержанное мясо и дичь.'},
  {nm:'221 South Oak',meal:'ужин',price:'$$$',veg:'веган-сет',why:'Файн-дайнинг в викторианском доме, шеф — финалист Top Chef.'}
 ]},
 {city:'Аспен',base:'asp',lat:39.1911,lng:-106.8175,q:'Aspen CO',spots:[
  {nm:'The White House Tavern',meal:'обед/ужин',price:'$$–$$$',veg:'кое-что',why:'«Самый знаменитый сэндвич Аспена» — хрустящая курица, в крошечном доме.'},
  {nm:'J-Bar at Hotel Jerome',meal:'бар',price:'$$',veg:'кое-что',why:'Исторический салун 1889, центр жизни города; бургер и бурбон-шейк «Aspen Crud».'},
  {nm:'Woody Creek Tavern',meal:'обед/бар',price:'$$',veg:'кое-что',why:'Культовый дайв в 13 км, притон Хантера Томпсона; маргариты, бургер, энчилады.'},
  {nm:'Cache Cache',meal:'ужин',price:'$$$',veg:'кое-что',why:'Франко-американская институция с 1987, «самая желанная бронь». Сезонно.'},
  {nm:'Grateful Deli',meal:'обед',price:'$',veg:'кое-что',why:'Лучшая сэндвичная (награды с 2010), субы на заказ — дёшево и вкусно.'},
  {nm:'Paradise Bakery & Cafe',meal:'завтрак/десерт',price:'$',veg:'вег ok',why:'Классика Аспена с 1976: тёплое печенье, джелато.'}
 ]},
 {city:'Басальт',base:'asp',lat:39.3690,lng:-107.0330,q:'Basalt CO',spots:[
  {nm:'Tempranillo',meal:'ужин',price:'$$',veg:'кое-что',why:'Испанские тапас/паэлья, 300+ испанских вин — без аспенских цен. Arroz negro.'},
  {nm:'Café Bernard',meal:'завтрак/обед',price:'$$–$$$',veg:'кое-что',why:'Крошечный французский бистро с 1990, ~8 столов; круассаны, эскарго, ягнёнок. Пн закрыто.'},
  {nm:'The Tipsy Trout',meal:'обед/ужин',price:'$$',veg:'кое-что',why:'Единственное место у реки (терраса над Fryingpan); копчёная форель, трут-бургер.'},
  {nm:'Westbound & Down Basalt',meal:'бар',price:'$$',veg:'кое-что',why:'Городская пивоварня (бывш. Capitol Creek), флайт и паб-еда.'},
  {nm:'The Brick Pony Pub',meal:'обед/ужин',price:'$–$$',veg:'кое-что',why:'Простой местный паб: ковбойский бургер, пицца из дровяной печи.'}
 ]},
 {city:'Пагоса-Спрингс',base:'dur',lat:37.2695,lng:-107.0098,q:'Pagosa Springs CO',spots:[
  {nm:'Meander Riverside Eatery',meal:'ужин',price:'$$$',veg:'вег ok',why:'Жемчужина: farm-to-table, в списке NYT «50 лучших ресторанов США 2024». Только ужин, бронь.'},
  {nm:'Riff Raff Brewing Company',meal:'бар/ужин',price:'$$',veg:'кое-что',why:'Культовая пивоварня — первая в Колорадо на геотермале, в доме 1896; бургер «Cabrito».'},
  {nm:'Kip\'s Grill & Cantina',meal:'обед/ужин',price:'$–$$',veg:'кое-что',why:'Тако-институция региона: рыбные и креветочные тако Baja.'},
  {nm:'Two Chicks and a Hippie',meal:'завтрак/кофе',price:'$',veg:'вег ok',why:'Колоритная местная пекарня-кафе: булочки с корицей, sticky buns.'},
  {nm:'Rosie\'s Pizzeria',meal:'обед/ужин',price:'$$',veg:'вег ok',why:'Любимая местными пицца NY-style, всё с нуля.'}
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
   {k:'a2',nm:'Багаж',sub:'2 стороны',per:'person',v:100,ok:1},
 ]},
 {g:'Машина',ic:'car',c:'#a1663a',c2:'#6f4227',items:[
   {k:'c1',nm:'Аренда машины',per:'day',rate:90,sub:'SUV · цена за день'},
   {k:'c2',nm:'Возврат в другом городе',sub:'Дуранго → Денвер · на всех',v:130,est:1},
   {k:'c3',nm:'Бензин',sub:'~1 150 км · на всех',v:120,est:1},
 ]},
 {g:'Входы и активности',ic:'ticket',c:'#d96a12',c2:'#b0530c',items:[
   {k:'t1',nm:'Поезд Durango & Silverton',sub:'открытый вагон',per:'person',v:156,est:1},
   {k:'t2',nm:'Mesa Verde',sub:'$30 / машина · на всех',v:30,ok:1},
   {k:'t3',nm:'Black Canyon',sub:'$30 / машина · на всех',v:30,ok:1},
   {k:'t4',nm:'Maroon Bells',sub:'шаттл',per:'person',v:16,ok:1},
   {k:'t5',nm:'Ouray Hot Springs',sub:'бассейн',per:'person',v:26,ok:1},
   {k:'t6',nm:'Box Canyon Falls',sub:'вход',per:'person',v:8,ok:1},
   {k:'t7',nm:'Гондола в Аспене',sub:'подъём',per:'person',v:40,ok:1},
   {k:'t8',nm:'Джип-тур Yankee Boy',sub:'опция',per:'person',v:125,est:1},
 ]},
 {g:'Еда',ic:'food',c:'#12855e',c2:'#0a6047',items:[
   {k:'f1',nm:'Еда и кафе',per:'personday',rate:45,sub:'на человека в день'},
 ]},
];

/* ── ДОРОГИ ПО-НАСТОЯЩЕМУ ── считано road-times.js, руками не править ── */
const ROADS={
 1:{ids:["@dur","dro","art","lnh"],km:[[null,27,0.8,10.3],[26.9,null,26.5,31],[1.4,26.6,null,10],[10.3,31,9.9,null]],min:[[null,36,2,20],[36,null,36,49],[2,35,null,19],[20,49,20,null]]},
 2:{ids:["@dur","trn"],km:[[null,0.2],[0.2,null]],min:[[null,1],[1,null]]},
 3:{ids:["@dur","mvp","clp","bch","mtl","vlc","chr","pag"],km:[[null,66.1,92.7,95.4,91.3,37.2,80.2,96.8],[66,null,31.9,34.6,30.5,103,144,160.5],[96.1,35.4,null,2.7,4.9,133.1,174.1,190.7],[93.5,32.8,1.9,null,2.2,130.4,171.4,188],[91.2,30.5,1.4,4.1,null,128.2,169.2,185.7],[37.2,103.1,129.7,132.4,128.3,null,72.6,89.1],[80.2,144.1,170.7,173.4,169.3,72.5,null,36.8],[96.7,160.7,187.3,190,185.9,89.1,36.8,null]],min:[[null,68,96,101,93,46,91,82],[68,null,49,54,46,113,155,146],[102,55,null,5,9,146,189,180],[97,50,4,null,4,141,184,175],[92,46,3,8,null,137,180,171],[46,113,141,146,138,null,92,83],[91,156,183,188,181,92,null,57],[82,147,174,179,171,83,56,null]]},
 4:{ids:["@our","hav","cbp","mol","sil","rmp","mdh","bcf","ohs"],km:[[null,93.3,73.5,47.5,37.7,21.1,19.2,4.6,0.7],[92.6,null,32.3,47.8,57.4,72.2,83,96,93.3],[72.8,32.3,null,28,37.6,52.4,63.1,76.2,73.5],[46.8,47.8,28,null,11.6,26.3,37.1,50.1,47.5],[37,57.4,37.6,11.6,null,16.6,27.4,40.4,37.7],[20.4,72.2,52.4,26.3,16.6,null,10.8,23.8,21.1],[18.5,83,63.1,37.1,27.4,10.8,null,null,19.2],[4.6,96,76.2,50.1,40.4,23.8,null,null,5.3],[0.7,94,74.2,48.1,38.4,21.8,19.9,5.3,null]],min:[[null,94,130,62,53,34,49,13,1],[94,null,77,39,43,60,98,104,95],[130,77,null,74,79,96,134,140,131],[62,38,74,null,11,28,66,71,63],[53,43,79,11,null,19,57,63,54],[34,60,96,28,19,null,38,44,35],[49,98,134,66,57,38,null,null,50],[13,104,140,71,63,44,null,null,15],[1,96,131,63,54,35,50,15,null]]},
 5:{ids:["@our","box","per","ykb","tel","bvf","dld"],km:[[null,0.7,3.1,null,null,null,33.3],[0.7,null,2.4,null,null,null,33.9],[2.4,2.4,null,null,null,null,35.6],[null,null,null,null,null,null,null],[null,null,null,null,null,2.4,null],[null,null,null,null,2.4,null,null],[33.3,33.9,36.3,null,null,null,null]],min:[[null,1,7,null,null,null,49],[1,null,5,null,null,null,50],[7,5,null,null,null,null,55],[null,null,null,null,null,null,null],[null,null,null,null,null,8,null],[null,null,null,null,8,null,null],[49,50,55,null,null,null,null]]},
 6:{ids:["@asp","rid","bcg","pnt","mcc","mar","red"],km:[[null,262.2,196.3,249.7,87.2,91.3,72.7],[262.1,null,null,73.4,175.1,191.1,189.5],[196.2,null,null,null,109.1,125.2,123.6],[249.6,73.3,null,null,162.5,178.6,177],[87.1,175.1,109.1,162.6,null,16,14.4],[91.2,191.1,125.2,178.6,16,null,18.6],[72.6,189.5,123.6,177,14.4,18.6,null]],min:[[null,246,207,256,84,94,69],[246,null,null,85,162,184,176],[207,null,null,null,123,145,138],[256,85,null,null,172,194,187],[84,162,123,172,null,22,15],[96,186,147,196,24,null,27],[69,177,138,187,15,25,null]]},
 7:{ids:["@asp","mrb","mls","crl","gon","asp"],km:[[null,17.4,17.1,null,0.8,0],[17.2,null,0.6,null,17.2,17.2],[17,0.7,null,null,17,17],[null,null,null,null,null,null],[0.8,17.4,17.1,null,null,0.8],[0,17.4,17.1,null,0.8,null]],min:[[null,27,27,null,2,1],[27,null,2,null,27,27],[27,2,null,null,26,27],[null,null,null,null,null,null],[2,27,27,null,null,2],[1,27,27,null,2,null]]},
 8:{ids:["@asp","gro","dpb","ash","cth","rgt"],km:[[null,null,null,20,21.7,13.5],[null,null,null,null,null,null],[null,null,null,null,null,null],[19.9,null,null,null,1.9,28.9],[21.6,null,null,1.9,null,30.6],[13.6,null,null,29,30.7,null]],min:[[null,null,null,31,33,17],[null,null,null,null,null,null],[null,null,null,null,null,null],[31,null,null,null,3,39],[33,null,null,3,null,42],[17,null,null,40,42,null]]},
 9:{ids:["@den","igh","ind","twn","dil","lov","geo"],km:[[null,230.3,223.9,196,109.9,96.8,72.4],[230.1,null,6.4,34.5,125.5,146.8,160.5],[223.7,6.4,null,28.1,119.1,140.5,154.1],[195.8,34.5,28.1,null,91.2,112.5,126.2],[109.2,125.5,119.2,91.2,null,24.6,39.5],[96.5,148,141.6,113.7,24.7,null,26.9],[72.2,160.6,154.2,126.3,40.2,27.1,null]],min:[[null,206,192,158,89,77,60],[207,null,14,49,126,142,152],[193,14,null,35,112,129,138],[158,49,35,null,77,94,104],[88,125,112,77,null,23,33],[77,143,129,95,24,null,23],[60,152,138,104,35,23,null]]},
 10:{ids:["@den","den"],km:[[null,43.1],[42.6,null]],min:[[null,39],[38,null]]},
};
/* ── конец дорог ── */
