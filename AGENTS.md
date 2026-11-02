# Expo + NestJS starter

Monorepo pnpm/Turborepo : `apps/mobile` (Expo SDK 58, Expo Router, Uniwind, composants Obytes), `apps/api` (NestJS 11, architecture Brocoders, PostgreSQL/TypeORM). Un seul lockfile à la racine. Les apps tournent sur l’hôte ; Docker Compose héberge PostgreSQL et Maildev facultatif.

Utiliser les scripts racine ou `pnpm --filter @starter/mobile …` et `pnpm --filter @starter/api …`. `starter.config.json` définit l’identité de l’application ; `pnpm starter:init` personnalise un nouveau projet avant `pnpm setup:env`. Ne jamais publier `.env`, clés de signature ou identifiants EAS d’un autre projet.

## Guides techniques

Chaque skill a une seule source dans `.agents/skills/` à la racine, y compris `generate`. Ne pas créer de copie ni d’alias de skill dans les apps.

Avant d’intervenir, lire les consignes de l’app et le guide adapté dans `.agents/skills/` :

| Zone | Guide |
| --- | --- |
| UI, thème, composants, accessibilité | `expo-design-system/SKILL.md` |
| Navigation, onglets, liens profonds | `expo-router/SKILL.md` |
| Réseau, Axios, TanStack Query, hors ligne | `expo-data-fetching/SKILL.md` |
| Animations, gestes, clavier | `expo-animation/SKILL.md` |
| Development builds, simulateurs, Metro | `expo-dev-client/SKILL.md` |
| Ressources persistées et propriétés | `generate/SKILL.md`, puis `nestjs-best-practices/SKILL.md` |
| Controllers, services, DTO, auth, tests API | `nestjs-best-practices/SKILL.md` |
| Conversation native, runtime et streaming | `assistant-ui-native/SKILL.md` |
| Workspace, scripts, cache, CI | `turborepo/SKILL.md` |

Réutiliser les primitives, le client Axios/TanStack Query et les conventions du socle. Les endpoints appartiennent à NestJS. MMKV/Nitro demandent un development build ; Expo Go n’est pas un prérequis. Le hook assistant-ui est préparé mais aucun fournisseur IA ni endpoint de chat n’est livré.

## Produit et OpenSpec

Lire les documents du nouveau projet lorsqu’ils existent ; ne pas inventer ses besoins. `docs/README.md` décrit où les placer. Aucun contenu métier Dhikr n’est distribué dans ce template.

Un seul `openspec/`. Utiliser `pnpm spec …` pour la configuration locale. Les workflows OpenSpec complètent les guides techniques ; ils ne déclenchent pas d’implémentation hors de la demande de l’utilisateur.

## Vérification

Choisir les contrôles utiles : `pnpm test:starter`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm expo:doctor`. Le build exporte les bundles et compile l’API ; il ne constitue pas un build natif ni une publication.

Pour naviguer, utiliser uniquement le navigateur intégré Codex (`iab`). Si une action y est impossible, expliquer le blocage avant de changer de navigateur. Fermer les onglets temporaires à la fin.
