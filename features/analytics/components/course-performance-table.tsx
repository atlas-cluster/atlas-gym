'use client'

import { Dumbbell } from 'lucide-react'

import type { CoursePerformanceRow } from '@/features/analytics/types'
import { BannerImage } from '@/features/shared/components/banner-image'
import { Badge } from '@/features/shared/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'
import { cn } from '@/features/shared/lib/utils'

interface CoursePerformanceTableProps {
  data: CoursePerformanceRow[]
}

export function CoursePerformanceTable({ data }: CoursePerformanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Trainer</TableHead>
          <TableHead className="text-right">Sessions</TableHead>
          <TableHead className="text-right">Bookings</TableHead>
          <TableHead className="text-right">Avg / Session</TableHead>
          <TableHead className="text-right">Cancel Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.name}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                {row.bannerImageUrl ? (
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
                    <BannerImage
                      src={row.bannerImageUrl}
                      alt={row.name}
                      className="h-8 w-8 object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <span className="font-medium">{row.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.trainerName ?? '\u2014'}
            </TableCell>
            <TableCell className="text-right">{row.totalSessions}</TableCell>
            <TableCell className="text-right">
              <Badge variant="secondary">{row.totalBookings}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {row.avgBookingsPerSession}
            </TableCell>
            <TableCell className="text-right">
              <span
                className={cn(
                  'text-xs font-medium',
                  row.cancellationRate === 0
                    ? 'text-muted-foreground'
                    : row.cancellationRate < 5
                      ? 'text-emerald-600'
                      : row.cancellationRate < 15
                        ? 'text-amber-600'
                        : 'text-red-500'
                )}>
                {row.cancellationRate}%
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
