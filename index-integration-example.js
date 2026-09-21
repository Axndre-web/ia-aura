/** Browser demo / integration smoke test. Serve this directory over HTTP. */
import { unifiedLedger } from './core/unified-ledger.js';
import { attachOrbWorkBridge, emitOrbWorkCompleted } from './core/orb-work-bridge.js';
import { mountWalletDashboard } from './UI/wallet-dashboard.js';
import { auditIncoming } from './integrations/btc-mempool.js';
import { recordApprovedOrder } from './integrations/paypal-checkout.js';

attachOrbWorkBridge();

const root = document.querySelector('#wallet-dashboard');
if (root) mountWalletDashboard(root);

// Demo only: emits one internal job. Remove this line for production integration.
// emitOrbWorkCompleted({ workId: 'demo-001', currency: 'CREDITS', amount: 75 });

window.NeonUnifiedEconomy = {
  ledger: unifiedLedger,
  emitOrbWorkCompleted,
  auditBitcoin: auditIncoming,
  recordPayPalOrder: recordApprovedOrder
};
