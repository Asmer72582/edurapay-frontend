import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FileText, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { CourseFeeBuilder } from '@/components/courses/CourseFeeBuilder'
import { cn } from '@/lib/utils'

type Tab = 'details' | 'fees'

type Course = {
  id?: string
  _id?: string
  name: string
  grade?: string
  description?: string
  status?: string
}

function toId(v: Course | null) {
  return String(v?.id ?? v?._id ?? '')
}

export function CourseDetailsPanel({
  course,
  onClose,
  initialTab = 'fees',
}: {
  course: Course | null
  onClose: () => void
  initialTab?: Tab
}) {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>(initialTab)
  const courseId = course ? toId(course) : ''

  useEffect(() => {
    setTab(initialTab)
  }, [courseId, initialTab])

  if (!course) return null

  const tabs = [
    { id: 'details' as const, label: 'Details', icon: Info },
    { id: 'fees' as const, label: 'Fee setup', icon: FileText },
  ]

  return (
    <div className="sticky top-4 max-h-[calc(100dvh-6rem)] space-y-3 overflow-y-auto pr-1">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-bold">{course.grade ?? course.name}</div>
              <StatusBadge
                status={course.status === 'archived' ? 'archived' : 'live'}
                variant={statusVariant(course.status === 'archived' ? 'neutral' : 'success')}
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex gap-1 rounded-xl bg-muted/40 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all',
                  tab === t.id ? 'bg-white text-violet-700 shadow-sm dark:bg-card' : 'text-muted-foreground',
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {tab === 'details' && (
        <Card className="rounded-2xl border-border/60 p-4 text-sm shadow-sm">
          {course.description || 'No description added.'}
        </Card>
      )}

      {tab === 'fees' && (
        <CourseFeeBuilder
          courseId={courseId}
          courseGrade={course.grade ?? course.name}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['courses-dashboard'] })
            qc.invalidateQueries({ queryKey: ['fee-plans'] })
            qc.invalidateQueries({ queryKey: ['courses'] })
          }}
        />
      )}
    </div>
  )
}
