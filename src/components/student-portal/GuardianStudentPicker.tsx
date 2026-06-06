import { useEffect } from 'react'
import { SelectField } from '@/components/ui/select-field'
import { usePortalContext } from '@/stores/portal-context'
import type { PortalStudent } from '@/types/student-portal'

export function GuardianStudentPicker({ children }: { children: PortalStudent[] }) {
  const activeStudentId = usePortalContext((s) => s.activeStudentId)
  const setActiveStudentId = usePortalContext((s) => s.setActiveStudentId)

  useEffect(() => {
    if (children.length === 0) return
    if (!activeStudentId || !children.some((c) => c.id === activeStudentId)) {
      setActiveStudentId(children[0].id)
    }
  }, [children, activeStudentId, setActiveStudentId])

  if (children.length <= 1) return null

  return (
    <div className="max-w-xs space-y-1">
      <p className="text-xs font-medium text-muted-foreground">Paying for</p>
      <SelectField
        value={activeStudentId ?? children[0].id}
        onChange={(id) => setActiveStudentId(id)}
        aria-label="Select student"
        options={children.map((c) => ({
          value: c.id,
          label: `${c.first_name} ${c.last_name ?? ''}`.trim() + (c.roll_no ? ` · ${c.roll_no}` : ''),
        }))}
      />
    </div>
  )
}
