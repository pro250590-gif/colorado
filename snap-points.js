/* ==========================================================================
   ТОЧКА ДОЛЖНА СТОЯТЬ ТАМ, ГДЕ К НЕЙ ПОДЪЕЗЖАЮТ

   Запуск:  node snap-points.js trip-colorado.js
            node snap-points.js trip-colorado.js --apply
            node snap-points.js                        (все маршруты)

   Её слова 02.08: «это не должно быть вопросом, система должна решать сама».
   Речь про Yankee Boy Basin: точка стояла в стороне от проезжей части, и
   маршрутизатор не находил к ней дороги — время до неё считалось прикидкой, а
   не по дороге. Раньше я бы спросила «поправить?»; теперь это делает инструмент.

   Как считаем. У OSRM есть ответ «ближайшая точка дорожной сети» (/nearest).
   Если наша координата дальше 300 метров от дороги — человек туда не подъедет,
   и мы двигаем точку на этот съезд. Ограничения, чтобы не наглупить:
     · двигаем не дальше 3 км — иначе это уже другое место, разбираются руками;
     · не трогаем точки с полем `pin` (там сказано, почему координата такая) и
       те, к которым добираются пешком/катером/поездом (`hop`);
     · пешеходные города считаем пешей сетью, автомобильные — автомобильной.

   Дальше трёх километров от дорог сами не двигаем, но и «зовём человека» — это
   не про клиента: клиент этого не видит НИКОГДА. Сначала пробуем проверенную
   координату из places-db (её ставил справочник), а если и она в поле — пишем
   измеренный факт в pin: «дорог рядом нет, ближайшая в N км, время прикидкой».
   К человеку (нам, на сборке) вопрос уходит только если координаты нет вовсе.
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const SNAP_M = 300;        /* дальше этого от дороги — точка «в поле» */
const MOVE_MAX_M = 3000;   /* дальше этого не двигаем: это уже другое место */
const PAUSE = 1200;
/* проверенные координаты: их ставил справочник (verify-coords.js) */
let DB = {};
try { DB = JSON.parse(fs.readFileSync(path.join(__dirname, 'places-db.json'), 'utf8')); } catch (e) {}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const R = 6371, rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function load(file) {
  const src = fs.readFileSync(file, 'utf8'); const S = {};
  new Function('S', 'with(S){' + src + ';S.P=P;S.BASES=BASES;S.DAY_BASE=DAY_BASE;'
    + 'S.CITYMOVE=typeof CITYMOVE!=="undefined"?CITYMOVE:{};}')(S);
  S.src = src;
  return S;
}

async function nearest(profile, lat, lng) {
  const u = 'https://routing.openstreetmap.de/' + profile + '/nearest/v1/driving/'
    + lng + ',' + lat + '?number=1';
  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(u, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(30000) });
      const j = await res.json();
      const w = (j.waypoints || [])[0];
      if (w && w.location) return { lat: w.location[1], lng: w.location[0], d: w.distance };
    } catch (e) { /* сеть моргнула — пробуем ещё */ }
    await sleep(3000);
  }
  return null;
}

