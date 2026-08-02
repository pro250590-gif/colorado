/* ==========================================================================
   ДОРОГА ПО ДОРОГЕ, А НЕ ПО ПРЯМОЙ

   Запуск:  node road-times.js trip-colorado.js
            node road-times.js                  (все маршруты подряд)

   Зачем. Движок до сих пор считал расстояние между точками по прямой и
   добавлял четверть «на извилины». Замечание клиента: «дорогу надо считать
   по дороге, почему мы так не делаем изначально». Она права: на дне
   Меса-Верде в шапке стоит ~85 км, а прямая с надбавкой давала 59,7.

   Почему это можно считать заранее. Маршрут — не живые данные: точки не
   двигаются. Значит дорогу считаем ОДИН РАЗ, здесь, и кладём числом в файл
   маршрута — ровно как координаты через verify-coords.js. У человека на
   телефоне остаётся мгновенное чтение готового числа, без сети и без денег.

   Чем считаем. Открытый OSRM на данных OpenStreetMap, который держит FOSSGIS
   (routing.openstreetmap.de): routed-car для городов на машине, routed-foot
   для пеших. Ключа не нужно, ответы можно хранить. Google сюда не зовём: он
   платный и его ответы нельзя держать дольше 30 дней — то же правило, из-за
   которого мы не храним оценки мест.

   Что кладём в файл. На каждый день — квадратная таблица «откуда куда»:
   километры и минуты между ВСЕМИ точками дня и от жилья города к каждой.
   Все пары, а не только соседние: человек выключает точки тумблером, и
   цепочка на ходу меняется.

   Где честно расписываемся в бессилии:
     · метро, электричка, катер — маршрутизатор их не знает, расписания
       бесплатно не берутся. Такие переходы остаются подписью руками (hop);
     · пеший город и точка дальше 8 км — это уже выезд, не прогулка: ставим
       пусто, движок покажет оценку и так её и подпишет;
     · точка, которую OSM не смог посадить на дорогу ближе двух километров
       (грунтовки к водопадам), — тоже пусто. Лучше честная оценка, чем
       уверенное враньё.
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const HOST = 'https://routing.openstreetmap.de';
/* только латиница: в заголовок HTTP кириллица не влезает */
const UA = 'planner-road-times/1.0 (personal trip planner, one-off run)';
const PAUSE = 1200;        /* сервер общий и бесплатный — не частим */
const FOOT_MAX_KM = 8;     /* дальше пешком не ходят */
const SNAP_MAX_M = 2000;   /* дальше от дороги — точка на дорогу не села */

const MARK_A = '/* ── ДОРОГИ ПО-НАСТОЯЩЕМУ ── считано road-times.js, руками не править ── */';
const MARK_B = '/* ── конец дорог ── */';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const R = 6371;
const rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function load(file) {
  const src = fs.readFileSync(file, 'utf8');
  const S = {};
  const names = ['BASES', 'DAYS', 'DAY_BASE', 'P', 'CITYMOVE', 'META', 'LINES', 'SEGMENT'];
  const grab = names.map(n => `S.${n}=typeof ${n}!=='undefined'?${n}:undefined;`).join('');
  new Function('S', 'with(S){' + src + ';' + grab + '}')(S);
  return S;
}

async function table(profile, coords) {
  const pts = coords.map(c => c.lng + ',' + c.lat).join(';');
  const url = HOST + '/' + profile + '/table/v1/driving/' + pts + '?annotations=duration,distance';
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(40000) });
  if (!r.ok) throw new Error('сервер ответил ' + r.status);
  const j = await r.json();
  if (j.code !== 'Ok') throw new Error('маршрутизатор сказал ' + j.code);
  return j;
}

const FLIGHT_KM = 1200;   /* длиннее — это перелёт, дорогой его не ведут */
/* тот же список, что в day-order.js: чем именно едут, если написано руками */
const RIDE = /катер|паром|поезд|фуникул|express|автобус|синкансэн/i;

function lineLen(pts) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += km(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
  return s;
}
/* ключ линии — тип, дни и начало: если кто-то перерисует линии руками и забудет
   пересчитать, ключ не совпадёт и карта честно вернётся к прямой */
