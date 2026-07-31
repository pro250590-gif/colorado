/* ==========================================================================
   КООРДИНАТЫ ЗАВЕДЕНИЙ — вместо кружка вокруг центра города

   Запуск:  node food-coords.js trip-milan.js
            node food-coords.js                 (все маршруты подряд)

   Зачем. У заведений в FOODCITIES координат не было вообще: движок раскидывал
   их по окружности вокруг центра города радиусом ~600 метров. На карте это
   выглядело правдоподобно и было выдумкой — точка стояла там, где её положил
   круг. И это же мешало главному: без настоящих координат не понять, где еда
   относительно точек дня, а её нужно встраивать в цепочку.

   Чем ищем — три открытых источника на данных OpenStreetMap, без ключей:
     · Overpass  — поиск по имени вокруг центра города, только заведения
                   (amenity/shop): самый точный, знает «Panificio Luini»;
     · Photon    — поиск с привязкой к координате города;
     · Nominatim — обычный поиск «название, город».

   Когда принимаем координату:
     · два источника сошлись ближе 300 метров — берём;
     · один источник, но имя совпало почти дословно и это заведение — берём;
     · иначе НЕ БЕРЁМ. Пустое поле честнее выдуманного: движок покажет такую
       точку примерной и скажет об этом прямо.

   Google сюда не зовём: его ответы нельзя хранить дольше 30 дней, а нам нужно
   именно хранить (то же правило, из-за которого мы не держим оценки мест).
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const UA = 'planner-food-coords/1.0 (personal trip planner, one-off run)';
/* ⚠️ Overpass отвечает 429, если частить, а ошибку легко принять за «места нет
   в OSM»: в первом прогоне так потерялся Mr Grumpy's Brewing — он там есть.
   Поэтому пауза длинная, при 429 ждём и повторяем, а неудачу источника пишем
   в лог: «не нашли» и «не смогли спросить» — разные вещи. */
const PAUSE_OVP = 8000;
const PAUSE_WEB = 1200;    /* Nominatim просит не чаще раза в секунду */
const NEAR_KM = 0.3;       /* два источника ближе трёхсот метров — это одно место */
const MAX_KM = 25;         /* дальше от центра города заведение искать бессмысленно */

const FOOD = /^(restaurant|cafe|bar|fast_food|pub|bakery|ice_cream|biergarten|food_court|deli|confectionery|pastry|coffee|tea|seafood|butcher|greengrocer|marketplace)$/;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const R = 6371, rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* имена сравниваем по словам: «Osteria Gloria» и «Gloria Osteria» — одно место,
   «Trattoria della Gloria» — уже другое */
