"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { BlogCard } from './blog-card'
import { BlogSearch } from './blog-search'
import { BlogFilters } from './blog-filters'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchX, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  category?: string | null
  tags?: string[] | null
  og_image_url?: string | null
  reading_time?: number | null
  published_at?: string | null
  view_count?: number | null
  author_id?: string | null
  author?: { name: string | null } | null
}

interface BlogListProps {
  initialPosts?: BlogPost[]
  categories?: string[]
  tags?: string[]
  hideSearch?: boolean
  hideFilters?: boolean
  className?: string
  limit?: number
  layout?: 'standard' | 'grid-2-col' | 'category-detail'
}

const DEFAULT_ITEMS_PER_PAGE = 80

export function BlogList({ 
  initialPosts = [], 
  categories = [], 
  tags = [],
  hideSearch = false,
  hideFilters = false,
  className,
  limit,
  layout = 'standard'
}: BlogListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(searchParams.get('category') || undefined)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Determine effective layout
  const effectiveLayout = (selectedCategory && !searchQuery && layout === 'standard') 
    ? 'category-detail' 
    : layout

  // Sync state when URL params change
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || undefined
    const p = parseInt(searchParams.get('page') || '1')
    
    setSearchQuery(search)
    setSelectedCategory(category)
    setPage(p)
  }, [searchParams])

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (selectedCategory) params.set('category', selectedCategory)
        if (selectedTags.length > 0) {
          selectedTags.forEach((tag) => params.append('tag', tag))
        }
        if (searchQuery) params.set('search', searchQuery)
        params.set('page', page.toString())
        
        // Use limit prop if provided, otherwise default pagination
        const itemsPerPage = limit || DEFAULT_ITEMS_PER_PAGE
        params.set('limit', itemsPerPage.toString())

        const response = await fetch(`/api/blog?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch posts')

        const data = await response.json()
        setPosts(data.posts || [])
        setTotalPages(data.totalPages || 1)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [page, searchQuery, selectedCategory, selectedTags, limit])

  // Update URL helper
  const updateUrl = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    
    // Reset page on filter change if not explicitly updating page
    if (!updates.page) {
      params.set('page', '1')
      setPage(1)
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  const handleCategoryChange = (category: string | undefined) => {
    setSelectedCategory(category)
    updateUrl({ category })
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    updateUrl({ search: value })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateUrl({ page: newPage.toString() })
    const element = document.getElementById('latest-articles') || document.getElementById('blog-results')
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
    setPage(1)
  }

  const handleClearFilters = () => {
    setSelectedCategory(undefined)
    setSelectedTags([])
    setSearchQuery('')
    setPage(1)
    router.replace(pathname, { scroll: false })
  }

  if (loading && posts.length === 0) {
    return (
      <div className={cn("space-y-8", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-8 w-3/4" />
               <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="w-full md:w-[280px] aspect-[3/2] rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={cn("space-y-12", className)} id="blog-results">
      {/* Search and Filter Controls - Optionally Hidden */}
      {(!hideSearch || !hideFilters) && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            {!hideSearch && (
              <BlogSearch value={searchQuery} onChange={handleSearchChange} className="w-full" />
            )}
            {!hideFilters && (
              <Button 
                variant="outline" 
                size="lg" 
                className={cn(
                  "rounded-full px-6 gap-2 transition-all",
                  showFilters && "bg-primary text-primary-foreground border-primary"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            )}
          </div>

          {showFilters && !hideFilters && (categories.length > 0 || tags.length > 0) && (
            <div className="p-8 rounded-3xl bg-card border border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
              <BlogFilters
                categories={categories}
                tags={tags}
                selectedCategory={selectedCategory}
                selectedTags={selectedTags}
                onCategoryChange={handleCategoryChange}
                onTagToggle={handleTagToggle}
                onClear={handleClearFilters}
              />
            </div>
          )}
        </div>
      )}

      {/* Posts Content */}
      {posts.length > 0 ? (
        <div className="space-y-16">
          {effectiveLayout === 'category-detail' ? (
            <div className="space-y-16">
              {/* Row 1: 1 Blog (Indices 0) */}
              <div className="border-b border-border/40 pb-16">
                <BlogCard post={posts[0]} variant="list" className="md:gap-12" />
              </div>

              {/* Row 2: 2 Blogs (Indices 1-2) */}
              {posts.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 border-b border-border/40 pb-16">
                  {posts.slice(1, 3).map(post => (
                    <BlogCard key={post.id} post={post} variant="grid" />
                  ))}
                </div>
              )}

              {/* Row 3: 3 Blogs (Indices 3-5) */}
              {posts.length > 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                  {posts.slice(3, 6).map(post => (
                    <BlogCard key={post.id} post={post} variant="text" />
                  ))}
                </div>
              )}

              {/* Remaining Posts (Index 6+) */}
              {posts.length > 6 && (
                <div className="pt-16 border-t border-border/40">
                  <h3 className="text-xl font-bold mb-8">More from {selectedCategory}</h3>
                  <div className="flex flex-col">
                    {posts.slice(6).map(post => (
                      <BlogCard key={post.id} post={post} variant="list" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standard / Grid Layouts */
            <div className={cn(
              "flex flex-col",
              effectiveLayout === 'grid-2-col' && "grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-0"
            )}>
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} variant="list" className={cn(effectiveLayout === 'grid-2-col' && "border-b border-border/40")} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!limit && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center bg-muted/30 rounded-3xl border border-dashed border-border">
          <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No matching articles</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <Button variant="outline" className="rounded-full" onClick={handleClearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
