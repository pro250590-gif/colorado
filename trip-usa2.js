/* ==========================================================================
   ДАННЫЕ ПОЕЗДКИ — Нью-Йорк и Лос-Анджелес, 8 дней

   ФОРМА ПОЕЗДКИ: два далёких города · ПЕРЕЛЁТ ПОСРЕДИ ПОЕЗДКИ · прилетаем в
   один город, улетаем из другого · машина только во второй половине: в
   Нью-Йорке она мешает и стоит денег, в Лос-Анджелесе без неё никуда.
   Ради этой формы маршрут и сделан: прокат должен появиться в середине, а не
   на весь срок, и перелёт должен встать между городами, а не только по краям.
   ========================================================================== */

const BCOL={nyc:'#1d3448',lax:'#d96a12'};
const BCOL2={nyc:'#0f2233',lax:'#b0530c'};

const BASES=[
 {id:'nyc',name:'Нью-Йорк',emoji:'city',nights:4,color:BCOL.nyc,lat:40.7580,lng:-73.9855,q:'New York, NY',
  desc:'Четыре дня пешком и на метро: Манхэттен сверху и снизу, музеи, мосты и Бруклин на закате.',
  alt:'Жильё в Мидтауне дороже всего; Бруклин у моста и Лонг-Айленд-Сити дешевле, а до центра 15 минут метро.'},
 {id:'lax',name:'Лос-Анджелес',emoji:'city',nights:3,color:BCOL.lax,lat:34.0522,lng:-118.2437,q:'Los Angeles, CA',
  desc:'Океан, холмы и расстояния: Санта-Моника, Гриффит, Малибу. Здесь машина — не роскошь, а способ передвигаться.',
  alt:'Ночевать удобнее в Санта-Монике или Западном Голливуде: оттуда ближе и к океану, и к холмам.'}
];

/* в Нью-Йорке машина не нужна вовсе, в Лос-Анджелесе — нужна всё время */
const CITYMOVE={nyc:'metro_walk',lax:'car_all'};

const DAY_BASE={1:'nyc',2:'nyc',3:'nyc',4:'nyc',5:'lax',6:'lax',7:'lax',8:'lax'};

const DAYS=[
 {n:1,title:'Прилёт и первый вечер на Манхэттене',pill:'прилёт',leg:'JFK → Манхэттен: AirTrain + метро, ~1 ч',
  note:'<b>Из аэропорта — на поезде.</b> AirTrain до Jamaica, дальше метро. Такси дороже в разы и стоит в пробке.'},
 {n:2,title:'Центральный парк и музеи',pill:'пешком',leg:'весь день пешком и на метро',
  note:'<b>В музеях Нью-Йорка «рекомендованная» цена.</b> Для жителей штата она и правда рекомендованная, для остальных — фиксированная.'},
 {n:3,title:'Даунтаун, мост и Бруклин',pill:'пешком',leg:'по мосту пешком, обратно на метро',
  note:'<b>Иди по мосту из Бруклина в Манхэттен</b> — тогда город будет перед тобой, а не за спиной.'},
 {n:4,title:'Высокая линия и вид сверху',pill:'пешком',leg:'High Line → Hudson Yards, 30 мин пешком',
  note:'<b>Смотровые площадки — по времени.</b> Билет заранее и лучше на закат: полчаса до и полчаса после.'},
 {n:5,title:'Перелёт в Лос-Анджелес',pill:'перелёт',leg:'JFK → LAX, 6 ч в воздухе, разница 3 часа назад',
  note:'<b>Машину берём в аэропорту LAX,</b> а не в городе: там прокатов больше и дешевле. В Нью-Йорке она была не нужна.'},
 {n:6,title:'Океан: Санта-Моника и Венис',pill:'на машине',leg:'от LAX до Санта-Моники 20–30 мин',
  note:'<b>Парковка у океана платная и заканчивается рано.</b> Приезжай до 10 утра или после 16.'},
 {n:7,title:'Холмы: Гриффит и Голливуд',pill:'на машине',leg:'Griffith Observatory — 30–45 мин от центра',
  note:'<b>К обсерватории вечером очередь машин.</b> Паркуйся ниже и поднимись пешком — быстрее.'},
 {n:8,title:'Малибу и вылет домой',pill:'финал',leg:'Малибу → LAX, 1 ч · сдать машину в аэропорту',
  note:'<b>Заложи час на сдачу машины и шаттл.</b> Терминалы в LAX разнесены, и переезд между ними занимает время.'}
];

