import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHero } from '@/components/landing/LandingSections'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge, Skeleton } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useBlogs } from '@/hooks/useApi'

const categories = ['all', 'payments', 'security', 'platform']

export function BlogListPage() {
  const [params, setParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(params.get('search') ?? '')
  const search = params.get('search') ?? ''
  const category = params.get('category') ?? 'all'

  const { data, isLoading, isError } = useBlogs(search, category)
  const posts = data?.data?.data ?? []

  const applySearch = () => {
    const next = new URLSearchParams(params)
    if (searchInput) next.set('search', searchInput)
    else next.delete('search')
    setParams(next)
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="landing-section pt-10">
        <PageHero
          eyebrow="Blog"
          title="Insights & updates"
          description="Education finance, secure payments, and platform news from the EduraPay team."
        />
      </div>
      <div className="landing-section space-y-8">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? 'default' : 'outline'}
              onClick={() => {
                const next = new URLSearchParams(params)
                if (c === 'all') next.delete('category')
                else next.set('category', c)
                setParams(next)
              }}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      )}

      {isError && (
        <Card><CardContent className="p-6 text-muted-foreground">Unable to load posts. Ensure the backend is running.</CardContent></Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="space-y-3 p-6">
                <div className="flex flex-wrap gap-1">
                  {(post.categories ?? []).map((cat) => (
                    <Badge key={cat} className="bg-primary/10 text-primary">{cat}</Badge>
                  ))}
                </div>
                <h2 className="font-semibold leading-snug">{post.title}</h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                {post.published_at && (
                  <p className="text-xs text-muted-foreground">{new Date(post.published_at).toLocaleDateString()}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!isLoading && posts.length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No posts found.</CardContent></Card>
      )}
      </div>
    </div>
  )
}
