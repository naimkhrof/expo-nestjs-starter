# Mobile Obytes / Expo

Les guides applicables sont répertoriés dans le `AGENTS.md` racine. Étendre le socle présent : `src/global.css` pour les tokens Uniwind/Tailwind, `src/components/ui` pour les primitives, `src/app` pour les routes Expo Router.

MMKV/Nitro nécessitent un development build. Ne pas imposer Expo Go avant un build local. Le backend est NestJS dans `../api` ; ne pas créer un serveur concurrent dans les routes Expo.

Pour assistant-ui, reprendre le hook de runtime existant et les packages natifs. Un exemple upstream peut cibler une autre version ou le web : vérifier les exports installés et conserver le wrapper Metro Uniwind.
