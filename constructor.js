/* ==========================================================================
   КОНСТРУКТОР МАРШРУТА — заготовка. 28 июля 2026.

   Что это. Не движок и не сайт. Это описание того, ИЗ ЧЕГО собирается любая
   поездка, и правила, которые собранная поездка нарушить не может.
   Файл ничего не рисует и ничего не меняет — его можно запустить и прочитать:
       node constructor.js

   Зачем. Сейчас движок умеет одну форму: прилетел, взял машину, объехал круг,
   улетел. Всё остальное (город на выходные, перелёты между далёкими городами,
   паром, поезд, кемпер) в неё не влезает. Конструктор описывает общий случай,
   а нынешние Колорадо и Юта оказываются его частным случаем — внизу файла они
   разложены на детали целиком и проходят проверку.

   Главное правило разделения, из-за которого всё и затевалось:
     переезд  — человек лёг спать в ДРУГОМ месте. Только здесь меняется машина.
     выезд    — уехал и вернулся в ТО ЖЕ жильё. Машину не трогает. Джип-тур и
                поезд в Силвертон — это выезды, а не переезды.
   ========================================================================== */

/* Файл читается ДВАЖДЫ: `node constructor.js` в терминале и обычным <script>
   на самом сайте — движок проверяет собранную поездку теми же правилами.
   Поэтому всё лежит внутри функции и наружу отдаётся одним именем CONSTRUCTOR:
   иначе имена (check, km, line…) столкнулись бы с именами движка. */
