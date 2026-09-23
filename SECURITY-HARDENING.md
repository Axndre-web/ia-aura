# NEON PLAYER X — Security Hardening V11.7.1

## Applied in this bundle

- `keypair.json` removed from the distributable package.
- `.env` removed from the distributable package.
- Pending external payments are recorded as audit events and **do not increase verified balances**.
- Only an explicit `recordExternalSettlement()` event can increase an external ledger balance.
- PayPal browser callbacks are never treated as settlement proof.
- The browser remains read-only with respect to external custody/signing.

## Required production boundary

A production PayPal flow must have a private server-side verifier:

`Browser -> private verifier -> PayPal API -> verified capture -> Unified Ledger`

The verifier must independently validate the order/capture with PayPal credentials kept outside the browser. The browser callback, order ID, displayed amount, or local ledger entry is not sufficient proof.

Likewise, blockchain observations are read-only. Observed balances are not signing authority and do not authorize spending.

## Secret rotation

If `keypair.json` was ever used with a real wallet, treat the exposed key material as compromised and rotate/migrate the wallet before production use.
