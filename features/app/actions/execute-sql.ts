'use server'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

interface ExecuteSQLResult {
  success: boolean
  data?: Record<string, unknown>[]
  rowCount?: number
  truncated?: boolean
  error?: string
}

export async function executeSQL(query: string): Promise<ExecuteSQLResult> {
  try {
    const session = await getSession()
    if (!session.authenticated || !session.member?.isTrainer) {
      return {
        success: false,
        error: 'Unauthorized: Only trainers can execute SQL queries',
      }
    }

    const normalizedQuery = query
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/--.*$/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()

    const dangerousPatterns = [
      'drop database',
      'drop schema',
      'drop table',
      'truncate',
      'create user',
      'alter user',
      'drop user',
      'grant',
      'revoke',
      'alter table',
      'create table',
      'create schema',
    ]

    for (const pattern of dangerousPatterns) {
      if (normalizedQuery.includes(pattern)) {
        return {
          success: false,
          error: `Dangerous operation detected: "${pattern}" is not allowed`,
        }
      }
    }

    const result = await pool.query(query)

    const maxRows = 1000
    const limitedRows = result.rows.slice(0, maxRows)
    const truncated = result.rows.length > maxRows

    return {
      success: true,
      data: limitedRows,
      rowCount: result.rowCount ?? 0,
      truncated,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
