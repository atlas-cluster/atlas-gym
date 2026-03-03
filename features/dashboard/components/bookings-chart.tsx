'use client'

import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from 'recharts'

import type { BookingsChartPoint } from '@/features/dashboard/types'
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

interface BookingsChartProps {
  data: BookingsChartPoint[]
}

export function BookingsChart({ data }: BookingsChartProps) {
  const todayLabel = data.find((d) => d.isToday)?.day

  return (
    <ChartContainer config={chartConfig} className="h-32.5 w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 0, right: 0, bottom: -10, left: 0 }}>
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={5}
          interval="preserveStartEnd"
          fontSize={10}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          hide={true}
          fontSize={10}
          domain={[0, 'auto']}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        {todayLabel && (
          <ReferenceLine
            x={todayLabel}
            stroke="var(--destructive)"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
        )}
        <defs>
          <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
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
          fill="url(#fillBookings)"
          fillOpacity={0.4}
          stroke="var(--color-bookings)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
