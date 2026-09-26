/**
 * Canonical catalog for external economic sources.
 * The catalog describes what can be measured; it does not assert that a
 * provider is connected or that a source generates revenue.
 */
export const ECONOMIC_SOURCE_CATALOG = Object.freeze([
  { id:'PROGRAMMATIC_ADS', name:'Programmatic advertising', evidence:['impression','click','conversion','publisher-settlement'], requires:['ads.txt-or-equivalent','SSP/DSP-report'], risk:'MEDIUM', settlement:'FIAT' },
  { id:'DECENTRALIZED_STORAGE', name:'IPFS / Filecoin storage', evidence:['content-cid','storage-proof','provider-settlement'], requires:['content-cid','provider-proof'], risk:'HIGH', settlement:'NETWORK_ASSET' },
  { id:'WEB3_MICROPAYMENTS', name:'Web3 micropayments / smart contracts', evidence:['tx-hash','block-confirmation','recipient-match'], requires:['chain','txHash','confirmation'], risk:'HIGH', settlement:'ONCHAIN' },
  { id:'FINANCIAL_ORACLES', name:'Financial data oracles / APIs', evidence:['signed-quote','timestamp','source-id'], requires:['allowlisted-api'], risk:'HIGH', settlement:'REFERENCE_ONLY' },
  { id:'CDN_EDGE', name:'CDN / edge computing', evidence:['usage-meter','provider-invoice','settlement-reference'], requires:['provider-usage-report'], risk:'MEDIUM', settlement:'FIAT' },
  { id:'VALIDATOR_REWARDS', name:'Validator / node rewards', evidence:['epoch','reward-transaction','validator-id'], requires:['validator-id','network-proof'], risk:'HIGH', settlement:'NETWORK_ASSET' },
  { id:'TRANSCODING_STREAMING', name:'Transcoding / streaming APIs', evidence:['job-id','completed-job','provider-settlement'], requires:['job-id','provider-report'], risk:'MEDIUM', settlement:'FIAT' },
  { id:'AFFILIATE_REFERRALS', name:'Affiliate / referral programs', evidence:['click-id','conversion-id','network-settlement'], requires:['affiliate-network','conversion-id'], risk:'MEDIUM', settlement:'FIAT' },
  { id:'IDENTITY_ACCESS', name:'Identity / access services', evidence:['verified-event','paid-plan','provider-settlement'], requires:['provider-event'], risk:'LOW', settlement:'FIAT' },
  { id:'TELEMETRY_ANALYTICS', name:'Telemetry / performance analytics', evidence:['usage-event','billable-metric','provider-settlement'], requires:['privacy-safe-event','provider-report'], risk:'MEDIUM', settlement:'FIAT' }
]);

const byId = new Map(ECONOMIC_SOURCE_CATALOG.map(x => [x.id, x]));

export function getEconomicSource(id) {
  return byId.get(String(id || '').toUpperCase()) || null;
}

export function listEconomicSources() {
  return ECONOMIC_SOURCE_CATALOG.map(x => structuredClone(x));
}

export function validateEconomicObservation(input = {}) {
  const source = getEconomicSource(input.sourceType);
  if (!source) return { ok:false, code:'UNKNOWN_ECONOMIC_SOURCE' };

  const evidence = input.evidence && typeof input.evidence === 'object' ? input.evidence : {};
  const missing = source.evidence.filter(key => {
    if (key === 'block-confirmation') return !(Number(evidence.confirmations) > 0);
    if (key === 'timestamp') return !evidence.timestamp;
    return !evidence[key.replaceAll('-', '')] && !evidence[key];
  });

  const amount = Number(input.amountEUR);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok:false, code:'POSITIVE_COMPUTABLE_AMOUNT_REQUIRED', source };
  }

  return {
    ok: missing.length === 0,
    code: missing.length ? 'EVIDENCE_INCOMPLETE' : 'ECONOMIC_OBSERVATION_VERIFIED',
    source,
    missing
  };
}
