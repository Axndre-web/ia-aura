/** PayPal Checkout adapter.
 * The browser callback is not proof of settlement by itself. Production use must
 * validate orderID server-side through PayPal before calling recordApprovedOrder().
 */
import { unifiedLedger } from '../core/unified-ledger.js';

export function recordApprovedOrder({ orderID, amountEUR, metadata = {}, verified = false } = {}) {
  if (!orderID || !Number.isFinite(Number(amountEUR)) || Number(amountEUR) <= 0) {
    throw new Error('Valid orderID and positive amountEUR required');
  }
  if (!verified) {
    return unifiedLedger.registerTransaction({
      source: 'PAYPAL_CHECKOUT', amount: Number(amountEUR), currency: 'EUR',
      txHash: orderID, status: 'pending-verification', metadata
    });
  }
  return unifiedLedger.recordExternalSettlement({
    source: 'PAYPAL_CHECKOUT', amount: Number(amountEUR), currency: 'EUR',
    txHash: orderID, metadata
  });
}

export function createPayPalCallbacks({ onPending, onVerified } = {}) {
  return {
    onApprove: async (data, actions) => {
      const orderID = data?.orderID;
      let amountEUR = Number(data?.amountEUR);
      try {
        if (actions?.order?.get) {
          const details = await actions.order.get();
          const purchase = details?.purchase_units?.[0]?.amount;
          amountEUR = Number(purchase?.value ?? amountEUR);
        }
      } catch {}
      const entry = recordApprovedOrder({ orderID, amountEUR, verified: false });
      onPending?.(entry);
      return entry;
    },
    onError: error => console.warn('[PayPal] Checkout unavailable:', error)
  };
}
