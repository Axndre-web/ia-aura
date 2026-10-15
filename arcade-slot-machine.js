/** NEON ORB: CYBER POWER SLOTS — static GitHub Pages build. Virtual demo credits only. */
import { SlotEngine } from '../core/slot-engine.js';
const engine = new SlotEngine();
const STORAGE_KEY = 'neon_orb_cyber_power_slots_static_v1';
const LEDGER_KEY = 'neon_orb_cyber_power_slots_ledger_v1';
const LEGACY_KEY = 'neon_arcade_demo_credits_v1';
const INITIAL_BALANCE = 100;
const money = n => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const safeNumber = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(Number(value).toFixed(2)) : INITIAL_BALANCE;
function readJSON(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback; } catch { return fallback; } }
function getDeviceId() { try { let id=localStorage.getItem(`${STORAGE_KEY}:device`); if(!id){id=globalThis.crypto?.randomUUID?.()||`arcade_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;localStorage.setItem(`${STORAGE_KEY}:device`,id);} return id; } catch { return 'local-device'; } }
class NeonSlotMachine {
  constructor(container) { this.container=container; this.deviceId=getDeviceId(); this.state=this.loadLocalState(); this.balance=this.state.balance; this.history=this.state.history; this.bet=1; this.busy=false; this.render(); this.bind(); this.persistLocal(); this.updateBalanceDisplay(); this.setStatus('Modo estático listo · ledger local activo'); this.setBridgeStatus(); }
  loadLocalState() {
    const saved=readJSON(STORAGE_KEY,null);
    if(saved&&typeof saved==='object') { const balance=safeNumber(saved.balance); return {balance:balance===0?INITIAL_BALANCE:balance,history:Array.isArray(saved.history)?saved.history.filter(x=>x&&typeof x==='object').slice(-20):[],updatedAt:Number(saved.updatedAt)||0}; }
    const legacy=localStorage.getItem(LEGACY_KEY); const balance=legacy===null?INITIAL_BALANCE:safeNumber(legacy);
    return {balance:balance===0?INITIAL_BALANCE:balance,history:[],updatedAt:0};
  }
  persistLocal(event=null) {
    this.state={balance:Number(this.balance.toFixed(2)),history:this.history.slice(-20),updatedAt:Date.now()};
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(this.state)); localStorage.setItem(LEGACY_KEY,String(this.balance)); if(event){const ledger=readJSON(LEDGER_KEY,[]);ledger.push({...event,deviceId:this.deviceId,recordedAt:new Date().toISOString()});localStorage.setItem(LEDGER_KEY,JSON.stringify(ledger.slice(-250)));} }
    catch { this.setStatus('Almacenamiento no disponible; el saldo solo dura esta sesión.'); }
  }
  render() {
    this.container.innerHTML=`<div class="slot-cabinet-neon" aria-label="NEON ORB Cyber Power Slots">
      <div class="jackpot-banner-grid" aria-label="Tarjetas decorativas del arcade"><div class="jackpot-card spades">♠ <span>NEON</span></div><div class="jackpot-card hearts">♥ <span>CYBER</span></div><div class="jackpot-card diamonds">♦ <span>POWER</span></div><div class="jackpot-card clubs">♣ <span>SLOTS</span></div></div>
      <div class="slot-header-title"><h3>NEON ORB: CYBER POWER SLOTS</h3><span class="sub-neon">ARCADE · CRÉDITOS VIRTUALES · MODO ESTÁTICO</span></div>
      <div class="reels-frame-neon"><div class="lightning-overlay" aria-hidden="true"></div><div class="smoke-overlay" aria-hidden="true"></div><div class="reels-viewport">${Array.from({length:5},(_,i)=>`<div class="reel" id="slot-reel-${i}"><div class="symbol">${['🍒','🍊','🍋','🍇','⭐'][i]}</div></div>`).join('')}</div></div>
      <div class="slot-info-bar"><div class="info-box"><label>CRÉDITOS DEMO</label><span id="slot-balance-val">${money(this.balance)}</span></div><div class="info-box status-msg" id="slot-status-msg" role="status" aria-live="polite">Ledger local listo</div><div class="info-box"><label>ÚLTIMO PREMIO</label><span id="slot-win-val">0,00</span></div></div>
      <div class="bet-quick-selector" aria-label="Seleccionar apuesta">${[1,2,3,4,5].map(n=>`<button class="bet-btn ${n===1?'active':''}" data-bet="${n}" type="button" aria-pressed="${n===1}">${n.toFixed(2).replace('.',',')} créditos</button>`).join('')}</div>
      <div class="slot-controls-gold"><button class="ctrl-circle-main" id="btn-spin-main" type="button">⚡ GIRAR ⚡</button></div>
      <div class="slot-history" aria-live="polite"><strong>ÚLTIMAS TIRADAS</strong><ol id="slot-history-list">${this.history.slice(-5).reverse().map(item=>`<li>${item.at?new Date(item.at).toLocaleTimeString('es-ES'):'—'} · apuesta ${money(item.betAmount)} · premio ${money(item.winAmount)}</li>`).join('')||'<li>Aún no hay tiradas.</li>'}</ol></div>
      <p class="slot-demo-notice">Saldo inicial: 100 créditos virtuales. El saldo y el historial se guardan en este navegador. Modo GitHub Pages: no hay servidor ni sincronización remota; créditos no canjeables, sin depósitos, pagos ni retiros.</p></div>`;
  }
  bind() { this.container.querySelectorAll('[data-bet]').forEach(button=>button.addEventListener('click',()=>{if(this.busy)return;this.bet=Number(button.dataset.bet);this.container.querySelectorAll('[data-bet]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});}));this.container.querySelector('#btn-spin-main').addEventListener('click',()=>void this.spin()); }
  setStatus(message) { const status=this.container.querySelector('#slot-status-msg');if(status)status.textContent=message; }
  setBridgeStatus() { const pill=document.getElementById('slot-bridge-state');const ledger=document.getElementById('slot-ledger-state');const sync=document.getElementById('slot-last-sync');if(pill){pill.innerHTML='<i></i> MODO ESTÁTICO · LOCAL';pill.classList.remove('is-live');}if(ledger)ledger.textContent='Ledger local: localStorage · solo créditos demo';if(sync)sync.textContent=`Estado local listo · ${new Date().toLocaleTimeString('es-ES')}`; }
  updateBalanceDisplay() { const display=this.container.querySelector('#slot-balance-val');if(display)display.textContent=money(this.balance);const history=this.container.querySelector('#slot-history-list');if(history)history.innerHTML=this.history.slice(-5).reverse().map(item=>`<li>${item.at?new Date(item.at).toLocaleTimeString('es-ES'):'—'} · apuesta ${money(item.betAmount)} · premio ${money(item.winAmount)}</li>`).join('')||'<li>Aún no hay tiradas.</li>'; }
  async spin() {
    if(this.busy)return;if(this.balance<this.bet){this.setStatus('CRÉDITOS INSUFICIENTES');return;}this.busy=true;const button=this.container.querySelector('#btn-spin-main');button.disabled=true;this.container.querySelectorAll('[data-bet]').forEach(item=>item.disabled=true);this.setStatus('GIRANDO…');this.container.querySelectorAll('.reel').forEach(reel=>reel.classList.add('spinning'));
    try { await new Promise(resolve=>setTimeout(resolve,650));const result=await engine.processSpin(this.bet,this.balance);this.balance=result.newBalance;const event={type:'DEMO_SPIN',betAmount:result.betAmount,winAmount:result.winAmount,balance:result.newBalance,reels:result.reels,at:new Date().toISOString(),currency:'DEMO_CREDITS'};this.history.push(event);this.history=this.history.slice(-20);this.persistLocal(event);result.reels.forEach((symbol,index)=>{const target=this.container.querySelector(`#slot-reel-${index} .symbol`);if(target)target.textContent=symbol;});this.updateBalanceDisplay();const win=this.container.querySelector('#slot-win-val');if(win)win.textContent=money(result.winAmount);this.setStatus(result.winAmount>0?`PREMIO DEMO: ${money(result.winAmount)} créditos`:'Tirada guardada localmente · sin premio');this.setBridgeStatus();window.dispatchEvent(new CustomEvent('neon:arcade-updated',{detail:{balance:this.balance,event}}));
    } catch(error){this.setStatus(error?.message||'No se pudo completar la tirada');} finally {this.busy=false;button.disabled=false;this.container.querySelectorAll('[data-bet]').forEach(item=>item.disabled=false);this.container.querySelectorAll('.reel').forEach(reel=>reel.classList.remove('spinning'));}
  }
}
const mount=()=>{const target=document.getElementById('slot-machine');if(target&&!target.dataset.mounted){target.dataset.mounted='true';new NeonSlotMachine(target);}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
