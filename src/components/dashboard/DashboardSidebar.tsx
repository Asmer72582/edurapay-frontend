import { NavLink, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { getNavForRole } from '@/components/dashboard/navigation'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function DashboardSidebar({
  collapsed = false,
  onToggleCollapsed,
}: {
  collapsed?: boolean
  onToggleCollapsed?: () => void
}) {
  const user = useAuthStore((s) => s.user)
  const sections = getNavForRole(user?.role)

  return (
    <aside
      className={cn(
        'flex h-dvh shrink-0 flex-col overflow-hidden border-r border-border/60 bg-card transition-[width] duration-200',
        collapsed ? 'w-[84px]' : 'w-[260px]',
      )}
    >
      <div className="shrink-0 border-b border-border/60 p-5">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center">
            <BrandLogo
              variant={collapsed ? 'icon' : 'full'}
              size={collapsed ? 'sm' : 'xs'}
              className={collapsed ? undefined : 'max-w-[180px]'}
            />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden rounded-xl lg:inline-flex"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to.endsWith('super-admin') || item.to.endsWith('institute')}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-violet-50 text-violet-700 shadow-sm dark:bg-violet-950/40 dark:text-violet-300'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <Badge className="rounded-md bg-emerald-100 px-1.5 py-0 text-[10px] font-semibold text-emerald-700">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed ? (
        <div className="shrink-0 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-4 text-white shadow-lg">
            <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Upgrade to Scale
            </div>
            <p className="mb-3 text-xs text-violet-100">Unlock advanced analytics, multi-branch ops, and priority support.</p>
            <Button size="sm" className="h-8 w-full rounded-lg bg-white text-violet-700 hover:bg-violet-50">
              View plans
            </Button>
          </div>
        </div>
      ) : (
        <div className="shrink-0 p-3">
          <Button
            size="icon"
            variant="outline"
            className="h-10 w-full rounded-xl"
            title="Upgrade to Scale"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      )}
    </aside>
  )
}
