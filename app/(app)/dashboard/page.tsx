import { getSession } from '@/features/auth'
import { getCourseSessions } from '@/features/courses/actions/get-course-sessions'
import { getMyBookings } from '@/features/courses/actions/get-my-bookings'
import { getMyCourseSessions } from '@/features/courses/actions/get-my-course-sessions'
import { getDashboardStats, getPlansForMember } from '@/features/dashboard'
import { BookingStatsCard } from '@/features/dashboard/components/booking-stats-card'
import { RecommendedCoursesCard } from '@/features/dashboard/components/recommended-courses-card'
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

  // Courses today that the member hasn't booked and that aren't cancelled
  const recommendedSessions = todaySessions.filter(
    (s) => !s.isBookedByMe && !s.isCancelled
  )

  return (
    // On md+: fill viewport height (100svh minus 49px header and 1.5rem p-3 top+bottom) so all 4 cards fit without page scroll
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2 md:h-[calc(100svh-49px-1.5rem)]">
      <SubscriptionCard subscriptions={subscriptions} plans={plans} />

      <TodayScheduleCard
        bookings={todayBookings}
        sessions={myTodaySessions}
        isTrainer={member?.isTrainer ?? false}
      />

      <RecommendedCoursesCard sessions={recommendedSessions} />

      <BookingStatsCard
        bookingsPerDay={stats.bookingsPerDay}
        totalUpcomingBookings={stats.totalUpcomingBookings}
      />
    </div>
  )
}
