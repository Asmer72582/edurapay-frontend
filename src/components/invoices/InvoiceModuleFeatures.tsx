import { Bell, FileCheck, FileText, History, IndianRupee, Layers, Palette, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  { title: 'Invoice templates', description: 'Multiple themes with your branding.', icon: Palette },
  { title: 'GST compliant', description: 'HSN/SAC, CGST, SGST, IGST out of the box.', icon: FileCheck },
  { title: 'Partial payments', description: 'Track installments and auto-receipts.', icon: Receipt },
  { title: 'Auto reminders', description: 'WhatsApp and email cadences.', icon: Bell },
  { title: 'Bulk export', description: 'Download CSV and PDF in one click.', icon: FileText },
  { title: 'Audit trail', description: 'Every change captured immutably.', icon: History },
] as const

export function InvoiceModuleFeatures({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-indigo-50/40 p-5', className)}>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/25">
          <IndianRupee className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-violet-600">Module preview</div>
          <h3 className="text-base font-bold text-foreground">Build invoice workflows in minutes</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Beautifully branded invoices with GST, partial payments and automated reminders.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-white/80 bg-white/70 p-3 shadow-sm">
            <f.icon className="mb-2 h-4 w-4 text-violet-600" />
            <div className="text-sm font-semibold">{f.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{f.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
