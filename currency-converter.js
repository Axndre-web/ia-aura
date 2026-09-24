import { neonOrbGovernor } from './economic-governor.js';
import { assertAllowedForExecution } from './provider-security.js';

const n = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;

export function calculateCurrencyConversion({
  fromCurrency, toCurrency, amount, rate, fee = 0, networkFee = 0,
  slippage = 0, quoteRef = null, expiresAt = null, quotedAt = null
} = {}) {
  const source = String(fromCurrency || '').toUpperCase();
  const target = String(toCurrency || '').toUpperCase();
  const input = n(amount);
  const fx = n(rate);
  const costs = n(fee) + n(networkFee) + n(slippage);
  if (!source || !target || source === target) throw new Error('VALID_CURRENCY_PAIR_REQUIRED');
  if (input <= 0 || fx <= 0) throw new Error('VALID_CONVERSION_AMOUNT_REQUIRED');

  const grossReceive = input * fx;
  const netReceive = grossReceive - costs;
  return {
    fromCurrency: source,
    toCurrency: target,
    amount: input,
    rate: fx,
    grossReceive,
    fee: n(fee),
    networkFee: n(networkFee),
    slippage: n(slippage),
    netReceive,
    quoteRef: quoteRef || null,
    quotedAt: quotedAt || new Date().toISOString(),
    expiresAt: expiresAt || null,
    economicallyPositive: netReceive > input
  };
}

export function assertFreshQuote(conversion) {
  if (conversion.expiresAt && Date.parse(conversion.expiresAt) <= Date.now()) {
    throw new Error('CONVERSION_QUOTE_EXPIRED');
  }
  if (!conversion.quoteRef) throw new Error('CONVERSION_QUOTE_REFERENCE_REQUIRED');
  return conversion;
}

export async function executeCurrencyConversion({ executeUrl, conversion, payload = {} } = {}) {
  assertFreshQuote(conversion);
  const auth = neonOrbGovernor.authorizeConversion({
    amountEUR: Number(conversion.amount),
    netReceiveEUR: Number(conversion.netReceive)
  });
  if (!auth.ok) return { ok: false, ...auth };

  const url = assertAllowedForExecution(executeUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ conversion, ...payload }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    neonOrbGovernor.recordConversion({
      status: response.ok && data?.accepted === true ? 'SUBMITTED' : 'FAILED',
      ...conversion,
      providerResult: data
    });
    return {
      ok: response.ok && data?.accepted === true,
      status: response.status,
      data
    };
  } finally {
    clearTimeout(timer);
  }
}
