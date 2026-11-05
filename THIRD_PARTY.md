# Sources et licences

Ce starter extrait le socle technique du projet Dhikr, révision locale `625566c`, avec les nettoyages de configuration non commités constatés le 2 novembre 2026. Aucun historique Git, document produit, secret local ou module métier Dhikr n’est inclus.

- Mobile : [Obytes React Native template](https://github.com/obytes/react-native-template-obytes), révision `fd9b358ed11913d2a49fd9ffa6582fe03ba130e7`, adapté à Expo SDK 58 / React 19.3 / React Native 0.88 dans le projet source. Licence et README upstream conservés dans `apps/mobile/`.
- API : [Brocoders NestJS boilerplate](https://github.com/brocoders/nestjs-boilerplate), révision `9620f159eefe38f47747d02ab162852367c5472c`. Licence et README upstream conservés dans `apps/api/`.
- Skills Claude Code adaptés au starter (périmètre, conventions du monorepo), licences upstream conservées dans leurs dossiers lorsqu’elles existent :
  - `expo-design-system`, `expo-router`, `expo-data-fetching`, `expo-animation`, `expo-dev-client` : [expo/skills](https://github.com/expo/skills) `8a0dc4fa57ae345923c357e1451cbcd8b6f2a7db` ;
  - `turborepo` : [vercel/turborepo](https://github.com/vercel/turborepo) `20a88e67579e46eddb9f91bd3845521735e4f24e` ;
  - `nestjs-best-practices` : [kadajett/agent-nestjs-skills](https://github.com/kadajett/agent-nestjs-skills) `3986e0cede33958e000f959031cbee0cd83c2941` ;
  - `assistant-ui-native` : [assistant-ui/skills](https://github.com/assistant-ui/skills) `b0609e66baff7e19f21053d5492464dcc22ec9c3` ;
  - `generate` : [brocoders/nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate) `9620f159eefe38f47747d02ab162852367c5472c`.
- Skills `story` et `backlog` : propres au starter.

Les packages installés conservent leurs licences respectives. Les identités, clés et projets EAS doivent appartenir à chaque application dérivée.
