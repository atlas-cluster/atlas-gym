'use client'

import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { PlanDisplayMinimal } from '@/features/plans'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import { useAsyncAction } from '@/features/shared/hooks/use-async-action'
import { createSubscription } from '@/features/subscriptions'

interface CreateSubscriptionDialogProps {
  member: MemberDisplay | null
  plan: PlanDisplayMinimal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSubscriptionDialog({
  member,
  plan,
  open,
  onOpenChange: setOpen,
}: CreateSubscriptionDialogProps) {
  const { isPending, start, stop } = useAsyncAction()

  function onCreate(planId: string, memberId: string) {
    if (!start()) return
    const promise = createSubscription(planId, memberId)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to create subscription')
        }
        setOpen(false)
        return result
      })
      .finally(stop)

    toast.promise(promise, {
      loading: 'Creating subscription...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to create subscription',
    })
  }

  const onSubmit = () => {
    if (member && plan) {
      onCreate(plan.id, member.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Subscribe {member?.firstname} {member?.lastname} to {plan?.name}?
          </DialogTitle>
          <DialogDescription>
            This will create a subscription to the <strong>{plan?.name}</strong>{' '}
            plan at <strong>€{plan?.price?.toFixed(2)}/month</strong> with a
            minimum duration of{' '}
            <strong>
              {plan?.minDurationMonths}{' '}
              {plan?.minDurationMonths === 1 ? 'month' : 'months'}
            </strong>{' '}
            for{' '}
            <strong>
              {member?.firstname} {member?.lastname}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            Subscribe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
