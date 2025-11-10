# User Features and Personalization Implementation

## Overview

This document describes the implementation of user authentication, watchlist functionality, personalized news feeds, and user preferences for the horse racing platform.

## Implemented Features

### 1. User Authentication UI (Task 9.1)

#### Frontend Components

**Authentication Library (`frontend/src/lib/auth.ts`)**

- Token management (localStorage-based)
- User session management
- Login/register/logout functions
- Authentication state checking

**Auth Context (`frontend/src/contexts/AuthContext.tsx`)**

- Global authentication state management
- User information access across components
- Automatic token refresh on mount
- Logout functionality

**Protected Route Component (`frontend/src/components/ProtectedRoute.tsx`)**

- Route protection wrapper
- Automatic redirect to login for unauthenticated users
- Role-based access control support
- Loading state handling

**Login Page (`frontend/src/app/login/page.tsx`)**

- Email/password login form
- Error handling and validation
- Redirect support after login
- Link to registration page

**Register Page (`frontend/src/app/register/page.tsx`)**

- User registration form with validation
- Password confirmation
- Automatic login after registration
- Link to login page

**Header Updates (`frontend/src/components/Header.tsx`)**

- Login/logout buttons
- User name display when authenticated
- Sign up button for new users

#### Backend Integration

- JWT token management already implemented
- Auth middleware for protected routes
- User profile endpoint (`GET /api/auth/me`)

### 2. Watchlist Functionality (Task 9.2)

#### Backend Implementation

**Watchlist Controller (`backend/src/controllers/watchlist.controller.ts`)**

- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add item to watchlist
- `DELETE /api/watchlist/:id` - Remove item from watchlist
- `GET /api/watchlist/check` - Check if items are in watchlist

**Watchlist Routes (`backend/src/routes/watchlist.routes.ts`)**

- All routes require authentication
- RESTful API design

**Database Schema**

- Uses existing `watchlist_items` table
- Supports horses, jockeys, trainers, and meetings
- Unique constraint per user/entity combination

#### Frontend Implementation

**Account Page (`frontend/src/app/account/page.tsx`)**

- Display user profile information
- Watchlist management interface
- Add items to watchlist by type and name
- Remove items from watchlist
- Grouped display by entity type (horses, jockeys, trainers, meetings)

**Watchlist Button Component (`frontend/src/components/WatchlistButton.tsx`)**

- Reusable component for adding/removing items
- Star icon with filled/unfilled states
- Automatic authentication check
- Optimistic UI updates

**API Client Updates (`frontend/src/lib/api.ts`)**

- `getWatchlist()` - Fetch user's watchlist
- `addToWatchlist(entityType, entityName)` - Add item
- `removeFromWatchlist(id)` - Remove item
- `checkWatchlist(entityType, entityNames)` - Batch check

### 3. Personalized News Feed (Task 9.3)

#### Backend Implementation

**News Controller Updates (`backend/src/controllers/news.controller.ts`)**

- `GET /api/news/personalized/feed` - Get personalized news based on watchlist
- Matches news articles with watchlist entities
- Relevance scoring based on number of matched entities
- Returns entity-specific sentiment for watchlist items

**Algorithm**

1. Fetch user's watchlist items
2. Find news articles mentioning those entities
3. Score articles by number of watchlist matches
4. Sort by relevance score and recency
5. Include entity sentiments for matched items

#### Frontend Implementation

**News Page Updates (`frontend/src/app/news/page.tsx`)**

- Toggle between all news and personalized feed
- Display watchlist count
- Show personalized feed indicator
- Link to add watchlist items if empty
- Loading states and error handling

**Features**

- Seamless switching between feeds
- Maintains existing filter functionality
- Shows relevance indicators
- Encourages watchlist usage

### 4. User Preferences and Notifications (Task 9.4)

#### Backend Implementation

**Preferences Controller (`backend/src/controllers/preferences.controller.ts`)**

- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences
- `POST /api/preferences/notifications/test` - Send test notification

**Preferences Routes (`backend/src/routes/preferences.routes.ts`)**

- All routes require authentication
- RESTful API design

**Database Schema**

