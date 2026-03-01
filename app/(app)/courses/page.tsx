import { getCourseSessions } from '@/features/courses/actions/get-course-sessions'
import { getRoomOptions } from '@/features/courses/actions/get-room-options'
import { getTrainerOptions } from '@/features/courses/actions/get-trainer-options'
import { CourseSessionsController } from '@/features/courses/components/course-sessions-controller'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const [sessions, trainers, rooms] = await Promise.all([
    getCourseSessions(),
    getTrainerOptions(),
    getRoomOptions(),
  ])

  return (
    <CourseSessionsController
      data={sessions}
      trainers={trainers}
      rooms={rooms}
    />
  )
}
