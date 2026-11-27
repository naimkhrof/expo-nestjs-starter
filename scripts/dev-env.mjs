// Outils du lancement local (`pnpm dev`, `pnpm dev:api`, Metro) : ports libres, Docker, Postgres.
// Un port tenu par un reste de ce dépôt est libéré ; tenu par un autre projet, on prend le suivant.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

export const repoRoot = fileURLToPath(new URL('../', import.meta.url));

export const log = (message) => console.log(`\x1b[36m[dev]\x1b[0m ${message}`);
export const fail = (message) => {
  console.error(`\x1b[31m[dev]\x1b[0m ${message}`);
  process.exit(1);
};

/** Lit un fichier .env simple (CLÉ=valeur), sans l'exiger. */
export function readEnv(relative) {
  try {
    const text = readFileSync(new URL(relative, `file://${repoRoot}`), 'utf8');
    return Object.fromEntries(
      text
        .split('\n')
        .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/))
        .filter(Boolean)
        .map(([, key, value]) => [key, value.replace(/^(['"])(.*)\1$/, '$2')]),
    );
  } catch {
    return {};
  }
}

const quiet = (command, args) => {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

function listeners(port) {
  return quiet('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'])
    .split('\n')
    .filter(Boolean)
    .map(Number);
}

function describe(pid) {
  const cwd = quiet('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn']).match(/^n(.+)$/m)?.[1] ?? '';
  const command = quiet('ps', ['-o', 'command=', '-p', String(pid)]);
  return { cwd, command };
}

const canListen = (port) =>
  new Promise((resolve) => {
    const server = createServer()
      .once('error', () => resolve(false))
      .once('listening', () => server.close(() => resolve(true)))
      .listen(port);
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const inRepo = (cwd) => cwd === repoRoot.replace(/\/$/, '') || cwd.startsWith(repoRoot);
const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const parentOf = (pid) => Number(quiet('ps', ['-o', 'ppid=', '-p', String(pid)]));

function ownAncestry() {
  const mine = new Set();
  for (let pid = process.pid; pid > 1 && !mine.has(pid); pid = parentOf(pid)) mine.add(pid);
  return mine;
}

/** Le plus haut ancêtre lancé dans ce dépôt (pnpm dev, turbo, nest --watch…), sans remonter au shell. */
function topOfRepoTree(pid, self = ownAncestry()) {
  let top = pid;
  for (;;) {
    const parent = parentOf(top);
    if (!parent || parent <= 1 || self.has(parent)) return top;
    const { cwd, command } = describe(parent);
    if (!inRepo(cwd) || /(^|\/)-?(zsh|bash|sh|fish|login)(\s|$)/.test(command)) return top;
    top = parent;
  }
}

/** Arrête un processus et toute sa descendance. */
async function stopTree(root) {
  const children = new Map();
  for (const line of quiet('ps', ['-eo', 'pid=,ppid=']).split('\n')) {
    const [pid, ppid] = line.trim().split(/\s+/).map(Number);
    if (!children.has(ppid)) children.set(ppid, []);
    children.get(ppid).push(pid);
  }
  const tree = [];
  const walk = (pid) => {
    tree.push(pid);
    for (const child of children.get(pid) ?? []) walk(child);
  };
  walk(root);
  const signal = (name) => {
    for (const pid of tree) {
      try {
        process.kill(pid, name);
      } catch {
        // déjà arrêté
      }
    }
  };
  signal('SIGTERM');
  for (let i = 0; i < 30 && tree.some(alive); i += 1) await sleep(100);
  if (tree.some(alive)) signal('SIGKILL');
}

/**
 * Arrête les anciens lancements de ce dépôt encore en vie (un `nest --watch` dont l'app a planté
 * ne tient aucun port mais le reprend au prochain changement de fichier). `dir` borne la recherche
 * au dossier lancé, pour que `pnpm dev:api` et `pnpm dev:mobile` cohabitent.
 */
export async function stopStale(dir, pattern) {
  const mine = ownAncestry();
  const scope = `${repoRoot}${dir}`.replace(/\/$/, '');
  const roots = new Set();
  for (const line of quiet('ps', ['-eo', 'pid=,command=']).split('\n')) {
    const [, pid, command] = line.match(/^\s*(\d+)\s+(.*)$/) ?? [];
    if (!pid || mine.has(Number(pid)) || !pattern.test(command)) continue;
    const { cwd } = describe(Number(pid));
    if (cwd === scope || cwd.startsWith(`${scope}/`)) roots.add(topOfRepoTree(Number(pid), mine));
  }
  for (const root of roots) {
    log(`Arrêt d'un ancien lancement : ${describe(root).command.slice(0, 70)}`);
    await stopTree(root);
  }
}

/**
 * Rend un port utilisable pour `label` : le port voulu s'il est libre ou tenu par un reste
 * de ce dépôt (arrêté), sinon le premier port libre au-dessus.
 */
export async function claimPort(label, wanted) {
  for (const pid of listeners(wanted)) {
    if (pid === process.pid || !inRepo(describe(pid).cwd)) continue;
    const top = topOfRepoTree(pid);
    log(`${label} : arrêt de l'ancien lancement de ce dépôt qui tient ${wanted} (${describe(top).command.slice(0, 70)})`);
    await stopTree(top);
  }
  if ((await canListen(wanted)) && listeners(wanted).length === 0) return wanted;
  const owner = listeners(wanted).map(describe)[0];
  for (let port = wanted + 1; port < wanted + 50; port += 1) {
    if (listeners(port).length === 0 && (await canListen(port))) {
      log(`${label} : ${wanted} est pris${owner?.cwd ? ` par ${owner.cwd}` : ''}, on passe sur ${port}`);
      return port;
    }
  }
  fail(`${label} : aucun port libre entre ${wanted} et ${wanted + 49}.`);
}

/** Démarre Docker Desktop au besoin et attend qu'il réponde. */
export async function ensureDocker() {
  if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0) return;
  if (process.platform !== 'darwin') fail('Docker ne répond pas : démarrez-le, puis relancez.');
  log('Docker est arrêté : démarrage de Docker Desktop…');
  spawnSync('open', ['-g', '-a', 'Docker'], { stdio: 'ignore' });
  for (let i = 0; i < 90; i += 1) {
    await sleep(2000);
    if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0) return;
  }
  fail('Docker ne répond toujours pas après 3 minutes.');
}

/** Port publié par le Postgres de ce projet s'il tourne déjà. */
function runningPostgresPort() {
  const out = quiet('docker', ['compose', 'ps', '--status', 'running', '--format', 'json', 'postgres']);
  for (const line of out.split('\n').filter(Boolean)) {
    const port = JSON.parse(line).Publishers?.find((p) => p.TargetPort === 5432 && p.PublishedPort)?.PublishedPort;
    if (port) return port;
  }
  return undefined;
}

/**
 * Démarre le Postgres du projet et rend son port. Un conteneur qui tourne est gardé tel quel ;
 * sinon on prend DATABASE_PORT du .env racine, ou le port libre suivant s'il est pris
 * (par exemple par le Postgres d'un autre projet). L'API reçoit ce port par l'environnement.
 */
export async function ensurePostgres() {
  const env = readEnv('.env');
  if (!env.DATABASE_USERNAME) fail('Pas de .env à la racine : lancez `pnpm setup:env`.');
  await ensureDocker();
  let port = runningPostgresPort();
  if (!port) {
    const wanted = Number(process.env.DATABASE_PORT ?? env.DATABASE_PORT ?? 5432);
    port = wanted;
    while (listeners(port).length > 0 || !(await canListen(port))) port += 1;
    if (port !== wanted) log(`Postgres : ${wanted} est pris, on passe sur ${port}`);
    const result = spawnSync('docker', ['compose', 'up', '-d', '--wait', 'postgres'], {
      cwd: repoRoot,
      env: { ...process.env, DATABASE_PORT: String(port) },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (result.status !== 0) fail(`Postgres ne démarre pas.\n${result.stderr.trim()}`);
  }
  const files = ['.env', 'apps/api/.env'].filter((file) => readEnv(file).DATABASE_PORT !== String(port));
  if (files.length > 0) {
    log(`\x1b[33mPostgres est sur ${port} : mettez DATABASE_PORT=${port} dans ${files.join(' et ')} (migrations, seed).\x1b[0m`);
  }
  log(`Postgres prêt sur 127.0.0.1:${port}`);
  return port;
}

/** Prévient si Node ne suit pas .nvmrc (Metro sature plus vite sous un autre Node). */
export function checkNode() {
  let wanted = '';
  try {
    wanted = readFileSync(`${repoRoot}.nvmrc`, 'utf8').trim().replace(/^v/, '');
  } catch {
    return;
  }
  if (wanted.split('.')[0] !== process.versions.node.split('.')[0]) {
    log(`\x1b[33mNode ${process.versions.node} au lieu de ${wanted} (.nvmrc) : lancez \`nvm use\` si Metro sature.\x1b[0m`);
  }
}
