export default {
  name: "neon-player-x-real-work-unified",
  version: "11.8.1",
  private: true,
  type: "module",
  description: "NEON PLAYER X — producción Node.js para servir la aplicación estática.",
  engines: {
    node: ">=20"
  },
  scripts: {
    start: "node server.js",
    "test:security": "node --test tests/ledger-security.test.mjs",
    "test:economy": "node --test tests/external-economy.test.mjs",
    test: "npm run test:security && npm run test:economy",
    "test:economic-sources": "node --test tests/economic-sources.test.mjs",
    "test:real-pipeline": "node --test tests/real-economy-pipeline.test.mjs",
    "test:autonomy": "node --test tests/autonomy-supervisor.test.mjs"
  },
  dependencies: {
    compression: "^1.8.1",
    express: "^5.1.0",
    helmet: "^8.1.0"
  }
};
