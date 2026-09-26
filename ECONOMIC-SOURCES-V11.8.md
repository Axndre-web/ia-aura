# NEON ORB — External Economic Sources v11.8

This layer is additive. Existing PWA, streaming, ledger, provider and governor components remain intact.

## Ten source classes

1. Programmatic advertising — impressions/clicks/conversions plus SSP/DSP settlement.
2. IPFS/Filecoin — content identity, storage proof and provider settlement.
3. Web3 micropayments — transaction hash, confirmations and recipient match.
4. Financial oracles/APIs — signed/timestamped market references. **Reference-only:** a price quote is not revenue.
5. CDN/edge computing — usage meter plus provider report and settlement.
6. Validator/node rewards — epoch, validator identity and network proof.
7. Transcoding/streaming APIs — job, completion and provider settlement.
8. Affiliate/referral networks — click/conversion identifiers and network settlement.
9. Identity/access services — verified paid event and provider settlement.
10. Telemetry/analytics — privacy-safe usage event, billable metric and provider report.

## Computability rule

A source can be discovered without being counted as money. An opportunity becomes rankable only when:

- the source class is known;
- required evidence is complete;
- the source is not reference-only;
- revenue and costs can be expressed in the common accounting currency;
- the settlement path is identifiable.

A positive margin alone does not make an opportunity executable.

## Responsible integration

The catalog contains no API keys, wallets, private keys or credentials. All integrations are disabled until explicitly configured. Existing `READ_VERIFY_ONLY`, spending/signing/withdrawal controls and provider allowlists remain the final execution boundary.

`GET /api/economy/sources` exposes the catalog and configuration count.

`POST /api/economy/sources/observe` validates a proposed observation without converting it into revenue.

The supplied repository did not contain an `ads.json` file, so no claim is made that programmatic advertising is currently connected. The same principle applies to every other source: catalogued means **supported by architecture**, not **currently producing real income**.
