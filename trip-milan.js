/* ==========================================================================
   ДАННЫЕ ПОЕЗДКИ — Милан и озеро Комо, 5 дней

   ФОРМА ПОЕЗДКИ: два города · между ними ПОЕЗД, а не машина · машины нет
   вовсе · выезд на день катером по озеру · прилёт и вылет из одного аэропорта.
   Ради этой формы маршрут и сделан: движок обязан нарисовать переезд поездом
   и не предлагать прокат там, где он не нужен.
   ========================================================================== */

const BCOL={mil:'#5a4bb5',com:'#12855e'};
const BCOL2={mil:'#3b3080',com:'#0a6047'};

const BASES=[
 {id:'mil',name:'Милан',emoji:'city',nights:3,color:BCOL.mil,lat:45.4642,lng:9.1900,q:'Milan, Italy',
  desc:'Собор из белого мрамора, «Тайная вечеря», кварталы дизайна и лучший в Италии аперитив.',
  alt:'Жильё удобнее у Duomo, Brera или Porta Venezia: до всего пешком, до вокзала — две остановки метро.'},
 {id:'com',name:'Комо',emoji:'city',nights:1,color:BCOL.com,lat:45.8081,lng:9.0852,q:'Como, Italy',
  desc:'Городок у подножия Альп на южном конце озера: набережная, фуникулёр и катера к деревням.',
  alt:'Можно ночевать в Варенне или Белладжо — тише и красивее, но до поезда дольше.'}
];

const CITYMOVE={mil:'metro_walk',com:'walk'};

const DAY_BASE={1:'mil',2:'mil',3:'mil',4:'com',5:'com'};

const DAYS=[
 {n:1,title:'Прилёт и вечер у Дуомо',pill:'прилёт',leg:'MXP → центр: поезд Malpensa Express, 50 мин',
  note:'<b>Первый вечер спокойный.</b> Из аэропорта идёт поезд до Cadorna или Centrale. Дальше пешком.'},
 {n:2,title:'Дуомо, галерея и «Тайная вечеря»',pill:'пешком',leg:'весь день пешком, метро между кварталами',
  note:'<b>Билет на «Тайную вечерю» — за месяц.</b> Их всего 30 в сеанс, и в день продажи разбирают за час.'},
 {n:3,title:'Брера, канал и аперитив',pill:'пешком',leg:'Brera → Navigli, 25 мин пешком или две остановки метро',
  note:'<b>Аперитив с 18:00:</b> берёшь напиток — закуски приносят к нему. Это ужин, если не жадничать.'},
 {n:4,title:'Поезд на Комо и катер по озеру',pill:'переезд',leg:'Milano Centrale → Como, поезд 40–60 мин',
  note:'<b>Билет на поезд валидируй</b> перед посадкой, если он бумажный. Катера ходят по расписанию до вечера.'},
 {n:5,title:'Фуникулёр, набережная и вылет',pill:'финал',leg:'Como → MXP: поезд 1 ч 20 мин с пересадкой',
  note:'<b>Заложи запас.</b> Прямых поездов из Комо в аэропорт мало, чаще с пересадкой в Салуджии или Милане.'}
];

