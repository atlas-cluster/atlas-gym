'use client'

import {
  ActivityIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DatabaseIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AuditLogsResponse } from '@/features/audit-logs'
import { getAuditLogs } from '@/features/audit-logs/actions/get-audit-logs'
import { columns } from '@/features/audit-logs/components/columns'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
import { DataTableViewOptions } from '@/features/shared/components/data-table-view-options'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import { Input } from '@/features/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

interface DataTableProps {
  initialData: AuditLogsResponse
}

export function DataTable({ initialData }: DataTableProps) {
  // Client-side state
  const [data, setData] = useState(initialData.data)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [searchInput, setSearchInput] = useState('')

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalFilter(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData.data)
  }, [initialData.data])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: 'includesString',
  })

  const handleRefresh = async () => {
    const result = await getAuditLogs({ pageSize: 1000 })
    setData(result.data)
  }

  const handleClearFilters = () => {
    setColumnFilters([])
    setGlobalFilter('')
    setSearchInput('')
  }

  const hasFilters = columnFilters.length > 0 || globalFilter.length > 0

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/** Desktop only: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search audit logs..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {/** Mobile only: Show input, view options and refresh button */}
            <ButtonGroup className={'w-full flex-1 md:hidden'}>
              <Input
                placeholder="Search audit logs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <DataTableViewOptions table={table} />
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={handleRefresh}>
                <RefreshCwIcon />
                <span className={'sr-only'}>Refresh Data</span>
              </Button>
            </ButtonGroup>
          </div>
          <DataTableFacetedFilter
            column={table.getColumn('action')}
            title={'Action'}
            options={[
              {
                value: 'CREATE',
                label: 'Create',
                icon: PlusCircleIcon,
              },
              {
                value: 'UPDATE',
                label: 'Update',
                icon: ActivityIcon,
              },
              {
                value: 'DELETE',
                label: 'Delete',
                icon: Trash2Icon,
              },
            ]}
          />
          <DataTableFacetedFilter
            column={table.getColumn('entityType')}
            title={'Entity Type'}
            options={[
              { value: 'session', label: 'Session', icon: DatabaseIcon },
              { value: 'member', label: 'Member', icon: DatabaseIcon },
              { value: 'subscription', label: 'Subscription', icon: DatabaseIcon },
              { value: 'plan', label: 'Plan', icon: DatabaseIcon },
            ]}
          />
          <DataTableFacetedFilter
            column={table.getColumn('memberName')}
            title={'Member'}
            options={Array.from(
              table.getColumn('memberName')?.getFacetedUniqueValues() || new Map()
            ).map(([value]) => ({
              value: value as string,
              label: value as string,
              icon: UserIcon,
            }))}
          />
          {hasFilters && (
            <Button variant="ghost" size={'icon'} onClick={handleClearFilters}>
              <XIcon />
              <span className={'sr-only'}>Remove filters</span>
            </Button>
          )}
        </div>
        {/** Desktop only: Show view options and refresh button on the right */}
        <div className={'hidden md:flex gap-2'}>
          <ButtonGroup>
            <DataTableViewOptions table={table} />
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={handleRefresh}>
              <RefreshCwIcon />
              <span className={'sr-only'}>Refresh Data</span>
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border mb-3">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} audit logs
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
