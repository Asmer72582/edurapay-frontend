import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageSeo } from '@/components/seo/PageSeo'
import { breadcrumbJsonLd } from '@/lib/seo/json-ld'
import { SITE_NAME, SITE_URL, SOCIAL_IMAGE } from '@/lib/seo/site-config'
import { Badge, Skeleton } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useBlog } from '@/hooks/useApi'

export function BlogDetailPage() {
  const { slug } = useParams()
  const { data, isLoading, isError } = useBlog(slug ?? '')
  const post = data?.data?.post

  const seo = useMemo(() => {
    if (!post || !slug) return null
    const description = post.excerpt || (post.content ?? '').slice(0, 160)
    const path = `/blog/${slug}`
    return {
      title: post.title,
      description,
      path,
      ogType: 'article' as const,
      keywords: [...(post.categories ?? []), 'EduraPay', 'fee collection', 'education'],
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description,
          url: `${SITE_URL}${path}`,
          datePublished: post.published_at ?? undefined,
          author: { '@type': 'Organization', name: SITE_NAME },
          publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/brand/logo-full.png` } },
          image: SOCIAL_IMAGE,
        },
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path },
        ]),
      ],
    }
  }, [post, slug])

  if (isLoading) return <Skeleton className="h-96" />

  if (isError || !post) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Post not found.</p>
          <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">Back to blog</Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {seo ? <PageSeo config={seo} /> : null}
      <article className="mx-auto max-w-3xl space-y-6">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>
      <div className="flex flex-wrap gap-2">
        {(post.categories ?? []).map((cat) => (
          <Badge key={cat} className="bg-primary/10 text-primary">{cat}</Badge>
        ))}
      </div>
      <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
      {post.published_at && (
        <p className="text-sm text-muted-foreground">{new Date(post.published_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
      )}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        <div className="whitespace-pre-wrap leading-relaxed">{post.content}</div>
      </div>
    </article>
    </>
  )
}