const P=[
 {id:'jfk',d:1,base:'nyc',cat:'transport',lat:40.6413,lng:-73.7781,nm:'John F. Kennedy International Airport (JFK)',q:'JFK Airport, New York',tag:['прилёт','t-easy'],
  why:'Сюда прилетаешь. AirTrain до станции Jamaica, дальше метро — около часа до Мидтауна.'},
 /* СНАЧАЛА ХАЙ-ЛАЙН, ПОТОМ ТАЙМС-СКВЕР: из аэропорта человек въезжает с юга, и
    парк на эстакаде оказывается по дороге. По-старому он сначала поднимался в
    мидтаун, потом спускался обратно вниз и снова возвращался ночевать — 1,7
    лишних километра. Таймс-сквер и без того «первый вечер»: ему конец дня */
 {id:'hig',d:1,base:'nyc',cat:'town',lat:40.7480,lng:-74.0048,nm:'The High Line',q:'The High Line, New York',tag:['вечер','t-easy'],star:1,
  why:'Парк на бывшей эстакаде железной дороги: два километра над улицами, вид на Гудзон.'},
 {id:'tsq',d:1,base:'nyc',cat:'town',lat:40.7580,lng:-73.9855,nm:'Times Square',q:'Times Square, New York',tag:['первый вечер','t-easy'],
  why:'Не самое красивое место города, но вечером первого дня оно работает: свет, толпа, ощущение, что приехал.'},
 {id:'cen',d:2,base:'nyc',cat:'nature',lat:40.7829,lng:-73.9654,nm:'Central Park',q:'Central Park, New York',tag:['утро','t-must'],star:1,
  why:'Заходи с юго-востока и иди наверх: пруд, Bethesda Terrace, лодки. На велосипеде парк проезжается за час.'},
 {id:'met',d:2,base:'nyc',cat:'town',lat:40.7794,lng:-73.9632,nm:'The Metropolitan Museum of Art',q:'Metropolitan Museum of Art, New York',tag:['нужен билет','t-must'],star:1,
  why:'Два миллиона предметов — за раз не обойти. Выбери египетское крыло и европейскую живопись, остальное оставь на другой раз.'},
 {id:'mom',d:2,base:'nyc',cat:'town',lat:40.7614,lng:-73.9776,nm:'The Museum of Modern Art',q:'MoMA, New York',tag:['опция','t-easy'],
  why:'Ван Гог, Матисс, Уорхол в пятнадцати минутах от Центрального парка. По пятницам вечером бывает бесплатно.'},
 {id:'bro',d:3,base:'nyc',cat:'town',lat:40.7061,lng:-73.9969,nm:'Brooklyn Bridge',q:'Brooklyn Bridge, New York',tag:['пешком','t-must'],star:1,
  why:'Иди из Бруклина в Манхэттен: город растёт перед тобой. Утром до девяти на мосту почти пусто.'},
 {id:'dum',d:3,base:'nyc',cat:'town',lat:40.7033,lng:-73.9894,nm:'DUMBO',q:'DUMBO, Brooklyn',tag:['фото','t-easy'],
  why:'Тот самый кадр с мостом в проёме улицы. Рядом набережная, карусель и лучший вид на Манхэттен.'},
 {id:'wtc',d:3,base:'nyc',cat:'town',lat:40.7115,lng:-74.0134,nm:'9/11 Memorial & Museum',q:'9/11 Memorial, New York',tag:['тяжело, но нужно','t-easy'],
  why:'Два бассейна на месте башен и музей под ними. Заложи полтора часа и не планируй на этот вечер ничего громкого.'},
 {id:'sum',d:4,base:'nyc',cat:'town',lat:40.7554,lng:-73.9850,nm:'SUMMIT One Vanderbilt',q:'SUMMIT One Vanderbilt, New York',tag:['на закат','t-must'],star:1,
  why:'Смотровая с зеркальными залами прямо над Центральным вокзалом. Билет по времени, лучший слот — за час до заката.'},
 {id:'gct',d:4,base:'nyc',cat:'town',lat:40.7527,lng:-73.9772,nm:'Grand Central Terminal',q:'Grand Central Terminal, New York',tag:['по пути','t-easy'],
  why:'Вокзал 1913 года с зелёным потолком-небом. Внизу — устричный бар, работающий сто лет.'},
 {id:'lgx',d:5,base:'lax',cat:'transport',lat:33.9416,lng:-118.4085,nm:'Los Angeles International Airport (LAX)',q:'LAX Airport, Los Angeles',tag:['перелёт','t-easy'],star:1,
  why:'Прилетаешь из Нью-Йорка и здесь же берёшь машину: в Лос-Анджелесе без неё расстояния не пройти.'},
 {id:'sam',d:6,base:'lax',cat:'nature',lat:34.0100,lng:-118.4962,nm:'Santa Monica Pier',q:'Santa Monica Pier',tag:['океан','t-must'],star:1,
  why:'Пирс с колесом обозрения и конец шоссе Route 66. Рядом — велодорожка вдоль всего побережья.'},
 {id:'ven',d:6,base:'lax',cat:'town',lat:33.9850,lng:-118.4695,nm:'Venice Beach Boardwalk',q:'Venice Beach, Los Angeles',tag:['рядом','t-easy'],
  why:'Набережная уличных артистов, скейт-парк и каналы в двух кварталах от неё — про них почти никто не знает.'},
 {id:'gri',d:7,base:'lax',cat:'nature',lat:34.1184,lng:-118.3004,nm:'Griffith Observatory',q:'Griffith Observatory, Los Angeles',tag:['закат','t-must'],star:1,
  why:'Обсерватория на холме: отсюда виден и город, и надпись Hollywood. Внутрь бесплатно, парковка платная.'},
 {id:'hol',d:7,base:'lax',cat:'town',lat:34.1016,lng:-118.3269,nm:'Hollywood Walk of Fame',q:'Hollywood Walk of Fame',tag:['раз в жизни','t-easy'],
  why:'Звёзды на тротуаре и Китайский театр. Двадцати минут хватает — дальше интереснее в холмах.'},
 {id:'mal',d:8,base:'lax',cat:'nature',lat:34.0259,lng:-118.7798,nm:'Malibu · El Matador State Beach',q:'El Matador State Beach, Malibu',tag:['перед вылетом','t-must'],star:1,
  why:'Скалы и арки прямо в воде в часе езды по шоссе вдоль океана. Лестница вниз крутая, но недлинная.'}
];

const FOODCITIES=[
 {city:'Нью-Йорк',base:'nyc',q:'New York, NY',lat:40.7580,lng:-73.9855,
  spots:[
   {nm:"Katz's Delicatessen",lat:40.72234,lng:-73.98735,meal:'обед',price:'$$',veg:'кое-что',why:'пастрами с 1888 года, очередь идёт быстро'},
   {nm:'Joe’s Pizza',lat:40.74394,lng:-73.99973,meal:'перекус',price:'$',veg:'вег ok',why:'кусок пиццы стоя, как принято в городе'},
   {nm:'Russ & Daughters',lat:40.75449,lng:-73.99952,meal:'завтрак',price:'$$',veg:'вег ok',why:'бейгл с лососем на Лоуэр-Ист-Сайд'}
  ]},
 {city:'Лос-Анджелес',base:'lax',q:'Los Angeles, CA',lat:34.0522,lng:-118.2437,
  spots:[
   {nm:'Grand Central Market',lat:34.05082,lng:-118.24893,meal:'обед',price:'$$',veg:'вег ok',why:'рынок в центре: от тако до устриц'},
   {nm:'In-N-Out Burger',lat:34.02646,lng:-118.39428,meal:'быстро',price:'$',veg:'кое-что',why:'калифорнийская классика, есть «секретное меню»'},
   {nm:'Bestia',lat:34.03371,lng:-118.22921,meal:'ужин',price:'$$$',veg:'кое-что',why:'столик бронировать за месяц'}
  ]}
];

