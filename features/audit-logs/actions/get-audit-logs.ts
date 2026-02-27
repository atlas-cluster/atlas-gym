'use server'

import {
  Action,
  AuditLog,
  GetAuditLogsParams,
  GetAuditLogsResponse,
} from '@/features/audit-logs/types'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function getAuditLogs(
  params?: Partial<GetAuditLogsParams>
): Promise<GetAuditLogsResponse> {
  const { member } = await getSession()
  if (!member?.isTrainer) {
    throw new Error('Unauthorized')
  }

  const {
    pageIndex = 0,
    pageSize = 15,
    sorting,
    columnFilters,
    globalFilter,
  } = params || {}
  const client = await pool.connect()

  try {
    const buildWhereClause = (excludeFilterId?: string) => {
      let clause = 'WHERE 1=1'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clauseValues: any[] = []
      let pIndex = 1

      if (globalFilter) {
        clause += ` AND (
          m.firstname ILIKE $${pIndex} OR
          m.lastname ILIKE $${pIndex} OR
          al.entity_type ILIKE $${pIndex} OR
          al.description ILIKE $${pIndex}
        )`
        clauseValues.push(`%${globalFilter}%`)
        pIndex++
      }

      if (columnFilters) {
        for (const filter of columnFilters) {
          if (filter.id === excludeFilterId) continue

          if (filter.id === 'member') {
            if (Array.isArray(filter.value)) {
              if (filter.value.length > 0) {
                clause += ` AND (m.firstname || ' ' || m.lastname = ANY($${pIndex}))`
                clauseValues.push(filter.value)
              }
            } else {
              clause += ` AND (m.firstname ILIKE $${pIndex} OR m.lastname ILIKE $${pIndex})`
              clauseValues.push(`%${filter.value}%`)
            }
            pIndex++
          } else if (filter.id === 'action') {
            const actionValues = Array.isArray(filter.value)
              ? (filter.value as string[])
              : [filter.value as string]

            if (Array.isArray(filter.value)) {
              if (filter.value.length > 0) {
                clause += ` AND al.action::text = ANY($${pIndex})`
                clauseValues.push(actionValues)
              }
            } else {
              clause += ` AND al.action::text = $${pIndex}`
              clauseValues.push(actionValues[0])
            }
            pIndex++
          } else if (filter.id === 'entity') {
            if (Array.isArray(filter.value)) {
              if (filter.value.length > 0) {
                clause += ` AND al.entity_type = ANY($${pIndex})`
                clauseValues.push(filter.value)
              }
            } else {
              clause += ` AND al.entity_type ILIKE $${pIndex}`
              clauseValues.push(`%${filter.value}%`)
            }
            pIndex++
          } else if (filter.id === 'timestamp') {
            const dateRange = filter.value as {
              from?: string | Date
              to?: string | Date
            }
            if (dateRange?.from) {
              clause += ` AND al.timestamp >= $${pIndex}`
              clauseValues.push(dateRange.from)
              pIndex++
            }
            if (dateRange?.to) {
              clause += ` AND al.timestamp <= $${pIndex}`
              const toDate = new Date(dateRange.to)
              clauseValues.push(toDate.toISOString())
              pIndex++
            }
          }
        }
      }
      return { clause, values: clauseValues }
    }

    const { clause: mainWhereClause, values: mainValues } = buildWhereClause()

    let orderByClause = 'ORDER BY al.timestamp DESC'
    if (sorting && sorting.length > 0) {
      const sort = sorting[0]
      const direction = sort.desc ? 'DESC' : 'ASC'
      switch (sort.id) {
        case 'timestamp':
          orderByClause = `ORDER BY al.timestamp ${direction}`
          break
        case 'member':
          orderByClause = `ORDER BY m.lastname ${direction}, m.firstname ${direction}`
          break
        case 'action':
          orderByClause = `ORDER BY al.action ${direction}`
          break
        case 'entity':
          orderByClause = `ORDER BY al.entity_type ${direction}`
          break
        case 'description':
          orderByClause = `ORDER BY al.description ${direction}`
          break
      }
    }

    const offset = pageIndex * pageSize
    const limit = pageSize
    const paramIndex = mainValues.length + 1 // Adjust manually since we rebuilt the clause function

    const query = `
      SELECT
        al.id,
        al.action,
        al.entity_type as entity,
        al.description,
        al.timestamp,
        m.firstname,
        m.lastname,
        COUNT(*) OVER() as total_count
      FROM audit_logs al
      LEFT JOIN members m ON al.member_id = m.id
      ${mainWhereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    const memberFacet = buildWhereClause('member')
    const actionFacet = buildWhereClause('action')
    const entityFacet = buildWhereClause('entity')

    const memberFacetQuery = `
      WITH filtered_logs AS (
        SELECT al.member_id
        FROM audit_logs al
        LEFT JOIN members m ON al.member_id = m.id
        ${memberFacet.clause}
      )
      SELECT
        CASE WHEN m.firstname IS NOT NULL AND m.lastname IS NOT NULL THEN m.firstname || ' ' || m.lastname ELSE 'Unknown User' END as name,
        COALESCE(count(fl.member_id), 0) as count
      FROM members m
      LEFT JOIN filtered_logs fl ON m.id = fl.member_id
      GROUP BY m.id, m.firstname, m.lastname
      ORDER BY count DESC, name ASC
    `

    const actionFacetQuery = `
      WITH all_actions AS (
        SELECT DISTINCT action FROM audit_logs
      ),
      filtered_logs AS (
        SELECT al.action
        FROM audit_logs al
        LEFT JOIN members m ON al.member_id = m.id
        ${actionFacet.clause}
      )
      SELECT
        aa.action,
        COALESCE(count(fl.action), 0) as count
      FROM all_actions aa
      LEFT JOIN filtered_logs fl ON aa.action = fl.action
      GROUP BY aa.action
      ORDER BY count DESC, aa.action ASC
    `

    const entityFacetQuery = `
      WITH all_entities AS (
        SELECT DISTINCT entity_type FROM audit_logs
      ),
      filtered_logs AS (
        SELECT al.entity_type
        FROM audit_logs al
        LEFT JOIN members m ON al.member_id = m.id
        ${entityFacet.clause}
      )
      SELECT
        ae.entity_type,
        COALESCE(count(fl.entity_type), 0) as count
      FROM all_entities ae
      LEFT JOIN filtered_logs fl ON ae.entity_type = fl.entity_type
      GROUP BY ae.entity_type
      ORDER BY count DESC, ae.entity_type ASC
    `

    const [result, memberFacetResult, actionFacetResult, entityFacetResult] =
      await Promise.all([
        client.query(query, [...mainValues, limit, offset]),
        client.query(memberFacetQuery, memberFacet.values),
        client.query(actionFacetQuery, actionFacet.values),
        client.query(entityFacetQuery, entityFacet.values),
      ])

    const data: AuditLog[] = result.rows.map((row) => ({
      member:
        row.firstname && row.lastname
          ? `${row.firstname} ${row.lastname}`
          : 'Unknown member',
      action: row.action as Action,
      entity: row.entity,
      description: row.description,
      timestamp: row.timestamp,
    }))

    const rowCount =
      result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0
    const pageCount = Math.ceil(rowCount / pageSize)

    const facets = {
      member: memberFacetResult.rows.reduce(
        (acc, row) => {
          acc[row.name] = parseInt(row.count)
          return acc
        },
        {} as Record<string, number>
      ),
      action: actionFacetResult.rows.reduce(
        (acc, row) => {
          acc[row.action] = parseInt(row.count)
          return acc
        },
        {} as Record<string, number>
      ),
      entity: entityFacetResult.rows.reduce(
        (acc, row) => {
          acc[row.entity_type] = parseInt(row.count)
          return acc
        },
        {} as Record<string, number>
      ),
    }

    return {
      data,
      pageCount,
      rowCount,
      facets,
    }
  } finally {
    client.release()
  }
}
