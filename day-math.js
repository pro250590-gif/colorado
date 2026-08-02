/* ==========================================================================
   МАТЕМАТИКА ДНЯ — ОДНА НА ВСЕХ

   Зачем этот файл. Её правило: «наша задача не исправить конкретный маршрут, а
   сделать так, чтобы каждый новый строился правильно — и когда маршруты начнёт
   генерировать искусственный интеллект, он этих ошибок не повторял».

   Время дня считалось в ДВУХ местах: на странице (index.html) и в проверке
   (check-route.js). Дважды написанное расходится: правило чинили на странице, а
   проверка продолжала считать по-старому — и наоборот. Так мы дважды наступили
   на одно и то же:

     1) счёт прибавлял ОЖИДАНИЕ до ужина: день кончился в пять, ужин в семь — и
        два часа пустоты записывались в день. Разгрузка выкидывала точки, чтобы
        человек «успел поужинать»;
     2) счёт прибавлял САМ УЖИН после последней точки. День Чимни-Рок + Пагоса
        выходил 10 ч 28 (7 ч 58 дороги и мест плюс два часа еды) — и разгрузка
        отправляла в «если успеете» трёхчасовые купальни, ради которых туда и
        едут. А в шапке дня при этом стояло «6 ч 31 из 10».

   🔑 ПРАВИЛО, ИЗ КОТОРОГО ВСЁ СЛЕДУЕТ: день меряется тем, что ОТНИМАЕТ У ДНЯ
   ВРЕМЯ, а не всем, что в нём происходит. Перерыв между точками — отнимает.
   Ужин после последней точки — уже вечер: он ни с чем не соперничает и ничего не
   мешает успеть. Ожидание — не событие, его в счёт не берут вовсе.

   Теперь и страница, и проверка зовут отсюда одну функцию dayCost(). Разойтись
   им больше негде. Правила словами — в ROUTE-RULES.md (13, 14, 16, 16а, 16б).

   Самопроверка:  node day-math.js --test
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DAYMATH = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  var DAY_START = 9 * 60;            /* выходим в девять утра */
  /* окна еды: когда человек садится есть, если в это время он не в дороге */
  var MEALS = [
    { key: 'обед', from: 12 * 60, to: 15 * 60, min: 60 },
    { key: 'ужин', from: 19 * 60, to: 21 * 60, min: 90 }
  ];
  var LONG_PLACE = 90;               /* «длинная точка», ради которой едят заранее */
  var LATE = 90;                     /* насколько позже окна ужин ещё имеет смысл */

  /* ── ДЕНЬ ПО ЧАСАМ ────────────────────────────────────────────────────────
     items — цепочка дня по порядку: [{min: минут на месте, move: минут дороги
     до него}]. Всё остальное (какие точки, чем добираются, что выключено)
     решает тот, кто зовёт: сюда приходят уже только числа.

     Возвращает:
       total — сколько дней отнял день (это и есть «X из 10 часов»);
       food  — сколько из них съела еда МЕЖДУ точками;
       meals — где встали перерывы: {meal, at, min, before, tail}
               before — перед какой точкой цепочки (индекс), tail — еда после
               последней точки: её показываем, но в счёт не берём;
       end   — во сколько человек освободился (с ужином в конце). */
  function dayCost(items, opt) {
    opt = opt || {};
    var meals = opt.meals || MEALS;
    var start = (opt.start == null) ? DAY_START : opt.start;
    var longPlace = (opt.longPlace == null) ? LONG_PLACE : opt.longPlace;
    var list = items || [];
    var clock = start, eaten = {}, plan = [];

    for (var i = 0; i < list.length; i++) {
      var move = list[i].move || 0, dur = list[i].min || 0;
      /* не пора ли поесть — решаем ДО того, как уйти в следующую точку */
      for (var m = 0; m < meals.length; m++) {
        var ml = meals[m];
        if (eaten[ml.key] || clock < ml.from || clock > ml.to) continue;
        /* выбираем промежуток ближе к середине окна — не «первый после половины
           первого». И кормим заранее, если следующая точка длинная и окно за неё
           не дотянется: иначе человек уходит на два часа в музей голодным */
        var mid = (ml.from + ml.to) / 2, after = clock + move + dur;
        var mustNow = after > ml.to || (dur >= longPlace && after > mid + ml.min);
        if (!mustNow && Math.abs(clock - mid) > Math.abs(after - mid)) continue;
        eaten[ml.key] = 1;
        plan.push({ meal: ml.key, at: clock, min: ml.min, before: i, tail: false });
        clock += ml.min;
      }
      clock += move + dur;
    }
    var end = clock;

    /* день кончился, а ужин так и не случился — он всё равно будет, но это уже
       вечер. Ни ожидание до семи, ни сам ужин в счёт дня не идут (см. шапку) */
    for (var k = 0; k < meals.length; k++) {
      var mk = meals[k];
      if (eaten[mk.key] || clock > mk.to + LATE) continue;
      var at = Math.max(clock, mk.from);
      if (at > mk.to) continue;
      eaten[mk.key] = 1;
      plan.push({ meal: mk.key, at: at, min: mk.min, before: list.length, tail: true });
      end = at + mk.min;
    }

    var food = 0;
    plan.forEach(function (x) { if (!x.tail) food += x.min; });
    return { total: clock - start, food: food, meals: plan, end: end };
  }

  /* ── САМОПРОВЕРКА ─────────────────────────────────────────────────────────
     ⚠️ ИЗВЕСТНАЯ ДЫРА, ЗАПИСАНА НАРОЧНО: кормить заранее мы умеем только внутри
     окна. Если в 11:30 (окно ещё не открылось) человек уходит в четырёхчасовой
     музей и выходит в 16:00, обед не случается вовсе — ни между точками, ни
     после, и день выглядит на час дешевле, чем он есть. Чинить это — менять
     расстановку еды сразу во всех маршрутах, поэтому сперва показываем клиенту,
     а не правим молча.

     Каждый случай здесь — живая ошибка, за которую нам уже прилетело. Если
     кто-нибудь (человек или ИИ) перепишет счёт «как проще», тесты упадут. */
  var CASES = [
    {
      nm: 'ужин после последней точки в счёт не идёт (Чимни-Рок и Пагоса)',
      items: [{ move: 91, min: 150 }, { move: 57, min: 180 }],
      total: 478 + 60, food: 60, tail: 1
    },
    {
      nm: 'ожидание до ужина не идёт в счёт (день кончился в час дня)',
      items: [{ move: 30, min: 120 }, { move: 20, min: 60 }],
      total: 230, food: 0, tail: 2
    },
    {
      nm: 'короткий день: еда случается уже после него — в счёт не идёт',
      items: [{ move: 10, min: 60 }],
      total: 70, food: 0, tail: 2
    },
    {
      nm: 'обед встаёт ПЕРЕД длинной точкой, а не после неё',
      items: [{ move: 0, min: 180 }, { move: 30, min: 240 }],
      total: 510, food: 60, tail: 1, mealBefore: 1
    },
    {
      nm: 'длинный день: и обед, и ужин между точками — оба в счёте',
      items: [{ move: 30, min: 180 }, { move: 60, min: 180 }, { move: 60, min: 120 }, { move: 30, min: 60 }],
      total: 870, food: 150, tail: 0
    }
  ];

  function selftest(log) {
    log = log || function (s) { console.log(s); };
    var bad = 0;
    CASES.forEach(function (c) {
      var r = dayCost(c.items);
      var tail = r.meals.filter(function (x) { return x.tail; }).length;
      var errs = [];
      if (r.total !== c.total) errs.push('всего ' + r.total + ', ждали ' + c.total);
      if (r.food !== c.food) errs.push('еда в счёте ' + r.food + ', ждали ' + c.food);
      if (tail !== c.tail) errs.push('еды в конце ' + tail + ', ждали ' + c.tail);
      if (c.mealBefore != null) {
        var mb = (r.meals.filter(function (x) { return !x.tail; })[0] || {}).before;
        if (mb !== c.mealBefore) errs.push('перерыв перед точкой ' + mb + ', ждали ' + c.mealBefore);
      }
      if (errs.length) { bad++; log('  ✗ ' + c.nm + ' — ' + errs.join('; ')); }
      else log('  ✓ ' + c.nm);
    });
    return bad;
  }

  return {
    DAY_START: DAY_START, MEALS: MEALS, LONG_PLACE: LONG_PLACE,
    dayCost: dayCost, selftest: selftest
  };
}));

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  console.log('математика дня — самопроверка:');
  var bad = module.exports.selftest();
  console.log(bad ? '  сломано случаев: ' + bad : '  всё сходится');
  process.exit(bad ? 1 : 0);
}
