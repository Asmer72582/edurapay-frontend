export interface AuditDashboardMetrics {
  total_fees_collected_inr: number
  lifetime_fees_paid_inr: number
  pending_fees_inr: number
  overdue_payments_inr: number
  overdue_students: number
  refunds_inr: number
  refunds_count: number
  scholarships_concessions_inr: number
  scholarships_concessions_count: number
  reconciled_transactions: number
  unreconciled_transactions: number
  total_assigned_inr: number
  collection_rate_pct: number
}

export interface AuditDashboardPayload {
  institute: { id: string; name: string; email: string }
  filters: Record<string, string>
  generated_at: string
  metrics: AuditDashboardMetrics
  collection_analytics: { period: string; collected_inr: number; transaction_count: number }[]
  filter_options?: {
    collections: { id: string; name: string }[]
    academic_years: string[]
  }
}

export interface ComplianceFinding {
  code: string
  severity: 'low' | 'medium' | 'high'
  title: string
  entity: string
  entity_id: string
  student_id: string | null
  detail: string
}

export interface CompliancePayload {
  compliance_score: number
  status_by_code: Record<string, number>
  findings: ComplianceFinding[]
  summary: {
    total_findings: number
    high_severity: number
    medium_severity: number
    low_severity: number
  }
  filters: Record<string, string>
  generated_at: string
}

export interface AuditReportPayload {
  report_type: string
  institution: {
    id: string
    name: string
    email: string
    phone: string
    address?: unknown
  }
  audit_period: { from: string; to: string }
  filters: Record<string, string>
  auditor_notes: string
  digital_signature: { label: string; signed_at: string | null; name: string }
  generated_at: string
  sections: Record<string, unknown>
}

export type AuditReportType =
  | 'student_wise_fees'
  | 'class_wise_collection'
  | 'pending_fees'
  | 'refunds'
  | 'scholarships'
  | 'collections_daily'
  | 'collections_monthly'
  | 'collections_yearly'
  | 'payment_reconciliation'
  | 'financial_summary'
  | 'full_audit_pack'
