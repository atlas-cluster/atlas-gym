'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { CourseTemplateDisplay, Weekday } from '@/features/courses/types'
import { pool } from '@/features/shared/lib/db'

const getCourseTemplatesCached = unstable_cache(
  async (): Promise<CourseTemplateDisplay[]> => {
    const result = await pool.query(`
      SELECT ct.id,
             ct.name,
             ct.description,
             ct.banner_image_url                   AS "bannerImageUrl",
             ct.weekdays                          AS "weekDays",
             ct.start_time::text                   AS "startTime",
             ct.end_time::text                     AS "endTime",
             ct.start_date                         AS "startDate",
             ct.end_date                           AS "endDate",
             ct.created_at                         AS "createdAt",
             ct.updated_at                         AS "updatedAt",
             ct.trainer_id                         AS "trainerId",
             m.firstname || ' ' || m.lastname      AS "trainerName",
             ct.room_id                            AS "roomId",
             r.name                                AS "roomName"
      FROM course_templates ct
        LEFT JOIN members m ON ct.trainer_id = m.id
        LEFT JOIN rooms r ON ct.room_id = r.id
      ORDER BY ct.name
    `)

    return result.rows.map((row) => ({
      ...row,
      weekDays: (Array.isArray(row.weekDays)
        ? row.weekDays
        : (row.weekDays as string)
            .replace(/[{}]/g, '')
            .split(',')
            .filter(Boolean)) as Weekday[],
      startDate: new Date(row.startDate),
      endDate: row.endDate ? new Date(row.endDate) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      trainerId: row.trainerId ?? undefined,
      trainerName: row.trainerName ?? undefined,
      roomId: row.roomId ?? undefined,
      roomName: row.roomName ?? undefined,
      description: row.description ?? undefined,
      bannerImageUrl: row.bannerImageUrl ?? undefined,
    }))
  },
  ['get-course-templates'],
  { revalidate: 3600, tags: ['courses'] }
)

export async function getCourseTemplates(): Promise<CourseTemplateDisplay[]> {
  const { member } = await getSession()

  if (!member || !member.isTrainer) {
    return []
  }

  return getCourseTemplatesCached()
}
