import { getCourseTemplates } from '@/features/courses/actions/get-course-templates'
import { getRoomOptions } from '@/features/courses/actions/get-room-options'
import { getTrainerOptions } from '@/features/courses/actions/get-trainer-options'
import { CourseTemplatesController } from '@/features/courses/components/course-templates-controller'

export const dynamic = 'force-dynamic'

export default async function CourseTemplatesPage() {
  const [courseTemplates, trainers, rooms] = await Promise.all([
    getCourseTemplates(),
    getTrainerOptions(),
    getRoomOptions(),
  ])

  return (
    <CourseTemplatesController
      data={courseTemplates}
      trainers={trainers}
      rooms={rooms}
    />
  )
}
