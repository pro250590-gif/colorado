/* ==========================================================================
   ПРОВЕРКА ГОТОВОЙ СТРАНИЦЫ, А НЕ ТОЛЬКО ДАННЫХ

   Разбор 03.08.2026. Все прежние проверки читают trip-*.js — и все они молчали,
   пока на странице творилось: под французским маршрутом висела таблица переездов
   Колорадо, вкладка называлась «Колорадо · Дуранго → Денвер», а даты и ночи
   приходили из чужой сохранённой поездки. Данные были в порядке; врала страница.

   Поэтому здесь страница открывается по-настоящему — в браузере без окна — и
   читается ровно то, что увидит человек.

   Что проверяется по каждому маршруту:
     1) страница не упала: ни одной ошибки JS;
     2) даты шапки совпадают с START маршрута (а не с чужим сохранённым планом);
     3) на странице нет текста ДРУГИХ маршрутов;
     4) есть блоки «Прибытие» и «Вылет домой», если в поездку летят.

   Запуск:
     npm i jsdom          — один раз
     node check-page.js               — все маршруты
     node check-page.js trip-milan.js — один

   Без jsdom проверка не падает, а честно говорит, что её пропустили.
   ========================================================================== */
const fs = require('fs'), path = require('path'), http = require('http'), vm = require('vm');

const DIR = __dirname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
/* сеть в браузере без окна недоступна — это не ошибка страницы, а условия прогона */
const KNOWN = [/fetch is not defined/i, /Not implemented/i, /leaflet/i];

function haveJsdom() { try { require.resolve('jsdom'); return true; } catch (e) { return false; } }

/* значения из файла маршрута — читаем в песочнице, как в check-static.js */
function readTrip(file) {
  const sand = { console: console };
  try {
    vm.runInNewContext(fs.readFileSync(path.join(DIR, file), 'utf8'), sand, { timeout: 5000 });
    return vm.runInNewContext('({start:typeof START!=="undefined"?START:"",'
      + ' name:typeof TRIP_NAME!=="undefined"?TRIP_NAME:"",'
      + ' hero:typeof HERO!=="undefined"?HERO:null,'
      + ' bases:typeof BASES!=="undefined"?BASES:[],'
      + ' segment:typeof SEGMENT!=="undefined"?SEGMENT:{}})', sand);
  } catch (e) { return null; }
}

const MON = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function startText(iso) {
  const p = String(iso || '').split('-');
  if (p.length !== 3) return '';
  return String(+p[2]) + '–';                       /* число старта: «7–16 августа» */
}
function startMonth(iso) {
  const p = String(iso || '').split('-');
  return p.length === 3 ? MON[+p[1] - 1] : '';
}

