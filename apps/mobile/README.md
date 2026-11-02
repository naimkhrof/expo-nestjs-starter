# App mobile

Socle Obytes migré vers Expo SDK 58. Installation et commandes communes : [README du monorepo](../../README.md).

Depuis ce dossier : `pnpm dev`, `pnpm ios`, `pnpm android`, `pnpm typecheck`, `pnpm test`, `pnpm run doctor`.

L’écran initial vérifie la connexion au backend configuré dans `.env`. Les composants Obytes réutilisables sont dans `src/components/ui` ; le hook assistant-ui préparé est dans `src/lib/assistant/use-app-runtime.ts`. La conversation et son endpoint serveur restent à développer.

Les anciennes instructions du starter sont archivées dans [README.upstream.md](README.upstream.md). Utiliser les commandes du monorepo pour ce projet.
