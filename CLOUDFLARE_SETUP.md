# Cloudflare CDN Configuration Guide

This guide covers setting up Cloudflare CDN for the horse racing platform to improve performance, security, and reliability.

## Table of Contents

1. [Overview](#overview)
2. [Initial Setup](#initial-setup)
3. [DNS Configuration](#dns-configuration)
4. [Caching Rules](#caching-rules)
5. [Page Rules](#page-rules)
6. [Security Settings](#security-settings)
7. [Performance Optimization](#performance-optimization)
8. [DDoS Protection](#ddos-protection)
9. [Analytics and Monitoring](#analytics-and-monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Cloudflare provides:

- **CDN**: Global content delivery network
- **DDoS Protection**: Automatic mitigation
- **SSL/TLS**: Free SSL certificates
- **Caching**: Intelligent caching rules
- **Security**: WAF, rate limiting, bot protection
- **Analytics**: Traffic insights and performance metrics

---

## Initial Setup

### Step 1: Create Cloudflare Account

1. Go to https://cloudflare.com
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Your Domain

1. Click "Add a Site"
2. Enter your domain (e.g., `yourdomain.com`)
3. Click "Add Site"

### Step 3: Select Plan

**Recommended Plans:**

- **Free**: Good for starting out
- **Pro ($20/month)**: Recommended for production
  - Advanced DDoS protection
  - WAF (Web Application Firewall)
  - Image optimization
  - Mobile optimization
- **Business ($200/month)**: For high-traffic sites

### Step 4: Scan DNS Records

Cloudflare will automatically scan and import your existing DNS records.

### Step 5: Update Nameservers

Update your domain's nameservers at your registrar to:

```
nameserver1.cloudflare.com
nameserver2.cloudflare.com
```

(Cloudflare will provide specific nameservers for your domain)

**Wait for propagation** (can take up to 24 hours, usually much faster)

---

## DNS Configuration

### Frontend (Vercel)

**Root Domain:**

```
Type: A
Name: @
Content: 76.76.21.21
Proxy: Enabled (Orange Cloud)
TTL: Auto
```

**WWW Subdomain:**

```
Type: CNAME
Name: www
Content: cname.vercel-dns.com
Proxy: Enabled (Orange Cloud)
TTL: Auto
```

### Backend (Railway/Render)

**API Subdomain:**

```
Type: CNAME
Name: api
Content: your-backend.railway.app (or onrender.com)
Proxy: Enabled (Orange Cloud)
TTL: Auto
```

### Additional Subdomains

**Admin Dashboard:**

```
Type: CNAME
Name: admin
Content: cname.vercel-dns.com
Proxy: Enabled (Orange Cloud)
TTL: Auto
```

**CDN for Static Assets:**

```
Type: CNAME
Name: cdn
Content: your-storage-provider.com
Proxy: Enabled (Orange Cloud)
TTL: Auto
```

### Email Records (if applicable)

```
Type: MX
Name: @
Content: mail.yourdomain.com
Priority: 10
Proxy: Disabled (Grey Cloud)
TTL: Auto
```

---

## Caching Rules

### Cache Everything Rule

**URL Pattern:** `yourdomain.com/*`

**Settings:**

- Cache Level: Standard
- Browser Cache TTL: 4 hours
- Edge Cache TTL: 2 hours

### Static Assets Caching

**URL Pattern:** `yourdomain.com/*.{jpg,jpeg,png,gif,ico,svg,webp,avif,css,js,woff,woff2,ttf,eot}`

**Settings:**

- Cache Level: Cache Everything
- Browser Cache TTL: 1 year
- Edge Cache TTL: 1 month

### API Caching

**URL Pattern:** `api.yourdomain.com/api/races*`

**Settings:**

- Cache Level: Cache Everything
- Browser Cache TTL: 2 minutes
- Edge Cache TTL: 1 minute
- Bypass Cache on Cookie: `auth_token`

### Dynamic Content (No Cache)

**URL Pattern:** `api.yourdomain.com/api/auth/*`

**Settings:**

- Cache Level: Bypass
- Disable Performance features

### Cache Rules Configuration

Navigate to: **Caching > Configuration**

```yaml
# Cache Rules (YAML representation)
rules:
  - name: 'Cache Static Assets'
    match: '*.{jpg,jpeg,png,gif,ico,svg,webp,avif,css,js,woff,woff2}'
    cache_level: 'cache_everything'
    edge_ttl: 2592000 # 30 days
    browser_ttl: 31536000 # 1 year

  - name: 'Cache API Responses'
    match: 'api.yourdomain.com/api/races*'
    cache_level: 'cache_everything'
    edge_ttl: 60 # 1 minute
    browser_ttl: 120 # 2 minutes
    bypass_on_cookie: 'auth_token'

  - name: 'Cache News Feed'
    match: 'api.yourdomain.com/api/news*'
    cache_level: 'cache_everything'
    edge_ttl: 300 # 5 minutes
    browser_ttl: 600 # 10 minutes

  - name: 'No Cache Auth'
    match: 'api.yourdomain.com/api/auth/*'
    cache_level: 'bypass'
```

---

## Page Rules

Page Rules allow fine-grained control over Cloudflare features.

### Rule 1: Cache API Responses

**URL:** `api.yourdomain.com/api/races*`

**Settings:**

- Cache Level: Cache Everything
- Edge Cache TTL: 1 minute
- Browser Cache TTL: 2 minutes
- Origin Cache Control: On

### Rule 2: Bypass Cache for Authentication

**URL:** `api.yourdomain.com/api/auth/*`

**Settings:**

- Cache Level: Bypass
- Disable Performance
- Disable Apps

### Rule 3: Cache Static Assets

**URL:** `yourdomain.com/_next/static/*`

**Settings:**

- Cache Level: Cache Everything
- Edge Cache TTL: 1 year
- Browser Cache TTL: 1 year

### Rule 4: Force HTTPS

**URL:** `http://yourdomain.com/*`

**Settings:**

- Always Use HTTPS: On

### Rule 5: Redirect WWW to Root (or vice versa)

**URL:** `www.yourdomain.com/*`

**Settings:**

- Forwarding URL: 301 Permanent Redirect
- Destination: `https://yourdomain.com/$1`

### Creating Page Rules

1. Go to **Rules > Page Rules**
2. Click "Create Page Rule"
3. Enter URL pattern
4. Add settings
5. Save and Deploy

**Note:** Free plan includes 3 page rules. Pro plan includes 20.

---

## Security Settings

### SSL/TLS Configuration

Navigate to: **SSL/TLS > Overview**

**Encryption Mode:** Full (Strict)

- Ensures end-to-end encryption
- Requires valid SSL certificate on origin server

**Minimum TLS Version:** TLS 1.2

- Disable older, insecure protocols

**Automatic HTTPS Rewrites:** On

- Automatically rewrite HTTP URLs to HTTPS

**Always Use HTTPS:** On

- Redirect all HTTP requests to HTTPS

### Firewall Rules

Navigate to: **Security > WAF**

#### Rule 1: Block Bad Bots

**Expression:**

```
(cf.client.bot) and not (cf.verified_bot_category in {"Search Engine Crawler" "Monitoring & Analytics"})
```

**Action:** Block

#### Rule 2: Rate Limit API

**Expression:**

```
(http.request.uri.path contains "/api/") and (rate(10s) > 100)
```

**Action:** Challenge (CAPTCHA)

#### Rule 3: Block Suspicious Countries (Optional)

**Expression:**

```
(ip.geoip.country in {"CN" "RU" "KP"}) and (http.request.uri.path contains "/admin")
```

**Action:** Block

**Note:** Adjust based on your target audience

#### Rule 4: Protect Admin Routes

**Expression:**

```
(http.request.uri.path contains "/admin") and not (ip.src in {1.2.3.4 5.6.7.8})
```

**Action:** Challenge

**Note:** Replace with your office/admin IP addresses

### Rate Limiting

Navigate to: **Security > Rate Limiting Rules**

#### API Rate Limit

**Rule Name:** API Rate Limit

**Match:**

- URL: `api.yourdomain.com/api/*`
- Method: All

**Rate:**

- Requests: 100 per 10 seconds
- Per: IP Address

**Action:** Block for 1 hour

#### Login Rate Limit

**Rule Name:** Login Protection

**Match:**

- URL: `api.yourdomain.com/api/auth/login`
- Method: POST

**Rate:**

- Requests: 5 per 5 minutes
- Per: IP Address

**Action:** Challenge (CAPTCHA)

### DDoS Protection

Navigate to: **Security > DDoS**

**HTTP DDoS Attack Protection:** On (Automatic)

- Cloudflare automatically mitigates DDoS attacks
- No configuration needed

**Advanced DDoS Protection (Pro+):**

- Sensitivity Level: High
- Custom rules for specific attack patterns

### Bot Management

Navigate to: **Security > Bots**

**Bot Fight Mode (Free):** On

- Challenges suspected bots
- Allows verified bots (Google, Bing, etc.)

**Super Bot Fight Mode (Pro+):** On

- More aggressive bot detection
- Machine learning-based detection

**Verified Bots:** Allow

- Search engines
- Monitoring services
- Social media crawlers

---

## Performance Optimization

### Auto Minify

Navigate to: **Speed > Optimization**

**Auto Minify:**

- JavaScript: On
- CSS: On
- HTML: On

### Brotli Compression

**Brotli:** On

- Better compression than gzip
- Reduces bandwidth usage

### Early Hints

**Early Hints:** On

- Sends HTTP 103 responses
- Improves page load time

### HTTP/2 and HTTP/3

**HTTP/2:** On (Default)
**HTTP/3 (QUIC):** On

- Faster connection establishment
- Better performance on mobile

### Rocket Loader

**Rocket Loader:** Off (for Next.js)

- Can interfere with Next.js hydration
- Not needed with Next.js optimization

### Mirage (Pro+)

**Mirage:** On

- Lazy loads images
- Optimizes images for mobile

### Polish (Pro+)

**Polish:** Lossless

- Optimizes images automatically
- Reduces image file sizes

**WebP Conversion:** On

- Converts images to WebP format
- Better compression than JPEG/PNG

### Argo Smart Routing (Pro+)

**Argo:** On

- Routes traffic through fastest paths
- Reduces latency by 30% on average

---

## DDoS Protection

### Automatic Protection

Cloudflare provides automatic DDoS protection at all plan levels:

- **Layer 3/4 Protection:** Network-level attacks
- **Layer 7 Protection:** Application-level attacks
- **Automatic Mitigation:** No configuration needed

### Advanced DDoS Protection (Pro+)

Navigate to: **Security > DDoS**

**Sensitivity Level:** High

- More aggressive attack detection
- May increase false positives

**Custom Rules:**

- Create rules for specific attack patterns
- Block or challenge suspicious traffic

### Rate Limiting for DDoS

Use rate limiting rules to prevent application-level DDoS:

```
(http.request.uri.path eq "/api/races") and (rate(10s) > 1000)
```

**Action:** Block for 1 hour

---

## Analytics and Monitoring

### Traffic Analytics

Navigate to: **Analytics > Traffic**

**Metrics:**

- Requests per second
- Bandwidth usage
- Unique visitors
- Top countries
- Top paths

### Security Analytics

Navigate to: **Analytics > Security**

**Metrics:**

- Threats blocked
- Challenge solve rate
- Bot traffic
- Firewall events

### Performance Analytics

Navigate to: **Analytics > Performance**

**Metrics:**

- Cache hit ratio
- Origin response time
- Edge response time
- Bandwidth saved

### Cache Analytics

Navigate to: **Caching > Analytics**

**Metrics:**

- Cache hit ratio by URL
- Cached vs uncached requests
- Bandwidth saved by caching

### Setting Up Alerts

Navigate to: **Notifications**

**Recommended Alerts:**

- DDoS attack detected
- High error rate (5xx)
- SSL certificate expiring
- Origin server down

---

## Advanced Configuration

### Transform Rules

Navigate to: **Rules > Transform Rules**

#### Add Security Headers

**Rule Name:** Security Headers

**Match:** All incoming requests

**Modify Response Headers:**

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### CORS Headers for API

**Rule Name:** API CORS

**Match:** `api.yourdomain.com/api/*`

**Modify Response Headers:**

```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### Workers (Optional)

Cloudflare Workers allow custom logic at the edge.

**Use Cases:**

- A/B testing
- Personalization
- Custom caching logic
- Request/response modification

**Example Worker:**

```javascript
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Add custom logic here
  const response = await fetch(request);

  // Modify response
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Custom-Header', 'value');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
```

### Load Balancing (Business+)

Navigate to: **Traffic > Load Balancing**

**Use Case:** Distribute traffic across multiple origin servers

**Configuration:**

- Create origin pools
- Configure health checks
- Set up failover rules

---

## Troubleshooting

### Cache Not Working

**Issue:** Content not being cached

**Solutions:**

1. Check cache rules and page rules
2. Verify `Cache-Control` headers from origin
3. Check for cookies that bypass cache
4. Use "Purge Cache" to clear old cache

### SSL/TLS Errors

**Issue:** SSL certificate errors

**Solutions:**

1. Verify SSL mode is "Full (Strict)"
2. Check origin server has valid SSL certificate
3. Wait for SSL certificate provisioning (up to 24 hours)
4. Check DNS records are proxied (orange cloud)

### Origin Server Errors

**Issue:** 502/504 errors

**Solutions:**

1. Check origin server is running
2. Verify DNS records point to correct origin
3. Check firewall allows Cloudflare IPs
4. Increase origin server timeout

### Performance Issues

**Issue:** Slow page loads

**Solutions:**

1. Check cache hit ratio (should be >80%)
2. Enable Argo Smart Routing
3. Optimize images with Polish
4. Enable HTTP/3
5. Review origin server performance

### DDoS False Positives

**Issue:** Legitimate traffic being blocked

**Solutions:**

1. Lower DDoS sensitivity
2. Whitelist known good IPs
3. Adjust rate limiting rules
4. Review firewall rules

---

## Cloudflare API (Optional)

Automate Cloudflare configuration using the API.

### Authentication

```bash
# Set API token
export CF_API_TOKEN=your_api_token
export CF_ZONE_ID=your_zone_id
```

### Purge Cache

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Create Firewall Rule

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/firewall/rules" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "filter": {
      "expression": "(http.request.uri.path contains \"/api/\")"
    },
    "action": "challenge"
  }'
```

---

## Best Practices

### Caching Strategy

1. **Cache static assets aggressively** (1 year)
2. **Cache API responses briefly** (1-5 minutes)
3. **Don't cache authenticated requests**
4. **Use cache tags for granular purging**
5. **Monitor cache hit ratio** (target >80%)

### Security

1. **Always use HTTPS**
2. **Enable WAF and rate limiting**
3. **Block bad bots**
4. **Protect admin routes**
5. **Monitor security events**

### Performance

1. **Enable HTTP/3**
2. **Use Argo Smart Routing** (Pro+)
3. **Optimize images** with Polish (Pro+)
4. **Minify assets**
5. **Monitor Core Web Vitals**

### Monitoring

1. **Set up alerts** for critical events
2. **Review analytics weekly**
3. **Monitor cache hit ratio**
4. **Track error rates**
5. **Analyze traffic patterns**

---

## Cost Optimization

### Free Plan

**Includes:**

- Unlimited DDoS protection
- Free SSL certificates
- Basic caching
- 3 page rules
- Basic analytics

**Good for:** Development and small sites

### Pro Plan ($20/month)

**Adds:**

- WAF (Web Application Firewall)
- Image optimization (Polish)
- Mobile optimization (Mirage)
- 20 page rules
- Advanced analytics

**Good for:** Production sites

### Business Plan ($200/month)

**Adds:**

- Load balancing
- Custom SSL certificates
- 50 page rules
- Priority support
- 100% uptime SLA

**Good for:** High-traffic sites

---

## Deployment Checklist

Before going live with Cloudflare:

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated
- [ ] DNS records configured
- [ ] SSL/TLS set to Full (Strict)
- [ ] Always Use HTTPS enabled
- [ ] Cache rules configured
- [ ] Page rules created
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] DDoS protection verified
- [ ] Security headers added
- [ ] Performance features enabled
- [ ] Analytics and alerts configured
- [ ] Cache purge tested
- [ ] Origin server allows Cloudflare IPs
- [ ] CORS configured for API
- [ ] Documentation updated

---

## Support and Resources

### Cloudflare Resources

- **Documentation:** https://developers.cloudflare.com
- **Community:** https://community.cloudflare.com
- **Status:** https://www.cloudflarestatus.com
- **Support:** https://support.cloudflare.com

### Cloudflare IPs

Whitelist these IP ranges on your origin server:

**IPv4:**

```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

**IPv6:**

```
2400:cb00::/32
2606:4700::/32
2803:f800::/32
2405:b500::/32
2405:8100::/32
2a06:98c0::/29
2c0f:f248::/32
```

---

## Maintenance

### Regular Tasks

**Weekly:**

- Review analytics and traffic patterns
- Check cache hit ratio
- Review security events

**Monthly:**

- Update firewall rules as needed
- Review and optimize page rules
- Analyze performance metrics
- Check for Cloudflare feature updates

**Quarterly:**

- Review and optimize caching strategy
- Audit security configuration
- Review costs and plan usage
- Update documentation

---

This completes the Cloudflare CDN configuration guide. Follow these steps to set up a fast, secure, and reliable CDN for your horse racing platform.
