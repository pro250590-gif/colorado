/* ==========================================================================
   ДАННЫЕ ПОЕЗДКИ — Токио и Киото, 7 дней

   ФОРМА ПОЕЗДКИ: два города · между ними СКОРОСТНОЙ ПОЕЗД · прилетаем в один
   аэропорт, улетаем из другого · машины нет вовсе, всё на метро и поездах.
   Эта форма проверяет то, чего не было ни в одном нашем маршруте: переезд
   поездом между далёкими городами и вылет не оттуда, куда прилетели.
   ========================================================================== */

const BCOL={tok:'#5a4bb5',kyo:'#a1663a'};
const BCOL2={tok:'#3b3080',kyo:'#6f4227'};

const BASES=[
 {id:'tok',name:'Токио',emoji:'city',nights:4,color:BCOL.tok,lat:35.6762,lng:139.6503,q:'Tokyo, Japan',
  desc:'Четыре дня на метро: храмы между небоскрёбами, рынки, кварталы-миры и вид на город с высоты.',
  alt:'Жильё удобнее у Синдзюку, Токио-station или Асакусы: любая ветка метро, до всего 20–30 минут.'},
 {id:'kyo',name:'Киото',emoji:'city',nights:2,color:BCOL.kyo,lat:35.0116,lng:135.7681,q:'Kyoto, Japan',
  desc:'Старая столица: тысяча ворот на горе, бамбуковая роща, деревянные улицы и чайные дома.',
  alt:'Можно ночевать в Осаке и ездить в Киото за 15 минут на поезде — дешевле, но вечерний Киото пропустишь.'}
];

const CITYMOVE={tok:'metro_walk',kyo:'metro_walk'};

const DAY_BASE={1:'tok',2:'tok',3:'tok',4:'tok',5:'kyo',6:'kyo',7:'kyo'};

const DAYS=[
 {n:1,title:'Прилёт и вечер в Синдзюку',pill:'прилёт',leg:'HND → центр: поезд Keikyū, 30–40 мин',
  note:'<b>Карту Suica заведи сразу в аэропорту</b> или в телефоне: ей платят за метро, автобусы и в магазинах.'},
 {n:2,title:'Асакуса, река и Скайтри',pill:'пешком',leg:'метро между кварталами, вдоль реки пешком',
  note:'<b>В храме Сэнсо-дзи с утра пусто,</b> к полудню — толпа. Улица Накамисэ перед ним открывается позже.'},
 {n:3,title:'Сибуя, Харадзюку и парк Ёёги',pill:'пешком',leg:'весь день пешком и на метро',
  note:'<b>Мэйдзи-дзингу открыт с рассвета</b> — самое тихое время. Перекрёсток Сибуи, наоборот, интересен вечером.'},
 {n:4,title:'Рынок, сад и вид сверху',pill:'пешком',leg:'Цукидзи → сад Хамарикю на кораблике',
  note:'<b>На внешнем рынке Цукидзи едят до полудня,</b> дальше закрывается. Кораблик по реке идёт прямо в сад.'},
 {n:5,title:'Синкансэн в Киото',pill:'переезд',leg:'Токио → Киото, синкансэн 2 ч 15 мин',
  note:'<b>Место у окна D или E справа по ходу</b> — в ясный день оттуда видно Фудзи минут пять.'},
 {n:6,title:'Фусими Инари и Гион',pill:'пешком',leg:'поезд 5 мин до Инари, вечером Гион пешком',
  note:'<b>К воротам приходи к семи утра</b> — днём там сплошная очередь. Наверх идти час, но большинство сходит через двадцать минут.'},
 {n:7,title:'Арасияма и вылет из Осаки',pill:'финал',leg:'Киото → KIX: экспресс Haruka, 1 ч 20 мин',
  note:'<b>Багаж оставь в камере хранения на вокзале,</b> тогда бамбуковая роща поместится в последнее утро.'}
];

