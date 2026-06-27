import { LegalDocumentLayout, legalBlocks } from './LegalDocumentLayout'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { LEGAL_ENTITY } from '@/lib/brand'

const { P, Ul, Clause } = legalBlocks

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: (
      <>
        <P>
          EduRaPay (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is operated by <LegalEntityLink />. This
          Privacy Policy explains how we collect, use, disclose, and handle personal information when you visit our
          website, request a demo, or use the EduRaPay platform as an institute administrator, staff member, student,
          or guardian.
        </P>
        <P>
          All payment processing and merchant services on EduRaPay are provided through <LegalEntityLink />. This policy
          describes our practices under the Digital Personal Data Protection Act, 2023 (India) and other relevant laws.
        </P>
      </>
    ),
  },
  {
    id: 'roles',
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
          legality, accuracy, and lawful basis of processing personal data.
        </P>
        <P>
          Students and guardians with questions about how their Institute uses their data should contact the Institute
          first. We assist Institutes in fulfilling data subject requests where we act as processor.
        </P>
      </>
    ),
  },
  {
    id: 'institute-consent',
    title: 'Institute consent and warranties',
    content: (
      <>
        <Clause>
          The Institution warrants that it has obtained all notices, permissions, consents, parental consents,
          authorisations, and lawful bases required under applicable law before providing any personal data to EduRaPay.
        </Clause>
        <Clause>
          The Institution shall be solely responsible for obtaining verifiable parental or guardian consent wherever
          required under applicable law before collecting or sharing personal data relating to children.
        </Clause>
        <Clause>
          The Institution confirms that all recipients of SMS, WhatsApp messages, emails, calls, notifications, and
          payment reminders have provided the permissions, consents, or authorisations required under applicable law.
        </Clause>
        <P>
          EduRaPay sends fee reminders and payment notifications only as directed by the Institute. The Institute is
          responsible for ensuring lawful consent and opt-out mechanisms for all recipients.
        </P>
      </>
    ),
  },
  {
    id: 'data-accuracy',
    title: 'Data accuracy',
    content: (
      <>
        <Clause>
          EduRaPay relies upon information provided by Institutions and has no obligation to independently verify the
          accuracy, completeness, legality, or authenticity of such information.
        </Clause>
        <P>
          Institutes are responsible for the quality, accuracy, and lawfulness of student, guardian, and fee data
          uploaded to the platform, including corrections and updates.
        </P>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'Information we collect',
    content: (
      <>
        <P>Depending on how you interact with EduRaPay, we may collect:</P>
        <Ul
          items={[
            'Identity and contact: name, email, phone number, institute name, role.',
            'Account data: login identifiers, OTP verification metadata, session and device information.',
            'Student and guardian records: enrollment details, course assignments, fee plans, and payment history uploaded by Institutes.',
            'Payment data: transaction amounts, status, receipts, and gateway references. Full card or UPI credentials are handled by payment partners, not stored by EduRaPay.',
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
            'Provide, operate, and maintain the EduRaPay platform on the Institute\'s instructions.',
            'Process payments, generate receipts, and support settlements through third-party providers.',
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
            'Processing on documented instructions of the Institute as data processor.',
            'Compliance with legal obligations (tax, audit, court orders, regulatory requests).',
            'Legitimate interests in securing and operating our Service, balanced against your rights.',
            'Consent where required—for example, optional marketing communications or optional cookies.',
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
            'Cloud infrastructure and communication providers (hosting, email, SMS, WhatsApp) under contractual confidentiality obligations.',
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
        <Ul
          items={[
            'Transaction and financial records may be retained for up to 8 years or such longer period as required by law.',
            'User account data may be deleted within 90 days of a valid deletion request unless retention is required by law.',
            'Institute-uploaded records are retained for the duration of the commercial relationship and as required for audit, tax, or regulatory purposes.',
          ]}
        />
        <P>
          When an Institute terminates service, we will delete or anonymize data according to this schedule and any
          written agreement, except where retention is legally required.
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
          backups. No method of transmission or storage is completely secure.
        </P>
        <Clause>
          In the event of a security incident, EduRaPay shall take commercially reasonable steps to investigate,
          mitigate, and respond to the incident. EduRaPay shall not be liable for breaches arising from Institution
          systems, user credentials, third-party providers, or circumstances beyond its reasonable control.
        </Clause>
        <P>
          Institutes should use strong credentials, limit staff access appropriately, and promptly report suspected
          unauthorized access.
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
            'Grievance redressal through our Grievance Officer below.',
          ]}
        />
        <P>
          To exercise these rights, email{' '}
          <a href="mailto:grievance@edurapay.in" className="font-medium text-violet-700 hover:underline">
            grievance@edurapay.in
          </a>
          . Institute-managed student data requests may be forwarded to the relevant Institute as Data Fiduciary.
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
          EduraPay processes student information on behalf of Institutes as a data processor. We do not knowingly
          market directly to children.
        </P>
        <Clause>
          The Institution shall be solely responsible for obtaining verifiable parental or guardian consent wherever
          required under applicable law before collecting or sharing personal data relating to children.
        </Clause>
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
          material updates will be communicated to registered Institute administrators where appropriate.
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
          In accordance with applicable Indian data protection law, you may contact our Grievance Officer:
        </P>
        <P>
          Email:{' '}
          <a href="mailto:grievance@edurapay.in" className="font-medium text-violet-700 hover:underline">
            grievance@edurapay.in
          </a>
          <br />
          Response time: within 30 days of receipt of a valid grievance.
        </P>
        <P>
          EduraPay · <LegalEntityLink /> · {LEGAL_ENTITY.addressLine} · www.edurapay.in
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
      description="How EduraPay collects, uses, and handles personal information across our website and platform."
      lastUpdated="June 19, 2026"
      sections={sections}
      relatedLink={{ to: '/terms', label: 'Read Terms and Conditions' }}
    />
  )
}
