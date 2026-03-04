'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import type { MemberAgeBucket } from '@/features/analytics/types'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/features/shared/components/ui/chart'

const chartConfig = {
  count: {
    label: 'Members',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface AgeDistributionChartProps {
  data: MemberAgeBucket[]
}

export function AgeDistributionChart({ data }: AgeDistributionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-52 w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
        <XAxis
          dataKey="bucket"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tickMargin={8}
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
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
