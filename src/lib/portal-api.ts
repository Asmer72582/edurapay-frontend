import { api } from '@/lib/api'
import type { ApiEnvelope } from '@/types/api'

export function portalStudentHeaders(studentId?: string | null) {
  if (!studentId) return {}
  return { 'X-Student-Id': studentId }
}

export async function portalGet<T>(url: string, studentId?: string | null, params?: Record<string, unknown>) {
  const { data } = await api.get<ApiEnvelope<T>>(url, {
    params: studentId ? { ...params, student_id: studentId } : params,
    headers: portalStudentHeaders(studentId),
  })
  return data
}

export async function portalPost<T>(url: string, body?: unknown, studentId?: string | null) {
  const { data } = await api.post<ApiEnvelope<T>>(url, body, {
    headers: portalStudentHeaders(studentId),
  })
  return data
}