function lineKey(o) {
  return o.type + '|' + (o.days || []).join(',') + '|'
    + o.pts[0][0].toFixed(3) + ',' + o.pts[0][1].toFixed(3);
}
/* едут ли по этой линии на машине. Сказано в данных: CITYMOVE для города дня;
   а где CITYMOVE нет вовсе — это автопоездка (Колорадо, Юта) */
function lineIsCar(o, S) {
  const day = (o.days || [])[0];
  /* день, который держится на расписании (поезд Дуранго–Силвертон, катер по
     озеру), дорогой вести нельзя: рельсы и вода идут не там, где шоссе */
  const fixed = (S.P || []).some(p => p.d === day && p.cat === 'transport' && p.when === 'fixed');
  if (fixed) return false;
  const base = (S.DAY_BASE || {})[day];
  const mv = (S.CITYMOVE || {})[base];
  if (mv) return /^car/.test(mv);
  return true;
}

/* ── нитка дороги: распаковать, проредить, упаковать ──────────────────────
   Маршрутизатор отдаёт линию упакованной строкой. Его собственное прореживание
   (overview=simplified) срезает серпантины Million Dollar Highway — а ради них
   туда и едут. Поэтому берём полную нитку и прореживаем сами, с допуском в
   пятнадцать метров: прямые схлопываются, повороты остаются. */
function decode(s) {
  const out = []; let i = 0, lat = 0, lng = 0;
  while (i < s.length) {
    let b, sh = 0, r = 0;
    do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32);
    lat += (r & 1) ? ~(r >> 1) : (r >> 1);
    sh = 0; r = 0;
    do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32);
    lng += (r & 1) ? ~(r >> 1) : (r >> 1);
    out.push([lat / 1e5, lng / 1e5]);
  }
  return out;
}
function encode(pts) {
  let last = [0, 0], s = '';
  const one = v => { v = v < 0 ? ~(v << 1) : (v << 1); let o = '';
    while (v >= 0x20) { o += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; }
    return o + String.fromCharCode(v + 63); };
  for (const p of pts) {
    const a = Math.round(p[0] * 1e5), b = Math.round(p[1] * 1e5);
    s += one(a - last[0]) + one(b - last[1]);
    last = [a, b];
  }
  return s;
}
/* Дуглас–Пекер: убираем точки, которые лежат на прямой между соседями */
function thin(pts, epsKm) {
  if (pts.length < 3) return pts;
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let far = -1, best = 0;
    for (let i = a + 1; i < b; i++) {
      const d = segDist(pts[i], pts[a], pts[b]);
      if (d > best) { best = d; far = i; }
    }
    if (far > 0 && best > epsKm) { keep[far] = true; stack.push([a, far], [far, b]); }
  }
  return pts.filter((p, i) => keep[i]);
}
function segDist(p, a, b) {
  const kx = 111.32 * Math.cos(rad(p[0])), ky = 110.57;
  const px = p[1] * kx, py = p[0] * ky, ax = a[1] * kx, ay = a[0] * ky, bx = b[1] * kx, by = b[0] * ky;
  const dx = bx - ax, dy = by - ay;
  const L = dx * dx + dy * dy;
  let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * dx, qy = ay + t * dy;
  return Math.sqrt((px - qx) ** 2 + (py - qy) ** 2);
}

async function route(pts, profile) {
  const s = pts.map(p => p[1] + ',' + p[0]).join(';');
  const url = HOST + '/' + (profile || 'routed-car') + '/route/v1/driving/' + s + '?overview=full&geometries=polyline';
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error('сервер ответил ' + r.status);
  const j = await r.json();
  if (j.code !== 'Ok' || !j.routes || !j.routes.length) throw new Error('маршрутизатор сказал ' + j.code);
  return j.routes[0];
}

