/* ==========================================================================
   СБОРЩИК: РАСКЛАДЫВАЕТ МАРШРУТ ВОКРУГ ЧАСОВ РАБОТЫ

   Запуск:  node fit-hours.js trip-milan.js           — показать, что сделает
            node fit-hours.js trip-milan.js --apply   — сделать
            node fit-hours.js --apply                 — по всем маршрутам

   Зачем. Её слова 02.08: «правила есть — почему не починилось?». И она права:
   правило 18а («сначала часы, потом раскладка») я записала словами, а проверка
   только НАХОДИЛА «приезжаем в закрытое». Получился сторож, а не сборщик.
   Сборщик — это здесь: он берёт маршрут вместе с часами и сам двигает, пока
   человек не перестанет приезжать в закрытое.

   Порядок ходов (от самого мягкого к самому грубому):
     1) переставить точку ВНУТРИ дня — если место сегодня работает, а мы просто
        приходим не в те часы;
     2) перенести точку в ДРУГОЙ ДЕНЬ того же города, где она открыта;
     3) поменять местами два дня города — если весь день упёрся в выходной;
     4) не вышло ничем — сказать прямо и объяснить почему.

   Чего сборщик НЕ делает: не выдумывает места, не выкидывает их и не трогает
   то, что стоит по расписанию (поезд, катер, экскурсия по билету) и то, чему
   назначено время дня («на рассвете», «на закате»). Это скелет дня, правило 17.

   ⚠️ После правок надо пересчитать дороги: node road-times.js <файл>
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const OPEN = require('./open-hours.js');
const DAYMATH = require('./day-math.js');

const DAY_MAX = 720;               /* потолок дня, правило 16в */
const START_MIN = DAYMATH.DAY_START;

const R = 6371, rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function parseMin(t) {
  const s = String(t || '').toLowerCase().replace(/,(\d)/g, '.$1');
  const re = /(\d+(?:\.\d+)?)\s*(ч(?:ас[а-я]*)?|мин[а-я]*)/g;
  const m = re.exec(s);
  if (!m) return /\bчас\b/.test(s) ? 60 : 0;
  if (/^мин/.test(m[2])) return Math.round(parseFloat(m[1]));
  let total = parseFloat(m[1]) * 60;
  const m2 = /^\s*(\d+)\s*мин/.exec(s.slice(re.lastIndex));
  if (m2) total += parseInt(m2[1], 10);
  return Math.round(total);
}
const hhmm = m => Math.floor(m / 60) + ':' + String(Math.round(m) % 60).padStart(2, '0');

function load(file) {
  const src = fs.readFileSync(file, 'utf8'); const S = {};
  const names = ['BASES', 'DAYS', 'DAY_BASE', 'P', 'META', 'ROADS', 'START', 'SEGMENT'];
  const grab = names.map(n => `S.${n}=typeof ${n}!=='undefined'?${n}:undefined;`).join('');
  new Function('S', 'with(S){' + src + ';' + grab + '}')(S);
  S.src = src;
  return S;
}

/* ── ДЕНЬ ПО ЧАСАМ ────────────────────────────────────────────────────────
   Считаем ровно как страница и проверка: дорога по таблице ROADS, расписанные
   переезды — по написанному словами, день переезда начинается в прошлом городе. */
