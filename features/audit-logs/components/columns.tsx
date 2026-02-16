'use client'

import { format } from 'date-fns'
import { ArrowDown, ArrowUp, ArrowUpDown, Database } from 'lucide-react'

import { Action, AuditLog, entityIcons } from '@/features/audit-logs/types'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<AuditLog>[] = [
  {
    id: 'timestamp',
    accessorKey: 'timestamp',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Timestamp
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown />
          ) : (
            <ArrowUpDown />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('timestamp'))
      return <span className="ml-3">{format(date, 'dd.MM.yyyy HH:mm')}</span>
    },
    enableSorting: true,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    id: 'member',
    accessorKey: 'member',
    header: 'Member',
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue('member')}</span>
    },
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const action = row.getValue('action') as Action
      return (
        <Badge
          variant={action === 'DELETE' ? 'destructive' : 'default'}
          className={
            action === 'UPDATE' ? 'bg-chart-1 text-secondary-foreground' : ''
          }>
          {action}
        </Badge>
      )
    },
  },
  {
    id: 'entity',
    accessorKey: 'entity',
    header: 'Entity',
    cell: ({ row }) => {
      const entity = row.getValue('entity') as string
      const Icon = entityIcons[entity] || Database

      return (
        <div className="flex items-center gap-2 capitalize">
          <Icon className="size-5" />
          {entity}
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      return <span className="max-w-125">{row.getValue('description')}</span>
    },
  },
]
