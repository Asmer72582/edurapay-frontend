import { Outlet, useLocation } from 'react-router-dom'
import { RouteSeo } from '@/components/seo/PageSeo'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LEGAL_POLICY_PATHS } from '@/lib/brand'
import { cn } from '@/lib/utils'

export function PublicLayout() {
  const { pathname } = useLocation()
  const motionLanding = ['/', '/solutions', '/features', '/security', '/about', '/contact'].includes(pathname)
  const legalPage = (LEGAL_POLICY_PATHS as readonly string[]).includes(pathname)

  return (
    <div className={cn('flex min-h-dvh flex-col', motionLanding || legalPage ? 'bg-[#f8fafc]' : 'bg-background')}>
      <RouteSeo />
      {!legalPage && <LandingNav />}
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <LandingFooter compact={legalPage} />
    </div>
  )
}
