/* ==========================================================================
   ДАННЫЕ ПОЕЗДКИ — Париж, 4 дня (город без машины)

   ФОРМА ПОЕЗДКИ: один город · прилёт и вылет из одного аэропорта ·
   машины нет вовсе (метро и пешком) · один выезд на день поездом (Версаль).
   Именно ради этой формы маршрут и сделан: в ней нет ни проката, ни переездов
   между городами — движок обязан собрать её так же честно, как круг по Колорадо.

   Названия мест — по-французски, как они называются на месте: то, что человек
   показывает в кассе и вбивает в поиск. По-русски — только объяснения.
   ========================================================================== */

const BCOL={par:'#5a4bb5'};
const BCOL2={par:'#3b3080'};

const BASES=[
 {id:'par',name:'Париж',emoji:'city',nights:3,color:BCOL.par,lat:48.8566,lng:2.3522,q:'Paris, France',
  desc:'Четыре дня в одном городе: острова на Сене, музеи, Монмартр и один день за городом — в Версале.',
  alt:'Жильё лучше брать в 4–6 округах или у Люксембургского сада: всё в пешей доступности, а метро рядом.'}
];

/* в городе не ездят на машине — это решение маршрута, а не человека */
const CITYMOVE={par:'metro_walk'};

const DAY_BASE={1:'par',2:'par',3:'par',4:'par'};

const DAYS=[
 {n:1,title:'Прилёт и первый вечер на Сене',pill:'прилёт',leg:'CDG → центр: RER B, 35–50 мин',
  note:'<b>Первый вечер без планов.</b> Из аэропорта в город идёт поезд RER B — быстрее и дешевле такси. Дальше пешком по набережным.'},
 {n:2,title:'Лувр, острова и Марэ',pill:'пешком',leg:'весь день пешком, метро между кварталами',
  note:'<b>Билеты в Лувр — заранее,</b> вход по времени. Вторник музей закрыт.'},
 {n:3,title:'Версаль на день',pill:'выезд',leg:'RER C до Versailles Château Rive Gauche, ~45 мин в одну сторону',
  note:'<b>Выезжай рано.</b> К полудню очередь во дворец длиннее часа. Сад бесплатный, дворец — по билету.'},
 {n:4,title:'Монмартр и вылет',pill:'финал',leg:'до CDG: RER B, 50 мин · заложи 3 часа до рейса',
  note:'<b>Вещи оставь в камере хранения на вокзале</b> — тогда последнее утро не пропадёт.'}
];

