'use client'

import { AnalyticsGrid } from '@/features/analytics/components/analytics-grid'
import type { AnalyticsData } from '@/features/analytics/types'

export function AnalyticsController({ data }: { data: AnalyticsData }) {
  return <AnalyticsGrid data={data} />
}
