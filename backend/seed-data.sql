-- Create sample users
INSERT INTO users (email, name, password_hash, role) VALUES
('admin@racinglife.com', 'Admin User', '$2b$10$YourHashedPasswordHere', 'admin'),
('ambassador@racinglife.com', 'John Smith', '$2b$10$YourHashedPasswordHere', 'ambassador'),
('user@racinglife.com', 'Jane Doe', '$2b$10$YourHashedPasswordHere', 'user')
ON CONFLICT (email) DO NOTHING;

-- Create sample bookmakers
INSERT INTO bookmakers (name, slug, affiliate_link, rating, status, api_enabled) VALUES
('Sportsbet', 'sportsbet', 'https://www.sportsbet.com.au', 4.5, 'active', true),
('Ladbrokes', 'ladbrokes', 'https://www.ladbrokes.com.au', 4.3, 'active', true),
('Neds', 'neds', 'https://www.neds.com.au', 4.4, 'active', true),
('TAB', 'tab', 'https://www.tab.com.au', 4.0, 'active', true)
ON CONFLICT (slug) DO NOTHING;

-- Create sample races
INSERT INTO races (name, race_number, scheduled_start, status, distance, prize_money, race_type, track_condition) VALUES
('Melbourne Cup', 7, NOW() + INTERVAL '2 hours', 'scheduled', 3200, 8000000, 'Group 1', 'Good 4'),
('Cox Plate', 8, NOW() + INTERVAL '3 hours', 'scheduled', 2040, 5000000, 'Group 1', 'Soft 5'),
('Golden Slipper', 5, NOW() + INTERVAL '4 hours', 'scheduled', 1200, 3500000, 'Group 1', 'Good 3'),
('The Everest', 6, NOW() + INTERVAL '5 hours', 'scheduled', 1200, 15000000, 'Open', 'Good 3');

-- Create sample horses (simplified)
WITH races AS (SELECT id FROM races LIMIT 4)
INSERT INTO horses (name, age, sex, color, trainer, jockey, weight, barrier, race_id, number)
SELECT
    'Horse ' || row_number() OVER (),
    4,
    'gelding',
    'Bay',
    'Chris Waller',
    'James McDonald',
    56.5,
    row_number() OVER () % 10 + 1,
    races.id,
    row_number() OVER () % 10 + 1
FROM races, generate_series(1, 3);

-- Create sample news articles
INSERT INTO news (title, content, summary, author, source_url, sentiment_score, sentiment_label, published_at) VALUES
('Melbourne Cup Field Announced', 'The field for this year''s Melbourne Cup has been announced with 24 runners confirmed.', 'Melbourne Cup field of 24 runners confirmed', 'Racing Life', 'https://racinglife.com/news/1', 0.8, 'positive', NOW() - INTERVAL '2 hours'),
('Track Conditions Perfect for Racing', 'Perfect weather conditions are expected for today''s racing at Flemington.', 'Perfect conditions at Flemington', 'Racing Life', 'https://racinglife.com/news/2', 0.9, 'positive', NOW() - INTERVAL '3 hours'),
('Favorite Draws Wide Barrier', 'The race favorite has drawn a challenging wide barrier for today''s feature race.', 'Favorite faces barrier challenge', 'Racing Life', 'https://racinglife.com/news/3', -0.3, 'negative', NOW() - INTERVAL '4 hours'),
('Jockey Returns From Injury', 'Star jockey returns to racing after recovering from injury.', 'Star jockey returns to racing', 'Racing Life', 'https://racinglife.com/news/4', 0.6, 'positive', NOW() - INTERVAL '5 hours');

-- Add sample odds
WITH bookmakers AS (SELECT id FROM bookmakers),
     horses AS (SELECT id, race_id FROM horses)
INSERT INTO odds_snapshots (race_id, horse_id, bookmaker_id, win_odds, place_odds, timestamp)
SELECT
    h.race_id,
    h.id,
    b.id,
    (RANDOM() * 20 + 2)::numeric(10,2),
    (RANDOM() * 5 + 1.5)::numeric(10,2),
    NOW()
FROM horses h, bookmakers b;

-- Create an ambassador profile
WITH amb_user AS (SELECT id FROM users WHERE email = 'ambassador@racinglife.com')
INSERT INTO ambassadors (user_id, bio, expertise, achievements, is_verified, commission_rate)
SELECT
    id,
    'Professional racing analyst with 20 years experience',
    'Form analysis, track conditions, breeding',
    'Multiple Group 1 winner predictions',
    true,
    0.15
FROM amb_user
ON CONFLICT (user_id) DO NOTHING;

-- Add sample articles
WITH ambassador AS (SELECT id FROM ambassadors LIMIT 1)
INSERT INTO articles (ambassador_id, title, content, summary, status, published_at)
SELECT
    id,
    'Melbourne Cup Preview',
    'Comprehensive analysis of this year''s Melbourne Cup field...',
    'Expert tips for the Melbourne Cup',
    'published',
    NOW()
FROM ambassador;