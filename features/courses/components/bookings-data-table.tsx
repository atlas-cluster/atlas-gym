'use client'

import {
  BookmarkMinusIcon,
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  MapPinIcon,
  RefreshCwIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { CourseBookingDisplay } from '@/features/courses'
import { cancelBooking } from '@/features/courses/actions/cancel-booking'
import { getMyBookings } from '@/features/courses/actions/get-my-bookings'
import { bookingColumns } from '@/features/courses/components/booking-columns'
import { BannerImage } from '@/features/shared/components/banner-image'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
import { DataTablePagination } from '@/features/shared/components/data-table-pagination'
import { DataTableSortDropdown } from '@/features/shared/components/data-table-sort-dropdown'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import { Calendar } from '@/features/shared/components/ui/calendar'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/components/ui/tooltip'
import { cn } from '@/features/shared/lib/utils'
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

interface BookingsDataTableProps {
  data: CourseBookingDisplay[]
}

export function BookingsDataTable({ data }: BookingsDataTableProps) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<CourseBookingDisplay[]>(data)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 })

  useEffect(() => {
    setTableData(data)
  }, [data])

  const formatDateParam = useCallback((date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }, [])

  const fetchBookings = useCallback(
    (date: Date | null) => {
      startTransition(async () => {
        const result = await getMyBookings(
          date ? formatDateParam(date) : undefined
        )
        setTableData(result)
      })
    },
    [formatDateParam]
  )

  const onRefresh = () => fetchBookings(selectedDate)

  const onDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      fetchBookings(date)
    }
    setCalendarOpen(false)
  }

  const onShowAll = () => {
    setSelectedDate(null)
    fetchBookings(null)
  }

  const dateLabel = (() => {
    if (!selectedDate) return 'All upcoming'
    const today = new Date()
    if (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    )
      return 'Today'
    return `${selectedDate.getDate().toString().padStart(2, '0')}.${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}.${selectedDate.getFullYear()}`
  })()

  const handleCancel = (booking: CourseBookingDisplay) => {
    const promise = cancelBooking(booking.id).then((result) => {
      if (!result.success) throw new Error(result.message)
      fetchBookings(selectedDate)
      return result
    })
    toast.promise(promise, {
      loading: 'Cancelling booking...',
      success: (r) => r.message,
      error: (err) => err?.message || 'Failed to cancel booking',
    })
  }

  const sortItems = [
    { id: 'name', label: 'Name' },
    { id: 'sessionDate', label: 'Date' },
    { id: 'startTime', label: 'Start Time' },
    { id: 'trainerName', label: 'Trainer' },
  ]

  const trainerOptions = useMemo(() => {
    const unique = [
      ...new Set(tableData.map((d) => d.trainerName).filter(Boolean)),
    ] as string[]
    return unique.sort().map((n) => ({ value: n, label: n }))
  }, [tableData])

  const trainerFacets = useMemo(() => {
    const c = new Map<string, number>()
    for (const r of tableData)
      if (r.trainerName) c.set(r.trainerName, (c.get(r.trainerName) ?? 0) + 1)
    return c
  }, [tableData])

  const roomOptions = useMemo(() => {
    const unique = [
      ...new Set(tableData.map((d) => d.roomName).filter(Boolean)),
    ] as string[]
    return unique.sort().map((n) => ({ value: n, label: n }))
  }, [tableData])

  const roomFacets = useMemo(() => {
    const c = new Map<string, number>()
    for (const r of tableData)
      if (r.roomName) c.set(r.roomName, (c.get(r.roomName) ?? 0) + 1)
    return c
  }, [tableData])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns: bookingColumns,
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
    autoResetPageIndex: false,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: { sorting, columnFilters, rowSelection, globalFilter, pagination },
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter, columnFilters])

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-')
    return `${d}.${m}.${y}`
  }

  function formatTime(time: string) {
    return time.slice(0, 5)
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            <Input
              className="hidden md:flex"
              placeholder="Search bookings..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            <div className="flex w-full gap-2 md:hidden">
              <ButtonGroup className="flex-1">
                <Input
                  placeholder="Search bookings..."
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
                  onClick={onRefresh}>
                  <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </ButtonGroup>
            </div>
          </div>

          {/* Date picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-40 justify-between font-normal"
                suppressHydrationWarning>
                {dateLabel}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={onDateSelect}
              />
              {selectedDate && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={onShowAll}>
                    Show all upcoming
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {trainerOptions.length > 0 && (
            <DataTableFacetedFilter
              title="Trainer"
              column={table.getColumn('trainerName')}
              options={trainerOptions}
              facets={trainerFacets}
            />
          )}
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
              size="icon"
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
              }}
              suppressHydrationWarning>
              <XIcon />
              <span className="sr-only">Clear filters</span>
            </Button>
          )}
        </div>

        <div className="hidden md:flex gap-2">
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
              onClick={onRefresh}>
              <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
              <span className="sr-only">Refresh</span>
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {table.getRowModel().rows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {table.getRowModel().rows.map((row) => {
            const booking = row.original
            return (
              <Card
                key={row.id}
                className={cn(
                  'gap-0',
                  booking.isCancelled ? 'opacity-60' : '',
                  booking.bannerImageUrl ? 'pt-0' : ''
                )}>
                {booking.bannerImageUrl && (
                  <BannerImage
                    src={booking.bannerImageUrl}
                    alt={booking.name}
                  />
                )}
                <CardHeader className={'mt-3'}>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      {booking.name}
                      {booking.isCancelled && (
                        <Badge variant="destructive" className="text-xs">
                          Cancelled
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {booking.description || 'No description'}
                    </CardDescription>
                  </div>
                  {!booking.isCancelled && (
                    <CardAction>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            suppressHydrationWarning
                            onClick={() => handleCancel(booking)}>
                            <BookmarkMinusIcon />
                            <span className="sr-only">Cancel booking</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cancel booking</TooltipContent>
                      </Tooltip>
                    </CardAction>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatDate(booking.sessionDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {formatTime(booking.startTime)} –{' '}
                      {formatTime(booking.endTime)}
                    </span>
                  </div>
                  {booking.trainerName && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{booking.trainerName}</span>
                    </div>
                  )}
                  {booking.roomName && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{booking.roomName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {globalFilter || table.getState().columnFilters.length > 0
              ? 'No bookings found matching your filters.'
              : 'You have no upcoming bookings.'}
          </p>
        </div>
      )}
      <DataTablePagination table={table} pageSizes={[6, 9, 12, 24, 48]} />
    </div>
  )
}
