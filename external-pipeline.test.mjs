import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateOpportunity } from '../server/opportunity-engine.js';

test('external pipeline contract keeps pending settlement out of verified economics', () => {
  const op = evaluateOpportunity({
    id: 'real-job-1',
    source: 'https://example.invalid/jobs/1',
    kind: 'COMPUTE_SERVICE',
    revenueEUR: 30,
    spendEUR: 5,
    feesEUR: 2
  });
  assert.equal(op.netProfitEUR, 23);
  assert.ok(op.marginBps > 0);
  assert.equal(op.settlementProvider, null);
});

test('external opportunities require a source and provider execution is explicit', () => {
  const op = evaluateOpportunity({ revenueEUR: 10, spendEUR: 1 });
  assert.equal(op.source, 'external-feed');
  assert.equal(op.netProfitEUR, 9);
});
