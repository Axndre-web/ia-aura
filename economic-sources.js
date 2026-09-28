import test from 'node:test';
import assert from 'node:assert/strict';
import { listEconomicSources, verifySourceEvidence } from '../server/economic-source-registry.js';

test('economic source catalogue contains ten governed categories', () => {
  const sources = listEconomicSources();
  assert.equal(sources.length, 10);
  assert.ok(sources.some(x => x.id === 'PROGRAMMATIC_ADS'));
  assert.ok(sources.some(x => x.id === 'DECENTRALIZED_STORAGE'));
  assert.ok(sources.some(x => x.id === 'WEB3_MICROPAYMENTS'));
});

test('source evidence is not verified when required proof is missing', () => {
  const result = verifySourceEvidence({ sourceId: 'AFFILIATE_REFERRALS', evidence: {} });
  assert.equal(result.verified, false);
  assert.equal(result.code, 'SOURCE_EVIDENCE_INCOMPLETE');
});

test('verified source evidence has an immutable digest and economic amount only when supplied', () => {
  const result = verifySourceEvidence({
    sourceId: 'PROGRAMMATIC_ADS',
    evidence: {
      providerReference: 'AD-1', eventTimestamp: '2026-09-25T00:00:00Z', amountOrRate: 2,
      amountEUR: 1.25
    }
  });
  assert.equal(result.verified, true);
  assert.equal(result.economicAmountPresent, true);
  assert.equal(result.amountEUR, 1.25);
  assert.match(result.evidenceDigest, /^[a-f0-9]{64}$/);
});