const P=[
 {id:'mxp',d:1,base:'mil',cat:'transport',lat:45.6306,lng:8.7281,nm:'Aeroporto di Milano–Malpensa (MXP)',q:'Milan Malpensa Airport',tag:['прилёт','t-easy'],
  why:'Сюда прилетаешь. Поезд Malpensa Express идёт в центр за 50 минут и ходит каждые полчаса.'},
 {id:'duo',d:1,base:'mil',cat:'town',lat:45.4642,lng:9.1900,nm:'Duomo di Milano',q:'Duomo di Milano',tag:['первый вечер','t-must'],star:1,
  why:'Главный собор города: 135 шпилей, мрамор со всей Ломбардии. Вечером площадь пустеет и фасад подсвечен.'},
 {id:'gal',d:1,base:'mil',cat:'town',lat:45.4659,lng:9.1900,nm:'Galleria Vittorio Emanuele II',q:'Galleria Vittorio Emanuele II, Milan',tag:['рядом','t-easy'],
  why:'Стеклянная галерея 1877 года прямо у собора: мозаики, кафе и самый дорогой шопинг Италии.'},
 {id:'ter',d:2,base:'mil',cat:'town',lat:45.4661,lng:9.1707,nm:'Santa Maria delle Grazie · Il Cenacolo',q:'Santa Maria delle Grazie, Milan',tag:['нужен билет','t-must'],star:1,
  why:'«Тайная вечеря» Леонардо на стене трапезной. Пускают по 30 человек на 15 минут — билет берут заранее.'},
 {id:'sfo',d:2,base:'mil',cat:'town',lat:45.4707,lng:9.1795,nm:'Castello Sforzesco',q:'Castello Sforzesco, Milan',tag:['музеи','t-easy'],
  why:'Замок герцогов Сфорца и парк за ним. Внутри — последняя, незаконченная скульптура Микеланджело.'},
 {id:'ros',d:2,base:'mil',cat:'town',lat:45.4630,lng:9.1855,nm:'Terrazze del Duomo',q:'Duomo Terraces, Milan',tag:['вид','t-must'],star:1,
  why:'Крыша собора: между шпилями ходишь по мрамору, в ясный день видно Альпы. Отдельный билет.'},
 {id:'bre',d:3,base:'mil',cat:'town',lat:45.4719,lng:9.1881,nm:'Brera',q:'Brera district, Milan',tag:['квартал','t-easy'],
  why:'Квартал академии художеств: мастерские, крошечные бары, ботанический сад во дворе.'},
 {id:'nav',d:3,base:'mil',cat:'town',lat:45.4519,lng:9.1743,nm:'Navigli',q:'Navigli, Milan',tag:['вечер','t-easy'],star:1,
  why:'Каналы, спроектированные Леонардо. Вечером вдоль воды — весь миланский аперитив.'},
 {id:'com',d:4,base:'com',cat:'town',lat:45.8081,lng:9.0852,nm:'Como',q:'Como, Italy',tag:['переезд','t-easy'],
  why:'Город на южном конце озера: собор, набережная и причал, от которого уходят катера.'},
 {id:'bel',d:4,base:'com',cat:'nature',lat:45.9787,lng:9.2606,nm:'Bellagio',q:'Bellagio, Lake Como',tag:['на катере','t-must'],star:1,
  why:'Деревня на мысу, где озеро делится надвое: лестницы-улицы, сады вилл. Катер идёт около двух часов, быстрый — 45 минут.'},
 {id:'var',d:4,base:'com',cat:'nature',lat:46.0100,lng:9.2836,nm:'Varenna',q:'Varenna, Lake Como',tag:['напротив','t-easy'],
  why:'Деревня напротив Белладжо: дорожка влюблённых по самой воде и сады виллы Монастеро.'},
 {id:'bru',d:5,base:'com',cat:'nature',lat:45.8332,lng:9.0899,nm:'Funicolare Como–Brunate',q:'Funicolare Como Brunate',tag:['утро','t-easy'],star:1,
  why:'Фуникулёр 1894 года поднимает за семь минут на 500 метров: сверху видно всё озеро и Альпы.'},
 {id:'vil',d:5,base:'com',cat:'nature',lat:45.8534,lng:9.0787,nm:'Villa Olmo',q:'Villa Olmo, Como',tag:['перед поездом','t-easy'],
  why:'Вилла XVIII века с парком у воды в двадцати минутах пешком по набережной.'}
];

const FOODCITIES=[
 {city:'Милан',base:'mil',q:'Milan, Italy',lat:45.4642,lng:9.1900,
  spots:[
   {nm:'Luini Panzerotti',best:'перекус',price:'€',veg:'вег ok',tag:'жареные пирожки у собора с 1949 года'},
   {nm:'Trattoria Milanese',best:'ужин',price:'€€',veg:'кое-что',tag:'оссобуко и ризотто по-милански'},
   {nm:'Pasticceria Marchesi 1824',best:'завтрак',price:'€€',veg:'вег ok',tag:'кофе и выпечка в интерьере XIX века'},
   {nm:'Nottingham Forest',best:'вечер',price:'€€',veg:'вег ok',tag:'коктейльный бар, известный на всю Италию'}
  ]},
 {city:'Комо',base:'com',q:'Como, Italy',lat:45.8081,lng:9.0852,
  spots:[
   {nm:'Osteria del Gallo',best:'обед',price:'€€',veg:'кое-что',tag:'семейная остерия в переулке у собора'},
   {nm:'Gelateria Ceccato',best:'после обеда',price:'€',veg:'вег ok',tag:'мороженое на набережной'}
  ]}
];

