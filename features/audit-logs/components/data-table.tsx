'use client'

import {
  ActivityIcon,
  DatabaseIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { AuditLogsResponse, getAuditLogs } from '@/features/audit-logs'
import { columns } from '@/features/audit-logs/components/columns'
import { ActionType } from '@/features/audit-logs/types'
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
import {
  ColumnFiltersState,
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [tableData, setTableData] = useState(initialData.data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  })

  const fetchData = useCallback(async () => {
    startTransition(async () => {
      const result = await getAuditLogs({
        page: 1,
        pageSize: 1000, // Get all data for client-side filtering/sorting
        sortBy: 'timestamp',
        sortOrder: 'desc',
      })
      setTableData(result.data)
    })
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    fetchData()
  }

  // Get unique member names for faceted filter
  const uniqueMembers = Array.from(
    new Set(tableData.map((log) => log.memberName).filter(Boolean))
  )
    .sort()
    .map((name) => ({
      value: name,
      label: name,
    }))

  // Get unique entity types for faceted filter
  const uniqueEntityTypes = Array.from(
    new Set(tableData.map((log) => log.entityType).filter(Boolean))
  )
    .sort()
    .map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }))

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/** Desktop only: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search audit logs..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            {/** Mobile only: Show input, view options and refresh button */}
            <ButtonGroup className={'w-full flex-1 md:hidden'}>
              <Input
                placeholder="Search audit logs..."
                value={globalFilter}
                onChange={(e) => table.setGlobalFilter(String(e.target.value))}
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
            column={table.getColumn('action')}
          />
          <DataTableFacetedFilter
            title={'Entity Type'}
            options={uniqueEntityTypes.map((type) => ({
              ...type,
              icon: DatabaseIcon,
            }))}
            column={table.getColumn('entity type')}
          />
          <DataTableFacetedFilter
            title={'Member'}
            options={uniqueMembers.map((member) => ({
              ...member,
              icon: UserIcon,
            }))}
            column={table.getColumn('member')}
          />
          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
              }}
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
      <DataTablePagination table={table} />
    </div>
  )
}
