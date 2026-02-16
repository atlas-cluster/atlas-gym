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
  const values = [memberId, action, entityId, entityType, description]

  if (client) {
    await client.query(query, values)
  } else {
    await pool.query(query, values)
  }
}
