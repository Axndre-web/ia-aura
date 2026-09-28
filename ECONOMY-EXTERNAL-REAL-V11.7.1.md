# NEON ORB — External Real Economy Layer

This layer preserves the existing NEON PLAYER X base and adds governed external-economy interfaces.

## Governor

NEON ORB remains the sole internal governor of the application. External execution is performed only through explicit provider adapters and credentials available to the server.

## Public wallet identity

The Solana address is configured through `NEON_SOLANA_PUBLIC_ADDRESS`. Public addresses may be displayed; private keys, seed phrases and account passwords must never be embedded in the application or ZIP.

## Real computable work

The system can discover public compute-network information and register opportunities, but discovery is not a contract and a pending opportunity is not revenue. External revenue becomes verified only after an external provider confirms settlement.

Akash exposes public provider/network data through its Console API. Deployment and lease creation are authenticated operations and can spend account credits, so they remain behind the governor's execution policy.

Upwork's API uses OAuth 2.0 and requires application credentials; account passwords are not an appropriate integration mechanism.

## Asset converter

`/api/economy/asset-convert` performs reference valuation from an observed quantity and supplied rate. It does not mint money, exchange funds or sign transactions.

## Credentials

No email password is stored in this project. Any password previously shared in chat should be rotated and replaced with provider-issued OAuth/API credentials or a server-side secret reference.
