/* ==========================================================================
   КОНСТРУКТОР МАРШРУТА — ПРАВИЛА СБОРКИ. 28 июля 2026.

   Что это. Не движок и не сайт. Это правила, которые собранная поездка
   нарушить не может, и проверка, которая их считает.

   Главное правило разделения, из-за которого всё и затевалось:
     переезд  — человек лёг спать в ДРУГОМ месте. Только здесь меняется машина.
     выезд    — уехал и вернулся в ТО ЖЕ жильё. Машину не трогает. Джип-тур и
                поезд в Силвертон — это выезды, а не переезды.

   ⚠️ ФАЙЛ РАЗДЕЛЁН НАДВОЕ 07.08.2026 — И ЭТО НЕ КОСМЕТИКА.
   Раньше здесь же лежали: описание деталей, тексты правил словами, ДВА НАШИХ
   МАРШРУТА ЦЕЛИКОМ (Колорадо и Юта) и печать отчёта в терминал. Браузер качал
   все 33 КБ, а звал из них одну функцию — check(). Остальное посетитель не
   видел никогда: это памятка для нас и самопроверка. Теперь она в
   `constructor-doc.js`, и `node constructor.js` печатает ровно то же, что
   печатал (доказано сверкой вывода).

   Зачем это было нужно для перевода. Пока памятка лежала здесь, проверка
   полноты перевода требовала перевести на английский и «Узкоколейка,
   Меса-Верде, источники Пагосы», и заголовок «ЦЕПОЧКА» в терминале — то есть
   сто с лишним строк, которых иностранец не увидит ни при каких условиях.
   Граница теперь проходит ПО СУТИ, а не по нашему обещанию: что грузит
   браузер — то и переводим. Тот же приём, что с текстами маршрутов (правило
   22г): не заставляй качать то, чего не увидишь.

   Запуск памятки и самопроверки:  node constructor.js
   ========================================================================== */

/* Файл читается ДВАЖДЫ: `node constructor.js` в терминале и обычным <script>
   на самом сайте — движок проверяет собранную поездку теми же правилами.
   Поэтому всё лежит внутри функции и наружу отдаётся одним именем CONSTRUCTOR:
   иначе имена (check, km, line…) столкнулись бы с именами движка. */
