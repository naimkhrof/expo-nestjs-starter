# Expo + NestJS starter

Monorepo pnpm/Turborepo : `apps/mobile` (Expo SDK 58, Expo Router, Uniwind, composants Obytes) et `apps/api` (NestJS 11, Brocoders, PostgreSQL/TypeORM). Chaque app a son `CLAUDE.md`.

## Méthode

- Produit : `PRODUCT.md`. Backlog, US et bugs : **GitHub Issues** via `gh`, seule source. Pas de `docs/`, PRD ou spec maintenus à côté du code : la vérité durable est le code, ses tests et ses migrations.
- Développer une issue : skill `story`. Créer, découper ou modifier le backlog : skill `backlog`.
- Backend d'abord : modèle de données → API et tests → écrans.
- L'issue est mise à jour avant le code. Une issue fermée ne se réécrit pas : on en ouvre une nouvelle.

## Commandes

- Vérifier : `pnpm typecheck`, `pnpm lint`, `pnpm test` ; `pnpm build` exporte les bundles et compile l'API (ni build natif, ni publication) ; `pnpm expo:doctor`.
- Une app : `pnpm --filter @starter/mobile …` ou `pnpm --filter @starter/api …`.
- Base : `pnpm db:up`, `pnpm db:migrate`. Starter : `pnpm test:starter`.

## Conventions

- Nouvelle persistance : skill `generate` (variante relational), puis `nestjs-best-practices`. Conserver domaines, repositories et mappers Brocoders.
- Les endpoints appartiennent à NestJS, jamais aux routes Expo.
- Réutiliser les primitives `apps/mobile/src/components/ui`, les tokens `src/global.css` et le client Axios/TanStack Query.
- Une nouvelle dépendance se justifie dans le plan, avec ce que le starter fournit déjà.

## Pièges

- MMKV/Nitro exigent un development build : Expo Go ne fonctionne pas.
- `pnpm starter:init` doit précéder `pnpm setup:env` ; il refuse de changer l'identité après la création des `.env`.
- Ne jamais publier `.env`, clés de signature ou identifiants EAS. Aucune clé serveur dans `EXPO_PUBLIC_*`.
- Vérifications web : navigateur intégré de l'app Claude ; fermer les onglets temporaires.
