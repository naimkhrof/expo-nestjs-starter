# Expo + NestJS starter

Monorepo pnpm/Turborepo :
- `apps/mobile` : Expo SDK 58, Expo Router, Uniwind.
- `apps/backoffice` : back-office admin, Expo web seul.
- `apps/api` : NestJS 11 Brocoders, PostgreSQL/TypeORM.
- `packages/ui` : tokens et primitives partagés, livrés en sources.

Chaque app a son `CLAUDE.md`, chargé quand on y travaille.

## Où vit l'information

Chaque information vit à un seul endroit ; on la réécrit à l'état nouveau, sans amendement.
- **Produit** (pour qui, V1, contraintes, dépendances externes) : `PRODUCT.md`, une page.
- **Backlog, US, bugs, décisions, changements client** : GitHub Issues via `gh`, seule source. Skill `backlog`.
- **Interface** : un seul document Claude Design (planche « Design system » puis une planche par écran), seule référence du design final ; lien dans `PRODUCT.md`. Skill `story` pour développer.
- **Sortie** : `apps/mobile/RELEASE.md`. **Licences** : `THIRD_PARTY.md`.
- Pas de `docs/`, PRD ni spec à côté du code : la vérité durable est le code, ses tests et ses migrations. Le cahier des charges client est généré depuis `PRODUCT.md` et les issues (skill `backlog`) ; le document signé, le devis et le contrat restent hors du dépôt.

## Méthode

- Cadrage avant tout code (skill `backlog`) : `PRODUCT.md`, dépendances externes, epics et US, démo dans Claude Design, cahier des charges généré et signé, V1 figée, revue à froid.
- Un epic à la fois ; un pack d'US = une session (`/story epic <n> [pack <k>]`). Le label `après-v1` n'est jamais lancé avant la sortie.
- Backend d'abord : données, puis API et tests, puis écrans.
- L'issue est mise à jour avant le code. Une issue fermée ne se réécrit pas : on en ouvre une nouvelle.

## Design

- Un seul document Claude Design (artifact Design) : la planche « Design system » (couleurs clair et sombre, typographie, espacements, rayons, composants) puis une planche par écran. Pas d'artifact Design System séparé.
- `packages/ui/src/tokens.css` est la copie des tokens dans le code (bloc `@theme`) : une valeur qui change se modifie dans la planche et dans `tokens.css` ensemble.
- La démo client se fait dans ce document : ses planches deviennent les définitives. Pas de démo codée ; un croquis ou prototype reçu du client n'est jamais une référence de code.
- Une planche est **éditée en place** avant le code, adaptée à l'US, et validée. Ni copie, ni planche par US, ni US « Maquette ». On garde l'état d'origine avant d'éditer.
- Aucun écran codé sans planche validée. La conformité se vérifie à chaque US (captures iOS et Android en regard de la planche), pas par un audit final.

## Interdits

- **Rien d'inventé** : une règle métier, un texte ou un chiffre absent des sources est une question au client.
- **Aucun code sans appelant** ajouté « pour plus tard », aucune table ni colonne sans lecteur, aucune dépendance sans importeur.
- Les endpoints appartiennent à NestJS, jamais aux routes Expo.
- **Aucun secret** : ni `.env`, ni clé de signature, ni identifiant EAS dans le dépôt ; aucune clé serveur dans `EXPO_PUBLIC_*`.

## Commandes

- **Vérifier** : `pnpm check` (typecheck et lint en parallèle, puis les tests) ; `pnpm test:db` (migrations sur base jetable) ; `pnpm build` (bundles et API, sans build natif) ; `pnpm expo:doctor`.
- **Une app** : `pnpm --filter @starter/{mobile,api,backoffice} …`.
- **Base** : `pnpm db:up`, `pnpm db:migrate`, `pnpm db:backup`. **Starter** : `pnpm test:starter`.

## Conventions

- Nouvelle persistance : skill `generate` (relational), puis `nestjs-best-practices`. Garder domaines, repositories et mappers Brocoders.
- Réutiliser `packages/ui`, les tokens et le client Axios/TanStack Query. Une nouvelle dépendance se justifie dans le plan.
- Toute chaîne visible dans chaque fichier de langue, mêmes clés (vérifié par un test). Tester chaque langue et iOS **et** Android dès le premier écran.

## Pièges

- MMKV/Nitro exigent un development build : Expo Go ne fonctionne pas.
- Jest : passer par les scripts (`pnpm check`, `pnpm test`, `pnpm test:db`), qui ont `--forceExit`. Un Jest lancé à la main (`pnpm exec jest <chemin>`) prend aussi `--forceExit` et un `timeout` : sans ce flag, un handle ouvert (React Native, TypeORM) bloque Jest indéfiniment après la dernière suite.
- `pnpm starter:init` doit précéder `pnpm setup:env`.
- Un push sur `main` lance la CI.
- Vérifications web : navigateur intégré de l'app Claude ; fermer les onglets temporaires.
- Cloudflare (DNS, R2, Workers), Railway et Expo (EAS, builds, documentation) : MCP `cloudflare`, `railway` et `expo` du projet (`.mcp.json`, OAuth, chargés à la demande), jamais le tableau de bord dans le navigateur. Les clés d'accès (R2, jetons d'API) se créent à la main.
