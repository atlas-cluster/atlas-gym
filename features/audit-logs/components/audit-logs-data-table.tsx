'use client'

import { Database, RefreshCwIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'

import { entityIcons, getAuditLogs } from '@/features/audit-logs'
import { auditLogColumns } from '@/features/audit-logs/components/audit-log-columns'
import { AuditLog, GetAuditLogsResponse } from '@/features/audit-logs/types'
import { DataTableDateRangeFilter } from '@/features/shared/components/data-table-date-range-filter'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
import { DataTablePagination } from '@/features/shared/components/data-table-pagination'
import { DataTableViewOptions } from '@/features/shared/components/data-table-view-options'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import { Input } from '@/features/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'
import { useDebounce } from '@/features/shared/hooks/use-debounce'
import { flexRender, useReactTable } from '@tanstack/react-table'
import {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
} from '@tanstack/table-core'

export function AuditLogsDataTable({
  initialData,
}: {
  initialData: GetAuditLogsResponse
}) {
  const [isPending, startTransition] = useTransition()

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

  // Debounce global filter
  const [inputValue, setInputValue] = useState<string>(globalFilter)
  const debouncedInputValue = useDebounce(inputValue)
  const skipNextDebouncedUpdate = useRef(false)

  useEffect(() => {
    if (skipNextDebouncedUpdate.current) {
      skipNextDebouncedUpdate.current = false
      return
    }
    if (debouncedInputValue !== globalFilter) {
      setGlobalFilter(debouncedInputValue)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [debouncedInputValue, globalFilter])

  // Table data
  const [data, setData] = useState<AuditLog[]>(initialData.data)
  const [pageCount, setPageCount] = useState<number>(initialData.pageCount)
  const [rowCount, setRowCount] = useState<number>(initialData.rowCount)
  const [facets, setFacets] = useState(initialData.facets)

  const fetchData = (
    currentPagination = pagination,
    currentSorting = sorting,
    currentGlobal = globalFilter,
    currentColumnFilters = columnFilters
  ) => {
    startTransition(async () => {
      const result = await getAuditLogs({
        pageIndex: currentPagination.pageIndex,
        pageSize: currentPagination.pageSize,
        sorting: currentSorting as { id: string; desc: boolean }[],
        globalFilter: currentGlobal,
        columnFilters: currentColumnFilters,
      })
      setData(result.data)
      setPageCount(result.pageCount)
      setRowCount(result.rowCount)
      setFacets(result.facets)
    })
  }

  const isMounted = useRef(false)
  const skipNextFetch = useRef(false)

  useEffect(() => {
    if (isMounted.current) {
      if (skipNextFetch.current) {
        skipNextFetch.current = false
        return
      }
      fetchData()
    } else {
      isMounted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, sorting, globalFilter, columnFilters])

  const handleClearFilters = () => {
    const nextPagination = { ...pagination, pageIndex: 0 }

    skipNextFetch.current = true
    skipNextDebouncedUpdate.current = true
    setColumnFilters([])
    setGlobalFilter('')
    setInputValue('')
    setPagination(nextPagination)

    fetchData(nextPagination, sorting, '', [])
  }

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue
  ) => {
    setColumnFilters(updaterOrValue)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const onGlobalFilterChange: OnChangeFn<string> = (updaterOrValue) => {
    setGlobalFilter(updaterOrValue)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const table = useReactTable({
    data,
    columns: auditLogColumns,
    pageCount,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    onSortingChange: setSorting,
    onColumnFiltersChange: onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: onGlobalFilterChange,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
  })

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/** Desktop only: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search audit logs..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            {/** Mobile only: Show input, view options and refresh button */}
            <ButtonGroup className={'w-full flex-1 md:hidden'}>
              <Input
                placeholder="Search audit logs..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <DataTableViewOptions table={table} />
              <Button
                variant="outline"
                size="icon"
                type="button"
                disabled={isPending}
                suppressHydrationWarning
                onClick={() => fetchData()}>
                <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                <span className={'sr-only'}>Refresh Data</span>
              </Button>
            </ButtonGroup>
          </div>
          <DataTableFacetedFilter
            column={table.getColumn('member')}
            title="Member"
            options={Object.keys(facets.member).map((key) => ({
              label: key,
              value: key,
            }))}
            facets={new Map(Object.entries(facets.member))}
          />
          <DataTableFacetedFilter
            column={table.getColumn('action')}
            title="Action"
            options={Object.keys(facets.action).map((key) => ({
              label: key,
              value: key,
            }))}
            facets={new Map(Object.entries(facets.action))}
          />
          <DataTableFacetedFilter
            column={table.getColumn('entity')}
            title="Entity"
            options={Object.keys(facets.entity).map((key) => ({
              label: key.charAt(0).toUpperCase() + key.slice(1),
              value: key,
              icon: entityIcons[key] || Database,
            }))}
            facets={new Map(Object.entries(facets.entity))}
          />
          <DataTableDateRangeFilter
            column={table.getColumn('timestamp')}
            title="Timestamp"
          />
          {(table.getState().columnFilters.length > 0 || globalFilter) && (
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
        {/** Desktop only: Show view options, refresh button and create button on the right */}
        <div className={'hidden md:flex gap-2'}>
          <ButtonGroup>
            <DataTableViewOptions table={table} />
            <Button
              variant="outline"
              size="icon"
              type="button"
              disabled={isPending}
              suppressHydrationWarning
              onClick={() => fetchData()}>
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
                  colSpan={auditLogColumns.length}
                  className="h-24 text-center">
                  Keine Dozenten gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
