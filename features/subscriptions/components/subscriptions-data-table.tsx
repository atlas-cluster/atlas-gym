import { format } from 'date-fns'
import {
  Calendar,
  Check,
  PlusIcon,
  RefreshCwIcon,
  RotateCcw,
  Trash,
  X,
  XIcon,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

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
import { SubscriptionDisplay } from '@/features/subscriptions'
import { getSubscriptions } from '@/features/subscriptions/actions/get-subscriptions'
import { subscriptionColumns } from '@/features/subscriptions/components/subscription-columns'
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

interface SubscriptionsDataTableProps {
  data: SubscriptionDisplay[]
  onCreate: (subscription: SubscriptionDisplay) => void
  onCancel: (subscription: SubscriptionDisplay) => void
  onRevertCancel: (subscription: SubscriptionDisplay) => void
}

export function SubscriptionsDataTable({
  data,
  onCreate,
  onCancel,
  onRevertCancel,
}: SubscriptionsDataTableProps) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<SubscriptionDisplay[]>(data)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 9 })

  useEffect(() => {
    setTableData(data)
  }, [data])

  const onRefreshSubscriptions = () => {
    startTransition(async () => {
      const result = await getSubscriptions()
      setTableData(result)
    })
  }

  const sortItems = [
    { id: 'name', label: 'Name' },
    { id: 'price', label: 'Price' },
    { id: 'minDurationMonths', label: 'Min. Duration' },
    { id: 'subscriptionCount', label: 'Subscriptions' },
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns: subscriptionColumns,

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

  const canCreate =
    !tableData.some((s) => s.isActive || s.isFuture) ||
    (tableData.some((s) => s.isCancelled) && !tableData.some((s) => s.isFuture))

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/* Desktop: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search subscriptions..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            {/* Mobile: Show input and buttons */}
            <div className={'flex w-full gap-2 md:hidden'}>
              <ButtonGroup className="flex-1">
                <Input
                  placeholder="Search subscriptions..."
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
                  onClick={onRefreshSubscriptions}>
                  <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                  <span className={'sr-only'}>Refresh Data</span>
                </Button>
              </ButtonGroup>
            </div>
          </div>

          {/* Range Filters */}
          <DataTableRangeFilter
            title="Duration"
            column={table.getColumn('minDurationMonths')}
            formatValue={(v) => `${v} month${v !== 1 ? 's' : ''}`}
            min={1}
            max={24}
          />

          <DataTableRangeFilter
            title="Price"
            column={table.getColumn('price')}
            formatValue={(v) => `${v.toFixed(0)}€`}
            min={0}
            max={500}
          />

          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
                table.getColumn('minDurationMonths')?.setFilterValue(undefined)
                table.getColumn('price')?.setFilterValue(undefined)
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
              onClick={onRefreshSubscriptions}>
              <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
              <span className={'sr-only'}>Refresh Data</span>
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {table.getRowModel().rows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {table.getRowModel().rows.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {subscription.original.name}
                      {subscription.original.isActive &&
                        !subscription.original.isCancelled && (
                          <Badge>
                            <Check />
                            Active
                          </Badge>
                        )}
                      {subscription.original.isCancelled && (
                        <Badge variant="destructive">
                          <X />
                          Cancelled{' '}
                          {format(subscription.original.endDate!, 'dd.MM')}
                        </Badge>
                      )}
                      {subscription.original.isFuture && (
                        <Badge variant={'secondary'}>
                          <Calendar />
                          Starts at{' '}
                          {format(subscription.original.startDate!, 'dd.MM')}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {subscription.original.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <CardAction>
                  <ButtonGroup>
                    {(subscription.original.isActive ||
                      subscription.original.isFuture) &&
                      !subscription.original.isCancelled && (
                        <Button
                          variant={'ghost'}
                          size={'icon'}
                          suppressHydrationWarning
                          onClick={() => onCancel(subscription.original)}>
                          <Trash />
                        </Button>
                      )}
                    {subscription.original.isCancelled && (
                      <Button
                        variant={'ghost'}
                        size={'icon'}
                        suppressHydrationWarning
                        onClick={() => onRevertCancel(subscription.original)}>
                        <RotateCcw />
                      </Button>
                    )}
                    {!subscription.original.isActive &&
                      !subscription.original.isFuture &&
                      canCreate && (
                        <Button
                          size={'icon'}
                          suppressHydrationWarning
                          onClick={() => onCreate(subscription.original)}>
                          <PlusIcon />
                        </Button>
                      )}
                  </ButtonGroup>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">
                    €{subscription.original.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Min. Duration:</span>
                  <span className="font-medium">
                    {subscription.original.minDurationMonths}{' '}
                    {subscription.original.minDurationMonths === 1
                      ? 'month'
                      : 'months'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {globalFilter
              ? 'No subscriptions found matching your search.'
              : 'No subscriptions available.'}
          </p>
        </div>
      )}
      <DataTablePagination table={table} pageSizes={[6, 9, 12, 24, 48]} />
    </div>
  )
}