async function doLines(S, file) {
  const LINES = S.LINES || [];
  if (!LINES.length) return '';
  const rows = [];
  for (const o of LINES) {
    if (!o.pts || o.pts.length < 2) continue;
    const len = lineLen(o.pts);
    const what = o.type + ' ' + (o.days || []).join(',');
    if (len > FLIGHT_KM) { console.log('  линия ' + what + ': ' + Math.round(len) + ' км — это перелёт, оставляю прямой'); continue; }
    if (!lineIsCar(o, S)) { console.log('  линия ' + what + ': не на машине (поезд, катер, метро) — оставляю как есть'); continue; }
    let rt;
    try { rt = await route(o.pts); }
    catch (e) { console.log('  линия ' + what + ': не посчиталась (' + e.message + ')'); continue; }
    await sleep(PAUSE);
    const road = rt.distance / 1000;
    /* в горах дорога честно бывает вдвое длиннее наброска: тупиковые долины
       Аспена, перевал на Теллурайд. Ловим только совсем дикое — вчетверо */
    if (road > len * 4) { console.log('  линия ' + what + ': дорога вчетверо длиннее наброска (' + Math.round(road)
      + ' км против ' + Math.round(len) + ') — не верю, оставляю прямой'); continue; }
    const full = decode(rt.geometry);
    const enc = encode(thin(full, 0.015));
    rows.push(' ' + JSON.stringify(lineKey(o)) + ':' + JSON.stringify(enc) + ',');
    console.log('  линия ' + what + ': ' + Math.round(len) + ' км наброском → ' + Math.round(road)
      + ' км по дороге, точек ' + full.length + ' → ' + decode(enc).length + ' (' + enc.length + ' знаков)');
  }
  if (!rows.length) return '';
  return 'const ROADLINES={\n' + rows.join('\n') + '\n};\n';
}

/* ── ЦЕПОЧКА ДНЯ НА КАРТЕ ─────────────────────────────────────────────────
   «Автомобильные и пешеходные». В пеших городах линий по дням на карте не было
   вовсе — только перелёт и пины. Считаем нитку между СОСЕДНИМИ точками дня (и
   от центра города к первой): по ней карта собирает путь дня и пересобирает
   его, когда человек выключает точку. Каждая пара отдельно — именно поэтому
   цепочку можно пересобрать, а не только показать целиком. */
async function doSteps(S, days) {
  const { BASES, P, DAY_BASE } = S;
  const CITYMOVE = S.CITYMOVE || {};
  const rows = []; let n = 0, skip = 0;
  for (const day of days) {
    const pts = P.filter(p => p.d === day && p.cat !== 'food'
      && typeof p.lat === 'number' && typeof p.lng === 'number');
    if (!pts.length) continue;
    const bid = (DAY_BASE || {})[day];
    const base = BASES.find(b => b.id === bid);
    const mv = CITYMOVE[bid] || '';
    const car = mv ? /^car/.test(mv) : true;
    const profile = car ? 'routed-car' : 'routed-foot';
    const start = (base && typeof base.lat === 'number')
      ? { id: '@' + base.id, lat: base.lat, lng: base.lng } : null;
    /* у дня может быть несколько цепочек: основная и ветки-варианты. Каждая
       начинается от города, и человек ходит по одной из них — значит нитки
       нужны внутри каждой, а между ними никаких: там развилка, а не переход */
    const spine = pts.filter(p => !p.opt);
    const branches = {};
    pts.filter(p => p.opt).forEach(p => { (branches[p.opt] = branches[p.opt] || []).push(p); });
    const chains = [spine, ...Object.keys(branches).map(k => branches[k])]
      .filter(c => c.length).map(c => start ? [start, ...c] : c.slice());

    const seen = {};
    const pairs = [];
    chains.forEach(c => { for (let i = 1; i < c.length; i++) {
      const k = c[i - 1].id + '>' + c[i].id;
      if (seen[k]) continue; seen[k] = 1; pairs.push([c[i - 1], c[i]]);
    } });

    for (const [a, b] of pairs) {
      /* особый транспорт (катер, поезд, фуникулёр) дорогой не ведём — там
         рельсы и вода. А «10 минут по Cliff Palace Loop» или «вход в лифт с
         северной стороны» — это подпись про ноги, дорога тут своя нужна */
      if (b.hop && RIDE.test(b.hop)) { skip++; continue; }
      const straight = km(a.lat, a.lng, b.lat, b.lng);
      if (straight < 0.05) { skip++; continue; }
      if (!car && straight > FOOT_MAX_KM) { skip++; continue; }
      let rt;
      try { rt = await route([[a.lat, a.lng], [b.lat, b.lng]], profile); }
      catch (e) { skip++; continue; }
      await sleep(PAUSE);
      if (rt.distance / 1000 > Math.max(1, straight) * 4) { skip++; continue; }
      const enc = encode(thin(decode(rt.geometry), 0.015));
      rows.push(' ' + JSON.stringify(a.id + '>' + b.id) + ':' + JSON.stringify(enc) + ',');
      n++;
    }
  }
  console.log('  нитки между точками: ' + n + ' посчитано, ' + skip + ' пропущено (катер, поезд, слишком далеко)');
  return rows.length ? 'const ROADSTEPS={\n' + rows.join('\n') + '\n};\n' : '';
}

