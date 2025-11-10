# Monitoring and Observability

This document describes the monitoring and observability setup for the Horse Racing Platform backend.

## Overview

The platform uses a comprehensive monitoring stack:

- **Sentry**: Error tracking and performance monitoring
- **Pino**: Structured application logging
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards

## Components

### 1. Error Tracking (Sentry)

Sentry captures and tracks errors in both backend and frontend applications.

#### Setup

1. Create a Sentry account at https://sentry.io
2. Create a new project for the backend
3. Copy the DSN and add to `.env`:
   ```
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
   ```

#### Features

- Automatic error capture
- Performance monitoring
- Request tracing
- Error grouping and deduplication
- Alert notifications

### 2. Application Logging

Structured logging using Pino with custom log functions for different operations.

#### Log Types

- **API Requests/Responses**: HTTP method, path, status code, duration
- **Odds Collection**: Bookmaker, race count, success/failure, duration
- **News Aggregation**: Source, article count, success/failure, duration
- **Sentiment Analysis**: Article ID, sentiment, confidence, duration
- **Database Queries**: Query, duration, row count
- **Cache Operations**: Operation type, key, hit/miss
- **WebSocket Events**: Event type, client ID
- **Errors**: Error message, stack trace, context

#### Log Levels

- `debug`: Detailed information for debugging
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages

#### Configuration

Set log level in `.env`:

```
LOG_LEVEL=info
```

### 3. Metrics Collection (Prometheus)

Prometheus collects metrics from the `/metrics` endpoint.

#### Available Metrics

**HTTP Metrics:**

- `horse_racing_http_requests_total`: Total HTTP requests
- `horse_racing_http_request_duration_seconds`: Request duration histogram

**Odds Collection Metrics:**

- `horse_racing_odds_collection_total`: Total odds collection attempts
- `horse_racing_odds_collection_duration_seconds`: Collection duration
- `horse_racing_odds_collected_total`: Total odds collected
- `horse_racing_odds_stored_total`: Total odds stored

**News Aggregation Metrics:**

- `horse_racing_news_aggregation_total`: Total aggregation attempts
- `horse_racing_news_aggregation_duration_seconds`: Aggregation duration
- `horse_racing_articles_collected_total`: Total articles collected
- `horse_racing_articles_stored_total`: Total articles stored

**Sentiment Analysis Metrics:**

- `horse_racing_sentiment_analysis_total`: Total sentiment analyses
- `horse_racing_sentiment_analysis_duration_seconds`: Analysis duration
- `horse_racing_sentiment_distribution_total`: Sentiment distribution

**OpenAI Metrics:**

- `horse_racing_openai_api_calls_total`: Total API calls
- `horse_racing_openai_tokens_used_total`: Total tokens used
- `horse_racing_openai_cost_usd_total`: Estimated cost in USD

**Database Metrics:**

- `horse_racing_database_query_duration_seconds`: Query duration
- `horse_racing_database_connections_active`: Active connections
- `horse_racing_database_connections_idle`: Idle connections

**Cache Metrics:**

- `horse_racing_cache_operations_total`: Total cache operations
- `horse_racing_cache_hit_rate`: Cache hit rate

**WebSocket Metrics:**

- `horse_racing_websocket_connections_active`: Active connections
- `horse_racing_websocket_messages_total`: Total messages

**Business Metrics:**

- `horse_racing_user_registrations_total`: Total user registrations
- `horse_racing_affiliate_clicks_total`: Total affiliate clicks
- `horse_racing_affiliate_conversions_total`: Total conversions
- `horse_racing_ambassador_articles_total`: Total articles published

**System Health:**

- `horse_racing_system_health`: Component health status (1=healthy, 0=unhealthy)

#### Setup with Docker

1. Start Prometheus and Grafana:

   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

2. Access Prometheus at http://localhost:9090
3. Access Grafana at http://localhost:3002 (admin/admin)

#### Manual Setup

1. Download Prometheus from https://prometheus.io/download/
2. Update `prometheus.yml` with your backend URL
3. Run Prometheus:
   ```bash
   ./prometheus --config.file=prometheus.yml
   ```

### 4. Visualization (Grafana)

Grafana provides dashboards for visualizing metrics.

#### Setup

1. Access Grafana at http://localhost:3002
2. Login with admin/admin (change password on first login)
3. Add Prometheus as a data source:
   - URL: http://prometheus:9090 (if using Docker)
   - URL: http://localhost:9090 (if running locally)
4. Import the dashboard from `grafana-dashboard.json`

#### Dashboard Panels

- API Request Rate
- API Response Time (p95)
- Odds Collection Rate
- Odds Collection Success Rate
- News Articles Collected
- Sentiment Distribution
- WebSocket Connections
- Database Connections
- Memory Usage
- CPU Usage
- OpenAI API Calls
- OpenAI Cost
- Cache Hit Rate
- System Health
- Affiliate Clicks

## Alerting

Prometheus alerting rules are defined in `alerts.yml`.

### Alert Rules

**API Alerts:**

- High error rate (>5% for 5 minutes)
- Slow API responses (p95 > 2s for 5 minutes)

**Odds Collection Alerts:**

- High failure rate (>20% for 10 minutes)
- No odds collected (15 minutes)

**News Aggregation Alerts:**

- High failure rate (>30% for 30 minutes)

**System Health Alerts:**

- Database unhealthy (2 minutes)
- Redis unhealthy (2 minutes)
- High memory usage (>1.5GB for 5 minutes)
- High CPU usage (>80% for 5 minutes)

**WebSocket Alerts:**

- Too many connections (>10,000 for 5 minutes)

**OpenAI Alerts:**

- High API costs (>$10/hour)
- High failure rate (>10% for 10 minutes)

### Setting Up Alertmanager (Optional)

1. Uncomment the alertmanager service in `docker-compose.monitoring.yml`
2. Create `alertmanager.yml` configuration
3. Configure notification channels (email, Slack, PagerDuty, etc.)

## Best Practices

### Logging

1. Use appropriate log levels
2. Include context in log messages
3. Don't log sensitive information (passwords, tokens)
4. Use structured logging for better searchability
5. Set log retention policies

### Metrics

1. Use consistent naming conventions
2. Add labels for filtering and grouping
3. Don't create too many unique label combinations (cardinality)
4. Use histograms for timing metrics
5. Use counters for cumulative values
6. Use gauges for current values

### Alerting

1. Set appropriate thresholds
2. Avoid alert fatigue (too many alerts)
3. Include actionable information in alerts
4. Test alerts regularly
5. Document runbooks for common alerts

## Troubleshooting

### Metrics Not Appearing

1. Check if backend is running: `curl http://localhost:3001/metrics`
2. Check Prometheus targets: http://localhost:9090/targets
3. Check Prometheus logs: `docker logs horse-racing-prometheus`

### Grafana Dashboard Not Loading

1. Check if Prometheus data source is configured
2. Check if queries are correct
3. Check time range selection
4. Check Grafana logs: `docker logs horse-racing-grafana`

### High Memory Usage

1. Check for memory leaks in application
2. Adjust Prometheus retention period
3. Reduce scrape frequency
4. Optimize queries

## Monitoring Checklist

- [ ] Sentry configured and receiving errors
- [ ] Logs are structured and searchable
- [ ] Prometheus scraping metrics successfully
- [ ] Grafana dashboard imported and working
- [ ] Alert rules configured
- [ ] Alert notifications set up
- [ ] Runbooks documented
- [ ] Team trained on monitoring tools

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Pino Documentation](https://getpino.io/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Grafana Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)
