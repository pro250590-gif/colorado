/* ==========================================================================
   ЧАСЫ РАБОТЫ: РАЗБОР СТРОКИ OpenStreetMap — ОДИН НА СТРАНИЦУ И НА ПРОВЕРКУ

   Строку собирает node hours.js из карты и кладёт в META.<id>.hours как есть:
     «Mo-Su 09:00-17:00»
     «Tu-Su 09:00-18:30»                        (Версаль — понедельник выходной)
     «Mo,Th,Sa-Su 09:00-18:00; Tu off; We,Fr 09:00-21:00»          (Лувр)
     «Jan-Mar 09:00-17:00; Apr-Sep 09:00-19:00»           (Сент-Шапель, по сезону)
     «24/7»
   Здесь она превращается в ответ на два вопроса: открыто ли в ЭТОТ день и в
   какие часы. Больше ничего от неё не нужно.

   Почему отдельным файлом и одним на всех: та же причина, что у day-math.js —
   написанное дважды разъезжается. Страница рисует плашку, `check-route` ругается
   на день, который приезжает в закрытое, — и оба читают строку одинаково.

   ⚠️ Чего мы НЕ понимаем и честно говорим «не знаю»: праздники (PH), «sunset»,
   «school holidays», недельные повторы вида «Mo[1]». В таких случаях open()
   возвращает null, и мы просто показываем строку как есть, не выдумывая.

   Самопроверка:  node open-hours.js --test
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OPENHOURS = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  var WD = { su: 0, mo: 1, tu: 2, we: 3, th: 4, fr: 5, sa: 6 };
  var MO = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  var RU = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  function hhmm(t) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
    if (!m) return null;
    return (+m[1]) * 60 + (+m[2]);
  }

  /* один кусок строки: «Tu-Su 09:00-18:30», «Tu off», «Jun 21-Sep 02 09:00-00:45» */
  function rule(part) {
    var s = part.trim();
    if (!s) return null;
    if (/^24\/7$/i.test(s)) return { days: null, months: null, times: [[0, 1440]] };
    var off = /\b(off|closed)\b/i.test(s);
    var r = { days: null, months: null, times: off ? 'off' : [] };
    /* времена */
    var tt = s.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/g) || [];
    if (!off) {
      tt.forEach(function (x) {
        var p = x.split('-'), a = hhmm(p[0]), b = hhmm(p[1]);
        if (a == null || b == null) return;
        if (b <= a) b += 1440;                  /* «09:00-00:45» — до ночи */
        r.times.push([a, b]);
      });
      if (!r.times.length) return null;         /* ни времени, ни «off» — не поняли */
    }
    var head = s.replace(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/g, ' ')
      .replace(/\b(off|closed)\b/ig, ' ').trim();
    if (!head) return r;                        /* «09:00-17:00» без дней — значит каждый день */
    /* дни недели */
    var days = null;
    head.replace(/\b(mo|tu|we|th|fr|sa|su)\b(\s*-\s*(mo|tu|we|th|fr|sa|su)\b)?/ig, function (all, a, _x, b) {
      days = days || {};
      var i = WD[a.toLowerCase()];
      if (b) { var j = WD[b.toLowerCase()]; for (var k = i; ; k = (k + 1) % 7) { days[k] = 1; if (k === j) break; } }
      else days[i] = 1;
      return ' ';
    });
    if (days) r.days = days;
    /* месяцы (в том числе с числами: Jun 21-Sep 02) */
    var mm = head.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b\s*(\d{1,2})?(\s*-\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(\d{1,2})?)?/ig);
    if (mm && mm.length) {
      r.months = mm.map(function (x) {
        var p = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b\s*(\d{1,2})?(?:\s*-\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b)?\s*(\d{1,2})?)?/i.exec(x);
        return { m1: MO[p[1].toLowerCase()], d1: p[2] ? +p[2] : null,
                 m2: p[3] ? MO[p[3].toLowerCase()] : (p[4] ? MO[p[1].toLowerCase()] : null),
                 d2: p[4] ? +p[4] : null };
      });
    }
    /* то, чего мы не понимаем: праздники, закаты, «первый понедельник месяца» */
    if (/\b(ph|sh|sunrise|sunset|week|\[)/i.test(head)) r.fuzzy = true;
    return r;
  }

  function parse(str) {
    var s = String(str || '').trim();
    if (!s) return null;
    var rules = s.split(';').map(rule).filter(Boolean);
    return rules.length ? rules : null;
  }

  function inMonths(r, date) {
    if (!r.months) return true;
    var m = date.getMonth() + 1, d = date.getDate();
    return r.months.some(function (x) {
      if (x.m2 == null && x.d1 == null) return x.m1 === m;                 /* «Jul» */
      if (x.m2 == null) return x.m1 === m && x.d1 === d;                   /* «Jul 14» */
      var a = x.m1 * 100 + (x.d1 || 1), b = x.m2 * 100 + (x.d2 || 31), t = m * 100 + d;
      return (a <= b) ? (t >= a && t <= b) : (t >= a || t <= b);           /* «Nov-Mar» через год */
    });
  }

  /* ── ГЛАВНОЕ: открыто ли в этот день и в какие часы ───────────────────────
     Возвращает {open:[[от,до],…]} · {open:[]} — закрыто · null — не поняли.
     Правило OpenStreetMap: правила читаются слева направо, последнее подходящее
     сильнее (в «Mo-Su 9-18; Tu off» вторник закрыт). */
  function day(str, date) {
    var rules = parse(str);
    if (!rules) return null;
    var wd = date.getDay(), hit = null, fuzzy = false;
    rules.forEach(function (r) {
      if (r.fuzzy) { fuzzy = true; return; }        /* праздники и закаты пропускаем */
      if (r.days && !r.days[wd]) return;
      if (!inMonths(r, date)) return;
      hit = r;
    });
    if (!hit) return fuzzy ? null : { open: [] };
    return { open: hit.times === 'off' ? [] : hit.times.slice() };
  }

  function fmt(m) {
    m = m % 1440;
    var h = Math.floor(m / 60), x = m % 60;
    return h + ':' + (x < 10 ? '0' : '') + x;
  }
  /* строка для плашки: «9:00–18:00», «закрыто», «круглосуточно» */
  function text(str, date) {
    var d = day(str, date);
    if (!d) return '';
    if (!d.open.length) return 'закрыто';
    if (d.open.length === 1 && d.open[0][0] === 0 && d.open[0][1] >= 1440) return 'круглосуточно';
    return d.open.map(function (t) { return fmt(t[0]) + '–' + fmt(t[1]); }).join(', ');
  }
  /* успеваем ли мы: приходим в from, уходим в to (минуты от полуночи) */
  function fits(str, date, from, to) {
    var d = day(str, date);
    if (!d) return null;                        /* не поняли — не судим */
    if (!d.open.length) return { ok: false, why: 'закрыто' };
    var ok = d.open.some(function (t) { return from >= t[0] && to <= t[1]; });
    if (ok) return { ok: true };
    var late = d.open.every(function (t) { return from >= t[1]; });
    var early = d.open.every(function (t) { return to <= t[0]; });
    return { ok: false, why: late ? 'уже закрыто' : early ? 'ещё не открыто' : 'не успеваем внутри часов',
             open: d.open.map(function (t) { return fmt(t[0]) + '–' + fmt(t[1]); }).join(', ') };
  }

  /* ── ПОДОЖДАТЬ ОТКРЫТИЯ — ЭТО НОРМАЛЬНО ──────────────────────────────────
     Если мы пришли раньше, чем открылось, человек не разворачивается и уходит —
     он подождёт, если ждать недолго. Поэтому «ещё не открыто» считается бедой
     только когда ждать больше WAIT (по умолчанию два часа).
     Возвращает {from, wait, ok, why} — время, с которого реально начнётся
     посещение. Одна функция на страницу, проверку и сборщик. */
  var WAIT = 120;
  function arrive(str, date, from, to, waitMax) {
    var dur = to - from;
    var f = fits(str, date, from, to);
    if (!f || f.ok) return { from: from, wait: 0, ok: true };
    var d = day(str, date);
    if (!d || !d.open.length) return { from: from, wait: 0, ok: false, why: f.why, open: f.open };
    var lim = (waitMax == null ? WAIT : waitMax);
    for (var i = 0; i < d.open.length; i++) {
      var a = d.open[i][0], b = d.open[i][1];
      if (from < a && a - from <= lim && a + dur <= b)
        return { from: a, wait: a - from, ok: true };
    }
    return { from: from, wait: 0, ok: false, why: f.why, open: f.open };
  }

  /* ── ВЫХОДНЫЕ ДНИ НЕДЕЛИ ──────────────────────────────────────────────────
     Её просьба: «может, в плашку добавить — выходной понедельник, выходной
     суббота-воскресенье». Считаем по неделе ВОКРУГ этой даты: у половины мест
     часы зависят от сезона, и «закрыт по вторникам» зимой и летом — разные
     вещи. Возвращает [0..6] (0 — воскресенье) или null, если не разобрали. */
  function weekOff(str, date) {
    if (!parse(str)) return null;
    var out = [], known = 0;
    for (var i = 0; i < 7; i++) {
      var d = new Date(date.getTime() + i * 86400000);
      var r = day(str, d);
      if (!r) continue;
      known++;
      if (!r.open.length) out.push(d.getDay());
    }
    if (known < 7) return null;             /* хоть один день не поняли — молчим */
    if (out.length >= 6) return null;       /* закрыто почти всегда — это не «выходной» */
    return out.sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); });
  }
  /* «выходной: пн» · «выходные: сб, вс» — короткой строкой для плашки */
  function offText(str, date) {
    var w = weekOff(str, date);
    if (!w || !w.length) return '';
    return (w.length === 1 ? 'выходной: ' : 'выходные: ') + w.map(function (x) { return RU[x]; }).join(', ');
  }

  function selftest(log) {
    log = log || function (s) { console.log(s); };
    var D = function (y, m, d) { return new Date(y, m - 1, d); };
    var C = [
      ['Версаль по понедельникам закрыт', 'Tu-Su 09:00-18:30', D(2026, 8, 3), 'закрыто'],
      ['Версаль во вторник открыт', 'Tu-Su 09:00-18:30', D(2026, 8, 4), '9:00–18:30'],
      ['Лувр во вторник закрыт', 'Mo,Th,Sa-Su 09:00-18:00; Tu off; We,Fr 09:00-21:00', D(2026, 8, 4), 'закрыто'],
      ['Лувр в пятницу до девяти', 'Mo,Th,Sa-Su 09:00-18:00; Tu off; We,Fr 09:00-21:00', D(2026, 8, 7), '9:00–21:00'],
      ['Сент-Шапель летом дольше', 'Jan-Mar 09:00-17:00; Apr-Sep 09:00-19:00; Oct-Dec 09:00-17:00', D(2026, 8, 4), '9:00–19:00'],
      ['Сент-Шапель зимой короче', 'Jan-Mar 09:00-17:00; Apr-Sep 09:00-19:00; Oct-Dec 09:00-17:00', D(2026, 2, 4), '9:00–17:00'],
      ['круглосуточно', '24/7', D(2026, 8, 4), 'круглосуточно'],
      ['зимой закрыто совсем', '11:00-21:00; Nov-Apr closed', D(2026, 12, 4), 'закрыто'],
      ['непонятную строку не выдумываем', 'sunrise-sunset', D(2026, 8, 4), '']
    ];
    var bad = 0;
    C.forEach(function (c) {
      var got = text(c[1], c[2]);
      if (got !== c[3]) { bad++; log('  ✗ ' + c[0] + ' — вышло «' + got + '», ждали «' + c[3] + '»'); }
      else log('  ✓ ' + c[0]);
    });
    var f = fits('Tu-Su 09:00-18:30', D(2026, 8, 5), 19 * 60, 20 * 60);
    if (!f || f.ok || f.why !== 'уже закрыто') { bad++; log('  ✗ приезд в семь вечера должен быть «уже закрыто»'); }
    else log('  ✓ приезд после закрытия виден');
    /* подождать открытия — нормально, если недолго */
    var w1 = arrive('Tu-Su 10:00-18:00', D(2026, 8, 4), 9 * 60, 10 * 60);
    if (!w1.ok || w1.from !== 600 || w1.wait !== 60) { bad++; log('  ✗ час до открытия должны подождать'); }
    else log('  ✓ пришли за час до открытия — подождём');
    var w2 = arrive('Tu-Su 12:00-22:00', D(2026, 8, 4), 9 * 60 + 18, 10 * 60 + 18);
    if (w2.ok) { bad++; log('  ✗ ждать почти три часа — это не «подождём»'); }
    else log('  ✓ ждать три часа не считается — это беда дня');
    /* выходные дни недели — то, что человек видит плашкой */
    [['Tu-Su 09:00-18:30', 'выходной: пн'],
     ['Mo-Fr 06:45-20:00', 'выходные: сб, вс'],
     ['24/7', ''],
     ['Mo,Th,Sa-Su 09:00-18:00; Tu off; We,Fr 09:00-21:00', 'выходной: вт']
    ].forEach(function (c) {
      var got = offText(c[0], D(2026, 8, 3));
      if (got !== c[1]) { bad++; log('  ✗ выходные «' + c[0] + '» — вышло «' + got + '», ждали «' + c[1] + '»'); }
      else log('  ✓ выходные: ' + (c[1] || 'их нет и мы молчим'));
    });
    return bad;
  }

  return { parse: parse, day: day, text: text, fits: fits, arrive: arrive, WAIT: WAIT,
           weekOff: weekOff, offText: offText,
           selftest: selftest, RU: RU };
}));

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  console.log('часы работы — самопроверка:');
  var bad = module.exports.selftest();
  console.log(bad ? '  сломано случаев: ' + bad : '  всё сходится');
  process.exit(bad ? 1 : 0);
}
