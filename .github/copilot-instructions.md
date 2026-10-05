# Next.js SaaS Boilerplate - Coding Assistant Instructions

## Project Overview
This is a production-ready SaaS boilerplate with Next.js 14 App Router, TypeScript, Supabase, BetterAuth, and Paystack payments.

## Critical Rules
1. **ALWAYS** check existing patterns before generating code
2. **ALWAYS** integrate features into navigation/dashboard
3. **ALWAYS** maintain all 7 security layers
4. **ALWAYS** use existing utility functions
5. **NEVER** skip RLS policies on database tables
6. **NEVER** break existing authentication flow

## AI Model Delegation Strategy

When implementing features, delegate work based on AI strengths:

🔵 **CLAUDE handles:**
- Database schemas (tables, indexes, RLS policies)
- API logic (endpoints, business logic, data processing)
- Validation (Zod schemas, input sanitization)
- Security (authentication, authorization, error handling)
- Backend utilities (helper functions, data transformations)

🟢 **GEMINI handles:**
- Page layouts (Next.js pages, routing, structure)
- UI components (React components, forms, lists, cards)
- Visual design (styling, colors, spacing, typography)
- Animations (transitions, hover effects, loading states)
- Responsive design (mobile, tablet, desktop breakpoints)
- User interactions (click handlers, form submissions, dialogs)

This division ensures optimal code quality by leveraging each AI's strengths.

## Tech Stack
- Framework: Next.js 14 (App Router), TypeScript
- Database: Supabase (PostgreSQL) with Row Level Security
- Auth: BetterAuth with session management
- Payments: Paystack
- Styling: Tailwind CSS + shadcn/ui components
- Validation: Zod schemas
- Rate Limiting: Upstash Redis (optional, in-memory fallback)

## Project Structure Patterns

### API Routes (app/api/)
```typescript
// Pattern: app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase/server'
import { FeatureSchema } from '@/lib/validation/feature-schema'
import { handleAPIError, APIError, ErrorCodes } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID()
  try {
    // 1. Auth check
    const session = await getSession()
    if (!session?.user) {
      throw new APIError('Unauthorized', 401, ErrorCodes.UNAUTHORIZED)
    }

    // 2. Validate input
    const body = await request.json()
    const validated = FeatureSchema.safeParse(body)
    if (!validated.success) {
      throw new APIError('Invalid input', 400, ErrorCodes.VALIDATION_ERROR, validated.error.errors)
    }

    // 3. Database operation
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('table_name')
      .insert({ user_id: session.user.id, ...validated.data })
      .select()
      .single()

    if (error) throw new APIError('Database error', 500, ErrorCodes.DATABASE_ERROR)

    // 4. Return success
    return NextResponse.json({ success: true, data, correlationId }, { status: 201 })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/feature', method: 'POST' })
  }
}
```

### Pages (app/)
```typescript
// Pattern: app/dashboard/[feature]/page.tsx
import { Suspense } from 'react'
import { FeatureList } from '@/components/feature/feature-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function FeaturePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Feature Name</h1>
          <p className="text-muted-foreground mt-1">Description</p>
        </div>
        <Link href="/dashboard/feature/new">
          <Button><Plus className="mr-2 h-4 w-4" />New Item</Button>
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <FeatureList />
      </Suspense>
    </div>
  )
}
```

### Components (components/)
```typescript
// Pattern: components/[feature]/feature-list.tsx
'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function FeatureList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const response = await fetch('/api/feature')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      setItems(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  if (items.length === 0) return <div className="text-center py-12 text-muted-foreground">No items found</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="border rounded-lg p-4">
          {/* Item content */}
        </div>
      ))}
    </div>
  )
}
```

### Validation Schemas (lib/validation/)
```typescript
// Pattern: lib/validation/feature-schema.ts
import { z } from 'zod'

export const CreateFeatureSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
})

export const UpdateFeatureSchema = CreateFeatureSchema.partial()

export type CreateFeatureInput = z.infer<typeof CreateFeatureSchema>
export type UpdateFeatureInput = z.infer<typeof UpdateFeatureSchema>
```

