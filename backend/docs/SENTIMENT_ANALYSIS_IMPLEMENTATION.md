# Sentiment Analysis Implementation

## Overview

The sentiment analysis service uses OpenAI's GPT models to analyze racing news articles, extract entity-specific sentiments, and rewrite content for clarity. This implementation includes rate limiting, cost monitoring, and aggressive caching to minimize API costs.

## Architecture

### Components

1. **OpenAI Configuration** (`src/config/openai.ts`)
   - Manages OpenAI client initialization
   - Defines prompt templates for different analysis tasks
   - Validates API key availability

2. **Sentiment Analyzer Service** (`src/services/news/sentiment-analyzer.service.ts`)
   - Core AI analysis functionality
   - Rate limiting using Bottleneck
   - Cost tracking and monitoring
   - Three main operations:
     - Sentiment analysis (overall + entity-specific)
     - Content rewriting
     - Key insights extraction

3. **Sentiment Processing Service** (`src/services/news/sentiment-processing.service.ts`)
   - Orchestrates sentiment analysis workflow
   - Manages database updates
   - Implements caching strategy
   - Batch processing support

4. **Content Rewriter Service** (`src/services/news/content-rewriter.service.ts`)
   - Handles AI content rewriting
   - Extracts key insights
   - Aggressive caching (7 days)
   - Article enhancement workflow

5. **News Controller** (`src/controllers/news.controller.ts`)
   - REST API endpoints for news access
   - Filtering by sentiment, entity, race
   - Admin endpoint for triggering analysis

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.3
OPENAI_RATE_LIMIT=50
```

### Configuration Options

- **OPENAI_API_KEY**: Your OpenAI API key (required)
- **OPENAI_MODEL**: Model to use (default: `gpt-4o-mini` for cost efficiency)
- **OPENAI_MAX_TOKENS**: Maximum tokens per response (default: 1000)
- **OPENAI_TEMPERATURE**: Creativity level 0-1 (default: 0.3 for consistency)
- **OPENAI_RATE_LIMIT**: Max requests per minute (default: 50)

## API Endpoints

### Public Endpoints

#### GET /api/news

List news articles with filters

**Query Parameters:**

- `source_id` - Filter by news source
- `sentiment` - Filter by sentiment (positive/negative/neutral)
- `entity_type` - Filter by entity type (horse/jockey/trainer)
- `entity_name` - Filter by entity name
- `start_date` - Filter by start date
- `end_date` - Filter by end date
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Example:**

```bash
GET /api/news?sentiment=positive&limit=20
```

#### GET /api/news/:id

Get specific article with sentiment and entities

**Query Parameters:**

- `include_insights` - Include AI-extracted insights (true/false)

**Example:**

```bash
GET /api/news/123?include_insights=true
```

#### GET /api/news/race/:raceId

Get news related to a specific race

**Query Parameters:**

- `limit` - Max articles to return (default: 20)

**Example:**

```bash
GET /api/news/race/456
```

#### GET /api/news/entity/:entityName

Get news mentioning a specific entity

**Query Parameters:**

- `entity_type` - Filter by entity type (horse/jockey/trainer)
- `limit` - Max articles to return (default: 20)

**Example:**

```bash
GET /api/news/entity/Winx?entity_type=horse
```

#### GET /api/news/stats/sentiment

Get sentiment statistics across all articles

**Example:**

```bash
GET /api/news/stats/sentiment
```

### Protected Endpoints (Admin Only)

#### POST /api/news/:id/analyze

Trigger sentiment analysis for a specific article

**Headers:**

- `Authorization: Bearer <jwt_token>`

**Example:**

```bash
POST /api/news/123/analyze
Authorization: Bearer eyJhbGc...
```

## Usage Examples

### Analyzing a Single Article

```typescript
import { SentimentProcessingService } from './services/news';

const sentimentProcessor = new SentimentProcessingService();

// Process sentiment for an article
const article = await newsStorage.getArticleById('123');
const sentiment = await sentimentProcessor.processArticleSentiment(article);

console.log(sentiment);
// {
//   overall: 'positive',
//   confidence: 0.85,
//   entitySentiments: [
//     {
//       entityName: 'Winx',
//       entityType: 'horse',
//       sentiment: 'positive',
//       confidence: 0.92,
//       relevantQuotes: ['Winx showed exceptional form...']
//     }
//   ]
// }
```

### Rewriting Article Content

```typescript
import { ContentRewriterService } from './services/news';

const rewriter = new ContentRewriterService();

// Rewrite article content
const article = await newsStorage.getArticleById('123');
const rewritten = await rewriter.rewriteArticle(article);

console.log(rewritten);
// "Winx demonstrated outstanding form in her latest trial..."
```

### Batch Processing

```typescript
import { SentimentProcessingService } from './services/news';

const sentimentProcessor = new SentimentProcessingService();

// Process unanalyzed articles
const result = await sentimentProcessor.processUnanalyzedArticles(10);

