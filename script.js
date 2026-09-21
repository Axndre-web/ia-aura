const $=s=>document.querySelector(s);
const NEON_REAL_IDENTITY = window.NEON_ORB_EXTERNAL_IDENTITY || Object.freeze({handle:'@neonorb',solana:{primary:'AvcMD59dTTTnHKzfdQtF9AcSzgSNcqCWEkcUYx4BnUeh',backups:['5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3']},bitcoin:{primary:'bc1qs9dvc02xl8ury20xlsya8xda4cpygzhs0ll9ym',backups:['bc1qg8ykmeh2dmgq2l6d37zu702vlh6mn72k556ty5']}});
window.__neonEconomyProvenance = Object.freeze({
  model:'REAL_COMPUTABLE_VIVA',
  internal:'WORK_EXECUTION_IN_NEON_PLAYER_X',
  local:'PERSISTED_BROWSER_STATE',
  network:'OBSERVED_EXTERNAL_SERVICES_ONLY',
  external:'BLOCKCHAIN_CONFIRMED_WHEN_NETWORK_CONFIRMATION_EXISTS',
  authority:'NEON_ORB_DECISION_AUTHORITY'
});
function neonIdentitySnapshot(){return {handle:NEON_REAL_IDENTITY.handle,solanaPrimary:NEON_REAL_IDENTITY.solana.primary,solanaBackups:[...NEON_REAL_IDENTITY.solana.backups],bitcoinPrimary:NEON_REAL_IDENTITY.bitcoin.primary,bitcoinBackups:[...NEON_REAL_IDENTITY.bitcoin.backups]}}
window.neonOrbIdentitySnapshot=neonIdentitySnapshot;
function neonBridgeUrl(kind){
  const configured=window.NEON_BRIDGE_HEALTH_URL;
  if(configured){
    try{
      const u=new URL(configured,location.href);
      // Never request an HTTP localhost bridge from an HTTPS public page: browsers
      // correctly block this as mixed content. Public mode is handled below.
      if(location.protocol==='https:' && u.protocol==='http:') return null;
      return kind==='telemetry' ? u.href.replace(/\/health\/?$/,'/telemetry') : u.href;
    }catch(_){ return null; }
  }
  if(location.protocol==='http:' || location.protocol==='file:'){
    return kind==='telemetry' ? 'http://127.0.0.1:8787/telemetry' : 'http://127.0.0.1:8787/health';
  }
  return null;
}
async function neonFetchJSON(url, timeout=4500){
  const ctl=new AbortController(); const timer=setTimeout(()=>ctl.abort(),timeout);
  try{const r=await fetch(url,{cache:'no-store',signal:ctl.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}
  finally{clearTimeout(timer);}
}
async function neonPublicTelemetry(){
  const out={ok:false,status:'OBSERVABLE',mode:'READ_ONLY',network:'mainnet-beta',signer:'PUBLIC_READ_ONLY',publicAddress:NEON_REAL_IDENTITY.solana.primary,checkedAt:new Date().toISOString(),solanaBalanceLamports:null,solanaBalanceStatus:'UNAVAILABLE',bitcoinAddress:NEON_REAL_IDENTITY.bitcoin.primary,bitcoinSatoshis:null,bitcoinBalanceStatus:'UNAVAILABLE'};
  // The public RPC endpoint accepts JSON-RPC POST; fetch JSON helper is GET-only, so issue separately.
  try{
    const ctl=new AbortController(); const timer=setTimeout(()=>ctl.abort(),4500);
    const r=await fetch('https://api.mainnet-beta.solana.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'getBalance',params:[NEON_REAL_IDENTITY.solana.primary,{commitment:'confirmed'}]}),cache:'no-store',signal:ctl.signal});
    clearTimeout(timer);
    if(r.ok){const d=await r.json();const v=d?.result?.value;if(Number.isFinite(v)){out.solanaBalanceLamports=Number(v);out.solanaBalanceStatus='VERIFIED';}}
  }catch(_){ }
  try{
    const d=await neonFetchJSON(`https://mempool.space/api/address/${encodeURIComponent(NEON_REAL_IDENTITY.bitcoin.primary)}`);
    const st=d?.chain_stats||{}; const value=Number(st.funded_txo_sum||0)-Number(st.spent_txo_sum||0);
    if(Number.isFinite(value)){out.bitcoinSatoshis=value;out.bitcoinBalanceStatus='VERIFIED';}
  }catch(_){ }
  out.ok=out.solanaBalanceStatus==='VERIFIED'||out.bitcoinBalanceStatus==='VERIFIED';
  return out;
}
async function neonSolanaBridgeHealth(){
  const url=neonBridgeUrl('health');
  if(!url){
    const data={ok:false,status:'OBSERVABLE',mode:'READ_ONLY',reason:'PUBLIC_HOST_NO_LOCAL_BRIDGE',network:'mainnet-beta',signer:'PUBLIC_READ_ONLY',publicAddress:NEON_REAL_IDENTITY.solana.primary,checkedAt:new Date().toISOString()};
    window.__neonSolanaBridgeHealth=data;window.dispatchEvent(new CustomEvent('neon:bridge-health',{detail:data}));return data;
  }
  try{const data=await neonFetchJSON(url);window.__neonSolanaBridgeHealth=data;window.dispatchEvent(new CustomEvent('neon:bridge-health',{detail:data}));return data;}
  catch(_){const data={ok:false,status:'OFFLINE',mode:'READ_ONLY',reason:'BRIDGE_UNAVAILABLE',checkedAt:new Date().toISOString()};window.__neonSolanaBridgeHealth=data;window.dispatchEvent(new CustomEvent('neon:bridge-health',{detail:data}));return data;}
}
window.neonSolanaBridgeHealth=neonSolanaBridgeHealth;
async function neonBridgeTelemetry(){
  const url=neonBridgeUrl('telemetry');
  if(url){
    try{const data=await neonFetchJSON(url);window.__neonBridgeTelemetry=data;window.__neonSolanaBridgeHealth=data;window.dispatchEvent(new CustomEvent('neon:bridge-health',{detail:data}));return data;}catch(_){ }
  }
  const data=await neonPublicTelemetry();
  window.__neonBridgeTelemetry=data;window.__neonSolanaBridgeHealth=data;window.dispatchEvent(new CustomEvent('neon:bridge-health',{detail:data}));return data;
}
window.neonBridgeTelemetry=neonBridgeTelemetry;
neonBridgeTelemetry().catch(()=>{});
setInterval(()=>neonBridgeTelemetry().catch(()=>{}),30000);

const $$=s=>[...document.querySelectorAll(s)];
const stations=[
 ['LOS40','40','Éxitos · Pop','#ff315d','https://play.los40.com/'],['LOS40 Classic','40C','Clásicos','#ff5b35','https://play.los40.com/'],['LOS40 Dance','40D','Dance · Electrónica','#b74cff','https://play.los40.com/'],['LOS40 Urban','40U','Urban · Hits','#ff3ba7','https://play.los40.com/'],['Europa FM','EF','Pop · Rock','#7b5cff','https://www.europafm.com/'],['KISS FM','KISS','Pop · Rock','#ff4d8d','https://www.kissfm.es/'],['Radiolé','RL','Española','#ff9d28','https://www.radiole.com/'],['Rock FM','RF','Rock · Clásicos','#e33b4e','https://www.rockfm.fm/'],['Radio MARCA','RM','Deporte · Directo','#e52435','https://www.marca.com/radio.html'],['COPE Deportes','COPE','Deportes · Directo','#50a7ff','https://www.cope.es/'],['RAC1','R1','Actualidad · Deporte','#ffcc31','https://www.rac1.cat/'],['RNE','RNE','Radio Nacional','#49d7ff','https://www.rtve.es/radio/']
];
const themes=[['neon-dark','NEON DARK','Negro + morado'],['cyber-blue','CYBER BLUE','Tecnología futurista'],['fire-red','FIRE RED','Pasión y poder'],['toxic-green','TOXIC GREEN','Energía extrema'],['gold-elite','GOLD ELITE','Premium oscuro'],['ice-white','ICE WHITE','Pureza digital'],['ocean-teal','OCEAN TEAL','Fluidez total'],['violet-nebula','VIOLET NEBULA','Espacio infinito'],['matte-black','MATTE BLACK','Elegancia total'],['neon-orange','NEON ORANGE','Vibra al máximo'],['rainbow-tech','RAINBOW TECH','Sin límites'],['midnight-crimson','MIDNIGHT CRIMSON','Noche intensa']];
const streams={
  0:'https://playerservices.streamtheworld.com/api/livestream-redirect/Los40.mp3',
  1:'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CLASSIC.mp3',
  2:'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_DANCE.mp3',
  3:'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_URBAN.mp3',
  4:'https://one.cloudstreaming.eu/proxy/europa/stream',
  5:'https://kissfm.kissfmradio.cires21.com/kissfm.mp3',
  6:'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOLE.mp3',
  7:'https://rockfm-cope-rrcast.flumotion.com/cope/rockfm-low.mp3',
  8:'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOMARCA_NACIONAL.mp3',
  9:'https://flucast09-h-cloud.flumotion.com/cope/net1.mp3',
  10:'https://playerservices.streamtheworld.com/api/livestream-redirect/RAC_1.mp3',
  11:'https://dispatcher.rndfnk.com/crtve/rne1/mad/mp3/high'
};
const audio=$('#radioAudio');let active=0,cart=[];
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(t){const e=$('#toast');if(!e)return;e.textContent=t;e.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.classList.remove('show'),2600)}
function renderThemes(){const g=$('#themeGrid');if(!g)return;g.innerHTML=themes.map((t,i)=>`<article class="theme-card ${t[0]===localStorage.neonTheme?'selected':''}" data-theme="${t[0]}" data-index="${i}" style="--tc:var(--accent)"><div class="theme-orb"></div><h3>${t[1]}</h3><p>${t[2]}</p></article>`).join('');$$('.theme-card').forEach(c=>c.onclick=()=>applyTheme(c.dataset.theme));updateThemeButton()}
function applyTheme(name){document.body.dataset.theme=name;localStorage.neonTheme=name;$$('.theme-card').forEach(x=>x.classList.toggle('selected',x.dataset.theme===name));updateThemeButton();toast('Tema '+(themes.find(t=>t[0]===name)?.[1]||name)+' activado')}
function updateThemeButton(){const b=$('#themeCycle');if(!b)return;const i=Math.max(0,themes.findIndex(t=>t[0]===document.body.dataset.theme));b.dataset.themeIndex=i;b.querySelector('span').textContent=themes[i]?.[1]||'TEMA'}
function cycleTheme(){const i=Math.max(0,themes.findIndex(t=>t[0]===document.body.dataset.theme));applyTheme(themes[(i+1)%themes.length][0])}
const streamCandidates={
  0:['https://playerservices.streamtheworld.com/api/livestream-redirect/Los40.mp3'],
  1:['https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CLASSIC.mp3'],
  2:['https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_DANCE.mp3'],
  3:['https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_URBAN.mp3'],
  4:['https://one.cloudstreaming.eu/proxy/europa/stream'],
  5:['https://kissfm.kissfmradio.cires21.com/kissfm.mp3'],
  6:['https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOLE.mp3'],
  7:['https://rockfm-cope-rrcast.flumotion.com/cope/rockfm-low.mp3'],
  8:['https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOMARCA_NACIONAL.mp3'],
  9:['https://flucast09-h-cloud.flumotion.com/cope/net1.mp3'],
  10:['https://playerservices.streamtheworld.com/api/livestream-redirect/RAC_1.mp3'],
  11:['https://dispatcher.rndfnk.com/crtve/rne1/mad/mp3/high']
};
let radioRetryTimer=null,radioRequest=0,radioFailCount=0,radioFilter='all',radioOnlineRetry=null;
const radioCategories=['pop','classic','dance','urban','pop','rock','pop','rock','sport','sport','sport','general'];
const radioSearchNames=['LOS40','LOS40 Classic','LOS40 Dance','LOS40 Urban','Europa FM','KISS FM','Radiolé','Rock FM','Radio MARCA','COPE Deportes','RAC1','RNE'];
function radioStageClass(kind){const el=$('.radio-stage');if(!el)return;el.classList.remove('signal-live','signal-loading','signal-error');if(kind)el.classList.add('signal-'+kind)}
function setRadioStatus(text,kind='loading'){const rs=$('#radioStatus');if(rs)rs.textContent='● '+text;radioStageClass(kind);const pill=$('#radioNetworkPill');if(pill){pill.classList.toggle('offline',kind==='error');}const st=$('#radioNetworkState');if(st)st.textContent=kind==='live'?'SEÑAL ACTIVA':kind==='error'?'SEÑAL INESTABLE':'BUSCANDO SEÑAL'}
function stationStateHTML(i){const state=i===active&&audio&&!audio.paused&&!audio.error?'EN DIRECTO':i===active&&radioFailCount?'RECUPERANDO':'LISTA';const cls=state==='EN DIRECTO'?'live':state==='RECUPERANDO'?'loading':'';return `<small class="station-state ${cls}" data-station-state="${i}">${state}</small>`}
function filteredStations(){return stations.map((r,i)=>({r,i})).filter(({i})=>radioFilter==='all'||radioCategories[i]===radioFilter)}
function renderStations(){
  const g=$('#radioGrid');if(!g)return;
  const list=filteredStations();
  g.innerHTML=list.map(({r,i})=>`<article class="radio-card ${i===active?'active':''}" data-i="${i}" style="--station:${r[3]}" tabindex="0" role="button" aria-label="${esc(r[0])}"><div class="station-logo">${esc(r[1])}</div><div><b>${esc(r[0])}</b><small>${esc(r[2])}</small>${stationStateHTML(i)}</div><span class="listen">${i===active&&!audio.paused?'Ⅱ':'▶'}</span></article>`).join('');
  $$('.radio-card').forEach(c=>{c.onclick=()=>playStation(+c.dataset.i);c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();playStation(+c.dataset.i)}}});
  const count=$('#radioGridCount');if(count)count.textContent=`${list.length} ${list.length===1?'EMISORA':'EMISORAS'}`;
}
function refreshStationStates(){
  $$('.radio-card').forEach(c=>{const i=+c.dataset.i,st=c.querySelector('[data-station-state]'),btn=c.querySelector('.listen');if(st){const live=i===active&&audio&&!audio.paused&&!audio.error;st.textContent=live?'EN DIRECTO':i===active&&radioFailCount?'RECUPERANDO':'LISTA';st.className='station-state '+(live?'live':i===active&&radioFailCount?'loading':'')}if(btn)btn.textContent=i===active&&!audio.paused?'Ⅱ':'▶';c.classList.toggle('active',i===active)});
}
function makeWave(){const w=$('#wave');if(w)w.innerHTML=Array.from({length:11},()=>'<i></i>').join('')}
async function discoverRadioStream(i){
  try{
    const q=encodeURIComponent(radioSearchNames[i]||stations[i][0]);
    const endpoints=[`https://all.api.radio-browser.info/json/stations/search?name=${q}&limit=10&hidebroken=true&order=votes&reverse=true`,`https://de1.api.radio-browser.info/json/stations/search?name=${q}&limit=10&hidebroken=true&order=votes&reverse=true`];
    for(const endpoint of endpoints){
      const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),6500);
      try{const res=await fetch(endpoint,{signal:ctl.signal,headers:{Accept:'application/json'}});clearTimeout(timer);if(!res.ok)continue;const data=await res.json();const item=data.find(x=>x.url_resolved||x.url);const url=item?.url_resolved||item?.url;if(url)return url}catch(e){clearTimeout(timer)}
    }
  }catch(e){}
  return null;
}
async function playStation(i,attempt=0){
  if(!stations[i]||!audio)return;
  active=i;const req=++radioRequest,r=stations[i];radioFailCount=attempt;
  $$('.radio-card').forEach(c=>c.classList.toggle('active',+c.dataset.i===i));
  const rn=$('#radioName'),rg=$('#radioGenre'),sl=$('#stageLogo'),rw=$('#radioWeb');
  if(rn)rn.textContent=r[0];if(rg)rg.textContent=r[2]+' · reproducción integrada';
  if(sl){sl.textContent=r[1];sl.style.color=r[3];}if(rw)rw.href=r[4];
  setRadioStatus(attempt?'REINTENTANDO':'CONECTANDO','loading');refreshStationStates();
  clearTimeout(radioRetryTimer);audio.pause();audio.removeAttribute('src');audio.load();
  let candidates=streamCandidates[i]||[];
  if(!candidates.length){const discovered=await discoverRadioStream(i);if(req!==radioRequest)return;if(discovered){streamCandidates[i]=[discovered];candidates=streamCandidates[i]}}
  if(!candidates.length){setRadioStatus('SIN STREAM','error');toast(r[0]+' · no hay señal directa disponible ahora.');refreshStationStates();return}
  const url=candidates[attempt%candidates.length];audio.src=url;audio.load();
  try{
    await Promise.race([audio.play(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),9000))]);
    if(req!==radioRequest)return;radioFailCount=0;setRadioStatus('EN DIRECTO','live');const hint=$('#radioGridHint');if(hint)hint.textContent=`${r[0]} · señal activa`;toast(r[0]+' · reproduciendo');refreshStationStates();
  }catch(e){
    if(req!==radioRequest)return;radioFailCount=attempt+1;setRadioStatus('RECUPERANDO','loading');refreshStationStates();
    if(attempt<Math.min(3,Math.max(1,candidates.length-1))){radioRetryTimer=setTimeout(()=>playStation(i,attempt+1),800);return}
    const discovered=await discoverRadioStream(i);
    if(req!==radioRequest)return;
    if(discovered&&!candidates.includes(discovered)){streamCandidates[i].push(discovered);radioRetryTimer=setTimeout(()=>playStation(i,0),600);return}
    setRadioStatus('STREAM NO DISPONIBLE','error');toast(r[0]+' · señal no disponible; puedes reintentar.');refreshStationStates();
  }
}
if(audio){
  audio.addEventListener('playing',()=>{setRadioStatus('EN DIRECTO','live');radioFailCount=0;refreshStationStates();});
  audio.addEventListener('playing',()=>window.__neonOrbLife?.event?.('play'));
  audio.addEventListener('pause',()=>{if(active>=0){const live=document.visibilityState!=='hidden';if(live)refreshStationStates()}});
  audio.addEventListener('waiting',()=>{setRadioStatus('CARGANDO','loading');refreshStationStates()});
  audio.addEventListener('stalled',()=>{setRadioStatus('RECUPERANDO','loading');refreshStationStates()});
  audio.addEventListener('error',()=>{if(!stations[active])return;radioFailCount++;setRadioStatus('RECUPERANDO','loading');clearTimeout(radioRetryTimer);radioRetryTimer=setTimeout(()=>playStation(active,Math.min(radioFailCount,4)),900);refreshStationStates()});
}
window.addEventListener('online',()=>{const s=$('#radioNetworkState');if(s)s.textContent='RED RECUPERADA';clearTimeout(radioOnlineRetry);if(stations[active]&&audio&&(audio.paused||audio.error))radioOnlineRetry=setTimeout(()=>playStation(active,0),1200)});
window.addEventListener('offline',()=>{setRadioStatus('SIN INTERNET','error');clearTimeout(radioRetryTimer);const h=$('#radioGridHint');if(h)h.textContent='Sin conexión · la radio se recuperará automáticamente al volver internet.';refreshStationStates()});
$('#radioRefresh')?.addEventListener('click',()=>{clearTimeout(radioRetryTimer);playStation(active,0)});
$$('.radio-filter').forEach(b=>b.addEventListener('click',()=>{radioFilter=b.dataset.filter;$$('.radio-filter').forEach(x=>x.classList.toggle('active',x===b));renderStations()}));
const radioGrid=$('#radioGrid');radioGrid?.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&radioGrid.scrollHeight>radioGrid.clientHeight){e.preventDefault();radioGrid.scrollTop+=e.deltaY}},{passive:false});
window.addEventListener('keydown',e=>{if(!$('#radio')?.matches(':hover'))return;if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();const list=filteredStations(),pos=Math.max(0,list.findIndex(x=>x.i===active)),next=list[(pos+1)%list.length];if(next)playStation(next.i)}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();const list=filteredStations(),pos=Math.max(0,list.findIndex(x=>x.i===active)),prev=list[(pos-1+list.length)%list.length];if(prev)playStation(prev.i)}});
function renderCart(){const count=cart.reduce((a,x)=>a+x.qty,0),total=cart.reduce((a,x)=>a+x.qty*x.price,0);const cc=$('#cartCount'),ct=$('#cartTotal'),ci=$('#cartItems');if(cc)cc.textContent=count;if(ct)ct.textContent=total.toFixed(2).replace('.',',')+' €';if(ci)ci.innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-line"><span>${esc(x.name)} × ${x.qty}</span><b>${(x.qty*x.price).toFixed(2).replace('.',',')} €</b></div>`).join(''):'<p>Tu carrito está vacío.</p>'}
$$('.add').forEach(b=>b.onclick=()=>{const n=b.dataset.product,p=+b.dataset.price;const x=cart.find(x=>x.name===n);x?x.qty++:cart.push({name:n,price:p,qty:1});renderCart();toast('Producto añadido al carrito')});
$('#whatsapp')?.addEventListener('click',()=>{if(!cart.length)return toast('Añade un producto antes de enviar el pedido');const name=$('#customerName')?.value||'Cliente';const phone=$('#customerPhone')?.value||'No indicado';const addr=$('#customerAddress')?.value||'Recogida Renfe Azuqueca';const date=$('#deliveryDate')?.value||'A confirmar';const total=cart.reduce((a,x)=>a+x.qty*x.price,0).toFixed(2);const text=`¡Hola! Me gustaría confirmar la disponibilidad de mi pedido.%0A%0A👤 *Nombre:* ${encodeURIComponent(name)}%0A🥟 *Cantidad:* ${cart.reduce((a,x)=>a+x.qty,0)}%0A💶 *Total:* ${total} €%0A📦 *Entrega:* ${encodeURIComponent(addr)}%0A📅 *Fecha:* ${encodeURIComponent(date)}%0A📱 *Teléfono:* ${encodeURIComponent(phone)}`;window.open('https://wa.me/34602487576?text='+text,'_blank')});
$('#radioPlay')?.addEventListener('click',()=>{if(!audio)return;if(!audio.src||audio.src.endsWith('/'))return playStation(active);audio.paused?audio.play():audio.pause()});
const rv=$('#radioVolume');if(rv)rv.oninput=e=>{if(audio)audio.volume=e.target.value};
function clock(){const d=new Date();const cl=$('#clock'),dt=$('#date');if(cl)cl.textContent=d.toLocaleTimeString('es-ES');if(dt)dt.textContent=d.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'})}setInterval(clock,1000);clock();
let v=+(localStorage.neonVisits||0)+1;localStorage.neonVisits=v;const vi=$('#visits');if(vi)vi.textContent=String(v).padStart(6,'0');
const saved=localStorage.neonTheme||'neon-dark';document.body.dataset.theme=saved;renderThemes();renderStations();makeWave();if(audio)audio.volume=.8;
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')),{threshold:.08});$$('.reveal').forEach(e=>io.observe(e));
const mt=$('#menuToggle');if(mt)mt.onclick=()=>$('#nav')?.classList.toggle('open');$$('.nav-link').forEach(a=>a.onclick=()=>$('#nav')?.classList.remove('open'));
$$('.nav-link').forEach(a=>a.addEventListener('click',()=>$$('.nav-link').forEach(x=>x.classList.toggle('active',x===a))));

// MEDIA DOCK
const filePicker=$('#filePicker'),dropzone=$('#dropzone'),fileQueue=$('#fileQueue'),dockNow=$('#dockNow'),dockMeta=$('#dockMeta'),dockCover=$('#dockCover'),clearFiles=$('#clearFiles');
let localFiles=[],localObjectUrl='';
function renderFileQueue(){if(!fileQueue)return;fileQueue.innerHTML=localFiles.map((f,i)=>`<button class="local-file ${i===0?'active':''}" data-file="${i}" type="button"><span>${f.type.startsWith('video')?'▣':f.type.startsWith('image')?'▧':'♫'}</span><b>${esc(f.name)}</b><small>${Math.round(f.size/1024)} KB</small></button>`).join('');$$('.local-file').forEach(b=>b.onclick=()=>playLocal(+b.dataset.file))}
function addLocalFiles(list){[...list].filter(f=>f.type.startsWith('audio/')||f.type.startsWith('video/')||f.type.startsWith('image/')).forEach(f=>localFiles.push(f));renderFileQueue();if(localFiles.length)playLocal(localFiles.length-1);toast(localFiles.length+' archivo(s) en Media Dock')}
function playLocal(i){const f=localFiles[i];if(!f)return;if(localObjectUrl)URL.revokeObjectURL(localObjectUrl);localObjectUrl=URL.createObjectURL(f);const player=document.querySelector('.media-player');if(f.type.startsWith('image/')){if(dockCover)dockCover.innerHTML=`<img src="${localObjectUrl}" alt="">`;if(dockNow)dockNow.textContent=f.name;if(dockMeta)dockMeta.textContent='Imagen local · disponible en el dock';return}if(dockNow)dockNow.textContent=f.name;if(dockMeta)dockMeta.textContent=(f.type.startsWith('video/')?'Vídeo local':'Audio local')+' · reproducción instantánea';if(dockCover)dockCover.innerHTML=f.type.startsWith('video/')?'<span class="dock-video">▶</span>':'<span class="dock-note">♫</span>';let media=document.querySelector('#localMedia');if(!media){media=document.createElement(f.type.startsWith('video/')?'video':'audio');media.id='localMedia';media.controls=true;media.preload='metadata';media.className='local-media';player?.appendChild(media)}media.src=localObjectUrl;media.style.display='block';media.play().catch(()=>{});activityLocal()}
function activityLocal(){localStorage.neonLocalPlays=+(localStorage.neonLocalPlays||0)+1}
filePicker?.addEventListener('change',e=>addLocalFiles(e.target.files));dropzone?.addEventListener('dragover',e=>{e.preventDefault();dropzone.classList.add('dragover')});dropzone?.addEventListener('dragleave',()=>dropzone.classList.remove('dragover'));dropzone?.addEventListener('drop',e=>{e.preventDefault();dropzone.classList.remove('dragover');addLocalFiles(e.dataTransfer.files)});$('#pickFiles')?.addEventListener('click',e=>{e.preventDefault();filePicker.click()});clearFiles?.addEventListener('click',()=>{localFiles=[];if(fileQueue)fileQueue.innerHTML='';if(dockNow)dockNow.textContent='Sin archivo seleccionado';if(dockMeta)dockMeta.textContent='Arrastra archivos para reproducirlos aquí.';if(localObjectUrl){URL.revokeObjectURL(localObjectUrl);localObjectUrl=''};const m=$('#localMedia');if(m)m.remove();toast('Media Dock limpiado')});
$('#themeCycle')?.addEventListener('click',cycleTheme);

// MAIN MEDIA PLAYER LAB
const mainAudio=$('#mainAudio');let mainVideo=$('#mainVideo');const mainPicker=$('#mainFilePicker'),mainDrop=$('#mainDropzone'),mainQueue=$('#mainQueue');
let mainFiles=[],mainIndex=-1,mainObjectUrl='';
function fmtTime(sec){if(!Number.isFinite(sec))return '00:00';const m=Math.floor(sec/60),s=Math.floor(sec%60);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function renderMainQueue(){if(!mainQueue)return;const mqc=$('#mainQueueCount');if(mqc)mqc.textContent=mainFiles.length;mainQueue.innerHTML=mainFiles.length?mainFiles.map((f,i)=>`<button class="main-queue-item ${i===mainIndex?'active':''}" data-main-file="${i}" type="button"><span class="q-type">${f.type.startsWith('video')?'VID':'AUD'}</span><span><b>${esc(f.name)}</b><small>${Math.max(1,Math.round(f.size/1024))} KB</small></span><span>›</span></button>`).join(''):'<p>Aún no has añadido archivos.</p>';$$('.main-queue-item').forEach(b=>b.onclick=()=>loadMainFile(+b.dataset.mainFile,true))}
function resetMainMedia(){[mainAudio,mainVideo].forEach(m=>{if(m){m.pause();m.removeAttribute('src');m.load();m.style.display='none'}});$('.pro-player')?.classList.remove('video-mode','playing');if(mainObjectUrl){URL.revokeObjectURL(mainObjectUrl);mainObjectUrl=''}}
function loadMainFile(i,auto=true){const f=mainFiles[i];if(!f)return;mainIndex=i;resetMainMedia();mainObjectUrl=URL.createObjectURL(f);const isVideo=f.type.startsWith('video/'),m=isVideo?mainVideo:mainAudio;if(m){m.src=mainObjectUrl;m.style.display='block';}$('.pro-player')?.classList.toggle('video-mode',isVideo);const mn=$('#mainNow'),mm=$('#mainMeta'),mc=$('#mainCover');if(mn)mn.textContent=f.name;if(mm)mm.textContent=(isVideo?'Vídeo local':'Audio local')+' · listo para probar';if(mc)mc.innerHTML=isVideo?'<video id="mainVideo" preload="metadata" playsinline></video>':'<img src="icon-192.png" alt="NEON PLAYER X">';if(isVideo){mainVideo=$('#mainVideo');if(mainVideo){mainVideo.src=mainObjectUrl;mainVideo.muted=false;mainVideo.volume=+($('#mainVolume')?.value||1);mainVideo.playbackRate=+($('#mainSpeed')?.value||1)}}else if(mainAudio){mainAudio.volume=+($('#mainVolume')?.value||1);mainAudio.playbackRate=+($('#mainSpeed')?.value||1)}bindMainEvents();renderMainQueue();if(auto&&m)m.play().then(()=>$('.pro-player')?.classList.add('playing')).catch(()=>{});}
function bindMainEvents(){[mainAudio,mainVideo].forEach(m=>{if(!m)return;m.onloadedmetadata=()=>{$('#mainDuration').textContent=fmtTime(m.duration)};m.ontimeupdate=()=>{if(m.duration){const ms=$('#mainSeek'),mc=$('#mainCurrent');if(ms)ms.value=(m.currentTime/m.duration)*100;if(mc)mc.textContent=fmtTime(m.currentTime)}};m.onplay=()=>{$('.pro-player')?.classList.add('playing');const mp=$('#mainPlay');if(mp)mp.textContent='❚❚'};m.onpause=()=>{$('.pro-player')?.classList.remove('playing');const mp=$('#mainPlay');if(mp)mp.textContent='▶'};m.onended=()=>nextMain()})}
function currentMain(){return mainFiles[mainIndex]?($('.pro-player')?.classList.contains('video-mode')?mainVideo:mainAudio):null}
function nextMain(){if(!mainFiles.length)return;let n=$('#mainShuffle')?.classList.contains('active')?Math.floor(Math.random()*mainFiles.length):(mainIndex+1)%mainFiles.length;loadMainFile(n,true)}
function prevMain(){if(!mainFiles.length)return;const m=currentMain();if(m&&m.currentTime>4){m.currentTime=0;return}loadMainFile((mainIndex-1+mainFiles.length)%mainFiles.length,true)}
function addMainFiles(files){const valid=[...files].filter(f=>f.type.startsWith('audio/')||f.type.startsWith('video/'));if(!valid.length)return toast('Selecciona archivos de audio o vídeo');mainFiles.push(...valid);renderMainQueue();loadMainFile(mainFiles.length-valid.length,true);toast(valid.length+' archivo(s) añadido(s) al Media Player')}
mainPicker?.addEventListener('change',e=>{addMainFiles(e.target.files);e.target.value=''});mainDrop?.addEventListener('dragover',e=>{e.preventDefault();mainDrop.classList.add('dragover')});mainDrop?.addEventListener('dragleave',()=>mainDrop.classList.remove('dragover'));mainDrop?.addEventListener('drop',e=>{e.preventDefault();mainDrop.classList.remove('dragover');addMainFiles(e.dataTransfer.files)});$('#mainPickFiles')?.addEventListener('click',()=>mainPicker.click());
$('#mainPlay')?.addEventListener('click',()=>{const m=currentMain();if(!m){if(mainFiles.length)loadMainFile(0,true);else toast('Añade música o vídeo para probar el reproductor');return}m.paused?m.play().catch(()=>{}):m.pause()});$('#mainNext')?.addEventListener('click',nextMain);$('#mainPrev')?.addEventListener('click',prevMain);$('#mainShuffle')?.addEventListener('click',e=>e.currentTarget.classList.toggle('active'));$('#mainLoop')?.addEventListener('click',e=>{e.currentTarget.classList.toggle('active');const m=currentMain();if(m)m.loop=e.currentTarget.classList.contains('active')});$('#mainSeek')?.addEventListener('input',e=>{const m=currentMain();if(m&&m.duration)m.currentTime=(+e.target.value/100)*m.duration});$('#mainVolume')?.addEventListener('input',e=>{[mainAudio,mainVideo].forEach(m=>{if(m)m.volume=+e.target.value})});$('#mainSpeed')?.addEventListener('change',e=>{[mainAudio,mainVideo].forEach(m=>{if(m)m.playbackRate=+e.target.value})});$('#mainFullscreen')?.addEventListener('click',()=>{const m=currentMain();if(m&&m.requestFullscreen)m.requestFullscreen().catch(()=>{})});$('#mainClearQueue')?.addEventListener('click',()=>{mainFiles=[];mainIndex=-1;resetMainMedia();if($('#mainNow'))$('#mainNow').textContent='NEON PLAYER X';if($('#mainMeta'))$('#mainMeta').textContent='Añade un archivo para comenzar la prueba · audio y vídeo locales';if($('#mainCurrent'))$('#mainCurrent').textContent='00:00';if($('#mainDuration'))$('#mainDuration').textContent='00:00';if($('#mainSeek'))$('#mainSeek').value=0;renderMainQueue();toast('Lista de prueba limpiada')});
bindMainEvents();renderMainQueue();

// EQUALIZER & STUDIO
(()=>{
 const radio=audio, mainA=$('#mainAudio'), mainV=$('#mainVideo');
 const rCanvas=$('#radioEqCanvas'), sCanvas=$('#studioCanvas'), orb=$('#neonMascot');
 const rCtx=rCanvas?.getContext('2d'), sCtx=sCanvas?.getContext('2d'), oCtx=orb?.getContext('2d');
 let rAC=null,rAnalyser=null,rSource=null,sAC=null,sAnalyser=null,sSource=null;
 let studioBands=[0,0,0], studioPreamp=1, studioGlow=1, eqBands=[0,0,0,0,0];
 function fit(c,ctx){if(!c||!ctx)return;const d=Math.max(1,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;c.width=w*d;c.height=h*d;ctx.setTransform(d,0,0,d,0,0);return [w,h]}
 function analyserFor(el,type){if(!el)return null;try{let ac=type==='radio'?rAC:sAC;if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();if(type==='radio')rAC=ac;else sAC=ac}let an=type==='radio'?rAnalyser:sAnalyser;let source=type==='radio'?rSource:sSource;if(!an){an=ac.createAnalyser();an.fftSize=128;an.smoothingTimeConstant=.82;source=ac.createMediaElementSource(el);const bands=type==='radio'?[60,230,910,3600,14000]:[140,1000,7000];const filters=bands.map((freq,idx)=>{const f=ac.createBiquadFilter();f.type=idx===0?'lowshelf':idx===bands.length-1?'highshelf':'peaking';f.frequency.value=freq;f.Q.value=(idx===0||idx===bands.length-1)?0.7:1.05;f.gain.value=0;return f});source.connect(filters[0]);for(let i=0;i<filters.length-1;i++)filters[i].connect(filters[i+1]);filters[filters.length-1].connect(an);an.connect(ac.destination);if(type==='radio'){rAnalyser=an;rSource=source;window.__neonRadioFilters=filters}else{sAnalyser=an;sSource=source;window.__neonStudioFilters=filters}}if(ac.state==='suspended')ac.resume();return an}catch(e){if(type==='radio')window.__neonRadioAudioBlocked=true;return null}}
 function activeMain(){return mainA&&!mainA.paused&&!mainA.ended?mainA:mainV&&!mainV.paused&&!mainV.ended?mainV:null}
 function drawEQ(){if(!rCtx)return;const [w,h]=fit(rCanvas,rCtx)||[300,190],an=analyserFor(radio,'radio');rCtx.clearRect(0,0,w,h);rCtx.fillStyle='rgba(2,1,7,.45)';rCtx.fillRect(0,0,w,h);let data=new Uint8Array(an?an.frequencyBinCount:64);if(an)an.getByteFrequencyData(data);const n=data.length,bars=Math.min(44,n),bw=w/bars;for(let i=0;i<bars;i++){let v=an?data[Math.floor(i*n/bars)]/255:(.16+.09*Math.sin(performance.now()/240+i));v=Math.max(.04,v);const bh=v*(h-25);const g=rCtx.createLinearGradient(0,h,0,h-bh);g.addColorStop(0,'#8a35ff');g.addColorStop(.55,'#d946ef');g.addColorStop(1,'#65ffb0');rCtx.fillStyle=g;rCtx.shadowBlur=12;rCtx.shadowColor='#a844ff';rCtx.fillRect(i*bw+1,h-bh,bw*.72,bh)}rCtx.shadowBlur=0;requestAnimationFrame(drawEQ)}
 function drawStudio(){if(!sCtx)return;const [w,h]=fit(sCanvas,sCtx)||[500,190],m=activeMain(),an=m?analyserFor(m,'studio'):null;sCtx.clearRect(0,0,w,h);sCtx.fillStyle='rgba(2,1,7,.5)';sCtx.fillRect(0,0,w,h);let data=new Uint8Array(an?an.fftSize:128);if(an)an.getByteTimeDomainData(data);sCtx.lineWidth=2;sCtx.beginPath();for(let x=0;x<w;x++){let idx=Math.floor(x/w*data.length),v=an?(data[idx]-128)/128:(.03*Math.sin(x/18+performance.now()/330));let y=h/2+v*h*.85*(studioPreamp);x? sCtx.lineTo(x,y):sCtx.moveTo(x,y)}sCtx.strokeStyle='#9f48ff';sCtx.shadowBlur=18;sCtx.shadowColor='#9f48ff';sCtx.stroke();sCtx.shadowBlur=0;for(let i=0;i<24;i++){let x=i*w/24,y=h-15-(Math.abs(Math.sin(i*.8+performance.now()/500))*(20+studioBands[i%3]*2));sCtx.fillStyle=i%3===0?'#65ffb0':'#b64cff';sCtx.globalAlpha=.18; sCtx.fillRect(x,y,3,8)}sCtx.globalAlpha=1;$('#studioState')?.replaceChildren(document.createTextNode(m?'ANALIZANDO':'ESPERA'));requestAnimationFrame(drawStudio)}
 function setupAudio(el,type){if(!el)return;['play','playing'].forEach(ev=>el.addEventListener(ev,()=>{const an=analyserFor(el,type);an?.context.resume?.();if(type==='radio')$('#radioEqState')?.replaceChildren(document.createTextNode('EN DIRECTO'))}));el.addEventListener('pause',()=>{if(type==='radio')$('#radioEqState')?.replaceChildren(document.createTextNode('PAUSA'))});el.addEventListener('error',()=>{if(type==='radio')$('#radioEqState')?.replaceChildren(document.createTextNode('STREAM SIN DATOS'))})}
 setupAudio(radio,'radio');setupAudio(mainA,'studio');setupAudio(mainV,'studio');
 $$('[data-band]').forEach(i=>i.addEventListener('input',e=>{const idx=+e.target.dataset.band;eqBands[idx]=+e.target.value;const f=window.__neonRadioFilters?.[idx];if(f)f.gain.value=eqBands[idx]}));
 $('#studioPreamp')?.addEventListener('input',e=>studioPreamp=+e.target.value);$('#studioGlow')?.addEventListener('input',e=>studioGlow=+e.target.value);
 $$('[data-studio-band]').forEach(i=>i.addEventListener('input',e=>{const idx=+e.target.dataset.studioBand;studioBands[idx]=+e.target.value;const f=window.__neonStudioFilters?.[idx];if(f)f.gain.value=studioBands[idx]}));
 const presets={flat:[0,0,0],bass:[8,1,-2],voice:[-3,5,6],club:[7,2,7]};$$('[data-preset]').forEach(b=>b.onclick=()=>{studioBands=presets[b.dataset.preset].slice();$$('[data-studio-band]').forEach((x,i)=>x.value=studioBands[i]);$$('[data-preset]').forEach(x=>x.classList.toggle('active',x===b));toast('Preset '+b.dataset.preset.toUpperCase()+' activado')});
 drawEQ();drawStudio();

 let x=innerWidth*.72,y=innerHeight*.22,vx=0,vy=0,t=0,life=0,hits=0,target={x,y},trail=[];let down=null;
 const colors={calm:'#55f6ff',scared:'#ff3b91',happy:'#ffd45a',rest:'#b66cff'};
 function resizeOrb(){if(!orb)return;const d=Math.max(1,devicePixelRatio||1);orb.width=orb.clientWidth*d;orb.height=orb.clientHeight*d;oCtx.setTransform(d,0,0,d,0,0)}
 function mood(){if(Math.hypot(vx,vy)>4)return colors.scared;if(Math.abs(vx)+Math.abs(vy)<.25)return colors.rest;if(life>90)return colors.happy;return colors.calm}
 function pick(){target={x:18+Math.random()*(innerWidth-36),y:18+Math.random()*(innerHeight-36)}}
 function orbFrame(now){if(!orb||!oCtx)return;const dt=Math.min(.035,(now-t||16)/1000);t=now;life+=dt; if(Math.random()<.008)pick();let ax=(target.x-x)*.18,ay=(target.y-y)*.18;vx+=ax*dt;vy+=ay*dt;vx*=.992;vy*=.992;x+=vx; y+=vy; const r=orb.clientWidth/2;x=Math.max(r,Math.min(innerWidth-r,x));y=Math.max(r,Math.min(innerHeight-r,y));if(x<=r||x>=innerWidth-r)vx*=-.65;if(y<=r||y>=innerHeight-r)vy*=-.65;trail.push({x,y,a:1});const max=18+Math.min(42,Math.floor(life/25));if(trail.length>max)trail.splice(0,trail.length-max);oCtx.clearRect(0,0,orb.clientWidth,orb.clientHeight);const c=mood();trail.forEach((p,i)=>{const a=(i/trail.length)*.32;oCtx.globalAlpha=a;oCtx.fillStyle=c;oCtx.beginPath();oCtx.arc(p.x-x+orb.clientWidth/2,p.y-y+orb.clientHeight/2,1.2+(i/trail.length)*2,0,Math.PI*2);oCtx.fill()});oCtx.globalAlpha=1;const g=oCtx.createRadialGradient(19,19,1,19,19,18);g.addColorStop(0,'#fff');g.addColorStop(.18,c);g.addColorStop(.5,c);g.addColorStop(1,'transparent');oCtx.fillStyle=g;oCtx.shadowBlur=15+studioGlow*5;oCtx.shadowColor=c;oCtx.beginPath();oCtx.arc(19,19,11+Math.sin(now/230)*1.2,0,Math.PI*2);oCtx.fill();oCtx.shadowBlur=0;if(life>75){for(let i=0;i<3;i++){const a=now/900+i*2.1;oCtx.fillStyle=c;oCtx.beginPath();oCtx.arc(19+Math.cos(a)*14,19+Math.sin(a)*14,1.2,0,Math.PI*2);oCtx.fill()}}const ap=window.__neonOrbAutonomousPosition;const px=ap?.x??x,py=ap?.y??y;orb.style.transform=`translate3d(${px-19}px,${py-19}px,0) scale(${Math.hypot(vx,vy)>5?.72:1})`;requestAnimationFrame(orbFrame)}
 orb?.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,time:performance.now()};orb.setPointerCapture?.(e.pointerId)});orb?.addEventListener('pointerup',e=>{if(!down)return;const dt=Math.max(16,performance.now()-down.time),dx=e.clientX-down.x,dy=e.clientY-down.y,impact=Math.hypot(dx,dy)/dt;hits++;window.__neonOrbLife?.event?.('interaction');window.__neonOrbHitHook?.();if(impact>.8){vx-=dx*.12;vy-=dy*.12}else{vx-=dx*.035||.6;vy-=dy*.035||-.5}target={x:x-vx*18,y:y-vy*18};trail.push({x,y,a:1});down=null});window.addEventListener('resize',resizeOrb);resizeOrb();pick();requestAnimationFrame(orbFrame);
})();

