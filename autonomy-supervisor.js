/**
 * NEON ORB — Autonomous Operations Supervisor
 *
 * Safe autonomy layer: observes, verifies and plans; it never signs transactions,
 * withdraws funds or executes external spending. External execution remains behind
 * the existing governor + admin controls.
 */
import fs from 'node:fs';
import path from 'node:path';
import { neonOrbGovernor } from './economic-governor.js';
import { discoverConfigured, rankPositiveOpportunities } from './opportunity-engine.js';
import { economicCapabilitiesStatus } from './economic-capabilities.js';

const dataDir = process.env.NEON_ECONOMIC_DATA_DIR || path.join(process.cwd(), 'data');
const stateFile = process.env.NEON_AUTONOMY_STATE_FILE || path.join(dataDir, 'neon-autonomy-state.json');
const bridgeUrl = String(process.env.NEON_BRIDGE_HEALTH_URL || 'http://127.0.0.1:8765/health');
const intervalMs = Math.max(30000, Number(process.env.NEON_AUTONOMY_INTERVAL_MS || 60000));

const defaultState = () => ({
  version: '11.8.1',
  mode: 'GUARDED_AUTONOMY',
  execution: 'READ_VERIFY_ONLY',
  startedAt: null,
  lastCheckAt: null,
  lastDiscoveryAt: null,
  lastStatus: 'STARTING',
  bridge: { status: 'unknown' },
  economy: { totalCapabilities: 10, configuredCapabilities: 0 },
  opportunities: { verifiedPositive: 0 },
  errors: [],
  checks: 0
});

let state = load();
let timer = null;
let running = false;

function load() {
  try { return { ...defaultState(), ...JSON.parse(fs.readFileSync(stateFile, 'utf8')) }; }
  catch { return defaultState(); }
}
function save() {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  const tmp = `${stateFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, stateFile);
}
function recordError(error) {
  state.errors = [...(state.errors || []), { at: new Date().toISOString(), error: String(error?.message || error) }].slice(-20);
}

async function checkBridge() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(bridgeUrl, { signal: controller.signal, cache: 'no-store', headers: { accept: 'application/json' } });
    const body = await response.json().catch(() => ({}));
    return response.ok ? { status: 'healthy', observed: body } : { status: 'degraded', httpStatus: response.status };
  } finally { clearTimeout(timeout); }
}

export async function runAutonomyCheck({ discover = true } = {}) {
  if (running) return { ok: false, code: 'CHECK_ALREADY_RUNNING', state: getSnapshot() };
  running = true;
  state.checks += 1;
  state.lastCheckAt = new Date().toISOString();
  try {
    try { state.bridge = await checkBridge(); }
    catch (error) { state.bridge = { status: 'unreachable' }; recordError(error); }

    const capabilities = economicCapabilitiesStatus();
    state.economy = {
      totalCapabilities: capabilities.total,
      configuredCapabilities: capabilities.configured,
      productionReady: capabilities.productionReady,
      readVerifyOnly: capabilities.readVerifyOnly
    };

    if (discover && process.env.NEON_AUTONOMY_DISCOVERY === 'true') {
      const discovery = await discoverConfigured();
      state.lastDiscoveryAt = new Date().toISOString();
      state.discovery = { discovered: discovery.discovered.length, errors: discovery.errors.length };
    }

    state.opportunities = { verifiedPositive: rankPositiveOpportunities().length };
    const governor = neonOrbGovernor.snapshot();
    state.mode = governor.mode || 'GUARDED_AUTONOMY';
    state.execution = 'READ_VERIFY_ONLY';
    state.lastStatus = governor.paused ? 'PAUSED' : 'OBSERVING';
    state.errors = (state.errors || []).slice(-20);
    save();
    return { ok: true, state: getSnapshot() };
  } catch (error) {
    recordError(error);
    state.lastStatus = 'DEGRADED';
    save();
    return { ok: false, code: 'AUTONOMY_CHECK_FAILED', error: String(error?.message || error), state: getSnapshot() };
  } finally { running = false; }
}

export function startAutonomySupervisor() {
  if (timer) return stopAutonomySupervisor;
  state.startedAt ||= new Date().toISOString();
  state.execution = 'READ_VERIFY_ONLY';
  save();
  void runAutonomyCheck();
  timer = setInterval(() => void runAutonomyCheck(), intervalMs);
  timer.unref?.();
  return stopAutonomySupervisor;
}

export function stopAutonomySupervisor() {
  if (timer) clearInterval(timer);
  timer = null;
  state.lastStatus = 'STOPPED';
  save();
}

export function snapshot() {
  return getSnapshot();
}

function getSnapshot() {
  return structuredClone({
    ...state,
    supervisor: { running: Boolean(timer), intervalMs, bridgeUrl: new URL(bridgeUrl).origin },
    safety: {
      transactionSigning: false,
      withdrawals: false,
      autonomousSpending: false,
      privateKeysExposedToBrowser: false
    }
  });
}
