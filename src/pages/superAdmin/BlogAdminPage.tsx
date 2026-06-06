import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge, Skeleton } from '@/components/ui/label'
import { useAdminBlogs, useCreateBlog } from '@/hooks/useApi'

export function BlogAdminPage() {
  const { data, isLoading } = useAdminBlogs()
  const createBlog = useCreateBlog()
  const qc = useQueryClient()
  const posts = data?.data?.data ?? []

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categories: '',
    status: 'draft' as 'draft' | 'published',
  })

  const submit = async () => {
    try {
      await createBlog.mutateAsync({
        ...form,
        categories: form.categories.split(',').map((c) => c.trim()).filter(Boolean),
        published_at: form.status === 'published' ? new Date().toISOString() : undefined,
      })
      toast.success('Post created!')
      setForm({ title: '', slug: '', excerpt: '', content: '', categories: '', status: 'draft' })
      qc.invalidateQueries({ queryKey: ['admin-blogs'] })
      qc.invalidateQueries({ queryKey: ['blogs'] })
    } catch {
      toast.error('Failed to create post.')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Blog management</h1>
        <p className="text-muted-foreground">Create and manage platform blog content.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> New post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Excerpt</Label>
            <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Categories (comma-separated)</Label>
              <Input value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} placeholder="payments, security" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <Button onClick={submit} disabled={createBlog.isPending || !form.title || !form.content}>
            {createBlog.isPending ? 'Creating...' : 'Create post'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All posts</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.slug} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-muted-foreground">/{post.slug}</div>
                  </div>
                  <Badge className={post.status === 'published' ? 'bg-green-100 text-green-800' : ''}>{post.status}</Badge>
                </div>
              ))}
              {posts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
