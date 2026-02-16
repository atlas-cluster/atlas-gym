'use server'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

interface ExecuteSQLResult {
  success: boolean
  data?: unknown[]
  rowCount?: number
  error?: string
}

export async function executeSQL(query: string): Promise<ExecuteSQLResult> {
  try {
    // Check if user is authenticated and is a trainer
    const session = await getSession()
    if (!session.authenticated || !session.member?.isTrainer) {
      return {
        success: false,
        error: 'Unauthorized: Only trainers can execute SQL queries',
      }
    }

    // Basic security check - disallow certain dangerous operations
    const lowerQuery = query.trim().toLowerCase()
    const dangerousPatterns = [
      'drop database',
      'drop schema',
      'create user',
      'alter user',
      'drop user',
      'grant',
      'revoke',
    ]

    for (const pattern of dangerousPatterns) {
      if (lowerQuery.includes(pattern)) {
        return {
          success: false,
          error: `Dangerous operation detected: "${pattern}" is not allowed`,
        }
      }
    }

    // Execute the query
    const result = await pool.query(query)

    return {
      success: true,
      data: result.rows,
      rowCount: result.rowCount ?? 0,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
