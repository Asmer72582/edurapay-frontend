export type InstallmentStrategy =
  | 'auto'
  | 'next_due'
  | 'current_month'
  | 'specific_month'
  | 'all_outstanding'
  | 'overdue_only'
  | 'selected'

export type PayableInstallment = {
  id: string
  label: string
  due_date: string | null
  amount_inr: number
  paid_inr: number
  balance_inr: number
  status: string
  days_overdue: number
}

export type PaymentLinkPreview = {
  ok: boolean
  error?: string
  installments: PayableInstallment[]
  preview: {
    institute_base_inr: number
    platform_markup_inr: number
    student_payable_inr: number
    installment_ids: string[]
    period_label: string
    installment_labels: string[]
    line_items: { description: string; amount: number }[]
  } | null
}

export type PaymentLinkSendPayload = {
  mode: 'single' | 'multiple' | 'bulk'
  student_id?: string
  student_ids?: string[]
  course_id?: string
  installment_strategy?: InstallmentStrategy
  installment_ids?: string[]
  due_month?: string
  expires_in_days?: number
  custom_note?: string
  allow_partial?: boolean
  notify_email?: boolean
  notify_whatsapp?: boolean
}
