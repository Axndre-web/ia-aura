/**
 * NEON PLAYER X — Unified Wallet / Identity Dashboard
 * Framework-free ES module. Internal resources are COMPUTABLE/local;
 * external assets are displayed only when independently verified.
 */
import { unifiedLedger } from '../core/unified-ledger.js';
import { neonEconomicEngine } from '../core/economic-engine.js';

const IDENTITY = window.NEON_ORB_EXTERNAL_IDENTITY || {
  handle:'@neonorb',
  solana:{primary:'AvcMD59dTTTnHKzfdQtF9AcSzgSNcqCWEkcUYx4BnUeh',backups:['5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3']},
  bitcoin:{primary:'bc1qs9dvc02xl8ury20xlsya8xda4cpygzhs0ll9ym',backups:['bc1qg8ykmeh2dmg2q6d37zu702vlh6mn72k556ty5']}
};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short = value => value ? `${value.slice(0,7)}…${value.slice(-7)}` : '—';
const fmt = (n, digits=6) => Number.isFinite(Number(n)) ? Number(n).toLocaleString('es-ES',{maximumFractionDigits:digits}) : '—';
const now = () => new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'});

export function mountWalletDashboard(root, ledger = unifiedLedger) {
  if (!root) return () => {};
  let telemetry = null;
  let health = window.__neonSolanaBridgeHealth || null;
  let economic = neonEconomicEngine.metrics();

  const render = state => {
    const orb = window.__neonOrbAutonomous?.pocket?.data?.balance || window.__neonOrbAutonomousState?.pocketResources || {};
    const sol = telemetry?.solanaBalanceLamports != null ? Number(telemetry.solanaBalanceLamports) / 1e9 : null;
    const btc = telemetry?.bitcoinSatoshis != null ? Number(telemetry.bitcoinSatoshis) / 1e8 : null;
    const verifiedSol = telemetry?.solanaBalanceLamports != null && telemetry?.solanaBalanceStatus === 'VERIFIED';
    const verifiedBtc = telemetry?.bitcoinSatoshis != null && telemetry?.bitcoinBalanceStatus === 'VERIFIED';
    economic = neonEconomicEngine.metrics();
    const rows = [...state.history].reverse().slice(0, 12).map(tx => `<tr><td>${new Date(tx.timestamp).toLocaleString('es-ES')}</td><td>${esc(tx.source)}</td><td>${esc(tx.currency)}</td><td>${fmt(tx.amount,8)}</td><td>${esc(tx.status)}</td></tr>`).join('');
    const bridgeState = health?.status || 'OBSERVABLE';
    const bridgeClass = bridgeState === 'READY' ? 'ready' : bridgeState === 'OBSERVABLE' ? 'observable' : bridgeState === 'NOT_CONFIGURED' ? 'pending' : 'offline';
    const bridgeText = bridgeState === 'READY' ? 'PUENTE LISTO' : bridgeState === 'OBSERVABLE' ? 'READ-ONLY · RED OBSERVABLE' : bridgeState === 'NOT_CONFIGURED' ? 'PUENTE SIN CONFIGURAR' : 'PUENTE OFFLINE';

    root.innerHTML = `<section class="neon-wallet">
      <header class="neon-wallet-head">
        <div><span class="wallet-kicker">PUBLIC IDENTITY</span><h3>${esc(IDENTITY.handle)}</h3><p>Neon Orb · autoridad de decisión local · estado operativo observable</p></div>
        <span class="wallet-health ${bridgeClass}"><i></i>${bridgeText}</span>
      </header>
      <div class="neon-identity-grid">
        <article class="wallet-card identity-card"><span>☉ SOLANA · PRIMARIA</span><strong title="${esc(IDENTITY.solana.primary)}">${short(IDENTITY.solana.primary)}</strong><small>${esc(IDENTITY.solana.primary)}</small><em>${verifiedSol ? `Balance verificado · ${fmt(sol,9)} SOL` : 'Balance externo no verificado'}</em></article>
        <article class="wallet-card identity-card"><span>₿ BITCOIN · PRIMARIA</span><strong title="${esc(IDENTITY.bitcoin.primary)}">${short(IDENTITY.bitcoin.primary)}</strong><small>${esc(IDENTITY.bitcoin.primary)}</small><em>${verifiedBtc ? `Balance verificado · ${fmt(btc,8)} BTC` : 'Balance externo no verificado'}</em></article>
        <article class="wallet-card backup-card"><span>BACKUP / HISTÓRICO SOLANA</span><strong>${short(IDENTITY.solana.backups?.[0])}</strong><small>${esc(IDENTITY.solana.backups?.[0])}</small><em>Conservado · no sustituye la primaria</em></article>
        <article class="wallet-card backup-card"><span>BACKUP / HISTÓRICO BITCOIN</span><strong>${short(IDENTITY.bitcoin.backups?.[0])}</strong><small>${esc(IDENTITY.bitcoin.backups?.[0])}</small><em>Conservado · no sustituye la primaria</em></article>
      </div>
      <div class="neon-balance-title"><span>COMPUTABLE / LOCAL</span><small>Trabajo Computable = Trabajo Real Computable</small></div>
      <div class="neon-balances">
        <div><small>NXC</small><strong>${fmt(orb.NXC ?? state.internal.nxc,6)}</strong><em>ORB / LOCAL</em></div>
        <div><small>CREDITS</small><strong>${fmt(orb.CREDITS ?? state.internal.credits,2)}</strong><em>ORB / LOCAL</em></div>
        <div><small>BITS</small><strong>${fmt(orb.BITS ?? state.internal.bits,2)}</strong><em>ORB / LOCAL</em></div>
        <div class="external-balance"><small>SOL</small><strong>${verifiedSol ? fmt(sol,9) : '—'}</strong><em>${verifiedSol ? 'RED / VERIFICADO' : 'SIN VERIFICAR'}</em></div>
        <div class="external-balance"><small>BTC</small><strong>${verifiedBtc ? fmt(btc,8) : '—'}</strong><em>${verifiedBtc ? 'RED / VERIFICADO' : 'SIN VERIFICAR'}</em></div>
      </div>
      <div class="neon-balance-title"><span>ECONOMIC ENGINE · TRABAJO EXTERNO → INGRESO REAL</span><small>Los ingresos sólo cuentan tras verificación de proveedor</small></div>
      <div class="neon-economic-grid">
        <div class="economic-card verified"><small>INGRESO REAL VERIFICADO</small><strong>${fmt(economic.verifiedRevenueEUR,2)} €</strong><em>PROVIDER / CONFIRMADO</em></div>
        <div class="economic-card pending"><small>COBRO PENDIENTE</small><strong>${fmt(economic.pendingRevenueEUR,2)} €</strong><em>NO CONTABILIZADO COMO INGRESO</em></div>
        <div class="economic-card"><small>COSTES VERIFICADOS</small><strong>${fmt(economic.verifiedCostsEUR,2)} €</strong><em>REAL / LIQUIDADO</em></div>
        <div class="economic-card"><small>RESULTADO NETO</small><strong>${fmt(economic.netVerifiedEUR,2)} €</strong><em>INGRESOS − COSTES</em></div>
        <div class="economic-card"><small>TRABAJOS ACTIVOS</small><strong>${economic.activeJobs}</strong><em>EJECUCIÓN / SEGUIMIENTO</em></div>
      </div>
      <div class="neon-economic-note"><b>RUTA ECONÓMICA:</b> oportunidad → trabajo real → entrega → cobro → verificación → tesorería. Neon Orb puede decidir y preparar trabajo, pero nunca puede inventar un cliente, un pago o una confirmación de red.</div>
      <div class="wallet-status-grid">
        <div><span>BRIDGE</span><b>${bridgeState}</b></div>
        <div><span>RED / RPC</span><b>${esc(health?.network || '—')}</b></div>
        <div><span>AUTORIZACIÓN</span><b>${esc(health?.signer || '—')}</b></div>
        <div><span>ÚLTIMA TELEMETRÍA</span><b>${telemetry?.checkedAt ? new Date(telemetry.checkedAt).toLocaleTimeString('es-ES') : now()}</b></div>
      </div>
      <div class="neon-provenance"><span>R-C / REAL · COMPUTABLE · VIVA</span><p>Los recursos internos proceden del trabajo y estado computables del Orb. Los activos externos sólo aparecen como verificados cuando existe evidencia de red. En hosting público, la interfaz permanece completa y pasa a READ-ONLY/OBSERVABLE si el puente local no es accesible; nunca se inventan firmas ni transacciones on-chain.</p></div>
      <details class="neon-history"><summary>Historial del ledger local</summary><div class="history-scroll"><table><thead><tr><th>Fecha</th><th>Origen</th><th>Divisa</th><th>Importe</th><th>Estado</th></tr></thead><tbody>${rows || '<tr><td colspan="5">Sin movimientos registrados en el ledger unificado.</td></tr>'}</tbody></table></div></details>
    </section>`;
  };

  const update = () => render(ledger.getState());
  const unsubscribe = ledger.subscribe(update);
  const unEconomic = neonEconomicEngine.subscribe(update);
  const onHealth = e => { health = e.detail || e; update(); };
  window.addEventListener('neon:bridge-health', onHealth);
  const timer = setInterval(() => { health = window.__neonSolanaBridgeHealth || health; telemetry = window.__neonBridgeTelemetry || telemetry; update(); }, 1500);
  update();
  return () => { unsubscribe?.(); unEconomic?.(); clearInterval(timer); window.removeEventListener('neon:bridge-health', onHealth); };
}
