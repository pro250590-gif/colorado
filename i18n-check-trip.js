/* ==========================================================================
   ПОЛНОТА ТЕКСТА МАРШРУТА — ПО КОДУ, А НЕ ПО ЭКРАНУ

   Её слова 07.08.2026: «я посмотрела Колорадо и нашла там русский текст. Значит
   ты до сих пор плохо вытаскиваешь весь текст».

   ⚠️ ПРИЧИНА ТА ЖЕ, ЧТО БЫЛА У ИНТЕРФЕЙСА. Я мерила прогоном страницы: открыла,
   посмотрела, чего не хватает. Но страница показывает не всё: часть текста
   маршрута живёт в окнах, попапах карты, вкладках еды и вариантах дня. Значит
   мерить надо ФАЙЛ, а не экран.

   Что делает эта проверка: берёт КАЖДУЮ русскую строку в trip-<маршрут>.js и
   смотрит, попала ли она в выгрузку (i18n-extract.js) — то есть знает ли о
   таком поле механизм перевода вообще. Не попала — значит поле мы не видим, и
   никакой перевод его не догонит. Это ошибка механизма, а не забывчивость.

   Отдельно проверяет: то, что в выгрузку попало, действительно переведено в
   trip-<маршрут>-<язык>.js.

   Запуск:  node i18n-check-trip.js                 — все маршруты
            node i18n-check-trip.js trip-milan.js   — один
   ========================================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const DIR = __dirname;
const LANG = 'en';

const only = process.argv.slice(2).filter(a => /^trip-.*\.js$/.test(a));
const TRIPS = only.length ? only
  : fs.readdirSync(DIR).filter(f => /^trip-[a-z0-9-]+\.js$/.test(f)
      && f !== 'trip-TEMPLATE.js' && !/-(?:en|es|de|fr|it)\.js$/.test(f)).sort();

const cyr = s => typeof s === 'string' && /[А-Яа-яЁё]/.test(s);

/* поля без языка: названия, поисковые строки, коды (правило 10) */
const KEEP = ['q', 'nm', 'air', 'pid', 'id', 'base', 'cat', 'emoji', 'color', 'file', 'data', 'city'];
const KEEP_RX = new RegExp('(?:^|[,{\\s])(' + KEEP.join('|') + ')\\s*:\\s*$');

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"\\])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));
}

/* все русские строки, которые лежат в файле маршрута */
function stringsOf(file) {
  const src = stripComments(fs.readFileSync(path.join(DIR, file), 'utf8'));
  const out = [];
  const rx = /'([^'\n\\]*(?:\\.[^'\n\\]*)*)'/g;
  let m;
  while ((m = rx.exec(src))) {
    const val = m[1];
    if (!cyr(val) || val.trim().length < 2) continue;
    const before = src.slice(Math.max(0, m.index - 40), m.index);
    if (KEEP_RX.test(before)) continue;
    /* в коде апостроф экранирован, а в выгрузке он обычный — иначе строка
       «метро Sant'Ambrogio» вечно числилась бы невидимой */
    const clean = val.split(String.fromCharCode(92) + String.fromCharCode(39))
      .join(String.fromCharCode(39));
    out.push({ text: clean, line: src.slice(0, m.index).split(String.fromCharCode(10)).length });
  }
  return out;
}

/* что из этого видит выгрузка — то есть механизм перевода */
function seenByExtract(file) {
  const raw = cp.execFileSync('node', [path.join(DIR, 'i18n-extract.js'), file],
    { cwd: DIR, encoding: 'utf8', maxBuffer: 40 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  const set = new Set();
  (function walk(o) {
    if (o == null) return;
    if (typeof o === 'string') { if (cyr(o)) set.add(o); return; }
    if (typeof o === 'object') Object.keys(o).forEach(k => walk(o[k]));
  })(JSON.parse(raw));
  return set;
}

/* и что уже написано по-английски */
function translated(file) {
  const tf = path.join(DIR, file.replace(/\.js$/, '-' + LANG + '.js'));
  if (!fs.existsSync(tf)) return null;
  const box = { window: {} };
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(tf, 'utf8'), box);
  return box.window.__tripText || null;
}

let total = 0, blind = 0;
TRIPS.forEach(file => {
  const all = stringsOf(file);
  const seen = seenByExtract(file);
  const miss = all.filter(x => !seen.has(x.text));
  const t = translated(file);
  total += all.length;
  /* ── и вторая половина: то, что механизм ВИДИТ, должно быть написано ──
     Идём по скелету выгрузки и смотрим, есть ли на том же месте английский
     текст. Пусто — значит поле знаем, а написать забыли. */
  const gaps = [];
  if (t) {
    (function walk(ru, en, p) {
      if (ru == null) return;
      if (typeof ru === 'string') {
        if (cyr(ru) && !(typeof en === 'string' && en.trim())) gaps.push(p + ': ' + ru.slice(0, 80));
        return;
      }
      if (typeof ru === 'object') Object.keys(ru).forEach(k => walk(ru[k], en ? en[k] : undefined, p ? p + '.' + k : k));
    })(JSON.parse(cp.execFileSync('node', [path.join(DIR, 'i18n-extract.js'), file],
      { cwd: DIR, encoding: 'utf8', maxBuffer: 40 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })), t, '');
  }
  blind += miss.length + gaps.length;
  const mark = (miss.length || gaps.length) ? '⛔' : '✓ ';
  console.log(mark + ' ' + file.padEnd(22) + ' строк ' + String(all.length).padStart(4)
    + '   механизм не видит: ' + String(miss.length).padStart(3)
    + (t ? ('   не написано: ' + String(gaps.length).padStart(3)) : '   английского файла НЕТ'));
  gaps.slice(0, 30).forEach(g => console.log('      · ' + g));
  if (gaps.length > 30) console.log('      · …и ещё ' + (gaps.length - 30));
  /* одинаковые строки показываем один раз — списку это не мешает, а читать легче */
  const uniq = [];
  const was = new Set();
  miss.forEach(x => { if (!was.has(x.text)) { was.add(x.text); uniq.push(x); } });
  uniq.slice(0, 40).forEach(x => console.log('      ' + String(x.line).padStart(5) + '  ' + x.text.slice(0, 110)));
  if (uniq.length > 40) console.log('      …и ещё ' + (uniq.length - 40));
});

console.log('\nВСЕГО русских строк в маршрутах: ' + total + ',  механизм не видит: ' + blind);
process.exit(blind ? 1 : 0);
