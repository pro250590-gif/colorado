/* ==========================================================================
   ТАБЛИЦА ПЕРЕВОДА: ЧТО ПЕРЕВЕДЕНО, А ЧТО НЕТ

   Её требование 06.08.2026 вечером, дословно: «у тебя должна была быть таблица,
   чтоб ты не путался, по которой видно было бы, какой текст переведён, а какой
   нет… теперь я не понимаю, что ты сделал, а что нет».

   Справедливо. До этого я мерила остаток то по коду, то по памяти — и оба раза
   ошиблась. Теперь мера одна и она честная.

   ⚠️ КАК СЧИТАЕМ И ПОЧЕМУ ИМЕННО ТАК.
   Страница открывается ДВАЖДЫ: по-русски и по-английски. Обе отрисовки идут по
   одному и тому же коду, значит текст стоит в тех же местах — и пары «что было
   / что стало» получаются сами, без догадок.

   Почему не по коду: половина текста на экране склеена с числом («45 мин»,
   «вс, 20 сентября»), и в коде такой строки просто нет. Почему не переключением
   языка на лету: куски, собранные один раз, останутся русскими, и таблица
   соврёт — покажет работу там, где на живом сайте всё в порядке.

   ⚠️ ЧЕТЫРЕ СОСТОЯНИЯ, А НЕ ДВА. «Не переведено» — это не всегда работа:
     · ИНТЕРФЕЙС     — наш текст, его переводим. Это и есть работа.
     · МАРШРУТ       — содержимое поездки (описания дней и мест). Остаётся
                       русским НАМЕРЕННО: его надо писать заново, а не
                       переводить (правило 21б).
     · НЕ НАДО       — цифры, названия мест, латиница. Переводу не подлежит.
     · РАМКА НАША, ТЕКСТ МАРШРУТА — предложение переведено, а внутрь подставлен
                       русский текст автора маршрута. Чинится переписыванием
                       маршрута, а не словарём.
   Откуда строка, определяем поиском по файлам: нашлась в index.html — наша,
   нашлась в trip-*.js — маршрута.

   Запуск:  node i18n-table.js            — все маршруты, собрать perevod.html
            node i18n-table.js trip-milan.js   — один маршрут
            node i18n-table.js --lang de  — та же таблица для другого языка
   ========================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const DIR = __dirname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };

const args = process.argv.slice(2);
/* принимаем обе записи: --lang=es и --lang es (вторую я сама набрала первой) */
const LANG = (function () {
  const i = args.findIndex(a => /^--lang/.test(a));
  if (i < 0) return 'en';
  const a = args[i];
  if (a.indexOf('=') > 0) return a.split('=')[1] || 'en';
  return args[i + 1] && !/^--/.test(args[i + 1]) ? args[i + 1] : 'en';
})();
const only = args.filter(a => /^trip-.*\.js$/.test(a));
const TRIPS = only.length ? only
  : fs.readdirSync(DIR).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f) && f !== 'trip-TEMPLATE.js'
      /* файлы перевода содержимого — не маршруты, их не рисуем */
      && !/-(?:en|es|de|fr|it)\.js$/.test(f)).sort();

const cyr = s => /[А-Яа-яЁё]/.test(s);

/* ── откуда взялась строка: наш интерфейс или содержимое маршрута ──
   Ищем ПО КУСКУ: на экране строка часто склеена с числом или именем города,
   целиком её в файле нет. Берём самый длинный кусок из букв — по нему и видно,
   кто её написал. */
