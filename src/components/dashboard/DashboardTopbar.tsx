import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  CalendarRange,
  Check,
  ChevronDown,
  History,
  LogOut,
  Menu,
  Plus,
  Search,
} from 'lucide-react'
import { useWorkspaceAcademicYear } from '@/hooks/useWorkspaceAcademicYear'
import { formatYearLabel } from '@/lib/academic-year'
import { useAuthStore, getDashboardPath } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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

function ProfileMenu({
  name,
  role,
  onLogout,
}: {
  name?: string
  role?: string
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menuWidth = 200
    setPos({
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - menuWidth),
      width: menuWidth,
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card py-1.5 pl-1.5 pr-2 transition-colors hover:bg-muted/40 sm:pr-3"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
          {userInitials(name)}
        </div>
        <div className="hidden min-w-0 text-left sm:block">
          <div className="truncate text-sm font-semibold leading-none">{name ?? 'User'}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{roleLabel(role)}</div>
        </div>
        <ChevronDown className={cn('hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform sm:block', open && 'rotate-180')} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[200] overflow-hidden rounded-xl border border-border/60 bg-popover py-1 shadow-lg"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="border-b border-border/60 px-3 py-2.5">
              <div className="truncate text-sm font-semibold">{name ?? 'User'}</div>
              <div className="text-xs text-muted-foreground">{roleLabel(role)}</div>
            </div>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Log out
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}

function AcademicYearSwitcher({ enabled }: { enabled: boolean }) {
  const {
    isLoading,
    currentYear,
    activeYear,
    isViewingPast,
    pastYears,
    allYears,
    selectCurrent,
    selectPast,
  } = useWorkspaceAcademicYear(enabled)

  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 220) })
  }, [open, allYears.length])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!enabled) return null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={isLoading}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'hidden shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors lg:flex',
          isViewingPast
            ? 'border-amber-200 bg-amber-50/80 hover:bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30'
            : 'border-border/60 bg-card hover:bg-muted/40',
        )}
        aria-label="Academic year"
        aria-expanded={open}
      >
        <CalendarRange className={cn('h-4 w-4 shrink-0', isViewingPast ? 'text-amber-700' : 'text-violet-600')} />
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isViewingPast ? 'Past records' : 'Current year'}
          </div>
          <div className="truncate text-sm font-semibold leading-tight">
            {isLoading ? '…' : formatYearLabel(activeYear)}
          </div>
        </div>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {/* Compact pill on tablet */}
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-semibold lg:hidden',
          isViewingPast
            ? 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30'
            : 'border-border/60 bg-card text-foreground',
        )}
        aria-label="Academic year"
      >
        <CalendarRange className="h-3.5 w-3.5" />
        {isLoading ? '…' : formatYearLabel(activeYear)}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[200] max-h-[min(320px,70vh)] overflow-y-auto rounded-xl border border-border/60 bg-popover py-1 shadow-lg"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-muted/50"
              onClick={() => {
                selectCurrent()
                setOpen(false)
              }}
            >
              <CalendarRange className="h-4 w-4 shrink-0 text-violet-600" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{formatYearLabel(currentYear)}</span>
                <span className="text-xs text-muted-foreground">Current academic year</span>
              </span>
              {!isViewingPast && <Check className="h-4 w-4 shrink-0 text-violet-600" />}
            </button>

            {pastYears.length > 0 && (
              <>
                <div className="mx-3 my-1 border-t border-border/60" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <History className="h-3 w-3" />
                  Past records
                </div>
                {pastYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-muted/50"
                    onClick={() => {
                      selectPast(year)
                      setOpen(false)
                    }}
                  >
                    <span className="min-w-0 flex-1 font-medium">{formatYearLabel(year)}</span>
                    {isViewingPast && activeYear === year && (
                      <Check className="h-4 w-4 shrink-0 text-amber-700" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [search, setSearch] = useState('')

  const isInstituteAdmin = user?.role === 'institute_admin'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const runSearch = () => {
    const q = search.trim()
    if (!q) {
      searchRef.current?.focus()
      return
    }
    if (isInstituteAdmin) {
      navigate(`/app/institute/students?search=${encodeURIComponent(q)}`)
      return
    }
    navigate(`${getDashboardPath(user?.role)}?search=${encodeURIComponent(q)}`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-xl sm:gap-3 sm:px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      <form
        className="relative min-w-0 flex-1"
        onSubmit={(e) => {
          e.preventDefault()
          runSearch()
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students, payments…"
          className="h-10 w-full min-w-0 rounded-xl border-border/60 bg-muted/30 pl-9 pr-12"
          aria-label="Search"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline">
          ⌘ K
        </kbd>
      </form>

      <AcademicYearSwitcher enabled={isInstituteAdmin} />

      {isInstituteAdmin && (
        <Button
          size="sm"
          type="button"
          className="hidden shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20 sm:inline-flex"
          onClick={() => navigate('/app/institute/courses')}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xl:inline">New collection</span>
        </Button>
      )}

      <ProfileMenu name={user?.name} role={user?.role} onLogout={handleLogout} />
    </header>
  )
}
