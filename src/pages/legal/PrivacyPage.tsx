import { LegalDocumentLayout, legalBlocks } from './LegalDocumentLayout'

const { P, Ul } = legalBlocks

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: (
      <>
        <P>
          EduraPay (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy. This Privacy Policy
          explains how we collect, use, disclose, and protect personal information when you visit our website, request
          a demo, or use the EduraPay platform as an institute administrator, staff member, student, or guardian.
        </P>
        <P>
          This policy applies to data processed by EduraPay as a data fiduciary or data processor, as applicable under
          the Digital Personal Data Protection Act, 2023 (India) and other relevant laws.
        </P>
      </>
    ),
  },
  {
    id: 'roles',
    title: 'Institutes and EduraPay',
    content: (
      <>
        <P>
          When an educational institute uses EduraPay, the Institute typically determines what student and guardian
          data is collected and why (&quot;data fiduciary&quot;). EduraPay processes that data on the Institute&apos;s
          instructions to provide fee management and payment services (&quot;data processor&quot;).
        </P>
        <P>
          Students and guardians with questions about how their Institute uses their data should contact the Institute
          first. We assist Institutes in fulfilling data subject requests where we act as processor.
        </P>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'Information we collect',
    content: (
      <>
        <P>Depending on how you interact with EduraPay, we may collect:</P>
        <Ul
          items={[
            'Identity and contact: name, email, phone number, institute name, role.',
            'Account data: login identifiers, OTP verification metadata, session and device information.',
            'Student and guardian records: enrollment details, course assignments, fee plans, and payment history uploaded by Institutes.',
            'Payment data: transaction amounts, status, receipts, and gateway references. Full card or UPI credentials are handled by payment partners, not stored by EduraPay.',
            'Communications: messages you send via contact or demo forms, support tickets, and notification delivery logs.',
            'Technical data: IP address, browser type, pages visited, and error logs for security and performance.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use information',
    content: (
      <>
        <P>We use personal information to:</P>
        <Ul
          items={[
            'Provide, operate, and improve the EduraPay platform.',
            'Process payments, generate receipts, and support settlements.',
            'Send fee reminders, payment links, and service notifications authorized by the Institute.',
            'Authenticate users and enforce role-based access controls.',
            'Respond to demo requests, support inquiries, and legal obligations.',
            'Detect fraud, abuse, and security incidents.',
            'Produce aggregated analytics that do not identify individuals.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'legal-bases',
    title: 'Legal basis for processing',
    content: (
      <>
        <P>We process personal data based on one or more of the following, as applicable:</P>
        <Ul
          items={[
            'Performance of a contract with the Institute or to take steps at your request before entering a contract.',
            'Compliance with legal obligations (tax, audit, court orders, regulatory requests).',
            'Legitimate interests in securing and improving our Service, balanced against your rights.',
            'Consent where required—for example, marketing communications or optional cookies.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'How we share information',
    content: (
      <>
        <P>We do not sell personal data. We may share information with:</P>
        <Ul
          items={[
            'Payment gateways and banking partners to process transactions and settlements.',
            'Cloud infrastructure and communication providers (hosting, email, SMS) under contractual confidentiality obligations.',
            'Professional advisers where required by law or for legitimate business purposes.',
            'Law enforcement or regulators when legally compelled or to protect rights and safety.',
            'Successors in the event of a merger, acquisition, or asset sale, with notice where required.',
          ]}
        />
        <P>Institutes may export or share data with their own authorized third parties through platform features.</P>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Data retention',
    content: (
      <>
        <P>
          We retain personal data for as long as needed to provide the Service, fulfill contractual obligations, resolve
          disputes, and comply with legal and audit requirements. Financial and transaction records may be retained for
          periods required under Indian tax and accounting laws.
        </P>
        <P>
          When an Institute terminates service, we will delete or anonymize data according to our retention schedule and
          any written agreement, except where retention is legally required.
        </P>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Security measures',
    content: (
      <>
        <P>
          We implement administrative, technical, and organizational measures designed to protect personal data,
          including encryption in transit (TLS), access controls, audit logging, institute-level data isolation, and
          regular backups. No method of transmission or storage is completely secure; Institutes should use strong
          credentials and limit staff access appropriately.
        </P>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Your rights',
    content: (
      <>
        <P>Depending on applicable law, you may have the right to:</P>
        <Ul
          items={[
            'Access and obtain a copy of personal data we hold about you.',
            'Correct inaccurate or incomplete data.',
            'Request erasure where processing is no longer necessary or consent is withdrawn.',
            'Withdraw consent for processing that relies on consent.',
            'Nominate another individual to exercise rights in the event of death or incapacity, where applicable.',
            'Grievance redressal through our contact channel below.',
          ]}
        />
        <P>
          To exercise these rights, email{' '}
          <a href="mailto:support@edurapay.com" className="font-medium text-violet-700 hover:underline">
            support@edurapay.com
          </a>
          . We will respond within timelines required by law. Institute-managed student data requests may be forwarded
          to the relevant Institute.
        </P>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and similar technologies',
    content: (
      <>
        <P>
          Our website and application use cookies and local storage for essential functions such as session management,
          security, and preference storage. We do not use third-party advertising cookies on the institute dashboard.
          You can control browser cookies through your device settings; disabling essential cookies may limit
          functionality.
        </P>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children and students',
    content: (
      <>
        <P>
          EduraPay processes student information on behalf of Institutes. We do not knowingly market directly to
          children. Institutes are responsible for ensuring appropriate parental or guardian consent where required for
          processing minor students&apos; data.
        </P>
      </>
    ),
  },
  {
    id: 'international',
    title: 'International transfers',
    content: (
      <>
        <P>
          Data may be processed on servers located in India or with cloud providers that maintain data centers in other
          jurisdictions. Where data is transferred outside India, we implement appropriate safeguards consistent with
          applicable law and contractual obligations with subprocessors.
        </P>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: (
      <>
        <P>
          We may update this Privacy Policy periodically. The &quot;Last updated&quot; date at the top will change, and
          material updates will be communicated to registered Institute administrators where appropriate. We encourage
          you to review this page regularly.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact and grievance officer',
    content: (
      <>
        <P>
          For privacy questions, data requests, or grievances, contact:
        </P>
        <P>
          Email:{' '}
          <a href="mailto:support@edurapay.com" className="font-medium text-violet-700 hover:underline">
            support@edurapay.com
          </a>
          <br />
          EduraPay · Mumbai, Maharashtra, India
        </P>
        <P>
          We aim to acknowledge grievances within 72 hours and resolve them within timelines prescribed under
          applicable Indian data protection regulations.
        </P>
      </>
    ),
  },
]

export function PrivacyPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Legal"
      title="Privacy Policy"
      description="How EduraPay collects, uses, and protects personal information across our website and platform."
      lastUpdated="June 6, 2026"
      sections={sections}
      relatedLink={{ to: '/terms', label: 'Read Terms and Conditions' }}
    />
  )
}
