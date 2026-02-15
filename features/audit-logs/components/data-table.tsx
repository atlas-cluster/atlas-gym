'use client'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  PlusIcon,
  RefreshCwIcon,
  RepeatIcon,
  TrashIcon,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { AuditLogDisplay } from '../types'
import { columns } from './columns'
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
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

interface DataTableProps {
  data: AuditLogDisplay[]
  totalCount: number
  totalPages: number
}

export function DataTable({ data, totalCount, totalPages }: DataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Read URL params
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const currentPageSize = parseInt(searchParams.get('pageSize') || '10', 10)
  const currentSearch = searchParams.get('search') || ''
  const currentAction = searchParams.get('action') || ''
  const currentEntityType = searchParams.get('entityType') || ''
  const currentMember = searchParams.get('member') || ''
  const currentSortBy = searchParams.get('sortBy') || 'timestamp'
  const currentSortOrder = searchParams.get('sortOrder') || 'desc'

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(currentSearch)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateURL({ search: searchInput || null, page: '1' })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Sync searchInput when URL changes
  useEffect(() => {
    setSearchInput(currentSearch)
  }, [currentSearch])

  // Table state for column visibility and sorting display
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: currentSortBy, desc: currentSortOrder === 'desc' },
  ])

  // Update URL params
  const updateURL = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })

      startTransition(() => {
        router.push(`?${newParams.toString()}`, { scroll: false })
      })
    },
    [router, searchParams]
  )

  // Handle sorting change
  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)

      if (newSorting.length > 0) {
        const sort = newSorting[0]
        updateURL({
          sortBy: sort.id,
          sortOrder: sort.desc ? 'desc' : 'asc',
          page: '1',
        })
      }
    },
    [sorting, updateURL]
  )

  // Handle filter changes
  const handleActionFilterChange = useCallback(
    (value: string) => {
      updateURL({ action: value === 'all' ? null : value, page: '1' })
    },
    [updateURL]
  )

  const handleEntityTypeFilterChange = useCallback(
    (value: string) => {
      updateURL({ entityType: value === 'all' ? null : value, page: '1' })
    },
    [updateURL]
  )

  const handleMemberFilterChange = useCallback(
    (value: string) => {
      updateURL({ member: value === 'all' ? null : value, page: '1' })
    },
    [updateURL]
  )

  const handleClearFilters = useCallback(() => {
    setSearchInput('')
    updateURL({
      search: null,
      action: null,
      entityType: null,
      member: null,
      page: '1',
    })
  }, [updateURL])

  const handleRefresh = useCallback(() => {
    router.refresh()
  }, [router])

  // Pagination handlers
  const handlePageSizeChange = useCallback(
    (value: string) => {
      updateURL({ pageSize: value, page: '1' })
    },
    [updateURL]
  )

  const handleFirstPage = useCallback(() => {
    updateURL({ page: '1' })
  }, [updateURL])

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      updateURL({ page: String(currentPage - 1) })
    }
  }, [currentPage, updateURL])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      updateURL({ page: String(currentPage + 1) })
    }
  }, [currentPage, totalPages, updateURL])

  const handleLastPage = useCallback(() => {
    updateURL({ page: String(totalPages) })
  }, [totalPages, updateURL])

  // TanStack Table (manual mode - display only)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    pageCount: totalPages,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: currentPageSize,
      },
    },
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
  })

  // Filter options
  const actionOptions = [
    { label: 'All', value: 'all' },
    { label: 'Create', value: 'CREATE', icon: PlusIcon },
    { label: 'Update', value: 'UPDATE', icon: RepeatIcon },
    { label: 'Delete', value: 'DELETE', icon: TrashIcon },
  ]

  const entityTypeOptions = [
    { label: 'All', value: 'all' },
    { label: 'Session', value: 'session' },
    { label: 'Member', value: 'member' },
    { label: 'Subscription', value: 'subscription' },
    { label: 'Plan', value: 'plan' },
  ]

  // Get unique member names from data for filter
  const uniqueMembers = Array.from(
    new Set(data.map((log) => log.memberName).filter(Boolean))
  ).sort()
  const memberOptions = [
    { label: 'All', value: 'all' },
    ...uniqueMembers.map((name) => ({ label: name, value: name })),
  ]

  const hasActiveFilters =
    currentSearch || currentAction || currentEntityType || currentMember

  const startRow =
    data.length > 0 ? (currentPage - 1) * currentPageSize + 1 : 0
  const endRow = Math.min(currentPage * currentPageSize, totalCount)

  return (
    <div className="w-full space-y-3">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div className="flex w-full flex-wrap items-center gap-2">
          <Input
            placeholder="Search audit logs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 w-full md:w-64"
          />

          {/* Action Filter */}
          <Select
            value={currentAction || 'all'}
            onValueChange={handleActionFilterChange}
          >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon && <option.icon className="h-4 w-4" />}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Entity Type Filter */}
          <Select
            value={currentEntityType || 'all'}
            onValueChange={handleEntityTypeFilterChange}
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              {entityTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Member Filter */}
          {memberOptions.length > 1 && (
            <Select
              value={currentMember || 'all'}
              onValueChange={handleMemberFilterChange}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Member" />
              </SelectTrigger>
              <SelectContent>
                {memberOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="h-8 px-2 lg:px-3"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ButtonGroup>
            <DataTableViewOptions table={table} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
            >
              <RefreshCwIcon className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Table */}
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
                  data-state={row.getIsSelected() && 'selected'}
                >
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
                  className="h-24 text-center"
                >
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startRow} to {endRow} of {totalCount} audit logs
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(currentPageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 lg:flex"
                onClick={handleFirstPage}
                disabled={currentPage === 1 || isPending}
              >
                <ChevronsLeftIcon className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isPending}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isPending}
              >
                <ChevronRightIcon className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 lg:flex"
                onClick={handleLastPage}
                disabled={currentPage >= totalPages || isPending}
              >
                <ChevronsRightIcon className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
