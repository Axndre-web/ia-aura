# NEON ORB — Autonomous Real-Economy Pipeline v11.9

The existing NEON PLAYER X architecture is preserved and extended additively. The economic state machine is now explicit:

`discover → verify real work → calculate net profitability → NEON_ORB authorization → authorized provider → execution → settlement verification → real asset registry → governed currency conversion`

## Reality boundary

An opportunity is not economically computable merely because a feed reports a price. It must have:
- a known source class;
- complete source evidence;
- a real-work verification attestation;
- an authorized execution provider;
- a positive net result above NEON_ORB limits.

An HTTP 2xx from an execution provider means only that the work was submitted/accepted. It is **not revenue**.

## Settlement boundary

Revenue enters the economic state only after:
- provider and provider reference are present;
- work and deliverable references are present;
- amount is positive and within limits;
- trusted verification explicitly reports `verified: true`;
- daily settlement limits pass.

Only then is the result copied into `real-economic-assets.json` as `VERIFIED_REAL_ASSET`.

## Provider boundary

Execution endpoints are not taken from arbitrary opportunity payloads. Configure:
- `NEON_AUTHORIZED_EXECUTION_PROVIDERS=PROVIDER_A,PROVIDER_B`
- `NEON_AUTHORIZED_EXECUTION_ENDPOINTS={"PROVIDER_A":"https://..."}`
- `NEON_ALLOWED_PROVIDER_HOSTS=host.example`

All execution URLs must be HTTPS and allowlisted.

## Autonomous operation

Set `NEON_AUTONOMY_INTERVAL_MS` to a positive value to enable a bounded autonomous discovery/execution loop. The default is disabled. The loop remains governed by `NEON_ORB`, spending policy, execution mode, provider allowlists and settlement limits.

Recommended production posture remains fail-closed until real provider credentials, verification endpoints and independent operational controls are configured.

## No false autonomy

Autonomy means continuous operation inside explicit policy boundaries; it does not mean bypassing provider authentication, network confirmation, accounting evidence or NEON_ORB controls. With the default `READ_VERIFY_ONLY` posture, discovery and verification can operate while money-moving execution remains blocked.
