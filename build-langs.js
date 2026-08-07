/* ==========================================================================
   АДРЕСА ПО ЯЗЫКАМ: kolibripro.com/en/ рядом с kolibripro.com/

   Зачем. Её решение 06.08.2026: делать адреса по языкам сразу, потому что это
   единственное из четырёх, что потом дорого переделывать. И правда: пока адрес
   один на все языки, Google видит одну страницу, а не десять — английскую
   версию просто не найдут.

   ⚠️ ПОЧЕМУ КОПИЯ ФАЙЛА, А НЕ НАСТРОЙКА СЕРВЕРА. Сайт лежит на GitHub Pages —
   это просто папка с файлами, переписывать адреса на лету там некому. Значит
   путь один: рядом с index.html кладём en/index.html. Ровно так делают все
   генераторы статических сайтов: страница на каждый язык.

   ⚠️ ОТСЮДА ГЛАВНАЯ ОПАСНОСТЬ: копии устаревают. Поправил index.html, забыл
   пересобрать — и на /en/ висит вчерашняя версия. Поэтому:
     · копия делается ОДНОЙ командой и всегда целиком, руками её не правят;
     · сверху копии стоит предупреждение «файл собран, не редактировать»;
     · `node build-langs.js --check` говорит, не отстали ли копии. Эту проверку
       стоит гонять перед выкладкой.

   Языки берутся не с потолка: только те, у которых есть словарь в i18n.js.
   Пустых папок не заводим — страница без перевода Google только повредит.

   Запуск:  node build-langs.js          — собрать
            node build-langs.js --check  — проверить, не отстали ли
   ========================================================================== */
const fs=require('fs'), path=require('path');
const DIR=__dirname, SRC=path.join(DIR,'index.html');

/* какие языки готовы — спрашиваем у самого словаря, а не держим второй список */
function readyLangs(){
  try{
    const I=require(path.join(DIR,'i18n.js'));
    return Object.keys(I.DICT||{}).filter(l=>l!=='ru'&&Object.keys(I.DICT[l]).length>20);
  }catch(e){console.log('не прочитан i18n.js: '+e.message);return [];}
}

const MARK='\n<!-- ⚠️ ЭТОТ ФАЙЛ СОБРАН АВТОМАТИЧЕСКИ. Не редактируйте его: правьте\n'
  +'     index.html в корне и выполните `node build-langs.js`. Всё, что здесь\n'
  +'     поправят руками, пропадёт при следующей сборке. -->';

/* Страница одна и та же; язык берётся из адреса. Ставим его до движка, чтобы
   первая же отрисовка была на нужном языке, а не мигала русским.

   ⚠️ ДВЕ ЛОВУШКИ, В КОТОРЫЕ Я УЖЕ УГОДИЛА, — не переставлять обратно:
   1) метка-примечание шла ПЕРЕД <!doctype>. Любой текст до doctype — и браузер
      может уйти в «режим совместимости», где вёрстка считается по старым
      правилам. Теперь метка идёт ПОСЛЕ doctype.
   2) строчка с языком вставлялась сразу после <head>, то есть ПЕРЕД
      <meta charset="utf-8">. Кодировку браузер определяет по первым байтам, и
      скрипт впереди сбивает определение: русский текст превращается в «Ð¡Ñ‚Ð°Ñ€Ñ‚».
      Ровно это и вылезло на проверке. Теперь язык ставится ПОСЛЕ charset. */
/* ⚠️ ГОЛОВУ СТРАНИЦЫ ПЕРЕВОДИМ ЗДЕСЬ, НА СБОРКЕ, А НЕ В БРАУЗЕРЕ.
   Причина — её наблюдение 07.08.2026: «вижу, как прыгает: сначала русский,
   потом английский». Перевод в браузере идёт ПОСЛЕ отрисовки, поэтому вспышка
   русского неизбежна по устройству. Заголовок вкладки, описание для поисковика
   и признак языка страницы человек и Google видят раньше любого скрипта —
   значит они должны быть английскими уже в файле.

   ⚠️ ТРОГАЕМ ТОЛЬКО ГОЛОВУ. Строки внутри кода не переводим: там есть места,
   где движок СРАВНИВАЕТ с русским словом (кнопка брони, плашка «бесплатно»,
   важность точки), и слепая замена молча сломала бы логику. */
