# syntax=docker/dockerfile:1
# Tâche planifiée de sauvegarde, service `backup` de `.railway/railway.ts`.
# Contexte de build : la racine du dépôt. Client PostgreSQL à la version du serveur (17) et rclone.
FROM alpine:3.23
RUN apk add --no-cache postgresql17-client rclone \
  && adduser -D -H backup
COPY --chmod=755 .railway/backup/backup.sh /usr/local/bin/backup
USER backup
WORKDIR /tmp
CMD ["backup"]