const P=[
 {id:'hnd',d:1,base:'tok',cat:'transport',lat:35.5494,lng:139.7798,nm:'Haneda Airport (HND)',q:'Haneda Airport, Tokyo',tag:['прилёт','t-easy'],
  why:'Ближний к городу аэропорт: поезд Keikyū довозит до Синагавы за 20 минут, дальше метро куда угодно.'},
 {id:'shi',d:1,base:'tok',cat:'town',lat:35.6938,lng:139.7034,nm:'Shinjuku',q:'Shinjuku, Tokyo',tag:['первый вечер','t-easy'],star:1,
  why:'Неоновые переулки Омоидэ-ёкотё и Голден-гай: крошечные бары на пять человек. Хорошее место для первого вечера.'},
 {id:'sen',d:2,base:'tok',cat:'town',lat:35.7148,lng:139.7967,nm:'Sensō-ji',q:'Senso-ji Temple, Tokyo',tag:['утро','t-must'],star:1,
  why:'Старейший храм города. Приходи к открытию: в семь утра во дворе почти никого, а к полудню там не пройти.'},
 {id:'sky',d:2,base:'tok',cat:'town',lat:35.7101,lng:139.8107,nm:'Tokyo Skytree',q:'Tokyo Skytree',tag:['вид','t-easy'],
  why:'634 метра, самая высокая башня Японии. В ясный день с верхней площадки видно Фудзи.'},
 {id:'ued',d:2,base:'tok',cat:'nature',lat:35.7156,lng:139.7745,nm:'Ueno Park',q:'Ueno Park, Tokyo',tag:['по пути','t-easy'],
  why:'Парк с музеями и прудом в лотосах. В апреле здесь главная сакура города.'},
 /* ДЕНЬ ИДЁТ В ОДНУ СТОРОНУ: святилище открывается с рассветом, Такэсита рядом
    с ним, а перекрёсток хорош вечером — и он же ближе всех к дому. По-старому
    день начинался перекрёстком, шёл на север к святилищу и возвращался назад
    мимо него же: 700 лишних метров и восемь минут пешком по кругу */
 {id:'mei',d:3,base:'tok',cat:'town',lat:35.6764,lng:139.6993,nm:'Meiji Jingū',q:'Meiji Shrine, Tokyo',tag:['на рассвете','t-must'],star:1,
  why:'Синтоистское святилище в лесу из ста тысяч деревьев, посаженных вручную. Открывается с рассветом.'},
 {id:'har',d:3,base:'tok',cat:'town',lat:35.6702,lng:139.7027,nm:'Takeshita Street · Harajuku',q:'Takeshita Street, Tokyo',tag:['рядом','t-easy'],
  why:'Улица подростковой моды и сладостей в двух шагах от святилища — контраст, ради которого сюда и идут.'},
 {id:'sib',d:3,base:'tok',cat:'town',lat:35.6595,lng:139.7005,nm:'Shibuya Crossing',q:'Shibuya Crossing, Tokyo',tag:['вечер','t-must'],star:1,
  why:'Самый людный перекрёсток мира: за одну зелёную волну его переходят до трёх тысяч человек. Смотреть лучше сверху, из окна кафе.'},
 {id:'tsu',d:4,base:'tok',cat:'town',lat:35.6654,lng:139.7707,nm:'Tsukiji Outer Market',q:'Tsukiji Outer Market, Tokyo',tag:['до полудня','t-must'],star:1,
  why:'Внешний рынок остался на месте после переезда аукциона: тамаго на палочке, гребешки на гриле, ножи ручной ковки.'},
 {id:'ham',d:4,base:'tok',cat:'nature',lat:35.6597,lng:139.7626,nm:'Hamarikyū Gardens',q:'Hamarikyu Gardens, Tokyo',tag:['после рынка','t-easy'],
  why:'Сад сёгунов с чайным домом на воде и небоскрёбами по краю. От рынка десять минут пешком, обратно — на кораблике.'},
 {id:'tok2',d:4,base:'tok',cat:'town',lat:35.6812,lng:139.7671,nm:'Tokyo Station · Marunouchi',q:'Tokyo Station',tag:['вечер','t-easy'],
  why:'Кирпичный вокзал 1914 года и подземный город под ним. Завтра отсюда уходит синкансэн.'},
 {id:'shk',d:5,base:'kyo',cat:'transport',lat:35.0213,lng:135.7556,nm:'Kyoto Station',q:'Kyoto Station',tag:['переезд','t-easy'],
  why:'Синкансэн приходит сюда. Вокзал сам по себе достопримечательность: стеклянная воронка на пятнадцать этажей.'},
 {id:'kiy',d:5,base:'kyo',cat:'town',lat:34.9949,lng:135.7850,nm:'Kiyomizu-dera',q:'Kiyomizu-dera, Kyoto',tag:['вечер','t-must'],star:1,
  why:'Храм на деревянной сцене над склоном, построен без единого гвоздя. Дорога к нему — старые улицы Ниннэн-дзака.'},
 {id:'gio',d:5,base:'kyo',cat:'town',lat:35.0037,lng:135.7752,nm:'Gion',q:'Gion, Kyoto',tag:['после заката','t-easy'],
  why:'Квартал чайных домов: деревянные фасады, фонари, иногда — гейко по дороге на встречу. Фотографировать людей тут нельзя.'},
 {id:'fus',d:6,base:'kyo',cat:'town',lat:34.9671,lng:135.7727,nm:'Fushimi Inari-taisha',q:'Fushimi Inari Shrine, Kyoto',tag:['на рассвете','t-must'],star:1,
  why:'Десять тысяч красных ворот вверх по горе. К семи утра — почти пусто, к десяти — сплошной поток.'},
 {id:'nis',d:6,base:'kyo',cat:'town',lat:35.0050,lng:135.7649,nm:'Nishiki Market',q:'Nishiki Market, Kyoto',tag:['обед','t-easy'],
  why:'Крытая улица-рынок длиной четыреста метров: соленья, тофу, сладости из моти. Есть на ходу тут не принято.'},
 {id:'ara',d:7,base:'kyo',cat:'nature',lat:35.0170,lng:135.6710,nm:'Arashiyama Bamboo Grove',q:'Arashiyama Bamboo Grove',tag:['утро','t-must'],star:1,
  why:'Бамбуковая роща на западной окраине. Работает круглосуточно и бесплатно — приходи в семь, пока пусто.'},
 {id:'ten',d:7,base:'kyo',cat:'town',lat:35.0159,lng:135.6737,nm:'Tenryū-ji',q:'Tenryu-ji, Kyoto',tag:['рядом','t-easy'],
  why:'Дзен-храм с садом XIV века у самой рощи: сад сохранился в первоначальном виде семьсот лет.'},
 {id:'kix',d:7,base:'kyo',cat:'transport',lat:34.4342,lng:135.2440,nm:'Kansai International Airport (KIX)',q:'Kansai International Airport',tag:['вылет','t-easy'],
  why:'Улетаем отсюда, а не из Токио: аэропорт стоит на насыпном острове в заливе, экспресс Haruka идёт из Киото 1 ч 20 мин.'}
];