/* поднимаем страницу на своём порту и ждём, пока движок дорисует */
async function renderOne(file) {
  const { JSDOM, VirtualConsole } = require('jsdom');
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const f = path.join(DIR, u === '/' ? 'index.html' : u);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    if (path.basename(f) !== 'index.html') { res.end(fs.readFileSync(f)); return; }
    /* две подпорки, без которых страница не дорисуется НЕ по своей вине:
       document.write в jsdom не синхронен, а canvas там не умеет measureText
       (им меряется заголовок шапки, и без заглушки падает весь рендер) */
    let h = fs.readFileSync(f, 'utf8');
    h = h.replace(/<head[^>]*>/i, m => m + '<script>'
      + 'window.matchMedia=window.matchMedia||function(q){return {matches:false,media:q,'
      + 'addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){}};};'
      + 'HTMLCanvasElement.prototype.getContext=function(){var n=function(){};'
      + 'return {font:"",measureText:function(t){return {width:String(t||"").length*7};},'
      + 'fillText:n,clearRect:n,beginPath:n,moveTo:n,lineTo:n,stroke:n,fill:n,arc:n,save:n,restore:n,'
      + 'setTransform:n,scale:n,translate:n,drawImage:n,closePath:n,rect:n,fillRect:n,strokeRect:n,'
      + 'quadraticCurveTo:n,bezierCurveTo:n,createLinearGradient:function(){return {addColorStop:n};},'
      + 'getImageData:function(){return {data:[]};}};};</script>');
    /* ⚠️ ПОДКЛАДЫВАЕМ ЧУЖОЙ ПЛАН НАРОЧНО. Ровно из-за него всё и началось: у
       человека в браузере лежала сохранённая поездка, ссылка ?data=… открывала
       другой маршрут и не переключала поездку — и на новый маршрут ложились
       чужая дата старта и чужие ночи по номеру города. Если это когда-нибудь
       вернётся, проверка дат ниже поймает сразу. */
    const alien = JSON.stringify({ start: '2026-01-05', people: 4, acc: 'exact', nights: [9, 9, 9, 9] });
    const list = JSON.stringify({ active: 'tAlien', data: {},
      list: [{ id: 'tAlien', title: 'Другая поездка', created: 0, data: 'trip-alien.js' }] });
    h = h.replace(/<head[^>]*>/i, m => m + '<script>'
      + 'localStorage.setItem("co-trip-2026-plan",' + JSON.stringify(alien) + ');'
      + 'localStorage.setItem("co-trip-trips",' + JSON.stringify(list) + ');</script>');
    /* ⚠️ ловим ОБА вида: раньше путь был относительный, теперь абсолютный («/»+f).
       Сменили путь ради адресов по языкам (/en/), и старая точная строка перестала
       совпадать — проверка молча начала грузить файл дважды. */
    h = h.replace(/document\.write\('<scr'\+'ipt src="\/?'\+[^;]*?\);/g, '');
    h = h.replace('<script src="/day-math.js"></script>',
      '<script src="' + file + '"></script>\n<script src="day-math.js"></script>');
    res.end(h);
  });
  await new Promise(r => srv.listen(0, r));
  const port = srv.address().port;
  const vc = new VirtualConsole();
  const hard = [];
  vc.on('jsdomError', e => hard.push(String((e && e.message) || e)));
  const dom = await JSDOM.fromURL('http://127.0.0.1:' + port + '/index.html?data=' + file,
    { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  await new Promise(r => setTimeout(r, 2500));
  const own = Array.prototype.slice.call(w.__pageErr || []);
  w.document.querySelectorAll('script,#map').forEach(e => e.remove());
  const text = (w.document.body.textContent || '').replace(/\s+/g, ' ');
  const title = w.document.title || '';
  try { dom.window.close(); } catch (e) {}
  srv.close();
  return { text: text, title: title, errs: hard.concat(own).filter(m => !KNOWN.some(rx => rx.test(m))) };
}

async function run(say, only) {
  if (!haveJsdom()) {
    say('  пропущено: нет jsdom. Поставьте один раз — npm i jsdom — и проверка заработает');
    return 0;
  }
  const files = only ? [only]
    : fs.readdirSync(DIR).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f));
  const trips = {};
  fs.readdirSync(DIR).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f)).forEach(f => { trips[f] = readTrip(f); });
  let bad = 0;

  for (const f of files) {
    const t = trips[f];
    let r = null;
    try { r = await renderOne(f); } catch (e) { r = null; say('  ОШИБКА ' + f + ': страница не открылась — ' + e.message); bad++; continue; }

    r.errs.forEach(m => { bad++; say('  ОШИБКА ' + f + ': страница упала — ' + m); });

    /* даты шапки — из файла маршрута, а не из чужого сохранённого плана */
    if (t && t.start) {
      const d0 = startText(t.start), mo = startMonth(t.start);
      if (r.text.indexOf(d0) < 0 || r.text.indexOf(mo) < 0) {
        bad++;
        say('  ОШИБКА ' + f + ': в шапке не даты маршрута. Ждали начало ' + t.start
          + ' («' + d0 + ' … ' + mo + '»), а стоит «' + (r.text.match(/\d+–\d+ [а-яё]+ \d{4}/) || ['—'])[0] + '»');
      }
    }

    /* текст ЧУЖОГО маршрута на странице — то самое Колорадо под Парижем */
    Object.keys(trips).forEach(other => {
      if (other === f || !trips[other]) return;
      const o = trips[other], probes = [];
      if (o.hero) { if (o.hero.sub) probes.push(o.hero.sub); if (o.hero.capTitle) probes.push(o.hero.capTitle); }
      (o.bases || []).forEach(b => { if (b.desc) probes.push(b.desc); });
      probes.forEach(s => {
        const probe = String(s).slice(0, 45);
        if (probe.length >= 20 && r.text.indexOf(probe) >= 0) {
          bad++;
          say('  ОШИБКА ' + f + ': на странице текст из ' + other + ' — «' + probe + '…»');
        }
      });
    });

    /* прилетели — значит и улетаем: оба блока должны быть на месте */
    const flies = t && t.bases && t.bases.length && t.segment && t.segment[t.bases[0].id] === 'flight';
    if (flies && r.text.indexOf('Прибытие') < 0) { bad++; say('  ОШИБКА ' + f + ': нет блока «Прибытие», хотя в поездку летят'); }
    if (flies && r.text.indexOf('Вылет домой') < 0) { bad++; say('  ОШИБКА ' + f + ': нет блока «Вылет домой», хотя в поездку летят'); }

    say('  ' + f + ': страница открылась, вкладка «' + r.title + '»');
  }
  if (!bad) say('  все страницы чистые');
  return bad;
}

if (require.main === module) {
  const only = process.argv.slice(2).filter(a => a.charAt(0) !== '-')[0] || null;
  run(s => console.log(s), only).then(bad => process.exit(bad ? 1 : 0));
}
module.exports = { run: run, haveJsdom: haveJsdom };
