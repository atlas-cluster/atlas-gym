'use client'

import { addMonths, endOfMonth, format } from 'date-fns'
import { PlusIcon, RotateCcwIcon, XCircleIcon } from 'lucide-react'
import { ReactNode, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { PlanDisplay } from '@/features/plans'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/features/shared/components/ui/dialog'
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
  revertCancellation,
} from '@/features/subscriptions'

// Helper function to calculate the actual cancellation end date
function calculateCancelEndDate(
  startDate: Date,
  minDurationMonths: number
): Date {
  const today = new Date()
  const endOfCurrentMonth = endOfMonth(today)

  // Calculate minimum duration end date
  const minDurationEndDate = endOfMonth(
    addMonths(new Date(startDate), minDurationMonths - 1)
  )

  // Return whichever is later
  return minDurationEndDate > endOfCurrentMonth
    ? minDurationEndDate
    : endOfCurrentMonth
}

interface MemberSubscriptionDialogProps {
  member?: MemberDisplay
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function MemberSubscriptionDialog({
  member,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: MemberSubscriptionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [subscriptions, setSubscriptions] = useState<
    MemberSubscriptionDisplay[]
  >([])
  const [availablePlans, setAvailablePlans] = useState<PlanDisplay[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showRevertConfirm, setShowRevertConfirm] = useState(false)
  const [showCancelFutureConfirm, setShowCancelFutureConfirm] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen =
    setControlledOpen !== undefined ? setControlledOpen : setInternalOpen

  // Fetch member subscriptions and available plans when dialog opens
  useEffect(() => {
    if (open && member) {
      startTransition(async () => {
        try {
          const [subs, plans] = await Promise.all([
            getMemberSubscriptions(),
            getAvailablePlans(),
          ])
          setSubscriptions(subs)
          setAvailablePlans(plans)
        } catch (error) {
          toast.error('Failed to load subscription data')
          console.error(error)
        }
      })
    }
  }, [open, member])

  if (!member) return null

  const hasActivePlan = member.planName && !member.isCancelled
  const hasCancelledPlan = member.planName && member.isCancelled
  const hasFuturePlan = member.futureSubscriptionName
  const hasNoPlan = !member.planName

  // Find the actual subscriptions for this member
  const activeSubscription = subscriptions.find(
    (s) => s.status === 'active' || s.status === 'cancelled'
  )
  const futureSubscription = subscriptions.find((s) => s.status === 'future')

  const handleCancelSubscription = () => {
    if (!activeSubscription) return
    setShowCancelConfirm(true)
  }

  const handleConfirmCancel = async () => {
    if (!activeSubscription) return

    startTransition(async () => {
      try {
        await cancelSubscription(activeSubscription.id)
        toast.success('Subscription cancelled successfully')
        setShowCancelConfirm(false)
        setOpen(false)
        onSuccess?.()
      } catch (error) {
        toast.error('Failed to cancel subscription')
        console.error(error)
      }
    })
  }

  const handleRevertCancellation = () => {
    setShowRevertConfirm(true)
  }

  const handleConfirmRevert = async () => {
    if (!activeSubscription) return

    startTransition(async () => {
      try {
        await revertCancellation(activeSubscription.id)
        toast.success('Cancellation reverted successfully')
        setShowRevertConfirm(false)
        setOpen(false)
        onSuccess?.()
      } catch (error) {
        toast.error('Failed to revert cancellation')
        console.error(error)
      }
    })
  }

  const handleCancelFutureSubscription = () => {
    setShowCancelFutureConfirm(true)
  }

  const handleConfirmCancelFuture = async () => {
    if (!futureSubscription) return

    startTransition(async () => {
      try {
        await cancelSubscription(futureSubscription.id)
        toast.success('Future subscription cancelled successfully')
        setShowCancelFutureConfirm(false)
        setOpen(false)
        onSuccess?.()
      } catch (error) {
        toast.error('Failed to cancel future subscription')
        console.error(error)
      }
    })
  }

  const handleAssignPlan = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a plan')
      return
    }

    const selectedPlan = availablePlans.find(
      (p) => p.id === Number(selectedPlanId)
    )
    if (!selectedPlan) return

    startTransition(async () => {
      try {
        await createSubscription(selectedPlanId)
        toast.success('Subscription assigned successfully')
        setSelectedPlanId('')
        setOpen(false)
        onSuccess?.()
      } catch (error) {
        toast.error('Failed to assign subscription')
        console.error(error)
      }
    })
  }

