# Database Backup Scripts

This directory contains scripts for backing up and restoring the PostgreSQL database.

## Scripts

### backup-database.sh

Creates a compressed backup of the PostgreSQL database and optionally uploads it to S3.

**Features:**

- Creates compressed backup using pg_dump
- Verifies backup integrity
- Uploads to S3 (optional)
- Cleans up old backups based on retention policy
- Sends notifications (optional)

**Usage:**

```bash
# Basic backup
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=horse_racing
export DB_USER=postgres
export DB_PASSWORD=your_password
export BACKUP_DIR=/tmp/backups

./backup-database.sh
```

**With S3 upload:**

```bash
export S3_BUCKET=your-backup-bucket
export S3_PREFIX=backups/production
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key

./backup-database.sh
```

**Environment Variables:**

| Variable         | Required | Default        | Description               |
| ---------------- | -------- | -------------- | ------------------------- |
| `DB_HOST`        | Yes      | `localhost`    | Database host             |
| `DB_PORT`        | No       | `5432`         | Database port             |
| `DB_NAME`        | Yes      | `horse_racing` | Database name             |
| `DB_USER`        | Yes      | `postgres`     | Database user             |
| `DB_PASSWORD`    | Yes      | -              | Database password         |
| `BACKUP_DIR`     | No       | `/tmp/backups` | Backup directory          |
| `RETENTION_DAYS` | No       | `7`            | Days to keep backups      |
| `S3_BUCKET`      | No       | -              | S3 bucket for uploads     |
| `S3_PREFIX`      | No       | `backups`      | S3 prefix/folder          |
| `WEBHOOK_URL`    | No       | -              | Webhook for notifications |

### restore-database.sh

Restores a PostgreSQL database from a backup file.

**Features:**

- Verifies backup integrity before restore
- Creates pre-restore backup
- Interactive confirmation
- Terminates existing connections
- Drops and recreates database
- Enables required extensions
- Runs migrations after restore
- Verifies restore success

**Usage:**

```bash
# Restore from local backup
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=horse_racing
export DB_USER=postgres
export DB_PASSWORD=your_password
export BACKUP_DIR=/tmp/backups

./restore-database.sh horse_racing_backup_20240101_120000.sql.gz
```

**Restore from S3:**

```bash
export S3_BUCKET=your-backup-bucket
export S3_PREFIX=backups/production

# Script will automatically download from S3 if not found locally
./restore-database.sh horse_racing_backup_20240101_120000.sql.gz
```

**Environment Variables:**

| Variable      | Required | Default        | Description             |
| ------------- | -------- | -------------- | ----------------------- |
| `DB_HOST`     | Yes      | `localhost`    | Database host           |
| `DB_PORT`     | No       | `5432`         | Database port           |
| `DB_NAME`     | Yes      | `horse_racing` | Database name           |
| `DB_USER`     | Yes      | `postgres`     | Database user           |
| `DB_PASSWORD` | Yes      | -              | Database password       |
| `BACKUP_DIR`  | No       | `/tmp/backups` | Backup directory        |
| `S3_BUCKET`   | No       | -              | S3 bucket for downloads |
| `S3_PREFIX`   | No       | `backups`      | S3 prefix/folder        |

## Quick Start

### 1. Local Backup and Restore Test

```bash
# Start test database
cd backend
docker-compose -f docker-compose.backup.yml up -d postgres

# Wait for database to be ready
sleep 10

# Create some test data
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d horse_racing -c "
  CREATE TABLE test_table (id SERIAL PRIMARY KEY, name TEXT);
  INSERT INTO test_table (name) VALUES ('test1'), ('test2'), ('test3');
"

# Run backup
docker-compose -f docker-compose.backup.yml up backup

# Verify backup was created
ls -lh /tmp/backups/

# Test restore
docker-compose -f docker-compose.backup.yml --profile restore up restore

# Verify restored data
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d horse_racing_restored -c "
  SELECT * FROM test_table;
"

# Clean up
docker-compose -f docker-compose.backup.yml down -v
```

### 2. Production Backup

```bash
# Set production environment variables
export DB_HOST=your-production-db-host
export DB_PORT=5432
export DB_NAME=horse_racing
export DB_USER=postgres
export DB_PASSWORD=your_production_password
export S3_BUCKET=your-backup-bucket
export S3_PREFIX=backups/production
export RETENTION_DAYS=30

# Run backup
./scripts/backup-database.sh
```

### 3. Production Restore

