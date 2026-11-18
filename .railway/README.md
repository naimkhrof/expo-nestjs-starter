# Railway en code

`railway.ts` décrit le projet : `Postgres` (+ volume), `api` (Dockerfile, migrations en pré-déploiement) et `backup` (cron quotidien `pg_dump` vers un bucket S3). Le nom vient de `starter.config.json`, le dépôt de `git remote origin`.

Les commandes se lancent depuis ce dossier, hors workspace pnpm.

```bash
pnpm install --ignore-workspace   # SDK Railway
railway login && railway init     # nouveau projet, une seule fois
railway config plan               # aperçu, ne change rien
railway config apply              # application
```

Après le premier `apply` : poser chez Railway les secrets `preserve()` (`AUTH_*_SECRET`, `BACKUP_S3_*`), puis ajouter le domaine dans `railway.ts` (voir le commentaire de `domains`).

**ATTENTION** : sur un projet Railway existant, toujours `railway config pull` d'abord et fusionner dans `railway.ts`. Sinon `apply` supprimerait tout ce qui n'y est pas décrit.

Le back-office, lui, est sur Cloudflare Workers (`apps/backoffice/wrangler.jsonc`) ; les sauvegardes partent vers un bucket R2 (ou autre S3).

Procédure complète : `apps/api/CLAUDE.md`, section « Mise en ligne (Railway) ».
