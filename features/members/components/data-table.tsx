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
import { PlanDisplay } from '@/features/plans'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
import { DataTablePagination } from '@/features/shared/components/data-table-pagination'
import { DataTableViewOptions } from '@/features/shared/components/data-table-view-options'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/components/ui/alert-dialog'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import { Input } from '@/features/shared/components/ui/input'
import { Label } from '@/features/shared/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/features/shared/components/ui/radio-group'
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
  getSubscriptionsByMember,
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

  // Subscription Dialog State
  const [cancelSubDialogOpen, setCancelSubDialogOpen] = useState(false)
  const [revertCancelDialogOpen, setRevertCancelDialogOpen] = useState(false)
  const [cancelFutureDialogOpen, setCancelFutureDialogOpen] = useState(false)
  const [choosePlanDialogOpen, setChoosePlanDialogOpen] = useState(false)
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberDisplay | null>(
    null
  )
  const [availablePlans, setAvailablePlans] = useState<PlanDisplay[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')

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
    setSelectedMember(member)
    setCancelSubDialogOpen(true)
  }

  const handleCancelSubscriptionConfirm = async () => {
    if (!selectedMember) return

    const promise = (async () => {
      const subscriptions = await getSubscriptionsByMember(selectedMember.id)
      const activeSubscription = subscriptions.find(
        (s) => s.status === 'active' || s.status === 'cancelled'
      )

      if (activeSubscription) {
        await cancelSubscription(activeSubscription.id, selectedMember.id)
        setCancelSubDialogOpen(false)
        setSelectedMember(null)
        fetchData()
      } else {
        throw new Error('No active subscription found')
      }
    })()

    toast.promise(promise, {
      loading: 'Cancelling subscription...',
      success: 'Subscription cancelled successfully',
      error: (err) => err?.message || 'Failed to cancel subscription',
    })
  }

  const handleRevertCancellation = (member: MemberDisplay) => {
    setSelectedMember(member)
    setRevertCancelDialogOpen(true)
  }

  const handleRevertCancellationConfirm = async () => {
    if (!selectedMember) return

    const promise = (async () => {
      const subscriptions = await getSubscriptionsByMember(selectedMember.id)
      const cancelledSubscription = subscriptions.find(
        (s) => s.status === 'cancelled'
      )

      if (cancelledSubscription) {
        await revertCancellation(cancelledSubscription.id, selectedMember.id)
        setRevertCancelDialogOpen(false)
        setSelectedMember(null)
        fetchData()
      } else {
        throw new Error('No cancelled subscription found')
      }
    })()

    toast.promise(promise, {
      loading: 'Reverting cancellation...',
      success: 'Cancellation reverted successfully',
      error: (err) => err?.message || 'Failed to revert cancellation',
    })
  }

  const handleChangeSubscription = async (member: MemberDisplay) => {
    setSelectedMember(member)
    const plans = await getAvailablePlans()
    setAvailablePlans(plans)
    setSelectedPlanId(plans.length > 0 ? String(plans[0].id) : '')
    setChangePlanDialogOpen(true)
  }

  const handleChangeSubscriptionConfirm = async () => {
    if (!selectedMember || !selectedPlanId) return

    const promise = createSubscription(
      parseInt(selectedPlanId),
      selectedMember.id
    ).then(() => {
      setChangePlanDialogOpen(false)
      setSelectedMember(null)
      setSelectedPlanId('')
      fetchData()
    })

    toast.promise(promise, {
      loading: 'Creating future subscription...',
      success: 'Future subscription created successfully',
      error: (err) => err?.message || 'Failed to create future subscription',
    })
  }

  const handleCancelFutureSubscription = (member: MemberDisplay) => {
    setSelectedMember(member)
    setCancelFutureDialogOpen(true)
  }

  const handleCancelFutureSubscriptionConfirm = async () => {
    if (!selectedMember) return

    const promise = (async () => {
      const subscriptions = await getSubscriptionsByMember(selectedMember.id)
      const futureSubscription = subscriptions.find(
        (s) => s.status === 'future'
      )

      if (futureSubscription) {
        await cancelSubscription(futureSubscription.id, selectedMember.id)
        setCancelFutureDialogOpen(false)
        setSelectedMember(null)
        fetchData()
      } else {
        throw new Error('No future subscription found')
      }
    })()

    toast.promise(promise, {
      loading: 'Cancelling future subscription...',
      success: 'Future subscription cancelled successfully',
      error: (err) => err?.message || 'Failed to cancel future subscription',
    })
  }

  const handleChoosePlan = async (member: MemberDisplay) => {
    setSelectedMember(member)
    const plans = await getAvailablePlans()
    setAvailablePlans(plans)
    setSelectedPlanId(plans.length > 0 ? String(plans[0].id) : '')
    setChoosePlanDialogOpen(true)
  }

  const handleChoosePlanConfirm = async () => {
    if (!selectedMember || !selectedPlanId) return

    const promise = createSubscription(
      parseInt(selectedPlanId),
      selectedMember.id
    ).then(() => {
      setChoosePlanDialogOpen(false)
      setSelectedMember(null)
      setSelectedPlanId('')
      fetchData()
    })

    toast.promise(promise, {
      loading: 'Creating subscription...',
      success: 'Subscription created successfully',
      error: (err) => err?.message || 'Failed to create subscription',
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

      {/* Cancel Subscription Dialog */}
      <AlertDialog
        open={cancelSubDialogOpen}
        onOpenChange={setCancelSubDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the subscription for{' '}
              {selectedMember?.firstname} {selectedMember?.lastname}? This
              action cannot be undone and the subscription will end at the end
              of the billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscriptionConfirm}>
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revert Cancellation Dialog */}
      <AlertDialog
        open={revertCancelDialogOpen}
        onOpenChange={setRevertCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert Cancellation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revert the cancellation for{' '}
              {selectedMember?.firstname} {selectedMember?.lastname}? This will
              reactivate their subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevertCancellationConfirm}>
              Revert Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Future Subscription Dialog */}
      <AlertDialog
        open={cancelFutureDialogOpen}
        onOpenChange={setCancelFutureDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Future Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the future subscription for{' '}
              {selectedMember?.firstname} {selectedMember?.lastname}? This will
              remove the scheduled subscription change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Future Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelFutureSubscriptionConfirm}>
              Cancel Future Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Choose Plan Dialog */}
      <AlertDialog
        open={choosePlanDialogOpen}
        onOpenChange={setChoosePlanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Select a plan for {selectedMember?.firstname}{' '}
              {selectedMember?.lastname}:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <RadioGroup
              value={selectedPlanId}
              onValueChange={setSelectedPlanId}>
              {availablePlans.map((plan) => (
                <div key={plan.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={String(plan.id)}
                    id={`plan-${plan.id}`}
                  />
                  <Label htmlFor={`plan-${plan.id}`} className="flex-1">
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">
                      €{plan.price.toFixed(2)}/month • {plan.minDurationMonths}{' '}
                      {plan.minDurationMonths === 1 ? 'month' : 'months'} min
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChoosePlanConfirm}
              disabled={!selectedPlanId}>
              Choose Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Subscription (Future) Dialog */}
      <AlertDialog
        open={changePlanDialogOpen}
        onOpenChange={setChangePlanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new plan for {selectedMember?.firstname}{' '}
              {selectedMember?.lastname}. This will create a future
              subscription that starts when the current one ends.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <RadioGroup
              value={selectedPlanId}
              onValueChange={setSelectedPlanId}>
              {availablePlans.map((plan) => (
                <div key={plan.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={String(plan.id)}
                    id={`change-plan-${plan.id}`}
                  />
                  <Label htmlFor={`change-plan-${plan.id}`} className="flex-1">
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">
                      €{plan.price.toFixed(2)}/month • {plan.minDurationMonths}{' '}
                      {plan.minDurationMonths === 1 ? 'month' : 'months'} min
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangeSubscriptionConfirm}
              disabled={!selectedPlanId}>
              Change Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
