/** Server-only wallet/seed custody adapter. Never exposes secret material to HTTP/UI. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { Secrets } from './secrets.js';

const secrets = new Secrets();
const keypairPath = process.env.NEON_KEYPAIR_FILE || path.join(process.cwd(), 'keypair.js');

export async function walletReadiness() {
  const out = { keypairFileConfigured: Boolean(keypairPath), keypairFilePresent: false, seedConfigured: false, privateKeyConfigured: false, browserExposure: false };
  try { await fs.access(keypairPath); out.keypairFilePresent = true; } catch {}
  out.seedConfigured = await secrets.has('WALLET_SEED');
  out.privateKeyConfigured = await secrets.has('WALLET_PRIVATE_KEY');
  return out;
}

export async function requireServerWalletSecret(name) {
  const value = await secrets.get(name, { required: true });
  if (!value) throw new Error('WALLET_SECRET_REQUIRED');
  return value;
}
