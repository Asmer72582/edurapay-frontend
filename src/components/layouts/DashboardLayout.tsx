import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-dvh bg-[#f4f6fb] dark:bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Fixed sidebar — stays in place while main content scrolls */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <DashboardSidebar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((v) => !v)} />
      </div>

      {/* Main content offset by sidebar width on desktop */}
      <div
        className={cn(
          'flex min-h-dvh min-w-0 flex-col transition-[margin-left] duration-200',
          sidebarCollapsed ? 'lg:ml-[84px]' : 'lg:ml-[260px]',
        )}
      >
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
