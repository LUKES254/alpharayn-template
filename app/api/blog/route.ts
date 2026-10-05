import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { BlogSearchSchema } from '@/lib/validation/blog-schema'
import { handleAPIError, generateCorrelationId } from '@/lib/error-handler'

// Disable caching for blog listing
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/blog
 * List all published blog posts with pagination, filtering, and search
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()

  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      search: searchParams.get('search') || undefined,
    }

    const validated = BlogSearchSchema.safeParse(queryParams)
    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details: validated.error.errors,
          correlationId,
        },
        { status: 400 }
      )
    }

    const { page, limit, category, tags, query } = validated.data

    // Build query
    let queryBuilder = supabaseAdmin
      .from('blog_posts')
      .select('*, author:users(name)', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    // Apply filters
    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.contains('tags', tags)
    }

    // Text search (PostgreSQL full-text search)
    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    queryBuilder = queryBuilder.range(from, to)

    const { data: posts, error, count } = await queryBuilder

    if (error) {
      console.error('Error fetching blog posts:', error)
      throw new Error('Failed to fetch blog posts')
    }

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      page,
      totalPages,
      limit,
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/blog',
      method: 'GET',
    })
  }
}

