'use client'

import { useMemo, useEffect, useState } from 'react'

interface BlogContentProps {
  content: string
}

/**
 * BlogContent component that safely renders HTML content from Quill editor
 * Uses DOMPurify to sanitize HTML and prevent XSS attacks
 */
export function BlogContent({ content }: BlogContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState<string>(content)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Dynamic import DOMPurify only on client side
    import('dompurify').then((DOMPurify) => {
      const clean = DOMPurify.default.sanitize(content, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'hr',
          'ul', 'ol', 'li',
          'strong', 'b', 'em', 'i', 'u', 's', 'strike',
          'a', 'img', 'video', 'iframe',
          'blockquote', 'pre', 'code',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span',
          'sup', 'sub',
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'id',
          'target', 'rel',
          'width', 'height',
          'style',
          'frameborder', 'allowfullscreen', 'allow',
        ],
        ALLOW_DATA_ATTR: true,
      })
      setSanitizedContent(clean)
    })
  }, [content])

  // Check if content is HTML or plain text/markdown
  const isHTML = content.includes('<') && content.includes('>')

  // Server-side or before hydration: show content safely
  if (!isClient) {
    if (!isHTML) {
      return <div className="whitespace-pre-wrap">{content}</div>
    }
    // For HTML content, show a loading state or the raw content
    return <div className="blog-content animate-pulse">Loading content...</div>
  }

  if (!isHTML) {
    // If content doesn't look like HTML, render as plain text with line breaks
    return (
      <div className="whitespace-pre-wrap">
        {content}
      </div>
    )
  }

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}