function makeClock(S) {
  const RD = S.ROADS || {}, MET = S.META || {}, DB = S.DAY_BASE || {};
  /* ⚠️ ТАБЛИЦА ДОРОГ ЛЕЖИТ ПО ДНЯМ, А МЫ ДНИ ПЕРЕСТАВЛЯЕМ. Если искать пару
     только в таблице своего дня, у переехавшей точки дороги «не найдётся» и
     время посчитается прикидкой — сборщик тогда видит выдуманную картину и
     начинает ходить по кругу. Поэтому пару ищем во ВСЕХ таблицах: пара точек
     от дня не зависит. */
  const idx = {};
  Object.keys(RD).forEach(d => {
    const t = RD[d];
    if (!t || !t.ids) return;
    t.ids.forEach((a, i) => t.ids.forEach((b, j) => {
      if (i === j || !t.min[i] || t.min[i][j] == null) return;
      const k = a + '>' + b;
      if (idx[k] == null) idx[k] = t.min[i][j];
    }));
  });
  const roadMin = (day, a, b) => (idx[a + '>' + b] != null ? idx[a + '>' + b] : null);
  return function schedule(dayN, pts) {
    const bid = DB[dayN];
    const days = Object.keys(DB).map(Number).sort((a, b) => a - b);
    const prevDay = days[days.indexOf(dayN) - 1];
    const pbid = prevDay != null ? DB[prevDay] : null;
    const seg = (S.SEGMENT || {})[bid] || '';
    const drove = !seg || /car|drive|машин/i.test(seg);
    const startId = (pbid && pbid !== bid && drove) ? pbid : bid;
    const bs = (S.BASES || []).find(b => b.id === startId) || {};
    let clock = START_MIN;
    return pts.map((p, i) => {
      const before = i ? pts[i - 1] : bs;
      let move = 0;
      if (i === 0 && p.cat === 'transport') move = 0;
      else if (p.hop) move = parseMin(p.hop) || (typeof before.lat === 'number'
        ? Math.max(5, Math.round(km(before.lat, before.lng, p.lat, p.lng) * 1.2 / 50 * 60)) : 0);
      else {
        const r = roadMin(dayN, i ? pts[i - 1].id : ('@' + startId), p.id);
        move = (r != null) ? r
          : (typeof before.lat === 'number'
            ? Math.max(5, Math.round(km(before.lat, before.lng, p.lat, p.lng) * 1.25 / 40 * 60)) : 0);
      }
      const dur = ((MET[p.id] || {}).min) || 0;
      clock += move;
      const from = clock;
      clock += dur;
      return { p: p, from: from, to: from + dur, move: move, dur: dur };
    });
  };
}

const dateOf = (S, n) => new Date(new Date(String(S.START) + 'T12:00:00').getTime() + (n - 1) * 86400000);
const hoursOf = (S, p) => ((S.META || {})[p.id] || {}).hours || '';

/* сдвигать нельзя: транспорт, расписание, время дня (правило 17 и правило 3) */
function fixed(p) {
  return p.cat === 'transport' || !!p.hop || p.when === 'fixed'
    || /рассвет|закат|утр|вечер|полудн|первый/i.test((p.tag && p.tag[0]) || '');
}

function conflicts(S, dayN, pts) {
  const sch = makeClock(S)(dayN, pts);
  const date = dateOf(S, dayN);
  const out = [];
  sch.forEach(x => {
    const h = hoursOf(S, x.p);
    if (!h) return;
    /* подождать открытия — нормально: считаем это не конфликтом, а поздним стартом */
    const f = OPEN.arrive(h, date, x.from, x.to);
    if (!f.ok) out.push({ p: x.p, why: f.why, open: f.open || '', at: x.from, dur: x.dur });
  });
  return { list: out, sch: sch, total: sch.length ? (sch[sch.length - 1].to - START_MIN) : 0 };
}

/* ── ХОД 1: переставить внутри дня ───────────────────────────────────────── */
function tryReorder(S, dayN, pts) {
  const base = conflicts(S, dayN, pts);
  if (!base.list.length) return null;
  let best = null;
  /* сперва слушаем сам тег времени: «на закате» — в конец дня, «на рассвете» — в
     начало. Гриффитская обсерватория открывается в полдень, а мы приезжали в
     9:18 — тег про это и говорил, просто его никто не спрашивал */
  base.list.forEach(bad => {
    const t = ((bad.p.tag && bad.p.tag[0]) || '') + ' ' + (((S.META || {})[bad.p.id] || {}).best || '');
    const late = /закат|вечер|ноч/i.test(t), early = /рассвет|утр|первый|полудн/i.test(t);
    if (!late && !early) return;
    const arr = pts.filter(p => p !== bad.p);
    arr.splice(late ? arr.length : 0, 0, bad.p);
    const c = conflicts(S, dayN, arr);
    if (c.list.length < base.list.length && c.total <= DAY_MAX) {
      const score = c.list.length * 1000 + c.total;
      if (!best || score < best.score) best = { arr: arr, score: score, left: c.list.length, total: c.total };
    }
  });
  if (best) return best;
  for (let i = 0; i < pts.length; i++) {
    if (fixed(pts[i])) continue;
    for (let j = 0; j < pts.length; j++) {
      if (i === j) continue;
      const arr = pts.slice();
      const [x] = arr.splice(i, 1);
      arr.splice(j, 0, x);
      /* закреплённые точки обязаны остаться на своих местах */
      if (arr.some((p, k) => fixed(p) && pts[k] !== p)) continue;
      const c = conflicts(S, dayN, arr);
      if (c.list.length >= base.list.length) continue;
      if (c.total > DAY_MAX) continue;
      const score = c.list.length * 1000 + c.total;
      if (!best || score < best.score) best = { arr: arr, score: score, left: c.list.length, total: c.total };
    }
  }
  return best;
}