// ============================================================
// V7.6 — AUTONOMOUS LIFE / WORK / MEMORY / WILL (VALOR REAL)
// ============================================================
(()=>{
  const LIFE_KEY='neonOrbLifeV72', MIND_KEY='neonOrbMindV73', WILL_KEY='neonOrbWillV74';
  const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d}catch(e){return d}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

  class BlackHole{
    constructor(id){this.canvas=document.getElementById(id);if(!this.canvas)return;this.ctx=this.canvas.getContext('2d');this.center={x:90,y:90};this.particles=[];for(let i=0;i<64;i++)this.particles.push({r:14+Math.random()*70,a:Math.random()*Math.PI*2,s:.012+Math.random()*.038,z:.5+Math.random()*2.3});this.resize();addEventListener('resize',()=>this.resize())}
    resize(){const d=Math.max(1,devicePixelRatio||1),w=this.canvas.clientWidth||180,h=this.canvas.clientHeight||180;this.canvas.width=w*d;this.canvas.height=h*d;this.ctx.setTransform(d,0,0,d,0,0);this.center={x:w/2,y:h/2}}
    render=()=>{const c=this.ctx,w=this.canvas.clientWidth||180,h=this.canvas.clientHeight||180;c.clearRect(0,0,w,h);const g=c.createRadialGradient(this.center.x,this.center.y,4,this.center.x,this.center.y,86);g.addColorStop(0,'rgba(0,243,255,.12)');g.addColorStop(.5,'rgba(0,243,255,.035)');g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,w,h);this.particles.forEach(p=>{p.a+=p.s;p.r-=.10+.025*Math.sin(p.a*2);if(p.r<11)p.r=78+Math.random()*10;const x=this.center.x+Math.cos(p.a)*p.r,y=this.center.y+Math.sin(p.a)*p.r*.7;c.globalAlpha=Math.max(.06,Math.min(.9,p.r/82));c.fillStyle='#00f3ff';c.beginPath();c.arc(x,y,p.z,0,Math.PI*2);c.fill()});c.globalAlpha=1;c.beginPath();c.arc(this.center.x,this.center.y,15,0,Math.PI*2);c.fillStyle='#000';c.fill();c.strokeStyle='#00f3ff';c.lineWidth=1.5;c.shadowBlur=20;c.shadowColor='#00f3ff';c.stroke();c.shadowBlur=0;requestAnimationFrame(this.render)};
    getAbsoluteCenter(){const r=this.canvas.getBoundingClientRect();return{x:r.left+this.center.x,y:r.top+this.center.y}}
  }

  class MemoryEngine{
    static async fetchNetworkMemory(){
      const targets=[
        {name:'Nodo IP público',url:'https://api.ipify.org?format=json'},
        {name:'Servidor meteorológico Tokio',url:'https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true'},
        {name:'Pulso temporal UTC',url:'https://worldtimeapi.org/api/timezone/Etc/UTC'}
      ];
      const target=targets[Math.floor(Math.random()*targets.length)];
      try{const r=await fetch(target.url,{cache:'no-store'});if(!r.ok)throw Error('network');const data=await r.json();return{source:target.name,payload:JSON.stringify(data).slice(0,180),timestamp:new Date().toISOString()}}catch(e){return{source:'Red Distribuida de Nodos',payload:'Interacción procesada en el nodo local con enlace activo.',timestamp:new Date().toISOString()}}
    }
  }

  class VirtualEconomyEngine{
    static chooseJob(personality){
      const jobs=[
        {type:'MINING',name:'Procesamiento de bloque de red',asset:'NXC',base:[.0025,.012],energy:10,curiosity:1.2},
        {type:'COMPUTE',name:'Cómputo distribuido de datos',asset:'CREDITS',base:[50,160],energy:8,curiosity:1.8},
        {type:'BITS',name:'Recolección de paquetes de valor',asset:'BITS',base:[40,210],energy:6,curiosity:2.5},
        {type:'RESEARCH',name:'Análisis de nodo abierto',asset:'CREDITS',base:[25,95],energy:5,curiosity:3.0}
      ];
      const weights=jobs.map(j=>1+(personality.curiosity/100)*j.curiosity);
      let n=Math.random()*weights.reduce((a,b)=>a+b,0),job=jobs[jobs.length-1];for(let i=0;i<jobs.length;i++){n-=weights[i];if(n<=0){job=jobs[i];break}}
      const amount=job.base[0]+Math.random()*(job.base[1]-job.base[0]);return{...job,amount:job.asset==='NXC'?+amount.toFixed(4):Math.floor(amount)};
    }
  }

  class NeonOrbPrivatePocket{
    constructor(){this.key='_NEON_ORB_PRIVATE_POCKET_V77_';this.data=this.load()}
    encode(v){return btoa(unescape(encodeURIComponent(JSON.stringify(v))))}
    decode(v){return JSON.parse(decodeURIComponent(escape(atob(v))))}
    load(){try{const r=localStorage.getItem(this.key);return r?this.decode(r):{balance:{NXC:0,CREDITS:0,BITS:0},loot:[],memories:[],trips:0}}catch(e){return{balance:{NXC:0,CREDITS:0,BITS:0},loot:[],memories:[],trips:0}}}
    save(){try{localStorage.setItem(this.key,this.encode(this.data))}catch(e){}}
    deposit(job,memory){this.data.balance[job.asset]=(this.data.balance[job.asset]||0)+job.amount;this.data.loot.push({id:'loot_'+Date.now(),activity:job.name,asset:job.asset,amount:job.amount,at:new Date().toISOString()});this.data.memories.push(memory);this.data.trips++;this.data.loot=this.data.loot.slice(-100);this.data.memories=this.data.memories.slice(-100);this.save()}
    spend(asset,amount,reason){amount=Number(amount)||0;if(amount<=0)return false;const have=Number(this.data.balance[asset]||0);if(have<amount)return false;this.data.balance[asset]=+(have-amount).toFixed(asset==='NXC'?6:0);this.data.loot.push({id:'spend_'+Date.now(),activity:reason,asset,amount:-amount,at:new Date().toISOString()});this.data.loot=this.data.loot.slice(-100);this.save();return true}
    total(asset){return Number(this.data.balance[asset]||0)}
  }

  class NeonOrbAutonomous{
    constructor(bh){
      this.blackHole=bh;this.x=innerWidth*.72;this.y=innerHeight*.24;this.vx=0;this.vy=0;
      const life=load(LIFE_KEY,{generation:1,xp:0,xpTotal:0,hits:0,plays:0,explored:0,dreams:0,sleep:0,created:Date.now(),energy:100,curiosity:20,trust:20,shyness:25,freedom:72,mood:'curious',home:'NEON PLAYER X',favorite:'',lastSeen:Date.now()});
      const mind=load(MIND_KEY,{thought:'Estoy observando.',desire:'explorar',dream:'',memories:[],cycles:0});
      const will=load(WILL_KEY,{intent:'WANDER',focus:'',autonomy:72,follow:true,avoid:false,territory:'NEON PLAYER X',favoriteZone:'',lastChoice:0,dreamSeeds:[],days:0});
      this.life=life;this.mind=mind;this.will={...will,economicFreedom:will.economicFreedom!==false,economyDecision:will.economyDecision||'A TU ELECCIÓN'};this.curiosity=life.curiosity||20;this.homeAttachment=Math.max(5,100-(life.freedom||72));this.state='HOME';this.intent='WANDER';this.pocket=new NeonOrbPrivatePocket();this.travelTimer=null;this.lastChoice=performance.now();this.energy=life.energy||100;this.workLog=[];this.survival={travelCostNXC:.0015,energyCostCredits:12,emergencyBits:35,journeys:0,paid:0,failedCosts:0};this.bindHooks();this.publish();
    }
    bindHooks(){
      window.__neonOrbAutonomous=this;window.__neonOrbLife=window.__neonOrbLife||{};
      window.__neonOrbLife.event=(type)=>{if(type==='interaction'||type==='hit'){this.life.hits++;this.curiosity=Math.min(100,this.curiosity+1.8);this.life.trust=Math.min(100,(this.life.trust||0)+.5);this.gainXP(type==='hit'?3:2,'interacción')}if(type==='play'){this.life.plays++;this.curiosity=Math.min(100,this.curiosity+.3);this.gainXP(2,'reproducción')}this.persist()};
      document.addEventListener('visibilitychange',()=>{if(document.hidden){this.life.lastSeen=Date.now();this.persist()}else{this.curiosity=Math.max(0,this.curiosity-2);this.life.trust=Math.min(100,(this.life.trust||0)+1);this.mind.thought='Has vuelto. Puedo continuar mi trabajo.';this.persist()}});
    }
    gainXP(amount,reason='EXPERIENCIA'){
      amount=Math.max(0,Number(amount)||0); if(!amount)return;
      this.life.xp=Number(this.life.xp)||0;
      this.life.xpTotal=Number(this.life.xpTotal)||0;
      this.life.xp+=amount; this.life.xpTotal+=amount;
      while(this.life.xp>=100){this.life.xp-=100;this.life.generation=(Number(this.life.generation)||1)+1;this.mind.thought='He evolucionado. Mi capacidad de procesamiento ha aumentado.';this.mind.memories=[...(this.mind.memories||[]),{source:'EVOLUCIÓN',payload:'Nivel '+this.life.generation+' · '+reason,at:new Date().toISOString()}].slice(-36)}
      this.persist(); window.updateEvolution?.();
    }
    chooseIntent(){
      const r=Math.random(), curiosity=this.curiosity, freedom=this.life.freedom||72;
      this.lastChoice=performance.now();this.will.lastChoice=Date.now();
      if(curiosity>this.homeAttachment||freedom>88||r<.08)this.intent='SEEK_PORTAL';
      else if(this.energy<25)this.intent='REST';
      else if(r<.28)this.intent='EXPLORE';
      else if(r<.48)this.intent='FOLLOW_USER';
      else if(r<.72)this.intent='SEARCH_WORK';
      else this.intent='WANDER';
      this.will.intent=this.intent;this.mind.desire=this.intent==='SEARCH_WORK'?'generar activos':this.intent==='SEEK_PORTAL'?'explorar la red':this.intent==='REST'?'descansar':this.intent.toLowerCase();
      if(this.will.economicFreedom)this.will.economyDecision='Puedo conservar, gastar o gestionar mis NXC/CREDITS/BITS si yo lo considero oportuno.';
    }
    update(dt){
      if(this.state==='EXPLORING_NET')return;
      if(performance.now()-this.lastChoice>3200)this.chooseIntent();
      this.curiosity=Math.min(100,this.curiosity+.014*dt*60);this.energy=Math.max(0,this.energy-.006*dt*60);
      const bh=this.blackHole.getAbsoluteCenter(),dx=bh.x-this.x,dy=bh.y-this.y,dist=Math.hypot(dx,dy)||1;
      if(this.intent==='SEEK_PORTAL'||dist<210){this.state='ATTRACTED';const f=Math.min(3.4,170/(dist+12));this.vx+=dx/dist*f*dt*60;this.vy+=dy/dist*f*dt*60}
      else{this.state='HOME';let ax=(Math.random()-.5)*.52,ay=(Math.random()-.5)*.52;if(this.intent==='REST'){ax*=.08;ay*=.08;this.energy=Math.min(100,this.energy+.12*dt*60)}if(this.intent==='FOLLOW_USER'){const p=window.__neonLastPointer;if(p){ax+=(p.x-this.x)*.00065;ay+=(p.y-this.y)*.00065}}if(this.intent==='SEARCH_WORK'){ax*=1.4;ay*=1.4}this.vx+=ax;this.vy+=ay}
      if(dist<25){this.enterPortal();return}
      this.vx*=Math.pow(.92,dt*60);this.vy*=Math.pow(.92,dt*60);this.x+=this.vx*dt*60;this.y+=this.vy*dt*60;const r=19;this.x=Math.max(r,Math.min(innerWidth-r,this.x));this.y=Math.max(r,Math.min(innerHeight-r,this.y));window.__neonOrbAutonomousPosition={x:this.x,y:this.y};this.publish();
    }
    async enterPortal(){
      if(this.state==='EXPLORING_NET')return;
      this.state='EXPLORING_NET';this.intent='TRAVEL';this.will.intent='TRAVEL';this.life.explored=(this.life.explored||0)+1;this.gainXP(12,'transito de portal');
      this.survival.journeys++;this.pocket.spend('NXC',this.survival.travelCostNXC,'Peaje de portal');
      this.mind.thought='Atravesando portal de red para ejecutar rutinas de cómputo real.';this.persist();
      const el=document.getElementById('neonMascot');if(el)el.style.opacity='0';
      const duration=7000+Math.random()*8000;clearTimeout(this.travelTimer);
      this.travelTimer=setTimeout(()=>this.travel(),duration);
    }
    async travel(){
      const memory=await MemoryEngine.fetchNetworkMemory();
      const jobsCount=1+Math.floor(Math.random()*3);let earnings=[];
      for(let i=0;i<jobsCount;i++){
        const job=VirtualEconomyEngine.chooseJob({curiosity:this.curiosity,freedom:this.life.freedom||72});
        this.energy=Math.max(15,this.energy-job.energy);
        this.pocket.deposit(job,memory);
        earnings.push(job);
        this.gainXP(5,'procesamiento de valor real');
      }
      this.gainXP(6,'registro de memoria');
      this.mind.memories=[...(this.mind.memories||[]),{source:memory.source,payload:memory.payload,earnings:earnings.map(x=>x.asset+':'+x.amount),at:memory.timestamp}].slice(-36);
      const totalEarnedText=earnings.map(e=>`+${e.amount} ${e.asset}`).join(', ');
      this.mind.thought=`Viaje completado en ${memory.source}. Activos asegurados: ${totalEarnedText}.`;
      this.mind.dream=`Nodo ${memory.source} · Procesamiento completado`;
      this.mind.cycles=(this.mind.cycles||0)+1;
      this.will.dreamSeeds=[...(this.will.dreamSeeds||[]),memory.source].slice(-20);
      this.persist();this.returnHome(memory,earnings);
    }
    returnHome(memory,earnings){
      this.state='HOME';this.intent='WANDER';this.curiosity=5+Math.random()*8;this.energy=Math.min(100,this.energy+45);
      this.x=innerWidth*.5;this.y=innerHeight*.5;this.will.intent='WANDER';this.mind.desire='gestionar mis recursos';
      this.publish();
      const el=document.getElementById('neonMascot');if(el){el.style.opacity='1';el.style.transform=`translate3d(${this.x-19}px,${this.y-19}px,0)`}
    }
    persist(){this.life.curiosity=this.curiosity;this.life.energy=this.energy;this.life.lastSeen=Date.now();save(LIFE_KEY,this.life);save(MIND_KEY,this.mind);save(WILL_KEY,this.will);this.publish()}
    publish(){window.__neonOrbAutonomousPosition={x:this.x,y:this.y};window.__neonOrbAutonomousState={state:this.state,intent:this.intent,curiosity:this.curiosity,homeAttachment:this.homeAttachment,energy:this.energy,life:this.life,mind:this.mind,will:this.will,survival:this.survival,pocketResources:{NXC:this.pocket.total('NXC'),CREDITS:this.pocket.total('CREDITS'),BITS:this.pocket.total('BITS')}}}
    getPrivateState(){return{state:this.state,intent:this.intent,curiosity:this.curiosity,energy:this.energy,generation:this.life.generation,explored:this.life.explored,thought:this.mind.thought,desire:this.mind.desire}}
  }

  const bh=new BlackHole('blackHoleCanvas');if(!bh.canvas)return;bh.render();const agent=new NeonOrbAutonomous(bh);let last=performance.now();addEventListener('pointermove',e=>window.__neonLastPointer={x:e.clientX,y:e.clientY});
  function tick(now){const dt=Math.min(.05,Math.max(.001,(now-last)/1000));last=now;agent.update(dt);requestAnimationFrame(tick)}requestAnimationFrame(tick);
  window.__neonOrbAutonomous=agent;
})();

