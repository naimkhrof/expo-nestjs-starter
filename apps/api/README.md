# API

Socle Brocoders / NestJS 11, configuré pour PostgreSQL sur l’hôte local. Installation et commandes communes : [README du monorepo](../../README.md).

Depuis ce dossier : `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm migration:run`, `pnpm seed`.

Configuration dans `.env`, Swagger sur `/docs`, routes REST versionnées sous `/api/v1`. Le Docker Compose de développement est à la racine du monorepo.

Les anciennes instructions du boilerplate sont archivées dans [README.upstream.md](README.upstream.md). Les scripts d’infrastructure Docker upstream ne sont pas utilisés dans ce workspace.
