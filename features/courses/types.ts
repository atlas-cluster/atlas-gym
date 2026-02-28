export interface CourseTemplate {
  id: string
  name: string
  description?: string
  weekDay: Weekday[]
  startTime: `${number}:${number}:${number}`
  endTime: `${number}:${number}:${number}`
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CourseTemplateDisplay extends CourseTemplate {
  roomName: string
  trainerName: string
}

export interface CourseSession {
  startTime: Date
  endTime: Date
  isCancelled: boolean
}

export interface CourseSessionDisplay extends CourseSession {
  name: string
  description?: string
  roomName: string
  trainerName: string
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'
