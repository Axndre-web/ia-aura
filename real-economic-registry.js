import fs from 'node:fs';
import path from 'node:path';

const file = process.env.NEON_REAL_ASSET_REGISTRY_FILE || path.join(process.cwd(), 'data', 'real-economic-assets.json');
const positive = v => Number.isFinite(Number(v)) && Number(v) > 0;

function load() {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return { version: 1, assets: [], audit: [] }; }
}
function save(state) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, file);
}

export class RealEconomicRegistry {
  constructor() { this.state = load(); }
  snapshot() { return structuredClone(this.state); }
  register(asset = {}) {
    if (asset.verification?.verified !== true) throw new Error('REAL_ASSET_VERIFICATION_REQUIRED');
    if (!asset.provider || !asset.providerRef || !asset.workRef || !asset.deliverableRef) throw new Error('REAL_ASSET_EVIDENCE_INCOMPLETE');
    if (!positive(asset.amountEUR)) throw new Error('REAL_ASSET_POSITIVE_AMOUNT_REQUIRED');
    const duplicate = this.state.assets.find(x => x.provider === asset.provider && x.providerRef === asset.providerRef);
    if (duplicate) return duplicate;
    const record = {
      id: asset.id || `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'VERIFIED_REAL_ASSET',
      recordedAt: new Date().toISOString(),
      provider: String(asset.provider),
      providerRef: String(asset.providerRef),
      workRef: String(asset.workRef),
      deliverableRef: String(asset.deliverableRef),
      amountEUR: Number(asset.amountEUR),
      currency: asset.currency || 'EUR',
      opportunityId: asset.opportunityId || null,
      verification: structuredClone(asset.verification),
      metadata: asset.metadata || {}
    };
    this.state.assets.push(record);
    this.state.audit.push({ at: record.recordedAt, type: 'REAL_ASSET_REGISTERED', assetId: record.id });
    this.state.assets = this.state.assets.slice(-10000);
    this.state.audit = this.state.audit.slice(-10000);
    save(this.state);
    return record;
  }
}

export const realEconomicRegistry = new RealEconomicRegistry();
