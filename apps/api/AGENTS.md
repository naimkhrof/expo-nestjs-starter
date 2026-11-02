# Backend Brocoders

Pour créer une ressource persistée, une relation ou une propriété métier, lire `../../.agents/skills/generate/SKILL.md` avant de générer les fichiers. Ce guide restaure celui du boilerplate, avec les commandes pnpm du monorepo et le choix PostgreSQL/`relational`.

Conserver les modules métier, modèles de domaine, repositories abstraits, implémentations de persistence et mappers de Brocoders. Les recommandations NestJS complètent cette architecture ; elles ne la remplacent pas. Pour un endpoint sans nouvelle persistence, ne pas générer une entité inutile.

Les controllers HTTP restent dans cette app. Un exemple `POST(Request)` destiné à Next.js/Expo doit être traduit vers NestJS, avec les conventions de routage existantes et la validation adaptée.
