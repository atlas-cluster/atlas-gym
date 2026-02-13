'use client'

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  PlanDisplay,
  createPlan,
  deletePlan,
  getPlans,
  planDetailsSchema,
  updatePlan,
} from '@/features/plans'
import { PlanDetailsDialog } from '@/features/plans/dialog/plan-details'
import { DataTableRangeFilter } from '@/features/shared/components/data-table-range-filter'
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
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import { Input } from '@/features/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'

export function PlansGrid({ initialData }: { initialData: PlanDisplay[] }) {
  const [isPending, startTransition] = useTransition()
  const [plansData, setPlansData] = useState<PlanDisplay[]>(initialData)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanDisplay | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<PlanDisplay | null>(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(12)
  const [sortBy, setSortBy] = useState<
    'name' | 'price' | 'minDuration' | 'subscriptionCount'
  >('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 36])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])

  // Calculate min/max values from data
  const minPrice = Math.min(...plansData.map((p) => p.price), 0)
  const maxPrice = Math.max(...plansData.map((p) => p.price), 200)

  useEffect(() => {
    setPlansData(initialData)
  }, [initialData])

  const handleRefresh = () => {
    fetchData()
  }

  const fetchData = () => {
    startTransition(async () => {
      const result = await getPlans()
      setPlansData(result)
    })
  }

  const handleCreate = () => {
    setSelectedPlan(null)
    setDetailsOpen(true)
  }

  const handleEdit = (plan: PlanDisplay) => {
    setSelectedPlan(plan)
    setDetailsOpen(true)
  }

  const handleDeleteClick = (plan: PlanDisplay) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return

    const promise = deletePlan(planToDelete.id).then(() => {
      fetchData()
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
    })

    toast.promise(promise, {
      loading: 'Deleting plan...',
      success: 'Plan deleted successfully',
      error: (err) => {
        const message = err?.message || 'Error deleting plan'
        if (message.includes('foreign key')) {
          return 'Cannot delete plan with active subscriptions'
        }
        return message
      },
    })
  }

  const handleSubmit = (data: z.infer<typeof planDetailsSchema>) => {
    if (selectedPlan) {
      // Update existing plan
      const promise = updatePlan(selectedPlan.id, data).then(() => {
        fetchData()
      })

      toast.promise(promise, {
        loading: 'Updating plan...',
        success: 'Plan updated successfully',
        error: 'Error updating plan',
      })
    } else {
      // Create new plan
      const promise = createPlan(data).then(() => {
        fetchData()
      })

      toast.promise(promise, {
        loading: 'Creating plan...',
        success: 'Plan created successfully',
        error: 'Error creating plan',
      })
    }
  }

  // Filter and sort plans
  const filteredAndSortedPlans = plansData
    .filter((plan) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          plan.name.toLowerCase().includes(query) ||
          plan.description?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Duration range filter
      if (
        plan.minDurationMonths < durationRange[0] ||
        plan.minDurationMonths > durationRange[1]
      ) {
        return false
      }

      // Price range filter
      if (plan.price < priceRange[0] || plan.price > priceRange[1]) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'minDuration':
          comparison = a.minDurationMonths - b.minDurationMonths
          break
        case 'subscriptionCount':
          comparison = (a.subscriptionCount || 0) - (b.subscriptionCount || 0)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Paginate filtered plans
  const totalPages = Math.ceil(filteredAndSortedPlans.length / pageSize)
  const paginatedPlans = filteredAndSortedPlans.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [searchQuery, durationRange, priceRange, sortBy, sortOrder])

  return (
    <div className="w-full space-y-3">
      <PlanDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        plan={selectedPlan}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the plan &quot;{planToDelete?.name}
              &quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/* Desktop: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Mobile: Show input and buttons */}
            <div className={'flex w-full gap-2 md:hidden'}>
              <ButtonGroup className="flex-1">
                <Input
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      suppressHydrationWarning>
                      <ArrowUpDown />
                      <span className="sr-only">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSortBy('name')
                        setSortOrder(
                          sortBy === 'name' && sortOrder === 'asc'
                            ? 'desc'
                            : 'asc'
                        )
                      }}>
                      Name{' '}
                      {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortBy('price')
                        setSortOrder(
                          sortBy === 'price' && sortOrder === 'asc'
                            ? 'desc'
                            : 'asc'
                        )
                      }}>
                      Price{' '}
                      {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortBy('minDuration')
                        setSortOrder(
                          sortBy === 'minDuration' && sortOrder === 'asc'
                            ? 'desc'
                            : 'asc'
                        )
                      }}>
                      Min Duration{' '}
                      {sortBy === 'minDuration' &&
                        (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortBy('subscriptionCount')
                        setSortOrder(
                          sortBy === 'subscriptionCount' && sortOrder === 'asc'
                            ? 'desc'
                            : 'asc'
                        )
                      }}>
                      Subscriptions{' '}
                      {sortBy === 'subscriptionCount' &&
                        (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <Button
                variant="default"
                size="icon"
                type="button"
                onClick={handleCreate}
                suppressHydrationWarning>
                <PlusIcon />
                <span className="sr-only">Create Plan</span>
              </Button>
            </div>
          </div>

          {/* Range Filters */}
          <DataTableRangeFilter
            title="Duration"
            min={0}
            max={36}
            value={durationRange}
            onChange={setDurationRange}
            formatValue={(v) => `${v}mo`}
            step={1}
          />

          <DataTableRangeFilter
            title="Price"
            min={Math.floor(minPrice)}
            max={Math.ceil(maxPrice)}
            value={priceRange}
            onChange={setPriceRange}
            formatValue={(v) => `€${v}`}
            step={1}
          />

          {(searchQuery ||
            durationRange[0] !== 0 ||
            durationRange[1] !== 36 ||
            priceRange[0] !== minPrice ||
            priceRange[1] !== maxPrice) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => {
                setSearchQuery('')
                setDurationRange([0, 36])
                setPriceRange([minPrice, maxPrice])
              }}
              suppressHydrationWarning>
              <XIcon />
              <span className={'sr-only'}>Clear filters</span>
            </Button>
          )}
        </div>

        {/* Desktop: Show sorting and action buttons on the right */}
        <div className={'hidden md:flex gap-2'}>
          <ButtonGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" suppressHydrationWarning>
                  <ArrowUpDown />
                  <span className="sr-only">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy('name')
                    setSortOrder(
                      sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc'
                    )
                  }}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy('price')
                    setSortOrder(
                      sortBy === 'price' && sortOrder === 'asc' ? 'desc' : 'asc'
                    )
                  }}>
                  Price{' '}
                  {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy('minDuration')
                    setSortOrder(
                      sortBy === 'minDuration' && sortOrder === 'asc'
                        ? 'desc'
                        : 'asc'
                    )
                  }}>
                  Min Duration{' '}
                  {sortBy === 'minDuration' &&
                    (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy('subscriptionCount')
                    setSortOrder(
                      sortBy === 'subscriptionCount' && sortOrder === 'asc'
                        ? 'desc'
                        : 'asc'
                    )
                  }}>
                  Subscriptions{' '}
                  {sortBy === 'subscriptionCount' &&
                    (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
          <Button
            variant="default"
            size="default"
            type="button"
            onClick={handleCreate}
            suppressHydrationWarning>
            <PlusIcon />
            <span className="hidden md:inline">Create Plan</span>
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      {paginatedPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {paginatedPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      <Badge variant="secondary" className="text-xs">
                        <UsersIcon className="w-3 h-3" />
                        {plan.subscriptionCount || 0}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {plan.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <CardAction>
                  <ButtonGroup>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(plan)}
                      suppressHydrationWarning>
                      <PencilIcon />
                      <span className="sr-only">Edit plan</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(plan)}
                      suppressHydrationWarning>
                      <TrashIcon />
                      <span className="sr-only">Delete plan</span>
                    </Button>
                  </ButtonGroup>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">€{plan.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Min. Duration:</span>
                  <span className="font-medium">
                    {plan.minDurationMonths}{' '}
                    {plan.minDurationMonths === 1 ? 'month' : 'months'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {searchQuery
              ? 'No plans found matching your search.'
              : 'No plans available.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredAndSortedPlans.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground flex-1 text-sm">
            Showing {currentPage * pageSize + 1} to{' '}
            {Math.min(
              (currentPage + 1) * pageSize,
              filteredAndSortedPlans.length
            )}{' '}
            of {filteredAndSortedPlans.length} plan(s)
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Items per page</p>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(0)
                }}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[6, 12, 24, 48, 999999999].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size === 999999999 ? 'All' : size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage + 1} of {totalPages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="hidden size-8 lg:flex"
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}>
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}>
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={currentPage >= totalPages - 1}>
                <span className="sr-only">Go to next page</span>
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hidden size-8 lg:flex"
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}>
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
