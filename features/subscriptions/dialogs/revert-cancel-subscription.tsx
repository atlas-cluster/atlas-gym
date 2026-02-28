'use client'

import { useState } from 'react'
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
  revertCancellation,
} from '@/features/subscriptions'

interface SubscriptionRevertCancelDialogProps {
  subscription: SubscriptionDisplay | null
  hasFutureSubscription: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionRevertCancelDialog({
  subscription,
  hasFutureSubscription,
  open,
  onOpenChange: setOpen,
}: SubscriptionRevertCancelDialogProps) {
  const [isPending, setIsPending] = useState(false)

  function onRevert(subscriptionId: string) {
    setIsPending(true)
    const promise = revertCancellation(
      subscriptionId,
      subscription!.updatedAt!,
      hasFutureSubscription
    )
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to revert cancellation')
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Reverting cancellation...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to revert cancellation',
    })
  }

  const onSubmit = () => {
    if (subscription?.id) {
      onRevert(subscription.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Revert cancellation of this subscription?</DialogTitle>
          <DialogDescription>
            Your subscription to the <strong>{subscription?.name}</strong> plan
            will be reactivated and the scheduled cancellation will be removed.
            Any future subscription that was scheduled will be deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}>
            Keep Cancelled
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            Revert Cancellation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
