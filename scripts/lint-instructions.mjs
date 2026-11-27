#!/usr/bin/env node
// Copie du plugin `workflow` (naim-workflow) : à modifier à la source, pas ici.
// Lint des instructions Claude Code d'un dépôt. Lancer depuis la racine du dépôt.
// Sortie : fichier:ligne message. Exit 1 s'il y a au moins une erreur.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const IGNORED = new Set(['node_modules', '.git', 'dist', 'build', '.expo', 'ios', 'android', '.turbo', '.next']);
const errors = [];
const err = (file, line, msg) => errors.push(`${relative(ROOT, file) || file}:${line} ${msg}`);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (IGNORED.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const isClaudeMd = (f) => f.endsWith('/CLAUDE.md') || f.endsWith('\\CLAUDE.md');
const rel = (f) => relative(ROOT, f).split('\\').join('/');
const lines = (f) => readFileSync(f, 'utf8').split('\n');

function frontmatter(f) {
  const l = lines(f);
  if (l[0]?.trim() !== '---') return null;
  const end = l.findIndex((x, i) => i > 0 && x.trim() === '---');
  if (end < 0) return null;
  return { raw: l.slice(1, end), end };
}

function fmFields(fm) {
  const fields = {};
  let current = null;
  for (const l of fm.raw) {
    const m = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(l);
    if (m) {
      current = m[1];
      fields[current] = m[2];
    } else if (current && /^\s+\S/.test(l) && !/^\s*-\s/.test(l)) {
      fields[current] += ` ${l.trim()}`;
    }
  }
  return fields;
}

const claudeMds = files.filter(isClaudeMd);
const rules = files.filter((f) => /(^|\/)\.claude\/rules\/[^/]+\.md$/.test(rel(f)));
const skills = files.filter((f) => /(^|\/)skills\/[^/]+\/SKILL\.md$/.test(rel(f)));

for (const f of claudeMds) {
  const n = lines(f).length;
  const isRoot = rel(f) === 'CLAUDE.md';
  if (isRoot && n > 120) err(f, 1, `CLAUDE.md racine trop long (${n} lignes, max 120)`);
  if (!isRoot && n > 80) err(f, 1, `CLAUDE.md d'app trop long (${n} lignes, max 80)`);
}

for (const f of [...claudeMds, ...rules, ...skills]) {
  lines(f).forEach((l, i) => {
    if (l.includes('/Users/')) err(f, i + 1, 'chemin absolu /Users/ interdit');
  });
}

for (const f of skills) {
  const fm = frontmatter(f);
  if (!fm) {
    err(f, 1, 'frontmatter manquant');
    continue;
  }
  const fields = fmFields(fm);
  if (!fields.name?.trim()) err(f, 1, 'champ name manquant');
  const desc = (fields.description ?? '').trim();
  if (!desc) err(f, 1, 'champ description manquant');
  else if (desc.length > 1536) err(f, 1, `description trop longue (${desc.length} caractères, max 1 536)`);
}

for (const f of rules) {
  const fm = frontmatter(f);
  if (!fm) continue;
  for (const key of Object.keys(fmFields(fm))) {
    if (key !== 'paths') err(f, 1, `champ de frontmatter « ${key} » interdit dans une règle (seul paths est lu)`);
  }
}

const PATH_RE = /^(apps|packages|scripts|content|\.claude)\//;
for (const f of claudeMds) {
  lines(f).forEach((l, i) => {
    for (const m of l.matchAll(/`([^`]+)`/g)) {
      const p = m[1].trim();
      if (!PATH_RE.test(p) || /[*<{\s]/.test(p)) continue;
      const clean = p.replace(/[.,;:)]+$/, '');
      if (!existsSync(join(ROOT, clean))) err(f, i + 1, `chemin cité inexistant : ${clean}`);
    }
  });
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} erreur(s)`);
  process.exit(1);
}
console.log('Instructions : aucune erreur');
