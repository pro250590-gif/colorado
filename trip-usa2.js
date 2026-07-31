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
 {id:'tsq',d:1,base:'nyc',cat:'town',lat:40.7580,lng:-73.9855,nm:'Times Square',q:'Times Square, New York',tag:['первый вечер','t-easy'],
  why:'Не самое красивое место города, но вечером первого дня оно работает: свет, толпа, ощущение, что приехал.'},
 {id:'hig',d:1,base:'nyc',cat:'town',lat:40.7480,lng:-74.0048,nm:'The High Line',q:'The High Line, New York',tag:['вечер','t-easy'],star:1,
  why:'Парк на бывшей эстакаде железной дороги: два километра над улицами, вид на Гудзон.'},
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
   {nm:"Katz's Delicatessen",meal:'обед',price:'$$',veg:'кое-что',why:'пастрами с 1888 года, очередь идёт быстро'},
   {nm:'Joe’s Pizza',meal:'перекус',price:'$',veg:'вег ok',why:'кусок пиццы стоя, как принято в городе'},
   {nm:'Russ & Daughters',meal:'завтрак',price:'$$',veg:'вег ok',why:'бейгл с лососем на Лоуэр-Ист-Сайд'},
   {nm:'Chelsea Market',meal:'обед',price:'$$',veg:'вег ok',why:'рынок еды у Высокой линии'}
  ]},
 {city:'Лос-Анджелес',base:'lax',q:'Los Angeles, CA',lat:34.0522,lng:-118.2437,
  spots:[
   {nm:'Grand Central Market',meal:'обед',price:'$$',veg:'вег ok',why:'рынок в центре: от тако до устриц'},
   {nm:'In-N-Out Burger',meal:'быстро',price:'$',veg:'кое-что',why:'калифорнийская классика, есть «секретное меню»'},
   {nm:'Bestia',meal:'ужин',price:'$$$',veg:'кое-что',why:'столик бронировать за месяц'}
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
 1:{ids:["@nyc","jfk","tsq","hig"],km:[[null,null,0,2.6],[null,null,null,null],[0,null,null,2.6],[2.6,null,2.6,null]],min:[[null,null,1,35],[null,null,null,null],[1,null,null,35],[35,null,35,null]]},
 2:{ids:["@nyc","cen","met","mom"],km:[[null,3.5,3.3,1],[3.5,null,0.6,3],[3.3,0.6,null,2.5],[1,3,2.5,null]],min:[[null,47,44,14],[47,null,8,40],[44,8,null,34],[14,40,34,null]]},
 3:{ids:["@nyc","bro","dum","wtc"],km:[[null,6.6,7.6,5.9],[6.6,null,1.2,1.8],[7.6,1.2,null,3],[5.9,1.8,3,null]],min:[[null,88,101,78],[88,null,16,24],[101,16,null,40],[78,24,40,null]]},
 4:{ids:["@nyc","sum","gct"],km:[[null,0.4,1.1],[0.4,null,0.8],[1.1,0.8,null]],min:[[null,5,14],[5,null,10],[14,10,null]]},
 5:{ids:["@lax","lgx"],km:[[null,30.6],[30.1,null]],min:[[null,27],[27,null]]},
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
 "tsq>hig":"opwwFlhqbM|j@d`@k@fBlBnAGxAkCnIrEzCO|@lG`EsEdO|AdA?dAk@fBRdGyAzEnJnGUv@|BxAYrB",
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
