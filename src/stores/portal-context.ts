import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PortalContextState {
  activeStudentId: string | null
  setActiveStudentId: (id: string | null) => void
}

export const usePortalContext = create<PortalContextState>()(
  persist(
    (set) => ({
      activeStudentId: null,
      setActiveStudentId: (id) => set({ activeStudentId: id }),
    }),
    { name: 'edurapay-portal-student' },
  ),
)
