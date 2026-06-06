import {
  breadcrumbJsonLd,
  contactPageJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from '@/lib/seo/json-ld'
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, SITE_NAME, SITE_TAGLINE } from '@/lib/seo/site-config'

export type PageSeoConfig = {
  title: string
  description: string
  keywords?: string[]
  path: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}

const BASE_KEYWORDS = DEFAULT_KEYWORDS

function page(
  title: string,
  description: string,
  path: string,
  extras?: Partial<PageSeoConfig>,
): PageSeoConfig {
  return {
    title,
    description,
    path,
    keywords: extras?.keywords ?? BASE_KEYWORDS,
    ogType: extras?.ogType ?? 'website',
    noindex: extras?.noindex,
    jsonLd: extras?.jsonLd,
  }
}

const ROUTE_SEO: Record<string, PageSeoConfig> = {
  '/': page(
    `${SITE_NAME} — Fee Collection Software for Schools & Colleges in India`,
    DEFAULT_DESCRIPTION,
    '/',
    {
      keywords: [
        ...BASE_KEYWORDS,
        'best fee collection software India',
        'education fee automation',
        'institute payment gateway',
      ],
      jsonLd: [organizationJsonLd(), websiteJsonLd(), softwareApplicationJsonLd(), webPageJsonLd(
        `${SITE_NAME} — Fee Collection Platform`,
        DEFAULT_DESCRIPTION,
        '/',
      )],
    },
  ),
  '/solutions': page(
    'Fee Collection Solutions for Institutes',
    'EduraPay solutions for schools, colleges, coaching classes, and multi-branch institutes — payment links, student portals, settlements, and defaulter management.',
    '/solutions',
    {
      keywords: [...BASE_KEYWORDS, 'fee collection solutions', 'coaching fee software', 'college payment system'],
      jsonLd: [
        webPageJsonLd('Solutions', 'Institute fee collection solutions by EduraPay', '/solutions'),
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions' },
        ]),
      ],
    },
  ),
  '/features': page(
    'Platform Features — Payment Links, Portal & Reports',
    'Explore EduraPay features: one-click payment links, Razorpay checkout, student portal, defaulter lists, GST receipts, RBAC, audit logs, and settlement tracking.',
    '/features',
    {
      keywords: [...BASE_KEYWORDS, 'payment links for schools', 'student fee portal', 'fee collection dashboard'],
      jsonLd: [
        webPageJsonLd('Features', 'EduraPay platform features for educational institutes', '/features'),
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
        ]),
      ],
    },
  ),
  '/about': page(
    'About EduraPay — Modernizing Educational Fee Management',
    'Learn about EduraPay\'s mission to simplify fee collection for schools, colleges, coaching centers, and training institutes across India with secure digital payments.',
    '/about',
    {
      keywords: [...BASE_KEYWORDS, 'about EduraPay', 'education fintech India', 'fee management company'],
      jsonLd: [
        organizationJsonLd(),
        webPageJsonLd('About EduraPay', 'About EduraPay fee collection platform', '/about'),
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]),
      ],
    },
  ),
  '/contact': page(
    'Request a Demo — Book EduraPay for Your Institute',
    'Schedule a free EduraPay demo. See fee setup, payment links, student portal, reminders, and settlement reporting tailored for your school or college.',
    '/contact',
    {
      keywords: [...BASE_KEYWORDS, 'EduraPay demo', 'fee software demo', 'contact EduraPay'],
      jsonLd: [
        contactPageJsonLd(),
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]),
      ],
    },
  ),
  '/security': page(
    'Security & Compliance — Enterprise-Grade Fee Data Protection',
    'EduraPay security: TLS encryption, webhook-verified payments, RBAC, institute-scoped tenancy, audit logs, and immutable financial records for education institutes.',
    '/security',
    {
      keywords: [...BASE_KEYWORDS, 'secure fee payment', 'PCI payment flows', 'institute data security'],
      jsonLd: [
        webPageJsonLd('Security', 'EduraPay security and compliance', '/security'),
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Security', path: '/security' },
        ]),
      ],
    },
  ),
  '/faq': page(
    'FAQ — EduraPay Fee Collection Platform',
    'Answers about EduraPay onboarding, online payments, settlements, student portal, multi-institute support, security, and how to book a demo.',
    '/faq',
    {
      keywords: [...BASE_KEYWORDS, 'EduraPay FAQ', 'fee collection questions'],
      jsonLd: [faqPageJsonLd(), breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'FAQ', path: '/faq' },
      ])],
    },
  ),
  '/blog': page(
    'Blog — Fee Collection & Institute Operations Insights',
    'EduraPay blog: tips on fee collection, digital payments, defaulter management, and institute finance operations in India.',
    '/blog',
    {
      keywords: [...BASE_KEYWORDS, 'education fee blog', 'institute finance tips'],
      jsonLd: [
        webPageJsonLd('Blog', 'EduraPay blog', '/blog'),
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ]),
      ],
    },
  ),
  '/terms': page(
    'Terms of Service',
    'EduraPay terms of service for institutes, students, and platform users.',
    '/terms',
    { noindex: false },
  ),
  '/privacy': page(
    'Privacy Policy',
    'EduraPay privacy policy — how we collect, use, and protect institute and student data.',
    '/privacy',
    { noindex: false },
  ),
  '/login': page(
    'Institute Login',
    'Sign in to your EduraPay institute dashboard.',
    '/login',
    { noindex: true },
  ),
  '/pricing': page(
    'Request a Demo — EduraPay Pricing',
    'Contact EduraPay for institute pricing and a personalized demo of our fee collection platform.',
    '/contact',
  ),
}

export function getSeoForPath(pathname: string): PageSeoConfig {
  if (ROUTE_SEO[pathname]) return ROUTE_SEO[pathname]

  if (pathname.startsWith('/blog/') && pathname !== '/blog/') {
    return page('Blog Article', DEFAULT_DESCRIPTION, pathname, { ogType: 'article', noindex: false })
  }

  if (pathname.startsWith('/pay/') || pathname.startsWith('/student-onboarding/')) {
    return page(SITE_NAME, SITE_TAGLINE, pathname, { noindex: true })
  }

  return page(SITE_NAME, DEFAULT_DESCRIPTION, pathname, { noindex: true })
}

export function formatDocumentTitle(title: string): string {
  if (title.includes(SITE_NAME)) return title
  return `${title} | ${SITE_NAME}`
}
