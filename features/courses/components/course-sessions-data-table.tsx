'use client'

import {
  BanIcon,
  BookmarkIcon,
  BookmarkMinusIcon,
  ChevronDownIcon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/features/auth'
import { CourseSessionDisplay } from '@/features/courses'
import { cancelBooking } from '@/features/courses/actions/cancel-booking'
import { cancelSession } from '@/features/courses/actions/cancel-session'
import { createBooking } from '@/features/courses/actions/create-booking'
import { getCourseSessions } from '@/features/courses/actions/get-course-sessions'
import { uncancelSession } from '@/features/courses/actions/uncancel-session'
import { courseSessionColumns } from '@/features/courses/components/course-session-columns'
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

interface CourseSessionsDataTableProps {
  data: CourseSessionDisplay[]
  onEditSession: (session: CourseSessionDisplay) => void
}

export function CourseSessionsDataTable({
  data,
  onEditSession,
}: CourseSessionsDataTableProps) {
  const [isPending, startTransition] = useTransition()
  const { member } = useAuth()
  const isTrainer = member?.isTrainer ?? false
  const [tableData, setTableData] = useState<CourseSessionDisplay[]>(data)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 })

  useEffect(() => {
    setTableData(data)
  }, [data])

  const isToday = useCallback(() => {
    const today = new Date()
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    )
  }, [selectedDate])

  const fetchSessionsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    startTransition(async () => {
      const result = await getCourseSessions(dateStr)
      setTableData(result)
    })
  }

  const onRefresh = () => fetchSessionsForDate(selectedDate)

  const onDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      fetchSessionsForDate(date)
    }
    setCalendarOpen(false)
  }

  const handleBook = (session: CourseSessionDisplay) => {
    const promise = createBooking(session.id).then((r) => {
      if (!r.success) throw new Error(r.message)
      fetchSessionsForDate(selectedDate)
      return r
    })
    toast.promise(promise, {
      loading: 'Booking session...',
      success: (r) => r.message,
      error: (err) => err?.message || 'Failed to book',
    })
  }

  const handleUnbook = (session: CourseSessionDisplay) => {
    if (!session.myBookingId) return
    const promise = cancelBooking(session.myBookingId).then((r) => {
      if (!r.success) throw new Error(r.message)
      fetchSessionsForDate(selectedDate)
      return r
    })
    toast.promise(promise, {
      loading: 'Cancelling booking...',
      success: (r) => r.message,
      error: (err) => err?.message || 'Failed to cancel booking',
    })
  }

  const handleCancelSession = (session: CourseSessionDisplay) => {
    const promise = cancelSession(session.id, session.updatedAt).then((r) => {
      if (!r.success) throw new Error(r.message)
      fetchSessionsForDate(selectedDate)
      return r
    })
    toast.promise(promise, {
      loading: 'Cancelling session...',
      success: (r) => r.message,
      error: (err) => err?.message || 'Failed to cancel session',
    })
  }

  const handleUncancelSession = (session: CourseSessionDisplay) => {
    const promise = uncancelSession(session.id, session.updatedAt).then((r) => {
      if (!r.success) throw new Error(r.message)
      fetchSessionsForDate(selectedDate)
      return r
    })
    toast.promise(promise, {
      loading: 'Restoring session...',
      success: (r) => r.message,
      error: (err) => err?.message || 'Failed to restore session',
    })
  }

  const sortItems = [
    { id: 'name', label: 'Name' },
    { id: 'startTime', label: 'Start Time' },
    { id: 'trainerName', label: 'Trainer' },
    { id: 'bookingCount', label: 'Bookings' },
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
    columns: courseSessionColumns,
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
    state: { sorting, columnFilters, rowSelection, globalFilter, pagination },
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter, columnFilters])

  const fmt = (d: Date) => {
    const dt = new Date(d)
    return `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            <Input
              className="hidden md:flex"
              placeholder="Search courses..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            <div className="flex w-full gap-2 md:hidden">
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
                  onClick={onRefresh}>
                  <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </ButtonGroup>
            </div>
          </div>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-40 justify-between font-normal"
                suppressHydrationWarning>
                {isToday()
                  ? 'Today'
                  : `${selectedDate.getDate().toString().padStart(2, '0')}.${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}.${selectedDate.getFullYear()}`}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onDateSelect}
              />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {table.getRowModel().rows.map((row) => {
            const s = row.original
            return (
              <Card key={row.id} className={s.isCancelled ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      {s.name}
                      {s.isCancelled && (
                        <Badge variant="destructive" className="text-xs">
                          Cancelled
                        </Badge>
                      )}
                      {s.hasOverrides && !s.isCancelled && (
                        <Badge variant="outline" className="text-xs">
                          Modified
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {s.description || 'No description'}
                    </CardDescription>
                  </div>
                  <CardAction>
                    <ButtonGroup>
                      {!s.isCancelled &&
                        (s.isBookedByMe ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                suppressHydrationWarning
                                onClick={() => handleUnbook(s)}>
                                <BookmarkMinusIcon />
                                <span className="sr-only">Cancel booking</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cancel booking</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                suppressHydrationWarning
                                onClick={() => handleBook(s)}>
                                <BookmarkIcon />
                                <span className="sr-only">Book session</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Book session</TooltipContent>
                          </Tooltip>
                        ))}

                      {isTrainer && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                suppressHydrationWarning
                                onClick={() => onEditSession(s)}>
                                <PencilIcon />
                                <span className="sr-only">Edit session</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit session</TooltipContent>
                          </Tooltip>
                          {s.isCancelled ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  suppressHydrationWarning
                                  onClick={() => handleUncancelSession(s)}>
                                  <RotateCcwIcon />
                                  <span className="sr-only">
                                    Restore session
                                  </span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Restore session</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  suppressHydrationWarning
                                  onClick={() => handleCancelSession(s)}>
                                  <BanIcon />
                                  <span className="sr-only">
                                    Cancel session
                                  </span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancel session</TooltipContent>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </ButtonGroup>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {fmt(s.startTime)} – {fmt(s.endTime)}
                    </span>
                  </div>
                  {s.trainerName && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{s.trainerName}</span>
                    </div>
                  )}
                  {s.roomName && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{s.roomName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {s.bookingCount}{' '}
                      {s.bookingCount === 1 ? 'booking' : 'bookings'}
                    </span>
                    {s.isBookedByMe && (
                      <Badge variant="default" className="text-xs">
                        Booked
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {globalFilter || table.getState().columnFilters.length > 0
              ? 'No courses found matching your filters.'
              : 'No courses available for this date.'}
          </p>
        </div>
      )}
      <DataTablePagination table={table} pageSizes={[6, 9, 12, 24, 48]} />
    </div>
  )
}
