import { Outlet } from 'react-router-dom'
import { RoleGuard } from '@/components/auth/RoleGuard'

export function InstituteAdminRoute() {
  return (
    <RoleGuard roles={['institute_admin', 'accountant', 'auditor']}>
      <Outlet />
    </RoleGuard>
  )
}
