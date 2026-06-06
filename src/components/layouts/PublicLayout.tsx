import { Outlet, useLocation } from 'react-router-dom'
import { RouteSeo } from '@/components/seo/PageSeo'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { cn } from '@/lib/utils'

export function PublicLayout() {
  const { pathname } = useLocation()
  const motionLanding = ['/', '/solutions', '/features', '/security', '/about', '/contact'].includes(pathname)
  const isContact = pathname === '/contact'

  return (
    <div
      className={cn(
        motionLanding ? 'bg-[#f8fafc]' : 'bg-background',
        isContact ? 'flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden' : 'min-h-dvh',
      )}
    >
      <RouteSeo />
      <LandingNav />
      <main className={cn('w-full', isContact && 'min-h-0 flex-1 lg:overflow-hidden')}>
        <Outlet />
      </main>
      <LandingFooter compact={isContact} />
    </div>
  )
}
