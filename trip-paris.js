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
 {id:'lou',d:2,base:'par',cat:'town',lat:48.8606,lng:2.3376,nm:'Musée du Louvre',q:'Louvre Museum, Paris',tag:['нужен билет','t-must'],star:1,
  why:'Самый большой музей мира. За один заход всё не обойти — выбери два крыла и не пытайся успеть остальное. Билет по времени, вторник закрыт.'},
 {id:'sai',d:2,base:'par',cat:'town',lat:48.8554,lng:2.3450,nm:'Sainte-Chapelle',q:'Sainte-Chapelle, Paris',tag:['витражи','t-must'],star:1,
  why:'Пятнадцать метров витражей XIII века в маленькой часовне. Иди в солнечный час — стены светятся насквозь.'},
 {id:'mar',d:2,base:'par',cat:'town',lat:48.8554,lng:2.3653,nm:'Le Marais · Place des Vosges',q:'Place des Vosges, Paris',tag:['квартал','t-easy'],
  why:'Старейшая площадь города и квартал вокруг: галереи, мастерские, лучшая уличная еда в Париже.'},
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
   {nm:'Bouillon Chartier',meal:'обед',price:'€€',veg:'кое-что',why:'столовая 1896 года, очередь идёт быстро'},
   {nm:'Le Comptoir du Relais',meal:'ужин',price:'€€€',veg:'кое-что',why:'классический бистро-ужин, столик занимать заранее'},
   {nm:"L'As du Fallafel",meal:'обед',price:'€',veg:'вег ok',why:'фалафель в Марэ, есть очередь и это нормально'},
   {nm:'Breizh Café',meal:'обед',price:'€€',veg:'вег ok',why:'бретонские блинчики и сидр'},
   {nm:'Café de Flore',meal:'завтрак',price:'€€€',veg:'вег ok',why:'дорого и туристично, но кофе на террасе того стоит'}
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
 lou:{price:'€22 онлайн',dur:'3–4 ч',best:'после 15:00 тише',route:'метро Palais Royal'},
 sai:{price:'€13',dur:'45 мин',best:'солнечный час',route:'рядом с Notre-Dame'},
 ver:{price:'€21 дворец, парк бесплатно',dur:'весь день',best:'к открытию',route:'RER C, 45 мин'},
 eif:{price:'€14–29 подъём',dur:'2 ч',best:'закат',route:'метро Bir-Hakeim'},
 mon:{price:'бесплатно',dur:'2–3 ч',best:'до 10:00',route:'метро Anvers + фуникулёр'},
 ors:{price:'€16',dur:'2 ч',best:'вечер четверга до 21:45',route:'метро Solférino'}
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
