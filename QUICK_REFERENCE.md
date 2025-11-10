# Racing Life - Quick Reference Guide

## File Locations Quick Index

### Backend Structure

```
backend/
├── src/
│   ├── index.ts                      # Main server entry point
│   ├── config/                       # Configuration modules
│   │   ├── database.ts               # PostgreSQL pool setup
│   │   ├── redis.ts                  # Redis client configuration
│   │   ├── websocket.ts              # Socket.io server setup
│   │   ├── logger.ts                 # Pino logger
│   │   ├── bookmakers.ts             # Bookmaker API configs
│   │   ├── news-sources.ts           # RSS/scraper configs
│   │   ├── openai.ts                 # OpenAI API setup
│   │   ├── sentry.ts                 # Error tracking
│   │   └── metrics.ts                # Prometheus metrics
│   ├── controllers/                  # Request handlers (11 files)
│   ├── services/                     # Business logic
│   │   ├── odds*/                    # Odds collection & processing
│   │   ├── bookmaker/                # Bookmaker API clients
│   │   ├── news/                     # News aggregation & processing
│   │   ├── websocket.service.ts      # WebSocket broadcasting
│   │   ├── cache.service.ts          # Redis caching
│   │   ├── pubsub.service.ts         # Redis pub/sub
│   │   └── push-notification.service.ts # Firebase messaging
│   ├── routes/                       # API endpoint definitions
│   ├── middleware/                   # Express middleware
│   ├── types/                        # TypeScript type definitions
│   ├── utils/                        # Utility functions
│   └── db/
│       ├── migrations/               # Database schema (11 files)
│       ├── knex.ts                   # Knex connection pool
│       └── schema.sql                # Database schema documentation
├── package.json                      # Backend dependencies
├── knexfile.ts                       # Knex configuration
├── tsconfig.json                     # TypeScript config
├── .env.example                      # Environment variables template
├── README.md                         # Quick start guide
├── SETUP.md                          # Local setup instructions
├── DEPLOYMENT.md                     # Production deployment guide
├── MONITORING.md                     # Observability guide
├── BACKUP_GUIDE.md                   # Database backup procedures
├── railway.json                      # Railway deployment config
└── docs/                             # Implementation documentation (11 files)
```

### Frontend Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js pages (App Router)
│   │   ├── page.tsx                  # Home page
│   │   ├── layout.tsx                # Root layout wrapper
│   │   ├── globals.css               # Global styles
│   │   ├── robots.ts                 # SEO robots.txt
│   │   ├── sitemap.ts                # SEO sitemap
│   │   ├── races/                    # Race pages
│   │   ├── news/                     # News pages
│   │   ├── bookmakers/               # Bookmaker pages
│   │   ├── articles/                 # Article pages
│   │   ├── ambassadors/              # Ambassador pages
│   │   ├── guides/                   # Educational guides
│   │   ├── account/                  # User account pages
│   │   ├── admin/                    # Admin pages
│   │   ├── login/                    # Login page
│   │   └── register/                 # Registration page
│   ├── components/                   # React components (24 files)
│   │   ├── Header.tsx                # Top navigation
│   │   ├── Footer.tsx                # Footer
│   │   ├── OddsTable.tsx             # Odds comparison
│   │   ├── OddsTableMobile.tsx       # Mobile odds
│   │   ├── OddsChart.tsx             # Odds visualization
│   │   ├── RaceCard.tsx              # Race preview
│   │   ├── NewsCard.tsx              # News preview
│   │   ├── WatchlistButton.tsx       # Watchlist toggle
│   │   ├── NotificationSettings.tsx  # Notification preferences
│   │   ├── WebSocketStatus.tsx       # Connection indicator
│   │   ├── ErrorBoundary.tsx         # Error handling
│   │   └── ... (17 more components)
│   ├── contexts/                     # React context providers
│   │   ├── WebSocketContext.tsx      # Real-time connection state
│   │   └── AuthContext.tsx           # Authentication state
│   ├── hooks/                        # Custom React hooks
│   │   └── useRaceOdds.ts            # WebSocket subscription hook
│   ├── lib/                          # Utility functions
│   │   ├── api.ts                    # API client
│   │   ├── auth.ts                   # Auth helpers
│   │   └── ... (other utilities)
│   └── types/                        # TypeScript types
├── package.json                      # Frontend dependencies
├── tsconfig.json                     # TypeScript config
├── .env.example                      # Environment variables template
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS config
├── vercel.json                       # Vercel deployment config
├── README.md                         # Quick start guide
├── SEO_IMPLEMENTATION.md             # SEO guide
└── DESIGN_TRANSFORMATION.md          # Design documentation
```

## Essential Commands

### Development

```bash
# Install all dependencies
npm install

# Start backend (port 3001)
npm run dev:backend

# Start frontend (port 3000)
npm run dev:frontend

# Run both simultaneously (in separate terminals)
npm run dev:backend & npm run dev:frontend
```

### Database

```bash
# Run migrations
npm run migrate:latest

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:rollback

# Create new migration
npm run migrate:make migration_name
```

### Code Quality

```bash
# Format all code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Type check
cd backend && npm run type-check
cd frontend && npm run type-check
```

### Build & Production

```bash
# Build both workspaces
npm run build:backend
npm run build:frontend

