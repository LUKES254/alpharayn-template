# AI-FEATURE-GUIDE.md - Feature Development Guide for AI Coding Assistants

> **Not a setup guide.** This document is for building new features with AI assistants (Cursor,
> Copilot, Claude) after the app is running. For installation and configuration, start with
> [../README.md](../README.md) and [DOCUMENTATION.md](./DOCUMENTATION.md).

> **Optimized for Cursor, GitHub Copilot, and Claude - Proven to generate working, integrated code**

**Last Updated:** December 20, 2025

---

## Why This Guide Exists

AI coding assistants (Cursor, GitHub Copilot) often generate code that:
- ❌ Doesn't integrate with existing features
- ❌ Has poor or broken UI
- ❌ Missing from navigation/dashboard
- ❌ Doesn't follow project patterns
- ❌ Breaks security layers

This guide provides **step-by-step prompts** that generate **production-ready, fully-integrated features**.

---

## How to Use This Guide

### Option 1: For Cursor Users

1. Create a file: `.cursorrules` in your project root
2. Copy the **Project Context** section below into it
3. Use the feature prompts with `Cmd+K` or chat
4. Cursor will automatically follow your project patterns

### Option 2: For GitHub Copilot Users

1. Create file: `.github/copilot-instructions.md`
2. Copy the **Project Context** section into it
3. Use feature prompts in chat or comments
4. Copilot will reference these instructions

### Option 3: For Claude/Direct Chat

1. Copy **entire prompt** (context + feature prompt)
2. Paste into new Claude conversation
3. Claude generates all code at once
4. Follow integration steps

---

## Project Context (Copy to .cursorrules or .github/copilot-instructions.md)

```markdown
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

🟢 **GEMINI 2.0 FLASH handles:**
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
```

---

## Feature Prompt Template

Use this template when asking AI to build features:

```
I need to add [FEATURE NAME] to this Next.js SaaS boilerplate.

CONTEXT:
- This project follows the patterns in DOCUMENTATION.md
- All 7 security layers MUST be maintained
- Use existing components from shadcn/ui
- Integration into dashboard is REQUIRED

FEATURE DETAILS:

What it does:
[One clear sentence]

Who uses it:
[Users / Admins / Both]

Data needed:
- field1: [type] - [description]
- field2: [type] - [description]

Where it goes:
[Dashboard / Settings / Admin / New section]

User actions:
1. User [action 1]
2. System [response 1]
3. User [action 2]
4. System [response 2]

REQUIRED DELIVERABLES:

1. Database Schema (supabase/migrations/)
   - Table definition with proper types
   - Indexes for performance
   - RLS policies (users see own, admins see all)
   - Rollback SQL

2. Validation Schema (lib/validation/[feature]-schema.ts)
   - Zod schema for all inputs
   - TypeScript types exported

3. API Routes (app/api/[feature]/route.ts)
   - GET: List items (with user filter)
   - POST: Create item (with validation)
   - PATCH: Update item (with ownership check)
   - DELETE: Delete item (with ownership check)
   - All with proper error handling

4. Page Component (app/dashboard/[feature]/page.tsx)
   - Header with title and CTA button
   - Suspense boundary for loading
   - Responsive layout

5. UI Components (components/[feature]/)
   - List component with loading/error/empty states
   - Card component for items
   - Form component for create/edit
   - Use shadcn/ui components only

6. Navigation Integration
   - EXACT code to add to dashboard layout
   - Icon from lucide-react
   - Proper href

7. Rate Limiting Config
   - middleware.ts update if needed
   - Appropriate limits for feature

8. Integration Instructions
   - Step 1: Copy SQL, run in Supabase
   - Step 2: Create each file with content
   - Step 3: Update navigation
   - Step 4: Test API endpoint
   - Step 5: Test UI
   - Full testing checklist

IMPORTANT:
- Show COMPLETE file contents, not snippets
- Include EXACT file paths
- Show EXACT navigation update location
- Provide working curl test commands
- Use project's existing error handler
- Follow existing code style
- Make it mobile responsive
- Include loading and error states
```

---

## Real Example: Task Manager Feature

