import { faqItems } from '@/components/landing/landing-content'
import { DEFAULT_DESCRIPTION, ORGANIZATION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/seo/site-config'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    logo: ORGANIZATION.logo,
    description: DEFAULT_DESCRIPTION,
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.phone,
    address: {
      '@type': 'PostalAddress',
      ...ORGANIZATION.address,
    },
    areaServed: ORGANIZATION.areaServed,
    ...(ORGANIZATION.sameAs.length > 0 ? { sameAs: ORGANIZATION.sameAs } : {}),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION.name,
      url: ORGANIZATION.url,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/faq?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: 'Contact for institute pricing and demo',
    },
    featureList: [
      'Online fee collection via UPI, cards, and net banking',
      'Automated payment reminders',
      'Student and guardian portal',
      'Real-time collection dashboard',
      'Digital receipts and reports',
      'Defaulter tracking',
      'Multi-institute RBAC',
    ],
  }
}

export function faqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function webPageJsonLd(title: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      '@type': 'Thing',
      name: SITE_TAGLINE,
    },
  }
}

export function contactPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Request a demo — EduraPay',
    url: `${SITE_URL}/contact`,
    description: 'Book a demo of EduraPay fee collection software for your educational institute.',
    mainEntity: {
      '@type': 'Organization',
      name: ORGANIZATION.name,
      email: ORGANIZATION.email,
      telephone: ORGANIZATION.phone,
      address: {
        '@type': 'PostalAddress',
        ...ORGANIZATION.address,
      },
    },
  }
}
