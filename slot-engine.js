/** Virtual-credit slot engine. No fiat, wallet or external ledger is debited. */
export class SlotEngine {
  constructor(random = Math.random) { this.random = random; this.symbols = ['🍒','🍊','🍋','🍇','🍉','7️⃣','⭐']; }
  async processSpin(betAmount, balance) {
    const bet = Number(betAmount), funds = Number(balance);
    if (!Number.isFinite(bet) || bet <= 0 || !Number.isFinite(funds) || funds < bet) throw new Error('Saldo de créditos insuficiente');
    const reels = Array.from({length:5}, () => this.symbols[Math.floor(this.random()*this.symbols.length)]);
    const counts = reels.reduce((m,s)=>(m[s]=(m[s]||0)+1,m),{});
    const best = Math.max(...Object.values(counts));
    const multiplier = best >= 5 ? 12 : best === 4 ? 3 : best === 3 ? 1.2 : 0;
    const winAmount = Number((bet * multiplier).toFixed(2));
    return { success:true, reels, betAmount:bet, winAmount, newBalance:Number((funds-bet+winAmount).toFixed(2)), currency:'DEMO_CREDITS' };
  }
}
