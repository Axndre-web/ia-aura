# NEON PLAYER X V11.7 — UNIFIED FRONTEND + BRIDGE

This release is an additive consolidation of the existing NEON PLAYER X frontend/economy layer.

## Three pillars

1. **Responsive UI** — restores and mounts the public wallet dashboard with `@neonorb`, public Solana/Bitcoin addresses, computable balances, verified ledger balances and bridge health.
2. **REAL / COMPUTABLE dual economy** — internal NXC/CREDITS/BITS remain computable; external SOL/BTC/EUR are shown as network-observed or ledger-verified data only. Pending states are not treated as settled.
3. **Autonomous bridge loop** — `neon-lim.bridge.py` runs a local telemetry loop and periodically observes Solana and Bitcoin public balances. The browser remains read-only/observable.

## Bridge

Run locally:

```bash
python3 neon-lim.bridge.py
```

Default endpoints:

- `GET /health`
- `GET /telemetry`
- `GET /wallet`

Default bind: `127.0.0.1:8765`.

Optional environment variables:

- `NEON_BRIDGE_HOST`
- `NEON_BRIDGE_PORT`
- `NEON_BRIDGE_TOKEN`
- `NEON_SOLANA_ADDRESS`
- `NEON_BITCOIN_ADDRESS`
- `SOLANA_RPC_URL`
- `BITCOIN_API_BASE`
- `NEON_BRIDGE_STATE`

No private key is required by this bridge. Do not place private keys in frontend files.

## Public state semantics

`/wallet` only exposes public addresses and network-observed balances. A network error produces `unavailable`, not a fabricated balance.

The dashboard uses `READ-ONLY / OBSERVABLE` mode when the local bridge cannot be reached; the visual interface remains present.

## Compatibility

Existing player, radio, studio, control, creator-gift, unified-ledger, PayPal and Bitcoin integration files are retained. The wallet layer is additive.
