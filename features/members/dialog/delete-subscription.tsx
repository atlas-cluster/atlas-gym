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
import { useAsyncAction } from '@/features/shared/hooks/use-async-action'
import { deleteSubscription } from '@/features/subscriptions'

interface DeleteSubscriptionDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteSubscriptionDialog({
  member,
  open,
  onOpenChange: setOpen,
}: DeleteSubscriptionDialogProps) {
  const { isPending, start, stop } = useAsyncAction()

  function onDelete(subscriptionId: string, memberId: string, updatedAt: Date) {
    if (!start()) return
    const promise = deleteSubscription(subscriptionId, memberId, updatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to delete subscription')
        }
        setOpen(false)
        return result
      })
      .finally(stop)

    toast.promise(promise, {
      loading: 'Deleting subscription...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to delete subscription',
    })
  }

  const onSubmit = () => {
    if (
      member?.currentSubscription?.id &&
      member.currentSubscription.updatedAt
    ) {
      onDelete(
        member.currentSubscription.id,
        member.id,
        member.currentSubscription.updatedAt
      )
    }
  }

  const hasCurrent = !!member?.currentSubscription
  const hasFuture = !!member?.futureSubscription

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Forcefully delete{' '}
            {hasCurrent && hasFuture ? 'subscriptions' : 'subscription'} for{' '}
            {member?.firstname} {member?.lastname}?
          </DialogTitle>
          <DialogDescription>
            This will immediately and permanently remove{' '}
            {hasCurrent && hasFuture ? (
              <>
                the active subscription to{' '}
                <strong>{member?.currentSubscription?.name}</strong> and the
                future subscription to{' '}
                <strong>{member?.futureSubscription?.name}</strong>
              </>
            ) : hasCurrent ? (
              <>
                the subscription to{' '}
                <strong>{member?.currentSubscription?.name}</strong>
              </>
            ) : hasFuture ? (
              <>
                the future subscription to{' '}
                <strong>{member?.futureSubscription?.name}</strong>
              </>
            ) : (
              'all subscriptions'
            )}{' '}
            for{' '}
            <strong>
              {member?.firstname} {member?.lastname}
            </strong>
            , regardless of status or remaining duration. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={onSubmit}
            disabled={isPending}>
            Delete {hasCurrent && hasFuture ? 'Subscriptions' : 'Subscription'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
