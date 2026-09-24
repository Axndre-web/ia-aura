export class StripeProvider {
  constructor(secrets) { this.secrets = secrets; }
  async verifyPaymentIntent(paymentIntentId, signal) {
    const key = await this.secrets.get('STRIPE_SECRET_KEY', { required: true });
    if (!paymentIntentId) throw new Error('STRIPE_PAYMENT_INTENT_REQUIRED');
    const r = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`, {
      signal, headers: { Authorization: `Bearer ${key}` }
    });
    if (!r.ok) throw new Error(`STRIPE_PAYMENT_INTENT_HTTP_${r.status}`);
    const pi = await r.json();
    const amountEUR = pi.currency === 'eur' ? Number(pi.amount_received || pi.amount || 0) / 100 : null;
    return {
      verified: pi.status === 'succeeded', provider: 'STRIPE', providerRef: pi.id,
      amountEUR, currency: pi.currency?.toUpperCase() ?? null, status: pi.status
    };
  }
}
