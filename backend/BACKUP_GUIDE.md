# Database Backup and Recovery Guide

This guide covers database backup strategies, automation, and recovery procedures for the horse racing platform.

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Manual Backups](#manual-backups)
4. [Automated Backups](#automated-backups)
5. [Backup Storage](#backup-storage)
6. [Restore Procedures](#restore-procedures)
7. [Testing Backups](#testing-backups)
8. [Monitoring](#monitoring)
9. [Disaster Recovery](#disaster-recovery)
10. [Best Practices](#best-practices)

---

## Overview

The platform uses PostgreSQL with TimescaleDB for data storage. A comprehensive backup strategy ensures data protection and business continuity.

**Backup Components:**

- PostgreSQL database (all tables)
- TimescaleDB hypertables (odds_snapshots)
- Database schema and extensions
- User data and configurations

**Backup Types:**

- **Full Backups**: Complete database dump
- **Incremental Backups**: Changes since last backup (via WAL archiving)
- **Point-in-Time Recovery**: Restore to specific timestamp

---

## Backup Strategy

### Backup Schedule

**Production:**

- **Full Backup**: Daily at 2:00 AM UTC
- **Incremental**: Every 6 hours
- **Retention**: 30 days for daily, 7 days for incremental

**Staging:**

- **Full Backup**: Daily at 3:00 AM UTC
- **Retention**: 7 days

**Development:**

- **Full Backup**: Weekly
- **Retention**: 3 backups

### Retention Policy

| Backup Type  | Frequency | Retention | Storage        |
| ------------ | --------- | --------- | -------------- |
| Daily Full   | Daily     | 30 days   | S3 Standard    |
| Weekly Full  | Weekly    | 90 days   | S3 Standard-IA |
| Monthly Full | Monthly   | 1 year    | S3 Glacier     |
| Incremental  | 6 hours   | 7 days    | S3 Standard    |

### Storage Locations

**Primary:** AWS S3 / Cloudflare R2
**Secondary:** Railway/Render built-in backups
**Tertiary:** Local backups (last 7 days)

---

## Manual Backups

### Using Backup Script

The platform includes a backup script at `backend/scripts/backup-database.sh`.

#### Basic Usage

```bash
cd backend

# Set environment variables
export DB_HOST=your-db-host
export DB_PORT=5432
export DB_NAME=horse_racing
export DB_USER=postgres
export DB_PASSWORD=your-password
export BACKUP_DIR=/tmp/backups

# Run backup
./scripts/backup-database.sh
```

#### With S3 Upload

```bash
# Additional S3 configuration
export S3_BUCKET=your-backup-bucket
export S3_PREFIX=backups/production
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=ap-southeast-2

# Run backup with S3 upload
./scripts/backup-database.sh
```

#### Output

```
[INFO] Starting database backup...
[INFO] Database: horse_racing
[INFO] Timestamp: 20240101_120000
[INFO] Creating backup file: horse_racing_backup_20240101_120000.sql.gz
[INFO] Backup created successfully: /tmp/backups/horse_racing_backup_20240101_120000.sql.gz (125M)
[INFO] Verifying backup integrity...
[INFO] Backup integrity verified
[INFO] Uploading backup to S3: s3://your-bucket/backups/horse_racing_backup_20240101_120000.sql.gz
[INFO] Backup uploaded to S3 successfully
[INFO] Cleaning up old backups (older than 7 days)...
[INFO] Backup process completed successfully!
```

### Using pg_dump Directly

```bash
# Full database backup
pg_dump -h localhost \
        -p 5432 \
        -U postgres \
        -d horse_racing \
        --format=custom \
        --compress=9 \
        --file=backup.dump

# Compressed SQL backup
pg_dump -h localhost \
        -p 5432 \
        -U postgres \
        -d horse_racing \
        | gzip > backup.sql.gz

# Schema only
pg_dump -h localhost \
        -p 5432 \
        -U postgres \
        -d horse_racing \
        --schema-only \
        --file=schema.sql

# Data only
pg_dump -h localhost \
        -p 5432 \
        -U postgres \
        -d horse_racing \
        --data-only \
        --file=data.sql

# Specific tables
pg_dump -h localhost \
        -p 5432 \
        -U postgres \
        -d horse_racing \
        --table=races \
        --table=horses \
        --file=tables.dump
```

### Railway Backups

```bash
# Create manual backup
railway backup create

# List backups
railway backup list

# Download backup
railway backup download <backup-id>
```

### Render Backups

Render provides automatic daily backups:

1. Go to your database in Render Dashboard
2. Navigate to "Backups" tab
3. Click "Create Manual Backup"
4. Download backup file

---

## Automated Backups

### Cron Job Setup

#### On Linux Server

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backend/scripts/backup-database.sh >> /var/log/backup.log 2>&1

# Add incremental backup every 6 hours
0 */6 * * * /path/to/backend/scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

#### Environment Variables for Cron

Create `/etc/cron.d/database-backup`:

```bash
# Database Backup Cron Job
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=horse_racing
DB_USER=postgres
DB_PASSWORD=your-password
BACKUP_DIR=/var/backups/database
S3_BUCKET=your-backup-bucket
S3_PREFIX=backups/production
RETENTION_DAYS=30

# Daily full backup at 2 AM UTC
0 2 * * * root /path/to/backend/scripts/backup-database.sh >> /var/log/backup.log 2>&1

# Incremental backup every 6 hours
0 */6 * * * root /path/to/backend/scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

### GitHub Actions

Create `.github/workflows/backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    # Daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Install PostgreSQL client
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-2

      - name: Run backup
        env:
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_PORT: ${{ secrets.DB_PORT }}
          DB_NAME: ${{ secrets.DB_NAME }}
          DB_USER: ${{ secrets.DB_USER }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          S3_BUCKET: ${{ secrets.S3_BUCKET }}
          S3_PREFIX: backups/production
          RETENTION_DAYS: 30
        run: |
          chmod +x backend/scripts/backup-database.sh
          ./backend/scripts/backup-database.sh

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Database backup failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Railway Scheduled Backups

Railway provides automatic daily backups. To configure:

1. Go to your database service in Railway
2. Backups are automatic (no configuration needed)
3. Retention: 7 days on Starter plan, 30 days on Pro

### Render Scheduled Backups

Render provides automatic daily backups:

1. Automatic daily backups (no configuration needed)
2. Retention: 7 days on Starter plan, 30 days on Standard
3. Point-in-time recovery available on higher plans

---

## Backup Storage

### AWS S3 Configuration

#### Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://horse-racing-backups --region ap-southeast-2

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket horse-racing-backups \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket horse-racing-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

#### Lifecycle Policy

Create lifecycle policy to automatically transition old backups:

```json
{
  "Rules": [
    {
      "Id": "TransitionOldBackups",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

Apply policy:

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket horse-racing-backups \
  --lifecycle-configuration file://lifecycle.json
```

### Cloudflare R2 Configuration

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create R2 bucket
wrangler r2 bucket create horse-racing-backups

# Upload backup
wrangler r2 object put horse-racing-backups/backup.sql.gz --file=backup.sql.gz
```

### Local Storage

```bash
# Create backup directory
sudo mkdir -p /var/backups/database
sudo chown $USER:$USER /var/backups/database

# Set permissions
chmod 700 /var/backups/database
```

---

## Restore Procedures

### Using Restore Script

The platform includes a restore script at `backend/scripts/restore-database.sh`.

#### Basic Usage

```bash
cd backend

# Set environment variables
export DB_HOST=your-db-host
export DB_PORT=5432
export DB_NAME=horse_racing
export DB_USER=postgres
export DB_PASSWORD=your-password
export BACKUP_DIR=/tmp/backups

# List available backups
ls -lh /tmp/backups/

# Restore from backup
./scripts/restore-database.sh horse_racing_backup_20240101_120000.sql.gz
```

#### Restore from S3

```bash
# Configure S3
export S3_BUCKET=your-backup-bucket
export S3_PREFIX=backups/production
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key

# Script will automatically download from S3 if not found locally
./scripts/restore-database.sh horse_racing_backup_20240101_120000.sql.gz
```

#### Interactive Restore

The script will:

1. Verify backup integrity
2. Create pre-restore backup
3. Ask for confirmation
4. Terminate existing connections
5. Drop and recreate database
6. Restore from backup
7. Run migrations
8. Verify restore

```
[INFO] Starting database restore...
[INFO] Database: horse_racing
[INFO] Backup file: /tmp/backups/horse_racing_backup_20240101_120000.sql.gz
[INFO] Verifying backup integrity...
[INFO] Backup integrity verified
[WARN] WARNING: This will overwrite the current database!
[WARN] Database: horse_racing on your-db-host
Are you sure you want to continue? (yes/no): yes
[INFO] Creating pre-restore backup: /tmp/backups/pre_restore_backup_20240101_123000.sql.gz
[INFO] Pre-restore backup created successfully
[INFO] Terminating existing database connections...
[INFO] Dropping and recreating database...
[INFO] Enabling required extensions...
[INFO] Restoring database from backup...
[INFO] Database restored successfully
[INFO] Verifying restore...
[INFO] Tables restored: 25
[INFO] Restore verification successful
[INFO] Running migrations to ensure schema is up to date...
[INFO] Restore process completed successfully!
```

### Using pg_restore Directly

```bash
# Restore from custom format
pg_restore -h localhost \
           -p 5432 \
           -U postgres \
           -d horse_racing \
           --clean \
           --if-exists \
           backup.dump

# Restore from compressed SQL
gunzip -c backup.sql.gz | psql -h localhost \
                                -p 5432 \
                                -U postgres \
                                -d horse_racing

# Restore specific tables
pg_restore -h localhost \
           -p 5432 \
           -U postgres \
           -d horse_racing \
           --table=races \
           --table=horses \
           backup.dump
```

### Railway Restore

```bash
# List backups
railway backup list

# Restore from backup
railway backup restore <backup-id>
```

### Render Restore

1. Go to your database in Render Dashboard
2. Navigate to "Backups" tab
3. Find the backup you want to restore
4. Click "Restore" button
5. Confirm restoration

---

## Testing Backups

### Regular Backup Testing

Test backups monthly to ensure they can be restored successfully.

#### Test Restore Procedure

```bash
# 1. Create test database
psql -h localhost -U postgres -c "CREATE DATABASE horse_racing_test;"

# 2. Restore to test database
export DB_NAME=horse_racing_test
./scripts/restore-database.sh horse_racing_backup_20240101_120000.sql.gz

# 3. Verify data
psql -h localhost -U postgres -d horse_racing_test -c "SELECT COUNT(*) FROM races;"
psql -h localhost -U postgres -d horse_racing_test -c "SELECT COUNT(*) FROM users;"

# 4. Clean up
psql -h localhost -U postgres -c "DROP DATABASE horse_racing_test;"
```

#### Automated Backup Testing

Create `.github/workflows/test-backup.yml`:

```yaml
name: Test Backup Restore

on:
  schedule:
    # Monthly on the 1st at 3 AM UTC
    - cron: '0 3 1 * *'
  workflow_dispatch:

jobs:
  test-restore:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: timescale/timescaledb:latest-pg15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Download latest backup from S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 cp s3://horse-racing-backups/backups/production/ . --recursive --exclude "*" --include "horse_racing_backup_*.sql.gz" | tail -1

      - name: Restore backup
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: horse_racing_test
          DB_USER: postgres
          DB_PASSWORD: postgres
        run: |
          # Create test database
          psql -h localhost -U postgres -c "CREATE DATABASE horse_racing_test;"

          # Restore backup
          chmod +x backend/scripts/restore-database.sh
          echo "yes" | ./backend/scripts/restore-database.sh horse_racing_backup_*.sql.gz

      - name: Verify restore
        run: |
          # Check table counts
          psql -h localhost -U postgres -d horse_racing_test -c "SELECT COUNT(*) FROM races;"
          psql -h localhost -U postgres -d horse_racing_test -c "SELECT COUNT(*) FROM users;"

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Backup restore test failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Monitoring

### Backup Monitoring

Monitor backup success/failure and send alerts.

#### Monitoring Script

Create `backend/scripts/monitor-backups.sh`:

```bash
#!/bin/bash

# Check if backup was created today
BACKUP_DIR="/var/backups/database"
TODAY=$(date +"%Y%m%d")
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "horse_racing_backup_${TODAY}_*.sql.gz" | wc -l)

if [ "${BACKUP_COUNT}" -eq 0 ]; then
    echo "ERROR: No backup found for today!"
    # Send alert
    curl -X POST "${WEBHOOK_URL}" \
         -H "Content-Type: application/json" \
         -d '{"text":"⚠️ Database backup missing for today!"}'
    exit 1
else
    echo "OK: Backup found for today (${BACKUP_COUNT} backups)"
    exit 0
fi
```

#### Prometheus Metrics

Expose backup metrics:

```typescript
// backend/src/services/backup-metrics.service.ts
import { register, Gauge } from 'prom-client';

const backupAgeGauge = new Gauge({
  name: 'database_backup_age_seconds',
  help: 'Age of the latest database backup in seconds',
});

const backupSizeGauge = new Gauge({
  name: 'database_backup_size_bytes',
  help: 'Size of the latest database backup in bytes',
});

export async function updateBackupMetrics() {
  // Get latest backup info
  const latestBackup = await getLatestBackup();

  if (latestBackup) {
    const age = Date.now() - latestBackup.timestamp;
    backupAgeGauge.set(age / 1000);
    backupSizeGauge.set(latestBackup.size);
  }
}
```

#### Grafana Dashboard

Create alerts in Grafana:

```yaml
# Alert: Backup too old
- alert: BackupTooOld
  expr: database_backup_age_seconds > 86400 # 24 hours
  for: 1h
  labels:
    severity: critical
  annotations:
    summary: 'Database backup is too old'
    description: 'Latest backup is {{ $value }} seconds old'

# Alert: Backup size anomaly
- alert: BackupSizeAnomaly
  expr: abs(database_backup_size_bytes - database_backup_size_bytes offset 1d) / database_backup_size_bytes > 0.5
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: 'Database backup size changed significantly'
    description: 'Backup size changed by {{ $value }}%'
```

---

## Disaster Recovery

### Recovery Time Objective (RTO)

**Target RTO:** 1 hour

- Time to restore database from backup

### Recovery Point Objective (RPO)

**Target RPO:** 6 hours

- Maximum acceptable data loss

### Disaster Recovery Plan

#### Scenario 1: Database Corruption

1. Stop application servers
2. Identify last good backup
3. Restore from backup
4. Verify data integrity
5. Run migrations
6. Restart application servers
7. Monitor for issues

#### Scenario 2: Complete Data Loss

1. Provision new database server
2. Download latest backup from S3
3. Restore database
4. Update application configuration
5. Run migrations
6. Verify functionality
7. Update DNS/load balancer
8. Monitor closely

#### Scenario 3: Partial Data Loss

1. Identify affected tables/data
2. Restore to temporary database
3. Export affected data
4. Import into production database
5. Verify data consistency
6. Monitor for issues

### Disaster Recovery Testing

Test disaster recovery procedures quarterly:

```bash
# 1. Simulate disaster (on test environment)
psql -h test-db -U postgres -c "DROP DATABASE horse_racing;"

# 2. Execute recovery plan
# ... follow disaster recovery steps ...

# 3. Verify recovery
# ... run verification tests ...

# 4. Document results and improvements
```

---

## Best Practices

### Backup Best Practices

1. **3-2-1 Rule**: 3 copies, 2 different media, 1 offsite
2. **Test Regularly**: Monthly restore tests
3. **Automate**: Use cron jobs or CI/CD
4. **Monitor**: Alert on backup failures
5. **Encrypt**: Encrypt backups at rest and in transit
6. **Document**: Keep recovery procedures updated
7. **Retention**: Balance cost and compliance requirements
8. **Verify**: Check backup integrity after creation

### Security Best Practices

1. **Encrypt Backups**: Use AES-256 encryption
2. **Access Control**: Limit who can access backups
3. **Audit Logs**: Track backup access and restores
4. **Secure Storage**: Use private S3 buckets
5. **Rotate Credentials**: Regularly rotate backup credentials

### Performance Best Practices

1. **Off-Peak Backups**: Schedule during low traffic
2. **Compression**: Use gzip compression (level 9)
3. **Parallel Backups**: Use pg_dump parallel option
4. **Incremental Backups**: Use WAL archiving for large databases
5. **Network Optimization**: Use fast network for transfers

---

## Troubleshooting

### Backup Failures

**Issue:** Backup script fails with "permission denied"

**Solution:**

```bash
# Check file permissions
ls -l backend/scripts/backup-database.sh

# Make executable
chmod +x backend/scripts/backup-database.sh
```

**Issue:** Out of disk space

**Solution:**

```bash
# Check disk space
df -h

# Clean up old backups
find /var/backups/database -name "*.sql.gz" -mtime +7 -delete

# Increase retention cleanup frequency
```

**Issue:** S3 upload fails

**Solution:**

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check S3 bucket permissions
aws s3 ls s3://your-bucket/

# Test upload manually
aws s3 cp test.txt s3://your-bucket/test.txt
```

### Restore Failures

**Issue:** Restore fails with "database already exists"

**Solution:**

```bash
# Drop database first
psql -h localhost -U postgres -c "DROP DATABASE horse_racing;"

# Then restore
./scripts/restore-database.sh backup.sql.gz
```

**Issue:** Extension errors during restore

**Solution:**

```bash
# Enable extensions before restore
psql -h localhost -U postgres -d horse_racing -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
```

**Issue:** Permission errors during restore

**Solution:**

```bash
# Use --no-owner and --no-acl flags
pg_restore --no-owner --no-acl -d horse_racing backup.dump
```

---

## Checklist

### Daily Backup Checklist

- [ ] Automated backup completed successfully
- [ ] Backup uploaded to S3
- [ ] Backup size is reasonable
- [ ] No errors in backup logs
- [ ] Old backups cleaned up

### Monthly Backup Checklist

- [ ] Test restore from latest backup
- [ ] Verify data integrity
- [ ] Review backup retention policy
- [ ] Check storage costs
- [ ] Update documentation if needed
- [ ] Review disaster recovery plan

### Quarterly Backup Checklist

- [ ] Full disaster recovery test
- [ ] Review and update RTO/RPO
- [ ] Audit backup access logs
- [ ] Review backup security
- [ ] Update backup procedures
- [ ] Train team on recovery procedures

---

This completes the database backup and recovery guide. Follow these procedures to ensure data protection and business continuity for the horse racing platform.
