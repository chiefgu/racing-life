# Racing Life Launch Checklist

## 🚀 Landing Page is Ready!

Your email capture landing page is live at: **`/landing`**

Example URL: `https://yourdomain.com/landing`

---

## ✅ What's Included

The landing page (`/app/landing/page.tsx`) features:

- **Large hero section** with email signup form
- **3 key features** (Odds Comparison, Expert Tips, AI Insights)
- **Bookmaker partnerships** showcase
- **Social proof** (50,000+ subscribers stats)
- **Second CTA section** at bottom for conversion
- **Simple footer** (no header/nav to keep focus on conversion)
- **Success state** when email is submitted
- **SEO-optimized** metadata
- **Fully responsive** design
- **Editorial aesthetic** matching your design system

---

## 📋 Pre-Launch Tasks

### 1. Connect Email Service

The landing page currently logs emails to console. You need to connect it to your email service:

**Option A: Mailchimp**

```typescript
// In /app/landing/page.tsx, replace handleSubmit with:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (res.ok) {
    setSubmitted(true);
  }
};
```

**Option B: ConvertKit, Beehiiv, Substack, etc.**

- Create API endpoint at `/app/api/subscribe/route.ts`
- Connect to your email provider's API
- Handle the POST request from the form

### 2. Update Stats (if needed)

Currently showing:

- 50,000+ subscribers
- 10+ bookmakers
- Daily tips

Update these in `/app/landing/page.tsx` if you want different numbers.

### 3. Deploy to Production

#### Option 1: Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts to deploy
# Custom domain setup available in Vercel dashboard
```

#### Option 2: Cloudflare Pages

```bash
# Build the project
cd frontend
npm run build

# Deploy to Cloudflare Pages via dashboard
# Upload the .next folder
```

#### Option 3: Your Own Server

```bash
# Build
npm run build

# Start production server
npm start
```

### 4. Set Up Custom Domain

Once deployed, point your domain to:

- **Main site:** `yourdomain.com` → your homepage
- **Landing:** `yourdomain.com/landing` → landing page

Or use a subdomain:

- `launch.racinglife.com.au`
- `join.racinglife.com.au`
- `signup.racinglife.com.au`

### 5. Set Up Analytics

Add Google Analytics or Plausible to track:

- Page views
- Email signups
- Conversion rate
- Traffic sources

### 6. Test Before Launch

- [ ] Test email form submission
- [ ] Verify success message appears
- [ ] Check mobile responsiveness
- [ ] Test all links in footer
- [ ] Verify page loads quickly
- [ ] Check SEO meta tags
- [ ] Test on different browsers

---

## 🎯 Launch Strategy

### Immediate (Week 1)

1. **Deploy landing page** to production
2. **Set up email service** (Mailchimp, ConvertKit, etc.)
3. **Create welcome email** sequence
4. **Share on social media:**
   - LinkedIn
   - Twitter/X
   - Facebook groups
   - Reddit (r/horseracing, Australian subs)

### Short-term (Week 2-4)

1. **Create basic content:**
   - First daily newsletter
   - Sample odds comparison
   - One expert tip article

2. **Partner outreach:**
   - Contact bookmakers for affiliate programs
   - Reach out to racing influencers
   - Join racing forums/communities

3. **SEO basics:**
   - Submit to Google Search Console
   - Create sitemap
   - Set up Google My Business

### Medium-term (Month 2-3)

1. **Build out features:**
   - Live odds page
   - First news articles
   - Expert tips section

2. **Content marketing:**
   - Publish 2-3 articles per week
   - Start newsletter consistently
   - Share on social media

3. **Grow email list:**
   - Run small ads (Facebook, Google)
   - Partner with racing sites
   - Guest post on racing blogs

---

## 📊 Tracking Success

### Key Metrics to Monitor

- **Email signups per day**
- **Landing page conversion rate** (target: 5-15%)
- **Email open rates** (target: 25-35%)
- **Click-through rates** (target: 3-8%)
- **Traffic sources** (which channels work best)

### Tools to Use

- **Analytics:** Google Analytics, Plausible
- **Email:** Mailchimp, ConvertKit, Beehiiv
- **Social:** Buffer, Hootsuite
- **SEO:** Google Search Console, Ahrefs

---

## 🔧 Technical Notes

### Current Setup

- **Framework:** Next.js 16.0.1 (App Router)
- **Styling:** Tailwind CSS
- **Route:** `/app/landing/page.tsx`
- **Layout:** Custom layout (no header/footer)
- **Form:** Client-side React state management

### Email Integration Options

**Recommended Services:**

1. **Beehiiv** - Built for newsletters, great analytics
2. **ConvertKit** - Creator-focused, easy automation
3. **Mailchimp** - Popular, free tier available
4. **Substack** - If you want to monetize later

### Environment Variables Needed

```env
# Add to .env.local
NEXT_PUBLIC_MAILCHIMP_API_KEY=your_key
NEXT_PUBLIC_MAILCHIMP_AUDIENCE_ID=your_id

# Or for ConvertKit
CONVERTKIT_API_KEY=your_key
CONVERTKIT_FORM_ID=your_form_id
```

---

## 🎨 Customization

### Changing Text/Copy

All text is in `/app/landing/page.tsx`. Search for:

- Hero headline: "Australia's Premier Horse Racing..."
- Feature descriptions
- CTA button text
- Trust indicators

### Changing Colors

Currently using editorial design (black/white/gray). To customize:

- Buttons: `bg-black` → change to your brand color
- Borders: `border-gray-900` → adjust weight
- Backgrounds: `bg-gray-50` → change shade

### Adding More Features

Copy the feature card pattern:

```typescript
<div className="bg-white border-2 border-gray-200 p-8">
  {/* Your feature content */}
</div>
```

---

## 📞 Next Steps

1. **Deploy the landing page** (15 minutes)
2. **Connect email service** (30 minutes)
3. **Test everything** (15 minutes)
4. **Start sharing!** 🎉

---

## 🆘 Troubleshooting

**Landing page not loading?**

- Check frontend dev server is running: `npm run dev`
- Verify route exists at `/app/landing/page.tsx`

**Email form not working?**

- Check browser console for errors
- Verify API endpoint is set up
- Test with console.log first

**Styling looks wrong?**

- Clear browser cache
- Check Tailwind CSS is configured
- Verify no conflicting styles

---

**Landing page URL:** `http://localhost:3000/landing` (development)

**Ready to launch?** Share the URL and start growing your email list! 🚀