const FOODCITIES=[
 {city:'Токио',base:'tok',q:'Tokyo, Japan',lat:35.6762,lng:139.6503,
  spots:[
   {nm:'Ichiran Shibuya',meal:'обед',price:'¥¥',veg:'кое-что',why:'рамен в кабинке, заказ по бумажке'},
   {nm:'Tsukiji Sushidai',meal:'завтрак',price:'¥¥¥',veg:'кое-что',why:'суши у рынка, очередь с раннего утра'},
   {nm:'Omoide Yokocho',meal:'ужин',price:'¥¥',veg:'кое-что',why:'переулок якитори у Синдзюку'},
   {nm:'Konbin 7-Eleven',meal:'перекус',price:'¥',veg:'вег ok',why:'да, в Японии это правда вкусно'}
  ]},
 {city:'Киото',base:'kyo',q:'Kyoto, Japan',lat:35.0116,lng:135.7681,
  spots:[
   {nm:'Nishiki Market',lat:35.00615,lng:135.76703,meal:'обед',price:'¥¥',veg:'вег ok',why:'рыночная еда на любой вкус'},
   {nm:'Omen Kodaiji',lat:35.00176,lng:135.77986,meal:'ужин',price:'¥¥',veg:'вег ok',why:'удон ручной работы рядом с Гионом'},
   {nm:'% Arabica Kyoto Higashiyama',meal:'кофе',price:'¥¥',veg:'вег ok',why:'кофе с видом на пагоду, очередь'}
  ]}
];

const LINES=[
 {type:'leg',days:[1],label:'HND → Токио',pts:[[35.5494,139.7798],[35.6100,139.7400],[35.6762,139.6503]]},
 {type:'trip',days:[2],label:'Асакуса и Скайтри',dash:'6,7',pts:[[35.6762,139.6503],[35.7148,139.7967],[35.7101,139.8107]]},
 {type:'leg',days:[5],label:'Токио → Киото (синкансэн)',pts:[[35.6812,139.7671],[35.1800,138.6000],[34.9700,137.0000],[35.0213,135.7556]]},
 {type:'trip',days:[6],label:'Фусими Инари',dash:'6,7',pts:[[35.0116,135.7681],[34.9671,135.7727]]},
 {type:'leg',days:[7],label:'Киото → KIX',pts:[[35.0116,135.7681],[34.8000,135.5000],[34.6000,135.3500],[34.4342,135.2440]]}
];

