/*
  CREATOR GIFT BRIDGE — PRIVATE LOCAL VERIFICATION
  -------------------------------------------------
  The bridge is intentionally isolated from Neon Orb's autonomous state.
  It contains NO seed phrase, private key, signing key, API credential or
  payment credential. It only verifies an incoming transaction for the
  project's dedicated receiving address.

  Neon Orb receives only the verification result; the address itself is not
  exposed through the public bridge API.
*/
(()=>{
  const RECEIVING_ADDRESS='bc1qg8ykmeh2dmgq2l6d37zu702vlh6mn72k556ty5';
  const API='https://mempool.space/api';
  const PRICE='https://mempool.space/api/v1/prices';
  const satToBtc=s=>Number(s||0)/100000000;

  async function json(url){
    const r=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    return r.json();
  }

  function incomingValue(tx){
    return (tx?.vout||[])
      .filter(v=>v?.scriptpubkey_address===RECEIVING_ADDRESS)
      .reduce((n,v)=>n+Number(v.value||0),0);
  }

  async function check(previousTxid=null){
    const txs=await json(`${API}/address/${encodeURIComponent(RECEIVING_ADDRESS)}/txs`);
    let tip=null;
    try{tip=(await json(`${API}/blocks/tip/height`));}catch{}
    const armedAt=Number(localStorage.getItem('neonOrbCreatorGiftArmedAt')||Date.now());

    for(const tx of txs){
      if(!tx?.status?.confirmed || !tx.txid)continue;
      const value=incomingValue(tx);
      if(value<=0)continue;
      const blockTime=Number(tx.status.block_time||0)*1000;
      const isPrevious=previousTxid && tx.txid===previousTxid;
      if(!isPrevious && (!blockTime || blockTime<armedAt))continue;

      const prices=await json(PRICE).catch(()=>({EUR:0}));
      const height=Number(tx.status.block_height||0)||null;
      const confirmations=height&&Number.isFinite(Number(tip))
        ?Math.max(1,Number(tip)-height+1)
        :1;
      return {
        found:true,
        txid:tx.txid,
        btc:satToBtc(value),
        eur:satToBtc(value)*Number(prices.EUR||0),
        blockHeight:height,
        confirmations
      };
    }
    return {found:false};
  }

  // Deliberately expose only verification; never the receiving address.
  window.__neonOrbCreatorGiftBridge={check};
})();
