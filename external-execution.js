import { neonOrbGovernor } from './economic-governor.js';
import { assertAllowedForExecution } from './provider-security.js';
import { verifyRealWork } from './real-work-verifier.js';
import { realEconomicRegistry } from './real-economic-registry.js';

const providers = () => {
  const out = new Map();
  for (const item of String(process.env.NEON_AUTHORIZED_EXECUTION_PROVIDERS || '').split(',').map(s=>s.trim()).filter(Boolean)) {
    const [name, url] = item.split('=', 2).map(s=>s?.trim());
    if (name && url) out.set(name, url);
  }
  return out;
};

export async function executeOpportunity(opportunity, payload = {}) {
  if (opportunity.realityVerified !== true) return { ok:false, code:'REAL_WORK_NOT_VERIFIED' };
  if (!opportunity.authorizedProvider) return { ok:false, code:'AUTHORIZED_PROVIDER_REQUIRED' };
  const providerUrl = providers().get(String(opportunity.authorizedProvider));
  if (!providerUrl) return { ok:false, code:'AUTHORIZED_PROVIDER_NOT_CONFIGURED' };
  const auth = neonOrbGovernor.authorizeOpportunity(opportunity);
  if (!auth.ok) return { ok:false, ...auth };

  const url = assertAllowedForExecution(opportunity.executeUrl || providerUrl);
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(),15000);
  try {
    const r = await fetch(url,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({opportunityId:opportunity.id,provider:opportunity.authorizedProvider,...payload}),signal:controller.signal});
    const data = await r.json().catch(()=>({}));
    const status = r.ok ? 'EXECUTED_PENDING_SETTLEMENT' : 'FAILED';
    neonOrbGovernor.recordExecution({opportunityId:opportunity.id,status,spendEUR:Number(opportunity.spendEUR||0),revenueEUR:0,netProfitEUR:0,providerResult:data});
    return {ok:r.ok,status,httpStatus:r.status,data,settlementRequired:r.ok};
  } finally { clearTimeout(timer); }
}

export async function verifySettlement(opportunity, settlement = {}) {
  if (!opportunity || !opportunity.authorizedProvider) return {ok:false,code:'AUTHORIZED_PROVIDER_REQUIRED'};
  const settlementRef = String(settlement.settlementRef || settlement.providerRef || '').trim();
  if (!settlementRef) return {ok:false,code:'SETTLEMENT_REFERENCE_REQUIRED'};
  const verificationUrl = settlement.verificationUrl || opportunity.settlementVerificationUrl;
  if (!verificationUrl) return {ok:false,code:'SETTLEMENT_VERIFICATION_URL_REQUIRED'};
  const verification = await verifyRealWork({...opportunity, verificationUrl, deliverableRef: settlement.deliverableRef || opportunity.deliverableRef, workRef: settlement.workRef || opportunity.workRef});
  if (!verification.verified) return {ok:false,...verification};
  const amountEUR = Number(settlement.amountEUR ?? opportunity.revenueEUR ?? 0);
  const settlementAuth = neonOrbGovernor.authorizeSettlement({ amountEUR });
  if (!settlementAuth.ok) return {ok:false,...settlementAuth};
  const registered = realEconomicRegistry.registerVerifiedAsset({
    kind:'VERIFIED_EXTERNAL_SETTLEMENT', provider:opportunity.authorizedProvider, providerRef:settlementRef,
    workRef:settlement.workRef || opportunity.workRef, deliverableRef:settlement.deliverableRef || opportunity.deliverableRef,
    amountEUR, currency:settlement.currency || 'EUR', settlementRef, verification
  });
  if (!registered.ok) return registered;
  neonOrbGovernor.recordSettlement({opportunityId:opportunity.id,revenueEUR:amountEUR,settlementRef,provider:opportunity.authorizedProvider,verification});
  return {ok:true,code:'SETTLEMENT_VERIFIED_AND_REGISTERED',asset:registered.asset,verification};
}
