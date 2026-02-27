import { format } from 'date-fns'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Check,
  CreditCard,
  GraduationCap,
  Landmark,
  User,
  X,
} from 'lucide-react'

import { MemberDisplay } from '@/features/members'
import { MemberActions } from '@/features/members/components/member-actions'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
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

export const memberColumns: ColumnDef<MemberDisplay>[] = [
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
    accessorKey: 'currentSubscription.planId',
    filterFn: facetedFilter,
    cell: ({ row }) => {
      // Active subscription
      if (
        row.original.currentSubscription &&
        !row.original.futureSubscription &&
        row.original.currentSubscription.isActive &&
        !row.original.currentSubscription.isCancelled
      ) {
        return (
          <Badge>
            <Check />
            {row.original.currentSubscription.name}
          </Badge>
        )
      }
      // Cancelled subscription without future subscription
      if (
        row.original.currentSubscription &&
        !row.original.futureSubscription &&
        row.original.currentSubscription.isActive &&
        row.original.currentSubscription.isCancelled
      ) {
        return (
          <Badge variant={'destructive'}>
            <X />
            {row.original.currentSubscription.name}
          </Badge>
        )
      }

      // Cancelled subscription with future subscription
      if (
        row.original.currentSubscription &&
        row.original.futureSubscription &&
        row.original.currentSubscription.isActive &&
        row.original.currentSubscription.isCancelled &&
        row.original.futureSubscription.isFuture
      ) {
        return (
          <Badge>
            {row.original.currentSubscription.name} <ArrowRight />{' '}
            {row.original.futureSubscription.name}
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
    cell: ({ row, table }) => <MemberActions row={row} table={table} />,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
