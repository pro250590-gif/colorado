/* ==========================================================================
   ПРОВЕРКА ПОЛНОТЫ ПЕРЕВОДА — ПО КОДУ, А НЕ ПО ЭКРАНУ

   Её слова 07.08.2026: «опять часть текста не переведена. Я не буду тебе его
   показывать, потому что просто будешь переписывать, а не чинить. У тебя не
   получается вытащить весь текст и перевести. Ищи и решай проблему».

   ⚠️ В ЧЁМ БЫЛА ПРИЧИНА. Я мерила перевод ПРОГОНОМ СТРАНИЦЫ: открывала её и
   смотрела, что осталось русским. Но страница показывает не всё сразу — окна,
   ошибки, подсказки, ветки «рейс вписан / не вписан», «машина есть / нет»,
   гостевой режим. Каждый раз находилось новое, потому что прогон физически
   не мог открыть все состояния. Мера была неполной по своей природе.

   ⚠️ ЧТО ДЕЛАЕТ ЭТА ПРОВЕРКА. Смотрит не на экран, а на КОД. Любой текст,
   который человек когда-нибудь увидит, лежит в index.html строкой. Значит
   полный список даёт файл, а не отрисовка. Для каждой русской строки проверка
   отвечает на один вопрос: ЕСТЬ ЛИ У НЕЁ ВООБЩЕ ПУТЬ К ПЕРЕВОДУ.

   Путей ровно три:
     ① строка целиком лежит ключом в DICT — её заменит applyDomT;
     ② строка стоит в cx('…') и лежит ключом в CODE — это куски с числами;
     ③ строка склеена с разметкой, но все её куски есть в DICT — их берёт trLine.
   Нет ни одного пути — это ошибка, и она печатается с номером строки.

   Что НЕ считается ошибкой: названия мест и поисковые строки (правило 10),
   наши комментарии, служебные ключи и то, что человек не видит.

   Запуск:  node i18n-check.js          — сводка и список
            node i18n-check.js --lang de
   ========================================================================== */
const fs = require('fs'), path = require('path');
const DIR = __dirname;
const LANG = (function () {
  const a = process.argv.find(x => /^--lang/.test(x));
  if (!a) return 'en';
  if (a.indexOf('=') > 0) return a.split('=')[1];
  const i = process.argv.indexOf(a);
  return process.argv[i + 1] || 'en';
})();

const I18N = require('./i18n.js');
const DICT = (I18N.DICT && I18N.DICT[LANG]) || {};
const CODE = (I18N.CODE && I18N.CODE[LANG]) || {};

const cyr = s => /[А-Яа-яЁё]/.test(s);

/* ⚠️ ПОЛЯ, КОТОРЫЕ НЕ ПЕРЕВОДЯТСЯ — И ПОЧЕМУ ЗДЕСЬ БОЛЬШЕ НЕТ `nm`.
   Я записала «nm — это название места, его не трогаем» и проверка честно
   молчала. А в каталоге готовых маршрутов в том же поле лежит НАЗВАНИЕ КАРТОЧКИ:
   «Колорадо, США», «Юта, каньоны». Клиент нашла их на главной, а проверка их не
   видела — потому что я сама запретила ей туда смотреть.
   Урок: не «поле называется nm — значит имя». Правило должно быть узким:
   молчим только там, где строка ТОЧНО оригинальное название (правило 10),
   и такие случаи перечислены поимённо ниже. */
const KEEP = ['q', 'air', 'pid', 'id', 'base', 'cat', 'emoji', 'color', 'file', 'data', 'src', 'k'];
const KEEP_RX = new RegExp('(?:^|[,{\\s])(' + KEEP.join('|') + ')\\s*:\\s*$');

/* служебное: не текст для человека, а имена и метки внутри кода */
/* ⚠️ ПРАВИЛО «НАЧИНАЕТСЯ С ТОЧКИ — ЗНАЧИТ СЕЛЕКТОР» СЪЕДАЛО ЖИВОЙ ТЕКСТ.
   Под него попадали «. Суммы не пересчитаны — проверь их.», «. Город, даты и
   гостей подставим сами.», «. Файл сохранился в загрузки…» — целые фразы,
   приклеенные к значению и начинающиеся с точки. Шесть находок совета
   спрятались именно здесь. Теперь селектор — это селектор: точка, а дальше
   только буквы латиницей, дефисы и цифры, и никакой кириллицы. */
