'use server'

import { unstable_cache } from 'next/cache'

import { GetMembersParams, GetMembersResponse } from '@/features/members/types'
import { pool } from '@/features/shared/lib/db'

const getMembersCached = unstable_cache(
  async (
    params: Partial<GetMembersParams> = {}
  ): Promise<GetMembersResponse> => {
    const {
      pageIndex = 0,
      pageSize = 10,
      sorting,
      columnFilters,
      globalFilter,
    } = params

    let query = `
    SELECT
      m.id,
      m.email,
      m.created_at,
      m.firstname,
      m.lastname,
      m.middlename,
      m.address,
      m.birthdate,
      m.phone,
      CASE WHEN t.id IS NOT NULL THEN true ELSE false END as "isTrainer"
    FROM gym_manager.members m
    LEFT JOIN gym_manager.trainers t ON m.id = t.member_id
    WHERE 1=1
  `
    const queryParams: (string | number)[] = []
    let paramIndex = 1

    // Global Filter
    if (globalFilter) {
      query += ` AND (
        m.firstname ILIKE $${paramIndex} OR
        m.lastname ILIKE $${paramIndex} OR
        m.email ILIKE $${paramIndex} OR
        m.phone ILIKE $${paramIndex} OR
        m.address ILIKE $${paramIndex}
      )`
      queryParams.push(`%${globalFilter}%`)
      paramIndex++
    }

    // Column Filters
    if (columnFilters) {
      for (const filter of columnFilters) {
        if (filter.id === 'type' && filter.value) {
          const values = Array.isArray(filter.value)
            ? filter.value
            : [filter.value]
          if (values.includes('trainer') && !values.includes('member')) {
            query += ` AND t.id IS NOT NULL`
          } else if (values.includes('member') && !values.includes('trainer')) {
            query += ` AND t.id IS NULL`
          }
        }
      }
    }

    // Count Query before pagination
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_table`
    const countResult = await pool.query(countQuery, queryParams)
    const rowCount = parseInt(countResult.rows[0].count, 10)

    // Sorting
    if (sorting && sorting.length > 0) {
      const sortClauses = sorting.map((sort) => {
        let col = ''
        switch (sort.id) {
          case 'name':
            col = 'm.lastname, m.firstname'
            break
          case 'email':
            col = 'm.email'
            break
          case 'birthdate':
            col = 'm.birthdate'
            break
          case 'phone':
            col = 'm.phone'
            break
          case 'address':
            col = 'm.address'
            break
          default:
            col = 'm.created_at'
        }
        return `${col} ${sort.desc ? 'DESC' : 'ASC'}`
      })
      query += ` ORDER BY ${sortClauses.join(', ')}`
    } else {
      query += ` ORDER BY m.created_at DESC`
    }

    // Pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    queryParams.push(pageSize, pageIndex * pageSize)

    const result = await pool.query(query, queryParams)

    // Facets
    // Calculate facets based on the *filtered* data (excluding the facet filter itself ideally, but for now global + other filters)
    // Or simple global facets.
    // The UI usually expects counts for the "Type" filter.
    // Let's compute global facets for simplicity or context-aware if possible.
    // For now: Global facets (counts of all members vs trainers)
    const facetsQuery = `
    SELECT
      COUNT(*) FILTER (WHERE t.id IS NOT NULL) as trainers,
      COUNT(*) FILTER (WHERE t.id IS NULL) as members
    FROM gym_manager.members m
    LEFT JOIN gym_manager.trainers t ON m.id = t.member_id
  `
    const facetsResult = await pool.query(facetsQuery)
    const facets = {
      isTrainer: {
        trainer: parseInt(facetsResult.rows[0].trainers, 10),
        member: parseInt(facetsResult.rows[0].members, 10),
      },
    }

    return {
      data: result.rows.map((row) => ({
        ...row,
        // Ensure camelCase keys match Member interface if strict, but pg returns lowercase usually which matches here except "isTrainer" which I quoted.
      })),
      pageCount: Math.ceil(rowCount / pageSize),
      rowCount: rowCount,
      facets,
    }
  },
  ['members-list'],
  { revalidate: 3600, tags: ['members'] }
)

export async function getMembers(
  params: Partial<GetMembersParams> = {}
): Promise<GetMembersResponse> {
  return getMembersCached(params)
}
