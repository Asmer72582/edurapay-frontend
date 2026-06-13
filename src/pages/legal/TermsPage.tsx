import { LegalDocumentLayout, legalBlocks } from './LegalDocumentLayout'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { LEGAL_ENTITY } from '@/lib/brand'

const { P, Ul } = legalBlocks

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of terms',
    content: (
      <>
        <P>
          These Terms and Conditions (&quot;Terms&quot;) govern access to and use of the EduraPay platform, website,
          mobile experiences, APIs, and related services (collectively, the &quot;Service&quot;). EduRaPay is a product
          operated by <LegalEntityLink /> (&quot;<LegalEntityLink />&quot;, &quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;). All payment processing and merchant services on the Service are provided through{' '}
          <LegalEntityLink />.
        </P>
        <P>
          By creating an account, accessing the Service, or submitting a demo request, you agree to be bound by these
          Terms. If you are entering into these Terms on behalf of an educational institute, school, college, or other
          organization (&quot;Institute&quot;), you represent that you have authority to bind that Institute.
        </P>
        <P>
          If you do not agree to these Terms, you must not use the Service.
        </P>
      </>
    ),
  },
  {
    id: 'services',
    title: 'Description of services',
    content: (
      <>
        <P>
          EduraPay provides software for education fee management, including student records, fee plans and
          installments, payment links, online collections, reminders, receipts, reporting, audit trails, and institute
          dashboards. Payment collection may be facilitated through third-party payment gateways (such as Razorpay).
        </P>
        <P>
          EduraPay is a technology platform. We do not act as a bank, money lender, or escrow agent. Settlement of funds
          to institutes is subject to gateway rules, KYC completion, and applicable banking regulations.
        </P>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts and access',
    content: (
      <>
        <P>
          Institute administrators and authorized staff receive role-based access to the Service. You are responsible
          for safeguarding login credentials, OTP devices, and API tokens issued to your organization.
        </P>
        <Ul
          items={[
            'You must provide accurate registration information and keep it up to date.',
            'You must not share accounts across unauthorized individuals.',
            'You must notify us promptly of any suspected unauthorized access.',
            'We may suspend or terminate access for security reasons or violations of these Terms.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'institute-responsibilities',
    title: 'Institute responsibilities',
    content: (
      <>
        <P>Institutes using EduraPay are solely responsible for:</P>
        <Ul
          items={[
            'Accuracy of student data, fee structures, concessions, and invoices issued through the platform.',
            'Compliance with applicable laws, including education regulations, taxation, and consumer protection.',
            'Obtaining necessary consents from students and guardians for data processing and communications.',
            'Communications sent to students and guardians via SMS, email, or WhatsApp initiated from the platform.',
            'Reconciliation of collections with internal accounts and timely resolution of disputes with payers.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'payments',
    title: 'Payments, fees, and settlements',
    content: (
      <>
        <P>
          Online payments are processed by certified payment partners. EduraPay may apply a platform convenience fee on
          student transactions as configured for your Institute. Gateway charges, chargebacks, and refunds are handled
          according to partner policies and your agreement with EduraPay.
        </P>
        <P>
          EduraPay subscription or platform fees, if applicable, are billed as agreed in your order form or pricing
          page. Failure to pay may result in suspension of paid features after reasonable notice.
        </P>
        <P>
          We do not guarantee uninterrupted availability of payment gateways. Institutes should maintain alternative
          collection methods for critical deadlines.
        </P>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    content: (
      <>
        <P>You agree not to:</P>
        <Ul
          items={[
            'Use the Service for unlawful, fraudulent, or misleading fee collection.',
            'Upload malware, attempt unauthorized access, or interfere with platform security.',
            'Reverse engineer, scrape, or resell the Service without written consent.',
            'Misrepresent EduraPay as a regulated financial institution or guarantor of payments.',
            'Process payments unrelated to legitimate education fees without approval.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'ip',
    title: 'Intellectual property',
    content: (
      <>
        <P>
          EduraPay retains all rights in the Service, including software, branding, documentation, and designs.
          Institutes retain ownership of their data and content uploaded to the platform.
        </P>
        <P>
          You grant EduraPay a limited license to host, process, and display Institute data solely to provide and
          improve the Service, in accordance with our Privacy Policy.
        </P>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    content: (
      <>
        <P>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER
          EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </P>
        <P>
          We do not warrant that the Service will be error-free, uninterrupted, or free of security vulnerabilities.
          Institutes are responsible for verifying fee amounts, reports, and settlement statements before relying on
          them for statutory or audit purposes.
        </P>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    content: (
      <>
        <P>
          To the maximum extent permitted by law, EduraPay and its directors, employees, and partners shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits,
          data, goodwill, or business interruption arising from use of the Service.
        </P>
        <P>
          Our aggregate liability for claims relating to the Service shall not exceed the fees paid by your Institute
          to EduraPay in the twelve (12) months preceding the claim, or INR 50,000, whichever is greater, unless
          applicable law requires otherwise.
        </P>
      </>
    ),
  },
  {
    id: 'termination',
    title: 'Suspension and termination',
    content: (
      <>
        <P>
          Either party may terminate the commercial relationship as specified in your agreement or by providing written
          notice where no separate contract exists. We may suspend access immediately for security incidents, legal
          requirements, or material breach.
        </P>
        <P>
          Upon termination, you may request export of Institute data within a reasonable period, subject to legal
          retention obligations. Payment records may be retained as required for audit and regulatory compliance.
        </P>
      </>
    ),
  },
  {
    id: 'law',
    title: 'Governing law and disputes',
    content: (
      <>
        <P>
          These Terms are governed by the laws of India. Courts in Mumbai, Maharashtra shall have exclusive
          jurisdiction, subject to mandatory consumer protection or other non-waivable rights under applicable law.
        </P>
        <P>
          We encourage good-faith resolution of disputes through support@edurapay.com before formal proceedings.
        </P>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these Terms',
    content: (
      <>
        <P>
          We may update these Terms from time to time. Material changes will be communicated via the Service or email
          to registered Institute administrators. Continued use after the effective date constitutes acceptance of the
          revised Terms.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <>
        <P>
          For questions about these Terms, contact{' '}
          <a href="mailto:support@edurapay.com" className="font-medium text-violet-700 hover:underline">
            support@edurapay.com
          </a>
          .
        </P>
        <P>EduraPay · <LegalEntityLink /> · {LEGAL_ENTITY.addressLine} · www.edurapay.in</P>
      </>
    ),
  },
]

export function TermsPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Legal"
      title="Terms and Conditions"
      description="The rules that govern use of EduraPay by institutes, staff, and visitors to our website."
      lastUpdated="June 6, 2026"
      sections={sections}
      relatedLink={{ to: '/privacy', label: 'Read Privacy Policy' }}
    />
  )
}
