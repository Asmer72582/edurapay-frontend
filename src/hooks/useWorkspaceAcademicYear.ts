import { useMemo } from 'react'
import { useAcademicYearRolloverOptions } from '@/hooks/useApi'
import { defaultAcademicYear, sortAcademicYearsDesc } from '@/lib/academic-year'
import { useAcademicYearStore } from '@/stores/academicYear'

export function useWorkspaceAcademicYear(enabled = true) {
  const { data, isLoading } = useAcademicYearRolloverOptions(enabled)
  const selectedYear = useAcademicYearStore((s) => s.selectedYear)
  const setSelectedYear = useAcademicYearStore((s) => s.setSelectedYear)

  const options = data?.data
  const allYears = useMemo(
    () => sortAcademicYearsDesc(options?.academic_years ?? []),
    [options?.academic_years],
  )

  const currentYear = useMemo(() => {
    if (allYears.length > 0) return allYears[0]
    if (options?.suggested_to) return options.suggested_to
    return defaultAcademicYear()
  }, [allYears, options?.suggested_to])

  const activeYear = selectedYear ?? currentYear
  const isViewingPast = activeYear !== currentYear
  const pastYears = allYears.filter((y) => y !== currentYear)

  return {
    isLoading,
    currentYear,
    activeYear,
    isViewingPast,
    pastYears,
    allYears,
    selectedYear,
    setSelectedYear,
    selectCurrent: () => setSelectedYear(null),
    selectPast: (year: string) => setSelectedYear(year),
  }
}
