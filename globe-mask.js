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
const TOL = 0.38;          /* насколько упрощаем береговую линию, в градусах */

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
  /* ⚠️ ЗАМЫКАТЬ МОЖНО ТОЛЬКО НАСТОЯЩЕЕ КОЛЬЦО. Разрезав кольцо по шву ±180°, мы
     получаем ОТКРЫТУЮ цепочку, а «кольцевое» упрощение честно соединяло её конец
     с началом — и через полшара тянулась прямая. У Антарктиды это была длинная
     игла от края карты до полуострова: клиент её и обвела. Теперь смотрим, кольцо
     это или обрывок, и обрабатываем по-разному. */
  return out.map(function (r) {
    const closed = r.length > 3 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1];
    return closed ? simplifyRing(r, TOL) : simplify(r, TOL);
  })
            .filter(function (r) { return r.length > 2; })
            .map(function (r) { return r.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(';'); })
            .join('|');
}


/* ── ⚠️ ЗЕРНО НЕ ДОЛЖНО КАСАТЬСЯ БЕРЕГА ──────────────────────────────────
   Её правка 04.08: «граница местами идёт прямо по точкам, и точки есть за
   границей. Надо, чтобы все точки были внутри, а от границы до точки было не
   меньше половины расстояния между точками».
   Считаем так: расстояние между соседними точками спирали ≈ корень из (4π/N) —
   это шаг сетки. Половину шага берём как запас и выбрасываем те точки суши,
   что ближе к берегу. Чтобы не сверять каждую точку с каждым отрезком берега
   (это тридцать миллионов пар), раскладываем отрезки по ячейкам 5°×5° и
   смотрим только соседние ячейки. */