console.log(result);
// { processed: 8, failed: 2 }
```

## Caching Strategy

### Cache Keys and TTLs

1. **Sentiment Analysis** - 24 hours
   - Key: `sentiment:article:{articleId}`
   - Rationale: Sentiment doesn't change once analyzed

2. **Rewritten Content** - 7 days
   - Key: `rewritten:article:{articleId}`
   - Rationale: Content is static, long cache reduces costs

3. **Insights** - 7 days
   - Key: `insights:article:{articleId}`
   - Rationale: Insights are static once extracted

4. **News Lists** - 5 minutes
   - Key: `news:list:{queryParams}`
   - Rationale: Lists change as new articles arrive

5. **Article Details** - 5 minutes
   - Key: `news:article:{id}:{includeInsights}`
   - Rationale: Balance freshness with performance

### Cache Invalidation

Clear cache when regenerating content:

```typescript
await contentRewriter.clearArticleCache(articleId);
```

## Cost Monitoring

### Tracking Usage

The sentiment analyzer tracks:

- Total API requests
- Total tokens consumed
- Estimated cost (based on GPT-4o-mini pricing)

### Viewing Statistics

```typescript
const stats = sentimentAnalyzer.getCostStats();
console.log(stats);
// {
//   totalRequests: 150,
//   totalTokens: 45000,
//   estimatedCost: 0.0135
// }
```

### Cost Optimization Tips

1. **Use GPT-4o-mini** - 60x cheaper than GPT-4
2. **Aggressive Caching** - Cache results for 7+ days
3. **Batch Processing** - Process articles in batches during off-peak
4. **Truncate Content** - Limit input to 2000-3000 chars
5. **Rate Limiting** - Prevent runaway costs

### Estimated Costs (GPT-4o-mini)

- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Example:** Analyzing 1000 articles

- Average input: 500 tokens/article = 500K tokens = $0.075
- Average output: 200 tokens/article = 200K tokens = $0.12
- **Total: ~$0.20 for 1000 articles**

## Rate Limiting

### Configuration

Rate limiting is implemented using Bottleneck:

```typescript
const rateLimiter = new Bottleneck({
  reservoir: 50, // Max requests
  reservoirRefreshAmount: 50, // Refill amount
  reservoirRefreshInterval: 60000, // 1 minute
  maxConcurrent: 5, // Concurrent requests
});
```

### Handling Rate Limits

The service automatically queues requests when rate limits are reached. Failed requests are logged but don't crash the application.

## Prompt Engineering

### Sentiment Analysis Prompt

The sentiment analysis prompt:

- Requests JSON-formatted output
- Specifies overall sentiment + entity-specific sentiments
- Includes confidence scores
- Extracts relevant quotes

### Content Rewriting Prompt

The rewriting prompt:

- Maintains factual accuracy
- Targets 150-300 words
- Uses clear, accessible language
- Preserves key insights

### Insights Extraction Prompt

The insights prompt:

- Extracts 3-5 key insights
- Focuses on actionable information
- Returns JSON array format

## Database Schema

### news_articles Table

```sql
- sentiment_overall: VARCHAR (positive/negative/neutral)
- sentiment_confidence: DECIMAL (0-1)
- rewritten_content: TEXT
```

### news_article_entities Table

```sql
- sentiment: VARCHAR (positive/negative/neutral)
- sentiment_confidence: DECIMAL (0-1)
```

## Error Handling

### Graceful Degradation

If OpenAI is unavailable:

- Service logs warnings
- Returns null for sentiment
- Application continues functioning
- Articles stored without sentiment

### Retry Logic

Failed API calls:

- Logged with error details
- Not automatically retried (to prevent cost escalation)
- Can be manually triggered via admin endpoint

## Testing

### Manual Testing

1. **Test sentiment analysis:**

```bash
curl http://localhost:3001/api/news/123?include_insights=true
```

2. **Trigger analysis:**

```bash
curl -X POST http://localhost:3001/api/news/123/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Check statistics:**

```bash
curl http://localhost:3001/api/news/stats/sentiment
```

## Monitoring

### Key Metrics to Track

1. **API Success Rate** - % of successful OpenAI calls
2. **Average Response Time** - Time per analysis
3. **Cost per Article** - Tokens/cost per article
4. **Cache Hit Rate** - % of cached responses
5. **Articles Analyzed** - Total articles with sentiment

### Logging

All operations are logged with:

- Article ID
- Operation type
- Success/failure status
- Token usage
- Error details (if failed)

## Future Enhancements

1. **Batch API Calls** - Process multiple articles in single request
2. **Fine-tuned Model** - Train custom model for racing sentiment
3. **Sentiment Trends** - Track sentiment changes over time
4. **Entity Linking** - Link entities to database records
5. **Multi-language Support** - Analyze non-English articles
6. **Real-time Analysis** - Analyze articles as they're scraped

## Troubleshooting

### OpenAI API Key Not Set

**Error:** "OPENAI_API_KEY not set - sentiment analysis will be disabled"

**Solution:** Add `OPENAI_API_KEY` to your `.env` file

### Rate Limit Exceeded

**Error:** "Rate limit exceeded"

**Solution:**

- Increase `OPENAI_RATE_LIMIT` in config
- Implement longer delays between requests
- Process articles in smaller batches

### High Costs

**Solution:**

- Review cache hit rates
- Reduce `OPENAI_MAX_TOKENS`
- Switch to cheaper model
- Truncate input content more aggressively

### Parsing Errors

**Error:** "Failed to parse sentiment response"

**Solution:**

- Check prompt templates
- Verify model output format
- Review OpenAI model version
- Add more robust JSON extraction

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4o-mini Pricing](https://openai.com/pricing)
- [Bottleneck Rate Limiting](https://github.com/SGrondin/bottleneck)
