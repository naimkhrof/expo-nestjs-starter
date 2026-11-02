import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const source = fileURLToPath(new URL('../', import.meta.url));
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'starter-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const rel of ['starter.config.json', 'package.json', 'compose.yaml', 'AGENTS.md', 'scripts', '.agents', '.env.example', 'apps/mobile/package.json', 'apps/mobile/.env.example', 'apps/api/package.json', 'apps/api/.env.example']) {
    await mkdir(path.dirname(path.join(root, rel)), { recursive: true });
    await cp(path.join(source, rel), path.join(root, rel), { recursive: true });
  }
  return root;
}
const run = (root, script, args = []) => spawnSync(process.execPath, [path.join(root, 'scripts', script), ...args], { cwd: root, encoding: 'utf8' });
const options = ['--name', 'Example App', '--slug', 'example-app', '--scope', 'example', '--bundle-id', 'com.example.app'];
const json = async (root, rel) => JSON.parse(await readFile(path.join(root, rel), 'utf8'));

test('initialization renames package filters and native identity consistently, and can be repeated', async (t) => {
  const root = await fixture(t);
  const first = run(root, 'init.mjs', options);
  assert.equal(first.status, 0, first.stderr);
  assert.equal((await json(root, 'starter.config.json')).bundleId, 'com.example.app');
  assert.equal((await json(root, 'package.json')).scripts['dev:mobile'], 'pnpm --filter @example/mobile dev');
  assert.equal((await json(root, 'apps/mobile/package.json')).name, '@example/mobile');
  assert.equal((await json(root, 'apps/api/package.json')).name, '@example/api');
  assert.match(await readFile(path.join(root, 'compose.yaml'), 'utf8'), /^name: example-app/m);
  assert.equal(run(root, 'init.mjs', options).status, 0);
});

test('invalid identity and dry-run never change the project', async (t) => {
  const root = await fixture(t);
  const before = await readFile(path.join(root, 'starter.config.json'), 'utf8');
  assert.notEqual(run(root, 'init.mjs', [...options, '--bundle-id', '../unsafe']).status, 0);
  assert.equal(await readFile(path.join(root, 'starter.config.json'), 'utf8'), before);
  assert.equal(run(root, 'init.mjs', [...options, '--dry-run']).status, 0);
  assert.equal(await readFile(path.join(root, 'starter.config.json'), 'utf8'), before);
});

test('reinitialization protects existing local environments', async (t) => {
  const root = await fixture(t);
  const before = await readFile(path.join(root, 'package.json'), 'utf8');
  await writeFile(path.join(root, '.env'), 'DATABASE_NAME=existing\n');
  assert.notEqual(run(root, 'init.mjs', options).status, 0);
  assert.equal(await readFile(path.join(root, 'package.json'), 'utf8'), before);
  assert.equal(await readFile(path.join(root, '.env'), 'utf8'), 'DATABASE_NAME=existing\n');
});

test('setup generates matching database credentials, distinct JWT secrets and preserves subsequent edits', async (t) => {
  const root = await fixture(t);
  const result = run(root, 'setup.mjs');
  assert.equal(result.status, 0, result.stderr);
  const rootEnv = await readFile(path.join(root, '.env'), 'utf8');
  const api = await readFile(path.join(root, 'apps/api/.env'), 'utf8');
  const password = rootEnv.match(/^DATABASE_PASSWORD=(.+)$/m)[1];
  assert.match(password, /^[a-f0-9]{64}$/);
  assert.ok(api.includes(`DATABASE_PASSWORD=${password}`));
  assert.ok(!api.includes('__GENERATE_SECRET__'));
  const secrets = [...api.matchAll(/^AUTH_\w*SECRET=([a-f0-9]+)$/gm)].map((match) => match[1]);
  assert.equal(secrets.length, 4);
  assert.equal(new Set([...secrets, password]).size, 5);
  assert.equal((await stat(path.join(root, 'apps/api/.env'))).mode & 0o777, 0o600);
  await writeFile(path.join(root, 'apps/mobile/.env'), 'EXPO_PUBLIC_API_URL=http://custom.example\n');
  assert.equal(run(root, 'setup.mjs').status, 0);
  assert.equal(await readFile(path.join(root, 'apps/api/.env'), 'utf8'), api);
  assert.equal(await readFile(path.join(root, 'apps/mobile/.env'), 'utf8'), 'EXPO_PUBLIC_API_URL=http://custom.example\n');
});
