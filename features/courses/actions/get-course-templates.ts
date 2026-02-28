'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { CourseTemplateDisplay } from '@/features/courses/types'
import { pool } from '@/features/shared/lib/db'

const getCourseTemplatesCached = unstable_cache(
  async (): Promise<CourseTemplateDisplay[]> => {
    const result = await pool.query(`
      SELECT ct.id, ct.trainer_id as "trainerId", ct.room_id as "roomId",
             ct.name, ct.description,
             ct.weekdays, ct.start_time as "startTime", ct.end_time as "endTime",
             ct.start_date as "startDate", ct.end_date as "endDate",
             ct.created_at as "createdAt", ct.updated_at as "updatedAt",
             m.firstname || ' ' || m.lastname as "trainerName",
             r.name as "roomName", r.capacity as "roomCapacity"
      FROM course_templates ct
      JOIN trainers t ON ct.trainer_id = t.member_id
      JOIN members m ON t.member_id = m.id
      JOIN rooms r ON ct.room_id = r.id
      ORDER BY ct.name
    `)
    return result.rows.map((row) => ({
      ...row,
      startDate: new Date(row.startDate),
      endDate: row.endDate ? new Date(row.endDate) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      roomCapacity: parseInt(row.roomCapacity, 10),
    }))
  },
  ['get-course-templates'],
  { revalidate: 3600, tags: ['course-templates'] }
)

export async function getCourseTemplates(): Promise<CourseTemplateDisplay[]> {
  const { member } = await getSession()

  if (!member || !member.isTrainer) {
    return []
  }

  return getCourseTemplatesCached()
}
