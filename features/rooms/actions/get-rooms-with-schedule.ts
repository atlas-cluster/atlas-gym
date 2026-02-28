'use server'

import { Room, RoomSessionDisplay, RoomWithSchedule } from '@/features/rooms/types'
import { pool } from '@/features/shared/lib/db'

export async function getRoomsWithSchedule(
  filterDate?: string,
  filterTime?: string
): Promise<RoomWithSchedule[]> {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)

  const date = filterDate ?? today
  const time = filterTime ?? now

  const roomsResult = await pool.query<Room & { createdAt: Date; updatedAt: Date }>(
    `SELECT id, name, capacity, created_at as "createdAt", updated_at as "updatedAt"
     FROM rooms ORDER BY name`
  )

  const sessionsResult = await pool.query(
    `SELECT cs.id, cs.template_id as "templateId", cs.session_date as "sessionDate",
            cs.start_time as "startTime", cs.end_time as "endTime",
            cs.is_cancelled as "isCancelled",
            ct.room_id as "roomId", ct.name as "courseName",
            m.firstname || ' ' || m.lastname as "trainerName",
            COUNT(cb.id) as "bookedCount"
     FROM course_sessions cs
     JOIN course_templates ct ON cs.template_id = ct.id
     JOIN trainers t ON ct.trainer_id = t.member_id
     JOIN members m ON t.member_id = m.id
     LEFT JOIN course_bookings cb ON cs.id = cb.session_id
     WHERE cs.session_date = $1::date
     GROUP BY cs.id, cs.template_id, cs.session_date, cs.start_time, cs.end_time,
              cs.is_cancelled, ct.room_id, ct.name, m.firstname, m.lastname
     ORDER BY cs.start_time`,
    [date]
  )

  const sessionsByRoom = new Map<string, RoomSessionDisplay[]>()

  for (const row of sessionsResult.rows) {
    const session: RoomSessionDisplay = {
      id: row.id,
      templateId: row.templateId,
      sessionDate: new Date(row.sessionDate),
      startTime: row.startTime,
      endTime: row.endTime,
      isCancelled: row.isCancelled,
      courseName: row.courseName,
      trainerName: row.trainerName,
      bookedCount: parseInt(row.bookedCount, 10),
    }
    if (!sessionsByRoom.has(row.roomId)) {
      sessionsByRoom.set(row.roomId, [])
    }
    sessionsByRoom.get(row.roomId)!.push(session)
  }

  return roomsResult.rows.map((room) => {
    const sessions = sessionsByRoom.get(room.id) ?? []

    // A room is available if no non-cancelled session is ongoing at the given date+time
    const isAvailableNow = !sessions.some(
      (s) =>
        !s.isCancelled &&
        s.startTime.slice(0, 5) <= time &&
        s.endTime.slice(0, 5) > time
    )

    return {
      id: room.id,
      name: room.name,
      capacity: parseInt(String(room.capacity), 10),
      createdAt: new Date(room.createdAt),
      updatedAt: new Date(room.updatedAt),
      sessions,
      isAvailableNow,
    }
  })
}