(function(root){

/* ---------- СЛОВАРИ: из чего ИИ выбирает, а не сочиняет ------------------ */

/* чем человек попадает из точки в точку */
const MOVE = {
  car:      'на своей (прокатной) машине',
  flight:   'перелёт',
  train:    'поезд',
  ferry:    'паром',
  bus:      'автобус',
  transfer: 'заказной трансфер',
  driver:   'машина с водителем'
};

/* как человек перемещается ВНУТРИ города — это другое решение, не переезд */
const CITY = {
  metro_walk: 'метро и пешком — машина мешает и стоит денег',
  walk:       'только пешком — компактный центр',
  car_all:    'машина нужна всё время',
  car_trips:  'машина только на выезды, в городе не нужна',
  taxi:       'такси и каршеринг — аренда не окупается'
};

/* где человек проводит ночь */
const STAY = {
  hotel:     'отель',
  apartment: 'квартира',
  camping:   'кемпинг',
  vehicle:   'ночуем в самом транспорте (кемпер)',
  moving:    'ночь в пути — жилья нет, спим в дороге'
};

/* транспортное средство, которое человек берёт и потом отдаёт */
const VEHICLE = {
  rental: 'прокатная машина',
  camper: 'кемпер — он же жильё',
  driver: 'машина с водителем',
  pass:   'проездной на период (железная дорога, городской транспорт)'
};

/* чем человек едет на выезд из города и возвращается тем же вечером */
const TRIP = {
  own:   'на своей машине',
  tour:  'экскурсия с транспортом (джип-тур, автобус)',
  train: 'поезд туда-обратно',
  boat:  'катер или кораблик',
  walk:  'пешком или городским транспортом'
};

/* ---------- ДЕТАЛИ: что можно положить в маршрут ------------------------- */
/* поле со звёздочкой — обязательное */

const PARTS = [
  { k:'point', nm:'Точка',
    what:'Место, где у человека есть время: город, парк, аэропорт.',
    fields:[
      ['id*','короткое имя, по нему ссылаются остальные детали'],
      ['kind*','city — город · airport — аэропорт · park — парк или база вне города'],
      ['name*','как показываем человеку'],
      ['lat*, lng*','координаты — по ним считаем расстояния и рисуем карту'],
      ['city_transport','для города: значение из словаря CITY. У аэропорта не нужно'],
      ['air','код аэропорта, если из этой точки можно улететь'],
      ['why','одной строкой: почему эта точка в маршруте']
    ]},

  { k:'leg', nm:'Переезд',
    what:'Как попасть из одной точки в другую. После переезда человек ночует в другом месте.',
    fields:[
      ['from*, to*','id точек'],
      ['mode*','значение из словаря MOVE'],
      ['day*','день поездки, в который едем'],
      ['km, hours','расстояние и чистое время — считаем сами, у ИИ не спрашиваем'],
      ['with_stops','сколько займёт с остановками — это и есть честное «весь день»'],
      ['weekdays','дни недели, когда переезд вообще существует (паром, поезд). Пусто = каждый день'],
      ['why','почему именно так, а не иначе']
    ]},

  { k:'night', nm:'Ночь',
    what:'Отдельная деталь, а не свойство города. Ночь бывает и без жилья — в автобусе, в поезде, в кемпере.',
    fields:[
      ['n*','номер ночи в поездке, с 1'],
      ['at*','id точки, где ночуем. Для ночи в пути — id переезда'],
      ['stay*','значение из словаря STAY'],
      ['name, link','название жилья и ссылка на бронь. Для ночи в пути пусто']
    ]},

  { k:'vehicle', nm:'Транспортное средство',
    what:'То, что берут и потом отдают. Взять и сдать — два РАЗНЫХ события, в разных местах и в разные дни.',
    fields:[
      ['type*','значение из словаря VEHICLE'],
      ['take*','{ at: id точки, day: номер дня }'],
      ['drop*','{ at: id точки, day: номер дня }'],
      ['why','зачем эта машина вообще нужна']
    ]},

  { k:'daytrip', nm:'Выезд на день',
    what:'Уехали и вернулись в то же жильё. Машину не трогает, жильё не меняет. Джип-тур, поезд-аттракцион, катер.',
    fields:[
      ['at*','id точки, откуда выезжаем и куда возвращаемся'],
      ['day*','день поездки'],
      ['name*','как называется'],
      ['by*','значение из словаря TRIP'],
      ['price_per_person','если это платная экскурсия'],
      ['book','ссылка на бронь — джип-туры и поезда разбирают заранее'],
      ['why','почему стоит потратить на это день']
    ]},

  { k:'place', nm:'Место',
    what:'Точка внимания внутри дня. Никого никуда не перемещает.',
    fields:[
      ['at*','id точки'],
      ['name*','название'],
      ['lat, lng','координаты'],
      ['tag','вид: смотровая, еда, музей, тропа'],
      ['when','утро / день / вечер / по расписанию']
    ]}
];

/* ---------- ПРАВИЛА: то, что собранный маршрут нарушить не может --------- */
/* ОШИБКА — маршрут не показываем клиенту.
   ПРЕДУПРЕЖДЕНИЕ — показываем, но человек должен об этом знать (обычно деньги). */

const RULES = [
  ['E1','Цепочка не рвётся: конец каждого переезда — начало следующего.'],
  ['E2','У каждой точки есть чем приехать и чем уехать. Повисших городов нет.'],
  ['E3','За день человек оказывается там, где ночует: переезды одного дня складываются в один путь (перелёт + дорога из аэропорта — это один день), и он ведёт ровно туда, где эта ночь. Нет переезда — ночь там же, где вчера.'],
  ['E4','Машину нельзя сдать там, где её не брали, и нельзя взять вторую, не сдав первую.'],
  ['E5','Переезд «на своей машине» возможен только когда машина в этот день на руках.'],
  ['E6','Перелёт возможен только между точками, у которых есть аэропорт.'],
  ['E7','Ночей ровно на одну меньше, чем дней. Ни один день не посчитан дважды.'],
  ['E8','У каждой ночи есть жильё. Исключение — ночь в пути, и она обязана лежать на переезде, в котором можно спать (автобус, поезд, паром, перелёт).'],
  ['E9','Выезд на день не меняет ни жильё, ни машину — он привязан к точке, где человек и так ночует.'],
  ['E10','Переезд с расписанием (паром, поезд) стоит в день, когда он ходит.'],
  ['E11','В городе, где записано «машина нужна всё время», машина в эти дни на руках.'],

  ['W1','Машину берут в одном месте, а сдают в другом — будет доплата за возврат.'],
  ['W2','Взяли и сдали в разных штатах или странах — доплата больше и нужна отдельная страховка.'],
  ['W3','Аэропорт прилёта не в первой точке ночёвки — спросить, ночевать ли в городе прилёта.'],
  ['W4','Дорога до аэропорта в день вылета дольше трёх часов — рейс должен быть не утренний.'],
  ['W5','Машина простаивает: в эти дни она не нужна ни в городе, ни на выездах — можно взять позже или сдать раньше.'],
  ['W6','У решения нет строки «почему» — человеку нечего возразить, а нам нечего показать.']
];

/* ---------- ПРОВЕРКА -------------------------------------------------- */

const R = 6371;
const rad = d => d * Math.PI / 180;
function km(a, b) {                                   /* по прямой, для грубых прикидок */
  const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function check(t) {
  const err = [], warn = [];
  const E = (c, m) => err.push(c + ': ' + m);
  const W = (c, m) => warn.push(c + ': ' + m);
  const P = {}; (t.points || []).forEach(p => P[p.id] = p);
  const legs = (t.legs || []).slice().sort((a, b) => a.day - b.day);

  /* E1 — цепочка */
  legs.forEach((l, i) => {
    if (!P[l.from]) E('E1', 'переезд дня ' + l.day + ': нет такой точки «' + l.from + '»');
    if (!P[l.to])   E('E1', 'переезд дня ' + l.day + ': нет такой точки «' + l.to + '»');
    if (i && legs[i - 1].to !== l.from)
      E('E1', 'разрыв: день ' + legs[i - 1].day + ' привёз в «' + legs[i - 1].to +
              '», а день ' + l.day + ' стартует из «' + l.from + '»');
  });

  /* E2 — повисшие точки */
  const inTo = new Set(legs.map(l => l.to)), inFrom = new Set(legs.map(l => l.from));
  (t.points || []).forEach(p => {
    if (!inTo.has(p.id) && !inFrom.has(p.id))
      E('E2', 'точка «' + p.name + '» не связана ни с чем — в неё нельзя попасть');
  });
  if (legs.length) {
    (t.points || []).forEach(p => {
      const first = legs[0].from, last = legs[legs.length - 1].to;
      if (p.id !== first && !inTo.has(p.id))  E('E2', 'в «' + p.name + '» не на чем приехать');
      if (p.id !== last  && !inFrom.has(p.id)) E('E2', 'из «' + p.name + '» не на чем уехать');
    });
  }

  /* E3 — день кончается там, где ночь.
     Не «один переезд в день»: перелёт домой→аэропорт и дорога аэропорт→город — это
     один день и один путь. А вот «Дуранго → Урей → Аспен» за день означает, что ночь
     в Урее посчитана зря — и вот это ловим. Заодно ловим телепортацию: ночь переехала,
     а переезда не было. */
  const nights0 = (t.nights || []);
  const nightOf = n => nights0.find(x => x.n === n) || null;
  const byDay = {};
  legs.forEach(l => {
    if (l.day < 1 || l.day > t.days) E('E3', 'переезд назначен на день ' + l.day + ', а в поездке ' + t.days);
    (byDay[l.day] = byDay[l.day] || []).push(l);
  });
  for (let d = 1; d <= t.days; d++) {
    const ls = byDay[d] || [], n = nightOf(d), prev = nightOf(d - 1);
    const moving = x => x && x.stay === 'moving';
    if (ls.length) {
      for (let i = 1; i < ls.length; i++)
        if (ls[i - 1].to !== ls[i].from)
          E('E3', 'день ' + d + ': два несвязанных переезда — «' + ls[i - 1].from + '→' + ls[i - 1].to +
                  '» и «' + ls[i].from + '→' + ls[i].to + '». За один день человек не может оказаться в двух местах');
      if (prev && !moving(prev) && ls[0].from !== prev.at)
        E('E3', 'день ' + d + ' стартует из «' + ls[0].from + '», а ночь ' + (d - 1) + ' была в «' + prev.at + '»');
      if (n && !moving(n) && ls[ls.length - 1].to !== n.at)
        E('E3', 'день ' + d + ' приводит в «' + ls[ls.length - 1].to + '», а ночь ' + d + ' записана в «' + n.at + '»');
    } else if (n && prev && !moving(n) && !moving(prev) && n.at !== prev.at) {
      E('E3', 'ночь ' + d + ' в «' + n.at + '», ночь ' + (d - 1) + ' в «' + prev.at + '», а переезда в этот день нет');
    }
  }

  /* E4, E5, E11 — машина */
  const vs = (t.vehicles || []).slice().sort((a, b) => a.take.day - b.take.day);
  let busy = null;
  vs.forEach(v => {
    if (!P[v.take.at]) E('E4', 'машину берут в несуществующей точке «' + v.take.at + '»');
    if (!P[v.drop.at]) E('E4', 'машину сдают в несуществующей точке «' + v.drop.at + '»');
    if (v.drop.day < v.take.day) E('E4', 'машину сдают раньше, чем берут');
    if (busy && v.take.day <= busy) E('E4', 'вторую машину берут, не сдав первую');
    busy = v.drop.day;
    if (v.take.at !== v.drop.at) {
      W('W1', 'берут в «' + (P[v.take.at] || {}).name + '», сдают в «' + (P[v.drop.at] || {}).name +
              '» — будет доплата за возврат в другом месте');
      const r1 = (P[v.take.at] || {}).region, r2 = (P[v.drop.at] || {}).region;
      if (r1 && r2 && r1 !== r2)
        W('W2', 'разные регионы (' + r1 + ' → ' + r2 + ') — доплата выше и нужна страховка на выезд');
    }
  });
  const hasCar = day => vs.some(v => v.type !== 'pass' && day >= v.take.day && day <= v.drop.day);
  legs.forEach(l => {
    if (l.mode === 'car' && !hasCar(l.day))
      E('E5', 'день ' + l.day + ': переезд на машине, а машины в этот день нет');
    if (l.mode === 'flight') {
      if (!(P[l.from] || {}).air) E('E6', 'вылет из «' + l.from + '», а аэропорта там нет');
      if (!(P[l.to]   || {}).air) E('E6', 'прилёт в «' + l.to + '», а аэропорта там нет');
    }
    if (l.weekdays && l.weekday_of_day && l.weekdays.indexOf(l.weekday_of_day) < 0)
      E('E10', 'день ' + l.day + ': переезд назначен на день недели, когда он не ходит');
  });

  /* E7, E8 — ночи */
  const nights = (t.nights || []);
  if (nights.length !== t.days - 1)
    E('E7', 'ночей ' + nights.length + ', а должно быть ' + (t.days - 1) + ' при ' + t.days + ' днях');
  const legById = {}; legs.forEach(l => legById['leg' + l.day] = l);
  nights.forEach(n => {
    if (n.stay === 'moving') {
      const l = legById[n.at];
      if (!l) E('E8', 'ночь ' + n.n + ' в пути, но не сказано, в каком переезде');
      else if (['bus', 'train', 'ferry', 'flight'].indexOf(l.mode) < 0)
        E('E8', 'ночь ' + n.n + ': в «' + MOVE[l.mode] + '» спать нельзя');
    } else {
      if (!P[n.at]) E('E8', 'ночь ' + n.n + ' в несуществующей точке «' + n.at + '»');
      if (n.stay !== 'vehicle' && !n.name)
        W('W6', 'ночь ' + n.n + ': жильё не выбрано — нельзя показывать ночь там, где ничего не проверено');
    }
  });
  /* E11 — город, где без машины нельзя */
  const nightsAt = {}; nights.forEach(n => { (nightsAt[n.at] = nightsAt[n.at] || []).push(n.n); });
  (t.points || []).forEach(p => {
    if (p.city_transport === 'car_all' && nightsAt[p.id]) {
      const days = nightsAt[p.id];
      if (!days.every(d => hasCar(d)))
        E('E11', 'в «' + p.name + '» без машины нельзя, а машины в эти дни нет');
    }
  });

  /* E9 — выезды */
  (t.daytrips || []).forEach(d => {
    if (!P[d.at]) E('E9', 'выезд «' + d.name + '» из несуществующей точки');
    else if (!nightsAt[d.at]) E('E9', 'выезд «' + d.name + '» из точки, где человек не ночует');
    if (d.by === 'own' && !hasCar(d.day)) E('E9', 'выезд «' + d.name + '» на своей машине, а машины нет');
  });

  /* W3, W4 — аэропорт и первая/последняя точка */
  if (legs.length) {
    const a = P[legs[0].from], b = P[legs[legs.length - 1].to];
    if (a && a.kind === 'airport') {
      const first = P[legs[0].to];
      if (first && first.kind !== 'airport') {
        const d = km([a.lat, a.lng], [first.lat, first.lng]);
        if (d > 60) W('W3', 'от аэропорта до «' + first.name + '» ≈' + d + ' км по прямой — спросить, ночевать ли в городе прилёта');
      }
    }
    if (b && b.kind === 'airport') {
      const l = legs[legs.length - 1];
      if (l.hours && l.hours > 3) W('W4', 'до аэропорта в день вылета ' + l.hours + ' ч — рейс не должен быть утренним');
    }
  }

  /* W5 — машина простаивает */
  vs.filter(v => v.type === 'rental').forEach(v => {
    for (let d = v.take.day; d <= v.drop.day; d++) {
      const moving = legs.some(l => l.day === d && l.mode === 'car');
      const trip   = (t.daytrips || []).some(x => x.day === d && x.by === 'own');
      const at     = nights.find(n => n.n === d);
      const p      = at ? P[at.at] : null;
      const need   = p && (p.city_transport === 'car_all' || p.city_transport === 'car_trips');
      if (!moving && !trip && !need)
        W('W5', 'день ' + d + ': машина не нужна ни в городе, ни на выезде — можно взять позже или сдать раньше');
    }
  });

  /* W6 — «почему» */
  const noWhy = []
    .concat((t.legs || []).filter(l => !l.why).map(l => 'переезд дня ' + l.day))
    .concat((t.daytrips || []).filter(d => !d.why).map(d => 'выезд «' + d.name + '»'));
  if (noWhy.length) W('W6', 'нет строки «почему»: ' + noWhy.join(', '));

  return { err, warn };
}

/* ---------- ДВА НАШИХ МАРШРУТА, РАЗЛОЖЕННЫЕ НА ДЕТАЛИ ------------------- */
/* Данные взяты из trip-colorado.js и trip-utah.js как есть. Если оба
   собираются деталями и проходят проверку — конструктор описывает то, что у
   нас уже работает, и его можно переносить в движок без потерь. */

const COLORADO = {
  name: 'Колорадо', days: 10, shape: 'из точки в точку',
  points: [
    { id:'DRO', kind:'airport', name:'Аэропорт Дуранго',  lat:37.1515, lng:-107.7538, air:'DRO', region:'CO' },
    { id:'dur', kind:'city',    name:'Дуранго',           lat:37.2753, lng:-107.8801, city_transport:'car_all', why:'Узкоколейка, Меса-Верде, источники Пагосы — база на юго-западе' },
    { id:'our', kind:'city',    name:'Урей',              lat:38.0228, lng:-107.6712, city_transport:'car_all', why:'«Швейцария Америки»: водопад в щели, источники, джип-трейлы' },
    { id:'asp', kind:'city',    name:'Аспен / Басальт',   lat:39.1911, lng:-106.8175, city_transport:'car_all', why:'Maroon Bells, ледниковые озёра, перевал Independence' },
    { id:'den', kind:'city',    name:'Денвер у аэропорта',lat:39.7392, lng:-104.9903, city_transport:'car_all', why:'Только переночевать перед утренним вылетом' },
    { id:'DEN', kind:'airport', name:'Аэропорт Денвера',  lat:39.8561, lng:-104.6737, air:'DEN', region:'CO' }
  ],
  legs: [
    { from:'DRO', to:'dur', mode:'car', day:1,  km:15,  hours:0.4, why:'Аэропорт в самом городе — 25 минут' },
    { from:'dur', to:'our', mode:'car', day:4,  km:120, hours:2,   with_stops:'5–6 ч', why:'Million Dollar Highway — дорога сама по себе достопримечательность' },
    { from:'our', to:'asp', mode:'car', day:6,  km:330, hours:5,   with_stops:'весь день', why:'Через Чёрный каньон, другого разумного пути нет' },
    { from:'asp', to:'den', mode:'car', day:9,  km:260, hours:4,   with_stops:'6–7 ч', why:'Перевал Independence по дороге к аэропорту' },
    { from:'den', to:'DEN', mode:'car', day:10, km:20,  hours:0.4, why:'Утром к рейсу' }
  ],
  nights: [
    { n:1, at:'dur', stay:'hotel', name:'Дуранго, центр' },
    { n:2, at:'dur', stay:'hotel', name:'Дуранго, центр' },
    { n:3, at:'dur', stay:'hotel', name:'Дуранго, центр' },
    { n:4, at:'our', stay:'hotel', name:'Урей' },
    { n:5, at:'our', stay:'hotel', name:'Урей' },
    { n:6, at:'asp', stay:'hotel', name:'Басальт' },
    { n:7, at:'asp', stay:'hotel', name:'Басальт' },
    { n:8, at:'asp', stay:'hotel', name:'Басальт' },
    { n:9, at:'den', stay:'hotel', name:'Отель у DEN с шаттлом' }
  ],
  vehicles: [
    { type:'rental', take:{ at:'DRO', day:1 }, drop:{ at:'DEN', day:10 }, why:'Весь маршрут между городами — только на машине' }
  ],
  daytrips: [
    { at:'dur', day:2, name:'Поезд Durango & Silverton', by:'train', price_per_person:120, why:'Узкоколейка 1882 года — аттракцион, а не способ добраться. Машина ждёт в Дуранго' },
    { at:'dur', day:3, name:'Меса-Верде',                by:'own',   why:'Скальные жилища, полный день на своей машине' },
    { at:'our', day:5, name:'Джип-тур Yankee Boy Basin', by:'tour',  price_per_person:130, why:'На прокатной легковой туда нельзя — нужен джип с водителем' }
  ]
};

const UTAH = {
  name: 'Юта', days: 7, shape: 'из точки в точку',
  points: [
    { id:'LAS', kind:'airport', name:'Аэропорт Лас-Вегаса', lat:36.0840, lng:-115.1537, air:'LAS', region:'NV' },
    { id:'zio', kind:'city',    name:'Спрингдейл (Зайон)',  lat:37.1889, lng:-112.9986, city_transport:'car_all', why:'Ворота Зайона, из города ходит шаттл в каньон' },
    { id:'bry', kind:'city',    name:'Брайс-Каньон-Сити',   lat:37.6714, lng:-112.1560, city_transport:'car_all', why:'Амфитеатр Брайса на рассвете' },
    { id:'moa', kind:'city',    name:'Моаб',                lat:38.5733, lng:-109.5498, city_transport:'car_all', why:'База для Арок и Каньонлендса' },
    { id:'GJT', kind:'airport', name:'Гранд-Джанкшен',      lat:39.1224, lng:-108.5267, air:'GJT', region:'CO' }
  ],
  legs: [
    { from:'LAS', to:'zio', mode:'car', day:1, km:270, hours:2.7, with_stops:'полдня', why:'По I-15 через ущелье Вирджин-Ривер — единственная дорога' },
    { from:'zio', to:'bry', mode:'car', day:3, km:130, hours:2,   with_stops:'полдня', why:'Через тоннель Зайона, дорога сама по себе красивая' },
    { from:'bry', to:'moa', mode:'car', day:4, km:430, hours:4.5, with_stops:'весь день', why:'Через Capitol Reef — длинный, но единственный разумный путь' },
    { from:'moa', to:'GJT', mode:'car', day:7, km:180, hours:2,   why:'Утром к рейсу' }
  ],
  nights: [
    { n:1, at:'zio', stay:'hotel', name:'Спрингдейл' },
    { n:2, at:'zio', stay:'hotel', name:'Спрингдейл' },
    { n:3, at:'bry', stay:'hotel', name:'Брайс-Каньон-Сити' },
    { n:4, at:'moa', stay:'hotel', name:'Моаб' },
    { n:5, at:'moa', stay:'hotel', name:'Моаб' },
    { n:6, at:'moa', stay:'hotel', name:'Моаб' }
  ],
  vehicles: [
    { type:'rental', take:{ at:'LAS', day:1 }, drop:{ at:'GJT', day:7 }, why:'Между парками общественного транспорта нет' }
  ],
  daytrips: [
    { at:'zio', day:2, name:'Зайон: Narrows и Angels Landing', by:'walk', why:'В каньон пускают только шаттлом — машина стоит в городе' },
    { at:'moa', day:5, name:'Каньонлендс, Меса-Арч',           by:'own',  why:'Рассвет на Меса-Арч — ради него и едут в Моаб' },
    { at:'moa', day:6, name:'Арки',                            by:'own',  why:'Главный парк маршрута, нужен полный день' }
  ]
};

/* ---------- ОТЧЁТ ------------------------------------------------------- */

function line(c) { return c.repeat(74); }
function report(t) {
  const { err, warn } = check(t);
  console.log('\n' + line('='));
  console.log(t.name.toUpperCase() + ' — ' + t.days + ' дней, форма: ' + t.shape);
  console.log(line('='));

  const P = {}; t.points.forEach(p => P[p.id] = p);
  console.log('\nЦЕПОЧКА');
  t.legs.slice().sort((a, b) => a.day - b.day).forEach(l => {
    console.log('  день ' + String(l.day).padStart(2) + '  ' +
      (P[l.from] || {}).name + ' → ' + (P[l.to] || {}).name +
      '  [' + MOVE[l.mode] + (l.km ? ', ' + l.km + ' км, ' + l.hours + ' ч' : '') + ']');
  });

  console.log('\nНОЧИ');
  const byPoint = {};
  t.nights.forEach(n => { const k = n.stay === 'moving' ? 'в пути' : (P[n.at] || {}).name; byPoint[k] = (byPoint[k] || 0) + 1; });
  Object.keys(byPoint).forEach(k => console.log('  ' + byPoint[k] + ' — ' + k));

  console.log('\nТРАНСПОРТ');
  t.vehicles.forEach(v => console.log('  ' + VEHICLE[v.type] + ': взять «' + (P[v.take.at] || {}).name +
    '» день ' + v.take.day + ' → сдать «' + (P[v.drop.at] || {}).name + '» день ' + v.drop.day));

  console.log('\nВЫЕЗДЫ НА ДЕНЬ (машину не трогают)');
  t.daytrips.forEach(d => console.log('  день ' + d.day + '  ' + d.name + '  [' + TRIP[d.by] +
    (d.price_per_person ? ', $' + d.price_per_person + ' с человека' : '') + ']'));

  console.log('\nПРОВЕРКА');
  if (!err.length) console.log('  ошибок нет');
  err.forEach(e => console.log('  ✗ ' + e));
  if (!warn.length) console.log('  предупреждений нет');
  warn.forEach(w => console.log('  ! ' + w));
}

const API = { MOVE, CITY, STAY, VEHICLE, TRIP, PARTS, RULES, check, km, COLORADO, UTAH };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (root) root.CONSTRUCTOR = API;

const isCLI = (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module);
if (isCLI) {
  console.log(line('='));
  console.log('КОНСТРУКТОР МАРШРУТА — заготовка');
  console.log(line('='));

  console.log('\nДЕТАЛИ (' + PARTS.length + ')');
  PARTS.forEach(p => {
    console.log('\n  ' + p.nm.toUpperCase());
    console.log('  ' + p.what);
    p.fields.forEach(f => console.log('      ' + f[0].padEnd(16) + ' — ' + f[1]));
  });

  console.log('\n' + line('-'));
  console.log('СЛОВАРИ — из этого ИИ выбирает, а не сочиняет');
  console.log(line('-'));
  const dict = (nm, o) => { console.log('\n  ' + nm); Object.keys(o).forEach(k => console.log('      ' + k.padEnd(12) + ' — ' + o[k])); };
  dict('Чем переезжаем между точками', MOVE);
  dict('Как перемещаемся внутри города', CITY);
  dict('Где проводим ночь', STAY);
  dict('Что берём и потом отдаём', VEHICLE);
  dict('Чем едем на выезд из города', TRIP);

  console.log('\n' + line('-'));
  console.log('ПРАВИЛА — ошибка не пускает маршрут к клиенту, предупреждение он должен увидеть');
  console.log(line('-') + '\n');
  RULES.forEach(r => console.log('  ' + r[0].padEnd(4) + r[1]));

  [COLORADO, UTAH].forEach(report);

  console.log('\n' + line('='));
  const bad = [COLORADO, UTAH].filter(t => check(t).err.length);
  console.log(bad.length ? 'НЕ СОБИРАЕТСЯ: ' + bad.map(t => t.name).join(', ')
                         : 'Оба наших маршрута собираются деталями и проходят все правила.');
  console.log(line('=') + '\n');
}

})(typeof globalThis !== 'undefined' ? globalThis : this);
