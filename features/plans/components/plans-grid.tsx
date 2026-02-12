'use client'

import {
  PlusIcon,
  RefreshCwIcon,
  XIcon,
  PencilIcon,
  TrashIcon,
  CheckCircle2Icon,
  UsersIcon,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  PlanDisplay,
  getPlans,
  planDetailsSchema,
  updatePlan,
  deletePlan,
  createPlan,
} from '@/features/plans'
import { PlanDetailsDialog } from '@/features/plans/dialog/plan-details'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { Input } from '@/features/shared/components/ui/input'
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

  // Filter plans based on search query
  const filteredPlans = plansData.filter((plan) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      plan.name.toLowerCase().includes(query) ||
      plan.description?.toLowerCase().includes(query)
    )
  })

  // Paginate filtered plans
  const totalPages = Math.ceil(filteredPlans.length / pageSize)
  const paginatedPlans = filteredPlans.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(0)
  }, [searchQuery])

  return (
    <div className="w-full space-y-4">
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
              This will permanently delete the plan &quot;{planToDelete?.name}&quot;.
              This action cannot be undone.
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
            {/* Mobile: Show input and refresh button */}
            <ButtonGroup className={'w-full flex-1 md:hidden'}>
              <Input
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
          {searchQuery && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => setSearchQuery('')}
              suppressHydrationWarning>
              <XIcon />
              <span className={'sr-only'}>Clear search</span>
            </Button>
          )}
        </div>
        {/* Desktop: Show refresh and create buttons on the right */}
        <div className={'hidden md:flex gap-2'}>
          <ButtonGroup>
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
            <Button
              variant="default"
              size="default"
              type="button"
              onClick={handleCreate}
              suppressHydrationWarning>
              <PlusIcon />
              Create Plan
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Mobile: Create button */}
      <div className="md:hidden">
        <Button
          variant="default"
          size="default"
          type="button"
          className="w-full"
          onClick={handleCreate}
          suppressHydrationWarning>
          <PlusIcon />
          Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {paginatedPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      {plan.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle2Icon className="w-3 h-3" />
                          Default
                        </Badge>
                      )}
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
                      <PencilIcon className="w-4 h-4" />
                      <span className="sr-only">Edit plan</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(plan)}
                      suppressHydrationWarning>
                      <TrashIcon className="w-4 h-4" />
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
                  <span className="text-muted-foreground">
                    Min. Duration:
                  </span>
                  <span className="font-medium">
                    {plan.minDurationMonths}{' '}
                    {plan.minDurationMonths === 1 ? 'month' : 'months'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UsersIcon className="w-4 h-4" />
                  <span>
                    {plan.subscriptionCount || 0} active{' '}
                    {plan.subscriptionCount === 1 ? 'subscription' : 'subscriptions'}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {searchQuery ? 'No plans found matching your search.' : 'No plans available.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredPlans.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground text-sm">
            Showing {currentPage * pageSize + 1} to{' '}
            {Math.min((currentPage + 1) * pageSize, filteredPlans.length)} of{' '}
            {filteredPlans.length} plans
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}>
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage + 1} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
