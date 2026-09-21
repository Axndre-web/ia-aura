/** NEON PLAYER X — Real Work Dashboard V11.7.1
 * Read-only visual layer. It never fabricates work, receipts or settlements.
 */
import { neonEconomicEngine } from '../core/economic-engine.js';

const BRIDGE_URL = (globalThis.NEON_BRIDGE_URL || 'http://127.0.0.1:8765').replace(/\/$/, '');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function fetchJson(path, timeout = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${BRIDGE_URL}${path}`, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}

function statusLabel(status = '') {
  const map = {
    IN_PROGRESS: 'EXECUTING',
    DELIVERED_PENDING_SETTLEMENT: 'DELIVERED',
    PAYMENT_PENDING_VERIFICATION: 'VERIFYING',
    PAID_VERIFIED: 'VERIFIED',
    PENDING_VERIFICATION: 'VERIFYING',
    VERIFIED: 'VERIFIED'
  };
  return map[status] || String(status || 'OBSERVABLE').replaceAll('_', ' ');
}

export function mountRealWorkDashboard(root) {
  if (!root) throw new Error('Real work dashboard root required');
  let bridge = { connected: false, work: null, receipts: null };

  const render = () => {
    const state = neonEconomicEngine.getState();
    const jobs = [...state.jobs].reverse().slice(0, 20);
    const settlements = [...state.settlements].reverse().slice(0, 20);
    const receipts = settlements.filter(s => s.status === 'VERIFIED' && (s.providerRef || s.metadata || s.txHash));
    const metrics = neonEconomicEngine.metrics();
    const active = jobs.filter(j => !['PAID_VERIFIED','CANCELLED'].includes(j.status));
    const rows = jobs.length ? jobs.map(job => `
      <tr><td>${esc(job.id)}</td><td>${esc(job.title)}</td><td><span class="rw-status">${esc(statusLabel(job.status))}</span></td><td>${esc(job.startedAt || '—')}</td><td>${esc(job.resultRef || job.evidence?.txHash || '—')}</td></tr>`).join('') : '<tr><td colspan="5">Sin trabajos registrados.</td></tr>';
    const receiptRows = receipts.length ? receipts.map(s => `<tr><td>${esc(s.id)}</td><td>${esc(s.provider)}</td><td>${esc(s.providerRef || '—')}</td><td>€${Number(s.amountEUR || 0).toFixed(2)}</td><td>${esc(statusLabel(s.status))}</td></tr>`).join('') : '<tr><td colspan="5">Sin recibos VERIFIED disponibles.</td></tr>';
    root.innerHTML = `<section class="real-work" aria-label="Trabajo real de Neon Orb">
      <header class="rw-head"><div><span class="wallet-kicker">NEON ORB · REAL WORK ENGINE</span><h2>TRABAJO <em>REAL</em></h2><small>Reflejo de alta precisión · solo datos registrados o verificados.</small></div><span class="rw-live ${bridge.connected ? 'is-live' : ''}"><i></i>${bridge.connected ? 'BRIDGE · LIVE' : 'LOCAL / OBSERVABLE'}</span></header>
      <div class="rw-metrics"><div><small>TRABAJOS ACTIVOS</small><strong>${active.length}</strong></div><div><small>INGRESO VERIFIED</small><strong>€${metrics.verifiedRevenueEUR.toFixed(2)}</strong></div><div><small>PENDIENTE</small><strong>€${metrics.pendingRevenueEUR.toFixed(2)}</strong></div><div><small>NETO VERIFIED</small><strong>€${metrics.netVerifiedEUR.toFixed(2)}</strong></div></div>
      <div class="rw-pipeline"><span class="active">EXECUTING</span><b>→</b><span>DELIVERED</span><b>→</b><span>VERIFYING</span><b>→</b><span>VERIFIED</span></div>
      <div class="rw-note">Solo una confirmación externa válida puede convertir una liquidación pendiente en <strong>VERIFIED</strong>. El panel no crea trabajos, clientes, firmas, hashes ni ingresos.</div>
      <div class="rw-section"><div class="rw-section-title"><h3>EJECUCIONES</h3><span>${jobs.length} registros</span></div><div class="rw-table"><table><thead><tr><th>JOB</th><th>TAREA</th><th>ESTADO</th><th>INICIO</th><th>RESULTADO / EVIDENCIA</th></tr></thead><tbody>${rows}</tbody></table></div></div>
      <div class="rw-section"><div class="rw-section-title"><h3>RECIBOS / SETTLEMENTS</h3><span>${settlements.length} registros</span></div><div class="rw-table"><table><thead><tr><th>SETTLEMENT</th><th>PROVEEDOR</th><th>REF / TX</th><th>IMPORTE</th><th>ESTADO</th></tr></thead><tbody>${receiptRows}</tbody></table></div></div>
      <div class="rw-source">Fuente local: Economic Engine · Fuente de red: NEON-LIM Bridge · Modo de esta vista: <strong>READ-ONLY</strong>.</div>
    </section>`;
  };

  const refresh = async () => {
    try {
      const [work, receipts] = await Promise.all([fetchJson('/work'), fetchJson('/receipts')]);
      bridge = { connected: true, work, receipts };
    } catch {
      bridge = { connected: false, work: null, receipts: null };
    }
    render();
  };

  render();
  const unsubscribe = neonEconomicEngine.subscribe(render);
  refresh();
  const interval = setInterval(refresh, 7000);
  return () => { unsubscribe(); clearInterval(interval); };
}
