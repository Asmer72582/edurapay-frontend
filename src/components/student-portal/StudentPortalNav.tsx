import { NavLink } from 'react-router-dom'
import { CreditCard, FileText, Home, Receipt, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '.', end: true, label: 'Overview', icon: Home },
  { to: 'fees', label: 'Pay fees', icon: CreditCard },
  { to: 'payments', label: 'Payments', icon: Receipt },
  { to: 'receipts', label: 'Receipts', icon: FileText },
  { to: 'disputes', label: 'Disputes', icon: Scale },
]

export function StudentPortalNav() {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
