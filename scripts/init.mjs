import { readFile, readdir, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('pnpm starter:init --name "My App" --slug my-app --scope myapp --bundle-id com.example.myapp [--scheme myapp] [--dry-run]');
  process.exit(0);
}

try {
  const previous = JSON.parse(await readFile(path.join(root, 'starter.config.json'), 'utf8'));
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (key === '--dry-run') { options.dryRun = true; continue; }
    if (!['--name', '--slug', '--scope', '--bundle-id', '--scheme'].includes(key)) throw new Error(`Unknown option: ${key}`);
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${key}`);
    options[key.slice(2)] = args[++i];
  }
  if (!options.name || !options.slug || !options['bundle-id']) throw new Error('Provide --name, --slug and --bundle-id. See --help.');
  const next = {
    name: options.name,
    slug: options.slug,
    scope: options.scope ?? options.slug,
    bundleId: options['bundle-id'],
    scheme: options.scheme ?? options.slug,
  };
  if (!next.name.trim() || /[\r\n\x00-\x1f]/.test(next.name) || next.name.length > 100) throw new Error('Name must be 1–100 printable characters.');
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(next.slug) || next.slug.length > 50) throw new Error('Slug must be lowercase kebab-case, at most 50 characters.');
  if (!/^[a-z][a-z0-9-]*$/.test(next.scope) || next.scope.length > 50) throw new Error('Scope must start with a lowercase letter and contain lowercase letters, numbers or hyphens.');
  if (!/^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*){2,}$/.test(next.bundleId)) throw new Error('Bundle ID must have at least three lowercase components, e.g. com.example.myapp.');
  if (!/^[a-z][a-z0-9-]*$/.test(next.scheme)) throw new Error('Scheme must contain lowercase letters, numbers or hyphens.');
  const changed = JSON.stringify(previous) !== JSON.stringify(next);
  if (changed) {
    for (const rel of ['.env', 'apps/api/.env', 'apps/mobile/.env']) {
      const exists = await access(path.join(root, rel)).then(() => true, () => false);
      if (exists) throw new Error(`Initialize before setup:env: ${rel} already exists. Keep your local env files and update identity manually if needed.`);
    }
  }

  const edits = new Map();
  const skip = new Set(['.git', 'node_modules', '.cache', '.turbo', '.expo', 'dist', 'coverage', 'ios', 'android']);
  async function visit(directory) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      const filename = path.join(directory, item.name);
      if (item.isSymbolicLink() || skip.has(item.name)) continue;
      if (item.isDirectory()) { await visit(filename); continue; }
      if (!item.isFile() || (item.name.startsWith('.env') && item.name !== '.env.example')) continue;
      const bytes = await readFile(filename);
      if (bytes.includes(0)) continue;
      const text = bytes.toString('utf8');
      if (!Buffer.from(text).equals(bytes)) continue;
      const updated = text.replaceAll(`@${previous.scope}/`, `@${next.scope}/`);
      if (updated !== text) edits.set(filename, updated);
    }
  }
  await visit(root);
  for (const rel of ['package.json', 'apps/mobile/package.json', 'apps/api/package.json']) {
    const filename = path.join(root, rel);
    const json = JSON.parse(edits.get(filename) ?? await readFile(filename, 'utf8'));
    json.name = rel === 'package.json' ? next.slug : `@${next.scope}/${rel.split('/')[1]}`;
    edits.set(filename, JSON.stringify(json, null, 2) + '\n');
  }
  const compose = path.join(root, 'compose.yaml');
  edits.set(compose, (await readFile(compose, 'utf8')).replace(/^name: .+$/m, `name: ${next.slug}`));
  edits.set(path.join(root, 'starter.config.json'), JSON.stringify(next, null, 2) + '\n');
  const lockPath = path.join(root, '.agents/skills.lock.json');
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  for (const entry of lock.skills) {
    const filename = path.join(root, '.agents/skills', entry.name, 'SKILL.md');
    entry.installedSkillSha256 = createHash('sha256').update(edits.get(filename) ?? await readFile(filename)).digest('hex');
  }
  edits.set(lockPath, JSON.stringify(lock, null, 2) + '\n');
  if (!options.dryRun) for (const [filename, text] of edits) await writeFile(filename, text);
  console.log(`${options.dryRun ? 'Would initialize' : 'Initialized'} ${next.name}: @${next.scope}, ${next.bundleId} (.development / .preview outside production).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
