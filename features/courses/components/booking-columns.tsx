import { CourseBookingDisplay } from '@/features/courses'
import { ColumnDef, Row } from '@tanstack/table-core'

const facetedFilter = (
  row: Row<CourseBookingDisplay>,
  columnId: string,
  filterValues: string[]
) => {
  if (!filterValues?.length) return true
  return filterValues.includes(String(row.getValue(columnId) ?? ''))
}

export const bookingColumns: ColumnDef<CourseBookingDisplay>[] = [
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
    accessorKey: 'sessionDate',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'startTime',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
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
]
