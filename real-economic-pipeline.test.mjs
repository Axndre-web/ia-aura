import test from 'node:test';
import assert from 'node:assert/strict';
import { RealEconomicRegistry } from '../server/real-economic-registry.js';
import { calculateCurrencyConversion } from '../server/currency-converter.js';
import { NeonOrbGovernor } from '../server/economic-governor.js';

class MemoryStore {
  constructor(){ this.value = null; }
  async init(def){ this.value ??= structuredClone(def); return structuredClone(this.value); }
  async write(v){ this.value = structuredClone(v); }
}

test('only verified real assets enter the computable registry', async () => {
  const registry = new RealEconomicRegistry(new MemoryStore());
  await registry.init();
  await assert.rejects(() => registry.registerVerifiedAsset({
    provider:'TEST', providerRef:'R1', amount:100,
    workRef:'WORK-1', deliverableRef:'DEL-1',
    verification:{ verified:false }
  }), /REAL_ASSET_VERIFICATION_REQUIRED/);
  const asset = await registry.registerVerifiedAsset({
    provider:'TEST', providerRef:'R1', amount:100,
    workRef:'WORK-1', deliverableRef:'DEL-1',
    verification:{ verified:true, source:'test' }
  });
  assert.equal(asset.kind, 'VERIFIED_EXTERNAL_ASSET');
  assert.equal(registry.status().computableAssets, 1);
});

test('currency converter computes net receive and rejects invalid pairs', () => {
  const c = calculateCurrencyConversion({
    fromCurrency:'USD', toCurrency:'EUR', amount:100,
    rate:0.9, fee:2, networkFee:1, slippage:0.5, quoteRef:'Q1'
  });
  assert.equal(c.netReceive, 86.5);
  assert.equal(c.economicallyPositive, false);
  assert.throws(() => calculateCurrencyConversion({
    fromCurrency:'EUR', toCurrency:'EUR', amount:100, rate:1, quoteRef:'Q2'
  }), /VALID_CURRENCY_PAIR_REQUIRED/);
});

test('NEON_ORB blocks unverified work before live execution', () => {
  const g = new NeonOrbGovernor();
  const result = g.authorizeOpportunity({
    netProfitEUR: 100, marginBps: 2000, spendEUR: 5,
    realityVerified: false, authorizedProvider:'TEST'
  });
  assert.equal(result.code, 'REAL_WORK_NOT_VERIFIED');
});
