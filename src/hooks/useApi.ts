import { useQuery, useMutation } from '@tanstack/react-query'
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api'
import { LIST_PAGE_SIZE } from '@/lib/list-pagination'
import type { BulkImportSchema } from '@/lib/student-bulk-import'
import type { BlogPost, ContactPayload, DashboardStats, Institute, Paginated, User } from '@/types/api'
import type { CollectionReportPayload } from '@/types/reports'
import type { PaymentLinkPreview } from '@/types/payment-link'

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: () => apiGet<DashboardStats>('/v1/dashboard/public-stats'),
  })
}

export function usePublicInstitutes() {
  return useQuery({
    queryKey: ['public-institutes'],
    queryFn: () => apiGet<{ institutes: Institute[] }>('/v1/institutes/public'),
  })
}

export function useBlogs(search?: string, category?: string) {
  return useQuery({
    queryKey: ['blogs', search, category],
    queryFn: () =>
      apiGet<Paginated<BlogPost>>('/v1/blogs/posts', {
        search: search || undefined,
        category: category && category !== 'all' ? category : undefined,
      }),
  })
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => apiGet<{ post: BlogPost }>(`/v1/blogs/posts/${slug}`),
    enabled: !!slug,
  })
}

export function useContact() {
  return useMutation({
    mutationFn: (payload: ContactPayload) => apiPost('/v1/contact', payload),
  })
}

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'super-admin'],
    queryFn: () => apiGet<Record<string, unknown>>('/v1/dashboard/super-admin'),
  })
}

export function useInstituteDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'institute'],
    queryFn: () => apiGet<InstituteDashboardPayload>('/v1/dashboard/institute'),
  })
}

export interface InstituteDashboardPayload {
  totals?: {
    students?: number
    active_students?: number
    new_students_this_month?: number
    pending_payments?: number
    collections_this_month?: number
    total_collections?: number
    overdue_amount?: number
    overdue_students?: number
  }
  trends?: {
    collections_pct?: number | null
    collections_direction?: 'up' | 'down'
    new_students_this_month?: number
  }
  monthly_collections?: { month: string; collections: number }[]
  weekly_collections?: { day: string; label: string; amount: number }[]
  payment_methods?: { method: string; amount_inr: number; count: number; pct: number }[]
  recent_payments?: {
    id: string
    transaction_id: string
    student_name: string
    amount: number
    status: string
    gateway?: string
    created_at?: string
  }[]
  recent_students?: {
    first_name: string
    last_name?: string
    primary_email?: string
    email?: string
    status: string
    created_at?: string
  }[]
}

export function useCurrentInstitute() {
  return useQuery({
    queryKey: ['workspace', 'institute'],
    queryFn: () => apiGet<{ institute: Institute }>('/v1/workspace/institute'),
  })
}

export function useUpdateCurrentInstitute() {
  return useMutation({
    mutationFn: (payload: Partial<Institute> & { address?: Institute['address']; branding?: Institute['branding'] }) =>
      apiPatch<{ institute: Institute }>('/v1/workspace/institute', payload),
  })
}

export interface WorkspaceBranch {
  id: string
  name: string
  city: string
  state?: string
  students: number
  active_students?: number
  staff: number
  status: string
  is_primary?: boolean
}

export function useWorkspaceBranches() {
  return useQuery({
    queryKey: ['workspace', 'branches'],
    queryFn: () =>
      apiGet<{
        branches: WorkspaceBranch[]
        totals: {
          branches: number
          active_branches: number
          setup_pending: number
          students: number
          staff: number
        }
      }>('/v1/workspace/branches'),
  })
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: () => apiGet<Record<string, unknown>>('/v1/dashboard/student'),
  })
}

export function useInstitutes() {
  return useQuery({
    queryKey: ['institutes'],
    queryFn: () => apiGet<Paginated<Institute>>('/v1/institutes'),
  })
}

export function useStudents(search?: string, page = 1, perPage = LIST_PAGE_SIZE) {
  return useQuery({
    queryKey: ['students', search, page, perPage],
    queryFn: () =>
      apiGet<Paginated<Record<string, unknown>>>('/v1/students', {
        search: search || undefined,
        page,
        per_page: perPage,
      }),
    placeholderData: (prev) => prev,
  })
}

