/* ==========================================================================
   ЕДА НА МАРШРУТЕ — из карты, вокруг точек дня

   Запуск:  node food-nearby.js trip-colorado.js
            node food-nearby.js                  (все маршруты подряд)

   Зачем. Её разделение: подборка города и еда на маршруте — РАЗНЫЕ списки.
   «Шесть мест на главной — это наши лучшие рекомендации, они могут быть даже
   не на нашем маршруте. Но на маршруте должны быть ещё рестораны, и они должны
   подбираться под точки дня». Пока их не было, карточка перерыва в Меса-Верде
   писала «в нашей подборке рядом ничего нет» — а еда там есть, просто мы её не
   собирали.

   Что делает: обходит точки каждого дня и берёт из OpenStreetMap заведения
   вокруг них — пешком в 400 метрах, на машине в 3 километрах. Кладёт их в файл
   маршрута блоком FOODNEAR, по дням.

   Чем отбираем — БЕСПЛАТНЫМИ признаками (её решение: «пока только бесплатно,
   без Google»): есть ли имя, кухня, часы работы, сайт, телефон. Оценок у OSM
   нет, и мы их не выдумываем. Поэтому среди набранного попадётся среднее — это
   осознанный размен, записанный в правилах.
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const UA = 'planner-food-nearby/1.0 (personal trip planner, one-off run)';
const PAUSE = 6000;        /* общий бесплатный сервер — идём медленно */
const WALK_R = 400;        /* пешком: столько человек отойдёт от точки */
const CAR_R = 3000;        /* на машине: столько не крюк */
const PER_DAY = 14;        /* по паре мест на точку дня: иначе у дальнего конца дня еды не остаётся */

const KINDS = 'restaurant|cafe|fast_food|pub|bar|bakery|ice_cream|biergarten';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const R = 6371, rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function load(file) {
  const src = fs.readFileSync(file, 'utf8');
  const S = {};
  const names = ['BASES', 'DAYS', 'DAY_BASE', 'P', 'CITYMOVE', 'FOODCITIES'];
  const grab = names.map(n => `S.${n}=typeof ${n}!=='undefined'?${n}:undefined;`).join('');
  new Function('S', 'with(S){' + src + ';' + grab + '}')(S);
  return S;
}

/* один запрос на весь день: несколько кругов вокруг точек сразу */
async function around(pts, r) {
  const parts = pts.map(p => `nwr["amenity"~"^(${KINDS})$"]["name"](around:${r},${p.lat},${p.lng});`).join('\n  ');
  const q = `[out:json][timeout:60];\n(\n  ${parts}\n);\nout center 200;`;
  let t = '', st = 0;
  for (let a = 0; a < 3; a++) {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST', body: 'data=' + encodeURIComponent(q),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(90000)
    });
    t = await res.text(); st = res.status;
    if (/^\s*\{/.test(t) && !/"remark"/.test(t)) break;
    await sleep(15000);
  }
  if (!/^\s*\{/.test(t) || /"remark"/.test(t)) throw new Error('Overpass ' + st);
  return (JSON.parse(t).elements || []).map(e => {
    const g = e.tags || {};
    return {
      nm: g.name, kind: g.amenity,
      cuisine: (g.cuisine || '').split(';')[0].replace(/_/g, ' '),
      hours: g.opening_hours || '', site: g['website'] || g['contact:website'] || '',
      phone: g.phone || g['contact:phone'] || '', veg: g['diet:vegetarian'] || '',
      lat: e.lat != null ? e.lat : (e.center || {}).lat,
      lng: e.lon != null ? e.lon : (e.center || {}).lng || (e.center || {}).lon
    };
  }).filter(x => x.nm && x.lat != null && x.lng != null);
}

/* признаки, по которым отбираем без оценок: заполненность карточки в карте.
   Тот, кто указал кухню, часы и сайт, — как правило, живое и работающее место */
