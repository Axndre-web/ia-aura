# NEON ORB — External Opportunity & Asset Routing Layer

This layer is additive: the existing NEON PLAYER X base remains intact. It adds a server-side discovery, profitability, execution-gating and asset-routing layer with **NEON_ORB as the sole logical governor**.

## What it does
- Discovers opportunities from configured JSON feeds (`NEON_OPPORTUNITY_FEEDS`).
- Calculates gross revenue, provider fees, compute cost, network cost, reserves and **net profit**.
- Refuses economic execution when the net-profit floor, margin floor, spend limits or governor state are not satisfied.
- Keeps pending/unverified outcomes out of realized revenue accounting.
- Supports real provider endpoints only through an HTTPS host allowlist (`NEON_ALLOWED_PROVIDER_HOSTS`).
- Provides conversion quote/evaluation and an execution path that remains disabled unless live execution + spending are explicitly enabled.
- Does not mint assets, invent clients, fabricate revenue or treat a quote as a settlement.

## Governor
`NEON_ORB` is recorded as the logical governor in the server state. External systems remain constrained by their own authentication, permissions, network rules and provider policies.

Default posture remains non-live:
- `NEON_EXECUTION_MODE=READ_VERIFY_ONLY`
- `NEON_ALLOW_SPENDING=false`
- `NEON_ALLOW_SIGNING=false`
- `NEON_ALLOW_WITHDRAWALS=false`

## Live activation
Live execution requires real provider credentials/permissions and an explicit environment configuration. Signing keys should be isolated in a KMS/HSM or dedicated signer rather than placed in the application repository.

The layer is designed to accumulate only **verified external assets/results**, not internal accounting units presented as money.
