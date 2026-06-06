import { Bell, Menu, Plus, Search } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DashboardTopbarProps {
  onMenuClick?: () => void
}

function userInitials(name?: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function roleLabel(role?: string) {
  if (!role) return 'User'
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden max-w-xl flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students, payments, institutes..."
          className="h-10 rounded-xl border-border/60 bg-muted/30 pl-9 pr-16"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          ⌘ K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" className="hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20 sm:inline-flex">
          <Plus className="h-4 w-4" />
          New collection
        </Button>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            3
          </span>
        </Button>
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card py-1.5 pl-1.5 pr-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
            {userInitials(user?.name)}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-sm font-semibold leading-none">{user?.name ?? 'User'}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{roleLabel(user?.role)}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
