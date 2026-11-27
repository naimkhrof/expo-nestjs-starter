# App mobile (Expo, Expo Router, Uniwind)

## Socle

- **Où mettre quoi** :
  - tokens : `packages/ui/src/tokens.css` (importé par `src/global.css`) ;
  - primitives : `src/components/ui` et `@starter/ui` ;
  - routes : `src/app` ;
  - métier : `src/features/*`.
- Le wrapper Metro Uniwind (`withUniwindConfig`) reste le plus à l'extérieur.
- Le backend est `../api` : pas de serveur dans les routes Expo. Client Axios et TanStack Query dans `src/lib/api` ; réglages et jeton dans MMKV (`src/lib/storage.tsx`).
- Identité (nom, schéma, identifiant natif) : `starter.config.json` ; sortie : `RELEASE.md`, fiches dans `store/`.

## Build et simulateur

- **iOS** : préfixer `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`. Après un changement de plugin ou d'asset natif : `expo prebuild -p <plateforme> --no-install`. `ios/` et `android/` sont générés et ignorés.
- **Metro** : jamais `CI=1` pour une vérification au simulateur (pas de rechargement). Lancer `expo start --dev-client < /dev/null`, puis ouvrir par deep link `<scheme>.development://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081`.
- `.expo/types/router.d.ts` périmé après la suppression d'une route : le supprimer.
- MMKV et Nitro : development build obligatoire, pas d'Expo Go.

Langues et RTL : règle à portée `.claude/rules/translations.md`.
