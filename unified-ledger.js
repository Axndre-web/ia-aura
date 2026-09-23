/** UnifiedLedger - Neon Player X economy PoC.
 * Internal credits and external settlement records share one chronological ledger.
 * External balances are only updated from verified/explicit integration events.
 */
const STORAGE_KEY = 'neon_unified_ledger_db';
const VERSION = 1;

const emptyState = () => ({
  version: VERSION,
  internal: { nxc: 0, credits: 0, bits: 0 },
  external: { btcSatoshis: 0, fiatEuroBalance: 0 },
  history: []
});

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export class UnifiedLedger {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.state = this.#load();
    this.listeners = new Set();
  }

  #load() {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      return {
        ...emptyState(), ...parsed,
        internal: { ...emptyState().internal, ...(parsed.internal || {}) },
        external: { ...emptyState().external, ...(parsed.external || {}) },
        history: Array.isArray(parsed.history) ? parsed.history : []
      };
    } catch {
      return emptyState();
    }
  }

  #save() {
    try { this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch {}
  }

  #emit(event) {
    for (const listener of this.listeners) {
      try { listener(this.getState(), event); } catch {}
    }
    try { globalThis.dispatchEvent?.(new CustomEvent('neon:ledger-updated', { detail: { state: this.getState(), event } })); } catch {}
  }

  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  registerTransaction({ source, amount, currency, txHash = null, timestamp = Date.now(), direction = 'credit', workId = null, status = 'recorded', metadata = {}, affectBalance = true }) {
    const value = num(amount);
    const cur = String(currency || '').toUpperCase();
    if (!source || !cur || !Number.isFinite(value)) throw new Error('Invalid transaction');

    const signed = direction === 'debit' ? -Math.abs(value) : Math.abs(value);
    const balanceAffects = affectBalance === true;
    const entry = {
      id: `${timestamp}-${Math.random().toString(36).slice(2, 9)}`,
      source: String(source), amount: signed, currency: cur,
      txHash: txHash || null, timestamp: num(timestamp), direction,
      workId: workId || null, status, metadata: { ...metadata }
    };

    if (!['NXC', 'CREDITS', 'BITS', 'BTC_SATOSHIS', 'EUR'].includes(cur)) {
      throw new Error(`Unsupported currency: ${cur}`);
    }
    if (balanceAffects) {
      if (cur === 'NXC') this.state.internal.nxc += signed;
      else if (cur === 'CREDITS') this.state.internal.credits += signed;
      else if (cur === 'BITS') this.state.internal.bits += signed;
      else if (cur === 'BTC_SATOSHIS') this.state.external.btcSatoshis += signed;
      else if (cur === 'EUR') this.state.external.fiatEuroBalance += signed;
    }

    this.state.history.push(entry);
    this.#save();
    this.#emit(entry);
    return entry;
  }

  recordInternalWork({ workId, currency, amount, metadata = {} }) {
    return this.registerTransaction({ source: 'NEON_ORB_WORK', workId, currency, amount, metadata });
  }

  recordPendingExternal({ source, amount, currency, txHash = null, metadata = {} }) {
    return this.registerTransaction({
      source, amount, currency, txHash,
      status: 'pending-verification', metadata,
      affectBalance: false
    });
  }

  recordExternalSettlement({ source, amount, currency, txHash, metadata = {} }) {
    return this.registerTransaction({
      source, amount, currency, txHash,
      status: 'verified', metadata,
      affectBalance: true
    });
  }

  reset() {
    this.state = emptyState(); this.#save(); this.#emit({ source: 'SYSTEM', type: 'reset' });
  }
}

export const unifiedLedger = new UnifiedLedger();
export { STORAGE_KEY };
