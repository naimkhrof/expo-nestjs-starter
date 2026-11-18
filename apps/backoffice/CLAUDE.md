# Back-office (Expo web)

Expo web seul (`platforms: ["web"]`, une seule page), Expo Router, Uniwind, TanStack Query et Axios. Dev : `pnpm dev:backoffice`, port 8090 ; l'API doit autoriser cette origine par `APP_CORS_ORIGINS`.

- Accès par e-mail et mot de passe d'un compte `admin` de l'API (`/auth/email/login`) ; la session (JWT et refresh de Brocoders) est gardée dans `localStorage` (`src/lib/session.ts`). Un compte non admin est refusé.
- Tokens : `src/global.css` importe `packages/ui/src/tokens.css`, seule source. Primitives : `@starter/ui` (`packages/ui`) ; n'y extraire du mobile que ce que le back-office utilise.
- Français seul : tous les textes dans `src/texts.ts`.
- Une seule variable, publique : `EXPO_PUBLIC_API_URL`. Les routes appartiennent à NestJS, jamais aux routes Expo.
- Vérifier : `pnpm --filter @starter/backoffice typecheck lint test build`.
