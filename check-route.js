/* ==========================================================================
   ПРОВЕРКА ФАЙЛА МАРШРУТА ПЕРЕД ПУБЛИКАЦИЕЙ

   Запуск:  node check-route.js trip-utah.js
            node check-route.js            (проверит все trip-*.js)

   Зачем. Каждый новый маршрут — это новый файл данных, и движок верит ему
   на слово. За одну ночь на маршруте по Юте всплыли четыре разные поломки,
   и ВСЕ они были дырками в данных, а не в коде:
     · форма FOODCITIES отличалась (items вместо spots) — страница молча падала;
     · не было дороги из аэропорта в первый город — маршрут начинался ниоткуда;
     · не было названий городов аэропортов — карточка звала лететь не туда;
     · не было координат города вылета — самолёт рисовался в чужом штате.
   Каждую находил живой человек, глядя на экран. Этот скрипт ищет их сам.

   Правило: скрипт НЕ чинит и НЕ угадывает. Он только показывает, что не так,
   и молчит, когда всё в порядке.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const order = require('./day-order.js');
/* счёт дня — общий со страницей (index.html грузит этот же файл скриптом) */
const DAYMATH = require('./day-math.js');
/* разбор часов работы — тот же файл, что читает страница */
const OPEN = require('./open-hours.js');

const R = 6371;
const rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* аэропорт считаем «далёким», если до города ночёвки больше этого — тогда
   обязательны и название города аэропорта, и дорога от него, и подпись */
const FAR_AIRPORT_KM = 25;
/* конец линии-переезда должен упираться в базу или аэропорт, а не висеть в поле */
const LEG_END_KM = 30;
/* обычный темп дня: десять часов на ногах (на странице это настройка «темп
   поездки», 8/10/12) */
const DAY_MINUTES = 600;
/* САМЫЙ ПЛОТНЫЙ ТЕМП — потолок, за которым день невозможен ни для кого.
   Её решение 02.08: «у нас есть маршрут, дни определены и количество их тоже.
   Не влезает в 12 часов — значит убираем». Поэтому день длиннее 12 часов — не
   замечание, а ОШИБКА: лишнее убираем из данных, а не оставляем человеку */
const DAY_MAX = 720;
/* «45 мин», «1 час», «1 ч 20 мин», «3,5 часа» — берём ПЕРВОЕ число подписи:
   в «катер 45 мин быстрый, 2 ч обычный» первым стоит то, чем едут обычно */
function parseMin(t) {
  const s = String(t || '').toLowerCase().replace(/,(\d)/g, '.$1');
  const re = /(\d+(?:\.\d+)?)\s*(ч(?:ас[а-я]*)?|мин[а-я]*)/g;
  const m = re.exec(s);
  if (!m) return /\bчас\b/.test(s) ? 60 : 0;
  if (/^мин/.test(m[2])) return Math.round(parseFloat(m[1]));
  let total = parseFloat(m[1]) * 60;
  const m2 = /^\s*(\d+)\s*мин/.exec(s.slice(re.lastIndex));
  if (m2) total += parseInt(m2[1], 10);
  return Math.round(total);
}

function load(file) {
  const src = fs.readFileSync(file, 'utf8');
  const S = {};
  const names = ['BASES','DAYS','DAY_BASE','P','FOODCITIES','LINES','TRIP_NAME','START','PHOTO',
    'BPHOTO','IMGPREF','ALT','ORIGIN','AIRPORT','AIRPORTNM','AIRPORTWAY','SEGMENT','TRANSFER','BUDGET','HERO','META','ROADS','CITYMOVE','OPTS'];
  const grab = names.map(n => `S.${n}=typeof ${n}!=='undefined'?${n}:undefined;`).join('');
  new Function('S', 'with(S){' + src + ';' + grab + '}')(S);
  return S;
}

