/* ==========================================================================
   ЧАСЫ РАБОТЫ НАЦИОНАЛЬНЫХ ПАРКОВ — ИЗ СПРАВОЧНИКА СЛУЖБЫ ПАРКОВ США

   Запуск:  node nps-hours.js trip-colorado.js
            node nps-hours.js trip-colorado.js --dry
            node nps-hours.js                        (все маршруты)

   Зачем. В OpenStreetMap у парков часов почти нет: по Колорадо мы нашли ноль из
   сорока пяти. А у Службы национальных парков США есть свой открытый справочник
   с часами и сезонностью. Клиент завела ключ (бесплатный, без карты), он лежит
   в nps-key.txt — файл НЕ публикуется (.gitignore у нас белый список).

   Как ищем: один раз забираем все парки страны и сопоставляем с нашими точками
   ПО ИМЕНИ И ПО РАССТОЯНИЮ — имя похоже и точка в 50 км от парка. Иначе не
   пишем ничего: правило то же, что с едой (9а) и с часами из карты (18).

   ⚠️ «Sunrise to Sunset» мы не переводим в часы: восход зимой и летом разный, а
   выдумывать нельзя. Такие парки остаются без часов — и это честно.

   Записывается в META.<id>.hours, рядом ставится hsrc:'nps' — чтобы hours.js
   (который берёт часы из карты) не затёр их своим прогоном.
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const KEYFILE = path.join(__dirname, 'nps-key.txt');
const KEY = fs.existsSync(KEYFILE) ? fs.readFileSync(KEYFILE, 'utf8').trim() : '';
if (!KEY) { console.log('нет nps-key.txt — ключ бесплатно берётся на nps.gov/subjects/developer'); process.exit(1); }

const R = 6371, rad = x => x * Math.PI / 180;
function km(a, b, c, d) {
  const dl = rad(c - a), dg = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const norm = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]+/gi, ' ').replace(/\s+/g, ' ').trim();

const WD = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const OSM = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/* «9:00AM - 5:00PM» → «09:00-17:00»; «All Day» → круглосуточно; «Closed» → выходной.
   Всё остальное (в том числе «Sunrise to Sunset») — не понимаем и молчим */
function conv(v) {
  const s = String(v || '').trim();
  if (!s) return null;
  if (/^closed$/i.test(s)) return 'off';
  if (/^all day$/i.test(s) || /24 hours/i.test(s)) return '00:00-24:00';
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(s);
  if (!m) return null;
  const h24 = (h, mi, ap) => {
    h = +h; mi = mi ? +mi : 0;
    if (ap && /pm/i.test(ap) && h < 12) h += 12;
    if (ap && /am/i.test(ap) && h === 12) h = 0;
    return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
  };
  return h24(m[1], m[2], m[3]) + '-' + h24(m[4], m[5], m[6]);
}
/* семь дней → короткая строка вида «Mo-Su 09:00-17:00» или «Mo-Fr 09:00-17:00; Sa-Su off» */
function toOSM(std) {
  const vals = WD.map(d => conv(std[d]));
  if (vals.some(v => !v)) return '';               /* хоть один день не поняли — не пишем */
  if (vals.every(v => v === '00:00-24:00')) return '24/7';
  /* склеиваем подряд идущие дни с одинаковыми часами, начиная с понедельника */
  const order = [1, 2, 3, 4, 5, 6, 0];
  const parts = [];
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && vals[order[j + 1]] === vals[order[i]]) j++;
    const days = (i === j) ? OSM[order[i]] : (OSM[order[i]] + '-' + OSM[order[j]]);
    parts.push(days + ' ' + (vals[order[i]] === 'off' ? 'off' : vals[order[i]]));
    i = j + 1;
  }
  return parts.join('; ');
}

function load(file) {
  const src = fs.readFileSync(file, 'utf8'); const S = {};
  new Function('S', 'with(S){' + src + ';S.P=P;S.META=typeof META!=="undefined"?META:{};}')(S);
  return S;
}

