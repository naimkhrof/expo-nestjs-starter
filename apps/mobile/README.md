# App mobile

Socle Obytes migré vers Expo SDK 58. Installation et commandes communes : [README du monorepo](../../README.md).

Depuis ce dossier : `pnpm dev`, `pnpm ios`, `pnpm android`, `pnpm typecheck`, `pnpm test`, `pnpm run doctor`.

Installer d'abord le development build avec `pnpm ios` ou `pnpm android`. MMKV/Nitro nécessite ce binaire natif ; `pnpm dev` lance ensuite Metro avec `--dev-client` et les raccourcis Expo. Depuis la racine, `pnpm dev:mobile` donne le même terminal ; `pnpm dev` lance les deux apps dans l'interface interactive de Turbo (sélectionner le mobile, puis `Entrée`, et `Ctrl+Z` pour rendre le focus à Turbo).

L’écran initial vérifie la connexion au backend configuré dans `.env`. Les composants Obytes réutilisables sont dans `src/components/ui` .

Les anciennes instructions du starter sont archivées dans [README.upstream.md](README.upstream.md). Utiliser les commandes du monorepo pour ce projet.
