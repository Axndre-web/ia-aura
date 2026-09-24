import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateOpportunity } from '../server/opportunity-engine.js';
import { calculateConversion } from '../server/asset-router.js';

test('profitability engine only treats positive net after all declared costs as positive', ()=>{
  const a=evaluateOpportunity({revenueEUR:10,spendEUR:4,feesEUR:1,networkCostEUR:1,otherCostEUR:0.5});
  assert.equal(a.netProfitEUR,3.5); assert.equal(a.marginBps,3500);
  const b=evaluateOpportunity({revenueEUR:10,spendEUR:8,feesEUR:2,networkCostEUR:0.5});
  assert.ok(b.netProfitEUR<0);
});

test('asset converter never creates value from zero', ()=>{
  const c=calculateConversion({fromAsset:'USDC',toAsset:'EUR',amountEUR:20,quotedReceiveEUR:21,feeEUR:0.5,networkEUR:0.2,slippageEUR:0.2});
  assert.equal(c.netReceiveEUR,20.1); assert.equal(c.economicallyPositive,true);
  const d=calculateConversion({fromAsset:'X',toAsset:'Y',amountEUR:20,quotedReceiveEUR:20,feeEUR:1});
  assert.equal(d.economicallyPositive,false);
});
