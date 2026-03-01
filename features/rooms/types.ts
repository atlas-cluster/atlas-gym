import { CourseSessionDisplay } from '@/features/courses'

export interface Room {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface RoomDisplay extends Room {
  sessions: CourseSessionDisplay[]
}
