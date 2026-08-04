/* ==========================================================================
   ОДНА КОМАНДА, КОТОРАЯ ПРОВЕРЯЕТ МАРШРУТ ЦЕЛИКОМ

   Правило клиента: «наша задача не исправить конкретный маршрут, а сделать
   так, чтобы каждый новый строился правильно и этих ошибок больше не было».
   Поэтому все разборы превращены в проверки, а проверки собраны сюда.

   Запуск:
     node newroute.js trip-milan.js            — всё, что можно проверить без сети
     node newroute.js trip-milan.js --coords   — плюс сверка координат по справочникам
     node newroute.js trip-milan.js --roads    — плюс расчёт дорог по OpenStreetMap
     node newroute.js                          — по всем маршрутам сразу

   Что прогоняется:
     1) check-route.js  — форма данных, аэропорты, переезды, еда, фотографии,
                          наполнение дней, расхождение с базой проверенных мест;
     2) day-order.js    — день это маршрут, а не список: считаем длину прохода;
     3) verify-coords.js (по флагу --coords) — четыре источника на каждую точку;
     4) road-times.js   (по флагу --roads)  — километры и минуты ПО ДОРОГЕ.

   Правила целиком — в ROUTE-RULES.md.
   ========================================================================== */
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');

const args = process.argv.slice(2);
const withCoords = args.indexOf('--coords') >= 0;
const withRoads = args.indexOf('--roads') >= 0;
const file = args.filter(a => a.charAt(0) !== '-')[0];
const files = file ? [file] : fs.readdirSync(__dirname).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f));

function run(script, arg) {
  try {
    const out = execFileSync('node', [path.join(__dirname, script)].concat(arg ? [arg] : []),
      { encoding: 'utf8', maxBuffer: 1e8 });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: (e.stdout || '') + (e.stderr || '') };
  }
}

let hard = 0, soft = 0;

/* СНАЧАЛА — САМ СЧЁТ ДНЯ. Если сломана арифметика (что идёт в день, а что нет),
   врать будут все проверки разом, и разбираться в их выводе бессмысленно.
   Случаи внутри day-math.js — живые ошибки, за которые нам уже прилетело. */
console.log('\n████ математика дня (day-math.js)');
{
  let bad = require('./day-math.js').selftest(s => console.log(s));
  console.log('\n████ часы работы (open-hours.js)');
  bad += require('./open-hours.js').selftest(s => console.log(s));
  if (bad) {
    hard += bad;
    console.log('  ❌ счёт дня сломан — остальные проверки считать нет смысла');
    console.log('     правило 16б в ROUTE-RULES.md объясняет, как он должен работать');
    process.exit(1);
  }
}

/* Страница — это движок, маршрут — это данные. Проверка общая для всех маршрутов,
   поэтому стоит один раз, до разбора файлов. Разбор 03.08.2026: в index.html
   лежало Колорадо и показывалось под Парижем и Токио. */
console.log('\n████ движок без текста маршрутов (check-static.js)');
hard += require('./check-static.js').run(s => console.log(s));

/* И сама страница: половина ошибок разбора 03.08 жила не в данных, а в том, что
   человек видел на экране. Открываем страницу в браузере без окна и читаем её.
   Без jsdom проверка честно говорит, что пропущена, и никого не задерживает. */
console.log('\n████ страница целиком (check-page.js)');
{
  const p = run('check-page.js', file);
  const lines = p.out.split('\n').filter(l => /ОШИБКА|пропущено|все страницы/.test(l));
  if (lines.length) console.log(lines.join('\n'));
  hard += (p.out.match(/^\s*ОШИБКА/gm) || []).length;
}

/* Переходы между экранами: главная / кабинет / поездка. Её жалоба 04.08 —
   «стою на главной, жму обновить, попадаю в поездку». Проверка ходит по сайту
   кнопками и следит, чтобы у каждого экрана был свой адрес. */
console.log('
████ один адрес — одна страница (check-nav.js)');
{
  const p = run('check-nav.js', '');
  const lines = p.out.split('
').filter(l => /ОШИБКА|пропущено|в порядке|не сошлось/.test(l));
  if (lines.length) console.log(lines.join('
'));
  hard += (p.out.match(/^\s*ОШИБКА/gm) || []).length;
}

files.forEach(f => {
  console.log('\n████ ' + f);

  /* дороги считаем ПЕРВЫМИ: check-route ниже смотрит, посчитаны ли они, и
     ругаться на только что исправленное было бы глупо */
  if (withRoads) {
    const r = run('road-times.js', f);
    console.log(r.out.split('\n').filter(l => /записано|не посчитался|занижала|хуже всего/.test(l)).join('\n'));
  }

  const c = run('check-route.js', f);
  const errs = (c.out.match(/^\s*ОШИБКА/gm) || []).length;
  const warns = (c.out.match(/^\s*внимание/gm) || []).length;
  hard += errs; soft += warns;
  process.stdout.write(c.out.split('\n').filter(l => /ОШИБКА|внимание|всё в порядке/.test(l)).join('\n') + '\n');

  const o = run('day-order.js', f);
  const zig = o.out.split('\n').filter(l => /КОРОЧЕ/.test(l));
  if (zig.length) { soft += zig.length; console.log('  путь по дням:'); console.log(zig.join('\n')); }
  else console.log('  путь по дням: порядок точек в норме');

  if (withCoords) {
    const v = run('verify-coords.js', f);
    const badc = v.out.split('\n').filter(l => /✗/.test(l));
    if (badc.length) { hard += badc.length; console.log('  координаты:'); console.log(badc.join('\n')); }
    else console.log('  координаты: расхождений нет');
  }
});

console.log('\n══════════════════════════════════════');
if (!withCoords) console.log('координаты не сверялись — добавьте --coords, когда есть сеть');
if (hard) {
  console.log('❌ НЕ ГОТОВО К ВЫКЛАДКЕ: ошибок ' + hard + ', замечаний ' + soft);
  console.log('   правила и порядок работ — в ROUTE-RULES.md');
  process.exit(1);
}
console.log(soft ? ('⚠️  ошибок нет, но есть ' + soft + ' замечаний — посмотрите их глазами')
                 : '✅ всё чисто');
