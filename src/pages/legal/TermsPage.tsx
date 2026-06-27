import { LegalDocumentLayout, legalBlocks } from './LegalDocumentLayout'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { LEGAL_ENTITY } from '@/lib/brand'

const { P, Ul, Clause } = legalBlocks

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
        <P>If you do not agree to these Terms, you must not use the Service.</P>
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
        <Clause>
          EduraPay is a technology platform and software service provider only. We do not act as a bank, money lender,
          escrow agent, or regulated financial institution. Settlement of funds to Institutes is subject to gateway
          rules, KYC completion, and applicable banking regulations.
        </Clause>
      </>
    ),
  },
  {
    id: 'data-fiduciary',
    title: 'Data fiduciary and processor roles',
    content: (
      <>
        <Clause>
          Institutions are the Data Fiduciary. EduRaPay is a technology service provider acting solely on instructions of
          the Institution.
        </Clause>
        <P>
          EduRaPay acts solely as a technology service provider and data processor on behalf of Institutions.
          Institutions remain the Data Fiduciary and are solely responsible for determining the purpose, means,
          legality, accuracy, and lawful basis of processing personal data under the Digital Personal Data Protection
          Act, 2023 (India) and other applicable laws.
        </P>
        <P>
          EduRaPay processes personal data only as necessary to provide the Service and in accordance with the
          Institute&apos;s instructions and our Privacy Policy.
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
            'Compliance with applicable laws, including education regulations, taxation, consumer protection, and data protection.',
            'Obtaining all notices, permissions, consents, parental consents, authorisations, and lawful bases required under applicable law before providing any personal data to EduRaPay.',
            'Obtaining verifiable parental or guardian consent wherever required under applicable law before collecting or sharing personal data relating to children.',
            'Confirming that all recipients of SMS, WhatsApp messages, emails, calls, notifications, and payment reminders have provided the permissions, consents, or authorisations required under applicable law.',
            'Communications sent to students and guardians via SMS, email, or WhatsApp initiated from the platform.',
            'Reconciliation of collections with internal accounts and timely resolution of disputes with payers.',
          ]}
        />
        <Clause>
          The Institution warrants that it has obtained all notices, permissions, consents, parental consents,
          authorisations, and lawful bases required under applicable law before providing any personal data to EduRaPay.
        </Clause>
        <Clause>
          EduRaPay relies upon information provided by Institutions and has no obligation to independently verify the
          accuracy, completeness, legality, or authenticity of such information.
        </Clause>
      </>
    ),
  },
  {
    id: 'indemnity',
    title: 'Indemnity',
    content: (
      <>
        <Clause>
          The Institution shall indemnify and hold harmless EduRaPay, its directors, officers, employees, and partners
          from all claims, complaints, penalties, investigations, proceedings, damages, costs, and liabilities arising
          from the Institution&apos;s violation of privacy laws, failure to obtain consent, unlawful processing of data,
          or misuse of the Services.
        </Clause>
        <P>
          This indemnity applies to claims brought by students, guardians, regulators, or third parties relating to data
          uploaded, communications sent, or fee collection activities conducted through the Service at the
          Institute&apos;s direction.
        </P>
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
        <Clause>
          Payment processing services are provided by independent third-party payment service providers. EduRaPay shall
          not be liable for payment failures, settlement delays, chargebacks, reversals, gateway downtime, banking
          failures, or disputes arising from payment processing.
        </Clause>
        <P>
          EduraPay subscription or platform fees, if applicable, are billed as agreed in your order form or pricing
          page. Failure to pay may result in suspension of paid features after reasonable notice.
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
            'Upload personal data without lawful basis or required consents.',
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
          operate the Service, in accordance with our Privacy Policy and your instructions.
        </P>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers and no guarantee',
    content: (
      <>
        <P>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER
          EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </P>
        <Clause>
          EduRaPay does not guarantee uninterrupted operation of the Services, successful delivery of communications,
          successful payment processing, or error-free performance.
        </Clause>
        <P>
          Institutes are responsible for verifying fee amounts, reports, and settlement statements before relying on
          them for statutory or audit purposes.
        </P>
      </>
    ),
  },
  {
    id: 'security-incidents',
    title: 'Security incidents',
    content: (
      <>
        <Clause>
          In the event of a security incident, EduRaPay shall take commercially reasonable steps to investigate,
          mitigate, and respond to the incident. EduRaPay shall not be liable for breaches arising from Institution
          systems, user credentials, third-party providers, or circumstances beyond its reasonable control.
        </Clause>
        <P>
          Institutes must promptly notify EduRaPay of any suspected compromise of Institute credentials or unauthorized
          access to Institute accounts.
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
          To the maximum extent permitted by law, EduRaPay and its directors, employees, and partners shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits,
          data, goodwill, or business interruption arising from use of the Service.
        </P>
        <Clause>
          Our aggregate liability for all claims relating to the Service shall not exceed INR 50,000 (Indian Rupees Fifty
          Thousand), unless applicable law requires otherwise.
        </Clause>
      </>
    ),
  },
  {
    id: 'termination',
    title: 'Suspension, termination, and data retention',
    content: (
      <>
        <P>
          Either party may terminate the commercial relationship as specified in your agreement or by providing written
          notice where no separate contract exists. We may suspend access immediately for security incidents, legal
          requirements, or material breach.
        </P>
        <P>
          Upon termination, you may request export of Institute data within a reasonable period, subject to legal
          retention obligations.
        </P>
        <Ul
          items={[
            'Transaction and financial records may be retained for up to 8 years or such longer period as required by law.',
            'User account data may be deleted within 90 days of a valid deletion request unless retention is required by law.',
          ]}
        />
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
          We encourage good-faith resolution of disputes through support@edurapay.in before formal proceedings.
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
    id: 'grievance',
    title: 'Grievance officer',
    content: (
      <>
        <P>
          In accordance with applicable Indian data protection law, you may contact our Grievance Officer for complaints
          relating to personal data processed by EduRaPay:
        </P>
        <P>
          Email:{' '}
          <a href="mailto:grievance@edurapay.in" className="font-medium text-violet-700 hover:underline">
            grievance@edurapay.in
          </a>
          <br />
          Response time: within 30 days of receipt of a valid grievance.
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
          For general questions about these Terms, contact{' '}
          <a href="mailto:support@edurapay.in" className="font-medium text-violet-700 hover:underline">
            support@edurapay.in
          </a>
          .
        </P>
        <P>
          EduraPay · <LegalEntityLink /> · {LEGAL_ENTITY.addressLine} · www.edurapay.in
        </P>
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
      lastUpdated="June 19, 2026"
      sections={sections}
      relatedLink={{ to: '/refund', label: 'Read Refund Policy' }}
    />
  )
}
