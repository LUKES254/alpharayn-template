"use client"

import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

interface BlogHeaderControlProps {
  categories: string[]
  className?: string
}

export function BlogHeaderControl({ categories, className }: BlogHeaderControlProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '')
  const currentCategory = searchParams.get('category')

  const updateUrl = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    
    // Always reset page to 1 when search/filter changes
    params.set('page', '1')

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (searchParams.get('search') || '')) {
        updateUrl({ search: localSearch })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, updateUrl, searchParams])

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <Input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search articles..."
          className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-base sm:text-lg rounded-full shadow-lg border-muted-foreground/20 focus:border-primary focus:ring-primary/20 bg-background/95 backdrop-blur-sm"
        />
        {localSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-muted"
            onClick={() => {
              setLocalSearch('')
              updateUrl({ search: '' })
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <Badge
            variant={!currentCategory ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-all hover:scale-105",
              !currentCategory && "bg-primary text-primary-foreground shadow-md"
            )}
            onClick={() => updateUrl({ category: undefined })}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={currentCategory === cat ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-all hover:scale-105",
                currentCategory === cat 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-background hover:bg-muted border-muted-foreground/30"
              )}
              onClick={() => updateUrl({ category: cat })}
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
