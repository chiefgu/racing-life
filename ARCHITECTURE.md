# Racing Life - System Architecture & Data Flow

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RACING LIFE PLATFORM                           │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER (Vercel)                      │
├──────────────────────────────────────────────────────────────────────┤
│  Next.js 14 Frontend                                                  │
│  ├── Pages (races, news, bookmakers, ambassadors, admin)             │
│  ├── Components (OddsTable, NewsCard, WatchlistButton, etc.)         │
│  ├── WebSocket Client (Socket.io-client)                            │
│  ├── Context Providers (WebSocket, Auth)                            │
│  ├── Custom Hooks (useRaceOdds)                                     │
│  └── Styling (Tailwind CSS)                                          │
│                                                                        │
│  Ports: 3000 (dev), Vercel (prod)                                    │
│  Features: SSR, Static Generation, Real-time updates               │
└──────────────────────────────────────────────────────────────────────┘
                                  ↕
                    HTTPS / WebSocket (WSS)
                                  ↕
┌──────────────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER (Railway/Render)                   │
├──────────────────────────────────────────────────────────────────────┤
│  Express.js Backend with Socket.io                                    │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ REST API Routes (11 endpoints)                              │    │
│  │ ├── /api/auth (login, register, profile)                   │    │
│  │ ├── /api/races (race data)                                 │    │
│  │ ├── /api/bookmakers (bookmaker info)                       │    │
│  │ ├── /api/news (articles with sentiment)                    │    │
│  │ ├── /api/articles (ambassador content)                     │    │
│  │ ├── /api/ambassadors (profile data)                        │    │
│  │ ├── /api/watchlist (user watchlists)                       │    │
│  │ ├── /api/preferences (user settings)                       │    │
│  │ ├── /api/referrals (affiliate tracking)                    │    │
│  │ ├── /api/admin (admin operations)                          │    │
│  │ └── /api/sources (news source management)                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ WebSocket Server (Socket.io)                                │    │
│  │ ├── Room-based broadcasting (race subscriptions)            │    │
│  │ ├── Events: odds_update, race_status, news_update          │    │
│  │ ├── Redis adapter for multi-server coordination            │    │
│  │ └── Connection statistics & health monitoring              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Controllers Layer (11 files)                                │    │
│  │ ├── auth.controller (user authentication)                   │    │
│  │ ├── races.controller (race queries)                         │    │
│  │ ├── bookmakers.controller (bookmaker data)                  │    │
│  │ ├── news.controller (news feed)                             │    │
│  │ ├── articles.controller (content management)                │    │
│  │ ├── ambassadors.controller (profile management)             │    │
│  │ ├── admin.controller (system management)                    │    │
│  │ ├── preferences.controller (user settings)                  │    │
│  │ ├── watchlist.controller (watchlist mgmt)                   │    │
│  │ ├── referrals.controller (affiliate tracking)               │    │
│  │ └── sources.controller (source management)                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Services Layer (Business Logic)                             │    │
│  │                                                              │    │
│  │ Odds Management:                                            │    │
│  │ ├── odds-collection-job (scheduled collection)              │    │
│  │ ├── odds-processor (normalize data)                         │    │
│  │ ├── odds-storage (store & broadcast)                        │    │
│  │ ├── odds-validator (error checking)                         │    │
│  │ └── odds-collection-orchestrator (coordinate flow)          │    │
│  │                                                              │    │
│  │ Bookmaker Integration:                                      │    │
│  │ ├── bookmaker-clients (API integrations)                    │    │
│  │ └── circuit-breaker (fault tolerance)                       │    │
│  │                                                              │    │
│  │ News Processing:                                            │    │
│  │ ├── news-aggregator (collection)                            │    │
│  │ ├── news-scraper (web scraping)                             │    │
│  │ ├── sentiment-analyzer (OpenAI integration)                 │    │
│  │ ├── entity-extractor (horses, jockeys, etc.)                │    │
│  │ └── duplicate-detector (content deduplication)              │    │
│  │                                                              │    │
│  │ Infrastructure Services:                                    │    │
│  │ ├── websocket.service (event broadcasting)                  │    │
│  │ ├── cache.service (Redis caching)                           │    │
│  │ ├── pubsub.service (inter-service messaging)                │    │
│  │ └── push-notification.service (Firebase FCM)                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Middleware & Support                                        │    │
│  │ ├── Auth middleware (JWT verification)                      │    │
│  │ ├── Error handler (global error handling)                   │    │
│  │ ├── Request logger (Pino logging)                           │    │
│  │ ├── Sentry integration (error tracking)                     │    │
│  │ ├── Prometheus metrics (performance monitoring)             │    │
│  │ └── Helmet.js & CORS (security)                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  Ports: 3001 (dev), Railway/Render (prod)                            │
│  Runtime: Node.js 18+ with TypeScript                                │
└──────────────────────────────────────────────────────────────────────┘
                                  ↕
                   Database & Caching Layer
                                  ↕