function nearCoast(parts, stepDeg) {
  const CELL = 5, grid = new Map();
  const key = (a, b) => a + ':' + b;
  const add = (seg) => {
    const x0 = Math.floor(Math.min(seg[0], seg[2]) / CELL), x1 = Math.floor(Math.max(seg[0], seg[2]) / CELL);
    const y0 = Math.floor(Math.min(seg[1], seg[3]) / CELL), y1 = Math.floor(Math.max(seg[1], seg[3]) / CELL);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
      const k = key(x, y); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(seg);
    }
  };
  parts.forEach(p => { for (let i = 1; i < p.length; i++) add([p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]]); });
  /* расстояние от точки до отрезка; долготу сжимаем по широте, иначе у полюсов
     градус долготы «длиннее», чем он есть на самом деле */
  const dist = (lng, lat, s) => {
    const kx = Math.cos(lat * Math.PI / 180);
    const ax = (s[0] - lng) * kx, ay = s[1] - lat, bx = (s[2] - lng) * kx, by = s[3] - lat;
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    let t = L ? -(ax * dx + ay * dy) / L : 0;
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    const px = ax + dx * t, py = ay + dy * t;
    return Math.hypot(px, py);
  };
  /* отдаём РАССТОЯНИЕ до берега, а не «да/нет»: по нему видно, какая точка
     острова самая серединная — её и вернём, если отступ съел весь остров */
  return (lng, lat) => {
    const cx = Math.floor(lng / CELL), cy = Math.floor(lat / CELL);
    let best = 1e9;
    for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) {
      const arr = grid.get(key(x, y)); if (!arr) continue;
      for (let i = 0; i < arr.length; i++) { const d = dist(lng, lat, arr[i]); if (d < best) best = d; }
    }
    return best;
  };
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

  const coast = packRings(polys);
  /* отступ считаем от ТОГО ЖЕ берега, который рисуется, а не от исходной карты */
  const parts = coast.split('|').map(function (p) {
    return p.split(';').map(function (t) { const c = t.split(','); return [+c[0], +c[1]]; });
  });
  /* шаг сетки точек и половина шага — обещанный запас до берега */
  const stepDeg = Math.sqrt(4 * Math.PI / N) * 180 / Math.PI;
  const gap = stepDeg / 2;
  console.log('  шаг между точками: ' + stepDeg.toFixed(2) + '°, отступ от берега: ' + gap.toFixed(2) + '°');
  const coastDist = nearCoast(parts, gap);

  const pts = points(N);
  const bits = new Uint8Array(Math.ceil(N / 8));
  let land = 0, trimmed = 0;
  /* по каждому куску суши помним: сколько зерна оставили и что выбросили */
  const isle = new Map();   /* номер многоугольника → {kept, cut:[{i,d}]} */
  pts.forEach(([lat, lng], i) => {
    for (let k = 0; k < polys.length; k++) {
      if (inPoly(lng, lat, polys[k])) {
        if (!isle.has(k)) isle.set(k, { kept: 0, cut: [] });
        const rec = isle.get(k);
        const d = coastDist(lng, lat);
        /* ⚠️ у самого берега точку не ставим: иначе линия идёт прямо по зерну,
           а часть точек оказывается снаружи — это и увидела клиент */
        if (d < gap) { trimmed++; rec.cut.push({ i: i, d: d }); return; }
        bits[i >> 3] |= (1 << (i & 7)); land++; rec.kept++; return;
      }
    }
  });
  console.log('  убрано у берега: ' + trimmed + ' точек');
  /* ⚠️ ОСТРОВ С КОНТУРОМ НЕ БЫВАЕТ ПУСТЫМ ВНУТРИ.
     Её правка 04.08 по скрину: «пусть просвечивают точки, которые внутри
     границы» — она обвела Японию и Сулавеси, у которых был контур и ни одной
     точки. Виноват отступ от берега: у острова уже, чем шаг сетки, он съедает
     ВСЁ зерно, и остаётся пустой обвод. Возвращаем самые серединные точки —
     правило отступа при этом не нарушается зря: без них остров выглядит дырой. */
  let saved = 0, isles = 0;
  isle.forEach(rec => {
    if (rec.kept || !rec.cut.length) return;
    isles++;
    rec.cut.sort((a, b) => b.d - a.d);
    const take = rec.cut.length >= 6 ? 3 : 1;
    for (let t = 0; t < take && t < rec.cut.length; t++) {
      const i = rec.cut[t].i;
      if (bits[i >> 3] & (1 << (i & 7))) continue;
      bits[i >> 3] |= (1 << (i & 7)); land++; trimmed--; saved++;
    }
  });
  console.log('  островов, оставшихся без зерна: ' + isles + ' → вернули ' + saved + ' точек');
  /* а эти острова мельче шага сетки: внутрь не попала НИ ОДНА точка спирали,
     вернуть нечего. Считаем и говорим вслух — чтобы «пустой обвод» на шаре
     не был для нас неожиданностью во второй раз. */
  let tiny = 0;
  for (let k = 0; k < polys.length; k++) if (!isle.has(k)) tiny++;
  console.log('  мельче шага сетки (контур без зерна): ' + tiny + ' из ' + polys.length);
  const b64 = Buffer.from(bits).toString('base64');
  console.log('  точек всего: ' + N + ', на суше: ' + land + ' (' + Math.round(land / N * 100) + '%)');
  console.log('  строка данных: ' + b64.length + ' знаков');
  /* грубая проверка: суши на Земле около 29% — если вышло далеко не так,
     значит перепутаны оси, и глобус будет неправильный */
  const share = land / N;
  if (share < 0.2 || share > 0.4) console.log('  ⚠️ доля суши подозрительная — проверьте порядок осей');

  /* ⚠️ ПРОВЕРКА НА «ИГЛЫ». Настоящий берег не прыгает: соседние точки рядом.
     Длинный отрезок означает, что мы случайно соединили несоединимое — так на
     шаре и появилась прямая через полмира у Антарктиды, и заметил её человек, а
     не я. Теперь это видно сразу здесь. */
  let jumps = 0;
  coast.split('|').forEach(function (part) {
    const p = part.split(';').map(function (t) { return t.split(',').map(Number); });
    for (let k = 1; k < p.length; k++) {
      if (Math.abs(p[k][0] - p[k - 1][0]) > 25 || Math.abs(p[k][1] - p[k - 1][1]) > 15) jumps++;
    }
  });
  console.log('  проверка на «иглы»: ' + (jumps ? ('⚠️ ' + jumps + ' подозрительных отрезков') : 'чисто'));
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
