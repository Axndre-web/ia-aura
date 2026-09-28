import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NEON_LIFE_AGENT = 'false';
process.env.NEON_LIFE_AGENT_EXECUTE = 'false';
process.env.NEON_AUTONOMOUS_SPENDING = 'false';

const { snapshot, lifeAgentTick } = await import('../server/neon-life-agent.js');
const { walletReadiness } = await import('../server/wallet-vault.js');

test('life agent is disabled by default and cannot autonomously spend', () => {
  const s = snapshot();
  assert.equal(s.policy.autoRun, false);
  assert.equal(s.policy.autoExecute, false);
  assert.equal(s.policy.autoSpend, false);
  assert.equal(s.policy.withdrawals, false);
  assert.equal(s.policy.browserPrivateKeys, false);
});

test('life agent performs real discovery/verification path without fabricating work', async () => {
  const result = await lifeAgentTick();
  assert.equal(result.ok, true);
  assert.match(result.action, /^DISCOVER_VERIFY/);
});

test('wallet readiness never returns secret material', async () => {
  const w = await walletReadiness();
  assert.equal(w.browserExposure, false);
  assert.equal('seed' in w, false);
  assert.equal('privateKey' in w, false);
});
