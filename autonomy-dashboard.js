/** NEON ORB — Autonomous operations dashboard. Read-only presentation. */
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function mountAutonomyDashboard(root) {
  if (!root) return () => {};
  let state = { lastStatus: 'STARTING', execution: 'READ_VERIFY_ONLY', bridge: {}, economy: {}, opportunities: {} };
  let live = false;
  const render = () => {
    const bridge = state.bridge?.status || 'unknown';
    const caps = Number(state.economy?.configuredCapabilities || 0);
    const total = Number(state.economy?.totalCapabilities || 10);
    const opportunities = Number(state.opportunities?.verifiedPositive || 0);
    root.innerHTML = `<section class="neon-autonomy" aria-label="Autonomía operativa de Neon Orb">
      <header class="autonomy-head"><div><span>NEON ORB · AUTONOMÍA OPERATIVA</span><h2>BUSQUE LA <em>VIDA</em></h2><small>Supervisión autónoma · observación, verificación y planificación.</small></div><div class="autonomy-actions"><button class="autonomy-refresh" id="autonomyRefresh" type="button">↻ ACTUALIZAR</button><b class="autonomy-live ${live ? 'is-live':''}"><i></i>${live ? 'SUPERVISOR · LIVE' : 'LOCAL'}</b></div></header>
      <div class="autonomy-grid">
        <div><small>ESTADO</small><strong>${esc(state.lastStatus || 'UNKNOWN')}</strong></div>
        <div><small>BRIDGE</small><strong>${esc(bridge.toUpperCase())}</strong></div>
        <div><small>CAPACIDADES</small><strong>${caps}/${total}</strong></div>
        <div><small>OPORTUNIDADES</small><strong>${opportunities}</strong></div>
      </div>
      <div class="autonomy-policy"><span>EXECUTION</span><strong>${esc(state.execution || 'READ_VERIFY_ONLY')}</strong><span>FIRMA</span><strong>DESACTIVADA</strong><span>RETIROS</span><strong>DESACTIVADOS</strong></div>
      <p class="autonomy-note">La autonomía activa el ciclo de observación y verificación sin convertir datos en ingresos ficticios. La firma de transacciones, el gasto autónomo y los retiros permanecen fuera del ciclo automático.</p>
    </section>`;
    root.querySelector('#autonomyRefresh')?.addEventListener('click', refresh);
  };
  const refresh = async () => { try { const r=await fetch('/api/autonomy/status',{cache:'no-store'}); if(!r.ok) throw new Error(); state=await r.json(); live=true; } catch { live=false; } render(); };
  render(); refresh(); const timer=setInterval(refresh,10000); return ()=>clearInterval(timer);
}
