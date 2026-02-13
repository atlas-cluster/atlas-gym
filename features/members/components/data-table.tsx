'use client'

import { GraduationCap, RefreshCwIcon, UserIcon, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { useAuth } from '@/features/auth'
import {
  MemberDisplay,
  changePassword,
  changePasswordSchema,
  convertToMember,
  convertToTrainer,
  deleteMember,
  deleteMembers,
  getMembers,
  memberDetailsSchema,
  memberPaymentSchema,
  updateMember,
  updateMemberPayment,
} from '@/features/members'
import { columns } from '@/features/members/components/columns'
import { ChangePasswordDialog } from '@/features/members/dialog/change-password'
import { MemberDetailsDialog } from '@/features/members/dialog/member-details'
import { MemberPaymentDialog } from '@/features/members/dialog/member-payment'
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
  cancelSubscription,
  createSubscription,
  getAvailablePlans,
  revertCancellation,
} from '@/features/subscriptions'
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

export function DataTable({ initialData }: { initialData: MemberDisplay[] }) {
  const { member: currentMember, refreshMember } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<MemberDisplay[]>(initialData)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [detailsMember, setDetailsMember] = useState<
    MemberDisplay | undefined
  >()
  const [paymentMember, setPaymentMember] = useState<
    MemberDisplay | undefined
  >()
  const [passwordMember, setPasswordMember] = useState<
    MemberDisplay | undefined
  >()

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

  useEffect(() => {
    setTableData(initialData)
  }, [initialData])

  const updateMemberInState = (id: string, update: Partial<MemberDisplay>) => {
    setTableData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...update } : item))
    )
  }

  const handleUpdate = (
    id: string,
    data: z.infer<typeof memberDetailsSchema>
  ) => {
    const promise = updateMember(id, data).then(async () => {
      updateMemberInState(id, {
        firstname: data.firstname,
        middlename: data.middlename || undefined,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone || undefined,
        address: data.address || undefined,
        birthdate: new Date(data.birthdate),
      })

      if (currentMember?.id === id) {
        await refreshMember()
      }
    })

    toast.promise(promise, {
      loading: 'Updating member...',
      success: 'Member updated successfully',
      error: 'Error updating member',
    })
  }

  const handleUpdatePayment = (
    id: string,
    data: z.infer<typeof memberPaymentSchema>
  ) => {
    const promise = updateMemberPayment(id, data).then(() => {
      updateMemberInState(id, { paymentType: data.paymentType })
    })

    toast.promise(promise, {
      loading: 'Updating payment...',
      success: 'Payment updated successfully',
      error: 'Error updating payment',
    })
  }

  const handleDetailsOpenChange = (nextOpen: boolean) => {
    setDetailsOpen(nextOpen)
  }

  const handlePaymentOpenChange = (nextOpen: boolean) => {
    setPaymentOpen(nextOpen)
  }

  const handleDelete = (id: string) => {
    const promise = deleteMember(id).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Deleting member...',
      success: 'Member deleted successfully',
      error: 'Error deleting member',
    })
  }

  const handleDeleteMany = (ids: string[]) => {
    const promise = deleteMembers(ids).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Deleting members...',
      success: 'Members deleted successfully',
      error: 'Error deleting members',
    })
  }

  const handleConvertToMember = (id: string) => {
    const promise = convertToMember(id).then(async () => {
      fetchData()
      if (currentMember?.id === id) {
        await refreshMember()
      }
    })

    toast.promise(promise, {
      loading: 'Changing to member...',
      success: 'Member updated successfully',
      error: 'Error changing member type',
    })
  }

  const handleConvertToTrainer = (id: string) => {
    const promise = convertToTrainer(id).then(async () => {
      fetchData()
      if (currentMember?.id === id) {
        await refreshMember()
      }
    })

    toast.promise(promise, {
      loading: 'Changing to trainer...',
      success: 'Trainer updated successfully',
      error: 'Error changing member type',
    })
  }

  const handleRefresh = () => {
    fetchData()
  }

  const handleCancelSubscription = (member: MemberDisplay) => {
    // TODO: Add confirmation dialog
    if (
      !confirm(
        `Cancel subscription for ${member.firstname} ${member.lastname}?`
      )
    ) {
      return
    }

    startTransition(async () => {
      try {
        // Get member's subscriptions to find the active one
        const response = await fetch(`/api/subscriptions?memberId=${member.id}`)
        const subscriptions: { status: string; id: string }[] =
          await response.json()
        const activeSubscription = subscriptions.find(
          (s) => s.status === 'active' || s.status === 'cancelled'
        )

        if (activeSubscription) {
          await cancelSubscription(activeSubscription.id)
          toast.success('Subscription cancelled successfully')
          fetchData()
        }
      } catch (error) {
        toast.error('Failed to cancel subscription')
        console.error(error)
      }
    })
  }

  const handleRevertCancellation = (member: MemberDisplay) => {
    if (
      !confirm(
        `Revert cancellation for ${member.firstname} ${member.lastname}?`
      )
    ) {
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/subscriptions?memberId=${member.id}`)
        const subscriptions: { status: string; id: string }[] =
          await response.json()
        const cancelledSubscription = subscriptions.find(
          (s) => s.status === 'cancelled'
        )

        if (cancelledSubscription) {
          await revertCancellation(cancelledSubscription.id)
          toast.success('Cancellation reverted successfully')
          fetchData()
        }
      } catch (error) {
        toast.error('Failed to revert cancellation')
        console.error(error)
      }
    })
  }

  const handleChangeSubscription = (member: MemberDisplay) => {
    startTransition(async () => {
      try {
        // Get available plans
        const plans = await getAvailablePlans()

        if (plans.length === 0) {
          toast.error('No plans available')
          return
        }

        // Create a simple plan selection dialog
        const planOptions = plans
          .map(
            (p, i) =>
              `${i + 1}. ${p.name} - €${p.price}/month (${p.minDurationMonths} months min)`
          )
          .join('\n')

        const selection = prompt(
          `Choose a new plan for ${member.firstname} ${member.lastname}:\n\n${planOptions}\n\nEnter the plan number:`
        )

        if (!selection) return

        const planIndex = parseInt(selection) - 1
        if (planIndex < 0 || planIndex >= plans.length) {
          toast.error('Invalid plan selection')
          return
        }

        await createSubscription(plans[planIndex].id)
        toast.success('Future subscription created successfully')
        fetchData()
      } catch (error) {
        toast.error('Failed to create future subscription')
        console.error(error)
      }
    })
  }

  const handleCancelFutureSubscription = (member: MemberDisplay) => {
    if (
      !confirm(
        `Cancel future subscription for ${member.firstname} ${member.lastname}?`
      )
    ) {
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/subscriptions?memberId=${member.id}`)
        const subscriptions: { status: string; id: string }[] =
          await response.json()
        const futureSubscription = subscriptions.find(
          (s) => s.status === 'future'
        )

        if (futureSubscription) {
          await cancelSubscription(futureSubscription.id)
          toast.success('Future subscription cancelled successfully')
          fetchData()
        }
      } catch (error) {
        toast.error('Failed to cancel future subscription')
        console.error(error)
      }
    })
  }

  const handleChoosePlan = (member: MemberDisplay) => {
    startTransition(async () => {
      try {
        // Get available plans
        const plans = await getAvailablePlans()

        if (plans.length === 0) {
          toast.error('No plans available')
          return
        }

        // Create a simple plan selection dialog
        const planOptions = plans
          .map(
            (p, i) =>
              `${i + 1}. ${p.name} - €${p.price}/month (${p.minDurationMonths} months min)`
          )
          .join('\n')

        const selection = prompt(
          `Choose a plan for ${member.firstname} ${member.lastname}:\n\n${planOptions}\n\nEnter the plan number:`
        )

        if (!selection) return

        const planIndex = parseInt(selection) - 1
        if (planIndex < 0 || planIndex >= plans.length) {
          toast.error('Invalid plan selection')
          return
        }

        await createSubscription(plans[planIndex].id)
        toast.success('Subscription created successfully')
        fetchData()
      } catch (error) {
        toast.error('Failed to create subscription')
        console.error(error)
      }
    })
  }

  const fetchData = () => {
    startTransition(async () => {
      const result = await getMembers()
      setRowSelection({})
      setTableData(result)
    })
  }

  const handlePasswordChange = async (
    data: z.infer<typeof changePasswordSchema>
  ) => {
    if (!passwordMember) return

    const promise = changePassword(passwordMember.id, data)

    toast.promise(promise, {
      loading: 'Changing password...',
      success: 'Password changed successfully',
      error: 'Failed to change password',
    })

    return promise
  }

  const table = useReactTable({
    data: tableData,
    columns,

    meta: {
      updateMember: handleUpdate,
      updateMemberPayment: handleUpdatePayment,
      openMemberDetails: (member: MemberDisplay) => {
        setDetailsMember(member)
        setDetailsOpen(true)
      },
      openMemberPayment: (member: MemberDisplay) => {
        setPaymentMember(member)
        setPaymentOpen(true)
      },
      openChangePassword: (member: MemberDisplay) => {
        setPasswordMember(member)
        setPasswordOpen(true)
      },
      deleteMember: handleDelete,
      deleteMembers: handleDeleteMany,
      convertToMember: handleConvertToMember,
      convertToTrainer: handleConvertToTrainer,
      refreshMembers: handleRefresh,
      cancelSubscription: handleCancelSubscription,
      revertCancellation: handleRevertCancellation,
      changeSubscription: handleChangeSubscription,
      cancelFutureSubscription: handleCancelFutureSubscription,
      choosePlan: handleChoosePlan,
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

  return (
    <div className="w-full space-y-3">
      <MemberDetailsDialog
        member={detailsMember}
        open={detailsOpen}
        onOpenChange={handleDetailsOpenChange}
        onSubmit={(payload) =>
          detailsMember ? handleUpdate(detailsMember.id, payload) : undefined
        }
      />
      <MemberPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        member={paymentMember}
        onSubmit={(data) =>
          paymentMember && handleUpdatePayment(paymentMember.id, data)
        }
      />
      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        member={passwordMember}
        onSubmit={handlePasswordChange}
      />
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
                onClick={handleRefresh}>
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
            title={'Plan'}
            options={Array.from(
              new Set(
                tableData
                  .map((m) => m.planName)
                  .filter((name): name is string => !!name)
              )
            )
              .sort()
              .map((name) => ({
                value: name,
                label: name,
              }))}
            column={table.getColumn('plan')}
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
