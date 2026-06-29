import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { InstituteAdminRoute } from '@/components/auth/InstituteAdminRoute'
import { HomePage } from '@/pages/landing/HomePage'
import { SolutionsPage } from '@/pages/landing/SolutionsPage'
import { FeaturesPage } from '@/pages/landing/FeaturesPage'
import { AboutPage } from '@/pages/landing/AboutPage'
import { ContactPage } from '@/pages/landing/ContactPage'
import { SecurityPage } from '@/pages/landing/SecurityPage'
import { FaqPage } from '@/pages/landing/FaqPage'
import { BlogListPage } from '@/pages/blog/BlogListPage'
import { BlogDetailPage } from '@/pages/blog/BlogDetailPage'
import { PricingPolicyPage } from '@/pages/legal/PricingPolicyPage'
import { TermsPage } from '@/pages/legal/TermsPage'
import { PrivacyPage } from '@/pages/legal/PrivacyPage'
import { RefundPolicyPage } from '@/pages/legal/RefundPolicyPage'
import { UserDataDeletionPage } from '@/pages/legal/UserDataDeletionPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SuperAdminDashboardPage } from '@/pages/superAdmin/SuperAdminDashboardPage'
import { BlogAdminPage } from '@/pages/superAdmin/BlogAdminPage'
import { InstitutesAdminPage } from '@/pages/superAdmin/InstitutesAdminPage'
import { RouteSetupPage } from '@/pages/superAdmin/RouteSetupPage'
import { SettlementsAdminPage } from '@/pages/superAdmin/SettlementsAdminPage'
import { RevenueSimulatorPage } from '@/pages/superAdmin/RevenueSimulatorPage'
import { InstituteDashboardPage } from '@/pages/institute/InstituteDashboardPage'
import { StudentsAdminPage } from '@/pages/institute/StudentsAdminPage'
import { DefaultersPage } from '@/pages/institute/DefaultersPage'
import { PaymentsPage } from '@/pages/institute/PaymentsPage'
import { TransactionsPage } from '@/pages/institute/TransactionsPage'
import { CoursesPage } from '@/pages/institute/CoursesPage'
import { ScholarshipSchemesPage } from '@/pages/institute/ScholarshipSchemesPage'
import { InvoicesPage } from '@/pages/institute/InvoicesPage'
import { NotificationsPage } from '@/pages/institute/NotificationsPage'
import { ReportsPage } from '@/pages/institute/ReportsPage'
import { BranchesPage } from '@/pages/institute/BranchesPage'
import { SettingsPage } from '@/pages/institute/SettingsPage'
import { AuditCompliancePage } from '@/pages/institute/AuditCompliancePage'
import { StudentPortalLayout } from '@/pages/student/StudentPortalLayout'
import { StudentHomePage } from '@/pages/student/StudentHomePage'
import { StudentFeesPage } from '@/pages/student/StudentFeesPage'
import { StudentPaymentsPage } from '@/pages/student/StudentPaymentsPage'
import { StudentReceiptsPage } from '@/pages/student/StudentReceiptsPage'
import { StudentDisputesPage } from '@/pages/student/StudentDisputesPage'
import { StudentOnboardingPage } from '@/pages/public/StudentOnboardingPage'
import { PayPage } from '@/pages/public/PayPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/solutions', element: <SolutionsPage /> },
      { path: '/features', element: <FeaturesPage /> },
      { path: '/pricing', element: <PricingPolicyPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/security', element: <SecurityPage /> },
      { path: '/faq', element: <FaqPage /> },
      { path: '/blog', element: <BlogListPage /> },
      { path: '/blog/:slug', element: <BlogDetailPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/refund', element: <RefundPolicyPage /> },
      { path: '/data-deletion', element: <UserDataDeletionPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/student-onboarding/:token', element: <StudentOnboardingPage /> },
      { path: '/pay/:token', element: <PayPage /> },
      { path: '/pay/:token/checkout', element: <Navigate to=".." replace /> },
    ],
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: 'super-admin',
            element: (
              <RoleGuard roles={['super_admin', 'platform_admin']}>
                <SuperAdminDashboardPage />
              </RoleGuard>
            ),
          },
          {
            path: 'super-admin/blogs',
            element: (
              <RoleGuard roles={['super_admin', 'platform_admin']}>
                <BlogAdminPage />
              </RoleGuard>
            ),
          },
          {
            path: 'super-admin/institutes',
            element: (
              <RoleGuard roles={['super_admin', 'platform_admin']}>
                <InstitutesAdminPage />
              </RoleGuard>
            ),
          },
          {
            path: 'super-admin/route',
            element: (
              <RoleGuard roles={['super_admin', 'platform_admin']}>
                <RouteSetupPage />
              </RoleGuard>
            ),
          },
          {
            path: 'super-admin/settlements',
            element: (
              <RoleGuard roles={['super_admin', 'platform_admin']}>
                <SettlementsAdminPage />
              </RoleGuard>
            ),
          },
          {
            path: 'super-admin/revenue-simulator',
            element: (
              <RoleGuard roles={['super_admin', 'platform_admin']}>
                <RevenueSimulatorPage />
              </RoleGuard>
            ),
          },
          {
            element: <InstituteAdminRoute />,
            children: [
              { path: 'institute', element: <InstituteDashboardPage /> },
              { path: 'institute/students', element: <StudentsAdminPage /> },
              { path: 'institute/defaulters', element: <DefaultersPage /> },
              { path: 'institute/payments', element: <PaymentsPage /> },
              { path: 'institute/transactions', element: <TransactionsPage /> },
              { path: 'institute/courses', element: <CoursesPage /> },
              { path: 'institute/scholarships', element: <ScholarshipSchemesPage /> },
              { path: 'institute/invoices', element: <InvoicesPage /> },
              { path: 'institute/notifications', element: <NotificationsPage /> },
              { path: 'institute/reports', element: <ReportsPage /> },
              { path: 'institute/audit', element: <AuditCompliancePage /> },
              { path: 'institute/branches', element: <BranchesPage /> },
              { path: 'institute/settings', element: <SettingsPage /> },
            ],
          },
          {
            path: 'student',
            element: (
              <RoleGuard roles={['student', 'guardian']}>
                <StudentPortalLayout />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <StudentHomePage /> },
              { path: 'fees', element: <StudentFeesPage /> },
              { path: 'payments', element: <StudentPaymentsPage /> },
              { path: 'receipts', element: <StudentReceiptsPage /> },
              { path: 'disputes', element: <StudentDisputesPage /> },
            ],
          },
          {
            path: 'guardian',
            element: (
              <RoleGuard roles={['guardian']}>
                <StudentPortalLayout />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <StudentHomePage /> },
              { path: 'fees', element: <StudentFeesPage /> },
              { path: 'payments', element: <StudentPaymentsPage /> },
              { path: 'receipts', element: <StudentReceiptsPage /> },
              { path: 'disputes', element: <StudentDisputesPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
