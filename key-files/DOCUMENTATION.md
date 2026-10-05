# Next.js SaaS Platform - Complete Documentation

> A production-ready SaaS platform with enterprise-grade security, built with Next.js 14, TypeScript, Supabase, BetterAuth, and Paystack.

**Version:** 2.0.0  
**Last Updated:** December 23, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Quick Start Guide](#quick-start-guide)
5. [Getting Started](#getting-started)
6. [Database Setup](#database-setup)
7. [Authentication & Email Verification](#authentication--email-verification)
8. [Payment System](#payment-system)
   - [Subscription Plans (Dynamic Paystack)](#subscription-plans-dynamic-paystack)
   - [One-Time Payments](#one-time-payments)
9. [Blog System](#blog-system)
10. [Rich Text Editor (Quill)](#rich-text-editor-quill)
11. [Security Implementation](#security-implementation)
12. [Component Toggles & Configuration](#component-toggles--configuration)
13. [Deployment](#deployment)
14. [Project Structure](#project-structure)
15. [API Reference](#api-reference)
16. [Troubleshooting](#troubleshooting)

---

## Overview

This is a **full-stack SaaS platform template** designed for rapid deployment with production-ready security features. Perfect for entrepreneurs and developers who want to launch their SaaS business quickly without starting from scratch.

### What's Included

✅ **Complete Authentication System** - Email/password + social login  
✅ **Payment Processing** - Subscriptions & one-time payments via Paystack  
✅ **Blog/Content Management** - SEO-optimized blog with rich text editor  
✅ **Admin Dashboard** - User management, payment tracking, content moderation  
✅ **Enterprise Security** - 7 layers of protection (rate limiting, CSRF, RLS, etc.)  
✅ **Database Setup** - PostgreSQL with Row Level Security policies  
✅ **Email System** - Transactional emails via Resend  
✅ **Waitlist System** - Pre-launch email collection  
✅ **Newsletter System** - Email campaigns and subscriber management - comming soon 

### Who Is This For?

- 🚀 **Entrepreneurs** launching a SaaS business
- 💻 **Developers** who need a production-ready boilerplate
- 🎯 **Startups** wanting to validate ideas quickly
- 🏢 **Agencies** building client projects faster

### Key Highlights

- 🔐 **Enterprise Security**: Rate limiting, CSRF protection, input validation, strong passwords
- 💳 **Payment Ready**: Paystack integration with webhook verification (subscriptions + one-time)
- 👥 **Multi-tenancy**: User and admin dashboards with role-based access
- 📧 **Email System**: Transactional emails with Resend
- 🗄️ **Database**: PostgreSQL with Row Level Security (RLS)
- 📝 **Blog System**: SEO-optimized with Quill rich text editor
- 🚀 **Deploy Ready**: Optimized for Vercel with edge functions

---

## Features

### Core Features
- ✅ **Next.js 14** with App Router and Server Components
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** + shadcn/ui components
- ✅ **BetterAuth** with session management
- ✅ **Paystack** payments (subscriptions + one-time products)
- ✅ **Resend** for transactional emails
- ✅ **Supabase** PostgreSQL database
- ✅ **Row Level Security** (RLS) policies
- ✅ **Blog System** with SEO optimization
- ✅ **Quill Editor** for rich text content
- ✅ **Waitlist System** for pre-launch
- ✅ **Newsletter System** with campaign management

### Authentication
- Email/password authentication with strong password requirements (12+ chars, complexity)
- Social login support (Google, GitHub)
- Email verification with customizable templates
- Session management with 7-day expiry
- Protected routes and API endpoints
- Role-based access control (User, Admin)

### Security Features (7 Layers)
1. **Input Validation**: Zod schemas for all user inputs
2. **Rate Limiting**: Tiered limits per endpoint type (auth: 5/15min, payments: 3/hour, API: 100/min)
3. **CSRF Protection**: Token-based validation for state-changing operations
4. **Password Security**: 12+ characters with uppercase, lowercase, numbers, special characters
5. **Security Headers**: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
6. **Error Handling**: Sanitized responses with correlation IDs
7. **Database RLS**: Row Level Security on all sensitive tables

### Payment System
- **Subscriptions**: Dynamic plan fetching from Paystack dashboard
- **One-Time Payments**: Sell products, templates, licenses, courses
- **Multi-Currency**: Support for NGN, KES, USD, and more
- **Webhook Verification**: HMAC SHA-512 signature validation
- **Payment Tracking**: Full payment history and analytics
- **Idempotency**: Prevents duplicate payment processing
- **Admin Dashboard**: Payment management and status updates

### Blog System
- **MDX Support**: Write content in Markdown with React components
- **SEO Optimized**: Dynamic sitemaps, meta tags, Open Graph images
- **Rich Text Editor**: Quill WYSIWYG editor for content creation
- **Categories & Tags**: Organize content for easy discovery
- **Analytics**: Track views, reads, and engagement
- **Draft/Published**: Content workflow management
- **Public/Admin Views**: Separate interfaces for readers and editors

### Admin Features
- Payment management dashboard
- User management interface
- Blog content moderation
- Newsletter campaign management
- Waitlist management
- Payment status updates
- Audit logging for all actions
- Admin IP whitelisting (optional)
- Stricter rate limiting (50 req/min vs 100)

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM |
| **Authentication** | BetterAuth 1.4.7 |
| **Payments** | Paystack |
| **Emails** | Resend |
| **Validation** | Zod |
| **Rate Limiting** | Upstash Redis |
| **Deployment** | Vercel |

---

## Quick Start Guide

### Get Running in 15 Minutes

**Step 1: Clone & Install (2 min)**
```bash
git clone https://github.com/Rayn04/bysaas.git
cd bysaas
npm install --legacy-peer-deps
```

**Step 2: Generate Secrets & Environment (2 min)**
```bash
npm run setup:secrets
# Creates .env.local from .env.example and fills BETTER_AUTH_SECRET + CSRF_SECRET
```
Then edit `.env.local` with your Supabase credentials.

**Step 3: Setup Database (5 min)**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Copy connection string (Transaction pooler, port 6543)
4. Run `supabase/main.sql` in SQL Editor

**Step 4: Start Development (1 min)**
```bash
npm run dev
```
Visit: http://localhost:3000

### Quick Paystack Setup (Optional)

Enable dynamic pricing from Paystack dashboard:

1. Create plans in [Paystack Dashboard](https://dashboard.paystack.com) → Plans
2. Name plans: "Pro Plan", "Premium Plan" (must contain tier keywords)
3. Set amounts in minor units (kobo/cents)
4. Add API keys to `.env.local`
5. Test: `curl http://localhost:3000/api/payments/plans`

✅ Done! Prices update automatically from Paystack.

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account
- Paystack account (test keys)
- Resend account (optional for emails)
- Upstash account (optional for rate limiting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rayn04/bysaas.git
   cd bysaas
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: `--legacy-peer-deps` required due to better-auth/drizzle-orm version compatibility.

3. **Generate security secrets**
   ```bash
   npm run setup:secrets
   ```
   This creates `.env.local` from `.env.example` (if needed) and fills in `CSRF_SECRET` and `BETTER_AUTH_SECRET`. Re-run with `--force` to regenerate.

4. **Configure environment variables**
   Edit `.env.local` with your credentials (see [Environment Variables](#environment-variables) section).

5. **Set up the database**
   - Follow the [Database Setup](#database-setup) section
   - Run `supabase/main.sql` in Supabase SQL Editor

6. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

`.env.example` is the source of truth for every supported variable. Run `npm run setup:secrets`
to generate `.env.local` and fill the two secrets, then edit in your credentials. The
**minimum required** set is marked below; everything else is optional and only needed for the
corresponding feature.

```bash
# ===== REQUIRED =====
# Database (Supabase Dashboard > Settings > Database > Connection String, use pooler :6543)
DATABASE_URL="postgresql://postgres.yourproject:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"
# Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL="https://yourproject.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Auth secrets (auto-generated by `npm run setup:secrets`)
BETTER_AUTH_SECRET="generate-with-crypto-randomBytes-32-chars"
CSRF_SECRET="generate-with-crypto-randomBytes-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ===== OPTIONAL =====
# Auth URL (defaults to NEXT_PUBLIC_APP_URL)
BETTER_AUTH_URL="http://localhost:3000"

# Payments (Paystack) — only if selling subscriptions/products
PAYSTACK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYSTACK_WEBHOOK_SECRET="your-webhook-secret"
PAYSTACK_PAYMENT_PAGE_SLUG="your-payment-page-slug"

# Email (Resend) — only if sending transactional email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# OAuth — only for social login
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"

# Application
NEXT_PUBLIC_APP_NAME="Your SaaS Platform"
NEXT_PUBLIC_CURRENCY="NGN"
NODE_ENV="development"

# Admin Configuration
ADMIN_EMAILS="admin@yourdomain.com"
ADMIN_IPS=""  # Optional: Comma-separated IPs

# Rate Limiting (recommended for production; in-memory fallback if unset)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

**Secrets not loaded by `npm run setup:secrets`?** Generate one manually with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### Step 1: Get Supabase Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Under **Connection string**, select **Transaction** tab (pooler - works without IPv4)
5. Choose **URI** format
6. Copy the connection string:
   ```
   postgres://postgres.yourproject:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
7. Replace `[PASSWORD]` with your database password

**Important:** Use port `:6543` (Transaction pooler), NOT `:5432` (Direct connection).

### Step 2: Run Database Schema

1. Open Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Copy the entire contents of `supabase/main.sql`
4. Execute the script

This creates:
- BetterAuth tables (`user`, `session`, `account`, `verification`)
- Application tables (`users`, `roles`, `plans`, `payments`, `subscriptions`, `briefs`)
- Row Level Security (RLS) policies
- Indexes for performance
- Sync trigger between BetterAuth and application tables
- Audit logging

### Step 3: Verify Tables

Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see: `account`, `audit_logs`, `briefs`, `payments`, `plans`, `roles`, `session`, `subscriptions`, `user`, `users`, `verification`.

### Database Schema Overview

```
user (BetterAuth)
├── id: TEXT (primary key)
├── email: TEXT (unique)
├── name: TEXT
├── email_verified: BOOLEAN
└── CASCADE → session, account

users (Application)
├── id: TEXT (references user.id via trigger)
├── email: TEXT
├── role_id: UUID → roles
├── subscription_tier: ENUM
└── CASCADE → payments, subscriptions, briefs

payments
├── user_id: TEXT → users
├── paystack_reference: TEXT (unique)
├── amount: DECIMAL
├── status: ENUM
└── metadata: JSONB
```

---

## Authentication & Email Verification

### How Authentication Works

1. **Sign Up**
   - User provides email, name, password
   - Password validated: 12+ chars, uppercase, lowercase, number, special character
   - Verification email sent (console in dev, Resend in production)
   - User record created in `user` table
   - Sync trigger creates record in `users` table

2. **Email Verification**
   - User clicks link in email
   - Token validated against `verification` table
   - `email_verified` flag set to `true`
   - User automatically signed in

3. **Session Management**
   - Session stored in `session` table
   - 7-day expiry with 1-day refresh
   - HttpOnly cookies for security
   - IP address and user agent tracked

### Email Verification Setup

#### Development Mode (Console)
Verification links print to terminal. Check console after signup:
```
========================================
📧 EMAIL VERIFICATION REQUIRED
========================================
User: user@example.com
Name: John Doe

🔗 Verification URL:
http://localhost:3000/api/auth/verify-email?token=...
========================================
```

#### Production Mode (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get API key from [resend.com/api-keys](https://resend.com/api-keys)
3. Add to `.env.local`:
   ```bash
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   RESEND_FROM_EMAIL="noreply@yourdomain.com"
   ```
4. Verify your domain in Resend dashboard

**Email Template** (customizable in `lib/auth.ts`):
- Welcome message
- Verify button (blue, prominent)
- Fallback link
- 24-hour expiration notice

#### Verify Existing Users

If you have existing users without email verification:
```sql
UPDATE "user" SET email_verified = true WHERE email_verified = false;
```

### Social Login Setup

**Google OAuth:**
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
5. Add to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

**GitHub OAuth:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
4. Add to `.env.local`:
   ```bash
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```

---

## Payment System

The platform includes **two payment models**: subscription plans and one-time purchases, both powered by Paystack.

### Overview

- 🔄 **Subscriptions**: Recurring monthly/annual plans (Pro, Premium)
- 💰 **One-Time**: Products, templates, licenses, courses
- 🌍 **Multi-Currency**: NGN, KES, USD support
- 🔒 **Secure**: Webhook verification, amount validation, idempotency
- 📊 **Analytics**: Payment tracking and reporting

---

## Subscription Plans (Dynamic Paystack)

### What is Dynamic Paystack Plans?

Instead of hardcoding prices in your codebase, the system **fetches plans directly from your Paystack dashboard**. This means:

✅ Update prices without deploying code  
✅ Add new currencies in minutes  
✅ Centralized pricing management  
✅ Automatic cache refresh  
✅ Fallback to default plans if Paystack is down

### Quick Setup (5 Minutes)

**Step 1: Create Plans in Paystack Dashboard**

1. Go to [Paystack Dashboard](https://dashboard.paystack.com) → **Payments** → **Plans**
2. Click **Create Plan**
3. Create plans with tier keywords in the name:

**Pro Plan (NGN):**
- Name: `Pro Plan` ← Must contain "pro"
- Amount: `500000` (₦5,000 in kobo)
- Interval: `Monthly`
- Currency: `NGN`

**Premium Plan (NGN):**
- Name: `Premium Plan` ← Must contain "premium"
- Amount: `1500000` (₦15,000 in kobo)
- Interval: `Monthly`
- Currency: `NGN`

> **Critical**: Plan name or plan code MUST contain the tier keyword: `free`, `pro`, or `premium` (case-insensitive)

**Step 2: Add Paystack API Keys**

Add to `.env.local`:
```bash
PAYSTACK_SECRET_KEY="sk_test_xxxxx"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_xxxxx"
PAYSTACK_WEBHOOK_SECRET="your-webhook-secret"
```

**Step 3: Test It Works**

```bash
# Start dev server
npm run dev

# Test API endpoint
curl http://localhost:3000/api/payments/plans

# You should see your Paystack plans!
```

**Step 4: Verify in Browser**

Visit: http://localhost:3000/dashboard/payment

✅ Plans show Paystack names and prices  
✅ No yellow fallback warning appears  
✅ Prices match Paystack dashboard

### Multi-Currency Support

Create separate plans for each currency with the same tier keyword:

```
Plan Name: "Pro Plan"      Currency: NGN  Amount: ₦5,000
Plan Name: "Pro Plan KES"  Currency: KES  Amount: KSh 9,500  
Plan Name: "Pro Plan USD"  Currency: USD  Amount: $15
```

The system automatically shows the correct price based on `NEXT_PUBLIC_CURRENCY` environment variable.

### How It Works

```
User visits /dashboard/payment
         ↓
App calls /api/payments/plans
         ↓
API fetches from Paystack (cached 5 min)
         ↓
Plans mapped to tiers (free/pro/premium)
         ↓
Merged with fallback plans
         ↓
User sees current Paystack pricing
         ↓
User clicks "Upgrade"
         ↓
Payment initialized with Paystack plan
         ↓
Amount validated against Paystack
         ↓
User redirected to Paystack checkout
         ↓
Webhook processes payment
         ↓
Subscription upgraded
```

### Plan Detection Rules

Plans are detected by matching keywords in **plan name** or **plan code**:

| Keyword | Tier | Example Names |
|---------|------|---------------|
| `free` | Free | "Free Plan", "FREE_TIER", "Starter Free" |
| `pro` | Pro | "Pro Plan", "PRO_MONTHLY", "Professional" |
| `premium` | Premium | "Premium Plan", "PREMIUM", "Premium Subscription" |

**Examples:**
- ✅ "Pro Plan" → Detected as `pro`
- ✅ "PREMIUM_NGN" → Detected as `premium`
- ✅ "Professional Package" → Detected as `pro`
- ❌ "Monthly Plan" → Not detected (no tier keyword)

### Fallback System

If Paystack API is unavailable, the system uses fallback plans defined in `lib/plans.ts`.

**Users see a warning:**
> ⚠️ Unable to fetch plans from Paystack. Showing default pricing.

**Fallback plans are used when:**
- Paystack API is down
- No plans configured in Paystack
- API request fails
- Plans don't match tier keywords
- Network issues

### API Endpoints

**GET /api/payments/plans**

Fetches all subscription plans.

Query params:
- `currency` (optional): Filter by currency (NGN, KES, USD)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "pro",
      "paystackPlanCode": "PLN_xxxxx",
      "paystackId": 12345,
      "label": "Pro Plan",
      "description": "Everything in Free, Pro features",
      "amount": 500000,
      "currency": "NGN",
      "interval": "monthly",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "cached": false
}
```

**POST /api/payments/initialize**

Initialize a subscription payment.

Body:
```json
{
  "amount": 500000,
  "tier": "pro",
  "currency": "NGN",
  "type": "subscription"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxxxx",
    "access_code": "xxxxx",
    "reference": "xxxxx"
  }
}
```

### Cache Management

Plans are **cached for 5 minutes** to reduce API calls.

**Clear cache manually:**
```bash
curl -X DELETE http://localhost:3000/api/payments/plans
```

Or restart your dev server.

### Customization

**Change cache duration:**

File: `app/api/payments/plans/route.ts`
```typescript
const CACHE_DURATION = 10 * 60 * 1000 // Change to 10 minutes
```

**Add custom tier:**

File: `lib/plans.ts`
```typescript
export type Tier = 'free' | 'pro' | 'premium' | 'enterprise'
```

File: `app/api/payments/plans/route.ts`
```typescript
const tierMatch = plan.name.toLowerCase().match(/\b(free|pro|premium|enterprise)\b/)
```

### Testing

**Test with Paystack test cards:**
- Success: `4084084084084081`
- Declined: `4084084084084081` (amount > 100000)
- Insufficient funds: `5061020000000000`

**Test workflow:**
1. Visit `/dashboard/payment`
2. Click "Upgrade to Pro"
3. Redirected to Paystack
4. Use test card: `4084084084084081`
5. Complete payment
6. Redirected back to app
7. Check `/dashboard` - tier should be upgraded

### Troubleshooting

**Plans not loading?**
- Check `PAYSTACK_SECRET_KEY` in `.env.local`
- Verify plans exist in Paystack dashboard
- Ensure plan names contain tier keywords
- Check server logs for API errors

**Fallback warning showing?**
- Paystack API might be down
- Secret key might be incorrect
- No plans match tier keywords
- Clear cache and retry

**Wrong prices?**
- Verify currency matches `NEXT_PUBLIC_CURRENCY`
- Amounts should be in minor units (kobo/cents)
- Clear browser cache

---

## One-Time Payments

Sell individual products without subscription commitments.

### What Can You Sell?

- 📦 **Templates**: Design templates, code boilerplates
- 📜 **Licenses**: Lifetime access, commercial licenses
- 🎓 **Courses**: Video courses, ebooks, tutorials
- 🔧 **Add-ons**: Extra features, premium components
- 🎨 **Assets**: Graphics, fonts, icons

### Database Tables

**Table: `one_time_products`**
```sql
CREATE TABLE one_time_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'NGN',
  category TEXT,
  features TEXT[],
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: `one_time_purchases`**
```sql
CREATE TABLE one_time_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES one_time_products(id) ON DELETE SET NULL,
  paystack_reference TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Setting Up Products

**Method 1: Supabase Dashboard (Easiest)**

1. Run migration: `supabase/migrations/add_one_time_payments.sql`
2. Go to Supabase → **Table Editor** → `one_time_products`
3. Click **Insert** → Add product:

```
name: "Premium Templates Pack"
description: "20 professional templates"
slug: "premium-templates"
amount: 300000 (₦3,000.00 in kobo)
currency: "NGN"
category: "template"
features: ["20 templates", "Commercial license", "Lifetime updates"]
icon: "package"
is_active: true
display_order: 1
```

**Method 2: SQL Insert**

```sql
INSERT INTO one_time_products (
  name, description, slug, amount, currency, 
  category, features, icon, is_active
) VALUES (
  'Starter Templates',
  '10 professionally designed templates',
  'starter-templates',
  200000,
  'NGN',
  'template',
  ARRAY['10 templates', 'Editable in Figma', 'Commercial use'],
  'layers',
  true
);
```

### Product Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | TEXT | Yes | Product display name |
| `description` | TEXT | No | Short description (shown on cards) |
| `slug` | TEXT | Yes | URL-friendly identifier (unique) |
| `amount` | INTEGER | Yes | Price in minor units (kobo/cents) |
| `currency` | TEXT | Yes | Currency code (NGN, KES, USD) |
| `category` | TEXT | No | Product type (template, license, addon, course) |
| `features` | TEXT[] | No | Array of feature descriptions |
| `icon` | TEXT | No | Lucide React icon name |
| `is_active` | BOOLEAN | Yes | Whether product is available for purchase |
| `display_order` | INTEGER | No | Display order (lowest first) |

### Example Products

**Template Pack:**
```json
{
  "name": "Starter Templates",
  "description": "10 professionally designed templates",
  "slug": "starter-templates",
  "amount": 200000,
  "currency": "KES",
  "category": "template",
  "features": ["10 templates", "Editable in Figma", "Commercial use"],
  "icon": "layers",
  "is_active": true,
  "display_order": 1
}
```

**Lifetime License:**
```json
{
  "name": "Lifetime License",
  "description": "One-time purchase for permanent access",
  "slug": "lifetime-license",
  "amount": 500000,
  "currency": "KES",
  "category": "license",
  "features": ["Lifetime access", "All future updates", "Priority support"],
  "icon": "lock",
  "is_active": true,
  "display_order": 2
}
```

**Video Course:**
```json
{
  "name": "Advanced Course",
  "description": "Complete video course with materials",
  "slug": "advanced-course",
  "amount": 300000,
  "currency": "KES",
  "category": "course",
  "features": ["10+ hours video", "Source files", "Certificate"],
  "icon": "book-open",
  "is_active": true,
  "display_order": 3
}
```

### API Endpoints

**GET /api/payments/products**

Fetch all active products.

Query params:
- `currency` (optional): Filter by currency

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Starter Templates",
      "description": "10 professionally designed templates",
      "slug": "starter-templates",
      "amount": 200000,
      "currency": "NGN",
      "category": "template",
      "features": ["10 templates", "Editable in Figma"],
      "icon": "layers",
      "display_order": 1
    }
  ]
}
```

**POST /api/payments/one-time**

Initialize one-time payment.

Body:
```json
{
  "productId": "uuid",
  "amount": 200000,
  "currency": "NGN"
}
```

Response: Same as subscription payment initialization (authorization_url, reference)

### Payment Flow

1. **User views payment page** → Sees products below subscription plans
2. **User clicks "Buy Now"** → POST to `/api/payments/one-time`
3. **Backend validates:**
   - Product exists and is active
   - Amount matches product price
   - Currency matches product currency
   - User is authenticated
4. **Paystack transaction initialized** → Returns checkout URL
5. **User redirected to Paystack** → Completes payment
6. **Webhook receives callback** → Updates purchase status
7. **User gets confirmation** → Purchase recorded in `one_time_purchases`

### Viewing on Payment Page

Products appear automatically on `/dashboard/payment` below subscription plans.

**Toggle visibility in code:**

File: `app/dashboard/payment/page.tsx`
```typescript
// Show/hide one-time products section
const showOneTimeProducts = true // Set to false to hide
```

### Tracking Purchases

**View all purchases (SQL):**
```sql
SELECT 
  op.id,
  u.email,
  pr.name as product,
  op.amount / 100.0 as price,
  op.currency,
  op.status,
  op.created_at
FROM one_time_purchases op
JOIN users u ON op.user_id = u.id
JOIN one_time_products pr ON op.product_id = pr.id
ORDER BY op.created_at DESC;
```

**Get user's purchases:**
```sql
SELECT * FROM one_time_purchases 
WHERE user_id = $1 
ORDER BY created_at DESC;
```

**Sales analytics:**
```sql
SELECT 
  pr.name,
  COUNT(*) as sales,
  SUM(op.amount) / 100.0 as revenue,
  op.currency
FROM one_time_purchases op
JOIN one_time_products pr ON op.product_id = pr.id
WHERE op.status = 'success'
GROUP BY pr.id, pr.name, op.currency;
```

### Multi-Currency Products

Create products for each currency you support:

```sql
-- NGN version
INSERT INTO one_time_products (name, slug, amount, currency) 
VALUES ('Starter Templates', 'starter-templates', 200000, 'NGN');

-- KES version
INSERT INTO one_time_products (name, slug, amount, currency) 
VALUES ('Starter Templates', 'starter-templates-kes', 300000, 'KES');

-- USD version
INSERT INTO one_time_products (name, slug, amount, currency) 
VALUES ('Starter Templates', 'starter-templates-usd', 15, 'USD');
```

System shows products matching user's selected currency.

### Security Features

✅ **Amount validation**: Server verifies amount matches product  
✅ **Product existence**: Checks product is active before payment  
✅ **Currency validation**: Ensures currency matches product  
✅ **RLS policies**: Users can only see their own purchases  
✅ **Idempotency**: Prevents duplicate purchases  
✅ **Webhook verification**: HMAC SHA-512 signature check  
✅ **Rate limiting**: 3 payment attempts per hour

### Testing

**Test Product Creation:**
```bash
curl -X POST http://localhost:3000/api/payments/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "slug": "test-product",
    "amount": 100000,
    "currency": "NGN",
    "is_active": true
  }'
```

**Test Payment:**
1. Visit: http://localhost:3000/dashboard/payment
2. Find one-time products section
3. Click "Buy Now" on a product
4. Use Paystack test card: `4084084084084081`
5. Complete checkout
6. Check `one_time_purchases` table for record

### Troubleshooting

**Products not showing?**
- Verify `is_active = true`
- Check currency matches `NEXT_PUBLIC_CURRENCY`
- Ensure user is authenticated
- Clear browser cache

**Payment fails?**
- Check amount is correct (in minor units)
- Verify product exists and is active
- Check Paystack API keys are correct
- Review server logs for errors

**Purchase not recorded?**
- Check webhook is configured in Paystack
- Verify `PAYSTACK_WEBHOOK_SECRET` is set
- Look for webhook failures in Paystack dashboard
- Check `one_time_purchases` table directly

---

## Security Implementation

### Security Overview

This project implements **7 layers of security**:

1. **Input Validation** (Zod)
2. **Rate Limiting** (Upstash Redis)
3. **CSRF Protection** (Token-based)
4. **Strong Password Requirements**
5. **Security Headers** (CSP, HSTS, etc.)
6. **Centralized Error Handling**
7. **Row Level Security** (Database RLS)

**Security Level:** Low-Medium Risk ✅ (from Medium-High before implementation)

### 1. Input Validation

All API endpoints validate input using Zod schemas in `lib/validation/`:

- **user-schema.ts**: Profile updates, password changes, email preferences
- **payment-schema.ts**: Payment initialization, verification, webhooks
- **admin-schema.ts**: Admin actions, user management
- **env-schema.ts**: Environment variable validation

**Example:**
```typescript
import { UpdateProfileSchema } from '@/lib/validation/user-schema'

const validated = UpdateProfileSchema.safeParse(body)
if (!validated.success) {
  return NextResponse.json({ error: validated.error }, { status: 400 })
}
```

### 2. Rate Limiting

Implemented in `middleware.ts` with Upstash Redis (in-memory fallback for dev):

| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|---------|---------|
| Authentication | 5 requests | 15 minutes | Prevent brute force |
| Payment Init | 3 requests | 1 hour | Prevent payment spam |
| General API | 100 requests | 1 minute | Prevent DoS |
| Admin | 50 requests | 1 minute | Stricter admin limits |
| Webhooks | 30 requests | 1 minute | External service limits |

**Setup Upstash Redis (Production):**
1. Sign up at [upstash.com](https://upstash.com)
2. Create Redis database
3. Add to `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-token"
   ```

Without Redis, in-memory rate limiting is used (not suitable for multi-instance deployments).

### 3. CSRF Protection

CSRF tokens validated for POST, PUT, PATCH, DELETE requests.

**Token Generation:**
```typescript
import { generateCSRFToken } from '@/lib/csrf'

const session = await getSession()
const csrfToken = generateCSRFToken(session.token)
```

**Include in Requests:**
```typescript
fetch('/api/user/profile', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data)
})
```

**Exemptions:**
- Webhooks (use signature verification instead)
- Auth endpoints (BetterAuth handles CSRF)

### 4. Password Requirements

Enforced by BetterAuth + Zod validation:

- ✅ Minimum 12 characters
- ✅ Maximum 128 characters
- ✅ At least one lowercase letter
- ✅ At least one uppercase letter
- ✅ At least one number
- ✅ At least one special character (@$!%*?&#)

**Examples:**
- ❌ `password123` - No uppercase or special chars
- ❌ `Password123` - No special chars
- ❌ `Pass123!` - Too short (< 12 chars)
- ✅ `Password123!@#` - Valid

### 5. Security Headers

Configured in `next.config.mjs`:

```javascript
Content-Security-Policy: "default-src 'self'; script-src 'self' https://js.paystack.co; ..."
Strict-Transport-Security: "max-age=31536000; includeSubDomains; preload" (production)
X-Content-Type-Options: "nosniff"
X-Frame-Options: "DENY"
Referrer-Policy: "strict-origin-when-cross-origin"
Permissions-Policy: "camera=(), microphone=(), geolocation=()"
```

### 6. Error Handling

Centralized error handling with `lib/error-handler.ts`:

**Features:**
- APIError class with status codes
- Correlation IDs for tracking
- Sanitized client responses (no stack traces)
- Detailed server-side logging

**Usage:**
```typescript
import { handleAPIError, APIError, ErrorCodes } from '@/lib/error-handler'

try {
  // ... operation
} catch (error) {
  return handleAPIError(error, correlationId, { route: '/api/user/profile' })
}
```

### 7. Row Level Security (RLS)

Database security via Supabase RLS policies in `supabase/main.sql`:

**Key Policies:**
- Users can view/edit only their own data
- Admins can view all data (checked via `roles` table)
- Service role bypasses RLS for admin operations
- `subscription_tier` cannot be updated by users directly
- Cascade deletes properly configured

**Example Policy:**
```sql
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);
```

### Security Testing

**Test Rate Limiting:**
```bash
for i in {1..6}; do curl http://localhost:3000/api/auth/sign-in -X POST; done
# 6th request should return 429 Too Many Requests
```

**Test Input Validation:**
```bash
curl http://localhost:3000/api/user/profile -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"invalid"}'
# Should return validation error
```

**Test Security Headers:**
```bash
curl -I http://localhost:3000
# Should show CSP, X-Frame-Options, etc.
```

---

## Payment Integration

### Paystack Setup

1. **Get API Keys**
   - Go to [Paystack Dashboard](https://dashboard.paystack.com)
   - Navigate to Settings → API Keys & Webhooks
   - Copy Test Public Key and Secret Key
   - Add to `.env.local`:
     ```bash
     PAYSTACK_SECRET_KEY="sk_test_..."
     NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
     ```

2. **Configure Webhook**
   - In Paystack Dashboard → Settings → API Keys & Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Generate webhook secret
   - Add to `.env.local`:
     ```bash
     PAYSTACK_WEBHOOK_SECRET="your-secret"
     ```

### Subscription Tiers

Defined in `lib/plans.ts`:

```typescript
export const PLANS = {
  pro: {
    name: 'Pro',
    price: 5000, // NGN (50.00 in major units)
    currency: 'NGN',
    features: ['Feature 1', 'Feature 2', 'Feature 3']
  },
  premium: {
    name: 'Premium',
    price: 10000, // NGN (100.00 in major units)
    currency: 'NGN',
    features: ['All Pro features', 'Feature 4', 'Priority support']
  }
}
```

### Payment Flow

1. **Initialize Payment**
   ```typescript
   POST /api/payments/initialize
   {
     "amount": 5000,
     "tier": "pro",
     "currency": "NGN"
   }
   ```
   Returns: `{ authorization_url, reference, access_code }`

2. **User Redirected to Paystack**
   - User completes payment on Paystack
   - Redirected back to `callback_url`

3. **Webhook Verification**
   ```
   POST /api/payments/webhook
   X-Paystack-Signature: <signature>
   {
     "event": "charge.success",
     "data": { "reference": "...", "amount": 5000, ... }
   }
   ```

4. **Subscription Upgrade**
   - Payment status updated to `success`
   - User's `subscription_tier` upgraded
   - Confirmation email sent (if Resend configured)

### Payment Security

- ✅ Webhook signature verification (HMAC SHA-512)
- ✅ Idempotency checking (prevents duplicate processing)
- ✅ Server-side amount validation (prevents tampering)
- ✅ Rate limiting (3 payment attempts per hour)
- ✅ Service role used for subscription upgrades (bypasses RLS)

---

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (all from `.env.local`)
   - Click "Deploy"

3. **Set Production Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:
   
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   BETTER_AUTH_URL=https://yourdomain.com
   
   # Use production keys
   PAYSTACK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
   
   # All other variables from .env.local
   ```

4. **Update Paystack Webhook**
   - Go to Paystack Dashboard → Webhooks
   - Update URL to: `https://yourdomain.com/api/payments/webhook`

5. **Configure Custom Domain**
   - In Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### Production Checklist

Before deploying:

- [ ] All secrets generated and secured
- [ ] Upstash Redis configured (not in-memory)
- [ ] `NODE_ENV=production` set
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Database RLS policies applied (`supabase/main.sql`)
- [ ] Paystack webhook URL updated
- [ ] Admin emails configured
- [ ] Security headers tested
- [ ] Rate limiting tested under load
- [ ] Error tracking configured (optional: Sentry)
- [ ] Domain DNS configured
- [ ] SSL certificate active

### Environment-Specific Configuration

**Development:**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

**Production:**
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
BETTER_AUTH_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Project Structure

```
piebot/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── payments/         # Payment endpoints
│   │   ├── user/             # User management
│   │   └── admin/            # Admin endpoints
│   ├── auth/                 # Auth pages (sign-in, sign-up)
│   ├── dashboard/            # User dashboard
│   ├── admin/                # Admin dashboard
│   └── payments/             # Payment pages
│
├── components/                # React components
│   ├── auth/                 # Auth forms
│   ├── settings/             # Settings components
│   ├── payments/             # Payment forms
│   ├── admin/                # Admin components
│   ├── layout/               # Layout components
│   └── ui/                   # shadcn/ui components
│
├── lib/                       # Utility libraries
│   ├── auth.ts               # BetterAuth configuration
│   ├── auth-client.ts        # Client-side auth
│   ├── auth-utils.ts         # Auth helpers
│   ├── auth-schema.ts        # Drizzle schema
│   ├── paystack.ts           # Paystack utilities
│   ├── plans.ts              # Subscription plans
│   ├── rate-limit.ts         # Rate limiting
│   ├── csrf.ts               # CSRF protection
│   ├── error-handler.ts      # Error handling
│   ├── supabase/             # Supabase clients
│   └── validation/           # Zod schemas
│       ├── user-schema.ts
│       ├── payment-schema.ts
│       ├── admin-schema.ts
│       └── env-schema.ts
│
├── supabase/                  # Database
│   └── main.sql              # Complete database schema
│
├── scripts/                   # Utility scripts
│   ├── setup-security.js     # Generate secrets (npm run setup:secrets)
│   └── validate-env.js       # Pre-build env validation
│
├── key-files/                # Guides (this file, DEPLOYMENT, SECURITY, AI-FEATURE-GUIDE)
├── middleware.ts              # Edge middleware (rate limiting)
├── next.config.mjs           # Next.js config (security headers)
├── tailwind.config.ts        # Tailwind config
├── tsconfig.json             # TypeScript config
├── .env.example              # Environment template
└── README.md                 # Start here
```

---

## API Reference

### Authentication

**POST /api/auth/sign-up**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!@#"
}
```
Response: `201 Created` with session

**POST /api/auth/sign-in**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!@#"
}
```
Response: `200 OK` with session

**POST /api/auth/sign-out**
No body required. Invalidates session.

### User Management

**PATCH /api/user/profile**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```
Requires: Authentication, CSRF token

**PATCH /api/user/password**
```json
{
  "currentPassword": "OldPass123!@#",
  "newPassword": "NewPass123!@#",
  "confirmPassword": "NewPass123!@#"
}
```
Requires: Authentication, CSRF token

**DELETE /api/user/delete**
No body required. Deletes account and all associated data.
Requires: Authentication, CSRF token

### Payments

**POST /api/payments/initialize**
```json
{
  "amount": 5000,
  "tier": "pro",
  "currency": "NGN"
}
```
Response: `{ authorization_url, reference, access_code }`
Requires: Authentication, CSRF token

**POST /api/payments/webhook**
Paystack webhook endpoint. Validates signature and processes payments.

### Admin

**GET /api/admin/payments**
Returns all payments with optional filtering.
Requires: Admin role

**PATCH /api/admin/payments/status**
```json
{
  "paymentId": "uuid",
  "status": "success",
  "notes": "Manual verification"
}
```
Requires: Admin role, CSRF token

---

## Troubleshooting

### Build Errors

**Error: Module not found**
```bash
npm install --legacy-peer-deps
```

**TypeScript errors**
```bash
npm run build
```
Check `tsconfig.json` path aliases.

### Database Issues

**Connection timeout**
- Use Transaction pooler (port 6543), not Direct connection (port 5432)
- Verify DATABASE_URL in `.env.local`
- Check Supabase project is active

**RLS policy errors**
- Ensure `supabase/main.sql` has been executed
- Check `auth.uid()` matches user ID type (TEXT)
- Verify service role key for admin operations

### Authentication Issues

**Email verification not working**
- Check terminal for verification link (dev mode)
- Verify RESEND_API_KEY is set (production)
- Check `verification` table for token

**Session expired**
- Sessions expire after 7 days
- Check `session` table for active sessions
- Verify BETTER_AUTH_SECRET is set

### Payment Issues

**Paystack initialization fails**
- Verify PAYSTACK_SECRET_KEY is correct
- Check amount matches tier pricing
- Ensure user is authenticated

**Webhook not received**
- Verify webhook URL in Paystack Dashboard
- Check PAYSTACK_WEBHOOK_SECRET matches
- Test webhook with Paystack's test event

### Rate Limiting Issues

**429 Too Many Requests**
- Wait for rate limit window to reset
- Check UPSTASH_REDIS_REST_URL is set
- Verify rate limit headers in response

**Rate limiting not working**
- Without Upstash Redis, uses in-memory (doesn't work across instances)
- Check middleware.ts is configured
- Verify matcher pattern in middleware config

### Security Issues

**CSRF token invalid**
- Ensure `X-CSRF-Token` header is included
- Verify CSRF_SECRET is set and matches
- Check token is generated from current session

**Password validation failing**
- Must be 12+ characters
- Requires uppercase, lowercase, number, special char
- Check error message for specific requirement

---

## Blog System

A production-ready blog with SEO optimization, MDX support, and rich text editing.

### Features

✅ **MDX Support**: Write in Markdown with React components  
✅ **SEO Optimized**: Dynamic sitemaps, meta tags, Open Graph  
✅ **Rich Text Editor**: Quill WYSIWYG editor  
✅ **Categories & Tags**: Organize content  
✅ **Analytics**: View/read tracking  
✅ **Draft/Published**: Content workflow  
✅ **Public/Admin**: Separate interfaces

### Database Tables

**blog_posts** - Store post metadata
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  author_id TEXT REFERENCES users(id),
  status TEXT DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  category TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  og_image_url TEXT,
  reading_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**blog_views** - Track analytics
```sql
CREATE TABLE blog_views (
  id UUID PRIMARY KEY,
  post_slug TEXT REFERENCES blog_posts(slug),
  user_id TEXT REFERENCES users(id),
  read_percentage INTEGER DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

**Public:**
- `GET /api/blog` - List published posts (paginated)
- `GET /api/blog/[slug]` - Get single post
- `POST /api/blog/[slug]/view` - Track view
- `GET /api/blog/search` - Search posts

**Admin:**
- `POST /api/admin/blog` - Create post
- `PATCH /api/admin/blog/[slug]` - Update post
- `DELETE /api/admin/blog/[slug]` - Delete post
- `PATCH /api/admin/blog/[slug]/status` - Publish/unpublish
- `GET /api/admin/blog/analytics` - Get analytics

### Creating Blog Posts

**As Admin:**

1. Visit: `/admin/blog`
2. Click "New Post"
3. Fill in form:
   - Title (required)
   - Slug (auto-generated from title)
   - Description (meta description)
   - Category
   - Tags (comma-separated)
   - Content (Quill editor)
4. Click "Save as Draft" or "Publish"

**Programmatically:**

```typescript
const response = await fetch('/api/admin/blog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    title: 'How to Build a SaaS',
    slug: 'how-to-build-saas',
    description: 'Step-by-step guide',
    content: '<h2>Introduction</h2><p>Content here...</p>',
    category: 'Tutorial',
    tags: ['saas', 'nextjs', 'tutorial'],
    status: 'published',
    featured: false,
  })
})
```

### Viewing Blog Posts

**Public Blog:** `/blog`
- Lists all published posts
- Filter by category/tags
- Search functionality
- Pagination
- Reading time displayed

**Single Post:** `/blog/[slug]`
- Full post content
- Author info
- Related posts
- Share buttons
- Reading progress indicator

### SEO Features

**Automatic Sitemap:** `/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/blog/how-to-build-saas</loc>
    <lastmod>2024-01-01</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Meta Tags** (auto-generated):
```html
<title>How to Build a SaaS | Your SaaS</title>
<meta name="description" content="Step-by-step guide..." />
<meta property="og:title" content="How to Build a SaaS" />
<meta property="og:description" content="Step-by-step guide..." />
<meta property="og:image" content="/blog/slug/opengraph-image" />
<meta name="twitter:card" content="summary_large_image" />
```

**Open Graph Images:** `/blog/[slug]/opengraph-image`
- Dynamically generated 1200x630 images
- Post title + branding
- Automatic social media previews

### Analytics

Track post performance in admin dashboard:

**Metrics:**
- Total views
- Total reads (100% scroll)
- Average read percentage
- Views by day
- Top performing posts

**View in Admin:**
```
/admin/blog → Analytics tab
```

**API Query:**
```bash
curl http://localhost:3000/api/admin/blog/analytics?period=7d
```

### Categories & Tags

**Categories:** Broad classification
- Tutorial
- News
- Guide
- Case Study
- Update

**Tags:** Specific topics
- nextjs
- typescript
- payments
- authentication
- deployment

**Filter Posts:**
```
/blog?category=Tutorial
/blog?tag=nextjs
/blog?category=Tutorial&tag=typescript
```

### Blog Settings

**Configure in `.env.local`:**
```bash
NEXT_PUBLIC_BLOG_ENABLED=true
NEXT_PUBLIC_POSTS_PER_PAGE=10
```

**Toggle blog in navigation:**

File: `components/layout/dashboard-nav.tsx`
```typescript
const showBlog = process.env.NEXT_PUBLIC_BLOG_ENABLED === 'true'
```

### Security

✅ **Admin-only editing**: Role check required  
✅ **Input validation**: Zod schemas  
✅ **XSS protection**: Content sanitization  
✅ **Rate limiting**: API endpoints  
✅ **RLS policies**: User data protection

---

## Rich Text Editor (Quill)

Quill WYSIWYG editor for creating rich blog content.

### Features

- **Headers**: H1, H2, H3
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Font Sizes**: Small, normal, large, huge
- **Colors**: Text color, background highlighting
- **Lists**: Ordered, bullet points
- **Indentation**: Indent, outdent
- **Alignment**: Left, center, right, justify
- **Media**: Links, images, videos
- **Code**: Code blocks with syntax highlighting
- **Blockquotes**: Quote formatting
- **Clean**: Remove all formatting

### Component Location

File: `components/blog/quill-editor.tsx`

### Usage

```typescript
import { QuillEditor } from '@/components/blog/quill-editor'

function BlogForm() {
  const [content, setContent] = useState('')
  
  return (
    <QuillEditor 
      value={content} 
      onChange={setContent}
      placeholder="Write your post..."
    />
  )
}
```

### Props

```typescript
interface QuillEditorProps {
  value: string          // HTML content
  onChange: (content: string) => void
  placeholder?: string   // Placeholder text
  readOnly?: boolean     // Disable editing
  className?: string     // Additional CSS
}
```

### Content Format

Editor outputs **HTML**:

```html
<h2>Welcome to My Blog</h2>
<p>This is <strong>bold</strong> and <em>italic</em> text.</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>
<p><a href="https://example.com">Link</a></p>
<pre class="ql-syntax">const code = "example"</pre>
```

### Styling

Custom styles in `app/globals.css`:

```css
.ql-container {
  min-height: 400px;
  border-radius: 0.5rem;
}

.ql-toolbar {
  border-radius: 0.5rem 0.5rem 0 0;
  background: hsl(var(--muted));
}

.ql-editor {
  font-size: 1rem;
  line-height: 1.75;
}
```

Dark mode supported via CSS variables.

### Integration

Currently used in:
- ✅ Admin blog creation (`/admin/blog/new`)
- ✅ Admin blog editing (`/admin/blog/[slug]`)

Integrated in `components/blog/blog-form.tsx`.

### Data Flow

```
User types in editor
      ↓
onChange fires with HTML
      ↓
HTML stored in state
      ↓
Form submitted
      ↓
HTML sent to API
      ↓
Saved to blog_posts.content
      ↓
Rendered on blog pages
```

### Security

✅ **Safe by default**: Quill sanitizes input  
✅ **XSS protection**: React escaping  
✅ **Content validation**: Server-side checks

**Optional extra sanitization:**
```bash
npm install dompurify
```

```typescript
import DOMPurify from 'dompurify'

const clean = DOMPurify.sanitize(html)
```

### Troubleshooting

**Editor not loading?**
- Check browser console
- Verify `react-quill` installed
- CSS imported in `globals.css`

**Content not saving?**
- Check `onChange` callback
- Verify API payload includes `content`
- Database column accepts TEXT

**Styling issues?**
- Clear browser cache
- Check dark mode CSS variables
- Verify Quill CSS loads first

---

## Component Toggles & Configuration

The platform includes several toggleable components for different launch phases.

### Hero Section Toggle

Switch between waitlist and main product hero.

**File:** `components/home/hero-toggle.tsx`

**Configuration:**
```typescript
const SHOW_WAITLIST = false // Change to true for waitlist mode
```

**Waitlist Mode (true):**
- Light gradient background
- Headline: "🚀 The Ultimate African SaaS Starter Kit"
- CTA: Blue button → `#waitlist`
- Use when: Pre-launch, collecting emails

**Main Mode (false):**
- Clean white background
- Headline: "Launch your SaaS in days, not months"
- CTA: Primary button → `#pricing`
- Use when: Actively selling

**Customization:**
```typescript
// Edit button text
<Button>Join Waitlist</Button>  // Waitlist mode
<Button>Get Started</Button>    // Main mode

// Edit colors
className="bg-gradient-to-r from-indigo-500..."  // Waitlist
className="bg-gradient-to-r from-orange-500..."  // Main
```

### Navigation Toggle

Switch navigation links based on launch phase.

**File:** `components/layout/nav-toggle.tsx`

**Configuration:**
```typescript
const SHOW_WAITLIST_NAV = false // Set to true for waitlist links
```

**Waitlist Navigation (true):**
```typescript
[
  { href: "#features", label: "Features" },
  { href: "#waitlist", label: "Join Waitlist" },
  { href: "#faq", label: "FAQ" }
]
```

**Main Navigation (false):**
```typescript
[
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "#faq", label: "FAQ" }
]
```

**Usage:**
```typescript
import { NavLinks } from '@/components/layout/nav-toggle'

function Nav() {
  return (
    <nav>
      {NavLinks.map(link => (
        <a key={link.href} href={link.href}>
          {link.label}
        </a>
      ))}
    </nav>
  )
}
```

### Feature Toggles

Control which features are visible/enabled.

**File:** `.env.local`

```bash
# Blog
NEXT_PUBLIC_BLOG_ENABLED=true

# Waitlist
NEXT_PUBLIC_WAITLIST_ENABLED=false

# Newsletter
NEXT_PUBLIC_NEWSLETTER_ENABLED=true

# One-Time Payments
NEXT_PUBLIC_ONE_TIME_PAYMENTS_ENABLED=true

# Social Login
NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED=false
NEXT_PUBLIC_GITHUB_LOGIN_ENABLED=false
```

**Usage in Code:**
```typescript
const blogEnabled = process.env.NEXT_PUBLIC_BLOG_ENABLED === 'true'

{blogEnabled && (
  <Link href="/blog">Blog</Link>
)}
```

### Dashboard Sidebar Links

Add/remove features from user dashboard.

**File:** `components/layout/dashboard-sidebar.tsx`

```typescript
const sidebarLinks = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  // Add new features here:
  { href: '/dashboard/blog', icon: BookOpen, label: 'My Posts' },
]
```

### Admin Navigation

Configure admin dashboard links.

**File:** `app/admin/layout.tsx`

```typescript
const adminLinks = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/waitlist', label: 'Waitlist' },
]
```

### Conditional Rendering Patterns

**Check user role:**
```typescript
const session = await getSession()
const isAdmin = session?.user?.role === 'admin'

{isAdmin && <AdminPanel />}
```

**Check subscription tier:**
```typescript
const user = await getUser()
const isPro = user.subscription_tier === 'pro'

{isPro ? <ProFeature /> : <UpgradePrompt />}
```

**Check feature flag:**
```typescript
const featureEnabled = process.env.FEATURE_X_ENABLED === 'true'

{featureEnabled && <FeatureX />}
```

### Launch Phase Checklist

**Pre-Launch (Waitlist Mode):**
- [ ] Set `SHOW_WAITLIST = true`
- [ ] Set `SHOW_WAITLIST_NAV = true`
- [ ] Set `NEXT_PUBLIC_WAITLIST_ENABLED = true`
- [ ] Hide pricing section
- [ ] Disable payments temporarily
- [ ] Enable newsletter for announcements

**Launch (Main Mode):**
- [ ] Set `SHOW_WAITLIST = false`
- [ ] Set `SHOW_WAITLIST_NAV = false`
- [ ] Enable payments
- [ ] Show pricing section
- [ ] Enable blog for content marketing
- [ ] Configure social login

**Post-Launch:**
- [ ] Monitor analytics
- [ ] Enable all features
- [ ] Set up admin dashboard
- [ ] Configure email campaigns
- [ ] Enable one-time products

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [BetterAuth Documentation](https://better-auth.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api/)
- [Zod Documentation](https://zod.dev)
- [Upstash Redis](https://docs.upstash.com/redis)
- [Vercel Deployment](https://vercel.com/docs)

---

## Support & Contributing

For issues or questions:
1. Check this comprehensive documentation
2. Review error logs with correlation IDs
3. Test in development environment first
4. Search existing GitHub issues
5. Open a new issue with details

**Security Issues**: Report privately to security@yourdomain.com

**Contributing**: Pull requests welcome! Please:
- Follow existing code patterns
- Maintain all 7 security layers
- Add tests for new features
- Update documentation

---

## Summary

This Next.js SaaS boilerplate provides everything you need to launch quickly:

✅ **Complete Auth System** - Email/password + social login  
✅ **Dual Payment Models** - Subscriptions (dynamic from Paystack) + one-time products  
✅ **Blog Platform** - SEO-optimized with rich text editor  
✅ **Enterprise Security** - 7 layers of protection  
✅ **Admin Dashboard** - Full management interface  
✅ **Pre-Launch Tools** - Waitlist + newsletter system  
✅ **Production Ready** - Deployed to Vercel in minutes

**Key Configuration Files:**
- `.env.local` - All environment variables
- `supabase/main.sql` - Complete database schema
- `lib/plans.ts` - Subscription plans (fallback)
- `middleware.ts` - Rate limiting + security
- `next.config.mjs` - Security headers

**Important Toggles:**
- `SHOW_WAITLIST` - Hero section mode
- `SHOW_WAITLIST_NAV` - Navigation links
- `NEXT_PUBLIC_*_ENABLED` - Feature flags

**Quick Links:**
- Development: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Admin: http://localhost:3000/admin
- Blog: http://localhost:3000/blog
- API Docs: [API Reference](#api-reference)

---

**Built with ❤️ using Next.js, TypeScript, Supabase, and modern web technologies.**

**Version 2.0.0** | Last Updated: December 23, 2025