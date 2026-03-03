'use client'

import { format, parseISO } from 'date-fns'
import { BookmarkIcon, TrendingUpIcon } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { BookingDayStat } from '@/features/dashboard/actions/get-dashboard-stats'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/features/shared/components/ui/chart'

interface BookingStatsCardProps {
  bookingsPerDay: BookingDayStat[]
  totalUpcomingBookings: number
}

const chartConfig = {
  bookings: {
    label: 'Bookings',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

export function BookingStatsCard({
  bookingsPerDay,
  totalUpcomingBookings,
}: BookingStatsCardProps) {
  const totalThisWeek = bookingsPerDay.reduce((sum, d) => sum + d.count, 0)

  const chartData = bookingsPerDay.map((d) => ({
    day: format(parseISO(d.date), 'EEE'),
    bookings: d.count,
  }))

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="size-4 text-muted-foreground" />
          Bookings
        </CardTitle>
        <CardDescription>Activity overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
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

        {/* Line chart */}
        <ChartContainer config={chartConfig} className="flex-1 w-full min-h-0">
          <LineChart data={chartData} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="bookings"
              type="monotone"
              stroke="var(--color-bookings)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-bookings)', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
