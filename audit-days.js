/* ==========================================================================
   РЕВИЗИЯ ДНЕЙ: НАСКОЛЬКО ЗАПОЛНЕН КАЖДЫЙ ДЕНЬ КАЖДОГО МАРШРУТА

   Зачем. Её слова 06.08.2026: «маршруты мы делали как тестовые и не прогоняли;
   теперь бывает, что в дне две активности на два-три часа — нам нужно, чтобы
   день был занят по-максимуму, но лучшими местами, а не подряд».
   На глаз это не увидеть: дней в восьми маршрутах под шестьдесят.

   Что делает: открывает страницу по-настоящему (jsdom) и спрашивает у САМОГО
   движка, сколько времени занимает день и сколько окна ему отведено. Никаких
   своих подсчётов — иначе разойдётся с сайтом, как уже было с math дня.

   Как читать: «ПУСТО» — занято меньше половины окна. «ПЕРЕГРУЗ» — больше окна.
   Проценты считаются от окна дня, а оно зависит от темпа (8/10/12 ч) и от
   времени прилёта, если рейс вписан.

   Первый прогон 06.08.2026 (темп 10 ч, рейс не вписан): 17 дней ниже половины,
   перегруженных нет. Хуже всех Нью-Йорк + Лос-Анджелес: пять дней подряд ниже
   41%. Лучше всех Милан — 71–99%, и в нём же больше всего мест в дне (9–14).
   Вывод оттуда: дело не в правилах, а в наполнении — где мест 1–3, день пустой.

   Запуск:  node audit-days.js            (все маршруты)
            node audit-days.js trip-x.js  (один)
   Нужен jsdom:  npm i jsdom
   ========================================================================== */
const fs=require('fs'),path=require('path'),http=require('http');
const DIR='C:/Users/pro25/dev/planner';
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json'};

function serve(trip,done){
  const srv=http.createServer((q,res)=>{
    const u=decodeURIComponent(q.url.split('?')[0]),f=path.join(DIR,u==='/'?'index.html':u);
    if(!fs.existsSync(f)){res.writeHead(404);res.end('no');return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
    if(path.basename(f)!=='index.html'){res.end(fs.readFileSync(f));return;}
    let h=fs.readFileSync(f,'utf8');
    h=h.replace(/<head[^>]*>/i,m=>m+'<script>'
      +'window.matchMedia=window.matchMedia||function(q){return{matches:false,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){}};};'
      +'HTMLCanvasElement.prototype.getContext=function(){var n=function(){};return{font:"",measureText:function(t){return{width:String(t||"").length*7};},fillText:n,clearRect:n,beginPath:n,moveTo:n,lineTo:n,stroke:n,fill:n,arc:n,save:n,restore:n,setTransform:n,scale:n,translate:n,drawImage:n,closePath:n,rect:n,fillRect:n,strokeRect:n,quadraticCurveTo:n,bezierCurveTo:n,createLinearGradient:function(){return{addColorStop:n};},getImageData:function(){return{data:[]};}};};'
      +'</script>');
    h=h.replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^"]*"[^>]*><\/script>/,'');
    h=h.replace(/document\.write\('<scr'\+'ipt src="\/?'\+[^;]*?\);/g,'');
    h=h.replace('<script src="/day-math.js"></script>','<script src="/'+trip+'"></script>\n<script src="/day-math.js"></script>');
    res.end(h);
  });
  srv.listen(0,()=>done(srv));
}

async function audit(trip){
  const {JSDOM,VirtualConsole}=require(path.join(DIR,'node_modules','jsdom'));
  const srv=await new Promise(r=>serve(trip,r));
  const dom=await JSDOM.fromURL('http://127.0.0.1:'+srv.address().port+'/index.html?data='+trip,
    {runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:new VirtualConsole()});
  const w=dom.window;
  await new Promise(r=>setTimeout(r,2800));
  let rows=[];
  try{
    rows=JSON.parse(w.eval('(function(){try{return JSON.stringify(SCHED.map(function(e){'
      +'var b=dayMinutes(e.tid),lim=dayLimit(e.tid);'
      +'return {n:e.disp,t:dayTitle(e),used:b.total,lim:lim,pl:dayPlaces(e).length,'
      +' base:(baseById(e.base)||{}).name||""};'
      +'}));}catch(err){return JSON.stringify([{err:err.message}]);}})()'));
  }catch(e){rows=[{err:e.message}];}
  try{w.close();}catch(e){}
  srv.close();
  return rows;
}

const hm=m=>{m=Math.round(m||0);const h=Math.floor(m/60),r=m%60;
  return h?(h+' ч'+(r?(' '+r):'')):(r+' мин');};

(async()=>{
  const files=process.argv[2]?[process.argv[2]]
    :fs.readdirSync(DIR).filter(f=>/^trip-[a-z0-9-]+\.js$/.test(f)&&f!=='trip-test-shapes.js').sort();
  const problems=[];
  for(const f of files){
    const rows=await audit(f);
    console.log('\n══ '+f+' ══');
    if(rows[0]&&rows[0].err){console.log('   ОШИБКА: '+rows[0].err);continue;}
    rows.forEach(r=>{
      const pct=r.lim?Math.round(r.used/r.lim*100):0;
      /* пустой день: занято меньше половины окна и мест мало */
      const empty=r.lim>0&&pct<50;
      const over=r.lim>0&&r.used>r.lim;
      const mark=over?'ПЕРЕГРУЗ':(empty?'ПУСТО   ':'        ');
      console.log('  '+mark+' день '+String(r.n).padStart(2)+'  '
        +String(pct).padStart(3)+'%  '+hm(r.used).padStart(9)+' из '+hm(r.lim).padEnd(9)
        +'  '+String(r.pl).padStart(2)+' мест  '+String(r.t||'').slice(0,42));
      if(empty||over)problems.push({f:f,n:r.n,pct:pct,used:r.used,lim:r.lim,pl:r.pl,t:r.t,over:over});
    });
  }
  console.log('\n\n═══ ИТОГ ═══');
  const empt=problems.filter(p=>!p.over),ovr=problems.filter(p=>p.over);
  console.log('дней занято меньше половины окна: '+empt.length);
  console.log('дней с перегрузом:                '+ovr.length);
  if(empt.length){
    console.log('\nСАМЫЕ ПУСТЫЕ (что показать клиенту):');
    empt.sort((a,b)=>a.pct-b.pct).slice(0,14).forEach(p=>
      console.log('  '+p.f.replace(/^trip-|\.js$/g,'').padEnd(12)+' день '+String(p.n).padStart(2)
        +'  '+String(p.pct).padStart(3)+'%  '+hm(p.used)+' из '+hm(p.lim)
        +'  ('+p.pl+' мест)  '+String(p.t||'').slice(0,38)));
  }
  if(ovr.length){
    console.log('\nПЕРЕГРУЖЕННЫЕ:');
    ovr.forEach(p=>console.log('  '+p.f.replace(/^trip-|\.js$/g,'').padEnd(12)+' день '+String(p.n).padStart(2)
      +'  '+hm(p.used)+' из '+hm(p.lim)+'  '+String(p.t||'').slice(0,38)));
  }
})();
