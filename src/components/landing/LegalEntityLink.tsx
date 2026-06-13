import { LEGAL_ENTITY } from '@/lib/brand'
import { cn } from '@/lib/utils'

export function LegalEntityLink({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'muted' | 'inherit'
}) {
  return (
    <a
      href={LEGAL_ENTITY.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        variant === 'default' && 'font-medium text-violet-700 hover:underline',
        variant === 'muted' && 'text-violet-700 hover:underline',
        variant === 'inherit' && 'hover:underline',
        className,
      )}
    >
      {LEGAL_ENTITY.name}
    </a>
  )
}
