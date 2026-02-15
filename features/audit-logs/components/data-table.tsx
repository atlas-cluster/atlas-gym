'use client'

import { ChevronLeft, ChevronRight, RefreshCwIcon, XIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'

import { AuditLogsResponse, getAuditLogs } from '@/features/audit-logs'
import { columns } from '@/features/audit-logs/components/columns'
import { ActionType } from '@/features/audit-logs/types'
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
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

interface DataTableProps {
  initialData: AuditLogsResponse
}

const actionOptions = [
  { label: 'All', value: 'all' },
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
]

export function DataTable({ initialData }: DataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Extract current filters from URL - using useMemo to prevent hydration mismatches
  const currentPage = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams]
  )
  const currentPageSize = useMemo(
    () => parseInt(searchParams.get('pageSize') || '10', 10),
    [searchParams]
  )
  const currentAction = useMemo(
    () => searchParams.get('action') as ActionType | null,
    [searchParams]
  )
  const currentEntityType = useMemo(
    () => searchParams.get('entityType') || null,
    [searchParams]
  )

  // Memoize pagination display values to prevent hydration mismatches
  const paginationInfo = useMemo(() => {
    const dataArray = data?.data ?? []
    const totalCount = data?.totalCount ?? 0
    const startRow =
      dataArray.length > 0 ? (currentPage - 1) * currentPageSize + 1 : 0
    const endRow = Math.min(currentPage * currentPageSize, totalCount)
    return { startRow, endRow }
  }, [currentPage, currentPageSize, data?.data, data?.totalCount])

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: data?.totalPages ?? 1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: currentPageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  })

  // Fetch data when filters/sorting/pagination change
  const fetchData = useCallback(async () => {
    const sortBy = sorting[0]?.id || 'createdAt'
    const sortOrder = sorting[0]?.desc ? 'desc' : 'asc'

    startTransition(async () => {
      const result = await getAuditLogs({
        page: currentPage,
        pageSize: currentPageSize,
        search,
        sortBy,
        sortOrder,
        action: currentAction || undefined,
        entityType: currentEntityType || undefined,
      })
      setData(result)
    })
  }, [
    sorting,
    currentPage,
    currentPageSize,
    search,
    currentAction,
    currentEntityType,
  ])

  // Update URL when filters change
  const updateURL = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })

    router.push(`?${newSearchParams.toString()}`, { scroll: false })
  }

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  // Handle search submit
  const handleSearchSubmit = () => {
    updateURL({ search: search || null, page: '1' })
  }

  // Handle filter changes
  const handleActionFilterChange = (value: string) => {
    updateURL({ action: value === 'all' ? null : value, page: '1' })
  }

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    updateURL({ pageSize: value, page: '1' })
  }

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      updateURL({ page: (currentPage - 1).toString() })
    }
  }

  const handleNextPage = () => {
    if (currentPage < (data?.totalPages ?? 1)) {
      updateURL({ page: (currentPage + 1).toString() })
    }
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('')
    router.push('?page=1&pageSize=10', { scroll: false })
  }

  // Fetch data when URL changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const hasFilters = search || currentAction || currentEntityType

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/** Desktop only: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search audit logs..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            {/** Mobile only: Show input, view options and refresh button */}
            <ButtonGroup className={'w-full flex-1 md:hidden'}>
              <Input
                placeholder="Search audit logs..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              <DataTableViewOptions table={table} />
              <Button
                variant="outline"
                size="icon"
                type="button"
                disabled={isPending}
                suppressHydrationWarning
                onClick={fetchData}>
                <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                <span className={'sr-only'}>Refresh Data</span>
              </Button>
            </ButtonGroup>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchSubmit}
            disabled={isPending}
            className="hidden md:flex">
            Search
          </Button>

          <Select
            value={currentAction || 'all'}
            onValueChange={handleActionFilterChange}>
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={handleClearFilters}
              suppressHydrationWarning>
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
              disabled={isPending}
              suppressHydrationWarning
              onClick={fetchData}>
              <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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

      {/* Custom pagination matching DataTablePagination style */}
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground flex-1 text-sm">
          Showing {paginationInfo.startRow} to {paginationInfo.endRow} of{' '}
          {data?.totalCount ?? 0} audit logs
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={currentPageSize.toString()}
              onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={currentPageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} of {data?.totalPages ?? 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || isPending}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handleNextPage}
              disabled={currentPage >= (data?.totalPages ?? 1) || isPending}>
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
