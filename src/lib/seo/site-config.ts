/** Public marketing site URL — set VITE_SITE_URL in production (e.g. https://www.edurapay.in). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://www.edurapay.in').replace(/\/$/, '')

export const SITE_NAME = 'EduRaPay'

export const SITE_TAGLINE = 'Smart payments. Stronger education.'

export const DEFAULT_DESCRIPTION =
  'EduRaPay is India\'s fee collection and institute management platform for schools, colleges, coaching classes, and training institutes. Accept UPI, cards, and net banking; automate reminders, receipts, and real-time reconciliation.'

export const DEFAULT_KEYWORDS = [
  'EduraPay',
  'EduRaPay',
  'school fee collection software India',
  'college fee management system',
  'online fee payment for institutes',
  'institute fee collection platform',
  'coaching class fee software',
  'student fee management',
  'UPI fee payment schools',
  'Razorpay fee collection',
  'fee reminder automation',
  'digital fee receipts',
  'education billing software India',
  'guardian fee portal',
  'fee defaulter tracking',
  'GST fee receipts',
  'multi-branch institute fees',
  'training institute payment system',
]

export const ORGANIZATION = {
  name: SITE_NAME,
  legalName: 'Rasvik Software Solutions Private Limited',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-full.png`,
  email: 'support@edurapay.com',
  phone: '+91-7558724597',
  address: {
    streetAddress: 'Pratilab Nivas, Shreeram Nagar, Bhingloli',
    addressLocality: 'Mandangad',
    addressRegion: 'Maharashtra',
    postalCode: '415203',
    addressCountry: 'IN',
  },
  sameAs: ['https://www.rasvik.in/'] as string[],
  areaServed: 'IN',
}

export const SOCIAL_IMAGE = `${SITE_URL}/brand/logo-full.png`
