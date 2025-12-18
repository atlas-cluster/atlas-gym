/* eslint-disable @typescript-eslint/naming-convention */
// @ts-nocheck - node-pg-migrate has built-in types
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Set search path
  pgm.sql('SET search_path TO gym_manager')

  // Insert test user
  pgm.sql(`
    INSERT INTO users (
      user_email,
      password_hash,
      user_firstname,
      user_lastname,
      user_middlename,
      user_birthdate,
      user_address,
      user_phone
    ) VALUES (
      'admin@admin.com',
      '$2a$10$3W1fOUdvSq7DxxuqP58T1OR0AViu42IxdZtBgxNeWUXlNx0j3HfjK', -- admin
      'Demo',
      'User',
      NULL,
      '1990-01-01',
      '123 Demo Street, Atlas City',
      '+1234567890'
    )
  `)

  // Insert payment method for test user
  pgm.sql(`
    INSERT INTO payment_methods (
      user_id,
      payment_type,
      card_number,
      card_expiry
    ) VALUES (
      (SELECT id FROM users WHERE user_email = 'admin@admin.com'),
      'credit_card',
      '5469238897741608',
      '12/2025'
    )
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Set search path
  pgm.sql('SET search_path TO gym_manager')

  // Remove seed data
  pgm.sql("DELETE FROM users WHERE user_email = 'admin@admin.com'")
  // Payment methods will be cascade deleted
}
