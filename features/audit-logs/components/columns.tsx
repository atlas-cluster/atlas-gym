'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { AuditLogDisplay } from '@/features/audit-logs/types'
import { Button } from '@/features/shared/components/ui/button'
import { Badge } from '@/features/shared/components/ui/badge'

const actionColorMap = {
  CREATE: 'bg-green-500/10 text-green-700 dark:text-green-400',
  UPDATE: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  DELETE: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

export const columns: ColumnDef<AuditLogDisplay>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return (
        <div className="text-sm">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      )
    },
  },
  {
    accessorKey: 'memberName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Member
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('memberName')}</div>
    },
  },
  {
    accessorKey: 'action',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Action
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const action = row.getValue('action') as keyof typeof actionColorMap
      return (
        <Badge variant="outline" className={actionColorMap[action]}>
          {action}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'entityType',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Entity Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="capitalize">{row.getValue('entityType')}</div>
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="max-w-[500px]">{row.getValue('description')}</div>
    },
  },
]
