import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CreditCard,
  GraduationCap,
  Landmark,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  User,
} from 'lucide-react'
import { useState } from 'react'

import { Member, MembersTableMeta } from '@/features/members'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { Card } from '@/features/shared/components/ui/card'
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

const paymentTypeConfig = {
  credit_card: {
    label: 'Credit card',
    icon: CreditCard,
  },
  iban: {
    label: 'IBAN',
    icon: Landmark,
  },
}

export const columns: ColumnDef<Member>[] = [
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
      const config = paymentTypeConfig[row.original.paymentType]
      const Icon = config.icon
      return (
        <Badge variant="outline">
          <Icon />
          {config.label}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
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
  row: Row<Member>
  table: Table<Member>
}) {
  const meta = table.options.meta as MembersTableMeta | undefined
  const course = row.original
  const [open, setOpen] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  return (
    <div className="flex justify-end">
      {/*<CourseDialog*/}
      {/*  course={course}*/}
      {/*  open={open}*/}
      {/*  onOpenChange={setOpen}*/}
      {/*  onSubmit={(payload) => meta?.updateCourse?.(course.id, payload)}*/}
      {/*/>*/}
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
              <DropdownMenuItem onSelect={() => setOpen(true)}>
                <PencilIcon />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOpen(true)}>
                <CreditCard />
                Edit Payment
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
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete ({selectedRows.length})
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
