import { neonOrbGovernor } from './economic-governor.js';
import { assertAllowedForExecution } from './provider-security.js';

const providers = () => new Set(String(process.env.NEON_AUTHORIZED_EXECUTION_PROVIDERS || '').split(',').map(x => x.trim()).filter(Boolean));
const endpoints = () => { try { return JSON.parse(process.env.NEON_AUTHORIZED_EXECUTION_ENDPOINTS || '{}'); } catch { return {}; } };

export async function executeOpportunity(opportunity, payload = {}) {
  const auth = neonOrbGovernor.authorizeOpportunity(opportunity);
  if (!auth.ok) return { ok:false, ...auth };
  if (!opportunity.authorizedProvider || !providers().has(String(opportunity.authorizedProvider))) return { ok:false, code:'AUTHORIZED_PROVIDER_NOT_CONFIGURED' };
  const configuredUrl = endpoints()[String(opportunity.authorizedProvider)];
  if (!configuredUrl) return { ok:false, code:'AUTHORIZED_PROVIDER_ENDPOINT_NOT_CONFIGURED' };
  const url = assertAllowedForExecution(configuredUrl);
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), 15000);
  try {
    const r = await fetch(url, { method:'POST', headers:{'content-type':'application/json','accept':'application/json'}, body:JSON.stringify({opportunityId:opportunity.id,...payload}), signal:controller.signal });
    const data = await r.json().catch(()=>({}));
    if (!r.ok) {
      neonOrbGovernor.recordExecution({ opportunityId:opportunity.id, status:'FAILED', spendEUR:Number(opportunity.spendEUR||0), revenueEUR:0, netProfitEUR:Number(opportunity.netProfitEUR||0), providerResult:data });
      return {ok:false,status:'FAILED',httpStatus:r.status,data};
    }
    const pending = {
      opportunityId: opportunity.id,
      status:'EXECUTED_PENDING_SETTLEMENT',
      spendEUR:Number(opportunity.spendEUR||0),
      revenueEUR:0,
      netProfitEUR:Number(opportunity.netProfitEUR||0),
      provider: opportunity.authorizedProvider,
      providerRef: data.providerRef || data.executionId || data.jobId || null,
      workRef: opportunity.workRef || data.workRef || null,
      deliverableRef: opportunity.deliverableRef || data.deliverableRef || null,
      providerResult:data
    };
    neonOrbGovernor.recordExecution(pending);
    return {ok:true,status:pending.status,httpStatus:r.status,data};
  } finally { clearTimeout(timer); }
}