┌──────────────────────────────────────────────────────────────────────┐
│                    DATA & CACHE LAYER                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────────────────┐  ┌────────────────────────┐     │
│  │ PostgreSQL + TimescaleDB       │  │ Redis Cache            │     │
│  │                                │  │                        │     │
│  │ Tables:                        │  │ Uses:                  │     │
│  │ ├── users                      │  │ ├── Session storage    │     │
│  │ ├── bookmakers                 │  │ ├── Rate limiting      │     │
│  │ ├── races                      │  │ ├── Pub/Sub messaging  │     │
│  │ ├── odds_snapshots (hypertable)│  │ ├── Cache layer        │     │
│  │ ├── ambassadors                │  │ ├── Job queue (Bull)   │     │
│  │ ├── articles                   │  │ ├── Connection stats   │     │
│  │ ├── news_articles              │  │ └── WebSocket adapter  │     │
│  │ ├── news_entities              │  │                        │     │
│  │ ├── watchlist_items            │  │ Clustering:            │     │
│  │ ├── referrals                  │  │ Redis Cluster ready    │     │
│  │ ├── fcm_tokens                 │  │ for scaling            │     │
│  │ ├── news_sources               │  │                        │     │
│  │ └── scraper_metadata           │  │                        │     │
│  │                                │  │                        │     │
│  │ Features:                      │  │ Connections:           │     │
│  │ ├── TimescaleDB for time-      │  │ ├── Connection pooling │     │
│  │ │   series optimization        │  │ ├── SSL/TLS support    │     │
│  │ ├── Automatic data compression │  │ ├── High availability  │     │
│  │ ├── Historical data retention  │  │ └── Sentinel support   │     │
│  │ ├── JSONB for flexible schema  │  │                        │     │
│  │ ├── Full-text search           │  │                        │     │
│  │ └── Row-level security         │  │                        │     │
│  └────────────────────────────────┘  └────────────────────────┘     │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
                                  ↕
                      External Services
                                  ↕
┌──────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ The Odds API       │  │ OpenAI API       │  │ Firebase       │  │
│  │ ───────────────────│  │ ──────────────────│  │ ────────────── │  │
│  │ Real-time odds     │  │ Sentiment        │  │ Cloud          │  │
│  │ Multiple bookmakers│  │ Analysis         │  │ Messaging      │  │
│  │ Australian market  │  │ Entity Extraction│  │ Push Notifs    │  │
│  │ JSON API responses │  │ Content Rewrite  │  │ Auth Service   │  │
│  │ Rate limiting      │  │ Structured output│  │ Real-time DB   │  │
│  └────────────────────┘  └──────────────────┘  └────────────────┘  │
│                                                                        │
│  ┌────────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ RSS News Feeds     │  │ Web Scrapers     │  │ Sentry         │  │
│  │ ───────────────────│  │ ──────────────────│  │ ────────────── │  │
│  │ Multiple sources   │  │ HTML parsing     │  │ Error tracking │  │
│  │ Automated polling  │  │ Duplicate detect │  │ Performance    │  │
│  │ Error handling     │  │ Content cleaning │  │ monitoring     │  │
│  └────────────────────┘  └──────────────────┘  └────────────────┘  │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
                                  ↕
                    CDN & Deployment Infrastructure
                                  ↕