export function useStudentStats() {
  return useQuery({
    queryKey: ['students-stats'],
    staleTime: 60_000,
    queryFn: () =>
      apiGet<{
        total_students: number
        active_students: number
        enrolled_students: number
        new_this_month: number
        active_courses: number
        students_with_fees: number
        on_time_payment_pct: number
        overdue_amount: number
        overdue_students: number
        total_installments: number
        total_fees_assigned: number
        total_fees_paid: number
        monthly_students: { v: number }[]
      }>('/v1/students/stats'),
  })
}

export function useStudentProfile(studentId?: string, courseId?: string) {
  const scopedCourseId = courseId?.trim() || undefined
  return useQuery({
    queryKey: ['students', 'profile', studentId, scopedCourseId],
    queryFn: () =>
      apiGet<Record<string, unknown>>(`/v1/students/${studentId}/profile`, {
        course_id: scopedCourseId,
      }),
    enabled: !!studentId,
  })
}

export function useAdminBlogs() {
  return useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => apiGet<Paginated<BlogPost>>('/v1/blogs/admin/posts'),
  })
}

export function useCreateBlog() {
  return useMutation({
    mutationFn: (payload: Partial<BlogPost>) => apiPost('/v1/blogs/admin/posts', payload),
  })
}

export function useCreateInstitute() {
  return useMutation({
    mutationFn: (payload: Partial<Institute>) => apiPost('/v1/institutes', payload),
  })
}

export function useUpdateInstitute() {
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Institute> & { id: string }) =>
      apiPatch<{ institute: Institute }>(`/v1/institutes/${id}`, payload),
  })
}

export function useCreateStudent() {
  return useMutation({
    mutationFn: (payload: Partial<Record<string, unknown>>) => apiPost('/v1/students', payload),
  })
}

export function useBulkImportStudents() {
  return useMutation({
    mutationFn: (payload: { students: Array<Record<string, unknown>> }) => apiPost('/v1/students/bulk', payload),
  })
}

export function useBulkImportSchema(enabled = true) {
  return useQuery({
    queryKey: ['students', 'bulk-import-schema'],
    queryFn: () => apiGet<BulkImportSchema>('/v1/students/bulk-import/schema'),
    enabled,
    staleTime: 60_000,
  })
}

export function useUpdateStudent() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => apiPatch(`/v1/students/${id}`, payload),
  })
}

export function useDeleteStudent() {
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/v1/students/${id}`),
  })
}

export function useToggleStudentCourse() {
  return useMutation({
    mutationFn: ({ id, courseId }: { id: string; courseId: string }) =>
      apiPost<{ student: Record<string, unknown>; enrolled: boolean }>(`/v1/students/${id}/courses/toggle`, {
        course_id: courseId,
      }),
  })
}

export function useGenerateStudentOnboardingLink() {
  return useMutation({
    mutationFn: (payload: { expires_in_days?: number; max_uses?: number } | Record<string, never>) =>
      apiPost('/v1/students/onboarding-link', payload),
  })
}

export function useCourses(
  search?: string,
  page = 1,
  perPage = LIST_PAGE_SIZE,
  status?: string,
) {
  return useQuery({
    queryKey: ['courses', search, page, perPage, status],
    queryFn: () =>
      apiGet<Paginated<Record<string, unknown>>>('/v1/courses', {
        search: search || undefined,
        page,
        per_page: perPage,
        status: status && status !== 'all' ? status : undefined,
      }),
    staleTime: 120_000,
    placeholderData: (prev) => prev,
  })
}

export function useCreateCourse() {
  return useMutation({
    mutationFn: (payload: Partial<Record<string, unknown>>) => apiPost('/v1/courses', payload),
  })
}

export function useUpdateCourse() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => apiPatch(`/v1/courses/${id}`, payload),
  })
}

export function useAssignCollectionToAll() {
  return useMutation({
    mutationFn: (id: string) => apiPost<{ stats: { assigned: number; already_enrolled: number } }>(`/v1/courses/${id}/assign-all`, {}),
  })
}

export function useAssignCollectionToClass() {
  return useMutation({
    mutationFn: ({ id, sourceCourseId }: { id: string; sourceCourseId: string }) =>
      apiPost<{ stats: { assigned: number; already_enrolled: number; total_matched: number } }>(
        `/v1/courses/${id}/assign-to-class`,
        { source_course_id: sourceCourseId },
      ),
  })
}

export function useUnassignCollectionFromAll() {
  return useMutation({
    mutationFn: (id: string) => apiPost<{ stats: { removed: number } }>(`/v1/courses/${id}/unassign-all`, {}),
  })
}

export function useUnassignCollectionFromClass() {
  return useMutation({
    mutationFn: ({ id, sourceCourseId }: { id: string; sourceCourseId: string }) =>
      apiPost<{ stats: { removed: number; total_matched: number } }>(`/v1/courses/${id}/unassign-from-class`, {
        source_course_id: sourceCourseId,
      }),
  })
}

export function useDuplicateCollection() {
  return useMutation({
    mutationFn: (id: string) => apiPost<{ course: Record<string, unknown> }>(`/v1/courses/${id}/duplicate`, {}),
  })
}

export function useDeleteCollection() {
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/v1/courses/${id}`),
  })
}

