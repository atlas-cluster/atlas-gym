'use client'

import {
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DatabaseIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState, useTransition } from 'react'

import { AuditLogsResponse } from '@/features/audit-logs'
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
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

interface DataTableProps {
  initialData: AuditLogsResponse
}

export function DataTable({ initialData }: DataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Read current URL params
  const currentPage = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams]
  )
  const currentPageSize = useMemo(
    () => parseInt(searchParams.get('pageSize') || '10', 10),
    [searchParams]
  )
  const currentSearch = useMemo(
    () => searchParams.get('search') || '',
    [searchParams]
  )
  const currentAction = useMemo(
    () => searchParams.get('action') || null,
    [searchParams]
  )
  const currentEntityType = useMemo(
    () => searchParams.get('entityType') || null,
    [searchParams]
  )
  const currentMember = useMemo(
    () => searchParams.get('member') || null,
    [searchParams]
  )
  const currentSortBy = useMemo(
    () => searchParams.get('sortBy') || 'createdAt',
    [searchParams]
  )
  const currentSortOrder = useMemo(
    () => searchParams.get('sortOrder') || 'desc',
    [searchParams]
  )

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Get unique values for faceted filters from current page data
  const uniqueMembers = useMemo(() => {
    const seen = new Set<string>()
    const members: Array<{ value: string; label: string }> = []
    
    for (const log of initialData.data) {
      if (log.memberName && !seen.has(log.memberName)) {
        seen.add(log.memberName)
        members.push({ value: log.memberName, label: log.memberName })
      }
    }
    
    return members.sort((a, b) => a.label.localeCompare(b.label))
  }, [initialData.data])

  const uniqueEntityTypes = useMemo(() => {
    const seen = new Set<string>()
    const types: Array<{ value: string; label: string }> = []
    
    for (const log of initialData.data) {
      if (log.entityType && !seen.has(log.entityType)) {
        seen.add(log.entityType)
        types.push({
          value: log.entityType,
          label: log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1),
        })
      }
    }
    
    return types.sort((a, b) => a.label.localeCompare(b.label))
  }, [initialData.data])

  // Update URL params
  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      
      startTransition(() => {
        router.push(`?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  // Sorting state derived from URL
  const sorting: SortingState = useMemo(
    () => [
      {
        id: currentSortBy === 'createdAt' ? 'timestamp' : currentSortBy,
        desc: currentSortOrder === 'desc',
      },
    ],
    [currentSortBy, currentSortOrder]
  )

  const handleSortingChange = useCallback(
    (updater: any) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      
      if (newSorting.length > 0) {
        const sortBy = newSorting[0].id === 'timestamp' ? 'createdAt' : newSorting[0].id
        const sortOrder = newSorting[0].desc ? 'desc' : 'asc'
        updateURL({ sortBy, sortOrder, page: '1' })
      }
    },
    [sorting, updateURL]
  )

  const table = useReactTable({
    data: initialData.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    pageCount: initialData.totalPages,
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

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleSearch = (value: string) => {
    updateURL({ search: value || null, page: '1' })
  }

  const handleActionFilterChange = (values: string[]) => {
    updateURL({ action: values.length > 0 ? values[0] : null, page: '1' })
  }

  const handleEntityTypeFilterChange = (values: string[]) => {
    updateURL({ entityType: values.length > 0 ? values[0] : null, page: '1' })
  }

  const handleMemberFilterChange = (values: string[]) => {
    updateURL({ member: values.length > 0 ? values[0] : null, page: '1' })
  }

  const handleClearFilters = () => {
    updateURL({
      search: null,
      action: null,
      entityType: null,
      member: null,
      page: '1',
    })
  }

  const hasFilters = currentSearch || currentAction || currentEntityType || currentMember

  const paginationInfo = useMemo(() => {
    const startRow =
      initialData.data.length > 0 ? (currentPage - 1) * currentPageSize + 1 : 0
    const endRow = Math.min(currentPage * currentPageSize, initialData.totalCount)
    return { startRow, endRow }
  }, [currentPage, currentPageSize, initialData.data.length, initialData.totalCount])

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/** Desktop only: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search audit logs..."
              defaultValue={currentSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e.currentTarget.value)
                }
              }}
              onBlur={(e) => handleSearch(e.currentTarget.value)}
            />
            {/** Mobile only: Show input, view options and refresh button */}
            <ButtonGroup className={'w-full flex-1 md:hidden'}>
              <Input
                placeholder="Search audit logs..."
                defaultValue={currentSearch}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e.currentTarget.value)
                  }
                }}
                onBlur={(e) => handleSearch(e.currentTarget.value)}
              />
              <DataTableViewOptions table={table} />
              <Button
                variant="outline"
                size="icon"
                type="button"
                disabled={isPending}
                suppressHydrationWarning
                onClick={handleRefresh}>
                <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                <span className={'sr-only'}>Refresh Data</span>
              </Button>
            </ButtonGroup>
          </div>
          <DataTableFacetedFilter
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
            selectedValues={new Set(currentAction ? [currentAction] : [])}
            onSelectedValuesChange={handleActionFilterChange}
          />
          <DataTableFacetedFilter
            title={'Entity Type'}
            options={uniqueEntityTypes.map((type) => ({
              ...type,
              icon: DatabaseIcon,
            }))}
            selectedValues={new Set(currentEntityType ? [currentEntityType] : [])}
            onSelectedValuesChange={handleEntityTypeFilterChange}
          />
          <DataTableFacetedFilter
            title={'Member'}
            options={uniqueMembers.map((member) => ({
              ...member,
              icon: UserIcon,
            }))}
            selectedValues={new Set(currentMember ? [currentMember] : [])}
            onSelectedValuesChange={handleMemberFilterChange}
          />
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
              onClick={handleRefresh}>
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
          Showing {paginationInfo.startRow} to {paginationInfo.endRow} of{' '}
          {initialData.totalCount} audit logs
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={currentPageSize.toString()}
              onValueChange={(value) => {
                updateURL({ pageSize: value, page: '1' })
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
            Page {currentPage} of {initialData.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => updateURL({ page: (currentPage - 1).toString() })}
              disabled={currentPage <= 1 || isPending}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => updateURL({ page: (currentPage + 1).toString() })}
              disabled={currentPage >= initialData.totalPages || isPending}>
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