function checkRoute(file) {
  const problems = [], warnings = [];
  const bad = m => problems.push(m);
  const warn = m => warnings.push(m);

  let S;
  try { S = load(file); }
  catch (e) { return { problems: ['файл не читается как данные маршрута: ' + e.message], warnings: [] }; }

  const { BASES, DAYS, DAY_BASE, P, FOODCITIES, LINES, PHOTO, BPHOTO, ORIGIN, AIRPORT, AIRPORTNM, AIRPORTWAY } = S;
  const pref = typeof S.IMGPREF === 'string' ? S.IMGPREF : '';

  /* ── 1. обязательные куски вообще на месте ── */
  for (const [nm, v] of [['BASES',BASES],['DAYS',DAYS],['DAY_BASE',DAY_BASE],['P',P],['LINES',LINES]]) {
    if (!v) bad('нет ' + nm + ' — без него движок не соберёт маршрут');
  }
  if (!BASES || !BASES.length) return { problems: problems.concat('BASES пуст — дальше проверять нечего'), warnings };

  /* ── 2. FOODCITIES той же формы, что ждёт движок (spots + координаты города) ── */
  if (FOODCITIES) {
    FOODCITIES.forEach((c, i) => {
      if (!Array.isArray(c.spots)) bad('FOODCITIES[' + i + '] («' + (c.city || '?') + '»): нет массива spots — движок падает на первой же строке про еду');
      if (typeof c.lat !== 'number' || typeof c.lng !== 'number') bad('FOODCITIES[' + i + '] («' + (c.city || '?') + '»): нет координат города (lat/lng)');
      if (!c.q) warn('FOODCITIES[' + i + '] («' + (c.city || '?') + '»): нет поля q — ссылки на карты будут хуже искать');
      /* Поля заведения движок читает по именам meal и why. В пяти новых
         маршрутах они назывались best и tag — и на странице у каждого
         ресторана вместо описания стояло «undefined», а над фотографией
         висела пустая плашка. Клиент нашла это глазами; проверка — чтобы
         больше не находила. */
      (Array.isArray(c.spots) ? c.spots : []).forEach((sp, k) => {
        const where = 'FOODCITIES[' + i + '].spots[' + k + '] («' + (sp.nm || '?') + '»)';
        if (!sp.nm) bad(where + ': нет названия nm');
        if (!sp.why) bad(where + ': нет описания why — на карточке будет «undefined»');
        if (!sp.meal) bad(where + ': нет meal (когда идти) — над фотографией будет пустая плашка');
        if (!sp.price) warn(where + ': нет price — в карточке не будет значка цены');
        ['best', 'tag'].forEach(k2 => { if (sp[k2]) bad(where + ': поле «' + k2 + '» движок не читает — нужно ' + (k2 === 'best' ? 'meal' : 'why')); });
      });
      if (c.base && !BASES.some(b => b.id === c.base)) bad('FOODCITIES[' + i + ']: base «' + c.base + '» — нет такого города в BASES');
      /* Координаты заведений. Правило клиента: «если мы не нашли — мы про место
         ничего не знаем, ни где оно, ни работает ли оно. Приблизительную точку
         не пишем». Значит заведение без координаты в подборку не берём вовсе:
         его убирает node food-coords.js <файл> --prune. */
      const spots = Array.isArray(c.spots) ? c.spots : [];
      const noPt = spots.filter(sp => typeof sp.lat !== 'number');
      if (noPt.length)
        bad('FOODCITIES[' + i + '] («' + (c.city || '?') + '»): без координат ' + noPt.length + ' из '
          + spots.length + ' (' + noPt.slice(0, 3).map(sp => sp.nm).join(', ')
          + (noPt.length > 3 ? '…' : '') + ') — найдите точку через node food-coords.js '
          + path.basename(file) + ' или уберите: node food-coords.js ' + path.basename(file) + ' --prune');
    });
  }

  /* ── 3. дни и базы сходятся ── */
  if (DAYS && DAY_BASE) {
    DAYS.forEach(d => {
      const bid = DAY_BASE[d.n];
      if (!bid) bad('день ' + d.n + ' («' + (d.title || '') + '»): не привязан к городу в DAY_BASE');
      else if (!BASES.some(b => b.id === bid)) bad('день ' + d.n + ': DAY_BASE указывает на «' + bid + '», а такого города нет');
      const pts = (P || []).filter(p => p.d === d.n && p.cat !== 'food');
      if (!pts.length) warn('день ' + d.n + ' («' + (d.title || '') + '»): ни одного места — человек откроет и увидит пустоту');
    });
    const nights = BASES.reduce((s, b) => s + (b.nights || 0), 0);
    if (DAYS.length !== nights + 1)
      warn('дней в DAYS ' + DAYS.length + ', а ночей по городам ' + nights + ' (ждём ' + (nights + 1) + ' дней: ночи + день вылета)');
  }

  /* ── 4. аэропорты: код, координаты, название города, дорога от него ── */
  if (!ORIGIN || !ORIGIN.ll || ORIGIN.ll.length !== 2)
    bad('у ORIGIN нет ll (координат аэропорта вылета) — карта не нарисует дугу перелёта');
  const airLL = code => {
    if (!code) return null;
    const p = (P || []).find(x => x.cat === 'transport' && typeof x.lat === 'number'
      && (new RegExp('\\(' + code + '\\)', 'i').test(x.nm || '') || new RegExp('\\b' + code + '\\b', 'i').test(x.q || '')));
    return p ? [p.lat, p.lng] : null;
  };
  const first = BASES[0], last = BASES[BASES.length - 1];
  [[first, 'прилёта'], [last, 'вылета']].forEach(([b, role]) => {
    const code = (AIRPORT || {})[b.id];
    if (!code) { warn('у города «' + b.name + '» нет кода аэропорта ' + role + ' в AIRPORT'); return; }
    const ll = airLL(code);
    if (!ll) { bad('аэропорт ' + code + ' (' + role + '): нет места типа transport с координатами и кодом в названии — карта не найдёт, откуда рисовать самолёт'); return; }
    const dist = km(ll[0], ll[1], b.lat, b.lng);
    if (dist > FAR_AIRPORT_KM) {
      if (!(AIRPORTNM || {})[code])
        bad('аэропорт ' + code + ' в ' + Math.round(dist) + ' км от «' + b.name + '», но в AIRPORTNM нет названия его города — карточка напишет «' + b.name + ' · ' + code + '» и человек не поймёт, куда покупать билет');
      if (!(AIRPORTWAY || {})[code])
        warn('аэропорт ' + code + ' в ' + Math.round(dist) + ' км от «' + b.name + '», но в AIRPORTWAY нет подписи «сколько ехать оттуда»');
    }
  });

  /* ── 5. переезды: есть ли дорога из аэропорта и между всеми соседними базами ── */
  if (LINES) {
    const legs = LINES.filter(l => l.type === 'leg').sort((a, b) => ((a.days && a.days[0]) || 0) - ((b.days && b.days[0]) || 0));
    if (!legs.length) bad('нет ни одной линии type:"leg" — на карте не будет маршрута вовсе');

    /* дорога из аэропорта прилёта, если он далеко */
    const arrCode = (AIRPORT || {})[first.id], arrLL = airLL(arrCode);
    if (arrLL && km(arrLL[0], arrLL[1], first.lat, first.lng) > FAR_AIRPORT_KM) {
      const touchesAirport = legs.some(l => l.pts.some(p => km(p[0], p[1], arrLL[0], arrLL[1]) < LEG_END_KM));
      if (!touchesAirport)
        bad('нет переезда из аэропорта ' + arrCode + ' в «' + first.name + '» — на карте маршрут начнётся прямо в городе, будто в аэропорт никто не прилетал');
    }

    /* Каждая пара соседних городов с ночёвками должна быть соединена.
       Конец линии засчитываем и у АЭРОПОРТА этого города: в Колорадо дорога
       идёт до аэропорта Денвера, а сама база стоит в центре — расстояние
       ровно 30 км, и без этой поблажки проверка ругалась на здоровые данные. */
    const stay = BASES.filter(b => (b.nights || 0) > 0);
    const atBase = (pt, b) => {
      if (km(pt[0], pt[1], b.lat, b.lng) < LEG_END_KM) return true;
      const ll = airLL((AIRPORT || {})[b.id]);
      return !!ll && km(pt[0], pt[1], ll[0], ll[1]) < LEG_END_KM;
    };
    for (let i = 1; i < stay.length; i++) {
      const from = stay[i - 1], to = stay[i];
      const linked = legs.some(l => {
        const a = l.pts[0], z = l.pts[l.pts.length - 1];
        return (atBase(a, from) && atBase(z, to)) || (atBase(z, from) && atBase(a, to));
      });
      if (!linked) bad('нет линии-переезда между «' + from.name + '» и «' + to.name + '» — на карте будет разрыв');
    }

    /* концы линий не должны висеть в чистом поле */
    legs.forEach(l => {
      [l.pts[0], l.pts[l.pts.length - 1]].forEach((pt, k) => {
        const nearBase = Math.min.apply(null, BASES.map(b => km(pt[0], pt[1], b.lat, b.lng)));
        const nearAir = Math.min.apply(null, Object.values(AIRPORT || {}).map(c => {
          const ll = airLL(c); return ll ? km(pt[0], pt[1], ll[0], ll[1]) : 1e9;
        }).concat([1e9]));
        if (Math.min(nearBase, nearAir) > LEG_END_KM)
          warn('линия «' + (l.label || '') + '»: ' + (k ? 'конец' : 'начало') + ' в ' + Math.round(Math.min(nearBase, nearAir)) + ' км от ближайшего города или аэропорта — похоже на обрыв');
      });
    });
  }

  /* ── 6. фотографии: файлы правда лежат на диске ── */
  const imgDir = path.join(__dirname, 'img');
  const checkImg = (id, why) => {
    const ext = (PHOTO || {})[id];
    const e = typeof ext === 'string' ? ext : 'webp';
    ['l', 't', 'p'].forEach(sz => {
      const f = path.join(imgDir, pref + id + '-' + sz + '.' + e);
      if (!fs.existsSync(f)) warn('нет файла ' + path.basename(f) + ' (' + why + ') — вместо фото будет пустая плашка');
    });
  };
  Object.keys(PHOTO || {}).forEach(id => checkImg(id, 'место'));
  Object.values(BPHOTO || {}).forEach(id => checkImg(id, 'город'));
  if (S.HERO && S.HERO.photo && !fs.existsSync(path.join(__dirname, S.HERO.photo)))
    bad('в HERO указано фото ' + S.HERO.photo + ', а файла нет — шапка поездки будет с дырой');

  /* ── 7. НАПОЛНЕНИЕ ДНЯ: сколько точек и есть ли у них объяснение ──
     Правило клиента: точек кладём с запасом, 9–10 на день, лишнее человек
     снимает тумблером. Пустой день — это не поездка, а список городов. */
  if (DAYS && P) {
    DAYS.forEach(d => {
      const pts = P.filter(p => p.d === d.n && p.cat !== 'food');
      const sights = pts.filter(p => p.cat !== 'transport');
      if (!pts.length) return;                       /* про пустой день уже сказано выше */
      if (sights.length < 3) warn('день ' + d.n + ' («' + (d.title || '') + '»): всего ' + sights.length
        + ' ' + (sights.length === 1 ? 'место' : 'места') + ' — по правилу в дне должно быть 9–10, лишнее человек снимет сам');
      else if (sights.length < 6) warn('день ' + d.n + ' («' + (d.title || '') + '»): ' + sights.length
        + ' мест — можно добавить, в дне нормально 9–10');
    });
    /* Время на месте — не украшение, а единица счёта дня: из него складывается
       «9 ч 40 мин из 10», по нему встаёт обед и по нему же вытесняется лишнее.
       Словами («полдня», «1–2 ч») это не считается, поэтому METAmin обязателен
       числом. Диапазон из путеводителя берём ближе к нижней границе. */
    const MET = S.META || {};
    /* ВАРИАНТЫ ДНЯ. Места с opt заменяют день, а не продолжают его. Ветка
       должна идти в файле подряд: вперемешку с основной цепочкой на экране
       получится «или вместо этого» через каждую строку. */
    DAYS.forEach(d => {
      const pts = P.filter(p => p.d === d.n && p.cat !== 'food');
      const seen = [];
      pts.forEach(p => { const k = p.opt || ''; if (seen[seen.length - 1] !== k) seen.push(k); });
      const dup = seen.filter((k, i) => seen.indexOf(k) !== i);
      if (dup.length) warn('день ' + d.n + ' («' + (d.title || '') + '»): вариант «' + dup[0]
        + '» разорван — точки одной ветки должны идти в файле подряд, иначе на экране развилка через строку');
      if (pts.length && pts.every(p => p.opt)) warn('день ' + d.n + ' («' + (d.title || '')
        + '»): все точки помечены вариантами, основной цепочки нет — какая-то ветка должна быть основной');
      /* правило 15б: подсказка дня принадлежит основной цепочке. Если основной
         цепочки в дне нет, подсказку никто не увидит — её место в OPTS[k].note */
      if (d.note && pts.length && pts.every(p => p.opt))
        warn('день ' + d.n + ' («' + (d.title || '') + '»): подсказка написана в дне, а основной цепочки '
          + 'в нём нет — на экране она не покажется. Перенесите её в OPTS[\'' + pts[0].opt + '\'].note '
          + '(подсказка принадлежит плану, а не дню — правило 15б)');
      /* вариант с именем, но без подписи и приоритета — вкладка «Вариант 2» без
         лица: человек не поймёт, между чем выбирает */
      [...new Set(pts.filter(p => p.opt).map(p => p.opt))].forEach(k => {
        const o = (S.OPTS || {})[k];
        if (!o) { warn('день ' + d.n + ': вариант «' + k + '» не описан в OPTS — вкладка получится безымянной'); return; }
        if (!o.nm) warn('вариант «' + k + '»: нет nm — имя вкладки взять неоткуда');
        if (!o.rank) warn('вариант «' + k + '»: нет rank — очередь не поймёт, какой из вариантов старший (правило 15а)');
      });
    });
    P.filter(p => p.cat !== 'food').forEach(p => {
      if (!p.why) bad('место «' + (p.nm || p.id) + '»: нет why — на карточке будет пусто');
      if (!p.q) warn('место «' + (p.nm || p.id) + '»: нет q — ссылка на карты будет искать по названию наугад');
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number')
        bad('место «' + (p.nm || p.id) + '»: нет координат');
      const m = (MET[p.id] || {}).min;
      if (typeof m !== 'number' || !(m > 0))
        bad('место «' + (p.nm || p.id) + '»: нет META.' + p.id + '.min — сколько минут человек тут проводит.'
          + ' Без числа день не посчитать');
      else if (m < 5)
        warn('место «' + (p.nm || p.id) + '»: min ' + m + ' мин — если туда правда заходят на пять минут,'
          + ' это скорее вид по дороге, чем точка дня');
      else if (m > 480)
        warn('место «' + (p.nm || p.id) + '»: min ' + m + ' мин (' + (m / 60).toFixed(1)
          + ' ч) — такая точка занимает весь день целиком, проверьте, что так и задумано');
      /* время, записанное дважды — числом и словами, — со временем разъедется:
         поправят текст, забудут число, и счётчик дня начнёт врать. Текст dur
         оставляем только там, где он говорит БОЛЬШЕ числа: «15 мин внутри». */
      const d = (MET[p.id] || {}).dur;
      if (d && /^(~?\d+([–-]\d+)?\s*(мин|ч)|\d+,\d+\s*ч|весь день|полдня)$/.test(d.trim()))
        warn('место «' + (p.nm || p.id) + '»: время записано дважды — min ' + m + ' и dur «' + d
          + '». Оставьте число, текст нужен только когда он говорит больше: «15 мин внутри», «1 ч в пути»');
    });
  }

  /* ── 7б. ДОРОГИ ПОСЧИТАНЫ ПО ДОРОГЕ? ──
     Прямая с надбавкой давала 59,7 км там, где в шапке дня стоит 85: «дорогу
     надо считать по дороге». Настоящие километры и минуты кладёт road-times.js
     в блок ROADS. Без него страница покажет оценку — она честно подписана «≈»,
     но это всё-таки оценка. */
  if (P && DAYS) {
    const RD = S.ROADS;
    const withPts = [...new Set(P.filter(p => p.cat !== 'food' && typeof p.lat === 'number').map(p => p.d))];
    if (!RD || typeof RD !== 'object') {
      warn('дороги не посчитаны — все расстояния будут оценкой по прямой. Прогоните node road-times.js '
        + path.basename(file));
    } else {
      /* ⚠️ ТОЧКА, ВЫПАВШАЯ ИЗ ДОРОЖНОЙ ТАБЛИЦЫ. Если у места в дне нет НИ ОДНОЙ
         посчитанной дороги, а у соседей они есть — значит маршрутизатор не смог
         посадить его на дорогу. Почти всегда это кривая координата: так нашлись
         Grottos Trail и Devil's Punchbowl в четырёх километрах от шоссе (клиент
         увидела на карте булавку в стороне от линии пути). */
      const CM = S.CITYMOVE || {};
      Object.keys(RD || {}).forEach(day => {
        const t = RD[day];
        if (!t || !t.ids || t.ids.length < 3) return;
        /* если ВЕСЬ день без дорог — это не про координаты, а про то, что дороги
           для дня не посчитались; про это скажет другая проверка */
        const anyInDay = t.km.some((row, i) => row.some((v, j) => i !== j && v != null));
        if (!anyInDay) return;
        const foot = CM[(DAY_BASE || {})[day]] === 'metro_walk';
        t.ids.forEach((id, i) => {
          if (String(id).charAt(0) === '@') return;
          if (t.km[i].some((v, j) => j !== i && v != null)) return;
          const p = P.find(x => x.id === id);
          /* автор сам объяснил, как сюда попадают (тропа, катер) — это не дырка */
          if (!p || p.hop) return;
          /* в пешем городе дальняя точка честно остаётся без пешей дороги */
          if (foot) {
            const near = t.ids.some((oid, j) => {
              if (j === i || String(oid).charAt(0) === '@') return false;
              const o = P.find(x => x.id === oid);
              return o && typeof o.lat === 'number' && km(p.lat, p.lng, o.lat, o.lng) < 8;
            });
            if (!near) return;
          }
          /* у точки может быть написано, ПОЧЕМУ дороги нет: к Yankee Boy Basin ведёт
             джиповая колея, маршрутизатор такие не считает. Причина в pin — не ругаемся */
          if (p.pin) return;
          warn('день ' + day + ': место «' + (p.nm || id) + '» выпало из дорожной таблицы — '
            + 'маршрутизатор не нашёл к нему дороги, хотя к соседям нашёл. Проверьте координату: '
            + 'скорее всего, точка стоит в стороне от проезжей части');
        });
      });
      const miss = withPts.filter(d => !RD[d] || !RD[d].ids || !RD[d].ids.length);
      if (miss.length) warn('дороги посчитаны не на все дни (нет для ' + miss.join(', ')
        + ') — там останется оценка. Прогоните node road-times.js ' + path.basename(file));
    }
  }

  /* ── 7в. СКОЛЬКО ЧАСОВ ЗАНИМАЕТ ДЕНЬ ──
     «9–10 точек в день» — плохая мерка, правильная мерка ВРЕМЯ. Складываем
     минуты на местах (META.min) и минуты в дороге (ROADS, посчитано по
     настоящим дорогам). Варианты не считаем — человек поедет либо туда, либо
     сюда. А вот переезды по расписанию СЧИТАЕМ: минуты берём из подписи автора
     («катер 45 мин», «поезд с Cadorna, 1 час»), а где числа нет — прикидываем
     по прямой с надбавкой. Её слова: «мы же знаем примерно, сколько идёт поезд
     — как мы не учитываем, нам надо учитывать время». */
  if (P && DAYS) {
    const MET = S.META || {};
    const RD = S.ROADS || {};
    const roadMin = (day, a, b) => {
      const t = RD[day];
      if (!t || !t.ids) return null;
      const i = t.ids.indexOf(a), j = t.ids.indexOf(b);
      return (i >= 0 && j >= 0 && t.min[i] && t.min[i][j] != null) ? t.min[i][j] : null;
    };
    DAYS.forEach(d => {
      const pts = P.filter(p => p.d === d.n && p.cat !== 'food' && !p.opt && typeof p.lat === 'number');
      if (pts.length < 2) return;
      const bid = (DAY_BASE || {})[d.n];
      /* сколько занимает каждый перегон — считаем сразу, чтобы потом пройти день
         с часами в руках и понять, куда попадает обед */
      const bs = BASES.find(b => b.id === bid) || {};
      /* ДЕНЬ ПЕРЕЕЗДА НАЧИНАЕТСЯ В ПРОШЛОМ ГОРОДЕ: человек спал там. Считать
         первый перегон от города ночёвки — значит везти его на 262 км назад,
         как было в дне «Урей → Аспен» (13 ч 13 вместо настоящих) */
      const prevDay = DAYS[DAYS.indexOf(d) - 1];
      const pbid = prevDay ? (DAY_BASE || {})[prevDay.n] : null;
      /* но только если переезжали САМИ ЗА РУЛЁМ: Токио → Киото это поезд, а по
         дорогам шесть часов — с ними день выходил 25 часов */
      const segMode = (S.SEGMENT || {})[bid] || '';
      const drove = !segMode || /car|drive|машин/i.test(segMode);
      const startId = (pbid && pbid !== bid && drove) ? pbid : bid;
      const start = BASES.find(b => b.id === startId) || bs;
      /* день начинается в девять от жилья — но не в день прилёта: тогда первая
         точка это аэропорт, и дорога от жилья к нему человеку не нужна */
      const fromHome = pts[0].cat !== 'transport';
      let place = 0, move = 0, guessed = 0;
      const legs = pts.map((p, i) => {
        const before = i ? pts[i - 1] : start;
        if (!i && !fromHome) return 0;
        if (p.hop) {                             /* поезд, катер, фуникулёр */
          const said = parseMin(p.hop);
          if (said) return said;
          if (typeof before.lat !== 'number') return 0;
          const dd = km(before.lat, before.lng, p.lat, p.lng) * 1.2;
          const sp = /поезд|express|синкансэн|электрич/i.test(p.hop) ? 80
            : /катер|паром|лодк/i.test(p.hop) ? 25
            : /фуникул|канатн|подъёмник/i.test(p.hop) ? 12 : 50;
          guessed++;
          return Math.max(5, Math.round(dd / sp * 60));
        }
        const r = roadMin(d.n, i ? pts[i - 1].id : ('@' + startId), p.id);
        if (r != null) return r;
        if (typeof before.lat !== 'number') return 0;
        guessed++;
        return Math.max(5, Math.round(km(before.lat, before.lng, p.lat, p.lng) * 1.25 / 40 * 60));
      });
      /* 🔑 СЧЁТ ДНЯ ОДИН НА ВСЕХ — day-math.js. Здесь мы только выкладываем день
         числами: сколько на каждом месте и сколько до него ехать. Когда человек
         ест, что идёт в счёт, а что нет (ожидание, ужин после последней точки) —
         решает та же функция, что и на странице. Раньше эта арифметика была
         написана тут второй раз и жила своей жизнью: страница уже кормила
         заранее перед длинной точкой, а проверка — ещё нет. */
      const items = pts.map((p, i) => ({ min: ((MET[p.id] || {}).min) || 0, move: legs[i] }));
      items.forEach(it => { place += it.min; move += it.move; });
      const cost = DAYMATH.dayCost(items);
      const food = cost.food, total = cost.total;
      /* если день не влезает, движок отложит лишнее сам («если успеете»). Но
         звёздные точки он не трогает — и если день не сходится даже по ним,
         это разговор для человека: правило клиента «разбираемся руками». */
      /* несдвигаемое: звёздное, транспорт (вокзал, причал, аэропорт), всё, к чему
         добираются расписанием, и всё, что стоит по часам */
      const mustMin = pts.filter(p => p.star || (p.tag && p.tag[1] === 't-must')
          || p.cat === 'transport' || p.hop || p.when === 'fixed')
        .reduce((s, p) => s + (((MET[p.id] || {}).min) || 0), 0);
      const hm = m => Math.floor(m / 60) + ' ч ' + (m % 60) + ' мин';
      /* ЧАСЫ РАБОТЫ: приезжаем ли мы в открытое. Дата дня считается от START
         маршрута — человек может сдвинуть старт, и тогда «закрыто» переедет на
         другой день, но собранный нами маршрут должен сходиться хотя бы со
         своей датой. Строку из карты разбирает общий open-hours.js */
      if (S.START) {
        const d0 = new Date(String(S.START) + 'T12:00:00');
        const date = new Date(d0.getTime() + (d.n - 1) * 86400000);
        let clock = DAYMATH.DAY_START;
        pts.forEach((p, i) => {
          clock += legs[i];
          const dur = ((MET[p.id] || {}).min) || 0;
          const h = (MET[p.id] || {}).hours;
          if (h) {
            /* пришли раньше открытия и ждать недолго — не беда, просто зайдём позже
               (общая функция OPEN.arrive, ею же считает сборщик fit-hours) */
            const f = OPEN.arrive(h, date, clock, clock + dur);
            if (!f.ok)
              warn('день ' + d.n + ': «' + (p.nm || p.id) + '» — ' + f.why
                + (f.open ? ' (работает ' + f.open + ')' : '')
                + ', а мы там в ' + Math.floor(clock / 60) + ':' + String(clock % 60).padStart(2, '0')
                + '. Часы из карты: ' + h + '. Переставьте точку внутри дня или перенесите день');
          }
          clock += dur;
        });
      }
      /* потолок: день, который не влезает даже в самый плотный темп, невозможен
         ни для кого. Лишнее убираем из данных — это ошибка, а не замечание */
      if (total > DAY_MAX)
        bad('день ' + d.n + ' («' + (d.title || '') + '»): ' + hm(total) + ' — не влезает даже в 12 часов, '
          + 'самый плотный темп. На местах ' + hm(place) + ', в дороге ' + hm(move)
          + '. Уберите лишние точки: столько человек не выдержит ни при каких настройках');
      if (total > DAY_MINUTES && mustMin + move + food > DAY_MINUTES)
        warn('день ' + d.n + ' («' + (d.title || '') + '»): не влезает ДАЖЕ ПО ОБЯЗАТЕЛЬНЫМ точкам — '
          + hm(mustMin + move + food)
          + ' мин из ' + (DAY_MINUTES / 60) + '. Откладывать нечего, разбирайтесь руками: '
          + 'разнесите на два дня или уберите звезду');
      if (total > DAY_MINUTES)
        warn('день ' + d.n + ' («' + (d.title || '') + '»): ' + Math.floor(total / 60) + ' ч ' + (total % 60)
          + ' мин из ' + (DAY_MINUTES / 60) + ' — не влезает. На местах ' + Math.floor(place / 60) + ' ч '
          + (place % 60) + ' мин, в дороге ' + Math.floor(move / 60) + ' ч ' + (move % 60) + ' мин, еда ' + food + ' мин'
          + (guessed ? ' (' + guessed + ' перегон посчитан прикидкой)' : '')
          + '. Уберите лишнее или разнесите на два дня');
    });
  }

  /* ── 8. КООРДИНАТЫ ПРОВЕРЕНЫ? ──
     Ни одна точка не пишется по памяти. verify-coords.js сверяет каждую по
     четырём источникам и складывает в places-db.json. Здесь смотрим, что все
     места там есть и что файл не разъехался с базой. */
  let db = {};
  try { db = JSON.parse(fs.readFileSync(path.join(__dirname, 'places-db.json'), 'utf8')); } catch (e) {}
  const rkey = path.basename(file).replace(/^trip-|\.js$/g, '');
  const unchecked = [];
  (P || []).filter(p => p.cat !== 'food' && typeof p.lat === 'number').forEach(p => {
    const rec = db[rkey + ':' + p.id];
    if (!rec) { unchecked.push(p.id); return; }
    const off = km(p.lat, p.lng, rec.lat, rec.lng) * 1000;
    /* pin — «координата поставлена НАМИ намеренно, и вот почему». Так помечены
       места, где справочник прав по-своему, а нам нужно другое: у аэропорта
       это терминал, у длинного канала — оживлённый участок, у одноимённых
       ворот — те, что в нашем маршруте. Без такой пометки проверка кричала бы
       каждый раз, и на неё перестали бы смотреть. */
    /* ⚠️ У БОЛЬШОГО ОБЪЕКТА У СПРАВОЧНИКА СВОЯ ТОЧКА-ЯРЛЫК, И ОНА НЕ ТАМ, ГДЕ
       ЧЕЛОВЕК ДЕЙСТВУЕТ. Google ставит «Mesa Verde National Park» в середину
       парка, а нам нужен въезд; «Rio Grande Trail» — в середину тропы, а нам
       нужно её начало. Расхождение в километры у парка, озера, перевала, тропы
       или шоссе — это НЕ ошибка координаты, это разные вещи. Ошибкой считаем
       только у компактных мест: музей, ресторан, вокзал, замок. */
    const big = /national park|state park|\bпарк|\blake\b|озер|\bpass\b|перевал|\btrail\b|тропа|highway|шоссе|canyon|каньон|forest|\briver\b|\bдолина\b|divide|mountain|гора|\bloop\b|reservoir|basin|\bpark\b|monument|памятник|falls|водопад|overlook|viewpoint|смотров/i
      .test((p.nm || '') + ' ' + (p.q || ''));
    if (off > 300 && !p.pin) {
      const msg = 'место «' + (p.nm || p.id) + '»: координата в файле в ' + Math.round(off)
        + ' м от точки справочника (places-db.json)';
      /* у парка или озера километр расхождения — норма (ярлык в середине), а вот
         несколько километров стоит посмотреть глазами */
      if (big && off < 3000) return;
      if (big) warn(msg + ' — это большой объект, у справочника точка-ярлык в его середине. Проверьте,'
        + ' что наша стоит там, где паркуются и заходят; если да — впишите месту pin с причиной');
      else bad(msg + ' — сверьте через node verify-coords.js ' + path.basename(file)
        + ' (если так задумано — впишите месту pin с причиной)');
    }
  });
  if (unchecked.length) warn('координаты не сверялись у ' + unchecked.length + ' мест ('
    + unchecked.slice(0, 6).join(', ') + (unchecked.length > 6 ? '…' : '')
    + ') — прогоните node verify-coords.js ' + path.basename(file));

  /* ── 9. ДЕНЬ КАК МАРШРУТ, А НЕ СПИСОК ──
     «Маршрут должен идти потихоньку от того, что рядом, а не гонять клиента
     туда-сюда». Считаем длину прохода по дню и говорим, если её заметно
     можно сократить. Для дней на машине это подсказка, а не приговор:
     по прямой считать нельзя там, где дорога петляет через перевал. */
  try {
    const S2 = { P: P, DAYS: DAYS, META: S.META || {} };
    order.analyze(S2).forEach(r => {
      if (!r.best) return;
      /* порог теперь внутри счётчика (300 м или пять минут), и мерит он по
         настоящим дорогам — значит подсказка не шум, а «человека гоняют
         туда-сюда». Такой день не выкладываем, пока не посмотрим глазами */
      warn('день ' + r.day + ' («' + r.title + '»): путь ' + order.fmt(r.now)
        + (r.nowMin ? ' · ' + r.nowMin + ' мин' : '') + ', а можно ' + order.fmt(r.bestLen)
        + (r.bestMin ? ' · ' + r.bestMin + ' мин' : '') + ' — порядок ' + r.bestOrder.join(' → ')
        + '. Человек не должен возвращаться туда, где уже был');
    });
  } catch (e) { warn('счётчик пути не отработал: ' + e.message); }

  return { problems, warnings };
}

/* ── запуск ── */
const arg = process.argv[2];
const files = arg ? [arg] : fs.readdirSync(__dirname).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f));
let totalBad = 0;
files.forEach(f => {
  const full = path.join(__dirname, path.basename(f));
  console.log('\n=== ' + path.basename(f) + ' ===');
  const { problems, warnings } = checkRoute(full);
  problems.forEach(p => console.log('  ОШИБКА  ' + p));
  warnings.forEach(w => console.log('  внимание ' + w));
  if (!problems.length && !warnings.length) console.log('  всё в порядке');
  else console.log('  итого: ошибок ' + problems.length + ', замечаний ' + warnings.length);
  totalBad += problems.length;
});
console.log('');
process.exit(totalBad ? 1 : 0);