const TRIP_NAME='Токио и Киото';
const START='2026-10-15';
const IMGPREF='ja_';

const HERO={
  h1:'Токио',em:'и Киото',
  sub:'Семь дней без машины: метро, скоростной поезд между городами, храмы на рассвете и рынки до полудня.',
  photo:'img/ja_fus-l.jpg',alt:'Фусими Инари',
  capTitle:'Fushimi Inari-taisha',capSub:'шестой день · к семи утра ворота ещё пустые',place:'fus',
  parks:'2',parksCap:'города в поездке'
};

const PHOTO={ara:'jpg',fus:'jpg',gio:'jpg',ham:'jpg',har:'jpg',kiy:'jpg',mei:'jpg',nis:'jpg',sen:'jpg',shi:'jpg',sib:'jpg',sky:'jpg',ten:'jpg',tok2:'jpg',tsu:'jpg',ued:'jpg'};
const BPHOTO={tok:'sen',kyo:'fus'};

const ALT={};
const ALTNM={};

const ORIGIN={city:'Майами',code:'MIA',ll:[25.7617,-80.1918]};
const AIRPORT={tok:'HND',kyo:'KIX'};
const AIRPORTNM={HND:'Токио',KIX:'Осака'};
const AIRPORTWAY={HND:'≈20 км · поезд Keikyū, 30–40 мин',KIX:'≈100 км от Киото · экспресс Haruka, 1 ч 20 мин'};
/* между городами — поезд: в Японии это быстрее самолёта и без досмотра */
const SEGMENT={tok:'flight',kyo:'train'};
const TRANSFER={kyo:{km:450,clean:'2 ч 15',stops:'поезда каждые 10 минут'}};

const META={
 sen:{min:60,price:'бесплатно',best:'до 8 утра',route:'метро Asakusa'},
 mei:{min:60,price:'бесплатно',best:'на рассвете',route:'станция Harajuku'},
 fus:{min:120,price:'бесплатно',best:'до 8 утра',route:'поезд JR Nara Line, 5 мин'},
 ara:{min:45,price:'бесплатно',best:'до 8 утра',route:'поезд до Saga-Arashiyama'},
 kiy:{min:90,price:'¥400',best:'закат',route:'автобус 206'},
 sky:{min:90,price:'¥2 100',best:'ясный день',route:'метро Oshiage'},
 hnd:{min:60},
 shi:{min:120},
 ued:{min:90},
 sib:{min:30},
 har:{min:60},
 tsu:{min:75},
 ham:{min:60},
 tok2:{min:30},
 shk:{min:20},
 gio:{min:60},
 nis:{min:60},
 ten:{min:60},
 kix:{min:180},
};

const BUDGET=[
 {g:'Перелёт',ic:'plane',c:'#5a4bb5',c2:'#3b3080',items:[
   {k:'a1',nm:'Билеты',sub:'Майами → Токио · Осака → Майами',per:'person',v:1250,est:1},
   {k:'a2',nm:'Багаж',sub:'2 стороны',per:'person',v:120,est:1}
 ]},
 {g:'Транспорт',ic:'train',c:'#12855e',c2:'#0a6047',items:[
   {k:'c1',nm:'Синкансэн Токио → Киото',sub:'в одну сторону',per:'person',v:95,ok:1},
   {k:'c2',nm:'Метро и поезда',sub:'на все дни, карта Suica',per:'person',v:60,est:1},
   {k:'c3',nm:'Поезд из HND и экспресс до KIX',sub:'2 стороны',per:'person',v:45,ok:1}
 ]},
 {g:'Входы и активности',ic:'ticket',c:'#d96a12',c2:'#b0530c',items:[
   {k:'t1',nm:'Tokyo Skytree',sub:'смотровая',per:'person',v:15,est:1},
   {k:'t2',nm:'Kiyomizu-dera',sub:'вход',per:'person',v:3,ok:1},
   {k:'t3',nm:'Tenryū-ji',sub:'сад и храм',per:'person',v:8,ok:1},
   {k:'t4',nm:'Hamarikyū Gardens',sub:'сад и чайный дом',per:'person',v:7,ok:1}
 ]},
 {g:'Еда',ic:'food',c:'#a1663a',c2:'#6f4227',items:[
   {k:'f1',nm:'Еда и кафе',per:'personday',rate:45,sub:'на человека в день'}
 ]}
];

