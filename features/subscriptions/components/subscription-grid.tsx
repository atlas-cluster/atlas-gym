'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { format } from 'date-fns'
import {
  ArrowUpDown,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCwIcon,
  UsersIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { PlanDisplay } from '@/features/plans'
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
import {
  MemberSubscriptionDisplay,
  cancelSubscription,
  createSubscription,
  getAvailablePlans,
  getMemberSubscriptions,
} from '@/features/subscriptions'

export function SubscriptionGrid({
  initialSubscriptions,
  initialPlans,
}: {
  initialSubscriptions: MemberSubscriptionDisplay[]
  initialPlans: PlanDisplay[]
}) {
  const [isPending, startTransition] = useTransition()
  const [subscriptions, setSubscriptions] =
    useState<MemberSubscriptionDisplay[]>(initialSubscriptions)
  const [plans, setPlans] = useState<PlanDisplay[]>(initialPlans)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [subscriptionToCancel, setSubscriptionToCancel] =
    useState<MemberSubscriptionDisplay | null>(null)
  const [chooseDialogOpen, setChooseDialogOpen] = useState(false)
  const [planToChoose, setPlanToChoose] = useState<PlanDisplay | null>(null)

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
  const minPrice = Math.min(...plans.map((p) => p.price), 0)
  const maxPrice = Math.max(...plans.map((p) => p.price), 200)

  useEffect(() => {
    setSubscriptions(initialSubscriptions)
    setPlans(initialPlans)
  }, [initialSubscriptions, initialPlans])

  const handleRefresh = () => {
    fetchData()
  }

  const fetchData = () => {
    startTransition(async () => {
      const [subs, availablePlans] = await Promise.all([
        getMemberSubscriptions(),
        getAvailablePlans(),
      ])
      setSubscriptions(subs)
      setPlans(availablePlans)
    })
  }

  const handleCancelClick = (subscription: MemberSubscriptionDisplay) => {
    setSubscriptionToCancel(subscription)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!subscriptionToCancel) return

    const promise = cancelSubscription(subscriptionToCancel.id).then(() => {
      fetchData()
      setCancelDialogOpen(false)
      setSubscriptionToCancel(null)
    })

    toast.promise(promise, {
      loading: 'Cancelling subscription...',
      success: 'Subscription cancelled successfully',
      error: (err) => err?.message || 'Error cancelling subscription',
    })
  }

  const handleChoosePlan = (plan: PlanDisplay) => {
    setPlanToChoose(plan)
    setChooseDialogOpen(true)
  }

  const handleChooseConfirm = async () => {
    if (!planToChoose) return

    const promise = createSubscription(planToChoose.id).then(() => {
      fetchData()
      setChooseDialogOpen(false)
      setPlanToChoose(null)
    })

    toast.promise(promise, {
      loading: 'Creating subscription...',
      success: 'Subscription created successfully',
      error: (err) => err?.message || 'Error creating subscription',
    })
  }

  // Determine if user can choose a new plan
  const activeSubscription = subscriptions.find((s) => s.status === 'active')
  const cancelledSubscription = subscriptions.find(
    (s) => s.status === 'cancelled'
  )
  const futureSubscription = subscriptions.find((s) => s.status === 'future')
  const canChooseNewPlan =
    !activeSubscription && !futureSubscription && !cancelledSubscription
  const allPlansToDisplay: (PlanDisplay & {
    isCurrentPlan?: boolean
    subscription?: MemberSubscriptionDisplay
  })[] = plans.map((plan) => {
    const isCurrentActive =
      activeSubscription && activeSubscription.planId === plan.id
    const isCancelled =
      cancelledSubscription && cancelledSubscription.planId === plan.id
    const isFuture = futureSubscription && futureSubscription.planId === plan.id

    const subscription = isCurrentActive
      ? activeSubscription
      : isCancelled
        ? cancelledSubscription
        : isFuture
          ? futureSubscription
          : undefined

    return {
      ...plan,
      isCurrentPlan: !!(isCurrentActive || isCancelled || isFuture),
      subscription,
    }
  })

  // Sort so current plan comes first
  const sortedPlans = [...allPlansToDisplay].sort((a, b) => {
    if (a.isCurrentPlan && !b.isCurrentPlan) return -1
    if (!a.isCurrentPlan && b.isCurrentPlan) return 1
    return 0
  })

  // Filter and sort plans
  const filteredAndSortedPlans = sortedPlans
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
      // Keep current plan first regardless of sorting
      if (a.isCurrentPlan && !b.isCurrentPlan) return -1
      if (!a.isCurrentPlan && b.isCurrentPlan) return 1

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
      {/* Cancel Subscription Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              {subscriptionToCancel?.status === 'future'
                ? `This will immediately cancel your future subscription to "${subscriptionToCancel?.planName}".`
                : `This will cancel your subscription to "${subscriptionToCancel?.planName}" at the end of the current month (${subscriptionToCancel?.endDate ? format(new Date(), 'MMMM yyyy') : ''}).`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm}>
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Choose Plan Dialog */}
      <AlertDialog open={chooseDialogOpen} onOpenChange={setChooseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelledSubscription
                ? `This subscription will start on ${cancelledSubscription.endDate ? format(new Date(new Date(cancelledSubscription.endDate).getTime() + 86400000), 'MMMM d, yyyy') : ''} (the day after your current subscription ends).`
                : `This subscription will start immediately.`}
              <br />
              <br />
              Plan: <strong>{planToChoose?.name}</strong>
              <br />
              Price: <strong>€{planToChoose?.price.toFixed(2)}/month</strong>
              <br />
              Minimum Duration:{' '}
              <strong>
                {planToChoose?.minDurationMonths}{' '}
                {planToChoose?.minDurationMonths === 1 ? 'month' : 'months'}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChooseConfirm}>
              Choose Plan
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

        {/* Desktop: Show sorting and refresh button on the right */}
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
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      {plan.name}
                      {plan.subscription && (
                        <>
                          {plan.subscription.status === 'active' && (
                            <Badge variant="default" className="text-xs">
                              <UsersIcon className="w-3 h-3" />
                              Active
                            </Badge>
                          )}
                          {plan.subscription.status === 'cancelled' && (
                            <Badge variant="secondary" className="text-xs">
                              <XCircleIcon className="w-3 h-3" />
                              Cancelled - Ends{' '}
                              {format(
                                new Date(plan.subscription.endDate!),
                                'MMM d'
                              )}
                            </Badge>
                          )}
                          {plan.subscription.status === 'future' && (
                            <Badge variant="outline" className="text-xs">
                              <CalendarIcon className="w-3 h-3" />
                              Starts{' '}
                              {format(
                                new Date(plan.subscription.startDate),
                                'MMM d'
                              )}
                            </Badge>
                          )}
                        </>
                      )}
                      {!plan.subscription && (
                        <Badge variant="secondary" className="text-xs">
                          <UsersIcon className="w-3 h-3" />
                          {plan.subscriptionCount || 0}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {plan.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                {plan.subscription && (
                  <CardAction>
                    {plan.subscription.canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelClick(plan.subscription!)}
                        suppressHydrationWarning>
                        Cancel
                      </Button>
                    )}
                  </CardAction>
                )}
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
                {!plan.subscription &&
                  (canChooseNewPlan || cancelledSubscription) && (
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleChoosePlan(plan)}
                      suppressHydrationWarning>
                      <CheckCircle2Icon className="w-4 h-4" />
                      Choose Plan
                    </Button>
                  )}
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
