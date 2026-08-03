/* ==========================================================================
   ПРАВКА ФАЙЛА МАРШРУТА — ОДИН РЕЗАК НА ВСЕ ИНСТРУМЕНТЫ

   Файлы маршрутов пишутся руками и читаются глазами: комментарии-разделители
   дней, переносы строк, объяснения. Поэтому инструменты не «пересобирают JSON»,
   а переставляют куски текста как есть.

   Кто пользуется: fit-hours.js (раскладка вокруг часов) и day-order.js --apply
   (порядок точек в дне). Написано один раз нарочно — на этих мелочах уже
   спотыкались:
     · у последней записи массива НЕТ запятой: переставишь её в середину — файл
       перестаёт читаться. Дописываем запятую всем (висячая запятая законна);
     · кавычки бывают одинарные И двойные: в «nm:"Musée d'Orsay"» апостроф внутри
       двойных сбивал счётчик скобок, и конец массива находился не там — точки
       уезжали внутрь списка еды.
   ========================================================================== */
function splitArray(src, name) {
  const key = '\nconst ' + (name || 'P') + '=[';
  const at = src.indexOf(key);
  if (at < 0) throw new Error('не нашла массив ' + (name || 'P'));
  let i = at + key.length, depth = 1, end = -1;
  while (i < src.length) {
    const c = src[i];
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (!depth) { end = i; break; } }
    else if (c === "'" || c === '"') { const q = c; i++; while (i < src.length && src[i] !== q) i += (src[i] === '\\' ? 2 : 1); }
    i++;
  }
  if (end < 0) throw new Error('не нашла конец массива ' + (name || 'P'));
  const lines = src.slice(at + key.length, end).split('\n');
  const blocks = [];
  let cur = null;
  const head = name ? /^\s*\{n:\d+/ : /^\s*\{id:'/;
  lines.forEach(line => {
    if (head.test(line)) {
      if (cur) blocks.push(cur);
      cur = name
        ? { id: 'day' + (/\{n:(\d+)/.exec(line) || [])[1], n: +((/\{n:(\d+)/.exec(line) || [])[1]), text: line }
        : { id: (/id:'([^']+)'/.exec(line) || [])[1], d: +((/[,{]d:(\d+)/.exec(line) || [])[1]), text: line };
    } else if (cur) cur.text += '\n' + line;
    else blocks.push({ id: null, text: line });
  });
  if (cur) blocks.push(cur);
  return { head: src.slice(0, at + key.length), tail: src.slice(end), blocks: blocks };
}

function joinArray(parts) {
  const withComma = t => {
    const lines = t.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const L = lines[i].replace(/\s+$/, '');
      if (!L || /^\s*\/\*/.test(L) || /^\s*\*/.test(L) || /\*\/\s*$/.test(L)) continue;
      if (!/,$/.test(L)) lines[i] = L + ',';
      break;
    }
    return lines.join('\n');
  };
  return parts.head + parts.blocks.map(b => b.id ? withComma(b.text) : b.text).join('\n') + parts.tail;
}

/* переложить точки: order — id по порядку, dayOfId — какой день у каждой */
function rewritePlaces(src, order, dayOfId) {
  const parts = splitArray(src, null);
  const known = {}, rest = [];
  parts.blocks.forEach(b => { if (b.id && dayOfId[b.id] !== undefined) known[b.id] = b; else rest.push(b); });
  const moved = order.map(id => {
    const b = known[id];
    if (!b) return null;
    b.text = b.text.replace(/([,{])d:\d+/, (m, p1) => p1 + 'd:' + dayOfId[id]);
    return b;
  }).filter(Boolean);
  parts.blocks = moved.concat(rest.filter(b => b.id));
  const headComments = rest.filter(b => !b.id).map(b => b.text).join('\n');
  let out = joinArray(parts);
  if (headComments.trim()) out = out.replace(parts.head, parts.head + headComments + '\n');
  return out;
}

module.exports = { splitArray, joinArray, rewritePlaces };
