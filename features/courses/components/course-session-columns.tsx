import { CourseSessionDisplay } from '@/features/courses'
import { ColumnDef, Row } from '@tanstack/table-core'

const facetedFilter = (
  row: Row<CourseSessionDisplay>,
  columnId: string,
  filterValues: string[]
) => {
  if (!filterValues?.length) return true
  return filterValues.includes(String(row.getValue(columnId) ?? ''))
}

export const courseSessionColumns: ColumnDef<CourseSessionDisplay>[] = [
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
    accessorKey: 'trainerName',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
    filterFn: facetedFilter,
  },
  {
    accessorKey: 'roomName',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
    filterFn: facetedFilter,
  },
  {
    accessorKey: 'startTime',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'bookingCount',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