async function allParks() {
  const out = [];
  for (let start = 0; start < 600; start += 100) {
    const u = 'https://developer.nps.gov/api/v1/parks?limit=100&start=' + start + '&api_key=' + KEY;
    const res = await fetch(u, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(60000) });
    const j = await res.json();
    (j.data || []).forEach(p => {
      const ll = /lat:([-\d.]+), long:([-\d.]+)/.exec(p.latLong || '');
      out.push({ nm: p.fullName, short: p.name, code: p.parkCode,
        lat: ll ? +ll[1] : null, lng: ll ? +ll[2] : null,
        hours: (p.operatingHours || [])[0] });
    });
    if (!j.data || j.data.length < 100) break;
  }
  return out;
}

function pick(p, parks) {
  /* ⚠️ Сравниваем ТОЛЬКО с названием точки, а не с поисковой строкой. Иначе у
     «Cliff Palace, Mesa Verde» находился весь парк, и обзорной площадке внутри
     него доставались часы ворот: «круглосуточно» на экскурсию по билету — враньё.
     Часы парка принадлежат ПАРКУ, а не тому, что внутри него. */
  const mine = norm(p.nm);
  let best = null;
  parks.forEach(k => {
    if (k.lat == null) return;
    const d = km(p.lat, p.lng, k.lat, k.lng);
    if (d > 50) return;                              /* далеко — это другой парк */
    const n = norm(k.nm), sh = norm(k.short);
    if (!n) return;
    const near = (a, b) => a.indexOf(b) >= 0
      && Math.min(a.length, b.length) / Math.max(a.length, b.length) >= 0.5;
    const hit = near(mine, n) || near(n, mine) || (sh.length > 8 && near(mine, sh));
    if (!hit) return;
    if (!best || d < best.d) best = { k: k, d: d };
  });
  return best;
}

async function doFile(file, parks, dry) {
  const S = load(file);
  const pts = (S.P || []).filter(p => p.cat !== 'food' && typeof p.lat === 'number');
  const got = {};
  pts.forEach(p => {
    const hit = pick(p, parks);
    if (!hit || !hit.k.hours || !hit.k.hours.standardHours) return;
    const str = toOSM(hit.k.hours.standardHours);
    if (!str) { console.log('  ' + p.nm + ' → ' + hit.k.nm + ': часы словами («'
      + (hit.k.hours.standardHours.monday || '') + '») — не переводим, оставляем пусто'); return; }
    got[p.id] = str;
    console.log('  ' + p.nm + ' → ' + str + '   (' + hit.k.nm + ', ' + Math.round(hit.d) + ' км)');
  });
  const n = Object.keys(got).length;
  console.log('  нашли часы у ' + n + ' из ' + pts.length + ' точек');
  if (dry || !n) return;

  let src = fs.readFileSync(file, 'utf8');
  let done = 0;
  Object.keys(got).forEach(id => {
    const rx = new RegExp('(\\n\\s*' + id + ':\\{)([^\\n]*?)(\\},?\\s*\\n)');
    const m = src.match(rx);
    if (!m) return;
    let body = m[2].replace(/,hours:'[^']*'/g, '').replace(/,hsrc:'[^']*'/g, '');
    body += ",hours:'" + got[id].replace(/'/g, '’') + "',hsrc:'nps'";
    src = src.replace(rx, () => m[1] + body + m[3]);
    done++;
  });
  fs.writeFileSync(file, src);
  console.log('  ✅ записано в META: ' + done);
}

(async () => {
  const args = process.argv.slice(2);
  const dry = args.indexOf('--dry') >= 0;
  const arg = args.filter(a => a.charAt(0) !== '-')[0];
  const files = arg ? [arg] : fs.readdirSync(__dirname)
    .filter(f => /^trip-[a-z0-9-]+\.js$/.test(f) && f !== 'trip-TEMPLATE.js');
  console.log('спрашиваю справочник парков…');
  const parks = await allParks();
  console.log('парков в справочнике: ' + parks.length);
  for (const f of files) {
    console.log('\n=== ' + path.basename(f) + ' ===');
    await doFile(path.join(__dirname, path.basename(f)), parks, dry);
  }
})();
