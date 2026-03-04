export interface AnalyticsData {
  kpis: KpiData
  revenueChart: RevenueChartPoint[]
  revenueByPlan: RevenueByPlan[]
  subscriptionDistribution: SubscriptionDistributionItem[]
  churnChart: ChurnChartPoint[]
  planRanking: PlanRankingRow[]
  coursePerformance: CoursePerformanceRow[]
  bookingsTrend: BookingsTrendPoint[]
  peakHours: PeakHourCell[]
  trainerLeaderboard: TrainerLeaderboardRow[]
  roomUtilization: RoomUtilizationRow[]
  memberAge: MemberAgeBucket[]
  paymentMethodDistribution: PaymentMethodItem[]
}

export interface KpiData {
  totalMembers: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  monthlyRecurringRevenue: number
  totalBookingsThisMonth: number
  totalCourseSessions: number
  avgBookingsPerSession: number
  totalCourseTemplates: number
}

export interface RevenueChartPoint {
  month: string
  revenue: number
}

export interface RevenueByPlan {
  name: string
  revenue: number
  subscribers: number
}

export interface SubscriptionDistributionItem {
  name: string
  count: number
}

export interface ChurnChartPoint {
  month: string
  churned: number
  newSubs: number
}

export interface PlanRankingRow {
  name: string
  subscribers: number
  mrr: number
  avgTenureMonths: number
  price: number
}

export interface CoursePerformanceRow {
  name: string
  trainerName?: string
  bannerImageUrl?: string
  totalBookings: number
  totalSessions: number
  cancelledSessions: number
  avgBookingsPerSession: number
  cancellationRate: number
}

export interface BookingsTrendPoint {
  week: string
  bookings: number
}

export interface PeakHourCell {
  weekday: number
  hour: number
  bookings: number
}

export interface TrainerLeaderboardRow {
  name: string
  sessionsTaught: number
  totalBookings: number
  avgBookingsPerSession: number
  cancellationRate: number
}

export interface RoomUtilizationRow {
  name: string
  totalSessions: number
  totalBookings: number
  avgBookingsPerSession: number
}

export interface MemberAgeBucket {
  bucket: string
  count: number
}

export interface PaymentMethodItem {
  method: string
  count: number
}