const TECH = [
  /^t-/, /^[a-z]+_[a-z]+$/,          /* ключи вида t-must, car_all */
  /^[#.][A-Za-z][\w-]*$/,            /* .cls, #id — но не «. Суммы не …» */
  /^\/[A-Za-z0-9_\-./]*$/,           /* путь к файлу */
  /^[А-Яа-яЁё]$/                     /* одна буква — не фраза */
];

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"\\])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));
}

/* ⚠️ СТРОКА В КОДЕ — ЭТО НЕ ТО, ЧТО УВИДИТ ЧЕЛОВЕК. Она почти всегда обрывок:
   начинается серединой тега ('">Уже есть жильё</button>'), несёт подписи в
   атрибутах и склеена с соседями через « · ». Разбираем ровно так, как потом
   разберёт браузер, иначе проверка ругается на здоровое. */
function parts(s) {
  var t = String(s), attrs = [];
  var RX = /(?:title|aria-label|placeholder|alt)\s*=\s*"([^"]*)"/g, m;
  while ((m = RX.exec(t))) { if (cyr(m[1])) attrs.push(m[1].trim()); }
  t = t.replace(/(?:title|aria-label|placeholder|alt)\s*=\s*"[^"]*"/g, ' ');
  if (t.indexOf('>') >= 0 && (t.indexOf('<') < 0 || t.indexOf('>') < t.indexOf('<')))
    t = t.slice(t.indexOf('>') + 1);
  var lt = t.lastIndexOf('<');
  if (lt >= 0 && t.indexOf('>', lt) < 0) t = t.slice(0, lt);
  var vis = t.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' ')
    .split('\n').join('\n').split(' · ').join('\n')
    .split('\n').map(function (x) { return x.trim(); })
    .filter(function (x) { return x.length > 1 && cyr(x); });
  return { vis: vis, attrs: attrs };
}
function pieces(s) { var p = parts(s); return p.vis.concat(p.attrs); }

/* ⚠️ К СТРАНИЦЕ ПОДКЛЮЧЁН НЕ ТОЛЬКО index.html. constructor.js пишет человеку
   сообщения проверки маршрута («разрыв: день 3 привёз в …»), и его не читал
   никто. Проверяем все файлы, которые страница грузит тегом. */
/* ⚠️ КАКИЕ ФАЙЛЫ ПРОВЕРЯЕМ — СПРАШИВАЕМ У САМОЙ СТРАНИЦЫ, А НЕ ПОМНИМ.
   Список был записан руками. Значит подключи страница завтра ещё один файл с
   русским текстом — проверка честно напечатала бы ноль и никто бы не узнал.
   Теперь она читает теги <script src="/…"> из index.html и требует, чтобы
   КАЖДЫЙ подключённый файл был либо проверен, либо назван в исключениях
   ПОИМЁННО и с причиной (то же правило, что и раздел 1б в ПЕРЕВОД.md).
   Незнакомый файл — ошибка, а не молчание. */
const SKIP = {
  'i18n.js':      'это механизм перевода: русских фраз для человека в нём нет',
  'airports.js':  'список аэропортов мира, названия в оригинале (правило 10)',
  'day-math.js':  'счёт дня, общий с проверками в терминале; подписи для человека делает index.html',
  'open-hours.js':'разбор часов работы, общий с терминалом; подписи для человека делает index.html'
};
/* ⚠️ СЛОВАРИ ЯЗЫКОВ ПРОПУСКАЕМ ПО СОРТУ, А НЕ ПО ИМЕНИ. Перечислять их поимённо
   значило бы править эту проверку на каждом новом языке — то же самое, от чего
   уходит правило 22б. Сорт узнаётся по имени файла: lang-<код>.js. */
function skipWhy(f) {
  if (SKIP[f]) return SKIP[f];
  if (/^lang-[a-z]{2}\.js$/.test(f)) return 'словарь языка: русские фразы в нём — ключи, а не текст';
  return null;
}
const PAGE = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const LOADED = [];
(PAGE.match(/<script\s+src="\/([A-Za-z0-9._-]+\.js)"/g) || []).forEach(function (tag) {
  const f = tag.replace(/.*src="\//, '').replace(/"$/, '');
  if (LOADED.indexOf(f) < 0) LOADED.push(f);
});
/* airports.js подключается из кода, а не тегом — но грузится так же */
if (/airports\.js/.test(PAGE) && LOADED.indexOf('airports.js') < 0) LOADED.push('airports.js');
/* ⚠️ СЛОВАРИ ЯЗЫКОВ ТОЖЕ ПОДКЛЮЧАЮТСЯ ИЗ КОДА (шаг 2 плана, 08.08.2026):
   страница подставляет lang-<код>.js, когда язык не русский. Тега в файле нет,
   значит сам себя этот файл проверке не покажет — спрашиваем у папки, какие
   словари есть, и называем их поимённо, как всё остальное. */