function writeBlock(file, body) {
  let src = fs.readFileSync(file, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  const b = (MARK_A + '\n' + body + MARK_B).split('\n').join(nl);
  const from = src.indexOf(MARK_A);
  if (from >= 0) {
    const to = src.indexOf(MARK_B, from);
    src = src.slice(0, from) + b + src.slice(to + MARK_B.length);
  } else {
    src = src.replace(/\s*$/, '') + nl + nl + b + nl;
  }
  fs.writeFileSync(file, src);
}
/* уже посчитанные куски блока — чтобы пересчитывать только то, что просят,
   и не гонять маршрутизатор по второму разу без нужды */
function keepBlock(file, upTo) {
  const src = fs.readFileSync(file, 'utf8');
  const from = src.indexOf(MARK_A);
  if (from < 0) return '';
  const to = src.indexOf(MARK_B, from);
  const inside = src.slice(from + MARK_A.length, to).replace(/\r\n/g, '\n');
  const cut = inside.indexOf('const ' + upTo + '=');
  return (cut >= 0 ? inside.slice(0, cut) : inside).replace(/^\n+/, '');
}

async function doFile(file) {
  const S = load(file);
  const { BASES, P, DAY_BASE } = S;
  const CITYMOVE = S.CITYMOVE || {};
  if (!P || !BASES) { console.log('  нет данных маршрута — пропускаю'); return; }

  const days = [...new Set(P.filter(p => p.cat !== 'food').map(p => p.d))].sort((a, b) => a - b);

  /* --steps: числа и линии между городами уже посчитаны, нужны только нитки
     цепочки дня. Экономит сотни запросов к общему бесплатному серверу */
  if (process.argv.indexOf('--steps') >= 0) {
    const keep = keepBlock(file, 'ROADSTEPS');
    if (!keep) { console.log('  дороги ещё не считались — прогоните без --steps'); return; }
    const steps = await doSteps(S, days);
    writeBlock(file, keep + (steps || ''));
    console.log('  ✅ нитки цепочки дня записаны');
    return;
  }
  const out = [];
  let cells = 0, cmpN = 0, cmpSum = 0, cmpWorst = null, blanks = 0;

  for (const day of days) {
    const pts = P.filter(p => p.d === day && p.cat !== 'food'
      && typeof p.lat === 'number' && typeof p.lng === 'number');
    if (pts.length < 1) continue;
    const bid = (DAY_BASE || {})[day];
    const base = BASES.find(b => b.id === bid);
    const mv = CITYMOVE[bid] || '';
    /* CITYMOVE нет вовсе — это автопоездка (Колорадо, Юта): там машина
       подразумевается, и пеший профиль дал бы «2,3 км — 30 минут» между
       двумя смотровыми площадками */
    const car = mv ? /^car/.test(mv) : true;
    const profile = car ? 'routed-car' : 'routed-foot';

    /* нулевая точка — центр города ночёвки: от неё человек выходит утром.
       ⚠️ А в ДЕНЬ ПЕРЕЕЗДА он выходит из ПРОШЛОГО города: спал он там. Без этой
       строки в таблице первый перегон дня «Урей → Аспен» считался от Аспена — то
       есть 262 км назад, и день выходил 13 ч 13 вместо настоящих. */
    const prev = days[days.indexOf(day) - 1];
    const pbid = (prev != null) ? (DAY_BASE || {})[prev] : null;
    const pbase = (pbid && pbid !== bid) ? BASES.find(b => b.id === pbid) : null;
    const nodes = [];
    if (base && typeof base.lat === 'number') nodes.push({ id: '@' + base.id, lat: base.lat, lng: base.lng });
    if (pbase && typeof pbase.lat === 'number') nodes.push({ id: '@' + pbase.id, lat: pbase.lat, lng: pbase.lng });
    nodes.push(...pts);

    let j;
    try { j = await table(profile, nodes); }
    catch (e) { console.log('  день ' + day + ': не посчитался (' + e.message + ') — остаётся оценка'); continue; }
    await sleep(PAUSE);

    /* как далеко каждая точка села на дорогу: два километра — уже не она */
    const snap = (j.sources || j.destinations || []).map(s => s && s.distance);
    const n = nodes.length;
    const mk = [], mm = [];
    for (let i = 0; i < n; i++) {
      mk.push([]); mm.push([]);
      for (let k = 0; k < n; k++) {
        const dist = j.distances[i][k], dur = j.durations[i][k];
        const straight = km(nodes[i].lat, nodes[i].lng, nodes[k].lat, nodes[k].lng);
        let ok = i !== k && dist != null && dur != null;
        if (ok && (snap[i] > SNAP_MAX_M || snap[k] > SNAP_MAX_M)) ok = false;
        if (ok && !car && straight > FOOT_MAX_KM) ok = false;
        /* маршрутизатор иногда уводит в объезд полстраны: втрое длиннее прямой
           — это не дорога, а дырка в карте */
        if (ok && straight > 1 && dist / 1000 > straight * 3) ok = false;
        if (!ok) { mk[i].push(null); mm[i].push(null); if (i !== k) blanks++; continue; }
        mk[i].push(Math.round(dist / 100) / 10);
        mm[i].push(Math.max(1, Math.round(dur / 60)));
        cells++;
        /* насколько врала прямая с надбавкой — ради этого всё и затевалось */
        const est = straight * 1.25;
        if (est > 0.3) { cmpN++; const rel = (dist / 1000) / est; cmpSum += rel;
          if (!cmpWorst || rel > cmpWorst.rel) cmpWorst = { rel, day, a: nodes[i].id, b: nodes[k].id, est, real: dist / 1000 }; }
      }
    }
    out.push(' ' + day + ':{ids:' + JSON.stringify(nodes.map(x => x.id))
      + ',km:' + JSON.stringify(mk) + ',min:' + JSON.stringify(mm) + '},');
    console.log('  день ' + day + ': ' + pts.length + ' точек, ' + profile.replace('routed-', '')
      + ' — посчитано');
  }

  /* ── ЛИНИИ НА КАРТЕ ───────────────────────────────────────────────────
     Её вопрос: «а почему прямые у нас до сих пор, я думала мы настоящий путь
     рисуем». Линии в LINES нарисованы руками — по девять-одиннадцать опорных
     точек, карта соединяет их отрезками, и на повороте у Карбондейла видно
     угол. Просим маршрутизатор провести дорогу ЧЕРЕЗ эти же опорные точки:
     они остаются подсказкой «каким путём», а нитка получается настоящая.
     Перелёты и поезда сюда не берём: самолёт по шоссе не летает. */
  const lines = await doLines(S, file);
  const steps = await doSteps(S, days);

  if (!out.length && !lines && !steps) { console.log('  считать нечего'); return; }

  writeBlock(file, 'const ROADS={\n' + out.join('\n') + '\n};\n' + (lines || '') + (steps || ''));

  console.log('  ✅ записано: ' + cells + ' пар с настоящей дорогой, ' + blanks + ' оставлены оценкой');
  if (cmpN) {
    console.log('     прямая с надбавкой в среднем занижала в ' + (cmpSum / cmpN).toFixed(2) + ' раза');
    if (cmpWorst) console.log('     хуже всего день ' + cmpWorst.day + ': ' + cmpWorst.a + ' → ' + cmpWorst.b
      + ' — было ' + cmpWorst.est.toFixed(1) + ' км, на самом деле ' + cmpWorst.real.toFixed(1) + ' км');
  }
}

(async () => {
  const arg = process.argv[2];
  const files = arg ? [arg] : fs.readdirSync(__dirname).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f));
  for (const f of files) {
    console.log('\n=== ' + path.basename(f) + ' ===');
    await doFile(path.join(__dirname, path.basename(f)));
  }
  console.log('\nГотово. Теперь прогоните node check-route.js — он смотрит и на дороги.');
})();
