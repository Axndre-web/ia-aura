import test from 'node:test';
import assert from 'node:assert/strict';
import { UnifiedLedger } from '../core/unified-ledger.js';

function memoryStorage() {
  let value = null;
  return {
    getItem: () => value,
    setItem: (_, v) => { value = v; }
  };
}

test('pending external settlement does not change verified EUR balance', () => {
  const ledger = new UnifiedLedger(memoryStorage());
  ledger.recordPendingExternal({
    source: 'PAYPAL_CHECKOUT',
    amount: 100,
    currency: 'EUR',
    txHash: 'ORDER-1'
  });
  assert.equal(ledger.getState().external.fiatEuroBalance, 0);
  assert.equal(ledger.getState().history.at(-1).status, 'pending-verification');
});

test('verified settlement changes verified EUR balance', () => {
  const ledger = new UnifiedLedger(memoryStorage());
  ledger.recordExternalSettlement({
    source: 'PAYPAL_CHECKOUT',
    amount: 100,
    currency: 'EUR',
    txHash: 'CAPTURE-1'
  });
  assert.equal(ledger.getState().external.fiatEuroBalance, 100);
  assert.equal(ledger.getState().history.at(-1).status, 'verified');
});

test('unsupported currency is rejected before mutation', () => {
  const ledger = new UnifiedLedger(memoryStorage());
  assert.throws(() => ledger.recordExternalSettlement({
    source: 'X', amount: 1, currency: 'USD', txHash: 'X'
  }), /Unsupported currency/);
  assert.equal(ledger.getState().history.length, 0);
});
