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

const N = 33000;                    /* точек на шаре */
const SRC = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json';
const PAGE = path.join(__dirname, 'index.html');
const MARK = 'const GLOBE_LAND=';
const MARK2 = 'const GLOBE_COAST=';
const TOL = 0.55;          /* насколько упрощаем береговую линию, в градусах */

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

/* ── БЕРЕГОВАЯ ЛИНИЯ ──
   Её просьба: «чтоб был обведён контур материков». Контур — это уже не точки, а
   линии, и целиком карта весила бы сотню килобайт. Поэтому упрощаем: выкидываем
   точки, которые почти лежат на прямой между соседями, и режем координаты до
   одного знака — это около 11 км, для шара с ладонь хватает с запасом. */
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const pair = stack.pop(), a = pair[0], b = pair[1];
    let far = -1, best = tol;
    const ax = pts[a][0], ay = pts[a][1], bx = pts[b][0], by = pts[b][1];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
      if (d > best) { best = d; far = i; }
    }
    if (far > 0) { keep[far] = true; stack.push([a, far], [far, b]); }
  }
  return pts.filter(function (_, i) { return keep[i]; });
}
/* ⚠️ ЗАМКНУТОЕ КОЛЬЦО УПРОЩАТЬ НАПРЯМУЮ НЕЛЬЗЯ. У кольца первая и последняя точки
   совпадают, отрезок между ними нулевой длины — и мерка «далеко ли точка от этого
   отрезка» даёт ноль для всех. Кольцо схлопывалось в две точки, и от материков
   оставалась пара обрывков. Поэтому режем кольцо надвое по самой дальней от начала
   точке и упрощаем две открытые половины. */
function simplifyRing(ring, tol) {
  let r = ring.slice();
  if (r.length > 3 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1]) r.pop();
  if (r.length < 4) return ring;
  let m = 1, best = -1;
  for (let i = 1; i < r.length; i++) {
    const d = Math.hypot(r[i][0] - r[0][0], r[i][1] - r[0][1]);
    if (d > best) { best = d; m = i; }
  }
  const a = simplify(r.slice(0, m + 1), tol);
  const b = simplify(r.slice(m).concat([r[0]]), tol);
  return a.concat(b.slice(1));
}
function packRings(polys) {
  const out = [];
  polys.forEach(function (poly) {
    poly.forEach(function (ring) {
      /* кольцо через шов ±180° режем: иначе линия протянется через весь шар */
      let part = [];
      for (let i = 0; i < ring.length; i++) {
        /* ⚠️ У Антарктиды кольцо замыкается по НИЖНЕМУ КРАЮ КАРТЫ (широта −90).
           На плоской карте это невидимая линия, а на шаре она стягивается в полюс
           и рисует поперёк материка треугольник. Такие точки выбрасываем. */
        if (ring[i][1] <= -89) { if (part.length > 2) out.push(part); part = []; continue; }
        if (i && Math.abs(ring[i][0] - ring[i - 1][0]) > 180) { if (part.length > 2) out.push(part); part = []; }
        part.push(ring[i]);
      }
      if (part.length > 2) out.push(part);
    });
  });
  return out.map(function (r) { return simplifyRing(r, TOL); })
            .filter(function (r) { return r.length > 2; })
            .map(function (r) { return r.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(';'); })
            .join('|');
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

  const coast = packRings(polys);
  console.log('  береговая линия: ' + Math.round(coast.length/1024) + ' КБ, кусков ' + coast.split('|').length);

  if (dry) { console.log('\n' + b64.slice(0, 120) + '…'); return; }

  const page = fs.readFileSync(PAGE, 'utf8');
  const i = page.indexOf(MARK);
  if (i < 0) { console.log('❌ в index.html нет строки ' + MARK); process.exit(1); }
  const j = page.indexOf('\n', i);
  const line = MARK + "'" + b64 + "';   /* суша: по биту на точку, считано globe-mask.js */";
  let out = page.slice(0, i) + line + page.slice(j);
  /* берег отдельной строкой — им обводится контур материков */
  const i2 = out.indexOf(MARK2);
  if (i2 < 0) { console.log('❌ в index.html нет строки ' + MARK2); process.exit(1); }
  const j2 = out.indexOf('\n', i2);
  out = out.slice(0, i2) + MARK2 + "'" + coast + "';   /* берег: упрощённые линии, считано globe-mask.js */" + out.slice(j2);
  fs.writeFileSync(PAGE, out, 'utf8');
  console.log('✅ вписано в index.html');
})().catch(e => { console.log('не вышло: ' + e.message); process.exit(1); });