const SRC = {};
function srcText(f) {
  if (SRC[f]) return SRC[f];
  let s = fs.readFileSync(path.join(DIR, f), 'utf8');
  /* ⚠️ КОММЕНТАРИИ ВЫРЕЗАЕМ, ИНАЧЕ РАСКЛАДКА ВРЁТ. В index.html записок больше,
     чем текста, и слово «вокзал» из моего же пояснения делало содержимое
     маршрута «нашим интерфейсом». Поймано первым же прогоном таблицы. */
  s = s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1 ');
  return (SRC[f] = s);
}
function originOf(s, tripFile) {
  const chunk = (s.match(/[А-Яа-яЁё][А-Яа-яЁё\s,«»—-]{5,}/g) || []).sort((a, b) => b.length - a.length)[0];
  const probe = (chunk || s).trim().slice(0, 60);
  if (!probe) return 'НЕ НАДО';
  /* ⚠️ СНАЧАЛА СМОТРИМ В МАРШРУТ, ПОТОМ В ДВИЖОК. Короткие слова («музей»,
     «вид», «порт») есть и там и там, но если слово лежит в данных поездки —
     значит его написал автор маршрута, и это содержимое. */
  if (srcText(tripFile).indexOf(probe) >= 0) return 'МАРШРУТ';
  if (srcText('index.html').indexOf(probe) >= 0) return 'ИНТЕРФЕЙС';
  /* нигде не нашлась — почти всегда склейка нашего кода с данными маршрута */
  return 'ИНТЕРФЕЙС';
}

/* ── одна отрисовка страницы ──
   Подпорки те же, что у остальных прогонов: jsdom не умеет document.write и
   canvas, а язык ставится меткой перед </head> — как это делает build-langs. */
