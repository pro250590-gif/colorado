/* ==========================================================================
   ДАННЫЕ ПОЕЗДКИ — Исландия, юг острова, 6 дней

   ФОРМА ПОЕЗДКИ: круг на машине · прилёт и вылет из ОДНОГО аэропорта ·
   машина берётся и сдаётся в одном месте · три базы вдоль южного берега.
   Это самая простая форма, и она нужна как опора: если сложные маршруты
   собираются, а эта ломается — виноват движок, а не данные.
   ========================================================================== */

const BCOL={rey:'#5a4bb5',vik:'#12855e',hof:'#1d3448'};
const BCOL2={rey:'#3b3080',vik:'#0a6047',hof:'#0f2233'};

const BASES=[
 {id:'rey',name:'Рейкьявик',emoji:'city',nights:2,color:BCOL.rey,lat:64.1466,lng:-21.9426,q:'Reykjavik, Iceland',
  desc:'Самая северная столица: цветные крыши, бассейны с горячей водой и вся еда острова в одном квартале.',
  alt:'Можно ночевать ближе к аэропорту, в Кеблавике, но тогда вечерний город потеряется.'},
 {id:'vik',name:'Вик',emoji:'city',nights:2,color:BCOL.vik,lat:63.4187,lng:-19.0060,q:'Vik i Myrdal, Iceland',
  desc:'Посёлок под ледником у чёрного пляжа: отсюда рукой подать до водопадов и базальтовых скал.',
  alt:'Альтернатива — Хвольсвётлюр в часе западнее: дешевле и ближе к водопадам, но без океана за окном.'},
 {id:'hof',name:'Хёбн',emoji:'city',nights:1,color:BCOL.hof,lat:64.2539,lng:-15.2082,q:'Hofn, Iceland',
  desc:'Городок лангустинов на юго-востоке: сюда едут ради ледниковой лагуны и вида на Ватнайёкюдль.',
  alt:'Можно остановиться прямо у лагуны, но выбор жилья там меньше и дороже.'}
];

/* в самом Рейкьявике машина не нужна, но она нужна на выезды: Золотое кольцо */
const CITYMOVE={rey:'car_trips',vik:'car_all',hof:'car_all'};

const DAY_BASE={1:'rey',2:'rey',3:'vik',4:'vik',5:'hof',6:'hof'};

const DAYS=[
 {n:1,title:'Прилёт, Голубая лагуна и Рейкьявик',pill:'прилёт',leg:'KEF → Рейкьявик ~50 км · 45 мин',
  note:'<b>Машину берём сразу в аэропорту.</b> Голубая лагуна — по дороге в город, но только по билету со временем.'},
 {n:2,title:'Золотое кольцо',pill:'радиально',leg:'~250 км кругом · весь день',
  note:'<b>Это круг на день:</b> Тингвеллир, Гейсир, Гюдльфосс — и обратно в Рейкьявик к вечеру.'},
 {n:3,title:'Южный берег: водопады и чёрный пляж',pill:'переезд',leg:'~190 км · 2 ч 30 мин, с остановками весь день',
  note:'<b>Ветер тут сильнее, чем кажется.</b> Дверь машины держи двумя руками — её отрывает.'},
 {n:4,title:'Каньон, ледник и мысы у Вика',pill:'радиально',leg:'до 80 км в одну сторону',
  note:'<b>На пляже Рейнисфьяра не поворачивайся к океану спиной:</b> волны-подкрадухи уносят людей каждый год.'},
 {n:5,title:'Ледниковая лагуна и Алмазный пляж',pill:'переезд',leg:'~270 км · 3 ч 30 мин',
  note:'<b>Лагуна работает круглосуточно</b> и бесплатна — платить надо только за лодку между льдинами.'},
 {n:6,title:'Обратно в Кеблавик и вылет',pill:'финал',leg:'~450 км · 5–6 ч до KEF · сдать машину',
  note:'<b>Это самый длинный день за рулём.</b> Выезжай на рассвете и заложи два часа запаса до рейса.'}
];

const P=[
 {id:'kef',d:1,base:'rey',cat:'transport',lat:63.9850,lng:-22.6056,nm:'Keflavík International Airport (KEF)',q:'Keflavik International Airport',tag:['прилёт','t-easy'],
  why:'Сюда прилетаешь и здесь же берёшь машину: весь маршрут идёт по кольцевой дороге, и без неё он не существует.'},
 {id:'blu',d:1,base:'rey',cat:'springs',lat:63.8804,lng:-22.4495,nm:'Blue Lagoon',q:'Blue Lagoon, Iceland',tag:['нужен билет','t-must'],star:1,
  why:'Молочно-голубая вода в лавовом поле в двадцати минутах от аэропорта. Билет по времени, купить заранее.'},
 {id:'hal',d:1,base:'rey',cat:'town',lat:64.1417,lng:-21.9266,nm:'Hallgrímskirkja',q:'Hallgrimskirkja, Reykjavik',tag:['вечер','t-easy'],
  why:'Церковь-базальтовая колонна над городом. Наверх идёт лифт: оттуда видны все цветные крыши.'},
 {id:'sun',d:1,base:'rey',cat:'town',lat:64.1475,lng:-21.9224,nm:'Sun Voyager',q:'Sun Voyager, Reykjavik',tag:['закат','t-easy'],
  why:'Стальной корабль-скелет на набережной. Летом в полночь тут светло, зимой отсюда ловят северное сияние.'},
 {id:'thi',d:2,base:'rey',cat:'nature',lat:64.2559,lng:-21.1300,nm:'Þingvellir National Park',q:'Thingvellir National Park',tag:['ЮНЕСКО','t-must'],star:1,
  why:'Разлом между Северной Америкой и Евразией и место первого парламента 930 года. Плиты расходятся на два сантиметра в год.'},
 {id:'gey',d:2,base:'rey',cat:'nature',lat:64.3104,lng:-20.3024,nm:'Geysir · Strokkur',q:'Geysir, Iceland',tag:['каждые 8 мин','t-easy'],star:1,
  why:'Строккюр бьёт на 20–30 метров каждые 5–10 минут. Стой с наветренной стороны, иначе окатит кипятком.'},
 {id:'gul',d:2,base:'rey',cat:'nature',lat:64.3271,lng:-20.1199,nm:'Gullfoss',q:'Gullfoss waterfall',tag:['главный водопад','t-must'],star:1,
  why:'Два каскада уходят в ущелье под прямым углом. В солнечный день над водой стоит радуга.'},
 {id:'sel',d:3,base:'vik',cat:'nature',lat:63.6156,lng:-19.9886,nm:'Seljalandsfoss',q:'Seljalandsfoss',tag:['зайти за воду','t-must'],star:1,
  why:'Водопад, за который можно зайти: тропа идёт по кругу за стеной воды. Промокнешь — это часть аттракциона.'},
 {id:'sko',d:3,base:'vik',cat:'nature',lat:63.5321,lng:-19.5114,nm:'Skógafoss',q:'Skogafoss',tag:['лестница наверх','t-must'],star:1,
  why:'Шестьдесят метров стены воды. Слева лестница на 527 ступеней — сверху видно, как река уходит к океану.'},
 {id:'sol',d:3,base:'vik',cat:'town',lat:63.4592,lng:-19.3636,nm:'Sólheimasandur plane wreck',q:'Solheimasandur plane wreck',tag:['4 км пешком','t-med'],
  why:'Остов самолёта ВМС США на чёрном песке. Ехать нельзя, только пешком — час туда, час обратно, без тени и укрытия.'},
 {id:'rey2',d:4,base:'vik',cat:'nature',lat:63.4053,lng:-19.0447,nm:'Reynisfjara',q:'Reynisfjara black sand beach',tag:['осторожно','t-must'],star:1,
  why:'Чёрный пляж с базальтовыми колоннами и скалы-тролли в воде. Волны здесь опасны: не подходи к кромке.'},
 {id:'dyr',d:4,base:'vik',cat:'nature',lat:63.4014,lng:-19.1264,nm:'Dyrhólaey',q:'Dyrholaey',tag:['мыс','t-easy'],
  why:'Мыс с каменной аркой в океане и маяком. Летом тут гнездятся тупики; зимой дорогу наверх иногда закрывают.'},
 {id:'fja',d:4,base:'vik',cat:'nature',lat:63.4144,lng:-18.2010,nm:'Fjaðrárgljúfur',q:'Fjadrargljufur canyon',tag:['каньон','t-easy'],star:1,
  why:'Извилистый каньон глубиной сто метров с тропой по краю. Сорок минут от Вика на восток.'},
 /* координата стояла в СЕРЕДИНЕ ЛАГУНЫ, в 3,6 км от ближайшей дороги: точка
    была «озеро», а не место, где человек паркуется и смотрит. Из-за этого
    дорога до неё не считалась вовсе, а счётчик пути предлагал ехать сначала в
    Скафтафелль — 17 «сэкономленных» километров были фантомом.
    Теперь парковка и смотровая у кольцевой (сверено по OpenStreetMap) */
 {id:'jok',d:5,base:'hof',cat:'nature',lat:64.0481,lng:-16.1799,pin:'парковка и смотровая у дороги, а не середина лагуны',nm:'Jökulsárlón',q:'Jökulsárlón',tag:['ради этого едут','t-must'],star:1,
  why:'Ледниковая лагуна: айсберги отваливаются от языка ледника и плывут к океану. Тюлени тут же, между льдинами.'},
 {id:'dia',d:5,base:'hof',cat:'nature',lat:64.0428,lng:-16.1780,nm:'Diamond Beach',q:'Breiðamerkursandur',tag:['через дорогу','t-must'],star:1,
  why:'Куски льда, вынесенные обратно на чёрный песок. На рассвете они светятся изнутри — отсюда и название.'},
 {id:'skf',d:5,base:'hof',cat:'nature',lat:64.0276,lng:-16.9750,nm:'Svartifoss · Skaftafell',q:'Svartifoss',tag:['1,5 ч пешком','t-med'],
  why:'Водопад в обрамлении чёрных базальтовых колонн — по дороге к лагуне, подъём около получаса.'},
 {id:'vst',d:6,base:'hof',cat:'town',lat:63.4290,lng:-19.0770,nm:'Vík í Mýrdal',q:'Vik i Myrdal',tag:['по пути назад','t-easy'],
  why:'Остановка на обратном пути: церковь на холме, кофе и последний вид на чёрный берег.'}
];

