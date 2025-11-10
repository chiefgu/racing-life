# News Aggregation Service

This module handles the collection, processing, and storage of racing news from multiple Australian sources.

## Components

### NewsScraperService

Collects news articles from RSS feeds and web sources.

**Features:**

- RSS feed parsing with `rss-parser`
- Web scraping with `cheerio` for sites without RSS
- Content cleaning and normalization
- Duplicate detection using content hashing (SHA-256)
- Graceful error handling for source failures

**Usage:**

```typescript
const scraper = new NewsScraperService();
const articles = await scraper.scrapeSource(source);
const unique = scraper.detectDuplicates(articles);
```

### EntityExtractorService

Extracts racing entities (horses, jockeys, trainers, meetings) from article text.

**Features:**

- Pattern-based entity recognition using regex
- Extraction of horses, jockeys, trainers, and meeting locations
- Validation and filtering of false positives
- Support for Australian racing terminology

**Usage:**

```typescript
const extractor = new EntityExtractorService();
const entities = extractor.extractEntities(article);
await extractor.extractAndStore(article, storageService);
```

### NewsStorageService

Handles database operations for news articles and entities.

**Features:**

- Article storage with duplicate prevention
- Entity relationship management
- Query methods for retrieving articles
- Sentiment data updates

**Usage:**

```typescript
const storage = new NewsStorageService();
const articleId = await storage.storeArticle(article);
await storage.storeArticleEntities(articleId, entities);
const recent = await storage.getRecentArticles(50);
```

### NewsAggregatorService

Orchestrates the news collection process across multiple sources.

**Features:**

- Aggregates from all enabled sources
- Coordinates scraping, entity extraction, and storage
- Handles source failures gracefully
- Provides statistics on collection results

**Usage:**

```typescript
const aggregator = new NewsAggregatorService();
const result = await aggregator.aggregateNews();
// { collected: 25, stored: 20 }
```

### NewsAggregationJobService

Manages scheduled news collection jobs using Bull queue.

**Features:**

- Scheduled jobs for each news source based on poll interval
- Background job processing with retry logic
- Job monitoring and statistics
- Manual trigger support
- Graceful error handling

**Usage:**

```typescript
const jobService = new NewsAggregationJobService();
await jobService.initialize();

// Manual trigger
await jobService.triggerAggregation();

// Get stats
const stats = await jobService.getStats();
```

## Configuration

News sources are configured in `config/news-sources.ts`:

```typescript
{
  id: 'racing-com',
  name: 'Racing.com',
  url: 'https://www.racing.com/news/rss',
  type: 'rss',
  pollInterval: 15, // minutes
  enabled: true,
}
```

## Database Schema

### news_articles

- `id` - UUID primary key
- `source_id` - Source identifier
- `source_name` - Source display name
- `title` - Article title
- `content` - Article content (cleaned)
- `author` - Article author (optional)
- `published_at` - Publication timestamp
- `url` - Article URL (unique)
- `content_hash` - SHA-256 hash for duplicate detection (unique)
- `sentiment_overall` - Overall sentiment (positive/negative/neutral)
- `sentiment_confidence` - Confidence score (0-1)
- `rewritten_content` - AI-rewritten content (optional)

### news_article_entities

- `id` - UUID primary key
- `article_id` - Foreign key to news_articles
- `entity_type` - Type (horse/jockey/trainer/meeting)
- `entity_name` - Entity name
- `sentiment` - Entity-specific sentiment (optional)
- `sentiment_confidence` - Confidence score (optional)

## Job Scheduling

Jobs are scheduled based on source poll intervals:

- 15 minutes: `*/15 * * * *`
- 20 minutes: `*/20 * * * *`
- 30 minutes: `*/30 * * * *`
- 60 minutes: `0 * * * *`

Additionally, a job runs every 30 minutes to aggregate from all sources.

## Error Handling

The service implements multiple layers of error handling:

1. **Source-level**: If one source fails, others continue
2. **Job-level**: Failed jobs retry up to 3 times with exponential backoff
3. **Entity extraction**: Failures don't prevent article storage
4. **Duplicate detection**: Handled at both application and database level

## Monitoring

Monitor job health using:

```typescript
const stats = await jobService.getStats();
// { waiting: 0, active: 1, completed: 150, failed: 2, delayed: 0 }
```

Check logs for:

- Source scraping success/failure
- Duplicate detection
- Entity extraction results
- Job processing status

## Future Enhancements

- NLP-based entity extraction using OpenAI
- Sentiment analysis integration
- Content rewriting with AI
- Image extraction and storage
- Related race linking
- User watchlist notifications
