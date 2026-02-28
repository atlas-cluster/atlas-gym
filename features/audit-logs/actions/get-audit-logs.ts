'use server'

import {
  Action,
  AuditLog,
  GetAuditLogsParams,
  GetAuditLogsResponse,
} from '@/features/audit-logs/types'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

function buildFilters(
  params: Partial<GetAuditLogsParams>,
  excludeColumn?: string
) {
  const conditions: string[] = []
  const values: unknown[] = []
  let i = 1

  if (params.globalFilter) {
    conditions.push(
      `(m.firstname ILIKE $${i} OR m.lastname ILIKE $${i} OR al.entity_type ILIKE $${i} OR al.description ILIKE $${i})`
    )
    values.push(`%${params.globalFilter}%`)
    i++
  }

  if (!params.columnFilters) {
    return {
      where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values,
    }
  }

  for (const filter of params.columnFilters) {
    if (filter.id === excludeColumn) continue

    if (
      filter.id === 'member' &&
      Array.isArray(filter.value) &&
      filter.value.length > 0
    ) {
      conditions.push(`(m.firstname || ' ' || m.lastname) = ANY($${i})`)
      values.push(filter.value)
      i++
    }

    if (
      filter.id === 'action' &&
      Array.isArray(filter.value) &&
      filter.value.length > 0
    ) {
      conditions.push(`al.action::text = ANY($${i})`)
      values.push(filter.value)
      i++
    }

    if (
      filter.id === 'entity' &&
      Array.isArray(filter.value) &&
      filter.value.length > 0
    ) {
      conditions.push(`al.entity_type = ANY($${i})`)
      values.push(filter.value)
      i++
    }

    if (filter.id === 'timestamp') {
      const range = filter.value as { from?: string | Date; to?: string | Date }
      if (range?.from) {
        conditions.push(`al.timestamp >= $${i}`)
        values.push(range.from)
        i++
      }
      if (range?.to) {
        conditions.push(`al.timestamp <= $${i}`)
        values.push(new Date(range.to).toISOString())
        i++
      }
    }
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  }
}

function buildOrderBy(sorting?: { id: string; desc: boolean }[]): string {
  if (!sorting || sorting.length === 0) return 'ORDER BY al.timestamp DESC'

  const { id, desc } = sorting[0]
  const dir = desc ? 'DESC' : 'ASC'

  const sortMap: Record<string, string> = {
    timestamp: `al.timestamp ${dir}`,
    member: `m.lastname ${dir}, m.firstname ${dir}`,
    action: `al.action ${dir}`,
    entity: `al.entity_type ${dir}`,
    description: `al.description ${dir}`,
  }

  return `ORDER BY ${sortMap[id] ?? `al.timestamp ${dir}`}`
}

export async function getAuditLogs(
  params?: Partial<GetAuditLogsParams>
): Promise<GetAuditLogsResponse> {
  const { member } = await getSession()
  if (!member?.isTrainer) {
    throw new Error('Unauthorized')
  }

  const { pageIndex = 0, pageSize = 15 } = params || {}

  const p = params || {}
  const offset = pageIndex * pageSize

  const main = buildFilters(p)
  const orderBy = buildOrderBy(p.sorting)
  const mainParamOffset = main.values.length

  const dataQuery = `
    SELECT
      al.id,
      al.action,
      al.entity_type AS entity,
      al.description,
      al.timestamp,
      m.firstname,
      m.lastname,
      COUNT(*) OVER() AS total_count
    FROM audit_logs al
    LEFT JOIN members m ON al.member_id = m.id
    ${main.where}
    ${orderBy}
    LIMIT $${mainParamOffset + 1} OFFSET $${mainParamOffset + 2}`

  const memberFacet = buildFilters(p, 'member')
  const actionFacet = buildFilters(p, 'action')
  const entityFacet = buildFilters(p, 'entity')

  const memberFacetQuery = `
    SELECT
      COALESCE(m.firstname || ' ' || m.lastname, 'Unknown User') AS name,
      COUNT(*) AS count
    FROM audit_logs al
    LEFT JOIN members m ON al.member_id = m.id
    ${memberFacet.where}
    GROUP BY m.id, m.firstname, m.lastname
    ORDER BY count DESC, name ASC`

  const actionFacetQuery = `
    SELECT al.action, COUNT(*) AS count
    FROM audit_logs al
    LEFT JOIN members m ON al.member_id = m.id
    ${actionFacet.where}
    GROUP BY al.action
    ORDER BY count DESC, al.action ASC`

  const entityFacetQuery = `
    SELECT al.entity_type, COUNT(*) AS count
    FROM audit_logs al
    LEFT JOIN members m ON al.member_id = m.id
    ${entityFacet.where}
    GROUP BY al.entity_type
    ORDER BY count DESC, al.entity_type ASC`

  const [dataResult, memberResult, actionResult, entityResult] =
    await Promise.all([
      pool.query(dataQuery, [...main.values, pageSize, offset]),
      pool.query(memberFacetQuery, memberFacet.values),
      pool.query(actionFacetQuery, actionFacet.values),
      pool.query(entityFacetQuery, entityFacet.values),
    ])

  const data: AuditLog[] = dataResult.rows.map((row) => ({
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
    dataResult.rows.length > 0 ? parseInt(dataResult.rows[0].total_count) : 0

  return {
    data,
    pageCount: Math.ceil(rowCount / pageSize),
    rowCount,
    facets: {
      member: Object.fromEntries(
        memberResult.rows.map((r) => [r.name, parseInt(r.count)])
      ),
      action: Object.fromEntries(
        actionResult.rows.map((r) => [r.action, parseInt(r.count)])
      ),
      entity: Object.fromEntries(
        entityResult.rows.map((r) => [r.entity_type, parseInt(r.count)])
      ),
    },
  }
}
