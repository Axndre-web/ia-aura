/**
 * Discovery of external compute/work opportunities.
 * Public discovery never creates a contract or spends money.
 */
const AKASH_API = 'https://console-api.akash.network';

function cleanProvider(p) {
  return {
    source: 'AKASH_PUBLIC_NETWORK',
    id: p.owner || null,
    name: p.name || null,
    hostUri: p.hostUri || null,
    website: p.website || null,
    online: Boolean(p.isOnline),
    gpuModels: Array.isArray(p.gpuModels) ? p.gpuModels : [],
    stats: p.stats || null,
    observedAt: new Date().toISOString()
  };
}

export async function discoverComputeProviders({ signal } = {}) {
  const response = await fetch(`${AKASH_API}/v1/providers`, { signal, headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Akash discovery HTTP ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) ? data.map(cleanProvider) : [];
}

export function configuredWorkConnectors() {
  return {
    upwork: {
      enabled: Boolean(process.env.NEON_UPWORK_ACCESS_TOKEN),
      mode: 'OAUTH_REQUIRED',
      note: 'Do not use account passwords. Upwork requires OAuth/API credentials for API access.'
    },
    computeNode: { enabled: Boolean(process.env.NEON_COMPUTE_NODE_URL), mode: 'SERVER_TO_SERVER' },
    runpod: { enabled: Boolean(process.env.NEON_SECRET_RUNPOD_API_KEY), mode: 'SERVER_TO_SERVER' },
    akash: { enabled: true, mode: 'PUBLIC_DISCOVERY' }
  };
}
