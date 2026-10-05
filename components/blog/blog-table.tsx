"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { getCSRFToken, clearCSRFTokenCache } from '@/lib/csrf-client'

interface BlogPost {
  id: string
  slug: string
  title: string
  status: 'draft' | 'published'
  category?: string | null
  view_count?: number | null
  total_views?: number | null
  created_at: string
  updated_at: string
}

interface BlogTableProps {
  posts: BlogPost[]
}

export function BlogTable({ posts }: BlogTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleEdit = (slug: string) => {
    router.push(`/admin/blog/${slug}/edit`)
  }

  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return

    setLoading(postToDelete.slug)
    try {
      // Clear cache to get fresh token
      clearCSRFTokenCache()
      const csrfToken = await getCSRFToken()
      if (!csrfToken) {
        throw new Error('Failed to get CSRF token. Please refresh the page.')
      }

      const response = await fetch(`/api/admin/blog/${postToDelete.slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        // Clear cache on CSRF errors to get fresh token next time
        if (error.code === 'CSRF_TOKEN_INVALID') {
          clearCSRFTokenCache()
        }
        throw new Error(error.error || 'Failed to delete post')
      }

      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      })

      setDeleteDialogOpen(false)
      setPostToDelete(null)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete post',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleToggleStatus = async (slug: string, newStatus: 'draft' | 'published') => {
    setLoading(slug)
    try {
      // Clear cache to get fresh token
      clearCSRFTokenCache()
      const csrfToken = await getCSRFToken()
      if (!csrfToken) {
        throw new Error('Failed to get CSRF token. Please refresh the page.')
      }

      const response = await fetch(`/api/admin/blog/${slug}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        // Clear cache on CSRF errors to get fresh token next time
        if (error.code === 'CSRF_TOKEN_INVALID') {
          clearCSRFTokenCache()
        }
        throw new Error(error.error || 'Failed to update status')
      }

      toast({
        title: 'Success',
        description: `Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const getStatusBadge = (status: 'draft' | 'published') => {
    return status === 'published' ? (
      <Badge className="bg-green-500 text-white">Published</Badge>
    ) : (
      <Badge variant="outline">Draft</Badge>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No posts yet. Create your first post!
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/blog/${post.slug}/edit`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(post.status)}
                      <Switch
                        checked={post.status === 'published'}
                        onCheckedChange={(checked) =>
                          handleToggleStatus(
                            post.slug,
                            checked ? 'published' : 'draft'
                          )
                        }
                        disabled={loading === post.slug}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{post.category || '-'}</TableCell>
                  <TableCell>{post.total_views || post.view_count || 0}</TableCell>
                  <TableCell>
                    {formatDate(post.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(post.slug)}
                        disabled={loading === post.slug}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(post)}
                        disabled={loading === post.slug}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action
              cannot be undone and will permanently delete the post and all its
              associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

