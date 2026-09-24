import test from 'node:test';
import assert from 'node:assert/strict';
import { ExternalEconomicGovernor } from '../server/external-economic-governor.js';
import { createProviders } from '../server/providers/index.js';

class MemoryStore {
  constructor(){ this.value = null; }
  async init(def){ this.value ??= structuredClone(def); return this.value; }
  async write(v){ this.value = structuredClone(v); }
}

test('provider factory exposes governed adapters without secrets', async () => {
  const p = createProviders();
  assert.ok(p.paypal && p.stripe && p.crypto && p.compute && p.runpod);
  assert.equal(await p.secrets.has('PAYPAL_CLIENT_ID'), false);
});

test('governor blocks compute spending by default', async () => {
  const g = new ExternalEconomicGovernor(new MemoryStore());
  await g.init();
  assert.equal(g.status().policy.allowSpending, false);
});
