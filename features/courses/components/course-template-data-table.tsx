'use client'

import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'

import { CourseTemplateDisplay, Weekday } from '@/features/courses'
import { getCourseTemplates } from '@/features/courses/actions/get-course-templates'
import { courseTemplateColumns } from '@/features/courses/components/course-template-columns'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
import { DataTablePagination } from '@/features/shared/components/data-table-pagination'
import { DataTableSortDropdown } from '@/features/shared/components/data-table-sort-dropdown'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { Input } from '@/features/shared/components/ui/input'
import {
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  getCoreRowModel,
  getFacetedRowModel,
} from '@tanstack/table-core'

const WEEKDAY_SHORT: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

const ALL_WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

function parseWeekDays(value: unknown): string[] {
  if (Array.isArray(value)) return value
  return String(value).replace(/[{}]/g, '').split(',').filter(Boolean)
}

interface CourseTemplatesDataTableProps {
  data: CourseTemplateDisplay[]
  onCreate: () => void
  onEdit: (courseTemplate: CourseTemplateDisplay) => void
  onDelete: (courseTemplate: CourseTemplateDisplay) => void
}

export function CourseTemplatesDataTable({
  data,
  onCreate,
  onEdit,
  onDelete,
}: CourseTemplatesDataTableProps) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<CourseTemplateDisplay[]>(data)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 9 })

  useEffect(() => {
    setTableData(data)
  }, [data])

  const onRefreshCourses = () => {
    startTransition(async () => {
      const result = await getCourseTemplates()
      setTableData(result)
    })
  }

  const sortItems = [
    { id: 'name', label: 'Name' },
    { id: 'startTime', label: 'Start Time' },
    { id: 'trainerName', label: 'Trainer' },
    { id: 'startDate', label: 'Start Date' },
  ]

  const weekdayOptions = useMemo(
    () =>
      ALL_WEEKDAYS.map((day) => ({
        value: day,
        label: day.charAt(0).toUpperCase() + day.slice(1),
      })),
    []
  )

  const weekdayFacets = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of tableData) {
      const days = parseWeekDays(row.weekDays)
      for (const day of days) {
        counts.set(day, (counts.get(day) ?? 0) + 1)
      }
    }
    return counts
  }, [tableData])

  const trainerOptions = useMemo(() => {
    const unique = [...new Set(tableData.map((d) => d.trainerName))]
    return unique.sort().map((name) => ({ value: name, label: name }))
  }, [tableData])

  const trainerFacets = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of tableData) {
      counts.set(row.trainerName, (counts.get(row.trainerName) ?? 0) + 1)
    }
    return counts
  }, [tableData])

  const roomOptions = useMemo(() => {
    const unique = [
      ...new Set(tableData.map((d) => d.roomName).filter(Boolean)),
    ] as string[]
    return unique.sort().map((name) => ({ value: name, label: name }))
  }, [tableData])

  const roomFacets = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of tableData) {
      if (row.roomName) {
        counts.set(row.roomName, (counts.get(row.roomName) ?? 0) + 1)
      }
    }
    return counts
  }, [tableData])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns: courseTemplateColumns,

    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: true,

    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter, columnFilters])

  function formatDate(date: Date | undefined) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  function formatTime(time: string) {
    return time.slice(0, 5)
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/* Desktop: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search courses..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            {/* Mobile: Show input and buttons */}
            <div className={'flex w-full gap-2 md:hidden'}>
              <ButtonGroup className="flex-1">
                <Input
                  placeholder="Search courses..."
                  value={globalFilter}
                  onChange={(e) =>
                    table.setGlobalFilter(String(e.target.value))
                  }
                />
                <DataTableSortDropdown
                  table={table}
                  align="start"
                  items={sortItems}
                />
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  disabled={isPending}
                  suppressHydrationWarning
                  onClick={onRefreshCourses}>
                  <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                  <span className={'sr-only'}>Refresh Data</span>
                </Button>
              </ButtonGroup>
              <Button
                variant="default"
                size="icon"
                type="button"
                suppressHydrationWarning
                onClick={onCreate}>
                <PlusIcon />
                <span className="sr-only">Create Course</span>
              </Button>
            </div>
          </div>

          {/* Faceted Filters */}
          <DataTableFacetedFilter
            title="Weekday"
            column={table.getColumn('weekDays')}
            options={weekdayOptions}
            facets={weekdayFacets}
          />

          <DataTableFacetedFilter
            title="Trainer"
            column={table.getColumn('trainerName')}
            options={trainerOptions}
            facets={trainerFacets}
          />

          {roomOptions.length > 0 && (
            <DataTableFacetedFilter
              title="Room"
              column={table.getColumn('roomName')}
              options={roomOptions}
              facets={roomFacets}
            />
          )}

          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
              }}
              suppressHydrationWarning>
              <XIcon />
              <span className={'sr-only'}>Clear filters</span>
            </Button>
          )}
        </div>

        {/* Desktop: Show sorting and action buttons on the right */}
        <div className={'hidden md:flex gap-2'}>
          <ButtonGroup>
            <DataTableSortDropdown
              table={table}
              align="end"
              items={sortItems}
            />

            <Button
              variant="outline"
              size="icon"
              type="button"
              disabled={isPending}
              suppressHydrationWarning
              onClick={onRefreshCourses}>
              <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
              <span className={'sr-only'}>Refresh Data</span>
            </Button>
          </ButtonGroup>
          <Button
            variant="default"
            size="default"
            type="button"
            suppressHydrationWarning
            onClick={onCreate}>
            <PlusIcon />
            <span className="hidden md:inline">Create Course</span>
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      {table.getRowModel().rows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {table.getRowModel().rows.map((row) => (
            <Card key={row.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {row.original.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {row.original.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <CardAction>
                  <ButtonGroup>
                    <Button
                      variant="ghost"
                      size="icon"
                      suppressHydrationWarning
                      onClick={() => onEdit(row.original)}>
                      <PencilIcon />
                      <span className="sr-only">Edit course</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      suppressHydrationWarning
                      onClick={() => onDelete(row.original)}>
                      <TrashIcon />
                      <span className="sr-only">Delete course</span>
                    </Button>
                  </ButtonGroup>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {parseWeekDays(row.original.weekDays).map((day) => (
                    <Badge key={day} variant="secondary" className="text-xs">
                      {WEEKDAY_SHORT[day] ?? day}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {formatTime(row.original.startTime)} –{' '}
                    {formatTime(row.original.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {formatDate(row.original.startDate)}
                    {row.original.endDate
                      ? ` – ${formatDate(row.original.endDate)}`
                      : ' – ongoing'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{row.original.trainerName}</span>
                </div>
                {row.original.roomName && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{row.original.roomName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {globalFilter || table.getState().columnFilters.length > 0
              ? 'No courses found matching your filters.'
              : 'No courses available.'}
          </p>
        </div>
      )}
      <DataTablePagination table={table} pageSizes={[6, 9, 12, 24, 48]} />
    </div>
  )
}
