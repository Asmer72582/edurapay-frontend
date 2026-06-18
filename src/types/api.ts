export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  errors: Record<string, string[]> | null
}

export interface User {
  _id?: string
  id?: string
  name: string
  email: string
  role: 'super_admin' | 'institute_admin' | 'student' | 'guardian' | 'platform_admin'
  institute_id?: string
  phone?: string
}

export interface BlogPost {
  _id?: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  categories?: string[]
  status?: string
  published_at?: string
  created_at?: string
}

export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface Institute {
  _id?: string
  id?: string
  name: string
  email?: string
  phone?: string
  status: string
  address?: { city?: string; state?: string; line1?: string; pincode?: string; postal_code?: string }
  branding?: { primary_color?: string }
  razorpay_route_account_id?: string
  razorpay_route_status?: string
  /** Basis points (300 = 3%). Set by platform admin per college. */
  platform_markup_bps?: number | null
  /** parent_extra = parent pays fee + %; college_absorb = % deducted from college settlement */
  platform_markup_mode?: 'parent_extra' | 'college_absorb' | null
}

export interface Student {
  _id?: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  status: string
  institute_id?: string
}

export interface Payment {
  _id?: string
  amount: string | number
  currency?: string
  status: string
  gateway?: string
  created_at?: string
}

export interface DashboardStats {
  institutes?: number
  students?: number
  transactions?: number
  uptime?: string
}

export interface ContactPayload {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  type?: 'contact' | 'demo' | 'support'
}
