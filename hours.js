/* ==========================================================================
   ЧАСЫ РАБОТЫ — ИЗ КАРТЫ, А НЕ ИЗ ГОЛОВЫ

   Запуск:  node hours.js trip-colorado.js
            node hours.js                     (все маршруты подряд)
            node hours.js trip-colorado.js --dry   (только показать, не писать)

   Её решение 02.08: «часы работы — автоматический источник, делай». Руками
   такое не набирают: 188 точек, и через полгода половина устареет.

   Берём из OpenStreetMap поле opening_hours у самого объекта точки. Ищем вокруг
   координаты в 200 метрах и берём только УВЕРЕННОЕ совпадение:
     · имя объекта похоже на наше (без регистра, без пунктуации, без диакритики),
       либо наше название содержит имя объекта, либо наоборот;
     · либо объект — это ровно то, чем является точка (музей, замок, парк,
       достопримечательность) и он один такой в радиусе.
   Не сошлось — НЕ ПИШЕМ НИЧЕГО. Правило клиента про еду (9а) действует и здесь:
   «если не нашли и не подтвердили — оно нам не нужно», лучше пусто, чем наугад.

   Кладём в файл маршрута в META как `hours` — строкой OpenStreetMap как есть
   («Mo-Su 09:00-17:00», «24/7», «Apr-Oct 08:00-20:00; Nov-Mar closed»).
   Разбирает её страница (`hoursText` в index.html) и проверка check-route.
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const UA = 'planner-hours/1.0 (personal trip planner, one-off run)';
const PAUSE = 12000;      /* общий бесплатный сервер: после плотной работы road-times он начинает молчать */
const R_M = 200;                  /* дальше — это уже соседний дом, а не наша точка */

const sleep = ms => new Promise(r => setTimeout(r, ms));
const R = 6371, rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
/* «Château de Vezio» и «Castello di Vezio» — разные строки, но одно место:
   сравниваем без диакритики, регистра и пунктуации */
const norm = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9а-я ]+/gi, ' ').replace(/\s+/g, ' ').trim();

/* объект «того же рода», что наша точка: музей, замок, парк, смотровая */
const BIG = t => !!(t.tourism || t.historic || t.leisure === 'park' || t.leisure === 'garden'
  || t.amenity === 'theatre' || t.amenity === 'place_of_worship' || t.aeroway || t.railway === 'station');

function load(file) {
  const src = fs.readFileSync(file, 'utf8'); const S = {};
  const names = ['P', 'META'];
  const grab = names.map(n => `S.${n}=typeof ${n}!=='undefined'?${n}:undefined;`).join('');
  new Function('S', 'with(S){' + src + ';' + grab + '}')(S);
  return S;
}

async function overpass(q) {
  for (let a = 0; a < 3; a++) {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST', body: 'data=' + encodeURIComponent(q),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(90000)
    });
    const t = await res.text();
    if (/^\s*\{/.test(t) && !/"remark"/.test(t)) return JSON.parse(t);
    await sleep(30000);
  }
  throw new Error('Overpass молчит');
}

/* один запрос на пачку точек: круги вокруг каждой */
async function around(pts) {
  const parts = pts.map(p => `nwr(around:${R_M},${p.lat},${p.lng})["opening_hours"];`).join('\n  ');
  const j = await overpass(`[out:json][timeout:90];\n(\n  ${parts}\n);\nout center tags 400;`);
  return (j.elements || []).map(e => ({
    tags: e.tags || {},
    nm: (e.tags || {}).name || '',
    hours: (e.tags || {})['opening_hours'] || '',
    lat: e.lat != null ? e.lat : (e.center || {}).lat,
    lng: e.lon != null ? e.lon : (e.center || {}).lon
  })).filter(x => x.hours && x.lat != null && x.lng != null);
}

