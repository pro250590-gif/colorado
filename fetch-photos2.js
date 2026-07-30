/* ==========================================================================
   ФОТО ДЛЯ ЛЮБОГО МАРШРУТА — с Викисклада (Wikimedia Commons).
   Запуск:  node fetch-photos2.js trip-utah.js [сколько мест]

   В отличие от первой версии (fetch-photos.js со списком мест руками), эта
   берёт места прямо из файла данных: ищет по полю q, отсеивает карты, гравюры
   и старые сканы, качает три размера (900 / 260 / 120) в img/ и печатает
   готовые строки PHOTO и BPHOTO, которые остаётся вставить в файл маршрута.

   ⚠️ Автомат ошибается: он уже подсовывал отель вместо водопада и Йосемити
   вместо нужного озера. Поэтому есть фильтр must (имя места обязано быть
   в названии файла), а итог всё равно надо просмотреть глазами.
   ========================================================================== */
const https=require('https'),fs=require('fs'),path=require('path');
const FILE=process.argv[2]||'trip-utah.js';
const LIMIT=+(process.argv[3]||99);
const SRC=fs.readFileSync(path.join(__dirname,FILE),'utf8');
const S={};new Function('S','with(S){'+SRC+';S.BASES=BASES;S.P=P;S.PHOTO=PHOTO;S.BPHOTO=BPHOTO;}')(S);
const {BASES,P,PHOTO,BPHOTO}=S;

const UA='KolibriProPlanner/1.0 (trip site; https://github.com/pro250590-gif/colorado)';
const SIZES={l:900,t:260,p:120};
const BAD=/\b(map|karte|mapa|diagram|scheme|logo|coat of arms|seal|sign|plaque|chart|graph|engraving|lithograph|drawing|painting|sketch|print|postcard|stereograph|18\d\d|19[0-2]\d)\b/i;

function get(url,binary){
  return new Promise((res,rej)=>{
    const r=https.get(url,{headers:{'User-Agent':UA,'Accept':binary?'*/*':'application/json'}},s=>{
      if(s.statusCode>=300&&s.statusCode<400&&s.headers.location){s.resume();return get(s.headers.location,binary).then(res,rej);}
      if(s.statusCode!==200){s.resume();return rej(new Error('HTTP '+s.statusCode));}
      const ch=[];s.on('data',d=>ch.push(d));s.on('end',()=>res(binary?Buffer.concat(ch):Buffer.concat(ch).toString('utf8')));
    });
    r.setTimeout(20000,()=>{r.destroy();rej(new Error('таймаут'));});
    r.on('error',rej);
  });
}
const api='https://commons.wikimedia.org/w/api.php?format=json&';
async function search(q){
  const j=JSON.parse(await get(api+'action=query&list=search&srnamespace=6&srlimit=12&srsearch='+encodeURIComponent(q)));
  return ((j.query&&j.query.search)||[]).map(x=>x.title);
}
async function info(title,w){
  const j=JSON.parse(await get(api+'action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth='+w+'&titles='+encodeURIComponent(title)));
  const p=j.query&&j.query.pages&&Object.values(j.query.pages)[0];
  const ii=p&&p.imageinfo&&p.imageinfo[0];
  if(!ii)return null;
  const m=ii.extmetadata||{};
  return {url:ii.thumburl||ii.url,author:(m.Artist&&m.Artist.value||'').replace(/<[^>]+>/g,'').slice(0,60),
          lic:(m.LicenseShortName&&m.LicenseShortName.value)||''};
}
/* ключевые слова места: по ним проверяем, что файл действительно про него */
/* Исландские и французские названия в именах файлов пишут с диакритикой
   («Jökulsárlón», «Fjaðrárgljúfur»), а мы ищем по латинице без неё — и половина
   мест «не находилась». Складываем буквы к простому виду перед сравнением. */
