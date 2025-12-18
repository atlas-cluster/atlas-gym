import { uuid, timestamp, varchar, text, date, check, pgSchema } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { relations } from 'drizzle-orm'

// Define the gym_manager schema
export const gymManagerSchema = pgSchema('gym_manager')

// Users table
export const users = gymManagerSchema.table(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    userFirstname: varchar('user_firstname', { length: 50 }).notNull(),
    userLastname: varchar('user_lastname', { length: 50 }).notNull(),
    userMiddlename: varchar('user_middlename', { length: 50 }),
    userEmail: varchar('user_email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    userAddress: text('user_address'),
    userBirthdate: date('user_birthdate').notNull(),
    userPhone: varchar('user_phone', { length: 20 }),
  },
  (table) => ({
    validEmail: check('valid_email', sql`${table.userEmail} <> ''`),
  })
)

// Payment methods table
export const paymentMethods = gymManagerSchema.table(
  'payment_methods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    paymentType: varchar('payment_type', { length: 20 }).notNull(),
    // Credit card fields
    cardNumber: varchar('card_number', { length: 19 }),
    cardExpiry: varchar('card_expiry', { length: 7 }),
    // IBAN field
    iban: varchar('iban', { length: 34 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    validPaymentType: check(
      'valid_payment_type',
      sql`${table.paymentType} IN ('credit_card', 'iban')`
    ),
    checkCreditCardFields: check(
      'check_credit_card_fields',
      sql`(${table.paymentType} = 'credit_card' AND ${table.cardNumber} IS NOT NULL AND ${table.cardExpiry} IS NOT NULL) OR ${table.paymentType} != 'credit_card'`
    ),
    checkIbanFields: check(
      'check_iban_fields',
      sql`(${table.paymentType} = 'iban' AND ${table.iban} IS NOT NULL) OR ${table.paymentType} != 'iban'`
    ),
  })
)

// Sessions table
export const sessions = gymManagerSchema.table('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  paymentMethods: many(paymentMethods),
  sessions: many(sessions),
}))

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type PaymentMethod = typeof paymentMethods.$inferSelect
export type NewPaymentMethod = typeof paymentMethods.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
