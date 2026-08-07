/* ==========================================================================
   ЧТО ПРИДЁТСЯ ПЕРЕВОДИТЬ: СБОР ВСЕХ РУССКИХ СТРОК

   Её задача 06.08.2026: «нужно вытащить всё это системно, а потом уже делать
   переводы». Плюс её же требование к качеству: не «перевести с русского», а
   НАПИСАТЬ по-английски так, как пишут носители.

   ⚠️ Этот скрипт НИЧЕГО НЕ МЕНЯЕТ. Он только читает и раскладывает по полкам,
   чтобы было видно объём и границы работы. Сам вынос текста — следующий шаг, и
   его надо делать кусками с прогоном проверок после каждого.

   Что считает и почему именно так:
     · строки в кавычках с кириллицей — это то, что видит человек;
     · КОММЕНТАРИИ НЕ СЧИТАЕТ. Их в файле больше, чем текста, и они переводу не
       подлежат — это записки для нас;
     · отдельно помечает строки, которые переводить НЕЛЬЗЯ: названия мест,
       рестораны, поисковые строки (правило 10 — они живут в оригинале).

   Запуск:  node i18n-scan.js            — сводка
            node i18n-scan.js --list     — все строки списком
            node i18n-scan.js --csv      — таблица для переводчика
            node i18n-scan.js --left     — ЧТО ЕЩЁ НЕ ПЕРЕВЕДЕНО, по частоте

   ⚠️ ПОЧЕМУ У --left ОТДЕЛЬНАЯ РАЗБОРКА СТРОК.
   Ключ словаря должен совпасть с тем, что окажется в тексте страницы, а в коде
   фраза лежит вместе с разметкой: '<b>Откуда вы летите?</b>'. Поэтому здесь
   разметка вырезается, а строка разваливается на куски по её границам — ровно
   так же, как потом развалится на текстовые узлы в браузере.
   ========================================================================== */
const fs=require('fs'),path=require('path');
const DIR=__dirname;

/* Поля данных маршрута, которые НЕ переводятся: это оригинальные названия и
   поисковые строки. Правило 10 в ROUTE-RULES.md. */
const KEEP=['q','nm','air','pid','id','base','cat','emoji','color','file','data'];
const KEEP_RX=new RegExp('(?:^|[,{\\s])(' + KEEP.join('|') + ')\\s*:\\s*$');

function cyr(t){return (String(t).match(/[А-Яа-яЁё]+/g)||[]).length;}

