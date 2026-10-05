import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Lightweight subscription gate (optional). For richer logic, prefer server components.
export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  // Example: protect premium-only section
  if (url.pathname.startsWith('/dashboard/premium-only')) {
    // Subscription check would require session token; BetterAuth already protects base routes.
    // Implement custom header-based logic or move this to layout if needed.
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/premium-only/:path*']
}