- Uses existing `user_preferences` table
- Fields:
  - `notifications_news` - Enable news notifications
  - `notifications_watchlist` - Enable watchlist notifications
  - `email_digest_enabled` - Enable daily email digest
  - `email_digest_time` - Time for daily digest (HH:MM:SS)

#### Frontend Implementation

**Preferences Page (`frontend/src/app/account/preferences/page.tsx`)**

- Notification settings management
- Email digest configuration
- Time picker for digest delivery
- Test notification button
- Save/cancel actions
- Success/error feedback

**Features**

- Toggle notifications on/off
- Configure email digest schedule
- Send test emails
- Real-time validation
- Persistent settings

## API Endpoints Summary

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Watchlist

- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add item to watchlist
- `DELETE /api/watchlist/:id` - Remove item
- `GET /api/watchlist/check` - Check if items are in watchlist

### News

- `GET /api/news` - Get all news (existing)
- `GET /api/news/personalized/feed` - Get personalized news feed (new)
- `GET /api/news/:id` - Get specific article (existing)

### Preferences

- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences
- `POST /api/preferences/notifications/test` - Send test notification

## Frontend Routes

### Public Routes

- `/login` - Login page
- `/register` - Registration page

### Protected Routes

- `/account` - User account dashboard
- `/account/preferences` - User preferences management

## Type Definitions

### Frontend Types (`frontend/src/types/index.ts`)

```typescript
interface WatchlistItem {
  id: string;
  name: string;
  createdAt: string;
}

interface Watchlist {
  horse?: WatchlistItem[];
  jockey?: WatchlistItem[];
  trainer?: WatchlistItem[];
  meeting?: WatchlistItem[];
}

interface UserPreferences {
  notifications_news: boolean;
  notifications_watchlist: boolean;
  email_digest_enabled: boolean;
  email_digest_time: string;
}
```

## Security Considerations

1. **Authentication**
   - JWT tokens stored in localStorage
   - Tokens included in Authorization header
   - Automatic token validation on protected routes

2. **Authorization**
   - All watchlist/preferences routes require authentication
   - Users can only access their own data
   - Database queries filtered by user_id

3. **Input Validation**
   - Entity type validation (horse, jockey, trainer, meeting)
   - Time format validation for email digest
   - Duplicate prevention in watchlist

## Future Enhancements

1. **Push Notifications**
   - Firebase Cloud Messaging integration
   - Real-time notifications for watchlist updates
   - Browser notification support

2. **Email Notifications**
   - Actual email sending service (SendGrid, AWS SES)
   - Email templates for digests
   - Unsubscribe functionality

3. **Advanced Personalization**
   - Machine learning-based recommendations
   - User behavior tracking
   - Personalized odds alerts

4. **Social Features**
   - Share watchlists with friends
   - Follow other users
   - Community tips and insights

## Testing Recommendations

1. **Authentication Flow**
   - Test registration with various inputs
   - Test login with valid/invalid credentials
   - Test token expiration handling
   - Test protected route access

2. **Watchlist**
   - Add/remove items
   - Duplicate prevention
   - Cross-entity type functionality
   - Persistence across sessions

3. **Personalized Feed**
   - Empty watchlist handling
   - Multiple entity matches
   - Relevance scoring accuracy
   - Performance with large watchlists

4. **Preferences**
   - Toggle settings
   - Time picker validation
   - Preference persistence
   - Test notification delivery

## Performance Considerations

1. **Caching**
   - Watchlist cached in memory after first load
   - News feed results cached for 5 minutes
   - User preferences cached client-side

2. **Database Queries**
   - Indexed on user_id for fast lookups
   - Efficient joins for personalized feed
   - Pagination support for large result sets

3. **Frontend Optimization**
   - Lazy loading of account pages
   - Optimistic UI updates for watchlist
   - Debounced API calls where appropriate

## Conclusion

All four sub-tasks of Task 9 have been successfully implemented:

- ✅ 9.1 User authentication UI with login/register pages
- ✅ 9.2 Watchlist functionality with full CRUD operations
- ✅ 9.3 Personalized news feed based on watchlist
- ✅ 9.4 User preferences and notification settings

The implementation provides a solid foundation for user personalization and can be extended with additional features as needed.
