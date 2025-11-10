#!/bin/bash

# Database Restore Script for Horse Racing Platform
# This script restores a PostgreSQL database from a backup file

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
BACKUP_FILE="${1:-}"
BACKUP_DIR="${BACKUP_DIR:-/tmp/backups}"

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

# Check if backup file is provided
if [ -z "${BACKUP_FILE}" ]; then
    log_error "Usage: $0 <backup_file>"
    log_error "Example: $0 horse_racing_backup_20240101_120000.sql.gz"
    log_error ""
    log_info "Available backups:"
    ls -lh "${BACKUP_DIR}"/horse_racing_backup_*.sql.gz 2>/dev/null || log_warn "No local backups found"
    
    if [ -n "${S3_BUCKET}" ] && command -v aws &> /dev/null; then
        log_info "S3 backups:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" || log_warn "No S3 backups found"
    fi
    exit 1
fi

# Determine backup path
if [ -f "${BACKUP_FILE}" ]; then
    BACKUP_PATH="${BACKUP_FILE}"
elif [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
else
    # Try to download from S3
    if [ -n "${S3_BUCKET}" ] && command -v aws &> /dev/null; then
        log_info "Backup not found locally. Downloading from S3..."
        BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
        if aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}" "${BACKUP_PATH}"; then
            log_info "Backup downloaded from S3"
        else
            log_error "Failed to download backup from S3"
            exit 1
        fi
    else
        log_error "Backup file not found: ${BACKUP_FILE}"
        exit 1
    fi
fi

log_info "Starting database restore..."
log_info "Database: ${DB_NAME}"
log_info "Backup file: ${BACKUP_PATH}"

# Verify backup file exists and is readable
if [ ! -f "${BACKUP_PATH}" ]; then
    log_error "Backup file not found: ${BACKUP_PATH}"
    exit 1
fi

if [ ! -r "${BACKUP_PATH}" ]; then
    log_error "Backup file not readable: ${BACKUP_PATH}"
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

# Confirm restore operation
log_warn "WARNING: This will overwrite the current database!"
log_warn "Database: ${DB_NAME} on ${DB_HOST}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    log_info "Restore cancelled"
    exit 0
fi

# Set PostgreSQL password
export PGPASSWORD="${DB_PASSWORD}"

# Create a backup of current database before restore
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PRE_RESTORE_BACKUP="${BACKUP_DIR}/pre_restore_backup_${TIMESTAMP}.sql.gz"

log_info "Creating pre-restore backup: ${PRE_RESTORE_BACKUP}"
if pg_dump -h "${DB_HOST}" \
           -p "${DB_PORT}" \
           -U "${DB_USER}" \
           -d "${DB_NAME}" \
           --format=custom \
           --compress=9 \
           | gzip > "${PRE_RESTORE_BACKUP}"; then
    log_info "Pre-restore backup created successfully"
else
    log_warn "Failed to create pre-restore backup. Continuing anyway..."
fi

# Terminate existing connections to the database
log_info "Terminating existing database connections..."
psql -h "${DB_HOST}" \
     -p "${DB_PORT}" \
     -U "${DB_USER}" \
     -d postgres \
     -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" \
     || log_warn "Failed to terminate connections"

# Drop and recreate database
log_info "Dropping and recreating database..."
psql -h "${DB_HOST}" \
     -p "${DB_PORT}" \
     -U "${DB_USER}" \
     -d postgres \
     -c "DROP DATABASE IF EXISTS ${DB_NAME};" \
     || { log_error "Failed to drop database"; exit 1; }

psql -h "${DB_HOST}" \
     -p "${DB_PORT}" \
     -U "${DB_USER}" \
     -d postgres \
     -c "CREATE DATABASE ${DB_NAME};" \
     || { log_error "Failed to create database"; exit 1; }

# Enable required extensions
log_info "Enabling required extensions..."
psql -h "${DB_HOST}" \
     -p "${DB_PORT}" \
     -U "${DB_USER}" \
     -d "${DB_NAME}" \
     -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;" \
     || log_warn "Failed to enable TimescaleDB extension"

psql -h "${DB_HOST}" \
     -p "${DB_PORT}" \
     -U "${DB_USER}" \
     -d "${DB_NAME}" \
     -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" \
     || log_warn "Failed to enable pgcrypto extension"

# Restore database
log_info "Restoring database from backup..."
if gunzip -c "${BACKUP_PATH}" | pg_restore -h "${DB_HOST}" \
                                            -p "${DB_PORT}" \
                                            -U "${DB_USER}" \
                                            -d "${DB_NAME}" \
                                            --verbose \
                                            --no-owner \
                                            --no-acl 2>&1 | tee /tmp/restore.log; then
    log_info "Database restored successfully"
else
    log_error "Database restore failed! Check /tmp/restore.log for details"
    log_error "You can restore from pre-restore backup: ${PRE_RESTORE_BACKUP}"
    exit 1
fi

# Verify restore
log_info "Verifying restore..."
TABLE_COUNT=$(psql -h "${DB_HOST}" \
                   -p "${DB_PORT}" \
                   -U "${DB_USER}" \
                   -d "${DB_NAME}" \
                   -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

log_info "Tables restored: ${TABLE_COUNT}"

if [ "${TABLE_COUNT}" -gt 0 ]; then
    log_info "Restore verification successful"
else
    log_error "Restore verification failed! No tables found."
    exit 1
fi

# Run migrations to ensure schema is up to date
log_info "Running migrations to ensure schema is up to date..."
if command -v npm &> /dev/null; then
    npm run migrate:latest || log_warn "Failed to run migrations"
else
    log_warn "npm not found. Skipping migrations."
fi

# Send notification (optional)
if [ -n "${WEBHOOK_URL:-}" ]; then
    log_info "Sending notification..."
    curl -X POST "${WEBHOOK_URL}" \
         -H "Content-Type: application/json" \
         -d "{\"text\":\"Database restored from: ${BACKUP_FILE}\"}" \
         || log_warn "Failed to send notification"
fi

log_info "Restore process completed successfully!"
log_info "Pre-restore backup saved at: ${PRE_RESTORE_BACKUP}"

# Unset password
unset PGPASSWORD

exit 0
