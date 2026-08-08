/* ==========================================================================
   ЧТО ЖИВОЙ САЙТ РЕАЛЬНО ОТДАЁТ — ПРОВЕРКА ПОСЛЕ ВЫКЛАДКИ

   Её слова 07.08.2026: «почему ты каждый раз говоришь, что починил, а на самом
   деле нет… я не вижу, чтоб ты изменил на сайте».

   ⚠️ Все остальные проверки смотрят на файлы У НАС. Эта — на САЙТ. Между ними
   помещались целые ошибки: правка была, выкладка прошла, а человек открывал
   страницу и видел старое.

   Прогоны не умеют document.write — а именно им грузится и маршрут, и его текст.
   Прогоны не умеют document.write — а именно им грузится и маршрут, и его текст.
   Поэтому берём ВЫЛОЖЕННЫЙ файл, вырезаем загрузчик и выполняем его отдельно,
   подсунув свой document.write. Что он напишет — то браузер и запросит.

   Запуск:  node check-live.js
   ========================================================================== */
const https = require('https');

function get(u) {
  return new Promise((res, rej) => {
    https.get(u, { rejectUnauthorized: false }, r => {
      let d = ''; r.setEncoding('utf8');
      r.on('data', c => d += c); r.on('end', () => res({ code: r.statusCode, body: d }));
    }).on('error', rej);
  });
}

(async () => {
  const page = await get('https://kolibripro.com/en/');
  console.log('страница /en/ отдалась:', page.code, page.body.length + ' байт');
  console.log('метка языка в файле:', /__lang="en"/.test(page.body));

  /* вырезаем инлайн-скрипт с загрузчиком: он один такой — в нём document.write */
  const blocks = page.body.split('<script').filter(b => b.indexOf('document.write') >= 0);
  console.log('блоков с загрузчиком:', blocks.length);
  const code = blocks[0].slice(blocks[0].indexOf('>') + 1).split('</script')[0];

  const asked = [];
  const win = {
    __lang: 'en',
    location: { search: '?trip', pathname: '/en/', href: 'https://kolibripro.com/en/?trip', origin: 'https://kolibripro.com' },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    history: { replaceState: () => {} },
    document: { write: s => { const m = s.match(/src="([^"]+)"/); if (m) asked.push(m[1]); } }
  };
  win.window = win;
  const vm = require('vm');
  const ctx = vm.createContext(win);
  ctx.URLSearchParams = URLSearchParams; ctx.URL = URL; ctx.JSON = JSON;
  ctx.Date = Date; ctx.Math = Math; ctx.Object = Object; ctx.Array = Array;
  try { vm.runInContext(code, ctx); } catch (e) { console.log('загрузчик споткнулся:', e.message); }

  console.log('\nстраница попросит:');
  asked.forEach(u => console.log('   ' + u));

  for (const u of asked) {
    const r = await get('https://kolibripro.com' + (u.startsWith('/') ? u : '/' + u));
    console.log('   ' + u + ' → ' + r.code + (r.code === 200 ? ('  ' + r.body.length + ' байт') : ''));
    /* ⚠️ РАЗНЫЕ ФАЙЛЫ — РАЗНАЯ ПРОВЕРКА. Оба кончаются на «-en.js», но внутри
       у них разное: trip-<маршрут>-en.js — текст поездки, lang-en.js — словарь
       интерфейса. Одна проверка на оба врала: про словарь она честно печатала
       «английского текста внутри: false», хотя файл целый и на месте. */
    if (/^\/?lang-[a-z]{2}\.js$/.test(u) && r.code === 200) {
      console.log('   словарь языка живой:', /I18N\.add|__i18nPacks/.test(r.body),
        '· фраз:', (r.body.match(/':\s*'/g) || []).length);
    } else if (/-en\.js$/.test(u) && r.code === 200) {
      console.log('   английский текст внутри:', /__tripText/.test(r.body),
        '· пример:', (r.body.match(/why: '([^']{20,60})/) || [])[1] || '—');
    }
  }

  /* ⚠️ РУССКИЙ НЕ ДОЛЖЕН КАЧАТЬ ЧУЖОЙ СЛОВАРЬ (шаг 2 плана, 08.08.2026).
     Ради этого словари и разделены — значит это надо МЕРИТЬ, а не верить.
     ⚠️ И мерить именно прогоном загрузчика, а не поиском строки в файле:
     строка «src="/lang-» лежит в самом коде загрузчика и есть на любой
     странице, включая русскую. Первый заход именно так и соврал. */
  const ru = await get('https://kolibripro.com/');
  console.log('\nрусская страница: ' + ru.code + ', ' + ru.body.length + ' байт');
  const rblocks = ru.body.split('<script').filter(b => b.indexOf('document.write') >= 0);
  const rcode = rblocks.length ? rblocks[0].slice(rblocks[0].indexOf('>') + 1).split('</script')[0] : '';
  const rasked = [];
  const rwin = {
    location: { search: '?trip', pathname: '/', href: 'https://kolibripro.com/?trip', origin: 'https://kolibripro.com' },
    localStorage: { getItem: () => null, setItem: () => { }, removeItem: () => { } },
    history: { replaceState: () => { } },
    document: { write: s => { const m = s.match(/src="([^"]+)"/); if (m) rasked.push(m[1]); } }
  };
  rwin.window = rwin;
  const rctx = vm.createContext(rwin);
  rctx.URLSearchParams = URLSearchParams; rctx.URL = URL; rctx.JSON = JSON;
  rctx.Date = Date; rctx.Math = Math; rctx.Object = Object; rctx.Array = Array;
  try { vm.runInContext(rcode, rctx); } catch (e) { console.log('  загрузчик споткнулся:', e.message); }
  console.log('  она попросит: ' + (rasked.join(', ') || '—'));
  console.log('  словарь языка среди них:',
    rasked.some(u => /lang-[a-z]{2}\.js$/.test(u)) ? 'ДА — это ошибка' : 'нет, как и задумано');
})();