export function useFeePlans(filters?: { course_id?: string; grade?: string; academic_year?: string; per_page?: number }) {
  return useQuery({
    queryKey: ['fee-plans', filters?.course_id, filters?.grade, filters?.academic_year, filters?.per_page],
    queryFn: () =>
      apiGet<Paginated<Record<string, unknown>>>('/v1/fee-plans', {
        course_id: filters?.course_id || undefined,
        grade: filters?.grade || undefined,
        academic_year: filters?.academic_year || undefined,
        per_page: filters?.per_page ?? 50,
      }),
    enabled: !!filters,
  })
}

export function useUpsertFeePlan() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiPost('/v1/fee-plans/upsert', payload),
  })
}

export type AcademicYearRolloverOptions = {
  academic_years: string[]
  suggested_from: string
  suggested_to: string
  active_collections: number
}

export function useAcademicYearRolloverOptions(enabled = true) {
  return useQuery({
    queryKey: ['academic-year-rollover', 'options'],
    queryFn: () => apiGet<AcademicYearRolloverOptions>('/v1/academic-year-rollover/options'),
    enabled,
  })
}

export function useAcademicYearRolloverPreview() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiPost<Record<string, unknown>>('/v1/academic-year-rollover/preview', payload),
  })
}

export function useAcademicYearRolloverExecute() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiPost<Record<string, unknown>>('/v1/academic-year-rollover/execute', payload),
  })
}

export type ScholarshipScheme = {
  id?: string
  _id?: string
  code?: string
  name: string
  description?: string
  funded_by: 'government' | 'institute' | 'trust' | 'other'
  concession_type: 'percent_total' | 'percent_category' | 'fixed_annual'
  value: number
  category_name?: string | null
  cap_inr?: number | null
  status?: string
}

export type StudentConcession = {
  id?: string
  _id?: string
  student_id: string
  scheme_id?: string | null
  academic_year?: string
  name: string
  funded_by: string
  concession_type: string
  value: number
  category_name?: string | null
  cap_inr?: number | null
  status: 'pending' | 'active' | 'revoked'
  document_ref?: string | null
  notes?: string | null
}

export function useScholarshipSchemes(search?: string, status = 'active') {
  return useQuery({
    queryKey: ['scholarship-schemes', search, status],
    queryFn: () =>
      apiGet<Paginated<ScholarshipScheme>>('/v1/scholarship-schemes', {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        per_page: 100,
      }),
  })
}

export function useCreateScholarshipScheme() {
  return useMutation({
    mutationFn: (payload: Partial<ScholarshipScheme>) => apiPost('/v1/scholarship-schemes', payload),
  })
}

export function useUpdateScholarshipScheme() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ScholarshipScheme> }) =>
      apiPatch(`/v1/scholarship-schemes/${id}`, payload),
  })
}

export function useStudentConcessions(studentId?: string, academicYear?: string) {
  return useQuery({
    queryKey: ['student-concessions', studentId, academicYear],
    queryFn: () =>
      apiGet<Paginated<StudentConcession>>('/v1/student-concessions', {
        student_id: studentId,
        academic_year: academicYear || undefined,
        per_page: 50,
      }),
    enabled: !!studentId,
  })
}

export function useCreateStudentConcession() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiPost('/v1/student-concessions', payload),
  })
}

