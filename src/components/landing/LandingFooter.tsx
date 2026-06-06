import { Link, NavLink } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'

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

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
                E
              </div>
              <span className="text-lg font-bold text-slate-900">EduraPay</span>
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
          <p>© {new Date().getFullYear()} EduraPay. All rights reserved.</p>
          <p>Built for education institutes across India · www.edurapay.in</p>
        </div>
      </div>
    </footer>
  )
}
