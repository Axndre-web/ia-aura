import crypto from 'node:crypto';

const allowedHosts = () => new Set(
  String(process.env.NEON_ALLOWED_PROVIDER_HOSTS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
);

function assertAllowedHttps(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error('REALITY_VERIFIER_HTTPS_REQUIRED');
  const hosts = allowedHosts();
  if (!hosts.size || !hosts.has(url.hostname.toLowerCase())) {
    throw new Error('REALITY_VERIFIER_HOST_NOT_ALLOWLISTED');
  }
  return url;
}

function stableDigest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Verifies that an external opportunity corresponds to an actual, currently
 * actionable piece of work. The verifier is intentionally attestation-based:
 * the external source must be allowlisted and return a machine-verifiable
 * statement with a work reference, deliverable reference and settlement path.
 */
export async function verifyRealWork(opportunity, { timeoutMs = 8000 } = {}) {
  if (!opportunity?.id) throw new Error('OPPORTUNITY_ID_REQUIRED');
  if (!opportunity.verificationUrl) {
    return { verified: false, code: 'REALITY_VERIFICATION_URL_REQUIRED' };
  }

  const url = assertAllowedHttps(opportunity.verificationUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        opportunityId: opportunity.id,
        digest: stableDigest({
          id: opportunity.id,
          title: opportunity.title,
          source: opportunity.source,
          revenueEUR: opportunity.revenueEUR,
          spendEUR: opportunity.spendEUR
        })
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return { verified: false, code: `REALITY_VERIFIER_HTTP_${response.status}` };
    }

    const attestation = await response.json();
    const verified =
      attestation?.verified === true &&
      String(attestation.opportunityId || '') === String(opportunity.id) &&
      Boolean(attestation.workRef) &&
      Boolean(attestation.deliverableRef) &&
      Boolean(attestation.settlementProvider);

    return {
      verified,
      code: verified ? 'REAL_WORK_VERIFIED' : 'REAL_WORK_ATTESTATION_INVALID',
      provider: attestation.provider || opportunity.authorizedProvider || null,
      workRef: attestation.workRef || null,
      deliverableRef: attestation.deliverableRef || null,
      settlementProvider: attestation.settlementProvider || null,
      attestedAt: attestation.attestedAt || null,
      attestation
    };
  } finally {
    clearTimeout(timer);
  }
}
