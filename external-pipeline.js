/**
 * NEON PLAYER X — Governed external-work pipeline.
 *
 * Single production boundary:
 * discover real external work -> calculate net profitability -> NEON_ORB
 * authorization -> authorized provider execution -> trusted settlement
 * verification -> unified ledger.
 *
 * Pending/unverified value is never incorporated into the economic ledger.
 */
import { neonOrbGovernor } from './economic-governor.js';
import { executeOpportunity } from './external-execution.js';

const n = (v, d=0) => Number.isFinite(Number(v)) ? Number(v) : d;

function providerKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

function extractSettlement(result = {}, opportunity = {}) {
  const data = result?.data || result?.providerResult || result || {};
  const ref = data.providerRef || data.settlementRef || data.paymentIntentId || data.orderID ||
    opportunity.settlementRef || opportunity.metadata?.settlementRef || null;
  const provider = data.provider || opportunity.settlementProvider || null;
  const amountEUR = n(data.amountEUR ?? opportunity.revenueEUR, 0);
  return ref && provider && amountEUR > 0 ? { provider, providerRef: ref, amountEUR } : null;
}

async function verifyWithProvider(providers, settlement, opportunity) {
  const provider = providerKey(settlement.provider);
  let verification;
  if (provider === 'paypal') verification = await providers.paypal.verifyOrder(settlement.providerRef);
  else if (provider === 'stripe') verification = await providers.stripe.verifyPaymentIntent(settlement.providerRef);
  else throw new Error(`SETTLEMENT_PROVIDER_NOT_AUTHORIZED:${settlement.provider}`);

  if (verification.verified !== true || n(verification.amountEUR) !== n(settlement.amountEUR)) {
    return { ok:false, code:'SETTLEMENT_NOT_VERIFIED', verification };
  }
  const verified = await neonOrbGovernor.verifySettlement({
    provider: verification.provider,
    providerRef: verification.providerRef,
    amountEUR: verification.amountEUR,
    verification,
    opportunityId: opportunity.id,
    metadata: { source: opportunity.source, title: opportunity.title }
  });
  return { ...verified, verification };
}

/**
 * Execute one opportunity only through a configured/recognized provider.
 * Provider execution and settlement verification are deliberately separate.
 */
export async function executeGovernedOpportunity(opportunity, { providers, payload = {} } = {}) {
  if (!opportunity?.id) return { ok:false, code:'OPPORTUNITY_REQUIRED' };
  if (!providers) return { ok:false, code:'PROVIDER_REGISTRY_REQUIRED' };

  const auth = neonOrbGovernor.authorizeOpportunity(opportunity);
  neonOrbGovernor.audit('WORK_AUTHORIZATION', { opportunityId: opportunity.id, authorization: auth });
  if (!auth.ok) return { ok:false, stage:'GOVERNOR', ...auth };

  const provider = providerKey(opportunity.executionProvider || opportunity.provider);
  let result;

  if (provider === 'runpod') {
    result = await providers.runpod.submit(payload);
  } else if (provider === 'compute' || provider === 'compute-node') {
    result = await providers.compute.submit(payload);
  } else if (provider === 'http') {
    result = await executeOpportunity(opportunity, payload);
  } else {
    return { ok:false, stage:'PROVIDER', code:'AUTHORIZED_PROVIDER_REQUIRED' };
  }

  const execution = neonOrbGovernor.recordExecution({
    opportunityId: opportunity.id,
    provider: provider.toUpperCase(),
    status: result.ok === false ? 'FAILED' : 'EXECUTED',
    spendEUR: n(opportunity.spendEUR),
    revenueEUR: n(opportunity.revenueEUR),
    netProfitEUR: n(opportunity.netProfitEUR),
    providerRef: result.jobId || result.providerRef || null,
    providerResult: result
  });

  if (result.ok === false) return { ok:false, stage:'EXECUTION', execution, result };

  const settlement = extractSettlement(result, opportunity);
  if (!settlement) {
    neonOrbGovernor.audit('SETTLEMENT_PENDING', { opportunityId: opportunity.id, executionId: execution.id });
    return { ok:true, stage:'EXECUTED_PENDING_SETTLEMENT', execution, code:'SETTLEMENT_REFERENCE_PENDING' };
  }

  const verified = await verifyWithProvider(providers, settlement, opportunity);
  if (!verified.ok) {
    neonOrbGovernor.audit('SETTLEMENT_REJECTED', { opportunityId: opportunity.id, executionId: execution.id, verification: verified.verification || null });
    return { ok:false, stage:'SETTLEMENT_VERIFICATION', execution, ...verified };
  }

  execution.status = 'SETTLED_VERIFIED';
  execution.revenueEUR = n(verified.verification.amountEUR);
  execution.provider = verified.verification.provider;
  execution.providerRef = verified.verification.providerRef;
  neonOrbGovernor.recordExecution(execution);
  return { ok:true, stage:'SETTLED_VERIFIED', execution, settlement: verified };
}