function render(trip, lang) {
  return new Promise(async (resolve) => {
    const { JSDOM, VirtualConsole } = require(path.join(DIR, 'node_modules', 'jsdom'));
    const srv = http.createServer((q, res) => {
      const u = decodeURIComponent(q.url.split('?')[0]);
      const f = path.join(DIR, u === '/' ? 'index.html' : u);
      if (!fs.existsSync(f)) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      if (path.basename(f) !== 'index.html') { res.end(fs.readFileSync(f)); return; }
      let h = fs.readFileSync(f, 'utf8');
      h = h.replace(/<head[^>]*>/i, m => m + '<script>window.matchMedia=window.matchMedia||function(q){return{matches:false,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){}};};'
        + 'HTMLCanvasElement.prototype.getContext=function(){var n=function(){};return{font:"",measureText:function(t){return{width:String(t||"").length*7};},fillText:n,clearRect:n,beginPath:n,moveTo:n,lineTo:n,stroke:n,fill:n,arc:n,save:n,restore:n,setTransform:n,scale:n,translate:n,drawImage:n,closePath:n,rect:n,fillRect:n,strokeRect:n,quadraticCurveTo:n,bezierCurveTo:n,createLinearGradient:function(){return{addColorStop:n};},getImageData:function(){return{data:[]};}};};</script>');
      /* ⚠️ метка языка — ПОСЛЕ <meta charset>, иначе русский станет «Ð¡Ñ‚Ð°Ñ€Ñ‚» */
      if (lang !== 'ru') h = h.replace(/<\/head>/i, '<script>window.__lang="' + lang + '";</script></head>');
      h = h.replace(/document\.write\('<scr'\+'ipt src="\/?'\+[^;]*?\);/g, '');
      /* jsdom НЕ УМЕЕТ document.write, поэтому прогон подставляет файлы тегами.
         Текст маршрута грузится тем же document.write — значит и его надо
         подставить, иначе таблица покажет маршрут непереведённым, хотя в
         браузере он английский. */
      const tf = trip.replace(/\.js$/, '-' + lang + '.js');
      const tTag = (lang !== 'ru' && fs.existsSync(path.join(DIR, tf)))
        ? ('<script src="' + tf + '"></script>\n') : '';
      /* ⚠️ САМ СЛОВАРЬ ЯЗЫКА ТОЖЕ ПРИЕЗЖАЕТ ЧЕРЕЗ document.write (шаг 2 плана,
         08.08.2026): переводы больше не лежат в i18n.js. Не подставить его
         тегом — и прогон покажет английскую страницу русской, то есть соврёт
         ровно там, где мы этой таблице верим. Тег стоит ПОСЛЕ i18n.js. */
      const lf = 'lang-' + lang + '.js';
      /* английский — второе звено цепочки «язык → английский → русский»,
         поэтому на третьем языке он едет вместе с ним, как и в браузере */
      const lTag = (lang !== 'ru' && fs.existsSync(path.join(DIR, lf)))
        ? ((lang !== 'en' ? '<script src="lang-en.js"></script>\n' : '')
          + '<script src="' + lf + '"></script>\n') : '';
      h = h.replace('<script src="/day-math.js"></script>',
        lTag + '<script src="' + trip + '"></script>\n' + tTag + '<script src="day-math.js"></script>');
      res.end(h);
    });
    await new Promise(r => srv.listen(0, r));
    const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
    const dom = await JSDOM.fromURL('http://127.0.0.1:' + srv.address().port + '/index.html?data=' + trip,
      { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc });
    const w = dom.window, D = w.document;
    await new Promise(r => setTimeout(r, 2800));
    /* ⚠️ ТЕКСТ МАРШРУТА НА ЧУЖОМ ЯЗЫКЕ ПРИЕЗЖАЕТ ОТДЕЛЬНЫМ ФАЙЛОМ И ПОЗЖЕ.
       Без этой паузы таблица успевала снять страницу ДО него и показывала
       Париж как непереведённый, хотя на экране он был английским. */
    /* ждать нечего: текст маршрута приезжает вместе со страницей */
    const out = [];
    const walk = D.createTreeWalker(D.body, w.NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentNode;
        if (!p || !p.tagName) return w.NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'INPUT') return w.NodeFilter.FILTER_REJECT;
        if (p.closest('[data-noT]')) return w.NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim().length > 1
          ? w.NodeFilter.FILTER_ACCEPT : w.NodeFilter.FILTER_REJECT;
      }
    });
    let n; while ((n = walk.nextNode())) out.push({ txt: n.nodeValue.trim(), where: sectionOf(n), path: pathOf(n) });
    /* подсказки в пустых полях — тоже текст, но живут в атрибуте */
    D.querySelectorAll('[placeholder]').forEach(el => {
      if (el.closest('[data-noT]')) return;
      const v = (el.getAttribute('placeholder') || '').trim();
      if (v.length > 1) out.push({ txt: v, where: 'поле ввода', path: pathOf(el) + '@ph' });
    });

    /* ⚠️ ПАРЫ СВЕРЯЕМ ПО МЕСТУ В РАЗМЕТКЕ, А НЕ ПО ПОРЯДКУ.
       Сначала я складывала куски в список и сверяла первый с первым. На Исландии
       и Юте английская страница дала на 14 кусков меньше (где-то подпись пустая),
       весь список сдвинулся — и таблица показала «Океан» переведённым как
       «Прилёт, Голубая лагуна и Рейкьявик». Вранья в таблице быть не должно:
       теперь у каждого куска свой адрес в дереве, и пары не разъезжаются. */
    function pathOf(node) {
      const parts = [];
      let el = node;
      while (el && el !== D.body) {
        const p = el.parentNode; if (!p) break;
        const kids = Array.prototype.slice.call(p.childNodes);
        parts.push((el.tagName || '#t') + kids.indexOf(el));
        el = p;
      }
      return parts.reverse().join('/');
    }
    try { w.close(); } catch (e) {}
    srv.close();
    resolve(out);

    /* в каком разделе страницы стоит текст — чтобы в таблице был порядок */
    function sectionOf(node) {
      let el = node.parentNode;
      while (el && el !== D.body) {
        if (el.id && /^s-/.test(el.id)) return SECT[el.id] || el.id;
        el = el.parentNode;
      }
      return 'шапка и прочее';
    }
  });
}
const SECT = {
  's-days': 'маршрут по дням', 's-food': 'где поесть', 's-money': 'бюджет',
  's-map': 'карта', 's-start': 'начало поездки', 's-hero': 'шапка'
};

