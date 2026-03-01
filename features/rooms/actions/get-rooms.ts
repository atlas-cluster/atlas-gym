'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { CourseSessionDisplay } from '@/features/courses'
import { RoomDisplay } from '@/features/rooms/types'
import { pool } from '@/features/shared/lib/db'

const getRoomsCached = unstable_cache(
  async (date: string): Promise<RoomDisplay[]> => {
    const result = await pool.query(
      `WITH room_sessions AS (
        SELECT COALESCE(r_override.id, r_template.id)          AS room_id,
               COALESCE(r_override.name, r_template.name)      AS room_name,
               COALESCE(r_override.description, r_template.description) AS room_description,
               COALESCE(r_override.created_at, r_template.created_at)   AS room_created_at,
               COALESCE(r_override.updated_at, r_template.updated_at)   AS room_updated_at,
               COALESCE(cs.name_override, ct.name)               AS session_name,
               COALESCE(cs.description_override, ct.description) AS session_description,
               COALESCE(m_override.firstname || ' ' || m_override.lastname,
                        m.firstname || ' ' || m.lastname)        AS trainer_name,
               cs.session_date + COALESCE(cs.start_time_override, cs.start_time) AS session_start,
               cs.session_date + COALESCE(cs.end_time_override, cs.end_time)     AS session_end,
               cs.is_cancelled AS session_cancelled
        FROM course_sessions cs
          JOIN course_templates ct ON ct.id = cs.template_id
          LEFT JOIN rooms r_template ON ct.room_id = r_template.id
          LEFT JOIN rooms r_override ON cs.room_id_override = r_override.id
          LEFT JOIN members m ON ct.trainer_id = m.id
          LEFT JOIN members m_override ON cs.trainer_id_override = m_override.id
        WHERE cs.session_date = $1::date
          AND COALESCE(cs.room_id_override, ct.room_id) IS NOT NULL
      ),
      all_rooms AS (
        SELECT r.id          AS room_id,
               r.name        AS room_name,
               r.description AS room_description,
               r.created_at  AS room_created_at,
               r.updated_at  AS room_updated_at,
               NULL::TEXT AS session_name,
               NULL::TEXT AS session_description,
               NULL::TEXT AS trainer_name,
               NULL::TIMESTAMP AS session_start,
               NULL::TIMESTAMP AS session_end,
               NULL::BOOLEAN AS session_cancelled
        FROM rooms r
        WHERE r.id NOT IN (SELECT room_id FROM room_sessions)
      )
      SELECT * FROM room_sessions
      UNION ALL
      SELECT * FROM all_rooms
      ORDER BY room_name, session_start`,
      [date]
    )

    const roomMap = new Map<string, RoomDisplay>()

    for (const row of result.rows) {
      if (!roomMap.has(row.room_id)) {
        roomMap.set(row.room_id, {
          id: row.room_id,
          name: row.room_name,
          description: row.room_description ?? undefined,
          createdAt: new Date(row.room_created_at),
          updatedAt: new Date(row.room_updated_at),
          sessions: [],
        })
      }

      if (row.session_start) {
        roomMap.get(row.room_id)!.sessions.push({
          name: row.session_name,
          description: row.session_description ?? undefined,
          roomName: row.room_name,
          trainerName: row.trainer_name,
          startTime: new Date(row.session_start),
          endTime: new Date(row.session_end),
          isCancelled: row.session_cancelled,
        } as CourseSessionDisplay)
      }
    }

    return Array.from(roomMap.values())
  },
  ['get-rooms'],
  { revalidate: 3600, tags: ['rooms', 'courses'] }
)

export async function getRooms(date?: string): Promise<RoomDisplay[]> {
  const { member } = await getSession()

  if (!member) {
    return []
  }

  const effectiveDate = date ?? new Date().toISOString().split('T')[0]

  return getRoomsCached(effectiveDate)
}
