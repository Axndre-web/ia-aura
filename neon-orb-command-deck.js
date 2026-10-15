/** Neon Orb Command Deck — live telemetry view; never invents balances or mining output. */
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = (value, digits = 2) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value).toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
const eur = value => `€${number(value, 2)}`;
const atomicToDecimal = (raw, decimals) => {
  if (raw == null || decimals == null || !/^\\d+$/.test(String(raw))) return '—';
  const n = BigInt(String(raw)), unit = 10n ** BigInt(decimals);
  const whole = (n / unit).toString();
  const fraction = (n % unit).toString().padStart(decimals, '0').replace(/0+$/, '').slice(0, 6);
  return fraction ? `${whole}.${fraction}` : whole;
};
const decimalToAtomic = (raw, decimals) => {
  const match = String(raw ?? '').trim().match(/^(0|[1-9]\\d*)(?:\\.(\\d+))?$/);
  if (!match || (match[2] || '').length > decimals) return null;
  const whole = BigInt(match[1]), fraction = BigInt((match[2] || '').padEnd(decimals, '0') || '0');
  return (whole * (10n ** BigInt(decimals)) + fraction).toString();
};
async function getJson(url, timeout = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}

export function mountNeonOrbCommandDeck(root) {
  if (!root) return () => {};
  let daemon = null, accounting = null, runtime = null, mining = null, markets = null, wallet = null, swapQuote = null, swapError = null, swapBusy = false, payoutVerifications = {}, swapDirection = 'SOL_TO_USDC', swapAmount = '0.1', sources = [], jobs = [], query = '', remoteOnly = true;
  let busy = false, lastUpdated = null, errors = [];

  const render = () => {
    const running = daemon?.status === 'RUNNING';
    const discovered = Number(daemon?.discovery?.discovered || 0);
    const jobCards = jobs.length ? jobs.slice(0, 12).map(job => `
      <article class="orb-job-card"><div class="orb-job-top"><span class="orb-source-tag">${esc(job.sourceName || job.source || 'FUENTE EXTERNA')}</span><span class="orb-job-mode">${job.remote ? 'REMOTO' : esc(job.location || 'UBICACIÓN NO INDICADA')}</span></div>
      <h4>${esc(job.title || 'Oferta sin título')}</h4><p>${esc(job.company || 'Empresa no indicada')} · ${esc(job.location || 'Ubicación no indicada')}</p>
      <div class="orb-job-bottom"><span>${job.salaryText ? esc(job.salaryText) : 'Remuneración no publicada'}</span><a href="${esc(job.listingUrl || '#')}" target="_blank" rel="noopener noreferrer">VER OFERTA ↗</a></div></article>`).join('') : `<div class="orb-empty">${busy ? 'Consultando fuentes públicas…' : 'Aún no hay ofertas cargadas. Pulsa «Buscar oportunidades» para consultar los feeds.'}</div>`;

    root.innerHTML = `<section class="orb-command-deck" aria-label="Centro holográfico de Neon Orb">
      <header class="orb-deck-header"><div><span class="orb-deck-kicker">NEON ORB · NÚCLEO RESIDENTE / V11.9</span><h2>ORBITAL <em>COMMAND DECK</em></h2><p>Estado operativo, economía verificable, recursos observados y oportunidades externas en una sola vista.</p></div><div class="orb-deck-live ${running ? 'is-running' : ''}"><i></i>${running ? 'DAEMON ACTIVO' : esc(daemon?.status || 'CONECTANDO')}</div></header>
      <div class="orb-deck-grid">
        <article class="orb-holo-card orb-holo-core"><div class="orb-card-head"><span>01 / NÚCLEO</span><span class="orb-chip ${runtime?.ok ? 'good' : 'muted'}">${runtime?.ok ? 'RESIDENTE' : 'SIN RESPUESTA'}</span></div><div class="orb-core-visual" aria-hidden="true"><div class="orb-core-ring ring-a"></div><div class="orb-core-ring ring-b"></div><div class="orb-core-sphere">ORB</div></div><strong class="orb-big-value">${esc(runtime?.runtime || 'NATIVE')}</strong><p>${runtime?.heartbeatAt ? `Último latido: ${esc(new Date(runtime.heartbeatAt).toLocaleTimeString('es-ES'))}` : 'Esperando telemetría del núcleo'}</p><div class="orb-mini-stats"><span>LATIDOS <b>${number(runtime?.heartbeatCount, 0)}</b></span><span>MEMORIA <b>${number(runtime?.memoryCount, 0)}</b></span></div></article>
        <article class="orb-holo-card"><div class="orb-card-head"><span>02 / ECONOMÍA REAL</span><span class="orb-chip ${accounting ? 'good' : 'muted'}">${accounting ? 'CONTABILIZADA' : 'SIN DATOS'}</span></div><div class="orb-finance-main"><small>NETO REALIZADO</small><strong>${accounting ? eur(accounting.realizedNetEUR) : '—'}</strong><span>EUR · basado en evidencia</span></div><div class="orb-finance-lines"><div><span>Ingresos verificados</span><b>${accounting ? eur(accounting.verifiedRevenueEUR) : '—'}</b></div><div><span>Costes confirmados</span><b>${accounting ? eur(accounting.confirmedSpendEUR) : '—'}</b></div><div><span>Liquidaciones pendientes</span><b>${number(accounting?.pendingSettlementCount, 0)}</b></div></div><p class="orb-card-footnote">Los créditos internos y las oportunidades no se suman a los ingresos cobrados.</p></article>
        <article class="orb-holo-card"><div class="orb-card-head"><span>03 / DAEMON DE TRABAJO</span><span class="orb-chip ${running ? 'good' : 'warn'}">${running ? 'EN CICLO' : 'EN ESPERA'}</span></div><strong class="orb-daemon-count">${number(daemon?.tickCount, 0)} <small>CICLOS</small></strong><div class="orb-finance-lines"><div><span>Último ciclo</span><b>${daemon?.lastTickAt ? esc(new Date(daemon.lastTickAt).toLocaleTimeString('es-ES')) : '—'}</b></div><div><span>Feeds consultados</span><b>${number(sources.length, 0)}</b></div><div><span>Oportunidades del último ciclo</span><b>${number(discovered, 0)}</b></div></div><p class="orb-card-footnote">${daemon?.lastError ? `Aviso operativo: ${esc(daemon.lastError)}` : 'El daemon observa, concilia y descubre; no declara ingresos sin verificación.'}</p></article>
        <article class="orb-holo-card orb-holo-mining"><div class="orb-card-head"><span>04 / MINADO Y CÓMPUTO</span><span class="orb-chip ${mining?.status === 'ACCOUNT_OBSERVED' ? 'good' : 'warn'}">${mining?.status === 'ACCOUNT_OBSERVED' ? 'POOL · CUENTA OBSERVADA' : esc(mining?.status || 'NO VERIFICADO')}</span></div><div class="orb-mining-icon" aria-hidden="true">⌁</div><strong class="orb-big-value">${esc(mining?.pool || 'POOL NO CONFIGURADO')}</strong><p>${esc(mining?.note || 'Esperando telemetría pública del pool. El panel no inicia mineros ni consume recursos por su cuenta.')}</p><div class="orb-finance-lines"><div><span>Hashrate de la cuenta</span><b>${mining?.account?.hashrateCurrent != null ? `${number(mining.account.hashrateCurrent, 2)} H/s` : '—'}</b></div><div><span>Trabajadores en línea</span><b>${mining?.account?.workersOnline ?? '—'}</b></div><div><span>Shares aceptadas (30 min)</span><b>${mining?.acceptedShares ?? '—'}</b></div><div><span>Shares rechazadas (30 min)</span><b>${mining?.rejectedShares ?? '—'}</b></div><div><span>Shares stale (30 min)</span><b>${mining?.staleShares ?? '—'}</b></div><div><span>Saldo pendiente (unidad API · ${esc(mining?.rewards?.currency || mining?.coin || '')})</span><b>${mining?.rewards?.pending != null ? esc(String(mining.rewards.pending)) : '—'}</b></div><div><span>Total pagado (unidad API · ${esc(mining?.rewards?.currency || mining?.coin || '')})</span><b>${mining?.rewards?.paid != null ? esc(String(mining.rewards.paid)) : '—'}</b></div></div><p class="orb-card-footnote">${mining?.poolStats ? `Pool: ${number(mining.poolStats.miners, 0)} mineros · ${number(mining.poolStats.workers, 0)} workers reportados.` : 'Sin estadísticas de pool disponibles.'} Las cifras del pool no equivalen por sí solas a un pago on-chain verificado.</p>${mining?.account?.recentPayments?.length ? `<div class="orb-payout-list"><h4>PAGOS PUBLICADOS POR EL POOL</h4>${mining.account.recentPayments.slice(0, 3).map(payment => `<div class="orb-payout-row"><span>${payment.timestamp ? esc(new Date(payment.timestamp).toLocaleString('es-ES')) : 'Fecha no disponible'}</span><code>${payment.txid ? `${esc(payment.txid.slice(0, 12))}…` : 'TX no disponible'}</code><span>${payment.amountRaw != null ? `Unidad API: ${esc(payment.amountRaw)}` : 'Importe no disponible'}</span>${payment.txid ? `<button type="button" data-payout-verify="${esc(payment.txid)}" ${payoutVerifications[payment.txid]?.busy ? 'disabled' : ''}>${payoutVerifications[payment.txid]?.busy ? 'VERIFICANDO…' : 'VERIFICAR EN RED'}</button>` : ''}${payoutVerifications[payment.txid]?.result ? `<em>${payoutVerifications[payment.txid].result.verified ? `CONFIRMADO · ${number(payoutVerifications[payment.txid].result.amountBTCToAddress, 8)} BTC` : esc(payoutVerifications[payment.txid].result.code || 'NO VERIFICADO')}</em>` : ''}</div>`).join('')}</div>` : ''}</article>
      </div>
      <section class="orb-market-section"><header class="orb-op-head"><div><span class="orb-deck-kicker">05 / ACTIVOS Y CONTABILIDAD DE RED</span><h3>MARKET <em>TELEMETRY</em></h3><p>Precios spot indicativos y balances observados desde APIs públicas. No ejecuta intercambios ni firma transacciones.</p></div><span class="orb-chip ${markets?.quotes?.some(q => q.verified) ? 'good' : 'muted'}">${markets?.quotes?.some(q => q.verified) ? 'COTIZACIONES LIVE' : 'ESPERANDO MERCADO'}</span></header><div class="orb-market-grid">${(markets?.quotes || []).filter(q => ['USD','EUR'].includes(q.fiat) && ['BTC','ETH','SOL','USDC','ETC'].includes(q.asset)).map(q => `<article class="orb-market-tile"><small>${esc(q.asset)} / ${esc(q.fiat)}</small><strong>${q.verified ? `${q.fiat === 'EUR' ? '€' : '$'}${number(q.price, q.price < 1 ? 5 : 2)}` : 'NO DISPONIBLE'}</strong><span>${esc(q.source || 'SIN FUENTE')} · ${q.verified ? 'OBSERVADO' : 'NO VERIFICADO'}</span></article>`).join('') || '<div class="orb-empty">Consultando cotizaciones públicas…</div>'}</div><div class="orb-swap-quote"><div class="orb-swap-head"><div><h4>COTIZACIÓN REAL DE RUTA · SOLANA</h4><p>Jupiter Swap API · consulta solamente; Neon Orb no firma ni transmite la operación.</p></div><span class="orb-chip ${swapQuote?.ok ? 'good' : 'muted'}">${swapQuote?.ok ? 'RUTA COTIZADA' : 'SIN ORDEN'}</span></div><div class="orb-swap-controls"><label>Dirección<select id="orbSwapDirection"><option value="SOL_TO_USDC" ${swapDirection === 'SOL_TO_USDC' ? 'selected' : ''}>SOL → USDC</option><option value="USDC_TO_SOL" ${swapDirection === 'USDC_TO_SOL' ? 'selected' : ''}>USDC → SOL</option></select></label><label>Importe<input id="orbSwapAmount" type="number" min="0.000001" step="any" max="1000000" value="${esc(swapAmount)}"></label><button id="orbSwapQuoteButton" type="button" ${swapBusy ? 'disabled' : ''}>${swapBusy ? 'COTIZANDO…' : 'OBTENER COTIZACIÓN'}</button></div>${swapError ? `<p class="orb-swap-error">${esc(swapError)}</p>` : ''}${swapQuote?.ok ? `<div class="orb-swap-result"><div><small>RECIBIRÍAS APROX.</small><strong>${atomicToDecimal(swapQuote.quote.outAmount, swapQuote.quote.outputDecimals)} ${swapDirection === 'SOL_TO_USDC' ? 'USDC' : 'SOL'}</strong></div><div><small>IMPACTO DE PRECIO</small><strong>${swapQuote.quote.priceImpactPct != null ? `${number(Number(swapQuote.quote.priceImpactPct) * 100, 4)}%` : '—'}</strong></div><div><small>RUTA / CONTEXTO</small><strong>${swapQuote.quote.routePlanCount ?? '—'} · slot ${swapQuote.quote.contextSlot ?? '—'}</strong></div><p>${esc(swapQuote.note || 'Cotización indicativa; no ejecutada.')}</p></div>` : '<p class="orb-swap-footnote">Una cotización no reserva el precio. Antes de ejecutar cualquier intercambio deben comprobarse comisiones, deslizamiento, saldo, autorización de firma y confirmación on-chain.</p>'}</div><div class="orb-wallet-observed"><h4>BALANCES DE RED OBSERVADOS</h4><div class="orb-observed-grid">${(wallet?.balances || []).map(b => `<article><small>${esc(b.asset)} · ${b.verified ? 'VERIFICADO EN RED' : 'NO DISPONIBLE'}</small><strong>${b.verified ? `${number(b.amount, b.asset === 'BTC' ? 8 : 6)} ${esc(b.unit)}` : esc(b.error || 'Sin datos')}</strong><span>${b.source ? esc(b.source) : 'Fuente no conectada'}</span></article>`).join('') || '<div class="orb-empty">Balances pendientes de consulta.</div>'}</div></div><p class="orb-card-footnote">Los precios spot no son cotizaciones ejecutables. Una ruta de Jupiter tampoco es una liquidación: para confirmar un intercambio debe verificarse su firma en cadena.</p></section>
      <section class="orb-opportunities"><header class="orb-op-head"><div><span class="orb-deck-kicker">05 / EXPLORACIÓN EXTERNA</span><h3>OPORTUNIDADES <em>DE TRABAJO</em></h3><p>Ofertas públicas enlazadas a su fuente original. Descubrir no significa ser contratado ni cobrar.</p></div><div class="orb-op-controls"><input id="orbJobQuery" type="search" maxlength="100" value="${esc(query)}" placeholder="Ej. JavaScript, diseño, soporte" aria-label="Buscar ofertas por palabra clave"><label class="orb-remote-toggle"><input id="orbRemoteOnly" type="checkbox" ${remoteOnly ? 'checked' : ''}> Solo remoto</label><button id="orbJobSearch" type="button" ${busy ? 'disabled' : ''}>${busy ? 'BUSCANDO…' : '⌕ BUSCAR OPORTUNIDADES'}</button></div></header>
      <div class="orb-source-strip">${sources.length ? sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" class="orb-source-pill"><i></i>${esc(s.name)} <small>${esc(s.mode === 'READ_ONLY_DISCOVERY' ? 'FEED PÚBLICO' : s.mode.replaceAll('_', ' '))}</small></a>`).join('') : '<span class="orb-muted-note">Cargando catálogo de fuentes…</span>'}</div>
      <div id="orbJobResults" class="orb-job-grid">${jobCards}</div><div class="orb-results-foot"><span>${number(jobs.length, 0)} resultados cargados · ${lastUpdated ? `actualizado ${esc(new Date(lastUpdated).toLocaleTimeString('es-ES'))}` : 'sin consulta todavía'}</span><span>${errors.length ? `${errors.length} fuente(s) con errores parciales` : 'Lectura pública · sin acciones automáticas'}</span></div>
      </section>
      <footer class="orb-deck-footer"><span>IDENTIDAD: NEON ORB</span><span>ACTUALIZACIÓN ${lastUpdated ? esc(new Date(lastUpdated).toLocaleTimeString('es-ES')) : 'PENDIENTE'}</span><button id="orbDeckRefresh" type="button" ${busy ? 'disabled' : ''}>↻ ACTUALIZAR ESTADO</button></footer>
    </section>`;

    root.querySelector('#orbSwapDirection')?.addEventListener('change', e => { swapDirection = e.currentTarget.value; swapQuote = null; swapError = null; render(); });
    root.querySelector('#orbSwapAmount')?.addEventListener('input', e => { swapAmount = e.currentTarget.value; });
    root.querySelector('#orbSwapQuoteButton')?.addEventListener('click', requestSwapQuote);
    root.querySelectorAll('[data-payout-verify]')?.forEach(button => button.addEventListener('click', () => verifyPayout(button.dataset.payoutVerify)));
    root.querySelector('#orbJobSearch')?.addEventListener('click', () => { query = root.querySelector('#orbJobQuery')?.value || ''; remoteOnly = Boolean(root.querySelector('#orbRemoteOnly')?.checked); refreshJobs(); });
    root.querySelector('#orbJobQuery')?.addEventListener('keydown', e => { if (e.key === 'Enter') { query = e.currentTarget.value; remoteOnly = Boolean(root.querySelector('#orbRemoteOnly')?.checked); refreshJobs(); } });
    root.querySelector('#orbDeckRefresh')?.addEventListener('click', refreshAll);
  };

  async function verifyPayout(txid) {
    if (globalThis.NEON_STATIC_MODE) { swapError = 'La verificación de pagos requiere un backend/servicio de cadena; GitHub Pages funciona en modo lectura local.'; render(); return; }
    if (!/^[a-fA-F0-9]{64}$/.test(String(txid || ''))) return;
    payoutVerifications[txid] = { busy: true, result: null }; render();
    try {
      const result = await getJson(`/api/neon-orb/mining/payout/${encodeURIComponent(txid)}/verify`);
      payoutVerifications[txid] = { busy: false, result };
    } catch (error) {
      payoutVerifications[txid] = { busy: false, result: { verified: false, code: String(error?.message || 'CHAIN_VERIFICATION_UNAVAILABLE') } };
    }
    render();
  }

  async function requestSwapQuote() {
    if (globalThis.NEON_STATIC_MODE) { swapError = 'Las cotizaciones de intercambio necesitan un backend de proxy. No se ejecuta ni firma ninguna operación en la versión estática.'; swapQuote = null; render(); return; }
    if (swapBusy) return;
    swapAmount = root.querySelector('#orbSwapAmount')?.value || swapAmount;
    swapDirection = root.querySelector('#orbSwapDirection')?.value || swapDirection;
    const solToUsdc = swapDirection === 'SOL_TO_USDC';
    const decimals = solToUsdc ? 9 : 6;
    const amount = decimalToAtomic(swapAmount, decimals);
    if (!amount || BigInt(amount) <= 0n) {
      swapError = `Introduce un importe positivo con un máximo de ${decimals} decimales.`;
      swapQuote = null; render(); return;
    }
    const inputMint = solToUsdc ? 'So11111111111111111111111111111111111111112' : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const outputMint = solToUsdc ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' : 'So11111111111111111111111111111111111111112';
    swapBusy = true; swapError = null; swapQuote = null; render();
    try {
      const params = new URLSearchParams({ inputMint, outputMint, amount, slippageBps: '50' });
      const data = await getJson(`/api/neon-orb/solana/swap-quote?${params}`);
      if (!data.ok) throw new Error(data.code || 'QUOTE_UNAVAILABLE');
      swapQuote = data;
    } catch (error) {
      swapError = `No se pudo obtener una ruta: ${String(error?.message || 'QUOTE_UNAVAILABLE').slice(0, 120)}`;
    } finally {
      swapBusy = false; render();
    }
  }

  async function refreshJobs() {
    if (globalThis.NEON_STATIC_MODE) { jobs = []; errors = []; lastUpdated = new Date().toISOString(); render(); return; }
    if (busy) return;
    busy = true; render();
    try {
      const params = new URLSearchParams({ q: query, remote: String(remoteOnly), limit: '30' });
      const data = await getJson(`/api/neon-orb/work-opportunities?${params}`);
      jobs = Array.isArray(data.jobs) ? data.jobs : []; errors = Array.isArray(data.errors) ? data.errors : []; lastUpdated = data.queriedAt || new Date().toISOString();
    } catch (error) { errors = [{ code: String(error?.message || 'work_feed_unavailable') }]; }
    finally { busy = false; render(); }
  }

  async function refreshAll() {
    if (globalThis.NEON_STATIC_MODE) { daemon = { status: 'STATIC FRONTEND', tickCount: 0, discovery: { discovered: 0 } }; runtime = { runtime: 'BROWSER-ONLY', ok: false, heartbeatCount: 0, memoryCount: 0 }; accounting = null; mining = null; markets = null; wallet = null; sources = [{ name: 'GitHub Pages', url: 'https://pages.github.com/', mode: 'STATIC_ONLY' }]; jobs = []; errors = []; lastUpdated = new Date().toISOString(); render(); return; }
    if (busy) return;
    busy = true; render();
    const requests = await Promise.allSettled([
      getJson('/api/neon-orb/daemon'), getJson('/api/neon-orb/status'), getJson('/api/neon-orb/work-sources'),
      getJson('/api/neon-orb/mining/status'), getJson('/api/neon-orb/market-data?assets=BTC,ETH,SOL,USDC,ETC&fiats=USD,EUR'),
      getJson('/api/neon-orb/wallet/observed')
    ]);
    if (requests[0].status === 'fulfilled') { daemon = requests[0].value.daemon || null; accounting = requests[0].value.accounting || null; }
    if (requests[1].status === 'fulfilled') runtime = requests[1].value;
    if (requests[2].status === 'fulfilled') sources = requests[2].value.sources || [];
    if (requests[3].status === 'fulfilled') mining = requests[3].value;
    if (requests[4].status === 'fulfilled') markets = requests[4].value;
    if (requests[5].status === 'fulfilled') wallet = requests[5].value;
    busy = false; lastUpdated = new Date().toISOString(); render();
  }

  render();
  void refreshAll();
  const interval = globalThis.NEON_STATIC_MODE ? null : setInterval(refreshAll, 20000);
  return () => { if (interval) clearInterval(interval); };
}
