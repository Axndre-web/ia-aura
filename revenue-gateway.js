/** Revenue gateway: browser-safe adapter for trusted settlement verification. */
import { neonEconomicEngine } from '../core/economic-engine.js';

function bridgeUrl(path){
  const configured=globalThis.NEON_REVENUE_VERIFY_URL||globalThis.NEON_BRIDGE_HEALTH_URL;
  if(!configured)return null;
  try{const u=new URL(configured,location.href);u.pathname=path;u.search='';return location.protocol==='https:'&&u.protocol==='http:'?null:u.href}catch{return null}
}

export async function verifyPayPalOrder(orderID, expectedAmountEUR=null){
  if(!orderID)throw new Error('PAYPAL_ORDER_ID_REQUIRED');
  const url=bridgeUrl('/paypal/verify');
  if(!url) return {ok:false,status:'VERIFICATION_BACKEND_UNAVAILABLE'};
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderID,expectedAmountEUR})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok||data.status!=='VERIFIED')return {ok:false,...data};
  let jobId=data.jobId;
  if(!jobId){
    const opp=neonEconomicEngine.addOpportunity({id:`paypal-${orderID}`,title:'Venta / servicio NEON PLAYER X',kind:'PRODUCT_SALE',priceEUR:data.amountEUR,costEUR:0,executor:'PAYPAL',enabled:true,metadata:{orderID}});
    const job=neonEconomicEngine.startJob({opportunityId:opp.id,clientRef:orderID});
    neonEconomicEngine.completeJob(job.id,{evidence:{provider:'PAYPAL',orderID},resultRef:orderID});
    jobId=job.id;
  }
  const settlementId=data.settlementId || neonEconomicEngine.recordPendingSettlement({jobId,provider:'PAYPAL',providerRef:data.orderID,amountEUR:data.amountEUR}).id;
  return neonEconomicEngine.verifySettlement(settlementId,{provider:'PAYPAL',providerRef:data.orderID,amountEUR:data.amountEUR,metadata:{currency:data.currency||'EUR',paypalStatus:data.paypalStatus,captureID:data.captureID}});
}

export { neonEconomicEngine };
