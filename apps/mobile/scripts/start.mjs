// Lance Metro pour le dev build, après un build natif iOS si besoin.
// Le build est refait quand l'empreinte native (@expo/fingerprint : app.config, plugins, modules natifs,
// dépendances) diffère de celle du dernier build, quand ios/ manque ou quand l'app n'est pas installée
// sur le simulateur démarré. `--build` force le build (pnpm ios).
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkNode, claimPort, log, repoRoot, stopStale } from '../../../scripts/dev-env.mjs';

const mobileRoot = fileURLToPath(new URL('../', import.meta.url));
const stampFile = path.join(mobileRoot, 'ios', '.dev-build-fingerprint');
const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
const forceBuild = process.argv.includes('--build');

const run = (args, options = {}) => {
  const result = spawnSync('pnpm', ['exec', 'expo', ...args], { cwd: mobileRoot, stdio: 'inherit', ...options });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

async function nativeFingerprint() {
  const require = createRequire(createRequire(import.meta.url).resolve('expo/package.json'));
  const { createFingerprintAsync } = require('@expo/fingerprint');
  // ios/ et android/ sont générés par prebuild : seules leurs sources comptent.
  const { hash } = await createFingerprintAsync(mobileRoot, {
    platforms: ['ios'],
    ignorePaths: ['ios/**', 'android/**'],
  });
  return `${appEnv}:${hash}`;
}

function bootedSimulator() {
  const out = spawnSync('xcrun', ['simctl', 'list', 'devices', 'booted', '-j'], { encoding: 'utf8' });
  if (out.status !== 0) return undefined;
  const devices = Object.values(JSON.parse(out.stdout).devices).flat();
  return devices.find((device) => device.state === 'Booted')?.udid;
}

function isInstalled(udid) {
  const { bundleId } = JSON.parse(readFileSync(path.join(repoRoot, 'starter.config.json'), 'utf8'));
  const id = appEnv === 'production' ? bundleId : `${bundleId}.${appEnv}`;
  return spawnSync('xcrun', ['simctl', 'get_app_container', udid, id], { stdio: 'ignore' }).status === 0;
}

checkNode();
await stopStale('apps/mobile', /expo(\/bin\/cli)? start|scripts\/start\.mjs/);
const port = await claimPort('Metro', Number(process.env.METRO_PORT ?? 8081));

let built = false;
if (process.platform === 'darwin') {
  let fingerprint;
  try {
    fingerprint = await nativeFingerprint();
  } catch (error) {
    log(`Empreinte native illisible (${error.message}) : pas de build automatique.`);
  }
  const udid = bootedSimulator();
  const stamp = existsSync(stampFile) ? readFileSync(stampFile, 'utf8').trim() : '';
  const reason = forceBuild
    ? 'demandé'
    : !existsSync(path.join(mobileRoot, 'ios'))
      ? 'ios/ absent'
      : fingerprint && stamp !== fingerprint
        ? 'le natif a changé depuis le dernier build'
        : udid && !isInstalled(udid)
          ? "l'app n'est pas installée sur le simulateur"
          : '';
  if (reason) {
    log(`Build iOS (${reason}) : prebuild puis expo run:ios…`);
    // CI=1 : une question (équipe de signature, simulateur…) échoue en clair au lieu de bloquer,
    // invisible, dans l'interface de turbo.
    const ci = { env: { ...process.env, CI: '1' } };
    run(['prebuild', '--platform', 'ios', '--no-install'], ci);
    run(['run:ios', '--no-bundler', ...(udid ? ['--device', udid] : [])], ci);
    if (fingerprint) writeFileSync(stampFile, `${fingerprint}\n`);
    built = true;
  }
}

const child = spawn('pnpm', ['exec', 'expo', 'start', '--dev-client', '--port', String(port), ...(built ? ['--ios'] : [])], {
  cwd: mobileRoot,
  stdio: 'inherit',
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