# Start production server
cd backend && npm run start
cd frontend && npm run start
```

## Key API Endpoints

### Health & Metrics

- `GET /health` - Service health check
- `GET /metrics` - Prometheus metrics

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user profile

### Racing Data

- `GET /api/races` - List all races
- `GET /api/races/:id` - Get specific race
- `GET /api/bookmakers` - List bookmakers
- `GET /api/races/:id/odds` - Get race odds

### News

- `GET /api/news` - List news articles
- `GET /api/news?sentiment=positive` - Filter by sentiment
- `GET /api/news/:id` - Get article details

### User Data

- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences

### Ambassador Content

- `GET /api/ambassadors` - List ambassadors
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article (ambassador only)
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Admin

- `GET /api/admin/stats` - System statistics
- `GET /api/admin/ambassadors` - Manage ambassadors
- `GET /api/admin/revenue` - Revenue reports

## WebSocket Events

### Client → Server

- `subscribe_race:raceId` - Subscribe to race odds
- `unsubscribe_race:raceId` - Unsubscribe from race
- `ping` - Keep-alive ping

### Server → Client (Real-time)

- `odds_update` - New odds data
- `race_status` - Race status change
- `news_update` - New article published
- `notification` - User-specific alert

## Environment Variables

### Backend (.env)

```
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=horse_racing
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
ODDS_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
SENTRY_DSN=https://your-sentry-dsn
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

## Database Tables

| Table             | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `users`           | User authentication & profiles            |
| `bookmakers`      | Bookmaker configurations                  |
| `races`           | Race metadata & schedule                  |
| `odds_snapshots`  | Time-series odds (TimescaleDB hypertable) |
| `ambassadors`     | Ambassador profiles                       |
| `articles`        | Ambassador content                        |
| `news_articles`   | Aggregated news                           |
| `news_entities`   | Entity mentions (horses, jockeys, etc.)   |
| `watchlist_items` | User watchlists                           |
| `referrals`       | Affiliate tracking                        |
| `fcm_tokens`      | Firebase push tokens                      |

## Technology Stack Summary

### Backend

- **Runtime:** Node.js 18+ with TypeScript
- **Web:** Express.js
- **Database:** PostgreSQL + TimescaleDB
- **Cache/Queue:** Redis + Bull
- **Real-time:** Socket.io
- **APIs:** The Odds API, OpenAI GPT, Firebase
- **Monitoring:** Sentry, Prometheus

### Frontend

- **Framework:** Next.js 14
- **UI:** React 18 + Tailwind CSS
- **Charts:** Recharts
- **Real-time:** Socket.io-client
- **Notifications:** Firebase
- **Error Tracking:** Sentry

## Deployment Checklist

### Backend Deployment (Railway/Render)

- [ ] Create hosting account
- [ ] Set environment variables
- [ ] Enable PostgreSQL + TimescaleDB
- [ ] Enable Redis
- [ ] Run migrations
- [ ] Test health endpoint
- [ ] Configure domain
- [ ] Set up automated backups

### Frontend Deployment (Vercel)

- [ ] Create Vercel account
- [ ] Connect GitHub repo
- [ ] Set environment variables
- [ ] Build and deploy
- [ ] Verify domain
- [ ] Test functionality

### Cloudflare Setup

- [ ] Add domain to Cloudflare
- [ ] Update nameservers
- [ ] Configure DNS records
- [ ] Set SSL/TLS mode to Full (Strict)
- [ ] Enable caching rules
- [ ] Configure WAF rules
- [ ] Set up rate limiting

## Common Patterns

### Adding a New API Endpoint

1. Create controller method in `backend/src/controllers/`
2. Create service method in `backend/src/services/`
3. Add route in `backend/src/routes/`
4. Create TypeScript types if needed
5. Test with health check endpoint

### Adding a New Frontend Page

1. Create page file in `frontend/src/app/`
2. Create components in `frontend/src/components/`
3. Add hooks/contexts as needed
4. Import and use API client
5. Add TypeScript types

### Broadcasting Real-time Data

1. Emit data in backend service
2. Use WebSocket service: `broadcastToRoom()`
3. Subscribe in frontend: `useRaceOdds(raceId)`
4. Handle updates in component state

## Documentation Files to Read First

1. **Backend Setup:** `backend/SETUP.md`
2. **Project Overview:** `README.md`
3. **Architecture:** `backend/src/index.ts` (main entry)
4. **Task Summaries:** `backend/docs/TASK_*_COMPLETION_SUMMARY.md`
5. **Deployment:** `backend/DEPLOYMENT.md`

## Getting Help

- **Setup Issues:** See `backend/SETUP.md` troubleshooting
- **Deployment:** See `backend/DEPLOYMENT.md`
- **WebSocket:** See `backend/docs/WEBSOCKET_IMPLEMENTATION.md`
- **News Processing:** See `backend/docs/SENTIMENT_ANALYSIS_IMPLEMENTATION.md`
- **Type Errors:** Check `backend/src/types/` and `frontend/src/types/`

## Performance Tips

1. **Database:** Use TimescaleDB queries for historical odds
2. **Cache:** Redis caches frequently accessed data
3. **Real-time:** WebSocket reduces polling overhead
4. **Frontend:** Next.js automatic code splitting
5. **CDN:** Cloudflare caches static assets
6. **Monitoring:** Check Prometheus metrics for bottlenecks

## Security Reminders

- Keep `.env` files in `.gitignore`
- Change JWT_SECRET before production
- Enable HTTPS in production
- Use rate limiting on all public endpoints
- Validate all user inputs
- Store sensitive credentials in environment variables
- Enable Cloudflare WAF in production
