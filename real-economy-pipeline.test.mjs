import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateOpportunity, rankPositiveOpportunities } from '../server/opportunity-engine.js';
import { calculateCurrencyConversion } from '../server/currency-converter.js';
import { RealEconomicRegistry } from '../server/real-economic-registry.js';
import { NeonOrbGovernor } from '../server/economic-governor.js';

test('only verified real work is rankable', ()=>{
  const a=evaluateOpportunity({id:'a',revenueEUR:10,spendEUR:2,authorizedProvider:'P',realityVerified:false});
  const b=evaluateOpportunity({id:'b',revenueEUR:10,spendEUR:2,authorizedProvider:'P',realityVerified:true});
  assert.equal(rankPositiveOpportunities([a,b]).map(x=>x.id).join(','),'b');
});

test('real registry rejects unverified or non-positive assets', ()=>{
  const r=new RealEconomicRegistry();
  assert.equal(r.registerVerifiedAsset({provider:'P',providerRef:'x',workRef:'w',deliverableRef:'d',amountEUR:2,verification:{verified:false}}).ok,false);
  assert.equal(r.registerVerifiedAsset({provider:'P',providerRef:'y',workRef:'w',deliverableRef:'d',amountEUR:0,verification:{verified:true}}).ok,false);
});

test('currency conversion remains explicit about costs and positive result', ()=>{
  const c=calculateCurrencyConversion({fromAsset:'USDC',toAsset:'EUR',amount:20,quotedReceiveEUR:21,feeEUR:.5,networkEUR:.2,slippageEUR:.1,quoteRef:'q1'});
  assert.equal(c.netReceiveEUR,20.2); assert.equal(c.economicallyPositive,true);
});

test('settlement is subject to NEON_ORB settlement limits', ()=>{
  const g = new NeonOrbGovernor();
  g.state.paused = false;
  g.state.policy.maxSingleSettlementEUR = 5;
  assert.equal(g.authorizeSettlement({amountEUR: 6}).ok, false);
  assert.equal(g.authorizeSettlement({amountEUR: 5}).ok, true);
});
