import fs from 'node:fs/promises';
import path from 'node:path';

export class JsonStore {
  constructor(file) {
    this.file = file;
    this.queue = Promise.resolve();
  }

  async init(defaultValue) {
    try {
      const raw = await fs.readFile(this.file, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      await this.write(defaultValue);
      return structuredClone(defaultValue);
    }
  }

  async write(value) {
    const snapshot = JSON.stringify(value, null, 2);
    this.queue = this.queue.then(async () => {
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      await fs.writeFile(tmp, snapshot, { mode: 0o600 });
      await fs.rename(tmp, this.file);
    });
    return this.queue;
  }
}
