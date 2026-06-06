import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, getDashboardPath } from '@/stores/auth'

export function ProtectedRoute({ roles }: { roles?: string[] }) {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f4f6fb] dark:bg-background">
        <div className="text-sm text-muted-foreground">Loading session…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  return <Outlet />
}
