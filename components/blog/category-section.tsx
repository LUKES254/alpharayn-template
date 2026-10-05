"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { formatDate, isValidImageUrl } from '@/lib/utils'
import { Zap, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Author {
  name: string | null
}

interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  category?: string | null
  og_image_url?: string | null
  published_at?: string | null
  created_at?: string | null
  author?: Author | null
}

interface CategorySectionProps {
  category: string
  posts: BlogPost[]
  variant?: 'default' | 'alternate'
}

export function CategorySection({ category, posts, variant = 'default' }: CategorySectionProps) {
  // Common Components
  const AuthorName = ({ author }: { author?: Author | null }) => (
    <span className="text-xs text-muted-foreground font-medium">
      by {author?.name || 'Anonymous'}
    </span>
  )

  // Layout Logic
  if (variant === 'alternate') {
    // Alternate Layout: 2 Columns
    // Col 1 (Left): 1 large post (featurePost)
    // Manner: category, title, image, description, author
    
    const featurePost = posts[0]
    const listPosts = posts.slice(1, 4)

    if (!featurePost) return null

    return (
      <div className="mb-20">
        <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{category}</h2>
          <Link href={`/blog?category=${encodeURIComponent(category)}`} className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Column 1: Category -> Title -> Image -> Description -> Author */}
          <Link href={`/blog/${featurePost.slug}`} className="group block">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Badge variant="secondary" className="rounded-full text-[10px] sm:text-xs">
                  {featurePost.category}
                </Badge>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight group-hover:text-primary transition-colors font-serif">
                {featurePost.title}
              </h3>

              <div className="relative aspect-video sm:aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
                {isValidImageUrl(featurePost.og_image_url) ? (
                  <Image
                    src={featurePost.og_image_url!}
                    alt={featurePost.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                    <Zap className="h-16 w-16 text-primary/40" />
                  </div>
                )}
              </div>

              <p className="text-muted-foreground line-clamp-3 text-base sm:text-lg leading-relaxed">
                {featurePost.description}
              </p>
              
              <div className="pt-2 border-t border-border/40 w-fit">
                <AuthorName author={featurePost.author} />
              </div>
            </div>
          </Link>

          {/* Column 2: 3 Blogs 
              Manner: Category top, Image Right, Title Left, Author Left
          */}
          <div className="flex flex-col gap-8 lg:gap-10">
            {listPosts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <div className="space-y-3 pb-6 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="flex items-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                      {post.category}
                    </span>
                  </div>
                  
                  <div className="flex gap-4 sm:gap-6 items-start">
                    <div className="flex-1 flex flex-col justify-between min-h-[80px] sm:min-h-[100px]">
                      <h4 className="text-lg sm:text-xl font-bold leading-tight group-hover:text-primary transition-colors font-serif line-clamp-3">
                        {post.title}
                      </h4>
                      <div className="mt-2 sm:mt-4">
                        <AuthorName author={post.author} />
                      </div>
                    </div>
                    
                    <div className="w-1/4 sm:w-1/3 shrink-0">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted shadow-sm">
                        {isValidImageUrl(post.og_image_url) ? (
                          <Image
                            src={post.og_image_url!}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 33vw, 15vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-primary/40" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default Layout (3 Columns)
  // Col 1: List (4 posts)
  // Col 2: Featured (1 post)
  // Col 3: Mixed (1 post + 2 list)
  
  const featurePost = posts[0]
  const rightTopPost = posts[1]
  const leftListPosts = posts.slice(2, 6)
  const rightListPosts = posts.slice(6, 8)

  if (!featurePost) return null

  const TextOnlyCard = ({ post }: { post: BlogPost }) => (
    <Link href={`/blog/${post.slug}`} className="group block py-3 border-b border-border/40 last:border-0">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
            {post.category}
          </span>
          <AuthorName author={post.author} />
        </div>
        <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h4>
      </div>
    </Link>
  )

  return (
    <div className="mb-20">
      <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{category}</h2>
        <Link href={`/blog?category=${encodeURIComponent(category)}`} className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
        {/* Column 1: List (4 posts) - spans 1 col */}
        <div className="flex flex-col lg:border-r border-border/40 lg:pr-8 md:order-2 lg:order-1">
          {leftListPosts.map(post => (
            <TextOnlyCard key={post.id} post={post} />
          ))}
          {leftListPosts.length === 0 && (
            <p className="text-muted-foreground text-sm italic">More articles coming soon...</p>
          )}
        </div>

        {/* Column 2: Featured (1 post) - spans 2 cols (center) */}
        <div className="md:col-span-2 lg:px-8 lg:border-r border-border/40 md:order-1 lg:order-2 pb-8 md:pb-0">
           <Link href={`/blog/${featurePost.slug}`} className="group block h-full">
            <div className="relative aspect-video sm:aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted mb-4">
              {isValidImageUrl(featurePost.og_image_url) ? (
                <Image
                  src={featurePost.og_image_url!}
                  alt={featurePost.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                  <Zap className="h-12 w-12 text-primary/40" />
                </div>
              )}
            </div>
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-3">
                 <Badge variant="secondary" className="rounded-full text-[10px] sm:text-xs">
                  {featurePost.category}
                </Badge>
                <AuthorName author={featurePost.author} />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight group-hover:text-primary transition-colors font-serif">
                {featurePost.title}
              </h3>
              <p className="text-muted-foreground line-clamp-3 text-sm sm:text-base">
                {featurePost.description}
              </p>
            </div>
          </Link>
        </div>

        {/* Column 3: Mixed (1 Image + 2 Text) - spans 1 col */}
        <div className="flex flex-col gap-6 lg:pl-8 md:order-3">
          {rightTopPost && (
             <Link href={`/blog/${rightTopPost.slug}`} className="group block mb-4">
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-muted mb-3">
                {isValidImageUrl(rightTopPost.og_image_url) ? (
                  <Image
                    src={rightTopPost.og_image_url!}
                    alt={rightTopPost.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <AuthorName author={rightTopPost.author} />
                <h4 className="font-bold text-sm sm:text-base leading-tight group-hover:text-primary transition-colors font-serif">
                  {rightTopPost.title}
                </h4>
              </div>
            </Link>
          )}

          <div className="flex-1 flex flex-col justify-start">
            {rightListPosts.map(post => (
              <TextOnlyCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
