const API = { sandbox: 'https://api-m.sandbox.paypal.com', live: 'https://api-m.paypal.com' };

export class PayPalProvider {
  constructor(secrets) { this.secrets = secrets; }
  async config() {
    return {
      clientId: await this.secrets.get('PAYPAL_CLIENT_ID'),
      clientSecret: await this.secrets.get('PAYPAL_CLIENT_SECRET'),
      mode: (process.env.NEON_PAYPAL_MODE || 'live').toLowerCase()
    };
  }
  async token(signal) {
    const c = await this.config();
    if (!c.clientId || !c.clientSecret) throw new Error('PAYPAL_CREDENTIALS_NOT_CONFIGURED');
    const base = API[c.mode] || API.live;
    const auth = Buffer.from(`${c.clientId}:${c.clientSecret}`).toString('base64');
    const r = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST', signal,
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    if (!r.ok) throw new Error(`PAYPAL_AUTH_HTTP_${r.status}`);
    return (await r.json()).access_token;
  }
  async verifyOrder(orderID, signal) {
    if (!orderID) throw new Error('PAYPAL_ORDER_ID_REQUIRED');
    const c = await this.config();
    const base = API[c.mode] || API.live;
    const token = await this.token(signal);
    const r = await fetch(`${base}/v2/checkout/orders/${encodeURIComponent(orderID)}`, {
      signal, headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    if (!r.ok) throw new Error(`PAYPAL_ORDER_HTTP_${r.status}`);
    const order = await r.json();
    const unit = order.purchase_units?.[0];
    const capture = unit?.payments?.captures?.find(x => x.status === 'COMPLETED');
    const amount = Number(capture?.amount?.value ?? unit?.amount?.value ?? 0);
    const currency = capture?.amount?.currency_code ?? unit?.amount?.currency_code ?? null;
    return {
      verified: order.status === 'COMPLETED' && Boolean(capture),
      provider: 'PAYPAL', providerRef: order.id,
      amountEUR: currency === 'EUR' ? amount : null,
      currency, status: order.status, captureID: capture?.id ?? null,
      rawReference: order.id
    };
  }
}
