export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface CourseTemplate {
  id: string
  trainerId: string
  roomId: string
  name: string
  description?: string
  weekdays: Weekday[]
  startTime: string // HH:MM:SS format
  endTime: string // HH:MM:SS format
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CourseTemplateDisplay extends CourseTemplate {
  trainerName: string
  roomName: string
  roomCapacity: number
}

export interface CourseSession {
  id: string
  templateId: string
  sessionDate: Date
  startTime: string // HH:MM:SS
  endTime: string // HH:MM:SS
  isCancelled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CourseSessionDisplay extends CourseSession {
  name: string
  description?: string
  trainerName: string
  roomName: string
  roomCapacity: number
  bookingId?: string // if current member has booked
  bookedCount: number // how many bookings
}

export interface TrainerMinimal {
  id: string
  name: string
}

export interface RoomMinimal {
  id: string
  name: string
  capacity: number
}
