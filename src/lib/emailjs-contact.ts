import { send } from '@emailjs/browser'

export type ContactEmailPayload = {
  name: string
  email: string
  phone?: string
  institute?: string
  message: string
  type: 'demo' | 'contact'
}

function emailJsConfig() {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() ?? ''
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() ?? ''
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() ?? ''

  return { serviceId, templateId, publicKey }
}

export function isEmailJsConfigured(): boolean {
  const { serviceId, templateId, publicKey } = emailJsConfig()
  return serviceId !== '' && templateId !== '' && publicKey !== ''
}

/**
 * Sends demo / contact enquiries via EmailJS (no backend required).
 *
 * Configure an EmailJS template with variables:
 * from_name, from_email, phone, institute, subject, message, request_type
 */
export async function sendContactEmail(payload: ContactEmailPayload): Promise<void> {
  const { serviceId, templateId, publicKey } = emailJsConfig()

  if (!isEmailJsConfigured()) {
    throw new Error(
      'EmailJS is not configured. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY.',
    )
  }

  const isDemo = payload.type === 'demo'
  const subject = isDemo ? 'Demo request — EduraPay website' : 'Contact enquiry — EduraPay website'

  const templateParams = {
    from_name: payload.name,
    from_email: payload.email,
    reply_to: payload.email,
    phone: payload.phone ?? '—',
    institute: payload.institute ?? '—',
    subject,
    message: payload.message,
    request_type: isDemo ? 'demo' : 'contact',
  }

  await send(serviceId, templateId, templateParams, { publicKey })
}
