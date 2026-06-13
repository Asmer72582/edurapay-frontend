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
  /** When set, UPI is hidden if amount exceeds this (Razorpay UPI per-txn limit, default ₹50,000). */
  upiMaxAmountPaise?: number
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>
  onFailure?: (message: string) => void
}

const DEFAULT_UPI_MAX_PAISE = 5_000_000 // ₹50,000 — Razorpay UPI per-transaction limit

function friendlyPaymentFailureMessage(message: string, amountPaise: number, upiMaxPaise: number): string {
  const lower = message.toLowerCase()
  if (lower.includes('amount exceeds maximum') && amountPaise > upiMaxPaise) {
    return `UPI allows up to ₹${(upiMaxPaise / 100).toLocaleString('en-IN')} per transaction. Please retry with Card or Netbanking.`
  }
  return message
}

export async function openRazorpayCheckoutModal(params: OpenRazorpayCheckoutParams): Promise<void> {
  await loadRazorpayCheckoutScript()

  if (!window.Razorpay) {
    params.onFailure?.('Razorpay checkout could not be loaded.')
    return
  }

  const upiMaxPaise = params.upiMaxAmountPaise ?? DEFAULT_UPI_MAX_PAISE
  const hideUpi = params.amountPaise > upiMaxPaise

  const rzp = new window.Razorpay({
    key: params.keyId,
    amount: params.amountPaise,
    currency: params.currency,
    name: params.name,
    description: params.description,
    order_id: params.orderId,
    prefill: params.prefill ?? {},
    ...(hideUpi
      ? {
          method: {
            upi: false,
            card: true,
            netbanking: true,
            wallet: true,
          },
        }
      : {}),
    theme: { color: '#7c3aed' },
    modal: {
      ondismiss: () => params.onFailure?.('Payment cancelled'),
    },
    handler: (response: RazorpaySuccessResponse) => {
      void params.onSuccess(response)
    },
  })

  rzp.on('payment.failed', (res) => {
    const raw = res.error?.description ?? 'Payment failed'
    params.onFailure?.(friendlyPaymentFailureMessage(raw, params.amountPaise, upiMaxPaise))
  })

  rzp.open()
}
