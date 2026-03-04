'use client'

import type { PaymentMethodItem } from '@/features/analytics/types'
import { cn } from '@/features/shared/lib/utils'

interface PaymentMethodChartProps {
  data: PaymentMethodItem[]
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="grid gap-4">
      {data.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
        return (
          <div key={item.method} className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.method}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {item.count} <span className="text-xs">({pct}%)</span>
              </span>
            </div>
            <div className="bg-muted/40 h-2.5 w-full rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all bg-primary')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
