/** Read-only EVM/Solana verification. Never signs or broadcasts transactions. */
export class CryptoReadOnlyProvider {
  constructor(secrets) { this.secrets = secrets; }
  async evmBalance({ rpcUrl, address, signal } = {}) {
    if (!rpcUrl || !address) throw new Error('EVM_RPC_URL_AND_ADDRESS_REQUIRED');
    const r = await fetch(rpcUrl, { method: 'POST', signal, headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }) });
    if (!r.ok) throw new Error(`EVM_RPC_HTTP_${r.status}`);
    const data = await r.json();
    if (data.error) throw new Error(`EVM_RPC_${data.error.code || 'ERROR'}`);
    return { chain: 'EVM', address, wei: BigInt(data.result).toString(), verified: true };
  }
  async solanaBalance({ rpcUrl, address, signal } = {}) {
    if (!rpcUrl || !address) throw new Error('SOLANA_RPC_URL_AND_ADDRESS_REQUIRED');
    const r = await fetch(rpcUrl, { method: 'POST', signal, headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] }) });
    if (!r.ok) throw new Error(`SOLANA_RPC_HTTP_${r.status}`);
    const data = await r.json();
    if (data.error) throw new Error(`SOLANA_RPC_${data.error.code || 'ERROR'}`);
    return { chain: 'SOLANA', address, lamports: String(data.result?.value ?? 0), slot: data.result?.context?.slot ?? null, verified: true };
  }
}
