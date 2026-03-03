'use client'

import { DashboardGrid } from '@/features/dashboard/components/dashboard-grid'
import type { DashboardData } from '@/features/dashboard/types'

export function DashboardController({ data }: { data: DashboardData }) {
  return (
    <>
      <DashboardGrid data={data} />
    </>
  )
}
