#!/usr/bin/env python3
"""NEON LIM Bridge — V11.7 Unified
Local-only control/observation bridge for the public NEON PLAYER X frontend.

Design goals:
- /health and /telemetry are safe read-only endpoints.
- /wallet exposes only public identity and network-observed balances.
- No private keys or secrets are returned to the browser.
- Network values are marked observed/verified only when fetched successfully.
- Autonomous telemetry loop runs in the background and persists local state.
"""
from __future__ import annotations
import json, os, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

HOST = os.getenv('NEON_BRIDGE_HOST', '127.0.0.1')
PORT = int(os.getenv('NEON_BRIDGE_PORT', '8765'))
TOKEN = os.getenv('NEON_BRIDGE_TOKEN', '')
STATE_FILE = os.getenv('NEON_BRIDGE_STATE', os.path.join(os.path.dirname(__file__), 'neon-lim.state.json'))
SOLANA_ADDRESS = os.getenv('NEON_SOLANA_ADDRESS', 'AvcMD59dTTTnHKzfdQtF9AcSzgSNcqCWEkcUYx4BnUeh')
BITCOIN_ADDRESS = os.getenv('NEON_BITCOIN_ADDRESS', 'bc1qs9dvc02xl8ury20xlsya8xda4cpygzhs0ll9ym')
SOLANA_RPC_URL = os.getenv('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com')
MEMPOOL_API = os.getenv('BITCOIN_API_BASE', 'https://mempool.space/api')
NETWORK_TIMEOUT = float(os.getenv('NEON_NETWORK_TIMEOUT', '8'))

lock = threading.RLock()
state = {
    'version': '11.7.0',
    'startedAt': time.time(),
    'cycles': 0,
    'decision': 'OBSERVE',
    'zone': 'LOCAL-BRIDGE',
    'energy': 100,
    'curiosity': 72,
    'attachment': 100,
    'journeys': 0,
    'resources': {'NXC': 0, 'CREDITS': 0, 'BITS': 0},
    'lastTick': None,
    'network': {'solana': {'status': 'unknown'}, 'bitcoin': {'status': 'unknown'}},
}


def load_state():
    global state
    try:
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            saved = json.load(f)
        with lock:
            state.update(saved)
    except (OSError, ValueError, TypeError):
        pass


def save_state():
    tmp = STATE_FILE + '.tmp'
    try:
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        os.replace(tmp, STATE_FILE)
    except OSError:
        pass


def http_json(url, payload=None):
    data = None if payload is None else json.dumps(payload).encode('utf-8')
    req = Request(url, data=data, headers={'Content-Type': 'application/json', 'User-Agent': 'NEON-LIM/11.7'})
    with urlopen(req, timeout=NETWORK_TIMEOUT) as response:
        return json.loads(response.read().decode('utf-8'))


def refresh_network():
    sol = {'address': SOLANA_ADDRESS, 'network': 'mainnet-beta', 'status': 'unavailable'}
    btc = {'address': BITCOIN_ADDRESS, 'network': 'bitcoin-mainnet', 'status': 'unavailable'}
    try:
        result = http_json(SOLANA_RPC_URL, {'jsonrpc': '2.0', 'id': 1, 'method': 'getBalance', 'params': [SOLANA_ADDRESS]})
        lamports = int(result.get('result', {}).get('value', 0))
        sol.update({'status': 'observed', 'lamports': lamports, 'sol': lamports / 1_000_000_000, 'observedAt': time.time()})
    except Exception as exc:
        sol['error'] = type(exc).__name__
    try:
        result = http_json(f'{MEMPOOL_API.rstrip("/")}/address/{BITCOIN_ADDRESS}')
        chain = result.get('chain_stats', {})
        funded = int(chain.get('funded_txo_sum', 0))
        spent = int(chain.get('spent_txo_sum', 0))
        btc.update({'status': 'observed', 'satoshis': max(0, funded - spent), 'btc': max(0, funded - spent) / 100_000_000, 'observedAt': time.time()})
    except Exception as exc:
        btc['error'] = type(exc).__name__
    with lock:
        state['network'] = {'solana': sol, 'bitcoin': btc}
        state['lastNetworkRefresh'] = time.time()
    save_state()


def autonomous_loop():
    while True:
        now = time.time()
        with lock:
            state['cycles'] = int(state.get('cycles', 0)) + 1
            state['lastTick'] = now
            state['energy'] = max(0, min(100, 82 + int(18 * ((now // 5) % 2))))
            state['decision'] = 'OBSERVE_NETWORK' if state['cycles'] % 6 else 'REFRESH_STATE'
        save_state()
        if state['cycles'] % 6 == 0:
            refresh_network()
        time.sleep(5)


class Handler(BaseHTTPRequestHandler):
    server_version = 'NEON-LIM/11.7'

    def log_message(self, fmt, *args):
        print('[NEON-LIM]', fmt % args)

    def send_json(self, code, payload):
        raw = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Neon-Bridge-Token')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Content-Length', str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.send_json(204, {})

    def authorized(self):
        if not TOKEN:
            return True
        return self.headers.get('X-Neon-Bridge-Token', '') == TOKEN

    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path in ('/health', '/telemetry', '/wallet', '/api/health', '/api/telemetry', '/api/wallet'):
            if not self.authorized():
                self.send_json(401, {'ok': False, 'error': 'UNAUTHORIZED'})
                return
            with lock:
                snapshot = json.loads(json.dumps(state))
            if path.endswith('/health') or path == '/health':
                self.send_json(200, {
                    'ok': True, 'service': 'NEON-LIM', 'version': state['version'],
                    'bridge': 'CONNECTED', 'mode': 'READ_ONLY_OBSERVABLE',
                    'uptimeSeconds': max(0, time.time() - state['startedAt']),
                    'lastTick': snapshot.get('lastTick'),
                    'lastNetworkRefresh': snapshot.get('lastNetworkRefresh'),
                })
            elif path.endswith('/telemetry') or path == '/telemetry':
                self.send_json(200, {'ok': True, 'source': 'local-autonomous-loop', 'telemetry': snapshot})
            else:
                self.send_json(200, {
                    'ok': True, 'identity': {'username': '@neonorb'},
                    'addresses': {'solana': SOLANA_ADDRESS, 'bitcoin': BITCOIN_ADDRESS},
                    'network': snapshot.get('network', {}),
                    'mode': 'OBSERVED_PUBLIC_STATE',
                })
            return
        self.send_json(404, {'ok': False, 'error': 'NOT_FOUND'})


def main():
    load_state()
    # Start HTTP immediately; network observation runs asynchronously so /health never waits on RPC/API.
    thread = threading.Thread(target=autonomous_loop, daemon=True)
    thread.start()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f'NEON LIM bridge: http://{HOST}:{PORT}', flush=True)
    print('Endpoints: /health /telemetry /wallet', flush=True)
    server.serve_forever()

if __name__ == '__main__':
    main()
