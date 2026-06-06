import { create } from 'zustand'
import { apiGet, apiPost } from '@/lib/api'
import { clearStoredSession, onSessionCleared, persistSession, readStoredSession, STORAGE_TOKEN } from '@/lib/session'
import type { User } from '@/types/api'

export type OtpSendResult = {
  channel: 'email' | 'sms'
  destination_masked: string
  expires_in: number
  resend_after: number
  debug_otp?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isHydrated: boolean
  isLoading: boolean
  requestOtp: (identifier: string) => Promise<OtpSendResult>
  verifyOtp: (identifier: string, code: string) => Promise<void>
  logout: () => Promise<void>
  hydrate: () => void
  clearSession: () => void
}

const initialSession = readStoredSession()

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialSession.user,
  token: initialSession.token,
  isHydrated: true,
  isLoading: false,

  hydrate: () => {
    const session = readStoredSession()
    set({ ...session, isHydrated: true })
  },

  clearSession: () => {
    clearStoredSession()
    set({ user: null, token: null })
  },

  requestOtp: async (identifier) => {
    set({ isLoading: true })
    try {
      const res = await apiPost<OtpSendResult>('/v1/auth/otp/send', { identifier })
      if (!res.data) {
        throw new Error(res.message || 'Could not send OTP')
      }
      return res.data
    } finally {
      set({ isLoading: false })
    }
  },

  verifyOtp: async (identifier, code) => {
    set({ isLoading: true })
    try {
      const res = await apiPost<{
        access_token: string
        token_type: string
        expires_in: number
        user: User
      }>('/v1/auth/otp/verify', { identifier, code })

      const token = res.data?.access_token
      const user = res.data?.user
      if (!token || !user) {
        throw new Error(res.message || 'Verification failed')
      }

      localStorage.setItem(STORAGE_TOKEN, token)
      persistSession(token, user)
      set({ token, user, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  logout: async () => {
    try {
      if (get().token) {
        await apiPost('/v1/auth/jwt/logout')
      }
    } catch {
      // ignore
    }
    get().clearSession()
  },
}))

onSessionCleared(() => {
  useAuthStore.setState({ user: null, token: null })
})

export function getDashboardPath(role?: string) {
  switch (role) {
    case 'super_admin':
    case 'platform_admin':
      return '/app/super-admin'
    case 'institute_admin':
      return '/app/institute'
    case 'student':
      return '/app/student'
    case 'guardian':
      return '/app/guardian'
    default:
      return '/login'
  }
}
