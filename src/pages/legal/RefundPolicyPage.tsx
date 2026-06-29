import { LegalDocumentLayout, legalBlocks } from './LegalDocumentLayout'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { LEGAL_ENTITY } from '@/lib/brand'

const { P, Ul } = legalBlocks

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <>
        <P>
          This Refund Policy explains how refunds are handled for payments made through EduRaPay, a product operated by{' '}
          <LegalEntityLink />. All payment processing and merchant services on EduRaPay are provided through{' '}
          <LegalEntityLink />.
        </P>
        <P>
          EduRaPay is a fee collection platform used by educational institutes. When you pay a fee through a payment
          link or student portal, you are paying the institute that issued the invoice. <LegalEntityLink /> facilitates
          secure online payment processing on behalf of institutes via authorized payment gateways such as Razorpay.
        </P>
      </>
    ),
  },
  {
    id: 'institute-fees',
    title: 'Institute fee payments',
    content: (
      <>
        <P>
          Refunds for tuition, course, examination, or other institute fees are governed by the refund rules of the
          educational institute that collected the payment. <LegalEntityLink /> does not unilaterally approve or deny
          institute fee refunds without the institute&apos;s authorization.
        </P>
        <Ul
          items={[
            'Contact your institute first for refund eligibility, amounts, and timelines.',
            'Approved refunds are initiated by the institute through EduRaPay or the payment gateway.',
            'Refund timelines depend on the original payment method and bank or UPI processing (typically 5–10 business days).',
          ]}
        />
      </>
    ),
  },
  {
    id: 'duplicate-failed',
    title: 'Duplicate or failed transactions',
    content: (
      <>
        <P>
          If your account was debited but the payment did not complete, or if you were charged twice for the same fee,
          contact us with the transaction reference, payment date, and institute name.
        </P>
        <Ul
          items={[
            'Failed transactions are usually auto-reversed by your bank or UPI app within a few business days.',
            'Duplicate successful charges verified by our team will be refunded to the original payment method.',
            'Share proof of payment (receipt, UPI reference, or bank statement) to speed up resolution.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'platform-subscription',
    title: 'EduRaPay platform subscriptions',
    content: (
      <>
        <P>
          Institutes subscribing to EduRaPay software services may have separate commercial terms for subscription
          fees, setup charges, or add-ons as agreed in writing. Refunds for platform subscriptions, if applicable, follow
          the contract or invoice terms shared at onboarding.
        </P>
        <P>
          For questions about platform billing, email{' '}
          <a href={`mailto:${LEGAL_ENTITY.email}`} className="font-medium text-violet-700 hover:underline">
            {LEGAL_ENTITY.email}
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: 'how-to-request',
    title: 'How to request a refund',
    content: (
      <>
        <P>To request assistance with a payment or refund:</P>
        <Ul
          items={[
            `Email ${LEGAL_ENTITY.email} with your name, institute name, payment reference, and amount.`,
            'For institute fee disputes, also contact your institute administration directly.',
            'We aim to acknowledge refund inquiries within 2 business days.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <>
        <P>
          <LegalEntityLink /> · {LEGAL_ENTITY.addressLine}
          <br />
          Email:{' '}
          <a href={`mailto:${LEGAL_ENTITY.email}`} className="font-medium text-violet-700 hover:underline">
            {LEGAL_ENTITY.email}
          </a>
          <br />
          Phone:{' '}
          <a href="tel:+917558724597" className="font-medium text-violet-700 hover:underline">
            {LEGAL_ENTITY.phone}
          </a>
        </P>
      </>
    ),
  },
]

export function RefundPolicyPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Legal"
      title="Refund Policy"
      description="How refunds are handled for payments made through EduRaPay, operated by Rasvik Software Solutions Private Limited."
      lastUpdated="June 19, 2026"
      sections={sections}
      relatedLink={{ to: '/privacy', label: 'Read Privacy Policy' }}
    />
  )
}
