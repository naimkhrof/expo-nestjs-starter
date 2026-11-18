# syntax=docker/dockerfile:1
# Image de production de l'API. Contexte de build : la racine du monorepo.
#   docker build -f apps/api/Dockerfile -t starter-api .
# Variables et marche à suivre : apps/api/CLAUDE.md (« Mise en ligne (Railway) »).

FROM node:24-slim AS base
# pnpm à la version de `packageManager` (package.json racine), par corepack.
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/

FROM base AS build
RUN pnpm install --frozen-lockfile --filter "@starter/api..."
COPY apps/api apps/api
RUN pnpm --filter @starter/api build

FROM base AS runtime
ENV NODE_ENV=production
# Dépendances de production seulement ; aucun script d'installation n'est nécessaire à l'exécution.
RUN pnpm install --prod --frozen-lockfile --ignore-scripts --filter "@starter/api..."
COPY --from=build /repo/apps/api/dist apps/api/dist
# Le pilote de fichiers `local` crée ./files au démarrage : dossier éphémère.
RUN mkdir apps/api/files && chown node:node apps/api/files
USER node
WORKDIR /repo/apps/api
# Les migrations en attente passent avant le démarrage. Le port vient de PORT
# (posé par l'hébergeur), sinon d'APP_PORT.
CMD ["sh", "-c", "node node_modules/typeorm/cli.js --dataSource=dist/database/data-source.js migration:run && node dist/main"]