function headFor(lang, out) {
  var D = null;
  try { D = require(path.join(DIR, 'i18n.js')).DICT[lang] || null; } catch (e) {}
  var tr = function (s) {
    return (D && Object.prototype.hasOwnProperty.call(D, s)) ? D[s] : s;
  };
  out = out.replace(/<html([^>]*)lang="[a-z-]+"/i, '<html$1lang="' + lang + '"');
  out = out.replace(/<title>([^<]*)<\/title>/i, function (m, t) {
    return '<title>' + tr(t.trim()) + '</title>';
  });
  out = out.replace(/(<meta[^>]*name="description"[^>]*content=")([^"]*)(")/i,
    function (m, a, t, b) { return a + tr(t.trim()) + b; });
  return out;
}

/* ⚠️ ВСЮ РАЗМЕТКУ ПЕРЕВОДИМ ЗДЕСЬ, НА СБОРКЕ — ЭТО И ЕСТЬ ВСПЫШКА.
   Совет 07.08.2026 разобрал её по шагам: браузер рисует то, что успел разобрать,
   а разбирает он сначала готовую разметку (шапка, названия разделов, подписи
   кнопок), и только потом упирается в блокирующие скрипты Leaflet и Supabase.
   В этот момент человек и видит русский. Перевод приезжает седьмым скриптом —
   поэтому «сначала русский, потом английский» неизбежно, пока текст лежит в
   файле по-русски.

   ⚠️ ГРАНИЦА ПРОХОДИТ ПО СУТИ, А НЕ ПО МЕСТУ. Раньше здесь стояло «только между
   <body> и первым <script>», и это было опасно ТИХО: допиши разметку ниже —
   сборка её не увидит, английская страница мигнёт русским, и никто не заметит.
   Её слова 07.08.2026: «я же не программист, мне не понятно, когда и куда ты
   что допишешь, — надо сделать сразу так, чтоб ничего не сломать». Правильно.
   Теперь пропускаются <script>, <style> и комментарии, а ВСЯ остальная разметка
   переводится, где бы она ни стояла. Место дописки больше не имеет значения.

   ⚠️ ПОЧЕМУ ИМЕННО ЭТИ ТРИ ИСКЛЮЧЕНИЯ, И ПОЧЕМУ ИХ НЕЛЬЗЯ УБРАТЬ:
   · <script> — в коде есть места, где движок СРАВНИВАЕТ строку с русским словом
     (кнопка брони, плашка «бесплатно», важность точки). Слепая замена там молча
     изменила бы поведение английской страницы — это уже случалось;
   · <style> — там русские только в пояснениях; правка сделала бы файл другим
     без пользы, а `--check` начал бы врать про «устарела»;
   · комментарии — пояснения для нас, человек их не видит.

   ⚠️ ТО, ЧТО РИСУЕТ КОД ИЗ ДАННЫХ (лента дней, карта, карточки еды, бюджет),
   сюда не попадает НИКОГДА: в файле этого текста нет ни на каком языке, он
   появляется в браузере. Его переводит словарь на лету — так и задумано. */

/* мера, а не ощущение: что перевели на сборке и что осталось русским */
var MARKUP_STAT = { done: 0, left: [] };

