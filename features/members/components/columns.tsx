import { format } from 'date-fns'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  CalendarPlus,
  Check,
  CreditCard,
  GraduationCap,
  KeyRound,
  Landmark,
  MoreHorizontalIcon,
  PencilIcon,
  RotateCcw,
  Search,
  TrashIcon,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { MemberDisplay, MembersTableMeta } from '@/features/members'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import { Input } from '@/features/shared/components/ui/input'
import { Table } from '@tanstack/react-table'
import { ColumnDef, Row } from '@tanstack/table-core'

// Custom filter function for faceted filters
// Uses OR logic within a single faceted filter (matches ANY of the selected values)
// TanStack Table applies AND logic across different column filters
export const facetedFilter = (
  row: Row<MemberDisplay>,
  columnId: string,
  filterValues: string[]
) => {
  if (!filterValues?.length) return true
  const cellValue = row.getValue(columnId)
  return filterValues.includes(String(cellValue))
}

export const columns: ColumnDef<MemberDisplay>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown />
          ) : (
            <ArrowUpDown />
          )}
        </Button>
      )
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.lastname.localeCompare(rowB.original.lastname)
    },
    accessorFn: (row) =>
      `${row.firstname} ${row.middlename ? row.middlename + ' ' : ''}${row.lastname}`,
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Type',
    accessorFn: (row) => (row.isTrainer ? 'trainer' : 'member'),
    filterFn: facetedFilter,
    cell: ({ row }) => (
      <Badge variant={row.original.isTrainer ? 'default' : 'secondary'}>
        {row.original.isTrainer ? <GraduationCap /> : <User />}
        {row.original.isTrainer ? 'Trainer' : 'Member'}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    id: 'payment',
    header: 'Payment',
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.original.paymentType === 'credit_card' ? (
            <>
              <CreditCard />
              <span>Credit Card</span>
            </>
          ) : (
            <>
              <Landmark />
              IBAN
            </>
          )}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    id: 'subscription',
    header: 'Subscription',
    accessorKey: 'planName',
    filterFn: facetedFilter,
    cell: ({ row }) => {
      const { planName, isCancelled, futureSubscriptionName } = row.original

      // Active subscription
      if (planName && !isCancelled && !futureSubscriptionName) {
        return (
          <Badge>
            <Check />
            {planName}
          </Badge>
        )
      }

      // Cancelled subscription without future subscription
      if (planName && isCancelled && !futureSubscriptionName) {
        return (
          <Badge variant={'destructive'}>
            <X />
            {planName}
          </Badge>
        )
      }

      // Cancelled subscription with future subscription
      if (futureSubscriptionName) {
        return (
          <Badge>
            {planName} <ArrowRight /> {futureSubscriptionName}
          </Badge>
        )
      }

      // No subscription at all
      return (
        <span className="text-muted-foreground text-sm">No subscription</span>
      )
    },
    enableSorting: true,
    enableHiding: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'email',
    header: 'E-Mail',
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'birthdate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Birthdate
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown />
          ) : (
            <ArrowUpDown />
          )}
        </Button>
      )
    },
    sortingFn: (rowA, rowB) => {
      return (
        new Date(rowA.original.birthdate).getTime() -
        new Date(rowB.original.birthdate).getTime()
      )
    },
    cell: ({ row }) => (
      <span className={'ml-3'}>
        {format(new Date(row.original.birthdate), 'dd.MM.yyyy')}
      </span>
    ),
    enableSorting: true,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'address',
    header: 'Address',
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: true,
  },
  {
    id: 'actions',
    cell: ({ row, table }) => <ActionsCell row={row} table={table} />,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]

