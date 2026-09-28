import test from 'node:test';
import assert from 'node:assert/strict';
import { convertObservedAsset } from '../server/asset-converter.js';
import { publicEconomicProfile } from '../server/economy-profile.js';

process.env.NEON_SOLANA_PUBLIC_ADDRESS = 'CpiWyv2tyrbBqZoZMSTcVRgCGPwKgJ2jCyZ7aN1n7fSE';

test('asset converter is valuation-only and does not mint funds', () => {
  const result = convertObservedAsset({ asset: 'SOL', amount: 2, eurRate: 100, feeEUR: 1 });
  assert.equal(result.netReferenceEUR, 199);
  assert.equal(result.status, 'VALUATION_ONLY');
});

test('Neon Orb profile exposes only the public Solana address', () => {
  const profile = publicEconomicProfile();
  assert.equal(profile.governor, 'NEON ORB');
  assert.equal(profile.public.solana, 'CpiWyv2tyrbBqZoZMSTcVRgCGPwKgJ2jCyZ7aN1n7fSE');
  assert.equal(Object.prototype.hasOwnProperty.call(profile, 'password'), false);
});
