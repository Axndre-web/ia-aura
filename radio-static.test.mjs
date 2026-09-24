import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const script = fs.readFileSync(new URL('../public/script.js', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../server.js', import.meta.url), 'utf8');

test('radio has a same-origin proxy candidate for every station', () => {
  for (let i = 0; i < 12; i++) assert.match(script, new RegExp(`/api/radio/stream/${i}`));
  assert.match(server, /app\.get\("\/api\/radio\/stream\/:id"/);
});

test('radio startup has bounded timeout and avoids duplicate retry timers', () => {
  assert.match(script, /function waitForRadioStart\(timeout=10000\)/);
  assert.match(script, /clearTimeout\(radioRetryTimer\)/);
  assert.match(script, /radioRetryTimer=setTimeout\(\(\)=>playStation/);
});

test('radio equalizer never routes external radio audio through MediaElementAudioSource', () => {
  assert.match(script, /if\(type==='radio'\)return null/);
  assert.match(script, /const \[w,h\]=fit\(rCanvas,rCtx\)\|\|\[300,190\],an=null/);
});
