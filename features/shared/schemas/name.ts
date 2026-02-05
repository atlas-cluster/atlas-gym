import { z } from 'zod'

const baseNameSchema = (label: string) =>
  z
    .string()
    .max(50, `${label} is too long`)
    .regex(
      /^[\p{L}\s.'-]*$/u,
      `${label} contains invalid characters (allowed: letters, spaces, dots, hyphens, apostrophes).`
    )

export const requiredNameSchema = (label: string) =>
  baseNameSchema(label).min(1, `${label} is required`)

export const optionalNameSchema = (label: string) =>
  baseNameSchema(label).nullable()
