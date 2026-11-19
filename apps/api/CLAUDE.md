# API (NestJS 11, Brocoders)

## Architecture

- **Ressource exposée en CRUD HTTP** : skill `generate` (variante `relational`), puis `nestjs-best-practices`.
  - Les templates Hygen restent dans `apps/api` (`.hygen/`, `.hygen.js`) ; ne pas copier le skill ici.
  - Conserver les modules, domaines, repositories, persistences et mappers de Brocoders.
  - Pas d'entité inutile pour un endpoint sans persistence.
- Un exemple `POST(Request)` destiné à Next.js ou Expo se traduit vers NestJS, avec le routage et la validation existants. Les controllers HTTP restent ici.
- **Où contrôler** : ce que la base peut tenir seule est une contrainte SQL ; ce qui croise plusieurs tables se contrôle dans le service.

## Base et migrations

- `pnpm db:up`, `pnpm db:migrate`. Les migrations vivent dans `src/database/migrations`.
- `migration:generate` ne compare pas les `CHECK` : les écrire à la main dans la migration.
- `env-cmd` écrase les variables du shell sans `--no-override` : pour viser une autre base, l'ajouter (`env-cmd --no-override -- …`) ou donner `DATABASE_URL` en entier.
- **Sauvegardes**, hors du dépôt (`~/<slug>-backups` ou `DB_BACKUP_DIR`) : `pnpm db:backup`, `pnpm db:backup:verify <fichier>` (base jetable), `pnpm db:restore <fichier> --force`.

## Sécurité et configuration

- Limite de débit globale (`@nestjs/throttler`, `app.module.ts`) : `APP_THROTTLE_LIMIT`, `APP_THROTTLE_TTL_MS`. Une route sensible la resserre avec `@Throttle`.
- Derrière un mandataire (hébergeur), régler `APP_TRUST_PROXY` : sans lui, tous les clients comptent sous une seule adresse.
- `APP_PUBLIC_SIGNUP=false` : l'inscription par e-mail et les connexions sociales répondent 404 (`PublicSignupGuard`).
- Swagger (`/docs`) n'est pas servi quand `NODE_ENV=production`.
- Un nouveau front (`apps/backoffice`, web) ajoute son origine à `APP_CORS_ORIGINS`.

## Tests

- **Unitaires** : `pnpm test`. **E2e** : `test/**/*.e2e-spec.ts`, API lancée à part.
- **Base** : `pnpm test:db` (`test/db/*.db-spec.ts`) sur une base jetable créée à côté de celle de travail, détruite à la fin. `migrations.db-spec.ts` monte puis descend toutes les migrations. Les contraintes SQL propres à l'app s'y testent aussi (`createTempDatabase`).

## Mise en ligne (Railway)

- **Configuration en code** : `.railway/railway.ts` (README du dossier). `cd .railway && pnpm install --ignore-workspace`, `railway config plan`, puis `railway config apply`. Sur un projet existant, `railway config pull` d'abord.
- **Services** : `Postgres` (volume), `api` (`apps/api/Dockerfile`, déployé après une CI verte, migrations en pré-déploiement), `backup` (chaque jour à 3 h UTC, `pg_dump` vers un bucket S3 compatible, `backups/postgres/` ; règle d'expiration à poser sur le bucket).
- **Environnements** : `production` (données réelles) et `staging` (domaine `*.up.railway.app` généré, base jetable, sans sauvegarde) ; les deux déploient `main`. Une migration passe d'abord en staging. Mise en place : `.railway/README.md`.
- **Domaines** : à ajouter dans `railway.ts` avec `BACKEND_DOMAIN`, `FRONTEND_DOMAIN`, `APP_CORS_ORIGINS`. Swagger n'est pas servi en production.
- **Secrets** : `AUTH_*_SECRET` et `BACKUP_S3_*` restent chez Railway (`preserve()`), jamais dans le dépôt.
- **Restaurer une sauvegarde** : `railway tcp-proxy create -s Postgres --port 5432`, puis `pg_restore --no-owner --no-acl -j 4` dans une base vide, puis supprimer le proxy.
- **Commande ponctuelle sur la production** : `railway run --service api -- …`, avec `DATABASE_URL` pointée sur le proxy.
