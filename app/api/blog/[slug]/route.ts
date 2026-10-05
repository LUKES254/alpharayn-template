import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { promises as fs } from 'fs'
import path from 'path'

// Disable caching for blog posts
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/blog/[slug]
 * Get a single published blog post by slug with content from MDX file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const correlationId = generateCorrelationId()

  try {
    const { slug } = params

    if (!slug) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Slug is required')
    }

    // Fetch post from database
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Blog post not found')
    }

    // Read MDX file content
    const contentPath = path.join(process.cwd(), post.content_path)
    
    try {
      const fileContent = await fs.readFile(contentPath, 'utf-8')
      
      // Parse frontmatter if present (using gray-matter)
      // For now, return raw markdown - frontmatter parsing can be added if needed
      const content = fileContent

      return NextResponse.json({
        post: {
          ...post,
          // Include author info if available
          author: post.author_id ? {
            id: post.author_id,
            // Author details would be fetched from users table if needed
          } : null,
        },
        content,
        correlationId,
      })
    } catch (fileError) {
      console.error('Error reading MDX file:', fileError)
      throw new APIError(
        500,
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to read blog post content'
      )
    }
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/blog/[slug]',
      method: 'GET',
      slug: params.slug,
    })
  }
}

