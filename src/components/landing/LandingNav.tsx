import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/solutions', label: 'Solutions' },
  { to: '/features', label: 'Features' },
  { to: '/security', label: 'Security' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 lg:gap-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5 justify-self-start">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-transform group-hover:scale-105">
            E
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">EduraPay</span>
        </Link>

        <nav className="hidden items-center justify-center gap-0.5 justify-self-center lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-violet-100 font-medium text-violet-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 justify-self-end">
          <Link to="/contact" className="hidden sm:block">
            <Button
              size="sm"
              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
            >
              Request demo
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-3 py-2.5 text-sm',
                  isActive ? 'bg-violet-100 font-medium text-violet-700' : 'text-slate-600',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/contact" onClick={() => setOpen(false)} className="mt-3 block">
            <Button className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600">Request demo</Button>
          </Link>
        </nav>
      )}
    </header>
  )
}
