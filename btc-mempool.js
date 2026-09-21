/** Read-only Mempool integration. No private keys and no automatic signing/spending. */
const API = 'https://mempool.space/api';

export async function getAddressTransactions(address, { signal } = {}) {
  const response = await fetch(`${API}/address/${encodeURIComponent(address)}/txs`, { signal });
  if (!response.ok) throw new Error(`Mempool HTTP ${response.status}`);
  return response.json();
}

export function incomingToAddress(tx, address) {
  return (tx.vout || []).reduce((sum, output) => {
    const addresses = output.scriptpubkey_address ? [output.scriptpubkey_address] : (output.scriptpubkey_addresses || []);
    return addresses.includes(address) ? sum + Number(output.value || 0) : sum;
  }, 0);
}

export function confirmations(tx, tipHeight) {
  if (!tx.status?.confirmed || !Number.isFinite(Number(tx.status.block_height))) return 0;
  return Math.max(0, Number(tipHeight) - Number(tx.status.block_height) + 1);
}

export async function auditIncoming({ address, minConfirmations = 1, signal } = {}) {
  if (!address) throw new Error('Bitcoin address required');
  const [txs, tipResponse] = await Promise.all([
    getAddressTransactions(address, { signal }),
    fetch(`${API}/blocks/tip/height`, { signal })
  ]);
  if (!tipResponse.ok) throw new Error(`Mempool tip HTTP ${tipResponse.status}`);
  const tip = Number(await tipResponse.text());
  return txs.map(tx => ({
    txid: tx.txid,
    satoshis: incomingToAddress(tx, address),
    confirmed: Boolean(tx.status?.confirmed),
    confirmations: confirmations(tx, tip),
    blockHeight: tx.status?.block_height ?? null,
    timestamp: tx.status?.block_time ? tx.status.block_time * 1000 : null
  })).filter(x => x.satoshis > 0 && x.confirmations >= minConfirmations);
}

export async function getBtcEurRate({ signal } = {}) {
  const response = await fetch(`${API}/v1/prices`, { signal });
  if (!response.ok) throw new Error(`Mempool price HTTP ${response.status}`);
  const data = await response.json();
  return Number(data.EUR);
}