/* ── ДОРОГИ ПО-НАСТОЯЩЕМУ ── считано road-times.js, руками не править ── */
const ROADS={
 1:{ids:["@tok","hnd","shi"],km:[[null,null,6],[null,null,null],[6,null,null]],min:[[null,null,80],[null,null,null],[80,null,null]]},
 2:{ids:["@tok","sen","sky","ued"],km:[[null,null,null,null],[null,null,1.8,2.3],[null,1.8,null,3.9],[null,2.3,3.9,null]],min:[[null,null,null,null],[null,null,24,31],[null,24,null,52],[null,31,52,null]]},
 3:{ids:["@tok","sib","mei","har"],km:[[null,5.7,5.7,5.5],[5.7,null,2.3,1.4],[5.7,2.3,null,1],[5.5,1.4,1,null]],min:[[null,75,76,73],[75,null,30,19],[76,30,null,14],[73,19,14,null]]},
 4:{ids:["@tok","tsu","ham","tok2"],km:[[null,null,null,null],[null,null,1.4,2.3],[null,1.4,null,3],[null,2.3,3,null]],min:[[null,null,null,null],[null,null,18,31],[null,18,null,41],[null,31,41,null]]},
 5:{ids:["@kyo","shk","kiy","gio"],km:[[null,2.1,3.3,1.5],[2.1,null,5.4,3.7],[3.3,5.4,null,1.7],[1.5,3.7,1.7,null]],min:[[null,28,44,20],[28,null,72,49],[44,72,null,23],[20,49,23,null]]},
 6:{ids:["@kyo","fus","nis"],km:[[null,5.6,1.1],[5.6,null,4.9],[1.1,4.9,null]],min:[[null,75,14],[75,null,65],[14,65,null]]},
 7:{ids:["@kyo","ara","ten","kix"],km:[[null,null,null,null],[null,null,0.4,null],[null,0.4,null,null],[null,null,null,null]],min:[[null,null,null,null],[null,null,5,null],[null,5,null,null],[null,null,null,null]]},
};
const ROADSTEPS={
 "sen>sky":"gp~xE__gtYq@FTsFsA{@LoAwAUjCgTfUeg@nAKDo@rFe@FyGy@wC",
 "sky>ued":"ur}xEoyitYd@b@GfB~@AG`I|BJz@zg@xChTgF|Mw@hPeRl_BJjB~@nAw@lAwAm@uCfHqEgBwAzDyBnB",
 "@tok>mei":"c_wxEimjsY?}ApBcBc@gAjDyFr@eFfEmHzJgHwg@umCaKc[aFwJt@q@cEqHk@kB`@a@cHmO`LkI`SiKG}CzAuHvMKU_Lu@B",
 "mei>har":"e}vxEm`tsYt@COgGrA_EvJ[l@qCfBLDi@`HhBdGXeAmC",
 "har>sib":"uyuxEmutsY`Cb@dA~C`Nv@n@_@dRbBzB~A`TZKfBHyA",
 "tsu>ham":"a|txEo}atYtAlB}@~@?xAfLfMdAfCHjD}@bGcAjBzAfBpC_DbFhDzD[`B`C",
 "ham>tok2":"cxsxEck`tY{BaAmFnGuKoJeCm@{L~A_EdEsBwCoBpBgOiN}CtDkDkDuA~@kDaCYp@a\\yQ_Di@}@b@kAtEkD_A",
 "@kyo>shk":"shutEyet{Xa@`s@yNN?r@uMN[f@iOG?`OwGh@a@fD",
 "shk>kiy":"ecwtEowq{X`@gDvGi@JiPnMa@Zmx@bX_AV}Ej@u@tJ]NoHv@I?w@pYkAr@sMxNE^iJtO{ApSrAhCkNxGeOB}DrCeGHcD]D",
 "kiy>gio":"}|qtEkpw{X\\EIbDsCdGC|DyGdOiCjNqSsAuOzA_@nJ",
 "@kyo>fus":"shutEyet{XFqC`SJzXkAlEp@\\s@jDG~GxBjAiC`O`GnMbBd@eDlGlAbT`A`QMj^cDlLxB|OaAlVjClHmEX_BhEoCtWiAVoJfCaBAm@",
 "fus>nis":"qoltEkbu{X@l@gC`BWnJuWhAiEnCY~AmHlEmVkC}O`AmLyBk^bDaQLcTaAmGmAw@vFcw@p@DdK",
 "ara>ten":"wevtEoga{XUqBsA{ApEyBjAsD",
};
/* ── конец дорог ── */
