'use client'

import { GraduationCap, RefreshCwIcon, UserIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'

import { MemberDisplay, getMembers } from '@/features/members'
import { memberColumns } from '@/features/members/components/member-columns'
import { PlanDisplayMinimal, getPlansMinimal } from '@/features/plans'
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
  flexRender,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
} from '@tanstack/table-core'

export interface DataTableProps {
  members: MemberDisplay[]
  plans: PlanDisplayMinimal[]
  onUpdateDetails: (data: MemberDisplay) => void
  onUpdatePayment: (data: MemberDisplay) => void
  onUpdatePassword: (data: MemberDisplay) => void
  onConvertToMember: (data: MemberDisplay) => void
  onConvertToTrainer: (data: MemberDisplay) => void
  onChooseSubscription: (
    member: MemberDisplay,
    plan: PlanDisplayMinimal
  ) => void
  onChooseFutureSubscription: (
    member: MemberDisplay,
    plan: PlanDisplayMinimal
  ) => void
  onCancelSubscription: (member: MemberDisplay) => void
  onCancelFutureSubscription: (member: MemberDisplay) => void
  onRevertCancelSubscription: (member: MemberDisplay) => void
  onDeleteSubscription: (member: MemberDisplay) => void
  onDelete: (member: MemberDisplay) => void
  onDeleteMany: (members: MemberDisplay[]) => void
}

export function MembersDataTable({
  members,
  plans,
  onUpdateDetails,
  onUpdatePayment,
  onUpdatePassword,
  onConvertToMember,
  onConvertToTrainer,
  onChooseSubscription,
  onChooseFutureSubscription,
  onCancelSubscription,
  onCancelFutureSubscription,
  onRevertCancelSubscription,
  onDeleteSubscription,
  onDelete,
  onDeleteMany,
}: DataTableProps) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<MemberDisplay[]>(members)
  const [availablePlans, setAvailablePlans] =
    useState<PlanDisplayMinimal[]>(plans)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  useEffect(() => {
    setTableData(members)
  }, [members])

  useEffect(() => {
    setAvailablePlans(plans)
  }, [plans])

  const onRefreshMembers = () => {
    startTransition(async () => {
      const [members, plans] = await Promise.all([
        getMembers(),
        getPlansMinimal(),
      ])
      setTableData(members)
      setAvailablePlans(plans)
    })
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns: memberColumns,

    meta: {
      plans: availablePlans,
      onUpdateDetails,
      onUpdatePayment,
      onUpdatePassword,
      onConvertToMember,
      onConvertToTrainer,
      onChooseSubscription,
      onChooseFutureSubscription,
      onCancelSubscription,
      onCancelFutureSubscription,
      onRevertCancelSubscription,
      onDeleteSubscription,
      onDelete,
      onDeleteMany,
    },

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
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
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter, columnFilters])

  const subscriptionOptions = useMemo(() => {
    const subscriptionColumn = table.getColumn('subscription')
    if (!subscriptionColumn) return []

    const uniqueValues = subscriptionColumn.getFacetedUniqueValues()

    const presentPlans = availablePlans.filter((plan) =>
      uniqueValues.has(plan.id)
    )

    return presentPlans.map((plan) => ({
      value: plan.id,
      label: plan.name,
    }))
  }, [table, availablePlans])

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/** Desktop only: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search members..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
            {/** Mobile only: Show input, view options and refresh button */}
            <ButtonGroup className={'w-full flex-1 md:hidden'}>
              <Input
                placeholder="Search members..."
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
                onClick={onRefreshMembers}>
                <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                <span className={'sr-only'}>Refresh Data</span>
              </Button>
            </ButtonGroup>
          </div>
          <DataTableFacetedFilter
            title={'Type'}
            options={[
              {
                value: 'member',
                label: 'Member',
                icon: UserIcon,
              },
              {
                value: 'trainer',
                label: 'Trainer',
                icon: GraduationCap,
              },
            ]}
            column={table.getColumn('type')}
          />
          <DataTableFacetedFilter
            title={'Subscription'}
            options={subscriptionOptions}
            column={table.getColumn('subscription')}
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
              onClick={onRefreshMembers}>
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
                  colSpan={memberColumns.length}
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