const LINES=[
 {type:'leg',days:[1],label:'JFK → Манхэттен',pts:[[40.6413,-73.7781],[40.6900,-73.9000],[40.7300,-73.9600],[40.7580,-73.9855]]},
 {type:'leg',days:[5],label:'Нью-Йорк → Лос-Анджелес (перелёт)',dash:'3,6',pts:[[40.7580,-73.9855],[39.5000,-88.0000],[36.5000,-104.0000],[33.9416,-118.4085]]},
 {type:'leg',days:[6],label:'LAX → Санта-Моника',pts:[[33.9416,-118.4085],[33.9800,-118.4600],[34.0100,-118.4962]]},
 {type:'trip',days:[7],label:'Гриффит и Голливуд',dash:'6,7',pts:[[34.0100,-118.4962],[34.0900,-118.3600],[34.1184,-118.3004]]},
 {type:'trip',days:[8],label:'Малибу и обратно',dash:'6,7',pts:[[34.0100,-118.4962],[34.0200,-118.6300],[34.0259,-118.7798]]},
 {type:'leg',days:[8],label:'Лос-Анджелес → LAX',pts:[[34.0522,-118.2437],[34.0100,-118.4962],[33.9800,-118.4400],[33.9416,-118.4085]]}
];

const TRIP_NAME='Нью-Йорк и Лос-Анджелес';
const START='2026-10-03';
const IMGPREF='us_';

const HERO={
  h1:'Нью-Йорк',em:'и Лос-Анджелес',
  sub:'Два города на разных берегах: четыре дня пешком и на метро, перелёт посреди поездки — и три дня на машине у океана.',
  photo:'img/us_bro-l.jpg',alt:'Бруклинский мост',
  capTitle:'Brooklyn Bridge',capSub:'третий день · утром на мосту почти пусто',place:'bro',
  parks:'2',parksCap:'города в поездке'
};

const PHOTO={bro:'jpg',cen:'jpg',dum:'jpg',gct:'jpg',hig:'jpg',met:'jpg',mom:'jpg',sam:'jpg',sum:'jpg',tsq:'jpg',wtc:'jpg'};
const BPHOTO={nyc:'bro',lax:'sam'};

const ALT={};
const ALTNM={};

const ORIGIN={city:'Майами',code:'MIA',ll:[25.7617,-80.1918]};
const AIRPORT={nyc:'JFK',lax:'LAX'};
const AIRPORTNM={JFK:'Нью-Йорк',LAX:'Лос-Анджелес'};
const AIRPORTWAY={JFK:'≈25 км · AirTrain + метро, около часа',LAX:'≈30 км · машина, 30–50 мин'};
/* перелёт ВНУТРИ поездки: из Нью-Йорка в Лос-Анджелес летим, а не едем */
const SEGMENT={nyc:'flight',lax:'flight'};
const TRANSFER={};

const META={
 met:{min:180,price:'$30',best:'к открытию',route:'метро 4/5/6 до 86 St'},
 sum:{min:90,price:'$49',best:'за час до заката',route:'над Grand Central'},
 bro:{min:60,price:'бесплатно',best:'до 9 утра',route:'метро A/C до High St'},
 gri:{min:120,price:'вход бесплатно, парковка $10',best:'закат',route:'на машине, 30–45 мин'},
 mal:{min:120,price:'$12 парковка',best:'отлив',route:'шоссе PCH, 1 ч'},
 sam:{min:120,price:'бесплатно',best:'утро',route:'20–30 мин от LAX'},
 jfk:{min:60},
 tsq:{min:40},
 hig:{min:60},
 cen:{min:90},
 mom:{min:120},
 dum:{min:60},
 wtc:{min:120},
 gct:{min:30},
 lgx:{min:60},
 ven:{min:90},
 hol:{min:45},
};

const BUDGET=[
 {g:'Перелёт',ic:'plane',c:'#5a4bb5',c2:'#3b3080',items:[
   {k:'a1',nm:'Билеты',sub:'Майами → Нью-Йорк · Лос-Анджелес → Майами',per:'person',v:520,est:1},
   {k:'a2',nm:'Перелёт внутри поездки',sub:'Нью-Йорк → Лос-Анджелес',per:'person',v:190,est:1},
   {k:'a3',nm:'Багаж',sub:'три сегмента',per:'person',v:120,est:1}
 ]},
 {g:'Машина',ic:'car',c:'#a1663a',c2:'#6f4227',items:[
   {k:'c1',nm:'Аренда в Лос-Анджелесе',per:'day',rate:65,sub:'только вторая половина поездки'},
   {k:'c2',nm:'Бензин',sub:'~400 км · на всех',v:60,est:1},
   {k:'c3',nm:'Парковки',sub:'океан и холмы · на всех',v:70,est:1}
 ]},
 {g:'Транспорт',ic:'train',c:'#12855e',c2:'#0a6047',items:[
   {k:'m1',nm:'Метро в Нью-Йорке',sub:'на все дни',per:'person',v:36,ok:1},
   {k:'m2',nm:'AirTrain из JFK',sub:'в одну сторону',per:'person',v:9,ok:1}
 ]},
 {g:'Входы и активности',ic:'ticket',c:'#d96a12',c2:'#b0530c',items:[
   {k:'t1',nm:'The Met',sub:'вход',per:'person',v:30,ok:1},
   {k:'t2',nm:'SUMMIT One Vanderbilt',sub:'смотровая',per:'person',v:49,ok:1},
   {k:'t3',nm:'9/11 Museum',sub:'музей',per:'person',v:33,ok:1},
   {k:'t4',nm:'MoMA',sub:'опция',per:'person',v:30,est:1}
 ]},
 {g:'Еда',ic:'food',c:'#12855e',c2:'#0a6047',items:[
   {k:'f1',nm:'Еда и кафе',per:'personday',rate:70,sub:'на человека в день'}
 ]}
];

