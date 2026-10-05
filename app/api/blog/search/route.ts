import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { BlogSearchSchema } from '@/lib/validation/blog-schema'
import { handleAPIError, generateCorrelationId } from '@/lib/error-handler'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/blog/search
 * Search blog posts (client-side search with Fuse.js recommended, but this provides server-side fallback)
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()

  try {
    const { searchParams } = new URL(request.url)
    
    const queryParams = {
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    }

    const validated = BlogSearchSchema.safeParse({
      query: queryParams.q,
      category: queryParams.category,
      page: queryParams.page,
      limit: queryParams.limit,
    })

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

    const { query, category, page, limit } = validated.data

    // Build search query
    let queryBuilder = supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    // Apply category filter
    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    queryBuilder = queryBuilder.range(from, to)

    const { data: results, error, count } = await queryBuilder

    if (error) {
      console.error('Error searching blog posts:', error)
      throw new Error('Failed to search blog posts')
    }

    return NextResponse.json({
      results: results || [],
      count: count || 0,
      page,
      limit,
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/blog/search',
      method: 'GET',
    })
  }
}

