#!/usr/bin/env node
// Photo du produit pour un cahier des charges : PRODUCT.md, puis chaque epic
// et ses US (état, besoin, critères), lus sur GitHub. Écrit sur la sortie standard.
// Usage : pnpm product:export > <dossier client>/cdc-vX.md
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const gh = (args) => JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
const repo = process.env.GH_REPO || execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'], { encoding: 'utf8' }).trim();

const section = (body, title) => {
  const match = (body ?? '').match(new RegExp(`###\\s*${title}[^\\n]*\\n([\\s\\S]*?)(?=\\n###\\s|$)`, 'i'));
  return match ? match[1].trim() : '';
};

const out = [readFileSync('PRODUCT.md', 'utf8').trim(), '', `# Epics et user stories`, '', `_Exporté le ${new Date().toISOString().slice(0, 10)} depuis ${repo}._`, ''];
const epics = gh(['issue', 'list', '--repo', repo, '--label', 'epic', '--state', 'all', '--limit', '200', '--json', 'number,title,state,body'])
  .sort((a, b) => a.title.localeCompare(b.title, 'fr', { numeric: true }));

for (const epic of epics) {
  out.push(`## ${epic.title} (#${epic.number})`, '', section(epic.body, 'Objectif') || '', '');
  const subs = gh(['api', `repos/${repo}/issues/${epic.number}/sub_issues`, '--paginate']);
  for (const us of subs) {
    if (us.labels?.some((l) => l.name === 'après-v1')) continue;
    out.push(`### ${us.title} (#${us.number}${us.state === 'closed' ? ', livrée' : ''})`, '');
    for (const title of ['Besoin', "Critères d'acceptation", 'Règles métier']) {
      const text = section(us.body, title) || (title === 'Besoin' ? (us.body ?? '').split(/\n###\s/)[0].trim() : '');
      if (text) out.push(`**${title}**`, '', text, '');
    }
  }
}
process.stdout.write(`${out.join('\n').replace(/\n{3,}/g, '\n\n')}\n`);