if (/lang-'\+/.test(PAGE)) {
  fs.readdirSync(DIR).forEach(function (f) {
    if (/^lang-[a-z]{2}\.js$/.test(f) && LOADED.indexOf(f) < 0) LOADED.push(f);
  });
}

const FILES = ['index.html', 'constructor.js'].filter(f => fs.existsSync(path.join(DIR, f)));
const UNKNOWN = LOADED.filter(f => FILES.indexOf(f) < 0 && !skipWhy(f));
const SEP = String.fromCharCode(10) + '/*FILE*/' + String.fromCharCode(10);
/* ⚠️ СЧИТАЕМ ПО ФАЙЛАМ ОТДЕЛЬНО. index.html — это то, что человек видит всегда;
   constructor.js — словарь генератора и сообщения сборки маршрута, там текст
   другого сорта. Слить их в одно число значит спрятать одно за другим. */
const raw = FILES.map(function (f) { return fs.readFileSync(path.join(DIR, f), 'utf8'); }).join(SEP);
const src = stripComments(raw);
const LINES_SRC = src.split(String.fromCharCode(10));

const bad = [];        /* {line, text, why} */
/* ⚠️ ИСКЛЮЧЕНИЯ ДОЛЖНЫ БЫТЬ ВИДНЫ. Пока «мы это не переводим» было просто
   числом, за ним пряталось семь названий карточек на главной — и клиент нашла
   их глазами. Теперь каждое исключение печатается поимённо. */
const kept = [];
const okBy = { dict: 0, code: 0, glue: 0, keep: 0, tech: 0 };

/* ⚠️ ЧИТАЕМ И ДВОЙНЫЕ КАВЫЧКИ ТОЖЕ. Раньше проверка смотрела только строки
   в одинарных — то есть код. А вся статичная разметка написана двойными:
   title="Главная страница", placeholder="минимум 6 символов", <title> и
   <meta description>. Она их не видела вовсе и честно печатала ноль.
   Нашёл совет 07.08.2026. */
const rx = new RegExp("'((?:[^'\\n\\\\]|\\\\.)*)'" + '|' +
  '"((?:[^"\\n\\\\]|\\\\.)*)"' + '|' + '<title>([^<]*)</title>', 'g');
