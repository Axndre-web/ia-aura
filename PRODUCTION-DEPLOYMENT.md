# NEON PLAYER X — Node.js production deployment

This release adds the standard Node.js runtime layer without changing the existing application structure.

## Layout

- `server.js` — production HTTP server.
- `package.json` — runtime dependencies and commands.
- `public/` — browser-facing static application.
- `core/` — economic engine and ledger logic.
- `integrations/` — external adapters.
- `tests/` — security regression tests.

## Install and run

Requirements: Node.js 20+.

```bash
npm install
npm run test:security
npm start
```

Default endpoint: `http://localhost:3000`

Health check: `http://localhost:3000/healthz`

## Production environment

Copy `.env.example` to `.env` and configure the environment through the hosting platform or process manager. Never commit `.env` or private keys.

## Economic boundary

The economic engine is deliberately conservative: pending external settlements are not counted as verified revenue. External revenue enters the verified ledger only after an external provider/integration confirms settlement. The Node.js server itself does not invent income, fabricate clients, or authorize payments.

## Security

Keep credentials and signing material outside the release package and inject them through a secure secret manager/environment. Put TLS, authentication and any required rate limiting at the application or trusted reverse-proxy boundary before exposing the service publicly.
