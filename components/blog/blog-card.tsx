"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, cn, isValidImageUrl } from '@/lib/utils'
import { Zap, Clock, Calendar } from 'lucide-react'

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

interface BlogCardProps {
  post: BlogPost
  className?: string
  variant?: 'grid' | 'list'
}

export function BlogCard({ post, className, variant = 'grid' }: BlogCardProps) {
  const tags = post.tags?.slice(0, 3) || []
  const readingTime = post.reading_time || 1
  const authorName = post.author?.name || 'Anonymous'

  if (variant === 'text') {
    return (
      <Link href={`/blog/${post.slug}`} className="block group">
        <div className={cn("py-6 border-b border-border/40 transition-colors hover:bg-muted/30", className)}>
          <div className="space-y-3">
            {post.category && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                {post.category}
              </span>
            )}
            <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors font-serif">
              {post.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {post.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(post.published_at || new Date().toISOString())}</span>
              <span>•</span>
              <span className="font-medium italic text-foreground/70">by {authorName}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'list') {
    return (
      <Link href={`/blog/${post.slug}`} className="block group">
        <div className={cn(
            "flex flex-col md:flex-row gap-6 py-8 border-b border-border/40 transition-colors hover:bg-muted/30", 
            className
          )}>
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {post.category && (
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {post.category}
                  </span>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>{formatDate(post.published_at || new Date().toISOString())}</span>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                  <span>•</span>
                  <span className="font-medium">by {authorName}</span>
                </span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors font-serif">
                {post.title}
              </h3>
              
              <p className="text-muted-foreground line-clamp-2 text-base md:text-lg">
                {post.description}
              </p>
            </div>
            
            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              Read Article <Zap className="h-3 w-3" />
            </div>
          </div>
          
          <div className="w-full md:w-[280px] shrink-0">
            <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-muted">
              {isValidImageUrl(post.og_image_url) ? (
                <Image
                  src={post.og_image_url!}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 280px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary/40" />
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${post.slug}`} className="block h-full">
      <div
        className={cn(
          "group flex flex-col h-full bg-card border border-border/40 rounded-2xl overflow-hidden hover:shadow-lg hover:border-border transition-all duration-300",
          className
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {isValidImageUrl(post.og_image_url) ? (
            <Image
              src={post.og_image_url!}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
              <Zap className="h-10 w-10 text-primary/40" />
            </div>
          )}
          {post.category && (
            <div className="absolute top-4 left-4">
               <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 text-foreground backdrop-blur-sm shadow-sm hover:bg-white/100">
                {post.category}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 space-y-3">
            <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {post.description}
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(post.published_at || new Date().toISOString())}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{readingTime} min</span>
              </div>
            </div>
            <div className="font-medium italic">by {authorName}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}

