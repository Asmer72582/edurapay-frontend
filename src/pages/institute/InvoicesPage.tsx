import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Download, FileText, Plus, Settings2, Sparkles, Send } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TableShell, StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { InvoiceModuleFeatures } from '@/components/invoices/InvoiceModuleFeatures'
import { InvoiceConfigureModal } from '@/components/invoices/InvoiceConfigureModal'
import { InvoiceDetailPanel } from '@/components/invoices/InvoiceDetailPanel'
import { FeeReceiptsTab } from '@/components/invoices/FeeReceiptsTab'
import {
  useCreateInvoice,
  useGenerateInvoicesFromInstallments,
  useInvoices,
  useInvoiceStats,
  useSendInvoiceReminder,
  useStudents,
} from '@/hooks/useApi'
import { formatInr } from '@/lib/institute-mock'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

function toId(v: Record<string, unknown>) {
  return String(v.id ?? v._id ?? '')
}

function mapInvoiceRow(inv: Record<string, unknown>) {
  const snap = (inv.student_snapshot ?? {}) as Record<string, unknown>
  const batches = (snap.batch_names ?? []) as string[]
  return {
    id: toId(inv),
    number: String(inv.invoice_number ?? ''),
    student: String(snap.name ?? '—'),
    batch: batches.length > 0 ? batches.join(', ') : String(snap.grade ?? '—'),
    amount: Number(inv.total_amount ?? 0),
    paid: Number(inv.paid_amount ?? 0),
    balance: Number(inv.balance_due ?? 0),
    due: inv.due_at ? String(inv.due_at).slice(0, 10) : '—',
    status: String(inv.status ?? 'sent'),
  }
}

type InvoicesTab = 'invoices' | 'receipts'

