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

import { PlanDisplay, getPlans } from '@/features/plans'
import { planColumns } from '@/features/plans/components/plan-columns'
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

interface PlansDataTableProps {
  data: PlanDisplay[]
  onCreate: () => void
  onEdit: (plan: PlanDisplay) => void
  onDelete: (plan: PlanDisplay) => void
}

export function PlansDataTable({
  data,
  onCreate,
  onEdit,
  onDelete,
}: PlansDataTableProps) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<PlanDisplay[]>(data)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 9 })

  useEffect(() => {
    setTableData(data)
  }, [data])

  const onRefreshPlans = () => {
    startTransition(async () => {
      const result = await getPlans()
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
    columns: planColumns,

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
              placeholder="Search plans..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            {/* Mobile: Show input and buttons */}
            <div className={'flex w-full gap-2 md:hidden'}>
              <ButtonGroup className="flex-1">
                <Input
                  placeholder="Search plans..."
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
                  onClick={onRefreshPlans}>
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
                <span className="sr-only">Create Plan</span>
              </Button>
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
              onClick={onRefreshPlans}>
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
            <span className="hidden md:inline">Create Plan</span>
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      {table.getRowModel().rows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {table.getRowModel().rows.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {plan.original.name}
                      <Badge variant="secondary" className="text-xs">
                        <UsersIcon className="w-3 h-3" />
                        {plan.original.subscriptionCount || 0}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {plan.original.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <CardAction>
                  <ButtonGroup>
                    <Button
                      variant="ghost"
                      size="icon"
                      suppressHydrationWarning
                      onClick={() => onEdit(plan.original)}>
                      <PencilIcon />
                      <span className="sr-only">Edit plan</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      suppressHydrationWarning
                      onClick={() => onDelete(plan.original)}>
                      <TrashIcon />
                      <span className="sr-only">Delete plan</span>
                    </Button>
                  </ButtonGroup>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">
                    €{plan.original.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Min. Duration:</span>
                  <span className="font-medium">
                    {plan.original.minDurationMonths}{' '}
                    {plan.original.minDurationMonths === 1 ? 'month' : 'months'}
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
              ? 'No plans found matching your search.'
              : 'No plans available.'}
          </p>
        </div>
      )}
      <DataTablePagination table={table} pageSizes={[6, 9, 12, 24, 48]} />
    </div>
  )
}
