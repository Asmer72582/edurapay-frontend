import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'
import { useInvoiceSettings, useUpdateInvoiceSettings } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

const themes = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'minimal', label: 'Minimal' },
] as const

export function InvoiceConfigureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { data } = useInvoiceSettings()
  const update = useUpdateInvoiceSettings()
  const settings = (data?.data?.settings ?? {}) as Record<string, unknown>
  const gst = (settings.gst ?? {}) as Record<string, unknown>
  const reminders = (settings.reminders ?? {}) as Record<string, unknown>

  const [form, setForm] = useState({
    template_theme: 'modern',
    primary_color: '#7c3aed',
    footer_note: '',
    gst_enabled: true,
    default_rate: '18',
    institute_gstin: '',
    institute_state: 'Maharashtra',
    hsn_sac_default: '999293',
    reminders_enabled: true,
    email_enabled: true,
    sms_enabled: true,
    whatsapp_enabled: true,
    include_payment_link: true,
    cadence: '7,3,1,0,-3',
  })

  useEffect(() => {
    if (!open) return
    setForm({
      template_theme: String(settings.template_theme ?? 'modern'),
      primary_color: String(settings.primary_color ?? '#7c3aed'),
      footer_note: String(settings.footer_note ?? ''),
      gst_enabled: gst.enabled !== false,
      default_rate: String(gst.default_rate ?? 18),
      institute_gstin: String(gst.institute_gstin ?? ''),
      institute_state: String(gst.institute_state ?? 'Maharashtra'),
      hsn_sac_default: String(gst.hsn_sac_default ?? '999293'),
      reminders_enabled: reminders.enabled !== false,
      email_enabled: reminders.email_enabled !== false,
      sms_enabled: reminders.sms_enabled !== false,
      whatsapp_enabled: reminders.whatsapp_enabled !== false,
      include_payment_link: reminders.include_payment_link !== false,
      cadence: Array.isArray(reminders.cadence_days)
        ? reminders.cadence_days.join(',')
        : '7,3,1,0,-3',
    })
  }, [open, data])

  const save = async () => {
    try {
      await update.mutateAsync({
        template_theme: form.template_theme,
        primary_color: form.primary_color,
        footer_note: form.footer_note,
        gst: {
          enabled: form.gst_enabled,
          default_rate: Number(form.default_rate),
          institute_gstin: form.institute_gstin,
          institute_state: form.institute_state,
          hsn_sac_default: form.hsn_sac_default,
        },
        reminders: {
          enabled: form.reminders_enabled,
          email_enabled: form.email_enabled,
          sms_enabled: form.sms_enabled,
          whatsapp_enabled: form.whatsapp_enabled,
          include_payment_link: form.include_payment_link,
          cadence_days: form.cadence.split(',').map((d) => Number(d.trim())).filter((n) => !Number.isNaN(n)),
        },
      })
      toast.success('Invoice & reminder settings saved')
      qc.invalidateQueries({ queryKey: ['fee-reminders-settings'] })
      onClose()
    } catch {
      toast.error('Could not save settings')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Configure invoices" description="Templates, GST, and reminder cadences for your institute." size="lg">
      <div className="space-y-6">
        <section>
          <h4 className="mb-3 text-sm font-semibold">Invoice templates</h4>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, template_theme: t.id }))}
                className={cn(
                  'rounded-xl border px-3 py-3 text-sm font-medium transition-colors',
                  form.template_theme === t.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-border hover:bg-muted/40',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Brand color</Label>
              <div className="flex gap-2">
                <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-10 w-12 rounded-lg border" />
                <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Footer note</Label>
              <Input value={form.footer_note} onChange={(e) => setForm({ ...form, footer_note: e.target.value })} className="rounded-xl" placeholder="Thank you for your payment." />
            </div>
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-sm font-semibold">GST compliant</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Institute GSTIN</Label>
              <Input value={form.institute_gstin} onChange={(e) => setForm({ ...form, institute_gstin: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Place of supply (state)</Label>
              <Input value={form.institute_state} onChange={(e) => setForm({ ...form, institute_state: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Default GST %</Label>
              <Input value={form.default_rate} onChange={(e) => setForm({ ...form, default_rate: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Default HSN/SAC</Label>
              <Input value={form.hsn_sac_default} onChange={(e) => setForm({ ...form, hsn_sac_default: e.target.value })} className="rounded-xl" />
            </div>
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-sm font-semibold">Automated fee reminders</h4>
          <p className="mb-3 text-xs text-muted-foreground">
            Sends to parents when installments match the cadence. Positive numbers = days before due,{' '}
            <span className="font-medium">0</span> = due today, negative = days overdue (e.g.{' '}
            <span className="font-mono">-3</span>).
          </p>
          <label className="mb-3 flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.reminders_enabled}
              onChange={(e) => setForm({ ...form, reminders_enabled: e.target.checked })}
            />
            Enable automated reminders
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.email_enabled} onChange={(e) => setForm({ ...form, email_enabled: e.target.checked })} />
              Email
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.sms_enabled} onChange={(e) => setForm({ ...form, sms_enabled: e.target.checked })} />
              SMS
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.whatsapp_enabled}
                onChange={(e) => setForm({ ...form, whatsapp_enabled: e.target.checked })}
              />
              WhatsApp
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.include_payment_link}
                onChange={(e) => setForm({ ...form, include_payment_link: e.target.checked })}
              />
              Include pay link
            </label>
          </div>
          <div className="mt-2 space-y-2">
            <Label>Cadence days (comma-separated)</Label>
            <Input
              value={form.cadence}
              onChange={(e) => setForm({ ...form, cadence: e.target.value })}
              className="rounded-xl"
              placeholder="7,3,1,0,-3"
            />
          </div>
        </section>

        <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
          <Button variant="outline" className="rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600" onClick={save} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save configuration'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
