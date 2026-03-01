'use client'

import {
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { roomColumns } from '@/features/rooms/components/room-columns'
import { RoomDisplay } from '@/features/rooms/types'
import { DataTablePagination } from '@/features/shared/components/data-table-pagination'
import { DataTableRangeFilter } from '@/features/shared/components/data-table-range-filter'
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
  const [tableData, setTableData] = useState<RoomDisplay[]>(data)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 9 })

  useEffect(() => {
    setTableData(data)
  }, [data])

  const onRefreshRooms = () => {
    startTransition(async () => {
      // const result = await getRooms()
      // setTableData(result)
    })
  }

  const sortItems = [
    { id: 'name', label: 'Name' },
    { id: 'sessions.length', label: 'Total sessions' },
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

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/* Desktop: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search Rooms..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            {/* Mobile: Show input and buttons */}
            <div className={'flex w-full gap-2 md:hidden'}>
              <ButtonGroup className="flex-1">
                <Input
                  placeholder="Search Rooms..."
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
              <Button
                variant="default"
                size="icon"
                type="button"
                suppressHydrationWarning
                onClick={onCreate}>
                <PlusIcon />
                <span className="sr-only">Create Room</span>
              </Button>
            </div>
          </div>

          {/* Range Filters */}
          <DataTableRangeFilter
            title="Total Sessions"
            column={table.getColumn('sessions.length')}
            min={1}
            max={50}
          />

          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
                table.getColumn('sessions.length')?.setFilterValue(undefined)
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
          <Button
            variant="default"
            size="default"
            type="button"
            suppressHydrationWarning
            onClick={onCreate}>
            <PlusIcon />
            <span className="hidden md:inline">Create Room</span>
          </Button>
        </div>
      </div>

      {/* Rooms Grid */}
      {table.getRowModel().rows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {table.getRowModel().rows.map((Room) => (
            <Card key={Room.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {Room.original.name}
                      <Badge variant="secondary" className="text-xs">
                        <UsersIcon className="w-3 h-3" />
                        {/*{Room.original.subscriptionCount || 0}*/}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {Room.original.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <CardAction>
                  <ButtonGroup>
                    <Button
                      variant="ghost"
                      size="icon"
                      suppressHydrationWarning
                      onClick={() => onEdit(Room.original)}>
                      <PencilIcon />
                      <span className="sr-only">Edit Room</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      suppressHydrationWarning
                      onClick={() => onDelete(Room.original)}>
                      <TrashIcon />
                      <span className="sr-only">Delete Room</span>
                    </Button>
                  </ButtonGroup>
                </CardAction>
              </CardHeader>
              {/*<CardContent className="space-y-3">*/}
              {/*  <div>*/}
              {/*    <p className="text-3xl font-bold">*/}
              {/*      €{Room.original.price.toFixed(2)}*/}
              {/*    </p>*/}
              {/*    <p className="text-sm text-muted-foreground">per month</p>*/}
              {/*  </div>*/}
              {/*  <div className="flex items-center gap-2 text-sm">*/}
              {/*    <span className="text-muted-foreground">Min. Duration:</span>*/}
              {/*    <span className="font-medium">*/}
              {/*      {Room.original.minDurationMonths}{' '}*/}
              {/*      {Room.original.minDurationMonths === 1 ? 'month' : 'months'}*/}
              {/*    </span>*/}
              {/*  </div>*/}
              {/*</CardContent>*/}
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
