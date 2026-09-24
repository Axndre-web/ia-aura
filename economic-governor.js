import fs from 'node:fs';
import path from 'node:path';

const dataDir = process.env.NEON_ECONOMIC_DATA_DIR || path.join(process.cwd(), 'data');
const stateFile = process.env.NEON_ECONOMIC_STATE_FILE || path.join(dataDir, 'neon-economic-state.json');
const now = () => new Date().toISOString();
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;

const defaults = () => ({
  version: 1,
  governor: 'NEON_ORB',
  mode: process.env.NEON_GOVERNOR_MODE || 'GUARDED_AUTONOMY',
  execution: process.env.NEON_EXECUTION_MODE || 'READ_VERIFY_ONLY',
  paused: false,
  policy: {
    minNetProfitEUR: num(process.env.NEON_MIN_NET_PROFIT_EUR, 0.01),
    minMarginBps: num(process.env.NEON_MIN_MARGIN_BPS, 100),
    maxSingleSpendEUR: num(process.env.NEON_MAX_SINGLE_SPEND_EUR, 25),
    maxDailySpendEUR: num(process.env.NEON_MAX_DAILY_SPEND_EUR, 100),
    maxSingleSettlementEUR: num(process.env.NEON_MAX_SINGLE_SETTLEMENT_EUR, 1000),
    maxDailyVerifiedRevenueEUR: num(process.env.NEON_MAX_DAILY_REVENUE_EUR, 10000),
    allowSpending: process.env.NEON_ALLOW_SPENDING === 'true',
    allowSigning: process.env.NEON_ALLOW_SIGNING === 'true',
    allowWithdrawals: process.env.NEON_ALLOW_WITHDRAWALS === 'true',
    requireRealityVerification: process.env.NEON_REQUIRE_REALITY_VERIFICATION !== 'false',
    requireAuthorizedProvider: process.env.NEON_REQUIRE_AUTHORIZED_PROVIDER !== 'false'
  },
  opportunities: [],
  executions: [],
  conversions: [],
  audit: []
});

