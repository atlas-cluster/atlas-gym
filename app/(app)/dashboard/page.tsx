import {
  BookmarkIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  UserCheckIcon,
} from 'lucide-react'

import { getSession } from '@/features/auth'
import { getCourseSessions } from '@/features/courses/actions/get-course-sessions'
import { getMyBookings } from '@/features/courses/actions/get-my-bookings'
import { getMyCourseSessions } from '@/features/courses/actions/get-my-course-sessions'
import { getDashboardStats, getPlansForMember } from '@/features/dashboard'
import { BookingStatsCard } from '@/features/dashboard/components/booking-stats-card'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { SubscriptionCard } from '@/features/dashboard/components/subscription-card'
import { TodayScheduleCard } from '@/features/dashboard/components/today-schedule-card'
import { getSubscriptions } from '@/features/subscriptions'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]

  const { member } = await getSession()

  const [
    subscriptions,
    plans,
    todayBookings,
    todaySessions,
    myTodaySessions,
    stats,
  ] = await Promise.all([
    getSubscriptions(),
    getPlansForMember(),
    getMyBookings(today),
    getCourseSessions(today),
    member?.isTrainer ? getMyCourseSessions(today) : Promise.resolve([]),
    getDashboardStats(),
  ])

  const activeSubscription = subscriptions.find(
    (s) => s.isActive && !s.isCancelled
  )

  return (
    <div className="space-y-4">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Subscription"
          value={activeSubscription ? 'Active' : 'None'}
          description={
            activeSubscription ? activeSubscription.name : 'No active plan'
          }
          icon={UserCheckIcon}
        />
        <StatCard
          title="Today's Bookings"
          value={todayBookings.length}
          description="courses booked today"
          icon={BookmarkIcon}
        />
        <StatCard
          title="Today's Courses"
          value={todaySessions.length}
          description="sessions available today"
          icon={CalendarDaysIcon}
        />
        <StatCard
          title="Upcoming Bookings"
          value={stats.totalUpcomingBookings}
          description="from today onwards"
          icon={TrendingUpIcon}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Subscription card */}
        <SubscriptionCard subscriptions={subscriptions} plans={plans} />

        {/* Today's schedule */}
        <TodayScheduleCard
          bookings={todayBookings}
          sessions={myTodaySessions}
          isTrainer={member?.isTrainer ?? false}
        />

        {/* Booking stats chart */}
        <BookingStatsCard bookingsPerDay={stats.bookingsPerDay} />
      </div>
    </div>
  )
}
