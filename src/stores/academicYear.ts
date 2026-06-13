import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** null = institute's current (latest) academic year */
interface AcademicYearState {
  selectedYear: string | null
  setSelectedYear: (year: string | null) => void
}

export const useAcademicYearStore = create<AcademicYearState>()(
  persist(
    (set) => ({
      selectedYear: null,
      setSelectedYear: (year) => set({ selectedYear: year }),
    }),
    { name: 'edurapay-academic-year' },
  ),
)
