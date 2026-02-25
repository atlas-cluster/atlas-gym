import { PlanDisplay } from '@/features/plans'
import { ColumnDef } from '@tanstack/table-core'

export const columns: ColumnDef<PlanDisplay>[] = [
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
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'minDurationMonths',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
    minSize: 1,
    maxSize: 24,
  },
  {
    accessorKey: 'description',
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'subscriptionCount',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
  },
]