// Scrollable Plan Selector Component with Search
function ScrollablePlanSelector({
  plans,
  onSelectPlan,
}: {
  plans: Array<{
    id: string
    name: string
    price: number
    minDurationMonths: number
  }>
  onSelectPlan: (planId: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-[280px]">
      <div className="p-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8"
            autoFocus
            onKeyDown={(e) => {
              // Prevent dropdown from closing when typing
              e.stopPropagation()
            }}
          />
        </div>
      </div>
      <div className="max-h-[300px] overflow-y-auto overflow-x-hidden px-1">
        {filteredPlans.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No plans found
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <DropdownMenuItem
              key={plan.id}
              onSelect={() => onSelectPlan(plan.id)}
              className="cursor-pointer">
              <div className="flex flex-col">
                <span className="font-medium">{plan.name}</span>
                <span className="text-xs text-muted-foreground">
                  €{plan.price.toFixed(2)}/month • {plan.minDurationMonths}{' '}
                  {plan.minDurationMonths === 1 ? 'month' : 'months'} min
                </span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </div>
    </div>
  )
}

function ActionsCell({
  row,
  table,
}: {
  row: Row<MemberDisplay>
  table: Table<MemberDisplay>
}) {
  const meta = table.options.meta as MembersTableMeta | undefined
  const member = row.original

  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={'icon-sm'} suppressHydrationWarning>
            <span className={'sr-only'}>Open Menu</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {selectedRows.length <= 1 || !row.getIsSelected() ? (
            <>
              <DropdownMenuItem
                onSelect={() => meta?.openMemberDetails?.(member)}>
                <PencilIcon />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => meta?.openMemberPayment?.(member)}>
                <CreditCard />
                Edit Payment
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => meta?.openChangePassword?.(member)}>
                <KeyRound />
                Change Password
              </DropdownMenuItem>
              {row.original.isTrainer ? (
                <DropdownMenuItem
                  onSelect={() => meta?.convertToMember?.(member.id)}>
                  <User />
                  Convert to Member
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => meta?.convertToTrainer?.(member.id)}>
                  <GraduationCap />
                  Convert to Trainer
                </DropdownMenuItem>
              )}

              {/* Subscription Management - Individual Actions Based on Status */}
              {/* Active subscription - show cancel option */}
              {member.planName && !member.isCancelled && (
                <DropdownMenuItem
                  onSelect={() => meta?.cancelSubscription?.(member)}>
                  <XCircle />
                  Cancel Subscription
                </DropdownMenuItem>
              )}

              {/* Cancelled subscription - show revert and change options */}
              {member.planName && member.isCancelled && (
                <>
                  <DropdownMenuItem
                    onSelect={() => meta?.revertCancellation?.(member)}>
                    <RotateCcw />
                    Revert Cancellation
                  </DropdownMenuItem>

                  {!member.futureSubscriptionName && meta?.availablePlans && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <CalendarPlus />
                        Change Subscription
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="p-0">
                        <ScrollablePlanSelector
                          plans={meta.availablePlans}
                          onSelectPlan={(planId) =>
                            meta?.changeSubscription?.(member, planId)
                          }
                        />
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}

                  {member.futureSubscriptionName && (
                    <DropdownMenuItem
                      onSelect={() => meta?.cancelFutureSubscription?.(member)}>
                      <XCircle />
                      Cancel Future Subscription
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {/* No subscription - show choose plan option */}
              {!member.planName && meta?.availablePlans && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <CalendarPlus />
                    Choose Plan
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0">
                    <ScrollablePlanSelector
                      plans={meta.availablePlans}
                      onSelectPlan={(planId) =>
                        meta?.choosePlan?.(member, planId)
                      }
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              {/* Admin action - Remove any subscription immediately */}
              {(member.planName || member.futureSubscriptionName) && (
                <DropdownMenuItem
                  variant={'destructive'}
                  onSelect={() => meta?.removeSubscription?.(member)}>
                  <TrashIcon />
                  Remove Subscription
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                variant={'destructive'}
                onSelect={() => meta?.deleteMember?.(member.id)}>
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                variant={'destructive'}
                onSelect={() =>
                  meta?.deleteMembers?.(selectedRows.map((r) => r.original.id))
                }>
                <TrashIcon />
                Delete ({selectedRows.length})
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
