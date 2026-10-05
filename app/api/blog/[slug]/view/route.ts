import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { BlogViewSchema } from '@/lib/validation/blog-schema'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { tryGetSession } from '@/lib/auth-utils'
import crypto from 'crypto'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/blog/[slug]/view
 * Track a blog post view for analytics (anonymous or authenticated)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const correlationId = generateCorrelationId()

  try {
    const { slug } = params

    if (!slug) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Slug is required')
    }

    // Verify post exists and is published
    const { data: post, error: postError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, slug, status')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (postError || !post) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Blog post not found')
    }

    // Get request body
    const body = await request.json().catch(() => ({}))
    const validated = BlogViewSchema.safeParse({
      slug,
      ...body,
    })

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

    const { readPercentage, sessionId } = validated.data

    // Get user session (optional - views can be anonymous)
    const session = await tryGetSession()
    const userId = session?.user?.id || null

    // Hash IP address for anonymous tracking (SHA-256)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

    // Create view record
    const { error: viewError } = await supabaseAdmin
      .from('blog_views')
      .insert({
        post_slug: slug,
        user_id: userId,
        ip_hash: ipHash,
        session_id: sessionId || crypto.randomUUID(),
        read_percentage: readPercentage,
      })

    if (viewError) {
      console.error('Error creating blog view:', viewError)
      // Don't fail the request if view tracking fails
    } else {
      // Increment view count on blog_posts
      const currentCount = post.view_count || 0
      await supabaseAdmin
        .from('blog_posts')
        .update({ view_count: currentCount + 1 })
        .eq('slug', slug)
        .then(() => {})
        .catch(() => {
          // Silently fail if update fails
        })
    }

    return NextResponse.json({
      success: true,
      message: 'View tracked successfully',
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/blog/[slug]/view',
      method: 'POST',
      slug: params.slug,
    })
  }
}

