import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const excluded = new Set(['node_modules', '.git', 'data']);
const binary = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.zip']);

function files(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(full));
    else if (!binary.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

test('deployment package contains no embedded mnemonic/private-key material', () => {
  const forbidden = [
    /mnemonic\s*=\s*['"]/i,
    /private.?key\s*=\s*['"]/i,
    /const\s+secretKey\s*=\s*\[/i,
    /BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY/,
  ];
  const hits = [];
  for (const file of files(root)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of forbidden) if (pattern.test(text)) hits.push(`${path.relative(root, file)}: ${pattern}`);
  }
  assert.deepEqual(hits, [], `embedded secret material detected: ${hits.join('; ')}`);
});