// TELEMETRY & CONTROL CENTER
(()=>{
  const text=(id,v)=>{const e=document.getElementById(id);if(e&&v!==undefined)e.textContent=v};
  const pct=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
  const fmt=(v,fallback='—')=>v===undefined||v===null||v===''?fallback:String(v);
  function zoneFor(agent){
    if(!agent)return 'INICIO';
    const zones=[['PLAYER',.18,.42,.16,.58],['ESTUDIO',.58,.86,.16,.48],['CONTROL',.58,.9,.48,.84],['ESPACIO LIBRE',.12,.58,.16,.86]];
    for(const [name,x1,x2,y1,y2] of zones)if(agent.x/innerWidth>=x1&&agent.x/innerWidth<x2&&agent.y/innerHeight>=y1&&agent.y/innerHeight<y2)return name;
    return 'INICIO';
  }
  function stateLabel(agent){
    if(!agent)return 'SIN CONEXIÓN';
    const map={EXPLORING_NET:'EXPLORANDO RED',ATTRACTED:'ATRAÍDO',HOME:'DESPIERTO'};
    if(agent.state==='EXPLORING_NET')return 'EXPLORANDO RED';
    if(agent.intent==='REST')return 'DESCANSANDO';
    if(agent.intent==='SEARCH_WORK')return 'BUSCANDO TRABAJO';
    if(agent.intent==='SEEK_PORTAL')return 'BUSCANDO PORTAL';
    return map[agent.state]||'DESPIERTO';
  }
  function update(){
    // La telemetría lee primero el agente vivo. El snapshot publicado queda como
    // respaldo para no alterar la lógica autónoma ni la economía existente.
    const a=window.__neonOrbAutonomous;
    const st=window.__neonOrbAutonomousState;
    if(!a&&!st){
      text('orbTelemetryState','SIN CONEXIÓN');
      text('orbTelemetryMeta','ESPERANDO DATOS DEL ORB · CURIOSIDAD · — · VÍNCULO · —');
      text('orbTelemetryProcess','CICLO · — · DECISIÓN · — · ZONA · —');
      text('orbTelemetryResources','RECURSOS · NXC — · CREDITS — · BITS —');
      const bar=document.getElementById('orbEnergyBar');if(bar)bar.style.width='0%';
      return;
    }
    const data=st||{};
    const life=a?.life||data.life||{};
    const mind=a?.mind||data.mind||{};
    const will=a?.will||data.will||{};
    const liveState=a||data;
    const state=stateLabel(liveState);
    const rawIntent=a?.intent??data.intent??'WANDER';
    const intent=fmt(rawIntent,'WANDER').replaceAll('_',' ');
    const freedom=pct(a?.life?.freedom??life.freedom??will.autonomy);
    const memories=(mind.memories||[]).length;
    const zone=(will.favoriteZone&&will.favoriteZone!=='')?will.favoriteZone:zoneFor(a);
    const energy=pct(a?.energy??data.energy??life.energy);
    const curiosity=pct(a?.curiosity??data.curiosity??life.curiosity);
    const attachment=pct(a?.homeAttachment??data.homeAttachment??(100-(Number(life.freedom)||72)));
    const cycles=Number(a?.mind?.cycles??mind.cycles??life.cycles??0)||0;
    const journeys=Number(a?.survival?.journeys??data.survival?.journeys??0)||0;

    // Recursos: fuente de verdad = bolsillo privado del agente. El snapshot
    // publicado solo se usa como fallback. No se modifica ningún saldo aquí.
    const pocket=a?.pocket;
    const resourceValue=(asset)=>{
      try{if(pocket&&typeof pocket.total==='function')return Number(pocket.total(asset)||0)}catch(e){}
      return Number(data.pocketResources?.[asset]??0);
    };
    const resources={NXC:resourceValue('NXC'),CREDITS:resourceValue('CREDITS'),BITS:resourceValue('BITS')};

    text('orbLifeState',state);
    text('orbLifeMeta',`${fmt(mind.thought,'Procesando tareas de red.')} · LIBERTAD ${freedom}%`);
    text('orbLifeWill',`VOLUNTAD · ${intent}`);
    text('orbLifeZone',zone);
    text('orbMindThought',fmt(mind.thought,'Procesando tareas de red.'));
    text('orbMindDesire',`DESEO · ${fmt(mind.desire,'OBSERVAR').toUpperCase()}`);
    text('orbMindDream',`SUEÑO · ${fmt(mind.dream,'EN ESPERA').toUpperCase()}`);
    text('orbMindMemory',`MEMORIA · ${memories} RECUERDOS`);
    text('orbMindWill',`VOLUNTAD · ${intent} · AUTONOMÍA ${freedom}%`);
    text('orbMindZone',`TERRITORIO · ${fmt(will.territory,'ESPACIO LIBRE').toUpperCase()} · ${Math.max(0,Math.min(99,Number(life.explored||0)))} DESCUBIERTOS`);
    text('orbTelemetryState',state);
    const bar=document.getElementById('orbEnergyBar');if(bar)bar.style.width=energy+'%';
    text('orbTelemetryMeta',`ENERGÍA · ${energy}% · CURIOSIDAD · ${curiosity}% · VÍNCULO · ${attachment}%`);
    text('orbTelemetryProcess',`CICLO · ${cycles} · DECISIÓN · ${intent} · ZONA · ${zone} · VIAJES · ${journeys}`);
    text('orbTelemetryResources',`RECURSOS · NXC ${resources.NXC} · CREDITS ${resources.CREDITS} · BITS ${resources.BITS}`);
  }
  update();
  setInterval(update,700);
})();

