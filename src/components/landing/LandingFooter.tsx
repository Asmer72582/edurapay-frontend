import { Link, NavLink } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { LegalEntityNotice } from '@/components/landing/LegalEntityNotice'
import { BRAND, LEGAL_ENTITY, LEGAL_FOOTER_LINKS, LEGAL_POLICY_NAV } from '@/lib/brand'

const exploreLinks = [
  { to: '/features', label: 'Features' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/security', label: 'Security' },
  { to: '/faq', label: 'FAQ' },
  { to: '/blog', label: 'Blog' },
]

export function LandingFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="mt-auto shrink-0 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-center sm:flex-row sm:text-left lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {BRAND.name} · Operated by <LegalEntityLink variant="inherit" className="text-violet-700" />
          </p>
          <nav aria-label="Legal links" className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            {LEGAL_POLICY_NAV.map((l) => (
              <NavLink key={l.to} to={l.to} className="text-slate-600 hover:text-violet-700">
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <BrandLogo variant="full" size="md" className="max-w-[240px]" />
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-600">
              Fee collection, payment links, student portals, and settlement reporting for schools and colleges across
              India. Book a demo to see how your institute can go live in days.
            </p>
            <LegalEntityNotice />
            <div className="space-y-2 text-sm text-slate-600">
              <a href={`mailto:${LEGAL_ENTITY.email}`} className="flex items-center gap-2 hover:text-violet-700">
                <Mail className="h-4 w-4 shrink-0 text-violet-600" />
                {LEGAL_ENTITY.email}
              </a>
              <a href="tel:+917558724597" className="flex items-center gap-2 hover:text-violet-700">
                <Phone className="h-4 w-4 shrink-0 text-violet-600" />
                {LEGAL_ENTITY.phone}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                {LEGAL_ENTITY.addressLine}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-3 text-sm font-semibold text-slate-900">Explore</div>
            <div className="space-y-2.5">
              {exploreLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className="block text-sm text-slate-600 transition-colors hover:text-violet-700"
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">Legal &amp; policies</div>
            <div className="space-y-2.5">
              {LEGAL_FOOTER_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className="block text-sm text-slate-600 transition-colors hover:text-violet-700"
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. Operated by <LegalEntityLink variant="inherit" className="text-violet-700" />.
            All rights reserved.
          </p>
          <p>Built for education institutes across India · {LEGAL_ENTITY.website}</p>
        </div>
      </div>
    </footer>
  )
}