/* причесать день: подряд двигаем по одной точке, пока закрытых не станет меньше
   (нужно после подселения — иначе гость ломает часы соседям) */
function settle(S, dayN, arr) {
  let cur = arr, guard = 5;
  while (guard-- > 0) {
    const c = conflicts(S, dayN, cur);
    if (!c.list.length) return cur;
    const re = tryReorder(S, dayN, cur);
    if (!re) return cur;
    cur = re.arr;
  }
  return cur;
}

/* ── ХОД 2: перенести точку в другой день того же города ─────────────────── */
function tryMove(S, dayN, pts, bad, byDay, cap) {
  const DB = S.DAY_BASE || {}, bid = DB[dayN];
  /* ⚠️ ТОЧКУ, ЧЬИМ ИМЕНЕМ НАЗВАН ДЕНЬ, НЕ УВОЗИМ. Обсерватория Гриффита уехала
     в соседний день, а день так и остался называться «Холмы: Гриффит и
     Голливуд» — название стало враньём. Такой случай честнее отдать человеку. */
  const title = ((S.DAYS || []).find(d => d.n === dayN) || {}).title || '';
  const words = String(bad.p.nm || '').split(/[\s·,+]+/).filter(w => w.length > 4);
  if (words.some(w => title.toLowerCase().indexOf(w.toLowerCase()) >= 0)) return null;
  /* и по-русски: «Гриффит» в названии дня против «Griffith Observatory» */
  const ru = { griffith: 'гриффит', versailles: 'версал', louvre: 'лувр', duomo: 'дуомо',
    brera: 'брер', maroon: 'maroon', mesa: 'меса', montmartre: 'монмартр' };
  if (Object.keys(ru).some(k => String(bad.p.nm || '').toLowerCase().indexOf(k) >= 0
      && title.toLowerCase().indexOf(ru[k]) >= 0)) return null;
  const all = Object.keys(byDay).map(Number).sort((a, b) => a - b);
  const firstOfBase = all.find(n => DB[n] === bid);
  const lastOfTrip = all[all.length - 1];
  /* день ВЫЛЕТА годится — утро там свободно, место встанет до самолёта (за этим
     следит проверка позиции ниже). А вот в день ПРИЛЁТА не докладываем: во
     сколько сядет самолёт, мы не знаем, и набивать этот день нечестно */
  const cand = all.filter(n => n !== dayN && DB[n] === bid && n !== all[0]);
  let best = null;
  cand.forEach(n => {
    const target = byDay[n];
    /* ⚠️ ГЕОГРАФИЯ. Дни одного города бывают в разных местах: день на Комо — это
       сотня километров от Милана. Переносить туда городскую точку нельзя.
       Пускаем, только если место рядом с тем, что в этом дне уже есть */
    const near = target.filter(p => typeof p.lat === 'number')
      .reduce((m, p) => Math.min(m, km(bad.p.lat, bad.p.lng, p.lat, p.lng)), 1e9);
    if (near > 25) return;
    /* самолёт и поезд держат КОНЦЫ дня: утренние остаются впереди, вечерние —
       позади. Между ними вставлять можно куда угодно */
    let lead = 0; while (lead < target.length && fixed(target[lead])) lead++;
    let tail = 0; while (tail < target.length - lead && fixed(target[target.length - 1 - tail])) tail++;
    const was = conflicts(S, n, target).list.length;
    for (let j = lead; j <= target.length - tail; j++) {
      let arr = target.slice();
      arr.splice(j, 0, bad.p);
      arr = settle(S, n, arr);            /* гость мог сдвинуть часы соседям — причёсываем */
      const c = conflicts(S, n, arr);
      /* важно не «чтобы в новом дне вообще не было закрытого» (там может быть
         своя нерешённая беда), а чтобы НАШЕ место было открыто и хуже не стало */
      if (c.list.length > was) continue;
      if (c.list.some(x => x.p === bad.p)) continue;
      /* не набиваем день под потолок: держим обычный темп, иначе всё уедет в один */
      if (c.total > (cap || 600)) continue;
      const score = c.total;
      if (!best || score < best.score) best = { day: n, arr: arr, score: score, total: c.total };
    }
  });
  return best;
}

