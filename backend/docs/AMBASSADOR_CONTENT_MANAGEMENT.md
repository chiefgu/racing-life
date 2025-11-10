# Ambassador Content Management Implementation

## Overview

This document describes the implementation of the ambassador content management system, including registration, article creation, publishing workflow, and public-facing pages.

## Features Implemented

### 1. Ambassador Registration and Approval Workflow

**Backend:**

- `POST /api/ambassadors/apply` - Apply to become an ambassador
- `GET /api/ambassadors/admin/pending` - Get pending applications (admin)
- `PUT /api/ambassadors/:id/approve` - Approve ambassador (admin)
- `PUT /api/ambassadors/:id/reject` - Reject ambassador (admin)
- `PUT /api/ambassadors/:id/suspend` - Suspend ambassador (admin)
- `PUT /api/ambassadors/:id/activate` - Reactivate ambassador (admin)
- `GET /api/ambassadors/:id` - Get ambassador profile
- `PUT /api/ambassadors/:id` - Update ambassador profile
- `GET /api/ambassadors` - Get all active ambassadors

**Frontend:**

- `/ambassadors/apply` - Ambassador application form
- `/admin/ambassadors` - Admin approval interface

**Features:**

- User can apply to become an ambassador with name, bio, and social links
- Automatic slug generation from name
- Admin can approve/reject applications
- Commission rate configuration on approval
- User role automatically updated to 'ambassador' on approval
- Ambassador suspension/activation management

### 2. Article Creation and Editing Interface

**Backend:**

- `POST /api/articles` - Create new article
- `GET /api/articles/:id` - Get article by ID
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `GET /api/articles` - Get all articles with filters
- `GET /api/articles/ambassador/:ambassadorId` - Get articles by ambassador

**Frontend:**

- `/ambassadors/articles/new` - Article creation page
- `/ambassadors/articles/[id]/edit` - Article editing page
- `/ambassadors/articles/[id]` - Article view page (for authors)
- Rich text editor component with markdown support

**Features:**

- Rich text editor with formatting toolbar (bold, italic, headings, lists, links)
- Image upload support via URL
- Article preview mode
- Tag management (comma-separated)
- Related races linking
- Automatic slug generation from title
- Draft/pending/published status management
- View and click tracking

### 3. Article Publishing Workflow

**Backend:**

- `GET /api/articles/admin/pending` - Get pending articles (admin)
- `PUT /api/articles/:id/publish` - Publish article (admin)
- `PUT /api/articles/:id/reject` - Reject article (admin)
- `PUT /api/articles/:id/archive` - Archive article

**Frontend:**

- `/admin/articles` - Admin moderation queue

**Features:**

- Draft → Pending → Published workflow
- Admin moderation queue showing all pending articles
- Article preview in moderation queue
- Rejection with optional feedback reason
- Scheduled publishing support
- Article archiving
- Automatic published_at timestamp on first publish

### 4. Ambassador Dashboard

**Backend:**

- `GET /api/ambassadors/:id/stats` - Get ambassador statistics

**Frontend:**

- `/ambassadors/dashboard` - Ambassador dashboard

**Features:**

- Article statistics (total, published, draft, pending)
- View and click metrics
- Referral statistics (total, conversions, conversion rate)
- Earnings tracking with commission rate
- Top performing articles list
- Recent referrals table with conversion status
- Quick action to create new article

### 5. Public Ambassador Pages

**Frontend:**

- `/ambassadors` - Ambassador directory
- `/ambassadors/[slug]` - Individual ambassador profile
- `/articles/[id]` - Public article view

**Features:**

- Ambassador directory with profile cards
- Individual ambassador profiles with bio and social links
- Ambassador article listings
- Public article pages with author information
- Related races display
- Tag filtering
- Social media links

## Database Schema

### Tables Used

