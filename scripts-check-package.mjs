import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'package.json', 'server.js', 'index.html', 'script.js', 'style.css',
  'public/index.html', 'public/script.js', 'public/style.css',
  'public/sw.js', 'public/manifest.webmanifest',
  'core/economic-engine.js', 'core/unified-ledger.js',
  'server/asset-converter.js', 'server/economy-profile.js',
  'server/real-work-sources.js', 'tests/economy-integrations.test.mjs'
];
const missing = required.filter(p => !fs.existsSync(path.join(root, p)));
if (missing.length) {
  console.error('Missing files:', missing.join(', '));
  process.exit(1);
}
const forbiddenPaths = ['.env', 'keypair.json', 'secrets'];
for (const item of forbiddenPaths) {
  if (fs.existsSync(path.join(root, item))) {
    console.error(`Forbidden deployment secret path exists: ${item}`);
    process.exit(1);
  }
}
const secretPatterns = [
  /mnemonic\s*=\s*['"]/i,
  /private.?key\s*=\s*['"]/i,
  /const\s+secretKey\s*=\s*\[/i,
  /BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY/
];
const skipDirs = new Set(['node_modules', '.git', 'data']);
const binaryExt = new Set(['.png','.jpg','.jpeg','.gif','.webp','.ico','.woff','.woff2','.zip']);
function walk(dir) {
  const result=[];
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (skipDirs.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else if (!binaryExt.has(path.extname(entry.name).toLowerCase())) result.push(full);
  }
  return result;
}
const hits=[];
for (const file of walk(root)) {
  const text=fs.readFileSync(file,'utf8');
  for (const pattern of secretPatterns) if (pattern.test(text)) hits.push(`${path.relative(root,file)}: ${pattern}`);
}
if (hits.length) {
  console.error('Embedded secret material detected:', hits.join('; '));
  process.exit(1);
}
console.log(`Package integrity OK: ${required.length} required paths present; deployment secret files and embedded key material excluded.`);
