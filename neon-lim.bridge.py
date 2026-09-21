"""
NEON PLAYER X — Neon Orb local activation bridge
REAL / COMPUTABLE / VIVA
- Health endpoint: GET /health
- Optional snapshot endpoint: POST /snapshot
- Private signing material is read ONLY from environment/keypair path.
- No private key is shipped in this source file.
- A snapshot is never reported as confirmed unless the Solana RPC confirms it.
"""
import os, json, time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

HOST=os.getenv("NEON_BRIDGE_HOST","127.0.0.1")
PORT=int(os.getenv("NEON_BRIDGE_PORT","8787"))
RPC=os.getenv("SOLANA_RPC_URL","").strip()
KEYPAIR_PATH=os.getenv("SOLANA_KEYPAIR_PATH","").strip()
PUBLIC=os.getenv("NEON_ORB_SOLANA_ADDRESS","AvcMD59dTTTnHKzfdQtF9AcSzgSNcqCWEkcUYx4BnUeh")
BTC_ADDRESS=os.getenv("NEON_ORB_BITCOIN_ADDRESS","bc1qs9dvc02xl8ury20xlsya8xda4cpygzhs0ll9ym").strip()
PAYPAL_CLIENT_ID=os.getenv("PAYPAL_CLIENT_ID","").strip()
PAYPAL_CLIENT_SECRET=os.getenv("PAYPAL_CLIENT_SECRET","").strip()
PAYPAL_BASE_URL=os.getenv("PAYPAL_BASE_URL","https://api-m.paypal.com").rstrip("/")

STARTED_AT=time.time()

def health():
    keypair_ready=bool(KEYPAIR_PATH and os.path.isfile(KEYPAIR_PATH))
    rpc_ready=bool(RPC)
    return {
        "ok": rpc_ready and keypair_ready,
        "status":"READY" if rpc_ready and keypair_ready else "NOT_CONFIGURED",
        "mode":"LOCAL_SIGNING" if rpc_ready and keypair_ready else "LOCAL_OBSERVABLE",
        "network":"configured" if rpc_ready else "RPC_MISSING",
        "signer":"configured" if keypair_ready else "KEYPAIR_MISSING",
        "publicAddress":PUBLIC,
        "revenueGateway":"PAYPAL_READY" if PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET else "PAYPAL_NOT_CONFIGURED",
        "checkedAt":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())
    }

def rpc_balance():
    if not RPC:
        return None, "RPC_MISSING"
    try:
        payload=json.dumps({"jsonrpc":"2.0","id":1,"method":"getBalance","params":[PUBLIC,{"commitment":"confirmed"}]}).encode()
        req=Request(RPC,data=payload,headers={"Content-Type":"application/json"},method="POST")
        with urlopen(req,timeout=4) as r:
            data=json.loads(r.read().decode())
        value=data.get("result",{}).get("value")
        if isinstance(value,(int,float)):
            return int(value), "VERIFIED"
    except Exception:
        pass
    return None, "UNAVAILABLE"

def bitcoin_balance():
    try:
        url=f"https://mempool.space/api/address/{PUBLIC}"
        # This address is Solana, so Bitcoin lookup is intentionally disabled here.
        # A dedicated BTC address is used below instead.
        btc=BTC_ADDRESS
        with urlopen(f"https://mempool.space/api/address/{btc}",timeout=4) as r:
            data=json.loads(r.read().decode())
        stats=data.get("chain_stats",{})
        funded=int(stats.get("funded_txo_sum",0)); spent=int(stats.get("spent_txo_sum",0))
        return funded-spent, "VERIFIED"
    except Exception:
        return None, "UNAVAILABLE"

def paypal_access_token():
    if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
        return None, "PAYPAL_NOT_CONFIGURED"
    import base64
    auth=base64.b64encode(f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}".encode()).decode()
    body=b"grant_type=client_credentials"
    req=Request(f"{PAYPAL_BASE_URL}/v1/oauth2/token",data=body,headers={"Authorization":f"Basic {auth}","Content-Type":"application/x-www-form-urlencoded","Accept":"application/json"},method="POST")
    try:
        with urlopen(req,timeout=8) as r:
            data=json.loads(r.read().decode())
        token=data.get("access_token")
        return (token,"OK") if token else (None,"PAYPAL_TOKEN_MISSING")
    except Exception:
        return None,"PAYPAL_AUTH_FAILED"

