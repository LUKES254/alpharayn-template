"use client"

import { useState, useEffect, useRef } from 'react'

interface LoomEmbedProps {
  url: string
}

export function LoomEmbed({ url }: LoomEmbedProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract video ID from Loom URL
  useEffect(() => {
    // Loom URLs: https://www.loom.com/share/{id}
    const match = url.match(/loom\.com\/share\/([^/?]+)/)
    if (match && match[1]) {
      setVideoId(match[1])
    }
  }, [url])

  // Lazy load with intersection observer
  useEffect(() => {
    if (!containerRef.current || !videoId) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '50px' }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [videoId])

  if (!videoId) {
    return (
      <div className="my-4 p-4 border rounded-lg">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {url}
        </a>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="my-6 w-full">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        {isVisible ? (
          <iframe
            src={`https://www.loom.com/embed/${videoId}`}
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground">Loading video...</div>
          </div>
        )}
      </div>
    </div>
  )
}

