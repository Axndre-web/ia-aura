/**
 * Asset valuation/conversion layer.
 * It converts externally observed asset quantities into reference values only.
 * It never mints funds, fabricates balances, signs transactions or changes a wallet.
 */
const n = v => Number.isFinite(Number(v)) ? Number(v) : 0;

export function convertObservedAsset({ asset, amount, eurRate, feeEUR = 0 } = {}) {
  const quantity = n(amount);
  const rate = n(eurRate);
  const fee = Math.max(0, n(feeEUR));
  if (!asset) throw new Error('Asset required');
  if (quantity < 0 || rate < 0 || fee < 0) throw new Error('Invalid conversion values');
  const grossEUR = quantity * rate;
  return {
    asset: String(asset).toUpperCase(),
    amount: quantity,
    eurRate: rate,
    grossEUR,
    feeEUR: fee,
    netReferenceEUR: Math.max(0, grossEUR - fee),
    status: 'VALUATION_ONLY',
    note: 'Reference valuation only; no funds are created or transferred.'
  };
}