async function doFile(file, apply) {
  const S = load(file);
  const P = S.P || [];
  const moves = [], notes = [];
  for (const p of P) {
    if (p.cat === 'food' || typeof p.lat !== 'number') continue;
    if (p.pin) continue;                 /* координата поставлена нами намеренно */
    if (p.hop) continue;                 /* добираются катером, поездом, пешком по тропе */
    /* у вокзала и аэропорта координата — это терминал или платформа, а не
       ближайшая дорога: там своя логика, трогать нельзя */
    if (p.cat === 'transport') continue;
    const bid = (S.DAY_BASE || {})[p.d];
    const mv = (S.CITYMOVE || {})[bid] || '';
    const car = mv ? /^car/.test(mv) : true;
    const near = await nearest(car ? 'routed-car' : 'routed-foot', p.lat, p.lng);
    await sleep(PAUSE);
    if (!near) { console.log('  ' + p.nm + ': не спросили про дорогу — пропускаю'); continue; }
    if (near.d <= SNAP_M) continue;
    if (near.d > MOVE_MAX_M) {
      /* ⚠️ ДАЛЬШЕ ТРЁХ КИЛОМЕТРОВ ОТ ДОРОГИ — САМИ НЕ ДВИГАЕМ, но и человека
         дёргать не спешим: сперва пробуем ПРОВЕРЕННУЮ координату из places-db
         (её ставил справочник, а не автор). Встала у дороги — берём её. */
      const rec = DB[path.basename(file).replace(/^trip-|\.js$/g, '') + ':' + p.id];
      if (rec && typeof rec.lat === 'number') {
        const alt = await nearest(car ? 'routed-car' : 'routed-foot', rec.lat, rec.lng);
        await sleep(PAUSE);
        if (alt && alt.d <= SNAP_M) {
          moves.push({ p: p, to: { lat: rec.lat, lng: rec.lng }, d: Math.round(near.d) });
          console.log('  ' + p.nm + ': наша точка в ' + (near.d / 1000).toFixed(1)
            + ' км от дорог, а проверенная стоит у дороги — беру проверенную');
          continue;
        }
      }
      /* и справочник далеко — значит место правда без подъезда: пишем это
         словами в pin, чтобы время честно считалось прикидкой, а проверка не
         ругалась вслепую. Ошибкой это станет только если координаты нет вовсе */
      notes.push({ p: p, d: near.d });
      console.log('  ' + p.nm + ': дорог рядом нет (ближайшая ' + (near.d / 1000).toFixed(1)
        + ' км) — пишу это в данные, время до неё останется прикидкой');
      continue;
    }
    moves.push({ p: p, to: near, d: Math.round(near.d) });
    console.log('  ' + p.nm + ': дорога в ' + Math.round(near.d) + ' м — двигаю к съезду '
      + near.lat.toFixed(5) + ',' + near.lng.toFixed(5));
  }
  if (!moves.length && !notes.length) { console.log('  все точки стоят у дороги'); return; }
  if (!apply) { console.log('  (это черновик; чтобы применить — добавьте --apply)'); return; }

  let src = S.src;
  /* точкам без подъезда дописываем причину — ту, что ИЗМЕРИЛИ, а не выдумали */
  notes.forEach(n => {
    if (n.p.pin) return;
    const rx = new RegExp("(\{id:'" + n.p.id + "'[^\n]*?)(,nm:)");
    if (!rx.test(src)) return;
    src = src.replace(rx, (m, a, b) => a + ",pin:'дорог рядом нет: ближайшая в " + (n.d / 1000).toFixed(1) + " км, время до точки — прикидка'" + b);
  });
  moves.forEach(m => {
    const rx = new RegExp("(\\{id:'" + m.p.id + "'[^\\n]*?lat:)(-?[\\d.]+)(,lng:)(-?[\\d.]+)");
    if (!rx.test(src)) { console.log('  ⚠ не нашла строку места ' + m.p.id); return; }
    src = src.replace(rx, () => "{id:'" + m.p.id + "'" + src.match(rx)[0]
      .replace(new RegExp("^\\{id:'" + m.p.id + "'"), '')
      .replace(/lat:-?[\d.]+/, 'lat:' + m.to.lat.toFixed(6))
      .replace(/,lng:-?[\d.]+/, ',lng:' + m.to.lng.toFixed(6)));
  });
  fs.writeFileSync(file, src);
  console.log('  ✅ подвинуто точек: ' + moves.length
    + '. Теперь пересчитайте дороги: node road-times.js ' + path.basename(file));
}

(async () => {
  const args = process.argv.slice(2);
  const apply = args.indexOf('--apply') >= 0;
  const arg = args.filter(a => a.charAt(0) !== '-')[0];
  const files = arg ? [arg] : fs.readdirSync(__dirname)
    .filter(f => /^trip-[a-z0-9-]+\.js$/.test(f) && f !== 'trip-TEMPLATE.js');
  for (const f of files) {
    console.log('\n=== ' + path.basename(f) + ' ===');
    await doFile(path.join(__dirname, path.basename(f)), apply);
  }
})();
