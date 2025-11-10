#!/bin/bash

# Database Backup Script for Horse Racing Platform
# This script creates a backup of the PostgreSQL database and uploads it to cloud storage

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/tmp/backups}"
BACKUP_FILE="horse_racing_backup_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Database configuration (from environment variables)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-horse_racing}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"

# Cloud storage configuration (optional)
S3_BUCKET="${S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-backups}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

log_info "Starting database backup..."
log_info "Database: ${DB_NAME}"
log_info "Timestamp: ${TIMESTAMP}"

# Set PostgreSQL password
export PGPASSWORD="${DB_PASSWORD}"

# Create backup
log_info "Creating backup file: ${BACKUP_FILE}"

if pg_dump -h "${DB_HOST}" \
           -p "${DB_PORT}" \
           -U "${DB_USER}" \
           -d "${DB_NAME}" \
           --format=custom \
           --compress=9 \
           --verbose \
           --file="${BACKUP_PATH}.tmp" 2>&1 | tee /tmp/backup.log; then
    
    # Compress the backup
    gzip -c "${BACKUP_PATH}.tmp" > "${BACKUP_PATH}"
    rm "${BACKUP_PATH}.tmp"
    
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
    log_info "Backup created successfully: ${BACKUP_PATH} (${BACKUP_SIZE})"
else
    log_error "Backup failed! Check /tmp/backup.log for details"
    exit 1
fi

# Verify backup integrity
log_info "Verifying backup integrity..."
if gzip -t "${BACKUP_PATH}"; then
    log_info "Backup integrity verified"
else
    log_error "Backup integrity check failed!"
    exit 1
fi

# Upload to S3 (if configured)
if [ -n "${S3_BUCKET}" ]; then
    log_info "Uploading backup to S3: s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}"
    
    if command -v aws &> /dev/null; then
        if aws s3 cp "${BACKUP_PATH}" "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}"; then
            log_info "Backup uploaded to S3 successfully"
        else
            log_error "Failed to upload backup to S3"
            exit 1
        fi
    else
        log_warn "AWS CLI not found. Skipping S3 upload."
    fi
fi

# Clean up old backups (local)
log_info "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "horse_racing_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
log_info "Old backups cleaned up"

# Clean up old backups (S3)
if [ -n "${S3_BUCKET}" ] && command -v aws &> /dev/null; then
    log_info "Cleaning up old S3 backups..."
    CUTOFF_DATE=$(date -d "${RETENTION_DAYS} days ago" +%Y-%m-%d)
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | while read -r line; do
        BACKUP_DATE=$(echo "$line" | awk '{print $1}')
        BACKUP_NAME=$(echo "$line" | awk '{print $4}')
        if [[ "$BACKUP_DATE" < "$CUTOFF_DATE" ]]; then
            log_info "Deleting old backup: ${BACKUP_NAME}"
            aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}"
        fi
    done
fi

# Send notification (optional)
if [ -n "${WEBHOOK_URL:-}" ]; then
    log_info "Sending notification..."
    curl -X POST "${WEBHOOK_URL}" \
         -H "Content-Type: application/json" \
         -d "{\"text\":\"Database backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})\"}" \
         || log_warn "Failed to send notification"
fi

log_info "Backup process completed successfully!"
log_info "Backup location: ${BACKUP_PATH}"

# Unset password
unset PGPASSWORD

exit 0
