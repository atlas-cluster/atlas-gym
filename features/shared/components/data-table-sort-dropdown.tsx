import { ArrowUpDown } from 'lucide-react'

import { Button } from '@/features/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import { Table } from '@tanstack/react-table'

interface DataTableSortDropdownProps<TData> {
  table: Table<TData>
  align?: 'start' | 'end' | 'center'
  items: { id: string; label: string }[]
}

export function DataTableSortDropdown<TData>({
  table,
  align = 'start',
  items,
}: DataTableSortDropdownProps<TData>) {
  const sorting = table.getState().sorting

  const handleSort = (id: string) => {
    table.setSorting(
      sorting[0]?.id === id && sorting[0]?.desc === false
        ? [{ id, desc: true }]
        : [{ id, desc: false }]
    )
  }

  const getSortIcon = (id: string) => {
    if (sorting[0]?.id !== id) return null
    return sorting[0]?.desc ? '↑' : '↓'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" suppressHydrationWarning>
          <ArrowUpDown className="h-4 w-4" />
          <span className="sr-only">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.id} onClick={() => handleSort(item.id)}>
            {item.label} {getSortIcon(item.id)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
