import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateOpportunity, rankPositiveOpportunities } from '../server/opportunity-engine.js';
import { calculateConversion } from '../server/asset-router.js';

const verified = evaluateOpportunity({
  id:'real-1', revenueEUR:20, spendEUR:5, feesEUR:1, sourceType:'TRANSCODING_STREAMING',
  computableEvidence:{'jobid':'j1','completedjob':true,'providersettlement':'s1'},
  realityVerified:true, authorizedProvider:'TEST_PROVIDER', workRef:'work-1', deliverableRef:'del-1'
});

test('positive opportunity requires real-work verification and authorized provider', () => {
  assert.equal(rankPositiveOpportunities([verified]).length, 1);
  assert.equal(rankPositiveOpportunities([{...verified, realityVerified:false}]).length, 0);
  assert.equal(rankPositiveOpportunities([{...verified, authorizedProvider:null}]).length, 0);
});

test('conversion requires a fresh quote reference', () => {
  const fresh = calculateConversion({fromAsset:'USDC',toAsset:'EUR',amountEUR:10,quotedReceiveEUR:11,feeEUR:0.1,expiresAt:new Date(Date.now()+60_000).toISOString(),quoteRef:'q-1'});
  assert.equal(fresh.expired,false);
  assert.equal(fresh.economicallyPositive,true);
  const stale = calculateConversion({fromAsset:'USDC',toAsset:'EUR',amountEUR:10,quotedReceiveEUR:11,expiresAt:new Date(Date.now()-1000).toISOString(),quoteRef:'q-2'});
  assert.equal(stale.expired,true);
  assert.equal(stale.economicallyPositive,false);
});