function pick(p, found) {
  const mine = norm(p.nm), q = norm(p.q);
  const near = found.map(f => Object.assign({}, f, { d: Math.round(km(p.lat, p.lng, f.lat, f.lng) * 1000) }))
    .filter(f => f.d <= R_M).sort((a, b) => a.d - b.d);
  /* 1) имя сошлось — самый надёжный признак */
  const byName = near.filter(f => {
    const n = norm(f.nm);
    if (!n || n.length < 4) return false;
    return mine === n || mine.indexOf(n) >= 0 || n.indexOf(mine) >= 0
      || (q && (q.indexOf(n) >= 0 || n.indexOf(q) >= 0));
  });
  /* ⚠️ одного имени мало: в Латинском квартале нашёлся магазин «Quartier Latin»
     в 129 метрах, и его часы поехали бы кварталу. Имя принимаем, если это
     крупный объект (музей, замок, храм) или он совсем рядом — до 60 метров */
  const sure = byName.filter(f => BIG(f.tags) || f.d <= 60);
  if (sure.length) return { f: sure[0], why: BIG(sure[0].tags) ? 'имя' : 'имя, рядом' };
  /* 2) в радиусе ровно один «крупный» объект — музей, замок, парк, вокзал */
  const big = near.filter(f => BIG(f.tags));
  if (big.length === 1 && big[0].d <= 120) return { f: big[0], why: 'единственный объект рядом' };
  return null;
}

async function doFile(file, dry) {
  const S = load(file);
  const P = S.P || [], MET = S.META || {};
  const pts = P.filter(p => p.cat !== 'food' && typeof p.lat === 'number' && typeof p.lng === 'number');
  if (!pts.length) { console.log('  нет точек — пропускаю'); return; }
  const got = {};
  let asked = 0;
  for (let i = 0; i < pts.length; i += 8) {          /* пачками, чтобы не долбить сервер */
    const batch = pts.slice(i, i + 8);
    let found;
    try { found = await around(batch); }
    catch (e) { console.log('  не спросили про ' + batch.length + ' точек (' + e.message + ')'); continue; }
    asked += batch.length;
    batch.forEach(p => {
      const hit = pick(p, found);
      if (!hit) return;
      got[p.id] = hit.f.hours;
      console.log('  ' + p.nm + ' → ' + hit.f.hours + '   (' + hit.why + ', ' + hit.f.d + ' м)');
    });
    await sleep(PAUSE);
  }
  const n = Object.keys(got).length;
  console.log('  нашли часы у ' + n + ' из ' + pts.length + ' точек');
  if (dry || !n) return;

  /* пишем прямо в META: hours стоит рядом с min, там же, где всё про место */
  let src = fs.readFileSync(file, 'utf8');
  let done = 0, missing = [];
  Object.keys(got).forEach(id => {
    const val = got[id].replace(/'/g, '’');
    const rx = new RegExp('(\\n\\s*' + id + ':\\{)([^\\n]*?)(\\},?\\s*\\n)');
    const m = src.match(rx);
    if (!m) { missing.push(id); return; }
    let body = m[2];
    body = /hours\s*:/.test(body)
      ? body.replace(/hours\s*:\s*'[^']*'/, () => "hours:'" + val + "'")
      : body + ",hours:'" + val + "'";
    /* ⚠️ замена ТОЛЬКО функцией: в строке цены есть «$30/маш», а в replace со
       строкой «$3» — это ссылка на третью скобку. Так одна цена превратилась в
       обрывок «price:'},0/маш'» и файл перестал читаться */
    src = src.replace(rx, () => m[1] + body + m[3]);
    done++;
  });
  fs.writeFileSync(file, src);
  console.log('  ✅ записано в META: ' + done + (missing.length ? ' · не нашла строку META у: ' + missing.join(', ') : ''));
}

(async () => {
  const args = process.argv.slice(2);
  const dry = args.indexOf('--dry') >= 0;
  const arg = args.filter(a => a.charAt(0) !== '-')[0];
  const files = arg ? [arg] : fs.readdirSync(__dirname)
    .filter(f => /^trip-[a-z0-9-]+\.js$/.test(f) && f !== 'trip-TEMPLATE.js');
  for (const f of files) {
    console.log('\n=== ' + path.basename(f) + ' ===');
    await doFile(path.join(__dirname, path.basename(f)), dry);
  }
})();