function load() {
  try { return { ...defaults(), ...JSON.parse(fs.readFileSync(stateFile, 'utf8')) }; }
  catch { return defaults(); }
}
function save(state) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  const tmp = `${stateFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, stateFile);
}

export class NeonOrbGovernor {
  constructor() { this.state = load(); }
  snapshot() { return structuredClone(this.state); }
  audit(type, data = {}) {
    const entry = { id: `audit-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, at: now(), governor: 'NEON_ORB', type, ...data };
    this.state.audit.push(entry); this.state.audit = this.state.audit.slice(-5000); save(this.state); return entry;
  }
  setPaused(paused, reason = '') { this.state.paused = !!paused; this.audit(this.state.paused ? 'PAUSED' : 'RESUMED', { reason }); return this.snapshot(); }
  registerOpportunity(opportunity) {
    const o = { ...opportunity, id: String(opportunity.id || `opp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`), discoveredAt: opportunity.discoveredAt || now() };
    this.state.opportunities = this.state.opportunities.filter(x => x.id !== o.id); this.state.opportunities.push(o); this.state.opportunities = this.state.opportunities.slice(-2000);
    this.audit('OPPORTUNITY_REGISTERED', { opportunityId: o.id, source: o.source || 'unknown' }); return o;
  }
  dailyTotals() {
    const day = new Date().toISOString().slice(0,10);
    const spend = this.state.executions.filter(x => x.at?.startsWith(day) && x.status === 'EXECUTED').reduce((a,x)=>a+num(x.spendEUR),0);
    const revenue = this.state.executions.filter(x => x.at?.startsWith(day) && x.status === 'SETTLED_VERIFIED').reduce((a,x)=>a+num(x.revenueEUR),0);
    return { spendEUR: spend, revenueEUR: revenue };
  }
  authorizeOpportunity(op) {
    if (this.state.paused) return { ok:false, code:'GOVERNOR_PAUSED' };
    if (this.state.policy.requireRealityVerification && op.realityVerified !== true) return { ok:false, code:'REAL_WORK_NOT_VERIFIED' };
    if (this.state.policy.requireAuthorizedProvider && !op.authorizedProvider) return { ok:false, code:'AUTHORIZED_PROVIDER_REQUIRED' };
    const net = num(op.netProfitEUR);
    const marginBps = num(op.marginBps);
    if (net < this.state.policy.minNetProfitEUR) return { ok:false, code:'NET_PROFIT_BELOW_FLOOR' };
    if (marginBps < this.state.policy.minMarginBps) return { ok:false, code:'MARGIN_BELOW_FLOOR' };
    if (num(op.spendEUR) > this.state.policy.maxSingleSpendEUR) return { ok:false, code:'SINGLE_SPEND_LIMIT' };
    const d = this.dailyTotals();
    if (d.spendEUR + num(op.spendEUR) > this.state.policy.maxDailySpendEUR) return { ok:false, code:'DAILY_SPEND_LIMIT' };
    if (this.state.execution !== 'LIVE_EXECUTION') return { ok:false, code:'EXECUTION_MODE_NOT_LIVE' };
    if (!this.state.policy.allowSpending) return { ok:false, code:'SPENDING_DISABLED' };
    return { ok:true, code:'AUTHORIZED_BY_NEON_ORB' };
  }
  authorizeConversion(c) {
    if (this.state.paused) return { ok:false, code:'GOVERNOR_PAUSED' };
    if (num(c.netReceiveEUR) <= 0 || num(c.netReceiveEUR) <= num(c.amountEUR)) return { ok:false, code:'NON_POSITIVE_CONVERSION_RESULT' };
    if (!this.state.policy.allowSpending || this.state.execution !== 'LIVE_EXECUTION') return { ok:false, code:'LIVE_CONVERSION_DISABLED' };
    if (num(c.amountEUR) > this.state.policy.maxSingleSpendEUR) return { ok:false, code:'CONVERSION_SPEND_LIMIT' };
    return { ok:true, code:'AUTHORIZED_BY_NEON_ORB' };
  }
  authorizeSettlementVerification(s) {
    if (this.state.paused) return { ok:false, code:'GOVERNOR_PAUSED' };
    if (s?.verified !== true) return { ok:false, code:'SETTLEMENT_NOT_VERIFIED' };
    if (!s?.provider || !s?.providerRef) return { ok:false, code:'PROVIDER_REFERENCE_REQUIRED' };
    const amount = num(s.amountEUR);
    if (amount <= 0) return { ok:false, code:'INVALID_SETTLEMENT_AMOUNT' };
    if (amount > this.state.policy.maxSingleSettlementEUR) return { ok:false, code:'SETTLEMENT_LIMIT_EXCEEDED' };
    const d = this.dailyTotals();
    if (d.revenueEUR + amount > this.state.policy.maxDailyVerifiedRevenueEUR) return { ok:false, code:'DAILY_SETTLEMENT_LIMIT' };
    return { ok:true, code:'SETTLEMENT_ACCEPTED_BY_NEON_ORB' };
  }
  recordVerifiedSettlement(s) {
    const auth = this.authorizeSettlementVerification(s);
    if (!auth.ok) return { ok:false, ...auth };
    const entry = {
      id: String(s.id || `settle-${Date.now()}-${Math.random().toString(36).slice(2,8)}`),
      at: now(), status:'SETTLED_VERIFIED',
      provider:String(s.provider), providerRef:String(s.providerRef),
      amountEUR:num(s.amountEUR), opportunityId:s.opportunityId || null,
      verification:s.verification || {}
    };
    this.state.executions.push(entry);
    this.state.executions = this.state.executions.slice(-5000);
    this.audit('SETTLEMENT_VERIFIED', { settlementId:entry.id, provider:entry.provider, providerRef:entry.providerRef, amountEUR:entry.amountEUR });
    save(this.state);
    return { ok:true, settlement:entry };
  }
  recordExecution(x) { this.state.executions.push({ ...x, at: x.at || now() }); this.state.executions = this.state.executions.slice(-5000); save(this.state); return x; }
  recordConversion(x) { this.state.conversions.push({ ...x, at: x.at || now() }); this.state.conversions = this.state.conversions.slice(-5000); save(this.state); return x; }
}

export const neonOrbGovernor = new NeonOrbGovernor();