┌──────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT & CDN LAYER                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ Vercel (Frontend)    │  │ Cloudflare CDN                       │ │
│  │ ────────────────────│  │ ──────────────────────────────────────│ │
│  │ Next.js hosting      │  │ Global content delivery              │ │
│  │ Auto builds/deploys  │  │ DDoS protection                      │ │
│  │ Edge functions       │  │ SSL/TLS certificates                 │ │
│  │ Analytics            │  │ Caching rules                        │ │
│  │ Automatic backups    │  │ WAF (Web Application Firewall)       │ │
│  └──────────────────────┘  │ Rate limiting                        │ │
│                            │ Image optimization                   │ │
│  ┌──────────────────────┐  │ Analytics & Monitoring               │ │
│  │ Railway (Backend)    │  │ Bot protection                       │ │
│  │ ────────────────────│  │ Performance optimization             │ │
│  │ Node.js hosting      │  └──────────────────────────────────────┘ │
│  │ Auto builds/deploys  │                                           │
│  │ PostgreSQL included  │  ┌──────────────────────────────────────┐ │
│  │ Redis included       │  │ GitHub Actions CI/CD                │ │
│  │ Domain management    │  │ ──────────────────────────────────────│ │
│  │ Environment vars     │  │ Daily database backups               │ │
│  │ Log streaming        │  │ Monthly restore testing              │ │
│  └──────────────────────┘  │ Slack notifications                  │ │
│                            │ AWS S3 backup storage                │ │
│                            └──────────────────────────────────────┘ │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Odds Collection & Broadcasting Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ ODDS COLLECTION CYCLE (Scheduled Job)                           │
└─────────────────────────────────────────────────────────────────┘

         ↓
┌─────────────────────────────────────────────────────────────────┐
│ odds-collection-job.service.ts                                  │
│ • Scheduled execution (configurable interval)                   │
│ • Pulls from multiple bookmaker APIs                            │
│ • The Odds API as primary source                                │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ odds-processor.service.ts                                       │
│ • Normalize odds formats (decimal, American)                    │
│ • Extract key data (horse name, odds, bookmaker)                │
│ • Create normalized odds objects                                │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ odds-validator.service.ts                                       │
│ • Validate data quality                                         │
│ • Check for outliers & errors                                   │
│ • Ensure data consistency                                       │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ odds-storage.service.ts                                         │
│ • Store in PostgreSQL TimescaleDB (hypertable)                  │
│ • Timestamp automatically indexed                               │
│ • Historical data compressed                                    │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ websocket.service.ts                                            │
│ • Broadcast to subscribed clients via Socket.io                 │
│ • Publish to Redis channels (for multi-server)                  │
│ • Room-based distribution (race:123 rooms)                      │
└─────────────────────────────────────────────────────────────────┘
         ↓
         ┌──────────────────────────────────────────┐
         │ Frontend Socket.io Client                │
         │ • Receives odds_update event             │
         │ • Updates React component state          │
         │ • Re-renders OddsTable component         │
         └──────────────────────────────────────────┘
```

### 2. News Aggregation & Sentiment Analysis Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ NEWS AGGREGATION CYCLE (Scheduled Job)                          │
└─────────────────────────────────────────────────────────────────┘

         ↓
┌─────────────────────────────────────────────────────────────────┐
│ news-aggregator.service.ts                                      │
│ • Pull from 5+ Australian racing news sources                   │
│ • RSS feed parsing                                              │
│ • Web scraping with Cheerio                                     │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ duplicate-detector.service.ts                                   │
│ • Content-based hashing (MD5)                                   │
│ • Check against existing articles                               │
│ • Remove duplicates before processing                           │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ sentiment-analyzer.service.ts                                   │
│ • Send content to OpenAI GPT-4o-mini                            │
│ • Classify: positive, negative, neutral                         │
│ • Extract key insights                                          │
│ • Generate confidence scores                                    │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ entity-extractor.service.ts                                     │
│ • Identify horse names                                          │
│ • Extract jockey names                                          │
│ • Find trainer mentions                                         │
│ • Locate meeting venues                                         │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ news-processor.service.ts                                       │
│ • Store article metadata in PostgreSQL                          │
│ • Create news_entities records                                  │
│ • Store sentiment scores                                        │
│ • Cache in Redis                                                │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ websocket.service.ts                                            │
│ • Broadcast news_update event to all clients                    │
│ • Real-time notification of new articles                        │
│ • Update Redis channels for multi-server sync                   │
└─────────────────────────────────────────────────────────────────┘
         ↓
         ┌──────────────────────────────────────────┐
         │ Frontend News Components                 │
         │ • NewsCard component receives update     │
         │ • NewsFilters show sentiment breakdown   │
         │ • Personalized feeds via preferences     │
         └──────────────────────────────────────────┘
```