```bash
# List available backups
aws s3 ls s3://your-backup-bucket/backups/production/

# Set environment variables
export DB_HOST=your-production-db-host
export DB_PORT=5432
export DB_NAME=horse_racing
export DB_USER=postgres
export DB_PASSWORD=your_production_password
export S3_BUCKET=your-backup-bucket
export S3_PREFIX=backups/production

# Restore (will prompt for confirmation)
./scripts/restore-database.sh horse_racing_backup_20240101_120000.sql.gz
```

## Automated Backups

### Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backend/scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

### GitHub Actions

The repository includes a GitHub Actions workflow at `.github/workflows/database-backup.yml` that:

- Runs daily at 2 AM UTC
- Creates database backup
- Uploads to S3
- Sends notifications on success/failure
- Tests restore monthly

**Required Secrets:**

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BACKUP_BUCKET`
- `SLACK_WEBHOOK_URL` (optional)

### Railway

```bash
# Create manual backup
railway backup create

# Schedule automatic backups (built-in)
# Railway automatically creates daily backups
```

### Render

Render provides automatic daily backups. No configuration needed.

## Backup Storage

### Local Storage

```bash
# Create backup directory
sudo mkdir -p /var/backups/database
sudo chown $USER:$USER /var/backups/database
chmod 700 /var/backups/database

# Set in environment
export BACKUP_DIR=/var/backups/database
```

### AWS S3

```bash
# Create S3 bucket
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

# Set lifecycle policy (optional)
aws s3api put-bucket-lifecycle-configuration \
  --bucket horse-racing-backups \
  --lifecycle-configuration file://lifecycle.json
```

## Monitoring

### Check Backup Status

```bash
# List recent backups
ls -lht /tmp/backups/ | head -10

# Check backup age
LATEST_BACKUP=$(ls -t /tmp/backups/horse_racing_backup_*.sql.gz | head -1)
BACKUP_AGE=$(($(date +%s) - $(stat -f %m "$LATEST_BACKUP")))
echo "Latest backup is $((BACKUP_AGE / 3600)) hours old"

# Verify backup integrity
gzip -t "$LATEST_BACKUP" && echo "Backup is valid" || echo "Backup is corrupted"
```

### Prometheus Metrics

Expose backup metrics in your application:

```typescript
import { Gauge } from 'prom-client';

const backupAgeGauge = new Gauge({
  name: 'database_backup_age_seconds',
  help: 'Age of the latest database backup in seconds',
});

const backupSizeGauge = new Gauge({
  name: 'database_backup_size_bytes',
  help: 'Size of the latest database backup in bytes',
});
```

### Grafana Alerts

```yaml
- alert: BackupTooOld
  expr: database_backup_age_seconds > 86400
  for: 1h
  labels:
    severity: critical
  annotations:
    summary: 'Database backup is too old'
```

## Troubleshooting

### Backup fails with "permission denied"

```bash
# Make scripts executable
chmod +x backend/scripts/backup-database.sh
chmod +x backend/scripts/restore-database.sh
```

### Out of disk space

```bash
# Check disk space
df -h

# Clean up old backups
find /tmp/backups -name "*.sql.gz" -mtime +7 -delete
```

### S3 upload fails

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://your-bucket/
```

### Restore fails with "database already exists"

```bash
# Drop database first
psql -h localhost -U postgres -c "DROP DATABASE horse_racing;"

# Then restore
./scripts/restore-database.sh backup.sql.gz
```

## Best Practices

1. **Test Backups Regularly**: Monthly restore tests
2. **Multiple Storage Locations**: Local + S3 + Platform backups
3. **Monitor Backup Age**: Alert if backup is > 24 hours old
4. **Verify Integrity**: Always verify backup after creation
5. **Document Procedures**: Keep recovery procedures updated
6. **Automate**: Use cron or CI/CD for scheduled backups
7. **Encrypt**: Use encrypted storage (S3 encryption)
8. **Retention Policy**: Balance cost and compliance needs

## Security

1. **Protect Credentials**: Use environment variables, never commit passwords
2. **Encrypt Backups**: Enable S3 encryption
3. **Access Control**: Limit who can access backups
4. **Audit Logs**: Track backup access and restores
5. **Secure Storage**: Use private S3 buckets with IAM policies

## Support

For issues or questions:

1. Check the [BACKUP_GUIDE.md](../BACKUP_GUIDE.md) for detailed documentation
2. Review logs: `/var/log/backup.log` or `/tmp/backup.log`
3. Test scripts locally using Docker Compose
4. Contact the platform team

## License

These scripts are part of the horse racing platform and are proprietary.
