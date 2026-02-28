'use client'

import { toast } from 'sonner'

import { MemberDisplay } from '@/features/members'
import { convertToMember } from '@/features/members/actions/convert-to-member'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import { useAsyncAction } from '@/features/shared/hooks/use-async-action'

interface ConvertToMemberDialogProps {
  member: MemberDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConvertToMemberDialog({
  member,
  open,
  onOpenChange: setOpen,
}: ConvertToMemberDialogProps) {
  const { isPending, start, stop } = useAsyncAction()

  function onConvert(id: string, updatedAt: Date) {
    if (!start()) return
    const promise = convertToMember(id, updatedAt)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.message || 'Failed to demote to member')
        }
        setOpen(false)
        return result
      })
      .finally(stop)

    toast.promise(promise, {
      loading: 'Demoting to member...',
      success: (result) => result.message,
      error: (err) => err?.message || 'Failed to demote to member',
    })
  }

  const onSubmit = () => {
    if (member) {
      onConvert(member.id, member.updatedAt)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demote to member?</DialogTitle>
          <DialogDescription>
            Are you sure you want to demote{' '}
            <strong>
              {member?.firstname} {member?.lastname}
            </strong>{' '}
            from trainer to regular member? They will lose access to all trainer
            features.
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
            Demote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