let m;
while ((m = rx.exec(src))) {
  const val = m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]);
  if (!cyr(val) || val.trim().length < 2) continue;

  const before = src.slice(Math.max(0, m.index - 40), m.index);
  const line = src.slice(0, m.index).split('\n').length;

  /* ⚠️ `q:` бывает двух разных вещей: поисковая строка места («Paris, France»)
     и ВОПРОС человеку в анкете («куда едете?»). Первое не переводим, второе
     обязаны. Отличаем по вопросительному знаку — других вопросов в q не бывает. */
  if (KEEP_RX.test(before) && !/\?\s*$/.test(val)) { okBy.keep++; kept.push({ line: line, text: val }); continue; }
  if (TECH.some(r => r.test(val.trim()))) { okBy.tech++; continue; }

  /* ⚠️ ЗДЕСЬ БЫЛА ПОБЛАЖКА РАЗВИЛКАМ — И ЭТО БЫЛА ДЫРА (убрана 08.08.2026,
     шаг 2 плана). Раньше строка прощалась, если рядом в той же строке кода
     стояло LANG!=='ru': мол, английский вариант написан тут же. Английский —
     да, а третий язык получал его же, просто потому что он «не русский», и
     проверка про это молчала. Так пряталась 31 фраза.
     Теперь развилки разбираются отдельно и печатаются поимённо (см. ниже).
     Осталась одна законная причина не ругаться: строка не текст вовсе —
     кусок регулярки для разбора дат, имя поля формы. */
  const codeLine = LINES_SRC[line - 1] || '';
  if (/MONRX|'date'|'text'|'area'|new RegExp/.test(codeLine)) { okBy.tech++; continue; }

  /* ② стоит в cx('…') — значит ищем в словаре для кода */
  const inCx = /\bcx\(\s*$/.test(before);
  const inTr = /\btr\(\s*$/.test(before);
  if (inCx) {
    if (Object.prototype.hasOwnProperty.call(CODE, val)) { okBy.code++; }
    else bad.push({ line: line, text: val, why: 'стоит в cx(), но в CODE такого ключа нет' });
    continue;
  }
  if (inTr) {
    if (Object.prototype.hasOwnProperty.call(DICT, val)) { okBy.dict++; }
    else bad.push({ line: line, text: val, why: 'стоит в tr(), но в DICT такого ключа нет' });
    continue;
  }

  /* ⚠️ СКЛЕЕНА СО ЗНАЧЕНИЕМ СПРАВА — СЛОВАРЬ ДО НЕЁ НЕ ДОСТАНЕТ НИКОГДА.
     'В вашем билете обратный рейс '+dm(...) — на экране это ОДИН кусок текста
     вместе с датой, и целиком его в словаре быть не может. Лечится только cx().
     Клиент нашла ровно это на телефоне, а проверка молчала: она видела фразу в
     словаре и считала, что всё хорошо.

     ⚠️ Смотрим ТОЛЬКО правый край и только если строка кончается ТЕКСТОМ.
     Кончается тегом ('…Google Maps →</a>') — там граница узла, и словарь
     сработает. Слева не смотрим вовсе: слева почти всегда значок, то есть тег. */
  const after = src.slice(m.index + m[0].length, m.index + m[0].length + 3);
  if (/^\s*\+/.test(after) && !/>\s*$/.test(val) && /[А-Яа-яЁё]\s*$/.test(val)) {
    bad.push({ line: line, text: val.length > 100 ? val.slice(0, 100) + '…' : val,
      why: 'склеена со значением — нужен cx(), словарь тут не сработает' });
    continue;
  }

  /* ① целиком в словаре */
  if (Object.prototype.hasOwnProperty.call(DICT, val.trim())) { okBy.dict++; continue; }

  /* ③ склеена с разметкой — но все куски есть в словаре */
  const ps = pieces(val);
  if (ps.length && ps.every(p => Object.prototype.hasOwnProperty.call(DICT, p))) { okBy.glue++; continue; }

  const missing = ps.filter(p => !Object.prototype.hasOwnProperty.call(DICT, p));
  bad.push({
    line: line,
    text: val.length > 100 ? val.slice(0, 100) + '…' : val,
    why: missing.length && missing.length < ps.length
      ? ('переведена наполовину: нет «' + missing[0].slice(0, 50) + '»')
      : 'нет перевода ни целиком, ни по кускам'
  });
}

console.log('ПОЛНОТА ПЕРЕВОДА ИНТЕРФЕЙСА (' + LANG + ') — по коду, а не по экрану\n');
console.log('  переведено целиком словарём: ' + okBy.dict);
console.log('  переведено словарём для кода: ' + okBy.code);
console.log('  переведено по кускам:         ' + okBy.glue);
console.log('  не переводится (названия):    ' + okBy.keep);
if (kept.length) {
  const was = new Set();
  kept.forEach(k => { if (!was.has(k.text)) { was.add(k.text); console.log('        · ' + k.text.slice(0, 70)); } });
}
console.log('  служебное:                    ' + okBy.tech);
/* ⚠️ СЧИТАЕМ ПО ФАЙЛАМ ОТДЕЛЬНО: index.html человек видит всегда, а
   constructor.js — словарь генератора. Слить их в одно число значит
   спрятать одно за другим. */
const cut = FILES.length > 1
  ? raw.slice(0, raw.indexOf(SEP)).split(String.fromCharCode(10)).length : Infinity;
const badPage = bad.filter(function (b) { return b.line < cut; });
const badGen = bad.filter(function (b) { return b.line >= cut; });
console.log('');
console.log('  ⛔ БЕЗ ПЕРЕВОДА в index.html (видит человек): ' + badPage.length);
if (FILES.length > 1) console.log('  ·  в constructor.js (генератор): ' + badGen.length);
console.log('');

/* ⚠️ ПЕЧАТАЕМ СПИСОК И ДЛЯ ГЕНЕРАТОРА, А НЕ ТОЛЬКО ЧИСЛО. Пока по constructor.js
   печаталось голое «248», работать с ним было нечем: чтобы узнать, ЧТО именно не
   переведено, приходилось править саму проверку. Число без списка — это не мера,
   а отговорка. Показывать по требованию: `node i18n-check.js --list`. */
function show(list, ttl) {
  if (!list.length) return;
  console.log('── ' + ttl + ' ──');
  const byWhy = {};
  list.forEach(b => (byWhy[b.why] = byWhy[b.why] || []).push(b));
  Object.keys(byWhy).sort((a, b) => byWhy[b].length - byWhy[a].length).forEach(w => {
    console.log('── ' + w + ' (' + byWhy[w].length + ')');
    byWhy[w].slice(0, 400).forEach(b => console.log('   ' + String(b.line).padStart(6) + '  ' + b.text));
    console.log('');
  });
}
show(badPage, 'index.html');
if (process.argv.indexOf('--list') >= 0) show(badGen, 'constructor.js');

console.log('  страница грузит файлов: ' + LOADED.length +
  ' · проверяем: ' + FILES.filter(f => f !== 'index.html').join(', '));
LOADED.forEach(f => {
  const why = FILES.indexOf(f) < 0 ? skipWhy(f) : null;
  if (why) console.log('        · ' + f + ' — не проверяем: ' + why);
});
if (UNKNOWN.length) {
  console.log('');
  console.log('  ⛔ СТРАНИЦА ГРУЗИТ ФАЙЛ, О КОТОРОМ ПРОВЕРКА НЕ ЗНАЕТ: ' + UNKNOWN.join(', '));
  console.log('     Либо добавь его в список проверяемых, либо в SKIP с причиной.');
}

/* ══════════════════════════════════════════════════════════════════════════
   РАЗВИЛКИ ПО ЯЗЫКУ — ПОИМЁННО, КАК И ВСЕ ОСТАЛЬНЫЕ ИСКЛЮЧЕНИЯ (шаг 2 плана)

   Развилки бывают двух сортов, и это НЕ одно и то же.

   ✔ LANG === 'ru'  — безопасна по устройству. Русский идёт своей веткой (у него
     три формы слова, готовая строка из open-hours.js), а ВСЕ остальные языки —
     общей: шаблон плюс их собственный словарь. Третий язык тут ничего не теряет.

   ⛔ LANG !== 'ru'  — опасна. «Не русский» значит «английский», и третий язык
     получит английский текст просто по признаку «не русский». Ровно так и
     пряталась 31 фраза до 08.08.2026.

   Поэтому каждая такая развилка должна быть названа здесь с причиной. Новая,
   о которой проверка не знает, роняет её в ошибку — то же правило, что и с
   подключёнными файлами: молчания быть не должно.
   ══════════════════════════════════════════════════════════════════════════ */
const FORKS = {
  "return cx('мили')":
    'у русского три формы («1 миля / 2 мили / 5 миль»), у остальных языков слово целиком лежит в их словаре',
  "tr(md.getAttribute('content')":
    'не выбор текста, а признак «язык не исходный»: описание страницы в <head> на русском переводить нечего'
};
const forkLines = [];
LINES_SRC.forEach(function (ln, i) {
  if (!/LANG\s*!==\s*'ru'/.test(ln)) return;
  const txt = ln.trim();
  const why = Object.keys(FORKS).filter(function (k) { return txt.indexOf(k) >= 0; })[0];
  forkLines.push({ line: i + 1, text: txt.length > 90 ? txt.slice(0, 90) + '…' : txt, why: why ? FORKS[why] : null });
});
const forkBad = forkLines.filter(function (f) { return !f.why; });
console.log('');
console.log('  развилок «язык не русский»: ' + forkLines.length + ' (каждая названа с причиной)');
forkLines.forEach(function (f) {
  console.log('        · ' + String(f.line).padStart(6) + '  ' + (f.why || '⛔ ПРИЧИНА НЕ УКАЗАНА'));
  if (!f.why) console.log('          ' + f.text);
});
if (forkBad.length) {
  console.log('');
  console.log('  ⛔ РАЗВИЛКА ПО ЯЗЫКУ, О КОТОРОЙ ПРОВЕРКА НЕ ЗНАЕТ. Третий язык получит');
  console.log('     то, что написано для английского. Либо перепиши шаблоном через cx(),');
  console.log('     либо назови её в FORKS в этом файле и объясни, почему это безопасно.');
}

/* ⚠️ СЛОВАРЬ ТОЖЕ УСТАРЕВАЕТ. Переписали фразу шаблоном — старый ключ остаётся
   лежать, и его никто не тронет: работать он не мешает, а читать словарь
   мешает. Поэтому показываем ключи CODE, которых в коде уже нет. Это не
   ошибка выкладки, а уборка. */
const codeSrc = raw;
const deadKeys = Object.keys(CODE).filter(function (k) {
  return codeSrc.indexOf("cx('" + k + "'") < 0 && codeSrc.indexOf('cx("' + k + '"') < 0;
});
if (deadKeys.length) {
  console.log('');
  console.log('  в CODE есть ключи, которых в коде уже нет: ' + deadKeys.length + ' — можно убрать');
  deadKeys.slice(0, 20).forEach(function (k) { console.log('        · ' + k.slice(0, 70)); });
}
console.log('');

process.exit((badPage.length || UNKNOWN.length || forkBad.length) ? 1 : 0);