Here's a working example to copy and modify:

```
I need to add a Task Manager to this Next.js SaaS boilerplate.

CONTEXT:
- This project follows the patterns in DOCUMENTATION.md
- All 7 security layers MUST be maintained
- Use existing components from shadcn/ui
- Integration into dashboard is REQUIRED

FEATURE DETAILS:

What it does:
Users can create, view, edit, and delete personal tasks with due dates and priority levels.

Who uses it:
Regular users (each user sees only their own tasks)

Data needed:
- title: text (3-100 chars) - The task name
- description: text (optional, max 500 chars) - Task details
- due_date: date (optional) - When task is due
- priority: enum (low/medium/high) - Task priority
- completed: boolean (default false) - Completion status

Where it goes:
Dashboard > Tasks (new page accessible from dashboard navigation)

User actions:
1. User clicks "Tasks" in dashboard navigation
2. System shows list of user's tasks sorted by due date
3. User clicks "New Task" button
4. System shows creation form
5. User fills title, description, due date, priority
6. User clicks "Create Task"
7. System validates, creates task, shows success message
8. User sees new task in list
9. User can click task to edit or mark complete
10. User can delete task

REQUIRED DELIVERABLES:

1. Database Schema (supabase/migrations/add_tasks.sql)
   - tasks table with all fields
   - Indexes on user_id and due_date
   - RLS policies (users CRUD own tasks, admins view all)
   - Rollback SQL

2. Validation Schema (lib/validation/task-schema.ts)
   - CreateTaskSchema with all validations
   - UpdateTaskSchema (partial)
   - TypeScript types

3. API Routes (app/api/tasks/route.ts and app/api/tasks/[id]/route.ts)
   - GET /api/tasks: List user's tasks (sorted by due_date)
   - POST /api/tasks: Create task
   - GET /api/tasks/[id]: Get single task
   - PATCH /api/tasks/[id]: Update task
   - DELETE /api/tasks/[id]: Delete task
   - All with auth checks, validation, error handling

4. Page Component (app/dashboard/tasks/page.tsx)
   - Header: "My Tasks" with description
   - "New Task" button (opens dialog)
   - TaskList component
   - Responsive design

5. UI Components (components/tasks/)
   - task-list.tsx: Grid of task cards with filters
   - task-card.tsx: Individual task display with actions
   - task-form.tsx: Create/edit form in dialog
   - task-filters.tsx: Filter by priority/completion status
   - All using shadcn/ui components

6. Navigation Integration
   - Add to app/dashboard/layout.tsx navigation array:
     ```typescript
     {
       title: "Tasks",
       href: "/dashboard/tasks",
       icon: CheckSquare, // from lucide-react
     }
     ```

7. Rate Limiting Config
   - Add to middleware.ts:
     ```typescript
     '/api/tasks': { limit: 100, window: 60 * 1000 }, // 100/min
     ```

8. Integration Instructions
   - Complete step-by-step with testing commands
   - Testing checklist with all CRUD operations

IMPORTANT:
- Show COMPLETE file contents, not snippets
- Include EXACT file paths
- Show EXACT navigation update location
- Provide working curl test commands
- Use project's existing error handler
- Follow existing code style
- Make it mobile responsive
- Include loading and error states
```

---

## Troubleshooting AI Generations

### Problem: Feature not showing in dashboard

**Fix Prompt:**
```
The [feature] was generated but doesn't appear in the dashboard navigation.

Please show me:
1. EXACT location in dashboard layout file where I add the navigation link
2. EXACT code to add (with icon import)
3. File path: app/dashboard/layout.tsx or components/layout/dashboard-nav.tsx
```

### Problem: API returns 401 Unauthorized

**Fix Prompt:**
```
The API endpoint [endpoint] returns 401 even when logged in.

Please check and fix:
1. Is getSession() imported correctly?
2. Is session.user being checked?
3. Show the EXACT authentication check code
```

### Problem: Poor UI / Doesn't match existing design

