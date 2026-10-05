'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { getCSRFToken, clearCSRFTokenCache } from '@/lib/csrf-client'

// Dynamic import Quill with no SSR
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] border rounded-lg animate-pulse bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading editor...</p>
    </div>
  ),
})

import 'react-quill/dist/quill.snow.css'

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function NewBlogPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Quill ref for image upload
  const quillRef = useRef<any>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [featured, setFeatured] = useState(false)
  const [ogImageUrl, setOgImageUrl] = useState('')

  // Custom categories and tags
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  // Add category
  const addCategory = () => {
    const trimmed = newCategory.trim()
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed])
      setSelectedCategory(trimmed)
      setNewCategory('')
    }
  }

  // Remove category
  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat))
    if (selectedCategory === cat) {
      setSelectedCategory('')
    }
  }

  // Add tag
  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setNewTag('')
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  // Handle Enter key for adding
  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCategory()
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // Image upload handler for Quill
  const imageHandler = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image too large. Maximum size is 5MB.')
        return
      }

      setUploading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/blog/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to upload image')
        }

        const data = await response.json()
        
        // Insert image into editor
        const quill = quillRef.current?.getEditor()
        if (quill) {
          const range = quill.getSelection(true)
          quill.insertEmbed(range.index, 'image', data.url)
          quill.setSelection(range.index + 1)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image')
      } finally {
        setUploading(false)
      }
    }
  }, [])

  // Quill modules with custom image handler
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['code-block', 'blockquote'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler])

  const formats = [
    'header', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent', 'align',
    'link', 'image', 'video', 'code-block', 'blockquote',
  ]

  // Auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle))
    }
  }

  const handleSubmit = async (e: React.FormEvent, submitStatus: 'draft' | 'published') => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Clear cache and get fresh CSRF token
      clearCSRFTokenCache()
      const csrfToken = await getCSRFToken()
      if (!csrfToken) {
        throw new Error('Failed to get CSRF token. Please refresh and try again.')
      }

      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          title,
          slug: slug || generateSlug(title),
          description,
          content,
          category: selectedCategory,
          tags: tags,
          status: submitStatus,
          featured,
          og_image_url: ogImageUrl || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create post')
      }

      setSuccess(true)
      setTimeout(() => router.push('/admin/blog'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Fixed Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/admin/blog" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold dark:text-white">Create New Blog Post</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rich text editor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-200">
                Post created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Meta Fields */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 p-6 space-y-4">
            <h2 className="font-semibold text-lg dark:text-white">Post Details</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Enter blog post title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description for SEO and previews"
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={handleCategoryKeyDown}
                    placeholder="Type category and press Enter"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {cat}
                        <X
                          className="h-3 w-3 ml-1 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeCategory(cat)
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
                {selectedCategory && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Selected: {selectedCategory}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type tag and press Enter"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {tags.length} tag{tags.length !== 1 ? 's' : ''} added
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="og_image">Hero Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="og_image"
                    type="url"
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg or upload"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/jpeg,image/png,image/gif,image/webp'
                      input.onchange = async () => {
                        const file = input.files?.[0]
                        if (!file) return
                        if (file.size > 5 * 1024 * 1024) {
                          setError('Image too large. Maximum size is 5MB.')
                          return
                        }
                        setUploading(true)
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          const response = await fetch('/api/admin/blog/upload', {
                            method: 'POST',
                            body: formData,
                          })
                          if (!response.ok) throw new Error('Upload failed')
                          const data = await response.json()
                          setOgImageUrl(data.url)
                        } catch (err) {
                          setError('Failed to upload hero image')
                        } finally {
                          setUploading(false)
                        }
                      }
                      input.click()
                    }}
                    disabled={uploading}
                    title="Upload hero image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                {ogImageUrl && (
                  <div className="mt-2">
                    <img 
                      src={ogImageUrl} 
                      alt="Hero preview" 
                      className="h-20 w-auto rounded border object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor - Fixed Height */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg dark:text-white">Content *</h2>
              {uploading && (
                <span className="flex items-center gap-2 text-sm text-blue-600">
                  <Upload className="h-4 w-4 animate-pulse" />
                  Uploading image...
                </span>
              )}
            </div>
            <div 
              className="border dark:border-gray-700 rounded-lg overflow-hidden"
              style={{ height: '400px' }}
            >
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Write your blog post content here... Click the image icon to upload images."
                style={{ height: '100%' }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {content.replace(/<[^>]*>/g, '').length} characters • Click the image icon in toolbar to upload images
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
