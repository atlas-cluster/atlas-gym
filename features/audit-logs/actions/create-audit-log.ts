'use server'

import { PoolClient } from 'pg'

import { Action } from '@/features/audit-logs/types'
import { pool } from '@/features/shared/lib/db'

interface CreateAuditLogParams {
  memberId: string
  action: Action
  entityId: string
  entityType: string
  description: string
  client?: PoolClient
}

export async function createAuditLog({
  memberId,
  action,
  entityId,
  entityType,
  description,
  client,
}: CreateAuditLogParams) {
  const query = `
    INSERT INTO audit_logs (
      member_id,
      action,
      entity_id,
      entity_type,
      description
    ) VALUES ($1, $2, $3, $4, $5)
  `
  // Convert Title Case action to UPPERCASE for database enum compatibility if needed,
  // or just pass it if we accept that the DB enum needs to match.
  // Since the user asked to change the type, let's assume we want to keep the DB as is (UPPERCASE)
  // and map at the boundary, OR change the DB.
  // Changing DB enum values is tricky in Postgres.
  // Let's coerce to uppercase for the DB for now.
  const dbAction = action.toUpperCase()

  const values = [memberId, dbAction, entityId, entityType, description]

  if (client) {
    await client.query(query, values)
  } else {
    await pool.query(query, values)
  }
}
