/* ⚠️ ОДИН АДРЕС — ОДНА СТРАНИЦА.
 *
 * Откуда взялось. Её жалоба 04.08.2026: «стою на главной с глобусом, жму
 * обновить — выкидывает в поездку. Как у одной ссылки две страницы?».
 * Так и было: у главной, кабинета и поездки был ОДИН адрес «/», а что показать,
 * решала запись co-trip-screen в памяти браузера. Память одна на все вкладки:
 * открытая рядом поездка переписывала её, и обновление главной уводило в
 * поездку. Со стороны это выглядит как «сайт сам себя перекидывает».
 *
 * Как сделано теперь: экран написан в адресе. «/» — главная, «?trip» — поездка,
 * «?home» — кабинет. Обновление возвращает туда же, потому что это в адресе;
 * «назад» работает; соседняя вкладка ни на что не влияет.
 *
 * Что проверяет этот файл: что так оно и есть — открытием настоящей страницы в
 * браузере без окна, нажатием настоящих кнопок. Нужен puppeteer (npm i
 * puppeteer). Без него проверка честно говорит, что пропущена.
 *
 * Запуск: node check-nav.js   (или само собой из newroute.js)
 */
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css' };

let pup = null;
try { pup = require('puppeteer'); } catch (e) { pup = null; }
if (!pup) {
  console.log('  пропущено: нет puppeteer (npm i puppeteer) — переходы между экранами не проверены');
  process.exit(0);
}

const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end('no'); return; }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  r.end(fs.readFileSync(f));
});

const bad = [];
srv.listen(0, async () => {
  const B = 'http://127.0.0.1:' + srv.address().port + '/index.html';
  const b = await pup.launch({ headless: 'new' });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.setViewport({ width: 1280, height: 900 });

  const where = p => p.evaluate(() => ({
    экран: document.body.classList.contains('atland') ? 'главная'
         : document.body.classList.contains('athome') ? 'кабинет' : 'поездка',
    адрес: location.pathname + location.search
  }));
  const go = async u => { await pg.goto(u, { waitUntil: 'networkidle0' }); await wait(900); };
  const wait = (ms = 700) => new Promise(r => setTimeout(r, ms));
  const ok = (nm, got, want) => {
    const good = got.экран === want.экран && got.адрес === want.адрес;
    if (!good) bad.push(nm + ': ждали ' + JSON.stringify(want) + ', получили ' + JSON.stringify(got));
    console.log((good ? '  ok  ' : '  ОШИБКА ') + nm + ' → ' + JSON.stringify(got));
  };

  /* две поездки в кабинете — как у человека */
  await go(B);
  await pg.evaluate(() => localStorage.setItem('co-trip-trips', JSON.stringify({
    active: 't1', mig2: 1, data: {},
    list: [{ id: 't1', title: 'Колорадо', data: 'trip-colorado.js', saved: 1, seen: 2 },
           { id: 't2', title: 'Юта', data: 'trip-utah.js', saved: 1, seen: 1 }]
  })));
  await go(B);
  ok('чистый адрес — главная', await where(pg), { экран: 'главная', адрес: '/index.html' });

  await pg.evaluate(() => showHome()); await wait();
  ok('кабинет', await where(pg), { экран: 'кабинет', адрес: '/index.html?home' });

  await pg.evaluate(() => { document.querySelector('[data-topen]').click(); }); await wait();
  ok('вошли в поездку', await where(pg), { экран: 'поездка', адрес: '/index.html?trip' });

  await pg.reload({ waitUntil: 'networkidle0' }); await wait();
  ok('обновили внутри поездки', await where(pg), { экран: 'поездка', адрес: '/index.html?trip' });

  await pg.goBack({ waitUntil: 'domcontentloaded' }); await wait();
  ok('«назад» из поездки', await where(pg), { экран: 'кабинет', адрес: '/index.html?home' });

  /* ГЛАВНОЕ МЕСТО: её случай. Память говорит «поездка», а человек стоит на главной */
  await pg.evaluate(() => showLand(null)); await wait();
  ok('ушли на главную', await where(pg), { экран: 'главная', адрес: '/index.html' });
  await pg.evaluate(() => localStorage.setItem('co-trip-screen', 'trip'));
  await pg.reload({ waitUntil: 'networkidle0' }); await wait();
  ok('ОБНОВИЛИ НА ГЛАВНОЙ, память помнит поездку', await where(pg), { экран: 'главная', адрес: '/index.html' });

  /* и настоящая соседняя вкладка */
  const pg2 = await b.newPage();
  pg2.on('pageerror', e => errs.push('вторая вкладка: ' + e.message));
  await pg2.goto(B + '?trip', { waitUntil: 'networkidle0' }); await wait();
  ok('вторая вкладка по ссылке ?trip', await where(pg2), { экран: 'поездка', адрес: '/index.html?trip' });
  await pg.reload({ waitUntil: 'networkidle0' }); await wait();
  ok('первая вкладка после обновления осталась на главной', await where(pg), { экран: 'главная', адрес: '/index.html' });

  /* ссылка на маршрут ведёт в маршрут, а не на витрину */
  await pg.goto(B + '?data=trip-utah.js', { waitUntil: 'networkidle0' }); await wait();
  ok('ссылка ?data= открывает поездку', await where(pg), { экран: 'поездка', адрес: '/index.html?trip' });

  if (errs.length) { bad.push('ошибки страницы: ' + errs.join(' | ')); console.log('  ОШИБКА страница ругается: ' + errs.join(' | ')); }
  console.log(bad.length ? ('  переходы между экранами: не сошлось ' + bad.length) : '  переходы между экранами в порядке');
  await b.close(); srv.close(); process.exit(bad.length ? 1 : 0);
});