(async () => {
  const rows = [];      /* {ru, en, where, trip, origin} */
  for (const trip of TRIPS) {
    /* ⚠️ ОДИНАКОВЫЕ СТРОКИ ГЛУШИМ В ПРЕДЕЛАХ ОДНОГО МАРШРУТА, А НЕ ВСЕХ.
       Сначала список был общий — и маршрут, который считался пятым, терял
       треть своих строк: их уже видели в предыдущих. Париж показывал «6 из 65»
       вместо «94 из 95». Числа по маршрутам должны быть честными каждое. */
    const seen = new Set();
    const ru = await render(trip, 'ru');
    const en = await render(trip, LANG);
    const byPath = new Map();
    en.forEach(x => { if (!byPath.has(x.path)) byPath.set(x.path, x.txt); });
    let lost = 0;
    ru.forEach(r => {
      const a = r.txt;
      if (!cyr(a)) return;                   /* цифры, латиница, названия — не наша работа */
      if (!byPath.has(r.path)) { lost++; return; }   /* этого куска на английской странице нет */
      const b = byPath.get(r.path);
      const key = a + '||' + b;
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({ ru: a, en: b, where: r.where, trip: trip, origin: originOf(a, trip) });
    });
    if (lost) console.log('  · ' + trip + ': ' + lost
      + ' кусков есть по-русски, но нет на английской странице — в таблицу не берём');
  }

  /* статус: переведено — если стало не по-русски и текст правда изменился */
  /* ⚠️ ЧЕТВЁРТОЕ СОСТОЯНИЕ, КОТОРОЕ ПРИШЛОСЬ ЗАВЕСТИ: РАМКА НАША, ТЕКСТ ЧУЖОЙ.
     «Дорога домой: Kyoto → KIX airport (≈100 км · экспресс Haruka, 1 ч 20 мин)» —
     предложение наше и переведено, а внутрь подставлено то, что автор маршрута
     написал по-русски. Считать это недоделкой интерфейса нельзя: она гнала бы
     меня чинить то, что чинится только переписыванием маршрута (правило 21б). */
  rows.forEach(r => {
    const changed = r.ru !== r.en;
    r.done = changed && !cyr(r.en);
    r.mixed = changed && cyr(r.en);
    if (r.done) r.status = 'переведено';
    else if (r.mixed) r.status = 'наша рамка, текст маршрута';
    else if (r.origin === 'МАРШРУТ') r.status = 'содержимое маршрута';
    else r.status = 'НЕ ПЕРЕВЕДЕНО';
  });

  /* интерфейс один на все маршруты — его строки считаем ОДИН раз, иначе
     «Показать на карте» посчиталось бы восемь раз и число раздулось бы */
  const ifSeen = new Set();
  const iface = rows.filter(r => {
    if (r.origin !== 'ИНТЕРФЕЙС' || r.mixed) return false;
    const k = r.ru + '||' + r.en;
    if (ifSeen.has(k)) return false;
    ifSeen.add(k); return true;
  });
  const mixed = rows.filter(r => r.mixed);
  const done = iface.filter(r => r.done).length;
  const left = iface.filter(r => !r.done);
  const content = rows.filter(r => r.origin === 'МАРШРУТ' && !r.mixed);

  console.log('\nТАБЛИЦА ПЕРЕВОДА (' + LANG + ')\n');
  console.log('  ИНТЕРФЕЙС (наша работа):  переведено ' + done + ' из ' + iface.length
    + '   осталось ' + left.length);
  console.log('  РАМКА НАША, ТЕКСТ ИЗ МАРШРУТА: ' + mixed.length
    + ' — предложение переведено, внутри русский текст автора');
  /* ⚠️ Содержимое тоже делится на сделанное и несделанное. Пока английского
     содержимого не было вовсе, счётчик показывал одно число — и после первого
     же переведённого маршрута начал бы врать. */
  const cDone = content.filter(r => r.done).length;
  console.log('  СОДЕРЖИМОЕ МАРШРУТОВ:     написано заново ' + cDone + ' из ' + content.length
    + (cDone < content.length ? ('   осталось ' + (content.length - cDone)) : '   всё'));
  {
    const byTrip = {};
    content.forEach(r => {
      const t = byTrip[r.trip] || (byTrip[r.trip] = { d: 0, n: 0 });
      t.n++; if (r.done) t.d++;
    });
    Object.keys(byTrip).sort().forEach(t => console.log('      ' + t.padEnd(24)
      + String(byTrip[t].d).padStart(4) + ' из ' + String(byTrip[t].n).padStart(4)));
  }
  if (left.length) {
    console.log('\n  ЧТО ОСТАЛОСЬ В ИНТЕРФЕЙСЕ:');
    left.slice(0, 40).forEach(r => console.log('    [' + r.where + '] ' + r.ru.slice(0, 70)
      + '\n         сейчас: ' + r.en.slice(0, 70)));
    if (left.length > 40) console.log('    …и ещё ' + (left.length - 40) + ' — все в таблице');
  }

  /* --content — список того, что осталось в содержимом маршрутов: по нему
     пишется файл trip-<маршрут>-<язык>.js. Ключом должен быть текст ТАК, КАК ОН
     СТОИТ НА СТРАНИЦЕ: разметка <b> разбивает строку на отдельные куски, и
     ключ из файла данных до них не достаёт. */
  if (args.includes('--content')) {
    const rest = content.filter(r => !r.done);
    console.log('');
    console.log('  ЧТО ОСТАЛОСЬ В СОДЕРЖИМОМ (' + rest.length + '):');
    rest.forEach(r => console.log('    ' + JSON.stringify(r.ru)));
  }

  writeHTML(rows, iface, done, left, content);
  writeLeft(rows);
  console.log('\n  Таблица: perevod.html — открывается в браузере');
})();

