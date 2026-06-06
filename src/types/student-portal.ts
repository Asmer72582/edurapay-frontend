export type PortalStudent = {
  id: string
  first_name: string
  last_name?: string
  roll_no?: string
  primary_email?: string
  primary_phone?: string
  guardian?: { name?: string; phone?: string; relation?: string; email?: string }
  address?: { line1?: string; city?: string; state?: string; pincode?: string }
  academic_year?: string
}

export type PortalPaymentLink = {
  id: string
  public_token: string
  status: string
  period_label: string
  student_payable_inr: number
  due_display?: string
  pay_url: string
}

export type PortalOverview = {
  role: string
  institute_name?: string
  student: PortalStudent
  children: PortalStudent[]
  totals: {
    outstanding_inr: number
    pending_links: number
    completed_payments: number
    open_disputes: number
  }
  pending_payment_links: PortalPaymentLink[]
  pending_installments: { id: string; label: string; due_date?: string; amount_inr: number; status: string }[]
  recent_payments: { id: string; amount_inr: number; status: string; receipt_number?: string; created_at?: string }[]
}

export type PortalPaymentDetail = {
  id: string
  amount_inr: number
  status: string
  gateway?: string
  gateway_payment_id?: string
  receipt_number?: string
  has_receipt?: boolean
  created_at?: string
  period_label?: string
  gst_breakdown?: {
    gst_rate_percent: number
    total_inr?: number
    gst_inclusive_inr?: number
  }
}

export type PortalDispute = {
  id: string
  payment_id: string
  reason: string
  description: string
  status: string
  created_at?: string
}
