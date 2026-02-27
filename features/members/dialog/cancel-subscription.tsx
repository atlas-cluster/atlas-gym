'use client'

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

interface CancelSubscriptionDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelSubscriptionDialog({
  member,
  open,
  onOpenChange: setOpen,
}: CancelSubscriptionDialogProps) {
  function onCancel(subscriptionId: string, updatedAt: Date, memberId: string) {
    const promise = cancelSubscription(
      subscriptionId,
      updatedAt,
      memberId
    ).then((result) => {
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
    if (
      member?.currentSubscription?.id &&
      member.currentSubscription.updatedAt
    ) {
      onCancel(
        member.currentSubscription.id,
        member.currentSubscription.updatedAt,
        member.id
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Cancel subscription for {member?.firstname} {member?.lastname}?
          </DialogTitle>
          <DialogDescription>
            The subscription to the{' '}
            <strong>{member?.currentSubscription?.name}</strong> plan will
            remain active until the end of the minimum duration period, after
            which it will be cancelled.
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
