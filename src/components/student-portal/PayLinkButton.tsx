import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { portalPost } from '@/lib/portal-api'
import { formatInr } from '@/lib/institute-mock'
import { openRazorpayCheckoutModal } from '@/lib/razorpay-checkout'
import type { PortalPaymentLink } from '@/types/student-portal'

export function PayLinkButton({
  link,
  instituteName,
  studentId,
  onPaid,
}: {
  link: PortalPaymentLink
  instituteName: string
  studentId?: string | null
  onPaid?: () => void
}) {
  const [paying, setPaying] = useState(false)

  const pay = async () => {
    setPaying(true)
    try {
      const orderRes = await portalPost<{
        order_id: string
        amount_paise: number
        currency: string
        key_id: string
        checkout_description?: string
        prefill?: { name?: string; email?: string; contact?: string }
      }>(`/v1/portal/pay/${link.public_token}/order`, {}, studentId)

      const order = orderRes.data
      if (!order?.order_id || !order.key_id) {
        toast.error('Could not start payment.')
        return
      }

      await openRazorpayCheckoutModal({
        keyId: order.key_id,
        orderId: order.order_id,
        amountPaise: order.amount_paise,
        currency: order.currency,
        name: instituteName,
        description: order.checkout_description || link.period_label,
        prefill: order.prefill,
        onSuccess: async (response) => {
          try {
            await portalPost(`/v1/portal/pay/${link.public_token}/verify`, response, studentId)
            toast.success('Payment successful')
            onPaid?.()
          } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } }
            toast.error(axiosErr.response?.data?.message ?? 'Verification failed')
          }
        },
        onFailure: (message) => {
          if (message !== 'Payment cancelled') toast.error(message)
        },
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not start payment.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <Button
      size="sm"
      className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
      disabled={paying}
      onClick={pay}
    >
      {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ${formatInr(link.student_payable_inr)}`}
    </Button>
  )
}
