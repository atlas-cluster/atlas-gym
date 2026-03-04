'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import type { RoomUtilizationRow } from '@/features/analytics/types'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/features/shared/components/ui/chart'

const chartConfig = {
  totalSessions: {
    label: 'Sessions',
    color: 'var(--primary)',
  },
  totalBookings: {
    label: 'Bookings',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

interface RoomUtilizationChartProps {
  data: RoomUtilizationRow[]
}

export function RoomUtilizationChart({ data }: RoomUtilizationChartProps) {
  const chartHeight = Math.max(200, data.length * 50 + 20)

  return (
    <ChartContainer
      config={chartConfig}
      className="w-full"
      style={{ height: chartHeight }}>
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={100}
          tickFormatter={(v) => (v.length > 14 ? v.slice(0, 12) + '…' : v)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar
          dataKey="totalSessions"
          fill="var(--color-totalSessions)"
          radius={[0, 4, 4, 0]}
          barSize={14}
        />
        <Bar
          dataKey="totalBookings"
          fill="var(--color-totalBookings)"
          radius={[0, 4, 4, 0]}
          barSize={14}
        />
      </BarChart>
    </ChartContainer>
  )
}
