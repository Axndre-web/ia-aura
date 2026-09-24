import crypto from 'node:crypto';

/**
 * Generic authenticated compute-node adapter. It executes only a pre-approved
 * job envelope; it has no payment, wallet or withdrawal capability.
 */
export class ComputeNodeProvider {
  constructor(secrets) { this.secrets = secrets; }
  async submit(job, signal) {
    const base = process.env.NEON_COMPUTE_NODE_URL;
    const secret = await this.secrets.get('COMPUTE_NODE_SHARED_SECRET', { required: true });
    if (!base) throw new Error('COMPUTE_NODE_URL_NOT_CONFIGURED');
    if (!job?.id || !job?.command) throw new Error('COMPUTE_JOB_INVALID');
    const body = JSON.stringify({ id: job.id, command: job.command, input: job.input ?? null, maxRuntimeSec: Math.min(Number(job.maxRuntimeSec ?? 300), 3600) });
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const r = await fetch(new URL('/v1/jobs', base), { method: 'POST', signal, headers: { 'content-type': 'application/json', 'x-neon-signature': signature }, body });
    if (!r.ok) throw new Error(`COMPUTE_NODE_HTTP_${r.status}`);
    return r.json();
  }
}