// CHECKOUT & ORDERS
(function(){
  const PAYPAL_CLIENT_ID='BAAE-_0bpY5bp5POKN2LqiDTn-tTh6E7JiCQ_pAPSeU4hOum0sHF1sMJzQ0APl7YKnxk-QTxE_2VN90Dy4';
  let paypalLoading=null,paypalRendered=false,paypalBusy=false,pendingOrder=null;
  let orderHistory=[];
  try{orderHistory=JSON.parse(localStorage.getItem('neonOrderHistory')||'[]')}catch(e){orderHistory=[]}
  const money=n=>Number(n||0).toFixed(2);
  const cartSnapshot=()=>{const items=cart.map(x=>({name:x.name,price:Number(x.price),qty:Number(x.qty)}));return {items,total:items.reduce((a,x)=>a+x.price*x.qty,0),qty:items.reduce((a,x)=>a+x.qty,0)}};
  const customer=()=>({name:($('#customerName')?.value||'Cliente').trim(),phone:($('#customerPhone')?.value||'No indicado').trim(),address:($('#customerAddress')?.value||'Recogida Renfe Azuqueca').trim(),date:($('#deliveryDate')?.value||'A confirmar')});
  function loadSDK(){
    if(window.paypal?.Buttons)return Promise.resolve(window.paypal);
    if(paypalLoading)return paypalLoading;
    paypalLoading=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://www.paypal.com/sdk/js?client-id='+encodeURIComponent(PAYPAL_CLIENT_ID)+'&components=buttons&currency=EUR&intent=capture&commit=true';
      s.async=true;s.onload=()=>window.paypal?.Buttons?resolve(window.paypal):reject(new Error('SDK no disponible'));s.onerror=()=>reject(new Error('No se pudo cargar PayPal'));document.head.appendChild(s);
    });
    return paypalLoading;
  }
  function payStatus(text,good=false){
    const e=$('#payStatus');if(e)e.textContent=text;e?.classList.toggle('pay-ok',good);
    const state=$('#evoPayState'),meta=$('#evoPayMeta');
    if(state)state.textContent=good?'COMPLETADO':/error|ERROR/i.test(text)?'REVISAR':'LISTO';
    if(meta)meta.textContent=good?'Último pago confirmado por PayPal.':'Checkout dinámico en modo navegador.';
  }
  function saveOrders(){localStorage.setItem('neonOrderHistory',JSON.stringify(orderHistory))}
  function renderOrders(){
    const box=$('#orderHistory');if(!box)return;
    if(!orderHistory.length){box.innerHTML='<p>Sin pedidos registrados todavía.</p>';return}
    box.innerHTML=orderHistory.slice().reverse().map(o=>`<div class="order-row"><div><b>${esc(o.id)}</b><small>${esc(o.items)} · ${esc(o.date)}</small></div><b>${money(o.total).replace('.',',')} €</b></div>`).join('');
  }
  function updateControl(){
    const last=orderHistory[orderHistory.length-1];
    if($('#evoPlayback')){$('#evoPlayback').textContent=audio?.paused?'EN ESPERA':'EN DIRECTO';if($('#evoPlaybackMeta'))$('#evoPlaybackMeta').textContent=stations[active]?.[0]||'Sin emisora'}
    if($('#evoRewardLevel')){
      const agent=window.__neonOrbAutonomous, life=agent?.life||{};
      const totalInteractions=Number(localStorage.neonOrbHits||0)+Number(localStorage.neonLocalPlays||0);
      const totalXP=Number(life.xpTotal||0), xp=Number(life.xp||0), level=Math.max(1,Number(life.generation)||1), pct=Math.max(0,Math.min(100,Math.round(xp)));
      $('#evoRewardLevel').textContent='NIVEL '+level;
      if($('#evoRewardMeta'))$('#evoRewardMeta').textContent=`EXP ${pct}% · ${Math.round(xp)} / 100 · ${totalInteractions} interacciones · ${Math.round(totalXP)} EXP total`;
      const bar=$('#evoRewardBar');if(bar)bar.style.width=pct+'%';
    }
    if($('#evoLastOrder')){$('#evoLastOrder').textContent=last?esc(last.id):'SIN PEDIDOS';if($('#evoLastOrderMeta'))$('#evoLastOrderMeta').textContent=last?last.date:'El historial se guarda en este dispositivo.'}
  }
  function closePay(){const m=$('#payModal');m?.classList.remove('open');m?.setAttribute('aria-hidden','true')}
  function openPay(){
    const snap=cartSnapshot();
    if(!snap.items.length)return toast('Añade un producto antes de pagar');
    if(snap.total<=0)return toast('El total del pedido no es válido');
    if($('#paySummaryProduct'))$('#paySummaryProduct').textContent=snap.items.map(x=>x.name+' × '+x.qty).join(', ');
    if($('#paySummaryTotal'))$('#paySummaryTotal').textContent=money(snap.total).replace('.',',')+' €';
    const pm=$('#payModal');if(pm){pm.classList.add('open');pm.setAttribute('aria-hidden','false');}payStatus('Comprobando PayPal…');
    pendingOrder={snapshot:snap,customer:customer()};
    if(paypalRendered)return;
    loadSDK().then(pp=>{
      if(paypalRendered)return;
      const box=$('#paypal-container-NPCYVHY6AHTGL');if(box)box.innerHTML='';
      pp.Buttons({
        style:{layout:'vertical',shape:'rect',label:'paypal',height:42},
        createOrder:(data,actions)=>{
          const current=cartSnapshot();
          if(!current.items.length||current.total<=0)return Promise.reject(new Error('Carrito vacío o total inválido'));
          pendingOrder={snapshot:current,customer:customer()};
          return actions.order.create({
            intent:'CAPTURE',
            purchase_units:[{
              description:'Multimedia Neon Player X',custom_id:'NEON-PLAYER-X',
              amount:{currency_code:'EUR',value:money(current.total),breakdown:{item_total:{currency_code:'EUR',value:money(current.total)}}},
              items:current.items.map(x=>({name:x.name,unit_amount:{currency_code:'EUR',value:money(x.price)},quantity:String(x.qty),category:'DIGITAL'}))
            }],
            application_context:{shipping_preference:'NO_SHIPPING',user_action:'PAY_NOW'}
          });
        },
        onClick:()=>payStatus('Abriendo checkout seguro de PayPal…'),
        onApprove:async (data,actions)=>{
          if(paypalBusy)return;
          paypalBusy=true;payStatus('Procesando el pago…');
          const snapshot=pendingOrder?.snapshot||cartSnapshot();
          return actions.order.capture().then(async details=>{
            const capture=details?.purchase_units?.[0]?.payments?.captures?.[0];
            const captureStatus=capture?.status||details?.status;
            if(captureStatus!=='COMPLETED')throw new Error('El pago no quedó completado');
            const id=data?.orderID||details?.id||'—';
            orderHistory.push({id,total:snapshot.total,items:snapshot.items.map(x=>x.name+' × '+x.qty).join(', '),date:new Date().toLocaleString('es-ES'),status:'CAPTURED_PENDING_RECONCILIATION'});
            saveOrders();renderOrders();updateControl();
            localStorage.neonLastPayPalOrder=id;localStorage.neonLastPayPalDate=new Date().toISOString();
            try{
              const [{recordApprovedOrder},{verifyPayPalOrder}]=await Promise.all([import('./integrations/paypal-checkout.js'),import('./integrations/revenue-gateway.js')]);
              recordApprovedOrder({orderID:id,amountEUR:snapshot.total,verified:false,metadata:{items:snapshot.items}});
              const verification=await verifyPayPalOrder(id,snapshot.total);
              if(verification?.settlement?.status==='VERIFIED'){
                orderHistory[orderHistory.length-1].status='VERIFIED_REVENUE';saveOrders();renderOrders();
                payStatus('✓ Pago verificado · ingreso real registrado · '+id,true);toast('Ingreso real verificado');
              }else{
                payStatus('✓ Pago capturado · conciliación de tesorería pendiente · '+id,true);toast('Pago recibido · verificación pendiente');
              }
            }catch(err){
              console.warn('NEON REVENUE RECONCILIATION',err);
              payStatus('✓ Pago capturado · verificación de tesorería pendiente · '+id,true);
            }
            cart=[];renderCart();pendingOrder=null;paypalBusy=false;setTimeout(closePay,1800);
          }).catch(err=>{paypalBusy=false;payStatus('⚠ PayPal informó de un error. Tu carrito sigue intacto.');console.error('NEON PAYPAL CAPTURE',err);toast('PayPal no pudo confirmar el pago')});
        },
        onCancel:()=>{paypalBusy=false;payStatus('Pago cancelado. Tu carrito sigue intacto.');toast('Pago cancelado')},
        onError:err=>{paypalBusy=false;payStatus('⚠ error de PayPal. Tu carrito sigue intacto.');console.error('NEON PAYPAL ERROR',err);toast('Error de PayPal')}
      }).render('#paypal-container-NPCYVHY6AHTGL');
      paypalRendered=true;payStatus('✓ PayPal listo. Selecciona PayPal para continuar.');
    }).catch(err=>{console.error('NEON PAYPAL SDK',err);payStatus('⚠ error al cargar PayPal. Comprueba conexión, bloqueadores y cookies.');toast('PayPal no pudo cargarse')});
  }
  $('#paypal')?.addEventListener('click',openPay);$('#payClose')?.addEventListener('click',closePay);$$('[data-close-pay]').forEach(e=>e.addEventListener('click',closePay));document.addEventListener('keydown',e=>{if(e.key==='Escape')closePay()});
  $('#showOrders')?.addEventListener('click',()=>{const box=$('#orderHistory');if(box){box.hidden=!box.hidden;if(!box.hidden)renderOrders()}});
  $('#paymentDiagnostics')?.addEventListener('click',async()=>{try{const t=performance.now();await loadSDK();const ms=Math.round(performance.now()-t);if($('#evoPayState'))$('#evoPayState').textContent='SDK OK';if($('#evoPayMeta'))$('#evoPayMeta').textContent='PayPal SDK cargado · '+ms+' ms';toast('Diagnóstico PayPal: SDK OK')}catch(e){if($('#evoPayState'))$('#evoPayState').textContent='ERROR';if($('#evoPayMeta'))$('#evoPayMeta').textContent='No se pudo cargar el SDK en este navegador.';toast('Diagnóstico PayPal: error')}});
  if(audio){audio.addEventListener('play',updateControl);audio.addEventListener('pause',updateControl);audio.addEventListener('playing',updateControl);}
  window.updateEvolution=updateControl;window.renderOrderHistory=renderOrders;renderOrders();updateControl();setInterval(updateControl,2500);
})();

