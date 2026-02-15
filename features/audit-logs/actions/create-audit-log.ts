'use server'

import { pool } from '@/features/shared/lib/db'

export interface CreateAuditLogParams {
  memberId: string
  entityId: string
  entityType: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  description: string
}

export async function createAuditLog(params: CreateAuditLogParams) {
  const { memberId, entityId, entityType, action, description } = params

  try {
    await pool.query(
      `INSERT INTO audit_logs (member_id, entity_id, entity_type, action, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [memberId, entityId, entityType, action, description]
    )
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Don't throw - audit logging should not break the main operation
  }
}
