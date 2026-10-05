"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreateBlogPostInput } from '@/lib/validation/blog-schema'
import { QuillEditor } from '@/components/blog/quill-editor'
import { supabase } from '@/lib/supabase/client'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface BlogFormProps {
  initialData?: Partial<CreateBlogPostInput> & { slug?: string; content?: string }
  onSubmit: (data: CreateBlogPostInput) => Promise<void>
  mode?: 'create' | 'edit'
}

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const CATEGORIES = [
  'Tutorial',
  'Guide',
  'News',
  'Announcement',
  'Case Study',
  'Product Update',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function BlogForm({ initialData, onSubmit, mode = 'create' }: BlogFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft')
  const [featured, setFeatured] = useState(initialData?.featured || false)
  const [ogImageUrl, setOgImageUrl] = useState(initialData?.og_image_url || '')
  
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && title && !slug) {
      setSlug(generateSlug(title))
    }
  }, [title, slug, mode])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `hero/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      setOgImageUrl(publicUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setOgImageUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const formData: CreateBlogPostInput = {
        title,
        slug: slug || generateSlug(title),
        description,
        content,
        category,
        tags: tagArray,
        status,
        featured,
        og_image_url: ogImageUrl || undefined,
      }

      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog post title"
            required
            minLength={10}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {title.length}/200 characters
          </p>
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-friendly-slug"
            required
            pattern="^[a-z0-9-]+$"
          />
          <p className="text-xs text-muted-foreground">
            URL-friendly identifier (lowercase, numbers, hyphens only)
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description for SEO and previews"
            required
            minLength={20}
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {description.length}/500 characters
          </p>
        </div>

        {/* Category and Tags */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags *</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              required
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated tags (1-10 tags)
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <div className="border rounded-lg overflow-hidden">
            <QuillEditor
              value={content}
              onChange={setContent}
              placeholder="Write your blog post content here..."
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {content.length} characters (minimum 100)
          </p>
        </div>

        {/* Hero Image Upload */}
        <div className="space-y-2">
          <Label>Hero Image</Label>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-4 transition-colors hover:border-primary/50">
            {ogImageUrl ? (
              <div className="relative aspect-[16/9] w-full max-w-md mx-auto overflow-hidden rounded-lg">
                <Image
                  src={ogImageUrl}
                  alt="Hero Preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center py-8 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-2" />
                ) : (
                  <div className="bg-muted p-4 rounded-full mb-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="text-center">
                  <span className="font-medium text-primary">Click to upload</span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  SVG, PNG, JPG or GIF (max. 5MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>
          {ogImageUrl && (
            <div className="flex items-center gap-2">
              <Label htmlFor="og_image_url_text" className="text-xs text-muted-foreground shrink-0">Image URL:</Label>
              <Input
                id="og_image_url_text"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                className="h-8 text-xs font-mono"
                placeholder="Or paste an image URL here"
              />
            </div>
          )}
        </div>

        {/* Status and Featured */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'draft' | 'published')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={setFeatured}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="secondary"
          disabled={loading}
          onClick={(e) => {
            e.preventDefault()
            setStatus('draft')
            handleSubmit(e)
          }}
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </form>
  )
}