/* ── ДОРОГИ ПО-НАСТОЯЩЕМУ ── считано road-times.js, руками не править ── */
const ROADS={
 1:{ids:["@nyc","jfk","hig","tsq"],km:[[null,null,2.6,0],[null,null,null,null],[2.6,null,null,2.6],[0,null,2.6,null]],min:[[null,null,35,1],[null,null,null,null],[35,null,null,35],[1,null,35,null]]},
 2:{ids:["@nyc","cen","met","mom"],km:[[null,3.5,3.3,1],[3.5,null,0.6,3],[3.3,0.6,null,2.5],[1,3,2.5,null]],min:[[null,47,44,14],[47,null,8,40],[44,8,null,34],[14,40,34,null]]},
 3:{ids:["@nyc","bro","dum","wtc"],km:[[null,6.6,7.6,5.9],[6.6,null,1.2,1.8],[7.6,1.2,null,3],[5.9,1.8,3,null]],min:[[null,88,101,78],[88,null,16,24],[101,16,null,40],[78,24,40,null]]},
 4:{ids:["@nyc","sum","gct"],km:[[null,0.4,1.1],[0.4,null,0.8],[1.1,0.8,null]],min:[[null,5,14],[5,null,10],[14,10,null]]},
 5:{ids:["@lax","@nyc","lgx"],km:[[null,4499.8,30.6],[4498.5,null,4525.5],[30.1,4526.6,null]],min:[[null,2990,27],[2981,null,3004],[27,3011,null]]},
 6:{ids:["@lax","sam","ven"],km:[[null,26.2,24.6],[26.2,null,4.6],[24.6,4.1,null]],min:[[null,23,26],[23,null,9],[26,8,null]]},
 7:{ids:["@lax","gri","hol"],km:[[null,12.8,10.7],[12.3,null,6.6],[10.4,7,null]],min:[[null,18,11],[17,null,11],[11,12,null]]},
 8:{ids:["@lax","mal"],km:[[null,53.7],[53.5,null]],min:[[null,51],[51,null]]},
};
const ROADLINES={
 "leg|6|33.942,-118.409":"skdnEbpuqUcEe}@uAkBiBMcBjA_@bChAbBdB{ARiDoAiJj@}AlATFhB}Ah@qj@FqD|@oBtBoBfIAvfAcAvIuC|Hg`@`c@q^rX_CbEoBlIqBpCqg@dX}PzLcOpUcX|YpA~CsC`BmAxCyEjb@kE~WEnEbBrHdM~TtFvGpGaDv@vD[{Bp@kBqFrAwe@ha@kB`Fp@t[_C~@{@g@m@tBuZnSc}Az|AhFpIiXzYlBnD",
 "trip|7|34.010,-118.496":"msqnEpzfrUoE`G_B}BmCvCg@q@`F_Ht@cHuEsOO_JiAsG}Sua@ua@gj@{EqJcT}jAiGaf@Uw^{M{{@}HglAGyuAj@uHnGg[vEyrAkDsSqf@}bA}AiGi@mHN}GbF_YoAyKb@_KsFyA_D?aNlFsE@y[cKi]mGoIi@eaAq^}kDF?mDvA?@aE_BSHiyHshBEoBqK{P}~A}Is@yC_FmCyAkIx@eFjD_CtEaA~IcQ`NeEfBwLRm@j@?pAtE|A|@fE{BjECzFJvAhCjEzEkCK_EhAqArMmA",
 "trip|8|34.010,-118.496":"msqnEpzfrUoE`G_B}BmCvCg@q@nK{N\\oB]kBmm@nu@N|AwH~K{BnGuXfa@si@jnAyCdJoBpL}Ll`@gFtIoN|]kE`Ue@~Gh@xLYvLvDvYG|J_Ojk@uDhe@HnHfArGnIlTIdWbG|\\mF`n@EvOtAxKf@vVKbP~EjTnFtJv@jHkG`oA\\fJdC|Mo@d[fArO`BdJFaEh@l@KjAiA`@k@bKgH`l@DpHpBfOoDld@sCpq@t@`m@lAhLnFlStCxGpH|JvCtKjA~b@qDr}@nGdnB{@l`AvCli@Ul^l@|[lEp]nKxk@pCvJ~Nt\\vDrRtAnl@_Atj@TpI",
 "leg|8|34.052,-118.244":"czynEfmupU{BtDvOvNe_@tp@qAz@sCF]rAnZhW~m@xiA~MjKlP`DvBdBpAbGhAfVhEj_@e@fkDfKj{AxHtnEiAlVkNdgAgAlO^jHnBlItd@h_AdCrHnA~ILxIwEpjAkGfZy@jLX~zAjHdcArMj{@Vn^nDfZjVnvAzEvKv^df@~NzWxF|NnA`JcEdF`MjPnEqEbBlCqDnF~BxD}EnF_B}BmCvCg@q@jFuHh@eHsE{Nm@uQsJcUrn@uy@lZwd@l~@w`Cj`@u]~WyQtN{M`ClEtOsJaFiJzMeUlRgMjf@iVdDsFtBwIjCqDd]oWz^o`@bDuHtA_JFaiAfBmHlGiDhFd@rCzBnBtKfAnAtQh@nCnr@hAv@xJwA",
};
const ROADSTEPS={
 "hig>tsq":"{quwFbaubMXsB}ByATw@oJoGxA{ESeGj@gB?eA}AeArEeOmGaEN}@sE{CjCoIFyAmBoAj@gB}j@e`@",
 "@nyc>cen":"opwwFlhqbMyO}EaT_LeUeD{@_AwBp@kn@qa@T{@k@y@sIwG{BuEaD}@eFoNgD_EmAMsAmDqByA^wK",
 "cen>met":"{i|wFhlmbMhCmBz@uFfBmCb@iEfBqBzFbD",
 "met>mom":"et{wF~wlbM|rBjsAwCdJ",
 "@nyc>bro":"opwwFlhqbMx^nIjbAxJpCzA|GV|P|C|CiE~DbCrIWfQlCnCbAbh@ra@xOfElWdStNlIpI~KfBWnd@cn@",
 "bro>dum":"elmwFposbMta@ak@gOc@Os@",
 "dum>wtc":"gzlwFv`rbMNr@fOb@ydA`wAv@rB}AxCPbDrBtNxApAwF`RdA^E~Ch@fA",
 "@nyc>sum":"opwwFlhqbMjLrCdBqF",
 "sum>gct":"}_wwFneqbMxPki@wAwAr@yB",
 "@lax>lgx":"czynEfmupU{BtDvOvNe_@tp@qAz@sCF]rAnZhWhj@zdAvJ|IfLnEhl@|Efg@Efy@fa@lLvDnJl@~fAApn@}B~\\h@vg@YzV|@nkCRbSa@nk@sFdTnAnj@VnLv@nX|DpDhCnAlFVx\\vBtk@xQ~zA\\rMSty@rBhbAOxM_BpJsDdKaa@|q@}DtLcD`THzTzQt}@bB~NCbi@yE~c@Np_@{Bht@{@~BkDxB}o@@yM]qFqGaBq@y@d@TtIaA`GOzShCxj@nAnAxJwA",
 "@lax>sam":"czynEfmupU{BtDvOvNe_@tp@qAz@sCF]rAnZhW~m@xiA~MjKlP`DvBdBpAbGhAfVhEj_@e@fkDfKj{AxHtnEiAlVkNdgAgAlO^jHnBlItd@h_AdCrHnA~ILxIwEpjAkGfZy@jLX~zArI`kAjLns@Vn^nDfZjVnvAzEvKv^df@~NzWxF|NnA`JcEdF`MjPnEqErAjBJv@mDxEpBfD",
 "sam>ven":"msqnEpzfrUoE`G_B}BmCvCg@q@nK{N\\oB]kBpi@cn@hh@sh@boA}~@a@s@_AT",
 "@lax>gri":"czynEfmupUcGjKoU_TsAgDzA@TtAgGzOgIfKwUzRmTv\\_ErK{Npk@uYt{@}Jhg@_Kfu@sJ|Su}DRyIq@_EcG{Fy@{Dz@eFjD_CtEaA~IoHxGyMnHwLRu@~@F|@dF~Bl@xD{BvDAjHrCrFzEkCK_EhAqArMmA",
 "gri>hol":"{{foEjp`qU_D_@_DaCiCxA}CiAiBdA_AQLaDu@{D}EiB?qAl@k@vLSxMoHdJeJl@cGnAwCrGwEjHs@fB`A~DdG|IAlS`kBlAt@vKQZ~pAfHP?jYjLC?f@",
 "@lax>mal":"czynEfmupU{BtDvOvNe_@tp@qAz@sCF]rAnZhW~m@xiA~MjKlP`DvBdBpAbGhAfVhEj_@e@fkDfKj{AxHtnEiAlVkNdgAgAlO^jHnBlItd@h_AdCrHnA~ILxIwEpjAkGfZy@jLX~zArI`kAjLns@Vn^nDfZjVnvAzEvKfa@ri@rSz_@zBjHx@dObEpL[zFyAbDc[l^ep@|_Asi@jnAyCdJoBpL}Ll`@gFtIoN|]kE`Ue@~Gh@xLYvLvDvYG|J_Ojk@uDhe@HnHfArGnIlTIdWbG|\\mF`n@EvOtAxKf@vVKbP~EjTnFtJv@jHkGplAPxJpCzOs@pYfCt]wIjx@|BdVoDld@sCpq@t@`m@lAhLnFlStCxGpH|JvCtKjA~b@qDr}@nGdnB{@l`AvCli@Ul^l@|[lEp]nKxk@pCvJ~Nt\\vDrRtAnl@_Atj@TpI",
};
/* ── конец дорог ── */

