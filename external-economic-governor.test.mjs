import test from 'node:test';
import assert from 'node:assert/strict';
import { ExternalEconomicGovernor } from '../server/external-economic-governor.js';

class MemoryStore {
  constructor() { this.value = null; }
  async init(def) { this.value ??= structuredClone(def); return structuredClone(this.value); }
  async write(value) { this.value = structuredClone(value); }
}

test('pending external revenue never becomes verified revenue', async () => {
  const g = new ExternalEconomicGovernor(new MemoryStore(), { maxSingleSettlementEUR: 1000 });
  await g.init();
  const pending = await g.recordPendingSettlement({ provider: 'TEST_PROVIDER', providerRef: 'ORDER-1', amountEUR: 100 });
  assert.equal(g.status().metrics.verifiedRevenueEUR, 0);
  assert.equal(pending.status, 'PENDING_VERIFICATION');
});

test('verification requires explicit trusted provider confirmation', async () => {
  const g = new ExternalEconomicGovernor(new MemoryStore());
  await g.init();
  const pending = await g.recordPendingSettlement({ provider: 'TEST_PROVIDER', providerRef: 'ORDER-2', amountEUR: 100 });
  await assert.rejects(() => g.verifySettlement({ settlementId: pending.id, provider: 'TEST_PROVIDER', providerRef: 'CAPTURE-2', amountEUR: 100 }), /TRUSTED_PROVIDER_VERIFICATION_REQUIRED/);
});

test('verified revenue is counted only after matching verification and limits', async () => {
  const g = new ExternalEconomicGovernor(new MemoryStore(), { maxSingleSettlementEUR: 1000, maxDailyVerifiedRevenueEUR: 150 });
  await g.init();
  const pending = await g.recordPendingSettlement({ provider: 'TEST_PROVIDER', providerRef: 'ORDER-3', amountEUR: 100 });
  const verified = await g.verifySettlement({ settlementId: pending.id, provider: 'TEST_PROVIDER', providerRef: 'CAPTURE-3', amountEUR: 100, verification: { verified: true, source: 'test-adapter' } });
  assert.equal(verified.status, 'VERIFIED');
  assert.equal(g.status().metrics.verifiedRevenueEUR, 100);
});

test('spending, signing and withdrawals remain disabled by policy', async () => {
  const g = new ExternalEconomicGovernor(new MemoryStore());
  await g.init();
  const status = g.status();
  assert.equal(status.policy.allowSpending, false);
  assert.equal(status.policy.allowSigning, false);
  assert.equal(status.policy.allowWithdrawals, false);
});
