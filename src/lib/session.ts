import type { User } from '@/types/api'

export const STORAGE_TOKEN = 'edurapay_token'
export const STORAGE_USER = 'edurapay_user'

type SessionListener = () => void
const sessionListeners = new Set<SessionListener>()

export function onSessionCleared(listener: SessionListener) {
  sessionListeners.add(listener)
  return () => sessionListeners.delete(listener)
}

export function readStoredSession(): { token: string | null; user: User | null } {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN)
    const userRaw = localStorage.getItem(STORAGE_USER)
    if (token && userRaw) {
      return { token, user: JSON.parse(userRaw) as User }
    }
  } catch {
    clearStoredSession()
  }
  return { token: null, user: null }
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_TOKEN)
  localStorage.removeItem(STORAGE_USER)
  sessionListeners.forEach((listener) => listener())
}

export function persistSession(token: string, user: User) {
  localStorage.setItem(STORAGE_TOKEN, token)
  localStorage.setItem(STORAGE_USER, JSON.stringify(user))
}
