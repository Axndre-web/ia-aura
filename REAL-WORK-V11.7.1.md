# NEON PLAYER X V11.7.1 — REAL WORK / UNIFIED

This release is an additive layer over V11.7.

## Guarantees
- Existing player, radio, studio, control, wallet and economic modules remain in place.
- Internal values (NXC/CREDITS/BITS/EXP) remain COMPUTABLE.
- External revenue remains REAL only after trusted verification.
- Pending settlements never increase verified balances.
- The Real Work dashboard is read-only and never fabricates jobs, customers, receipts, signatures, hashes or balances.
- `/health`, `/telemetry`, `/wallet`, `/work` and `/receipts` expose observable bridge state only.
- Private credentials and signing material are intentionally excluded from the public ZIP.

## Real Work pipeline
`EXECUTING → DELIVERED → VERIFYING → VERIFIED`

The browser reflects locally registered Economic Engine jobs and verified settlements. Network proofs are displayed only when a real provider/bridge supplies them.
