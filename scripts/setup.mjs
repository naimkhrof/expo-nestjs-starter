import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const root = new URL('../', import.meta.url);
const identity = JSON.parse(await readFile(new URL('starter.config.json', root), 'utf8'));
const renderSecrets = (text) => text.replace(/__GENERATE_SECRET__/g, () => randomBytes(32).toString('hex'));

async function keepOrCreate(relative, content) {
  const destination = new URL(relative, root);
  try {
    await writeFile(destination, content, { flag: 'wx', mode: 0o600 });
    console.log(`Created ${relative}`);
    return content;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    console.log(`Kept existing ${relative}`);
    return readFile(destination, 'utf8');
  }
}

const rootEnv = await keepOrCreate('.env', renderSecrets(await readFile(new URL('.env.example', root), 'utf8')));
let apiEnv = await readFile(new URL('apps/api/.env.example', root), 'utf8');
for (const key of ['DATABASE_PORT', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'DATABASE_NAME']) {
  const value = rootEnv.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1];
  if (!value || value.includes('__GENERATE_SECRET__')) throw new Error(`Set ${key} in root .env before setup:env.`);
  apiEnv = apiEnv.replace(new RegExp(`^${key}=.*$`, 'm'), () => `${key}=${value}`);
}
apiEnv = apiEnv.replace(/^APP_NAME=.*$/m, () => `APP_NAME=${JSON.stringify(identity.name + ' API')}`);
await keepOrCreate('apps/api/.env', renderSecrets(apiEnv));
await keepOrCreate('apps/mobile/.env', await readFile(new URL('apps/mobile/.env.example', root), 'utf8'));
