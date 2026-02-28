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
import { revertCancellation } from '@/features/subscriptions'

interface RevertCancelSubscriptionDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RevertCancelSubscriptionDialog({
  member,
  open,
  onOpenChange: setOpen,
}: RevertCancelSubscriptionDialogProps) {
  const { isPending, start, stop } = useAsyncAction()

  function onRevert(
    subscriptionId: string,
    updatedAt: Date,
    hasFuture: boolean,
    memberId: string
  ) {
    if (!start()) return
    const promise = revertCancellation(
      subscriptionId,
      updatedAt,
      hasFuture,
      memberId
    )
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to revert cancellation')
        }
        setOpen(false)
        return result
      })
      .finally(stop)

    toast.promise(promise, {
      loading: 'Reverting cancellation...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to revert cancellation',
    })
  }

  const onSubmit = () => {
    if (
      member?.currentSubscription?.id &&
      member.currentSubscription.updatedAt
    ) {
      onRevert(
        member.currentSubscription.id,
        member.currentSubscription.updatedAt,
        !!member.futureSubscription,
        member.id
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Revert cancellation for {member?.firstname} {member?.lastname}?
          </DialogTitle>
          <DialogDescription>
            The subscription to the{' '}
            <strong>{member?.currentSubscription?.name}</strong> plan will be
            reactivated and the scheduled cancellation will be removed.
            {member?.futureSubscription && (
              <>
                {' '}
                The future subscription to{' '}
                <strong>{member.futureSubscription.name}</strong> will be
                deleted.
              </>
            )}
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
