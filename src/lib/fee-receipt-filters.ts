export type FeeReceiptFilters = {
  search?: string
  class?: string
  roll_no?: string
  student?: string
  receipt?: string
  date_from?: string
  date_to?: string
  academic_year?: string
}

export const EMPTY_FEE_RECEIPT_FILTERS: FeeReceiptFilters = {
  search: '',
  class: '',
  roll_no: '',
  student: '',
  receipt: '',
  date_from: '',
  date_to: '',
  academic_year: '',
}

export function hasActiveFeeReceiptFilters(filters: FeeReceiptFilters): boolean {
  return Object.values(filters).some((value) => String(value ?? '').trim() !== '')
}

export function feeReceiptQueryParams(
  filters: FeeReceiptFilters,
  extra?: Record<string, string | number | undefined>,
): Record<string, string | number> {
  const params: Record<string, string | number> = {}

  for (const [key, value] of Object.entries(filters)) {
    const trimmed = String(value ?? '').trim()
    if (trimmed !== '') {
      params[key] = trimmed
    }
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== '') {
        params[key] = value
      }
    }
  }

  return params
}