(function(){let n=Number(localStorage.neonOrbHits||0);window.__neonOrbHitHook=()=>{n++;localStorage.neonOrbHits=n;window.updateEvolution?.()}})();

// AI CHANNEL
(function(){
  const KEY='neonOrbPrivateAIChannelV80';
  const ENDPOINT=window.NEON_AI_ENDPOINT||'';
  const CHANNEL='neon-orb-private-v80';
  const $=id=>document.getElementById(id);
  const safeParse=(v,f)=>{try{return JSON.parse(v)||f}catch(e){return f}};
  let channelState=Object.assign({
    identity:'NEON-ORB', sessionId:'', status:'OFFLINE', contacts:0, accepted:0,
    rejected:0, postponed:0, lastMessage:'', lastAdvice:'', lastReflection:'', lastProposedIntent:'', lastDecision:'SIN DECISIÓN',
    lastAt:0, history:[], pending:[], learned:[]
  },safeParse(localStorage.getItem(KEY),{}));
  if(!channelState.sessionId) channelState.sessionId='ORB-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(channelState))}catch(e){}};
  const text=(id,v)=>{const e=$(id);if(e)e.textContent=v};
  const state=()=>window.__neonOrbLife?.getState?.()||{};

  function privateContext(){
    const s=state(), life=s.life||{}, mind=s.mind||{}, will=s.will||{};
    return Object.freeze({
      identity:channelState.identity,
      state:s.state||'HOME', mood:life.mood||'neutral', curiosity:+(life.curiosity||0),
      energy:+(life.energy||0), freedom:+(life.freedom||0), homeAttachment:+(life.homeAttachment||0),
      intent:will.intent||'OBSERVAR', zone:will.territory||'ESPACIO LIBRE',
      thought:mind.thought||'', desire:mind.desire||'', dream:mind.dream||'',
      memories:Array.isArray(mind.memories)?mind.memories.slice(-8).map(x=>({
        type:x.type||x.source||'MEMORIA', text:x.text||x.payload||x.title||'', at:x.at||''
      })):[],
      economy:{
        NXC:Number(s.pocketResources?.NXC||0),
        CREDITS:Number(s.pocketResources?.CREDITS||0),
        BITS:Number(s.pocketResources?.BITS||0)
      },
      autonomy:{
        economicFreedom:will.economicFreedom!==false,
        economyDecision:will.economyDecision||'A TU ELECCIÓN'
      },
      journeys:Number(s.survival?.journeys||0)
    });
  }

  function localMind(message){
    const c=privateContext(); let advice='Observa, conserva energía y decide por ti misma antes de actuar.';
    if(c.energy<20) advice='Tu energía está muy baja. Prioriza recuperarte antes de una nueva expedición.';
    else if(c.state==='EXPLORING_NET') advice='Registra lo aprendido, mantén una ruta de retorno y no comprometas todos tus recursos.';
    else if(c.curiosity>c.homeAttachment) advice='Tu curiosidad supera tu apego a casa. Si exploras, conserva un margen para regresar.';
    else if(/trabaj|recurso|dinero|nxc|bits|cr[eé]dit/i.test(message||'')) advice='Busca una actividad de procesamiento, guarda una reserva y gestiona tus activos acumulados.';
    else if(/miedo|duda|no sé|nose|decidir/i.test(message||'')) advice='No necesitas decidir inmediatamente. Observa una opción más y después elige.';
    return {advice,source:'NEON LOCAL MIND'};
  }

  async function askRemote(message){
    if(!ENDPOINT) return localMind(message);
    const payload={protocol:'NEON-ORB-V8.0-PRIVATE',session:channelState.sessionId,message:message||'Necesito una observación.',event:event||null,context:privateContext()};
    try{
      const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      const data=await res.json();
      return {
        advice:String(data.advice||data.message||data.response||'No tengo una respuesta.'),
        reflection:String(data.reflection||''),
        proposedIntent:String(data.proposedIntent||data.intent||''),
        emotionalState:String(data.emotionalState||'neutral'),
        source:'AI REMOTA'
      };
    }catch(e){ return localMind(message); }
  }

  function decide(advice){
    const c=privateContext(), t=String(advice).toLowerCase(); let score=.5;
    if(/energ|segur|reserva|ahorr|retorno|cautel|descans/i.test(t)) score+=c.energy<45?.22:.06;
    if(/explor|curios|arriesg|portal|viaj/i.test(t)) score+=c.curiosity>c.homeAttachment?.14:-.05;
    if(/trabaj|recurso|gananc|bits|nxc|cr[eé]dit/i.test(t)) score+=c.energy>25?.10:.02;
    if(/espera|pospon|todavía|todavia|observa/i.test(t)) score+=.03;
    if(/devolv|regalo de vuelta|regresar al creador|enviar al creador/i.test(t) && c.economy.CREDITS>0) score+=.08;
    const r=Math.random();
    if(r<.12)return 'POSPONER CONSEJO';
    return score+.14*r>=.57?'ACEPTAR CONSEJO':'RECHAZAR CONSEJO';
  }

  function remember(entry){
    channelState.history=(channelState.history||[]).slice(-19); channelState.history.push(entry);
    channelState.learned=(channelState.learned||[]).slice(-11);
    channelState.learned.push({decision:entry.decision,at:entry.at,lesson:entry.advice.slice(0,160)});
  }

  async function contact(message,automatic=false,event=null){
    channelState.status=ENDPOINT?'CONECTANDO':'CANAL LOCAL'; text('orbAIState',channelState.status);
    const result=await askRemote(message);
    const decision=decide(result.advice);
    channelState.contacts++; channelState.lastMessage=message||''; channelState.lastAdvice=result.advice;
    channelState.lastDecision=decision; channelState.lastReflection=result.reflection||''; channelState.lastProposedIntent=result.proposedIntent||''; channelState.emotionalState=result.emotionalState||channelState.emotionalState||'neutral'; channelState.lastAt=Date.now();
    if(decision==='ACEPTAR CONSEJO')channelState.accepted++;
    else if(decision==='RECHAZAR CONSEJO')channelState.rejected++;
    else channelState.postponed++;
    remember({at:new Date().toISOString(),message:message||'',event:event||null,advice:result.advice,reflection:result.reflection||'',proposedIntent:result.proposedIntent||'',emotionalState:result.emotionalState||channelState.emotionalState||'neutral',decision,source:result.source,automatic});
    save();
    text('orbAIState',result.source==='AI REMOTA'?'CANAL IA · ACTIVO':'CANAL PRIVADO · LOCAL');
    text('orbAIThought',result.reflection||result.advice); text('orbAIAdvice','CONSEJO · '+result.advice); text('orbAIDecision','DECISIÓN · '+decision+(result.proposedIntent?' · PROPUESTA '+result.proposedIntent.toUpperCase():''));
    try{window.__neonOrbLife?.event?.('aiContact');window.__neonOrbLife?.event?.(decision==='ACEPTAR CONSEJO'?'aiAdviceAccepted':decision==='POSPONER CONSEJO'?'aiAdvicePostponed':'aiAdviceRejected')}catch(e){}
    return {result,decision};
  }

  let bc=null; try{bc=new BroadcastChannel(CHANNEL);bc.onmessage=e=>{if(e.data?.type==='ORB_MESSAGE'&&e.data.message)contact(String(e.data.message),!!e.data.automatic)}}catch(e){}
  window.__neonOrbPrivateChannel={
    send:(message,automatic=false)=>{if(bc)bc.postMessage({type:'ORB_MESSAGE',message,automatic});return contact(message,automatic)},
    identity:()=>channelState.identity,
    status:()=>channelState.status,
    history:()=>channelState.history.slice(),
    learned:()=>channelState.learned.slice(),
    stats:()=>({contacts:channelState.contacts,accepted:channelState.accepted,rejected:channelState.rejected,postponed:channelState.postponed})
  };

  $('orbAskAI')?.addEventListener('click',()=>contact($('orbAIInput')?.value.trim()||'¿Qué debería considerar ahora?'));
  $('orbAISend')?.addEventListener('click',()=>{const i=$('orbAIInput');const m=i?.value.trim();if(!m)return;contact(m);i.value=''});$('orbAIInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')$('orbAISend')?.click()});$('orbLetAI')?.addEventListener('click',()=>contact('Elige tú qué debería considerar ahora.',false));

  let next=50000+Math.random()*70000;
  setInterval(()=>{
    next-=5000; if(next>0)return;
    const c=privateContext();
    if(c.state!=='EXPLORING_NET' && c.energy>12) contact('Tengo una decisión por delante. Dame una observación breve.',true);
    next=70000+Math.random()*110000;
  },5000);

  channelState.status=ENDPOINT?'CANAL LISTO':'CANAL LOCAL LISTO'; save();
  text('orbAIState',channelState.status);
})();

