export type CollectionReportFilters = {
  course_id: string
  academic_year: string
  period: string
  from: string
  to: string
}

export type CollectionReportSummary = {
  collected_inr: number
  pending_inr: number
  overdue_inr: number
  total_assigned_inr: number
  collection_rate_pct: number
  overdue_ratio_pct: number
  students_with_fees: number
}

export type CollectionReportRow = {
  course_id: string
  course_name: string
  academic_year: string
  collected_inr: number
  pending_inr: number
  overdue_inr: number
  total_assigned_inr: number
  student_count: number
}

export type PeriodReportRow = {
  period_key: string
  period_label: string
  collected_inr: number
  pending_inr: number
  overdue_inr: number
  total_due_inr: number
}

export type PaymentMethodRow = {
  method: string
  amount_inr: number
  count: number
  pct: number
}

export type CollectionReportPayload = {
  filters: CollectionReportFilters
  filter_options: {
    collections: { id: string; name: string }[]
    academic_years: string[]
  }
  generated_at: string
  summary: CollectionReportSummary
  by_collection: CollectionReportRow[]
  by_period: PeriodReportRow[]
  payment_methods: PaymentMethodRow[]
}
