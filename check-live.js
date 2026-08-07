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
    if (/-en\.js$/.test(u) && r.code === 200) {
      console.log('   английский текст внутри:', /__tripText/.test(r.body),
        '· пример:', (r.body.match(/why: '([^']{20,60})/) || [])[1] || '—');
    }
  }
})();
