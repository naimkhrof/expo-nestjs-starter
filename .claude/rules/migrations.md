---
paths:
  - "apps/api/src/database/migrations/**"
---
# Migrations

- `migration:generate` ne compare pas les `CHECK` : les écrire à la main dans la migration.
- Ce que la base peut tenir seule est une contrainte SQL ; ce qui croise plusieurs tables se contrôle dans le service.
- `env-cmd` écrase les variables du shell sans `--no-override` : pour viser une autre base, l'ajouter (`env-cmd --no-override -- …`) ou donner `DATABASE_URL` en entier.
- `migrations.db-spec.ts` monte puis descend toutes les migrations (`pnpm test:db`) : une migration s'écrit réversible.
