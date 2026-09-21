/** NEON PLAYER X — Unified Wallet Dashboard V11.7
 * Framework-free responsive dashboard. Local ledger + observable bridge state.
 */
import { unifiedLedger } from '../core/unified-ledger.js';

const BRIDGE_URL = (globalThis.NEON_BRIDGE_URL || 'http://127.0.0.1:8765').replace(/\/$/, '');
const PUBLIC_IDENTITY = '@neonorb';
const PUBLIC_ADDRESSES = {
  solana: 'AvcMD59dTTTnHKzfdQtF9AcSzgSNcqCWEkcUYx4BnUeh',
  bitcoin: 'bc1qs9dvc02xl8ury20xlsya8xda4cpygzhs0ll9ym'
};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short = value => value ? `${value.slice(0, 8)}…${value.slice(-8)}` : '—';

async function fetchJson(path, timeout = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${BRIDGE_URL}${path}`, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}

export function mountWalletDashboard(root, ledger = unifiedLedger) {
  if (!root) throw new Error('Dashboard root required');
  let remote = { connected: false, health: null, wallet: null, telemetry: null };

  const render = state => {
    const network = remote.wallet?.network || {};
    const sol = network.solana || {};
    const btc = network.bitcoin || {};
    const rows = [...state.history].reverse().slice(0, 25).map(tx => `
      <tr><td>${new Date(tx.timestamp).toLocaleString()}</td><td>${esc(tx.source)}</td><td>${esc(tx.currency)}</td><td>${tx.amount}</td><td>${esc(tx.status)}</td><td>${esc(tx.txHash || tx.workId || '—')}</td></tr>`).join('');
    const bridgeLabel = remote.connected ? 'BRIDGE · LIVE' : 'READ-ONLY · LOCAL SNAPSHOT';
    const solValue = sol.status === 'observed' ? `${Number(sol.sol || 0).toFixed(6)} SOL` : 'NO OBSERVADO';
    const btcValue = btc.status === 'observed' ? `${Number(btc.btc || 0).toFixed(8)} BTC` : 'NO OBSERVADO';
    root.innerHTML = `<section class="neon-wallet" aria-label="Dashboard de billetera NEON ORB">
      <header class="wallet-head">
        <div><span class="wallet-kicker">NEON ORB · TESORERÍA</span><h2>${PUBLIC_IDENTITY}</h2><small>Identidad pública · estado observable · sin claves privadas en frontend</small></div>
        <span class="wallet-live ${remote.connected ? 'is-live' : ''}"><i></i>${bridgeLabel}</span>
      </header>
      <div class="wallet-identity-grid">
        <div class="wallet-address"><small>SOLANA · PUBLIC ADDRESS</small><strong title="${esc(PUBLIC_ADDRESSES.solana)}">${esc(short(remote.wallet?.addresses?.solana || PUBLIC_ADDRESSES.solana))}</strong><span>${solValue}</span></div>
        <div class="wallet-address"><small>BITCOIN · PUBLIC ADDRESS</small><strong title="${esc(PUBLIC_ADDRESSES.bitcoin)}">${esc(short(remote.wallet?.addresses?.bitcoin || PUBLIC_ADDRESSES.bitcoin))}</strong><span>${btcValue}</span></div>
        <div class="wallet-health"><small>SALUD DEL PUENTE</small><strong>${remote.health?.ok ? 'HEALTHY' : 'OBSERVABLE'}</strong><span>${remote.health?.service || 'LOCAL LEDGER'}</span></div>
      </div>
      <div class="neon-balances">
        <div><small>NXC · COMPUTABLE</small><strong>${Number(state.internal.nxc).toFixed(6)}</strong></div>
        <div><small>CREDITS · COMPUTABLE</small><strong>${Number(state.internal.credits).toFixed(2)}</strong></div>
        <div><small>BITS · COMPUTABLE</small><strong>${Number(state.internal.bits).toFixed(2)}</strong></div>
        <div><small>BTC · VERIFIED LEDGER</small><strong>${(Number(state.external.btcSatoshis) / 1e8).toFixed(8)}</strong></div>
        <div><small>EUR · VERIFIED LEDGER</small><strong>€${Number(state.external.fiatEuroBalance).toFixed(2)}</strong></div>
      </div>
      <div class="wallet-source-note">COMPUTABLE ≠ EXTERNO · Los balances de red solo se muestran como observados cuando el bridge obtiene datos reales. Un estado pendiente nunca se presenta como liquidado.</div>
      <div class="neon-history"><table><thead><tr><th>Fecha</th><th>Origen</th><th>Divisa</th><th>Importe</th><th>Estado</th><th>ID</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Sin movimientos</td></tr>'}</tbody></table></div>
    </section>`;
  };

  const refresh = async () => {
    try {
      const [health, wallet, telemetry] = await Promise.all([
        fetchJson('/health'), fetchJson('/wallet'), fetchJson('/telemetry')
      ]);
      remote = { connected: true, health, wallet, telemetry };
    } catch {
      remote = { connected: false, health: null, wallet: null, telemetry: null };
    }
    render(ledger.getState());
  };

  render(ledger.getState());
  const unsubscribe = ledger.subscribe(render);
  refresh();
  const interval = setInterval(refresh, 7000);
  return () => { unsubscribe(); clearInterval(interval); };
}

globalThis.NeonWalletDashboard = { mountWalletDashboard, BRIDGE_URL, PUBLIC_IDENTITY, PUBLIC_ADDRESSES };
