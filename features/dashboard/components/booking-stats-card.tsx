import { format, parseISO } from 'date-fns'
import { BookmarkIcon, TrendingUpIcon } from 'lucide-react'

import { BookingDayStat } from '@/features/dashboard/actions/get-dashboard-stats'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'

interface BookingStatsCardProps {
  bookingsPerDay: BookingDayStat[]
  totalUpcomingBookings: number
}

const BAR_AREA_HEIGHT = 88

export function BookingStatsCard({
  bookingsPerDay,
  totalUpcomingBookings,
}: BookingStatsCardProps) {
  const maxCount = Math.max(...bookingsPerDay.map((d) => d.count), 1)
  const totalThisWeek = bookingsPerDay.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="size-4 text-muted-foreground" />
          Bookings
        </CardTitle>
        <CardDescription>Activity overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-muted p-3">
            <p className="text-muted-foreground">Last 7 days</p>
            <p className="font-semibold text-base flex items-center gap-1.5 mt-0.5">
              <BookmarkIcon className="size-3.5 text-muted-foreground" />
              {totalThisWeek} {totalThisWeek === 1 ? 'session' : 'sessions'}
            </p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-muted-foreground">Upcoming</p>
            <p className="font-semibold text-base flex items-center gap-1.5 mt-0.5">
              <BookmarkIcon className="size-3.5 text-muted-foreground" />
              {totalUpcomingBookings}{' '}
              {totalUpcomingBookings === 1 ? 'session' : 'sessions'}
            </p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-2 h-32">
          {bookingsPerDay.map((day) => {
            const heightPct = (day.count / maxCount) * 100
            const label = format(parseISO(day.date), 'EEE')
            return (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium text-foreground">
                  {day.count > 0 ? day.count : ''}
                </span>
                <div
                  className="w-full flex items-end"
                  style={{ height: BAR_AREA_HEIGHT }}>
                  <div
                    className="w-full rounded-t-sm bg-primary transition-all"
                    style={{
                      height: `${Math.max(heightPct, day.count > 0 ? 6 : 2)}%`,
                      opacity: day.count > 0 ? 1 : 0.2,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
