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
  const names = ['BASES', 'DAYS', 'DAY_BASE', 'P', 'CITYMOVE', 'META'];
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

async function doFile(file) {
  const S = load(file);
  const { BASES, P, DAY_BASE } = S;
  const CITYMOVE = S.CITYMOVE || {};
  if (!P || !BASES) { console.log('  нет данных маршрута — пропускаю'); return; }

  const days = [...new Set(P.filter(p => p.cat !== 'food').map(p => p.d))].sort((a, b) => a - b);
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

    /* нулевая точка — центр города ночёвки: от неё человек выходит утром */
    const nodes = (base && typeof base.lat === 'number')
      ? [{ id: '@' + base.id, lat: base.lat, lng: base.lng }, ...pts]
      : pts.slice();

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

  if (!out.length) { console.log('  считать нечего'); return; }

  const block = MARK_A + '\nconst ROADS={\n' + out.join('\n') + '\n};\n' + MARK_B;
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
