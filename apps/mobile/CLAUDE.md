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
- Tester iOS **et** Android, et chaque langue, dès le premier écran.

## Langues et RTL

- Les textes sont dans `src/translations/<langue>.json`, mêmes clés partout (`translations.test.ts`).
- La langue est lue une fois, au lancement : `I18nManager.forceRTL` ne vaut qu'au lancement suivant, `setLanguage` relance donc l'app.
- Avec une langue RTL, React Native retourne lui-même marges et rangées : ne retourner à la main que les icônes directionnelles.
- Arabe : six formes de pluriel (`zero`, `one`, `two`, `few`, `many`, `other`).
