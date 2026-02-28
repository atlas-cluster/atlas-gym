import { CourseSessionDisplay } from '@/features/courses'

interface Room {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

interface RoomDisplay extends Room {
  sessions: CourseSessionDisplay[]
}
