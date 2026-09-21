/**
 * NEON PLAYER X — Economic Engine V11.6
 *
 * Turns real work into a traceable economic pipeline without inventing income.
 * Internal work may create COMPUTABLE value. External revenue becomes REAL only
 * after a trusted provider/adapter confirms settlement.
 */
import { unifiedLedger } from './unified-ledger.js';

const KEY='neon_economic_engine_v11_6';
const VERSION=1;
const empty=()=>({version:VERSION,opportunities:[],jobs:[],settlements:[],costs:[],decisions:[],lastTick:null});
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const id=p=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

export class NeonEconomicEngine {
  constructor(storage=globalThis.localStorage){this.storage=storage;this.state=this.#load();this.listeners=new Set()}
  #load(){try{const p=JSON.parse(this.storage?.getItem(KEY)||'null');return {...empty(),...p,opportunities:Array.isArray(p?.opportunities)?p.opportunities:[],jobs:Array.isArray(p?.jobs)?p.jobs:[],settlements:Array.isArray(p?.settlements)?p.settlements:[],costs:Array.isArray(p?.costs)?p.costs:[],decisions:Array.isArray(p?.decisions)?p.decisions:[]}}catch{return empty()}}
  #save(){try{this.storage?.setItem(KEY,JSON.stringify(this.state))}catch{}}
  #emit(event){for(const l of this.listeners){try{l(this.getState(),event)}catch{}}try{globalThis.dispatchEvent?.(new CustomEvent('neon:economic-updated',{detail:{state:this.getState(),event}}))}catch{}}
  subscribe(l){this.listeners.add(l);return()=>this.listeners.delete(l)}
  getState(){return JSON.parse(JSON.stringify(this.state))}
  addOpportunity({id:oid,title,kind='SERVICE',priceEUR=0,costEUR=0,executor='MANUAL',enabled=true,metadata={}}={}){if(!title)throw new Error('Opportunity title required');const o={id:oid||id('opp'),title:String(title),kind:String(kind),priceEUR:n(priceEUR),costEUR:n(costEUR),executor:String(executor),enabled:!!enabled,metadata:{...metadata},createdAt:new Date().toISOString()};this.state.opportunities=this.state.opportunities.filter(x=>x.id!==o.id);this.state.opportunities.push(o);this.#save();this.#emit({type:'OPPORTUNITY_REGISTERED',opportunity:o});return o}
  planBestWork(context={}){const candidates=this.state.opportunities.filter(o=>o.enabled&&o.priceEUR>0).map(o=>({...o,marginEUR:o.priceEUR-o.costEUR})).sort((a,b)=>b.marginEUR-a.marginEUR);const chosen=candidates.find(o=>o.marginEUR>0)||null;const d={id:id('decision'),at:new Date().toISOString(),type:'SELECT_EXTERNAL_WORK',status:chosen?'PLANNED':'NO_POSITIVE_MARGIN_OPPORTUNITY',chosenId:chosen?.id||null,context:{...context}};this.state.decisions.push(d);this.state.decisions=this.state.decisions.slice(-100);this.#save();this.#emit(d);return chosen?{ok:true,opportunity:chosen,decision:d}:{ok:false,decision:d}}
  startJob({opportunityId,clientRef=null}={}){const o=this.state.opportunities.find(x=>x.id===opportunityId);if(!o||!o.enabled)throw new Error('Opportunity unavailable');const j={id:id('job'),opportunityId:o.id,title:o.title,priceEUR:o.priceEUR,costEUR:o.costEUR,status:'IN_PROGRESS',clientRef:clientRef||null,startedAt:new Date().toISOString(),completedAt:null};this.state.jobs.push(j);this.#save();this.#emit({type:'JOB_STARTED',job:j});return j}
  completeJob(jobId,{evidence={},resultRef=null}={}){const j=this.state.jobs.find(x=>x.id===jobId);if(!j)throw new Error('Job not found');if(j.status!=='IN_PROGRESS')return j;j.status='DELIVERED_PENDING_SETTLEMENT';j.completedAt=new Date().toISOString();j.evidence={...evidence};j.resultRef=resultRef||null;this.#save();this.#emit({type:'JOB_DELIVERED',job:j});return j}
  recordPendingSettlement({jobId,provider='UNKNOWN',providerRef,amountEUR}={}){const j=this.state.jobs.find(x=>x.id===jobId);if(!j)throw new Error('Job not found');const existing=this.state.settlements.find(x=>x.provider===String(provider)&&providerRef&&x.providerRef===providerRef);if(existing)return existing;const amount=n(amountEUR||j.priceEUR);const s={id:id('settlement'),jobId,provider:String(provider),providerRef:providerRef||null,amountEUR:amount,status:'PENDING_VERIFICATION',createdAt:new Date().toISOString()};this.state.settlements.push(s);j.status='PAYMENT_PENDING_VERIFICATION';this.#save();this.#emit({type:'SETTLEMENT_PENDING',settlement:s});return s}
  verifySettlement(settlementId,{provider,providerRef,amountEUR,metadata={}}={}){const s=this.state.settlements.find(x=>x.id===settlementId);if(!s)throw new Error('Settlement not found');if(s.status==='VERIFIED')return {settlement:s,alreadyVerified:true};const amount=n(amountEUR||s.amountEUR);if(amount<=0)throw new Error('Settlement amount invalid');s.provider=String(provider||s.provider);s.providerRef=providerRef||s.providerRef;s.amountEUR=amount;s.status='VERIFIED';s.verifiedAt=new Date().toISOString();const entry=unifiedLedger.recordExternalSettlement({source:`${s.provider}_REVENUE`,amount,currency:'EUR',txHash:s.providerRef,metadata:{...metadata,economicSettlementId:s.id,jobId:s.jobId}});const j=this.state.jobs.find(x=>x.id===s.jobId);if(j)j.status='PAID_VERIFIED';this.#save();this.#emit({type:'REVENUE_VERIFIED',settlement:s,ledgerEntry:entry});return {settlement:s,ledgerEntry:entry}}
  recordCost({source,amountEUR,reference=null,verified=false,metadata={}}={}){const amount=n(amountEUR);if(amount<=0)throw new Error('Cost must be positive');const c={id:id('cost'),source:String(source||'UNKNOWN'),amountEUR:amount,reference,status:verified?'VERIFIED':'PENDING',createdAt:new Date().toISOString(),metadata:{...metadata}};this.state.costs.push(c);if(verified)unifiedLedger.registerTransaction({source:`${c.source}_COST`,amount,currency:'EUR',direction:'debit',txHash:reference,status:'verified',metadata});this.#save();this.#emit({type:'COST_RECORDED',cost:c});return c}
  tick(context={}){const plan=this.planBestWork(context);this.state.lastTick=new Date().toISOString();this.#save();return plan}
  metrics(){const verified=this.state.settlements.filter(s=>s.status==='VERIFIED').reduce((a,s)=>a+n(s.amountEUR),0);const pending=this.state.settlements.filter(s=>s.status==='PENDING_VERIFICATION').reduce((a,s)=>a+n(s.amountEUR),0);const costs=this.state.costs.filter(c=>c.status==='VERIFIED').reduce((a,c)=>a+n(c.amountEUR),0);return {verifiedRevenueEUR:verified,pendingRevenueEUR:pending,verifiedCostsEUR:costs,netVerifiedEUR:verified-costs,activeJobs:this.state.jobs.filter(j=>!['PAID_VERIFIED','CANCELLED'].includes(j.status)).length,verifiedSettlements:this.state.settlements.filter(s=>s.status==='VERIFIED').length}}
}

export const neonEconomicEngine=new NeonEconomicEngine();
export const ECONOMIC_ENGINE_POLICY=Object.freeze({internal:'COMPUTABLE_ONLY',external:'VERIFIED_PROVIDER_SETTLEMENT_ONLY',pending:'NEVER_COUNTED_AS_REVENUE',signing:'EXTERNAL_ADAPTER_REQUIRED'});
