# AGENTS.md

Instructions for AI coding agents working in this repository. This file is the **canonical source of truth for conventions**. When another document (including `.github/copilot-instructions.md` and `key-files/AI-FEATURE-GUIDE.md`) disagrees, follow this file **and the actual code**.

## Project

Production-ready SaaS boilerplate: Next.js 14 (App Router) + TypeScript.

- **Database:** Supabase (PostgreSQL) with Row Level Security; Drizzle used for the BetterAuth schema (`lib/auth-schema.ts`)
- **Auth:** BetterAuth (`lib/auth.ts`), sessions in the `session` table
- **Payments:** Paystack (subscriptions fetched dynamically from the Paystack dashboard + one-time products)
- **Email:** Resend · **Validation:** Zod · **Rate limiting:** Upstash Redis (in-memory fallback)
- **UI:** Tailwind CSS + shadcn/ui

## Commands

```bash
npm run dev            # dev server
npm run build          # production build (runs `prebuild` env validation first)
npm run lint           # next lint
npm run type-check     # tsc --noEmit
npm run test           # jest
npm run setup:secrets  # create .env.local, fill BETTER_AUTH_SECRET + CSRF_SECRET
npm run deploy:staging
npm run deploy:production
```

After any change, run `npm run lint` and `npm run type-check`.

## Critical rules (do not break)

1. **Check existing patterns first** — copy the closest existing route/component, don't invent.
2. **Never break the auth flow** (sign-up → email verification → session).
3. **Every new table gets RLS** (users see own, admins see all) + indexes.
4. **Every API input is validated with a Zod schema** from `lib/validation/`.
5. **Every API route uses `handleAPIError` + a correlation ID.**
6. **Keep all 7 security layers** (validation, rate limiting, CSRF, auth, RLS, error handling, security headers).
7. **Integrate features into navigation** — a page with no nav link is incomplete.
8. **Use shadcn/ui components**, never custom primitives.
9. **Never commit secrets**; never give a server secret a `NEXT_PUBLIC_` prefix.

## Ground-truth patterns (these are what the code actually uses)

### Auth in an API route

```typescript
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })
if (!session) throw new APIError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required')
```

### API route shape

```typescript
// File: app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CreateFeatureSchema } from '@/lib/validation/feature-schema'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) throw new APIError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required')

    const body = await request.json()
    const validated = CreateFeatureSchema.safeParse(body)
    if (!validated.success) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid input', validated.error.errors)
    }

    const { data, error } = await supabaseAdmin
      .from('feature')
      .insert({ user_id: session.user.id, ...validated.data })
      .select()
      .single()
    if (error) throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Database error')

    return NextResponse.json({ success: true, data, correlationId }, { status: 201 })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/feature', method: 'POST' })
  }
}
```

> **`APIError` signature is `new APIError(statusCode: number, code: string, message: string, details?)`.** Parse the constructor in `lib/error-handler.ts:7`, not the examples in the guides.

### Admin-only route

```typescript
import { requireRole } from '@/lib/auth-utils'
await requireRole('admin') // throws for non-admins
```

Admin pages live under `app/admin/`, admin nav in `app/admin/layout.tsx`.

### Supabase clients

| Import | Use |
|--------|-----|
| `supabaseAdmin` from `@/lib/supabase/admin` | Server-only, **bypasses RLS**. Use for privileged/admin/webhook operations. |
| `createClient` from `@/lib/supabase/client` | Server-side, cookie-bound, **respects RLS**. Per-request on behalf of the user. |

### Validation schema

```typescript
// File: lib/validation/[feature]-schema.ts
import { z } from 'zod'
export const CreateFeatureSchema = z.object({ name: z.string().min(3).max(100) })
export const UpdateFeatureSchema = CreateFeatureSchema.partial()
export type CreateFeatureInput = z.infer<typeof CreateFeatureSchema>
```

### Database migration

Add a **new** file under `supabase/migrations/` — never edit `supabase/main.sql` for product changes.

```sql
CREATE TABLE public.feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_feature_user_id ON public.feature(user_id);

ALTER TABLE public.feature ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own"   ON public.feature FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users insert own" ON public.feature FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users update own" ON public.feature FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users delete own" ON public.feature FOR DELETE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins view all"  ON public.feature FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.roles WHERE user_id = auth.uid()::text AND role_name = 'admin')
);
```

### Navigation integration

- User dashboard nav: **`components/layout/dashboard-sidebar.tsx`** (there is **no** `dashboard-nav.tsx`).
- Admin nav: **`app/admin/layout.tsx`**.
- Add `{ href, icon, label }` (icons from `lucide-react`).

### UI components available (`components/ui/`)

`accordion, alert, badge, button, card, checkbox, dialog, form, input, label, progress, select, separator, sheet, skeleton, switch, table, tabs, textarea, toast` (`theme-toggle`, `toaster`).

Import: `import { Button } from '@/components/ui/button'`.

## Known-stale guidance (do not copy verbatim)

- `key-files/AI-FEATURE-GUIDE.md` and `.github/copilot-instructions.md` show `new APIError('message', 401, ...)`, `@/lib/supabase/server`, `getSession()` from `@/lib/auth-utils` in API routes, and `components/layout/dashboard-nav.tsx`. The real code uses the patterns above. Treat those files as prose playbooks, not code references.

## Feature checklist (definition of done)

- [ ] Migration added with indexes + RLS, applied in Supabase
- [ ] Zod schema in `lib/validation/`
- [ ] API route(s) with auth, validation, `handleAPIError`, correlation ID
- [ ] Returns `401` unauthenticated, `400` on invalid input, `403` for non-admins
- [ ] Page under `app/dashboard/...` (or `app/admin/...`)
- [ ] Components use shadcn/ui with loading / error / empty states, mobile responsive
- [ ] Navigation link added
- [ ] `npm run lint` and `npm run type-check` pass
