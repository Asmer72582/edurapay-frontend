import { PageHeader } from '@/components/dashboard/PageHeader'
import { FeeReceiptsTab } from '@/components/invoices/FeeReceiptsTab'

export function InvoicesPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'Fee receipts' }]}
        title="Fee receipts"
        description="View and print fee receipts for every online payment and recorded invoice payment — generated live, no files stored."
      />
      <FeeReceiptsTab />
    </div>
  )
}