const P=[
 {id:'cdg',d:1,base:'par',cat:'transport',lat:49.0097,lng:2.5479,nm:'Aéroport Paris–Charles de Gaulle (CDG)',q:'Paris Charles de Gaulle Airport',tag:['прилёт','t-easy'],
  why:'Сюда прилетаешь. В город — поезд RER B с терминала: 35–50 минут до центра, ходит с 5 утра до полуночи.'},
 {id:'sei',d:1,base:'par',cat:'town',lat:48.8530,lng:2.3499,nm:'Île de la Cité · Notre-Dame',q:'Notre-Dame de Paris',tag:['первый вечер','t-easy'],star:1,
  why:'Остров, с которого начался город. Собор снова открыт после пожара; вечером у набережной тише всего.'},
 {id:'lat',d:1,base:'par',cat:'town',lat:48.8506,lng:2.3444,nm:'Quartier Latin',q:'Latin Quarter, Paris',tag:['вечер','t-easy'],
  why:'Узкие улицы напротив острова: студенческие кафе, книжные, недорогая еда. Хорошее место для первого ужина.'},
 /* ДЕНЬ ИДЁТ С ВОСТОКА НА ЗАПАД, а не туда-обратно. По-старому: Лувр, потом
    назад на остров в Сент-Шапель, потом ещё дальше на восток в Марэ — и снова
    через весь центр к Орсэ. Полтора километра и девятнадцать минут пешком на
    возвраты. Теперь остров → Марэ → Лувр → Орсэ, одной линией вдоль реки */
 {id:'sai',d:2,base:'par',cat:'town',lat:48.8554,lng:2.3450,nm:'Sainte-Chapelle',q:'Sainte-Chapelle, Paris',tag:['витражи','t-must'],star:1,
  why:'Пятнадцать метров витражей XIII века в маленькой часовне. Иди в солнечный час — стены светятся насквозь.'},
 {id:'mar',d:2,base:'par',cat:'town',lat:48.8554,lng:2.3653,nm:'Le Marais · Place des Vosges',q:'Place des Vosges, Paris',tag:['квартал','t-easy'],
  why:'Старейшая площадь города и квартал вокруг: галереи, мастерские, лучшая уличная еда в Париже.'},
 {id:'lou',d:2,base:'par',cat:'town',lat:48.8606,lng:2.3376,nm:'Musée du Louvre',q:'Louvre Museum, Paris',tag:['нужен билет','t-must'],star:1,
  why:'Самый большой музей мира. За один заход всё не обойти — выбери два крыла и не пытайся успеть остальное. Билет по времени, вторник закрыт.'},
 {id:'ors',d:2,base:'par',cat:'town',lat:48.8600,lng:2.3266,nm:"Musée d'Orsay",q:'Musee d Orsay, Paris',tag:['если останутся силы','t-easy'],
  why:'Импрессионисты в здании вокзала. Меньше Лувра, и обойти можно за два часа — хороший вариант на вечер.'},
 {id:'ver',d:3,base:'par',cat:'town',lat:48.8049,lng:2.1204,nm:'Château de Versailles',q:'Chateau de Versailles',tag:['на весь день','t-must'],star:1,
  why:'Дворец и парк, ради которых стоит потратить день. Билет заранее, вход по времени; по понедельникам дворец закрыт.'},
 {id:'tri',d:3,base:'par',cat:'nature',lat:48.8149,lng:2.1096,nm:'Grand Trianon et Hameau de la Reine',q:'Hameau de la Reine, Versailles',tag:['в парке','t-easy'],
  why:'Дальняя часть парка: деревня королевы и малые дворцы. Туда ходит паровозик, а можно взять велосипед.'},
 {id:'eif',d:3,base:'par',cat:'town',lat:48.8584,lng:2.2945,nm:'Tour Eiffel',q:'Eiffel Tower, Paris',tag:['вечер','t-must'],star:1,
  why:'Вернувшись из Версаля — на закат к башне. Каждый час после темноты она пять минут мерцает.'},
 {id:'mon',d:4,base:'par',cat:'town',lat:48.8867,lng:2.3431,nm:'Basilique du Sacré-Cœur · Montmartre',q:'Sacre-Coeur, Paris',tag:['утро','t-must'],star:1,
  why:'Последнее утро: холм с видом на весь город, улицы художников, лестницы. Приходи к открытию — днём тут тесно.'},
 {id:'pai',d:4,base:'par',cat:'town',lat:48.8710,lng:2.3623,nm:'Du Pain et des Idées',q:'Du Pain et des Idees, Paris',tag:['завтрак','t-easy'],
  why:'Пекарня 1889 года по дороге с Монмартра: улитки с шоколадом и хлеб, за которым стоит очередь местных.'}
];

const FOODCITIES=[
 {city:'Париж',base:'par',q:'Paris, France',lat:48.8566,lng:2.3522,
  spots:[
   {nm:'Bouillon Chartier',lat:48.87194,lng:2.34301,meal:'обед',price:'€€',veg:'кое-что',why:'столовая 1896 года, очередь идёт быстро'},
   {nm:'Le Comptoir du Relais',lat:48.85196,lng:2.33883,meal:'ужин',price:'€€€',veg:'кое-что',why:'классический бистро-ужин, столик занимать заранее'},
   {nm:"L'As du Fallafel",lat:48.85742,lng:2.35907,meal:'обед',price:'€',veg:'вег ok',why:'фалафель в Марэ, есть очередь и это нормально'},
   {nm:'Breizh Café',lat:48.86063,lng:2.36182,meal:'обед',price:'€€',veg:'вег ok',why:'бретонские блинчики и сидр'},
   {nm:'Café de Flore',lat:48.85414,lng:2.33263,meal:'завтрак',price:'€€€',veg:'вег ok',why:'дорого и туристично, но кофе на террасе того стоит'}
  ]}
];

