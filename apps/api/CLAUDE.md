# Backend Brocoders

Pour créer une ressource persistée, une relation ou une propriété métier, utiliser le skill `generate` (`/generate`, source unique dans `.claude/skills/generate/` à la racine) avant de générer les fichiers. Ne pas en créer de copie dans cette app. Les templates Hygen (`.hygen/`) et leur configuration (`.hygen.js`) restent dans `apps/api`. Lancer les commandes depuis la racine avec `pnpm --filter @starter/api …` ; PostgreSQL sélectionne la variante `relational`.

Conserver les modules métier, modèles de domaine, repositories abstraits, implémentations de persistence et mappers de Brocoders. Les recommandations NestJS (`nestjs-best-practices`) complètent cette architecture ; elles ne la remplacent pas. Pour un endpoint sans nouvelle persistence, ne pas générer une entité inutile.

Les controllers HTTP restent dans cette app. Un exemple `POST(Request)` destiné à Next.js/Expo doit être traduit vers NestJS, avec les conventions de routage existantes et la validation adaptée.
