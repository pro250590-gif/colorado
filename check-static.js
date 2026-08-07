/* ==========================================================================
   В ДВИЖКЕ НЕ ДОЛЖНО БЫТЬ ТЕКСТА КОНКРЕТНОГО МАРШРУТА

   Разбор 03.08.2026. Клиент открыла пробный маршрут по Франции и написала:
   «даты не соответствуют, одни ошибки». Половина «ошибок» оказалась не в данных:
   в index.html готовым текстом лежало Колорадо — рассказ про Скалистые горы,
   фотография Maroon Bells, таблица «Переезды и время за рулём» с Дуранго и
   Меса-Верде, блок «Что бронировать заранее» с билетами в Меса-Верде и грозами
   в августе. Показывалось это ПОД ЛЮБЫМ маршрутом: под Парижем и Токио тоже.

   Правило: страница — это движок, маршрут — это данные. Всё, что называет
   конкретное место, город, дорогу или дату поездки, живёт в trip-*.js.

   Проверка сравнивает index.html с текстами всех маршрутов: если в движке нашлась
   строка, которая принадлежит какому-то одному маршруту, — это ошибка.

   Запуск:
     node check-static.js
   Отдельно звать не обязательно — она входит в node newroute.js.
   ========================================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');

const DIR = __dirname;
const PAGE = path.join(DIR, 'index.html');

/* Читаем файл маршрута в отдельной песочнице: он объявляет только const и ни на
   что снаружи не смотрит, поэтому его можно честно выполнить и взять значения. */
function readTrip(file) {
  const src = fs.readFileSync(path.join(DIR, file), 'utf8');
  const sand = { console: console };
  try {
    vm.runInNewContext(src, sand, { timeout: 5000 });
    return vm.runInNewContext(
      '({name:typeof TRIP_NAME!=="undefined"?TRIP_NAME:"",' +
      ' hero:typeof HERO!=="undefined"?HERO:null,' +
      ' drive:typeof DRIVE!=="undefined"?DRIVE:null,' +
      ' tips:typeof TIPS!=="undefined"?TIPS:null,' +
      ' bases:typeof BASES!=="undefined"?BASES:[]})', sand);
  } catch (e) { return null; }
}

/* Что считается «текстом маршрута»: рассказ в шапке, подпись к фотографии,
   строки сводки переездов, пункты «что занять заранее» и названия городов.
   Мелочь вроде «2 ч» не берём — она не про маршрут, а про что угодно. */
function signatures(t) {
  const out = [];
  const add = s => { s = String(s || '').trim(); if (s.length >= 12) out.push(s); };
  if (t.hero) { add(t.hero.sub); add(t.hero.capTitle); add(t.hero.capSub); add(t.hero.alt); }
  if (t.drive) {
    (t.drive.rows || []).forEach(r => add(r.seg));
    if (t.drive.total) add(t.drive.total.seg);
  }
  (t.tips || []).forEach(g => { add(g.t); (g.li || []).forEach(li => add(String(li).replace(/<[^>]*>/g, ''))); });
  (t.bases || []).forEach(b => { add(b.desc); add(b.alt); });
  return out;
}

function run(say) {
  /* ⚠️ trip-paris-en.js — это НЕ маршрут, а его словарь (window.__tripT).
     В песочнице он не читается, и проверка честно жаловалась на восемь файлов,
     с которыми всё в порядке. Двухбуквенный хвост в имени = язык, пропускаем. */
  const files = fs.readdirSync(DIR)
    .filter(f => /^trip-[a-z0-9-]+\.js$/.test(f) && !/-[a-z]{2}\.js$/.test(f));
  /* Комментарии не считаются: в них мы как раз объясняем, что здесь лежало
     Колорадо и почему его убрали. Ищем только то, что видит человек. */
  const page = fs.readFileSync(PAGE, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ');
  let bad = 0;

  files.forEach(f => {
    const t = readTrip(f);
    if (!t) { say('  внимание ' + f + ': не читается в песочнице — проверка пропущена'); return; }
    signatures(t).forEach(s => {
      /* длинную строку ищем целиком, у длинных берём начало: в HTML внутри мог
         оказаться перенос строки или &amp; — начала хватает, чтобы поймать */
      const probe = s.length > 60 ? s.slice(0, 60) : s;
      if (page.indexOf(probe) >= 0) {
        bad++;
        say('  ОШИБКА текст маршрута ' + f + ' лежит в index.html: «' + probe.slice(0, 70) + '…»');
        say('         страница — это движок, а такой текст живёт в файле маршрута');
      }
    });
  });

  /* Обратная сторона того же правила: разделы, которые целиком принадлежат
     маршруту, должны строиться из данных, а не стоять готовыми в странице. */
  [['<tbody id="driveBody">', 'сводка переездов (DRIVE)'],
   ['<div id="tipsBox">', 'что занять заранее (TIPS)']].forEach(p => {
    if (page.indexOf(p[0]) < 0) {
      bad++;
      say('  ОШИБКА раздел «' + p[1] + '» больше не строится из данных маршрута');
    }
  });

  if (!bad) say('  движок чист: текста конкретных маршрутов в index.html нет');
  return bad;
}

if (require.main === module) {
  const bad = run(s => console.log(s));
  process.exit(bad ? 1 : 0);
}
module.exports = { run: run };
