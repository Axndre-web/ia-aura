import fs from 'node:fs/promises';
export class Secrets{async get(name,{required=false}={}){const key='NEON_SECRET_'+name.toUpperCase().replace(/[^A-Z0-9]+/g,'_');const file=process.env[key+'_FILE'];const v=file?(await fs.readFile(file,'utf8')).trim():process.env[key];if(v)return v;if(required)throw Error('SECRET_REQUIRED:'+key);return null;}async has(n){return Boolean(await this.get(n));}}
