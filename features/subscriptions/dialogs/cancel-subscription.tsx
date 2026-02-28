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
  cancelSubscription,
} from '@/features/subscriptions'

interface CancelSubscriptionDialogProps {
  subscription: SubscriptionDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelSubscriptionDialog({
  subscription,
  open,
  onOpenChange: setOpen,
}: CancelSubscriptionDialogProps) {
  const { isPending, start, stop } = useAsyncAction()

  function onCancel(subscriptionId: string) {
    if (!start()) return
    const promise = cancelSubscription(subscriptionId, subscription!.updatedAt!)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to cancel subscription')
        }
        setOpen(false)
        return result
      })
      .finally(stop)

    toast.promise(promise, {
      loading: 'Cancelling subscription...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to cancel subscription',
    })
  }

  const onSubmit = () => {
    if (subscription?.id) {
      onCancel(subscription.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to cancel this subscription?
          </DialogTitle>
          <DialogDescription>
            {subscription?.isFuture
              ? `Your future subscription to the ${subscription?.name} plan will be deleted immediately.`
              : `Your subscription to the ${subscription?.name} plan will remain active until the end of the minimum duration period, after which it will be cancelled.`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}>
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={onSubmit}
            disabled={isPending}>
            Cancel Subscription
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
