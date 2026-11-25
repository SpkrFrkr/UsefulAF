const DATA_URL='./data.json';
const SETTINGS_KEY='usefulaf-display-v2';
const $=id=>document.getElementById(id);
let db, activeSheet=0, searchTimer=null;
let prefs=loadPrefs();
const palette=['#37e8ff','#ff69cf','#72ffad','#ffe66d','#b58cff','#ff9b62'];
function loadPrefs(){try{const p=JSON.parse(localStorage.getItem(SETTINGS_KEY))||{};return {widths:p.widths||{},orders:p.orders||{}}}catch{return {widths:{},orders:{}}}}
function savePrefs(){localStorage.setItem(SETTINGS_KEY,JSON.stringify(prefs))}
function safeUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}}
function isUrl(v){return !!safeUrl(String(v||'').trim())}
function clean(v){return String(v??'').trim()}
function isSection(row){const title=clean(row[0]).toUpperCase();return (title.startsWith('VARIOUS SHOPS') || (!row.some(isUrl) && !!title && row.slice(1).every(v=>!clean(v)||['SPECIALTIES','SHIPPING','PLATFORMS','DETAILS','DESCRIPTION'].includes(clean(v).toUpperCase()))))}
function keyFor(sheetIndex,rowIndex,row){return `${sheetIndex}:${rowIndex}:${clean(row[0]).toLowerCase()}`}
function domainIcon(url){try{return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=128`}catch{return ''}}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function allRows(){const out=[];db.sheets.forEach((s,si)=>s.rows.forEach((r,ri)=>out.push({sheet:s,si,ri,row:r})));return out}
function renderNav(){const nav=$('sheetNav');nav.replaceChildren();db.sheets.map((s,i)=>({s,i})).sort((a,b)=>a.s.name.localeCompare(b.s.name,'en',{sensitivity:'base',numeric:true})).forEach(({s,i})=>{const b=document.createElement('button');b.className='nav-item'+(i===activeSheet?' active':'');b.style.setProperty('--category-color',palette[i%palette.length]);const name=document.createElement('span');name.textContent=s.name;name.style.color=palette[i%palette.length];const n=document.createElement('span');n.className='nav-count';n.textContent=s.rows.length;b.append(name,n);b.addEventListener('click',()=>{activeSheet=i;$('searchInput').value='';render()});nav.append(b)})}
function createLogoCell(row,sheetIndex,rowIndex,url){const wrap=document.createElement('div');wrap.className='resource-name';const title=clean(row[0]);if(url){const img=document.createElement('img');img.className='resource-logo';img.alt='';img.loading='lazy';img.src=domainIcon(url);img.onerror=()=>img.remove();wrap.append(img)}const label=document.createElement('span');label.textContent=title;wrap.append(label);return wrap}
function getDisplayCells(row){const cells=row.map(clean);const urls=[...new Set(cells.filter(isUrl).map(v=>safeUrl(v)).filter(Boolean))];const rest=cells.map(v=>isUrl(v)?'':v);return {title:rest[0]||'',url:urls[0]||'',urls,rest}}
function makeTextCell(value){const td=document.createElement('td');td.textContent=value;return td}
function makeContinuationCell(){const td=document.createElement('td');td.className='continuation-cell';const mark=document.createElement('span');mark.textContent='↳';mark.setAttribute('aria-label','Continuation of the resource above');td.append(mark);return td}
function makeSectionCell(title,si,ri,row){const td=document.createElement('td');td.colSpan=headersLength();td.className='section-heading-cell';const wrap=document.createElement('div');wrap.className='section-heading';const label=document.createElement('span');label.className='section-title-text';label.textContent=title;wrap.append(label);td.append(wrap);return td}
function headersLength(){return document.getElementById('tableHead').children.length}
function render(){renderNav();const q=$('searchInput').value.trim().toLowerCase();const global=!!q;let records=global?allRows().filter(x=>(x.sheet.name+' '+x.row.join(' ')).toLowerCase().includes(q)):db.sheets[activeSheet].rows.map((row,ri)=>({sheet:db.sheets[activeSheet],si:activeSheet,ri,row}));
 $('categoryTotal').textContent=db.sheets.length+' CATEGORIES';$('breadcrumbs').textContent='DIRECTORY / '+(global?'SEARCH':db.sheets[activeSheet].name);$('pageTitle').textContent=global?'SEARCH RESULTS':db.sheets[activeSheet].name;$('pageDescription').textContent='';$('tableLabel').textContent=global?'GLOBAL SEARCH TABLE':'CATEGORY RESOURCE TABLE';$('recordCount').textContent=records.length.toLocaleString();$('totalCount').textContent=`${allRows().length.toLocaleString()} SOURCE ROWS`;$('versionLabel').textContent='2.4.4';
 const maxCols=Math.max(2,...records.map(x=>x.row.length));const headers=global?['Category','Name','Website',...Array.from({length:Math.max(0,maxCols-2)},(_,i)=>`Field ${i+3}`)]:['Name','Website',...Array.from({length:Math.max(0,maxCols-2)},(_,i)=>{const raw=db.sheets[activeSheet].headers?.[i+2]||`Field ${i+3}`;return raw==='Details'?'Description':raw})];
 prefs.orders=prefs.orders||{};prefs.widths=prefs.widths||{};let order=prefs.orders[global?'global':activeSheet]||headers.map((_,i)=>i);order=order.filter(i=>i<headers.length);headers.forEach((_,i)=>{if(!order.includes(i))order.push(i)});
 const cg=$('tableCols'),head=$('tableHead'),body=$('tableBody');cg.replaceChildren();head.replaceChildren();body.replaceChildren();
 order.forEach((colIndex,position)=>{const col=document.createElement('col');col.dataset.col=colIndex;col.style.width=(prefs.widths[(global?'g':'s'+activeSheet)+'-'+colIndex]|| (colIndex===0?'270px':colIndex===1?'300px':'210px'));cg.append(col);
 const th=document.createElement('th');th.textContent=headers[colIndex]||`Field ${colIndex+1}`;th.draggable=true;th.dataset.col=colIndex;th.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',String(colIndex));th.classList.add('dragging')});th.addEventListener('dragend',()=>th.classList.remove('dragging'));th.addEventListener('dragover',e=>{e.preventDefault();th.classList.add('drag-over')});th.addEventListener('dragleave',()=>th.classList.remove('drag-over'));th.addEventListener('drop',e=>{e.preventDefault();th.classList.remove('drag-over');const from=Number(e.dataTransfer.getData('text/plain'));const arr=[...order];const a=arr.indexOf(from),b=arr.indexOf(colIndex);if(a>=0&&b>=0){arr.splice(a,1);arr.splice(b,0,from);prefs.orders[global?'global':activeSheet]=arr;savePrefs();render()}});
 const handle=document.createElement('span');handle.className='resize-handle';handle.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const startX=e.clientX,startWidth=cg.children[position].getBoundingClientRect().width;document.body.classList.add('dragging-cols');handle.setPointerCapture(e.pointerId);const move=ev=>{const w=Math.max(100,Math.min(900,startWidth+ev.clientX-startX));cg.children[position].style.width=w+'px';prefs.widths[(global?'g':'s'+activeSheet)+'-'+colIndex]=w+'px'};const up=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.body.classList.remove('dragging-cols');savePrefs()};document.addEventListener('pointermove',move);document.addEventListener('pointerup',up,{once:true})});th.append(handle);head.append(th)});
 records.forEach(({sheet,si,ri,row})=>{const tr=document.createElement('tr');const section=isSection(row);if(section)tr.className='section-row';const info=getDisplayCells(row);let cells=[];if(global)cells.push(sheet.name);cells.push(info.title,info.url,...info.rest.slice(1));while(cells.length<headers.length)cells.push('');cells=cells.slice(0,headers.length);
 if(section){const title=clean(row.find(v=>clean(v)))||'SECTION';const td=makeSectionCell(title,si,ri,row);td.colSpan=headers.length;tr.append(td);body.append(tr);return}
 order.forEach(index=>{if(global&&index===0){const cat=makeTextCell(sheet.name);cat.style.color=palette[si%palette.length];cat.style.fontWeight='700';cat.style.fontFamily='Consolas,monospace';tr.append(cat);return}const logical=global?index-1:index; if(logical===0){if(!info.title&&info.url){tr.append(makeContinuationCell())}else{const td=document.createElement('td');td.append(createLogoCell(row,si,ri,info.url));tr.append(td)}}else if(logical===1){const td=document.createElement('td');td.className='link-cell';info.urls.forEach((url,i)=>{if(i){const sep=document.createElement('span');sep.textContent=' · ';sep.style.color='var(--muted)';td.append(sep)}const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=url.replace(/^https?:\/\//,'');a.title=url;td.append(a)});tr.append(td)}else{const value=clean(row[logical]);tr.append(makeTextCell(isUrl(value)?'':value))}});body.append(tr)});
 $('emptyState').hidden=records.length!==0;
}
function applyPrefs(){document.body.classList.remove('comfortable')}
$('searchInput').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(render,90)});
$('settingsToggle').addEventListener('click',()=>{const panel=$('settingsPanel');panel.hidden=!panel.hidden;$('settingsToggle').setAttribute('aria-expanded',String(!panel.hidden))});
$('resetSettings').addEventListener('click',()=>{prefs={widths:{},orders:{}};savePrefs();applyPrefs();render()});
async function start(){try{db=JSON.parse(document.getElementById('embeddedData').textContent);applyPrefs();render()}catch(e){$('pageTitle').textContent='UNABLE TO LOAD DATABASE';$('pageDescription').textContent='Open this website through GitHub Pages or a local web server. Do not open index.html directly.'}}
start();

;(()=>{
  const c=document.getElementById('matrixRain');if(!c)return;
  const ctx=c.getContext('2d');
  const glyphs=Array.from(new Set('ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ光電雨漢字한글ΩΣЖЯאבمرحअकไทย字∞+-<>'));
  const pick=()=>glyphs[Math.floor(Math.random()*glyphs.length)];
  // Original UsefulAF neon accent palette; each glyph changes independently.
  const neon=['#00D9FF','#FF2DAA','#B66BFF','#39FF88','#F5F500'];
  const makeGlyph=()=>({char:pick(),colorIndex:Math.floor(Math.random()*neon.length),next:null,phase:Math.random()*1000});
  function switchGlyph(g,t){
    if(g.next===null)g.next=t+g.phase;
    if(t<g.next)return;
    const i=glyphs.indexOf(g.char);
    // Exclude the current character and color.
    g.char=glyphs[(i+1+Math.floor(Math.random()*(glyphs.length-1)))%glyphs.length];
    g.colorIndex=(g.colorIndex+1+Math.floor(Math.random()*(neon.length-1)))%neon.length;
    g.next+=1000*(1+Math.floor((t-g.next)/1000));
  }
  let w,h,streams=[];
  function resize(){
    w=innerWidth;h=Math.max(innerHeight,document.documentElement.clientHeight);
    const d=Math.min(devicePixelRatio||1,2);c.width=w*d;c.height=h*d;
    ctx.setTransform(d,0,0,d,0,0);
    streams=Array.from({length:Math.ceil(w/35)},(_,i)=>({
      x:i*35+12,y:Math.random()*(h+560),s:12+Math.random()*19,
      n:8+Math.floor(Math.random()*19),g:Array.from({length:28},makeGlyph)
    }));
  }
  resize();addEventListener('resize',resize);
  if(window.visualViewport)visualViewport.addEventListener('resize',resize);
  let last=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(t){
    const dt=last?Math.min((t-last)/1000,.1):0;last=t;
    ctx.fillStyle='#020306';ctx.fillRect(0,0,w,h);
    ctx.font='16px monospace';ctx.textAlign='center';
    for(const a of streams){
      if(!reduced){
        a.y+=a.s*dt;
        if(a.y-a.n*21>h)a.y=-Math.random()*100;
      }
      for(let j=a.n-1;j>=0;j--){
        const g=a.g[j];
        if(!reduced)switchGlyph(g,t);
        const y=a.y-j*21;if(y<0||y>h+20)continue;
        const fade=Math.pow(1-j/a.n,1.7),color=neon[g.colorIndex];
        ctx.globalAlpha=j===0?.95:fade*.72;
        ctx.fillStyle=color;
        ctx.shadowColor=color;
        ctx.shadowBlur=j===0?9:3;ctx.fillText(g.char,a.x,y);
      }
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;
    if(!reduced)requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

;(()=>{const input=document.getElementById('searchInput');const code=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];let pos=0;input.addEventListener('blur',()=>pos=0);input.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(key===code[pos]){e.preventDefault();pos++;if(pos===code.length){pos=0;sessionStorage.setItem('ua-secret','1');location.href='./secret.html';}}else{pos=key===code[0]?1:0;if(pos)e.preventDefault();}});})();
