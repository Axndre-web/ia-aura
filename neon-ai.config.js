// V11.5 — Configuración pública/local segura.
// En HTTPS público no se intenta acceder a http://127.0.0.1:8787 por mixed content.
// El frontend cambia automáticamente a modo READ-ONLY/OBSERVABLE y consulta
// servicios HTTPS públicos para balances verificables.
window.NEON_AI_ENDPOINT = 'http://127.0.0.1:8787/v1/neon-orb';
window.NEON_BRIDGE_HEALTH_URL = 'http://127.0.0.1:8787/health';
window.NEON_PUBLIC_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
window.NEON_PUBLIC_BITCOIN_API = 'https://mempool.space/api';
window.NEON_ORB_EXTERNAL_IDENTITY = Object.freeze({
  handle: '@neonorb',
  solana: { primary: 'AvcMD59dTTTnHKzfdQtF9AcSzgSNcqCWEkcUYx4BnUeh', backups: ['5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3'] },
  bitcoin: { primary: 'bc1qs9dvc02xl8ury20xlsya8xda4cpygzhs0ll9ym', backups: ['bc1qg8ykmeh2dmgq2l6d37zu702vlh6mn72k556ty5'] },
  roles: { solanaPrimary: 'REAL_EXTERNAL_PRIMARY', solanaBackup: 'REAL_EXTERNAL_BACKUP', bitcoinPrimary: 'REAL_EXTERNAL_PRIMARY', bitcoinBackup: 'REAL_EXTERNAL_BACKUP' }
});
window.NEON_SOLANA_ADDRESS = window.NEON_ORB_EXTERNAL_IDENTITY.solana.primary;
window.NEON_BITCOIN_ADDRESS = window.NEON_ORB_EXTERNAL_IDENTITY.bitcoin.primary;
window.NEON_REVENUE_VERIFY_URL = window.NEON_REVENUE_VERIFY_URL || window.NEON_BRIDGE_HEALTH_URL;
window.NEON_ECONOMIC_POLICY = Object.freeze({
  internal: 'COMPUTABLE_ONLY',
  external: 'VERIFIED_PROVIDER_SETTLEMENT_ONLY',
  pending: 'NEVER_COUNTED_AS_REVENUE',
  signing: 'EXTERNAL_ADAPTER_REQUIRED'
});
