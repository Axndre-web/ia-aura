import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
for (const id of ['radio', 'player', 'tienda', 'wallet', 'control', 'temas', 'slot-zone']) assert.ok(html.includes(`id="${id}"`), `Missing section #${id}`);
assert.match(html, /NEON_STATIC_MODE = true/);
assert.match(read('UI/arcade-slot-machine.js'), /INITIAL_BALANCE = 100/);
assert.match(read('UI/arcade-slot-machine.js'), /localStorage\.setItem\(LEDGER_KEY/);
assert.doesNotMatch(read('UI/arcade-slot-machine.js'), /fetch\s*\(/);
assert.match(read('UI/arcade-slot-machine.js'), /MODO ESTÁTICO · LOCAL/);
assert.match(read('UI/neon-orb-command-deck.js'), /if \(globalThis\.NEON_STATIC_MODE\)/);
assert.match(read('UI/wallet-dashboard.js'), /GitHub Pages: no localhost bridge/);
assert.match(read('UI/account-readiness.js'), /Modo GitHub Pages/);
for (const forbidden of ['.env', 'server.js', 'neon-lim.bridge.py', 'keypair.json', 'keypair.js']) assert.equal(fs.existsSync(path.join(root, forbidden)), false, `Forbidden file ${forbidden}`);
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const ref = match[1];
  if (/^https?:\/\//i.test(ref) || ref.startsWith('data:')) continue;
  assert.ok(fs.existsSync(path.join(root, ref.split('?')[0])), `Missing local asset ${ref}`);
}
console.log('GitHub Pages static smoke test passed.');
