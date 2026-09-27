import { verifySourceEvidence } from './economic-source-registry.js';
import { assertAllowedForExecution } from './provider-security.js';

/**
 * Read/verify adapter for an external source. It never converts a data feed
 * into revenue by itself: the returned evidence must still pass the governor
 * and settlement/asset verification pipeline.
 */
export async function fetchSourceEvidence({ sourceId, url, payload = {}, timeoutMs = 8000 } = {}) {
  if (!sourceId) throw new Error('ECONOMIC_SOURCE_ID_REQUIRED');
  if (!url) throw new Error('SOURCE_EVIDENCE_URL_REQUIRED');
  const target = assertAllowedForExecution(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sourceId, ...payload }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`SOURCE_EVIDENCE_HTTP_${response.status}`);

    const verification = verifySourceEvidence({ sourceId, evidence: data });
    return { sourceId, providerUrl: target.origin, response: data, verification };
  } finally {
    clearTimeout(timer);
  }
}
