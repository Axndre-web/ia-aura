import { assertAllowedForExecution } from './provider-security.js';

const timeout = ms => Math.max(1000, Number(ms) || 8000);

export async function verifyRealWork(opportunity, { timeoutMs = 8000 } = {}) {
  if (!opportunity?.id) return { verified: false, code: 'OPPORTUNITY_ID_REQUIRED' };
  const url = opportunity.verificationUrl;
  if (!url) return { verified: false, code: 'REAL_WORK_VERIFICATION_ENDPOINT_REQUIRED' };

  const target = assertAllowedForExecution(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout(timeoutMs));
  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        opportunityId: opportunity.id,
        workRef: opportunity.workRef ?? null,
        deliverableRef: opportunity.deliverableRef ?? null,
        source: opportunity.source ?? null
      }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { verified: false, code: `VERIFIER_HTTP_${response.status}`, data };
    const verified = data.verified === true
      && String(data.opportunityId ?? opportunity.id) === String(opportunity.id)
      && Boolean(data.workRef)
      && Boolean(data.deliverableRef)
      && Boolean(data.provider);
    return {
      verified,
      code: verified ? 'REAL_WORK_VERIFIED' : 'REAL_WORK_ATTESTATION_INCOMPLETE',
      workRef: data.workRef ?? null,
      deliverableRef: data.deliverableRef ?? null,
      provider: data.provider ?? null,
      providerRef: data.providerRef ?? null,
      verifiedAt: data.verifiedAt ?? new Date().toISOString(),
      data
    };
  } finally {
    clearTimeout(timer);
  }
}
