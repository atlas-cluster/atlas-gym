'use client'

import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import type { BookingsTrendPoint } from '@/features/analytics/types'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/features/shared/components/ui/chart'

const chartConfig = {
  bookings: {
    label: 'Bookings',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface BookingsTrendChartProps {
  data: BookingsTrendPoint[]
}

export function BookingsTrendChart({ data }: BookingsTrendChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-52 w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          fontSize={11}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <defs>
          <linearGradient id="fillBookingsTrend" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-bookings)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-bookings)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="bookings"
          type="monotone"
          fill="url(#fillBookingsTrend)"
          fillOpacity={0.4}
          stroke="var(--color-bookings)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
