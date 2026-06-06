import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore, getDashboardPath } from '@/stores/auth'

export function RoleGuard({ roles, children }: { roles: string[]; children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={getDashboardPath(user.role)} replace />
  return children
}
