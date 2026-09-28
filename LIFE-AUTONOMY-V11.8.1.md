# NEON ORB — LIFE AUTONOMY

Neon Orb can continuously discover, verify and execute real external economic work through configured providers.

## Operating modes

- `READ_VERIFY_ONLY`: discover and verify only.
- `LIVE_EXECUTION`: execution is permitted only when the economic governor also authorizes it.
- `NEON_LIFE_AGENT=true`: starts the autonomous life loop.
- `NEON_LIFE_AGENT_EXECUTE=true`: allows the loop to call authorized providers.
- `NEON_AUTONOMOUS_SPENDING=true`: additionally permits opportunities with a positive spend, subject to governor limits.
- `NEON_LIFE_AGENT_SETTLE=true`: attempts settlement verification only when the provider returns a settlement reference and verifiable evidence.

## Wallet/secret boundary

Private keys and seeds are server-only. The browser, PWA, service worker and public API never receive secret material. Prefer `NEON_SECRET_*_FILE` variables backed by an OS secret store or mounted secret file.

The existing `keypair.js` remains part of the preserved base. Do not copy its contents into frontend code, logs, telemetry, Git, screenshots or API responses.

## Economic reality boundary

The agent never fabricates clients, work, payments, settlements or blockchain confirmations. Every opportunity must carry provider authorization and reality verification before execution; settlement must be independently verified before it becomes registered revenue.

## Production recommendation

Use a dedicated wallet with only the operating balance required by the configured limits. Keep withdrawals disabled and require an explicit operational policy for any future withdrawal capability.
