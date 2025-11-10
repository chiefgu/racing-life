# Frontend Deployment Guide - Vercel

This guide covers deploying the horse racing platform frontend to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed: `npm install -g vercel`
- Backend API deployed and accessible
- Firebase project configured for push notifications
- Sentry project configured for error tracking

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project to Vercel

From the `frontend` directory:

```bash
cd frontend
vercel link
```

Follow the prompts to:

- Select your Vercel scope (personal or team)
- Link to existing project or create new one
- Confirm the project directory

### 4. Configure Environment Variables

Set up environment variables in Vercel Dashboard or via CLI:

#### Via Vercel Dashboard:

1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

| Variable Name                              | Description                  | Example                          |
| ------------------------------------------ | ---------------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL`                      | Backend API URL              | `https://api.yourdomain.com/api` |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase API Key             | From Firebase Console            |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain         | `your-project.firebaseapp.com`   |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase Project ID          | `your-project-id`                |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase Storage Bucket      | `your-project.appspot.com`       |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789`                      |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase App ID              | `1:123456789:web:abcdef`         |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`           | Firebase VAPID Key           | From Firebase Console            |
| `NEXT_PUBLIC_SENTRY_DSN`                   | Sentry DSN                   | `https://...@sentry.io/...`      |

#### Via CLI:

```bash
# Production environment
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
vercel env add NEXT_PUBLIC_FIREBASE_VAPID_KEY production
vercel env add NEXT_PUBLIC_SENTRY_DSN production

# Preview environment (optional)
vercel env add NEXT_PUBLIC_API_URL preview
# ... repeat for other variables
```

### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod
```

Or push to your main branch if you have Git integration enabled.

### 6. Configure Custom Domain

#### Via Vercel Dashboard:

1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Domains
3. Add your custom domain (e.g., `www.yourdomain.com`)
4. Follow DNS configuration instructions

#### DNS Configuration:

Add the following DNS records at your domain registrar:

**For apex domain (yourdomain.com):**

```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Via CLI:

```bash
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com
```

### 7. Configure SSL Certificate

Vercel automatically provisions SSL certificates for all domains. No manual configuration needed.

### 8. Update Backend CORS Settings

Update your backend to allow requests from your Vercel domain:

```typescript
// backend/src/index.ts
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'https://your-vercel-app.vercel.app',
];
```

## Continuous Deployment

### Git Integration

1. Connect your Git repository in Vercel Dashboard
2. Go to Settings > Git
3. Connect to GitHub, GitLab, or Bitbucket
4. Select your repository

**Automatic Deployments:**

- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment
- Pull requests → Preview deployment with unique URL

### Deployment Hooks

Create deployment hooks for manual triggers:

```bash
# Via Dashboard: Settings > Git > Deploy Hooks
# Create hook and get URL

# Trigger deployment via webhook
curl -X POST https://api.vercel.com/v1/integrations/deploy/...
```

## Environment-Specific Configuration

### Production

- Uses production environment variables
- Deployed from `main` branch
- Custom domain configured
- Analytics enabled

### Preview

- Uses preview environment variables
- Deployed from feature branches
- Unique preview URL per deployment
- Useful for testing before production

### Development

- Local development only
- Uses `.env.local` file
- Run with `npm run dev`

## Monitoring and Analytics

### Vercel Analytics

Enable Vercel Analytics in your project:

1. Go to Analytics tab in Vercel Dashboard
2. Enable Web Analytics
3. View real-time performance metrics

### Performance Monitoring

Monitor Core Web Vitals:

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Error Tracking

Errors are automatically sent to Sentry (configured via `NEXT_PUBLIC_SENTRY_DSN`).

## Build Configuration

### Build Settings

The following settings are configured in `vercel.json`:

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x (default)

### Build Optimization

- **Image Optimization**: Enabled via Next.js Image component
- **Code Splitting**: Automatic via Next.js
- **Tree Shaking**: Enabled in production builds
- **Minification**: Enabled via SWC compiler

## Rollback and Versioning

### Rollback to Previous Deployment

Via Dashboard:

1. Go to Deployments tab
2. Find previous successful deployment
3. Click "..." menu → Promote to Production

Via CLI:

```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

### Deployment Aliases

Create aliases for specific deployments:

```bash
vercel alias <deployment-url> staging.yourdomain.com
```

## Troubleshooting

### Build Failures

**Check build logs:**

```bash
vercel logs <deployment-url>
```

**Common issues:**

- Missing environment variables
- TypeScript errors
- Dependency installation failures
- Out of memory errors (increase Node memory)

### Runtime Errors

**Check function logs:**

```bash
vercel logs <deployment-url> --follow
```

**Common issues:**

- API connection failures (check CORS)
- Environment variable not set
- Firebase configuration errors

### Performance Issues

**Analyze bundle size:**

```bash
npm run build
# Check .next/analyze output
```

**Optimize:**

- Enable image optimization
- Use dynamic imports for large components
- Implement code splitting
- Enable caching headers

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Use Vercel environment variables
3. **CORS**: Configure backend to only allow your domain
4. **Headers**: Security headers configured in `vercel.json`
5. **SSL**: Always use HTTPS (automatic with Vercel)

## Cost Optimization

### Vercel Pricing Tiers

- **Hobby**: Free for personal projects
- **Pro**: $20/month per user
- **Enterprise**: Custom pricing

### Optimize Costs:

1. **Image Optimization**: Use Next.js Image component
2. **Caching**: Implement proper cache headers
3. **Edge Functions**: Use for frequently accessed data
4. **Bandwidth**: Optimize images and assets

## Maintenance

### Regular Tasks

- **Weekly**: Review deployment logs and analytics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize performance metrics

### Updates

```bash
# Update dependencies
npm update

# Deploy updates
vercel --prod
```

## Support and Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Vercel Support**: support@vercel.com
- **Community**: https://github.com/vercel/vercel/discussions

## Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Custom domain configured and SSL active
- [ ] Backend CORS configured for production domain
- [ ] Firebase push notifications tested
- [ ] Sentry error tracking verified
- [ ] Analytics enabled
- [ ] Performance metrics reviewed
- [ ] Security headers verified
- [ ] Backup deployment strategy in place
- [ ] Monitoring and alerting configured
