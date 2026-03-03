export interface CourseTemplate {
  id: string
  name: string
  description?: string
  bannerImageUrl?: string
  weekDays: Weekday[]
  startTime: string
  endTime: string
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CourseTemplateDisplay extends CourseTemplate {
  trainerId?: string
  trainerName?: string
  roomId?: string
  roomName?: string
}

export interface CourseSession {
  startTime: Date
  endTime: Date
  isCancelled: boolean
}

export interface CourseSessionDisplay extends CourseSession {
  id: string
  templateId: string
  sessionDate: string
  name: string
  description?: string
  bannerImageUrl?: string
  trainerName?: string
  trainerId?: string
  roomName?: string
  roomId?: string
  bookingCount: number
  isBookedByMe: boolean
  myBookingId?: string
  hasOverrides: boolean
  updatedAt: Date
  originalName: string
  originalDescription?: string
  originalTrainerId?: string
  originalTrainerName?: string
  originalRoomId?: string
  originalRoomName?: string
  originalStartTime: string
  originalEndTime: string
}

export interface CourseBookingDisplay {
  id: string
  sessionId: string
  sessionDate: string
  name: string
  description?: string
  bannerImageUrl?: string
  startTime: string
  endTime: string
  trainerName?: string
  roomName?: string
  isCancelled: boolean
  createdAt: Date
}

export interface SessionBookingMember {
  id: string
  firstname: string
  lastname: string
  email: string
  bookedAt: Date
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'
