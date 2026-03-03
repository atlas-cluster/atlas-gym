import { format, parseISO } from 'date-fns'
import { TrendingUpIcon } from 'lucide-react'

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
}

const BAR_AREA_HEIGHT = 88

export function BookingStatsCard({ bookingsPerDay }: BookingStatsCardProps) {
  const maxCount = Math.max(...bookingsPerDay.map((d) => d.count), 1)
  const total = bookingsPerDay.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="size-4 text-muted-foreground" />
          Bookings — Last 7 Days
        </CardTitle>
        <CardDescription>{total} total bookings this week</CardDescription>
      </CardHeader>
      <CardContent>
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
