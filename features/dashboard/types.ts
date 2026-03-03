export interface DashboardData {
  subscriptionData: DashboardSubscriptionData
  nextBookingData?: NextBookingData
  bookingsChartData: BookingsChartPoint[]
  recommendedCourses: DashboardCourse[]
  upcomingCourses: DashboardUpcomingCourse[]
}

export interface DashboardSubscriptionData {
  currentSubscriptionName?: string
  currentSubscriptionPrice?: number
  currentSubscriptionDescription?: string
  subscriptionStartDate?: string
  subscriptionEndDate?: string
  upComingSubscriptionName?: string
  upComingSubscriptionStartDate?: string
  status: 'active' | 'cancelled' | 'none'
}

export interface NextBookingData {
  courseName: string
  courseStartDate: string
  courseStartTime: string
  bannerImageUrl?: string
  trainerName?: string
  roomName?: string
}

export interface BookingsChartPoint {
  day: string
  bookings: number
  isToday: boolean
}

export interface DashboardCourse {
  templateId: string
  name: string
  description?: string
  bannerImageUrl?: string
  trainerName?: string
  roomName?: string
  weekdays: string[]
  startTime: string
  endTime: string
  nextSessionId?: string
  nextSessionDate?: string
}

export interface DashboardUpcomingCourse {
  sessionId: string
  name: string
  sessionDate: string
  startTime: string
  endTime: string
  trainerName?: string
  roomName?: string
  bannerImageUrl?: string
  isCancelled: boolean
  role: 'booking' | 'trainer'
  updatedAt?: string
  bookingId?: string
}
