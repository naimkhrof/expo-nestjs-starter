#!/usr/bin/env node
// Hook PreToolUse (Edit|Write|MultiEdit) : refuse (exit 2) l'édition d'un chemin protégé.
// Les préfixes protégés (relatifs à la racine du dépôt) sont listés dans .claude/protected-paths.json ;
// vide par défaut. Ne couvre pas une modification faite par Bash : il complète les règles `deny`.
import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
let prefixes = [];
try {
  prefixes = JSON.parse(readFileSync(resolve(root, '.claude/protected-paths.json'), 'utf8'));
} catch {}

let file = '';
try {
  file = JSON.parse(readFileSync(0, 'utf8')).tool_input?.file_path ?? '';
} catch {}
if (!file) process.exit(0);

const rel = (isAbsolute(file) ? relative(root, file) : file).split('\\').join('/');
const hit = prefixes.find((p) => rel === p.replace(/\/$/, '') || rel.startsWith(p.endsWith('/') ? p : `${p}/`));
if (hit) {
  console.error(`Chemin protégé (${hit}) : ne pas le modifier. Voir .claude/protected-paths.json.`);
  process.exit(2);
}
