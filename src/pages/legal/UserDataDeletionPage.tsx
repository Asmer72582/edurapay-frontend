import { Link } from 'react-router-dom'
import { LegalDocumentLayout, legalBlocks } from './LegalDocumentLayout'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { LEGAL_ENTITY } from '@/lib/brand'
import { Button } from '@/components/ui/button'

const { P, Ul } = legalBlocks

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <>
        <P>
          This page explains how users of EduRaPay — operated by <LegalEntityLink /> — can request deletion of personal
          data we hold. We comply with applicable Indian law, including the Digital Personal Data Protection Act, 2023,
          and assist educational institutes that act as data fiduciaries for student and guardian information.
        </P>
        <P>
          Deleting your EduRaPay login does not automatically delete fee records held by your institute. Payment and
          compliance records may need to be retained for legal, tax, or audit purposes even after account deletion.
        </P>
      </>
    ),
  },
  {
    id: 'who-can-request',
    title: 'Who can request deletion',
    content: (
      <Ul
        items={[
          'Institute administrators and staff with an EduRaPay user account.',
          'Students and guardians who use the student portal or receive payment links.',
          'Individuals who contacted us via the website, demo form, or support channels.',
          'Users who connected a phone number or email for OTP login or WhatsApp fee reminders.',
        ]}
      />
    ),
  },
  {
    id: 'how-to-request',
    title: 'How to request deletion',
    content: (
      <>
        <P>
          <strong>Students and guardians:</strong> Contact your educational institute first. Institutes are the data
          fiduciary for enrolment and fee data. The institute may submit a deletion request to us on your behalf or
          instruct us to remove portal access and messaging contact details.
        </P>
        <P>
          <strong>Institute users and direct requests:</strong> Email{' '}
          <a href={`mailto:${LEGAL_ENTITY.email}`} className="font-medium text-violet-700 hover:underline">
            {LEGAL_ENTITY.email}
          </a>{' '}
          with the subject line &quot;Data deletion request&quot; and include:
        </P>
        <Ul
          items={[
            'Your full name and role (e.g. institute admin, student, guardian).',
            'Institute name (if applicable).',
            'Email address and/or mobile number used on EduRaPay.',
            'What you want deleted (account access, contact details, or specific data categories).',
          ]}
        />
        <Button asChild className="mt-2 rounded-xl bg-violet-600 hover:bg-violet-700">
          <a href={`mailto:${LEGAL_ENTITY.email}?subject=${encodeURIComponent('Data deletion request')}`}>
            Email deletion request
          </a>
        </Button>
      </>
    ),
  },
  {
    id: 'timeline',
    title: 'Processing timeline',
    content: (
      <>
        <P>
          We verify your identity before deleting data. User account data is typically deleted or anonymized within{' '}
          <strong>90 days</strong> of a valid request unless a longer retention period is required by law, pending
          disputes, or institute contract obligations.
        </P>
        <P>
          We will confirm by email when your request is received and when deletion is complete, where contact details
          are still valid.
        </P>
      </>
    ),
  },
  {
    id: 'what-we-delete',
    title: 'What we delete vs retain',
    content: (
      <>
        <P>We may delete or anonymize:</P>
        <Ul
          items={[
            'Login identifiers (email, phone) and authentication records where no longer required.',
            'Portal profile and notification preferences.',
            'Marketing and demo enquiry data not tied to an active institute contract.',
          ]}
        />
        <P>We may retain (as required by law or legitimate business needs):</P>
        <Ul
          items={[
            'Payment transaction records, receipts, and settlement logs.',
            'Audit logs and security incident records.',
            'Data the institute must keep for regulatory, tax, or accreditation purposes.',
            'Anonymized or aggregated analytics that cannot identify you.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'third-party',
    title: 'Third-party and Meta / WhatsApp',
    content: (
      <>
        <P>
          If you used WhatsApp or other messaging channels through EduRaPay, we process messages only as directed by
          your institute. To stop WhatsApp reminders, contact your institute or reply per their opt-out instructions.
        </P>
        <P>
          For Facebook / Meta app integrations, this page serves as our user data deletion instructions URL. Submit a
          deletion request using the email process above; we do not store Facebook profile data beyond what is needed
          for WhatsApp Business messaging configured by the institute.
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
        <P>
          See also our <Link to="/privacy" className="font-medium text-violet-700 hover:underline">Privacy Policy</Link>{' '}
          for full details on your rights and how we process personal data.
        </P>
      </>
    ),
  },
]

export function UserDataDeletionPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Legal"
      title="User Data Deletion"
      description="How to request deletion of your personal data from EduRaPay, operated by Rasvik Software Solutions Private Limited."
      lastUpdated="June 29, 2026"
      sections={sections}
      relatedLink={{ to: '/privacy', label: 'Read Privacy Policy' }}
    />
  )
}
