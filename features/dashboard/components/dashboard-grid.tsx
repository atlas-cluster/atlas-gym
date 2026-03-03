import {
  ArrowRightIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  SparklesIcon,
  UserIcon,
} from 'lucide-react'

import { BookingsChart } from '@/features/dashboard/components/bookings-chart'
import { RecommendedCourseItem } from '@/features/dashboard/components/recommended-course-item'
import { UpcomingScheduleCard } from '@/features/dashboard/components/upcoming-schedule-card'
import type { DashboardData } from '@/features/dashboard/types'
import { BannerImage } from '@/features/shared/components/banner-image'
import { Badge } from '@/features/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { Separator } from '@/features/shared/components/ui/separator'
import { cn } from '@/features/shared/lib/utils'

interface DashboardGridProps {
  data: DashboardData
}

export function DashboardGrid({ data }: DashboardGridProps) {
  const visibleRecommended = data.recommendedCourses.slice(0, 8)

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {/* Next Booking Card */}
        <Card
          className={cn(
            'gap-2',
            data.nextBookingData?.bannerImageUrl ? 'pt-0' : ''
          )}>
          {data.nextBookingData && (
            <>
              {data.nextBookingData.bannerImageUrl ? (
                <Badge variant="secondary" className="absolute z-10 ml-2 mt-2">
                  Next Booking
                </Badge>
              ) : (
                <CardContent>
                  <CardDescription>Next Booking</CardDescription>
                </CardContent>
              )}
            </>
          )}

          {data.nextBookingData?.bannerImageUrl && (
            <BannerImage
              src={data.nextBookingData.bannerImageUrl}
              alt={data.nextBookingData.courseName}
              className="h-24"
            />
          )}
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              {data.nextBookingData
                ? data.nextBookingData.courseName
                : 'No upcoming bookings'}
            </CardTitle>
            {data.nextBookingData ? (
              <CardDescription>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {data.nextBookingData.courseStartDate} at{' '}
                    {data.nextBookingData.courseStartTime}
                  </span>
                </div>
                {data.nextBookingData.trainerName && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{data.nextBookingData.trainerName}</span>
                  </div>
                )}
                {data.nextBookingData.roomName && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{data.nextBookingData.roomName}</span>
                  </div>
                )}
              </CardDescription>
            ) : (
              <div className="text-muted-foreground text-sm">
                You have no upcoming bookings. Explore our courses and book your
                next session!
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Subscription Card */}
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>Current Subscription</span>
              {data.subscriptionData.status === 'active' && (
                <Badge variant="default" className="gap-1">
                  <CircleCheckIcon className="h-3 w-3" />
                  Active
                </Badge>
              )}
              {data.subscriptionData.status === 'cancelled' && (
                <Badge variant="destructive" className="gap-1">
                  <CircleXIcon className="h-3 w-3" />
                  Cancelled
                </Badge>
              )}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {data.subscriptionData.currentSubscriptionName ??
                'No Subscription'}
            </CardTitle>
            {data.subscriptionData.currentSubscriptionDescription && (
              <div className="text-muted-foreground text-xs">
                {data.subscriptionData.currentSubscriptionDescription}
              </div>
            )}
          </CardHeader>
          {data.subscriptionData.status !== 'none' && (
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between">
                {data.subscriptionData.currentSubscriptionPrice != null && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <CreditCardIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold">
                      {data.subscriptionData.currentSubscriptionPrice.toLocaleString(
                        'de-DE',
                        {
                          style: 'currency',
                          currency: 'EUR',
                        }
                      )}
                    </span>
                    <span className="text-muted-foreground">/ month</span>
                  </div>
                )}
                {data.subscriptionData.subscriptionStartDate && (
                  <div className="text-muted-foreground text-xs">
                    Since {data.subscriptionData.subscriptionStartDate}
                  </div>
                )}
              </div>

              {data.subscriptionData.subscriptionEndDate && (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ends on</span>
                      <span className="font-semibold">
                        {data.subscriptionData.subscriptionEndDate}
                      </span>
                    </div>
                    {data.subscriptionData.upComingSubscriptionName && (
                      <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2 text-sm">
                        <ArrowRightIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">
                          Switching to
                        </span>
                        <span className="font-semibold">
                          {data.subscriptionData.upComingSubscriptionName}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          )}
          {data.subscriptionData.status === 'none' && (
            <CardContent>
              <div className="text-muted-foreground text-sm">
                You don&apos;t have an active subscription. Choose a plan to get
                started!
              </div>
            </CardContent>
          )}
        </Card>

        {/* Bookings Chart Card */}
        <Card className="col-span-1 gap-2 sm:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Bookings</CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            {data.bookingsChartData.length > 0 ? (
              <BookingsChart data={data.bookingsChartData} />
            ) : (
              <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">
                No booking data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Recommended Courses Card */}
        <Card className="gap-2">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <SparklesIcon className="h-3.5 w-3.5" />
              Recommended Courses
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Discover Something New
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {visibleRecommended.length > 0 ? (
              visibleRecommended.map((course) => (
                <RecommendedCourseItem
                  key={course.templateId}
                  course={course}
                />
              ))
            ) : (
              <div className="text-muted-foreground text-sm">
                You&apos;ve already explored all available courses!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedule Card */}
        <UpcomingScheduleCard initialCourses={data.upcomingCourses} />
      </div>
    </div>
  )
}
