import { neonOrbGovernor } from './economic-governor.js';
import { realEconomicRegistry } from './real-economic-registry.js';

export function verifyAndRegisterSettlement(input = {}) {
  const auth = neonOrbGovernor.authorizeSettlementVerification(input);
  if (!auth.ok) return auth;
  const recorded = neonOrbGovernor.recordVerifiedSettlement(input);
  if (recorded?.ok === false) return recorded;
  const asset = realEconomicRegistry.register({
    opportunityId: input.opportunityId,
    provider: input.provider,
    providerRef: input.providerRef,
    workRef: input.workRef,
    deliverableRef: input.deliverableRef,
    amountEUR: input.amountEUR,
    currency: input.currency || 'EUR',
    verification: input.verification,
    metadata: input.metadata
  });
  return { ok:true, settlement:recorded, asset };
}