const FOODCITIES=[
 {city:'Рейкьявик',base:'rey',q:'Reykjavik, Iceland',lat:64.1466,lng:-21.9426,
  spots:[
   {nm:'Bæjarins Beztu Pylsur',meal:'перекус',price:'€',veg:'кое-что',why:'хот-дог-будка 1937 года, очередь всегда'},
   {nm:'Messinn',meal:'ужин',price:'€€€',veg:'кое-что',why:'рыба на сковороде, брать столик заранее'},
   {nm:'Brauð & Co',meal:'завтрак',price:'€€',veg:'вег ok',why:'пекарня с корицей на всю улицу'}
  ]},
 {city:'Вик',base:'vik',q:'Vik i Myrdal, Iceland',lat:63.4187,lng:-19.0060,
  spots:[
   {nm:'Suður-Vík',meal:'ужин',price:'€€€',veg:'вег ok',why:'единственный полноценный ресторан в посёлке'},
   {nm:'Skool Beans',meal:'кофе',price:'€',veg:'вег ok',why:'кофейня в школьном автобусе'}
  ]}
];

const LINES=[
 {type:'leg',days:[1],label:'KEF → Рейкьявик',pts:[[63.9850,-22.6056],[63.9300,-22.4000],[64.0700,-22.1000],[64.1466,-21.9426]]},
 {type:'trip',days:[2],label:'Золотое кольцо',dash:'6,7',pts:[[64.1466,-21.9426],[64.2559,-21.1300],[64.3104,-20.3024],[64.3271,-20.1199],[64.1466,-21.9426]]},
 {type:'leg',days:[3],label:'Рейкьявик → Вик',pts:[[64.1466,-21.9426],[63.9000,-21.2000],[63.6156,-19.9886],[63.5321,-19.5114],[63.4187,-19.0060]]},
 {type:'trip',days:[4],label:'Мысы и каньон',dash:'6,7',pts:[[63.4187,-19.0060],[63.4053,-19.0447],[63.4014,-19.1264],[63.4144,-18.2010]]},
 {type:'leg',days:[5],label:'Вик → Хёбн',pts:[[63.4187,-19.0060],[63.7800,-18.0000],[64.0276,-16.9750],[64.0784,-16.2306],[64.2539,-15.2082]]},
 {type:'leg',days:[6],label:'Хёбн → KEF',pts:[[64.2539,-15.2082],[64.0784,-16.2306],[63.5321,-19.5114],[63.9000,-21.2000],[63.9850,-22.6056]]}
];

const TRIP_NAME='Исландия';
const START='2026-08-20';
const IMGPREF='ic_';

const HERO={
  h1:'Исландия',em:'юг острова за неделю',
  sub:'Круг на машине по южному берегу: Золотое кольцо, водопады, чёрные пляжи и ледниковая лагуна с айсбергами.',
  photo:'img/ic_jok-l.jpg',alt:'Йёкюльсаурлоун',
  capTitle:'Jökulsárlón',capSub:'пятый день · айсберги уходят в океан',place:'jok',
  parks:'3',parksCap:'базы вдоль берега'
};

const PHOTO={blu:'jpg',dia:'jpg',dyr:'jpg',fja:'jpg',gey:'jpg',gul:'jpg',hal:'jpg',jok:'jpg',rey2:'jpg',sel:'jpg',skf:'jpg',sko:'jpg',sol:'jpg',sun:'jpg',thi:'jpg',vst:'jpg'};
const BPHOTO={rey:'hal',vik:'rey2',hof:'jok'};

/* высоты по дням: маршрут идёт по берегу, но заезжает к леднику */
const ALT={1:50,2:180,3:120,4:210,5:60,6:40};
const ALTNM={1:'Рейкьявик',2:'Гюдльфосс',3:'Скоугафосс',4:'Каньон',5:'Лагуна',6:'Дорога в KEF'};

const ORIGIN={city:'Майами',code:'MIA',ll:[25.7617,-80.1918]};
const AIRPORT={rey:'KEF',hof:'KEF'};
const AIRPORTNM={KEF:'Кеблавик'};
const AIRPORTWAY={KEF:'≈50 км · 45 мин на машине до Рейкьявика'};
const SEGMENT={rey:'flight',vik:'car',hof:'car'};
const TRANSFER={vik:{km:190,clean:'2 ч 30',stops:'весь день'},hof:{km:270,clean:'3 ч 30',stops:'весь день'}};

const META={
 blu:{min:150,price:'от €70',best:'по дороге из аэропорта',route:'20 мин от KEF'},
 gey:{min:40,price:'бесплатно',best:'между извержениями',route:'Золотое кольцо'},
 gul:{min:45,price:'бесплатно',best:'солнце после полудня',route:'10 мин от Гейсира'},
 sel:{min:40,price:'парковка 900 ISK',best:'вторая половина дня',route:'у кольцевой дороги'},
 jok:{min:120,price:'бесплатно, лодка от €50',best:'рассвет',route:'у кольцевой дороги'},
 rey2:{min:60,price:'бесплатно',best:'отлив',route:'10 мин от Вика'},
 kef:{min:40},
 hal:{min:40},
 sun:{min:15},
 thi:{min:90},
 sko:{min:40},
 sol:{min:150},
 dyr:{min:45},
 fja:{min:60},
 dia:{min:40},
 skf:{min:120},
 vst:{min:60},
};

const BUDGET=[
 {g:'Перелёт',ic:'plane',c:'#5a4bb5',c2:'#3b3080',items:[
   {k:'a1',nm:'Билеты',sub:'туда-обратно',per:'person',v:640,est:1},
   {k:'a2',nm:'Багаж',sub:'2 стороны',per:'person',v:90,est:1}
 ]},
 {g:'Машина',ic:'car',c:'#a1663a',c2:'#6f4227',items:[
   {k:'c1',nm:'Аренда машины',per:'day',rate:85,sub:'полный привод, на все дни'},
   {k:'c2',nm:'Страховка от пепла и гравия',sub:'на всю поездку',v:120,est:1},
   {k:'c3',nm:'Бензин',sub:'~1 400 км · на всех',v:220,est:1}
 ]},
 {g:'Входы и активности',ic:'ticket',c:'#d96a12',c2:'#b0530c',items:[
   {k:'t1',nm:'Blue Lagoon',sub:'вход по времени',per:'person',v:75,ok:1},
   {k:'t2',nm:'Лодка по лагуне',sub:'между айсбергами',per:'person',v:55,est:1},
   {k:'t3',nm:'Парковки у водопадов',sub:'на всех',v:25,ok:1},
   {k:'t4',nm:'Бассейн в Рейкьявике',sub:'по-исландски, вечером',per:'person',v:10,ok:1}
 ]},
 {g:'Еда',ic:'food',c:'#12855e',c2:'#0a6047',items:[
   {k:'f1',nm:'Еда и кафе',per:'personday',rate:75,sub:'на человека в день'}
 ]}
];

