import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  Landmark,
  Link2,
  Receipt,
  Shield,
  Smartphone,
  Users,
  Wallet,
  Webhook,
} from 'lucide-react'

export const instituteProblems = [
  {
    problem: 'Manual fee collection & cash handling',
    impact: 'Staff spend hours chasing payments, reconciling registers, and handling disputes with no audit trail.',
    icon: Wallet,
  },
  {
    problem: 'Spreadsheets for every batch',
    impact: 'Fee plans, defaulters, and installments live in disconnected sheets that break every admission season.',
    icon: FileSpreadsheet,
  },
  {
    problem: 'No real-time visibility',
    impact: 'Management cannot see collections, pending dues, or settlement status until month-end reports.',
    icon: BarChart3,
  },
  {
    problem: 'Student payment friction',
    impact: 'Parents call the office for links, UTRs, and receipts — overwhelming admin teams.',
    icon: Smartphone,
  },
  {
    problem: 'Settlement confusion',
    impact: 'Gateway deductions, college payouts, and platform fees are reconciled manually in Excel.',
    icon: Landmark,
  },
  {
    problem: 'Compliance & audit gaps',
    impact: 'Missing logs for who changed fees, sent links, or marked payouts create financial risk.',
    icon: Shield,
  },
]

export const platformSolutions = [
  {
    title: 'One-click payment links',
    description: 'Send fee links by SMS/email. Students pay online via UPI, cards, or netbanking — amounts reconcile automatically.',
    icon: Link2,
  },
  {
    title: 'Institute dashboard',
    description: 'Live KPIs for collections, pending dues, defaulters, and payment link status — no more end-of-month surprises.',
    icon: BarChart3,
  },
  {
    title: 'Student & guardian portal',
    description: 'Self-service fee view, online pay, receipts, and dispute tracking — fewer calls to the accounts office.',
    icon: GraduationCap,
  },
  {
    title: 'Automated settlements',
    description: 'Track college payouts, Razorpay MDR, and platform revenue with super-admin settlement controls.',
    icon: Receipt,
  },
  {
    title: 'Defaulters & reminders',
    description: 'See who has not paid this month, filter by course, and follow up before deadlines slip.',
    icon: Bell,
  },
  {
    title: 'Webhook-verified payments',
    description: 'Payment status is finalized only after gateway signature verification — never trust the browser alone.',
    icon: Webhook,
  },
]

export const howItWorks = [
  { step: '01', title: 'Onboard your institute', description: 'Register courses, fee plans, installments, and import students in bulk.' },
  { step: '02', title: 'Send payment links', description: 'Finance team sends links for tuition, bus, hostel, or exam fees in seconds.' },
  { step: '03', title: 'Students pay online', description: 'Secure checkout with instant receipts. Partial payments supported where configured.' },
  { step: '04', title: 'Reconcile & settle', description: 'Dashboard shows college received vs pending. Super-admin tracks payouts and platform revenue.' },
]

export const homeFeatures = [
  { title: 'Multi-institute SaaS', description: 'Strict tenant isolation with RBAC for super-admin, institute staff, and students.', icon: Building2 },
  { title: 'Fee plans & installments', description: 'Monthly, quarterly, or custom schedules with discounts and partial pay.', icon: CreditCard },
  { title: 'Reports & exports', description: 'Collection trends, defaulter lists, and CSV/PDF exports for auditors.', icon: BarChart3 },
  { title: 'Audit-grade logs', description: 'Immutable payment and activity trails for every sensitive action.', icon: Shield },
]

export const testimonials = [
  {
    quote: 'We cut fee follow-up calls by more than half. Parents pay from the link and receipts are automatic.',
    name: 'Dr. Priya Sharma',
    role: 'Director, Springfield Academy',
  },
  {
    quote: 'Finally one place for defaulters, settlements, and daily collections. Our accounts team saves hours every week.',
    name: 'Rahul Mehta',
    role: 'CFO, Metro Coaching Institute',
  },
  {
    quote: 'Webhook verification and settlement reports gave us the confidence to go fully digital this admission season.',
    name: 'Anita Desai',
    role: 'Administrator, Westview College',
  },
]

export type FeatureItem = { title: string; description: string; icon: LucideIcon; category?: string }

export const allFeatures: FeatureItem[] = [
  { category: 'Collections', title: 'Payment links', description: 'Send secure links for any fee type with expiry, partial pay, and reminders.', icon: Link2 },
  { category: 'Collections', title: 'Online checkout', description: 'Razorpay-powered UPI, cards, and netbanking with verified webhooks.', icon: CreditCard },
  { category: 'Collections', title: 'Public pay page', description: 'Branded checkout for students — single total, instant receipt.', icon: Wallet },
  { category: 'Students', title: 'Student management', description: 'Profiles, guardians, bulk import, search, and enrollment status.', icon: Users },
  { category: 'Students', title: 'Student portal', description: 'Fees due, payment history, receipts, and dispute raising.', icon: GraduationCap },
  { category: 'Students', title: 'Guardian access', description: 'Pay on behalf of children with linked guardian accounts.', icon: Users },
  { category: 'Finance', title: 'Institute dashboard', description: 'Collections GMV, pending payments, channel mix, and recent activity.', icon: BarChart3 },
  { category: 'Finance', title: 'Defaulters', description: 'Monthly defaulter lists with filters by course and fee period.', icon: AlertTriangle },
  { category: 'Finance', title: 'Settlements', description: 'College payout queue, Razorpay MDR, and EduraPay net revenue tracking.', icon: Landmark },
  { category: 'Finance', title: 'Invoices & receipts', description: 'PDF receipts and invoice generation with fee line items.', icon: Receipt },
  { category: 'Operations', title: 'Notifications', description: 'Payment reminders and status updates via email (SMS-ready architecture).', icon: Bell },
  { category: 'Operations', title: 'Multi-institute', description: 'Platform admin oversees all institutes with scoped data access.', icon: Building2 },
  { category: 'Operations', title: 'RBAC', description: 'Granular permissions for finance, admin, and read-only roles.', icon: Shield },
  { category: 'Operations', title: 'Reports', description: 'Exportable collection and defaulter reports for management.', icon: FileSpreadsheet },
]

export const faqItems = [
  { q: 'What types of institutes use EduraPay?', a: 'Colleges, coaching classes, training centers, sports academies, and multi-branch education groups across India.' },
  { q: 'How quickly can we go live?', a: 'Most institutes onboard in 1–2 weeks: configure fee plans, import students, connect Razorpay, and start sending payment links.' },
  { q: 'Does EduraPay support multiple institutes?', a: 'Yes. EduraPay is multi-tenant SaaS. Every record is institute-scoped with enforced tenancy and RBAC.' },
  { q: 'How are online payments verified?', a: 'Payment status is never finalized from the frontend. Only backend webhook verification with gateway signature validation updates state.' },
  { q: 'Can students pay fees online?', a: 'Yes. Students and guardians log in to view pending fees, pay online, and download receipts instantly.' },
  { q: 'How does settlement work?', a: 'Each payment creates a settlement record. Super-admin tracks college payouts (manual or Razorpay Route), MDR, and platform revenue.' },
  { q: 'What about data security?', a: 'TLS encryption, RBAC, audit logs, immutable financial records, rate limiting, and secure password hashing.' },
  { q: 'How do I get started?', a: 'Book a demo via our contact page. We help configure your institute, fee structure, and first payment campaign.' },
]

export const trustBadges = ['PCI-ready flows', 'Webhook verified', 'Institute-scoped data', 'Audit logs', '99.9% uptime target']