const LINES=[
 {type:'leg',days:[1],label:'MXP → Милан',pts:[[45.6306,8.7281],[45.5600,8.9000],[45.4900,9.1200],[45.4642,9.1900]]},
 {type:'leg',days:[4],label:'Милан → Комо (поезд)',pts:[[45.4642,9.1900],[45.5800,9.1500],[45.7000,9.1100],[45.8081,9.0852]]},
 {type:'trip',days:[4],label:'Катер по озеру',dash:'6,7',pts:[[45.8081,9.0852],[45.9000,9.1600],[45.9787,9.2606],[46.0100,9.2836]]},
 {type:'leg',days:[5],label:'Комо → MXP',pts:[[45.8081,9.0852],[45.7000,9.0000],[45.6306,8.7281]]}
];

const TRIP_NAME='Милан и Комо';
const START='2026-09-18';
const IMGPREF='mi_';

const HERO={
  h1:'Милан',em:'и озеро Комо',
  sub:'Три дня в городе и два у озера: собор, «Тайная вечеря», аперитив на каналах, катер в Белладжо и фуникулёр над водой.',
  photo:'img/mi_duo-l.jpg',alt:'Duomo di Milano',
  capTitle:'Duomo di Milano',capSub:'первый вечер · площадь пустеет, фасад подсвечен',place:'duo',
  parks:'2',parksCap:'города в поездке'
};

const PHOTO={bel:'jpg',bre:'jpg',bru:'jpg',com:'jpg',duo:'jpg',gal:'jpg',nav:'jpg',sfo:'jpg',ter:'jpg',var:'jpg',vil:'jpg'};
const BPHOTO={mil:'duo',com:'bel'};

const ALT={};
const ALTNM={};

const ORIGIN={city:'Майами',code:'MIA',ll:[25.7617,-80.1918]};
const AIRPORT={mil:'MXP',com:'MXP'};
const AIRPORTNM={MXP:'Милан'};
const AIRPORTWAY={MXP:'≈50 км · поезд Malpensa Express, 50 мин'};
/* в Комо едем ПОЕЗДОМ — это и есть та форма, ради которой сделан маршрут */
const SEGMENT={mil:'flight',com:'train'};
const TRANSFER={com:{km:50,clean:'40–60 мин',stops:'поезда каждый час'}};

const META={
 duo:{price:'€10 собор',dur:'1 ч',best:'вечер',route:'метро Duomo'},
 ros:{price:'€15 крыша',dur:'1 ч',best:'ясный день',route:'вход сбоку собора'},
 ter:{price:'€15',dur:'15 мин внутри',best:'билет за месяц',route:'метро Cadorna'},
 bel:{price:'€10–16 катер',dur:'полдня',best:'первым катером',route:'причал в Комо'},
 bru:{price:'€6 туда-обратно',dur:'1–2 ч',best:'утро',route:'станция у набережной'}
};

const BUDGET=[
 {g:'Перелёт',ic:'plane',c:'#5a4bb5',c2:'#3b3080',items:[
   {k:'a1',nm:'Билеты',sub:'туда-обратно',per:'person',v:760,est:1},
   {k:'a2',nm:'Багаж',sub:'2 стороны',per:'person',v:90,est:1}
 ]},
 {g:'Транспорт',ic:'train',c:'#12855e',c2:'#0a6047',items:[
   {k:'c1',nm:'Malpensa Express',sub:'2 стороны',per:'person',v:30,ok:1},
   {k:'c2',nm:'Поезд Милан → Комо',sub:'в одну сторону',per:'person',v:14,ok:1},
   {k:'c3',nm:'Метро в Милане',sub:'на все дни',per:'person',v:20,est:1},
   {k:'c4',nm:'Катер по озеру',sub:'Комо → Белладжо → Варенна',per:'person',v:26,est:1}
 ]},
 {g:'Входы и активности',ic:'ticket',c:'#d96a12',c2:'#b0530c',items:[
   {k:'t1',nm:'Il Cenacolo',sub:'«Тайная вечеря», билет заранее',per:'person',v:15,ok:1},
   {k:'t2',nm:'Terrazze del Duomo',sub:'крыша собора',per:'person',v:15,ok:1},
   {k:'t3',nm:'Duomo',sub:'вход в собор',per:'person',v:10,ok:1},
   {k:'t4',nm:'Funicolare Como–Brunate',sub:'туда-обратно',per:'person',v:6,ok:1},
   {k:'t5',nm:'Castello Sforzesco',sub:'музеи, опция',per:'person',v:5,est:1}
 ]},
 {g:'Еда',ic:'food',c:'#a1663a',c2:'#6f4227',items:[
   {k:'f1',nm:'Еда и кафе',per:'personday',rate:50,sub:'на человека в день'}
 ]}
];
