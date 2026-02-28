export interface Room {
  id: string
  name: string
  capacity: number
  createdAt: Date
  updatedAt: Date
}

export interface RoomSessionDisplay {
  id: string
  templateId: string
  sessionDate: Date
  startTime: string
  endTime: string
  isCancelled: boolean
  courseName: string
  trainerName: string
  bookedCount: number
}

export interface RoomWithSchedule extends Room {
  sessions: RoomSessionDisplay[]
  isAvailableNow: boolean
}
