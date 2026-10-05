"use client"

import { useEffect, useRef } from 'react'

interface TweetEmbedProps {
  tweetId?: string
  url?: string
}

export function TweetEmbed({ tweetId, url }: TweetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Extract tweet ID from URL if provided
    let id = tweetId
    if (!id && url) {
      const match = url.match(/twitter\.com\/\w+\/status\/(\d+)/)
      if (match) id = match[1]
    }

    if (!id || !containerRef.current) return

    // Load Twitter widget script
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.charset = 'utf-8'
    document.body.appendChild(script)

    // Create tweet blockquote
    const blockquote = document.createElement('blockquote')
    blockquote.className = 'twitter-tweet'
    blockquote.setAttribute('data-theme', 'dark')
    blockquote.innerHTML = `<a href="https://twitter.com/x/status/${id}"></a>`

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(blockquote)

    // Trigger widget load
    if ((window as any).twttr?.widgets) {
      ;(window as any).twttr.widgets.load(containerRef.current)
    }

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [tweetId, url])

  return (
    <div className="my-6 flex justify-center">
      <div ref={containerRef} className="max-w-lg" />
    </div>
  )
}