/* ── ХОД 3: поменять местами два дня города ──────────────────────────────── */
function trySwap(S, dayN, byDay) {
  const DB = S.DAY_BASE || {}, bid = DB[dayN];
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);
  const first = days.find(n => DB[n] === bid);          /* день приезда не двигаем */
  const last = days[days.length - 1];                   /* день вылета тоже */
  if (dayN === first || dayN === last) return null;
  let best = null;
  days.forEach(n => {
    if (n === dayN || DB[n] !== bid || n === first || n === last) return;
    const was = conflicts(S, dayN, byDay[dayN]).list.length + conflicts(S, n, byDay[n]).list.length;
    /* после обмена день dayN окажется на дате n и наоборот */
    const willA = conflicts(S, n, byDay[dayN]).list.length;
    const willB = conflicts(S, dayN, byDay[n]).list.length;
    const will = willA + willB;
    if (will >= was) return;
    if (!best || will < best.will) best = { day: n, will: will, was: was };
  });
  return best;
}

/* ── ХОД 0: РАЗЛОЖИТЬ ДНИ ГОРОДА ПО ДАТАМ ЦЕЛИКОМ ────────────────────────
   Парные обмены близоруки: день Комо и день музеев могут «меняться» по кругу и
   не сойтись, потому что выигрыш появляется только в тройной перестановке.
   Поэтому сначала честно перебираем ВСЕ раскладки дней города по его датам и
   берём ту, где закрытых меньше всего. День приезда и день вылета не двигаем —
   к ним привязаны переезд и самолёт. */
function permute(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  arr.forEach((x, i) => {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    permute(rest).forEach(p => out.push([x].concat(p)));
  });
  return out;
}
function arrangeDays(S, byDay) {
  const DB = S.DAY_BASE || {};
  const all = Object.keys(byDay).map(Number).sort((a, b) => a - b);
  const lastOfTrip = all[all.length - 1];
  const bases = [...new Set(all.map(n => DB[n]))];
  const moves = [];
  bases.forEach(bid => {
    const days = all.filter(n => DB[n] === bid);
    const movable = days.filter((n, i) => i > 0 && n !== lastOfTrip);
    if (movable.length < 2 || movable.length > 7) return;
    const contents = movable.map(n => byDay[n]);
    const score = order => order.reduce((s, c, i) => s + conflicts(S, movable[i], c).list.length, 0);
    const base = score(contents);
    if (!base) return;
    let best = { order: contents, s: base };
    permute(contents.map((c, i) => i)).forEach(idx => {
      const order = idx.map(i => contents[i]);
      const s = score(order);
      /* при равном числе закрытых оставляем как было — лишних перестановок не делаем */
      if (s < best.s) best = { order: order, s: s, idx: idx };
    });
    if (best.s < base && best.idx) {
      movable.forEach((n, i) => { byDay[n] = best.order[i]; });
      const changed = movable.filter((n, i) => best.idx[i] !== i);
      moves.push({ bid: bid, was: base, now: best.s, days: changed,
        pairs: movable.map((n, i) => ({ date: n, from: movable[best.idx[i]] })).filter(x => x.date !== x.from) });
    }
  });
  return moves;
}

/* ── ПРАВКА ФАЙЛА ────────────────────────────────────────────────────────
   Места в файле лежат блоками « {id:'xxx',d:N,…},» — блок может занимать
   несколько строк. Режем массив P на блоки, переставляем целиком и собираем
   обратно: так сохраняются комментарии-разделители дней и переносы строк. */
