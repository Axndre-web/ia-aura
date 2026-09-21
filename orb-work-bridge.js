/** Adapter for Neon Orb work completions. It never blocks the Orb loop. */
import { unifiedLedger } from './unified-ledger.js';

export function registerOrbWork(result = {}) {
  const { workId = `work-${Date.now()}`, currency = 'CREDITS', amount = 0, metadata = {} } = result;
  return unifiedLedger.recordInternalWork({ workId, currency, amount, metadata });
}

export function attachOrbWorkBridge(target = globalThis) {
  const handler = event => {
    try { registerOrbWork(event.detail || {}); } catch (error) {
      console.warn('[Neon Orb] unified economy work bridge:', error);
    }
  };
  target.addEventListener?.('neon:orb-work-completed', handler);
  return () => target.removeEventListener?.('neon:orb-work-completed', handler);
}

export function emitOrbWorkCompleted(result) {
  try {
    globalThis.dispatchEvent(new CustomEvent('neon:orb-work-completed', { detail: result }));
  } catch { registerOrbWork(result); }
}
