import { z } from 'zod'

export const dateSchema = (label: string) =>
  z
    .string()
    .min(1, `Please select a ${label}`)
    .regex(/^\d{4}-\d{2}-\d{2}$/, `Invalid ${label} format`)
    .refine((date) => {
      const d = new Date(date)
      return d instanceof Date && !isNaN(d.getTime())
    }, `Invalid ${label}`)

export const pastDateSchema = (label: string) =>
  dateSchema(label).refine((date) => {
    // Parse the date string as YYYY-MM-DD
    const [year, month, day] = date.split('-').map(Number)
    const selectedDate = new Date(year, month - 1, day) // month is 0-indexed
    const today = new Date()
    // Set time to midnight for comparison
    today.setHours(0, 0, 0, 0)
    return selectedDate < today
  }, `The ${label} must be in the past.`)
