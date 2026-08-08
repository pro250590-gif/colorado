/* ==========================================================================
   ВОРОТА ВЫКЛАДКИ: ФАЙЛ ЛЕЖИТ НА ДИСКЕ, НО НА САЙТ НЕ ПОЕДЕТ

   Зачем. `deploy.sh` собирает список файлов через `git ls-files` — то есть
   везёт на сервер только то, что попало В ИСТОРИЮ. Файл, который есть на диске,
   но забыт в `git add`, скрипт не увидит вовсе и отчитается «Готово». На живом
   сайте это 404: страница грузит файл, которого там нет.

   ⚠️ МЫ УЖЕ ОБЖИГАЛИСЬ ДВАЖДЫ, И ОБА РАЗА ТИХО:
     · `trip-paris-en.js` лежал на диске, сайт отдавал 404 — английский текст
       Парижа просто не приезжал, а страница при этом работала;
     · `.gitignore` перечислял папки языков поимённо (`!en/`), и добавленный
       испанский не попал бы ни в историю, ни на сервер. Сборка бы прошла.
   В `build-langs.js` от этого осталась строчка «⚠️ Не забудьте добавить папки в
   .gitignore-исключения» — то есть защита, которая держится на чьей-то памяти.
   Это не защита (правило 22д, пункт 2). Вот проверка вместо неё.

   ⚠️ СПИСОК ВЫКЛАДКИ НЕ ПОМНИМ, А СПРАШИВАЕМ У `deploy.sh`. Второй список,
   записанный руками, разошёлся бы с первым в тот же день, когда кто-нибудь
   поправит один из них (то же правило, что в i18n-check.js: проверка не должна
   помнить то, что может спросить).

   Что проверяется:
     ① файл на диске подходит под список выкладки, но его нет в git → НЕ ПОЕДЕТ;
     ② файл в git есть, а на диске его нет → tar упадёт при выкладке;
     ③ страница грузит тегом <script src="/…">, а файл под список не подходит →
        на сайте будет 404, хотя в истории файл лежит;
     ④ у готового языка нет словаря `lang-<код>.js` или папки `<код>/index.html`
        в списке выкладки;
     ⑤ английский текст маршрута (`trip-<маршрут>-<язык>.js`) лежит на диске,
        но не поедет — ровно случай Парижа;
     ⑥ картинка, на которую ссылается страница или маршрут, не поедет.

   Запуск:  node check-ship.js
   Отдельно звать не обязательно: `bash deploy.sh` зовёт её сам и без неё
   не выкладывает.
   ========================================================================== */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const DIR = __dirname;

/* ── ① список выкладки — читаем из самого deploy.sh ────────────────────────
   Ищем строку `git ls-files | grep -E '…'`. Образец расширенных регулярок
   grep совпадает с записью JavaScript в той части, которой мы пользуемся. */
function shipRule() {
  const sh = fs.readFileSync(path.join(DIR, 'deploy.sh'), 'utf8');
  const m = sh.match(/git ls-files\s*\|\s*grep -E\s*'([^']+)'/);
  if (!m) {
    console.log('⛔ в deploy.sh не найден список файлов (git ls-files | grep -E \'…\').');
    console.log('   Проверка не должна догадываться, что поедет на сайт, — она спрашивает.');
    process.exit(1);
  }
  return new RegExp(m[1]);
}
const SHIP_RX = shipRule();

/* ── что лежит в истории ── */
const inGit = cp.execSync('git ls-files', { cwd: DIR, encoding: 'utf8' })
  .split('\n').map(s => s.trim()).filter(Boolean);
const gitSet = new Set(inGit);
const shipList = inGit.filter(f => SHIP_RX.test(f));
const shipSet = new Set(shipList);

/* ── что лежит на диске ──
   .git и node_modules не обходим: там сотни тысяч файлов и ни одного нашего. */
const onDisk = [];
(function walk(rel) {
  const abs = rel ? path.join(DIR, rel) : DIR;
  fs.readdirSync(abs, { withFileTypes: true }).forEach(e => {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) {
      if (e.name === '.git' || e.name === 'node_modules') return;
      walk(r);
    } else onDisk.push(r);
  });
})('');
const diskSet = new Set(onDisk);

const bad = [];
const say = s => console.log(s);

/* ⚠️ ПОДСКАЗКУ ДАЁМ ТОЧНУЮ, А НЕ «наверное, .gitignore». Файл может не попасть
   в историю по двум разным причинам: его просто забыли добавить — или его не
   пускает .gitignore, где всё запрещено, а нужное разрешено поимённо. Лечится
   это по-разному, поэтому спрашиваем у самого git. */
function ignored(f) {
  try { cp.execSync('git check-ignore -q ' + JSON.stringify(f), { cwd: DIR, stdio: 'ignore' }); return true; }
  catch (e) { return false; }
}
function addHint(f) {
  return ignored(f)
    ? 'его не пускает .gitignore — допишите туда строку «!' + f + '», потом git add ' + f
    : 'git add ' + f;
}

/* ── ① на диске есть, в истории нет ──────────────────────────────────────── */
onDisk.filter(f => SHIP_RX.test(f) && !gitSet.has(f)).forEach(f => {
  bad.push({
    f: f,
    why: 'лежит на диске, но его нет в git — на сайт НЕ ПОЕДЕТ, будет 404',
    fix: addHint(f)
  });
});

