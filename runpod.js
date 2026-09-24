/** RunPod Serverless API adapter. Submission is hard-gated by the governor. */
export class RunPodProvider {
  constructor(secrets) { this.secrets = secrets; }
  async submit({ endpointId, input = {} } = {}, signal) {
    const token = await this.secrets.get('RUNPOD_API_KEY', { required: true });
    if (!endpointId) throw new Error('RUNPOD_ENDPOINT_ID_REQUIRED');
    const r = await fetch(`https://api.runpod.ai/v2/${encodeURIComponent(endpointId)}/run`, {
      method: 'POST', signal,
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ input })
    });
    if (!r.ok) throw new Error(`RUNPOD_HTTP_${r.status}`);
    const data = await r.json();
    return { provider: 'RUNPOD', jobId: data.id ?? null, status: data.status ?? 'IN_QUEUE' };
  }
}
