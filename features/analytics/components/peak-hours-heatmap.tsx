'use client'

import type { PeakHourCell } from '@/features/analytics/types'
import { cn } from '@/features/shared/lib/utils'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface PeakHoursHeatmapProps {
  data: PeakHourCell[]
}

export function PeakHoursHeatmap({ data }: PeakHoursHeatmapProps) {
  // Build a lookup map
  const map = new Map<string, number>()
  let maxVal = 0
  for (const cell of data) {
    const key = `${cell.weekday}-${cell.hour}`
    map.set(key, cell.bookings)
    if (cell.bookings > maxVal) maxVal = cell.bookings
  }

  // Find the range of hours that have data
  const hours = Array.from(new Set(data.map((d) => d.hour))).sort(
    (a, b) => a - b
  )
  const minHour = hours.length > 0 ? hours[0] : 6
  const maxHour = hours.length > 0 ? hours[hours.length - 1] : 22
  const hourRange: number[] = []
  for (let h = minHour; h <= maxHour; h++) {
    hourRange.push(h)
  }

  function getOpacity(value: number) {
    if (maxVal === 0 || value === 0) return 0
    return 0.15 + (value / maxVal) * 0.85
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid gap-1" style={{ minWidth: hourRange.length * 36 }}>
        {/* Header row with hours */}
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `48px repeat(${hourRange.length}, 1fr)`,
          }}>
          <div />
          {hourRange.map((h) => (
            <div
              key={h}
              className="text-center text-[10px] text-muted-foreground font-medium">
              {h}:00
            </div>
          ))}
        </div>

        {/* Data rows: Mon-Sun (reorder so Mon=1 is first) */}
        {[1, 2, 3, 4, 5, 6, 0].map((dow) => (
          <div
            key={dow}
            className="grid gap-1"
            style={{
              gridTemplateColumns: `48px repeat(${hourRange.length}, 1fr)`,
            }}>
            <div className="flex items-center text-xs font-medium text-muted-foreground">
              {WEEKDAY_LABELS[dow]}
            </div>
            {hourRange.map((h) => {
              const value = map.get(`${dow}-${h}`) ?? 0
              return (
                <div
                  key={h}
                  className={cn(
                    'flex items-center justify-center rounded-sm text-[10px] h-7',
                    value > 0
                      ? 'text-primary-foreground font-medium'
                      : 'bg-muted/40'
                  )}
                  style={
                    value > 0
                      ? {
                          backgroundColor: `color-mix(in srgb, var(--primary) ${Math.round(getOpacity(value) * 100)}%, transparent)`,
                        }
                      : undefined
                  }
                  title={`${WEEKDAY_LABELS[dow]} ${h}:00 — ${value} bookings`}>
                  {value > 0 ? value : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
