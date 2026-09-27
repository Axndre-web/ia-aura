import { neonOrbGovernor } from './economic-governor.js';
import { assertAllowedForExecution } from './provider-security.js';

const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;

export function calculateCurrencyConversion({fromAsset,toAsset,amount,amountEUR,quotedReceiveEUR,rate,feeEUR=0,networkEUR=0,slippageEUR=0,quoteRef=null,expiresAt=null}={}) {
  const inputEUR=n(amountEUR, n(amount));
  const receiveEUR=quotedReceiveEUR !== undefined ? n(quotedReceiveEUR) : inputEUR*n(rate);
  const costs=n(feeEUR)+n(networkEUR)+n(slippageEUR);
  const netReceiveEUR=receiveEUR-costs;
  return {
    fromAsset:String(fromAsset||''), toAsset:String(toAsset||''), amount:n(amount,inputEUR), amountEUR:inputEUR,
    rate:n(rate, inputEUR>0 ? receiveEUR/inputEUR : 0), quotedReceiveEUR:receiveEUR,
    feeEUR:n(feeEUR), networkEUR:n(networkEUR), slippageEUR:n(slippageEUR), netReceiveEUR,
    quoteRef, expiresAt, economicallyPositive:netReceiveEUR>0
  };
}

export async function fetchCurrencyQuote(url, payload={}, {timeoutMs=8000}={}) {
  const target=assertAllowedForExecution(url); const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),Math.max(1000,timeoutMs));
  try { const r=await fetch(target,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify(payload),signal:controller.signal}); if(!r.ok)throw new Error(`QUOTE_HTTP_${r.status}`); return await r.json(); }
  finally { clearTimeout(timer); }
}

export async function executeCurrencyConversion(url, conversion, payload={}, {timeoutMs=10000}={}) {
  const calc=calculateCurrencyConversion(conversion);
  const auth=neonOrbGovernor.authorizeConversion(calc);
  if(!auth.ok)return {ok:false,...auth,conversion:calc};
  const target=assertAllowedForExecution(url); const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),Math.max(1000,timeoutMs));
  try {
    const r=await fetch(target,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({conversion:calc,...payload}),signal:controller.signal});
    const data=await r.json().catch(()=>({}));
    neonOrbGovernor.recordConversion({status:r.ok?'SUBMITTED':'FAILED',...calc,providerResult:data});
    return {ok:r.ok,status:r.status,conversion:calc,data};
  } finally { clearTimeout(timer); }
}
