import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dataDir = process.env.NEON_ECONOMIC_DATA_DIR || path.join(process.cwd(), 'data');
const registryFile = process.env.NEON_REAL_ECONOMIC_REGISTRY_FILE || path.join(dataDir, 'real-economic-registry.json');
const now = () => new Date().toISOString();
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

function load() {
  try { return JSON.parse(fs.readFileSync(registryFile, 'utf8')); }
  catch { return { version: 1, assets: [], audit: [] }; }
}
function save(state) {
  fs.mkdirSync(path.dirname(registryFile), { recursive: true });
  const tmp = `${registryFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, registryFile);
}

export class RealEconomicRegistry {
  constructor() { this.state = load(); }
  snapshot() { return structuredClone(this.state); }
  registerVerifiedAsset(asset = {}) {
    const verification = asset.verification || {};
    const amountEUR = Number(asset.amountEUR ?? asset.revenueEUR ?? 0);
    if (verification.verified !== true) return { ok: false, code: 'ASSET_VERIFICATION_REQUIRED' };
    if (!asset.provider || !asset.providerRef) return { ok: false, code: 'ASSET_PROVIDER_REFERENCE_REQUIRED' };
    if (!asset.workRef || !asset.deliverableRef) return { ok: false, code: 'ASSET_REAL_WORK_REFERENCE_REQUIRED' };
    if (!(amountEUR > 0)) return { ok: false, code: 'ASSET_AMOUNT_MUST_BE_POSITIVE' };
    const duplicate = this.state.assets.find(x => x.provider === asset.provider && x.providerRef === asset.providerRef);
    if (duplicate) return { ok: false, code: 'ASSET_ALREADY_REGISTERED', asset: duplicate };
    const record = {
      id: String(asset.id || `asset-${Date.now()}-${Math.random().toString(36).slice(2,8)}`),
      kind: String(asset.kind || 'VERIFIED_EXTERNAL_ASSET'),
      provider: String(asset.provider),
      providerRef: String(asset.providerRef),
      workRef: String(asset.workRef),
      deliverableRef: String(asset.deliverableRef),
      amountEUR,
      currency: String(asset.currency || 'EUR'),
      settlementRef: asset.settlementRef || null,
      verification: structuredClone(verification),
      registeredAt: now()
    };
    record.recordDigest = digest(record);
    this.state.assets.push(record);
    this.state.assets = this.state.assets.slice(-5000);
    this.state.audit.push({ type: 'REAL_ASSET_REGISTERED', at: now(), assetId: record.id, providerRef: record.providerRef });
    this.state.audit = this.state.audit.slice(-5000);
    save(this.state);
    return { ok: true, asset: record };
  }
}

export const realEconomicRegistry = new RealEconomicRegistry();
