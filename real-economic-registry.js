import crypto from 'node:crypto';

const now = () => new Date().toISOString();
const uid = prefix => `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

export class RealEconomicRegistry {
  constructor(store) {
    this.store = store;
    this.state = { version: 1, assets: [], history: [] };
  }

  async init() {
    this.state = await this.store.init({ version: 1, assets: [], history: [] });
    this.state = {
      version: 1,
      assets: Array.isArray(this.state.assets) ? this.state.assets : [],
      history: Array.isArray(this.state.history) ? this.state.history : []
    };
    return this.status();
  }

  async #save() { await this.store.write(this.state); }

  status() {
    return {
      version: this.state.version,
      computableAssets: this.state.assets.length,
      assets: structuredClone(this.state.assets)
    };
  }

  async registerVerifiedAsset({
    provider, providerRef, amount, currency = 'EUR',
    opportunityId = null, workRef = null, deliverableRef = null,
    verification = {}, metadata = {}
  } = {}) {
    if (verification?.verified !== true) throw new Error('REAL_ASSET_VERIFICATION_REQUIRED');
    if (!provider || !providerRef || !workRef || !deliverableRef) {
      throw new Error('REAL_ASSET_EVIDENCE_REQUIRED');
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('REAL_ASSET_AMOUNT_REQUIRED');
    }

    const duplicate = this.state.assets.find(
      x => x.provider === String(provider) && x.providerRef === String(providerRef)
    );
    if (duplicate) return duplicate;

    const asset = {
      id: uid('asset'),
      kind: 'VERIFIED_EXTERNAL_ASSET',
      provider: String(provider),
      providerRef: String(providerRef),
      amount: numericAmount,
      currency: String(currency).toUpperCase(),
      opportunityId: opportunityId || null,
      workRef: String(workRef),
      deliverableRef: String(deliverableRef),
      verifiedAt: now(),
      verification: { ...verification, verified: true },
      metadata: { ...metadata }
    };

    this.state.assets.push(asset);
    this.state.history.push({
      id: uid('asset-event'),
      at: now(),
      type: 'REAL_ASSET_REGISTERED',
      assetId: asset.id
    });
    this.state.assets = this.state.assets.slice(-5000);
    this.state.history = this.state.history.slice(-10000);
    await this.#save();
    return asset;
  }
}
