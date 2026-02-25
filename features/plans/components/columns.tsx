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
    accessorKey: 'subscriptionCount',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
