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

**Staging** : un second environnement Railway pour la recette (build EAS `preview`), sur le même `main`, avec l'API et sa base seulement (données jetables, sans sauvegarde). `railway.ts` le distingue avec `ctx.isEnvironment("production")`. Mise en place, une fois :

```bash
railway environment new staging                     # vide : ne jamais dupliquer la production
railway config apply --environment staging
railway variables --environment staging --service api --set "AUTH_JWT_SECRET=$(openssl rand -hex 32)" …   # les quatre AUTH_*_SECRET, propres au staging
railway domain --environment staging --service api --port 8080
railway environment production                      # la CLI a basculé sur staging : revenir
```

Puis redéployer l'API staging et poser son URL dans l'environnement EAS `preview` (`apps/mobile/RELEASE.md`).

**ATTENTION** : sur un projet Railway existant, toujours `railway config pull` d'abord et fusionner dans `railway.ts`. Sinon `apply` supprimerait tout ce qui n'y est pas décrit.

Le back-office, lui, est sur Cloudflare Workers (`apps/backoffice/wrangler.jsonc`) ; les sauvegardes partent vers un bucket R2 (ou autre S3).

Procédure complète : `apps/api/CLAUDE.md`, section « Mise en ligne (Railway) ».
