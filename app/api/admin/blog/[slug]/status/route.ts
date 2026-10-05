import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { BlogPostStatusSchema } from '@/lib/validation/blog-schema'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { validateCSRFToken } from '@/lib/csrf'
import { auth } from '@/lib/auth'
import { headers, cookies } from 'next/headers'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Helper function to get session token from cookies
 */
async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  // Better Auth uses "better-auth.session_token" format
  // Also check for secure prefix version
  const sessionCookie = cookieStore.get('better-auth.session_token') || 
                        cookieStore.get('__Secure-better-auth.session_token')
  return sessionCookie?.value
}

/**
 * Helper function to check admin role in API routes (no redirects)
 */
async function requireAdminRole(): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new APIError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required')
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',')?.map((s) => s.trim()) || []
  if (!adminEmails.includes(session.user.email)) {
    throw new APIError(403, ErrorCodes.FORBIDDEN, 'Admin access required')
  }
}

/**
 * PATCH /api/admin/blog/[slug]/status
 * Quick publish/unpublish toggle for blog posts
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const correlationId = generateCorrelationId()

  try {
    // Get session and check admin role
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw new APIError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required')
    }

    // Check admin role
    const adminEmails = process.env.ADMIN_EMAILS?.split(',')?.map((s) => s.trim()) || []
    if (!adminEmails.includes(session.user.email)) {
      throw new APIError(403, ErrorCodes.FORBIDDEN, 'Admin access required')
    }

    // Validate CSRF token - get session token from session object first, then fall back to cookies
    const csrfToken = request.headers.get('x-csrf-token')
    let sessionToken: string | undefined = (session as any)?.token || (session as any)?.session?.token
    if (!sessionToken) {
      sessionToken = await getSessionToken()
    }
    if (!sessionToken || !csrfToken || !validateCSRFToken(csrfToken, sessionToken)) {
      throw new APIError(403, ErrorCodes.CSRF_TOKEN_INVALID, 'Invalid CSRF token')
    }

    const { slug } = params

    if (!slug) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Slug is required')
    }

    const body = await request.json()
    
    // Validate input
    const validated = BlogPostStatusSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: ErrorCodes.VALIDATION_ERROR,
          details: validated.error.errors,
          correlationId,
        },
        { status: 400 }
      )
    }

    const { status } = validated.data

    // Check if post exists
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select('status, published_at')
      .eq('slug', slug)
      .single()

    if (fetchError || !existingPost) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Blog post not found')
    }

    // Update status
    const updateData: Record<string, unknown> = {
      status,
    }

    // Set published_at timestamp when publishing
    if (status === 'published' && existingPost.status === 'draft') {
      updateData.published_at = new Date().toISOString()
    } else if (status === 'draft' && existingPost.status === 'published') {
      // Optionally clear published_at when unpublishing
      // updateData.published_at = null
    }

    const { data: updatedPost, error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating blog post status:', updateError)
      throw new Error('Failed to update blog post status')
    }

    return NextResponse.json({
      post: updatedPost,
      message: `Blog post ${status === 'published' ? 'published' : 'unpublished'} successfully`,
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/admin/blog/[slug]/status',
      method: 'PATCH',
      slug: params.slug,
    })
  }
}

