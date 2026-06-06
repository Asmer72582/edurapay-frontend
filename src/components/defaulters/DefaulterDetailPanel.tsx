import { Bell, CalendarDays, CheckCircle2, Copy, Link2, Mail, MessageSquare, Phone, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { StudentPaymentHistory } from '@/components/students/StudentPaymentHistory'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CourseOption } from '@/components/dashboard/StudentDataTable'
import { useStudentProfile } from '@/hooks/useApi'
import type { DefaulterRow } from '@/hooks/useApi'
import { formatInr } from '@/lib/institute-mock'
import { cn } from '@/lib/utils'

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('max-w-[58%] text-right font-medium', mono && 'font-mono text-xs')}>{value || '—'}</span>
    </div>
  )
}

function formatWhen(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusLabel(row: DefaulterRow) {
  if (row.status === 'overdue') {
    return row.days_overdue > 0 ? `${row.days_overdue} days overdue` : 'Overdue'
  }
  if (row.status === 'due_soon') return 'Due soon'
  return 'Outstanding'
}

function copyText(text: string, label: string) {
  if (!text.trim()) return
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied`)
}

export function DefaulterDetailPanel({
  row,
  coursesById,
  onClose,
  onRemind,
  onSendLink,
  onMarkContacted,
  remindPending,
}: {
  row: DefaulterRow | null
  coursesById?: Map<string, CourseOption>
  onClose: () => void
  onRemind: (row: DefaulterRow) => void
  onSendLink: (row: DefaulterRow) => void
  onMarkContacted: (row: DefaulterRow) => void
  remindPending?: boolean
}) {
  const studentId = row?.student_id
  const courseId = row?.course_id?.trim() || undefined
  const { data: profileData, isLoading: profileLoading } = useStudentProfile(studentId, courseId)

  if (!row) return null

  const profile = profileData?.data as Record<string, unknown> | undefined
  const summary = (profile?.summary ?? {}) as Record<string, unknown>
  const allInstallments = (profile?.installments ?? []) as Record<string, unknown>[]

  const statusVariantKey =
    row.status === 'overdue' ? 'overdue' : row.status === 'due_soon' ? 'pending' : 'partial'

  return (
    <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-3 overflow-y-auto pb-4">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{row.student_name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {row.collection_name}
              {row.period_label ? ` · ${row.period_label}` : ''}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={statusLabel(row)} variant={statusVariant(statusVariantKey)} />
            {row.roll_no ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {row.roll_no}
              </span>
            ) : null}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums text-rose-700">{formatInr(row.amount_due_inr, true)}</div>
            <div className="text-xs text-muted-foreground">Balance due on this installment</div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
              onClick={() => onRemind(row)}
              disabled={remindPending}
            >
              <Bell className="mr-1.5 h-4 w-4" />
              {remindPending ? 'Sending…' : 'Send reminder'}
            </Button>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => onSendLink(row)}>
              <Link2 className="mr-1.5 h-4 w-4" />
              Send payment link
            </Button>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => onMarkContacted(row)}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {row.contacted_at ? 'Log contact again' : 'Mark contacted'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-violet-200/60 bg-violet-50/40 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <CalendarDays className="h-4 w-4 text-violet-600" />
          <CardTitle className="text-sm">Installment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0 text-sm">
          <Row label="Collection" value={row.collection_name} />
          <Row label="Period" value={row.period_label} />
          {row.installment_label ? <Row label="Label" value={row.installment_label} /> : null}
          <Row label="Due date" value={formatWhen(row.due_date)} />
          {row.status === 'overdue' ? <Row label="Days overdue" value={String(row.days_overdue)} /> : null}
          <Row label="Status" value={statusLabel(row)} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm">Student contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0 text-sm">
          <Row label="Name" value={row.student_name} />
          <Row label="Roll no." value={row.roll_no} />
          {row.email ? (
            <button
              type="button"
              className="flex w-full justify-between gap-3 border-b border-border/40 py-2 text-left text-sm hover:text-violet-700"
              onClick={() => copyText(row.email, 'Email')}
            >
              <span className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Email
              </span>
              <span className="max-w-[58%] truncate text-right font-medium">{row.email}</span>
            </button>
          ) : (
            <Row label="Email" value="" />
          )}
          {row.phone ? (
            <button
              type="button"
              className="flex w-full justify-between gap-3 border-b border-border/40 py-2 text-left text-sm hover:text-violet-700"
              onClick={() => copyText(row.phone, 'Phone')}
            >
              <span className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </span>
              <span className="max-w-[58%] truncate text-right font-medium">{row.phone}</span>
            </button>
          ) : (
            <Row label="Phone" value="" />
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm">Follow-up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0 text-sm">
          <Row label="Last reminder" value={formatWhen(row.last_reminder_at)} />
          {row.last_reminder_channels?.length > 0 ? (
            <Row label="Channels" value={row.last_reminder_channels.join(', ')} />
          ) : null}
          <Row label="Last payment link" value={formatWhen(row.last_payment_link_at)} />
          {row.last_payment_link_status ? (
            <Row label="Link status" value={row.last_payment_link_status} />
          ) : null}
          <Row label="Staff contacted" value={formatWhen(row.contacted_at)} />
          {row.contacted_notes ? <Row label="Contact notes" value={row.contacted_notes} /> : null}
        </CardContent>
      </Card>

      {(summary.fee_status || summary.unpaid_amount != null) && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {courseId ? 'Collection fee summary' : 'Overall fee summary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 p-4 pt-0 text-sm">
            {summary.fee_status ? (
              <Row label="Student status" value={String(summary.fee_status)} />
            ) : null}
            <Row label="Total assigned" value={formatInr(Number(summary.net_payable ?? 0), true)} />
            <Row label="Paid" value={formatInr(Number(summary.paid_amount ?? 0), true)} />
            <Row label="Unpaid" value={formatInr(Number(summary.unpaid_amount ?? 0), true)} />
            {summary.overdue_amount_inr != null ? (
              <Row label="Overdue (past due)" value={formatInr(Number(summary.overdue_amount_inr), true)} />
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Installment schedule</CardTitle>
          <p className="text-xs text-muted-foreground">
            {courseId ? 'This collection only' : 'All enrolled collections'}
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <StudentPaymentHistory
            installments={allInstallments}
            isLoading={profileLoading}
            coursesById={coursesById}
            compact
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="space-y-0 p-4 text-sm">
          <Row label="Student ID" value={row.student_id} mono />
          <Row label="Installment ID" value={row.installment_id} mono />
          {row.last_payment_link_id ? <Row label="Last link ID" value={row.last_payment_link_id} mono /> : null}
          <button
            type="button"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-violet-300 hover:text-violet-700"
            onClick={() =>
              copyText(
                `${row.student_name} · ${row.collection_name} · ${row.period_label} · ${formatInr(row.amount_due_inr, true)} due`,
                'Summary',
              )
            }
          >
            <Copy className="h-3.5 w-3.5" />
            Copy row summary
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
