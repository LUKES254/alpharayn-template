import { Suspense } from 'react'
import { requireRole } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { BlogTable } from '@/components/blog/blog-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getBlogData(status?: string) {
  try {
    let query = supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && (status === 'draft' || status === 'published')) {
      query = query.eq('status', status)
    }

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return { posts: [], total: 0, stats: null }
    }

    // Get view counts
    const postsWithStats = await Promise.all(
      (posts || []).map(async (post) => {
        const { count: viewCount } = await supabaseAdmin
          .from('blog_views')
          .select('*', { count: 'exact', head: true })
          .eq('post_slug', post.slug)

        return {
          ...post,
          total_views: viewCount || 0,
        }
      })
    )

    // Calculate stats
    const stats = {
      total: count || 0,
      published: posts?.filter((p) => p.status === 'published').length || 0,
      draft: posts?.filter((p) => p.status === 'draft').length || 0,
      totalViews: postsWithStats.reduce((sum, p) => sum + (p.total_views || 0), 0),
    }

    return {
      posts: postsWithStats,
      total: count || 0,
      stats,
    }
  } catch (error) {
    console.error('Error in getBlogData:', error)
    return { posts: [], total: 0, stats: null }
  }
}

async function BlogTableContent({ status }: { status?: string }) {
  const { posts } = await getBlogData(status)

  return <BlogTable posts={posts} />
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  await requireRole('admin')

  const { stats } = await getBlogData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Manage Blog Posts</h2>
          <p className="text-muted-foreground mt-1">
            View and manage your blog content
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

        {/* Analytics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Posts</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Published</CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.published}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Drafts</CardDescription>
                <CardTitle className="text-3xl text-gray-600">{stats.draft}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Total Views</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{stats.totalViews}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              }
            >
              <BlogTableContent status={searchParams.status} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
  )
}

