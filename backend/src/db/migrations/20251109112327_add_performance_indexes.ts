import type { Knex } from "knex";

/**
 * Add Performance Indexes Migration
 *
 * This migration adds comprehensive indexes to improve query performance across all tables:
 * - Foreign key indexes for JOIN operations
 * - Timestamp indexes for time-based queries
 * - Status/state indexes for filtering
 * - Composite indexes for common query patterns
 * - Partial indexes for specific conditions
 */

export async function up(knex: Knex): Promise<void> {
  console.log('Creating performance indexes...');

  // ===== USERS TABLE =====
  // Index on created_at for user registration tracking
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_users_created_at
    ON users(created_at DESC)
  `);

  // Index on subscription tier for filtering premium users
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_users_subscription_tier
    ON users(subscription_tier)
  `);

  // Partial index for premium users
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_users_premium
    ON users(id, email, name)
    WHERE subscription_tier = 'premium'
  `);

  // ===== USER_PREFERENCES TABLE =====
  // Already has user_id as primary key, no additional index needed

  // ===== WATCHLIST_ITEMS TABLE =====
  // Index on entity type and name for entity-based queries
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_watchlist_entity_type_name
    ON watchlist_items(entity_type, entity_name)
  `);

  // Index on created_at for sorting
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_watchlist_created_at
    ON watchlist_items(created_at DESC)
  `);

  // ===== BOOKMAKERS TABLE =====
  // Index on api_enabled for filtering API-enabled bookmakers
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_bookmakers_api_enabled
    ON bookmakers(api_enabled)
    WHERE api_enabled = true
  `);

  // Composite index for active API bookmakers
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_bookmakers_active_api
    ON bookmakers(status, api_enabled, rating DESC)
    WHERE status = 'active'
  `);

  // ===== BOOKMAKER_FEATURES TABLE =====
  // Index on feature_name for feature lookups
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_bookmaker_features_name
    ON bookmaker_features(feature_name)
  `);

  // ===== PROMOTIONS TABLE =====
  // Composite index for active promotions query
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_promotions_active_dates
    ON promotions(bookmaker_id, is_active, start_date DESC, end_date)
    WHERE is_active = true
  `);

  // ===== RACES TABLE =====
  // Composite index for upcoming races by date and location
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_races_status_start_time
    ON races(status, start_time ASC)
    WHERE status = 'upcoming'
  `);

  // Index for live races
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_races_live
    ON races(start_time DESC)
    WHERE status = 'live'
  `);

  // Composite index for meeting queries
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_races_meeting_date_location
    ON races(meeting_date DESC, meeting_location, race_number)
  `);

  // Index on updated_at for change tracking
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_races_updated_at
    ON races(updated_at DESC)
  `);

  // ===== HORSES TABLE =====
  // Index on updated_at for change tracking
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_horses_updated_at
    ON horses(updated_at DESC)
  `);

  // Composite index for trainer/jockey queries
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_horses_trainer_jockey
    ON horses(trainer, jockey)
  `);

  // ===== RACE_ENTRIES TABLE =====
  // Composite index for race entries with scratched filter
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_race_entries_race_scratched
    ON race_entries(race_id, scratched, horse_number)
  `);

  // Index for horse entries lookup
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_race_entries_horse_race
    ON race_entries(horse_id, race_id)
  `);

  // ===== ODDS_SNAPSHOTS TABLE =====
  // Composite index for latest odds queries (race + horse + bookmaker)
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_odds_race_horse_bookmaker
    ON odds_snapshots(race_id, horse_id, bookmaker_id, timestamp DESC)
  `);

  // Index on source_type for filtering API vs scraper data
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_odds_source_type
    ON odds_snapshots(source_type, timestamp DESC)
  `);

  // Composite index for bookmaker odds analysis
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_odds_bookmaker_timestamp
    ON odds_snapshots(bookmaker_id, race_id, timestamp DESC)
  `);

  // ===== AMBASSADORS TABLE =====
  // Index on status for filtering active ambassadors
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_ambassadors_status_joined
    ON ambassadors(status, joined_at DESC)
    WHERE status = 'active'
  `);

  // ===== AMBASSADOR_SOCIAL_LINKS TABLE =====
  // Index on platform for filtering by social platform
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_ambassador_social_platform
    ON ambassador_social_links(platform)
  `);

  // ===== ARTICLES TABLE =====
  // Composite index for published articles by date
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_articles_published_date
    ON articles(status, published_at DESC)
    WHERE status = 'published'
  `);

  // Index on views for popular articles
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_articles_views
    ON articles(views DESC)
    WHERE status = 'published'
  `);

  // Index on updated_at for change tracking
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_articles_updated_at
    ON articles(updated_at DESC)
  `);

  // Composite index for ambassador's published articles
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_articles_ambassador_published
    ON articles(ambassador_id, status, published_at DESC)
  `);

  // ===== ARTICLE_TAGS TABLE =====
  // Composite index for tag-based article queries
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_article_tags_tag_article
    ON article_tags(tag, article_id)
  `);

  // ===== ARTICLE_RELATED_RACES TABLE =====
  // Index on race_id for finding articles related to a race
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_article_related_races_race
    ON article_related_races(race_id, article_id)
  `);

  // ===== REFERRALS TABLE =====
  // Composite index for conversion tracking
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_referrals_conversion
    ON referrals(bookmaker_id, converted_at DESC)
    WHERE converted_at IS NOT NULL
  `);

  // Index on referral_code for code lookups
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_referrals_code
    ON referrals(referral_code)
    WHERE referral_code IS NOT NULL
  `);

  // Composite index for ambassador conversion tracking
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_referrals_ambassador_conversion
    ON referrals(ambassador_id, clicked_at DESC, converted_at)
  `);

  // ===== NEWS_ARTICLES TABLE =====
  // Composite index for sentiment filtering
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_news_sentiment_date
    ON news_articles(sentiment_overall, published_at DESC)
    WHERE sentiment_overall IS NOT NULL
  `);

  // Index on source_id for source-based queries
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_news_source_date
    ON news_articles(source_id, published_at DESC)
  `);

  // Index on updated_at for change tracking
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_news_updated_at
    ON news_articles(updated_at DESC)
  `);

  // ===== NEWS_ARTICLE_ENTITIES TABLE =====
  // Composite index for entity name searches (case-insensitive)
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_news_entities_name_lower
    ON news_article_entities(LOWER(entity_name), entity_type, article_id)
  `);

  // Index on sentiment for entity sentiment analysis
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_news_entities_sentiment
    ON news_article_entities(entity_type, sentiment, sentiment_confidence)
  `);

  // ===== SCRAPER_SOURCES TABLE =====
  // Composite index for active sources
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_scraper_sources_active_type
    ON scraper_sources(is_active, source_type, last_scraped_at DESC)
    WHERE is_active = true
  `);

  // Index on market for market-based queries
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_scraper_sources_market
    ON scraper_sources(market, is_active)
  `);

  // ===== SCRAPER_METRICS TABLE =====
  // Composite index for success rate analysis
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_scraper_metrics_success
    ON scraper_metrics(source_id, success, timestamp DESC)
  `);

  // Index on duration for performance monitoring
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_scraper_metrics_duration
    ON scraper_metrics(duration_ms DESC)
    WHERE success = true
  `);

  // ===== FCM_TOKENS TABLE (if exists) =====
  // Check if table exists first
  const hasFcmTokens = await knex.schema.hasTable('fcm_tokens');
  if (hasFcmTokens) {
    await knex.schema.raw(`
      CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user
      ON fcm_tokens(user_id, created_at DESC)
    `);

    await knex.schema.raw(`
      CREATE INDEX IF NOT EXISTS idx_fcm_tokens_updated
      ON fcm_tokens(updated_at DESC)
    `);
  }

  console.log('Performance indexes created successfully!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('Dropping performance indexes...');

  // Drop all indexes in reverse order
  const indexes = [
    'idx_fcm_tokens_updated',
    'idx_fcm_tokens_user',
    'idx_scraper_metrics_duration',
    'idx_scraper_metrics_success',
    'idx_scraper_sources_market',
    'idx_scraper_sources_active_type',
    'idx_news_entities_sentiment',
    'idx_news_entities_name_lower',
    'idx_news_updated_at',
    'idx_news_source_date',
    'idx_news_sentiment_date',
    'idx_referrals_ambassador_conversion',
    'idx_referrals_code',
    'idx_referrals_conversion',
    'idx_article_related_races_race',
    'idx_article_tags_tag_article',
    'idx_articles_ambassador_published',
    'idx_articles_updated_at',
    'idx_articles_views',
    'idx_articles_published_date',
    'idx_ambassador_social_platform',
    'idx_ambassadors_status_joined',
    'idx_odds_bookmaker_timestamp',
    'idx_odds_source_type',
    'idx_odds_race_horse_bookmaker',
    'idx_race_entries_horse_race',
    'idx_race_entries_race_scratched',
    'idx_horses_trainer_jockey',
    'idx_horses_updated_at',
    'idx_races_updated_at',
    'idx_races_meeting_date_location',
    'idx_races_live',
    'idx_races_status_start_time',
    'idx_promotions_active_dates',
    'idx_bookmaker_features_name',
    'idx_bookmakers_active_api',
    'idx_bookmakers_api_enabled',
    'idx_watchlist_created_at',
    'idx_watchlist_entity_type_name',
    'idx_users_premium',
    'idx_users_subscription_tier',
    'idx_users_created_at',
  ];

  for (const index of indexes) {
    await knex.schema.raw(`DROP INDEX IF EXISTS ${index}`);
  }

  console.log('Performance indexes dropped successfully!');
}

