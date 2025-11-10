# Racing Life - Security Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [Input Validation](#input-validation)
- [Rate Limiting](#rate-limiting)
- [CSRF Protection](#csrf-protection)
- [API Key Management](#api-key-management)
- [Security Headers](#security-headers)
- [Data Protection](#data-protection)
- [Security Auditing](#security-auditing)
- [Incident Response](#incident-response)

## Overview

Racing Life implements multiple layers of security to protect user data and prevent common attacks.

### Security Stack

- **Helmet.js**: Security headers
- **express-rate-limit**: Rate limiting
- **express-validator**: Input validation
- **bcrypt**: Password hashing
- **JWT**: Authentication tokens
- **CSRF tokens**: Cross-site request forgery protection
- **API keys**: External service authentication

## Authentication & Authorization

### Password Security

#### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters recommended

#### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```

### JWT Token Authentication

#### Token Structure

```javascript
{
  "userId": 123,
  "email": "user@example.com",
  "role": "user",
  "iat": 1699564800,
  "exp": 1700169600
}
```

#### Token Configuration

- **Algorithm**: HS256
- **Expiration**: 7 days
- **Secret**: 256-bit random string

#### Using JWT Tokens

**Request Header:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control (RBAC)

#### User Roles

- **user**: Standard user access
- **ambassador**: Content creation access
- **admin**: Full administrative access

#### Middleware Example

```typescript
import { requireRole } from './middleware/auth.middleware';

router.get('/admin/users', requireRole('admin'), getUsersController);
router.post('/ambassadors/articles', requireRole('ambassador'), createArticleController);
```

## Input Validation

### Validation Middleware

All user inputs are validated using express-validator.

#### Example: Registration Validation

```typescript
import { body, validationResult } from 'express-validator';

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password requirements not met'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
];

router.post('/register', registerValidation, validate, registerController);
```

### Sanitization

#### NoSQL Injection Prevention

```typescript
import mongoSanitize from 'express-mongo-sanitize';

app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);
```

#### XSS Prevention

```typescript
// All string inputs are sanitized to remove HTML/script tags
const sanitizeString = (str: string): string => {
  return str.replace(/<[^>]*>/g, '');
};
```

### SQL Injection Prevention

All database queries use parameterized queries via Knex.js:

```typescript
// ✅ SAFE - Parameterized query
const user = await db('users').where('email', userEmail).first();

// ❌ UNSAFE - String concatenation (never do this)
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

## Rate Limiting

### Rate Limit Tiers

#### General API

- **Window**: 15 minutes
- **Max Requests**: 100
- **Response**: 429 Too Many Requests

```typescript
import { generalLimiter } from './middleware/rate-limit.middleware';
app.use('/api', generalLimiter);
```

#### Authentication Endpoints

- **Window**: 15 minutes
- **Max Requests**: 5
- **Skip Successful**: Yes

```typescript
router.post('/login', authLimiter, loginController);
router.post('/register', registrationLimiter, registerController);
```

#### Registration

- **Window**: 1 hour
- **Max Requests**: 3
- **Purpose**: Prevent spam accounts

#### API Key Endpoints

- **Window**: 1 minute
- **Max Requests**: 60
- **Key**: API key or IP address

### Custom Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const customLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many requests',
});

router.get('/high-traffic-endpoint', customLimiter, handler);
```

## CSRF Protection

### How It Works

1. Client requests CSRF token: `GET /api/csrf-token`
2. Server generates and stores token
3. Client includes token in subsequent requests
4. Server validates token before processing

### Usage

#### Getting CSRF Token

```javascript
// Frontend
const response = await fetch('/api/csrf-token');
const { csrfToken, sessionId } = await response.json();

// Store token for subsequent requests
localStorage.setItem('csrfToken', csrfToken);
```

#### Making Protected Requests

```javascript
fetch('/api/protected-endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

### CSRF Exemptions

- GET, HEAD, OPTIONS requests
- API key authenticated requests
- WebSocket connections

## API Key Management

### Creating API Keys

#### Generate New API Key

```bash
cd backend
npm run generate-api-key -- --name "External Service" --permissions "races:read,odds:read"
```

#### API Key Format

```
rl_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Using API Keys

#### Request Header

```
X-API-Key: rl_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

#### Example

```javascript
const response = await fetch('https://api.racinglife.com/api/races', {
  headers: {
    'X-API-Key': 'rl_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  },
});
```

### API Key Permissions

Available permissions:

- `races:read` - Read race data
- `races:write` - Create/update races
- `odds:read` - Read odds data
- `odds:write` - Update odds
- `users:read` - Read user data (admin)
- `users:write` - Manage users (admin)
- `*` - All permissions (dangerous)

### Rotating API Keys

```bash
# Revoke old key
npm run revoke-api-key -- --key-id 123

# Generate new key
npm run generate-api-key -- --name "Service Name"
```

## Security Headers

### Implemented Headers

```typescript
// X-Frame-Options: Prevent clickjacking
res.setHeader('X-Frame-Options', 'DENY');

// X-Content-Type-Options: Prevent MIME sniffing
res.setHeader('X-Content-Type-Options', 'nosniff');

// X-XSS-Protection: Enable XSS filter
res.setHeader('X-XSS-Protection', '1; mode=block');

// Referrer-Policy: Control referer information
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

// HSTS: Force HTTPS (production only)
res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
```

### Content Security Policy (CSP)

```typescript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
});
```

## Data Protection

### Sensitive Data Handling

#### Never Log Sensitive Data

```typescript
// ❌ Bad
logger.info(`User logged in: ${user.email} with password ${password}`);

// ✅ Good
logger.info(`User logged in: ${user.email}`);
```

#### Exclude Sensitive Fields

```typescript
const user = await db('users')
  .select('id', 'email', 'name', 'role')
  // Never include password_hash in responses
  .where('id', userId)
  .first();
```

### Database Encryption

#### Encrypting Sensitive Fields

```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex');
}
```

### HTTPS/TLS

#### Production Requirements

- Minimum TLS 1.2
- Strong cipher suites only
- HSTS enabled
- Certificate pinning recommended

## Security Auditing

### Automated Security Audit

Run the security audit script:

```bash
cd backend
npm run security:audit
```

### Audit Checks

The audit script checks for:

1. **Dependency Vulnerabilities**
   - NPM audit results
   - Outdated packages
   - Known CVEs

2. **Environment Security**
   - Required environment variables
   - Secret strength (JWT, API keys)
   - Production settings

3. **Code Security**
   - Hardcoded secrets
   - SQL injection patterns
   - XSS vulnerabilities

4. **Configuration Security**
   - HTTPS enforcement
   - Security headers
   - Rate limiting
   - Input validation

5. **Authentication Security**
   - Password hashing
   - JWT implementation
   - Session management

### Manual Security Review

#### Code Review Checklist

- [ ] All user inputs validated
- [ ] SQL queries parameterized
- [ ] Passwords properly hashed
- [ ] Sensitive data not logged
- [ ] CSRF tokens implemented
- [ ] Rate limiting on all endpoints
- [ ] Security headers configured
- [ ] API keys properly secured
- [ ] Error messages don't leak info
- [ ] Authentication required where needed

### Dependency Scanning

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor logs for suspicious activity
   - Check error rates and patterns
   - Review security alerts

2. **Assessment**
   - Determine severity and scope
   - Identify affected systems
   - Document the incident

3. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IPs

4. **Eradication**
   - Remove malicious code
   - Patch vulnerabilities
   - Update dependencies

5. **Recovery**
   - Restore from backups if needed
   - Verify system integrity
   - Monitor for recurrence

6. **Post-Incident**
   - Document lessons learned
   - Update security procedures
   - Implement additional controls

### Emergency Contacts

- **Security Team**: security@racinglife.com
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Incident Response**: incidents@racinglife.com

### Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security@racinglife.com with details
3. Include steps to reproduce
4. Allow 90 days for resolution before disclosure

## Compliance

### GDPR Compliance

- User data encryption
- Right to be forgotten
- Data export functionality
- Privacy policy
- Cookie consent

### Data Retention

- User accounts: Indefinite (until deletion)
- Logs: 90 days
- Backups: 30 days
- Analytics: 2 years

### Third-Party Services

All third-party services are vetted for security:

- Sentry (Error tracking) - SOC 2 certified
- Cloudflare (CDN) - ISO 27001 certified
- AWS (Hosting) - Multiple compliance certifications

## Best Practices

1. **Keep Dependencies Updated**

   ```bash
   npm audit
   npm update
   ```

2. **Use Environment Variables**

   ```bash
   # Never commit secrets to git
   echo ".env" >> .gitignore
   ```

3. **Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Use role-based access control
   - Regular access reviews

4. **Defense in Depth**
   - Multiple security layers
   - Don't rely on single control
   - Assume breach mentality

5. **Security Monitoring**
   - Real-time alerts
   - Log analysis
   - Anomaly detection

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
