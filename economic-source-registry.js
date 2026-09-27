import crypto from 'node:crypto';

const now = () => new Date().toISOString();
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Canonical catalogue of external economic/data sources.
 * A source being listed here does NOT mean revenue exists. Each adapter must
 * produce evidence before an opportunity or asset can enter the economic core.
 */
export const ECONOMIC_SOURCES = Object.freeze([
  {
    id: 'PROGRAMMATIC_ADS',
    label: 'Publicidad programática',
    class: 'REVENUE',
    evidence: ['impression', 'click', 'conversion', 'providerSettlement'],
    requires: ['providerReference', 'eventTimestamp', 'amountOrRate'],
    defaultCurrency: 'EUR'
  },
  {
    id: 'DECENTRALIZED_STORAGE',
    label: 'Almacenamiento descentralizado IPFS/Filecoin',
    class: 'INFRASTRUCTURE_OR_REWARD',
    evidence: ['deal', 'proof', 'providerSettlement'],
    requires: ['networkReference', 'dealOrJobReference', 'settlementEvidence'],
    defaultCurrency: 'EUR'
  },
  {
    id: 'WEB3_MICROPAYMENTS',
    label: 'Microtransacciones Web3 / smart contracts',
    class: 'REVENUE',
    evidence: ['transactionReceipt', 'contractEvent', 'tokenAmount'],
    requires: ['chain', 'transactionHash', 'confirmedState'],
    defaultCurrency: 'EUR'
  },
  {
    id: 'FINANCIAL_ORACLES',
    label: 'Oráculos de datos y APIs financieras',
    class: 'DATA_INPUT',
    evidence: ['signedQuote', 'timestamp', 'sourceReference'],
    requires: ['quoteReference', 'timestamp', 'source'],
    defaultCurrency: 'EUR'
  },
  {
    id: 'CDN_EDGE',
    label: 'CDN y edge computing',
    class: 'REVENUE_OR_COST',
    evidence: ['usageMeter', 'billingRecord', 'jobReference'],
    requires: ['providerReference', 'meterPeriod', 'usageOrBilling'],
    defaultCurrency: 'EUR'
  },
  {
    id: 'VALIDATOR_REWARDS',
    label: 'Recompensas de nodos validadores',
    class: 'REWARD',
    evidence: ['chainReceipt', 'validatorEpoch', 'rewardRecord'],
    requires: ['chain', 'address', 'epochOrBlock', 'transactionOrStateReference'],
    defaultCurrency: 'EUR'
  },
  {
    id: 'TRANSCODING_STREAMING',
    label: 'Transcodificación y streaming externo',
    class: 'REVENUE_OR_COST',
    evidence: ['jobReceipt', 'usageMeter', 'providerSettlement'],
    requires: ['providerReference', 'jobReference', 'usageOrSettlement'],
    defaultCurrency: 'EUR'
  },
  {
    id: 'AFFILIATE_REFERRALS',
    label: 'Afiliados y referidos',
    class: 'REVENUE',
    evidence: ['clickId', 'conversionId', 'commissionStatement'],
    requires: ['networkReference', 'conversionReference', 'commissionEvidence'],
    defaultCurrency: 'EUR'
  },
  {
    id: 'DECENTRALIZED_IDENTITY',
    label: 'Identidad y autenticación externa',
    class: 'ACCESS_OR_COST',
    evidence: ['identityAssertion', 'billingRecord'],
    requires: ['issuer', 'subjectReference', 'timestamp'],
    defaultCurrency: 'EUR'
  },
  {
    id: 'TELEMETRY_ANALYTICS',
    label: 'Telemetría y analítica',
    class: 'DATA_INPUT_OR_COST',
    evidence: ['usageReport', 'billingRecord', 'conversionMetric'],
    requires: ['providerReference', 'period', 'reportReference'],
    defaultCurrency: 'EUR'
  }
]);

const byId = new Map(ECONOMIC_SOURCES.map(x => [x.id, x]));

export function getEconomicSource(id) {
  return byId.get(String(id || '').toUpperCase()) || null;
}

export function listEconomicSources() {
  return ECONOMIC_SOURCES.map(x => structuredClone(x));
}

export function verifySourceEvidence({ sourceId, evidence = {} } = {}) {
  const source = getEconomicSource(sourceId);
  if (!source) return { verified: false, code: 'UNKNOWN_ECONOMIC_SOURCE' };

  const missing = source.requires.filter(field => {
    const value = evidence[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length) {
    return { verified: false, code: 'SOURCE_EVIDENCE_INCOMPLETE', sourceId: source.id, missing };
  }

  const numericAmount = Number(evidence.amountEUR ?? evidence.amount ?? NaN);
  const hasEconomicAmount = Number.isFinite(numericAmount) && numericAmount > 0;

  return {
    verified: true,
    code: 'SOURCE_EVIDENCE_VERIFIED',
    sourceId: source.id,
    class: source.class,
    evidenceDigest: digest(evidence),
    verifiedAt: now(),
    economicAmountPresent: hasEconomicAmount,
    amountEUR: hasEconomicAmount ? numericAmount : null
  };
}
