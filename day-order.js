/* ==========================================================================
   ПОРЯДОК ТОЧЕК В ДНЕ — считаем, а не пишем на глаз

   Правило клиента: «маршрут должен идти потихоньку от того, что рядом, а не
   гонять клиента туда-сюда». Этот файл меряет, сколько человек проходит за
   день в том порядке, как места лежат в файле, и ищет более короткий обход.

   Запуск:  node day-order.js trip-milan.js
   Ничего не меняет — только показывает. Порядок правит человек.

   Что учитывается, кроме расстояния:
     · первая точка дня остаётся первой — день с неё начинается;
     · места со временем (META.best «утро» / «закат», «вечер») прикалываются
       к началу и к концу: короче ≠ лучше, если крыша закрыта до девяти;
     · дни, где в hop написан катер, поезд, паром или фуникулёр, не трогаем —
       там порядок задаёт расписание, а не география.

   ⚠️ ДЛЯ МАРШРУТОВ НА МАШИНЕ прямая ≠ дорога: перевалы и тупиковые дороги
   считаются длиннее, чем кажется. Подсказку по таким дням проверяем по карте
   и часто отклоняем.
   💡 Странное «улучшение» — почти всегда признак КРИВОЙ КООРДИНАТЫ. Так нашлись
   Cathedral Lake в 12,7 км от себя и Woody Creek Tavern в 4,7 км.
   ========================================================================== */
const fs = require('fs'), path = require('path');

const R = 6371, rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const dist = (a, b) => km(a.lat, a.lng, b.lat, b.lng);
const total = arr => { let s = 0; for (let i = 1; i < arr.length; i++) s += dist(arr[i - 1], arr[i]); return s; };
const fmt = k => k < 1 ? Math.round(k * 1000) + ' м' : k.toFixed(1) + ' км';

/* развёртка петель: меняем местами куски пути, пока становится короче.
   from — с какого места разрешено трогать (начало дня закреплено) */
function twoOpt(start, fixLast, from) {
  const out = start.slice();
  const lo = from || 1, hi = out.length - (fixLast ? 2 : 1);
  let better = true;
  while (better) {
    better = false;
    for (let i = lo; i < hi; i++) for (let j = i + 1; j <= hi; j++) {
      const cand = out.slice(0, i).concat(out.slice(i, j + 1).reverse(), out.slice(j + 1));
      if (total(cand) < total(out) - 1e-9) { out.length = 0; out.push.apply(out, cand); better = true; }
    }
  }
  return out;
}
/* ⚠️ Нельзя оптимизировать день целиком и потом отрезать «голову»: точки из
   головы уезжают внутрь, и после отреза день теряет места и получает дубли
   (проверено — выходило «clp → clp» и «выигрыш» в минус 45 км). Голову
   закрепляем ВНУТРИ алгоритма параметром keep. */
function improve(pts, fixLast, keep) {
  keep = keep || 1;
  if (pts.length - keep < 3) return pts.slice();
  const last = fixLast ? pts[pts.length - 1] : null;
  const body = fixLast ? pts.slice(keep, -1) : pts.slice(keep);
  const out = pts.slice(0, keep);
  const left = body.slice();
  while (left.length) {                       /* жадно: каждый раз идём к ближайшему */
    let bi = 0, bd = Infinity;
    left.forEach((p, i) => { const d = dist(out[out.length - 1], p); if (d < bd) { bd = d; bi = i; } });
    out.push(left.splice(bi, 1)[0]);
  }
  if (last) out.push(last);
  /* ⚠️ жадный обход бывает ХУЖЕ исходного порядка — сравниваем оба */
  const a = twoOpt(out, fixLast, keep), b = twoOpt(pts.slice(), fixLast, keep);
  return total(a) <= total(b) ? a : b;
}

const RIDE = /катер|паром|поезд|фуникул|express|автобус|синкансэн/i;

/* Разбор одного маршрута. Возвращает по дню: путь сейчас, лучший найденный
   путь и порядок. Ничего не печатает — этим пользуется и check-route.js. */
function analyze(S) {
  const P = S.P || [], DAYS = S.DAYS || [], META = S.META || {};
  const when = p => {
    const m = (META[p.id] || {}).best || '';
    if (/закат|вечер/i.test(m)) return 'вечер';
    if (/утр/i.test(m)) return 'утро';
    return '';
  };
  const isStop = p => p.cat === 'transport';
  const days = [...new Set(P.filter(p => p.cat !== 'food').map(p => p.d))].sort((a, b) => a - b);
  return days.map(d => {
    const pts = P.filter(p => p.d === d && p.cat !== 'food' && typeof p.lat === 'number');
    const title = (DAYS.find(x => x.n === d) || {}).title || '';
    if (pts.length < 3) return { day: d, title, n: pts.length, now: total(pts), best: null };
    const hand = pts.filter(p => p.hop && RIDE.test(p.hop)).map(p => p.id);
    const now = total(pts);
    if (hand.length) return { day: d, title, n: pts.length, now, best: null, fixed: hand };
    const evening = pts.filter(p => when(p) === 'вечер');
    const morning = pts.filter((p, i) => i > 0 && when(p) === 'утро');
    const free = pts.filter((p, i) => i > 0 && evening.indexOf(p) < 0 && morning.indexOf(p) < 0);
    const head = [pts[0]].concat(morning);
    const seq = improve(head.concat(free), isStop(free[free.length - 1] || pts[0]), head.length);
    let best = seq.concat(evening);
    /* закат в конце дня может оказаться на другом краю города — тогда
       «улучшение» выходит длиннее, и мы ничего не предлагаем */
    if (total(best) >= now - 1e-9) best = null;
    return { day: d, title, n: pts.length, now, best, bestLen: best ? total(best) : now,
             order: pts.map(p => p.id), bestOrder: best ? best.map(p => p.id) : null };
  });
}

function load(file) {
  const src = fs.readFileSync(file, 'utf8');
  const S = {};
  new Function('S', 'with(S){' + src + ';S.P=P;S.DAYS=DAYS;S.META=(typeof META!=="undefined")?META:{};}')(S);
  return S;
}

module.exports = { analyze, load, km, total, fmt };

/* ── запуск из командной строки ── */
if (require.main === module) {
  const arg = process.argv[2];
  const files = arg ? [arg] : fs.readdirSync(__dirname).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f));
  files.forEach(f => {
    const S = load(path.join(__dirname, path.basename(f)));
    console.log('\n=== ' + path.basename(f) + ' ===');
    let sumNow = 0, sumBest = 0;
    analyze(S).forEach(r => {
      sumNow += r.now; sumBest += (r.best ? r.bestLen : r.now);
      if (r.n < 3) return;
      if (r.fixed) { console.log('  день ' + r.day + ' · ' + r.title + ': ' + fmt(r.now)
        + '  (порядок задаёт расписание: ' + r.fixed.join(', ') + ')'); return; }
      console.log('  день ' + r.day + ' · ' + r.title);
      console.log('     сейчас ' + fmt(r.now) + '   ' + r.order.join(' → '));
      if (!r.best) console.log('     короче не выходит — порядок уже лучший');
      else console.log('     КОРОЧЕ ' + fmt(r.bestLen) + ' (минус ' + fmt(r.now - r.bestLen) + ')   '
        + r.bestOrder.join(' → '));
    });
    console.log('  ИТОГО: сейчас ' + fmt(sumNow) + ', можно ' + fmt(sumBest)
      + (sumNow - sumBest > 0.05 ? ('  (минус ' + fmt(sumNow - sumBest) + ')') : ''));
  });
}
