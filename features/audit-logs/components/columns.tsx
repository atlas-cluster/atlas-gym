'use client'

import { format } from 'date-fns'
import { ArrowUpDown } from 'lucide-react'

import { AuditLogDisplay } from '@/features/audit-logs/types'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { cn } from '@/features/shared/lib/utils'
import { ColumnDef } from '@tanstack/react-table'

const actionColorMap = {
  CREATE: 'bg-green-500/10 text-green-700 dark:text-green-400',
  UPDATE: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  DELETE: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

export const columns: ColumnDef<AuditLogDisplay>[] = [
  {
    id: 'timestamp',
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Timestamp
          <ArrowUpDown />
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
    id: 'memberName',
    accessorKey: 'memberName',
    header: 'Member',
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue('memberName')}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const action = row.getValue('action') as keyof typeof actionColorMap
      return (
        <Badge variant="outline" className={actionColorMap[action]}>
          {action}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'entityType',
    accessorKey: 'entityType',
    header: 'Entity Type',
    cell: ({ row }) => {
      return <div className="capitalize">{row.getValue('entityType')}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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
