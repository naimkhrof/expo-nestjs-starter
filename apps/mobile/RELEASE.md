# Sortir l'app — marche à suivre du porteur

Tout ce qui suit demande un compte, une clé ou une décision : rien n'est lancé par le dépôt. Les commandes se lancent depuis `apps/mobile`, dans l'ordre. `eas-cli` 18 ou plus (`eas --version`). Remplacer `<bundle-id>` par l'identifiant de `starter.config.json`.

Préparé dans le dépôt : `eas.json` (profils `development`, `simulator`, `preview` en distribution interne, `production` pour les stores), `app.config.ts` (identité, icône, EAS Update), `store/` (fiches, déclarations de données, mots-clés : à remplir).

## Avant de commencer

| À avoir | Pour quoi | Note |
|---|---|---|
| Compte Expo | `eas login`, builds, EAS Update | Gratuit |
| Apple Developer Program | Build et App Store | 99 $ par an ; le nom du vendeur est public |
| Google Play Console | Play Store | 25 $ une fois. Un compte personnel récent doit en général mener un test fermé avant la production : à lire dans la console |
| Page web de la politique de confidentialité | Exigée par les deux stores | À héberger avant la soumission |
| Adresse de contact publique, coordonnées pour la revue Apple | Fiches | Saisies dans les consoles, jamais dans le dépôt |
| Captures d'écran, image de présentation Play (1024 × 500) | Fiches | À produire pour chaque langue publiée |

À décider avant le premier build :

- **Identité** : nom, identifiant natif et schéma viennent de `starter.config.json` (`pnpm starter:init`). L'identifiant ne se change plus une fois l'app publiée.
- **Version** : c'est celle de `apps/mobile/package.json` que les stores affichent. Les numéros de build sont tenus par EAS (`appVersionSource: remote`, `autoIncrement` en production).
- **iPad** : `supportsTablet` vaut `true` dans `app.config.ts`, donc l'App Store demande des captures iPad 13 pouces. Le passer à `false` pour une sortie iPhone seule.
- **Langues** : chaque langue publiée a sa fiche et ses captures ; tout texte d'une langue RTL est relu par une personne qui la lit.

## 1. Lier le projet EAS

```bash
eas login
```

Demande le compte Expo.

```bash
eas init
```

Crée le projet et affiche son identifiant. La configuration est dynamique : `eas init` ne peut pas l'écrire. Coller l'identifiant dans `EAS_PROJECT_ID`, en haut de `app.config.ts`, puis commiter. Cet identifiant est public. Tant qu'il est vide, EAS Update est éteint.

## 2. Variables d'environnement EAS

Les `.env` locaux ne partent pas chez EAS : un build lit l'environnement EAS de son profil. Aucune clé serveur dans une variable `EXPO_PUBLIC_*` : elle serait lisible dans le binaire.

| Profil | Environnement EAS | `EXPO_PUBLIC_API_URL` |
|---|---|---|
| `development` | development | aucune : le code vient de Metro, qui lit `apps/mobile/.env` |
| `preview` | preview | API Railway `staging` (`.railway/README.md`) |
| `production` | production | API Railway `production` |

```bash
eas env:create --environment preview --name EXPO_PUBLIC_API_URL --value https://<api-staging> --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_API_URL --value https://api.example.com --visibility plaintext
eas env:list --environment production
```

Avant la sortie : couper le déploiement automatique de l'API `production` (Railway, service `api`, réglages, autodéploiement), puis la déployer à la main (« Deploy Latest Commit ») une fois la recette en staging validée.

## 3. Builds de production

```bash
eas build --profile production --platform ios
```

Demande l'identifiant Apple (et sa double authentification). EAS crée et garde le certificat de distribution et le profil, puis enregistre `<bundle-id>`.

```bash
eas build --profile production --platform android
```

EAS crée et garde la clé de signature Android. La sauvegarder hors dépôt : `eas credentials --platform android`, puis télécharger le keystore.

Build d'essai sur appareil avant cela, si voulu : `eas device:create` (enregistre un iPhone), puis `eas build --profile preview --platform all` (identifiant `<bundle-id>.preview`, canal `preview`).

## 4. TestFlight et fiche App Store

```bash
eas submit --profile production --platform ios
```

Demande l'identifiant Apple ou une clé d'API App Store Connect ; crée la fiche de l'app dans App Store Connect si elle n'existe pas ; envoie le build à TestFlight.

Puis, dans App Store Connect : fiche (titre, sous-titre, description, mots-clés, catégories), captures, App Privacy (déclarations de confidentialité : relever chaque donnée collectée dans `store/data-declarations.md`), classification, coordonnées de revue, essai sur appareil par TestFlight, envoi en revue.

## 5. Google Play

1. Dans la Play Console : créer l'app, puis déposer **à la main** le premier `.aab` (téléchargé depuis la page du build EAS) dans le test interne. L'API de Google refuse le premier envoi.
2. Créer un compte de service Google Cloud avec accès à la Play Console et télécharger sa clé JSON, **hors dépôt**. La confier à EAS : `eas credentials --platform android` → Google Service Account.
3. Envois suivants :

```bash
eas submit --profile production --platform android
```

Envoie au test interne, en brouillon (`track: internal`, `releaseStatus: draft`).

4. Dans la Play Console : fiche, Data safety (même relevé que App Privacy), classification IARC, public cible, captures, puis test fermé et production.

## 6. Après la sortie

**Code** (JavaScript) : EAS Update, sans repasser par les stores :

```bash
EXPO_PUBLIC_APP_ENV=production eas update --channel production --environment production --message "Correction"
```

Règle : une mise à jour n'atteint que les builds de la même version (`runtimeVersion`). Tout changement natif (dépendance, plugin, `app.config.ts`, icône) demande une nouvelle version dans `package.json`, un nouveau build et un passage par les stores. Essayer d'abord sur le canal `preview`.
