# Security Best Practices for ideacloner Boilerplate

## 🔒 Critical Security Guidelines

### Environment Variables

#### ✅ DO:
- Keep ALL secrets server-side only (no `NEXT_PUBLIC_` prefix)
- Use `.env.local` for development (this file is gitignored)
- Use environment variables in your hosting platform for production
- Rotate API keys regularly
- Use different keys for dev/staging/production environments

#### ❌ DON'T:
- **NEVER commit real API keys to git**
- **NEVER use `NEXT_PUBLIC_` prefix for secrets**
- **NEVER hardcode sensitive values as fallbacks**
- **NEVER expose payment configuration to client**

---

## 🚨 Before You Deploy

### 1. Generate New Keys
The `.env.example` file contains placeholder values. **You MUST generate your own keys:**

```bash
# Generate CSRF secret
openssl rand -hex 32

# Generate Better Auth secret
openssl rand -hex 32
```

### 2. Required Environment Variables

**Server-side only (NO `NEXT_PUBLIC_` prefix):**
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `PAYSTACK_PAYMENT_PAGE_SLUG` - Your payment page slug
- `PAYSTACK_WEBHOOK_SECRET` - Paystack webhook secret
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin access
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth session secret
- `CSRF_SECRET` - CSRF protection secret
- `RESEND_API_KEY` - Email service API key

**Client-safe (can use `NEXT_PUBLIC_` prefix):**
- `NEXT_PUBLIC_APP_URL` - Your app URL
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - Paystack public key (safe to expose)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (safe to expose with RLS)
- `NEXT_PUBLIC_CURRENCY` - Default currency
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - OAuth client ID (safe to expose)

---

## 🛡️ Security Features Implemented

### 1. **No Hardcoded Secrets**
All sensitive configuration is fetched from environment variables. No fallback values that could expose real data.

### 2. **Payment Security**
- Payment page slug is NEVER exposed to client
- All payment initialization happens server-side
- Direct Paystack integration (no intermediary exposure)

### 3. **CSRF Protection**
- Automatic CSRF token generation
- Validates tokens on all state-changing operations
- Fails fast in production if CSRF_SECRET is missing

### 4. **Row Level Security (RLS)**
- All Supabase tables have RLS policies
- Users can only access their own data
- Admin role properly checked server-side

### 5. **Rate Limiting**
- Payment endpoints: 3 req/hour per user
- Auth endpoints: 5 req/15min per IP
- API endpoints: 100 req/min per user

### 6. **Input Validation**
- All API inputs validated with Zod schemas
- SQL injection protection via Supabase client
- XSS protection via React's built-in escaping

---

## 🔐 API Key Security Checklist

Before selling/sharing this boilerplate:

- [ ] Remove all real API keys from `.env.local`
- [ ] Add `.env.local` to `.gitignore` (already done)
- [ ] Update `.env.example` with placeholder values only
- [ ] Verify no hardcoded keys in code (search for `pk_live`, `sk_live`, etc.)
- [ ] Document environment variable setup in README
- [ ] Test with fresh clone to ensure no keys leak
- [ ] Scan git history for accidentally committed keys

---

## 🚀 Deployment Security

### Vercel/Netlify:
1. Add all environment variables in dashboard
2. Mark secrets as "Sensitive" (hidden in UI)
3. Use different keys for Preview vs Production

### Self-hosted:
1. Use `.env.production` (never commit)
2. Set environment variables in hosting platform
3. Restrict server access with firewall rules

---

## 🔍 Security Audit Commands

```bash
# Search for potential leaked secrets
git log -p | grep -i "api_key\|secret\|password"

# Search codebase for hardcoded values
grep -r "pk_live_\|sk_live_\|pk_test_\|sk_test_" .

# Check for exposed NEXT_PUBLIC_ vars with secrets
grep -r "NEXT_PUBLIC_.*SECRET\|NEXT_PUBLIC_.*KEY" .

# Find direct process.env usage in client components
grep -r "process\.env\.[^NEXT_PUBLIC]" app/ components/
```

---

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Paystack Security Best Practices](https://paystack.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🆘 If You Accidentally Commit Secrets

**Act immediately:**

1. **Revoke the exposed keys** in their respective dashboards
2. **Generate new keys**
3. **Remove from git history:**
   ```bash
   # Using BFG Repo-Cleaner (recommended)
   bfg --replace-text passwords.txt
   
   # Or git filter-branch
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```
4. **Force push** (if repo is private and you're the only user)
5. **Notify team members** to pull latest changes
6. **Monitor accounts** for unauthorized usage

---

## ✅ Security Validation

Run this checklist before deploying:

```bash
# 1. Check no real keys in codebase
npm run check:secrets  # (add this script)

# 2. Verify environment variables
npm run check:env  # (add this script)

# 3. Run security audit
npm audit

# 4. Check for vulnerable dependencies
npm audit fix

# 5. Validate RLS policies
# Check supabase/main.sql has RLS on all tables
```

---

**Remember:** Security is not a one-time setup. Regularly review and update security practices as your application grows.
