#!/bin/sh
# Sauvegarde de la base de production : un pg_dump envoyé dans un bucket S3 compatible.
# La règle d'expiration du bucket efface les anciennes : rien ne s'accumule.
# Restaurer : apps/api/CLAUDE.md (« Mise en ligne »).
set -eu

: "${DATABASE_URL:?DATABASE_URL manquant}"
: "${BACKUP_S3_ENDPOINT:?BACKUP_S3_ENDPOINT manquant}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET manquant}"
: "${BACKUP_S3_ACCESS_KEY_ID:?BACKUP_S3_ACCESS_KEY_ID manquant}"
: "${BACKUP_S3_SECRET_ACCESS_KEY:?BACKUP_S3_SECRET_ACCESS_KEY manquant}"
KEY="backups/postgres/dump-$(date -u +%Y%m%dT%H%M%SZ).dump"

export RCLONE_CONFIG_S3_TYPE=s3
export RCLONE_CONFIG_S3_PROVIDER=Other
export RCLONE_CONFIG_S3_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY_ID"
export RCLONE_CONFIG_S3_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY"
export RCLONE_CONFIG_S3_ENDPOINT="$BACKUP_S3_ENDPOINT"
# Une clé limitée aux objets n'a pas de droits sur le bucket lui-même.
export RCLONE_CONFIG_S3_NO_CHECK_BUCKET=true

dump=$(mktemp)
trap 'rm -f "$dump"' EXIT

# Sur disque d'abord : un dump interrompu n'est jamais envoyé.
pg_dump --format=custom --no-owner --no-acl --dbname="$DATABASE_URL" --file="$dump"
# Le fichier se relit : sa table des matières est complète.
pg_restore --list "$dump" > /dev/null

rclone copyto --s3-no-check-bucket "$dump" "s3:$BACKUP_S3_BUCKET/$KEY"
echo "Sauvegarde envoyée : $BACKUP_S3_BUCKET/$KEY ($(wc -c < "$dump") octets)"