(function(root){

/* ---------- ПЕРЕВОД: словарь снаружи, код один на все языки ---------------
   Правило 22б: добавить язык = дописать `i18n.js`, этот файл не трогается.

   ⚠️ СООБЩЕНИЯ НАПИСАНЫ ШАБЛОНАМИ С МЕТКАМИ В ФИГУРНЫХ СКОБКАХ, А НЕ СКЛЕЕНЫ
   ПЛЮСОМ. Было: 'разрыв: день ' + a + ' привёз в «' + x + '»…' — на экране это
   один кусок текста вместе с числом, и словарь до него не достанет НИКОГДА
   (об это уже обжигались, см. ПЕРЕВОД.md). Плюс порядок слов: по-английски
   число и место стоят не там, где по-русски, а склейка порядок не даёт менять.
   Шаблон решает оба: один ключ на всё сообщение, слова переставляются внутри.

   В терминале словаря нет — остаётся русский. Так и надо: терминал читает она. */
function cx(s, v) {
  var I = (root && root.I18N) || null;
  var lang = (root && root.__lang) || 'ru';
  var out = (I && I.c) ? I.c(s, lang) : s;
  /* ⚠️ ЗНАЧЕНИЕ ПРИВОДИМ К СТРОКЕ ЯВНО. join(undefined) — это НЕ «подставь
     пустоту», а «склей через запятую по умолчанию»: пропавшее название
     превращалось в «сдают в „,“». Поймано первым же прогоном. */
  if (v) for (var k in v) out = out.split('{' + k + '}').join(v[k] == null ? '' : String(v[k]));
  return out;
}

/* ---------- СЛОВАРИ: из чего ИИ выбирает, а не сочиняет ------------------ */
/* ⚠️ Здесь остались только КЛЮЧИ — то, чем проверка пользуется как значениями.
   Человеческие описания («метро и пешком — машина мешает и стоит денег») лежат
   в constructor-doc.js: их печатает терминал, браузер не показывает никогда. */

const MODES     = ['car','flight','train','ferry','bus','transfer','driver'];  /* чем переезжаем */
const SLEEPABLE = ['bus','train','ferry','flight'];    /* в чём можно спать в пути */

/* Как называется способ передвижения. Проверке это нужно ровно в одном месте —
   «в „поезде“ спать можно, в „своей машине“ нет», — но нужно, а значит должно
   переводиться. Список тот же, что в памятке; разойтись они не могут — памятка
   берёт названия отсюда же. */
function moveNm(m) {
  switch (m) {
    case 'car':      return cx('на своей (прокатной) машине');
    case 'flight':   return cx('перелёт');
    case 'train':    return cx('поезд');
    case 'ferry':    return cx('паром');
    case 'bus':      return cx('автобус');
    case 'transfer': return cx('заказной трансфер');
    case 'driver':   return cx('машина с водителем');
  }
  return m;
}

/* ---------- ПРОВЕРКА -------------------------------------------------- */
/* ОШИБКА — маршрут не показываем клиенту.
   ПРЕДУПРЕЖДЕНИЕ — показываем, но человек должен об этом знать (обычно деньги).
   Тексты самих правил словами — в constructor-doc.js. */

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
    if (!P[l.from]) E('E1', cx('переезд дня {d}: нет такой точки «{id}»', { d: l.day, id: l.from }));
    if (!P[l.to])   E('E1', cx('переезд дня {d}: нет такой точки «{id}»', { d: l.day, id: l.to }));
    if (i && legs[i - 1].to !== l.from)
      E('E1', cx('разрыв: день {a} привёз в «{x}», а день {b} стартует из «{y}»',
        { a: legs[i - 1].day, x: legs[i - 1].to, b: l.day, y: l.from }));
  });

  /* E2 — повисшие точки */
  const inTo = new Set(legs.map(l => l.to)), inFrom = new Set(legs.map(l => l.from));
  (t.points || []).forEach(p => {
    if (!inTo.has(p.id) && !inFrom.has(p.id))
      E('E2', cx('точка «{nm}» не связана ни с чем — в неё нельзя попасть', { nm: p.name }));
  });
  if (legs.length) {
    (t.points || []).forEach(p => {
      const first = legs[0].from, last = legs[legs.length - 1].to;
      if (p.id !== first && !inTo.has(p.id))  E('E2', cx('в «{nm}» не на чем приехать', { nm: p.name }));
      if (p.id !== last  && !inFrom.has(p.id)) E('E2', cx('из «{nm}» не на чем уехать', { nm: p.name }));
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
    if (l.day < 1 || l.day > t.days)
      E('E3', cx('переезд назначен на день {d}, а в поездке {n}', { d: l.day, n: t.days }));
    (byDay[l.day] = byDay[l.day] || []).push(l);
  });
  for (let d = 1; d <= t.days; d++) {
    const ls = byDay[d] || [], n = nightOf(d), prev = nightOf(d - 1);
    const moving = x => x && x.stay === 'moving';
    if (ls.length) {
      for (let i = 1; i < ls.length; i++)
        if (ls[i - 1].to !== ls[i].from)
          E('E3', cx('день {d}: два несвязанных переезда — «{a}→{b}» и «{c}→{e}». За один день человек не может оказаться в двух местах',
            { d: d, a: ls[i - 1].from, b: ls[i - 1].to, c: ls[i].from, e: ls[i].to }));
      if (prev && !moving(prev) && ls[0].from !== prev.at)
        E('E3', cx('день {d} стартует из «{x}», а ночь {n} была в «{y}»',
          { d: d, x: ls[0].from, n: d - 1, y: prev.at }));
      if (n && !moving(n) && ls[ls.length - 1].to !== n.at)
        E('E3', cx('день {d} приводит в «{x}», а ночь {n} записана в «{y}»',
          { d: d, x: ls[ls.length - 1].to, n: d, y: n.at }));
    } else if (n && prev && !moving(n) && !moving(prev) && n.at !== prev.at) {
      E('E3', cx('ночь {a} в «{x}», ночь {b} в «{y}», а переезда в этот день нет',
        { a: d, x: n.at, b: d - 1, y: prev.at }));
    }
  }

  /* E4, E5, E11 — машина */
  const vs = (t.vehicles || []).slice().sort((a, b) => a.take.day - b.take.day);
  let busy = null;
  vs.forEach(v => {
    if (!P[v.take.at]) E('E4', cx('машину берут в несуществующей точке «{id}»', { id: v.take.at }));
    if (!P[v.drop.at]) E('E4', cx('машину сдают в несуществующей точке «{id}»', { id: v.drop.at }));
    if (v.drop.day < v.take.day) E('E4', cx('машину сдают раньше, чем берут'));
    if (busy && v.take.day <= busy) E('E4', cx('вторую машину берут, не сдав первую'));
    busy = v.drop.day;
    if (v.take.at !== v.drop.at) {
      /* точки может не быть вовсе — про это уже сказала E4; чтобы предупреждение
         не выглядело поломанным, показываем хотя бы id */
      W('W1', cx('берут в «{a}», сдают в «{b}» — будет доплата за возврат в другом месте',
        { a: (P[v.take.at] || {}).name || v.take.at, b: (P[v.drop.at] || {}).name || v.drop.at }));
      const r1 = (P[v.take.at] || {}).region, r2 = (P[v.drop.at] || {}).region;
      if (r1 && r2 && r1 !== r2)
        W('W2', cx('разные регионы ({a} → {b}) — доплата выше и нужна страховка на выезд', { a: r1, b: r2 }));
    }
  });
  const hasCar = day => vs.some(v => v.type !== 'pass' && day >= v.take.day && day <= v.drop.day);
  legs.forEach(l => {
    if (l.mode === 'car' && !hasCar(l.day))
      E('E5', cx('день {d}: переезд на машине, а машины в этот день нет', { d: l.day }));
    if (l.mode === 'flight') {
      if (!(P[l.from] || {}).air) E('E6', cx('вылет из «{x}», а аэропорта там нет', { x: l.from }));
      if (!(P[l.to]   || {}).air) E('E6', cx('прилёт в «{x}», а аэропорта там нет', { x: l.to }));
    }
    if (l.weekdays && l.weekday_of_day && l.weekdays.indexOf(l.weekday_of_day) < 0)
      E('E10', cx('день {d}: переезд назначен на день недели, когда он не ходит', { d: l.day }));
  });

  /* E7, E8 — ночи */
  const nights = (t.nights || []);
  if (nights.length !== t.days - 1)
    E('E7', cx('ночей {a}, а должно быть {b} при {c} днях',
      { a: nights.length, b: t.days - 1, c: t.days }));
  const legById = {}; legs.forEach(l => legById['leg' + l.day] = l);
  nights.forEach(n => {
    if (n.stay === 'moving') {
      const l = legById[n.at];
      if (!l) E('E8', cx('ночь {n} в пути, но не сказано, в каком переезде', { n: n.n }));
      else if (SLEEPABLE.indexOf(l.mode) < 0)
        E('E8', cx('ночь {n}: в «{how}» спать нельзя', { n: n.n, how: moveNm(l.mode) }));
    } else {
      if (!P[n.at]) E('E8', cx('ночь {n} в несуществующей точке «{id}»', { n: n.n, id: n.at }));
      if (n.stay !== 'vehicle' && !n.name)
        W('W6', cx('ночь {n}: жильё не выбрано — нельзя показывать ночь там, где ничего не проверено', { n: n.n }));
    }
  });
  /* E11 — город, где без машины нельзя */
  const nightsAt = {}; nights.forEach(n => { (nightsAt[n.at] = nightsAt[n.at] || []).push(n.n); });
  (t.points || []).forEach(p => {
    if (p.city_transport === 'car_all' && nightsAt[p.id]) {
      const days = nightsAt[p.id];
      if (!days.every(d => hasCar(d)))
        E('E11', cx('в «{nm}» без машины нельзя, а машины в эти дни нет', { nm: p.name }));
    }
  });

  /* E9 — выезды */
  (t.daytrips || []).forEach(d => {
    if (!P[d.at]) E('E9', cx('выезд «{nm}» из несуществующей точки', { nm: d.name }));
    else if (!nightsAt[d.at]) E('E9', cx('выезд «{nm}» из точки, где человек не ночует', { nm: d.name }));
    if (d.by === 'own' && !hasCar(d.day)) E('E9', cx('выезд «{nm}» на своей машине, а машины нет', { nm: d.name }));
  });

  /* W3, W4 — аэропорт и первая/последняя точка */
  if (legs.length) {
    const a = P[legs[0].from], b = P[legs[legs.length - 1].to];
    if (a && a.kind === 'airport') {
      const first = P[legs[0].to];
      if (first && first.kind !== 'airport') {
        const d = km([a.lat, a.lng], [first.lat, first.lng]);
        /* ⚠️ километры тут не переводим в мили: это грубая прикидка по прямой
           для нас, а не расстояние для путешественника. Единицы для человека
           считает движок (convDist), и сюда он не заходит. */
        if (d > 60) W('W3', cx('от аэропорта до «{nm}» ≈{km} км по прямой — спросить, ночевать ли в городе прилёта',
          { nm: first.name, km: d }));
      }
    }
    if (b && b.kind === 'airport') {
      const l = legs[legs.length - 1];
      if (l.hours && l.hours > 3)
        W('W4', cx('до аэропорта в день вылета {h} ч — рейс не должен быть утренним', { h: l.hours }));
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
        W('W5', cx('день {d}: машина не нужна ни в городе, ни на выезде — можно взять позже или сдать раньше', { d: d }));
    }
  });

  /* W6 — «почему» */
  const noWhy = []
    .concat((t.legs || []).filter(l => !l.why).map(l => cx('переезд дня {d}', { d: l.day })))
    .concat((t.daytrips || []).filter(d => !d.why).map(d => cx('выезд «{nm}»', { nm: d.name })));
  if (noWhy.length) W('W6', cx('нет строки «почему»: {list}', { list: noWhy.join(', ') }));

  return { err, warn };
}

const API = { MODES, SLEEPABLE, moveNm, cx, check, km };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (root) root.CONSTRUCTOR = API;

/* Памятка и самопроверка живут отдельно и в браузер не едут. */
const isCLI = (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module);
if (isCLI) require('./constructor-doc.js')(API);

})(typeof globalThis !== 'undefined' ? globalThis : this);
