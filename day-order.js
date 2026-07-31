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
/* ⚠️ ПОЧЕМУ ЭТО ВАЖНО. Раньше порядок считался ПО ПРЯМОЙ, и на этом мы
   ошиблись у неё на глазах: в первом дне Милана путь Сант-Эустороджо → ворота
   → Дарсена → Лавандаи по прямой выглядел нормально, а по настоящим дорожкам
   он на 300 метров и четыре минуты длиннее, чем через Дарсену. Между двумя
   берегами канала прямая короткая, а идти надо до моста.
   Теперь, если дороги посчитаны (road-times.js, блок ROADS), меряем по ним, а
   по прямой — только там, где дороги нет, и с надбавкой на извилины. */
let ROADKM = null, ROADMIN = null;
function useRoads(ROADS) {
  ROADKM = null; ROADMIN = null;
  if (!ROADS || typeof ROADS !== 'object') return false;
  const K = new Map(), M = new Map();
  Object.keys(ROADS).forEach(d => {
    const t = ROADS[d];
    if (!t || !t.ids) return;
    t.ids.forEach((x, i) => t.ids.forEach((y, j) => {
      if (i === j || t.km[i][j] == null) return;
      K.set(x + '>' + y, t.km[i][j]);
      M.set(x + '>' + y, t.min[i][j]);
    }));
  });
  if (!K.size) return false;
  ROADKM = K; ROADMIN = M;
  return true;
}
function dist(a, b) {
  if (ROADKM) { const v = ROADKM.get(a.id + '>' + b.id); if (v != null) return v; }
  return km(a.lat, a.lng, b.lat, b.lng) * (ROADKM ? 1.25 : 1);
}
const total = arr => { let s = 0; for (let i = 1; i < arr.length; i++) s += dist(arr[i - 1], arr[i]); return s; };
/* минуты считаем только если они есть на КАЖДУЮ пару — половина правды хуже, чем ничего */
function mins(arr) {
  if (!ROADMIN) return null;
  let s = 0;
  for (let i = 1; i < arr.length; i++) {
    const v = ROADMIN.get(arr[i - 1].id + '>' + arr[i].id);
    if (v == null) return null;
    s += v;
  }
  return s;
}
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
  const byRoad = useRoads(S.ROADS);
  /* «когда лучше» написано человеческими словами, и счётчик должен понимать их
     все, а не два. «с 18:00» у аперитива на Навильи он не понимал — и предлагал
     закончить день не аперитивом, а портом, потому что до дома оттуда ближе. */
  const when = p => {
    const m = (META[p.id] || {}).best || '';
    if (/закат|вечер|аперитив|ужин|ночи|с\s*1[789][:.]|с\s*2[0-3][:.]|после\s*1[5-9]/i.test(m)) return 'вечер';
    if (/утр|рассвет|к открытию|до\s*(полудня|обеда|1[01]|[89])/i.test(m)) return 'утро';
    return '';
  };
  const isStop = p => p.cat === 'transport';
  /* город, где человек ночует в этот день — им день и заканчивается */
  const homeOf = d => {
    const bid = (S.DAY_BASE || {})[d];
    const b = (S.BASES || []).find(x => x.id === bid);
    return (b && typeof b.lat === 'number') ? { id: '@' + b.id, lat: b.lat, lng: b.lng } : null;
  };
  const days = [...new Set(P.filter(p => p.cat !== 'food').map(p => p.d))].sort((a, b) => a - b);
  return days.map(d => {
    /* места с opt — это ВАРИАНТЫ вместо дня, а не его продолжение. Считать по
       ним длину прохода бессмысленно: человек поедет либо туда, либо сюда */
    const pts = P.filter(p => p.d === d && p.cat !== 'food' && !p.opt && typeof p.lat === 'number');
    const title = (DAYS.find(x => x.n === d) || {}).title || '';
    const same = extra => Object.assign({ day: d, title, n: pts.length, best: null, byRoad,
      nowMin: mins(pts), bestMin: null, order: pts.map(p => p.id), bestOrder: null }, extra);
    if (pts.length < 3) return same({ now: total(pts) });
    /* ⚠️ ДЕНЬ НЕ ЗАКАНЧИВАЕТСЯ ПОСЛЕДНЕЙ ТОЧКОЙ: человек возвращается ночевать,
       а в день переезда доезжает до нового города. Пока этого не было в счёте,
       он предлагал закончить день в Марбле — тупиковой долине, из которой ещё
       двадцать километров назад до трассы. Поэтому подставляем город ночёвки
       последним: порядок считается для настоящего дня, от порога до порога. */
    const home = homeOf(d);
    const post = (home && !isStop(pts[pts.length - 1])) ? [home] : [];
    const asDay = arr => arr.concat(post);
    const strip = arr => arr.filter(p => post.indexOf(p) < 0);
    const nowFull = total(asDay(pts));

    /* ⚠️ ГЛАВНОЕ ПРАВИЛО, И ОНО ЕЁ: считать надо там, где мы сами за рулём или
       на ногах, и не считать там, где нас везут по расписанию. Раньше стояла
       грубая заглушка «в дне есть поезд или катер — день не трогаем», и первый
       день Милана не проверялся вообще из-за поезда из аэропорта.
       Теперь день режется на КУСКИ по расписанным переездам: поезд, катер,
       фуникулёр, экскурсия по билету на 11:00 остаются на своих местах, а
       внутри каждого куска — где человек идёт ногами или едет сам — порядок
       считается и улучшается. У куска закреплены оба конца: с чего он
       начинается (нас туда привезли) и чем кончается (оттуда нас увозят). */
    const anchor = (p, i) => i > 0 && ((p.hop && RIDE.test(p.hop)) || p.when === 'fixed');
    const runs = [];
    pts.forEach((p, i) => { if (i === 0 || anchor(p, i)) runs.push([p]); else runs[runs.length - 1].push(p); });
    const hand = pts.filter((p, i) => anchor(p, i)).map(p => p.id);

    const orderRun = (run, pinLast, tailExtra) => {
      const extra = tailExtra || [];
      if (run.length + extra.length < 3) return run.slice();
      const rest = run.slice(1);
      const evening = rest.filter(p => when(p) === 'вечер');
      const morning = rest.filter(p => when(p) === 'утро');
      const free = rest.filter(p => evening.indexOf(p) < 0 && morning.indexOf(p) < 0);
      const head = [run[0]].concat(morning);
      /* строгий: вечернее в самом конце куска, как держали раньше */
      const A = improve(head.concat(free), pinLast && !evening.length && !extra.length,
        head.length).concat(evening).concat(extra);
      /* мягкий: вечернее отпущено — принимаем, только если оно всё равно легло
         в хвост, а утреннее в начало («на закате» ≠ «последней точкой») */
      const B = improve(run.concat(extra), pinLast || extra.length > 0, 1);
      const bodyB = B.filter(p => extra.indexOf(p) < 0);
      const okWhen = bodyB.every((p, i) => {
        const w = when(p);
        if (w === 'вечер') return i >= Math.floor(bodyB.length * 0.6);
        if (w === 'утро') return i <= Math.ceil(bodyB.length * 0.5);
        return true;
      });
      return (okWhen && total(B) < total(A) - 1e-9) ? B : A;
    };

    const parts = runs.map((run, k) => {
      const last = k === runs.length - 1;
      /* не последний кусок — из его конца нас увозят: там сесть на катер можно
         только с того причала, что стоит в данных, и его двигать нельзя */
      return orderRun(run, !last || isStop(run[run.length - 1]), last ? post : []);
    });
    let best = [].concat.apply([], parts);
    if (total(best) >= nowFull - 1e-9) best = null;
    const bestBody = best ? strip(best) : null;
    return { day: d, title, n: pts.length, now: nowFull, best: bestBody,
             fixed: hand.length ? hand : null,
             bestLen: best ? total(best) : nowFull, roundTrip: post.length > 0,
             byRoad, nowMin: mins(asDay(pts)), bestMin: best ? mins(best) : null,
             order: pts.map(p => p.id), bestOrder: bestBody ? bestBody.map(p => p.id) : null };
  });
}

