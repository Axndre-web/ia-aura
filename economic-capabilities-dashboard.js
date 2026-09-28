/** NEON ORB — External Economic Capabilities Dashboard.
 * Read-only by default. Shows configuration/verification state, never invents connectivity or revenue.
 */
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function mountEconomicCapabilitiesDashboard(root) {
  if (!root) return () => {};
  let state = { total: 10, configured: 0, capabilities: [] };
  let live = false;
  const labels = { PROGRAMMATIC_ADS:'Publicidad programática', DECENTRALIZED_STORAGE:'IPFS / Filecoin', WEB3_MICROPAYMENTS:'Microtransacciones Web3', FINANCIAL_ORACLES:'Oráculos financieros', CDN_EDGE:'CDN / Edge', VALIDATOR_REWARDS:'Nodos validadores', TRANSCODING_STREAMING:'Transcodificación / streaming', AFFILIATE_REFERRALS:'Afiliados / referidos', DECENTRALIZED_IDENTITY:'Identidad / acceso', TELEMETRY_ANALYTICS:'Telemetría / analítica' };
  const render = () => {
    const rows = state.capabilities.map(x => {
      const ready = x.endpointConfigured && x.endpointAllowlisted;
      const config = x.endpointConfigured ? (x.endpointAllowlisted ? 'CONFIGURADO' : 'HOST NO AUTORIZADO') : 'NO CONFIGURADO';
      return `<article class="econ-cap-row"><div class="econ-cap-main"><span class="econ-cap-index">${esc(x.sourceId)}</span><strong>${esc(labels[x.sourceId] || x.label)}</strong><small>${esc(x.integrationMode)} · evidencia: ${esc((x.evidence||[]).join(', '))}</small></div><div class="econ-cap-status ${ready ? 'is-ready' : ''}"><i></i>${config}</div></article>`;
    }).join('');
    root.innerHTML = `<section class="econ-capabilities" aria-label="Capacidades económicas externas de Neon Orb"><header><div><span>NEON ORB · EXTERNAL ECONOMY</span><h2>10 CAPACIDADES <em>COMPUTABLES</em></h2><small>Estado real de integración · sin convertir configuración en ingresos.</small></div><div class="econ-actions"><button class="econ-refresh" id="econRefresh" type="button">↻ ACTUALIZAR</button><b class="econ-live ${live ? 'is-live':''}"><i></i>${live ? 'API · LIVE' : 'LOCAL'}</b></div></header><div class="econ-cap-metrics"><div><small>CAPACIDADES</small><strong>${state.total}</strong></div><div><small>CONFIGURADAS</small><strong>${state.configured}</strong></div><div><small>VERIFICACIÓN</small><strong>READ / VERIFY</strong></div><div><small>EJECUCIÓN</small><strong>GOBERNADA</strong></div></div><div class="econ-cap-list">${rows || '<div class="econ-empty">Sin catálogo disponible.</div>'}</div><p class="econ-cap-note">Una capacidad solo se considera operativa cuando su endpoint está configurado, usa HTTPS y su host está expresamente incluido en <code>NEON_ALLOWED_PROVIDER_HOSTS</code>. La evidencia debe verificarse antes de entrar en el núcleo económico.</p></section>`;
    root.querySelector('#econRefresh')?.addEventListener('click', refresh);
  };
  const refresh = async () => { try { const r=await fetch('/api/economy/capabilities',{cache:'no-store'}); if(!r.ok) throw new Error(); state=await r.json(); live=true; } catch { live=false; } render(); };
  render(); refresh();
  const timer=setInterval(refresh,10000);
  return ()=>clearInterval(timer);
}