function markupFor(lang, out) {
  MARKUP_STAT = { done: 0, left: [] };
  var D = null;
  try { D = require(path.join(DIR, 'i18n.js')).DICT[lang] || null; } catch (e) {}
  if (!D) return out;

  /* ⚠️ ПОВТОРЯЕМ ЛОГИКУ trLine() ИЗ index.html, А НЕ ПРОСТОЙ ПОИСК В СЛОВАРЕ.
     Строка часто склеена через « · » — «Жильё · Бюджет». Целиком её в словаре
     нет и не будет, движок в браузере разбирает её по разделителю. Если здесь
     искать только целиком, то: (1) такие строки не переведутся на сборке и
     мигнут русским, (2) проверка заругается на них зря. */
  var look = function (k) {
    if (Object.prototype.hasOwnProperty.call(D, k)) return D[k];
    /* точка может висеть на краю — «Жильё ·»: дальше текст дорисуют отдельно */
    var edge = k.match(/^(·\s*)?([\s\S]*?)(\s*·)?$/);
    if (edge && edge[2] && (edge[1] || edge[3]) && Object.prototype.hasOwnProperty.call(D, edge[2]))
      return (edge[1] || '') + D[edge[2]] + (edge[3] || '');
    if (k.indexOf(' · ') < 0) return null;
    var hit = false;
    var out = k.split(' · ').map(function (part) {
      var p = part.trim();
      if (!Object.prototype.hasOwnProperty.call(D, p)) return part;
      hit = true; return part.replace(p, D[p]);
    }).join(' · ');
    return hit ? out : null;
  };

  var tr = function (t) {
    var k = t.trim();
    if (!k) return t;
    var v = look(k);
    if (v !== null) { MARKUP_STAT.done++; return t.replace(k, v); }
    if (MARKUP_STAT.left.indexOf(k) < 0) MARKUP_STAT.left.push(k);
    return t;
  };

  var piece = function (s) {
    /* текст между тегами */
    s = s.replace(/>([^<>]+)</g, function (m, t) {
      return (/[А-Яа-яЁё]/.test(t)) ? ('>' + tr(t) + '<') : m;
    });
    /* подписи в атрибутах: их человек видит наведением и читалкой экрана */
    s = s.replace(/(title|aria-label|placeholder|alt)="([^"]*)"/g, function (m, a, t) {
      return (/[А-Яа-яЁё]/.test(t)) ? (a + '="' + tr(t) + '"') : m;
    });
    return s;
  };

  var b = out.indexOf('<body');
  if (b < 0) return out;
  b = out.indexOf('>', b) + 1;
  var head = out.slice(0, b), body = out.slice(b);

  /* идём по телу и вырезаем куски, которые трогать нельзя; остальное переводим */
  var RE = /<(script|style)\b[\s\S]*?<\/\1\s*>|<!--[\s\S]*?-->/gi;
  var res = '', last = 0, m;
  while ((m = RE.exec(body))) {
    res += piece(body.slice(last, m.index)) + m[0];
    last = RE.lastIndex;
  }
  res += piece(body.slice(last));
  return head + res;
}

/* Печатает, сколько разметки переведено на сборке и что осталось русским.
   Осталось — значит фразы нет в словаре: она доедет переводом в браузере,
   то есть С ВСПЫШКОЙ. Это не поломка, но это надо видеть, а не узнавать
   через месяц по жалобе «опять мигает». */
function sayMarkup(lang) {
  console.log('     разметка: переведено на сборке ' + MARKUP_STAT.done
    + ', осталось русским ' + MARKUP_STAT.left.length);
  if (!MARKUP_STAT.left.length) return 0;
  console.log('     ⚠️ этих фраз нет в словаре (' + lang + ') — на английской странице мигнут русским:');
  MARKUP_STAT.left.slice(0, 10).forEach(function (x) {
    console.log('        · ' + x.slice(0, 70));
  });
  if (MARKUP_STAT.left.length > 10) console.log('        · …и ещё ' + (MARKUP_STAT.left.length - 10));
  console.log('     Чинится дописыванием в DICT в i18n.js, потом node build-langs.js');
  return MARKUP_STAT.left.length;
}

