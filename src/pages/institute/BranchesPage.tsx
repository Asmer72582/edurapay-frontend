import { useMemo, useState } from 'react'
import { Building2, MapPin, Users } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TableShell, StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/label'
import { useWorkspaceBranches } from '@/hooks/useApi'

export function BranchesPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useWorkspaceBranches()
  const branches = data?.data?.branches ?? []
  const totals = data?.data?.totals

  const filtered = useMemo(() => {
    if (!search.trim()) return branches
    const q = search.toLowerCase()
    return branches.filter(
      (b) => b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.id.toLowerCase().includes(q),
    )
  }, [branches, search])

  if (isError) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">Unable to load branches.</div>
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Workspace' }, { label: 'Branches' }]}
        title="Branches"
        description="Your institute campuses and branch-level student counts."
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total branches"
            value={String(totals?.branches ?? branches.length)}
            trend={`${totals?.active_branches ?? 0} active`}
            trendUp={(totals?.active_branches ?? 0) > 0}
          />
          <MetricCard
            label="Total students"
            value={(totals?.students ?? 0).toLocaleString('en-IN')}
            trend="All branches"
            trendUp={(totals?.students ?? 0) > 0}
          />
          <MetricCard
            label="Staff members"
            value={String(totals?.staff ?? 0)}
            trend="Institute admins"
            trendUp
          />
          <MetricCard
            label="Setup pending"
            value={String(totals?.setup_pending ?? 0)}
            trend={(totals?.setup_pending ?? 0) === 0 ? 'All active' : 'Needs approval'}
            trendUp={(totals?.setup_pending ?? 0) === 0}
          />
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {branches.map((branch) => (
            <Card key={branch.id} className="rounded-2xl border-border/60 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <StatusBadge status={branch.status} variant={statusVariant(branch.status)} />
                </div>
                <div className="font-bold">{branch.name}</div>
                {branch.is_primary && <div className="text-xs font-medium text-violet-600">Primary campus</div>}
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {[branch.city, branch.state].filter(Boolean).join(', ') || '—'}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {branch.students} students
                  </span>
                  <span className="text-muted-foreground">{branch.staff} staff</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TableShell
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branches..."
        countLabel={`${filtered.length} branches`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Branch</th>
                <th className="px-5 py-3.5">City</th>
                <th className="px-5 py-3.5">Students</th>
                <th className="px-5 py-3.5">Staff</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No branches found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.is_primary ? 'Primary campus' : b.id}</div>
                    </td>
                    <td className="px-5 py-4">{b.city}</td>
                    <td className="px-5 py-4 font-medium">{b.students}</td>
                    <td className="px-5 py-4">{b.staff}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={b.status} variant={statusVariant(b.status)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableShell>

      {!isLoading && branches.length <= 1 && (
        <p className="text-center text-sm text-muted-foreground">
          Multi-branch management is coming soon. Your primary campus is shown above with live student counts.
        </p>
      )}
    </div>
  )
}
