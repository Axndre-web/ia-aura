import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshot } from '../server/autonomy-supervisor.js';

test('autonomy supervisor is guarded and read/verify only', () => {
  const s = snapshot();
  assert.equal(s.mode, 'GUARDED_AUTONOMY');
  assert.equal(s.execution, 'READ_VERIFY_ONLY');
  assert.equal(s.safety.transactionSigning, false);
  assert.equal(s.safety.withdrawals, false);
  assert.equal(s.safety.autonomousSpending, false);
  assert.equal(s.safety.privateKeysExposedToBrowser, false);
});

test('autonomy supervisor tracks ten economic capability slots', () => {
  const s = snapshot();
  assert.equal(Number(s.economy.totalCapabilities), 10);
});
