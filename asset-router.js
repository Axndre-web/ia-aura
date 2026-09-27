import { neonOrbGovernor } from './economic-governor.js';
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const allowedHosts=()=>new Set(String(process.env.NEON_ALLOWED_PROVIDER_HOSTS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean));
function assertAllowed(url){const u=new URL(url); const hosts=allowedHosts(); if (!hosts.size || !hosts.has(u.hostname.toLowerCase())) throw new Error('PROVIDER_HOST_NOT_ALLOWLISTED'); return u;}

export function calculateConversion({fromAsset,toAsset,amountEUR,quotedReceiveEUR,feeEUR=0,networkEUR=0,slippageEUR=0,expiresAt=null}={}) {
  const amount=n(amountEUR), receive=n(quotedReceiveEUR), costs=n(feeEUR)+n(networkEUR)+n(slippageEUR);
  return { fromAsset:String(fromAsset||''), toAsset:String(toAsset||''), amountEUR:amount, quotedReceiveEUR:receive, feeEUR:n(feeEUR), networkEUR:n(networkEUR), slippageEUR:n(slippageEUR), netReceiveEUR:receive-costs, expiresAt, economicallyPositive:receive-costs>amount };
}

export async function fetchConversionQuote(url, payload, {timeoutMs=8000}={}) {
  const target=assertAllowed(url); const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),Math.max(1000,timeoutMs));
  try { const r=await fetch(target,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal}); if(!r.ok)throw new Error(`QUOTE_HTTP_${r.status}`); return await r.json(); }
  finally { clearTimeout(timer); }
}

export async function executeConversion(url, payload, {timeoutMs=10000}={}) {
  assertAllowed(url); const auth=neonOrbGovernor.authorizeConversion(payload); if(!auth.ok)return {ok:false,...auth};
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),Math.max(1000,timeoutMs));
  try { const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal}); const data=await r.json().catch(()=>({})); const result={ok:r.ok,status:r.status,data}; neonOrbGovernor.recordConversion({status:r.ok?'SUBMITTED':'FAILED',...payload,providerResult:data}); return result; }
  finally { clearTimeout(timer); }
}
