"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface BlogFiltersProps {
  categories: string[]
  tags: string[]
  selectedCategory?: string
  selectedTags: string[]
  onCategoryChange: (category: string | undefined) => void
  onTagToggle: (tag: string) => void
  onClear: () => void
}

export function BlogFilters({
  categories,
  tags,
  selectedCategory,
  selectedTags,
  onCategoryChange,
  onTagToggle,
  onClear,
}: BlogFiltersProps) {
  const hasActiveFilters = selectedCategory

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              size="sm"
              className="rounded-full px-4"
              onClick={() => onCategoryChange(undefined)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className="rounded-full px-4"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <X className="h-4 w-4" />
            Clear all active filters
          </Button>
        </div>
      )}
    </div>
  )
}

