import { describe, expect, it } from 'vitest'

import { courseTemplateSchema } from '@/features/courses/schemas/course-template'

const baseValid = {
  name: 'Morning Yoga',
  trainerId: '550e8400-e29b-41d4-a716-446655440000',
  weekDays: ['monday'] as const,
  startTime: '09:00',
  endTime: '10:00',
  startDate: '2025-01-01',
}

describe('courseTemplateSchema bannerImageUrl', () => {
  it('accepts a valid URL', () => {
    const result = courseTemplateSchema.safeParse({
      ...baseValid,
      bannerImageUrl: 'https://example.com/image.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('accepts an empty string', () => {
    const result = courseTemplateSchema.safeParse({
      ...baseValid,
      bannerImageUrl: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts omitted bannerImageUrl', () => {
    const result = courseTemplateSchema.safeParse(baseValid)
    expect(result.success).toBe(true)
  })

  it('rejects an invalid URL', () => {
    const result = courseTemplateSchema.safeParse({
      ...baseValid,
      bannerImageUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path.includes('bannerImageUrl'))
      ).toBe(true)
    }
  })
})
