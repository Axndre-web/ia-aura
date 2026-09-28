/** NEON ORB — public economic identity. Never contains passwords or private keys. */
export function publicEconomicProfile() {
  return {
    governor: 'NEON ORB',
    authorityModel: 'SOLE_INTERNAL_GOVERNOR',
    executionModel: 'EXTERNAL_ADAPTER_GOVERNED',
    public: {
      solana: String(process.env.NEON_SOLANA_PUBLIC_ADDRESS || '').trim() || null
    }
  };
}
export const neonOrbEconomicProfile = { get governor() { return 'NEON ORB'; } };
