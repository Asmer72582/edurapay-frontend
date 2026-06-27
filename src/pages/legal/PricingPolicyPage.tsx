import { Link } from 'react-router-dom'
import { LegalDocumentLayout, legalBlocks } from './LegalDocumentLayout'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { LEGAL_ENTITY } from '@/lib/brand'
import { Button } from '@/components/ui/button'

const { P, Ul } = legalBlocks

const platformIncludes = [
  'Student and fee management dashboard',
  'Payment links, UPI, cards, and net banking collections',
  'Automated reminders, receipts, and reconciliation reports',
  'Role-based access for institute staff',
  'Onboarding and implementation support',
]

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <>
        <P>
          This Pricing Information page describes how EduRaPay fees are structured for educational institutes. EduRaPay
          is operated by <LegalEntityLink />. All payment processing and merchant services are provided through{' '}
          <LegalEntityLink />.
        </P>
        <P>
          We offer custom quotes based on institute size, branches, and collection volume — there is no single public
          price list. Contact us for a tailored proposal.
        </P>
      </>
    ),
  },
  {
    id: 'platform-subscription',
    title: 'Platform subscription',
    content: (
      <>
        <P>
          EduRaPay is offered as a subscription platform for schools, colleges, coaching centers, and training
          institutes. Subscription pricing depends on student volume, number of branches, modules required, and support
          level.
        </P>
        <P>
          Commercial terms, including any setup fees or annual subscription amounts, are shared in writing during
          onboarding and before go-live.
        </P>
        <Button asChild className="mt-2 rounded-xl bg-violet-600 hover:bg-violet-700">
          <Link to="/contact">Request a demo &amp; quote</Link>
        </Button>
      </>
    ),
  },
  {
    id: 'included',
    title: 'What is included',
    content: (
      <>
        <P>Typical platform subscriptions include:</P>
        <Ul items={platformIncludes} />
      </>
    ),
  },
  {
    id: 'payment-processing',
    title: 'Payment processing fees',
    content: (
      <>
        <P>
          Online fee collections are processed through Razorpay and other authorized payment gateways. Standard gateway
          charges (as per Razorpay&apos;s prevailing rates for UPI, cards, net banking, and wallets) apply to successful
          transactions.
        </P>
        <P>
          Any platform service fee or per-transaction charge applicable to your institute is disclosed clearly in your
          commercial agreement before go-live. Settlement timelines follow gateway and banking rules after successful KYC
          and institute configuration.
        </P>
      </>
    ),
  },
  {
    id: 'transaction-fees',
    title: 'Per-transaction fees',
    content: (
      <>
        <P>
          Some institutes may be charged a flat platform fee per successful payment transaction (for example, a fixed
          amount per fee collection). The exact rate is agreed in your institute&apos;s order form or commercial
          agreement and may vary by volume or institute type.
        </P>
        <P>
          Gateway MDR and banking charges are separate from any EduRaPay platform fee and are governed by the payment
          partner&apos;s terms.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact for pricing',
    content: (
      <>
        <P>
          For a personalized quote and implementation plan, contact <LegalEntityLink />:
        </P>
        <Ul
          items={[
            `Email: ${LEGAL_ENTITY.email}`,
            `Phone: ${LEGAL_ENTITY.phone}`,
            `${LEGAL_ENTITY.addressLine}`,
          ]}
        />
      </>
    ),
  },
]

export function PricingPolicyPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Legal"
      title="Pricing Information"
      description="How EduRaPay subscription and transaction fees work for educational institutes."
      lastUpdated="June 19, 2026"
      sections={sections}
      relatedLink={{ to: '/refund', label: 'Read Refund Policy' }}
    />
  )
}