/* ── сама таблица ──
   Делаю страницей, а не файлом для Excel: русский текст в CSV Excel открывает
   кракозябрами, и она это увидит первой. Страница открывается двойным щелчком
   и одинаково выглядит везде. */
function writeHTML(rows, iface, done, left, content) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cls = r => r.status === 'переведено' ? 'ok'
    : (r.status === 'НЕ ПЕРЕВЕДЕНО' ? 'no' : (r.status === 'наша рамка, текст маршрута' ? 'half' : 'skip'));
  const tr = r => '<tr class="' + cls(r) + '" data-st="' + cls(r) + '">'
    + '<td class="w">' + esc(r.where) + '</td>'
    + '<td class="ru">' + esc(r.ru) + '</td>'
    + '<td class="en">' + esc(r.en) + '</td>'
    + '<td class="st">' + esc(r.status) + '</td></tr>';
  const pct = iface.length ? Math.round(done / iface.length * 100) : 0;
  const html = '<!doctype html><html lang="ru"><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Перевод сайта — что готово</title>'
    + '<style>'
    + 'body{font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;margin:0;padding:24px;background:#f6f7f9;color:#111}'
    + 'h1{font-size:22px;margin:0 0 4px}.sub{color:#666;margin:0 0 20px}'
    + '.cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}'
    + '.card{background:#fff;border-radius:14px;padding:14px 18px;box-shadow:0 1px 3px rgba(0,0,0,.08);min-width:150px}'
    + '.card b{display:block;font-size:26px;line-height:1.1}.card span{color:#666;font-size:13px}'
    + '.bar{height:10px;border-radius:6px;background:#e5e7eb;overflow:hidden;margin:8px 0 20px;max-width:640px}'
    + '.bar i{display:block;height:100%;background:#16a34a}'
    + '.filters{margin-bottom:12px}.filters button{font:inherit;border:1px solid #d1d5db;background:#fff;'
    + 'border-radius:999px;padding:6px 14px;margin-right:6px;cursor:pointer}.filters button.on{background:#111;color:#fff;border-color:#111}'
    + 'table{border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}'
    + 'th,td{padding:8px 12px;text-align:left;vertical-align:top;border-bottom:1px solid #eee;font-size:14px}'
    + 'th{background:#fafafa;position:sticky;top:0;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#666}'
    + 'td.w{color:#888;white-space:nowrap;font-size:12px}td.st{white-space:nowrap;font-size:12px}'
    + 'tr.ok td.st{color:#16a34a}tr.no td.st{color:#dc2626;font-weight:600}tr.skip td.st{color:#9ca3af}'
    + 'tr.half td.st{color:#b45309}tr.half{background:#fffbeb}'
    + 'tr.no{background:#fff5f5}'
    + '</style>'
    + '<h1>Перевод сайта — что готово, а что нет</h1>'
    + '<p class="sub">Собрано прогоном: страница открывается по-русски и по-английски, и пары сверяются сами. '
    + 'Пересобрать — <code>node i18n-table.js</code></p>'
    + '<div class="cards">'
    + '<div class="card"><b>' + pct + '%</b><span>интерфейс переведён</span></div>'
    + '<div class="card"><b>' + done + '</b><span>кусков готово</span></div>'
    + '<div class="card"><b>' + left.length + '</b><span>осталось в интерфейсе</span></div>'
    + '<div class="card"><b>' + content.length + '</b><span>содержимое маршрутов<br>(писать заново)</span></div>'
    + '</div>'
    + '<div class="bar"><i style="width:' + pct + '%"></i></div>'
    + '<div class="filters">'
    + '<button data-f="all" class="on">Всё</button>'
    + '<button data-f="no">Что осталось</button>'
    + '<button data-f="ok">Переведено</button>'
    + '<button data-f="half">Рамка наша, текст маршрута</button>'
    + '<button data-f="skip">Содержимое маршрутов</button></div>'
    + '<table><thead><tr><th>раздел</th><th>по-русски</th><th>по-английски</th><th>статус</th></tr></thead><tbody>'
    + rows.slice().sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1)).map(tr).join('')
    + '</tbody></table>'
    + '<script>document.querySelectorAll(".filters button").forEach(function(b){b.onclick=function(){'
    + 'document.querySelectorAll(".filters button").forEach(function(x){x.classList.remove("on")});b.classList.add("on");'
    + 'var f=b.dataset.f;document.querySelectorAll("tbody tr").forEach(function(r){'
    + 'r.style.display=(f==="all"||r.dataset.st===f)?"":"none";});};});</script>'
    + '</html>';
  fs.writeFileSync(path.join(DIR, 'perevod.html'), html, 'utf8');
}

