import { assertAllowedForExecution } from './provider-security.js';
import { getEconomicSource, listEconomicSources, verifySourceEvidence } from './economic-source-registry.js';

const SOURCE_CONFIG = Object.freeze({
  PROGRAMMATIC_ADS: { env: 'NEON_ECONOMIC_PROGRAMMATIC_ADS_URL', secret: 'NEON_SECRET_PROGRAMMATIC_ADS_API_KEY', mode: 'REPORTING_API', evidence: ['impression','click','conversion','providerSettlement'] },
  DECENTRALIZED_STORAGE: { env: 'NEON_ECONOMIC_DECENTRALIZED_STORAGE_URL', secret: 'NEON_SECRET_DECENTRALIZED_STORAGE_API_KEY', mode: 'STORAGE_PROOF_API', evidence: ['deal','proof','providerSettlement'] },
  WEB3_MICROPAYMENTS: { env: 'NEON_ECONOMIC_WEB3_MICROPAYMENTS_URL', secret: 'NEON_SECRET_WEB3_MICROPAYMENTS_API_KEY', mode: 'CHAIN_VERIFICATION_API', evidence: ['transactionReceipt','contractEvent','tokenAmount'] },
  FINANCIAL_ORACLES: { env: 'NEON_ECONOMIC_FINANCIAL_ORACLES_URL', secret: 'NEON_SECRET_FINANCIAL_ORACLES_API_KEY', mode: 'SIGNED_QUOTE_API', evidence: ['signedQuote','timestamp','sourceReference'] },
  CDN_EDGE: { env: 'NEON_ECONOMIC_CDN_EDGE_URL', secret: 'NEON_SECRET_CDN_EDGE_API_KEY', mode: 'USAGE_REPORT_API', evidence: ['usageMeter','billingRecord','jobReference'] },
  VALIDATOR_REWARDS: { env: 'NEON_ECONOMIC_VALIDATOR_REWARDS_URL', secret: 'NEON_SECRET_VALIDATOR_REWARDS_API_KEY', mode: 'CHAIN_REWARD_API', evidence: ['chainReceipt','validatorEpoch','rewardRecord'] },
  TRANSCODING_STREAMING: { env: 'NEON_ECONOMIC_TRANSCODING_STREAMING_URL', secret: 'NEON_SECRET_TRANSCODING_STREAMING_API_KEY', mode: 'JOB_USAGE_API', evidence: ['jobReceipt','usageMeter','providerSettlement'] },
  AFFILIATE_REFERRALS: { env: 'NEON_ECONOMIC_AFFILIATE_REFERRALS_URL', secret: 'NEON_SECRET_AFFILIATE_REFERRALS_API_KEY', mode: 'CONVERSION_REPORT_API', evidence: ['clickId','conversionId','commissionStatement'] },
  DECENTRALIZED_IDENTITY: { env: 'NEON_ECONOMIC_DECENTRALIZED_IDENTITY_URL', secret: 'NEON_SECRET_DECENTRALIZED_IDENTITY_API_KEY', mode: 'IDENTITY_EVENT_API', evidence: ['identityAssertion','billingRecord'] },
  TELEMETRY_ANALYTICS: { env: 'NEON_ECONOMIC_TELEMETRY_ANALYTICS_URL', secret: 'NEON_SECRET_TELEMETRY_ANALYTICS_API_KEY', mode: 'USAGE_ANALYTICS_API', evidence: ['usageReport','billingRecord','conversionMetric'] }
});

function configured(sourceId) {
  const cfg = SOURCE_CONFIG[sourceId];
  const url = cfg ? process.env[cfg.env] || null : null;
  let allowlisted = false;
  let origin = null;
  if (url) {
    try {
      const target = new URL(url);
      origin = target.origin;
      allowlisted = target.protocol === 'https:' && String(process.env.NEON_ALLOWED_PROVIDER_HOSTS || '')
        .split(',').map(x => x.trim().toLowerCase()).filter(Boolean).includes(target.hostname.toLowerCase());
    } catch { /* status reports invalid URL without throwing */ }
  }
  return { endpointConfigured: Boolean(url), endpointAllowlisted: allowlisted, origin, secretConfigured: Boolean(cfg?.secret && process.env[cfg.secret]), endpointEnv: cfg?.env || null };
}

export function listEconomicCapabilities() {
  return listEconomicSources().map(source => {
    const cfg = SOURCE_CONFIG[source.id];
    return {
      sourceId: source.id,
      label: source.label,
      class: source.class,
      settlement: source.defaultCurrency,
      integrationMode: cfg.mode,
      evidence: cfg.evidence,
      ...configured(source.id)
    };
  });
}

export function economicCapabilitiesStatus() {
  const capabilities = listEconomicCapabilities();
  const configuredCount = capabilities.filter(x => x.endpointConfigured && x.endpointAllowlisted).length;
  return {
    ok: true,
    total: capabilities.length,
    configured: configuredCount,
    productionReady: capabilities.filter(x => x.endpointConfigured && x.endpointAllowlisted).length,
    readVerifyOnly: true,
    capabilities
  };
}

export async function observeEconomicSource({ sourceId, payload = {}, timeoutMs = 8000 } = {}) {
  const id = String(sourceId || '').toUpperCase();
  const source = getEconomicSource(id);
  const cfg = SOURCE_CONFIG[id];
  if (!source || !cfg) throw new Error('UNKNOWN_ECONOMIC_SOURCE');
  const url = process.env[cfg.env];
  if (!url) throw new Error('ECONOMIC_SOURCE_ENDPOINT_NOT_CONFIGURED');
  const target = assertAllowedForExecution(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1000, Number(timeoutMs) || 8000));
  const apiKey = cfg.secret ? process.env[cfg.secret] : null;
  try {
    const headers = { 'content-type': 'application/json', accept: 'application/json' };
    if (apiKey) headers.authorization = `Bearer ${apiKey}`;
    const response = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sourceId: id, requestedAt: new Date().toISOString(), payload }),
      signal: controller.signal,
      cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`ECONOMIC_SOURCE_HTTP_${response.status}`);
    const verification = verifySourceEvidence({ sourceId: id, evidence: data });
    return { sourceId: id, providerOrigin: target.origin, integrationMode: cfg.mode, response: data, verification };
  } finally {
    clearTimeout(timer);
  }
}
