'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import { cancelSubscription } from '@/features/subscriptions'

interface CancelFutureSubscriptionDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelFutureSubscriptionDialog({
  member,
  open,
  onOpenChange: setOpen,
}: CancelFutureSubscriptionDialogProps) {
  const [isPending, setIsPending] = useState(false)

  function onCancel(subscriptionId: string, updatedAt: Date, memberId: string) {
    setIsPending(true)
    const promise = cancelSubscription(subscriptionId, updatedAt, memberId)
      .then((result) => {
        if (!result.success) {
          throw new Error(
            result.message || 'Failed to cancel future subscription'
          )
        }
        setOpen(false)
        return result
      })
      .finally(() => setIsPending(false))

    toast.promise(promise, {
      loading: 'Cancelling future subscription...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to cancel future subscription',
    })
  }

  const onSubmit = () => {
    if (member?.futureSubscription?.id && member.futureSubscription.updatedAt) {
      onCancel(
        member.futureSubscription.id,
        member.futureSubscription.updatedAt,
        member.id
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Cancel future subscription for {member?.firstname}{' '}
            {member?.lastname}?
          </DialogTitle>
          <DialogDescription>
            The future subscription to the{' '}
            <strong>{member?.futureSubscription?.name}</strong> plan will be
            deleted immediately.
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
            Cancel Future Subscription
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
