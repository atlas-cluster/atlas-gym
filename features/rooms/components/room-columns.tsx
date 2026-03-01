import { RoomDisplay } from '@/features/rooms/types'
import { ColumnDef } from '@tanstack/table-core'

export const roomColumns: ColumnDef<RoomDisplay>[] = [
  {
    accessorKey: 'name',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'description',
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'sessions',
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
