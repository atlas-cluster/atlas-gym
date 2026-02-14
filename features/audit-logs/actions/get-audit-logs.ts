'use server'

import { pool } from '@/features/shared/lib/db'
import {
  AuditLogsParams,
  AuditLogsResponse,
  AuditLogDisplay,
} from '@/features/audit-logs/types'

export async function getAuditLogs(
  params: AuditLogsParams = {}
): Promise<AuditLogsResponse> {
  const {
    page = 1,
    pageSize = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    action,
    entityType,
  } = params

  const offset = (page - 1) * pageSize
  const conditions: string[] = []
  const values: (string | number)[] = []
  let paramIndex = 1

  // Search filter - searches in member name, entity type, and description
  if (search) {
    conditions.push(`(
      CONCAT(m.firstname, ' ', m.lastname) ILIKE $${paramIndex} OR
      al.entity_type ILIKE $${paramIndex} OR
      al.description ILIKE $${paramIndex}
    )`)
    values.push(`%${search}%`)
    paramIndex++
  }

  // Action filter
  if (action) {
    conditions.push(`al.action = $${paramIndex}`)
    values.push(action)
    paramIndex++
  }

  // Entity type filter
  if (entityType) {
    conditions.push(`al.entity_type = $${paramIndex}`)
    values.push(entityType)
    paramIndex++
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Validate sortBy to prevent SQL injection
  const allowedSortColumns = [
    'createdAt',
    'action',
    'entityType',
    'memberName',
    'description',
  ]
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'createdAt'

  // Map frontend column names to SQL column names
  const columnMap: Record<string, string> = {
    createdAt: 'al.created_at',
    action: 'al.action',
    entityType: 'al.entity_type',
    memberName: 'member_name',
    description: 'al.description',
  }

  const sqlSortColumn = columnMap[sortColumn] || 'al.created_at'
  const sqlSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM audit_logs al
    LEFT JOIN members m ON al.member_id = m.id
    ${whereClause}
  `

  const countResult = await pool.query(countQuery, values)
  const totalCount = parseInt(countResult.rows[0].total, 10)
  const totalPages = Math.ceil(totalCount / pageSize)

  // Get paginated data
  const dataQuery = `
    SELECT 
      al.id,
      al.member_id as "memberId",
      CONCAT(m.firstname, ' ', m.lastname) as "memberName",
      al.entity_id as "entityId",
      al.entity_type as "entityType",
      al.action,
      al.description,
      al.created_at as "createdAt"
    FROM audit_logs al
    LEFT JOIN members m ON al.member_id = m.id
    ${whereClause}
    ORDER BY ${sqlSortColumn} ${sqlSortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  const dataResult = await pool.query(dataQuery, [
    ...values,
    pageSize,
    offset,
  ])

  return {
    data: dataResult.rows,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  }
}
