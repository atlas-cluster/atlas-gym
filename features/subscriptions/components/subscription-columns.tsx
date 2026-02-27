import { SubscriptionDisplay } from '@/features/subscriptions'
import { ColumnDef } from '@tanstack/table-core'

export const subscriptionColumns: ColumnDef<SubscriptionDisplay>[] = [
  {
    accessorKey: 'name',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'price',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'minDurationMonths',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'description',
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'startDate',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'endDate',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'status',
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
