/* ==========================================================================
   МАТЕРИКИ ДЛЯ ШАРА НА ГЛАВНОЙ — СЧИТАЕМ ЗДЕСЬ, В БРАУЗЕР ОТДАЁМ ГОТОВОЕ

   Готовые «глобусы» из интернета тянут карту материков с чужого сервера (сотня
   килобайт) и подключают библиотеку d3, чтобы уже у человека в браузере считать,
   какие точки попали на сушу. Мы платили бы весом и зависели от чужого сервера.

   Поэтому здесь тот же приём, что с дорогами и часами работы: тяжёлое считаем
   заранее. Точки на шаре раскладываются спиралью Фибоначчи — одинаково и здесь,
   и в браузере, потому что формула детерминированная. Значит достаточно передать
   ОДИН БИТ на точку: суша или вода. Три тысячи точек = 375 байт, в base64 —
   полкилобайта текста вместо двухсот килобайт.

   Данные: Natural Earth 110m land (общественное достояние).

   Запуск (нужна сеть):
     node globe-mask.js            — посчитать и вписать в index.html
     node globe-mask.js --dry      — только показать, ничего не менять
   ========================================================================== */
const fs = require('fs'), path = require('path'), https = require('https');

const N = 4200;                    /* точек на шаре */
const SRC = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json';
const PAGE = path.join(__dirname, 'index.html');
const MARK = 'const GLOBE_LAND=';

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'kolibri-globe' } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) return res(get(r.headers.location));
      if (r.statusCode !== 200) return rej(new Error('ответ ' + r.statusCode));
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(d));
    }).on('error', rej);
  });
}

/* точки спиралью Фибоначчи — ТА ЖЕ формула, что в index.html */
function points(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / n);
    const th = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
    const x = Math.cos(th) * Math.sin(phi), y = Math.cos(phi), z = Math.sin(th) * Math.sin(phi);
    /* обратно в широту-долготу: тем же порядком осей, что и в отрисовке */
    const lat = 90 - Math.acos(y) * 180 / Math.PI;
    let lng = Math.atan2(z, -x) * 180 / Math.PI - 180;
    while (lng < -180) lng += 360;
    while (lng > 180) lng -= 360;
    out.push([lat, lng]);
  }
  return out;
}

/* луч вправо: сколько раз пересёк границу — нечётно, значит внутри */
function inRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inPoly(lng, lat, poly) {
  if (!inRing(lng, lat, poly[0])) return false;
  for (let k = 1; k < poly.length; k++) if (inRing(lng, lat, poly[k])) return false;  /* дырка (озеро) */
  return true;
}

(async () => {
  const dry = process.argv.indexOf('--dry') >= 0;
  console.log('беру карту материков…');
  const geo = JSON.parse(await get(SRC));
  const polys = [];
  (geo.features || []).forEach(f => {
    const g = f.geometry; if (!g) return;
    if (g.type === 'Polygon') polys.push(g.coordinates);
    else if (g.type === 'MultiPolygon') g.coordinates.forEach(p => polys.push(p));
  });
  console.log('  многоугольников суши: ' + polys.length);

  const pts = points(N);
  const bits = new Uint8Array(Math.ceil(N / 8));
  let land = 0;
  pts.forEach(([lat, lng], i) => {
    for (let k = 0; k < polys.length; k++) {
      if (inPoly(lng, lat, polys[k])) { bits[i >> 3] |= (1 << (i & 7)); land++; return; }
    }
  });
  const b64 = Buffer.from(bits).toString('base64');
  console.log('  точек всего: ' + N + ', на суше: ' + land + ' (' + Math.round(land / N * 100) + '%)');
  console.log('  строка данных: ' + b64.length + ' знаков');
  /* грубая проверка: суши на Земле около 29% — если вышло далеко не так,
     значит перепутаны оси, и глобус будет неправильный */
  const share = land / N;
  if (share < 0.2 || share > 0.4) console.log('  ⚠️ доля суши подозрительная — проверьте порядок осей');

  if (dry) { console.log('\n' + b64.slice(0, 120) + '…'); return; }

  const page = fs.readFileSync(PAGE, 'utf8');
  const i = page.indexOf(MARK);
  if (i < 0) { console.log('❌ в index.html нет строки ' + MARK); process.exit(1); }
  const j = page.indexOf('\n', i);
  const line = MARK + "'" + b64 + "';   /* суша: по биту на точку, считано globe-mask.js */";
  fs.writeFileSync(PAGE, page.slice(0, i) + line + page.slice(j), 'utf8');
  console.log('✅ вписано в index.html');
})().catch(e => { console.log('не вышло: ' + e.message); process.exit(1); });
