import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { formatDocumentTitle, getSeoForPath, type PageSeoConfig } from '@/lib/seo/route-seo'
import { DEFAULT_KEYWORDS, SITE_NAME, SITE_URL, SOCIAL_IMAGE } from '@/lib/seo/site-config'

const MANAGED_SELECTOR = 'data-edurapay-seo'

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${name}"][${MANAGED_SELECTOR}]`) as HTMLMetaElement | null
  if (!el) {
    el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute(MANAGED_SELECTOR, 'true')
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"][${MANAGED_SELECTOR}]`) as HTMLLinkElement | null
  if (!el) {
    el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute(MANAGED_SELECTOR, 'true')
  el.setAttribute('href', href)
}

function removeManagedJsonLd() {
  document.querySelectorAll('script[type="application/ld+json"][data-edurapay-seo]').forEach((node) => node.remove())
}

function applySeo(config: PageSeoConfig) {
  const title = formatDocumentTitle(config.title)
  const url = `${SITE_URL}${config.path}`
  const keywords = (config.keywords ?? DEFAULT_KEYWORDS).join(', ')
  const robots = config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  document.title = title

  upsertMeta('description', config.description)
  upsertMeta('keywords', keywords)
  upsertMeta('author', SITE_NAME)
  upsertMeta('robots', robots)
  upsertMeta('googlebot', robots)
  upsertMeta('theme-color', '#7c3aed')
  upsertMeta('application-name', SITE_NAME)

  upsertMeta('og:title', title, 'property')
  upsertMeta('og:description', config.description, 'property')
  upsertMeta('og:type', config.ogType ?? 'website', 'property')
  upsertMeta('og:url', url, 'property')
  upsertMeta('og:site_name', SITE_NAME, 'property')
  upsertMeta('og:locale', 'en_IN', 'property')
  upsertMeta('og:image', SOCIAL_IMAGE, 'property')
  upsertMeta('og:image:alt', `${SITE_NAME} — fee collection for educational institutes`, 'property')

  upsertMeta('twitter:card', 'summary_large_image')
  upsertMeta('twitter:title', title)
  upsertMeta('twitter:description', config.description)
  upsertMeta('twitter:image', SOCIAL_IMAGE)

  upsertLink('canonical', url)

  removeManagedJsonLd()
  const blocks = config.jsonLd
    ? Array.isArray(config.jsonLd)
      ? config.jsonLd
      : [config.jsonLd]
    : []

  blocks.forEach((block, index) => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute(MANAGED_SELECTOR, 'true')
    el.id = `edurapay-jsonld-${index}`
    el.textContent = JSON.stringify(block)
    document.head.appendChild(el)
  })
}

/** Applies route-based SEO from pathname. */
export function RouteSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    applySeo(getSeoForPath(pathname))
  }, [pathname])

  return null
}

/** Override SEO for dynamic pages (e.g. blog posts). */
export function PageSeo({ config }: { config: PageSeoConfig }) {
  useEffect(() => {
    applySeo(config)
  }, [config])

  return null
}

export { applySeo }
