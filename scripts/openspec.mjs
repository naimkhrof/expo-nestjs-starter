import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const localState = path.join(projectRoot, '.cache', 'openspec');

// Keep OpenSpec's machine-level defaults and registries local to this project.
const result = spawnSync(
  process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
  ['exec', 'openspec', ...process.argv.slice(2)],
  {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      OPENSPEC_TELEMETRY: '0',
      XDG_CONFIG_HOME: path.join(localState, 'config'),
      XDG_DATA_HOME: path.join(localState, 'data'),
      XDG_CACHE_HOME: path.join(localState, 'cache'),
    },
  },
);

if (result.error) {
  console.error(`Impossible de lancer OpenSpec : ${result.error.message}`);
}
process.exit(result.status ?? 1);
