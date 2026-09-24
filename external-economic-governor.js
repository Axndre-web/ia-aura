import crypto from 'node:crypto';

const now = () => new Date().toISOString();
const uid = prefix => `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
const positive = value => Number.isFinite(Number(value)) && Number(value) > 0;

const DEFAULT_STATE = Object.freeze({
  version: 1,
  mode: 'GUARDED_AUTONOMY',
  execution: 'READ_VERIFY_ONLY',
  paused: false,
  opportunities: [],
  pendingSettlements: [],
  verifiedSettlements: [],
  costs: [],
  decisions: [],
  audit: []
});

export class ExternalEconomicGovernor {
  constructor(store, policy = {}) {
    this.store = store;
    this.policy = {
      maxSingleSettlementEUR: Number(policy.maxSingleSettlementEUR ?? 1000),
      maxDailyVerifiedRevenueEUR: Number(policy.maxDailyVerifiedRevenueEUR ?? 10000),
      allowSpending: false,
      allowSigning: false,
      allowWithdrawals: false,
      allowUnverifiedRevenue: false,
      requireProviderReference: true
    };
    this.state = structuredClone(DEFAULT_STATE);
  }

  async init() {
    const loaded = await this.store.init(DEFAULT_STATE);
    this.state = { ...structuredClone(DEFAULT_STATE), ...loaded };
    this.#audit('SYSTEM_INIT', { mode: this.state.mode, execution: this.state.execution });
    await this.#save();
    return this.status();
  }

  #audit(type, data = {}) {
    this.state.audit.push({ id: uid('audit'), at: now(), type, data });
    this.state.audit = this.state.audit.slice(-500);
  }

  async #save() { await this.store.write(this.state); }

  status() {
    const verifiedRevenueEUR = this.state.verifiedSettlements.reduce((sum, x) => sum + x.amountEUR, 0);
    const verifiedCostsEUR = this.state.costs.filter(x => x.status === 'VERIFIED').reduce((sum, x) => sum + x.amountEUR, 0);
    return {
      mode: this.state.mode,
      execution: this.state.execution,
      paused: this.state.paused,
      policy: this.policy,
      metrics: {
        verifiedRevenueEUR,
        verifiedCostsEUR,
        netVerifiedEUR: verifiedRevenueEUR - verifiedCostsEUR,
        pendingSettlements: this.state.pendingSettlements.length,
        verifiedSettlements: this.state.verifiedSettlements.length,
        opportunities: this.state.opportunities.filter(x => x.enabled).length
      },
      lastAudit: this.state.audit.at(-1) ?? null
    };
  }

  async pause(reason = 'operator') {
    this.state.paused = true;
    this.#audit('AUTONOMY_PAUSED', { reason });
    await this.#save();
    return this.status();
  }

  async resume(reason = 'operator') {
    this.state.paused = false;
    this.#audit('AUTONOMY_RESUMED', { reason });
    await this.#save();
    return this.status();
  }

  async registerOpportunity(input = {}) {
    if (this.state.paused) throw new Error('AUTONOMY_PAUSED');
    if (!input.title) throw new Error('OPPORTUNITY_TITLE_REQUIRED');
    const priceEUR = Number(input.priceEUR ?? 0);
    const costEUR = Number(input.costEUR ?? 0);
    if (!positive(priceEUR)) throw new Error('POSITIVE_PRICE_REQUIRED');
    if (!Number.isFinite(costEUR) || costEUR < 0) throw new Error('VALID_COST_REQUIRED');
    const opportunity = {
      id: input.id || uid('opp'),
      title: String(input.title),
      kind: String(input.kind || 'SERVICE'),
      priceEUR,
      costEUR,
      marginEUR: priceEUR - costEUR,
      executor: String(input.executor || 'EXTERNAL_ADAPTER'),
      enabled: input.enabled !== false,
      createdAt: now(),
      metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {}
    };
    this.state.opportunities = this.state.opportunities.filter(x => x.id !== opportunity.id);
    this.state.opportunities.push(opportunity);
    this.#audit('OPPORTUNITY_REGISTERED', { id: opportunity.id, marginEUR: opportunity.marginEUR });
    await this.#save();
    return opportunity;
  }

  async plan() {
    if (this.state.paused) return { ok: false, status: 'PAUSED' };
    const candidates = this.state.opportunities
      .filter(x => x.enabled && x.marginEUR > 0)
      .sort((a, b) => b.marginEUR - a.marginEUR);
    const chosen = candidates[0] ?? null;
    const decision = {
      id: uid('decision'), at: now(),
      status: chosen ? 'PLANNED_READ_VERIFY_ONLY' : 'NO_POSITIVE_MARGIN_OPPORTUNITY',
      opportunityId: chosen?.id ?? null
    };
    this.state.decisions.push(decision);
    this.state.decisions = this.state.decisions.slice(-200);
    this.#audit('ECONOMIC_PLAN', decision);
    await this.#save();
    return { ok: Boolean(chosen), decision, opportunity: chosen };
  }

  async recordPendingSettlement({ provider, providerRef, amountEUR, metadata = {} } = {}) {
    if (this.state.paused) throw new Error('AUTONOMY_PAUSED');
    if (!provider || !providerRef) throw new Error('TRUSTED_PROVIDER_REFERENCE_REQUIRED');
    const amount = Number(amountEUR);
    if (!positive(amount)) throw new Error('POSITIVE_SETTLEMENT_REQUIRED');
    if (amount > this.policy.maxSingleSettlementEUR) throw new Error('SETTLEMENT_LIMIT_EXCEEDED');
    const duplicate = this.state.pendingSettlements.find(x => x.provider === provider && x.providerRef === providerRef)
      || this.state.verifiedSettlements.find(x => x.provider === provider && x.providerRef === providerRef);
    if (duplicate) return duplicate;
    const settlement = { id: uid('settle'), provider: String(provider), providerRef: String(providerRef), amountEUR: amount, status: 'PENDING_VERIFICATION', createdAt: now(), metadata };
    this.state.pendingSettlements.push(settlement);
    this.#audit('SETTLEMENT_PENDING', { id: settlement.id, provider: settlement.provider, amountEUR: amount });
    await this.#save();
    return settlement;
  }

  async verifySettlement({ settlementId, provider, providerRef, amountEUR, verification = {} } = {}) {
    if (this.state.paused) throw new Error('AUTONOMY_PAUSED');
    const pending = this.state.pendingSettlements.find(x => x.id === settlementId);
    if (!pending) throw new Error('PENDING_SETTLEMENT_NOT_FOUND');
    if (!provider || !providerRef) throw new Error('PROVIDER_REFERENCE_REQUIRED');
    const amount = Number(amountEUR);
    if (!positive(amount) || amount !== pending.amountEUR) throw new Error('SETTLEMENT_AMOUNT_MISMATCH');
    if (amount > this.policy.maxSingleSettlementEUR) throw new Error('SETTLEMENT_LIMIT_EXCEEDED');
    if (verification.verified !== true) throw new Error('TRUSTED_PROVIDER_VERIFICATION_REQUIRED');

    const day = now().slice(0, 10);
    const daily = this.state.verifiedSettlements.filter(x => x.verifiedAt.startsWith(day)).reduce((sum, x) => sum + x.amountEUR, 0);
    if (daily + amount > this.policy.maxDailyVerifiedRevenueEUR) throw new Error('DAILY_SETTLEMENT_LIMIT_EXCEEDED');

    const verified = {
      ...pending,
      provider: String(provider),
      providerRef: String(providerRef),
      amountEUR: amount,
      status: 'VERIFIED',
      verifiedAt: now(),
      verification: { ...verification, verified: true }
    };
    this.state.pendingSettlements = this.state.pendingSettlements.filter(x => x.id !== settlementId);
    this.state.verifiedSettlements.push(verified);
    this.#audit('REVENUE_VERIFIED', { id: verified.id, provider: verified.provider, amountEUR: amount });
    await this.#save();
    return verified;
  }

  async recordCost({ source, amountEUR, reference, verified = false, metadata = {} } = {}) {
    const amount = Number(amountEUR);
    if (!source || !positive(amount)) throw new Error('VALID_COST_REQUIRED');
    const cost = { id: uid('cost'), source: String(source), amountEUR: amount, reference: reference || null, status: verified ? 'VERIFIED' : 'PENDING', createdAt: now(), metadata };
    this.state.costs.push(cost);
    this.#audit('COST_RECORDED', { id: cost.id, status: cost.status, amountEUR: amount });
    await this.#save();
    return cost;
  }
}