**Fix Prompt:**
```
The generated UI for [feature] doesn't match the rest of the app.

Please regenerate using:
1. shadcn/ui components only (no custom components)
2. Same layout pattern as app/dashboard/briefs/page.tsx
3. Tailwind classes matching existing pages
4. Mobile responsive design
5. Loading skeletons using <Skeleton />
6. Error alerts using <Alert variant="destructive">
```

### Problem: Missing RLS policies

**Fix Prompt:**
```
The [feature] database table is missing RLS policies.

Please provide:
1. Enable RLS command
2. Policy for users to view own data
3. Policy for users to insert own data
4. Policy for users to update own data
5. Policy for users to delete own data
6. Policy for admins to view all data
7. Test commands to verify policies work
```

### Problem: No error handling

**Fix Prompt:**
```
The [feature] API doesn't have proper error handling.

Please add:
1. Try-catch blocks
2. Use handleAPIError from @/lib/error-handler
3. APIError with proper status codes
4. Correlation IDs
5. Show EXACT updated code
```

---

## Quick Reference

### File Locations
```
Database:     supabase/migrations/
API Routes:   app/api/[feature]/route.ts
Pages:        app/dashboard/[feature]/page.tsx
Components:   components/[feature]/
Validation:   lib/validation/[feature]-schema.ts
Navigation:   app/dashboard/layout.tsx
```

### Common Imports
```typescript
// API routes
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase/server'
import { handleAPIError, APIError, ErrorCodes } from '@/lib/error-handler'

// Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Edit, Trash } from 'lucide-react'

// Validation
import { z } from 'zod'
```

### Testing Commands
```bash
# Test API
curl http://localhost:3000/api/feature

# Test with auth (replace TOKEN)
curl -H "Cookie: better-auth.session_token=TOKEN" \
  http://localhost:3000/api/feature

# Test POST
curl -X POST http://localhost:3000/api/feature \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=TOKEN" \
  -H "X-CSRF-Token: TOKEN" \
  -d '{"name":"Test"}'

# Check database
psql $DATABASE_URL -c "SELECT * FROM table_name"

# Check RLS
psql $DATABASE_URL -c "SELECT * FROM pg_policies WHERE tablename = 'table_name'"
```

---

## Success Checklist

After AI generates your feature, verify:

### Database ✅
- [ ] Table created in Supabase
- [ ] Indexes added
- [ ] RLS enabled
- [ ] Policies created (users + admins)
- [ ] Can query from Supabase dashboard

### API ✅
- [ ] GET returns data
- [ ] POST creates item
- [ ] PATCH updates item
- [ ] DELETE removes item
- [ ] Returns 401 without auth
- [ ] Returns 400 with invalid data
- [ ] Includes correlation IDs

### UI ✅
- [ ] Page renders at correct URL
- [ ] Appears in dashboard navigation
- [ ] Loading state shows while fetching
- [ ] Error state shows on failure
- [ ] Empty state shows when no data
- [ ] Mobile responsive
- [ ] Uses shadcn/ui components
- [ ] Matches app design

### Security ✅
- [ ] Input validation with Zod
- [ ] Authentication required
- [ ] RLS policies prevent access to others' data
- [ ] Rate limiting configured
- [ ] CSRF protection (if POST/PUT/DELETE)
- [ ] Error handling with correlation IDs
- [ ] No sensitive data in errors

---

## Advanced: Multi-File Features

For complex features touching many files, use this approach:

**Step 1: Architectural Planning Prompt**
```
I need to add [COMPLEX FEATURE] to this Next.js SaaS boilerplate.

Before generating code, please analyze and provide:

1. Database Design
   - Tables needed and relationships
   - Indexes required
   - RLS policies strategy

2. API Architecture
   - Endpoints needed (list all)
   - Data flow diagram
   - Authentication requirements per endpoint

3. UI Component Tree
   - Page structure
   - Component hierarchy
   - State management approach

4. Integration Points
   - Where in navigation
   - Impact on existing features
   - Migration strategy

5. Implementation Phases
   - Phase 1 (MVP): [what]
   - Phase 2: [what]
   - Phase 3: [what]

Provide this architectural overview first, then I'll ask you to implement phase by phase.
```

