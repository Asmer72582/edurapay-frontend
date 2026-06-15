import { toast } from 'sonner'
import { api } from '@/lib/api'
import { portalStudentHeaders } from '@/lib/portal-api'

type InstituteReceiptOptions = {
  id: string
  source?: 'gateway' | 'invoice'
}

type PortalReceiptOptions = {
  paymentId: string
  studentId?: string | null
}

function openReceiptHtml(html: string): boolean {
  const w = window.open('', '_blank')
  if (!w) {
    toast.error('Allow pop-ups to view receipt')
    return false
  }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 400)
  return true
}

/** Institute staff — live fee receipt from preview API (no stored files). */
export async function openInstituteFeeReceiptPrint({
  id,
  source = 'gateway',
}: InstituteReceiptOptions): Promise<boolean> {
  try {
    const { data } = await api.get(`/v1/invoices/fee-receipts/${id}/preview`, {
      params: { source },
    })
    const html = data?.data?.html
    if (!html || typeof html !== 'string') {
      toast.error('Could not load receipt')
      return false
    }
    return openReceiptHtml(html)
  } catch {
    toast.error('Receipt preview failed')
    return false
  }
}

/** Student portal — live HTML receipt (no stored files). */
export async function openPortalFeeReceiptPrint({
  paymentId,
  studentId,
}: PortalReceiptOptions): Promise<boolean> {
  try {
    const res = await api.get(`/v1/portal/receipts/${paymentId}`, {
      responseType: 'text',
      headers: {
        ...portalStudentHeaders(studentId),
        Accept: 'text/html',
      },
      params: studentId ? { student_id: studentId } : undefined,
    })
    const html = res.data
    if (!html || typeof html !== 'string') {
      toast.error('Could not load receipt')
      return false
    }
    return openReceiptHtml(html)
  } catch {
    toast.error('Receipt not available')
    return false
  }
}
