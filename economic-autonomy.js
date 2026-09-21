/** Autonomous economic scheduler. It only plans registered opportunities.
 * It never fabricates clients, jobs, payments or network confirmations.
 */
import { neonEconomicEngine } from './economic-engine.js';

let timer=null;
export function startEconomicAutonomy({intervalMs=60000,context=()=>({})}={}){
  if(timer) return stopEconomicAutonomy;
  const tick=()=>{try{neonEconomicEngine.tick(typeof context==='function'?context():{})}catch(error){console.warn('[Neon Economic Engine] tick:',error)}};
  tick(); timer=setInterval(tick,Math.max(15000,Number(intervalMs)||60000));
  return stopEconomicAutonomy;
}
export function stopEconomicAutonomy(){if(timer){clearInterval(timer);timer=null}}
