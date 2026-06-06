export type RazorpaySuccessResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void
      on: (event: string, cb: (res: { error?: { description?: string } }) => void) => void
    }
  }
}

export function loadRazorpayCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
    document.body.appendChild(script)
  })
}

export type OpenRazorpayCheckoutParams = {
  keyId: string
  orderId: string
  amountPaise: number
  currency: string
  name: string
  description: string
  prefill?: { name?: string; email?: string; contact?: string }
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>
  onFailure?: (message: string) => void
}

export async function openRazorpayCheckoutModal(params: OpenRazorpayCheckoutParams): Promise<void> {
  await loadRazorpayCheckoutScript()

  if (!window.Razorpay) {
    params.onFailure?.('Razorpay checkout could not be loaded.')
    return
  }

  const rzp = new window.Razorpay({
    key: params.keyId,
    amount: params.amountPaise,
    currency: params.currency,
    name: params.name,
    description: params.description,
    order_id: params.orderId,
    prefill: params.prefill ?? {},
    theme: { color: '#7c3aed' },
    modal: {
      ondismiss: () => params.onFailure?.('Payment cancelled'),
    },
    handler: (response: RazorpaySuccessResponse) => {
      void params.onSuccess(response)
    },
  })

  rzp.on('payment.failed', (res) => {
    params.onFailure?.(res.error?.description ?? 'Payment failed')
  })

  rzp.open()
}
