'use client'

import { RefreshCwIcon, XIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { AuditLogsResponse, getAuditLogs } from '@/features/audit-logs'
import { columns } from '@/features/audit-logs/components/columns'
import { ActionType } from '@/features/audit-logs/types'
import { Button } from '@/features/shared/components/ui/button'
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
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

interface DataTableProps {
  initialData: AuditLogsResponse
}

const actionOptions = [
  { label: 'All', value: '' },
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

  // Extract current filters from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const currentPageSize = parseInt(searchParams.get('pageSize') || '10', 10)
  const currentAction = searchParams.get('action') as ActionType | null
  const currentEntityType = searchParams.get('entityType') || null

  const table = useReactTable({
    data: data.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: data.totalPages,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: currentPageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  })

  // Fetch data when filters/sorting/pagination change
  const fetchData = async () => {
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
  }

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
    updateURL({ action: value || null, page: '1' })
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
    if (currentPage < data.totalPages) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, sorting])

  const hasFilters = search || currentAction || currentEntityType

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            className="h-8 w-[250px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchSubmit}
            disabled={isPending}>
            Search
          </Button>

          <Select
            value={currentAction || ''}
            onValueChange={handleActionFilterChange}>
            <SelectTrigger className="h-8 w-[150px]">
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
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2 lg:px-3">
              Clear
              <XIcon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isPending}>
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
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
            {isPending ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing{' '}
          {data.data.length > 0 ? (currentPage - 1) * currentPageSize + 1 : 0}{' '}
          to {Math.min(currentPage * currentPageSize, data.totalCount)} of{' '}
          {data.totalCount} audit logs
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
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center text-sm font-medium">
            Page {currentPage} of {data.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || isPending}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= data.totalPages || isPending}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