export function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<InvoicesTab>('invoices')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [configureOpen, setConfigureOpen] = useState(false)
  const [showFeatures, setShowFeatures] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    student_id: '',
    description: 'Tuition fee',
    amount: '',
    due_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  })

  const qc = useQueryClient()
  const { data, isLoading } = useInvoices(search, statusFilter)
  const { data: statsData } = useInvoiceStats()
  const { data: studentsData } = useStudents('', 1, 100)
  const createInvoice = useCreateInvoice()
  const generateFromInstallments = useGenerateInvoicesFromInstallments()
  const sendReminder = useSendInvoiceReminder()

  const stats = statsData?.data
  const raw = (data?.data?.data ?? []) as Record<string, unknown>[]
  const rows = useMemo(() => raw.map(mapInvoiceRow), [raw])
  const students = (studentsData?.data?.data ?? []) as Record<string, unknown>[]

  const exportCsv = async () => {
    try {
      const res = await api.get('/v1/invoices/export', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV exported')
    } catch {
      toast.error('Export failed')
    }
  }

  const bulkPdf = async () => {
    if (rows.length === 0) {
      toast.error('No invoices to export')
      return
    }
    toast.info(`Opening print preview for ${Math.min(rows.length, 10)} invoices…`)
    for (const row of rows.slice(0, 10)) {
      const { data: res } = await api.get(`/v1/invoices/${row.id}/preview`)
      const html = res?.data?.html
      if (!html) continue
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(html)
        w.document.close()
      }
    }
  }

  const submitCreate = async () => {
    if (!createForm.student_id || !createForm.amount) {
      toast.error('Select student and amount')
      return
    }
    try {
      await createInvoice.mutateAsync({
        student_id: createForm.student_id,
        due_at: createForm.due_at,
        line_items: [
          {
            description: createForm.description,
            amount: Number(createForm.amount),
          },
        ],
      })
      toast.success('Invoice created')
      setCreateOpen(false)
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoices-stats'] })
    } catch {
      toast.error('Could not create invoice')
    }
  }

  const generateAll = async () => {
    const withStudents = students.filter((s) => {
      const ids = [...((s.course_ids as string[]) ?? [])]
      return ids.length > 0
    })
    if (withStudents.length === 0) {
      toast.error('No enrolled students found')
      return
    }
    try {
      let total = 0
      for (const s of withStudents) {
        const res = await generateFromInstallments.mutateAsync({
          student_id: toId(s),
        })
        total += Number((res.data as { count?: number })?.count ?? 0)
      }
      toast.success(`Generated ${total} invoice(s) from fee installments`)
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoices-stats'] })
    } catch {
      toast.error('Generation failed')
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'Invoices' }]}
        title="Invoices"
        description="Issue invoices, view fee receipts for every payment, and print category-wise breakdowns (tuition, exam, transport, etc.)."
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={() => setConfigureOpen(true)}>
              <Settings2 className="mr-1.5 h-4 w-4" />
              Configure
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
              <Download className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={bulkPdf}>
              <FileText className="mr-1.5 h-4 w-4" />
              Bulk PDF
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={generateAll} disabled={generateFromInstallments.isPending}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              From installments
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New invoice
            </Button>
          </>
        }
      />

      {showFeatures && (
        <div className="relative">
          <InvoiceModuleFeatures />
          <button
            type="button"
            className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowFeatures(false)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-1">
        {(
          [
            { id: 'invoices' as const, label: 'Invoices' },
            { id: 'receipts' as const, label: 'Fee receipts' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-violet-600 text-violet-700'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'receipts' ? (
        <FeeReceiptsTab />
      ) : (
        <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total invoices" value={String(stats?.total_invoices ?? 0)} trend="This term" trendUp />
        <MetricCard
          label="Collected"
          value={formatInr(stats?.collected_amount ?? 0, true)}
          trend={`${stats?.paid_count ?? 0} paid · ${stats?.partial_count ?? 0} partial`}
          trendUp={(stats?.collected_amount ?? 0) > 0}
        />
        <MetricCard
          label="Overdue amount"
          value={formatInr(stats?.overdue_amount ?? 0, true)}
          trend={`${stats?.overdue_count ?? 0} invoices`}
          trendUp={(stats?.overdue_count ?? 0) === 0}
        />
        <MetricCard
          label="Due this week"
          value={String(stats?.due_this_week ?? 0)}
          trend="Send reminders"
          trendUp={false}
        />
      </div>

      <div className={panelOpen && selectedId ? 'grid gap-6 lg:grid-cols-[1fr_380px]' : 'grid gap-6'}>
        <TableShell
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search invoices, students..."
          countLabel={`${rows.length} invoices`}
          filterSlot={
            <select
              className="h-9 rounded-xl border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All status</option>
              <option value="sent">Sent</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Invoice</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Collection</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-5">Balance</th>
                  <th className="px-5 py-3.5">Due date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                      Loading invoices…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                      No invoices yet. Configure templates, then generate from student installments or create manually.
                    </td>
                  </tr>
                ) : (
                  rows.map((inv) => {
                    const isSelected = panelOpen && selectedId === inv.id
                    return (
                      <tr
                        key={inv.id}
                        className={cn(
                          'cursor-pointer border-b border-border/40 transition-colors',
                          isSelected
                            ? 'border-l-[3px] border-l-violet-500 bg-violet-50/80'
                            : 'hover:bg-muted/20',
                        )}
                        onClick={() => {
                          setSelectedId(inv.id)
                          setPanelOpen(true)
                        }}
                      >
                        <td className="px-5 py-4 font-semibold">{inv.number}</td>
                        <td className="px-5 py-4 font-medium">{inv.student}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium">
                            {inv.batch}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold">{formatInr(inv.amount)}</td>
                        <td className="px-5 py-4 font-semibold text-rose-700">{formatInr(inv.balance)}</td>
                        <td className="px-5 py-4 text-muted-foreground">{inv.due}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={inv.status} variant={statusVariant(inv.status)} />
                        </td>
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {inv.balance > 0 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-primary"
                              onClick={async () => {
                                try {
                                  await sendReminder.mutateAsync(inv.id)
                                  toast.success('Reminder queued (email & WhatsApp)')
                                } catch {
                                  toast.error('Reminder failed')
                                }
                              }}
                            >
                              <Send className="mr-1 h-3.5 w-3.5" />
                              Remind
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Paid</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </TableShell>

        {panelOpen && selectedId && (
          <div className="hidden lg:block">
            <InvoiceDetailPanel
              invoiceId={selectedId}
              onClose={() => {
                setPanelOpen(false)
              }}
            />
          </div>
        )}
      </div>

        </>
      )}

      <InvoiceConfigureModal open={configureOpen} onClose={() => setConfigureOpen(false)} />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New invoice" description="Create a GST-compliant invoice for a student." size="md">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Student</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              value={createForm.student_id}
              onChange={(e) => setCreateForm({ ...createForm, student_id: e.target.value })}
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={toId(s)} value={toId(s)}>
                  {String(s.first_name)} {String(s.last_name ?? '')} ({String(s.roll_no ?? toId(s))})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="rounded-xl" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Taxable amount (₹)</Label>
              <Input
                type="number"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input type="date" value={createForm.due_at} onChange={(e) => setCreateForm({ ...createForm, due_at: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600" onClick={submitCreate} disabled={createInvoice.isPending}>
              Create invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