/* ==========================================================================
   МЕТКИ ЯЗЫКОВЫХ ВЕРСИЙ, КАНОНИЧЕСКИЙ АДРЕС, КАРТА САЙТА (шаг 0, 07.08.2026)

   Почему это здесь, а не в коде страницы. Раньше hreflang рисовала функция
   langLinks() уже в браузере. Обычный Google скрипты выполняет и метки видел, а
   ИИ-поисковики — нет: они читают ФАЙЛ. Для них английской версии не
   существовало вовсе. Значит метки должны лежать текстом.

   Почему это здесь, а не руками в index.html. Список готовых языков один и тот
   же — его отдаёт словарь (readyLangs). Правило 22б: добавить язык = дописать
   словарь, код не трогать. Поэтому блок между <!--LANGLINKS--> и
   <!--/LANGLINKS--> собирается сборкой и в копиях, И В САМОМ index.html.
   ========================================================================== */
const SITE='https://kolibripro.com';
const BLOCK=/<!--LANGLINKS-->[\s\S]*?<!--\/LANGLINKS-->/;

function langUrl(c){return SITE+(c==='ru'?'/':'/'+c+'/');}

/* переводы строк у index.html — CRLF; вставим блок в том же виде, иначе файл
   станет смешанным, а `--check` начнёт ругаться на пустом месте */
function eolOf(s){return /\r\n/.test(s)?'\r\n':'\n';}

function linksFor(lang,langs,eol){
  const L=['<!--LANGLINKS-->',
    '<link rel="canonical" href="'+langUrl(lang)+'">',
    '<link rel="alternate" hreflang="x-default" href="'+langUrl('ru')+'">',
    '<link rel="alternate" hreflang="ru" href="'+langUrl('ru')+'">'];
  langs.forEach(l=>L.push('<link rel="alternate" hreflang="'+l+'" href="'+langUrl(l)+'">'));
  L.push('<!--/LANGLINKS-->');
  return L.join(eol);
}

function withLinks(lang,langs,out){
  if(!BLOCK.test(out)){
    console.log('⚠️ в index.html нет блока <!--LANGLINKS-->…<!--/LANGLINKS--> —');
    console.log('   метки языковых версий и canonical поставить некуда. Верните блок в <head>.');
    process.exit(1);
  }
  return out.replace(BLOCK,linksFor(lang,langs,eolOf(out)));
}

/* Карта сайта. Каждый адрес перечисляет все свои языковые версии — так
   поисковик понимает, что это одна страница на разных языках, а не копии.
   Адресов ровно столько, сколько языков: страницы маршрутов живут на «/?trip=…»
   и canonical сводит их к главной, поэтому в карте их быть не должно. */
function sitemapFor(langs){
  const all=['ru'].concat(langs);
  const alt=all.map(l=>'    <xhtml:link rel="alternate" hreflang="'+l+'" href="'+langUrl(l)+'"/>')
    .concat(['    <xhtml:link rel="alternate" hreflang="x-default" href="'+langUrl('ru')+'"/>']).join('\n');
  const urls=all.map(l=>'  <url>\n    <loc>'+langUrl(l)+'</loc>\n'+alt+'\n    <changefreq>weekly</changefreq>\n  </url>').join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    +'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    +'        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+urls+'\n</urlset>\n';
}

/* Робот-файл. Открываем всё: закрывать нечего, личных страниц у сайта нет.
   Главное в нём — строка Sitemap: без неё карту сайта надо заявлять руками. */
function robotsTxt(){
  return 'User-agent: *\nAllow: /\n\nSitemap: '+SITE+'/sitemap.xml\n';
}

function pageFor(lang,html){
  const tag='\n<script>window.__lang='+JSON.stringify(lang)+';</script>';
  let out=html.replace(/<!doctype html>/i,m=>m+MARK);
  if(/<meta charset=/i.test(out))
    out=out.replace(/<meta charset=[^>]*>/i,m=>m+tag);
  else out=out.replace(/<head[^>]*>/i,m=>m+tag);
  out=withLinks(lang,readyLangs(),out);
  return markupFor(lang, headFor(lang, out));
}