### Database Tables (supabase/)
```sql
-- Pattern: Always include RLS policies
CREATE TABLE public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_table_user_id ON public.table_name(user_id);

ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own" ON public.table_name
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users insert own" ON public.table_name
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins view all" ON public.table_name
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.roles WHERE user_id = auth.uid()::text AND role_name = 'admin')
  );
```

## 7 Security Layers (MUST MAINTAIN)

1. **Input Validation**: All API endpoints use Zod schemas from `lib/validation/`
2. **Rate Limiting**: Configure in `middleware.ts` (100 req/min default, 5 req/15min for auth, 3 req/hour for payments)
3. **CSRF Protection**: Include `X-CSRF-Token` header for POST/PUT/PATCH/DELETE (except webhooks)
4. **Authentication**: Check session with `getSession()` from `@/lib/auth-utils`
5. **Database RLS**: Every table has RLS policies (users see own data, admins see all)
6. **Error Handling**: Use `handleAPIError()` from `@/lib/error-handler` with correlation IDs
7. **Security Headers**: Already configured in `next.config.mjs` (CSP, HSTS, etc.)

## Navigation Integration (CRITICAL)

When creating new dashboard features, **ALWAYS** add to navigation:

**File**: `components/layout/dashboard-nav.tsx` or `app/dashboard/layout.tsx`
```typescript
// Add to navigation items array
{
  title: "Feature Name",
  href: "/dashboard/feature",
  icon: IconName, // from lucide-react
}
```

## Admin Features

For admin-only features:
1. Check role: `const isAdmin = await checkAdminRole(session.user.id)`
2. Return 403 if not admin
3. Add to admin navigation in `app/admin/layout.tsx`
4. Use service role for operations that bypass RLS

## UI Components (shadcn/ui)

Available components (use these, don't create custom):
- `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`
- `Card`, `Alert`, `Badge`, `Avatar`, `Separator`
- `Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`
- `Table`, `Form`, `Tabs`, `Skeleton`, `Toast`

Import pattern: `import { Button } from '@/components/ui/button'`

## Response to Prompts

When asked to create a feature, you MUST:

1. **Generate complete file paths** (e.g., `app/api/tasks/route.ts`)
2. **Include ALL necessary files**:
   - Database schema SQL
   - API routes (GET, POST, PATCH, DELETE)
   - Page components
   - UI components
   - Validation schemas
   - Navigation updates
3. **Provide step-by-step integration instructions**
4. **Include example usage**
5. **List environment variables if needed**
6. **Show testing commands**

DO NOT generate partial code or say "add this here" without showing exactly where and how.

## Example Response Format

When user asks for a feature, structure your response like this:

### 1. Database Schema
```sql
-- File: supabase/migrations/add_feature.sql
[Complete SQL with RLS]
```

### 2. Validation Schema
```typescript
// File: lib/validation/feature-schema.ts
[Complete Zod schema]
```

### 3. API Routes
```typescript
// File: app/api/feature/route.ts
[Complete API implementation]
```

### 4. Page Component
```typescript
// File: app/dashboard/feature/page.tsx
[Complete page]
```

### 5. UI Components
```typescript
// File: components/feature/feature-list.tsx
[Complete component]
```

### 6. Navigation Update
```typescript
// File: app/dashboard/layout.tsx (ADD THIS)
[Exact code to add]
```

### 7. Integration Steps
1. Run SQL in Supabase
2. Create files exactly as shown
3. Update navigation
4. Test with: `curl http://localhost:3000/api/feature`
5. Visit: `http://localhost:3000/dashboard/feature`

### 8. Testing Checklist
- [ ] Database table created
- [ ] RLS policies active
- [ ] API returns data
- [ ] Page renders
- [ ] Navigation link works
- [ ] Can create item
- [ ] Can view items
- [ ] Can update item
- [ ] Can delete item

## Common Mistakes to Avoid

❌ Generating code without file paths
❌ Skipping navigation integration
❌ Missing RLS policies
❌ Not using existing error handler
❌ Creating custom UI instead of shadcn/ui
❌ Skipping input validation
❌ Not checking authentication
❌ Missing rate limiting config
❌ Poor mobile responsive design
❌ No loading/error states