'use server'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

interface TableSchema {
  table: string
  columns: string[]
}

export async function getDBSchema(): Promise<TableSchema[]> {
  try {
    // Check if user is authenticated and is a trainer
    const session = await getSession()
    if (!session.authenticated || !session.member?.isTrainer) {
      return []
    }

    // Get all tables and their columns from the public schema
    const query = `
      SELECT 
        t.table_name as table,
        array_agg(c.column_name ORDER BY c.ordinal_position) as columns
      FROM information_schema.tables t
      JOIN information_schema.columns c 
        ON t.table_name = c.table_name 
        AND t.table_schema = c.table_schema
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_name
      ORDER BY t.table_name;
    `

    const result = await pool.query(query)
    return result.rows as TableSchema[]
  } catch (error) {
    console.error('Error fetching database schema:', error)
    return []
  }
}
