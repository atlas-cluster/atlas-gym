import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CreditCard,
  GraduationCap,
  KeyRound,
  Landmark,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  User,
} from 'lucide-react'

import { MemberDisplay, MembersTableMeta } from '@/features/members'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import { Table } from '@tanstack/react-table'
import { ColumnDef, Row } from '@tanstack/table-core'

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
    id: 'plan',
    header: 'Plan',
    accessorKey: 'planName',
    cell: ({ row }) => {
      return row.original.planName ? (
        <Badge variant="secondary">{row.original.planName}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">No active plan</span>
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
    accessorFn: (row) => new Date(row.birthdate).toLocaleDateString('de-DE'),
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

function ActionsCell({
  row,
  table,
}: {
  row: Row<MemberDisplay>
  table: Table<MemberDisplay>
}) {
  const meta = table.options.meta as MembersTableMeta | undefined
  const course = row.original

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
                onSelect={() => meta?.openMemberDetails?.(course)}>
                <PencilIcon />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => meta?.openMemberPayment?.(course)}>
                <CreditCard />
                Edit Payment
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => meta?.openChangePassword?.(course)}>
                <KeyRound />
                Change Password
              </DropdownMenuItem>
              {row.original.isTrainer ? (
                <DropdownMenuItem
                  onSelect={() => meta?.convertToMember?.(course.id)}>
                  <User />
                  Convert to Member
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => meta?.convertToTrainer?.(course.id)}>
                  <GraduationCap />
                  Convert to Trainer
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant={'destructive'}
                onSelect={() => meta?.deleteMember?.(course.id)}>
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
