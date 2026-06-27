import axios from 'axios'
import type { ApiEnvelope } from '@/types/api'
import { clearStoredSession, STORAGE_TOKEN } from '@/lib/session'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredSession()
    }
    return Promise.reject(error)
  },
)

export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const { data } = await api.get<ApiEnvelope<T>>(url, { params })
  return data
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await api.post<ApiEnvelope<T>>(url, body)
  return data
}

export async function apiPatch<T>(url: string, body?: unknown) {
  const { data } = await api.patch<ApiEnvelope<T>>(url, body)
  return data
}

export async function apiPut<T>(url: string, body?: unknown) {
  const { data } = await api.put<ApiEnvelope<T>>(url, body)
  return data
}

export async function apiDelete<T>(url: string) {
  const { data } = await api.delete<ApiEnvelope<T>>(url)
  return data
}

/** Download a file (CSV, etc.) with auth headers. */
export async function apiDownload(
  url: string,
  params: Record<string, string | undefined>,
  filename: string,
): Promise<void> {
  const { data, headers } = await api.get(url, {
    params,
    responseType: 'blob',
  })
  const type = (headers['content-type'] as string) || 'application/octet-stream'
  const blob = new Blob([data], { type })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