def verify_paypal_order(order_id, expected_amount=None):
    token,status=paypal_access_token()
    if not token: return {"ok":False,"status":status}
    req=Request(f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}",headers={"Authorization":f"Bearer {token}","Accept":"application/json"},method="GET")
    try:
        with urlopen(req,timeout=8) as r: data=json.loads(r.read().decode())
    except Exception:
        return {"ok":False,"status":"PAYPAL_ORDER_LOOKUP_FAILED"}
    if data.get("status")!="COMPLETED": return {"ok":False,"status":"PAYPAL_NOT_COMPLETED","paypalStatus":data.get("status")}
    pu=(data.get("purchase_units") or [{}])[0]
    captures=((pu.get("payments") or {}).get("captures") or [])
    cap=next((c for c in captures if c.get("status")=="COMPLETED"),None)
    if not cap: return {"ok":False,"status":"PAYPAL_CAPTURE_NOT_COMPLETED","paypalStatus":data.get("status")}
    amount=((cap.get("amount") or pu.get("amount") or {}))
    value=float(amount.get("value",0) or 0); currency=amount.get("currency_code","EUR")
    if expected_amount is not None and abs(value-float(expected_amount))>0.01: return {"ok":False,"status":"PAYPAL_AMOUNT_MISMATCH","amountEUR":value,"currency":currency}
    return {"ok":True,"status":"VERIFIED","orderID":order_id,"amountEUR":value,"currency":currency,"paypalStatus":data.get("status"),"captureID":cap.get("id")}

def telemetry():
    sol,sol_status=rpc_balance()
    btc,btc_status=bitcoin_balance()
    h=health()
    return {**h,"uptimeSeconds":int(max(0,time.time()-STARTED_AT)),"solanaBalanceLamports":sol,"solanaBalanceStatus":sol_status,"bitcoinAddress":BTC_ADDRESS,"bitcoinSatoshis":btc,"bitcoinBalanceStatus":btc_status}

class Handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        raw=json.dumps(obj).encode()
        self.send_response(code); self.send_header("Content-Type","application/json"); self.send_header("Access-Control-Allow-Origin","*"); self.send_header("Access-Control-Allow-Headers","Content-Type"); self.send_header("Access-Control-Allow-Methods","GET,POST,OPTIONS")
        self.send_header("Cache-Control","no-store"); self.send_header("Content-Length",str(len(raw)))
        self.end_headers(); self.wfile.write(raw)
    def do_OPTIONS(self):
        self._send(204,{"ok":True})
    def do_GET(self):
        path=self.path.split("?")[0]
        if path=="/health": self._send(200,health()); return
        if path=="/telemetry": self._send(200,telemetry()); return
        self._send(404,{"ok":False,"error":"NOT_FOUND"})
    def do_POST(self):
        path=self.path.split("?")[0]
        if path=="/paypal/verify":
            try:
                length=int(self.headers.get("Content-Length","0")); payload=json.loads(self.rfile.read(length) or b"{}")
                order_id=str(payload.get("orderID") or "").strip()
                if not order_id: self._send(400,{"ok":False,"status":"ORDER_ID_REQUIRED"}); return
                result=verify_paypal_order(order_id,payload.get("expectedAmountEUR"))
                self._send(200 if result.get("ok") else 502,result); return
            except Exception:
                self._send(400,{"ok":False,"status":"INVALID_JSON"}); return
        if path!="/snapshot": self._send(404,{"ok":False,"error":"NOT_FOUND"}); return
        h=health()
        if not h["ok"]:
            self._send(503,{"ok":False,"status":"NOT_CONFIGURED","health":h}); return
        # Deliberately refuse to invent a transaction. A production signer must
        # be connected here with the intended Solana program/data format.
        self._send(501,{"ok":False,"status":"SIGNING_NOT_IMPLEMENTED",
                         "reason":"No transaction is fabricated or reported as confirmed.",
                         "health":h})
    def log_message(self,*args): pass

if __name__=="__main__":
    print(f"Neon Orb bridge listening on http://{HOST}:{PORT}")
    HTTPServer((HOST,PORT),Handler).serve_forever()