/* ── ② в истории есть, на диске нет ──────────────────────────────────────── */
shipList.filter(f => !diskSet.has(f)).forEach(f => {
  bad.push({
    f: f,
    why: 'числится в git, а на диске его нет — выкладка упадёт на упаковке',
    fix: 'верните файл или уберите его из истории: git rm --cached ' + f
  });
});

/* ── ③ страница грузит файл, который не поедет ────────────────────────────
   Тег <script src="/x.js"> — это обещание: файл должен быть на сервере. */
const PAGE = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const tags = [];
(PAGE.match(/<script\s+src="\/([A-Za-z0-9._-]+\.js)"/g) || []).forEach(t => {
  const f = t.replace(/.*src="\//, '').replace(/"$/, '');
  if (tags.indexOf(f) < 0) tags.push(f);
});
/* airports.js подключается из кода, а не тегом, но грузится так же */
if (/airports\.js/.test(PAGE) && tags.indexOf('airports.js') < 0) tags.push('airports.js');
tags.forEach(f => {
  if (shipSet.has(f)) return;
  bad.push({
    f: f,
    why: 'страница грузит этот файл, а в списке выкладки его нет — на сайте 404',
    fix: gitSet.has(f) ? 'допишите его в список файлов внутри deploy.sh'
                       : 'git add ' + f + ', и проверьте, подходит ли имя под список в deploy.sh'
  });
});

/* ── ④ у готового языка должен ехать и словарь, и папка ───────────────────
   Готовность языка спрашиваем у словарей — там же, где её берёт build-langs. */
let langs = [];
try {
  const I = require(path.join(DIR, 'i18n.js'));
  langs = Object.keys(I.DICT || {}).filter(l => l !== 'ru' && Object.keys(I.DICT[l]).length > 20);
} catch (e) { say('  внимание: не прочитан i18n.js (' + e.message + ') — языки не проверены'); }
langs.forEach(l => {
  [['lang-' + l + '.js', 'словарь языка'], [l + '/index.html', 'страница языка']].forEach(([f, what]) => {
    if (shipSet.has(f)) return;
    bad.push({
      f: f,
      why: what + ' «' + l + '» не поедет на сайт, а язык в переключателе есть',
      fix: fs.existsSync(path.join(DIR, f)) ? addHint(f) : 'node build-langs.js, потом ' + addHint(f)
    });
  });
});

/* ── ⑤ текст маршрута на чужом языке ──────────────────────────────────────
   Ровно случай Парижа: файл написан, лежит на диске, а сайт отдаёт 404 и
   страница молча остаётся русской. */
shipList.filter(f => /^trip-[a-z0-9-]+\.js$/.test(f) && !/-[a-z]{2}\.js$/.test(f)).forEach(t => {
  langs.forEach(l => {
    const f = t.replace(/\.js$/, '-' + l + '.js');
    if (!diskSet.has(f) || shipSet.has(f)) return;
    bad.push({
      f: f,
      why: 'текст маршрута на языке «' + l + '» написан, но не поедет — содержимое останется русским',
      fix: addHint(f)
    });
  });
});

/* ── ⑥ картинки ───────────────────────────────────────────────────────────
   Берём только пути с расширением: собранные в коде («img/p/»+id+«-l.webp»)
   регулярка не поймает, и это правильно — их имена знает только маршрут. */
const imgSrc = ['index.html'].concat(shipList.filter(f => /^trip-[a-z0-9-]+\.js$/.test(f)));
const imgs = new Set();
imgSrc.forEach(f => {
  const s = fs.readFileSync(path.join(DIR, f), 'utf8');
  (s.match(/img\/[A-Za-z0-9._/-]+\.(?:webp|jpg|jpeg|png|svg)/g) || []).forEach(x => imgs.add(x));
});
imgs.forEach(f => {
  if (shipSet.has(f)) return;
  bad.push({
    f: f,
    why: diskSet.has(f) ? 'картинка есть на диске, но не поедет на сайт'
                        : 'на эту картинку ссылаются, а её нет вовсе',
    fix: diskSet.has(f) ? 'git add ' + f : 'верните файл или уберите ссылку'
  });
});

/* ── отчёт ──────────────────────────────────────────────────────────────── */
say('ВОРОТА ВЫКЛАДКИ — что поедет на сайт, а что потеряется\n');
say('  поедет файлов:            ' + shipList.length);
say('  из них картинок:          ' + shipList.filter(f => /^img\//.test(f)).length);
say('  страница грузит тегом:    ' + tags.length);
say('  языков готово:            ' + (langs.length ? langs.join(', ') : 'ни одного'));
say('  текстов маршрутов:        ' + shipList.filter(f => /^trip-[a-z0-9-]+-[a-z]{2}\.js$/.test(f)).length);
say('');

if (!bad.length) {
  say('  ✓ всё, что нужно сайту, лежит в истории и поедет на сервер');
  say('');
  process.exit(0);
}
say('  ⛔ НЕ ПОЕДЕТ НА САЙТ: ' + bad.length);
say('');
bad.forEach(b => {
  say('   · ' + b.f);
  say('     ' + b.why);
  say('     чинится: ' + b.fix);
});
say('');
say('  Выкладка остановлена: «команда прошла» не значит «сайт работает».');
say('');
process.exit(1);
