/* ==========================================================================
   НОМЕРА МЕСТ У GOOGLE → В ФАЙЛ МАРШРУТА

   Запуск:  node place-ids.js trip-milan.js
            node place-ids.js                  (все маршруты)

   Зачем. Ссылка «открыть в Google Maps» должна вести на КАРТОЧКУ места — с
   отзывами, фотографиями и часами, — а не на голую точку с координатами. Её
   слова 02.08: «просто точка неинтересна, я раньше могла почитать про место».

   Точнее всего карточку открывает номер места (place_id): ссылка вида
     ?api=1&query=<название>&query_place_id=<номер>
   ведёт ровно туда, без угадывания. Номера у нас уже собраны — их кладёт в
   places-db.json проверка координат (verify-coords.js), и правилами Google
   хранить их можно бессрочно (в отличие от оценок и отзывов).

   Этот скрипт просто переносит номер из базы в META.<id>.pid файла маршрута.
   Ничего не спрашивает у сети и ничего не тратит.

   Где номера ещё нет — движок ищет по названию ВМЕСТЕ С ГОРОДОМ: карточка
   обычно открывается и так, но точной гарантии нет.
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const DB = path.join(__dirname, 'places-db.json');
if (!fs.existsSync(DB)) { console.log('нет places-db.json — сперва node verify-coords.js'); process.exit(1); }
const db = JSON.parse(fs.readFileSync(DB, 'utf8'));

function routeKey(file) {
  const m = /^trip-([a-z0-9-]+)\.js$/.exec(path.basename(file));
  return m ? m[1] : null;
}

function doFile(file) {
  const key = routeKey(file);
  if (!key) return;
  const mine = {};
  Object.keys(db).forEach(k => {
    const p = k.split(':');
    if (p[0] === key && db[k] && db[k].place_id) mine[p[1]] = db[k].place_id;
  });
  const ids = Object.keys(mine);
  if (!ids.length) { console.log('  номеров для этого маршрута в базе нет'); return; }

  let src = fs.readFileSync(file, 'utf8');
  let done = 0, miss = [];
  ids.forEach(id => {
    const rx = new RegExp('(\\n\\s*' + id + ':\\{)([^\\n]*?)(\\},?\\s*\\n)');
    const m = src.match(rx);
    if (!m) { miss.push(id); return; }
    let body = m[2];
    body = /pid\s*:/.test(body)
      ? body.replace(/pid\s*:\s*'[^']*'/, () => "pid:'" + mine[id] + "'")
      : body + ",pid:'" + mine[id] + "'";
    /* замена только функцией: в ценах есть «$30/маш», а «$3» в строке замены —
       это ссылка на скобку (на этом уже спотыкался hours.js) */
    src = src.replace(rx, () => m[1] + body + m[3]);
    done++;
  });
  fs.writeFileSync(file, src);
  console.log('  ✅ номеров записано: ' + done + (miss.length ? ' · нет строки META у: ' + miss.join(', ') : ''));
}

const arg = process.argv[2];
const files = arg ? [arg] : fs.readdirSync(__dirname)
  .filter(f => /^trip-[a-z0-9-]+\.js$/.test(f) && f !== 'trip-TEMPLATE.js');
files.forEach(f => {
  console.log('\n=== ' + path.basename(f) + ' ===');
  doFile(path.join(__dirname, path.basename(f)));
});
