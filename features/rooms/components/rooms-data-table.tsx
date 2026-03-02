'use client'

import {
  CalendarIcon,
  Check,
  ChevronDownIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  UserIcon,
  X,
  XIcon,
} from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { useAuth } from '@/features/auth'
import { CourseSessionDisplay } from '@/features/courses'
import { getRooms } from '@/features/rooms/actions/get-rooms'
import { roomColumns } from '@/features/rooms/components/room-columns'
import { RoomDisplay } from '@/features/rooms/types'
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
import { ScrollArea } from '@/features/shared/components/ui/scroll-area'
import { Separator } from '@/features/shared/components/ui/separator'
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

type RoomStatus =
  | { status: 'occupied'; until: string; sessionName: string }
  | { status: 'free' }
  | { status: 'free-until'; until: string; sessionName: string }

function getRoomStatus(
  sessions: CourseSessionDisplay[],
  now: Date
): RoomStatus {
  const activeSessions = sessions
    .filter((s) => !s.isCancelled)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )

  const fmt = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`

  for (const s of activeSessions) {
    const start = new Date(s.startTime)
    const end = new Date(s.endTime)
    if (now >= start && now < end) {
      return { status: 'occupied', until: fmt(end), sessionName: s.name }
    }
  }

  for (const s of activeSessions) {
    const start = new Date(s.startTime)
    if (start > now) {
      return { status: 'free-until', until: fmt(start), sessionName: s.name }
    }
  }

  return { status: 'free' }
}

interface RoomsDataTableProps {
  data: RoomDisplay[]
  onCreate: () => void
  onEdit: (Room: RoomDisplay) => void
  onDelete: (Room: RoomDisplay) => void
}

export function RoomsDataTable({
  data,
  onCreate,
  onEdit,
  onDelete,
}: RoomsDataTableProps) {
  const [isPending, startTransition] = useTransition()
  const { member } = useAuth()
  const isTrainer = member?.isTrainer ?? false
  const [tableData, setTableData] = useState<RoomDisplay[]>(data)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [now, setNow] = useState<Date>(new Date())

  const isToday = useCallback(() => {
    const today = new Date()
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    )
  }, [selectedDate])

  useEffect(() => {
    if (!isToday()) return
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [isToday])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 })

  useEffect(() => {
    setTableData(data)
  }, [data])

  const fetchRoomsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    startTransition(async () => {
      const result = await getRooms(dateStr)
      setTableData(result)
    })
  }

  const onRefreshRooms = () => {
    fetchRoomsForDate(selectedDate)
  }

  const onDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      fetchRoomsForDate(date)
    }
    setCalendarOpen(false)
  }

  const sortItems = [
    { id: 'name', label: 'Name' },
    { id: 'sessionCount', label: 'Total sessions' },
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns: roomColumns,

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

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/* Desktop: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search rooms..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            {/* Mobile: Show input and buttons */}
            <div className={'flex w-full gap-2 md:hidden'}>
              <ButtonGroup className="flex-1">
                <Input
                  placeholder="Search rooms..."
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
                  onClick={onRefreshRooms}>
                  <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                  <span className={'sr-only'}>Refresh Data</span>
                </Button>
              </ButtonGroup>
              {isTrainer && (
                <Button
                  variant="default"
                  size="icon"
                  type="button"
                  suppressHydrationWarning
                  onClick={onCreate}>
                  <PlusIcon />
                  <span className="sr-only">Create Room</span>
                </Button>
              )}
            </div>
          </div>

          {/* Date Picker */}
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

          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
                table.getColumn('sessionCount')?.setFilterValue(undefined)
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
              onClick={onRefreshRooms}>
              <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
              <span className={'sr-only'}>Refresh Data</span>
            </Button>
          </ButtonGroup>
          {isTrainer && (
            <Button
              variant="default"
              size="default"
              type="button"
              suppressHydrationWarning
              onClick={onCreate}>
              <PlusIcon />
              <span className="hidden md:inline">Create Room</span>
            </Button>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      {table.getRowModel().rows.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {table.getRowModel().rows.map((Room) => (
            <Card key={Room.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {Room.original.name}
                      <Badge variant="secondary" className="text-xs">
                        <CalendarIcon className="w-3 h-3" />
                        {Room.original.sessions.length}
                      </Badge>
                      {isToday() &&
                        (() => {
                          const status = getRoomStatus(
                            Room.original.sessions,
                            now
                          )
                          if (status.status === 'occupied') {
                            return (
                              <Badge
                                variant="destructive"
                                className="text-xs"
                                suppressHydrationWarning>
                                <X />
                                {status.until}
                              </Badge>
                            )
                          }
                          if (status.status === 'free-until') {
                            return (
                              <Badge suppressHydrationWarning>
                                <Check />
                                {status.until}
                              </Badge>
                            )
                          }
                          return (
                            <Badge suppressHydrationWarning>
                              <Check />
                            </Badge>
                          )
                        })()}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {Room.original.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                {isTrainer && (
                  <CardAction>
                    <ButtonGroup>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            suppressHydrationWarning
                            onClick={() => onEdit(Room.original)}>
                            <PencilIcon />
                            <span className="sr-only">Edit Room</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Room</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            suppressHydrationWarning
                            onClick={() => onDelete(Room.original)}>
                            <TrashIcon />
                            <span className="sr-only">Delete Room</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Room</TooltipContent>
                      </Tooltip>
                    </ButtonGroup>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent>
                {Room.original.sessions.length > 0 ? (
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {Room.original.sessions
                        .sort(
                          (a, b) =>
                            new Date(a.startTime).getTime() -
                            new Date(b.startTime).getTime()
                        )
                        .map((session, i) => (
                          <div key={i}>
                            {i > 0 && <Separator className="mb-2" />}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 min-w-0">
                                <p className="text-sm font-medium leading-none truncate">
                                  {session.name}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <ClockIcon className="h-3 w-3" />
                                    {`${new Date(session.startTime).getHours().toString().padStart(2, '0')}:${new Date(session.startTime).getMinutes().toString().padStart(2, '0')}`}
                                    {' – '}
                                    {`${new Date(session.endTime).getHours().toString().padStart(2, '0')}:${new Date(session.endTime).getMinutes().toString().padStart(2, '0')}`}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <UserIcon className="h-3 w-3" />
                                    {session.trainerName}
                                  </span>
                                </div>
                              </div>
                              {session.isCancelled && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs shrink-0">
                                  Cancelled
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No sessions today
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {globalFilter
              ? 'No Rooms found matching your search.'
              : 'No Rooms available.'}
          </p>
        </div>
      )}
      <DataTablePagination table={table} pageSizes={[6, 9, 12, 24, 48]} />
    </div>
  )
}
