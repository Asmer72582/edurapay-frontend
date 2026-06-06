import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { usePortalContext } from '@/stores/portal-context'
import { portalGet } from '@/lib/portal-api'
import { GuardianStudentPicker } from '@/components/student-portal/GuardianStudentPicker'
import { StudentPortalNav } from '@/components/student-portal/StudentPortalNav'
import type { PortalOverview } from '@/types/student-portal'

export function StudentPortalLayout() {
  const user = useAuthStore((s) => s.user)
  const activeStudentId = usePortalContext((s) => s.activeStudentId)
  const isGuardian = user?.role === 'guardian'

  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'overview', activeStudentId],
    queryFn: () => portalGet<PortalOverview>('/v1/portal/overview', isGuardian ? activeStudentId : null),
    enabled: !!user,
  })

  const overview = data?.data
  const instituteName = overview?.institute_name ?? 'Your institute'

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isGuardian ? 'Guardian portal' : 'Student portal'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Pay fees, download receipts, and manage payment disputes securely.
          </p>
        </div>
        {isGuardian && overview?.children && overview.children.length > 0 && (
          <GuardianStudentPicker children={overview.children} />
        )}
      </div>

      <StudentPortalNav />

      {isLoading && !overview ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Outlet context={{ overview, instituteName, activeStudentId: isGuardian ? activeStudentId : overview?.student?.id }} />
      )}
    </div>
  )
}