### 3. User Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER AUTHENTICATION FLOW                                        │
└─────────────────────────────────────────────────────────────────┘

Frontend (Login Page)
    ↓
    Input: email, password
    ↓
    POST /api/auth/login
         ↓
Backend (auth.controller.ts)
    ↓
    1. Validate input
    2. Query users table
    3. Compare password with bcrypt.compare()
    4. If valid: generate JWT token (jwt.ts)
    5. Return token to client
         ↓
Frontend (auth.ts utility)
    ↓
    1. Store token in localStorage
    2. Set Authorization header for future requests
    3. Update AuthContext with user info
    4. Redirect to dashboard/home
         ↓
Protected Routes
    ↓
    Frontend: ProtectedRoute component checks auth
    Backend: auth.middleware.ts verifies JWT token
    ↓
    Both: Only allow authenticated users
    ↓
    Token expires after 7 days → requires re-login
```

### 4. WebSocket Real-time Subscription Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ WEBSOCKET SUBSCRIPTION FLOW                                     │
└─────────────────────────────────────────────────────────────────┘

Frontend Component Mounts
    ↓
    useRaceOdds(raceId) hook called
         ↓
    WebSocketContext provides socket instance
         ↓
    Emit: 'subscribe_race' event with raceId
         ↓
Backend WebSocket Server
    ↓
    Connection event handler received
    Client joined to room: 'race:123'
    Add to subscriptions map
         ↓
    When odds-storage.service emits new odds:
    broadcastToRoom('race:123', 'odds_update', data)
         ↓
All connected clients in 'race:123' room receive update
         ↓
Frontend Component
    ↓
    Receives 'odds_update' event in useRaceOdds hook
    Updates local state: setLatestOdds(data)
    Component re-renders with new odds
    Display updates in real-time (no page refresh needed)
         ↓
User unsubscribes or leaves page
    ↓
    Emit: 'unsubscribe_race' event
    Backend removes from room
    Stop broadcasting to this client
```

### 5. Ambassador Content Publication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ AMBASSADOR ARTICLE PUBLICATION FLOW                             │
└─────────────────────────────────────────────────────────────────┘

Ambassador Dashboard
    ↓
    1. Click "New Article"
    2. Fill form: title, content, images
    3. Rich text editor (RichTextEditor.tsx)
    4. Upload images to Firebase Storage
         ↓
    POST /api/articles (authenticated)
         ↓
Backend (articles.controller.ts)
    ↓
    1. Validate input & user permissions
    2. Create article record in 'articles' table
    3. Status: 'draft'
    4. Store content with metadata
    5. Extract entities (horses, jockeys, trainers)
    6. Return article ID
         ↓
Admin Moderation
    ↓
    /admin/articles page
    Review pending articles
    Approve or reject
         ↓
    If approved: UPDATE articles SET status = 'published'
         ↓
Frontend
    ↓
    1. Article appears on /articles page
    2. Author credentials displayed
    3. WebSocket broadcasts article_published event
    4. NewsCard component shows new article
    5. Real-time notifications to subscribers
         ↓
Metrics
    ↓
    Track views & engagement
    Calculate ambassador commissions
    Update revenue reports in admin dashboard
