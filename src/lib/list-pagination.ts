import type { Paginated } from '@/types/api'

/** Default page size for institute list tables (matches Laravel API default). */
export const LIST_PAGE_SIZE = 10

export type PaginationMeta = {
  items: unknown[]
  page: number
  lastPage: number
  perPage: number
  total: number
}

export function parsePaginated<T>(envelope?: { data?: Paginated<T> | null } | null): PaginationMeta & { items: T[] } {
  const block = envelope?.data
  const items = (block?.data ?? []) as T[]

  return {
    items,
    page: block?.current_page ?? 1,
    lastPage: Math.max(1, block?.last_page ?? 1),
    perPage: block?.per_page ?? LIST_PAGE_SIZE,
    total: block?.total ?? items.length,
  }
}
