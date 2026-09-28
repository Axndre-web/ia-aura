/**
 * NEON ORB — LIFE AGENT
 *
 * Autonomous economic loop. It discovers real opportunities, verifies evidence,
 * applies the governor, and can execute only opportunities explicitly authorized
 * for live execution. Revenue-only work is allowed without autonomous spending.
 * Withdrawals/signing remain separately gated.
 */
import fs from 'node:fs';
import path from 'node:path';
import { neonOrbGovernor } from './economic-governor.js';
import { discoverConfigured, rankPositiveOpportunities } from './opportunity-engine.js';
import { executeOpportunity, verifySettlement } from './external-execution.js';

const dataDir = process.env.NEON_ECONOMIC_DATA_DIR || path.join(process.cwd(), 'data');
const stateFile = process.env.NEON_LIFE_AGENT_STATE_FILE || path.join(dataDir, 'neon-life-agent.json');
const intervalMs = Math.max(60000, Number(process.env.NEON_LIFE_AGENT_INTERVAL_MS || 300000));
const autoRun = process.env.NEON_LIFE_AGENT === 'true';
const autoSpend = process.env.NEON_AUTONOMOUS_SPENDING === 'true';

const defaults = () => ({ version: '11.8.1', mode: 'LIFE_AGENT', running: false, startedAt: null, lastTickAt: null, lastDiscovery: null, lastExecution: null, lastSettlement: null, executed: 0, settled: 0, errors: [] });
function load() { try { return { ...defaults(), ...JSON.parse(fs.readFileSync(stateFile, 'utf8')) }; } catch { return defaults(); } }
let state = load();
let timer = null;
let ticking = false;
function save() { fs.mkdirSync(path.dirname(stateFile), { recursive: true }); const tmp = `${stateFile}.tmp`; fs.writeFileSync(tmp, JSON.stringify(state, null, 2), { mode: 0o600 }); fs.renameSync(tmp, stateFile); }
function errorOf(e) { return String(e?.message || e); }

export async function lifeAgentTick() {
  if (ticking) return { ok: false, code: 'LIFE_AGENT_BUSY', state: snapshot() };
  ticking = true;
  state.lastTickAt = new Date().toISOString();
  try {
    const discovery = await discoverConfigured();
    state.lastDiscovery = { at: new Date().toISOString(), discovered: discovery.discovered.length, errors: discovery.errors.length };
    const candidates = rankPositiveOpportunities();
    const executable = candidates.filter(op => op.realityVerified === true && op.authorizedProvider);

    if (process.env.NEON_LIFE_AGENT_EXECUTE !== 'true') {
      save();
      return { ok: true, action: 'DISCOVER_VERIFY_PLAN', candidates: executable.length, state: snapshot() };
    }

    for (const op of executable.slice(0, 3)) {
      if (Number(op.spendEUR || 0) > 0 && !autoSpend) continue;
      const result = await executeOpportunity(op, { autonomous: true, agent: 'NEON_ORB_LIFE_AGENT' });
      state.lastExecution = { at: new Date().toISOString(), opportunityId: op.id, result: { ok: result.ok, status: result.status, code: result.code } };
      if (result.ok) state.executed += 1;
      if (result.ok && result.settlementRequired && process.env.NEON_LIFE_AGENT_SETTLE === 'true') {
        const settlement = await verifySettlement(op, {
          settlementRef: result.data?.settlementRef || result.data?.id || result.data?.reference,
          amountEUR: result.data?.revenueEUR ?? op.revenueEUR,
          verificationUrl: result.data?.verificationUrl || op.settlementVerificationUrl,
          workRef: result.data?.workRef || op.workRef,
          deliverableRef: result.data?.deliverableRef || op.deliverableRef
        });
        state.lastSettlement = { at: new Date().toISOString(), opportunityId: op.id, result: { ok: settlement.ok, code: settlement.code } };
        if (settlement.ok) state.settled += 1;
      }
    }
    save();
    return { ok: true, action: 'DISCOVER_VERIFY_EXECUTE', candidates: executable.length, state: snapshot() };
  } catch (error) {
    state.errors = [...(state.errors || []), { at: new Date().toISOString(), error: errorOf(error) }].slice(-30);
    save();
    return { ok: false, code: 'LIFE_AGENT_TICK_FAILED', error: errorOf(error), state: snapshot() };
  } finally { ticking = false; }
}

export function startLifeAgent() {
  if (timer) return stopLifeAgent;
  state.running = true; state.startedAt ||= new Date().toISOString(); save();
  if (autoRun) void lifeAgentTick();
  timer = setInterval(() => { if (autoRun) void lifeAgentTick(); }, intervalMs);
  timer.unref?.();
  return stopLifeAgent;
}
export function stopLifeAgent() { if (timer) clearInterval(timer); timer = null; state.running = false; save(); }
export function snapshot() { return snapshotState(); }
function snapshotState() {
  return structuredClone({ ...state, policy: { autoRun, autoExecute: process.env.NEON_LIFE_AGENT_EXECUTE === 'true', autoSpend, autoSettlement: process.env.NEON_LIFE_AGENT_SETTLE === 'true', intervalMs, withdrawals: false, browserPrivateKeys: false }, governor: { mode: neonOrbGovernor.snapshot().mode, execution: neonOrbGovernor.snapshot().execution } });
}
