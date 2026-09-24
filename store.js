import fs from 'node:fs/promises';
import path from 'node:path';
export class JsonStore {
  constructor(file){ this.file=file; this.queue=Promise.resolve(); }
  async init(def){ try{return JSON.parse(await fs.readFile(this.file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e; await this.write(def); return structuredClone(def);} }
  async write(value){ const data=JSON.stringify(value,null,2); this.queue=this.queue.then(async()=>{await fs.mkdir(path.dirname(this.file),{recursive:true}); const tmp=this.file+'.tmp'; await fs.writeFile(tmp,data,{mode:0o600}); await fs.rename(tmp,this.file);}); return this.queue; }
}