function score(f, dist) {
  let s = 0;
  if (f.cuisine) s += 2;
  if (f.hours) s += 2;
  if (f.site) s += 1;
  if (f.phone) s += 1;
  if (f.veg === 'yes' || f.veg === 'only') s += 1;
  if (f.kind === 'restaurant' || f.kind === 'cafe') s += 1;
  return s - dist / 1000;                 /* каждый километр крюка — минус балл */
}

async function doFile(file) {
  const S = load(file);
  const { P, DAY_BASE } = S;
  const CITYMOVE = S.CITYMOVE || {};
  if (!P) { console.log('  нет точек — пропускаю'); return; }
  const days = [...new Set(P.filter(p => p.cat !== 'food').map(p => p.d))].sort((a, b) => a - b);
  const rows = [];
  let total = 0;
  for (const day of days) {
    const pts = P.filter(p => p.d === day && p.cat !== 'food'
      && typeof p.lat === 'number' && typeof p.lng === 'number');
    if (!pts.length) continue;
    const mv = CITYMOVE[(DAY_BASE || {})[day]] || '';
    const car = mv ? /^car/.test(mv) : true;
    let found;
    try { found = await around(pts, car ? CAR_R : WALK_R); }
    catch (e) { console.log('  день ' + day + ': не спросили (' + e.message + ')'); continue; }
    await sleep(PAUSE);
    /* к какой точке дня ближе всего и насколько — это и есть «на маршруте» */
    const seen = {};
    const list = [];
    found.forEach(f => {
      let best = null;
      pts.forEach(p => {
        const d = km(p.lat, p.lng, f.lat, f.lng) * 1000;
        if (!best || d < best.d) best = { d: Math.round(d), id: p.id };
      });
      const key = f.nm.toLowerCase() + '|' + f.lat.toFixed(3);
      if (seen[key]) return;
      seen[key] = 1;
      list.push(Object.assign({}, f, { near: best.id, d: best.d, sc: score(f, best.d) }));
    });
    list.sort((a, b) => b.sc - a.sc);
    const keep = list.slice(0, PER_DAY);
    if (!keep.length) { console.log('  день ' + day + ': рядом с точками еды в карте нет'); continue; }
    total += keep.length;
    rows.push(' ' + day + ':[' + keep.map(f => JSON.stringify({
      nm: f.nm, lat: +f.lat.toFixed(5), lng: +f.lng.toFixed(5), kind: f.kind,
      cuisine: f.cuisine || undefined, hours: f.hours || undefined,
      near: f.near, d: f.d
    })).join(',') + '],');
    console.log('  день ' + day + ': ' + keep.length + ' мест · '
      + keep.slice(0, 3).map(f => f.nm + ' (' + f.d + ' м)').join(', '));
  }
  if (!rows.length) { console.log('  ничего не набралось'); return; }

  const MARK_A = '/* ── ЕДА НА МАРШРУТЕ ── собрано food-nearby.js по OpenStreetMap ── */';
  const MARK_B = '/* ── конец еды на маршруте ── */';
  const block = MARK_A + '\nconst FOODNEAR={\n' + rows.join('\n') + '\n};\n' + MARK_B;
  let src = fs.readFileSync(file, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  const b = block.split('\n').join(nl);
  const from = src.indexOf(MARK_A);
  if (from >= 0) {
    const to = src.indexOf(MARK_B, from);
    src = src.slice(0, from) + b + src.slice(to + MARK_B.length);
  } else {
    src = src.replace(/\s*$/, '') + nl + nl + b + nl;
  }
  fs.writeFileSync(file, src);
  console.log('  ✅ записано ' + total + ' мест на маршруте');
}

(async () => {
  const arg = process.argv[2];
  const files = arg ? [arg] : fs.readdirSync(__dirname).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f));
  for (const f of files) {
    console.log('\n=== ' + path.basename(f) + ' ===');
    await doFile(path.join(__dirname, path.basename(f)));
  }
})();
