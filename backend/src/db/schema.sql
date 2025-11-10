-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notifications_news BOOLEAN DEFAULT true,
  notifications_watchlist BOOLEAN DEFAULT true,
  email_digest_enabled BOOLEAN DEFAULT false,
  email_digest_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('horse', 'jockey', 'trainer', 'meeting')),
  entity_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_name)
);

CREATE INDEX idx_watchlist_user ON watchlist_items(user_id);

-- Bookmakers table
CREATE TABLE IF NOT EXISTS bookmakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  affiliate_link TEXT NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0.00,
  api_enabled BOOLEAN DEFAULT false,
  api_endpoint TEXT,
  auth_type VARCHAR(20) CHECK (auth_type IN ('api_key', 'oauth', 'basic')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookmakers_slug ON bookmakers(slug);
CREATE INDEX idx_bookmakers_status ON bookmakers(status);

-- Bookmaker features table
CREATE TABLE IF NOT EXISTS bookmaker_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookmaker_id UUID NOT NULL REFERENCES bookmakers(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  feature_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookmaker_features_bookmaker ON bookmaker_features(bookmaker_id);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookmaker_id UUID NOT NULL REFERENCES bookmakers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  terms TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_promotions_bookmaker ON promotions(bookmaker_id);
CREATE INDEX idx_promotions_active ON promotions(is_active, end_date);

-- Races table
CREATE TABLE IF NOT EXISTS races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_location VARCHAR(255) NOT NULL,
  meeting_date DATE NOT NULL,
  race_number INTEGER NOT NULL,
  race_name VARCHAR(255) NOT NULL,
  distance INTEGER NOT NULL,
  track_condition VARCHAR(50),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'resulted', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_location, meeting_date, race_number)
);

CREATE INDEX idx_races_start_time ON races(start_time);
CREATE INDEX idx_races_status ON races(status);
CREATE INDEX idx_races_meeting ON races(meeting_location, meeting_date);

-- Horses table
CREATE TABLE IF NOT EXISTS horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  sex VARCHAR(10),
  trainer VARCHAR(255),
  jockey VARCHAR(255),
  form VARCHAR(50),
  weight DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_horses_name ON horses(name);
CREATE INDEX idx_horses_trainer ON horses(trainer);
CREATE INDEX idx_horses_jockey ON horses(jockey);

-- Race entries (horses in races)
CREATE TABLE IF NOT EXISTS race_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  barrier_number INTEGER,
  horse_number INTEGER NOT NULL,
  scratched BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(race_id, horse_number)
);

CREATE INDEX idx_race_entries_race ON race_entries(race_id);
CREATE INDEX idx_race_entries_horse ON race_entries(horse_id);

-- Odds snapshots (TimescaleDB hypertable)
CREATE TABLE IF NOT EXISTS odds_snapshots (
  id UUID DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  bookmaker_id UUID NOT NULL REFERENCES bookmakers(id) ON DELETE CASCADE,
  market VARCHAR(20) DEFAULT 'AU',
  win_odds DECIMAL(10,2) NOT NULL CHECK (win_odds >= 1.01),
  place_odds DECIMAL(10,2) CHECK (place_odds >= 1.01),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  source_type VARCHAR(20) DEFAULT 'api' CHECK (source_type IN ('api', 'scraper')),
  PRIMARY KEY (id, timestamp)
);

-- Convert to hypertable (partitioned by timestamp)
SELECT create_hypertable('odds_snapshots', 'timestamp', if_not_exists => TRUE);