/* ── ДОРОГИ ПО-НАСТОЯЩЕМУ ── считано road-times.js, руками не править ── */
const ROADS={
 1:{ids:["@rey","kef","blu","hal","sun"],km:[[null,47.3,49.8,1.6,1.6],[47.7,null,20.1,46.3,47.5],[50,20.4,null,48.6,49.8],[1.3,45.9,48.4,null,0.9],[1.3,48.1,50.6,1.4,null]],min:[[null,47,51,5,4],[47,null,21,46,46],[50,21,null,49,49],[4,46,49,null,3],[3,47,51,4,null]]},
 2:{ids:["@rey","thi","gey","gul"],km:[[null,47.7,115.3,123.2],[47.5,null,60.5,70.5],[115.2,60.5,null,10.1],[123.1,70.5,10.1,null]],min:[[null,49,104,112],[49,null,59,68],[104,59,null,9],[112,68,9,null]]},
 3:{ids:["@vik","sel","sko","sol"],km:[[null,61.8,34.2,25.8],[61.8,null,30.5,42],[34.2,30.5,null,14.4],[25.8,42,14.4,null]],min:[[null,55,31,38],[55,null,30,53],[31,30,null,29],[38,53,29,null]]},
 4:{ids:["@vik","rey2","dyr","fja"],km:[[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]],min:[[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]]},
 5:{ids:["@hof","jok","dia","skf"],km:[[null,79.4,79.8,136.8],[79.4,null,1.1,58],[79.9,1.1,null,57.5],[136.8,58,57.5,null]],min:[[null,69,69,118],[69,null,4,53],[69,4,null,52],[119,53,52,null]]},
 6:{ids:["@hof","vst"],km:[[null,281.7],[281.7,null]],min:[[null,245],[245,null]]},
};
const ROADLINES={
 "leg|1|63.985,-22.606":"ywneKrhzhCu@qDnDaO_AaG]qLFqtA^qC}K}OlGsN|Tq^pGoOpDgPhEui@x@qCpa@wcJn[_rEd@_`@UagAiB{}@z@oQfTeF~GVzq@|p@dHlD}D}Z}HcUmN}~@vL_JzEBr@qHvHiFp[ge@zSgSrLwTtGqQfMkOv@qDnAn@~UkVhJwAdPu[dFoSbA_IMmELlEcA~HeFnSePt[iJvA_VjVoAo@w@pDgMjOuGpQsLvT{SfSq[fe@wHhFs@pH{ECwL~IlN|~@|HbU|D|ZeHmDup@gp@eIm@gMjD{Do@}BsFcB}QeDifAeCsd@cT{uB}Hqe@uc@_oB{{@}mFea@{vCi_@ixB}LaiAsSy}CoO}wAoo@aaFmGeVyOk]qGyZsBoWwLixCaE{j@cH}e@sN_o@eDoSmMyqBwDoVeQgv@eD}Ts@_c@oJnJhC`DrE|Ma@|JwIbLkEAiBbB_FdJgCZcFpI{DiAeCiDoAnC_IlEkCfPeBd@gBoDfBnDdBe@jCgP~HmEdAkCjInFtTwXpG{@pGeJA}Ff@_BtEr[vPrt@pDpUhJx_B|I`z@fEmIeFmJuDyR{BeW}GsoAaDmXoSi~@aNycAyMsa@cCmNeBwUoGwaBgE_l@cG{b@me@mbC_Jml@uG}p@gh@_qGgIas@gCme@iDaPcGaHsb@qI_CxBiq@bNgAs@_A|Asd@hJuGdFgJwZcPm[gQcm@wa@ag@}IcPoH{WyJgl@}GgN{KoBoYlWkGb@eIaIyL{e@kIiJmnAfKuJcCcKsHoRpcCpAp{@e@`Q_CxReQzj@_Rxc@eCc@P_GeTkU",
 "trip|2|64.147,-21.943":"ksofKvt|dCyByBI|@hBxEpEs[hQpGbRkMzEfLpKa^hC{S\\a_@_B}i@z@qQh_@uoEbc@uuE~Dsv@p@}n@aBugFg@{d@iBm\\oC_UuEcUyUuz@aIcT_GqJkLmL_SmLs@oBgMqEyOoPiGeLqWcq@qXce@uJsUo^irA{PkVgH}Y_BiTfBut@[_YkCoUgF}HoC{IgAwJaAwY}S{_@oEeFaIcCkKtAwA}FcJsN}AaG?m[kFmmAeBc{@cCy~GnAmr@q@kYkFqi@{Cqk@}Jcp@cBaRmEiqAoAqPww@_vEkHujAmS}jAmCyTiA_TiAuw@sAiQeDyTgLq`@gEaWgPoyBcCsx@CsZ|Bg[`Oyz@pCqd@Qc^aAqYaB}QgGwe@wIkd@mUsgB{G{zAv@yUrGoh@rIqvArHoo@Hsk@fBsd@cAumAgCuf@nCkl@@_U}AwUcI{t@}Ieg@e`@u}AsHq^qOiz@yFun@iU_v@cNwj@uDuFgNcIsPq\\gIyJqFuNuP_M{GmPcXggBiV{{@_FgTkG{a@}FmTf@}Bc@sLd@g_@aCa_@{@sBm@dAVhEzBhCpAbQ_@zh@`@vFm@hCkKwWs[_^iP}`@iRiX_Rmn@eg@itAgKqk@wBaWJkt@nKou@pDqFdGi@rFwEvP_h@xTmX`Sml@|Q}Z~BqI`BoNd@cp@hIeX\\}TlA}IrCqEvR}JpLoUvC_A`JxA`KtGtMOf\\|W~J~BlO{@zKhHzBxEtArHx@x[~Dd[lDdi@`CvKvFlG~l@lMlMuFnoAmoAhi@st@bH{NbGiTnDkUhBwV\\og@kFuxBc@e|@nA}p@xA{ZrNs~B`F{fAb@ef@Ue`@aAw_@eCmb@kMahAwHa~@oHqkBqJspA{@c^@{u@k@kc@aHedAwBys@bC{iBaBqf@uC}XkL{k@wFga@cEe~@qFse@wCep@_Iai@uBaUeA_^p@cL}AaCoGk[o^wYuFoHyeA}iBi^e|@_JmW_Jw_@_FqdA_@ob@`AufAr]w~CnHeVrLgRdHsElV{ClF_IjDqQp@ia@rFme@`@{P{@kNeK_h@oAoPxEgsBWo\\u@gNaBkNkDiMw]ch@ii@gnAoDeMgC{[qAwrDoEqj@kHg_@_^ez@q^uh@uMq^aTcs@kEiIi]_`@wGaKaFkMc|@ecEgAcQWmTHcl@v@}VpBkUtHah@bFm_AnKer@|AaYWk[_Gcp@wBy_AsCeVqHiUoIeQqn@ar@_cBs_A{MwM}EoMuC}Ms`@ulCwHmSuAeIgKwsBs@wi@fEw{@tIkn@zB_XhWs_IzGi_BB_mAu@kNcBqKqz@oqBcK_o@yNm^iQuCmi@kt@cMqF_NrDkMdMqFxB}BlEqChMwEbGsEOoVcJqLbBsE{@wD}Dy`@av@uQcs@mZao@yLaNaA`Lc@j^eCxVeC~LRvGsFl_@{BzHkAnMmEtFkGuHyFDuDjMXzl@nBzHjDrF`BxLQvBkH~LeH|@qBnRsKxJsEhMaHj[wFxDqGnPq@pE?pQ}CnVcR|h@wAr`@cDxGyBdM}HfIsKxc@}El\\gPdm@wJ`XeFvSkEnGcF|N]xT{BfRkInQmMva@_CnOcO`m@sBrWeKpS{BdMOtLmEjUcGnS{AvK{E`Is@pIwBnGsGnEoC|QsD~MOlHmChHIfMmBtEyF|E}Mfd@{DtEg@bLmAPi@`C]bXmG|DqD`GuCja@kFlUgEzBo@nMiDhKq@hGWlL_CfCyAvKeGpK~B|SeANoEuF_@nAZlNuCzEWdDfAfM[xGiChJa@`KiIxd@oA`^{Frf@?|HpArJsBlb@rAnVKbKsCtFuB`J}B~a@}CpCjClMFtK_AlRyB`GPzSuAfGcCzX?~JqBnLR~JwArR\\rGkClQfAhNy@l@GzFcChG{@vJkDvFOnKwBxNtAhVgA`Kj@hR_Ez]qBKaB|L`BdZO`NaBfKYvYh@dLeLnv@k@pINtIo@`LhAbX_@fXqBdLeAXAx_@iEvLgDzy@mJvdAHlQgCnZItP~@jDvAv{@nGnf@s@`[xDzXxAnUUxSpCzZo@`RdC~R?dV~BrVP`QzFrj@lAzc@a@hT|CzXThVbAvIlEbhAlC|W~@~c@`@xiApAnOpAxk@B~g@n@bH_BjQfBbM`@~LyAtKOdR{AhN|BbYC`QxArZcBt`@pAjJPziAxAvZk@pGHdl@lBzVa@nr@z@~[mAzStAra@a@xY~AhR?f}@p@l_@`CpNXlIyBfr@vElj@Er[zBrROzCoCbGAvJbAfNs@jQ`C|QWxIlBzTAdOhAzIgAf\\|Dx`@_A|O~@pLvAxBxA`JGtKr@~JsA~O\\xHi@nU`AlOhCvOy@zNe@|j@zCb_@PzL`DhOsBr^h@f[t@vGoAnGjBzJ[fKlAzKy@v[fDvb@FrRpDdUPj_@r@hNaDzUb@~VrDh^s@|Dr@pKm@xRsDpWz@nHSdUf@lTu@vWjAdP?lO}IllAbD~XXfv@k@pJ{HvLw@`J|H\\fC~D`D^hExPfPpKlFyA|HqKvGyEpFi@~FzAfTvZz[lWjKbQlPd_@hMzHfIu@zGmFdVsk@lJ_MdKmG`KkA`VpAzOyAtSdDlQvK~`@|g@fTjMjK~KvPd\\fNvj@|DvKxJnMdItCpEDlJwD`RmZpJmClGxDta@|d@dInArH}FjIoSvCcDbVqQpHmA|K`ExKx]pFbKxJxGvH`@|GiCrJiLvG{MzJw\\lEu@~CgE`Ci@rNrArCoGdMkDrDnDdHRvLjK|CJbRzPvHzR~DhRjJfZ|DxU|Lp`@bB`UbF`ZjB~r@zCna@yApc@bBhIfE|FxDjKbIja@jFxM[dAyDqAiIxTiHlAoDhGBnOfAtFxDnCv@fGl@tUvE`^vBbJlLlPnPfEtHqDtYrVpOjTfM~BdArYnJzl@pi@xzA~Qln@hRhXhP|`@r[~]rKjX|FlTjGza@~EfThVz{@fV~`B~B|J~FdLlOpKpFtNfIxJrPp\\jRxM~Rlv@~Qhm@xFtn@pOhz@vp@duCtG|e@`Gbq@N|TwCfn@fCth@fA~`AkBhq@Dhf@cIxt@sIpvAsGnh@w@xUzGzzAlUrgBvIjd@fGve@`B|Q`ApYPb^qCpd@aOxz@}Bf[BrZbCrx@fPnyBfE`WfLp`@dDxTrAhQhAtw@hA~SlCxTlS|jAjHtjAvw@~uEnApPlEhqAbB`R|Jbp@zCpk@jFpi@p@jYoAlr@bCx~GdBb{@jFlmA?l[|A`GbJrN^zJlHeDbMfC~D|DlRl]|ApJpB|\\lL~\\zAnN@j^s@lUq@tCTxVxA`OnHnZ~PlVdFpSJbDlRrp@hK~W^hD`GdGhPbZz\\vz@`GhJn[vWdQvHzMnM`JrNlHhStVf}@pEtWlD`b@n@jWnBjsFcAjaAgEbs@ob@jqE_^diEmAzXtAfj@_@`\\gB`PmC`LoMp`@_Rxc@eCc@P_GeTkU",
 "leg|3|64.147,-21.943":"ksofKvt|dCyByBI|@hBxEpEs[hQpGbRkMzEfLpKa^xBkPt@_X[{\\kAsVz@qQh_@uoEbc@uuE~Dsv@p@}n@aCuvG`@yGnCyGnOaGtTaQbOqCz[zB~T_OhEqGvEmLxBi\\lL{|@fAeAnAyObIcj@`Ho_@fU_bArDcd@zAeaA`Cm`@xE{f@|~@ebF~j@wpDvGsj@vBs[`EymAlFc_Axs@ivHdG{{@tEmqAt@sr@CmwApC}f@zLan@pkAwsEnHyPrLaKvrC}}@pKbBpHbHhWjp@fI|Ijs@`Ffd@bNfuCsd@rHoClKgJ``@wi@bIkMlI{RbMii@`\\aiCrEaR|Vyp@vImNxJyIzq@qSfEoDhCoFhCiM|@kSgEqs@Me]pGwv@rCcKhDwFlPaOjI}Ahc@zC|ZtTpIzBzSqAnQ|D|R_AnKxAxToEzYg@`GfAvBqc@\\qx@jIufA?ySaCwkADm~@xB}~@`IchBnFwzBdH}bAdRg}AhLqkArGsa@`AgO_@}[yKeeA@w_@|D}Z|KsY~DkPt[}zBdTyqAqIgKuPkFqQf\\ik@xRq]~Fq_AdjAgPbWnBleBoBmeBfPcWp_AejAp]_Ghk@yRpQg\\tPjFpIfKvr@qfEdBcUMsQ{DqYaHqNmbDmjDk{@mq@wq@{r@wkAcqCkb@c{@EsBu@Heg@aeAyTwl@kSwp@f@mkBkGmv@wAu[\\gE}@iFgBoc@{J}zCqAsuAiJalOt@gw@tCc`AuAo~Fu@}UcIueAqCsm@aIqj@{FikAyV}dCq@uUcA}gBX{TvAcOnGiTnSm_@`[ou@|G}L~OyMhW_G`LmFzd@}a@tVe_@tQuh@zGe[zHmm@di@goF~E{ThG_N~Q}UdTiHrHyOdn@ynExLouAtFgc@rm@ktC~Kag@zB_Fj@}H|bA}uEbBqSvAsoAxBgQ`DeMbgBy}CjOa`@nPyYpKcKtX{IjKgSnEyAdGwVfi@u|DfGaZ`HeSjh@w|@`Zew@t]kn@rOw\\b|@ioBha@ekAh|@_{A~s@ccAflAqaDjz@w|AzAaBbDLnjBrOzq@_FfOeEjQoNf}AiaB`v@euAxFiP|{AasGlGq`@hUgrBfKoi@~IiXxx@{oBtSgm@tPop@~n@wyCxLcd@bOk`@zWod@~tAqtAjMcVbMg^j_@{cB_No]aTuZfD}TfMbHBmIClIgMcHgD|T`TtZ~Mn]zUqs@hqAikCvH{VlfA_vF|H_iAfCoUjr@maFvp@qpEvH}bAtEs|AdBsU~Jeq@bx@akElGkuA~Be{@hJoo@zDmcAxIwhAMy{@`G_y@Zsd@lA{VUw^b@yWcD}kApDafAtBiPr]esAnJmg@`mAywJ~AmSDkQoD_}@gAyvBvTcoEuW_]kIjg@aHaD{CfUsI@rIAzCgU`H`DjIkg@tW~\\fX}|FzB_Zf{AooIppAmvKp]kdBjByTpBio@`t@}aJ|D_^`u@}cCvUweAdq@g|ApiBgeBfJ}RjFq[|@qXc@aSiImh@kNyo@aMic@{RccAoEuK{Uu]kCmJgBeNo@_Rs@ipAw@}PkBiPyJ_j@sFu|@_Is]_B{LuIwrAGcRrBkm@pB_HlFoDl@oEqGs]^uSiCge@jA}ZtGiWfK}L`JgBjWlCpQkIji@az@bN}ZrDmExEwAbUtAxOuIpHgL~KoY|CyUrFgNfEwR`@`@`@dDkD~G",
 "trip|4|63.419,-19.006":"inabKb~~rBjD_Ha@eDa@a@gEvRsFfN}CxU_LnYqHfLyOtIyVqA_GfDaNpZe^dl@yJvNkHbGiMzCsVuCoJdDcGpHkDpIyCbO}@nMBhVbEk@|EtBlX`XvRlYjQzKbXvArGaBdMaTla@i\\tVw@ra@eSxHdEfHwCzf@|@tFgBbKJrHwP`BvE@hEkC`BoSf@uFfB{f@}@gHvCyHeEsa@dSuVv@ma@h\\qKnRuGrCq\\iCsPoLsPgWmXaX}EuBcEj@vBj[YrUjGt[m@nEmFnDqB~GsBjm@FbRtIvrA~AzL~Hr]rFt|@xJ~i@jBhPbAbZj@vjA~@dR~ExUzUt]jFfNbQx}@|M`f@bTlcApCxT^pXnCg@`EsGt`@vBfC_DhEoe@jB{m@`MkUv@eEk@w\\wBySIoHt@iK|D}KdNyGdI_ItC}Gt\\i}BdI_w@tI@~FnTh@vGaCpCnBrAdAtEzCh@qG~RMhExArI~AnB\\vIzDrChA{BiAzBkDoEm@{G_BoByAsILiEpG_S{Ci@eAuEoBsA`CqCi@wG_GoTuIAeI~v@u\\h}BuC|GeI~HeNxG}D|Ku@hKHnHvBxSj@v\\w@dEaMjUkBzm@iEne@gC~Cu`@wBaErGoCf@_@qXqCyTcTmcA}Maf@cQy}@kFgN{Uu]gE_RwA_Vk@wjAcAcZkBiPyJ_j@sFu|@iKyg@aJ}rAWoQxBoq@xA}FpFwD~@{DiGc]XsUiCge@jA}Z~D_RdGgLlI}FrGe@dSrCxOsEnJ_Kpb@cr@zPw^~FgDnX`AbHwCnGiG`FkI~KoY|CyU~HgTjDsSrBw\\s@_G_GchGcIsoC_C{g@kWcaDcCoSa|@mpDmEsWkCi[}@o]c@ibAfCklDCkv@gCslBiGe`BaSqzC}Ea`AeDi}@eGamCyCi{@mHewA_Hs_AqKejAsI{t@oLo{@mOi_AiUmjAu`@maBeSkaA{q@ihEePwr@wSmq@}p@cbBoy@acCi[yt@qW_h@m`@en@sa@gh@{f@mf@gl@}e@ah@et@qV_SZcP~EkYb`@oaBxF_MlTsUgCsw@`AeVyGcs@mH{hBjC}WlLwi@vIidAzBoF~`@gJjKcTrYgdBns@cOlSm{@h@yFk@aDjAq@",
 "leg|5|63.419,-19.006":"inabKb~~rBjD_HcAgEbDsc@s@_G_GchGcIsoC_C{g@qZwqDiF{W}v@o_DiEiYuBgZaAqk@OkaAfCexDgBasBoHosBaSqzC}Ea`AeDi}@kIkjDmEeeAeH}jAySq~BsLgaA_QyiAm[kaBeo@gpCyTcoAw]}}B{J_f@kNki@kSom@gk@gvAoy@acCi[yt@qW_h@m`@en@sa@gh@{f@mf@gl@}e@ah@et@w[aWaeA}i@uNuA}sBtd@m_Aly@o\\~PkQ`EkSpAaPa@uS_EyVqKkZ}UovCewDy]s^{RkOy\\uQeaAyVgOuGkWeUgV}a@uIuTwNai@isAy`Igo@a`CuiG}nZm_@okAajA}eFoEcLcQoZuUi{@uIwg@kDa]sAq\\wAkuAcAiOaCsMwXoj@gc@iaBuEsHqKiHmDsGcCkKiJos@iFiR}KgK_Mx@OaPrAqOfM{a@nGa[r@o^Ykh@vDu^P_a@tEmVxAcObAae@|DlApDfFrI~UnApg@}DvB|DwBoAqg@sI_VqDgF}DmAcA`e@yAbOuElVQ~`@wDt^Xjh@eAfb@}FhWgMza@sApON`PuQ|GeElGu}BcxDaO{YkGaVm`@i|B{EeOmXwm@qJyGg]LsLgIkF}HkD}PgBsf@gOwvAqEgWkJubAgCir@mC_ZwGg_@oTwuCiDm`BrMgkAdCofAg@qOk]odBqn@waBicA}jEiV_kAo_@u}AyIsd@mE{NqIyQ_PgPeh@_Ra_@aGcJyEsFaH{p@osA_L_NquBmiA}HeKiHgPcFgRaDuRkKsrAgV{`BiIo~@kCev@iC_mDkAqZ{RasAcTcv@oJ{z@mHcjExH{tL}AmfBv@q_@tMy_B~qBstQxDg^lAsUL__@qSe|IcGiq@e{@imGilBujKiIgw@}f@ekKwCirIiCqvA_AojAHmkAjAe~A_A{\\qEka@iHoXuMeUqlCsfBcGmGaEqJmUjl@_I|ZuFp_@yUfuB{FpZ{ATo@sA}@wLqBlHs@{DgAj@wAcFoA`BaE?q@wCp@vC`E?nAaBvAbFfAk@r@zDpBmH|@vLn@rAzAUzFqZxUguBtFq_@~H}ZlUkl@wC}P_AiWp@gd@|CuXboByoF`FkYhDyg@zCkNh`@qx@~HeJ~FeC|lBeXtKoHtHiMjH_W|Lex@hAuLhDiz@xb@ceDhEiQ|DiIf[i_@xcAq_@h\\gObFuGlC}LxN{eB~`AsqGrG}[dLsXhUqYrOwg@rGuL|KaIlQcCfNeGxNoOnQs\\xIsEvBeDlBcPw@yZn@kXhB_Y|E}b@t@gTe@}RgKc}AGmHhAaUQcJeHuf@kGyUeKkOsW{O}NgSip@_iBgNok@}Iop@eoAcjMsDoTq^sxAwuAq_KaCsLuEuL{FaH{GmCqcEau@yGsDcGgIkrAemCqgAicCcs@ulAmr@s|@wGiLwJgW{Joc@ucBwqKiRra@{ByCaC~JqHtLiEnMcDsCyBbAyDy@kDpByNcJ_BdA_GbOyWkJcBjBSxCaIvQoFzBkFba@yCnL}ClFa@fZb@|EeCzIqB~DeUzRgGrCeFsB_D~CkBS}AvDqBtWF`EeArBu@tLcDvKkD~FjD_GbDwKt@uLdAsBGaEpBuW|AwDjBR~C_DdFrBfGsCdU{RpB_EdC{Ic@}E`@gZ|CmFxCoLjFca@nF{B`IwQRyCbBkBxWjJ~FcO~AeAxNbJjDqBxDx@xBcAbDrChEoMpHuL`C_KzBxChRsa@wDge@aBed@wJkiI{Aei@eZ{iDcJyp@qJq`@yK}Y{vAepCo}@irCaFmJeGaFqkDemAaQuLqWy\\ijBgvDaCmM_AkM_C_tApBw_@zHcc@V_RuA_V}Ki}@aCi~@oDyk@mPurAc\\mpA_HsSyr@emAsSog@mNgc@elBofHmDgT}I_~@sKkqAqAgjBfEup@Bk`@wCeWqMmb@yHmc@eHyYaCqSu@oQN_a@pC_j@pMomA~Ioi@tB}Uj@eTKkT_Di]iM{^qKyc@eM_Uy`@sc@aFYeRnGmHeGuR_g@cc@yz@qRmr@aYwb@aVkw@yaAkcCoKcIab@CgViT}VyFiFmFuLaZcDiSuMkkC{OiiCscA}xRsJydA_QadAi~@ktCmLef@mBlBeCi@wDuPg_@iw@kU_fAay@{pEmG_Pkb@oc@aJuBuHhFkVrd@qEzEsEt@{IoEoEIcj@`[kFC{OeQaPk_@oc@{o@ql@cf@kIsKuFoUkoCotPuIew@k@wXfAeX~BcPbGcQf_AmdAnqA}gBn[yIjVA~TkKvXmA`JoLxKe\\lIcHbJZvX`RdJm@~GsFxa@}x@`Zgt@|GwUzJ_g@tFgQlfAgiCdHqKnIq@dOnKnO~UlGhGbMrVxEb\\~CzCb@gBbBHpQvUxYpAtSyCrTv@|`@lSvJvJbFxInA{Dp@jBn@sB",
 "leg|6|64.254,-15.208":"atdgK`hy{Ao@rBq@kBm@hBkAIqPuR}`@mSsTw@uSxCyYqAqQwUgH}@yEc\\cMsVmGiGoO_VeOoKoIp@eHpKmfAfiCuFfQ{J~f@}GvUgUfk@sf@|aA_HrFeJl@wXaRcJ[mIbHyKd\\aJnLwXlA_UjKkV@o[xIoqA|gBg_AldAcGbQ_CbPgAdXj@vXtIdw@joCntPtFnUjIrKpl@bf@nc@zo@`Pj_@zOdQjFBbj@a[nEHzInErEu@pE{EjVsd@tHiF`JtBjb@nc@lG~O`y@zpEjU~eAf_@hw@vDtPdCh@lBmBlLdf@h~@jtC~P`dArJxdArcA|xRzOhiCtMjkCbDhStL`ZhFlF|VxFfVhT`b@BnKbIxaAjcC`Vjw@`Yvb@pRlr@bc@xz@tR~f@lHdGdRoG`FXx`@rc@dM~TpKxc@hMz^~Ch]JjTk@dTuB|U_Jni@qMnmAqC~i@O~`@t@nQ`CpSdHxYxHlc@pMlb@vCdWCj`@gEtp@pAfjBrKjqA|I~}@lDfTdlBnfHlNfc@rSng@xr@dmA~GrSb\\lpAlPtrAnDxk@`Ch~@|Kh}@tA~UW~Q{Hbc@qBv_@~B~sA~@jM`ClMhjBfvDpWx\\`QtLpkDdmAdG`F`FlJn}@hrCzvAdpCxK|YpJp`@bJxp@dZziDzAdi@vJjiI`Bdd@vDfe@iRra@{ByCaC~JqHtLiEnMcDsCyBbAyDy@kDpByNcJ_BdA_GbOyWkJcBjBSxCaIvQoFzBkFba@yCnL}ClFa@fZb@|EeCzIqB~DeUzRgGrCeFsB_D~CkBS}AvDqBtWF`EeArBu@tLcDvKkD~FjD_GbDwKt@uLdAsBGaEpBuW|AwDjBR~C_DdFrBfGsCdU{RpB_EdC{Ic@}E`@gZ|CmFxCoLjFca@nF{B`IwQRyCbBkBxWjJ~FcO~AeAxNbJjDqBxDx@xBcAbDrChEoMpHuL`C_KzBxChRsa@tcBvqKzJnc@vJfWvGhLlr@r|@bs@tlApgAhcCjrAdmCbGfIxGrDpcE`u@zGlCzF`HtEtL`CrLvuAp_Kp^rxArDnTdoAbjM|Inp@fNnk@hp@~hB|NfSrWzOdKjOjGxUdHtf@PbJiA`UFlHfKb}Ad@|R_@hOsFzg@gChc@M~Rr@zUs@~JgC|GcK~FoQr\\yNnOgNdGmQbC}K`IsGtLsOvg@iUpYeLrXsG|[_aArqGyNzeBoBvJaGzIcaBxo@k^dd@cHvVyb@beDiDhz@iAtL}Ldx@sEjQmK|RuKnH}lBdXkJ~EsEjGua@t{@oBfKiDxg@aFjYqkBnfFqE`TgArQg@p_@^~PvChT`FnMbGlGplCrfB~GtJ~FpN|Hp_@jCp[f@pVkAd~AIlkA~@njAhCpvAvChrI|f@dkKhIfw@hlBtjKd{@hmG`DnZpCpe@`RllIM~^mArUyDf^_rBrtQuMx_Bw@p_@|AlfByHztLlHbjEnJzz@bTbv@zR`sAjApZhC~lDjCdv@hIn~@fVz`BnLtwAfEvTrE`OnFhL|HdKpuBliA~K~Mzp@nsArF`HbJxE`_@`Gdh@~Q~OfPzNr^|Jtg@n_@t}Ad]~_Bl|@|uDpn@vaBj]ndBf@pOeCnfAsMfkA|Cd|AzT~yCvGf_@lC~YfChr@jJtbApEfWfOvvAnApa@~AlNbF`MdNvKjGpAtVaApJxGlXvm@zEdOl`@h|BjG`V`OzYl{B~uD~@lDrG_L`VyH~I`AjHnIhFhRhJns@bCjKlDrGpKhHtErHfc@haBdWlf@rDtQbAhOvAjuArAp\\jD`]tIvg@tUh{@bQnZnEbL`jA|eFl_@nkAtiG|nZfo@``ChsAx`IvN`i@tItTfV|a@jWdUfOtGdaAxVx\\tQzRjOx]r^nvCdwDjZ|UxVpKtS~D`P`@jSqAjQaEn\\_Ql_Amy@|sBud@tNtA`eA|i@v[`W`h@dt@fl@|e@zf@lf@ra@fh@l`@dn@pW~g@h[xt@ny@`cCvx@~sBvP~l@jKhe@zq@hhEdSjaAt`@laBhUljAlOh_AnLn{@rIzt@pKdjA~Gr_AlHdwAxCh{@dG`mCdDh}@|E``A`SpzChGd`BfCrlBBjv@gCjlDb@hbA|@n]jCh[dDpS~x@peDnFz\\xYdsDlInhCrBdbAtE`xFgCv^sD~OsFfN}CxUgN`]iLbNoNzDcReB_GfD{Pv^qb@br@_H|HiRtGyXmCcKpFyEhHyDrL{AtIcAbPBvQ|Bh]YrUjGt[m@nEmFnDqB~GsBjm@FbRtIvrA~AzL~Hr]rFt|@xJ~i@jBhPv@|Pr@hpAn@~QfBdNjClJzUt]nEtKzRbcA`Mhc@jNxo@lF`YbBvPVdVyAzXmFlXeIfPqiBfeBeq@f|AwUveAau@|cC}D~]at@|aJqBho@kBxTq]jdBqpAlvKg{AnoI{B~YgX||FuW_]kIjg@aHaD{CfUsI@rIAzCgU`H`DjIkg@tW~\\wTboEfAxvBnD~|@EjQ_BlSamAxwJoJlg@s]dsAuBhPqD`fAbD|kAc@xWTv^mAzV[rd@aG~x@Lx{@yIvhA{DlcAiJno@_Cd{@mGjuAcx@`kE_Kdq@eBrUuEr|AwH|bAwp@ppEkr@laFgCnU}H~hAmfA~uFwHzVckAb`CwNr]iLb`@k_@zcBqPld@aR~Y{lAnjA{Wnd@cOj`@yLbd@_o@vyCuPnp@uSfm@yx@zoB_JhXgKni@iUfrBmGp`@}{A`sGyFhPav@duAg}AhaBkQnNgOdE{q@~EcdBgOoJY{A`Bkz@v|AglApaD_t@bcAi|@~zAia@dkAc|@hoBsOv\\u]jn@aZdw@kh@v|@aHdSgG`Zsi@`|DgFpRaFrFkKfSuXzIqKbKoPxYkO``@cgBx}CaDdMyBfQwAroAcBpSycChdLuFfc@yLnuAen@xnEsHxOeThH_R|UiG~M_FzTei@foF{Hlm@{Gd[uQth@uVd_@{d@|a@aLlFiW~F_PxM}G|La[nu@oSl_@{DjKaCvNcAd^bA|gBp@tUxV|dCzFhkA`Ipj@pCrm@bIteAt@|UtAn~FuCb`Au@fw@hJ`lOpAruAhNzaEQ`EpB|`@rGpx@WftAaA|RzMl_@rDfOz_@x~@?`BdR`]tJzS@tBx@Kjb@b{@vkAbqCvq@zr@j{@lq@lbDljD`HpNlDxUZjUkAnQqs@djEqIgKuPkFqQf\\ik@xRq]~Fq_AdjAgPbWnBleBoBmeBfPcWp_AejAp]_Ghk@yRpQg\\tPjFpIfKeTxqAu[|zB_EjP}KrY}D|ZAv_@xKdeA^|[aAfOsGra@iLpkAeRf}AeH|bAoFvzBaIbhByB|~@El~@`CvkA?xSkItfA]px@wBpc@hL`LtP~b@tOnSl`@rWde@vQzMxM~Tn_@hHdEjK^~CxUjRv^zKxZdHdYhF`[xE`d@lB`]jEneC`JdnBpJxjA~X~hC`G|z@hDbs@fCpaAr@fz@{@`lBVjdApEt~AvEju@bH`u@zSxzApG`o@`FpfAd@jz@kBt~@mFpy@wI~r@uJtg@iIh[se@n{A_l@|dCoTnn@cf@j`AqIpVsJjb@aM~z@sHrv@wEnu@oCp}@\\nXrDpz@G~TcCxp@f@d{@}@z`Bt@vaAvCt`AnHvjAbXvfCd\\p|DfGxh@|P`_AfFrc@vB|j@^zq@pAha@bKzgBvA~l@\\nj@{@|jAPt|AeAje@gExy@eLvhAaCp]gEhaAcBneAZjdA|Bt{@vCbl@lMv|AnAlc@g@nk@wF`dAmB|u@NhmApEjlAnQ`pBHphAhB|n@OxZsAtYqClVwR~lAoCv\\s@zVn@rr@xGhy@nB`i@Fv`@aBrjAj@nZhDjo@D~Q{@dSgB~N{HjVaLtJwYYoJbDkHdGmLfUmBjMa@~PtA~TpId_@bBv_@nBjMzEjItJjCpEjGrHze@tM|YxDfMdFj[fJn_@lGji@~Lfg@tC`HfHzFdEjHdD`Lr@tMs@v]fEhj@\\hQQjScDxb@OpNVpsAlBvt@e@pEwJgFkh@mO_B`CeE~[wDjFcFHkCsCyCeJuIue@eEyJ}FmH}b@}UaVbF_d@oN{^f@sPsAuI~FuHbNuIpDiHuCyK{Q}FiCkhBgIkYrFae@pB_y@p[eeBdNqKaE{q@}p@_HWkKfDqGwAcEbC}Bo@zDvRnBln@f@`wAu@rf@{ZhjE_a@j~I_AvDwBpc@{DnV{ErOmb@hq@P`BhIxI~AlIIzsA\\pL~@`GoD`Ot@pD",
};
const ROADSTEPS={
 "@rey>kef":"ksofKvt|dCyByBI|@hBxEpEs[hQpGbRkMzEfL~GaThE}SfA_OZyUbCcKb@}KfOiSdMef@tLgWpC_PbD_]|BeHfMuGdd@sEvFzApCxD~M|f@tIdKrH]|XwVzEO`GvEfEvJrJjk@lHzW|HjOtb@rg@~Rno@zP|\\~HbZzCwFpCsArcBu\\`_@lItDhFxBhI`Dzf@|Inx@no@p{H~J~q@de@vaCrEp[nE~j@xHvkB`BdUvDpSlN~e@`Kbx@pUjfAnCnWlGllAxBxVfUphAhFz]nEfm@`Mp|ChBjVfH`\\tQj_@rGh[hv@peGfHdx@fQ~mC|Jj`Add@tlCj^lkCby@ncFfK~h@pXdjAzG`_@`Jlv@xLdrAtBfc@hJn}Cf@fuAc@ba@m[rqE_a@j~I_AvDwBpc@{DnV{ErOmb@hq@P`BhIxI~AlIIzsA\\pL~@`GoD`Ot@pD",
 "kef>blu":"ywneKrhzhCu@qDnDaO_AaG]qLFqtA^qC}K}OlGsN|Tq^pGoOpDgPhEui@x@qCpa@wcJn[_rEd@_`@UagAiB{}@dAoR|SeE~GVzq@|p@pK`Eda@qApdAiKvw@sZbe@oBf[eGvt@bFjp@jA|FhCxKzQhHtCtIqDtHcNbEuDzDmA`Iz@WhXoCvSx@fUy@tLnBlMTbPqA|MqG|O_@bH`AzEArEvDhJlLzL`CdFIwFtAkE",
 "blu>hal":"gq{dK```hCuAjEHvFaCeFmL{LwDiJ@sEaA{E^cHpG}OpA}MUcPoBmMx@uLy@gUnCwSViXaI{@{DlAcEtDuHbNuIpDiHuCyK{Q}FiCkhBgIkYrFae@pB_y@p[eeBdNqKaEup@gp@eIm@gMjD{Do@}BsFcB}QeDifAeCsd@cT{uB}Hqe@uc@_oB{{@}mFea@{vCi_@ixB}LaiAsSy}CoO}wAoo@aaFmGeVyOk]qGyZsBoWwLixCaE{j@cH}e@sN_o@eDoS{BeW}GsoAaDmXoSi~@aNycAyMsa@cCmNeBwUoGwaBgE_l@cG{b@me@mbC_Jml@uG}p@gh@_qGgIas@gCme@iDaPcGaHsb@qI_CxBiq@bNgAs@_A|Asd@hJ_H~E}IqZcPm[gQcm@mc@ei@mIkP{E{PwJcl@iDcLiGgHuHc@oYlWmIHuGkI_N{g@yIuGglAvKuJcCcKsHkP~oBaBz`@uA|IcEkDmAbFeQdXa@mF",
 "hal>sun":"ernfKzmydC`@lF{EtDoBuF{R_SeF}Jw@rB",
 "@rey>thi":"ksofKvt|dCyByBI|@hBxEpEs[hQpGbRkMzEfLpKa^hC{S\\a_@_B}i@z@qQh_@uoEbc@uuE~Dsv@p@}n@aBugFuAcu@kEeb@uEcUyUuz@aIcT_GqJkLmL_SmLs@oBgMqEyOoPiGeLqWcq@qXce@uL{Yo\\anA{PkVgH}Y_BiTfBut@[_YkCoUgF}HoC{IgAwJaAwY}S{_@oEeFaIcCkKtAwA}FyLiU]}FT{TkFmmAeBc{@cCy~GnAmr@q@kYkFqi@{Cqk@}Jcp@cBaRmEiqAoAqPww@_vEkHujAmS}jAmCyTiA_TiAuw@sAiQeDyTgLq`@gEaWgPoyBcCsx@CsZ|Bg[`Oyz@pCqd@Qc^aAqYaB}QgGwe@wIkd@mUsgB{G{zAv@yUrGoh@rIqvAhGyf@~@{OKmc@jBiq@gA_aAgCuf@vCgp@q@y]_Fgh@uG}e@wp@euCqOiz@yFun@iU_v@yK{d@cEyJcP{JsPq\\gIyJqFuNuP_M{GmPcXggBiV{{@_FgTkG{a@}FmTf@}Bc@wG^{h@{BiZ{@sBi@r@",
 "thi>gey":"s}dgKb_~_CRzEzBhCpAbQ_@zh@`@vFm@hCkKwWs[_^iP}`@cQ{UeS{p@eg@itAgKqk@{B}YNoq@tJes@vDkHxGy@rFwEvP_h@xTmX`Sml@|Q}Z~BqI`BoNd@cp@hIeX\\}TlA}IrCqEvR}JzMoVnMx@`KtGtMOf\\|W~J~BlO{@zKhHzBxEtArHx@x[~Dd[lDdi@`CvKvFlGzi@jM~MgD`rAyqA|n@s}@~FmPbEuRzCcXfAkVBe\\kFuxBc@e|@nA}p@xA{ZrNs~B`F{fAb@ef@c@}i@yDmy@kMahAwHa~@oHqkBqJspA{@c^@{u@k@kc@aHedAwBys@Ps`@jByo@DmWy@y[}Duc@kL{k@wFga@cEe~@qFse@wCep@_Iai@uBaUeA_^p@cL}AaCoGk[od@}`@ajAupBid@}iA_Kg`@cCuXgDogAn@mmArAcSdXibCxGw\\rP{YdHsElUgCnFsG|DeQhAuf@tFme@R{Mi@gKwKck@oAoPxEgsBWo\\gBiWcCuMkDwIc[ic@ii@gnAoDeMgC{[qAwrDoEqj@kHg_@_^ez@q^uh@uMq^aTcs@kEiIi]_`@wGaKaFkMc|@ecEgAcQWmTHcl@v@}VpBkUtHah@bFm_AnKer@|AaYWk[_Gcp@wBy_AsCeVqHiUoIeQqn@ar@_cBs_A}KyJ}E{KqDqN{`@qmC",
 "gey>gul":"ipogKje|zBqIoVoB{MmJaoBw@kf@jEc_AtIkn@hCo\\zVc{HdHadBDm}@c@sRaBuNqByH_x@ckBcK_o@gMe\\}AoB}OmBwa@qj@",
 "@vik>sel":"inabKb~~rBjD_Ha@eDa@a@gEvRsFfN}CxU_LnYqHfLyOtIcUuAyEvAsDlEcN|Zki@`z@qQjIkWmCaJfBgK|LuGhWkA|ZhCfe@_@tSpGr]m@nEmFnDqB~GsBjm@FbRtIvrA~AzL~Hr]rFt|@xJ~i@jBhPv@|Pr@hpAn@~QfBdNjClJzUt]nEtKzRbcA`Mhc@jNxo@hIlh@b@`S}@pXkFp[gJ|RqiBfeBeq@f|AwUveAis@z~B_CjLww@rxJqBho@kBxTq]jdBqpAlvKgvApzHiFbb@cf@rgKeH~lAMfZlAx_BnD~|@O|TwoAthKoJlg@s]dsAuBhPqD`fAbD|kAc@xWTv^mAzV[rd@aG~x@Lx{@yIvhA{DlcAiJno@qCvaAsGfsAkw@rfE_Kdq@eBrUuEr|AwH|bAwp@ppEkr@laFgCnU}H~hAmfA~uFwHzViqAhkC{Ups@_No]aTuZfD}TfMbHBmI",
 "sel>sko":"e_hcKvw_yBClIgMcHgD|T`TtZ~Mn]zUqs@hqAikCvH{VlfA_vF|H_iAfCoUjr@maFvp@qpEvH}bAtEs|AdBsU~Jeq@jw@sfErGgsApCwaAhJoo@zDmcAxIwhAMy{@`G_y@Zsd@lA{VUw^b@yWcD}kApDafAtBiPr]esAnJmg@`mAywJ~AmSDkQoD_}@gAyvBvTcoEuW_]kIjg@aHaD{CfUsI@",
 "sko>sol":"sbwbKndbvBrIAzCgU`H`DjIkg@tW~\\fX}|FzB_Zf{AooIppAmvKp]kdB|EpQtMpQtFLpN}DxPqAtTlAhQ{@xIeAlBuB~GvBbODjGxJ~EbD",
 "dyr>fja":"_k~aKxcwsBiAzBkDoEm@{G_BoByAsILiEpG_S{Ci@eAuEoBsA`CqCi@wG_GoTuIAeI~v@u\\h}BuC|GeI~HeNxG}D|Ku@hKHnHvBxSj@v\\w@dEaMjUkBzm@iEne@gC~Cu`@wBaErGoCf@_@qXqCyTcTmcA}Maf@cQy}@kFgN{Uu]gE_RwA_Vk@wjAcAcZkBiPyJ_j@sFu|@iKyg@aJ}rAWoQxBoq@xA}FpFwD~@{DiGc]XsUiCge@jA}Z~D_RdGgLlI}FrGe@dSrCxOsEnJ_Kpb@cr@zPw^~FgDnX`AbHwCnGiG`FkI~KoY|CyU~HgTjDsSrBw\\s@_G_GchGcIsoC_C{g@kWcaDcCoSa|@mpDmEsWkCi[}@o]c@ibAfCklDCkv@aAgeAyCmkAiGirAmPkcC}Ea`AeDi}@kHo}CmHsdBgQoaCqPs|A{SkyAuR{fAkl@mgCeSkaAcp@kbE}Qux@wSmq@}p@cbBoy@acCi[yt@qW_h@m`@en@sa@gh@{f@mf@gl@}e@ah@et@qV_SZcP~EkYb`@oaBxF_MlTsUgCsw@`AeVyGcs@mH{hBjC}WlLwi@vIidAzBoF~`@gJjKcTrYgdBns@cOlSm{@h@yFk@aDjAq@",
 "@hof>jok":"atdgK`hy{Ao@rBq@kBm@hBkAIqPuR}`@mSsTw@uSxCyYqAqQwUgH}@yEc\\cMsVmGiGoO_VeOoKoIp@eHpKmfAfiCuFfQ{J~f@}GvUgUfk@sf@|aA_HrFeJl@wXaRcJ[mIbHyKd\\aJnLwXlA_UjKkV@o[xIoqA|gBg_AldAcGbQ_CbPgAdXj@vXtIdw@joCntPtFnUjIrKpl@bf@nc@zo@`Pj_@zOdQjFBbj@a[nEHzInErEu@pE{EjVsd@tHiF`JtBjb@nc@lG~O`y@zpEjU~eAf_@hw@vDtPdCh@lBmBlLdf@h~@jtC~P`dArJxdArcA|xRzOhiCtMjkCbDhStL`ZhFlF|VxFfVhT`b@BnKbIxaAjcC`Vjw@`Yvb@pRlr@bc@xz@tR~f@lHdGdRoG`FXx`@rc@dM~TpKxc@hMz^~Ch]JjTk@dTuB|U_Jni@qMnmAqC~i@O~`@t@nQ`CpSdHxYxHlc@pMlb@vCdWCj`@gEtp@pAfjBrKjqA|I~}@lDfTdlBnfHlNfc@rSng@xr@dmA~GrSb\\lpAlPtrAnDxk@`Ch~@|Kh}@tA~UW~Q{Hbc@qBv_@~B~sAlDbZxDvKbeBdkDpWx\\j\\fRf`DrgArJ~JbaAxxClrAhhCfPxa@pJp`@bJxp@cA|As@|GsF`LOgA",
 "jok>dia":"yk|eKrcwaBNfArFaLr@}GbA}AjHxw@zC}Hf@qEfC\\HsB",
 "dia>skf":"{k{eKprwaBIrBgC]g@pE{C|HfM|uApDns@vJxgIhDlaAfGxk@|dBdrK|I`[xJpT|v@dcAbs@tlApgAhcC|wAxtCtL~G|cEfu@xH~EzGjMxFxX`tAfxJp^rxArDnTdeA|qK~Pl}AtFbZnIr[hp@~hB|NfSp\\bUvDfGzEzNdKnp@PbJiA`UPnL`LvhB]pSsFzg@iB~Xo@jXv@xZmBbPwBdDyIrEoQr\\yNnOgNdGmQbC}K`IsGtLsOvg@eXz]qJpWkFtX_aArqGyNzeBmC|LcFtGi\\fOycAp_@g[h_@}DhIiEhQyb@beDiDhz@iAtL_O~~@iFdP_F|I{FhGeKhE_mBnXgLhLi`@px@{CjNiDxg@aFjYcoBxoF}CtXq@fd@~@hWvC|PmUjl@_I|ZuFp_@yUfuB{FpZ{ATo@sA}@wLqBlHs@{DgAj@wAcFoA`BaE?q@wC",
 "@hof>vst":"atdgK`hy{Ao@rBq@kBm@hBkAIqPuR}`@mSsTw@uSxCyYqAqQwUgH}@yEc\\cMsVmGiGoO_VeOoKoIp@eHpKmfAfiCuFfQ{J~f@}GvUgUfk@sf@|aA_HrFeJl@wXaRcJ[mIbHyKd\\aJnLwXlA_UjKkV@o[xIoqA|gBg_AldAcGbQ_CbPgAdXj@vXtIdw@joCntPtFnUjIrKpl@bf@nc@zo@`Pj_@zOdQjFBbj@a[nEHzInErEu@pE{EjVsd@tHiF`JtBjb@nc@lG~O`y@zpEjU~eAf_@hw@vDtPdCh@lBmBlLdf@h~@jtC~P`dArJxdArcA|xRzOhiCtMjkCbDhStL`ZhFlF|VxFfVhT`b@BnKbIxaAjcC`Vjw@`Yvb@pRlr@bc@xz@tR~f@lHdGdRoG`FXx`@rc@dM~TpKxc@hMz^~Ch]JjTk@dTuB|U_Jni@qMnmAqC~i@O~`@t@nQ`CpSdHxYxHlc@pMlb@vCdWCj`@gEtp@pAfjBrKjqA|I~}@lDfTdlBnfHlNfc@rSng@xr@dmA~GrSb\\lpAlPtrAnDxk@`Ch~@|Kh}@tA~UW~Q{Hbc@qBv_@~B~sAlDbZxDvKbeBdkDpWx\\`QtLpkDdmAdG`F`FlJn}@hrClrAhhCfPxa@pJp`@hFt\\~]~}DzAdi@vJjiIvEh_A|Dp[x_Bh`KvGl[dJlXlKdSlr@r|@bs@tlApgAhcC|wAxtCtL~G|cEfu@xH~EdFvIxFbUvuAp_Kp^rxArDnTdoAbjM|Inp@fNnk@hp@~hB|NfSrWzOdKjOjGxUdHtf@PbJiA`UFlHfKb}Ad@|R_@hOsFzg@gChc@M~Rr@zUs@~JgC|GcK~FoQr\\yNnOgNdGmQbC}K`IsGtLsOvg@iUpYeLrXsG|[_aArqGyNzeBoBvJaGzIcaBxo@k^dd@cHvVyb@beDiDhz@iAtL}Ldx@sEjQmK|RuKnH}lBdXkJ~EsEjGua@t{@oBfKiDxg@aFjYqkBnfFqE`TgArQg@p_@^~PvChT`FnMbGlGplCrfB~GtJ~FpN|Hp_@jCp[f@pVkAd~AIlkA~@njAhCpvAvChrI|f@dkKhIfw@hlBtjKd{@hmG`DnZpCpe@`RllIM~^mArUyDf^_rBrtQuMx_Bw@p_@|AlfByHztLlHbjEnJzz@bTbv@zR`sAjApZhC~lDjCdv@hIn~@fVz`BjKrrA`DtRbFfRhHfP|HdKpuBliA~K~Mzp@nsArF`HbJxE`_@`Gdh@~Q~OfPzNr^|Jtg@n_@t}Ad]~_Bl|@|uDpn@vaBj]ndBf@pOeCnfAsMfkA|Cd|AzT~yCvGf_@lC~YfChr@jJtbApEfWfOvvAnApa@~AlNbF`MdNvKjGpAtVaApJxGlXvm@zEdOl`@h|BjG`V`OzYl{B~uD~@lDrG_L`VyH~I`AjHnIhFhRhJns@bCjKlDrGpKhHtErHfc@haBdWlf@rDtQbAhOvAjuArAp\\jD`]tIvg@tUh{@bQnZnEbL`jA|eFl_@nkAtiG|nZfo@``ChsAx`IvN`i@tItTfV|a@jWdUfOtGdaAxVx\\tQzRjOx]r^nvCdwDjZ|UxVpKtS~D`P`@jSqAjQaEn\\_Ql_Amy@|sBud@tNtA`eA|i@v[`W`h@dt@fl@|e@zf@lf@ra@fh@l`@dn@pW~g@h[xt@ny@`cC|p@bbBvSlq@fWtkAtZxrBxTboAdo@fpCl[jaBlZrvBpRhnB~Gr_AlHdwAxCh{@dG`mCdDh}@|E``A`SpzChGd`BfCrlBBjv@gCjlDb@hbA|@n]jCh[dDpS~x@peDnFz\\xYdsDrK~kDbGvwGgCv^sD~OsFfN}CxUgN`]iLbNoNzDcReB_GfD{Pv^qb@br@_H|HiRtGyXmCmL|GeGfLgDtN{AlSHtSbEk@|EtBlX`XrPfWrPnL~ZhCrGaBdMaT|]gZdDuA|PY`Irb@y@b]^nVjAxIiL`o@gCtW",
};
/* ── конец дорог ── */
