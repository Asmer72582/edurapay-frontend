import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  variant?: 'full' | 'icon'
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'
}

const iconSizes = {
  xs: 'h-7 w-7',
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
} as const

const fullHeights = {
  xs: 'h-7',
  sm: 'h-9',
  md: 'h-11',
  lg: 'h-14',
  xl: 'h-16',
  hero: 'h-20 sm:h-24 md:h-28',
} as const

export function BrandLogo({ variant = 'full', className, size = 'sm' }: BrandLogoProps) {
  if (variant === 'icon') {
    return (
      <img
        src={BRAND.logoIcon}
        alt={BRAND.name}
        className={cn('object-contain', iconSizes[size], className)}
        width={256}
        height={256}
        decoding="async"
      />
    )
  }

  return (
    <img
      src={BRAND.logoFull}
      alt={`${BRAND.name} — ${BRAND.tagline}`}
      className={cn('mx-auto w-auto max-w-[min(100%,640px)] object-contain', fullHeights[size], className)}
      width={640}
      height={160}
      decoding="async"
    />
  )
}
