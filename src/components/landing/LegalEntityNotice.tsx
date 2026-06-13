import { Link } from 'react-router-dom'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { BRAND, LEGAL_FOOTER_LINKS } from '@/lib/brand'
import { cn } from '@/lib/utils'

export function LegalEntityNotice({
  className,
  showLinks = false,
  compactLinks = false,
}: {
  className?: string
  showLinks?: boolean
  compactLinks?: boolean
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-xs leading-relaxed text-slate-500">
        {BRAND.name} is a product of <LegalEntityLink variant="muted" />. All payment processing and merchant services
        are provided through <LegalEntityLink variant="muted" />.
      </p>
      <p className="text-xs leading-relaxed text-slate-500">
        {BRAND.name} is operated by <LegalEntityLink variant="muted" />.
      </p>
      {showLinks && (
        <nav
          aria-label="Legal and policy links"
          className={cn(
            'flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600',
            compactLinks && 'justify-center',
          )}
        >
          {LEGAL_FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-violet-700 hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
