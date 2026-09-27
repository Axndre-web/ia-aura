import crypto from 'node:crypto';
import { assertAllowedForExecution } from './provider-security.js';

const sha256 = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const text = value => String(value ?? '').trim();

export function buildVerificationRequest(opportunity = {}) {
  const workRef = text(opportunity.workRef || opportunity.metadata?.workRef);
  const deliverableRef = text(opportunity.deliverableRef || opportunity.metadata?.deliverableRef);
  const settlementProvider = text(opportunity.settlementProvider || opportunity.authorizedProvider);
  const digest = sha256({
    opportunityId: text(opportunity.id),
    workRef,
    deliverableRef,
    settlementProvider,
    revenueEUR: Number(opportunity.revenueEUR || 0)
  });
  return { opportunityId: text(opportunity.id), workRef, deliverableRef, settlementProvider, digest };
}

export async function verifyRealWork(opportunity = {}, { timeoutMs = 8000 } = {}) {
  const verificationUrl = text(opportunity.verificationUrl);
  if (!verificationUrl) return { verified: false, code: 'REAL_WORK_VERIFICATION_URL_REQUIRED' };
  const request = buildVerificationRequest(opportunity);
  if (!request.workRef || !request.deliverableRef || !request.settlementProvider) {
    return { verified: false, code: 'REAL_WORK_REFERENCES_REQUIRED' };
  }

  const url = assertAllowedForExecution(verificationUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal
    });
    const attestation = await response.json().catch(() => ({}));
    const verified = response.ok && attestation.verified === true &&
      text(attestation.opportunityId) === request.opportunityId &&
      text(attestation.workRef) === request.workRef &&
      text(attestation.deliverableRef) === request.deliverableRef &&
      text(attestation.settlementProvider) === request.settlementProvider;
    return {
      verified,
      code: verified ? 'REAL_WORK_VERIFIED' : 'REAL_WORK_ATTESTATION_REJECTED',
      verificationUrl,
      requestDigest: request.digest,
      attestation
    };
  } finally { clearTimeout(timer); }
}