const LINES=[
 {type:'leg',days:[1],label:'CDG → Париж',pts:[[49.0097,2.5479],[48.9560,2.4400],[48.8990,2.3900],[48.8566,2.3522]]},
 {type:'trip',days:[3],label:'Версаль и обратно',dash:'6,7',pts:[[48.8566,2.3522],[48.8300,2.2600],[48.8049,2.1204]]},
 {type:'leg',days:[4],label:'Париж → CDG',pts:[[48.8566,2.3522],[48.8990,2.3900],[48.9560,2.4400],[49.0097,2.5479]]}
];

const TRIP_NAME='Париж';
const START='2026-09-10';
const IMGPREF='pa_';

const HERO={
  h1:'Париж',em:'четыре дня пешком',
  sub:'Один город без машины: острова на Сене, Лувр и Сент-Шапель, Версаль на день и Монмартр напоследок.',
  photo:'img/pa_eif-l.jpg',alt:'Эйфелева башня',
  capTitle:'Tour Eiffel',capSub:'третий вечер · закат и мерцание каждый час',place:'eif',
  parks:'0',parksCap:'машин в поездке'
};

const PHOTO={eif:'jpg',lat:'jpg',lou:'jpg',mar:'jpg',mon:'jpg',ors:'jpg',sai:'jpg',sei:'jpg',tri:'jpg',ver:'jpg'};
const BPHOTO={par:'sei'};

/* высот в городе нет — профиль высоты для такой поездки не рисуем */
const ALT={};
const ALTNM={};

const ORIGIN={city:'Майами',code:'MIA',ll:[25.7617,-80.1918]};
const AIRPORT={par:'CDG'};
const AIRPORTNM={CDG:'Париж'};
const AIRPORTWAY={CDG:'≈30 км · RER B, 35–50 мин до центра'};
const SEGMENT={par:'flight'};
const TRANSFER={};

const META={
 lou:{min:210,price:'€22 онлайн',best:'после 15:00 тише',route:'метро Palais Royal'},
 sai:{min:45,price:'€13',best:'солнечный час',route:'рядом с Notre-Dame'},
 ver:{min:180,price:'€21 дворец, парк бесплатно',best:'к открытию',route:'RER C, 45 мин'},
 eif:{min:120,price:'€14–29 подъём',best:'закат',route:'метро Bir-Hakeim'},
 mon:{min:120,price:'бесплатно',best:'до 10:00',route:'метро Anvers + фуникулёр'},
 ors:{min:120,price:'€16',best:'вечер четверга до 21:45',route:'метро Solférino'},
 cdg:{min:60},
 sei:{min:60},
 lat:{min:90},
 mar:{min:90},
 tri:{min:120},
 pai:{min:20},
};

const BUDGET=[
 {g:'Перелёт',ic:'plane',c:'#5a4bb5',c2:'#3b3080',items:[
   {k:'a1',nm:'Билеты',sub:'туда-обратно',per:'person',v:780,est:1},
   {k:'a2',nm:'Багаж',sub:'2 стороны',per:'person',v:90,est:1}
 ]},
 {g:'Транспорт',ic:'train',c:'#12855e',c2:'#0a6047',items:[
   {k:'c1',nm:'Проездной Navigo Easy',sub:'метро на все дни',per:'person',v:35,est:1},
   {k:'c2',nm:'RER B из аэропорта и обратно',sub:'2 стороны',per:'person',v:26,ok:1},
   {k:'c3',nm:'RER C до Версаля',sub:'туда-обратно',per:'person',v:8,ok:1}
 ]},
 {g:'Входы и активности',ic:'ticket',c:'#d96a12',c2:'#b0530c',items:[
   {k:'t1',nm:'Louvre',sub:'вход по времени',per:'person',v:22,ok:1},
   {k:'t2',nm:'Sainte-Chapelle',sub:'витражи',per:'person',v:13,ok:1},
   {k:'t3',nm:'Château de Versailles',sub:'дворец + сад',per:'person',v:21,ok:1},
   {k:'t4',nm:'Tour Eiffel',sub:'подъём на второй этаж',per:'person',v:20,est:1},
   {k:'t5',nm:"Musée d'Orsay",sub:'опция',per:'person',v:16,est:1}
 ]},
 {g:'Еда',ic:'food',c:'#a1663a',c2:'#6f4227',items:[
   {k:'f1',nm:'Еда и кафе',per:'personday',rate:55,sub:'на человека в день'}
 ]}
];

