/** Account readiness panel. Reports configuration state without exposing secret values. */
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = { CONFIGURED_UNVERIFIED: 'CONFIGURADO · SIN VERIFICAR', CONFIGURATION_REQUIRED: 'FALTAN VARIABLES', MANUAL_SETUP_REQUIRED: 'ALTA / CONEXIÓN MANUAL' };

export async function mountAccountReadiness(root) {
  if (!root) return () => {};
  let payload = null;
  let error = '';
  const render = () => {
    const cards = (payload?.integrations || []).map(item => `
      <article class="ar-card"><div class="ar-card-top"><span>${esc(item.category)}</span><b class="ar-status ${item.status === 'CONFIGURED_UNVERIFIED' ? 'ar-configured' : ''}">${esc(labels[item.status] || item.status)}</b></div>
      <h3>${esc(item.name)}</h3><p>${esc(item.note)}</p>
      ${item.missingKeys?.length ? `<small class="ar-missing">Variables pendientes: ${item.missingKeys.map(esc).join(', ')}</small>` : ''}
      <a href="${esc(item.signupUrl)}" target="_blank" rel="noopener noreferrer">Abrir sitio oficial ↗</a></article>`).join('');
    root.innerHTML = `<section class="ar-panel" aria-label="Preparación de cuentas y cobros"><header class="ar-head"><div><span class="wallet-kicker">NEON ORB · CUENTAS Y LIQUIDACIÓN</span><h2>PREPARACIÓN <em>DE CUENTAS</em></h2><p>Estado de configuración, sin mostrar secretos ni iniciar sesión en tu nombre.</p></div><button class="ar-refresh" type="button">ACTUALIZAR</button></header>
      <div class="ar-banner"><strong>Transparencia:</strong> una cuenta creada o una variable configurada no demuestra que la API funcione ni que exista dinero ganado. La autenticación, verificación de identidad y aceptación de condiciones se completan en el proveedor.</div>
      ${error ? `<p class="ar-error">${esc(error)}</p>` : ''}<div class="ar-grid">${cards || (error ? '<p class="ar-static-note">Panel informativo estático · sin conexión a proveedores.</p>' : '<p>Cargando estado…</p>')}</div>
      <footer class="ar-foot">Protección activa: no se solicitan contraseñas, códigos 2FA, frases semilla ni claves privadas. Las retiradas y firmas siguen deshabilitadas por defecto.</footer></section>`;
    root.querySelector('.ar-refresh')?.addEventListener('click', load);
  };
  async function load() {
    error = '';
    if (globalThis.NEON_STATIC_MODE) { payload = { integrations: [] }; error = 'Modo GitHub Pages: las cuentas, la verificación de identidad y los pagos requieren conexión manual al proveedor o un backend seguro. No se han consultado ni expuesto credenciales.'; render(); return; }
    try {
      const response = await fetch('/api/neon-orb/account-readiness', { cache: 'no-store', headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`Estado no disponible (HTTP ${response.status})`);
      payload = await response.json();
    } catch (e) { error = e?.message || 'No se pudo leer la configuración.'; }
    render();
  }
  render();
  await load();
  return () => {};
}
