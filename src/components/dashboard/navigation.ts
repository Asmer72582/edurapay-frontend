import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Receipt,
  Users,
  Layers,
  FileText,
  Bell,
  BarChart3,
  AlertTriangle,
  GitBranch,
  Landmark,
  Shield,
  ClipboardCheck,
  Headphones,
  Settings,
  Calculator,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: string
  roles: string[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const dashboardNav: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { to: '/app/super-admin', label: 'Super Admin', icon: LayoutDashboard, roles: ['super_admin', 'platform_admin'] },
      { to: '/app/institute', label: 'Institute', icon: LayoutDashboard, roles: ['institute_admin', 'accountant'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/app/institute/students', label: 'Students', icon: Users, roles: ['institute_admin', 'accountant'] },
      { to: '/app/institute/transactions', label: 'Transactions', icon: Receipt, badge: 'Live', roles: ['institute_admin', 'accountant'] },
      { to: '/app/institute/courses', label: 'Fee collections', icon: Layers, roles: ['institute_admin', 'accountant'] },
      { to: '/app/institute/scholarships', label: 'Scholarships', icon: GraduationCap, roles: ['institute_admin', 'accountant'] },
      { to: '/app/institute/payments', label: 'Payments', icon: CreditCard, roles: ['institute_admin', 'accountant'] },
      { to: '/app/institute/defaulters', label: 'Defaulters', icon: AlertTriangle, roles: ['institute_admin', 'accountant'] },
      { to: '/app/institute/invoices', label: 'Invoices', icon: FileText, roles: ['institute_admin', 'accountant'] },
      { to: '/app/super-admin/institutes', label: 'Institutes', icon: Building2, roles: ['super_admin', 'platform_admin'] },
      { to: '/app/super-admin/settlements', label: 'Settlements', icon: Landmark, roles: ['super_admin', 'platform_admin'] },
      { to: '/app/super-admin/revenue-simulator', label: 'Revenue simulator', icon: Calculator, badge: 'Test', roles: ['super_admin', 'platform_admin'] },
      { to: '/app/super-admin/route', label: 'Route setup', icon: GitBranch, roles: ['super_admin', 'platform_admin'] },
      { to: '/app/super-admin/blogs', label: 'Content', icon: FileText, roles: ['super_admin', 'platform_admin'] },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { to: '/app/institute/notifications', label: 'Notifications', icon: Bell, roles: ['institute_admin'] },
      { to: '/app/institute/reports', label: 'Reports', icon: BarChart3, roles: ['institute_admin', 'accountant', 'auditor'] },
      { to: '/app/institute/audit', label: 'Audit & Compliance', icon: ClipboardCheck, roles: ['institute_admin', 'accountant', 'auditor'] },
    ],
  },
  {
    title: 'Student portal',
    items: [
      { to: '/app/student', label: 'My fees', icon: CreditCard, roles: ['student'] },
      { to: '/app/guardian', label: 'Family fees', icon: Users, roles: ['guardian'] },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { to: '/app/institute/branches', label: 'Branches', icon: GitBranch, roles: ['institute_admin'] },
      { to: '/app/super-admin/access', label: 'Roles & Access', icon: Shield, roles: ['super_admin', 'platform_admin'] },
      { to: '/contact', label: 'Support', icon: Headphones, roles: ['super_admin', 'platform_admin', 'institute_admin'] },
      { to: '/app/institute/settings', label: 'Settings', icon: Settings, roles: ['institute_admin'] },
    ],
  },
]

export function getNavForRole(role?: string): NavSection[] {
  if (!role) return []
  return dashboardNav
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0)
}
