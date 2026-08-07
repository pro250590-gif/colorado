/* ==========================================================================
   ВЫТАЩИТЬ ТЕКСТ МАРШРУТА ДЛЯ ПЕРЕВОДА

   Её требование 07.08.2026: писать текст, а не присылать списки. Чтобы писать
   быстро и ничего не пропустить, нужен скелет: какие поля у этого маршрута
   переводятся и что в них сейчас написано.

   Отдаёт заготовку файла trip-<маршрут>-<язык>.js: та же структура, ключи по
   ID мест, значения — русский текст. Остаётся переписать значения
   по-английски (правило 21: писать заново, а не переводить).

   ⚠️ Берём ТОЛЬКО текстовые поля. Координаты, цены числом, минуты, часы работы,
   названия мест и поисковые строки не трогаем — у них языка нет (правило 10).

   Запуск:  node i18n-extract.js trip-colorado.js
   ========================================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = __dirname;
const file = process.argv[2];
if (!file) { console.log('надо: node i18n-extract.js trip-colorado.js'); process.exit(1); }

/* файл маршрута — обычный скрипт с const на верхнем уровне; читаем его в песочнице */
const src = fs.readFileSync(path.join(DIR, file), 'utf8');
const box = { window: {}, console: console };
vm.createContext(box);
try { vm.runInContext(src + '\n;__out={BASES:typeof BASES!=="undefined"?BASES:null,DAYS:typeof DAYS!=="undefined"?DAYS:null,'
  + 'P:typeof P!=="undefined"?P:null,META:typeof META!=="undefined"?META:null,HERO:typeof HERO!=="undefined"?HERO:null,'
  + 'FOODCITIES:typeof FOODCITIES!=="undefined"?FOODCITIES:null,BUDGET:typeof BUDGET!=="undefined"?BUDGET:null,'
  + 'LINES:typeof LINES!=="undefined"?LINES:null,AIRPORTWAY:typeof AIRPORTWAY!=="undefined"?AIRPORTWAY:null,'
  + 'DRIVE:typeof DRIVE!=="undefined"?DRIVE:null,TIPS:typeof TIPS!=="undefined"?TIPS:null,'
  + 'OPTS:typeof OPTS!=="undefined"?OPTS:null,ALTNM:typeof ALTNM!=="undefined"?ALTNM:null,'
  + 'PRECHECK:typeof PRECHECK!=="undefined"?PRECHECK:null,TRIP_NAME:typeof TRIP_NAME!=="undefined"?TRIP_NAME:null,'
  + 'AIRPORTNM:typeof AIRPORTNM!=="undefined"?AIRPORTNM:null,TRANSFER:typeof TRANSFER!=="undefined"?TRANSFER:null};', box); }
catch (e) { console.log('не прочитался: ' + e.message); process.exit(1); }
const D = box.__out;

const cyr = s => typeof s === 'string' && /[А-Яа-яЁё]/.test(s);
const pick = (o, keys) => {
  const r = {};
  keys.forEach(k => { if (cyr(o && o[k])) r[k] = o[k]; });
  return Object.keys(r).length ? r : null;
};

const out = { lang: 'en' };

if (D.HERO) out.hero = pick(D.HERO, ['h1', 'em', 'sub', 'alt', 'capTitle', 'capSub', 'parksCap']);
if (D.BASES) { out.base = {}; D.BASES.forEach(b => { const v = pick(b, ['name', 'desc', 'alt']); if (v) out.base[b.id] = v; }); }
if (D.DAYS) { out.day = {}; D.DAYS.forEach(d => { const v = pick(d, ['title', 'pill', 'leg', 'note']); if (v) out.day[d.n] = v; }); }
if (D.P) {
  out.place = {};
  D.P.forEach(p => {
    const v = pick(p, ['why', 'hop', 'pin']) || {};
    if (Array.isArray(p.tag) && p.tag.some(cyr)) v.tag = p.tag;
    if (Object.keys(v).length) out.place[p.id] = v;
  });
}
if (D.META) { out.meta = {}; Object.keys(D.META).forEach(id => { const v = pick(D.META[id], ['price', 'best', 'route', 'pin', 'dur']); if (v) out.meta[id] = v; }); }
if (D.AIRPORTWAY) { out.airway = {}; Object.keys(D.AIRPORTWAY).forEach(k => { if (cyr(D.AIRPORTWAY[k])) out.airway[k] = D.AIRPORTWAY[k]; }); }
if (D.FOODCITIES) {
  out.food = D.FOODCITIES.map(c => ({
    city: cyr(c.city) ? c.city : undefined,
    spots: (c.spots || []).map(s => pick(s, ['why', 'meal', 'veg']) || {})
  }));
}
if (D.BUDGET) {
  out.budget = D.BUDGET.map(g => ({
    g: cyr(g.g) ? g.g : undefined,
    items: (g.items || []).map(it => pick(it, ['nm', 'sub']) || {})
  }));
}
if (D.DRIVE) {
  out.drive = {};
  if (D.DRIVE.rows) out.drive.rows = D.DRIVE.rows.map(r => pick(r, ['seg', 'km', 't', 'stops']) || {});
  if (D.DRIVE.total) out.drive.total = pick(D.DRIVE.total, ['seg', 'km', 't', 'stops']) || {};
}
if (D.TIPS) out.tips = D.TIPS.map(g => ({ t: cyr(g.t) ? g.t : undefined, li: (g.li || []).map(x => (cyr(x) ? x : undefined)) }));
/* ⚠️ ЭТИ ЧЕТЫРЕ ПОЛЯ МЕХАНИЗМ РАНЬШЕ НЕ ВИДЕЛ ВОВСЕ — и клиент нашла их глазами.
   Варианты дня, подписи профиля высоты, ссылки «проверить перед выездом» и само
   название поездки. Ловится проверкой i18n-check-trip.js. */
if (D.OPTS) { out.opts = {}; Object.keys(D.OPTS).forEach(k => { const v = pick(D.OPTS[k], ['nm', 'sub']); if (v) out.opts[k] = v; }); }
if (D.ALTNM) { out.altnm = {}; Object.keys(D.ALTNM).forEach(k => { if (cyr(D.ALTNM[k])) out.altnm[k] = D.ALTNM[k]; }); }
if (D.PRECHECK) out.precheck = D.PRECHECK.map(x => (cyr(x && x.label) ? { label: x.label } : {}));
if (cyr(D.TRIP_NAME)) out.tripName = D.TRIP_NAME;
if (D.AIRPORTNM) { out.airnm = {}; Object.keys(D.AIRPORTNM).forEach(k => { if (cyr(D.AIRPORTNM[k])) out.airnm[k] = D.AIRPORTNM[k]; }); }
if (D.TRANSFER) { out.transfer = {}; Object.keys(D.TRANSFER).forEach(k => { const v = pick(D.TRANSFER[k], ['clean', 'stops', 'way', 'nm']); if (v) out.transfer[k] = v; }); }
if (D.LINES) out.line = D.LINES.map(l => (cyr(l.label) ? { label: l.label } : {}));

let n = 0;
(function count(o) { if (!o) return; if (typeof o === 'string') { if (cyr(o)) n++; return; }
  if (typeof o === 'object') Object.keys(o).forEach(k => count(o[k])); })(out);

console.log(JSON.stringify(out, null, 1));
console.error('строк для перевода: ' + n);
