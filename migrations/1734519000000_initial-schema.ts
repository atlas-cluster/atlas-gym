/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create schema
  pgm.createSchema('gym_manager', { ifNotExists: true })

  // Enable CITEXT extension for case-insensitive text
  pgm.sql('CREATE EXTENSION IF NOT EXISTS citext')

  // Set search path
  pgm.sql('SET search_path TO gym_manager')

  // Create users table
  pgm.createTable(
    { schema: 'gym_manager', name: 'users' },
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
      },
      created_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('now()'),
      },
      user_firstname: {
        type: 'varchar(50)',
        notNull: true,
      },
      user_lastname: {
        type: 'varchar(50)',
        notNull: true,
      },
      user_middlename: {
        type: 'varchar(50)',
      },
      user_email: {
        type: 'citext',
        notNull: true,
        unique: true,
      },
      password_hash: {
        type: 'text',
        notNull: true,
      },
      user_address: {
        type: 'text',
      },
      user_birthdate: {
        type: 'date',
        notNull: true,
      },
      user_phone: {
        type: 'varchar(20)',
      },
    }
  )

  // Add constraint for valid email
  pgm.addConstraint(
    { schema: 'gym_manager', name: 'users' },
    'valid_email',
    {
      check: "user_email <> ''",
    }
  )

  // Create payment_methods table
  pgm.createTable(
    { schema: 'gym_manager', name: 'payment_methods' },
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
      },
      user_id: {
        type: 'uuid',
        notNull: true,
        references: { schema: 'gym_manager', name: 'users' },
        onDelete: 'CASCADE',
      },
      payment_type: {
        type: 'varchar(20)',
        notNull: true,
      },
      card_number: {
        type: 'varchar(19)',
      },
      card_expiry: {
        type: 'varchar(7)',
      },
      iban: {
        type: 'varchar(34)',
      },
      created_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('now()'),
      },
      updated_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('now()'),
      },
    }
  )

  // Add constraints for payment_methods
  pgm.addConstraint(
    { schema: 'gym_manager', name: 'payment_methods' },
    'valid_payment_type',
    {
      check: "payment_type IN ('credit_card', 'iban')",
    }
  )

  pgm.addConstraint(
    { schema: 'gym_manager', name: 'payment_methods' },
    'check_credit_card_fields',
    {
      check:
        "(payment_type = 'credit_card' AND card_number IS NOT NULL AND card_expiry IS NOT NULL) OR payment_type != 'credit_card'",
    }
  )

  pgm.addConstraint(
    { schema: 'gym_manager', name: 'payment_methods' },
    'check_iban_fields',
    {
      check: "(payment_type = 'iban' AND iban IS NOT NULL) OR payment_type != 'iban'",
    }
  )

  // Create sessions table
  pgm.createTable(
    { schema: 'gym_manager', name: 'sessions' },
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
      },
      user_id: {
        type: 'uuid',
        references: { schema: 'gym_manager', name: 'users' },
        onDelete: 'CASCADE',
      },
      expires_at: {
        type: 'timestamp',
        notNull: true,
      },
      created_at: {
        type: 'timestamp',
        default: pgm.func('now()'),
      },
    }
  )
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop tables in reverse order
  pgm.dropTable({ schema: 'gym_manager', name: 'sessions' }, { ifExists: true, cascade: true })
  pgm.dropTable({ schema: 'gym_manager', name: 'payment_methods' }, { ifExists: true, cascade: true })
  pgm.dropTable({ schema: 'gym_manager', name: 'users' }, { ifExists: true, cascade: true })
  
  // Drop schema
  pgm.dropSchema('gym_manager', { ifExists: true, cascade: true })
}
