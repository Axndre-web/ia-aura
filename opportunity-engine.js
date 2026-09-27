import { neonOrbGovernor } from './economic-governor.js';
import { verifyRealWork } from './real-work-verifier.js';
import { assertAllowedForExecution } from './provider-security.js';
const n = (v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const asArray = payload => Array.isArray(payload) ? payload : (Array.isArray(payload?.opportunities) ? payload.opportunities : []);

export function evaluateOpportunity(raw = {}) {
  const revenueEUR = n(raw.revenueEUR ?? raw.priceEUR ?? raw.payoutEUR);
  const spendEUR = n(raw.spendEUR ?? raw.costEUR ?? raw.computeCostEUR);
  const feesEUR = n(raw.feesEUR ?? raw.providerFeesEUR);
  const networkEUR = n(raw.networkCostEUR ?? raw.gasEUR);
  const otherEUR = n(raw.otherCostEUR ?? raw.riskReserveEUR);
  const totalCostEUR = spendEUR + feesEUR + networkEUR + otherEUR;
  const netProfitEUR = revenueEUR - totalCostEUR;
  const marginBps = revenueEUR > 0 ? Math.round((netProfitEUR / revenueEUR) * 10000) : -1000000;
  return {
    id: String(raw.id || `opp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`),
    title: String(raw.title || raw.name || 'External computable work'),
    kind: String(raw.kind || 'COMPUTE_SERVICE'),
    source: String(raw.source || 'external-feed'),
    revenueEUR, spendEUR, feesEUR, networkEUR, otherEUR, totalCostEUR, netProfitEUR, marginBps,
    settlementProvider: raw.settlementProvider || null,
    executeUrl: raw.executeUrl || null,
    expiresAt: raw.expiresAt || null,
    verificationUrl: raw.verificationUrl || null,
    settlementVerificationUrl: raw.settlementVerificationUrl || null,
    authorizedProvider: raw.authorizedProvider || raw.settlementProvider || null,
    realityVerified: raw.realityVerified === true,
    realityVerification: raw.realityVerification || null,
    workRef: raw.workRef || raw.metadata?.workRef || null,
    deliverableRef: raw.deliverableRef || raw.metadata?.deliverableRef || null,
    metadata: raw.metadata || {},
    discoveredAt: raw.discoveredAt || new Date().toISOString()
  };
}

export async function discoverFromUrl(url, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), Math.max(1000, timeoutMs));
  try {
    const target = assertAllowedForExecution(url);
    const res = await fetch(target, { headers:{'accept':'application/json'}, signal:controller.signal });
    if (!res.ok) throw new Error(`FEED_HTTP_${res.status}`);
    const data = await res.json();
    return asArray(data).map(x=>evaluateOpportunity({...x, source:x.source || url}));
  } finally { clearTimeout(timer); }
}

export async function discoverConfigured() {
  const feeds = String(process.env.NEON_OPPORTUNITY_FEEDS || '').split(',').map(s=>s.trim()).filter(Boolean);
  const found=[]; const errors=[];
  for (const url of feeds) {
    try {
      const candidates = await discoverFromUrl(url);
      for (const op of candidates) {
        try {
          const verification = await verifyRealWork(op);
          if (verification.verified) {
            op.realityVerified = true;
            op.realityVerification = verification;
            found.push(op);
          } else {
            errors.push({ opportunityId: op.id, code: verification.code });
          }
        } catch(error) { errors.push({ opportunityId: op.id, error: String(error?.message || error) }); }
      }
    } catch(error) { errors.push({url,error:String(error?.message||error)}); }
  }
  for (const op of found) neonOrbGovernor.registerOpportunity(op);
  return { discovered: found, errors };
}

export function rankPositiveOpportunities(opportunities = neonOrbGovernor.snapshot().opportunities) {
  return opportunities.filter(o => o.realityVerified === true && o.authorizedProvider && n(o.netProfitEUR)>0).sort((a,b)=>n(b.netProfitEUR)-n(a.netProfitEUR));
}
