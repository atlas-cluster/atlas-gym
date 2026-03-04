'use client'

import type { PlanRankingRow } from '@/features/analytics/types'
import { Badge } from '@/features/shared/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'

interface PlanRankingTableProps {
  data: PlanRankingRow[]
}

export function PlanRankingTable({ data }: PlanRankingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Subscribers</TableHead>
          <TableHead className="text-right">MRR</TableHead>
          <TableHead className="text-right">Avg Tenure</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={row.name}>
            <TableCell className="font-medium">{i + 1}</TableCell>
            <TableCell>
              <span className="font-medium">{row.name}</span>
            </TableCell>
            <TableCell className="text-right">
              {row.price.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </TableCell>
            <TableCell className="text-right">
              <Badge variant="secondary">{row.subscribers}</Badge>
            </TableCell>
            <TableCell className="text-right font-medium">
              {row.mrr.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {row.avgTenureMonths}mo
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
