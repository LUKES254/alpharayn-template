# Next.js SaaS Platform 

> A production-ready SaaS boilerplate with enterprise-grade security, built with Next.js 14, TypeScript, Supabase, BetterAuth, and Paystack.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🌟 Features

✅ **Complete Authentication** - Email/password + social login (Google, GitHub)  
✅ **Dual Payment Models** - Subscriptions (dynamic from Paystack) + one-time products  
✅ **Blog System** - SEO-optimized with Quill rich text editor  
✅ **Enterprise Security** - 7 layers (rate limiting, CSRF, RLS, validation, etc.)  
✅ **Admin Dashboard** - User, payment, blog, newsletter management  
✅ **Pre-Launch Tools** - Waitlist + newsletter system  
✅ **Database** - PostgreSQL with Row Level Security policies  
✅ **Email System** - Transactional emails via Resend  
✅ **Multi-Currency** - NGN, KES, USD support

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM |
| **Authentication** | BetterAuth 1.4.7 |
| **Payments** | Paystack |
| **Emails** | Resend |
| **Validation** | Zod |
| **Rate Limiting** | Upstash Redis |
| **Deployment** | Vercel |

---

## 🚀 Quick Start (15 Minutes)

### Before You Start
- **Node.js 18.17+** and npm
- A **[Supabase](https://supabase.com/dashboard)** project — you'll copy its project URL, anon key, service-role key, and pooled connection string
- Optional: **Paystack** (payments) and **Resend** (email) accounts — see [DEPLOYMENT.md](./key-files/DEPLOYMENT.md)

### 1. Clone & Install
```bash
git clone https://github.com/Rayn04/bysaas.git
cd bysaas
npm install --legacy-peer-deps
```

### 2. Generate Secrets & Environment
```bash
npm run setup:secrets
# Creates .env.local from .env.example and fills BETTER_AUTH_SECRET + CSRF_SECRET.
# Then edit .env.local and add your Supabase credentials.
```

### 3. Set Up the Database
In Supabase Dashboard → **SQL Editor**, run the contents of `supabase/main.sql`.
(`supabase/main.sql` is the canonical schema; the `supabase/migrations/` folder is optional tooling.)

### 4. Run Development
```bash
npm run dev
```
Visit: http://localhost:3000

---

## 📂 Project Structure

```
piebot/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── auth/             # Authentication
│   │   ├── payments/         # Payment endpoints
│   │   ├── blog/             # Blog API
│   │   ├── admin/            # Admin endpoints
│   │   └── user/             # User management
│   ├── auth/                 # Auth pages (sign-in, sign-up)
│   ├── dashboard/            # User dashboard
│   ├── admin/                # Admin dashboard
│   ├── blog/                 # Blog pages
│   └── payments/             # Payment pages
│
├── components/                # React components
│   ├── ui/                   # shadcn/ui base components
│   ├── auth/                 # Auth forms
│   ├── blog/                 # Blog components + Quill editor
│   ├── payments/             # Payment forms
│   ├── admin/                # Admin components
│   ├── home/                 # Landing page (hero-toggle)
│   └── layout/               # Layout (nav-toggle, sidebar)
│
├── lib/                       # Utilities
│   ├── auth.ts               # BetterAuth config
│   ├── paystack.ts           # Paystack integration
│   ├── plans.ts              # Subscription plans
│   ├── rate-limit.ts         # Rate limiting
│   ├── csrf.ts               # CSRF protection
│   ├── error-handler.ts      # Error handling
│   ├── supabase/             # Database clients
│   └── validation/           # Zod schemas
│
├── supabase/                  # Database
│   └── main.sql              # Complete schema + RLS
│
├── scripts/                   # setup-security.js, validate-env.js
├── key-files/                 # Guides: DOCUMENTATION, DEPLOYMENT, SECURITY, AI-FEATURE-GUIDE
├── middleware.ts              # Rate limiting + security
├── next.config.mjs            # Security headers
└── README.md                 # This file
```

---

## ⚙️ Configuration & Toggles

### Environment Variables

`.env.example` is the annotated source of truth; `npm run setup:secrets` writes `.env.local`.
Only the Supabase, auth-secret, and `NEXT_PUBLIC_APP_URL` values are **required** — Paystack,
Resend, OAuth, and Upstash are optional and only needed for those features.

Required:
```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.yourproject:..."
NEXT_PUBLIC_SUPABASE_URL="https://yourproject.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
BETTER_AUTH_SECRET="generate-with-crypto"
BETTER_AUTH_URL="http://localhost:3000"

# Payments (Paystack) — optional
PAYSTACK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."

# Email (Resend) — optional
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Security (required)
CSRF_SECRET="generate-with-crypto"
```

### Component Toggles
Easily switch between different modes by modifying these files:

**1. Waitlist Mode (Pre-launch)**
File: `components/home/hero-toggle.tsx`
```typescript
const SHOW_WAITLIST = true // Set to false for main mode
```
File: `components/layout/nav-toggle.tsx`
```typescript
const SHOW_WAITLIST_NAV = true // Set to false for main nav
```

**2. Feature Flags**
File: `.env.local`
```bash
NEXT_PUBLIC_BLOG_ENABLED=true
NEXT_PUBLIC_WAITLIST_ENABLED=false
NEXT_PUBLIC_NEWSLETTER_ENABLED=true
NEXT_PUBLIC_ONE_TIME_PAYMENTS_ENABLED=true
```

**3. Landing Page Images**
File: `app/page.tsx`
- Uncomment the `<Image ... />` code (approx line 124).
- Place your image in `public/images/landing-page.png`.
- Remove the placeholder mockups.
- toggling between different auth socials like google /component/auth/auth-form.tsx or you can add your own socials
- Onetime payment and reccuring subscription system through /dashboard/payment page.tsx by putting either true or false
- toggling between normal hero and waitlist hero - hero-toggle.tsx
---

## ☁️ Deployment Guide (Vercel)

### 1. Prerequisites
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login
```

### 2. Generate Production Secrets
**Do not use your local secrets in production.** Generate new ones:

```bash
# Generate BETTER_AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CSRF_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy Commands
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### 4. Vercel Environment Configuration
Go to **Project Settings > Environment Variables** on Vercel and add the following.

**Initial Setup (Required for Build):**
- `NEXT_PUBLIC_SUPABASE_URL`: `https://xxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGci...`
- `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGci...`
- `DATABASE_URL`: `postgresql://postgres...` (Use Transaction Pooler port 6543)
- `BETTER_AUTH_SECRET`: `abc123...` (New generated key)
- `CSRF_SECRET`: `xyz789...` (New generated key)
- `NEXT_PUBLIC_APP_URL`: `https://your-app.vercel.app` (Your production domain)
- `BETTER_AUTH_URL`: `https://your-app.vercel.app`
- `UPSTASH_REDIS_REST_URL`: `https://xxx.upstash.io`
- `UPSTASH_REDIS_REST_TOKEN`: `Axxxxx`
- `RESEND_API_KEY`: `re_...`

**Secondary Setup (After Initial Deploy):**
- `PAYSTACK_SECRET_KEY`: `sk_live_...`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: `pk_live_...`
- `NEXT_PUBLIC_CURRENCY`: `NGN` (or USD, KES)
- `PAYSTACK_WEBHOOK_SECRET`: `your_webhook_secret`
- `RESEND_FROM_EMAIL`: `noreply@yourdomain.xyz`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (if using Google Auth)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_APP_NAME`: "SaaS Platform"

> **Tip:** If the build fails initially, ensure `NEXT_PUBLIC_APP_URL` is set. You can set it to your Vercel URL temporarily (e.g., `https://project-name.vercel.app`) before you have a custom domain.

### 5. Service Configuration (Redirects & Webhooks)

#### **Paystack**
Location: **Dashboard → Settings → API Keys & Webhooks**
- **Callback URL**: `https://your-app.vercel.app/payments/callback`
- **Webhook URL**: `https://your-app.vercel.app/api/payments/webhook`

#### **Supabase**
Location: **Authentication → URL Configuration**
Add **ALL** of the following to **Redirect URLs**:
```text
https://your-app.vercel.app/api/auth/callback
https://your-app.vercel.app/auth/verify-email
https://your-app.vercel.app/dashboard
https://your-app.vercel.app/auth/sign-in
https://your-app.vercel.app/auth/sign-up
https://your-app.vercel.app/auth/verify-email?token=**
https://your-app.vercel.app/auth/reset-password?token=**
https://your-app.vercel.app/newsletter/confirm
https://your-app.vercel.app/newsletter/unsubscribe
https://your-app.vercel.app/payments/callback
https://your-app.vercel.app/dashboard/payment
https://your-app.vercel.app/waitlist/success
https://your-app.vercel.app/admin
https://your-app.vercel.app/admin/blog
https://your-app.vercel.app/admin/newsletter
https://your-app.vercel.app/admin/payments
https://your-app.vercel.app/admin/waitlist
http://localhost:3000/api/auth/callback                                                                                                                      
http://localhost:3000/auth/verify-email                                                     
http://localhost:3000/dashboard                                                                                                                                            │
http://localhost:3000/auth/sign-in 
http://localhost:3000 
```
*Note: Also include your localhost URLs for development testing.*

#### **Google OAuth** (Optional)
Location: **Google Cloud Console → APIs & Services → Credentials**
- **Authorized Redirect URIs**:
  - `https://your-app.vercel.app/api/auth/callback/google`

#### **GitHub OAuth** (Optional)
Location: **GitHub Settings → Developer Settings → OAuth Apps**
- **Authorization callback URL**:
  - `https://your-app.vercel.app/api/auth/callback/github`

#### **Resend (Email)**
1. Sign up at [Resend](https://resend.com).
2. Add Domain: `yourdomain.xyz` (avoid subdomains if possible).
3. Add DNS Records (TXT, CNAME, MX) to your domain registrar.
4. Wait for verification.
5. Use `noreply@yourdomain.xyz` as your `RESEND_FROM_EMAIL`.

---

## 🔄 Maintenance & Sync

**Force Vercel Sync**
If you made changes that didn't trigger a build, run this locally:
```bash
git commit --allow-empty -m "force vercel sync"
git push origin main
```

---

## 📚 Complete Documentation

**📖 [DOCUMENTATION.md](./key-files/DOCUMENTATION.md) - Everything you need to know**

This comprehensive guide covers:
- Database Schema & RLS
- Detailed API Reference
- Security Architecture (7 Layers)
- Blog & Content Management
- Troubleshooting Guide

---

## 📄 License

for paid users only for their SaaS project.

**Support**:
- 🐛 Issues: [GitHub Issues](https://github.com/Rayn04/bysaas/issues)
- 🔒 Security: Report privately to security@yourdomain.com

---

**Built with ❤️ | Version 2.0.0**
