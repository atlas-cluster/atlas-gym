'use client'

import { Trophy } from 'lucide-react'

import type { TrainerLeaderboardRow } from '@/features/analytics/types'
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

interface TrainerLeaderboardProps {
  data: TrainerLeaderboardRow[]
}

const MEDAL_COLORS = ['text-yellow-500', 'text-zinc-400', 'text-amber-700']

export function TrainerLeaderboard({ data }: TrainerLeaderboardProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Trainer</TableHead>
          <TableHead className="text-right">Sessions</TableHead>
          <TableHead className="text-right">Bookings</TableHead>
          <TableHead className="text-right">Avg / Session</TableHead>
          <TableHead className="text-right">Cancel Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={row.name}>
            <TableCell>
              {i < 3 ? (
                <Trophy className={cn('h-4 w-4', MEDAL_COLORS[i])} />
              ) : (
                <span className="text-muted-foreground text-sm">{i + 1}</span>
              )}
            </TableCell>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell className="text-right">{row.sessionsTaught}</TableCell>
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
