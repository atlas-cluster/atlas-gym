import { describe, expect, it } from 'vitest'

import { MemberDisplay } from '@/features/members'
import { Row } from '@tanstack/table-core'

// Extract the facetedFilter function for testing
// This is a copy of the function from columns.tsx
const facetedFilter = (
  row: Row<MemberDisplay>,
  _columnId: string,
  filterValues: string[]
) => {
  if (!filterValues?.length) return true
  const cellValue = row.getValue(_columnId)
  return filterValues.includes(String(cellValue))
}

// Mock a row object
const createMockRow = (value: string): Row<MemberDisplay> => {
  return {
    getValue: (_columnId: string) => value,
  } as Row<MemberDisplay>
}

describe('facetedFilter', () => {
  it('should return true when filterValues is empty', () => {
    const row = createMockRow('member')
    expect(facetedFilter(row, 'type', [])).toBe(true)
  })

  it('should return true when filterValues is undefined', () => {
    const row = createMockRow('member')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(facetedFilter(row, 'type', undefined as any)).toBe(true)
  })

  it('should return true when cell value matches one of the filter values (OR logic)', () => {
    const row = createMockRow('member')
    expect(facetedFilter(row, 'type', ['member', 'trainer'])).toBe(true)
  })

  it('should return true when cell value matches the only filter value', () => {
    const row = createMockRow('trainer')
    expect(facetedFilter(row, 'type', ['trainer'])).toBe(true)
  })

  it('should return false when cell value does not match any filter value', () => {
    const row = createMockRow('member')
    expect(facetedFilter(row, 'type', ['trainer'])).toBe(false)
  })

  it('should handle subscription filter with multiple values (OR logic)', () => {
    const row = createMockRow('Basic Plan')
    expect(
      facetedFilter(row, 'subscription', ['Basic Plan', 'Premium Plan'])
    ).toBe(true)
  })

  it('should handle subscription filter with no match', () => {
    const row = createMockRow('Basic Plan')
    expect(
      facetedFilter(row, 'subscription', ['Premium Plan', 'Elite Plan'])
    ).toBe(false)
  })
})
