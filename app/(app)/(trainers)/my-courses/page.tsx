import { getMyCourseSessions } from '@/features/courses/actions/get-my-course-sessions'
import { getRoomOptions } from '@/features/courses/actions/get-room-options'
import { getTrainerOptions } from '@/features/courses/actions/get-trainer-options'
import { MyCourseSessionsController } from '@/features/courses/components/my-course-sessions-controller'

export const dynamic = 'force-dynamic'

export default async function MyCoursesPage() {
  const [sessions, trainers, rooms] = await Promise.all([
    getMyCourseSessions(),
    getTrainerOptions(),
    getRoomOptions(),
  ])

  return (
    <MyCourseSessionsController
      data={sessions}
      trainers={trainers}
      rooms={rooms}
    />
  )
}
