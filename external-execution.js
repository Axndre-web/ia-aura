import { neonOrbGovernor } from './economic-governor.js';
import { assertAllowedForExecution } from './provider-security.js';

export async function executeOpportunity(opportunity, payload = {}) {
  const auth = neonOrbGovernor.authorizeOpportunity(opportunity);
  if (!auth.ok) return { ok:false, ...auth };
  if (!opportunity.executeUrl) return { ok:false, code:'NO_EXECUTION_ENDPOINT' };
  const url = assertAllowedForExecution(opportunity.executeUrl);
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), 15000);
  try {
    const r = await fetch(url, { method:'POST', headers:{'content-type':'application/json','accept':'application/json'}, body:JSON.stringify({opportunityId:opportunity.id,...payload}), signal:controller.signal });
    const data = await r.json().catch(()=>({}));
    const status = r.ok ? 'EXECUTED' : 'FAILED';
    neonOrbGovernor.recordExecution({ opportunityId:opportunity.id, status, spendEUR:Number(opportunity.spendEUR||0), revenueEUR:Number(opportunity.revenueEUR||0), netProfitEUR:Number(opportunity.netProfitEUR||0), providerResult:data });
    return {ok:r.ok,status,httpStatus:r.status,data};
  } finally { clearTimeout(timer); }
}