export function useUpdateStudentConcession() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      apiPatch(`/v1/student-concessions/${id}`, payload),
  })
}

export function useRevokeStudentConcession() {
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/v1/student-concessions/${id}`),
  })
}

export function useInvoices(search?: string, status?: string, perPage = 50) {
  return useQuery({
    queryKey: ['invoices', search, status, perPage],
    queryFn: () =>
      apiGet<Paginated<Record<string, unknown>>>('/v1/invoices', {
        search: search || undefined,
        status: status && status !== 'all' ? status : undefined,
        per_page: perPage,
      }),
  })
}

export function useFeeReceipts(search?: string, page = 1, perPage = LIST_PAGE_SIZE) {
  return useQuery({
    queryKey: ['fee-receipts', search, page, perPage],
    queryFn: () =>
      apiGet<Paginated<Record<string, unknown>>>('/v1/invoices/fee-receipts', {
        search: search || undefined,
        page,
        per_page: perPage,
      }),
  })
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ['invoices-stats'],
    queryFn: () =>
      apiGet<{
        total_invoices: number
        collected_amount: number
        outstanding_amount: number
        overdue_amount: number
        overdue_count: number
        due_this_week: number
        paid_count: number
        partial_count: number
      }>('/v1/invoices/stats'),
  })
}

export function useInvoiceSettings() {
  return useQuery({
    queryKey: ['invoice-settings'],
    queryFn: () => apiGet<{ settings: Record<string, unknown> }>('/v1/invoices/settings'),
  })
}

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => apiGet<{ invoice: Record<string, unknown>; payments: Record<string, unknown>[] }>(`/v1/invoices/${id}`),
    enabled: !!id,
  })
}

export function useInvoiceAudit(id?: string) {
  return useQuery({
    queryKey: ['invoices', id, 'audit'],
    queryFn: () => apiGet<{ audit_trail: Record<string, unknown>[] }>(`/v1/invoices/${id}/audit`),
    enabled: !!id,
  })
}

export type AuditFilters = {
  from?: string
  to?: string
  course_id?: string
  academic_year?: string
  student_id?: string
  auditor_notes?: string
}

export type AuditEvent = {
  id?: string
  _id?: string
  actor_user_id?: string | null
  actor_name?: string | null
  actor_role?: string | null
  institute_id?: string
  category?: string | null
  action: string
  entity: string
  entity_id?: string | null
  old_values?: Record<string, unknown> | null
  new_values?: Record<string, unknown> | null
  student_id?: string | null
  course_id?: string | null
  academic_year?: string | null
  meta?: Record<string, unknown>
  ip?: string | null
  user_agent?: string | null
  created_at?: string
}

export function useAuditEvents(filters: {
  search?: string
  entity?: string
  action?: string
  category?: string
  from?: string
  to?: string
  course_id?: string
  academic_year?: string
  student_id?: string
  actor_user_id?: string
  page?: number
  per_page?: number
}) {
  return useQuery({
    queryKey: [
      'audit',
      'events',
      filters.search,
      filters.entity,
      filters.action,
      filters.category,
      filters.from,
      filters.to,
      filters.course_id,
      filters.academic_year,
      filters.student_id,
      filters.actor_user_id,
      filters.page,
      filters.per_page,
    ],
    placeholderData: (prev) => prev,
    queryFn: () =>
      apiGet<Paginated<AuditEvent>>('/v1/audit/events', {
        search: filters.search || undefined,
        entity: filters.entity && filters.entity !== 'all' ? filters.entity : undefined,
        action: filters.action && filters.action !== 'all' ? filters.action : undefined,
        category: filters.category && filters.category !== 'all' ? filters.category : undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        course_id: filters.course_id || undefined,
        academic_year: filters.academic_year || undefined,
        student_id: filters.student_id || undefined,
        actor_user_id: filters.actor_user_id || undefined,
        page: filters.page ?? 1,
        per_page: filters.per_page ?? LIST_PAGE_SIZE,
      }),
  })
}

export function useAuditDashboard(filters: AuditFilters) {
  return useQuery({
    queryKey: ['audit', 'dashboard', filters],
    queryFn: () =>
      apiGet<import('@/types/audit').AuditDashboardPayload>('/v1/audit/dashboard', {
        from: filters.from,
        to: filters.to,
        course_id: filters.course_id,
        academic_year: filters.academic_year,
        student_id: filters.student_id,
      }),
  })
}

export function useAuditCompliance(filters: AuditFilters) {
  return useQuery({
    queryKey: ['audit', 'compliance', filters],
    queryFn: () =>
      apiGet<import('@/types/audit').CompliancePayload>('/v1/audit/compliance', {
        from: filters.from,
        to: filters.to,
        course_id: filters.course_id,
        academic_year: filters.academic_year,
        student_id: filters.student_id,
      }),
  })
}

export function useAuditReport(type: string, filters: AuditFilters, enabled = true) {
  return useQuery({
    queryKey: ['audit', 'report', type, filters],
    enabled: enabled && type !== '',
    queryFn: () =>
      apiGet<import('@/types/audit').AuditReportPayload>('/v1/audit/reports', {
        type,
        from: filters.from,
        to: filters.to,
        course_id: filters.course_id,
        academic_year: filters.academic_year,
        student_id: filters.student_id,
        auditor_notes: filters.auditor_notes,
      }),
  })
}

export function useUpdateInvoiceSettings() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiPatch('/v1/invoices/settings', payload),
  })
}

export function useCreateInvoice() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiPost('/v1/invoices', payload),
  })
}

export function useRecordInvoicePayment() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      apiPost(`/v1/invoices/${id}/payments`, payload),
  })
}

export function useSendInvoiceReminder() {
  return useMutation({
    mutationFn: (id: string) => apiPost(`/v1/invoices/${id}/remind`, {}),
  })
}

export function useFeeReminderStats() {
  return useQuery({
    queryKey: ['fee-reminders-stats'],
    queryFn: () =>
      apiGet<{
        sent_30d: number
        failed_30d: number
        skipped_30d: number
        by_channel: { email: number; sms: number; whatsapp: number }
      }>('/v1/fee-reminders/stats'),
  })
}

export function useFeeReminderLogs(perPage = 25) {
  return useQuery({
    queryKey: ['fee-reminders-logs', perPage],
    queryFn: () =>
      apiGet<Paginated<Record<string, unknown>>>('/v1/fee-reminders/logs', { per_page: perPage }),
  })
}

export function useFeeReminderSettings() {
  return useQuery({
    queryKey: ['fee-reminders-settings'],
    queryFn: () =>
      apiGet<{
        reminders: Record<string, unknown>
        channels_available: string[]
        sms_driver: string
        whatsapp_driver: string
      }>('/v1/fee-reminders/settings'),
  })
}

export function useRunFeeReminders() {
  return useMutation({
    mutationFn: (payload?: { sync?: boolean }) => apiPost('/v1/fee-reminders/run', payload ?? { sync: true }),
  })
}

export function useSendFeeReminder() {
  return useMutation({
    mutationFn: (payload: { student_id: string; installment_id?: string; channels?: string[] }) =>
      apiPost('/v1/fee-reminders/send', { ...payload, sync: true }),
  })
}

export type DefaulterRow = {
  id: string
  installment_id: string
  student_id: string
  student_name: string
  roll_no: string
  email: string
  phone: string
  course_id: string
  collection_name: string
  period_label: string
  installment_label: string
  due_date: string
  days_overdue: number
  amount_due_inr: number
  status: 'overdue' | 'due_soon' | 'outstanding'
  last_reminder_at: string | null
  last_reminder_channels: string[]
  last_payment_link_at: string | null
  last_payment_link_id: string | null
  last_payment_link_status: string | null
  contacted_at: string | null
  contacted_notes: string | null
}

export type DefaulterStats = {
  overdue_rows: number
  overdue_students: number
  overdue_amount_inr: number
  due_soon_rows: number
  due_soon_amount_inr: number
  contacted_7d: number
  reminders_sent_7d: number
}

export function useDefaulterStats() {
  return useQuery({
    queryKey: ['defaulters-stats'],
    queryFn: () => apiGet<DefaulterStats>('/v1/defaulters/stats'),
    staleTime: 60_000,
  })
}

export function useDefaulters(params: {
  filter?: string
  course_id?: string
  search?: string
  contacted?: string
  month?: string
  page?: number
  per_page?: number
  includeStats?: boolean
}) {
  return useQuery({
    queryKey: ['defaulters', params],
    queryFn: () =>
      apiGet<
        Paginated<DefaulterRow> & {
          stats?: DefaulterStats
        }
      >('/v1/defaulters', {
        filter: params.filter || 'overdue',
        course_id: params.course_id || undefined,
        search: params.search || undefined,
        contacted: params.contacted && params.contacted !== 'all' ? params.contacted : undefined,
        month: params.month || undefined,
        page: params.page ?? 1,
        per_page: params.per_page ?? LIST_PAGE_SIZE,
        include_stats: params.includeStats ? 1 : undefined,
      }),
    staleTime: 45_000,
    placeholderData: (prev) => prev,
  })
}

export function useMarkDefaulterContacted() {
  return useMutation({
    mutationFn: (payload: { student_id: string; installment_id: string; notes?: string }) =>
      apiPost('/v1/defaulters/mark-contacted', payload),
  })
}

export function useGenerateInvoicesFromInstallments() {
  return useMutation({
    mutationFn: (payload: { student_id: string; installment_ids?: string[] }) =>
      apiPost('/v1/invoices/generate-from-installments', payload),
  })
}

export function usePaymentLinks(
  search?: string,
  status?: string,
  page = 1,
  perPage = LIST_PAGE_SIZE,
) {
  return useQuery({
    queryKey: ['payment-links', search, status, page, perPage],
    queryFn: () =>
      apiGet<Paginated<Record<string, unknown>>>('/v1/payment-links', {
        search: search || undefined,
        status: status && status !== 'all' ? status : undefined,
        page,
        per_page: perPage,
      }),
    placeholderData: (prev) => prev,
  })
}

export function usePaymentLinkStats() {
  return useQuery({
    queryKey: ['payment-links-stats'],
    staleTime: 45_000,
    queryFn: () =>
      apiGet<{
        total_links: number
        paid_links: number
        pending_links: number
        partial_links: number
        open_links: number
        expired_links: number
        college_received_inr: number
        college_outstanding_inr: number
        student_collected_gross_inr: number
        student_outstanding_gross_inr: number
        total_links_gross_inr: number
        // legacy
        pending: number
        paid: number
        partial: number
        outstanding_links: number
        college_collected_inr: number
        college_pending_inr: number
        pending_link_value_inr: number
        total_link_value_inr: number
      }>('/v1/payment-links/stats'),
  })
}

export type InstallmentMonthRow = {
  month: string
  label: string
  due_count: number
  due_amount_inr: number
  paid_amount_inr: number
  pending_amount_inr: number
  overdue_count: number
  overdue_amount_inr: number
  collection_pct: number
  is_current: boolean
  is_past: boolean
}

export type InstallmentMonthlySummary = {
  summary: {
    this_month_count: number
    this_month_due_inr: number
    this_month_paid_inr: number
    this_month_pending_inr: number
    next_month_count: number
    next_month_due_inr: number
    next_month_pending_inr: number
    overdue_count: number
    overdue_amount_inr: number
    total_pending_count: number
    total_pending_amount_inr: number
    total_billed_amount_inr: number
    total_collected_amount_inr: number
    collection_pct: number
  }
  months: InstallmentMonthRow[]
  filters?: {
    course_id?: string
    academic_year?: string
    month?: string
  }
  filter_options?: {
    collections: { id: string; name: string }[]
    academic_years: string[]
    months: { value: string; label: string }[]
  }
}

export type InstallmentMonthlyFilters = {
  course_id?: string
  academic_year?: string
  month?: string
  months_back?: number
  months_ahead?: number
}

export function useInstallmentMonthlySummary(filters: InstallmentMonthlyFilters = {}) {
  const monthsBack = filters.months_back ?? 1
  const monthsAhead = filters.months_ahead ?? 6
  const courseId = filters.course_id ?? ''
  const academicYear = filters.academic_year ?? ''
  const month = filters.month ?? ''

  return useQuery({
    queryKey: ['installments-monthly', courseId, academicYear, month, monthsBack, monthsAhead],
    staleTime: 60_000,
    queryFn: () =>
      apiGet<InstallmentMonthlySummary>('/v1/fees/installments/monthly-summary', {
        course_id: courseId || undefined,
        academic_year: academicYear || undefined,
        month: month || undefined,
        months_back: monthsBack,
        months_ahead: monthsAhead,
      }),
  })
}

export function usePaymentLinkPreview(
  studentId: string,
  filters: {
    course_id?: string
    installment_strategy?: string
    installment_ids?: string[]
  },
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['payment-link-preview', studentId, filters],
    queryFn: () =>
      apiGet<PaymentLinkPreview>('/v1/payment-links/preview', {
        student_id: studentId,
        course_id: filters.course_id || undefined,
        installment_strategy: filters.installment_strategy || 'auto',
        installment_ids: filters.installment_ids?.length ? filters.installment_ids : undefined,
      }),
    enabled: enabled && !!studentId,
    staleTime: 15_000,
  })
}

export function useSendPaymentLinks() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiPost('/v1/payment-links/send', payload),
  })
}

export function usePaymentTransactions(
  search: string,
  status: string,
  type: string,
  page = 1,
  perPage = LIST_PAGE_SIZE,
) {
  return useQuery({
    queryKey: ['payment-transactions', search, status, type, page, perPage],
    queryFn: () =>
      apiGet<Paginated<Record<string, unknown>>>('/v1/payments/transactions', {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        type: type !== 'all' ? type : undefined,
        page,
        per_page: perPage,
      }),
    placeholderData: (prev) => prev,
  })
}

export function usePaymentTransaction(id?: string) {
  return useQuery({
    queryKey: ['payment-transactions', id],
    queryFn: () => apiGet<{ transaction: Record<string, unknown> }>(`/v1/payments/transactions/${id}`),
    enabled: Boolean(id),
  })
}

export function usePaymentTransactionStats() {
  return useQuery({
    queryKey: ['payment-transactions-stats'],
    queryFn: () =>
      apiGet<{
        total_transactions: number
        completed_captures: number
        total_collected: number
        today_count: number
      }>('/v1/payments/transactions/stats'),
  })
}

export function useRouteConfig() {
  return useQuery({
    queryKey: ['platform-route-config'],
    queryFn: () => apiGet<{ route: Record<string, unknown> }>('/v1/platform/route'),
  })
}

export function useSettlementStats(instituteId?: string) {
  return useQuery({
    queryKey: ['settlements-stats', instituteId],
    queryFn: () =>
      apiGet<{ stats: Record<string, number> }>('/v1/settlements/stats', {
        institute_id: instituteId || undefined,
      }),
  })
}

export type SettlementCollegeIncome = {
  institute_id: string
  institute_name: string
  payment_count: number
  college_income_inr: number
  college_pending_inr: number
  college_paid_inr: number
  razorpay_income_inr: number
  edurapay_income_inr: number
  student_paid_gross_inr: number
  platform_markup_inr: number
}

export function useSettlementIncomeSummary() {
  return useQuery({
    queryKey: ['settlements-income-summary'],
    queryFn: () =>
      apiGet<{
        platform: Record<string, number>
        colleges: SettlementCollegeIncome[]
      }>('/v1/settlements/income-summary'),
  })
}

export function useSettlements(status: string, search: string, page = 1, instituteId?: string) {
  return useQuery({
    queryKey: ['settlements', status, search, page, instituteId],
    queryFn: () =>
      apiGet<Paginated<Record<string, unknown>>>('/v1/settlements', {
        status: status !== 'all' ? status : undefined,
        search: search || undefined,
        institute_id: instituteId || undefined,
        page,
        per_page: 20,
      }),
  })
}

export function useMarkSettlementPaid() {
  return useMutation({
    mutationFn: ({ id, payout_reference, notes }: { id: string; payout_reference: string; notes?: string }) =>
      apiPatch(`/v1/settlements/${id}/mark-paid`, { payout_reference, notes }),
  })
}

export function useCollectionReport(filters: {
  course_id?: string
  academic_year?: string
  period?: string
}) {
  return useQuery({
    queryKey: ['reports', 'collection', filters.course_id, filters.academic_year, filters.period],
    queryFn: () =>
      apiGet<CollectionReportPayload>('/v1/reports/collection-summary', {
        course_id: filters.course_id || undefined,
        academic_year: filters.academic_year || undefined,
        period: filters.period || '12m',
      }),
    staleTime: 60_000,
  })
}

export type { User }
