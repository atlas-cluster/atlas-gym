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
import {
  SubscriptionDisplay,
  cancelSubscription,
} from '@/features/subscriptions'

interface SubscriptionCancelDialogProps {
  subscription: SubscriptionDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionCancelDialog({
  subscription,
  open,
  onOpenChange: setOpen,
}: SubscriptionCancelDialogProps) {
  function onCancel(subscriptionId: string) {
    const promise = cancelSubscription(subscriptionId).then((result) => {
      if (!result.success) {
        throw new Error(result.message || 'Failed to cancel subscription')
      }
      setOpen(false)
      return result
    })

    toast.promise(promise, {
      loading: 'Cancelling subscription...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to cancel subscription',
    })
  }

  const onSubmit = () => {
    if (subscription?.subscriptionId) {
      onCancel(subscription.subscriptionId)
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
          <Button variant="destructive" type="button" onClick={onSubmit}>
            Cancel Subscription
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
