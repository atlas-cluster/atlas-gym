'use client'

import { toast } from 'sonner'

import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import { useAsyncAction } from '@/features/shared/hooks/use-async-action'
import {
  SubscriptionDisplay,
  createSubscription,
} from '@/features/subscriptions'

interface CreateSubscriptionDialogProps {
  subscription: SubscriptionDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSubscriptionDialog({
  subscription,
  open,
  onOpenChange: setOpen,
}: CreateSubscriptionDialogProps) {
  const { isPending, start, stop } = useAsyncAction()

  function onCreate(planId: string) {
    if (!start()) return
    const promise = createSubscription(planId)
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
    if (subscription) {
      onCreate(subscription.planId)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscribe to {subscription?.name}?</DialogTitle>
          <DialogDescription>
            You are about to subscribe to the{' '}
            <strong>{subscription?.name}</strong> plan at{' '}
            <strong>€{subscription?.price?.toFixed(2)}/month</strong> with a
            minimum duration of{' '}
            <strong>
              {subscription?.minDurationMonths}{' '}
              {subscription?.minDurationMonths === 1 ? 'month' : 'months'}
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