**Step 2: Phase-by-Phase Implementation**
```
Now implement Phase 1: [specific phase]

Generate:
1. All files for this phase
2. Complete file contents (no snippets)
3. Integration instructions
4. Testing checklist

Then I'll test Phase 1 before moving to Phase 2.
```

---

## Tips for Best Results

### ✅ DO:
- Provide clear, specific feature descriptions
- Mention "follow patterns in DOCUMENTATION.md"
- Ask for COMPLETE files, not snippets
- Request EXACT file paths
- Ask for navigation integration explicitly
- Specify mobile responsive requirement
- Request testing commands
- Use the feature prompt template

### ❌ DON'T:
- Give vague feature descriptions
- Skip the context section
- Accept partial code snippets
- Forget to ask for navigation updates
- Skip testing checklist
- Accept code without error handling
- Accept code without RLS policies
- Mix multiple features in one prompt

---

## When Things Go Wrong

If generated code doesn't work:

1. **Read the error message carefully**
2. **Check correlation ID in error response**
3. **Verify you followed all integration steps**
4. **Use troubleshooting prompts above**
5. **Check DOCUMENTATION.md for existing patterns**
6. **Test each layer independently** (DB → API → UI)

Common issues and fixes:
- "Cannot find module" → Check import paths, run `npm install`
- "401 Unauthorized" → Check authentication, session cookies
- "RLS policy violation" → Check policies, test with correct user
- "Validation error" → Check Zod schema matches API expectations
- "Not appearing in nav" → Check navigation file was updated
- "Poor UI" → Request regeneration with shadcn/ui components

---

## Summary

This guide transforms AI coding assistants from code generators into **full-stack feature builders**. By providing:

1. **Complete project context** (.cursorrules or .github/copilot-instructions.md)
2. **Structured prompts** (feature template)
3. **Integration requirements** (navigation, testing, security)
4. **Troubleshooting prompts** (fix specific issues)

You get **production-ready, fully-integrated features** that:
- ✅ Work immediately
- ✅ Appear in navigation
- ✅ Have proper UI
- ✅ Maintain all security layers
- ✅ Follow project patterns

**Start with the Task Manager example above to learn the pattern, then use the template for your own features.**

## Plan: Add E-Commerce Product Payment Support
Add full e-commerce capabilities (products with cart, inventory, orders) alongside existing subscription and one-time payment systems. All three payment types will coexist without breaking current functionality.

Steps
Create e-commerce database schema in migrations with tables for ecommerce_products, product_variants, product_images, product_categories, carts, cart_items, orders, order_items, and shipping_addresses. Include RLS policies and indexes.

Build cart management APIs at app/api/cart/ with routes for add (POST), update (PATCH), remove (DELETE), and get (GET). Add inventory validation to prevent overselling using database transactions.

Create checkout and order APIs at app/api/checkout/initialize (cart → order + Paystack) and app/api/orders/ (list, detail). Extend route.ts to handle ecommerce type metadata for order completion.

Build shop UI components including ProductCard, ProductDetail, CartDrawer, CheckoutForm, and OrderHistory. Add cart icon with item count badge to components/layout/dashboard-nav.tsx.

Create shop pages at app/shop/page.tsx (product grid), app/shop/[slug]/page.tsx (product detail), and app/dashboard/orders/page.tsx (order history). Update page.tsx with showEcommerce toggle variable.

Add admin product management at app/admin/products/ and app/admin/orders/ for managing inventory and order fulfillment. Create validation schemas in validation for cart, products, and orders.

Further Considerations
Cart storage strategy - Use database-backed carts (persistent) or session/cookie-based (faster for guests)? Recommend database with session ID for guests that merge on login.

Payment metadata structure - Extend webhook to differentiate payment types via metadata.type: 'subscription' | 'one_time' | 'ecommerce'. Include orderId and cartId for e-commerce payments.

Toggle visibility - Set showSubscriptions, showOneTime, and showEcommerce variables in page.tsx:21-23 to control which sections display, allowing users to configure their use case.

**Questions?** Check DOCUMENTATION.md for detailed technical reference.

**Version 2.0.0** | Optimized for AI coding assistants 🤖