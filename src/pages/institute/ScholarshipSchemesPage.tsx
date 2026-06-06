import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { GraduationCap, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TableShell, StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { CATEGORY_PRESETS } from '@/components/courses/course-fee-shared'
import {
  useCreateScholarshipScheme,
  useScholarshipSchemes,
  useUpdateScholarshipScheme,
  type ScholarshipScheme,
} from '@/hooks/useApi'
import { parsePaginated } from '@/lib/list-pagination'
import { formatInr } from '@/lib/institute-mock'

function schemeId(s: ScholarshipScheme) {
  return String(s.id ?? s._id ?? '')
}

const FUNDED_BY = [
  { value: 'government', label: 'Government' },
  { value: 'institute', label: 'Institute' },
  { value: 'trust', label: 'Trust / NGO' },
  { value: 'other', label: 'Other' },
] as const

const CONCESSION_TYPES = [
  { value: 'percent_total', label: '% of total fee' },
  { value: 'percent_category', label: '% of fee category' },
  { value: 'fixed_annual', label: 'Fixed amount (annual)' },
] as const

const emptyForm = (): Partial<ScholarshipScheme> => ({
  code: '',
  name: '',
  description: '',
  funded_by: 'government',
  concession_type: 'percent_total',
  value: 0,
  category_name: '',
  cap_inr: undefined,
  status: 'active',
})

function describeScheme(s: ScholarshipScheme) {
  const type = s.concession_type
  if (type === 'fixed_annual') return formatInr(Number(s.value))
  if (type === 'percent_category') return `${s.value}% on ${s.category_name ?? 'category'}`
  return `${s.value}% of total fee`
}

export function ScholarshipSchemesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ScholarshipScheme | null>(null)
  const [form, setForm] = useState(emptyForm())

  const { data, isLoading } = useScholarshipSchemes(search, 'all')
  const createScheme = useCreateScholarshipScheme()
  const updateScheme = useUpdateScholarshipScheme()

  const schemes = useMemo(() => parsePaginated<ScholarshipScheme>(data).items, [data])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  const openEdit = (s: ScholarshipScheme) => {
    setEditing(s)
    setForm({ ...s })
    setShowForm(true)
  }

  const submit = async () => {
    if (!form.name?.trim()) {
      toast.error('Scheme name is required.')
      return
    }
    if (form.concession_type === 'percent_category' && !form.category_name?.trim()) {
      toast.error('Select a fee category for category-based concessions.')
      return
    }

    const payload: Record<string, unknown> = {
      name: form.name?.trim(),
      funded_by: form.funded_by,
      concession_type: form.concession_type,
      value: Number(form.value ?? 0),
      status: form.status ?? 'active',
    }
    const code = form.code?.trim()
    if (code) payload.code = code
    const description = form.description?.trim()
    if (description) payload.description = description
    if (form.concession_type === 'percent_category' && form.category_name?.trim()) {
      payload.category_name = form.category_name.trim()
    }
    if (form.cap_inr != null && form.cap_inr !== '' && Number(form.cap_inr) > 0) {
      payload.cap_inr = Number(form.cap_inr)
    }

    try {
      if (editing) {
        await updateScheme.mutateAsync({ id: schemeId(editing), payload })
        toast.success('Scheme updated.')
      } else {
        await createScheme.mutateAsync(payload)
        toast.success('Scheme created.')
      }
      qc.invalidateQueries({ queryKey: ['scholarship-schemes'] })
      setShowForm(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not save scheme.')
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'Scholarships & concessions' }]}
        title="Scholarships & concessions"
        description="Define government and institute schemes. Assign them to students without changing published fee plan totals."
        actions={
          <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600" onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            New scheme
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs rounded-lg"
          placeholder="Search schemes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <TableShell countLabel={`${schemes.length} scheme(s)`} searchBusy={isLoading}>
        {schemes.length === 0 && !isLoading ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No scholarship schemes yet.</p>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Scheme</th>
              <th className="px-5 py-3 font-semibold">Funded by</th>
              <th className="px-5 py-3 font-semibold">Benefit</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map((s) => {
              const active = (s.status ?? 'active') === 'active'
              return (
                <tr key={schemeId(s)} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-violet-600" />
                      <div>
                        <p className="font-medium">{s.name}</p>
                        {s.code && <p className="text-xs text-muted-foreground">{s.code}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 capitalize">{s.funded_by}</td>
                  <td className="px-5 py-4">{describeScheme(s)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      status={active ? 'Active' : 'Inactive'}
                      variant={statusVariant(active ? 'success' : 'neutral')}
                    />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </TableShell>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit scheme' : 'New scholarship scheme'}
        description="Schemes reduce what students pay online. Published fee collection totals stay unchanged."
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              onClick={submit}
              disabled={createScheme.isPending || updateScheme.isPending}
            >
              {editing ? 'Save changes' : 'Create scheme'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Name</Label>
            <Input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Code (optional)</Label>
            <Input value={form.code ?? ''} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="MH_SC_POST_MATRIC" />
          </div>
          <div className="space-y-1.5">
            <Label>Funded by</Label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={form.funded_by ?? 'government'}
              onChange={(e) => setForm({ ...form, funded_by: e.target.value as ScholarshipScheme['funded_by'] })}
            >
              {FUNDED_BY.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Concession type</Label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={form.concession_type ?? 'percent_total'}
              onChange={(e) =>
                setForm({ ...form, concession_type: e.target.value as ScholarshipScheme['concession_type'] })
              }
            >
              {CONCESSION_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{form.concession_type === 'fixed_annual' ? 'Amount (₹)' : 'Percent'}</Label>
            <Input
              type="number"
              min={0}
              value={form.value ?? 0}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            />
          </div>
          {form.concession_type === 'percent_category' && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Fee category</Label>
              <select
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={form.category_name ?? ''}
                onChange={(e) => setForm({ ...form, category_name: e.target.value })}
              >
                <option value="">Select category…</option>
                {CATEGORY_PRESETS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Annual cap (₹, optional)</Label>
            <Input
              type="number"
              min={0}
              value={form.cap_inr ?? ''}
              onChange={(e) => setForm({ ...form, cap_inr: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Input value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
