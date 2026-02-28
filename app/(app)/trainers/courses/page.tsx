import { getCourseTemplates } from '@/features/courses'
import { CourseTemplatesController } from '@/features/courses/components/course-templates-controller'

export const dynamic = 'force-dynamic'

export default async function TrainerCoursesPage() {
  const templates = await getCourseTemplates()
  return <CourseTemplatesController data={templates} />
}
