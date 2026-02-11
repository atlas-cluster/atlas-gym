import { Member } from '@/features/members'
import { ColumnDef } from '@tanstack/table-core'

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    accessorFn: (row) =>
      `${row.firstname} ${row.middlename ? row.middlename + ' ' : ''}${row.lastname}`,
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    accessorFn: (row) => (row.isTrainer ? 'Trainer' : 'Member'),
    enableSorting: true,
    enableHiding: false,
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
    header: 'Birthdate',
    accessorFn: (row) => new Date(row.birthdate).toISOString(),
    enableSorting: false,
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
]
