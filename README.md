# Expo + NestJS Starter

Starter réutilisable : **Expo SDK 58 / React Native 0.88 / React 19.3**, Expo Router, Uniwind/Tailwind, composants Obytes, NestJS 11, TypeORM/PostgreSQL, pnpm et Turborepo.

## Créer une application

Sur GitHub, choisir **Use this template → Create a new repository**, ou utiliser :

```sh
gh repo create mon-app --template naimkhrof/expo-nestjs-starter --private --clone
cd mon-app
```

Prérequis : Node.js 24 LTS (`nvm use`), pnpm et Docker démarré. La version pnpm 10.34.9 est épinglée dans `package.json`.

```sh
pnpm starter:init --name "Mon App" --slug mon-app --scope monapp --bundle-id com.example.monapp
pnpm install --frozen-lockfile
pnpm setup:env
pnpm db:up
pnpm db:migrate
pnpm ios # premier build local ; pnpm android pour Android
```

Ce premier build compile et installe le dev client avec MMKV/Nitro, puis démarre Metro. Pour les sessions suivantes, arrêter ce serveur avec `Ctrl+C`, puis lancer `pnpm dev` pour le mobile et l'API ensemble.

`starter:init` fonctionne aussi avec `node scripts/init.mjs …` avant installation. Il personnalise `starter.config.json`, les packages et filtres pnpm, Docker Compose et les exemples des guides. `--dry-run` prévisualise sans écrire. Lancer cette commande **avant** de générer les `.env` ; elle refuse de modifier l’identité après leur création.

`starter.config.json` est l’unique source du nom, slug, schéma de lien et identifiant natif. Les builds development/preview reçoivent les suffixes `.development` / `.preview`, afin de pouvoir cohabiter avec la production. Choisir ses propres bundle IDs avant diffusion.

## Services et mobile

- API : http://localhost:3001 ; Swagger : http://localhost:3001/docs.
- Metro : port 8081. `pnpm dev:api` et `pnpm dev:mobile` démarrent séparément les apps.
- `pnpm ios` / `pnpm android` créent le development build local, avec Xcode / Android Studio. **MMKV et Nitro nécessitent un development build** : les commandes mobiles `dev` et `start` ciblent explicitement le dev client.
- `pnpm web` lance la cible web. Dans `apps/mobile/.env`, utiliser `http://10.0.2.2:3001` sur émulateur Android ou l’adresse LAN de l’ordinateur sur téléphone physique.
- `pnpm mail:up` lance l’inbox SMTP facultative sur http://localhost:1080 pour les emails du boilerplate.
- `pnpm db:down` arrête les conteneurs sans supprimer le volume. Chaque projet Compose utilise son nom propre ; ne pas réutiliser le volume d’une autre application.

`pnpm dev` utilise l'interface interactive de Turbo : sélectionner `@starter/mobile#dev` avec les flèches, puis appuyer sur `Entrée` pour envoyer les raccourcis à Expo (`i` : iOS, `a` : Android, `r` : recharger, `m` : menu développeur). `Ctrl+Z` rend le focus à Turbo. `pnpm dev:mobile` donne directement le terminal Expo ; lancer alors `pnpm dev:api` dans un second terminal.

Après une modification des dépendances ou de la configuration native, reconstruire avec `pnpm ios` ou `pnpm android`. Si la configuration native a changé, exécuter d'abord `pnpm --filter @starter/mobile exec expo prebuild --platform ios` (ou `android`). Un rechargement JavaScript ne peut pas ajouter Nitro/MMKV à un ancien binaire.

`setup:env` crée les trois `.env` sans écraser les fichiers existants. Le mot de passe PostgreSQL est généré une fois et partagé entre Compose et l’API ; les quatre secrets JWT sont générés séparément. Les exemples ne contiennent aucune clé réelle. Les `.env` restent locaux. Après modification des identifiants PostgreSQL, un volume initialisé conserve ses anciens identifiants.

`pnpm db:seed` est **facultatif et réservé au développement** : le seed upstream crée les rôles/statuts et deux comptes de démonstration (`admin@example.com`, `john.doe@example.com`, mot de passe `secret`). Il n’est jamais exécuté automatiquement. Ne pas lancer ce seed en production.

## Structure

```text
apps/mobile/       Expo Router, composants UI, stockage MMKV, i18n, Axios/Query
apps/api/          NestJS, auth, fichiers, Swagger, TypeORM et générateurs Hygen
scripts/           Initialisation, environnements, smoke test
.claude/skills/    Skills Claude Code : méthode (story, backlog) et guides techniques
.github/           CI, modèles d’issues (US, bug) et de pull request
PRODUCT.md         Fiche produit d’une page
```

Les scripts d’installation interactifs upstream retirés du projet source ne sont pas réintroduits. Les générateurs Brocoders restent disponibles, avec PostgreSQL comme choix par défaut :

```sh
pnpm --filter @starter/api generate:resource:relational --name Example
pnpm --filter @starter/api migration:generate src/database/migrations/AddExample
pnpm db:migrate
```

Les variantes MongoDB upstream restent du code de référence ; leur présence ne configure aucun service MongoDB.

## Vérifier

```sh
pnpm test:starter
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm expo:doctor
```

La CI exécute les tests d’initialisation, les contrôles des apps, le build, les migrations sur une base jetable, puis un smoke test de l’API et Swagger. `pnpm build` compile NestJS et exporte les bundles iOS/Android ; il ne compile pas les binaires natifs. Les e2e upstream demandent leurs propres fixtures/services et ne sont pas inclus dans `pnpm test`.

## Méthode de travail avec Claude Code

Inspirée des [bonnes pratiques Anthropic](https://code.claude.com/docs/en/best-practices) : chaque information vit à un seul endroit.

| Quoi | Où |
| --- | --- |
| Vision, cible, hors périmètre, lien maquette | `PRODUCT.md`, une page |
| US, bugs, priorités, kanban | GitHub Issues (+ un GitHub Project en vue Board si besoin) |
| Spec d’une fonctionnalité | Le corps de son issue, écrit après l’interview de Claude |
| Vérité durable | Code, tests, migrations, Swagger |

1. **Démarrer** : `/backlog` avec ton cahier des charges ou ta maquette. Claude rédige `PRODUCT.md`, propose les issues (fondations : modèle de données et API d’abord) et ne les crée qu’après ton accord. La source est ensuite gelée.
2. **Développer** : `/story 12`. Claude lit l’issue, t’interviewe, met l’issue à jour, propose un plan backend → API → écrans, puis code, teste et ouvre une PR `Closes #12` après accord.
3. **Changer d’avis** : on modifie l’issue avant le code ; une issue fermée ne se réécrit pas, on en ouvre une nouvelle qui la référence.

## IA et EAS

Aucun chat ni fournisseur IA n’est livré. Le skill `assistant-ui-native` indique les paquets à ajouter quand une issue en a besoin. Les clés serveur ne doivent jamais entrer dans `EXPO_PUBLIC_*`.

Pour EAS, lier votre propre projet depuis `apps/mobile` avec `eas init`, puis configurer vos secrets et profils. Aucun identifiant EAS tiers, signature de distribution ou projet Expo existant n’est lié. Les builds cloud, soumissions et OTA restent des actions distinctes.

[CLAUDE.md](CLAUDE.md) donne à Claude Code les commandes, conventions et pièges du projet.

Les sources, licences et adaptations sont documentées dans [THIRD_PARTY.md](THIRD_PARTY.md). Les documents, contenus et historique Git du produit Dhikr sont exclus.
