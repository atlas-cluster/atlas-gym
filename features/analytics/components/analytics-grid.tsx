'use client'

import {
  BookmarkIcon,
  CalendarIcon,
  ChevronDownIcon,
  CreditCardIcon,
  DoorOpenIcon,
  LayoutGridIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react'
import { useState } from 'react'

import { BookingsTrendChart } from '@/features/analytics/components/bookings-trend-chart'
import { ChurnRateChart } from '@/features/analytics/components/churn-rate-chart'
import { CoursePerformanceTable } from '@/features/analytics/components/course-performance-table'
import { KpiCards } from '@/features/analytics/components/kpi-cards'
import { AgeDistributionChart } from '@/features/analytics/components/member-demographics'
import { PaymentMethodChart } from '@/features/analytics/components/payment-method-chart'
import { PeakHoursHeatmap } from '@/features/analytics/components/peak-hours-heatmap'
import { PlanRankingTable } from '@/features/analytics/components/plan-ranking-table'
import { RevenueByPlanChart } from '@/features/analytics/components/revenue-by-plan-chart'
import { RevenueChart } from '@/features/analytics/components/revenue-chart'
import { RoomUtilizationChart } from '@/features/analytics/components/room-utilization-chart'
import { SubscriptionDistributionChart } from '@/features/analytics/components/subscription-distribution-chart'
import { TrainerLeaderboard } from '@/features/analytics/components/trainer-leaderboard'
import type { AnalyticsData } from '@/features/analytics/types'
import { Button } from '@/features/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { cn } from '@/features/shared/lib/utils'

interface AnalyticsGridProps {
  data: AnalyticsData
}

const COLLAPSED_ROWS = 5

export function AnalyticsGrid({ data }: AnalyticsGridProps) {
  const [planExpanded, setPlanExpanded] = useState(false)
  const [courseExpanded, setCourseExpanded] = useState(false)

  const visiblePlans = planExpanded
    ? data.planRanking
    : data.planRanking.slice(0, COLLAPSED_ROWS)
  const visibleCourses = courseExpanded
    ? data.coursePerformance
    : data.coursePerformance.slice(0, COLLAPSED_ROWS)

  return (
    <div className="grid grid-cols-1 gap-3">
      <KpiCards data={data.kpis} />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUpIcon className="h-3.5 w-3.5" />
              Monthly Revenue
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Last 12 Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueChart} />
          </CardContent>
        </Card>
        <Card className="gap-2">
          <CardHeader>
            <CardDescription>New vs Cancelled</CardDescription>
            <CardTitle className="text-lg font-semibold">
              Subscription Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChurnRateChart data={data.churnChart} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <LayoutGridIcon className="h-3.5 w-3.5" />
              Revenue by Plan
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueByPlanChart data={data.revenueByPlan} />
          </CardContent>
        </Card>
        <Card className="gap-2">
          <CardHeader>
            <CardDescription>Plan Distribution</CardDescription>
            <CardTitle className="text-lg font-semibold">
              Active Subscribers by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionDistributionChart
              data={data.subscriptionDistribution}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="gap-2">
        <CardHeader>
          <CardDescription>Plan Ranking</CardDescription>
          <CardTitle className="text-lg font-semibold">
            All Active Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <PlanRankingTable data={visiblePlans} />
          {data.planRanking.length > COLLAPSED_ROWS && (
            <Button
              variant="ghost"
              size="sm"
              className="mx-auto"
              onClick={() => setPlanExpanded(!planExpanded)}>
              <ChevronDownIcon
                className={cn(
                  'mr-1 h-4 w-4 transition-transform',
                  planExpanded && 'rotate-180'
                )}
              />
              {planExpanded
                ? 'Show less'
                : `Show all ${data.planRanking.length} plans`}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <BookmarkIcon className="h-3.5 w-3.5" />
              Bookings Trend
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Weekly Bookings (3 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BookingsTrendChart data={data.bookingsTrend} />
          </CardContent>
        </Card>
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              Peak Hours
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Booking Density by Day &amp; Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PeakHoursHeatmap data={data.peakHours} />
          </CardContent>
        </Card>
      </div>

      <Card className="gap-2">
        <CardHeader>
          <CardDescription>Course Performance</CardDescription>
          <CardTitle className="text-lg font-semibold">Last 3 Months</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <CoursePerformanceTable data={visibleCourses} />
          {data.coursePerformance.length > COLLAPSED_ROWS && (
            <Button
              variant="ghost"
              size="sm"
              className="mx-auto"
              onClick={() => setCourseExpanded(!courseExpanded)}>
              <ChevronDownIcon
                className={cn(
                  'mr-1 h-4 w-4 transition-transform',
                  courseExpanded && 'rotate-180'
                )}
              />
              {courseExpanded
                ? 'Show less'
                : `Show all ${data.coursePerformance.length} courses`}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <UsersIcon className="h-3.5 w-3.5" />
              Trainer Leaderboard
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              By Total Bookings (3 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrainerLeaderboard data={data.trainerLeaderboard} />
          </CardContent>
        </Card>
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <DoorOpenIcon className="h-3.5 w-3.5" />
              Room Utilization
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Sessions &amp; Bookings by Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoomUtilizationChart data={data.roomUtilization} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <UsersIcon className="h-3.5 w-3.5" />
              Age Distribution
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Members by Age Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AgeDistributionChart data={data.memberAge} />
          </CardContent>
        </Card>
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <CreditCardIcon className="h-3.5 w-3.5" />
              Payment Methods
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Member Payment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentMethodChart data={data.paymentMethodDistribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