/* ── ДОРОГИ ПО-НАСТОЯЩЕМУ ── считано road-times.js, руками не править ── */
const ROADS={
 1:{ids:["@par","cdg","sei","lat"],km:[[null,null,0.6,1.2],[null,null,null,null],[0.6,null,null,0.7],[1.2,null,0.7,null]],min:[[null,null,9,15],[null,null,null,null],[9,null,null,9],[15,null,9,null]]},
 2:{ids:["@par","lou","sai","mar","ors"],km:[[null,1.3,0.7,1.2,2.1],[1.3,null,1.2,2.4,1.1],[0.7,1.2,null,1.9,1.7],[1.2,2.4,1.9,null,3.3],[2.1,1.1,1.7,3.3,null]],min:[[null,17,10,16,29],[17,null,15,33,14],[10,15,null,25,23],[16,33,25,null,44],[29,14,23,44,null]]},
 3:{ids:["@par","ver","tri","eif"],km:[[null,null,null,4.8],[null,null,1.7,null],[null,1.7,null,null],[4.8,null,null,null]],min:[[null,null,null,65],[null,null,23,null],[null,23,null,null],[65,null,null,null]]},
 4:{ids:["@par","mon","pai"],km:[[null,4,2],[4,null,2.6],[2,2.6,null]],min:[[null,53,26],[53,null,35],[26,35,null]]},
};
const ROADSTEPS={
 "sei>lat":"etdiHi_jMu@dDzIrHpE`NQjBnAv@[V",
 "@par>sai":"okeiH{kjMg@Uk@rEl@|Fh@RU`BbAl@iAxGNbBzJpI",
 "sai>mar":"{_eiHkbiM}EsDjFuWmCaC`BmGa@]P{B}@_@`@mCw@y@OcGzAaLZgKxDkXwGyD^kCd@^",
 "mar>lou":"maeiHg}lMe@_@_@jCvGxDaDvK_MlaAwQlw@JvF`Bn@}BzJOjE",
 "lou>ors":"uafiH}pgMIh@|Ad@qDzT|CxB}AlMdGnG}CpO",
 "ver>tri":"ye{hH{b}KsCu@wBd@sBhCqImEwHnEm@vQaKz`@cPtFPtA",
 "@par>mon":"okeiH{kjM}GrXsJpIuBr@sA{@U|AkGiCo@zAqJvEg_@~LoHuAcKv@aT|Uw_@}JYcCsI|AaJcC@y@wB{AC}AkAS",
 "mon>pai":"{dkiHeuhM`BOPkBs@gEfB@f@kNtBRdBgKtBDAcA|A[niAyaAfC{DmBuBp@kB",
};
/* ── конец дорог ── */

