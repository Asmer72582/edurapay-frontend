export const BRAND = {
  name: 'EduRaPay',
  tagline: 'Smart payments. Stronger education.',
  logoIcon: '/brand/logo-icon.png',
  logoFull: '/brand/logo-full.png',
} as const

/** Legal entity operating EduRaPay and providing payment merchant services (Razorpay KYC). */
export const LEGAL_ENTITY = {
  name: 'Rasvik LLP',
  url: 'https://www.rasvik.in/',
  email: 'support@edurapay.com',
  phone: '+91 7558724597',
  website: 'www.edurapay.in',
  addressLine:
    'Pratilab Nivas, Shreeram Nagar, Bhingloli, Post & Tal. Mandangad, Dist. Ratnagiri - 415203, Maharashtra, India',
} as const

export const LEGAL_FOOTER_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/refund', label: 'Refund Policy' },
  { to: '/pricing', label: 'Pricing Information' },
] as const

/** Routes that use the legal document layout (compact header + footer). */
export const LEGAL_POLICY_PATHS = ['/terms', '/privacy', '/refund', '/pricing'] as const

export const LEGAL_POLICY_NAV = [
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/refund', label: 'Refund' },
  { to: '/pricing', label: 'Pricing' },
] as const
