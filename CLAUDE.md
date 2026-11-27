# Expo + NestJS starter

Monorepo pnpm/Turborepo :
- `apps/mobile` : Expo SDK 58, Expo Router, Uniwind.
- `apps/backoffice` : back-office admin, Expo web seul.
- `apps/api` : NestJS 11 Brocoders, PostgreSQL/TypeORM.
- `packages/ui` : tokens et primitives partagés, livrés en sources.

Chaque app a son `CLAUDE.md`, chargé quand on y travaille. Règles à portée : `.claude/rules/`.

## Où lire quoi

Chaque information vit à un seul endroit ; on la réécrit à l'état nouveau, sans amendement.
- **Produit** (pour qui, V1, contraintes, dépendances externes) : `PRODUCT.md`, une page. Pas de `docs/`, PRD ni spec : la vérité durable est le code, ses tests et ses migrations.
- **Backlog, US, bugs, décisions, changements client** : GitHub Issues via `gh`, seule source. Une issue fermée ne se réécrit pas ; l'issue est mise à jour avant le code.
- **Interface** : un seul document Claude Design, lien dans `PRODUCT.md` › Design. Tokens dans le code : `packages/ui/src/tokens.css` ; une valeur qui change se modifie sur la planche et dans ce fichier ensemble.
- **Sortie** : `apps/mobile/RELEASE.md`. **Licences** : `THIRD_PARTY.md`.
- **Procédures** : skills `story`, `backlog`, `design` (plugin `workflow`) ; `generate` puis `nestjs-best-practices` (ressource CRUD de l'API) ; `turborepo`.

## Routage (label → à charger)

| Label | Lire ou invoquer |
| --- | --- |
| `epic`, `epic:<nom>` | l'epic, ses sous-issues dans l'ordre, `PRODUCT.md` |
| `story`, `us` | `PRODUCT.md`, la planche citée dans l'issue |
| `mobile`, `impacte-maquette` | skill `design`, `apps/mobile/CLAUDE.md`, skills `expo-*` |
| `backend` | `apps/api/CLAUDE.md`, skill `nestjs-best-practices` |
| `bug` | le code concerné et son test |
| `decision`, `changement`, `question-client` | `PRODUCT.md`, skill `backlog` |
| `après-v1` | jamais lancé avant la sortie |

## Méthode

- Cadrage avant tout code (skill `backlog`). Un epic à la fois ; un pack d'US = une session (`/story epic <n> [pack <k>]`).
- Branche d'intégration : `main`. Un seul push en fin de session.

## Conventions

- Backend d'abord : modèle de données, puis API et tests, puis écrans.
- Les endpoints appartiennent à NestJS, jamais aux routes Expo.
- **Aucun code sans appelant** ajouté « pour plus tard » : ni table ou colonne sans lecteur, ni dépendance sans importeur.
- **Rien d'inventé** : une règle métier, un texte ou un chiffre absent des sources est une question au client.
- Aucune clé serveur dans `EXPO_PUBLIC_*`. Aucun secret dans le dépôt (`.env`, clé de signature, identifiant EAS).
- Réutiliser `packages/ui`, les tokens et le client Axios/TanStack Query ; nouvelle persistance : skill `generate` (relational), en gardant domaines, repositories et mappers Brocoders.
- Design : aucun écran codé sans planche validée, éditée en place avant le code ; jamais de planche par US.

## Plateformes

iOS et Android testés dès le premier écran, dans chaque langue ; un produit peut l'écrire autrement dans son `CLAUDE.md`.

## Commandes

- **Vérifier** : `pnpm check` (typecheck et lint en parallèle, puis les tests, plus le lint des instructions) ; `pnpm test:db` (migrations sur base jetable) ; `pnpm build` (bundles et API, sans build natif) ; `pnpm expo:doctor` ; `pnpm test:starter`.
- **Une app** : `pnpm --filter @starter/{mobile,api,backoffice} …`.
- **Base** : `pnpm db:up`, `pnpm db:migrate`, `pnpm db:backup`.
- `pnpm starter:init` précède `pnpm setup:env`.

## CI

Un projet issu du starter est en général privé : adapter ici son quota de minutes Actions. `ci.yml` s'exécute sur le dernier commit poussé ; son `paths-ignore` saute les pushs qui ne touchent que des `.md`, `CLAUDE.md`, `.claude/` ou les modèles d'issue.

## Pièges

- MMKV/Nitro exigent un development build : Expo Go ne fonctionne pas.
- Jest : `forceExit` est dans chaque config, y compris pour un `jest <chemin>` lancé à la main ; c'est une soupape, un handle ouvert se corrige à la source (`--detectOpenHandles`, fermeture dans `afterAll`). Un test qui attend jusqu'à son `testTimeout` est cassé, pas un délai à allonger. Sous Claude Code, Jest 30 passe en rapport agent (échecs et résumé seulement) : un silence n'est pas un blocage ; lancer les suites longues en arrière-plan.
- Cloudflare, Railway et Expo : MCP `cloudflare`, `railway`, `expo` du projet (`.mcp.json`, OAuth, chargés à la demande), jamais le tableau de bord. Les clés d'accès (R2, jetons d'API) se créent à la main.
