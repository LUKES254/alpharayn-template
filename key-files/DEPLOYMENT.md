# Vercel Deployment Guide

This guide will help you deploy your Next.js SaaS application to Vercel without errors.

## Prerequisites

Before deploying, ensure you have:

1. ✅ A Supabase account and project created
2. ✅ A Vercel account connected to your GitHub repository
3. ✅ All required environment variables ready

## Step 1: Gather Required Environment Variables

### From Supabase Dashboard

**Navigate to: [Project] > Settings > API**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Navigate to: [Project] > Settings > Database > Connection String**

Select **"Use connection pooling"** and copy the connection string:

```bash
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Generate Secret Keys

Run these commands locally to generate secure secrets:

```bash
# Generate BETTER_AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CSRF_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Set Application URLs

```bash
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

> **Note:** For initial deployment, you can use your Vercel preview URL (e.g., `https://your-project.vercel.app`), then update after deployment.

### Optional But Recommended

**For Payments (Paystack):**
```bash
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=your-webhook-secret
```

**For Email (Resend):**
```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**For Rate Limiting (Upstash Redis):**
```bash
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

## Step 2: Configure Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **Environment Variables**
4. Add each environment variable:
   - Click **Add**
   - Enter **Key** and **Value**
   - Select environments: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

### Required Variables (MUST SET):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NEXT_PUBLIC_APP_URL
CSRF_SECRET
```

### Optional Variables:

```
PAYSTACK_SECRET_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
ADMIN_EMAILS
```

## Step 3: Vercel Project Settings
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

### Build & Development Settings

Go to **Settings** > **General**:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm ci`
- **Output Directory:** `.next`
- **Node Version:** 18.x or higher

### Git Configuration

Go to **Settings** > **Git**:

- ✅ Enable **Production Branch:** `main`
- ✅ Enable **Automatic Deployments**
- ✅ Enable **Cancel Previous Deployments** (prevents multiple simultaneous builds)

### Deployment Protection

Go to **Settings** > **Deployment Protection** (recommended):

- ✅ Enable **Vercel Authentication** for preview deployments
- ✅ Add **Environment Variables** for staging

## Step 4: Deploy

### Option A: Automatic Deployment (Recommended)

Simply push to your `main` branch:

```bash
git add .
git commit -m "Configure production environment"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build your application
3. Deploy to production

### Option B: Manual Deployment

From Vercel Dashboard:

1. Go to your project
2. Click **Deployments**
3. Click **Redeploy** on the latest deployment
4. Click **Deploy**

## Step 5: Post-Deployment Verification

### 1. Check Build Logs

In Vercel Dashboard > Deployments > [Your Deployment] > **View Build Logs**

✅ Look for: "✅ All required environment variables are set"
❌ If you see errors, check Step 2 again

### 2. Test Your Application

Visit your deployed URL and verify:

- ✅ Homepage loads
- ✅ Sign up/Sign in works
- ✅ Database connection successful
- ✅ No console errors

### 3. Update Supabase Authentication URLs

In Supabase Dashboard > Authentication > URL Configuration:

Add your Vercel URL to:
- **Site URL:** `https://yourdomain.com`
- **Redirect URLs:** 
  - `https://yourdomain.com/api/auth/callback`
  - `https://yourdomain.com/dashboard`

### 4. Update Better Auth URLs

If you used placeholder URLs initially, update in Vercel:

```bash
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Then redeploy.

## Common Deployment Errors & Fixes

### Error: "supabaseUrl is required"

**Solution:** Ensure `NEXT_PUBLIC_SUPABASE_URL` is set in Vercel environment variables.

### Error: "You are using the default secret"

**Solution:** Set `BETTER_AUTH_SECRET` with a randomly generated 32+ character string.

### Error: "DATABASE_URL is not set"

**Solution:** Add `DATABASE_URL` from Supabase Dashboard > Database > Connection String (use pooler).

### Error: "Module not found"

**Solution:** 
1. Clear Vercel build cache: Settings > General > Clear Cache
2. Redeploy

### Build Timeout

**Solution:**
1. Reduce bundle size by removing unused dependencies
2. Increase build timeout in vercel.json (already configured)

## Vercel Optimizations Applied

✅ **Build Caching:** Speeds up subsequent builds
✅ **Automatic Deployment Cancellation:** Prevents multiple simultaneous builds
✅ **Environment Variable Validation:** Fails fast if critical vars are missing
✅ **Edge Runtime for Middleware:** Faster rate limiting and CSRF protection
✅ **ISR (Incremental Static Regeneration):** Blog posts update without full rebuild

## Security Checklist

Before going live:

- [ ] All production secrets are unique (not from .env.example)
- [ ] Database password is strong (min 16 characters)
- [ ] BETTER_AUTH_SECRET is 32+ random characters
- [ ] Service role key is kept secure (server-side only)
- [ ] Admin emails are configured in ADMIN_EMAILS
- [ ] Supabase RLS policies are enabled on all tables
- [ ] CSRF protection is enabled (middleware.ts)
- [ ] Rate limiting is configured (Upstash or in-memory)

## Monitoring & Maintenance

### Vercel Analytics

Enable in: Settings > Analytics
- Track performance
- Monitor errors
- Analyze user behavior

### Supabase Monitoring

Dashboard > Reports:
- Database performance
- API usage
- Storage metrics

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Speed Insights for performance

## Support

If deployment fails:

1. **Check Build Logs:** Vercel Dashboard > Deployments > View Build Logs
2. **Verify Environment Variables:** All required variables set correctly
3. **Test Locally:** Run `npm run build` locally first
4. **Review Documentation:** https://nextjs.org/docs/deployment
5. **Vercel Support:** https://vercel.com/support

## Rollback Strategy

If a deployment breaks production:

1. Go to Vercel Dashboard > Deployments
2. Find the last working deployment
3. Click **•••** > **Promote to Production**
4. Fix the issue locally
5. Redeploy

---

**Deployment Status:** Ready to Deploy ✅

Once all environment variables are set in Vercel, simply push to `main` branch to trigger automatic deployment.
