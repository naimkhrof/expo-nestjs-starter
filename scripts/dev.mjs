// `pnpm dev` (tout) et `pnpm dev:api` : Docker et Postgres démarrés, ports libres, puis le serveur.
// Metro (mobile) choisit son port et refait le build natif au besoin : apps/mobile/scripts/start.mjs.
import { spawn } from 'node:child_process';
import { checkNode, claimPort, ensurePostgres, readEnv, repoRoot, stopStale } from './dev-env.mjs';

const mode = process.argv[2] ?? 'all';
if (!['all', 'api'].includes(mode)) throw new Error(`Mode inconnu : ${mode} (all, api)`);

checkNode();
await (mode === 'all'
  ? stopStale('', /turbo run dev|nest\.js start|expo(\/bin\/cli)? start|scripts\/(dev|start)\.mjs/)
  : stopStale('apps/api', /nest\.js start|scripts\/dev\.mjs/));
const databasePort = await ensurePostgres();

const api = readEnv('apps/api/.env');
const env = { ...process.env, DATABASE_PORT: String(databasePort) };
const wantedApi = Number(process.env.APP_PORT ?? api.APP_PORT ?? 3001);
const apiPort = await claimPort('API', wantedApi);
env.APP_PORT = String(apiPort);
if (apiPort !== wantedApi) env.EXPO_PUBLIC_API_URL = `http://localhost:${apiPort}`;

if (mode === 'all') {
  const backofficePort = await claimPort('Éditeur', Number(process.env.BACKOFFICE_PORT ?? 8090));
  env.BACKOFFICE_PORT = String(backofficePort);
  const origins = (process.env.APP_CORS_ORIGINS ?? api.APP_CORS_ORIGINS ?? '').split(',').filter(Boolean);
  const origin = `http://localhost:${backofficePort}`;
  env.APP_CORS_ORIGINS = [...new Set([...origins, origin])].join(',');
}

const [command, args] =
  mode === 'all' ? ['pnpm', ['exec', 'turbo', 'run', 'dev', '--ui=tui']] : ['pnpm', ['--dir', 'apps/api', 'run', 'dev']];
const child = spawn(command, args, { cwd: repoRoot, env, stdio: 'inherit' });
// Ctrl+C va aussi à l'enfant : on attend qu'il s'arrête au lieu de le laisser orphelin.
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
