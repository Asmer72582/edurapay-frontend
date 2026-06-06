import { Outlet, useLocation } from 'react-router-dom'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { cn } from '@/lib/utils'

export function PublicLayout() {
  const { pathname } = useLocation()
  const motionLanding = ['/', '/solutions', '/features', '/security', '/about', '/contact'].includes(pathname)

  return (
    <div className={cn('min-h-dvh', motionLanding ? 'bg-[#f8fafc]' : 'bg-background')}>
      <LandingNav />
      <main className="w-full">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  )
}
