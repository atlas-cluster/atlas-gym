import { getCourseSessions } from '@/features/courses'
import { CourseSessionsView } from '@/features/courses/components/course-sessions-view'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const sessions = await getCourseSessions()
  return <CourseSessionsView initialData={sessions} />
}