```

### 6. Affiliate Referral Tracking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ AFFILIATE REFERRAL & COMMISSION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

User Views Odds Comparison
    ↓
    OddsTable component displays bookmaker links
    Links include referral tracking parameters:
    https://bookmaker.com?ref=platform_abc123&source=ambassador_xyz
         ↓
User Clicks Bookmaker Link
    ↓
    referrals.controller.ts logs click
    POST /api/referrals/click
    Records:
    • User ID
    • Bookmaker ID
    • Source (ambassador, featured, etc.)
    • Timestamp
    • Referral URL
         ↓
Referral Conversion
    ↓
    User registers/deposits at bookmaker
    Bookmaker webhook callback or API call
    POST /api/referrals/conversion
    Records:
    • User registration
    • Deposit amount
    • Commission earned
    • Ambassador attribution
         ↓
Revenue Reporting
    ↓
    /admin/revenue page aggregates:
    • Total referrals by bookmaker
    • Conversion rates
    • Revenue by ambassador
    • Commission calculations
    • Payout scheduling
         ↓
Ambassador Dashboard
    ↓
    View personal referral stats
    Track commission earnings
    Monitor conversion rates
```

## Component Interaction Matrix

```
┌────────────────────────────────────────────────────────────────┐
│ KEY INTERACTIONS BETWEEN MAJOR COMPONENTS                      │
└────────────────────────────────────────────────────────────────┘

Frontend                          Backend                   Database
───────────────────────────────────────────────────────────────

OddsTable         ←→  odds.controller     ←→  odds_snapshots
                      odds-storage           (TimescaleDB)
                      websocket.service

NewsCard          ←→  news.controller     ←→  news_articles
                      sentiment-analyzer      news_entities
                      websocket.service       (PostgreSQL)

RaceCard          ←→  races.controller    ←→  races
                                             bookmakers

WatchlistButton   ←→  watchlist.controller ←→ watchlist_items

Header/           ←→  auth.controller    ←→  users
AuthContext           JWT verification

Ambassador        ←→  articles.controller ←→  articles
Dashboard             ambassadors.ctrl      ambassadors

NotificationSets  ←→  preferences.ctrl    ←→  preferences

OddsChart         ←→  races.controller   ← (historical data
                      + TimescaleDB          from odds_snapshots)
```

## Scalability & Performance Considerations

### Database Optimization

```
TimescaleDB Hypertables:
├── odds_snapshots (continuous data ingest)
│   ├── Automatic time-based partitioning
│   ├── Compression for old data
│   ├── Aggregate queries optimized
│   └── Time range queries (30 days) fast
│
├── news_articles
│   ├── Full-text search indexes
│   ├── Entity relationship caching
│   └── Sentiment filtering optimized
│
└── Connection pooling
    ├── Min: 2, Max: 10 (dev)
    ├── Min: 2, Max: 20 (prod)
    └── Reuse connections efficiently
```

### Caching Strategy

```
Redis Cache Layers:
├── Session data (5min TTL)
├── User preferences (1hr TTL)
├── Bookmaker configs (24hr TTL)
├── News article summaries (30min TTL)
├── Rate limiting counters (1min TTL)
└── WebSocket connection metadata
```

### WebSocket Scaling

```
Socket.io with Redis Adapter:
├── Room-based broadcasting (race:123)
├── Redis pub/sub for cross-server messaging
├── ~10,000 concurrent connections per server
├── Automatic server clustering support
└── Horizontal scaling ready
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ SECURITY LAYERS                                             │
└─────────────────────────────────────────────────────────────┘

1. Transport Layer (HTTPS/WSS)
   └── Cloudflare SSL/TLS
       TLS 1.2+ required

2. Application Layer
   ├── Helmet.js security headers
   ├── CORS validation
   ├── Rate limiting (Bottleneck)
   ├── Input validation/sanitization
   └── SQL injection prevention (Knex parameterized queries)

3. Authentication Layer
   ├── bcrypt password hashing
   ├── JWT token-based auth
   ├── Token expiration (7 days)
   └── Secure cookie flags

4. Authorization Layer
   ├── Route-level permission checks
   ├── User role verification (user, admin, ambassador)
   ├── Resource ownership validation
   └── Admin-only endpoint protection

5. Infrastructure Layer
   ├── Environment variable secrets
   ├── Database user permissions
   ├── Redis password protection
   └── API key rotation

6. Monitoring Layer
   ├── Sentry error tracking
   ├── Prometheus metrics
   ├── Request logging (Pino)
   └── Suspicious activity alerts
```