/* ── ОТДЕЛЬНЫЙ ФАЙЛ «ЧТО ОСТАЛОСЬ ПО-РУССКИ» ──
   Её просьба 07.08: «мне то, что осталось на русском, чтоб я не гадала».
   В общей таблице это надо искать фильтром, а тут сразу список и только он:
   по маршрутам, с разделами, и видно, сколько чего. */
function writeLeft(rows) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rest = rows.filter(r => !r.done);
  const byTrip = {};
  rest.forEach(r => {
    /* ⚠️ Смешанные строки в отдельную кучу: рамка наша и переведена, а внутрь
       подставлено то, что автор маршрута написал по-русски («ночной поезд»,
       «Фонтенбло»). Их нельзя показывать как «движок не переведён» — чинятся
       они переписыванием маршрута. */
    const t = r.mixed ? 'наша фраза, но внутри текст маршрута'
                      : (r.origin === 'ИНТЕРФЕЙС' ? 'движок сайта' : r.trip);
    (byTrip[t] = byTrip[t] || []).push(r);
  });
  const order = Object.keys(byTrip).sort((a, b) => byTrip[b].length - byTrip[a].length);
  let body = '';
  order.forEach(t => {
    const list = byTrip[t];
    const bySect = {};
    list.forEach(r => (bySect[r.where] = bySect[r.where] || []).push(r));
    body += '<section><h2>' + esc(t) + ' <i>' + list.length + '</i></h2>';
    Object.keys(bySect).sort().forEach(w => {
      body += '<h3>' + esc(w) + '</h3><ul>'
        + bySect[w].map(r => '<li>' + esc(r.ru) + '</li>').join('') + '</ul>';
    });
    body += '</section>';
  });
  const html = '<!doctype html><html lang="ru"><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Что осталось по-русски</title><style>'
    + 'body{font:16px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;margin:0;padding:24px;background:#f6f7f9;color:#111}'
    + 'h1{font-size:22px;margin:0 0 6px}.sub{color:#666;margin:0 0 22px}'
    + 'section{background:#fff;border-radius:14px;padding:16px 20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)}'
    + 'h2{font-size:18px;margin:0 0 10px}h2 i{font-style:normal;color:#dc2626;font-size:14px;font-weight:600}'
    + 'h3{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#888;margin:14px 0 6px}'
    + 'ul{margin:0;padding-left:20px}li{margin:3px 0}'
    + '</style><h1>Что на сайте осталось по-русски</h1>'
    + '<p class="sub">Всего ' + rest.length + '. Собрано прогоном: страница открывается по-русски и по-английски, '
    + 'и сверяется построчно. Пересобрать — <code>node i18n-table.js</code></p>' + body + '</html>';
  fs.writeFileSync(path.join(DIR, 'ostalos.html'), html, 'utf8');
}
