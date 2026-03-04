'use client'

import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import type { ChurnChartPoint } from '@/features/analytics/types'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/features/shared/components/ui/chart'

const chartConfig = {
  churned: {
    label: 'Cancelled',
    color: 'var(--destructive)',
  },
  newSubs: {
    label: 'New Subscriptions',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface ChurnRateChartProps {
  data: ChurnChartPoint[]
}

export function ChurnRateChart({ data }: ChurnRateChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-52 w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
        <XAxis
          dataKey="month"
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
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-newSubs)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-newSubs)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillChurned" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-churned)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-churned)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="newSubs"
          type="monotone"
          fill="url(#fillNew)"
          fillOpacity={0.4}
          stroke="var(--color-newSubs)"
          strokeWidth={2}
        />
        <Area
          dataKey="churned"
          type="monotone"
          fill="url(#fillChurned)"
          fillOpacity={0.4}
          stroke="var(--color-churned)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