  const handleChangeSubscription = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a plan')
      return
    }

    startTransition(async () => {
      try {
        await createSubscription(selectedPlanId)
        toast.success('Future subscription created successfully')
        setSelectedPlanId('')
        setOpen(false)
        onSuccess?.()
      } catch (error) {
        toast.error('Failed to create future subscription')
        console.error(error)
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Manage subscription for {member.firstname} {member.lastname}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Subscription */}
            {(hasActivePlan || hasCancelledPlan) && activeSubscription && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Current Subscription
                  </CardTitle>
                  <CardDescription>
                    {hasCancelledPlan
                      ? 'This subscription has been cancelled'
                      : 'Active subscription'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={hasCancelledPlan ? 'destructive' : 'default'}>
                        {member.planName}
                      </Badge>
                      {hasCancelledPlan && activeSubscription.endDate && (
                        <Badge variant="outline">
                          Ends{' '}
                          {format(
                            new Date(activeSubscription.endDate),
                            'MMM d, yyyy'
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {hasActivePlan && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelSubscription}
                        disabled={isPending}>
                        <XCircleIcon className="mr-2 h-4 w-4" />
                        Cancel Subscription
                      </Button>
                    )}
                    {hasCancelledPlan && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRevertCancellation}
                        disabled={isPending}>
                        <RotateCcwIcon className="mr-2 h-4 w-4" />
                        Revert Cancellation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Future Subscription */}
            {hasFuturePlan && futureSubscription && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Future Subscription
                  </CardTitle>
                  <CardDescription>
                    Scheduled to start after current subscription ends
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {member.futureSubscriptionName}
                      </Badge>
                      {futureSubscription.startDate && (
                        <Badge variant="outline">
                          Starts{' '}
                          {format(
                            new Date(futureSubscription.startDate),
                            'MMM d, yyyy'
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelFutureSubscription}
                    disabled={isPending}>
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Cancel Future Subscription
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Assign/Change Subscription */}
            {(hasNoPlan || (hasCancelledPlan && !hasFuturePlan)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {hasNoPlan ? 'Assign Subscription' : 'Change Subscription'}
                  </CardTitle>
                  <CardDescription>
                    {hasNoPlan
                      ? 'Select a plan to assign to this member'
                      : 'Select a plan to start after the current subscription ends'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={selectedPlanId}
                    onValueChange={setSelectedPlanId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlans.map((plan) => (
                        <SelectItem key={plan.id} value={String(plan.id)}>
                          {plan.name} - ${plan.price}/month (
                          {plan.minDurationMonths} months min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={
                      hasNoPlan ? handleAssignPlan : handleChangeSubscription
                    }
                    disabled={!selectedPlanId || isPending}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    {hasNoPlan ? 'Assign Plan' : 'Schedule Future Plan'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      {activeSubscription && (
        <AlertDialog
          open={showCancelConfirm}
          onOpenChange={setShowCancelConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
              <AlertDialogDescription>
                {(() => {
                  const endDate = calculateCancelEndDate(
                    new Date(activeSubscription.startDate),
                    activeSubscription.minDurationMonths
                  )
                  const endOfCurrentMonth = endOfMonth(new Date())
                  const isMinDurationEnforced = endDate > endOfCurrentMonth

                  return (
                    <>
                      This subscription will end at the{' '}
                      {isMinDurationEnforced
                        ? 'end of the minimum duration period'
                        : 'end of the current month'}{' '}
                      ({format(endDate, 'MMMM yyyy')}).
                    </>
                  )
                })()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCancel}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Revert Confirmation Dialog */}
      <AlertDialog open={showRevertConfirm} onOpenChange={setShowRevertConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert Cancellation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reactivate the subscription.
              {hasFuturePlan && ' The future subscription will be cancelled.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRevert}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Future Confirmation Dialog */}
      {futureSubscription && (
        <AlertDialog
          open={showCancelFutureConfirm}
          onOpenChange={setShowCancelFutureConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Future Subscription?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel the future subscription for{' '}
                {member.futureSubscriptionName}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCancelFuture}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
