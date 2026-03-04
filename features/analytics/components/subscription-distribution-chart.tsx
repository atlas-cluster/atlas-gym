'use client'

import type { SubscriptionDistributionItem } from '@/features/analytics/types'
import { cn } from '@/features/shared/lib/utils'

interface SubscriptionDistributionChartProps {
  data: SubscriptionDistributionItem[]
}

export function SubscriptionDistributionChart({
  data,
}: SubscriptionDistributionChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="grid gap-2.5">
      {data.map((item, i) => {
        const pct = Math.round((item.count / total) * 100)
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
                {item.count} <span className="text-xs">({pct}%)</span>
              </span>
            </div>
            <div className="bg-muted/40 h-1.5 w-full rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
