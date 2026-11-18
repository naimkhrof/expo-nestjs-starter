# syntax=docker/dockerfile:1
# Tâche planifiée de sauvegarde, service `backup` de `.railway/railway.ts`.
# Contexte de build : la racine du dépôt. Client PostgreSQL à la version majeure du serveur (Railway crée des bases 18 ; pg_dump refuse un serveur plus récent que lui) et rclone.
FROM alpine:3.23
RUN apk add --no-cache postgresql18-client rclone \
  && adduser -D -H backup
COPY --chmod=755 .railway/backup/backup.sh /usr/local/bin/backup
USER backup
WORKDIR /tmp
CMD ["backup"]