function fold(t){
  return String(t).toLowerCase()
    .replace(/[áàâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[íìîï]/g,'i')
    .replace(/[óòôöø]/g,'o').replace(/[úùûü]/g,'u').replace(/[ýÿ]/g,'y')
    .replace(/[ðđ]/g,'d').replace(/[þ]/g,'th').replace(/[æ]/g,'ae').replace(/[ç]/g,'c').replace(/[ñ]/g,'n');
}
function mustOf(q){
  const w=fold(q).replace(/[^a-z0-9 ]/g,' ').split(/\s+/)
    .filter(x=>x.length>3&&!['national','park','state','trail','utah','arizona','colorado','point','area','road'].includes(x));
  return w.slice(0,2);
}
async function grab(id,q,pref){
  const must=mustOf(q);
  let titles=[];
  for(const term of [q,q.split(',')[0]]){
    try{titles=titles.concat(await search(term));}catch(e){}
    if(titles.length>6)break;
  }
  /* Ранжируем, а не берём первое попавшееся: автомат уже приносил «парковку в
     Моабе» вместо города. Больше совпавших ключевых слов — лучше; служебные
     снимки (парковка, указатель, вход, туалет) уводим в конец. */
  const JUNK=/\b(parking|sign|signage|entrance|gate|toilet|restroom|kiosk|shuttle|bus|hotel|motel|lodge|store|shop)\b/i;
  const good=titles.filter(t=>/\.(jpe?g|png)$/i.test(t)&&!BAD.test(t)
    &&(!must.length||must.some(m=>fold(t).includes(m))))
    .map(t=>{const lo=fold(t);
      return {t:t,score:must.filter(m=>lo.includes(m)).length*2+(JUNK.test(t)?-3:0)+(/\.jpe?g$/i.test(t)?1:0)};})
    .sort((a,b)=>b.score-a.score).map(x=>x.t);
  if(!good.length){if(process.env.DBG)console.log('\n     [нашлось '+titles.length+', подошло 0; ключи: '+must.join(',')+']');return null;}
  for(const t of good.slice(0,3)){
    try{
      const rec={};
      for(const [k,w] of Object.entries(SIZES)){
        const inf=await info(t,w);if(!inf)throw new Error('нет файла');
        const ext=/\.png$/i.test(t)?'png':'jpg';
        const out=path.join(__dirname,'img',pref+id+'-'+k+'.'+ext);
        if(!fs.existsSync(out))fs.writeFileSync(out,await get(inf.url,true));
        rec.ext=ext;rec.author=inf.author;rec.lic=inf.lic;rec.title=t;
      }
      return rec;
    }catch(e){}
  }
  return null;
}
(async()=>{
  const pref=FILE.replace(/^trip-|\.js$/g,'').slice(0,2)+'_';
  console.log('Маршрут: '+FILE+' · префикс файлов: '+pref+'\n');
  const gotP={},gotB={},credits=[];
  const want=[];
  BASES.forEach(b=>{if(!BPHOTO[b.id])want.push({kind:'base',id:b.id,q:b.q||b.name});});
  P.filter(p=>p.cat!=='food'&&p.cat!=='transport'&&!PHOTO[p.id]).forEach(p=>want.push({kind:'place',id:p.id,q:p.q||p.nm}));
  for(const w of want.slice(0,LIMIT)){
    process.stdout.write('  '+w.id+' ('+w.q+') … ');
    const r=await grab(w.id,w.q,pref);
    if(!r){console.log('не нашли');continue;}
    console.log('ок — '+r.title.replace('File:',''));
    credits.push(w.id+' — '+r.title.replace('File:','')+' · '+r.author+' · '+r.lic);
    if(w.kind==='base')gotB[w.id]=pref+w.id; else gotP[pref+w.id]=r.ext;
    if(w.kind==='place')gotP['__'+w.id]=pref+w.id;
    await new Promise(r=>setTimeout(r,900));   /* Викисклад не любит частить: без паузы половина запросов срывалась */
  }
  console.log('\n=== ВСТАВИТЬ В '+FILE+' ===');
  const pe=Object.keys(gotP).filter(k=>k.indexOf('__')===0)
    .map(k=>"'"+k.slice(2)+"':'"+gotP[k]+"'");
  console.log('/* фото: id места → имя файла в img/ */');
  console.log('const PHOTOF={'+pe.join(',')+'};');
  console.log('const BPHOTO={'+Object.keys(gotB).map(k=>"'"+k+"':'"+gotB[k]+"'").join(',')+'};');
  fs.appendFileSync(path.join(__dirname,'photo-credits.txt'),'\n\n'+FILE+'\n'+credits.join('\n'));
  console.log('\nавторы и лицензии дописаны в photo-credits.txt');
})();