/* ── ЕДА НА МАРШРУТЕ ── собрано food-nearby.js по OpenStreetMap ── */
const FOODNEAR={
 1:[{"nm":"Bubba Gump Shrimp Company","lat":40.75723,"lng":-73.98639,"kind":"restaurant","cuisine":"seafood","hours":"Mo-Th 11:00-23:00; Fr-Sa 10:30-00:00; Su 10:30-23:00","near":"tsq","d":114},{"nm":"Pepe Giallo","lat":40.74689,"lng":-74.00503,"kind":"restaurant","cuisine":"italian","hours":"Mo-Fr 11:30-22:30; Sa 12:00-22:30; Su 14:00-22:30","near":"hig","d":125},{"nm":"Gyu-Kaku","lat":40.75909,"lng":-73.98987,"kind":"restaurant","cuisine":"japanese","hours":"Su-Th 11:00-22:00; Fr-Sa 11:00-23:00","near":"tsq","d":387},{"nm":"Empire Diner","lat":40.74718,"lng":-74.00431,"kind":"restaurant","cuisine":"american","hours":"Su-Th 08:00-23:00; Fr-Sa 08:00-24:00","near":"hig","d":100},{"nm":"Taco Bell Cantina","lat":40.75713,"lng":-73.98645,"kind":"fast_food","cuisine":"tex-mex","hours":"Su-We 07:00-04:00; Th-Sa 07:00-05:00","near":"tsq","d":126},{"nm":"Starbucks","lat":40.75666,"lng":-73.98587,"kind":"cafe","cuisine":"coffee shop","hours":"24/7","near":"tsq","d":152},{"nm":"10th Avenue Pizza & Cafe","lat":40.74875,"lng":-74.00317,"kind":"restaurant","cuisine":"pizza","hours":"Mo-Fr 06:00-22:00; Sa 07:00-21:00; Su 09:00-20:00","near":"hig","d":161},{"nm":"Brooklyn Deli","lat":40.75705,"lng":-73.98697,"kind":"restaurant","cuisine":"burger","hours":"Mo-Th,Su 07:00-20:00; Fr-Sa 07:00-23:00","near":"tsq","d":163},{"nm":"Brooklyn Diner","lat":40.75651,"lng":-73.98577,"kind":"restaurant","cuisine":"diner","hours":"Mo, Su 08:00-23:00; Tu-Sa 08:00-24:00","near":"tsq","d":167},{"nm":"Olive Garden","lat":40.75947,"lng":-73.98477,"kind":"restaurant","cuisine":"italian","hours":"Su-Th 11:00-00:00; Fr-Sa 11:00-01:00","near":"tsq","d":175},{"nm":"Haru Sushi","lat":40.75723,"lng":-73.98732,"kind":"restaurant","cuisine":"sushi","hours":"Mo-Th, Su 11:00-22:00; Fr, Sa 11:00-23:00","near":"tsq","d":176},{"nm":"Sushi By Bou","lat":40.75849,"lng":-73.98325,"kind":"restaurant","cuisine":"sushi","hours":"Mo-Fr 09:00-18:00","near":"tsq","d":197},{"nm":"Bar Mexicana","lat":40.75613,"lng":-73.98481,"kind":"restaurant","cuisine":"mexican","hours":"Mo-Su 11:30-21:00","near":"tsq","d":217},{"nm":"Dallas BBQ","lat":40.75696,"lng":-73.98872,"kind":"restaurant","cuisine":"barbecue","hours":"Su-Th 11:00-24:00; Fr,Sa 11:00-01:00","near":"tsq","d":295}],
 2:[{"nm":"Beyond Sushi","lat":40.76331,"lng":-73.9772,"kind":"restaurant","cuisine":"sushi","hours":"Mo-Su 11:30-21:30","near":"mom","d":215},{"nm":"Fogo de Chão","lat":40.76115,"lng":-73.97792,"kind":"restaurant","cuisine":"brazilian","hours":"Mo-Th 23:30-22:30, Fr 11:30-23:00, Sa 11:30-23:00, Su 11:30-22:00","near":"mom","d":38},{"nm":"The Modern - The Bar Room","lat":40.76108,"lng":-73.97709,"kind":"restaurant","cuisine":"french","hours":"11:30-21:30","near":"mom","d":56},{"nm":"Mozzarella & Vino","lat":40.76196,"lng":-73.97726,"kind":"restaurant","cuisine":"italian","hours":"Mo-Su 11:30-22:00","near":"mom","d":68},{"nm":"Il Gattopardo","lat":40.76161,"lng":-73.97641,"kind":"restaurant","cuisine":"fine dining","hours":"Mo-Fr 12:00-15:00, 17:00-23:00; Sa 11:30-15:00, 17:00-23:00; Su 11:30-15:00, 17:00-22:00","near":"mom","d":103},{"nm":"Starbucks","lat":40.76067,"lng":-73.97865,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 05:30-19:00; Sa-Su 07:00-19:00","near":"mom","d":121},{"nm":"WatchHouse","lat":40.76007,"lng":-73.97665,"kind":"cafe","cuisine":"coffee shop","hours":"Sa, Su 08:00-18:30; Mo-Fr 06:30-18:30","near":"mom","d":169},{"nm":"Blue Willow","lat":40.76302,"lng":-73.97647,"kind":"restaurant","cuisine":"chinese","hours":"Mo-Fr 11:30-22:00; Sa-Su 12:00-22:00","near":"mom","d":204},{"nm":"Astro Restaurant","lat":40.76321,"lng":-73.97824,"kind":"restaurant","cuisine":"greek","hours":"Tu-Sa 06:00-22:30; Su, Mo 06:00-21:30; Jan 1 07:00-22:30; Dec 24 06:00-20:00; Dec 25 06:00-21:30; Dec 31 06:00-20:00","near":"mom","d":208},{"nm":"Menkui Teu","lat":40.76324,"lng":-73.97716,"kind":"restaurant","cuisine":"japanese","hours":"Mo-Fr 11:30-23:00; Sa-Su 11:30-21:00","near":"mom","d":208},{"nm":"Tam Mai Thai","lat":40.76324,"lng":-73.97708,"kind":"restaurant","cuisine":"thai","hours":"Mo-Fr 11:30-15:00, 16:30-22:00; Sa-Su 11:30-22:00","near":"mom","d":210},{"nm":"Pazza Notte","lat":40.76341,"lng":-73.97811,"kind":"restaurant","cuisine":"italian","hours":"12:30-22:30","near":"mom","d":228},{"nm":"Chipotle","lat":40.76361,"lng":-73.97794,"kind":"fast_food","cuisine":"mexican","hours":"Mo-Su 10:45-22:00","near":"mom","d":247},{"nm":"Starbucks","lat":40.76368,"lng":-73.97738,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Th 05:30-23:00; Fr 05:30-24:00; Sa 06:00-24:00; Su 06:00-23:00","near":"mom","d":254}],
 3:[{"nm":"Maman","lat":40.70316,"lng":-73.99131,"kind":"cafe","cuisine":"french","hours":"Mo-Fr 07:30-18:00, Sa-Su 08:00-18:00","near":"dum","d":162},{"nm":"Love and Dough","lat":40.70305,"lng":-73.98747,"kind":"restaurant","cuisine":"italian","hours":"Mo-Su 11:30-23:00","near":"dum","d":165},{"nm":"Em Vietnamese Bistro","lat":40.70269,"lng":-73.9914,"kind":"restaurant","cuisine":"vietnamese","hours":"12:00-16:00,17:30-21:00; Tu off","near":"dum","d":182},{"nm":"Mughlai Indian Cuisine","lat":40.70957,"lng":-74.01272,"kind":"restaurant","cuisine":"indian","hours":"Mo-Th 11:00-14:45, 17:00-21:45; Fr 11:00-14:45, 17:00-22:15; Sa 11:00-22:15; Su 11:00-21:45","near":"wtc","d":222},{"nm":"Pedro's","lat":40.70253,"lng":-73.98655,"kind":"restaurant","cuisine":"mexican","hours":"Mo-We 12:00-22:00, Th-Sa 12:00-24:00, Su 12:00-22:00","near":"dum","d":255},{"nm":"Bluestone Lane","lat":40.70078,"lng":-73.98831,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 07:30-15:30; Sa-Su 07:30-16:00","near":"dum","d":295},{"nm":"One Girl Cookies","lat":40.70337,"lng":-73.99043,"kind":"cafe","cuisine":"bakery","hours":"Su 09:00-19:00; Mo-Sa 08:00-19:00","near":"dum","d":87},{"nm":"Almondine Bakery","lat":40.70336,"lng":-73.99121,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Sa 07:30-18:30; Su 09:00-18:00","near":"dum","d":152},{"nm":"Los Tacos Al Pastor","lat":40.70255,"lng":-73.9875,"kind":"fast_food","cuisine":"mexican","hours":"Mo-Su 09:00-22:00","near":"dum","d":181},{"nm":"Superfine","lat":40.70234,"lng":-73.98747,"kind":"restaurant","cuisine":"american","hours":"Tu 14:00-23:00+; We-Sa 12:00-23:00+; Su 10:30-23:00+","near":"dum","d":195},{"nm":"Morton's The Steakhouse","lat":40.70969,"lng":-74.01393,"kind":"restaurant","cuisine":"steak house","hours":"Mo-Th 11:30-21:00; Fr 16:00-22:00; Sa 17:00-22:00; Su 16:00-21:00","near":"wtc","d":207},{"nm":"Design Cafe Usagi","lat":40.70386,"lng":-73.98695,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 09:00-17:00; Sa-Su 10:00-17:00","near":"dum","d":215},{"nm":"Rim Nam Thai Kitchen","lat":40.70331,"lng":-73.98677,"kind":"restaurant","cuisine":"thai","hours":"Mo-Su 10:30-21:00","near":"dum","d":222},{"nm":"Bill's Bar and Burger","lat":40.70945,"lng":-74.01408,"kind":"restaurant","cuisine":"burger","hours":"12:00-20:00","near":"wtc","d":234}],
 4:[{"nm":"Bubba Gump Shrimp Company","lat":40.75723,"lng":-73.98639,"kind":"restaurant","cuisine":"seafood","hours":"Mo-Th 11:00-23:00; Fr-Sa 10:30-00:00; Su 10:30-23:00","near":"sum","d":235},{"nm":"Adyar Ananda Bhavan","lat":40.74974,"lng":-73.97747,"kind":"restaurant","cuisine":"indian","hours":"Mo-Fr 11:30-15:00,17:00-21:00; Sa-Su 12:00-21:00","near":"gct","d":330},{"nm":"Starbucks","lat":40.75555,"lng":-73.98406,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 06:00-21:00; Sa 07:30-19:00; Su 08:00-16:30","near":"sum","d":81},{"nm":"Café Grumpy","lat":40.75214,"lng":-73.97572,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 06:00-20:00; Sa, Su 07:00-20:00","near":"gct","d":139},{"nm":"Brooklyn Diner","lat":40.75651,"lng":-73.98577,"kind":"restaurant","cuisine":"diner","hours":"Mo, Su 08:00-23:00; Tu-Sa 08:00-24:00","near":"sum","d":140},{"nm":"The Counter","lat":40.75528,"lng":-73.98683,"kind":"restaurant","cuisine":"burger","hours":"Mo-We, Su 11:00-23:00; Th 11:00-24:00; Fr, Sa 11:00-01:00","near":"sum","d":154},{"nm":"Starbucks","lat":40.75666,"lng":-73.98587,"kind":"cafe","cuisine":"coffee shop","hours":"24/7","near":"sum","d":158},{"nm":"Mexicue","lat":40.75411,"lng":-73.98606,"kind":"restaurant","cuisine":"mexican","hours":"Mo-Fr 11:00-23:00; Sa 12:00-23:00; Su 12:00-21:00","near":"sum","d":169},{"nm":"Pera","lat":40.75234,"lng":-73.97938,"kind":"restaurant","cuisine":"mediterranean","hours":"Mo-Fr 11:30-22:30; Sa 17:00-22:00; Su 17:00-21:00","near":"gct","d":188},{"nm":"FIKA Grand Central","lat":40.751,"lng":-73.97654,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 07:00-19:00; Sa 08:00-17:00; Su 09:00-17:00","near":"gct","d":197},{"nm":"Joe Coffee Company","lat":40.75348,"lng":-73.98429,"kind":"cafe","cuisine":"coffee","hours":"Mo-Fr 08:00-20:00; Sa,Su 09:00-20:00","near":"sum","d":222},{"nm":"Zucker's Bagels & Smoked Fish","lat":40.75061,"lng":-73.97682,"kind":"cafe","cuisine":"bagel","hours":"Mo-Fr 07:00-17:30, Sa-Su 07:00-14:30","near":"gct","d":234},{"nm":"Le Pain Quotidien","lat":40.75324,"lng":-73.98458,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 06:00-21:00; Sa-Su 07:00-21:00","near":"sum","d":243},{"nm":"Blue-Park Kitchen","lat":40.75162,"lng":-73.97468,"kind":"restaurant","cuisine":"american","hours":"Mo-Fr 08:00-10:15,11:00-20:00","near":"gct","d":244}],
 5:[{"nm":"Starbucks","lat":33.95676,"lng":-118.3969,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 04:30-22:00; Sa-Su 05:30-22:00","near":"lgx","d":1997},{"nm":"Pret A Manger","lat":33.94372,"lng":-118.41042,"kind":"fast_food","cuisine":"sandwich","hours":"We-Su 11:00-22:00","near":"lgx","d":295},{"nm":"Panda Express","lat":33.94011,"lng":-118.40435,"kind":"fast_food","cuisine":"chinese","hours":"Mo 06:30-22:00;Tu-Fr 07:00-22:00;Sa 08:00-22:00;Su 06:30-22:00;Mo 08:00-14:00;Th-Su 08:00-14:00","near":"lgx","d":417},{"nm":"Saloon Osaka","lat":33.93065,"lng":-118.41672,"kind":"restaurant","cuisine":"sushi","hours":"Tu-Su 17:00-22:00; Mo off","near":"lgx","d":1435},{"nm":"Two Guns Kitchen","lat":33.91979,"lng":-118.41614,"kind":"cafe","cuisine":"coffee","hours":"Mo-Su 07:00-16:00","near":"lgx","d":2525},{"nm":"Jamba","lat":33.94627,"lng":-118.40754,"kind":"fast_food","cuisine":"juice","hours":"05:00-23:00","near":"lgx","d":527},{"nm":"Peet's Coffee","lat":33.9411,"lng":-118.4018,"kind":"cafe","cuisine":"coffee shop","hours":"PH,Mo-Su 05:00-22:00","near":"lgx","d":621},{"nm":"Starbucks","lat":33.92731,"lng":-118.38375,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Fr 04:00-19:00; Sa 05:30-16:00; Su off","near":"lgx","d":2782},{"nm":"Wolfgang Puck Express","lat":33.94136,"lng":-118.39982,"kind":"restaurant","cuisine":"italian","hours":"05:30-22:30","near":"lgx","d":801},{"nm":"Chick-fil-A","lat":33.94598,"lng":-118.40132,"kind":"fast_food","cuisine":"chicken","hours":"Mo-Sa 05:00-19:00; Su off","near":"lgx","d":822},{"nm":"Einstein Bros. Bagels","lat":33.94606,"lng":-118.40127,"kind":"fast_food","cuisine":"bagel","hours":"03:30-20:00","near":"lgx","d":832},{"nm":"Trejo's Tacos","lat":33.94616,"lng":-118.40124,"kind":"fast_food","cuisine":"mexican","hours":"06:00-21:00","near":"lgx","d":840},{"nm":"Sammy’s","lat":33.94153,"lng":-118.40676,"kind":"restaurant","cuisine":"pizza","hours":"Mo-Su 05:30-19:30","near":"lgx","d":161},{"nm":"Benny's Tacos & Rotisserie Chicken","lat":33.96001,"lng":-118.41689,"kind":"restaurant","cuisine":"mexican","hours":"Mo-Su 08:30-22:00","near":"lgx","d":2189}],
 6:[{"nm":"Si! Mon","lat":33.98475,"lng":-118.47037,"kind":"restaurant","cuisine":"american","hours":"Mo-Th 17:00-22:00; Fr-Sa 17:00-00:00; Su 17:00-21:00","near":"ven","d":85},{"nm":"Blue Plate Taco","lat":34.01259,"lng":-118.49592,"kind":"restaurant","cuisine":"mexican","hours":"Mo-Fr 11:30-22:00; Sa-Su 11:00-22:00","near":"sam","d":289},{"nm":"Castanea Sicilian Cafe","lat":33.98827,"lng":-118.47475,"kind":"cafe","cuisine":"italian","hours":"Mo-Su 09:00-18:00","near":"ven","d":605},{"nm":"SUGARFISH by sushi nozawa","lat":34.01539,"lng":-118.49721,"kind":"restaurant","cuisine":"sushi","hours":"Mo-Sa 11:30-22:00; Su 12:00-21:00","near":"sam","d":606},{"nm":"Simmzy's","lat":33.97977,"lng":-118.46594,"kind":"restaurant","cuisine":"burger","hours":"Su 10:00-23:00; Mo-Th 11:00-23:00; Fr 11:00-24:00; Sa 10:00-24:00","near":"ven","d":668},{"nm":"Azulé Taqueria","lat":34.01666,"lng":-118.49698,"kind":"restaurant","cuisine":"mexican","hours":"Mo-Su 11:00-22:00","near":"sam","d":744},{"nm":"Blue Bottle Coffee","lat":33.99188,"lng":-118.47039,"kind":"cafe","cuisine":"coffee shop","hours":"Mo-Su 06:00-19:00","near":"ven","d":769},{"nm":"Tahntawan Thai Kitchen","lat":33.98319,"lng":-118.46087,"kind":"restaurant","cuisine":"thai","hours":"Mo-Su 12:00-15:00,16:30-22:00","near":"ven","d":821},{"nm":"Venice Ramen","lat":33.98321,"lng":-118.46077,"kind":"restaurant","cuisine":"noodle","hours":"Mo-Sa 11:30-14:30,17:00-21:00","near":"ven","d":830},{"nm":"Hillstone Restaurant","lat":34.01758,"lng":-118.49995,"kind":"restaurant","cuisine":"american","hours":"Mo-We,Su 11:30-21:00; Th-Sa 11:30-22:00","near":"sam","d":911},{"nm":"California Pizza Kitchen","lat":34.01776,"lng":-118.49969,"kind":"restaurant","cuisine":"pizza","hours":"Mo-Th & Su 11:00 to 22:00 Fr-Sa 11:00 to 23:00","near":"sam","d":921},{"nm":"The Bungalow","lat":34.01753,"lng":-118.50155,"kind":"restaurant","cuisine":"american","hours":"Mo-Fr 17:00-02:00; Sa 12:00-02:00; Su 12:00-22:00","near":"sam","d":972},{"nm":"T's Thai Restaurant","lat":34.01884,"lng":-118.49779,"kind":"restaurant","cuisine":"thai","hours":"Mo-Th 11:00-22:00, Fr-Sa 11:00-22:30, Su 12:00-22:00","near":"sam","d":994},{"nm":"FIG","lat":34.01811,"lng":-118.50118,"kind":"restaurant","cuisine":"bistro","hours":"Mo-Su 07:00-11:00, Sa,Su 11:30-15:00, Tu-Sa 17:00-22:00","near":"sam","d":1012}],
 8:[{"nm":"Geoffrey's Malibu","lat":34.02521,"lng":-118.7699,"kind":"restaurant","cuisine":"seafood","near":"mal","d":915},{"nm":"Gravina","lat":34.02177,"lng":-118.80222,"kind":"restaurant","cuisine":"italian","near":"mal","d":2117},{"nm":"Paradise Cove Beach Cafe","lat":34.02027,"lng":-118.78714,"kind":"restaurant","near":"mal","d":922}],
};
/* ── конец еды на маршруте ── */
