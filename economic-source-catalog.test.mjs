import test from 'node:test';
import assert from 'node:assert/strict';
import { listEconomicSources, validateEconomicObservation } from '../server/economic-source-catalog.js';
import { evaluateOpportunity, rankPositiveOpportunities } from '../server/opportunity-engine.js';

test('catalog exposes exactly ten external economic source classes', () => {
  assert.equal(listEconomicSources().length, 10);
});

test('financial oracle observations remain reference-only unless settlement evidence exists', () => {
  const r = validateEconomicObservation({
    sourceType:'FINANCIAL_ORACLES',
    amountEUR:100,
    evidence:{ 'signed-quote':'q', timestamp:new Date().toISOString(), 'source-id':'oracle-1' }
  });
  assert.equal(r.ok, true);
  assert.equal(r.source.settlement, 'REFERENCE_ONLY');
});

test('positive opportunity ranking excludes unknown or incomplete sources', () => {
  const base={revenueEUR:100,spendEUR:20,feesEUR:5,networkEUR:0,otherCostEUR:0};
  const complete=evaluateOpportunity({...base,sourceType:'TRANSCODING_STREAMING',computableEvidence:{'job-id':'J1','completed-job':true,'provider-settlement':'S1'},realityVerified:true,authorizedProvider:'TEST_PROVIDER',workRef:'W1',deliverableRef:'D1'});
  const unknown=evaluateOpportunity({...base,sourceType:'NOT_REAL',computableEvidence:{}});
  assert.equal(rankPositiveOpportunities([complete,unknown]).length,1);
  assert.equal(rankPositiveOpportunities([complete])[0].sourceType,'TRANSCODING_STREAMING');
});
