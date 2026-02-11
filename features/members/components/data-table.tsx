'use client'

import { RefreshCwIcon, UserStarIcon, UsersIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  GetMembersResponse,
  Member,
  deleteMember,
  deleteMembers,
  getMembers,
  memberSchema,
  updateMember,
} from '@/features/members'
import { columns } from '@/features/members/components/columns'
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
  RowSelectionState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
} from '@tanstack/table-core'

export function DataTable({
  initialData,
}: {
  initialData: GetMembersResponse
}) {
  const [isPending, startTransition] = useTransition()

  // Table State
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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

  // Data State
  const [data, setData] = useState<Member[]>(initialData.data)
  const [rowCount, setRowCount] = useState<number>(initialData.rowCount)
  const [pageCount, setPageCount] = useState<number>(initialData.pageCount)
  const [facets, setFacets] = useState(initialData.facets)

  const fetchData = (
    currentPagination = pagination,
    currentSorting = sorting,
    currentFilters = columnFilters,
    currentGlobal = globalFilter
  ) => {
    startTransition(async () => {
      const result = await getMembers({
        pageIndex: currentPagination.pageIndex,
        pageSize: currentPagination.pageSize,
        sorting: currentSorting as { id: string; desc: boolean }[],
        columnFilters: currentFilters as { id: string; value: unknown }[],
        globalFilter: currentGlobal,
      })
      setRowSelection({})
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
  }, [pagination, sorting, columnFilters, globalFilter])

  const handleUpdate = (id: string, data: z.infer<typeof memberSchema>) => {
    const promise = updateMember(id, data).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Dozent wird aktualisiert...',
      success: 'Erfolgreich Dozenten aktualisiert',
      error: 'Fehler beim Aktualisieren des Dozenten',
    })
  }

  const handleDelete = (id: string) => {
    const promise = deleteMember(id).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Dozent wird gelöscht...',
      success: 'Erfolgreich Dozenten gelöscht',
      error: 'Fehler beim Löschen des Dozenten',
    })
  }

  const handleDeleteMany = (ids: string[]) => {
    const promise = deleteMembers(ids).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Dozenten werden gelöscht...',
      success: 'Erfolgreich Dozenten gelöscht',
      error: 'Fehler beim Löschen der Dozenten',
    })
  }

  const handleRefresh = () => {
    fetchData()
  }

  const handleClearFilters = () => {
    const nextPagination = { ...pagination, pageIndex: 0 }

    skipNextFetch.current = true
    skipNextDebouncedUpdate.current = true
    setColumnFilters([])
    setGlobalFilter('')
    setInputValue('')
    setPagination(nextPagination)

    fetchData(nextPagination, sorting, [], '')
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
    columns,
    pageCount,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    meta: {
      updateLecturer: handleUpdate,
      deleteLecturer: handleDelete,
      deleteLecturers: handleDeleteMany,
      refreshLecturers: handleRefresh,
    },

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  const isTrainerCounts = new Map<string, number>()
  if (facets.isTrainer) {
    Object.entries(facets.isTrainer).forEach(([key, value]) => {
      isTrainerCounts.set(key, value)
    })
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/** Desktop only: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search members..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            {/** Mobile only: Show input, view options and refresh button */}
            <ButtonGroup className={'w-full flex-1 md:hidden'}>
              <Input
                placeholder="Search members..."
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
                onClick={handleRefresh}>
                <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                <span className={'sr-only'}>Refresh Data</span>
              </Button>
            </ButtonGroup>
          </div>
          <DataTableFacetedFilter
            title={'Typ'}
            options={[
              {
                value: 'member',
                label: 'Member',
                icon: UsersIcon,
              },
              {
                value: 'trainer',
                label: 'Trainer',
                icon: UserStarIcon,
              },
            ]}
            column={table.getColumn('type')}
            facets={isTrainerCounts}
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
              onClick={handleRefresh}>
              <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
              <span className={'sr-only'}>Daten aktualisieren</span>
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
                  No members found.
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