function build(){
  const html=fs.readFileSync(SRC,'utf8');
  const langs=readyLangs();
  if(!langs.length){console.log('готовых языков нет — собирать нечего');return;}

  /* сначала правим метки в САМОМ index.html: он тоже языковая версия (русская),
     и его блок обязан перечислять те же языки, что и копии */
  const root=withLinks('ru',langs,html);
  if(root!==html){fs.writeFileSync(SRC,root,'utf8');console.log('  метки языков обновлены в index.html');}

  fs.writeFileSync(path.join(DIR,'sitemap.xml'),sitemapFor(langs),'utf8');
  fs.writeFileSync(path.join(DIR,'robots.txt'),robotsTxt(),'utf8');
  console.log('  собрано  sitemap.xml, robots.txt');

  langs.forEach(l=>{
    const dir=path.join(DIR,l);
    if(!fs.existsSync(dir))fs.mkdirSync(dir);
    const page=pageFor(l,html);
    fs.writeFileSync(path.join(dir,'index.html'),page,'utf8');
    console.log('  собрано  /'+l+'/index.html');
    sayMarkup(l);
  });
  console.log('\nГотово. Языков: '+langs.length+' ('+langs.join(', ')+')');
  console.log('⚠️ Не забудьте добавить папки в .gitignore-исключения, иначе они не выложатся.');
}

function check(){
  const html=fs.readFileSync(SRC,'utf8');
  const langs=readyLangs();
  let stale=0, flash=0;

  /* ⚠️ Метки языков и карта сайта — такая же копия, как /en/index.html, и
     устаревают они так же тихо. Проверяем их здесь, а не «помним». */
  if(withLinks('ru',langs,html)!==html){console.log('  УСТАРЕЛИ   метки языков в index.html');stale++;}
  else console.log('  свежие     метки языков в index.html');
  /* ⚠️ Сравниваем БЕЗ учёта вида перевода строки. Git на Windows сам меняет
     LF на CRLF при выдаче файла, и точное сравнение начало бы вечно кричать
     «устарел» на файле, который мы только что собрали. */
  const same=(a,b)=>a.replace(/\r\n/g,'\n')===b.replace(/\r\n/g,'\n');
  [['sitemap.xml',sitemapFor(langs)],['robots.txt',robotsTxt()]].forEach(([f,want])=>{
    const p=path.join(DIR,f);
    if(!fs.existsSync(p)){console.log('  НЕТ ВОВСЕ  '+f);stale++;}
    else if(!same(fs.readFileSync(p,'utf8'),want)){console.log('  УСТАРЕЛ    '+f);stale++;}
    else console.log('  свежий     '+f);
  });

  langs.forEach(l=>{
    const f=path.join(DIR,l,'index.html');
    const want=pageFor(l,html);          /* заодно наполняет MARKUP_STAT */
    if(!fs.existsSync(f)){console.log('  НЕТ ВОВСЕ  /'+l+'/');stale++;flash+=sayMarkup(l);return;}
    const cur=fs.readFileSync(f,'utf8');
    if(cur!==want){console.log('  УСТАРЕЛА   /'+l+'/');stale++;}
    else console.log('  свежая     /'+l+'/');
    flash+=sayMarkup(l);
  });
  if(stale){console.log('\nОтстали: '+stale+'. Выполните: node build-langs.js');process.exit(1);}
  /* ⚠️ Разметка без перевода — это вспышка русского на английской странице.
     Ловим ЗДЕСЬ, до выкладки, а не по жалобе клиента «опять мигает». */
  if(flash){console.log('\nРазметки без перевода: '+flash+'. Допишите фразы в DICT (i18n.js) и пересоберите.');process.exit(1);}
  console.log('\nВсе копии свежие, вся разметка переведена на сборке.');
}

process.argv.includes('--check')?check():build();