function load(file) {
  const src = fs.readFileSync(file, 'utf8');
  const S = {};
  new Function('S', 'with(S){' + src + ';S.P=P;S.DAYS=DAYS;S.META=(typeof META!=="undefined")?META:{};'
    + 'S.ROADS=(typeof ROADS!=="undefined")?ROADS:null;S.BASES=(typeof BASES!=="undefined")?BASES:[];S.DAY_BASE=(typeof DAY_BASE!=="undefined")?DAY_BASE:{};}')(S);
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
      console.log('  день ' + r.day + ' · ' + r.title + (r.byRoad ? '  (по дорогам)' : '  (по прямой — дороги не посчитаны)')
        + (r.fixed ? '  · по расписанию, с места не двигаем: ' + r.fixed.join(', ') : ''));
      console.log('     сейчас ' + fmt(r.now) + (r.nowMin ? ' · ' + r.nowMin + ' мин' : '') + '   ' + r.order.join(' → '));
      if (!r.best) console.log('     короче не выходит — порядок уже лучший');
      else console.log('     КОРОЧЕ ' + fmt(r.bestLen) + (r.bestMin ? ' · ' + r.bestMin + ' мин' : '')
        + ' (минус ' + fmt(r.now - r.bestLen)
        + (r.nowMin && r.bestMin ? ' и ' + (r.nowMin - r.bestMin) + ' мин' : '') + ')   '
        + r.bestOrder.join(' → '));
    });
    console.log('  ИТОГО: сейчас ' + fmt(sumNow) + ', можно ' + fmt(sumBest)
      + (sumNow - sumBest > 0.05 ? ('  (минус ' + fmt(sumNow - sumBest) + ')') : ''));
  });
}
