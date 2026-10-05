"use client"

import { useState, useEffect, useRef } from 'react'

interface YouTubeEmbedProps {
  url: string
}

export function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract video ID from various YouTube URL formats
  useEffect(() => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        setVideoId(match[1])
        break
      }
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
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