/* вырезаем комментарии, чтобы не считать наши записки за текст сайта */
function stripComments(src){
  return src
    .replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' '))
    .replace(/(^|[^:'"\\])\/\/[^\n]*/g,(m,p)=>p+m.slice(p.length).replace(/./g,' '));
}

function scan(file){
  const raw=fs.readFileSync(path.join(DIR,file),'utf8');
  const src=stripComments(raw);
  const out=[];
  const rx=/'([^'\n\\]*(?:\\.[^'\n\\]*)*)'/g;
  let m;
  while((m=rx.exec(src))){
    const val=m[1];
    if(!cyr(val))continue;
    if(val.trim().length<2)continue;
    /* что стоит перед строкой — по этому видно, поле это данных или текст */
    const before=src.slice(Math.max(0,m.index-40),m.index);
    const keep=KEEP_RX.test(before);
    const line=src.slice(0,m.index).split('\n').length;
    out.push({file:file,line:line,text:val,words:cyr(val),keep:keep});
  }
  return out;
}

const FILES=['index.html'].concat(
  fs.readdirSync(DIR).filter(f=>/^trip-[a-z0-9-]+\.js$/.test(f)&&!/-(?:en|es|de|fr|it)\.js$/.test(f)).sort());

let all=[];
FILES.forEach(f=>{try{all=all.concat(scan(f));}catch(e){console.log('не прочитан '+f+': '+e.message);}});

const tr=all.filter(x=>!x.keep), keep=all.filter(x=>x.keep);
const uniq=[...new Set(tr.map(x=>x.text))];

/* ——— остаток: что ещё не переведено ———
   Берём только index.html: содержимое маршрутов (trip-*.js) переводом словаря
   не делается — его надо переписывать по-английски, это отдельная работа. */
if(process.argv.includes('--left')){
  const DICT=require('./i18n.js').DICT.en;
  /* ⚠️ ПОВТОРЯЮЩИЙСЯ КЛЮЧ JS СЪЕДАЕТ МОЛЧА: останется последний, а первый
     перевод тихо пропадёт. Поэтому проверяем словарь на входе, а не гадаем. */
  {
    /* ⚠️ СЛОВАРЯ ДВА, И ПРОВЕРЯТЬ ИХ НАДО ПОРОЗНЬ. DICT работает по готовой
       странице, CODE — по кускам, склеенным с числом. Одна и та же строка
       законно живёт в обоих: «на метро» — и подпись у места, и способ доехать.
       Первая версия проверки смотрела оба разом и ругалась на здоровое. */
    const src=fs.readFileSync(path.join(DIR,'i18n.js'),'utf8');
    const iC=src.indexOf('var CODE'), iP=src.indexOf('var PLURAL_EN');
    const blocks=[['DICT', src.slice(src.indexOf('var DICT'), iC>0?iC:iP)],
                  ['CODE', iC>0?src.slice(iC,iP):'']];
    let bad=false;
    blocks.forEach(function(pair){
      const seen={},dup=[];
      pair[1].split('\n').forEach(function(l){
        const m=l.match(/^\s*'((?:[^'\\]|\\.)*)'\s*:/);
        if(!m)return;
        if(seen[m[1]])dup.push(m[1]); else seen[m[1]]=1;
      });
      if(dup.length){
        bad=true;
        console.log('⛔ В СЛОВАРЕ '+pair[0]+' ПОВТОРЯЮТСЯ КЛЮЧИ — первый перевод пропадёт:');
        dup.forEach(function(k){console.log('   '+k);});
      }
    });
    if(bad)console.log('');
  }
  const cnt={};
  tr.filter(x=>x.file==='index.html').forEach(x=>{
    /* разметка вон, строка разваливается по её границам — как в браузере */
    String(x.text).replace(/<[^>]*>/g,'\n').replace(/&nbsp;/g,' ')
      .split('\n').forEach(p=>{
        const s=p.trim();
        if(!cyr(s)||s.length<2)return;
        if(Object.prototype.hasOwnProperty.call(DICT,s))return;
        (cnt[s]=cnt[s]||{n:0,line:x.line}).n++;
      });
  });
  const list=Object.keys(cnt).sort((a,b)=>cnt[b].n-cnt[a].n||a.localeCompare(b,'ru'));
  const top=process.argv.includes('--all')?list:list.slice(0,Number(
    (process.argv.find(a=>/^--top=/.test(a))||'--top=150').split('=')[1]));
  console.log('ЕЩЁ НЕ ПЕРЕВЕДЕНО (index.html), по частоте\n');
  top.forEach(s=>console.log(String(cnt[s].n).padStart(4)+' ×  '
    +String(cnt[s].line).padStart(6)+'  '+s));
  console.log('\n  разных фраз осталось: '+list.length
    +'   уже в словаре: '+Object.keys(DICT).length);
  console.log('  весь остаток:  node i18n-scan.js --left --all');
}else if(process.argv.includes('--csv')){
  console.log('файл;строка;по-русски;по-английски');
  uniq.forEach(t=>{
    const f=tr.find(x=>x.text===t);
    console.log([f.file,f.line,'"'+t.replace(/"/g,'""')+'"',''].join(';'));
  });
}else if(process.argv.includes('--list')){
  let cur='';
  tr.forEach(x=>{
    if(x.file!==cur){cur=x.file;console.log('\n══ '+cur+' ══');}
    console.log(String(x.line).padStart(5)+'  '+x.text.slice(0,110));
  });
}else{
  console.log('ЧТО ПРИДЁТСЯ ПЕРЕВОДИТЬ\n');
  const by={};
  tr.forEach(x=>{by[x.file]=by[x.file]||{n:0,w:0};by[x.file].n++;by[x.file].w+=x.words;});
  Object.keys(by).forEach(f=>console.log('  '+f.padEnd(24)
    +String(by[f].n).padStart(5)+' строк  '+String(by[f].w).padStart(6)+' слов'));
  const words=tr.reduce((s,x)=>s+x.words,0);
  console.log('\n  ВСЕГО             '+String(tr.length).padStart(5)+' строк  '+String(words).padStart(6)+' слов');
  console.log('  из них разных     '+String(uniq.length).padStart(5)+' строк   (одинаковые переводим один раз)');
  console.log('\n  НЕ переводим      '+String(keep.length).padStart(5)+' строк   — названия мест и поисковые строки');
  console.log('\nПримерно '+Math.ceil(words/250)+' страниц текста.');
  console.log('Список целиком:  node i18n-scan.js --list');
  console.log('Таблица:         node i18n-scan.js --csv > perevod.csv');
}
