'use client'

import type { RevenueByPlan } from '@/features/analytics/types'
import { cn } from '@/features/shared/lib/utils'

interface RevenueByPlanChartProps {
  data: RevenueByPlan[]
}

export function RevenueByPlanChart({ data }: RevenueByPlanChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="grid gap-2.5">
      {data.map((item, i) => {
        const pct =
          totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0
        return (
          <div key={item.name} className="grid gap-1">
            <div className="flex items-center justify-between text-sm">
              <span
                className={cn(
                  'truncate',
                  i < 3 ? 'font-medium' : 'text-muted-foreground'
                )}>
                {item.name}
              </span>
              <span className="ml-2 shrink-0 tabular-nums text-muted-foreground">
                €
                {item.revenue.toLocaleString('de-DE', {
                  minimumFractionDigits: 0,
                })}{' '}
                <span className="text-xs">({pct}%)</span>
              </span>
            </div>
            <div className="bg-muted/40 h-1.5 w-full rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
