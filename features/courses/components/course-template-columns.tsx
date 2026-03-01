import { CourseTemplateDisplay } from '@/features/courses'
import { ColumnDef, Row } from '@tanstack/table-core'

const weekDaysFilter = (
  row: Row<CourseTemplateDisplay>,
  _columnId: string,
  filterValues: string[]
) => {
  if (!filterValues?.length) return true
  const days = row.original.weekDays
  const arr = Array.isArray(days)
    ? days
    : String(days).replace(/[{}]/g, '').split(',').filter(Boolean)
  return filterValues.some((v) => arr.includes(v))
}

const facetedFilter = (
  row: Row<CourseTemplateDisplay>,
  columnId: string,
  filterValues: string[]
) => {
  if (!filterValues?.length) return true
  return filterValues.includes(String(row.getValue(columnId)))
}

export const courseTemplateColumns: ColumnDef<CourseTemplateDisplay>[] = [
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
    accessorKey: 'weekDays',
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    filterFn: weekDaysFilter,
  },
  {
    accessorKey: 'startTime',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'endTime',
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: false,
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
