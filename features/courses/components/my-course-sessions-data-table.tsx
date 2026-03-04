'use client'

import {
  BanIcon,
  ChevronDownIcon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { CourseSessionDisplay, SessionBookingMember } from '@/features/courses'
import { cancelSession } from '@/features/courses/actions/cancel-session'
import { getMyCourseSessions } from '@/features/courses/actions/get-my-course-sessions'
import { getSessionBookings } from '@/features/courses/actions/get-session-bookings'
import { uncancelSession } from '@/features/courses/actions/uncancel-session'
import { myCourseSessionColumns } from '@/features/courses/components/my-course-session-columns'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
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

interface MyCourseSessonsDataTableProps {
  data: CourseSessionDisplay[]
  onEditSession: (session: CourseSessionDisplay) => void
}

export function MyCourseSessionsDataTable({
  data,
  onEditSession,
}: MyCourseSessonsDataTableProps) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<CourseSessionDisplay[]>(data)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 })

  // Bookings dialog state
  const [bookingsDialogOpen, setBookingsDialogOpen] = useState(false)
  const [bookingsSession, setBookingsSession] =
    useState<CourseSessionDisplay | null>(null)
  const [bookings, setBookings] = useState<SessionBookingMember[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

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
      const result = await getMyCourseSessions(dateStr)
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

  const handleViewBookings = async (session: CourseSessionDisplay) => {
    setBookingsSession(session)
    setBookingsDialogOpen(true)
    setLoadingBookings(true)
    try {
      const result = await getSessionBookings(session.id)
      setBookings(result)
    } finally {
      setLoadingBookings(false)
    }
  }

  const sortItems = [
    { id: 'name', label: 'Name' },
    { id: 'startTime', label: 'Start Time' },
    { id: 'bookingCount', label: 'Bookings' },
  ]

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
    columns: myCourseSessionColumns,
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

  const fmt = (t: string) => t.slice(0, 5)

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
            const s = row.original
            return (
              <Card
                key={row.id}
                className={cn(
                  'gap-0',
                  s.isCancelled ? 'opacity-60' : '',
                  s.bannerImageUrl ? 'pt-0' : ''
                )}>
                {s.bannerImageUrl && (
                  <BannerImage src={s.bannerImageUrl} alt={s.name} />
                )}
                <CardHeader className={'mt-3'}>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 flex-wrap leading-5.5">
                      {s.name}
                      {s.isCancelled && (
                        <Badge variant="destructive">Cancelled</Badge>
                      )}
                      {s.hasOverrides && !s.isCancelled && (
                        <Badge variant="outline">Modified</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {s.description || 'No description'}
                    </CardDescription>
                  </div>
                  <CardAction>
                    <ButtonGroup>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            suppressHydrationWarning
                            onClick={() => handleViewBookings(s)}>
                            <UsersIcon />
                            <span className="sr-only">View bookings</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View bookings</TooltipContent>
                      </Tooltip>

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
                              <span className="sr-only">Restore session</span>
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
                              <span className="sr-only">Cancel session</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Cancel session</TooltipContent>
                        </Tooltip>
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

      <Dialog open={bookingsDialogOpen} onOpenChange={setBookingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bookings – {bookingsSession?.name}</DialogTitle>
            <DialogDescription>
              {bookingsSession
                ? `${fmt(bookingsSession.startTime)} – ${fmt(bookingsSession.endTime)} · ${bookingsSession.sessionDate}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {loadingBookings ? (
            <div className="flex justify-center py-8">
              <RefreshCwIcon className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">
                      {b.firstname} {b.lastname}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(b.bookedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No bookings for this session yet.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