- `ambassadors` - Ambassador profiles
- `ambassador_social_links` - Social media links
- `articles` - Article content
- `article_tags` - Article tags
- `article_related_races` - Race associations
- `referrals` - Affiliate tracking

### Key Fields

**ambassadors:**

- `user_id` - Link to user account
- `name` - Display name
- `slug` - URL-friendly identifier
- `bio` - Biography
- `profile_image_url` - Profile picture
- `commission_rate` - Referral commission percentage
- `status` - pending/active/suspended

**articles:**

- `ambassador_id` - Author
- `title` - Article title
- `slug` - URL-friendly identifier
- `content` - Article body
- `excerpt` - Summary
- `featured_image_url` - Header image
- `status` - draft/pending/published/archived
- `published_at` - Publication timestamp
- `views` - View count
- `clicks` - Click count

## API Endpoints Summary

### Public Endpoints

- `GET /api/ambassadors` - List active ambassadors
- `GET /api/ambassadors/:id` - Get ambassador profile
- `GET /api/articles` - List published articles
- `GET /api/articles/:id` - Get article
- `GET /api/articles/ambassador/:ambassadorId` - Get ambassador's articles

### Authenticated User Endpoints

- `POST /api/ambassadors/apply` - Apply as ambassador

### Ambassador Endpoints

- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `PUT /api/articles/:id/archive` - Archive article
- `PUT /api/ambassadors/:id` - Update profile
- `GET /api/ambassadors/:id/stats` - Get statistics

### Admin Endpoints

- `GET /api/ambassadors/admin/pending` - Pending applications
- `PUT /api/ambassadors/:id/approve` - Approve ambassador
- `PUT /api/ambassadors/:id/reject` - Reject ambassador
- `PUT /api/ambassadors/:id/suspend` - Suspend ambassador
- `PUT /api/ambassadors/:id/activate` - Activate ambassador
- `GET /api/articles/admin/pending` - Pending articles
- `PUT /api/articles/:id/publish` - Publish article
- `PUT /api/articles/:id/reject` - Reject article

## Security & Permissions

### Role-Based Access Control

- **User**: Can apply to become ambassador
- **Ambassador**: Can create/edit/delete own articles, view own stats
- **Admin**: Full access to approve/reject ambassadors and articles

### Authorization Checks

- Article authors can only edit/delete their own articles
- Ambassadors can only view their own statistics
- Admin can override all permissions
- Unpublished articles only visible to author and admin

## Integration Points

### Referral Tracking

- Articles track clicks through `clicks` field
- Referrals table links articles to bookmaker conversions
- Commission calculated based on ambassador's commission_rate

### News Integration

- Articles can be linked to specific races
- Related races displayed on article pages
- Potential for cross-promotion with news feed

## Future Enhancements

1. **Rich Text Editor Improvements**
   - WYSIWYG editor (e.g., TipTap, Quill)
   - Image upload to cloud storage
   - Embedded media support

2. **Article Features**
   - Article scheduling
   - Co-authoring support
   - Version history
   - Comments section

3. **Ambassador Features**
   - Performance analytics dashboard
   - Earnings reports
   - Content calendar
   - Notification system

4. **Admin Features**
   - Bulk article operations
   - Content guidelines enforcement
   - Ambassador performance reports
   - Revenue analytics

## Testing Recommendations

1. **Unit Tests**
   - Ambassador application validation
   - Article creation/update logic
   - Permission checks
   - Slug generation uniqueness

2. **Integration Tests**
   - Complete registration workflow
   - Article publishing workflow
   - Referral tracking
   - Statistics calculation

3. **E2E Tests**
   - User applies as ambassador → admin approves → creates article → publishes
   - Public views article → clicks bookmaker link → conversion tracked
   - Ambassador views dashboard with statistics

## Deployment Notes

- Ensure database migrations are run for ambassadors and articles tables
- Configure image upload service if implementing file uploads
- Set up email notifications for application approvals/rejections
- Monitor article moderation queue for timely reviews
