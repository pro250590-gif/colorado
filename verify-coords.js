/* ==========================================================================
   КООРДИНАТЫ — СВЕРКА ПО ЧЕТЫРЁМ ИСТОЧНИКАМ И БАЗА ПРОВЕРЕННЫХ МЕСТ

   Правило клиента: координаты ставит справочник, а не автор. Ни одна точка не
   пишется по памяти. Проверяем каждую по четырём источникам:
       OpenStreetMap (Nominatim) · Photon · Google Geocoding · Google Places
   Где источники сошлись — координата верна. Где спорят — решает Google.

   Запуск:  node verify-coords.js trip-milan.js
            node verify-coords.js                (все маршруты)

   Что делает:
     · показывает места, где наша координата дальше 300 м от найденной;
     · дописывает проверенные места в places-db.json: номер места у Google
       (place_id), название, координата, дата проверки.
   ⚠️ В базу НЕ кладём оценки и число отзывов: их правилами Google нельзя
   хранить дольше 30 дней. Они нужны только в момент отбора мест.

   Файлы никогда не правятся автоматически: скрипт показывает, человек решает.
   ========================================================================== */
const https = require('https'), fs = require('fs'), path = require('path');

const DB = path.join(__dirname, 'places-db.json');
const KEYFILE = path.join(__dirname, 'google-key.txt');
const KEY = fs.existsSync(KEYFILE) ? fs.readFileSync(KEYFILE, 'utf8').trim().split('=').pop().trim() : '';
const UA = 'KolibriProPlanner/1.0 (route check; contact levashov.peter@gmail.com)';
const FAR_M = 300;                 /* дальше этого — разбираемся руками */
const sleep = ms => new Promise(r => setTimeout(r, ms));

const R = 6371, rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function get(u) {
  return new Promise(res => {
    const req = https.get(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } }, s => {
      let d = ''; s.on('data', c => d += c); s.on('end', () => { try { res(JSON.parse(d)); } catch (e) { res(null); } });
    });
    req.setTimeout(20000, () => { req.destroy(); res(null); });
    req.on('error', () => res(null));
  });
}
function post(host, pathn, body, headers) {
  return new Promise(res => {
    const b = JSON.stringify(body);
    const req = https.request({ host, path: pathn, method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) }, headers) },
      s => { let d = ''; s.on('data', c => d += c); s.on('end', () => { try { res(JSON.parse(d)); } catch (e) { res(null); } }); });
    req.setTimeout(20000, () => { req.destroy(); res(null); });
    req.on('error', () => res(null));
    req.write(b); req.end();
  });
}
async function osm(q) {
  const a = await get('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(q));
  return a && a[0] ? [+a[0].lat, +a[0].lon] : null;
}
async function photon(q, near) {
  let u = 'https://photon.komoot.io/api/?limit=1&q=' + encodeURIComponent(q);
  if (near) u += '&lat=' + near[0] + '&lon=' + near[1];
  const a = await get(u); const f = a && a.features && a.features[0];
  return f ? [f.geometry.coordinates[1], f.geometry.coordinates[0]] : null;
}
async function gmaps(q) {
  if (!KEY) return null;
  const a = await get('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(q) + '&key=' + KEY);
  const r = a && a.results && a.results[0];
  return r ? [r.geometry.location.lat, r.geometry.location.lng] : null;
}
/* Places (New) — он же даёт постоянный номер места для базы */
async function gplace(q, near) {
  if (!KEY) return null;
  const j = await post('places.googleapis.com', '/v1/places:searchText',
    { textQuery: q, languageCode: 'en', maxResultCount: 1,
      locationBias: near ? { circle: { center: { latitude: near[0], longitude: near[1] }, radius: 3000 } } : undefined },
    { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'places.id,places.displayName,places.location' });
  const p = j && j.places && j.places[0];
  return p ? { id: p.id, name: p.displayName.text, ll: [p.location.latitude, p.location.longitude] } : null;
}

async function checkRoute(file, db, stamp) {
  const src = fs.readFileSync(file, 'utf8');
  const S = {}; new Function('S', 'with(S){' + src + ';S.P=P;}')(S);
  const key = path.basename(file).replace(/^trip-|\.js$/g, '');
  const pts = (S.P || []).filter(p => p.cat !== 'food' && typeof p.lat === 'number');
  console.log('\n=== ' + path.basename(file) + ' — мест ' + pts.length);
  let bad = 0, added = 0;
  for (const p of pts) {
    const q = p.q || p.nm, near = [p.lat, p.lng];
    const a = await osm(q); await sleep(1100);
    const b = await photon(q, near);
    const c = await gmaps(q); await sleep(200);
    const d = await gplace(q, near); await sleep(200);
    const all = [['OSM', a], ['Photon', b], ['Google', c], ['Places', d && d.ll]].filter(x => x[1]);
    if (!all.length) { console.log('   ?  ' + p.id + ' ' + p.nm.slice(0, 34) + ' — никто не знает «' + q + '»'); continue; }
    /* берём ту точку, вокруг которой собралось больше всего источников */
    let best = null, agree = 0;
    all.forEach(([, ll]) => {
      const n = all.filter(x => km(ll[0], ll[1], x[1][0], x[1][1]) < 0.3).length;
      if (n > agree) { agree = n; best = ll; }
    });
    /* спор — решает Google */
    if (agree < 2 && c) best = c;
    const off = km(p.lat, p.lng, best[0], best[1]) * 1000;
    if (off > FAR_M) {
      bad++;
      console.log('   ✗  ' + p.id + ' ' + p.nm.slice(0, 32).padEnd(34)
        + 'наша точка в ' + (off > 1000 ? (off / 1000).toFixed(1) + ' км' : Math.round(off) + ' м')
        + ' от найденной (' + best[0].toFixed(6) + ', ' + best[1].toFixed(6) + '), сошлись ' + agree + ' из ' + all.length);
    }
    if (d) {
      db[key + ':' + p.id] = { place_id: d.id, name: d.name, lat: +d.ll[0].toFixed(6), lng: +d.ll[1].toFixed(6),
        our_lat: p.lat, our_lng: p.lng, off_m: Math.round(off), checked: stamp, by: 'osm+photon+google' };
      added++;
    }
  }
  console.log('   расхождений больше ' + FAR_M + ' м: ' + bad + ', записано в базу: ' + added);
  return bad;
}

if (require.main === module) {
  const arg = process.argv[2];
  const stamp = process.argv[3] || new Date().toISOString().slice(0, 10);
  const files = arg ? [arg] : fs.readdirSync(__dirname).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f));
  let db = {}; try { db = JSON.parse(fs.readFileSync(DB, 'utf8')); } catch (e) {}
  (async () => {
    let bad = 0;
    for (const f of files) bad += await checkRoute(path.join(__dirname, path.basename(f)), db, stamp);
    fs.writeFileSync(DB, JSON.stringify(db, null, 1));
    console.log('\nбаза проверенных мест: ' + Object.keys(db).length + ' записей → ' + DB);
    if (bad) console.log('⚠️  ' + bad + ' координат надо посмотреть глазами и поправить руками');
    process.exit(bad ? 1 : 0);
  })();
}
module.exports = { km };