function splitPlaces(src, name) {
  const key = '\nconst ' + (name || 'P') + '=[';
  const at = src.indexOf(key);
  if (at < 0) throw new Error('не нашла массив P');
  let i = at + key.length, depth = 1, end = -1;
  while (i < src.length) {
    const c = src[i];
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (!depth) { end = i; break; } }
    /* ⚠️ Кавычки бывают И ОДИНАРНЫЕ, И ДВОЙНЫЕ: в «nm:"Musée d'Orsay"» апостроф
       внутри двойных сбивал счётчик скобок, и конец массива находился не там —
       точки уезжали внутрь списка еды. Пропускаем строки любого вида. */
    else if (c === "'" || c === '"') { const q = c; i++; while (i < src.length && src[i] !== q) i += (src[i] === '\\' ? 2 : 1); }
    i++;
  }
  if (end < 0) throw new Error('не нашла конец массива P');
  const body = src.slice(at + key.length, end);
  const lines = body.split('\n');
  const blocks = [];
  let cur = null;
  lines.forEach(line => {
    const isEntry = name ? /^\s*\{n:\d+/.test(line) : /^\s*\{id:'/.test(line);
    if (isEntry) {
      if (cur) blocks.push(cur);
      cur = name
        ? { id: 'day' + (/\{n:(\d+)/.exec(line) || [])[1], n: +((/\{n:(\d+)/.exec(line) || [])[1]), text: line }
        : { id: (/id:'([^']+)'/.exec(line) || [])[1], d: +((/[,{]d:(\d+)/.exec(line) || [])[1]), text: line };
    } else if (cur) cur.text += '\n' + line;
    else blocks.push({ id: null, text: line });          /* шапка массива и комментарии */
  });
  if (cur) blocks.push(cur);
  return { head: src.slice(0, at + key.length), tail: src.slice(end), blocks: blocks };
}
function joinPlaces(parts) {
  /* ⚠️ У ПОСЛЕДНЕЙ ЗАПИСИ В МАССИВЕ ЗАПЯТОЙ НЕТ. Переставишь её в середину — и
     файл перестаёт читаться: «}» и сразу «{». Поэтому запятую дописываем всем,
     висячая запятая перед «]» в JavaScript законна. */
  const withComma = t => {
    const lines = t.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const L = lines[i].replace(/\s+$/, '');
      if (!L || /^\s*\/\*/.test(L) || /^\s*\*/.test(L) || /\*\/\s*$/.test(L)) continue;
      if (!/,$/.test(L)) lines[i] = L + ',';
      break;
    }
    return lines.join('\n');
  };
  return parts.head + parts.blocks.map(b => b.id ? withComma(b.text) : b.text).join('\n') + parts.tail;
}

function doFile(file, apply) {
  const S = load(file);
  if (!S.P || !S.DAYS || !S.START) { console.log('  нет данных маршрута — пропускаю'); return 0; }
  /* цепочки дней: только основная ветка, как её видит проверка */
  const byDay = {};
  S.P.filter(p => p.cat !== 'food' && !p.opt && typeof p.lat === 'number')
    .forEach(p => { (byDay[p.d] = byDay[p.d] || []).push(p); });

  const steps = [];
  let hard = 0;
  /* какой день (по данным) сейчас стоит на какой дате: перекладывая дни, надо
     переносить и их описание — название, подпись, заметку. Иначе получится
     «Версаль на день», а внутри Лувр */
  const owner = {};
  Object.keys(byDay).map(Number).forEach(n => { owner[n] = n; });
  const remap = pairs => {
    const was = Object.assign({}, owner);
    pairs.forEach(x => { owner[x.date] = was[x.from]; });
  };
  /* сперва раскладываем дни города по датам целиком */
  arrangeDays(S, byDay).forEach(m => {
    remap(m.pairs);
    steps.push({ kind: 'arrange', why: 'город «' + m.bid + '»: разложила дни по датам заново — '
      + m.pairs.map(x => 'на дату дня ' + x.date + ' встал день ' + x.from).join(', ')
      + ' (закрытых стало ' + m.now + ' вместо ' + m.was + ')' });
  });
  /* ⚠️ Идём не по дням подряд, а по кругу: обмен днями меняет ВСЁ расписание, и
     то, что уже проверено, надо смотреть заново. Что не поддалось — помечаем и
     больше не трогаем, иначе будем ходить по кругу вечно. */
  const stuck = {};
  let guard = 60;
  while (guard-- > 0) {
    let dayN = null, bad = null;
    for (const n of Object.keys(byDay).map(Number).sort((a, b) => a - b)) {
      const c = conflicts(S, n, byDay[n]);
      const first = c.list.find(x => !stuck[n + ':' + x.p.id]);
      if (first) { dayN = n; bad = first; break; }
    }
    if (dayN == null) break;
    {
      let pts = byDay[dayN];
      const dstr = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][dateOf(S, dayN).getDay()];

      const re = tryReorder(S, dayN, pts);
      if (re) {
        steps.push({ kind: 'order', day: dayN, arr: re.arr,
          why: 'день ' + dayN + ' (' + dstr + '): переставила порядок — «' + bad.p.nm + '» ' + bad.why
             + (bad.open ? ' (работает ' + bad.open + ')' : '') });
        pts = re.arr; byDay[dayN] = pts;
        continue;
      }
      /* сперва ищем день посвободнее, и только если такого нет — плотный:
         день на одиннадцать часов лучше, чем приехать в закрытое (человек всегда
         может отложить лишнее меткой «если успеете») */
      const mv = tryMove(S, dayN, pts, bad, byDay, 600) || tryMove(S, dayN, pts, bad, byDay, DAY_MAX);
      if (mv) {
        steps.push({ kind: 'move', from: dayN, to: mv.day, id: bad.p.id,
          arr: mv.arr, rest: pts.filter(p => p !== bad.p),
          why: 'день ' + dayN + ' (' + dstr + '): «' + bad.p.nm + '» ' + bad.why
             + ' → перенесла в день ' + mv.day + ', там открыто' });
        byDay[dayN] = pts = pts.filter(p => p !== bad.p);
        byDay[mv.day] = mv.arr;
        continue;
      }
      const sw = trySwap(S, dayN, byDay);
      if (sw) {
        steps.push({ kind: 'swap', a: dayN, b: sw.day,
          why: 'день ' + dayN + ' (' + dstr + '): «' + bad.p.nm + '» ' + bad.why
             + ' → поменяла местами дни ' + dayN + ' и ' + sw.day + ' (закрытых стало ' + sw.will + ' вместо ' + sw.was + ')' });
        remap([{ date: dayN, from: sw.day }, { date: sw.day, from: dayN }]);
        const a = byDay[dayN], b = byDay[sw.day];
        byDay[dayN] = b; byDay[sw.day] = a;
        pts = byDay[dayN];
        continue;
      }
      hard++;
      stuck[dayN + ':' + bad.p.id] = 1;
      steps.push({ kind: 'hard',
        why: '⚠ день ' + dayN + ' (' + dstr + '): «' + bad.p.nm + '» ' + bad.why
          + (bad.open ? ' (работает ' + bad.open + ')' : '')
          + ' — не поддалось: рядом нет дня, где открыто, и перестановка не спасает. Нужны руки.' });
    }
  }

  /* второй заход раскладки: после переносов картина другая, и иногда теперь
     находится расстановка дней, которой раньше не было */
  arrangeDays(S, byDay).forEach(m => {
    remap(m.pairs);
    steps.push({ kind: 'arrange', why: 'город «' + m.bid + '»: ещё раз разложила дни по датам — '
      + m.pairs.map(x => 'на дату дня ' + x.date + ' встал день ' + x.from).join(', ')
      + ' (закрытых стало ' + m.now + ' вместо ' + m.was + ')' });
  });

  /* как в итоге выглядят дни — чтобы было видно, не набили ли мы один под завязку */
  const after = Object.keys(byDay).map(Number).sort((x, y) => x - y).map(n => {
    const c = conflicts(S, n, byDay[n]);
    return '    день ' + n + ': ' + byDay[n].length + ' точек, ' + hhmm(c.total + START_MIN).replace(/^(d+):/, (mm, h) => (h - 9) + ' ч ')
      + (c.list.length ? ' · закрыто: ' + c.list.map(x => x.p.nm).join(', ') : '');
  });

  /* если что-то не поддалось — считаем, поможет ли сдвиг старта поездки:
     это её же мысль «можно передвинуть даты», только посчитанная */
  if (hard) {
    const base0 = String(S.START);
    let hint = null;
    for (let sh = -3; sh <= 3 && !hint; sh++) {
      if (!sh) continue;
      const d0 = new Date(base0 + 'T12:00:00');
      d0.setDate(d0.getDate() + sh);
      const S2 = Object.assign({}, S, { START: d0.toISOString().slice(0, 10) });
      const left = Object.keys(byDay).map(Number).reduce((sum, n) => sum + conflicts(S2, n, byDay[n]).list.length, 0);
      if (!left) hint = { sh: sh, date: S2.START };
    }
    if (hint) steps.push({ kind: 'hint', why: '💡 если сдвинуть старт поездки на ' + (hint.sh > 0 ? '+' : '') + hint.sh
      + ' ' + (Math.abs(hint.sh) === 1 ? 'день' : 'дня') + ' (на ' + hint.date + '), закрытых не остаётся вовсе' });
  }

  if (!steps.length) { console.log('  всё сходится с часами работы — двигать нечего'); return hard; }
  steps.forEach(s => console.log('  ' + s.why));
  console.log('  как стало:');
  after.forEach(x => console.log(x));
  if (!apply) { console.log('  (это черновик; чтобы применить — добавьте --apply)'); return hard; }

  /* складываем итог: у каждой точки новый день и новый порядок */
  const parts = splitPlaces(S.src);
  const order = [];                        /* id по порядку, как должны лечь */
  const dayOfId = {};
  Object.keys(byDay).map(Number).sort((a, b) => a - b).forEach(n => {
    byDay[n].forEach(p => { order.push(p.id); dayOfId[p.id] = n; });
  });
  /* блоки мест переносим целиком, меняя только d: */
  const known = {}, rest = [];
  parts.blocks.forEach(b => { if (b.id && dayOfId[b.id] !== undefined) known[b.id] = b; else rest.push(b); });
  const moved = order.map(id => {
    const b = known[id];
    b.text = b.text.replace(/([,{])d:\d+/, (m, p1) => p1 + 'd:' + dayOfId[id]);
    return b;
  });
  /* точки вариантов и прочее (rest) оставляем на своих местах в конце массива */
  parts.blocks = moved.concat(rest.filter(b => b.id));
  const headComments = rest.filter(b => !b.id).map(b => b.text).join('\n');
  let out = joinPlaces(parts);
  if (headComments.trim()) out = out.replace(parts.head, parts.head + headComments + '\n');

  /* ⚠️ ОПИСАНИЕ ДНЯ ЕДЕТ ВМЕСТЕ С ЕГО СОДЕРЖИМЫМ. Переставили дни местами —
     значит и название, и подпись, и заметка должны переехать, иначе выйдет
     «Версаль на день», а внутри Лувр. Первый прогон именно так и напортил. */
  const swapped = Object.keys(owner).filter(n => owner[n] !== +n);
  if (swapped.length) {
    const dp = splitPlaces(out, 'DAYS');
    const byN = {};
    dp.blocks.forEach(b => { if (b.id) byN[b.n] = b; });
    const seq = Object.keys(owner).map(Number).sort((a, b) => a - b);
    const newBlocks = seq.map(n => {
      const src = byN[owner[n]];
      if (!src) return null;
      return { id: 'day' + n, n: n, text: src.text.replace(/\{n:\d+/, '{n:' + n) };
    }).filter(Boolean);
    if (newBlocks.length === seq.length) {
      dp.blocks = dp.blocks.filter(b => !b.id).concat(newBlocks);
      out = joinPlaces(dp);
      console.log('  описания дней переехали вместе с содержимым: '
        + swapped.map(n => 'на дату ' + n + ' — день ' + owner[n]).join(', '));
    } else console.log('  ⚠ не смогла переставить описания дней — проверьте названия руками');
  }
  fs.writeFileSync(file, out);
  console.log('  ✅ применено. Теперь пересчитайте дороги: node road-times.js ' + path.basename(file));
  return hard;
}

const args = process.argv.slice(2);
const apply = args.indexOf('--apply') >= 0;
const arg = args.filter(a => a.charAt(0) !== '-')[0];
const files = arg ? [arg] : fs.readdirSync(__dirname)
  .filter(f => /^trip-[a-z0-9-]+\.js$/.test(f) && f !== 'trip-TEMPLATE.js');
let hard = 0;
files.forEach(f => {
  console.log('\n=== ' + path.basename(f) + ' ===');
  try { hard += doFile(path.join(__dirname, path.basename(f)), apply); }
  catch (e) { console.log('  сломалось: ' + e.message); }
});
if (hard) console.log('\n' + hard + ' случ' + (hard === 1 ? 'ай' : 'ая') + ' сборщик не закрыл — смотрите выше, там сказано почему');
