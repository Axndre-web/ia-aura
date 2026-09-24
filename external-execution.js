import { neonOrbGovernor } from './economic-governor.js';
import { assertAllowedForExecution } from './provider-security.js';

function authorizedProviderUrl(provider) {
  let map = {};
  try { map = JSON.parse(process.env.NEON_AUTHORIZED_EXECUTION_PROVIDERS || '{}'); }
  catch { throw new Error('AUTHORIZED_PROVIDER_CONFIG_INVALID'); }
  const configured = map[String(provider || '')];
  if (!configured) throw new Error('AUTHORIZED_PROVIDER_NOT_CONFIGURED');
  return configured;
}

/**
 * Executes only work that has passed the real-work attestation and the
 * NEON_ORB policy. A successful HTTP response is a submission, not revenue.
 * Revenue is recognized only after an independent settlement verification.
 */
export async function executeOpportunity(opportunity, payload = {}) {
  if (opportunity?.realityVerified !== true) {
    return { ok: false, code: 'REAL_WORK_NOT_VERIFIED' };
  }
  const provider = opportunity.authorizedProvider;
  if (!provider) return { ok: false, code: 'AUTHORIZED_PROVIDER_REQUIRED' };

  const auth = neonOrbGovernor.authorizeOpportunity(opportunity);
  if (!auth.ok) return { ok:false, ...auth };

  const configuredUrl = authorizedProviderUrl(provider);
  const url = assertAllowedForExecution(configuredUrl);
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), 15000);

  try {
    const r = await fetch(url, {
      method:'POST',
      headers:{'content-type':'application/json','accept':'application/json'},
      body:JSON.stringify({
        opportunityId: opportunity.id,
        workRef: opportunity.realityVerification?.workRef || null,
        deliverableRef: opportunity.realityVerification?.deliverableRef || null,
        ...payload
      }),
      signal:controller.signal
    });
    const data = await r.json().catch(()=>({}));
    const accepted = r.ok && data?.accepted === true;
    const status = accepted ? 'SUBMITTED' : 'FAILED';
    neonOrbGovernor.recordExecution({
      opportunityId:opportunity.id,
      provider,
      status,
      spendEUR:Number(opportunity.spendEUR||0),
      expectedRevenueEUR:Number(opportunity.revenueEUR||0),
      netProfitEUR:Number(opportunity.netProfitEUR||0),
      providerResult:data
    });
    return {ok:accepted,status,httpStatus:r.status,provider,data};
  } finally {
    clearTimeout(timer);
  }
}
