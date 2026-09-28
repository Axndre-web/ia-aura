# NEON ORB — FUSION RELEASE v11.7.1

This package is a layered fusion of the existing NEON PLAYER X base with the supplied NEON ORB + Solana/PWA package.

## Preserved
- Existing core economic engine and unified ledger.
- Existing radio/static architecture and UI.
- Existing Real Work and economic adapters.
- Existing public UI and PWA assets.

## Integrated
- Server-side Solana read-only balance observation.
- Public Neon Orb economic profile.
- Same-origin radio proxy and hardened radio startup.
- PWA service-worker registration in the public client.
- Responsive wallet dashboard using the server-side Solana observation endpoint.
- Asset valuation layer that never mints or fabricates funds.
- External compute discovery and connector status.

## Security hardening
- Legacy `general.js` remains as a compatibility path but no longer contains or generates wallet secrets.
- Deployment secrets, `.env`, keypair files and local data are excluded.
- Secret-hygiene regression test added.
- No account password or private wallet material is embedded in the release.

## Verification
- `npm test`: 9/9 passed.
- `node scripts-check-package.mjs`: passed.
- JavaScript syntax checks: passed.

## Economic accounting rule
Observed/estimated asset values remain valuation-only. External revenue is counted as real only after an external settlement/provider verification. No real transaction is claimed by this package merely because an opportunity or balance was observed.
