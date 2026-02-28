import { getCourseSessions, getMyBookings } from '@/features/courses'
import { CoursesController } from '@/features/courses/components/courses-controller'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const [sessions, myBookings] = await Promise.all([
    getCourseSessions(),
    getMyBookings(),
  ])
  return <CoursesController sessions={sessions} myBookings={myBookings} />
}
