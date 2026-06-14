#!/bin/bash

# Database backup script
# Usage: ./scripts/backup.sh
# Schedule with cron: 0 3 * * * /path/to/backend/scripts/backup.sh

set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"

if [ -z "$DATABASE_URL" ]; then
  if [ -f .env ]; then
    export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
  fi
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Starting backup: $BACKUP_FILE"
pg_dump "$DATABASE_URL" --no-owner --no-acl | gzip > "$BACKUP_FILE"

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup complete: $BACKUP_FILE ($SIZE)"

# Delete backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "Cleaned backups older than $KEEP_DAYS days"
