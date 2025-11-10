# Racing Life - Deployment Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Monitoring Setup](#monitoring-setup)
- [Security Configuration](#security-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- Node.js 20.x or higher
- PostgreSQL 15.x
- Redis 7.x
- Docker 24.x (for containerized deployment)
- Kubernetes 1.28+ (for K8s deployment)
- kubectl CLI
- Helm 3.x (optional, for K8s package management)

### Required Accounts

- Odds API account and API key
- OpenAI API account (for AI features)
- Docker Hub account (for image hosting)
- Cloud provider account (AWS/GCP/Azure)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/racing-life.git
cd racing-life
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

#### Backend (.env)

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/racing_life
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=racing_life

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_very_secure_jwt_secret_at_least_32_characters
JWT_EXPIRES_IN=7d

# API Keys
ODDS_API_KEY=your_odds_api_key
OPENAI_API_KEY=your_openai_api_key

# Frontend URL
FRONTEND_URL=https://racinglife.com

# Sentry (Error Tracking)
SENTRY_DSN=your_sentry_dsn

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.racinglife.com
NEXT_PUBLIC_WS_URL=wss://api.racinglife.com

# Firebase (Push Notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

## Local Development

### Start Development Servers

#### Option 1: Using npm scripts

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

#### Option 2: Using Docker Compose

```bash
docker-compose up -d
```

### Run Database Migrations

```bash
cd backend
npm run migrate:latest
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api-docs
- Grafana: http://localhost:3002

## Docker Deployment

### Build Docker Images

```bash
# Build backend image
docker build -t racing-life-backend:latest ./backend

# Build frontend image
docker build -t racing-life-frontend:latest ./frontend
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Push to Docker Registry

```bash
# Tag images
docker tag racing-life-backend:latest your-registry/racing-life-backend:latest
docker tag racing-life-frontend:latest your-registry/racing-life-frontend:latest

# Push images
docker push your-registry/racing-life-backend:latest
docker push your-registry/racing-life-frontend:latest
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl apply -f k8s/base/namespace.yaml
```

### 2. Create Secrets

```bash
kubectl create secret generic racing-life-secrets \
  --namespace=racing-life \
  --from-literal=database-url=postgresql://user:pass@postgres:5432/racing_life \
  --from-literal=redis-url=redis://redis:6379 \
  --from-literal=jwt-secret=your_jwt_secret \
  --from-literal=odds-api-key=your_odds_api_key \
  --from-literal=openai-api-key=your_openai_api_key \
  --from-literal=postgres-user=postgres \
  --from-literal=postgres-password=your_password
```

### 3. Deploy Database and Cache

```bash
kubectl apply -f k8s/base/postgres-deployment.yaml
kubectl apply -f k8s/base/redis-deployment.yaml
```

### 4. Wait for Database to be Ready

```bash
kubectl wait --for=condition=ready pod -l app=postgres -n racing-life --timeout=300s
```

### 5. Deploy Backend and Frontend

```bash
kubectl apply -f k8s/base/backend-deployment.yaml
kubectl apply -f k8s/base/frontend-deployment.yaml
```

### 6. Configure Ingress

```bash
# Install nginx-ingress controller (if not already installed)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install nginx-ingress ingress-nginx/ingress-nginx

# Apply ingress configuration
kubectl apply -f k8s/base/ingress.yaml
```

### 7. Verify Deployment

```bash
# Check all pods
kubectl get pods -n racing-life

# Check services
kubectl get services -n racing-life

# Check ingress
kubectl get ingress -n racing-life

# View logs
kubectl logs -f deployment/backend -n racing-life
kubectl logs -f deployment/frontend -n racing-life
```

## Monitoring Setup

### 1. Deploy Prometheus

```bash
# Using Docker Compose (development)
docker-compose up -d prometheus

# Using Kubernetes
kubectl apply -f k8s/monitoring/prometheus-deployment.yaml
```

### 2. Deploy Grafana

```bash
# Using Docker Compose (development)
docker-compose up -d grafana

# Using Kubernetes
kubectl apply -f k8s/monitoring/grafana-deployment.yaml
```

### 3. Access Monitoring Dashboards

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002 (admin/admin)

### 4. Import Grafana Dashboards

1. Log in to Grafana
2. Go to Dashboards → Import
3. Upload `monitoring/grafana/dashboards/racing-life-dashboard.json`

### 5. Configure Alerts

Edit `monitoring/alerts.yml` to customize alert rules, then reload Prometheus:

```bash
# Docker
docker-compose restart prometheus

# Kubernetes
kubectl rollout restart deployment/prometheus -n racing-life
```

## Security Configuration

### 1. SSL/TLS Certificates

#### Using Let's Encrypt (Production)

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f k8s/security/cert-issuer.yaml
```

#### Using Self-Signed Certificates (Development)

```bash
# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./nginx/ssl/key.pem \
  -out ./nginx/ssl/cert.pem
```

### 2. API Key Management

Generate API keys for external services:

```bash
cd backend
npm run generate-api-key -- --name "Service Name" --permissions "read,write"
```

### 3. Run Security Audit

```bash
cd backend
npx tsx src/scripts/security/audit.ts
```

### 4. Database Security

```sql
-- Create read-only user
CREATE USER racing_life_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE racing_life TO racing_life_readonly;
GRANT USAGE ON SCHEMA public TO racing_life_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO racing_life_readonly;
```

## Troubleshooting

### Common Issues

#### Backend won't start

```bash
# Check database connection
docker-compose logs postgres

# Check environment variables
cd backend
cat .env

# Run migrations
npm run migrate:latest
```

#### Frontend can't connect to backend

```bash
# Check NEXT_PUBLIC_API_URL is correct
echo $NEXT_PUBLIC_API_URL

# Check backend is running
curl http://localhost:3001/health

# Check CORS settings in backend
```

#### Kubernetes pods crashing

```bash
# Check pod logs
kubectl logs pod-name -n racing-life

# Describe pod for events
kubectl describe pod pod-name -n racing-life

# Check secrets
kubectl get secrets -n racing-life
```

#### Database migration errors

```bash
# Check migration status
cd backend
npm run migrate:status

# Rollback last migration
npm run migrate:rollback

# Re-run migrations
npm run migrate:latest
```

### Performance Issues

#### High memory usage

```bash
# Check metrics
curl http://localhost:3001/metrics

# Scale up resources (K8s)
kubectl scale deployment backend --replicas=5 -n racing-life
```

#### Slow API responses

```bash
# Check database queries
# Enable query logging in PostgreSQL
ALTER DATABASE racing_life SET log_statement = 'all';

# Check Redis cache
redis-cli info stats
```

## Backup and Recovery

### Database Backup

```bash
# Manual backup
pg_dump racing_life > backup_$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump racing_life | gzip > /backups/racing_life_$(date +\%Y\%m\%d).sql.gz
```

### Restore Database

```bash
psql racing_life < backup_20241109.sql
```

### Redis Backup

```bash
# Redis automatically creates RDB dumps
# Copy from /data/dump.rdb

# Force save
redis-cli BGSAVE
```

## Scaling

### Horizontal Scaling (Kubernetes)

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n racing-life

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n racing-life

# Auto-scaling
kubectl autoscale deployment backend --min=3 --max=10 --cpu-percent=70 -n racing-life
```

### Vertical Scaling

Edit deployment YAML files to increase resource limits:

```yaml
resources:
  requests:
    memory: '512Mi'
    cpu: '500m'
  limits:
    memory: '1Gi'
    cpu: '1000m'
```

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment.

### Workflow Triggers

- Push to `main` → Deploy to production
- Push to `develop` → Deploy to staging
- Pull requests → Run tests and security checks

### Manual Deployment

```bash
# Trigger deployment workflow
gh workflow run ci.yml
```

## Support

For issues and questions:

- GitHub Issues: https://github.com/your-org/racing-life/issues
- Email: support@racinglife.com
- Documentation: https://docs.racinglife.com
