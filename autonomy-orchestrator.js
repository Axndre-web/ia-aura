import { discoverConfigured, rankPositiveOpportunities } from './opportunity-engine.js';
import { executeOpportunity } from './external-execution.js';
import { neonOrbGovernor } from './economic-governor.js';

export async function autonomousTick() {
  if (neonOrbGovernor.snapshot().paused) return { ok: false, status: 'PAUSED' };
  const discovery = await discoverConfigured();
  const opportunities = rankPositiveOpportunities();
  const results = [];
  for (const opportunity of opportunities.slice(0, Number(process.env.NEON_AUTONOMY_MAX_OPPORTUNITIES_PER_TICK || 3))) {
    const result = await executeOpportunity(opportunity, { autonomous: true });
    results.push({ opportunityId: opportunity.id, ...result });
  }
  return { ok: true, discovered: discovery.discovered.length, errors: discovery.errors, candidates: opportunities.length, executions: results };
}
