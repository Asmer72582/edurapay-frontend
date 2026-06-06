import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  Smartphone,
  Users,
} from 'lucide-react'

export type ShowcaseSlide = {
  src: string
  alt: string
  caption: string
  description: string
  /** Legacy 3D hints (hero stack only) */
  rotateY: number
  rotateX: number
  translateX: number
  translateZ: number
  scale: number
  zIndex: number
}

/** Screenshots in public/landing/showcase/ (students.png, transactions.png, …) */
export const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    src: '/landing/showcase/students.png',
    alt: 'Students page with fee progress and installments',
    caption: 'Students & installments',
    description: 'Roster, fee progress bars, and installment status in one view.',
    rotateY: -14,
    rotateX: 6,
    translateX: -120,
    translateZ: 60,
    scale: 0.92,
    zIndex: 2,
  },
  {
    src: '/landing/showcase/transactions.png',
    alt: 'Live transactions ledger',
    caption: 'Reconciliation & ledger',
    description: 'Live payment feed with filters, exports, and capture status.',
    rotateY: 0,
    rotateX: 4,
    translateX: 0,
    translateZ: 120,
    scale: 1,
    zIndex: 4,
  },
  {
    src: '/landing/showcase/fee-collections.png',
    alt: 'Fee collections and installment setup',
    caption: 'Fee collection setup',
    description: 'Create collections, fee plans, and installment schedules.',
    rotateY: 12,
    rotateX: 5,
    translateX: 100,
    translateZ: 40,
    scale: 0.9,
    zIndex: 1,
  },
  {
    src: '/landing/showcase/payment-success.png',
    alt: 'Student payment confirmation',
    caption: 'Student portal · Pay fees',
    description: 'Students pay via UPI or card and get instant confirmation.',
    rotateY: -8,
    rotateX: 8,
    translateX: -60,
    translateZ: 80,
    scale: 0.88,
    zIndex: 3,
  },
  {
    src: '/landing/showcase/fee-receipt.png',
    alt: 'Formal fee receipt with category breakdown',
    caption: 'Instant fee receipts',
    description: 'Formal receipts with category breakdown, ready to print.',
    rotateY: 10,
    rotateX: 6,
    translateX: 80,
    translateZ: 50,
    scale: 0.86,
    zIndex: 2,
  },
  {
    src: '/landing/showcase/reports.png',
    alt: 'Collection analytics and reports',
    caption: 'Collection analytics',
    description: 'Revenue trends, collection-wise charts, and month-over-month.',
    rotateY: -6,
    rotateX: 4,
    translateX: 40,
    translateZ: 100,
    scale: 0.94,
    zIndex: 3,
  },
]

export type FeatureHighlight = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  slideIndex?: number
}

export const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    id: 'fee-collection',
    title: 'Fee collection',
    description: 'Create collections, fee plans, and payment links — tuition, exam, bus, hostel & more.',
    icon: CreditCard,
    slideIndex: 2,
  },
  {
    id: 'installments',
    title: 'Installment management',
    description: 'Split fees into installments with due dates, balances, and per-student progress bars.',
    icon: CalendarClock,
    slideIndex: 0,
  },
  {
    id: 'reminders',
    title: 'Automated reminders',
    description: 'Multi-channel dunning before due dates — SMS, WhatsApp, and email sequences.',
    icon: Bell,
  },
  {
    id: 'parent-notifications',
    title: 'Parent notifications',
    description: 'Guardians get due alerts, payment confirmations, and receipt downloads in real time.',
    icon: Users,
    slideIndex: 3,
  },
  {
    id: 'student-portal',
    title: 'Student portal',
    description: 'Students pay online via UPI or card, view dues, and download receipts anytime.',
    icon: Smartphone,
    slideIndex: 3,
  },
  {
    id: 'analytics',
    title: 'Collection analytics',
    description: 'Revenue trends, collection-wise breakdowns, and month-over-month charts.',
    icon: BarChart3,
    slideIndex: 5,
  },
  {
    id: 'defaulters',
    title: 'Defaulter tracking',
    description: 'Spot overdue installments instantly with aging buckets and student-level flags.',
    icon: AlertTriangle,
    slideIndex: 0,
  },
  {
    id: 'reconciliation',
    title: 'Reconciliation reports',
    description: 'Match gateway captures to ledger entries with export-ready PDF and CSV reports.',
    icon: LayoutDashboard,
    slideIndex: 1,
  },
]

export const INSTITUTE_FAQS = [
  {
    q: 'How long does it take to go live with EduRaPay?',
    a: 'Most institutes onboard in 1–2 weeks: fee plan setup, Razorpay Route linking, student import, and a pilot collection. Our team guides you through each step.',
  },
  {
    q: 'Can we collect partial payments and installments?',
    a: 'Yes. Define installment schedules per collection, send payment links for specific dues, and track paid vs unpaid balances per student automatically.',
  },
  {
    q: 'Is GST supported on invoices and receipts?',
    a: 'Yes. Issue GST-compliant invoices with line items, generate formal fee receipts with category breakdown, and export reports for your CA.',
  },
  {
    q: 'How do settlements work with Razorpay?',
    a: 'Payments are captured via Razorpay with automatic Route splits — institute base amount and platform markup are reconciled in your settlements dashboard.',
  },
  {
    q: 'Can we manage scholarships and concessions?',
    a: 'Yes. Apply scheme-based or custom concessions per student without changing your published fee plan totals — net payable updates on installments.',
  },
]

export const PARENT_FAQS = [
  {
    q: 'How do I pay my child’s fees online?',
    a: 'Use the payment link from your institute, or log in to the student/guardian portal. Pay via UPI, debit/credit card, or net banking — confirmation is instant.',
  },
  {
    q: 'Will I get a receipt after payment?',
    a: 'Yes. A digital fee receipt with category breakdown (tuition, exam, bus, etc.) is available immediately to view, print, or download.',
  },
  {
    q: 'Can guardians pay on behalf of multiple children?',
    a: 'Guardian accounts support linked students with a child picker — pay fees for each student from one secure login.',
  },
  {
    q: 'How will I know when a fee is due?',
    a: 'EduRaPay sends reminders by SMS, WhatsApp, and email before due dates. You can also see upcoming installments in the portal.',
  },
  {
    q: 'Is online payment secure?',
    a: 'All payments go through Razorpay with bank-grade encryption. EduRaPay never stores your card or UPI PIN.',
  },
]