-- Create indexes on hypertable
CREATE INDEX IF NOT EXISTS idx_odds_race_time ON odds_snapshots(race_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_odds_horse_time ON odds_snapshots(horse_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_odds_bookmaker_time ON odds_snapshots(bookmaker_id, timestamp DESC);

-- Set up data retention policy (keep 90 days)
SELECT add_retention_policy('odds_snapshots', INTERVAL '90 days', if_not_exists => TRUE);

-- Ambassadors table
CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ambassadors_slug ON ambassadors(slug);
CREATE INDEX idx_ambassadors_status ON ambassadors(status);
CREATE INDEX idx_ambassadors_user ON ambassadors(user_id);

-- Ambassador social links table
CREATE TABLE IF NOT EXISTS ambassador_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ambassador_social_ambassador ON ambassador_social_links(ambassador_id);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_articles_ambassador ON articles(ambassador_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published ON articles(published_at DESC) WHERE status = 'published';

-- Article tags table
CREATE TABLE IF NOT EXISTS article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, tag)
);

CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag);

-- Article related races table
CREATE TABLE IF NOT EXISTS article_related_races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, race_id)
);

CREATE INDEX idx_article_races_article ON article_related_races(article_id);
CREATE INDEX idx_article_races_race ON article_related_races(race_id);

-- Referrals table (affiliate tracking)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE SET NULL,
  bookmaker_id UUID NOT NULL REFERENCES bookmakers(id) ON DELETE CASCADE,
  race_id UUID REFERENCES races(id) ON DELETE SET NULL,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE,
  commission DECIMAL(10,2),
  ip_address INET,
  user_agent TEXT,
  referral_code VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referrals_user ON referrals(user_id);
CREATE INDEX idx_referrals_ambassador ON referrals(ambassador_id);
CREATE INDEX idx_referrals_bookmaker ON referrals(bookmaker_id);
CREATE INDEX idx_referrals_clicked ON referrals(clicked_at DESC);
CREATE INDEX idx_referrals_converted ON referrals(converted_at DESC) WHERE converted_at IS NOT NULL;

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id VARCHAR(100) NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  url TEXT UNIQUE NOT NULL,
  content_hash VARCHAR(64) UNIQUE NOT NULL,
  sentiment_overall VARCHAR(20) CHECK (sentiment_overall IN ('positive', 'negative', 'neutral')),
  sentiment_confidence DECIMAL(3,2),
  rewritten_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_news_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_source ON news_articles(source_id);
CREATE INDEX idx_news_sentiment ON news_articles(sentiment_overall);
CREATE INDEX idx_news_hash ON news_articles(content_hash);

-- News article entities table
CREATE TABLE IF NOT EXISTS news_article_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('horse', 'jockey', 'trainer', 'meeting')),
  entity_name VARCHAR(255) NOT NULL,
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_news_entities_article ON news_article_entities(article_id);
CREATE INDEX idx_news_entities_type_name ON news_article_entities(entity_type, entity_name);

-- Scraper sources table
CREATE TABLE IF NOT EXISTS scraper_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  source_type VARCHAR(20) CHECK (source_type IN ('rss', 'web', 'api')),
  market VARCHAR(10) DEFAULT 'AU',
  poll_interval INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scraper_sources_active ON scraper_sources(is_active);
CREATE INDEX idx_scraper_sources_type ON scraper_sources(source_type);

-- Scraper metrics (TimescaleDB hypertable)
CREATE TABLE IF NOT EXISTS scraper_metrics (
  id UUID DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES scraper_sources(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  duration_ms INTEGER,
  records_collected INTEGER DEFAULT 0,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, timestamp)
);

-- Convert to hypertable
SELECT create_hypertable('scraper_metrics', 'timestamp', if_not_exists => TRUE);

-- Create index on hypertable
CREATE INDEX IF NOT EXISTS idx_scraper_metrics_source_time ON scraper_metrics(source_id, timestamp DESC);

-- Set up data retention policy (keep 30 days)
SELECT add_retention_policy('scraper_metrics', INTERVAL '30 days', if_not_exists => TRUE);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookmakers_updated_at BEFORE UPDATE ON bookmakers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at BEFORE UPDATE ON races
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horses_updated_at BEFORE UPDATE ON horses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ambassadors_updated_at BEFORE UPDATE ON ambassadors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraper_sources_updated_at BEFORE UPDATE ON scraper_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
