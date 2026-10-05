"use client"

import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BlogSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function BlogSearch({ value, onChange, placeholder = "Search articles...", className }: BlogSearchProps) {
  const [localValue, setLocalValue] = useState(value)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, onChange])

  return (
    <div className={cn("relative max-w-2xl mx-auto", className)}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-12 pr-12 h-12 text-lg rounded-full shadow-sm border-gray-200 focus:border-primary focus:ring-primary/20 bg-background"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted"
          onClick={() => {
            setLocalValue('')
            onChange('')
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

