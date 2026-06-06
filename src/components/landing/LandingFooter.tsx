import { Link, NavLink } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { BRAND } from '@/lib/brand'

const exploreLinks = [
  { to: '/features', label: 'Features' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/security', label: 'Security' },
  { to: '/about', label: 'About' },
]

const resourceLinks = [
  { to: '/contact', label: 'Request demo' },
  { to: '/faq', label: 'FAQ' },
  { to: '/blog', label: 'Blog' },
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
]

export function LandingFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="shrink-0 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-center sm:flex-row sm:text-left lg:px-8">
          <Link to="/" className="inline-block transition-opacity hover:opacity-90">
            <BrandLogo variant="full" size="xs" />
          </Link>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} {BRAND.name} · www.edurapay.in</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <NavLink to="/terms" className="hover:text-violet-700">
              Terms
            </NavLink>
            <NavLink to="/privacy" className="hover:text-violet-700">
              Privacy
            </NavLink>
            <NavLink to="/about" className="hover:text-violet-700">
              About
            </NavLink>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <BrandLogo variant="full" size="md" className="max-w-[240px]" />
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-600">
              Fee collection, payment links, student portals, and settlement reporting for schools and colleges across
              India. Book a demo to see how your institute can go live in days.
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <a href="mailto:support@edurapay.com" className="flex items-center gap-2 hover:text-violet-700">
                <Mail className="h-4 w-4 shrink-0 text-violet-600" />
                support@edurapay.com
              </a>
              <a href="tel:+917558724597" className="flex items-center gap-2 hover:text-violet-700">
                <Phone className="h-4 w-4 shrink-0 text-violet-600" />
                +91 7558724597
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                Pratilab Nivas, Shreeram Nagar, Bhingloli, Post &amp; Tal. Mandangad, Dist. Ratnagiri - 415203
              </p>
            </div>
          </div>

          <div>
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

          <div>
            <div className="mb-3 text-sm font-semibold text-slate-900">Resources</div>
            <div className="space-y-2.5">
              {resourceLinks.map((l) => (
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
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p>Built for education institutes across India · www.edurapay.in</p>
        </div>
      </div>
    </footer>
  )
}