const norm = s => String(s || '').toLowerCase()
  .replace(/[’'`´]/g, '').replace(/[^a-zà-ÿа-я0-9]+/gi, ' ').trim();
const words = s => norm(s).split(' ').filter(w => w.length > 1);
function nameScore(a, b) {
  const A = words(a), B = words(b);
  if (!A.length || !B.length) return 0;
  const hit = A.filter(w => B.indexOf(w) >= 0).length;
  return hit / Math.max(A.length, B.length);
}
/* Характерные слова названия — по ним ищем в Overpass. Ищем сразу по всем:
   «Luini Panzerotti» в OSM записан как «Panificio Luini», и по одному самому
   длинному слову («panzerotti») находилась чужая закусочная в другом районе. */
function keyWords(nm) {
  const w = words(nm).filter(x => !/^(the|la|le|il|el|de|del|di|da|und|and|cafe|caff|bar|restaurant|osteria|trattoria|ristorante|pizzeria|gelateria|panificio)$/.test(x));
  return (w.length ? w : words(nm)).sort((a, b) => b.length - a.length).slice(0, 3);
}

async function overpass(nm, lat, lng) {
  const w = keyWords(nm).map(x => x.replace(/["\\]/g, '')).join('|');
  const q = `[out:json][timeout:25];
(
  nwr["name"~"${w}",i]["amenity"](around:25000,${lat},${lng});
  nwr["name"~"${w}",i]["shop"](around:25000,${lat},${lng});
);
out center 12;`;
  let t = '', st = 0;
  for (let a = 0; a < 3; a++) {
    const r = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST', body: 'data=' + encodeURIComponent(q),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(45000)
    });
    t = await r.text(); st = r.status;
    /* ⚠️ Overpass умеет отвечать JSON-ом с пустым списком И припиской remark:
       «query timed out». Без этой проверки отказ сервера выглядел как «такого
       места в карте нет» — самая опасная из молчаливых ошибок */
    if (/^\s*\{/.test(t) && !/"remark"/.test(t)) break;
    st = /"remark"/.test(t) ? 'сервер не справился с запросом' : st;
    await sleep(12000);                       /* сервер попросил подождать — ждём */
  }
  if (!/^\s*\{/.test(t) || /"remark"/.test(t)) throw new Error('Overpass ' + st);
  return (JSON.parse(t).elements || []).map(e => ({
    src: 'osm', nm: (e.tags || {}).name,
    kind: (e.tags || {}).amenity || (e.tags || {}).shop,
    lat: e.lat != null ? e.lat : (e.center || {}).lat,
    lng: e.lon != null ? e.lon : (e.center || {}).lon
  })).filter(x => x.lat != null);
}

async function photon(nm, city, lat, lng) {
  const u = 'https://photon.komoot.io/api/?limit=6&lat=' + lat + '&lon=' + lng
    + '&q=' + encodeURIComponent(nm + ' ' + city);
  const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  const j = await r.json();
  return (j.features || []).map(f => ({
    src: 'photon', nm: f.properties.name, kind: f.properties.osm_value,
    lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0]
  }));
}

async function nominatim(nm, city) {
  const u = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q='
    + encodeURIComponent(nm + ', ' + city);
  const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  const j = await r.json();
  return (Array.isArray(j) ? j : []).map(x => ({
    src: 'nominatim', nm: (x.name || x.display_name || '').split(',')[0], kind: x.type,
    lat: +x.lat, lng: +x.lon
  }));
}
/* тот же Nominatim, но поиском ТОЛЬКО по названию в рамке вокруг города: так
   находятся места, чей адрес записан не тем городом, что у нас в подборке
   (посёлок рядом, другой район) */
async function nominatimBox(nm, lat, lng) {
  const d = 0.35;
  const u = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&bounded=1'
    + '&viewbox=' + (lng - d) + ',' + (lat + d) + ',' + (lng + d) + ',' + (lat - d)
    + '&q=' + encodeURIComponent(nm);
  const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  const j = await r.json();
  return (Array.isArray(j) ? j : []).map(x => ({
    src: 'nominatim-box', nm: (x.name || x.display_name || '').split(',')[0], kind: x.type,
    lat: +x.lat, lng: +x.lon
  }));
}

/* из всех находок выбираем ту, за которую можно поручиться */
function pick(cands, nm, lat, lng) {
  const ok = cands.filter(c => FOOD.test(c.kind || '') && km(lat, lng, c.lat, c.lng) <= MAX_KM);
  if (!ok.length) return null;
  ok.forEach(c => { c.score = nameScore(nm, c.nm); });
  ok.sort((a, b) => (b.score - a.score) || (km(lat, lng, a.lat, a.lng) - km(lat, lng, b.lat, b.lng)));
  const best = ok[0];
  if (best.score < 0.5) return null;                     /* имя не то — не выдумываем */
  const agree = ok.filter(c => c !== best && c.src !== best.src
    && c.score >= 0.5 && km(best.lat, best.lng, c.lat, c.lng) <= NEAR_KM);
  const sources = [best.src].concat(agree.map(c => c.src));
  /* Один источник принимаем при дословном совпадении имени. Отдельно — Overpass:
     он искал ПО ИМЕНИ вокруг центра города, и если длинное характерное слово
     совпало и место рядом, это оно и есть. Так нашёлся «Panificio Luini» —
     в OSM он записан не так, как в путеводителе, но «Luini» в двух шагах от
     собора один. Короткие слова сюда не пускаем: по «piz» найдётся пиццерия. */
  const shared = keyWords(nm).filter(w => w.length >= 5 && words(best.nm).indexOf(w) >= 0);
  const osmSure = best.src === 'osm' && shared.length > 0 && km(lat, lng, best.lat, best.lng) <= 3;
  if (!agree.length && best.score < 0.99 && !osmSure) return null;
  return { lat: +best.lat.toFixed(5), lng: +best.lng.toFixed(5), nm: best.nm,
           kind: best.kind, sources, score: best.score };
}

function load(file) {
  const src = fs.readFileSync(file, 'utf8');
  const S = {};
  new Function('S', 'with(S){' + src + ';S.FOODCITIES=(typeof FOODCITIES!=="undefined")?FOODCITIES:[];}')(S);
  return S;
}

/* вписываем lat/lng прямо в запись заведения, по имени — записи однострочные */
function writeSpot(file, cityName, spotName, lat, lng) {
  let src = fs.readFileSync(file, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  const lines = src.split(/\r?\n/);
  let hit = false;
  /* ⚠️ апостроф в названии в файле экранирован: {nm:'Maggie\'s Kitchen'}.
     Ищем с необязательной обратной косой и НЕ пересобираем строку заново, а
     дописываем к найденному куску — иначе экранирование потеряется и файл
     развалится. Так и вышло у Maggie's Kitchen, Kip's Grill и Rosie's. */
  /* а ещё название с апострофом иногда взято в ДВОЙНЫЕ кавычки: {nm:"Maggie's
     Kitchen"} — принимаем оба вида кавычек */
  const esc = spotName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "\\\\?'");
  const re = new RegExp("\\{nm:(['\"])" + esc + "\\1");
  for (let i = 0; i < lines.length; i++) {
    if (!re.test(lines[i])) continue;
    if (/lat:/.test(lines[i])) { hit = true; break; }          /* уже стоит */
    lines[i] = lines[i].replace(re, m => m + ',lat:' + lat + ',lng:' + lng);
    hit = true;
    break;
  }
  if (hit) fs.writeFileSync(file, lines.join(nl));
  return hit;
}

/* ⚠️ ПРАВИЛО КЛИЕНТА: заведение без подтверждённой координаты из подборки
   убираем совсем. «Если мы не нашли — мы про него ничего не знаем: ни где оно,
   ни работает ли оно вообще. Приблизительную точку не пишем». Полуправда хуже
   пустоты, поэтому такие записи вычищаются из файла целиком. */
function prune(file) {
  const { FOODCITIES } = load(file);
  const dead = [];
  (FOODCITIES || []).forEach(c => (c.spots || []).forEach(sp => {
    if (typeof sp.lat !== 'number') dead.push({ city: c.city, nm: sp.nm });
  }));
  if (!dead.length) { console.log('  убирать нечего — у всех заведений есть точка'); return; }
  let src = fs.readFileSync(file, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  let lines = src.split(/\r?\n/);
  dead.forEach(d => {
    const esc = d.nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "\\\\?'");
    const re = new RegExp("\\{nm:(['\"])" + esc + "\\1");
    const i = lines.findIndex(L => re.test(L));
    if (i >= 0) lines.splice(i, 1);
    else console.log('   ! не нашёл строку: ' + d.nm);
  });
  /* после удаления последней записи в списке остаётся висячая запятая */
  src = lines.join(nl).replace(/,(\s*\])/g, '$1');
  fs.writeFileSync(file, src);
  dead.forEach(d => console.log('   × убрано: ' + d.nm + ' (' + d.city + ')'));
  console.log('  убрано без подтверждённой точки: ' + dead.length);
}

async function doFile(file) {
  if (process.argv.indexOf('--prune') >= 0) return prune(file);
  const { FOODCITIES } = load(file);
  if (!FOODCITIES || !FOODCITIES.length) { console.log('  еды в маршруте нет'); return; }
  let found = 0, kept = 0, miss = 0;
  for (const c of FOODCITIES) {
    const spots = c.spots || c.items || [];
    for (const s of spots) {
      if (typeof s.lat === 'number') { kept++; continue; }
      const cands = [];
      const failed = [];
      try { cands.push(...await overpass(s.nm, c.lat, c.lng)); } catch (e) { failed.push('OSM: ' + e.message); }
      await sleep(PAUSE_OVP);
      try { cands.push(...await photon(s.nm, c.city, c.lat, c.lng)); } catch (e) { failed.push('Photon'); }
      await sleep(PAUSE_WEB);
      try { cands.push(...await nominatim(s.nm, c.q || c.city)); } catch (e) { failed.push('Nominatim'); }
      await sleep(PAUSE_WEB);
      try { cands.push(...await nominatimBox(s.nm, c.lat, c.lng)); } catch (e) { failed.push('Nominatim-box'); }
      await sleep(PAUSE_WEB);
      const got = pick(cands, s.nm, c.lat, c.lng);
      if (!got) { miss++; console.log('   — ' + s.nm + ' (' + c.city + '): не нашли, оставляю без точки'
        + (failed.length ? '  [не ответили: ' + failed.join(', ') + ']' : '')); continue; }
      const ok = writeSpot(file, c.city, s.nm, got.lat, got.lng);
      if (!ok) { miss++; console.log('   — ' + s.nm + ': не нашёл строку в файле'); continue; }
      found++;
      console.log('   ✓ ' + s.nm + ' → ' + got.lat + ',' + got.lng
        + ' (' + got.kind + ', ' + got.sources.join('+') + ', имя ' + Math.round(got.score * 100) + '%, '
        + km(c.lat, c.lng, got.lat, got.lng).toFixed(1) + ' км от центра)');
    }
  }
  console.log('  итого: поставлено ' + found + ', было ' + kept + ', без точки ' + miss);
}

(async () => {
  const arg = process.argv[2];
  const files = arg ? [arg] : fs.readdirSync(__dirname).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f));
  for (const f of files) {
    console.log('\n=== ' + path.basename(f) + ' ===');
    await doFile(path.join(__dirname, path.basename(f)));
  }
})();
