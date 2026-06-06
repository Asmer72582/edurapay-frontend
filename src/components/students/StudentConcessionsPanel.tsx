import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import {
  useCreateStudentConcession,
  useRevokeStudentConcession,
  useScholarshipSchemes,
  useStudentConcessions,
  useUpdateStudentConcession,
  type StudentConcession,
} from '@/hooks/useApi'
import { parsePaginated } from '@/lib/list-pagination'
import { formatInr } from '@/lib/institute-mock'

function rowId(c: StudentConcession) {
  return String(c.id ?? c._id ?? '')
}

export function StudentConcessionsPanel({
  studentId,
  academicYear,
}: {
  studentId: string
  academicYear?: string
}) {
  const qc = useQueryClient()
  const [showAssign, setShowAssign] = useState(false)
  const [schemeId, setSchemeId] = useState('')
  const [notes, setNotes] = useState('')
  const [approveNow, setApproveNow] = useState(true)

  const concessions = useStudentConcessions(studentId, academicYear)
  const schemes = useScholarshipSchemes('', 'active')
  const createConcession = useCreateStudentConcession()
  const updateConcession = useUpdateStudentConcession()
  const revokeConcession = useRevokeStudentConcession()

  const rows = parsePaginated<StudentConcession>(concessions.data).items
  const schemeOptions = parsePaginated(schemes.data).items

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['student-concessions', studentId] })
    qc.invalidateQueries({ queryKey: ['students'] })
    qc.invalidateQueries({ queryKey: ['students', 'profile', studentId] })
  }

  const assign = async () => {
    if (!schemeId) {
      toast.error('Select a scheme.')
      return
    }
    try {
      await createConcession.mutateAsync({
        student_id: studentId,
        scheme_id: schemeId,
        academic_year: academicYear,
        status: approveNow ? 'active' : 'pending',
        notes: notes.trim() || undefined,
      })
      toast.success(approveNow ? 'Concession approved and applied.' : 'Concession submitted for approval.')
      setShowAssign(false)
      setSchemeId('')
      setNotes('')
      refresh()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not assign concession.')
    }
  }

  const approve = async (c: StudentConcession) => {
    try {
      await updateConcession.mutateAsync({ id: rowId(c), payload: { status: 'active' } })
      toast.success('Concession approved.')
      refresh()
    } catch {
      toast.error('Could not approve concession.')
    }
  }

  const revoke = async (c: StudentConcession) => {
    if (!window.confirm(`Revoke "${c.name}"? Student payable amounts will be recalculated.`)) return
    try {
      await revokeConcession.mutateAsync(rowId(c))
      toast.success('Concession revoked.')
      refresh()
    } catch {
      toast.error('Could not revoke concession.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Government or institute concessions reduce net payable. Gross fee plans are unchanged.
        </p>
        <Button size="sm" className="rounded-lg bg-violet-600 hover:bg-violet-700" onClick={() => setShowAssign(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Assign scheme
        </Button>
      </div>

      {concessions.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading concessions…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
          No concessions assigned for this academic year.
        </p>
      ) : (
        <ul className="divide-y divide-border/40 rounded-xl border border-border/60">
          {rows.map((c) => (
            <li key={rowId(c)} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {c.funded_by} · {c.concession_type.replace(/_/g, ' ')}
                  {c.concession_type === 'fixed_annual' ? ` · ${formatInr(Number(c.value))}` : ` · ${c.value}%`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge
                  status={c.status === 'active' ? 'Active' : c.status === 'pending' ? 'Pending' : 'Revoked'}
                  variant={statusVariant(
                    c.status === 'active' ? 'success' : c.status === 'pending' ? 'warning' : 'neutral',
                  )}
                />
                {c.status === 'pending' && (
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => approve(c)}>
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                )}
                {c.status !== 'revoked' && (
                  <Button size="sm" variant="ghost" className="rounded-lg text-rose-600" onClick={() => revoke(c)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        title="Assign scholarship scheme"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAssign(false)}>
              Cancel
            </Button>
            <Button className="bg-violet-600" onClick={assign} disabled={createConcession.isPending}>
              Assign
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Scheme</Label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={schemeId}
              onChange={(e) => setSchemeId(e.target.value)}
            >
              <option value="">Select…</option>
              {schemeOptions.map((s: { id?: string; _id?: string; name: string }) => (
                <option key={String(s.id ?? s._id)} value={String(s.id ?? s._id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Income cert ref, approval memo…" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={approveNow} onChange={(e) => setApproveNow(e.target.checked)} />
            Approve immediately (apply to installments)
          </label>
        </div>
      </Modal>
    </div>
  )
}