/* ── ЕДА НА МАРШРУТЕ ── собрано food-nearby.js по OpenStreetMap ── */
const FOODNEAR={
 1:[{"nm":"MONK La Taverne de Cluny","lat":48.85157,"lng":2.3439,"kind":"restaurant","cuisine":"french","hours":"\"10:00-02:00 every day, sunday 12:00-02:0/\"","near":"lat","d":114},{"nm":"Bouillon Racine","lat":48.85016,"lng":2.34202,"kind":"restaurant","cuisine":"french","hours":"Mo-Su 12:00-23:00","near":"lat","d":181},{"nm":"Loufoque","lat":48.85161,"lng":2.34692,"kind":"restaurant","cuisine":"burger","hours":"Mo-Th 12:00-14:30, 17:00-00:00; Fr 12:00-14:30, 17:00-01:00; Sa 12:00-01:00; Su 12:00-19:30","near":"lat","d":216},{"nm":"Crêperie des Pêcheurs","lat":48.85327,"lng":2.34223,"kind":"restaurant","cuisine":"crepe","hours":"12:00-15:00,19:00-23:00","near":"lat","d":337},{"nm":"McDonald's","lat":48.85142,"lng":2.34376,"kind":"fast_food","cuisine":"burger","hours":"PH,Mo-Su 08:30-01:00","near":"lat","d":103},{"nm":"Starbucks","lat":48.851,"lng":2.34268,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 07:00-21:00; Sa,Su 08:00-21:00","near":"lat","d":133},{"nm":"El Sol y la Luna","lat":48.8513,"lng":2.34599,"kind":"restaurant","cuisine":"latin american","hours":"We-Mo 11:30-23:00; Tu 17:00-23:00","near":"lat","d":140},{"nm":"Café Panis","lat":48.8522,"lng":2.34837,"kind":"cafe","cuisine":"french","hours":"Mo-Fr 07:00-01:00; Sa-Su 08:00-01:00","near":"sei","d":143},{"nm":"Rocaille","lat":48.85187,"lng":2.3447,"kind":"restaurant","cuisine":"french","hours":"Mo 18:30-22:30; Tu-Fr 11:45-14:30,18:30-22:30; Sa 11:45-22:30; Su 11:45-22:00","near":"lat","d":143},{"nm":"La Petite Hostellerie","lat":48.85207,"lng":2.34443,"kind":"restaurant","cuisine":"french","hours":"Mo-Su 12:00-00:00","near":"lat","d":163},{"nm":"Sumo","lat":48.84978,"lng":2.34695,"kind":"restaurant","cuisine":"japanese","hours":"18:30-23:00, Mo-Sa 11:00-15:00","near":"lat","d":208},{"nm":"Le Coupe-Chou","lat":48.84849,"lng":2.3463,"kind":"restaurant","cuisine":"french","hours":"Mo-Su 19:00-22:45","near":"lat","d":273},{"nm":"Le Saint-Régis","lat":48.85293,"lng":2.35369,"kind":"cafe","cuisine":"breakfast","hours":"Mo-Su 07:30-02:00","near":"sei","d":277},{"nm":"Red Grill","lat":48.85282,"lng":2.34612,"kind":"restaurant","cuisine":"steak house","hours":"12:00-02:00","near":"lat","d":277}],
 2:[{"nm":"Le Rempart","lat":48.85338,"lng":2.36656,"kind":"cafe","cuisine":"french","hours":"Mo-Su 07:00-00:00","near":"mar","d":243},{"nm":"Auberge de Venise","lat":48.85376,"lng":2.36752,"kind":"restaurant","cuisine":"italian","hours":"Mo-Su 11:30-23:30","near":"mar","d":244},{"nm":"Tornello","lat":48.85495,"lng":2.36736,"kind":"restaurant","cuisine":"italian","hours":"Mo 12:00-15:00,19:00-23:00; Th-Su 12:00-15:00,19:00-23:00","near":"mar","d":159},{"nm":"Au Bouquet Saint-Paul","lat":48.85452,"lng":2.36273,"kind":"restaurant","cuisine":"french","hours":"Mo-We 08:00-01:00; Th-Sa 08:00-02:00; Su 08:00-01:00","near":"mar","d":212},{"nm":"The Brooklyn Pizzeria","lat":48.85593,"lng":2.36817,"kind":"restaurant","cuisine":"italian","hours":"Mo-Su 09:00-00:00","near":"mar","d":219},{"nm":"Le Fumoir","lat":48.86043,"lng":2.34086,"kind":"restaurant","cuisine":"french","hours":"Mo-Su 11:00-02:00","near":"lou","d":239},{"nm":"Brasserie Bofinger","lat":48.85391,"lng":2.36804,"kind":"restaurant","cuisine":"french","hours":"Mo-Sa 12:00-15:00, 18:30-00:00; Su 12:00-15:00, 18:30-23:00","near":"mar","d":260},{"nm":"Mr & Mrs Crab","lat":48.85308,"lng":2.34553,"kind":"restaurant","cuisine":"seafood","hours":"12:00-24:00","near":"sai","d":260},{"nm":"Shinjuku Sushi","lat":48.85395,"lng":2.36223,"kind":"restaurant","cuisine":"japanese","hours":"Mo-Sa 11:30-14:30,18:30-22:30","near":"mar","d":277},{"nm":"Red Grill","lat":48.85282,"lng":2.34612,"kind":"restaurant","cuisine":"steak house","hours":"12:00-02:00","near":"sai","d":298},{"nm":"Mai Thai","lat":48.85811,"lng":2.36537,"kind":"restaurant","cuisine":"thai","hours":"Tu-Sa 12:00-15:00, 19:00-23:00; Su 12:00-15:00","near":"mar","d":301},{"nm":"Casa Festa","lat":48.86259,"lng":2.34081,"kind":"restaurant","cuisine":"pizza","hours":"Mo-Su 12:00-15:00,18:00-23:00","near":"lou","d":323},{"nm":"Le Loir dans la Théière","lat":48.85623,"lng":2.36105,"kind":"cafe","cuisine":"teahouse","hours":"Mo-Su 09:00-19:30","near":"mar","d":325},{"nm":"Midory","lat":48.86128,"lng":2.34237,"kind":"restaurant","cuisine":"japanese","hours":"Mo-Sa 11:00-14:30,18:00-22:45; Su 18:00-22:45","near":"lou","d":357}],
 3:[{"nm":"Chez Tiouiche","lat":48.80246,"lng":2.12205,"kind":"restaurant","hours":"Mo-Th 12:00-14:30,19:00-22:00; Fr,Sa 12:00-14:30,19:00-22:15; Su 12:00-14:30,19:00-21:30","near":"ver","d":297},{"nm":"Bar du Château","lat":48.80492,"lng":2.12567,"kind":"restaurant","cuisine":"crepe","hours":"Tu-Su,PH 09:00-21:00","near":"ver","d":386},{"nm":"La Tour","lat":48.80666,"lng":2.12506,"kind":"restaurant","hours":"Mo-Sa 12:00-14:30, 19:00-22:30; Su 12:00-14:30","near":"ver","d":393},{"nm":"Le Jules Verne","lat":48.85813,"lng":2.2945,"kind":"restaurant","cuisine":"french","near":"eif","d":30},{"nm":"Grand Café d'Orleans","lat":48.80385,"lng":2.12163,"kind":"cafe","hours":"Mo-Su,PH 09:30-18:00","near":"ver","d":148},{"nm":"Castel Cafe","lat":48.8569,"lng":2.29222,"kind":"restaurant","cuisine":"french","near":"eif","d":236},{"nm":"Brasserie de la Girandole","lat":48.80542,"lng":2.11557,"kind":"restaurant","hours":"Tu-Su 08:00-20:30","near":"ver","d":358},{"nm":"Au Bon Accueil","lat":48.85971,"lng":2.29922,"kind":"restaurant","cuisine":"french","near":"eif","d":375},{"nm":"Les Amours","lat":48.85905,"lng":2.29822,"kind":"restaurant","cuisine":"french","near":"eif","d":282},{"nm":"Azulí","lat":48.80305,"lng":2.12309,"kind":"restaurant","near":"ver","d":285},{"nm":"La Table du 11","lat":48.8028,"lng":2.12285,"kind":"restaurant","hours":"Tu-Sa 19:30-21:30, Fr,Sa 12:30-13:30","near":"ver","d":295},{"nm":"Chez Pippo","lat":48.85888,"lng":2.29855,"kind":"restaurant","near":"eif","d":301},{"nm":"Ducasse sur Seine","lat":48.86043,"lng":2.29173,"kind":"restaurant","cuisine":"french","near":"eif","d":303},{"nm":"Il Caragioia","lat":48.80242,"lng":2.12222,"kind":"restaurant","cuisine":"italian","near":"ver","d":306}],
 4:[{"nm":"Ten Belles","lat":48.87349,"lng":2.36474,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 08:30-16:30; Sa-Su 09:00-17:30","near":"pai","d":330},{"nm":"Mme Shawn","lat":48.87422,"lng":2.36239,"kind":"restaurant","cuisine":"thai","hours":"Mo-Su 12:00-15:00,19:30-23:00","near":"pai","d":359},{"nm":"L'Alsacien","lat":48.86914,"lng":2.35771,"kind":"restaurant","cuisine":"regional","hours":"Mo-We 12:00-14:30, 17:30-22:30; Th-Sa 12:00-14:30, 17:30-23:30; Su 12:00-14:30, 17:30-22:30","near":"pai","d":394},{"nm":"El Guacamole","lat":48.87137,"lng":2.36215,"kind":"fast_food","cuisine":"mexican","hours":"Mo-Th 11:30-15:00, 18:00-23:00; Fr-Su 11:30-23:30","near":"pai","d":42},{"nm":"Le Cabanon de la Butte","lat":48.88665,"lng":2.3444,"kind":"restaurant","cuisine":"french","hours":"We-Su 12:00-14:30,18:30-22:30","near":"mon","d":95},{"nm":"Hardware Société","lat":48.88689,"lng":2.34456,"kind":"restaurant","cuisine":"french","hours":"Mo-Fr 09:30-16:00; Sa, Su 09:30-16:30","near":"mon","d":109},{"nm":"Aca","lat":48.87209,"lng":2.36257,"kind":"restaurant","cuisine":"mexican","hours":"Tu-We, Fr 12:00-14:30, 19:30-23:00; Th 12:00-14:30, 23:00-23:00; Sa 12:00-15:00, 19:30-23:30; Su 12:00-15:00, 19:30-23:00; Mo, PH closed","near":"pai","d":123},{"nm":"Au Soleil de la Butte","lat":48.88651,"lng":2.34526,"kind":"restaurant","cuisine":"french","hours":"Su-We 09:00-12:00, Fr,Sa 09:00-06:00; Th 09:00-05:00","near":"mon","d":159},{"nm":"Fuxia","lat":48.87267,"lng":2.36318,"kind":"restaurant","cuisine":"italian","hours":"Mo-We 10:30-00:00; Th-Sa 10:30-00:30; Su 10:30-23:00","near":"pai","d":196},{"nm":"Vafamoc","lat":48.87309,"lng":2.3617,"kind":"fast_food","cuisine":"pizza","hours":"Tu-Th 12:00-14:00,19:00-22:00; Fr 12:00-14:00,19:00-23:00; Sa,Su 12:00-15:00,19:00-23:00","near":"pai","d":237},{"nm":"Le Bourgogne","lat":48.87322,"lng":2.36293,"kind":"restaurant","cuisine":"french","hours":"Mo-Fr 11:45-14:45, 19:00-00:00; Sa 17:00-00:00","near":"pai","d":251},{"nm":"Les Vinaigriers","lat":48.87324,"lng":2.36138,"kind":"restaurant","cuisine":"french","hours":"Mo-Fr 12:00-14:00,19:00-22:00; Sa 12:30-14:30,19:00-22:00","near":"pai","d":258},{"nm":"Karaz","lat":48.87027,"lng":2.36564,"kind":"restaurant","cuisine":"lebanese","hours":"Mo-Su 11:30-02:00","near":"pai","d":258},{"nm":"Hôtel du Nord","lat":48.87349,"lng":2.36414,"kind":"restaurant","cuisine":"french","hours":"Su-Th 09:00-00:00; Fr,Sa 09:00-02:00","near":"pai","d":308}],
};
/* ── конец еды на маршруте ── */
