const hosts=()=>new Set(String(process.env.NEON_ALLOWED_PROVIDER_HOSTS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean));
export function assertAllowedForExecution(raw){
  const u=new URL(raw); const set=hosts();
  if(!set.size || !set.has(u.hostname.toLowerCase())) throw new Error('PROVIDER_HOST_NOT_ALLOWLISTED');
  if(u.protocol!=='https:') throw new Error('PROVIDER_HTTPS_REQUIRED');
  return u;
}