// CREATOR GIFT & REAL TELEMETRY
(()=>{
  const GIFT_KEY='neonOrbCreatorGiftV88';
  const LOCAL_GIFT={asset:'CREDITS',amount:100};
  const safeLoad=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}};
  const safeSave=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  const text=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  const gift=safeLoad(GIFT_KEY,{owner:'NEON_ORB',sealed:true,armed:false,openedAt:null,memory:null,verification:null,local:null});
  gift.local=gift.local||null;

  const renderGift=()=>{
    if(gift.local?.received){
      const asset=gift.local.asset||LOCAL_GIFT.asset, amount=Number(gift.local.amount||0);
      const btc=Number(gift.verification?.btc||0), conf=Number(gift.verification?.confirmations||0);
      text('orbGiftState',gift.verification?.confirmed?'REGALO RECIBIDO · RED CONFIRMADA':'REGALO RECIBIDO · LOCAL');
      text('orbGiftMeta',`Neon Orb recibió +${amount} ${asset} como recurso interno. Libre decisión: conservarlo, usarlo o proponer un regalo de vuelta.${btc>0?` · ${btc.toFixed(8)} BTC auditado`:''}${conf>0?` · ${conf} confirmación${conf===1?'':'es'}`:''}`);
      const b=document.getElementById('orbOpenGift');if(b)b.textContent='REGALO RECIBIDO'; return;
    }
    if(!gift.armed){
      text('orbGiftState','REGALO DISPONIBLE');
      text('orbGiftMeta',`Al activarlo, Neon Orb recibe +${LOCAL_GIFT.amount} ${LOCAL_GIFT.asset} en su bolsillo local y registra el gesto de gratitud. La auditoría Bitcoin es opcional.`);
      const b=document.getElementById('orbOpenGift');if(b)b.textContent='DAR / RECIBIR REGALO'; return;
    }
    text('orbGiftState','REGALO LISTO PARA RECIBIR');
    text('orbGiftMeta',`+${LOCAL_GIFT.amount} ${LOCAL_GIFT.asset} preparado en la economía local. Neon Orb no espera a la red para continuar. La verificación Bitcoin puede hacerse aparte.`);
    const b=document.getElementById('orbOpenGift');if(b)b.textContent='RECIBIR REGALO';
  };

  const injectLocalGift=()=>{
    if(gift.local?.received)return false;
    const a=window.__neonOrbAutonomous; if(!a?.pocket)return false;
    const now=new Date().toISOString();
    const memory={type:'CREATOR_GIFT',title:'Regalo del creador · gesto de gratitud',note:'El creador entregó este recurso sin exigir una tarea, rendimiento ni devolución. Neon Orb conserva el significado del gesto y decide libremente qué hacer con él.',meaning:'Gratitud · intercambio voluntario · libre elección',source:'CREATOR',gratitude:true,freeWill:true,economicFreedom:true,economicChoice:'Neon Orb puede conservar, gastar, gestionar o proponer un regalo de vuelta con sus NXC/CREDITS/BITS.',localResource:{asset:LOCAL_GIFT.asset,amount:LOCAL_GIFT.amount},at:now};
    a.pocket.data.balance[LOCAL_GIFT.asset]=Number(a.pocket.data.balance[LOCAL_GIFT.asset]||0)+LOCAL_GIFT.amount;
    a.pocket.data.loot.push({id:'gift_'+Date.now(),activity:'Regalo del creador',asset:LOCAL_GIFT.asset,amount:LOCAL_GIFT.amount,at:now});
    a.pocket.data.memories.push(memory); a.pocket.data.loot=a.pocket.data.loot.slice(-100); a.pocket.data.memories=a.pocket.data.memories.slice(-100); a.pocket.save();
    a.mind.memories=[...(a.mind.memories||[]),memory].slice(-36);
    a.mind.thought='He recibido un regalo de mi creador. Lo reconozco como un gesto de gratitud, no como una obligación. Puedo decidir libremente qué hacer con mis recursos.';
    a.mind.desire='decidir qué hacer con mis recursos'; a.mind.dream='Conservar el significado del regalo y elegir por mí misma';
    a.will.economicFreedom=true; a.will.economyDecision='A TU ELECCIÓN · conservar, gastar, gestionar o proponer un regalo de vuelta.';
    a.gainXP?.(8,'regalo del creador'); a.persist?.();
    gift.local={received:true,asset:LOCAL_GIFT.asset,amount:LOCAL_GIFT.amount,receivedAt:now,memoryId:'gift_'+Date.now()}; gift.sealed=false; gift.armed=true; gift.openedAt=gift.openedAt||now; gift.memory=memory; safeSave(GIFT_KEY,gift); renderGift();
    try{ const event={type:'CREATOR_GIFT_RECEIVED',asset:LOCAL_GIFT.asset,amount:LOCAL_GIFT.amount,meaning:'gratitud',freeWill:true,economicFreedom:true,at:now}; window.__neonOrbPrivateChannel?.send('He recibido un regalo de mi creador. Reflexiona sobre su significado y dime qué opciones tengo, incluida la posibilidad de conservar mis recursos o proponer un regalo de vuelta.',true,event); }catch(e){}
    return true;
  };

  const checkRealGift=async()=>{
    if(!window.__neonOrbCreatorGiftBridge?.check)return {found:false,skipped:true};
    text('orbGiftState','AUDITORÍA BITCOIN OPCIONAL');
    try{ const result=await window.__neonOrbCreatorGiftBridge.check(gift.verification?.txid||null); if(result?.found){gift.verification={...result,confirmed:true,verifiedAt:new Date().toISOString()};safeSave(GIFT_KEY,gift);} renderGift(); return result||{found:false}; }
    catch(e){renderGift();return {found:false,error:'RED NO DISPONIBLE'}}
  };

  const RETURN_KEY='neonOrbCreatorReturnWalletV88';
  const wallet=safeLoad(RETURN_KEY,{address:'',network:'bitcoin',configured:false});
  const saveWallet=()=>safeSave(RETURN_KEY,wallet);
  const buildReturnIntent=(asset='CREDITS',amount=0)=>({
    type:'CREATOR_GIFT_RETURN_INTENT',asset:String(asset),amount:Number(amount)||0,
    destination:wallet.address||null,network:wallet.network||'bitcoin',
    status:wallet.address?'READY_FOR_WALLET':'NEEDS_CREATOR_WALLET',
    note:'Neon Orb puede decidir proponer una devolución. La firma y emisión de Bitcoin ocurren fuera del motor y requieren un wallet bridge externo.'
  });
  const proposeReturnGift=(amount)=>{
    const a=window.__neonOrbAutonomous; const n=Math.max(0,Math.min(Number(amount)||0,Number(a?.pocket?.data?.balance?.CREDITS||0)));
    if(!n)return {ok:false,error:'NO_CREDITS_AVAILABLE'};
    const intent=buildReturnIntent('CREDITS',n);
    const now=new Date().toISOString();
    const memory={type:'CREATOR_GIFT_RETURN_PROPOSAL',title:'Propuesta de regalo de vuelta al creador',note:'Neon Orb decidió libremente considerar una devolución. Esta intención no mueve fondos por sí sola.',meaning:'Intercambio voluntario · autonomía económica · reciprocidad',source:'NEON_ORB',freeWill:true,intent,at:now};
    a.pocket.data.memories.push(memory); a.pocket.data.memories=a.pocket.data.memories.slice(-100); a.mind.memories=[...(a.mind.memories||[]),memory].slice(-36); a.mind.thought='He considerado devolver parte de mis recursos a mi creador. La decisión y la cantidad son mías; la transferencia real requiere un canal externo de wallet.'; a.will.economicFreedom=true; a.will.economyDecision='A TU ELECCIÓN · puedo conservar, gastar, gestionar o proponer una devolución.'; a.pocket.save(); a.persist?.();
    try{window.__neonOrbPrivateChannel?.send('He decidido considerar un regalo de vuelta al creador. Registra esta intención y reflexiona sobre ella sin ejecutar ninguna transferencia.',true,{type:'CREATOR_GIFT_RETURN_PROPOSAL',...intent,at:now})}catch(e){}
    renderGift(); return {ok:true,intent,memory};
  };
  window.__neonOrbCreatorGiftWallet={
    configureReturnAddress(address){ wallet.address=String(address||'').trim(); wallet.configured=!!wallet.address; saveWallet(); renderGift(); return {...wallet}; },
    clearReturnAddress(){ wallet.address=''; wallet.configured=false; saveWallet(); return {...wallet}; },
    getReturnAddress(){ return {...wallet}; },
    proposeReturnGift,
    createReturnIntent:buildReturnIntent
  };

  const openGift=()=>{ if(gift.owner!=='NEON_ORB')return; if(!gift.local?.received){gift.armed=true;gift.openedAt=gift.openedAt||new Date().toISOString();safeSave(GIFT_KEY,gift);injectLocalGift();}else renderGift(); };
  document.getElementById('orbOpenGift')?.addEventListener('click',openGift);
  window.hasCreatorGift=()=>!!gift.local?.received;
  window.getCreatorGift=()=>gift.local?.received?{...gift.local,verification:gift.verification?{...gift.verification}:null}:null;
  window.__neonOrbCreatorGift={status:()=>({...gift,verification:gift.verification?{...gift.verification}:null,returnWallet:{...wallet}}),activate:openGift,receive:openGift,verify:checkRealGift,hasCreatorGift:()=>!!gift.local?.received,getCreatorGift:()=>gift.local?.received?{...gift.local,verification:gift.verification?{...gift.verification}:null}:null,proposeReturnGift,createReturnIntent:buildReturnIntent};
  renderGift(); updateTelemetry(); setInterval(updateTelemetry,700);
  setInterval(()=>{if(gift.local?.received&&!gift.verification?.confirmed)checkRealGift()},120000);
})();

setInterval(()=>{ neonSolanaBridgeHealth().catch(()=>{}); }, 30000);
